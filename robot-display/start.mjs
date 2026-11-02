import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import readline from 'node:readline';
const here=path.dirname(fileURLToPath(import.meta.url));
const bundled=path.join(here,'screen');
const root=await fs.access(bundled).then(()=>bundled).catch(()=>path.resolve(here,'../public/robot-display'));
try{process.loadEnvFile(path.join(here,'.env.local'));}catch(error){if(error.code!=='ENOENT')throw error;}
const port=Number(process.env.AEROBOT_DISPLAY_PORT||4210),host='127.0.0.1',origin=`http://${host}:${port}`,clients=new Set();
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid local display port');
const api=(process.env.AEROSENSE_API_URL||'https://aerosense.me/api').replace(/\/$/,'');
const device=process.env.AEROBOT_DEVICE_ID,key=process.env.AEROBOT_DEVICE_KEY;
const headers={'x-device-id':device||'','x-device-key':key||'','Content-Type':'application/json'};
let state={action:'sleep'},pending=null,pendingAt=0,polling=false,closed=false;
const completed=new Set();
const queuedAcks=new Map();
function emit(event){state=event;for(const client of clients)client.write(`data: ${JSON.stringify(event)}\n\n`);console.log(`[face] ${event.action}${event.emotion?' / '+event.emotion:''}`);}
async function remote(endpoint,options={}){
 const r=await fetch(api+endpoint,{...options,headers,signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw new Error(`AEROSENSE returned ${r.status}`);return r;
}
async function flushAcks(){
 for(const [id,result]of queuedAcks){
  await remote('/v1/robot/ack',{method:'POST',body:JSON.stringify({id,state:result})});
  queuedAcks.delete(id);completed.add(id);if(completed.size>100)completed.delete(completed.values().next().value);
 }
}
async function acknowledge(id,result){
 if(!pending||pending.id!==id)return false;
 pending=null;queuedAcks.set(id,result);
 await flushAcks();return true;
}
const server=http.createServer(async(req,res)=>{
 try{
  if(req.headers.host!==`${host}:${port}`|| (req.headers.origin&&req.headers.origin!==origin)){res.writeHead(403);return res.end();}
  const url=new URL(req.url,origin);
  if(url.pathname==='/events'){
   if(req.method!=='GET'){res.writeHead(405);return res.end();}
   res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-store','Connection':'keep-alive'});clients.add(res);
   // Never replay in-progress speech when a window reconnects.
   res.write(`data: ${JSON.stringify(state.action==='speak'?{action:'listening'}:state)}\n\n`);
   const pulse=setInterval(()=>res.write(': keepalive\n\n'),20000);req.on('close',()=>{
    clearInterval(pulse);clients.delete(res);
    if(!clients.size&&pending){state={action:'listening'};void acknowledge(pending.id,'failed').catch(error=>console.error('[ack retry queued]',error.message));}
   });return;
  }
  if(url.pathname==='/ack'&&req.method==='POST'){
   let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>1000){res.writeHead(413);return res.end();}}
   const body=JSON.parse(raw);if(!['done','failed'].includes(body.state)){res.writeHead(400);return res.end();}
   await acknowledge(body.id,body.state);res.writeHead(204);return res.end();
  }
  if(req.method!=='GET'){res.writeHead(405);return res.end();}
  const name=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname),file=path.resolve(root,'.'+name);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  const body=await fs.readFile(file);const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
  res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body);
 }catch(error){res.writeHead(error.code==='ENOENT'?404:500);res.end('Request could not be completed');}
});
async function poll(){
 if(closed||polling||!device||!key)return;
 polling=true;
 try{
  await flushAcks();
  if(pending&&Date.now()-pendingAt>110000){const id=pending.id;emit({action:'stop'});await acknowledge(id,'failed');}
  if(pending||clients.size===0)return;
  const {commands}=await (await remote('/v1/robot/commands')).json();
  for(const command of commands||[]){
   if(completed.has(command.id))continue;
   const body=command.body||{};
   if(Date.parse(command.expires_at)<Date.now()||body.muted===true){pending=command;await acknowledge(command.id,'failed');continue;}
   if(body.action==='listen'){emit({action:'listening'});pending=command;console.log('[face-only] Microphone capture is not implemented; listen command is not acknowledged as executed.');await acknowledge(command.id,'failed');continue;}
   if(body.action!=='speak'){pending=command;await acknowledge(command.id,'failed');continue;}
   pending=command;pendingAt=Date.now();emit({action:'thinking'});
   if(!body.audio_path){emit({action:'expression',text:body.text});await acknowledge(command.id,'failed');continue;}
   const reply=await remote('/v1/robot/audio/'+encodeURIComponent(command.id));
   if(!reply.headers.get('content-type')?.startsWith('audio/'))throw new Error('Audio response was invalid');
   const bytes=Buffer.from(await reply.arrayBuffer());if(bytes.length>12000000)throw new Error('Audio exceeds local limit');
   emit({action:'speak',commandId:command.id,text:String(body.text||'').slice(0,4000),emotion:body.expression||body.face,severity:body.severity,audioBase64:bytes.toString('base64'),mime:'audio/wav'});
   break;
  }
 }catch(error){console.error('[connection]',error.message);if(pending){try{await acknowledge(pending.id,'failed');}catch{pending=null;}}}
 finally{polling=false;}
}
server.listen(port,host,async()=>{
 console.log(`AERO-BOT physical face: ${origin}`);
 console.log(device&&key?'Device adapter enabled. Commands will be claimed only while this screen is connected.':'Local mode. Set device credentials in .env.local to consume real AEROSENSE robot audio.');
 console.log('Commands: wake | sleep | think | neutral | happy | concerned | warning | danger | surprised | say TEXT | play PATH | TEXT');
 if(process.env.AEROBOT_OPEN_WINDOW!=='0'){
  const candidates=process.platform==='win32'?['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']:process.platform==='darwin'?['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']:['/usr/bin/chromium','/usr/bin/google-chrome','/usr/bin/chromium-browser'];
  for(const browser of candidates){try{await fs.access(browser);const child=spawn(browser,[`--app=${origin}`,'--autoplay-policy=no-user-gesture-required',`--user-data-dir=${path.join(here,'.chrome-profile')}`],{detached:true,stdio:'ignore',windowsHide:true});child.unref();break;}catch{}}
 }
});
const interval=setInterval(()=>void poll(),1400);
const input=readline.createInterface({input:process.stdin,output:process.stdout});
input.on('line',async line=>{
 if(pending){console.log('A real robot answer is playing. Wait for its completion before a local preview.');return;}
 const value=line.trim();
 if(['wake','sleep','thinking','think','stop'].includes(value)){emit({action:value==='think'?'thinking':value});return;}
 if(['neutral','happy','concerned','warning','danger','surprised'].includes(value)){emit({action:'expression',emotion:value});return;}
 if(value.startsWith('play ')){
  const [file,text='Halo, saya AERO-BOT.']=value.slice(5).split('|');
  try{const audio=await fs.readFile(file.trim().replace(/^"|"$/g,''));if(audio.length>12000000)throw new Error('Maximum audio size: 12 MB');emit({action:'speak',text,audioBase64:audio.toString('base64'),mime:file.trim().toLowerCase().endsWith('.mp3')?'audio/mpeg':'audio/wav'});}catch(error){console.log(error.message);}return;
 }
 if(value)emit({action:'speak',local:true,text:value.replace(/^say /,'')});
});
function close(){closed=true;clearInterval(interval);for(const client of clients)client.end();input.close();server.close();}
process.on('SIGINT',()=>{close();process.exit(0);});
