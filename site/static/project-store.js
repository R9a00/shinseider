/* Shared project persistence. Keep the legacy key and backup format. */
(function(root) {
  'use strict';
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
  function equal(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function safe(value) {
    if (!object(value)) return;
    Object.keys(value).forEach(function(key) {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error('invalid');
      safe(value[key]);
    });
  }
  function stringMap(value) {
    return object(value) && Object.values(value).every(function(v) { return typeof v === 'string'; });
  }
  function normalize(value) {
    if (!object(value)) throw new Error('invalid');
    safe(value);
    var p = copy(value);
    if (p.version !== undefined && p.version !== 1) throw new Error('invalid');
    if (p.entry !== undefined && (!object(p.entry) || !stringMap(p.entry.sections) ||
        !object(p.entry.checklist) || !Object.values(p.entry.checklist).every(function(v) { return typeof v === 'boolean'; }) ||
        (p.entry.review_notes !== undefined && typeof p.entry.review_notes !== 'string'))) throw new Error('invalid');
    if (p.fukabori != null && (!object(p.fukabori) || !object(p.fukabori.blocks) ||
        !Object.values(p.fukabori.blocks).every(stringMap) ||
        (p.fukabori.ai !== undefined && typeof p.fukabori.ai !== 'string'))) throw new Error('invalid');
    p.version = 1;
    p.entry = p.entry || {sections: {}, checklist: {}};
    p.fukabori = p.fukabori || {blocks: {}};
    return p;
  }
  function changes(before, after, path, result) {
    if (equal(before, after)) return result;
    if (object(before) && object(after)) {
      new Set(Object.keys(before).concat(Object.keys(after))).forEach(function(key) {
        if (!path.length && ['version', 'updated'].includes(key)) return;
        changes(before[key], after[key], path.concat(key), result);
      });
    } else if (before === undefined && object(after)) {
      Object.keys(after).forEach(function(key) { changes(undefined, after[key], path.concat(key), result); });
    } else {
      result.push({path: path, before: before, after: after});
    }
    return result;
  }
  function get(value, path) { return path.reduce(function(v, key) { return v == null ? undefined : v[key]; }, value); }
  function put(value, change) {
    var parent = value;
    change.path.slice(0, -1).forEach(function(key) { parent = parent[key] = parent[key] || {}; });
    var key = change.path[change.path.length - 1];
    if (change.after === undefined) delete parent[key];
    else parent[key] = copy(change.after);
  }
  var messages = {
    saved: '自動保存済み（このブラウザのみ）',
    pending: '保存中です。この画面を閉じずにお待ちください。',
    failed: '未保存です。入力は画面に残っています。「控えを保存」でファイルを残してください。',
    conflict: '未保存です。別のタブで同じ項目が変更されています。まず「控えを保存」で入力を残し、再読み込みして内容を見比べてください。',
    unavailable: 'この環境では安全な自動保存が使えません。「控えを保存」で入力を残してください。',
    unreadable: '保存データを読み込めませんでした。上書きを防ぐため自動保存を停止しています。控えファイルを利用してください。'
  };
  function createSession(options) {
    var key = 'shinseider_project', baseline, readError = false;
    function read() {
      var raw = options.storage().getItem(key);
      return normalize(raw === null ? {} : JSON.parse(raw));
    }
    try { baseline = read(); } catch (_) { baseline = normalize({}); readError = true; }
    var state = copy(baseline), queue = Promise.resolve(), pending = 0, unsaved = false;
    function report(status) { if (options.status) options.status(status, messages[status]); }
    if (readError) report('unreadable');
    return {
      project: state,
      dirty: function() { return pending > 0 || unsaved; },
      // The snapshot comparison is local to this tab. Unedited remote fields never become deletions.
      save: function(project) {
        var snapshot;
        try { snapshot = normalize(project); } catch (_) { unsaved = true; report('failed'); return Promise.resolve(false); }
        pending++; unsaved = true; report('pending');
        var task = queue.then(async function() {
          var status = 'saved';
          try {
            if (readError) { status = 'unreadable'; return false; }
            if (!options.lock) { status = 'unavailable'; return false; }
            return await options.lock(key, function() {
              var current = read(), delta = changes(baseline, snapshot, [], []);
              var conflict = delta.some(function(c) {
                var actual = get(current, c.path);
                return !equal(actual, c.before) && !equal(actual, c.after);
              });
              if (conflict) { status = 'conflict'; return false; }
              delta.forEach(function(c) { put(current, c); });
              current.updated = new Date().toISOString();
              options.storage().setItem(key, JSON.stringify(current));
              baseline = snapshot;
              unsaved = false;
              return true;
            });
          } catch (_) { status = 'failed'; return false; }
          finally {
            pending--;
            if (status !== 'saved') unsaved = true;
            if (!pending) report(status);
          }
        });
        queue = task.then(function() {}, function() {});
        return task;
      },
      // Include other tabs' saved fields and this tab's still-unsaved edits in backups.
      snapshot: function(project) {
        try {
          var latest = read();
          changes(baseline, normalize(project), [], []).forEach(function(c) { put(latest, c); });
          return latest;
        } catch (_) { return copy(project); }
      }
    };
  }
  function open(messageId) {
    var message = root.document.getElementById(messageId);
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
    var session = createSession({
      storage: function() { return root.localStorage; },
      lock: root.navigator.locks ? function(key, callback) { return root.navigator.locks.request(key, callback); } : null,
      status: function(status, text) { message.textContent = text; message.dataset.saveState = status; }
    });
    root.addEventListener('beforeunload', function(e) {
      if (session.dirty()) { e.preventDefault(); e.returnValue = ''; }
    });
    return session;
  }
  var api = {createSession: createSession, normalize: normalize, open: open};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ShinseiderStore = api;
})(typeof window !== 'undefined' ? window : globalThis);
