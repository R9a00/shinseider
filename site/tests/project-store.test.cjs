const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createSession, normalize} = require('../static/project-store.js');

function environment(initial = null) {
  let raw = initial, tail = Promise.resolve(), fail = false;
  const storage = {getItem() { return raw; }, setItem(key, value) {
    if (fail) throw new Error('QuotaExceededError');
    raw = value;
  }};
  function lock(key, fn) {
    const task = tail.then(fn);
    tail = task.catch(() => {});
    return task;
  }
  return {
    tab(overrides = {}) {
      const statuses = [];
      return Object.assign(createSession({storage: () => storage, lock,
        status: (status, message) => statuses.push({status, message}), ...overrides}), {statuses});
    },
    fail(value) { fail = value; },
    read() { return JSON.parse(raw); },
    raw() { return raw; }
  };
}
test('successful save retains the legacy format and reloads', async () => {
  const env = environment(), a = env.tab();
  a.project.entry.sections.intro = 'draft';
  assert.equal(await a.save(a.project), true);
  assert.equal(a.statuses.at(-1).status, 'saved');
  assert.equal(env.tab().project.entry.sections.intro, 'draft');
  assert.equal(a.dirty(), false);
});
test('quota failure stays unsaved, preserves input and can retry', async () => {
  const env = environment(), a = env.tab();
  a.project.entry.sections.intro = 'keep me'; env.fail(true);
  assert.equal(await a.save(a.project), false);
  assert.equal(a.statuses.at(-1).status, 'failed');
  assert.equal(a.dirty(), true);
  assert.equal(a.project.entry.sections.intro, 'keep me');
  assert.equal(env.raw(), null);
  env.fail(false);
  assert.equal(await a.save(a.project), true);
  assert.equal(env.read().entry.sections.intro, 'keep me');
});
test('concurrent entry and fukabori edits survive regardless of stale tab state', async () => {
  const env = environment(), a = env.tab(), b = env.tab();
  a.project.entry.sections.intro = 'entry';
  b.project.fukabori.blocks.A = {history: 'history'};
  assert.deepEqual(await Promise.all([a.save(a.project), b.save(b.project)]), [true, true]);
  assert.equal(env.read().entry.sections.intro, 'entry');
  assert.equal(env.read().fukabori.blocks.A.history, 'history');
});
test('distinct fields in the same section merge; same-field edits conflict', async () => {
  const env = environment(), a = env.tab(), b = env.tab();
  a.project.entry.sections.intro = 'A'; b.project.entry.sections.future = 'B';
  await a.save(a.project); await b.save(b.project);
  b.project.entry.sections.intro = 'stale edit';
  assert.equal(await b.save(b.project), false);
  assert.equal(b.statuses.at(-1).status, 'conflict');
  assert.equal(env.read().entry.sections.intro, 'A');
  assert.equal(b.project.entry.sections.intro, 'stale edit');
  assert.equal(b.dirty(), true);
});
test('same-field simultaneous edits never silently overwrite each other', async () => {
  const env = environment(), a = env.tab(), b = env.tab();
  a.project.entry.sections.intro = 'A'; b.project.entry.sections.intro = 'B';
  assert.deepEqual(await Promise.all([a.save(a.project), b.save(b.project)]), [true, false]);
  assert.equal(env.read().entry.sections.intro, 'A');
});
test('rapid input snapshots are queued and the final input wins within one tab', async () => {
  const env = environment(), a = env.tab();
  a.project.entry.sections.intro = '1'; const first = a.save(a.project);
  a.project.entry.sections.intro = '12'; const second = a.save(a.project);
  a.project.entry.sections.intro = '123'; const third = a.save(a.project);
  assert.equal(a.dirty(), true);
  assert.deepEqual(await Promise.all([first, second, third]), [true, true, true]);
  assert.equal(env.read().entry.sections.intro, '123');
  assert.equal(a.dirty(), false);
});
test('backup includes external saved fields and local unsaved conflict', async () => {
  const env = environment(), a = env.tab(), b = env.tab();
  a.project.entry.sections.intro = 'remote';
  a.project.fukabori.blocks.A = {history: 'remote history'};
  await a.save(a.project);
  b.project.entry.sections.intro = 'local'; await b.save(b.project);
  const backup = b.snapshot(b.project);
  assert.equal(backup.entry.sections.intro, 'local');
  assert.equal(backup.fukabori.blocks.A.history, 'remote history');
  assert.equal(env.read().entry.sections.intro, 'remote');
});
test('corrupt stored data is reported and never overwritten', async () => {
  const env = environment('{broken'), a = env.tab();
  assert.equal(a.statuses.at(-1).status, 'unreadable');
  a.project.entry.sections.intro = 'local';
  assert.equal(await a.save(a.project), false);
  assert.equal(env.raw(), '{broken');
});
test('storage denial and missing lock support are explicit', async () => {
  const env = environment();
  const a = env.tab({storage() { throw new Error('SecurityError'); }});
  assert.equal(a.statuses.at(-1).status, 'unreadable');
  const b = env.tab({lock: null}); b.project.entry.sections.intro = 'local';
  assert.equal(await b.save(b.project), false);
  assert.equal(b.statuses.at(-1).status, 'unavailable');
  assert.equal(env.raw(), null);
});
test('malformed backups are rejected before modifying input', () => {
  assert.throws(() => normalize({entry: {sections: {intro: 7}, checklist: {}}}));
  assert.throws(() => normalize({fukabori: {blocks: {A: 'bad'}}}));
  assert.throws(() => normalize(JSON.parse('{"__proto__":{"polluted":true}}')));
  assert.throws(() => normalize({version: 99}));
  assert.deepEqual(normalize({entry: {sections: {}, checklist: {}}}).fukabori, {blocks: {}});
});
