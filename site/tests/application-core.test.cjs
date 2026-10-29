const {test}=require('node:test'),assert=require('node:assert/strict');
const C=require('../static/application-core.js'),Store=require('../static/project-store.js');
test('context survives old project normalization; invalid data cannot erase it',()=>{
 const c=C.blank();c.materials[0].body='家業を継ぐ理由🙂';const project=Store.normalize({application:c});
 assert.deepEqual(project.application,c);assert.equal(project.entry.sections.constructor,Object);
 for(const bad of [null,{}, {...c,materials:[]},{...c,files:{}},{...c,sources:[{id:'x'}]},JSON.parse(JSON.stringify(c).replace('"body":"家業を継ぐ理由🙂"','"__proto__":{},"body":"x"'))]) assert.throws(()=>Store.normalize({application:bad}));
 assert.equal(project.application.materials[0].body,'家業を継ぐ理由🙂');
});
test('review binds exact materials, original hashes and guidance, never itself',async()=>{
 const c=C.blank(),rules={common:'ルール',stages:{research:'調べる',prepare:'整える',compose:'作る',review:'点検'}};
 const digest=await C.binding(c,rules);c.review={binding:digest,result:'未確認あり'};assert.equal(await C.binding(c,rules),digest);
 c.materials[0].body='変更';assert.notEqual(await C.binding(c,rules),digest);
 await assert.rejects(C.prompt('compose',c,rules),/フォーマット/);await assert.rejects(C.prompt('bad',c,rules));
 assert.notEqual(await C.binding(c,{...rules,common:'改訂'}),await C.binding(c,rules));
});
test('prompt uses one immutable snapshot across asynchronous hashing',async()=>{
 const c=C.blank(),rules={common:'ルール',stages:{research:'調べる'}};
 c.reference='before';const old=await C.binding(c,rules);
 const pending=C.prompt('research',c,rules);c.reference='after';
 const text=await pending;assert.ok(text.includes(old));assert.ok(text.includes('"reference": "before"'));assert.ok(!text.includes('"reference": "after"'));
});
test('schema rejects extensions, invalid Unicode and inherited stage names',async()=>{
 assert.throws(()=>C.validate({...C.blank(),unexpected:1.0}));
 assert.throws(()=>C.validate({...C.blank(),review:{binding:'a'.repeat(64),result:'  '}}));
 assert.throws(()=>C.validate({...C.blank(),reference:'\ud800'}));
 await assert.rejects(C.prompt('toString',C.blank(),{stages:{research:'x'}}));
 const c=C.blank();const size=Array.from(JSON.stringify(c)).length;c.reference='x'.repeat(2000000-size);
 assert.equal(C.validate(c).reference.length,c.reference.length);c.reference+='x';assert.throws(()=>C.validate(c));
});
