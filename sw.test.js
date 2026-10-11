import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
test('offline shell and assets are precached and served when the network fails',async()=>{
  const handlers={},stored=new Map();const cache={addAll:async paths=>paths.forEach(path=>stored.set(path,{path})),put:async()=>{}};
  const context={self:{location:{origin:'http://localhost:3000'},addEventListener:(name,handler)=>handlers[name]=handler,skipWaiting:()=>{},clients:{claim:async()=>{}}},caches:{open:async()=>cache,keys:async()=>['daily-v2'],match:async request=>stored.get(typeof request==='string'?request:new URL(request.url).pathname)},fetch:async()=>{throw Error('offline');},URL,Response};
  vm.runInNewContext(await readFile(new URL('./public/sw.js',import.meta.url),'utf8'),context);
  let installed;handlers.install({waitUntil:p=>installed=p});await installed;
  for(const asset of ['/','/app.js','/model.js','/style.css','/manifest.webmanifest','/icon-192.png','/icon-512.png'])assert.ok(stored.has(asset));
  let response;handlers.fetch({request:{url:'http://localhost:3000/app.js',method:'GET',mode:'same-origin'},respondWith:p=>response=p});assert.equal((await response).path,'/app.js');
  handlers.fetch({request:{url:'http://localhost:3000/unknown',method:'GET',mode:'navigate'},respondWith:p=>response=p});assert.equal((await response).path,'/');
});
