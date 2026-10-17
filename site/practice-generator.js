'use strict';
window.PracticeGenerator=(()=>{
 const pending=new WeakMap();
 const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function remember(a,entry){if(!entry)return;a.history=(a.history||[]).filter(x=>x.task.id!==entry.task.id);a.history.push(entry);a.history=a.history.slice(-10);}
 function mount(opts){
  const {root,record:a,pack,md}=opts,template=pack.exercises.find(x=>x.id===a.templateId)||pack.exercises[0],entry=a.current,running=pending.has(a),progress=pending.get(a)||1;
  const c=pack.practiceStructure;
  root.innerHTML=`<section class="practice-generator" aria-labelledby="practice-generator-title"><div class="section-top"><div><h2 id="practice-generator-title" tabindex="-1">Neue Aufgaben üben</h2><p>Neue Varianten zu deinem Lernziel. Mit geprüfter Aufgabe und KI-Bewertung.</p></div><span class="pill">Klasse 8</span></div><div class="generator-settings"><div><label for="practice-template">Aufgabentyp als Vorlage</label><select id="practice-template" ${running?'disabled':''}>${pack.exercises.map(t=>`<option value="${e(t.id)}" ${t.id===template.id?'selected':''}>${e(t.title)} · ${e(c.levels[t.level])}</option>`).join('')}</select><p class="self-check-note">${e(c.topics[template.topic])} · ${e(template.competencies.map(k=>c.competencies[k]).join(', '))}</p></div><button class="button" id="practice-generate" ${running?'disabled':''}>${running?'Aufgabe wird erstellt …':entry?'Weitere Variante generieren ↗':'Aufgabe generieren ↗'}</button></div><p class="self-check-note ai-data-note">Beim Generieren werden die gewählte Vorlage und die letzten Varianten an OpenAI gesendet. Deine bisherigen Bearbeitungen bleiben im lokalen Verlauf erhalten.</p><div id="practice-generation-status" aria-live="polite">${running?`<div class="loading" role="status"><strong>${progress===1?'Die KI erstellt und prüft deine neue Aufgabe.':`Die Aufgabe wird automatisch neu generiert. Versuch ${progress} von 3.`}</strong><p>Deine aktuelle Bearbeitung bleibt währenddessen erhalten.</p></div>`:a.error?`<p class="ai-error" role="alert">${e(a.error)}</p>`:''}</div>${entry?`<article class="exercise-sheet generated-sheet"><div class="math-task-meta"><span class="pill">KI-Variante</span><span>${e(entry.task.level||'')}</span><span>6 BE · etwa 10 Minuten</span></div><h3>${e(entry.task.title)}</h3><div class="training-paper">${md(entry.task.assignment)}</div><label for="generated-practice-answer">Deine Antwort und dein Lösungsweg</label><textarea id="generated-practice-answer" maxlength="20000">${e(entry.text)}</textarea><p class="self-check-note">Dein Entwurf wird in diesem Browser gespeichert. Beschreibe Zeichnungen durch Punkte und Verlauf.</p><div id="generated-practice-ai"></div><div id="generated-practice-reference">${entry.ai?.answer===entry.text.trim()&&entry.ai.result.reference?`<details class="training-task-details"><summary>Erwartungshorizont ansehen</summary><div class="training-paper">${md(entry.ai.result.reference)}</div></details>`:''}</div><button class="text-button" id="practice-print">Aufgabe und Bearbeitung drucken</button></article>`:'<p class="empty-note">Wähle einen Aufgabentyp und generiere eine neue Variante. Ergebnis und Lösungsweg werden anschließend mit KI bewertet.</p>'}${a.history?.length?`<details class="practice-history"><summary>Vorherige Bearbeitungen (${a.history.length})</summary><p class="self-check-note">Bis zu zehn Varianten bleiben in diesem Browser gespeichert. Generierte Aufgaben sind sieben Tage bewertbar.</p>${[...a.history].reverse().map(x=>`<button class="text-button" data-practice-history="${e(x.task.id)}" ${running?'disabled':''}>${e(x.task.title)}${x.text?' · mit Bearbeitung':''}</button>`).join('')}</details>`:''}<button class="text-button" id="practice-back">← Zur Aufgabenauswahl</button></section>`;
  root.querySelector('#practice-template').onchange=event=>{a.templateId=event.target.value;a.error='';opts.save();opts.refresh();};
  async function generate(){
   if(pending.has(a))return;
   const payload={subject:'mathematik',grade:8,variant:'E1',templateId:a.templateId,avoid:[...(a.history||[]),...(a.current?[a.current]:[])].slice(-3).map(x=>x.task.assignment.slice(0,10000))};
   a.error='';pending.set(a,1);opts.refresh();
   try{
    let task;
    for(let attempt=1;attempt<=3;attempt++){
     pending.set(a,attempt);opts.refresh();
     try{task=await LernKI.request('/api/generate-practice',{...payload,requestId:crypto.randomUUID()});if(!task?.taskToken||task.kind!=='exercise'||!task.assignment||!Array.isArray(task.criteria)||task.criteria.reduce((n,c)=>n+c.max,0)!==6)throw new Error('Die neue Aufgabe ist unvollständig.');break;}
     catch(error){if(error.status&&error.status<500)throw error;if(attempt===3)throw new Error('Die Aufgabe konnte auch nach drei Versuchen nicht erstellt werden. Deine Bearbeitung bleibt erhalten. Bitte später erneut versuchen.');}
    }
    remember(a,a.current);a.current={task,text:'',ai:null};
   }catch(error){a.error=error.message||'Die neue Aufgabe konnte nicht erstellt werden.';}
   finally{pending.delete(a);opts.save();opts.refresh();}
  }
  root.querySelector('#practice-generate').onclick=generate;
  root.querySelector('#practice-back').onclick=opts.back;
  root.querySelector('#practice-print')?.addEventListener('click',()=>window.print());
  root.querySelectorAll('[data-practice-history]').forEach(b=>b.onclick=()=>{const selected=a.history.find(x=>x.task.id===b.dataset.practiceHistory);if(!selected)return;remember(a,a.current);a.history=a.history.filter(x=>x.task.id!==selected.task.id);a.current=selected;a.templateId=selected.task.templateId||a.templateId;opts.save();opts.refresh();});
  if(entry){
   const answer=root.querySelector('#generated-practice-answer');answer.value=entry.text;
   answer.oninput=()=>{entry.text=answer.value;if(entry.ai&&entry.ai.answer!==answer.value.trim()){entry.ai=null;root.querySelector('#generated-practice-reference').innerHTML='';const output=root.querySelector('.ai-output');if(output)output.innerHTML='<p class="self-check-note">Deine Antwort wurde verändert. Fordere eine neue KI-Bewertung an.</p>';}opts.save();};
   LernKI.mount(root.querySelector('#generated-practice-ai'),{task:{subject:'mathematik',grade:8,variant:'E1',kind:'exercise',taskId:entry.task.id,taskToken:entry.task.taskToken},getAnswer:()=>entry.text,focusAnswer:()=>answer.focus(),getStored:()=>entry.ai,onSave:record=>{if(entry.text.trim()===record.answer){entry.ai=record;opts.save();if(opts.isCurrent())opts.refresh();}}});
  }
  if(opts.startNew&&!running)generate();
 }
 return {mount};
})();
