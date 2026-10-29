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
