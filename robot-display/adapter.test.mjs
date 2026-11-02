import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(condition){const end=Date.now()+12000;while(!condition()){if(Date.now()>end)throw new Error('Adapter replay timed out');await wait(50);}}
test('adapter claims only with a screen, fails interrupted speech, and accepts the following command',async()=>{
 const acks=[],offered=new Set();let claims=0,failAckOnce=true;
 const mock=http.createServer(async(req,res)=>{
  res.setHeader('Content-Type','application/json');
  if(req.url==='/v1/robot/commands'){
   ++claims;const id=!offered.has('first')?'first':!offered.has('second')?'second':null;if(id)offered.add(id);
   res.end(JSON.stringify({commands:id?[{id,expires_at:new Date(Date.now()+180000).toISOString(),body:{action:'speak',text:'Halo.',audio_path:'mock-only'}}]:[]}));return;
  }
  if(req.url.startsWith('/v1/robot/audio/')){res.setHeader('Content-Type','audio/wav');res.end(Buffer.alloc(64));return;}
  if(req.url==='/v1/robot/ack'){
   let raw='';for await(const c of req)raw+=c;const ack=JSON.parse(raw);
   if(ack.id==='first'&&failAckOnce){failAckOnce=false;res.writeHead(503);res.end('{}');return;}
   acks.push(ack);res.end('{}');return;
  }
  res.writeHead(404);res.end('{}');
 });
 await new Promise(resolve=>mock.listen(0,'127.0.0.1',resolve));
 const api=`http://127.0.0.1:${mock.address().port}`;
 const child=spawn(process.execPath,['start.mjs'],{cwd:fileURLToPath(new URL('./',import.meta.url)),env:{...process.env,AEROBOT_DISPLAY_PORT:'4211',AEROBOT_OPEN_WINDOW:'0',AEROSENSE_API_URL:api,AEROBOT_DEVICE_ID:'replay-only',AEROBOT_DEVICE_KEY:'non-secret-fixture'},stdio:['pipe','pipe','pipe']});
 let output='';child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);
 let firstAbort,secondAbort;
 try{
  await until(()=>output.includes('physical face'));await wait(1500);assert.equal(claims,0);
  firstAbort=new AbortController();const first=await fetch('http://127.0.0.1:4211/events',{signal:firstAbort.signal});const firstReader=first.body.getReader();
  let received='';while(!received.includes('audioBase64')){const chunk=await firstReader.read();received+=new TextDecoder().decode(chunk.value);}
  firstAbort.abort();await until(()=>acks.some(a=>a.id==='first'&&a.state==='failed'));
  secondAbort=new AbortController();const second=await fetch('http://127.0.0.1:4211/events',{signal:secondAbort.signal});const reader=second.body.getReader();
  received='';while(!received.includes('audioBase64')){const chunk=await reader.read();received+=new TextDecoder().decode(chunk.value);}
  const ack=await fetch('http://127.0.0.1:4211/ack',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'second',state:'done'})});assert.equal(ack.status,204);
  assert.ok(acks.some(a=>a.id==='second'&&a.state==='done'));
  const blocked=await fetch('http://127.0.0.1:4211/',{headers:{Origin:'https://untrusted.example'}});assert.equal(blocked.status,403);
 }finally{firstAbort?.abort();secondAbort?.abort();child.kill();await new Promise(resolve=>mock.close(resolve));}
});
