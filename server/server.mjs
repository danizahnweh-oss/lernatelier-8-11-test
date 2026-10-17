import http from 'node:http';
import {createHmac} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,renameSync} from 'node:fs';
import {prepareTask,grade,cacheKey} from './grading.mjs';
import {prepareGeneration,generateTask} from './training.mjs';
import {preparePracticeGeneration} from './practice.mjs';
const port=Number(process.env.PORT||4317),allowed=new Set((process.env.ALLOWED_ORIGINS||'http://127.0.0.1:4173').split(','));
const stateDir=process.env.STATE_DIRECTORY||'/var/lib/lernatelier-test';mkdirSync(stateDir,{recursive:true});
const usageFile=stateDir+'/usage.json';let usage={day:'',total:0,clients:{}},busy=0;const cache=new Map();
try{usage=JSON.parse(readFileSync(usageFile,'utf8'));}catch{}
setInterval(()=>{for(const [key,value] of cache)if(value.expires<=Date.now())cache.delete(key);},60000).unref();
function respond(res,status,body){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body));}
function reserve(req){
 const day=new Date().toISOString().slice(0,10);if(usage.day!==day)usage={day,total:0,clients:{}};
 const ip=req.headers['x-real-ip']||req.socket.remoteAddress,hash=createHmac('sha256',process.env.BUDGET_SALT||'local-test').update(day+ip).digest('hex');
 if(usage.total>=Number(process.env.DAILY_LIMIT||100)||(usage.clients[hash]||0)>=Number(process.env.CLIENT_DAILY_LIMIT||30))return false;
 usage.total++;usage.clients[hash]=(usage.clients[hash]||0)+1;
 writeFileSync(usageFile+'.tmp',JSON.stringify(usage),{mode:0o600});renameSync(usageFile+'.tmp',usageFile);return true;
}
const server=http.createServer(async(req,res)=>{
 const origin=req.headers.origin;
 if(origin&&!allowed.has(origin)){respond(res,403,{error:'Diese Testadresse ist für die KI-Bewertung nicht freigeschaltet.'});return;}
 if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
 res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');
 if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
 if(req.method==='GET'&&req.url==='/api/health'){respond(res,200,{service:'lernatelier-test',status:process.env.OPENAI_API_KEY?'ready':'not_configured'});return;}
 const practice=req.url==='/api/generate-practice',generating=practice||req.url==='/api/generate';
 if(req.method!=='POST'||(!generating&&req.url!=='/api/grade')){respond(res,404,{error:'Nicht gefunden.'});return;}
 if(!origin||!allowed.has(origin)){respond(res,403,{error:'Bitte starte die Bewertung über die Testseite.'});return;}
 if(!String(req.headers['content-type']||'').startsWith('application/json')){respond(res,415,{error:'Ungültiges Anfrageformat.'});return;}
 let task;try{
  let raw='';for await(const chunk of req){raw+=chunk.toString('utf8');if(Buffer.byteLength(raw)>100000){respond(res,413,{error:'Die Antwort ist zu groß.'});return;}}
  task=generating?(practice?preparePracticeGeneration(JSON.parse(raw)):prepareGeneration(JSON.parse(raw))):prepareTask(JSON.parse(raw),process.env.BUDGET_SALT);
 }catch(e){respond(res,400,{error:e instanceof SyntaxError?'Die Anfrage konnte nicht gelesen werden.':e.message});return;}
 const key=(generating?'generate:':'grade:')+cacheKey(task),cached=cache.get(key);
 if(cached&&cached.expires>Date.now()){try{respond(res,200,await cached.result);}catch{respond(res,502,{error:'Die KI-Bewertung konnte nicht abgeschlossen werden.'});}return;}
 if(busy>=3){respond(res,429,{error:'Es laufen gerade mehrere Bewertungen. Bitte versuche es gleich erneut.'});return;}
 try{if(!reserve(req)){respond(res,429,{error:'Das Tageskontingent dieser Testumgebung ist erreicht. Bitte versuche es morgen erneut.'});return;}}catch{respond(res,503,{error:'Der Bewertungsdienst ist gerade nicht verfügbar.'});return;}
 busy++;const result=generating?generateTask(task,{key:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL||'gpt-5-mini',secret:process.env.BUDGET_SALT}):grade(task,{key:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL||'gpt-5-mini'});
 cache.set(key,{result,expires:Date.now()+3600000});if(cache.size>100)cache.delete(cache.keys().next().value);
 try{respond(res,200,await result);}catch(e){cache.delete(key);respond(res,502,{error:e.name==='TimeoutError'?'Die KI braucht länger als erwartet. Deine Antwort ist gespeichert; bitte erneut versuchen.':e.message});}finally{busy--;}
});
server.requestTimeout=200000;server.headersTimeout=15000;
server.listen(port,'127.0.0.1',()=>console.log(`Lernatelier API auf 127.0.0.1:${port}`));
process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
