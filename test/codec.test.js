import test from 'node:test';
import assert from 'node:assert/strict';
import {seal,open,embed,extract,capacity} from '../src/codec.js';
test('encrypted Unicode message round trips through RGB pixels, preserving alpha',async()=>{
 const pixels=new Uint8ClampedArray(100*100*4).fill(255);
 const message='Hello 🔐 مرحبا';const packet=await seal(message,'correct horse battery staple');
 const output=embed(pixels,packet);
 assert.equal(await open(extract(output),'correct horse battery staple'),message);
 for(let i=3;i<output.length;i+=4)assert.equal(output[i],255);
 assert.equal(capacity(pixels),3697);assert.notDeepEqual(output,pixels);
});
test('wrong passwords and tampering fail authentication',async()=>{
 const packet=await seal('secret','password');
 await assert.rejects(open(packet,'wrong'),/Could not decrypt/);
 packet[packet.length-1]^=1;await assert.rejects(open(packet,'password'),/Could not decrypt/);
});
test('missing messages, invalid lengths and oversized payloads are rejected',()=>{
 assert.throws(()=>extract(new Uint8ClampedArray(400).fill(255)),/No supported/);
 assert.throws(()=>embed(new Uint8ClampedArray(4),new Uint8Array(3)),/too large/);
 const header=new Uint8Array([86,69,73,76,1,255,255,255,255]);
 assert.throws(()=>extract(embed(new Uint8ClampedArray(800),header)),/damaged/);
});
test('fresh encryptions use different salts and nonces',async()=>{
 assert.notDeepEqual(await seal('same','password'),await seal('same','password'));
});
