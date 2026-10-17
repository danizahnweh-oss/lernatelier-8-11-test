'use strict';
window.LernKI=(()=>{
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const config=fetch('api-config.json').then(r=>{if(!r.ok)throw new Error('Die KI-Verbindung konnte nicht geladen werden.');return r.json();});
 // Attach a rejection handler immediately; a later request still reports the error.
 config.catch(()=>{});
 function resultHTML(r){
  const points=r.provisional?`${r.score.toLocaleString('de-DE')} von ${r.assessable_max} beurteilbaren Punkten`:`${r.score.toLocaleString('de-DE')} von ${r.max} Punkten`;
  return `<div class="ai-result"><div class="ai-result-heading"><h4>Deine KI-Rückmeldung</h4><span class="pill">KI-Einschätzung</span></div><p class="ai-points">${escape(points)}</p><p>${escape(r.summary)}</p>${r.uncertainty?`<p class="ai-uncertainty"><strong>Noch offen:</strong> ${escape(r.uncertainty)}</p>`:''}<div class="ai-criteria">${r.criteria.map(c=>`<div><div class="ai-criterion-title"><strong>${escape(c.name)}</strong><span>${c.score===null?'Nicht beurteilbar':escape(c.score.toLocaleString('de-DE')+' / '+c.max)}</span></div><p>${escape(c.reason)}</p></div>`).join('')}</div>${r.strengths.length?`<h4>Das gelingt dir schon</h4><ul>${r.strengths.map(s=>`<li>${escape(s)}</li>`).join('')}</ul>`:''}${r.improvements.length?`<h4>So wirst du sicherer</h4><ul>${r.improvements.map(s=>`<li>${escape(s)}</li>`).join('')}</ul>`:''}${r.errors.length?`<h4>Direkt an deiner Antwort</h4>${r.errors.map(e=>`<div class="ai-correction"><q>${escape(e.quote)}</q><p>${escape(e.explanation)}</p><p><strong>Verbesserung:</strong> ${escape(e.correction)}</p></div>`).join('')}`:''}<div class="ai-next"><strong>Dein nächster Schritt</strong><p>${escape(r.next_step)}</p></div><p class="self-check-note">Eine KI kann Fehler machen. Die Punkte sind eine Übungseinschätzung, keine offizielle Schulnote.</p></div>`;
 }
 function mount(element,options){
  if(!element)return;
  const stored=options.getStored?.(),answer=options.getAnswer();
  element.innerHTML=`<section class="ai-panel" aria-label="KI-Bewertung"><div class="ai-title"><h3>Verstehen, was schon gelingt.</h3><span class="pill">Mit KI-Bewertung</span></div><p>Erhalte Punkte nach festen Kriterien, eine Fehlererklärung und konkrete Tipps zu deiner eigenen Antwort.</p><label class="ai-consent"><input type="checkbox">Meine Antwort mit Aufgabenstellung und Bewertungsraster zur Bewertung an OpenAI senden.</label><p class="self-check-note">Bitte keine Namen oder persönlichen Angaben eintragen. Die Übermittlung startet erst mit dem folgenden Button.</p><button type="button" class="button ai-request">KI-Bewertung anfordern ↗</button><div class="ai-output" aria-live="polite" aria-atomic="false">${stored?stored.answer===answer?resultHTML(stored.result):'<p class="self-check-note">Deine Antwort hat sich seit der letzten KI-Bewertung geändert. Fordere für diese Fassung eine neue Bewertung an.</p>':''}</div></section>`;
  const button=element.querySelector('.ai-request'),checkbox=element.querySelector('input'),output=element.querySelector('.ai-output');
  button.addEventListener('click',async()=>{
   const answer=options.getAnswer().trim();
   if(!answer){output.innerHTML='<p role="alert" class="ai-error">Schreibe zuerst eine eigene Antwort.</p>';options.focusAnswer?.();return;}
   if(!checkbox.checked){checkbox.setCustomValidity('Bestätige zuerst die Übermittlung an OpenAI.');checkbox.reportValidity();return;}
   button.disabled=true;button.textContent='Bewertung läuft …';checkbox.disabled=true;
   output.innerHTML='<div class="loading" role="status"><strong>Die KI liest deine Antwort.</strong><p>Sie prüft Aufgabenbezug, Lösungsweg und Bewertungskriterien. Deine Antwort bleibt gespeichert.</p></div>';
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),100000);
   try{
    const settings=await config;
    const response=await fetch(settings.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify({...options.task,answer,hintsUsed:options.hintsUsed===true}),signal:controller.signal});
    const result=await response.json();if(!response.ok)throw new Error(result.error||'Die KI-Bewertung konnte nicht abgeschlossen werden.');
    if(!Array.isArray(result.criteria)||typeof result.score!=='number'||!Array.isArray(result.errors)||!Array.isArray(result.strengths)||!Array.isArray(result.improvements))throw new Error('Die KI-Rückmeldung war unvollständig. Bitte erneut versuchen.');
    options.onSave?.({answer,result});
    if(element.isConnected)output.innerHTML=options.getAnswer().trim()===answer?resultHTML(result):'<p class="self-check-note">Deine Antwort wurde während der Bewertung verändert. Fordere für die neue Fassung eine neue Bewertung an.</p>';
   }catch(e){if(element.isConnected)output.innerHTML=`<p role="alert" class="ai-error">${escape(e.name==='AbortError'?'Die Bewertung dauert länger als erwartet. Deine Antwort bleibt erhalten. Bitte erneut versuchen.':e.message||'Die KI-Bewertung ist gerade nicht erreichbar. Bitte erneut versuchen.')}</p>`;}
   finally{clearTimeout(timeout);if(element.isConnected){button.disabled=false;button.textContent='Erneut mit KI bewerten ↗';checkbox.disabled=false;}}
  });
  checkbox.addEventListener('change',()=>checkbox.setCustomValidity(''));
 }
 async function request(path,body){
  const settings=await config;
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),190000);
  try{const response=await fetch(new URL(path,settings.endpoint).href,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify(body),signal:controller.signal});const result=await response.json();if(!response.ok)throw new Error(result.error||'Die Anfrage konnte nicht abgeschlossen werden.');return result;}finally{clearTimeout(timeout);}
 }
 return {mount,request,resultHTML};
})();
