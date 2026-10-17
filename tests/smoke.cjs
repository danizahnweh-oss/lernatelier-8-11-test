const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:4173/';
const out=path.join(__dirname,'../test-results');fs.mkdirSync(out,{recursive:true});
let server;
async function ready(){
  try{const r=await fetch(base);if(r.ok)return;}catch{}
  if(process.env.TEST_BASE_URL)throw new Error('Testadresse nicht erreichbar');
  server=spawn('python3',['-m','http.server','4173','--bind','127.0.0.1','--directory','site'],{cwd:path.join(__dirname,'..'),stdio:'ignore'});
  for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,200));try{if((await fetch(base)).ok)return;}catch{}}
  throw new Error('Lokaler Server nicht erreichbar');
}
(async()=>{
 await ready();const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const page=await browser.newPage({viewport:{width:1440,height:1050},acceptDownloads:true});
 const errors=[],report=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 const check=async(name,fn)=>{await fn();report.push({name,status:'passed'});console.log('OK',name);};
 const choose=async(subject)=>{await page.locator(`[data-subject="${subject}"]`).click();};
 const mode=async(m)=>{await page.locator(`[data-mode="${m}"]`).click();};
 const axe=async(label)=>{
  await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const result=await page.evaluate(async()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
  fs.writeFileSync(path.join(out,`axe-${label}.json`),JSON.stringify(result.violations,null,2));
  assert.equal(result.violations.length,0,JSON.stringify(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))));
 };
 try{
 await page.goto(base);await page.locator('#slope').waitFor();
 await check('Lernschritte und interaktiver Graph',async()=>{
  assert.match(await page.locator('.lesson-count').innerText(),/1 von 5/);
  await page.locator('#slope').fill('2');await page.locator('#slope').dispatchEvent('input');
  assert.match(await page.locator('#formula').innerText(),/2/);
  await page.locator('[data-action="lesson-next"]').click();
  assert.match(await page.locator('.lesson-sheet h3').innerText(),/Steigung/);
  await page.screenshot({path:path.join(out,'desktop-lernen.png'),fullPage:true});
  await axe('mathe-lernen');
 });
 await check('Numerische Prüfung, Hinweise und Speicherung',async()=>{
  await mode('ueben');await page.locator('#answer').fill('3');await page.locator('#practice-form button[type=submit]').click();
  assert.match(await page.locator('.feedback h4').innerText(),/stimmt/);
  await page.locator('[data-exercise="1"]').click();await page.locator('[data-action=hint]').click();
  assert.equal(await page.locator('.hint').count(),1);
  await page.locator('#answer').fill('3');await page.locator('#practice-form button[type=submit]').click();
  assert.match(await page.locator('.feedback h4').innerText(),/noch einmal/);
  await page.locator('#answer').fill('7');await page.locator('#practice-form button[type=submit]').click();
  await page.reload();await page.locator('#answer').waitFor();assert.equal(await page.locator('#answer').inputValue(),'7');
  assert.equal(await page.locator('.hint').count(),1);
  await axe('mathe-ueben');
 });
 await check('Mathe: Aufgaben nach Thema, Gruppe und Kompetenz finden',async()=>{
  await choose('mathematik');await mode('ueben');assert.equal(await page.locator('.exercise-list button').count(),12);
  await page.locator('#math-level').selectOption('vertiefung');assert.equal(await page.locator('.exercise-list button').count(),5);
  await page.locator('#math-competency').selectOption('K3');assert.equal(await page.locator('.exercise-list button').count(),2);
  await page.locator('[data-exercise="8"]').click();assert.match(await page.locator('.prompt').innerText(),/Fahrradverleih/);await page.locator('#answer').fill('A(h)=4+3h, B(h)=10+2h. Bei 6 Stunden kosten beide 22 Euro. Davor ist A, danach B günstiger.');await page.locator('#practice-form button[type=submit]').click();assert.match(await page.locator('.feedback').innerText(),/22/);
  await page.locator('[data-action=next-exercise]').click();assert.match(await page.locator('.prompt').innerText(),/Wassertank/);assert.match(await page.locator('.math-task-meta').innerText(),/Modellieren/);
  await page.reload();await page.locator('#math-level').waitFor();assert.equal(await page.locator('#math-level').inputValue(),'vertiefung');assert.match(await page.locator('.prompt').innerText(),/Wassertank/);
  await page.locator('#math-topic').selectOption('punktprobe');assert.equal(await page.locator('#answer').count(),0);assert.match(await page.locator('.empty-note').innerText(),/keine Aufgabe/);await axe('math-empty');
  await page.locator('[data-action=math-filter-reset]').first().click();assert.equal(await page.locator('.exercise-list button').count(),12);
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await axe('math-filters-mobile');await page.screenshot({path:path.join(out,'math-practice-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:1050});await page.screenshot({path:path.join(out,'math-practice-desktop.png'),fullPage:true});
 });
 await check('Vollständige Lerntexte für Deutsch und Englisch',async()=>{
  await choose('deutsch');await mode('lernen');assert.match(await page.locator('.lesson-count').innerText(),/von 4/);
  await mode('ueben');await page.locator('#answer').fill('Eigene Behauptung, Begründung und ein Beispiel.');
  await page.locator('#practice-form button[type=submit]').click();await page.locator('#self-check').selectOption('klar');
  assert.match(await page.locator('.feedback').innerText(),/Behauptung/);
  await axe('deutsch-ueben');
  await choose('englisch');await mode('lernen');assert.match(await page.locator('.lesson-count').innerText(),/von 5/);
  assert.equal(await page.locator('.materials > details').count(),4);
  await page.locator('.materials > details').nth(1).locator('summary').first().click();
  const audio=page.locator('audio').first();await audio.evaluate(a=>a.load());
  await page.waitForFunction(()=>document.querySelector('audio')?.duration>40);
  assert.ok(await audio.evaluate(a=>a.duration)<90);
  await axe('englisch-lernen');
 });
 for(const subject of ['mathematik','deutsch','englisch']){
  for(const label of ['A','B']){
   await check(`${subject} Beispiel ${label}: Vier Schritte und Wiederaufnahme`,async()=>{
    await choose(subject);await mode('schulaufgabe');
    await page.locator('[data-training-step="1"]').click();
    await page.locator('[data-training-source="reference"]').click();
    await page.locator('#training-reference').selectOption(label);

    await page.locator('#training-setup button[type=submit]').click();
    assert.equal(await page.locator('.training-steps [aria-current=step]').innerText(),'2\nAufgabe');
    await page.locator('.training-paper [data-training-step="3"]').click();
    await page.locator('#training-answer').fill('Meine Bearbeitung zu den Aufgaben. 1. Eigener Lösungsweg. 2. Begründung und Beispiel.');
    await mode('lernen');await mode('schulaufgabe');
    assert.match(await page.locator('#training-answer').inputValue(),/Meine Bearbeitung/);
    await page.locator('#training-submit button[type=submit]').click();
    assert.ok(await page.locator('#training-ai .ai-request').isVisible());
    await page.reload();await page.locator('#training-ai').waitFor();
    await page.getByText('Deine abgegebene Antwort',{exact:true}).click();
    assert.match(await page.locator('.submission').innerText(),/Meine Bearbeitung/);
    if(label==='A')await axe(`${subject}-schulaufgabe`);
   });
  }
 }
 await check('KI-Generierung und eigene Aufgabe',async()=>{
  await choose('mathematik');await mode('schulaufgabe');await page.locator('[data-training-step="1"]').click();await page.locator('[data-training-source="generate"]').click();
  const generationRequests=[];
  await page.route('**/api/generate',async route=>{const b=route.request().postDataJSON();assert.equal(b.subject,'mathematik');generationRequests.push(b);if(generationRequests.length<=2){await route.fulfill({status:502,contentType:'application/json',headers:{'Access-Control-Allow-Origin':new URL(base).origin},body:JSON.stringify({error:'Die Aufgabenprüfung hat das Paket noch nicht freigegeben.'})});return;}await route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':new URL(base).origin},body:JSON.stringify({id:'generated-test',title:'Generierte lineare Funktionen',assignment:'### Aufgabe 1\nBestimme die Steigung bei y = 2x + 3.',criteria:[{id:'aufgabe1',name:'Aufgabe 1',max:20}],minutes:30,taskToken:'test-token',source:b.source})});});
  assert.equal(await page.locator('#training-consent').count(),0);assert.match(await page.locator('.ai-data-note').innerText(),/OpenAI/);
  await page.locator('#training-count').fill('1');await page.locator('#training-points').fill('20');await page.locator('#training-minutes').fill('30');
  await page.locator('#training-setup button[type=submit]').click();await page.getByText('Generierte lineare Funktionen',{exact:true}).waitFor();
  assert.equal(generationRequests.length,3);assert.equal(new Set(generationRequests.map(r=>r.requestId)).size,3);for(const request of generationRequests){assert.equal(request.count,1);assert.equal(request.minutes,30);assert.equal(request.points,20);}
  await page.locator('.training-paper [data-training-step="3"]').click();await page.locator('[data-training-timer]').click();await page.locator('[data-training-timer]').click();assert.match(await page.locator('[data-training-timer]').innerText(),/starten/);
  await page.locator('#training-answer').fill('m = 2.');await page.locator('#training-submit button[type=submit]').click();assert.ok(await page.locator('#training-ai .ai-request').isVisible());
  await page.locator('[data-training-step="1"]').click();await page.locator('[data-training-source="own"]').click();await page.locator('#training-own').fill('Bestimme die Steigung der Geraden y = 2x + 3.');
  await page.locator('#training-setup button[type=submit]').click();await page.getByText('Generierte lineare Funktionen',{exact:true}).waitFor();await page.unroute('**/api/generate');
 });
 await check('Generierungsfehler: begrenzte Wiederholung und Tageslimit',async()=>{
  await page.locator('[data-training-step="1"]').click();await page.locator('[data-training-source="generate"]').click();
  let requests=0,failStatus=502;
  await page.route('**/api/generate',async route=>{requests++;await route.fulfill({status:failStatus,contentType:'application/json',headers:{'Access-Control-Allow-Origin':new URL(base).origin},body:JSON.stringify({error:failStatus===429?'Das Tageskontingent ist erreicht.':'Die Aufgabenprüfung ist fehlgeschlagen.'})});});
  await page.locator('#training-context').fill('Fahrradverleih');await page.locator('#training-setup button[type=submit]').click();await page.locator('#training-status .ai-error').waitFor();assert.equal(requests,3);assert.match(await page.locator('#training-status').innerText(),/nach drei Versuchen/);assert.equal(await page.locator('#training-context').inputValue(),'Fahrradverleih');assert.ok(await page.locator('#training-setup button[type=submit]').isEnabled());
  requests=0;failStatus=429;await page.locator('#training-setup button[type=submit]').click();await page.getByText('Das Tageskontingent ist erreicht.',{exact:true}).waitFor();assert.equal(requests,1);await page.unroute('**/api/generate');
 });
 await check('Jahrgänge und Sprachfolge sind getrennt',async()=>{
  await choose('englisch');
  for(const g of ['9','10','11']){await page.locator('#grade').selectOption(g);assert.ok(await page.locator('.topic-row').count()>3);assert.ok(await page.locator('#workspace').isHidden());}
  await page.locator('#grade').selectOption('8');await page.locator('#variant').selectOption('E2');
  assert.ok(await page.locator('#workspace').isHidden());assert.doesNotMatch(await page.locator('#planned').innerText(),/London/);
  await page.locator('#grade').selectOption('9');assert.match(await page.locator('#planned').innerText(),/London/);
  await page.locator('[data-action=demo]').click();assert.ok(await page.locator('#workspace').isVisible());
 });
 await check('Tastatur, Dialog und Export',async()=>{
  await page.locator('[data-mode=lernen]').focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('[data-mode=ueben]').getAttribute('aria-selected'),'true');
  await page.locator('#help-open').click();assert.ok(await page.locator('#info-dialog').isVisible());await page.keyboard.press('Escape');
  assert.ok(await page.locator('#info-dialog').isHidden());
  const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;
  const target=path.join(out,'export.json');await download.saveAs(target);const saved=JSON.parse(fs.readFileSync(target,'utf8'));assert.equal(saved.learning_state.version,1);
 });
 await check('KI: Direktstart, Rückmeldung, Speicherung und Verbindungsfehler',async()=>{
  await choose('deutsch');await mode('ueben');await page.locator('[data-exercise="1"]').click();
  await page.locator('#answer').fill('Der Treff sollte in einer längeren Pause stattfinden, weil dann mehr Jugendliche Zeit haben.');
  let requests=0;
  await page.route('**/api/grade',async route=>{requests++;await route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':new URL(base).origin},body:JSON.stringify({summary:'Deine Begründung ist nachvollziehbar.',strengths:['Klare Begründung.'],improvements:['Ergänze ein konkretes Beispiel.'],next_step:'Formuliere ein passendes Beispiel.',uncertainty:'',criteria:[{id:'inhalt',name:'Aufgabenerfüllung',score:2,max:2,reason:'Ein passender Grund ist vorhanden.'},{id:'darstellung',name:'Darstellung',score:1,max:2,reason:'Die Begründung ist verständlich.'}],errors:[],score:3,max:4,assessable_max:4,provisional:false,model:'test-fixture',task_id:'d2'})});});
  assert.equal(await page.locator('.ai-panel input[type=checkbox]').count(),0);assert.match(await page.locator('.ai-data-note').innerText(),/OpenAI/);assert.equal(requests,0);
  await page.locator('.ai-request').click();await page.locator('.ai-result').waitFor();
  assert.equal(requests,1);assert.match(await page.locator('.ai-points').innerText(),/3 von 4/);
  await page.reload();await page.locator('.ai-result').waitFor();assert.match(await page.locator('.ai-result').innerText(),/nachvollziehbar/);
  await page.locator('#answer').fill('Neue Fassung der Antwort.');assert.match(await page.locator('.ai-result').innerText(),/verändert/);
  await page.unroute('**/api/grade');await page.route('**/api/grade',r=>r.abort('failed'));
  await page.locator('.ai-request').click();await page.locator('.ai-error').waitFor();
  assert.equal(await page.locator('#answer').inputValue(),'Neue Fassung der Antwort.');assert.equal(await page.locator('.ai-request').isEnabled(),true);
  await page.unroute('**/api/grade');
 });
 await check('Mobile und Tablet: Darstellung und Kontraste',async()=>{
  for(const width of [390,768,1024]){
   await page.setViewportSize({width,height:1000});
   for(const s of ['mathematik','deutsch','englisch']){
    await choose(s);await mode('lernen');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow ${width} ${s}`);
   }
   await mode('schulaufgabe');await page.locator('[data-training-step="1"]').click();await page.locator('[data-training-source="generate"]').click();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Training Overflow ${width}`);await axe(`training-${width}`);
   await page.screenshot({path:path.join(out,`training-${width}.png`),fullPage:true});
   await page.screenshot({path:path.join(out,`viewport-${width}.png`),fullPage:true});
  }
  await page.setViewportSize({width:390,height:844});await choose('mathematik');await mode('lernen');await axe('mobile');
  await page.screenshot({path:path.join(out,'mobile-lernen.png'),fullPage:true});
 });
 await check('Speicherfehler bleiben sichtbar',async()=>{
  const isolated=await browser.newPage();await isolated.addInitScript(()=>Storage.prototype.setItem=function(){throw new Error('disabled');});
  await isolated.goto(base);await isolated.locator('#slope').waitFor();
  assert.match(await isolated.locator('#save-state').innerText(),/nicht verfügbar/);await isolated.close();
 });
 await check('Lernstand bewusst zurücksetzen',async()=>{
  await page.setViewportSize({width:1440,height:1000});await page.locator('#reset-open').click();await page.locator('#reset-dialog [data-close]').click();
  assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('lernatelier-test-v1')).answers.m1.correct));
  await page.locator('#reset-open').click();await page.locator('#reset-confirm').click();
  assert.equal(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('lernatelier-test-v1')).answers).length),0);
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({base,checks:report,pageErrors:errors},null,2));
 console.log(`${report.length} Prüfungen bestanden, keine JavaScript-Fehler.`);
 }finally{await browser.close();server?.kill();}
})().catch(e=>{console.error(e);server?.kill();process.exitCode=1;});
