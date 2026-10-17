'use strict';
const KEY = 'lernatelier-test-v1';
const $ = s => document.querySelector(s);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md = value => DOMPurify.sanitize(marked.parse(String(value || '')), {USE_PROFILES:{html:true}});
const fresh = () => ({version:1,grade:8,subject:'mathematik',variant:'E1',mode:'lernen',lesson:{},exercise:{},answers:{},exams:{},training:{},mathFilters:{}});
let state = fresh(), packs, catalog, recorder, recordingStream, recordingURL;
let storageError = false;
try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  if (saved && saved.version === 1) {
    for (const k of ['lesson','exercise','answers','exams']) if (!saved[k] || typeof saved[k] !== 'object' || Array.isArray(saved[k])) throw new Error('invalid storage');
    state = {...fresh(),...saved};
    if (![8,9,10,11].includes(Number(state.grade))) state.grade=8;
    state.grade=Number(state.grade);
    if (!['mathematik','deutsch','englisch'].includes(state.subject)) state.subject='mathematik';
    if (!['lernen','ueben','schulaufgabe'].includes(state.mode)) state.mode='lernen';
    if (!['E1','E2'].includes(state.variant)) state.variant='E1';
  }
} catch { storageError=true; }
const context = () => `${state.subject}-${state.grade}-${state.subject==='englisch'?state.variant:'all'}`;
const active = () => state.grade===8 && (state.subject!=='englisch' || state.variant==='E1');
const pack = () => packs[state.subject];
function announce(message) { $('#announcement').textContent=message; }
function save() {
  try { localStorage.setItem(KEY,JSON.stringify(state)); if(!storageError) $('#save-state').textContent='Nur in diesem Browser gespeichert'; }
  catch { storageError=true; }
  if(storageError) { $('#save-state').textContent='Speichern nicht verfügbar. Bitte Lernstand herunterladen.'; $('#save-state').classList.add('storage-warning'); }
}
function keyIndex(key, length, value) { const n=Number(value?.[key] || 0); return Number.isInteger(n)?Math.max(0,Math.min(length-1,n)):0; }
function setMode(mode) { state.mode=mode; save(); render(); }
function focusHeading() { $('#page-title').setAttribute('tabindex','-1'); $('#page-title').focus({preventScroll:true}); }
function stopRecording() {
  if(recorder?.state==='recording') recorder.stop();
  recordingStream?.getTracks().forEach(t=>t.stop());
  recordingStream=null;
}
function render() {
  Schultraining.stop(); stopRecording();
  document.querySelectorAll('audio').forEach(a=>a.pause());
  if(recordingURL) { URL.revokeObjectURL(recordingURL); recordingURL=null; }
  const names={mathematik:'Mathematik',deutsch:'Deutsch',englisch:'Englisch'};
  $('#grade').value=state.grade; $('#variant').value=state.variant;
  $('#variant-field').hidden=state.subject!=='englisch'||state.grade>9;
  document.querySelectorAll('[data-subject]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.subject===state.subject));
  $('#breadcrumb').textContent=`Dein Lernbereich / Klasse ${state.grade} / ${names[state.subject]}`;
  $('#subject-caption').textContent=`${names[state.subject]}, Klasse ${state.grade}${state.subject==='englisch'?' ('+state.variant+')':''}`;
  const titles={mathematik:'Zusammenhänge<br>werden verständlich.',deutsch:'Deine Gedanken.<br>Klar auf den Punkt.',englisch:'Dein nächster Schritt.<br>Auf Englisch.'};
  $('#page-title').innerHTML=titles[state.subject];
  $('#intro').textContent=active()?pack().subtitle:'Entdecke die geplanten Themen für deinen Jahrgang. Die Inhalte werden schrittweise ergänzt.';
  $('#stamp-symbol').textContent=pack().symbol; $('#stamp-label').textContent=active()?pack().title:`Klasse ${state.grade}`;
  const source=catalog.groups.find(g=>g.subject===state.subject&&g.grade===state.grade)?.sources;
  $('#source-link').href=source?.find(s=>s.id===state.variant)?.url||source?.[0]?.url||pack().source;
  $('#workspace').hidden=!active(); $('#planned').hidden=active();
  if(!active()) { renderPlanned(); save(); return; }
  document.querySelectorAll('[data-mode]').forEach(b=>{ const selected=b.dataset.mode===state.mode; b.setAttribute('aria-selected',selected); b.tabIndex=selected?0:-1; });
  $('#panel').setAttribute('aria-labelledby',`tab-${state.mode}`);
  if(state.mode==='lernen') renderLearn();
  else if(state.mode==='ueben') renderPractice();
  else renderExam();
  save();
}
function renderPlanned() {
  const g=catalog.groups.find(g=>g.subject===state.subject&&g.grade===state.grade);
  const topics=g.topics.filter(t=>t.variant==='gemeinsam'||t.variant.includes(state.variant));
  $('#planned').innerHTML=`<div class="planned-head"><h2>Was hier entstehen wird</h2><span class="pill">In Vorbereitung</span></div><p class="muted">Diese Themen sind noch nicht als interaktive Pakete verfügbar. In Klasse 8 kannst du Mathematik, Deutsch und Englisch als erste Fremdsprache bereits ausprobieren.</p>${topics.map(t=>`<article class="topic-row"><div><h3>${esc(t.title)}</h3><p>${esc(t.competency_goal)}</p></div><span class="pill">Geplant</span></article>`).join('')}<div class="actions"><button class="button" data-action="demo">Klasse-8-Paket ausprobieren ↗</button></div>`;
}
function sectionTop(title,sub,pill='') { return `<div class="section-top"><div><h2>${esc(title)}</h2><p>${esc(sub)}</p></div>${pill?`<span class="pill">${esc(pill)}</span>`:''}</div>`; }
function graph() {
  let lines='';
  for(let n=-5;n<=5;n++) { const pos=150+n*24; lines+=`<line x1="30" y1="${pos}" x2="270" y2="${pos}" stroke="#e2e8f0"/><line x1="${pos}" y1="30" x2="${pos}" y2="270" stroke="#e2e8f0"/>`; }
  return `<div class="graph-panel"><div class="graph-top"><strong>Einfach ausprobieren</strong><span>Interaktiver Graph</span></div><svg viewBox="0 0 300 300" role="img" aria-labelledby="graph-title graph-desc"><title id="graph-title">Graph einer linearen Funktion</title><desc id="graph-desc">y gleich 1 mal x plus 1. Ändere die Steigung oder den Achsenabschnitt mit den Reglern.</desc><defs><clipPath id="plot-clip"><rect x="30" y="30" width="240" height="240"/></clipPath></defs>${lines}<path d="M30 150H275M150 270V25" fill="none" stroke="#94a3b8" stroke-width="1.5"/><g fill="#475569" font-family="sans-serif" font-size="11"><text x="279" y="154">x</text><text x="155" y="23">y</text><text x="138" y="166">0</text><text x="194" y="166">2</text><text x="133" y="106">2</text><text x="98" y="166">−2</text></g><path id="function-line" d="M30 246L270 6" stroke="#4f46e5" stroke-width="3" fill="none" clip-path="url(#plot-clip)"/><circle id="function-intercept" cx="150" cy="126" r="5" fill="#4f46e5"/></svg><div class="graph-formula" id="formula">y = x + 1</div><div class="graph-controls"><div><label for="slope">Steigung m <output id="slope-value" for="slope">1</output></label><input id="slope" type="range" min="-3" max="3" step="0.5" value="1"></div><div><label for="intercept">Achsenabschnitt t <output id="intercept-value" for="intercept">1</output></label><input id="intercept" type="range" min="-4" max="4" step="1" value="1"></div></div><p class="graph-help">Was verändert sich, wenn du nur m bewegst? Und was bleibt gleich?</p></div>`;
}
function renderLearn() {
  const p=pack(), i=keyIndex(context(),p.lessons.length,state.lesson), lesson=p.lessons[i];
  let aside=state.subject==='mathematik'?graph():state.subject==='deutsch'?`<aside class="graph-panel"><div class="graph-top"><strong>Ein Argument, drei Bausteine</strong></div><h3>Deine Behauptung</h3><p>Was ist dein Standpunkt?</p><h3>Deine Begründung</h3><p>Warum ist das nachvollziehbar?</p><h3>Dein Beispiel</h3><p>Woran wird dein Gedanke anschaulich?</p><p class="graph-help">Ein gutes Beispiel passt genau zu deiner Begründung.</p></aside>`:`<aside class="graph-panel"><div class="graph-top"><strong>Useful language</strong></div><h3 lang="en">We could …</h3><p>Einen Vorschlag machen.</p><h3 lang="en">I would prefer … because …</h3><p>Eine Entscheidung begründen.</p><h3 lang="en">What do you think?</h3><p>Das Gespräch weiterführen.</p></aside>`;
  $('#panel').innerHTML=sectionTop(p.title,'Verstehen beginnt mit einem guten Beispiel.',`${p.lessons.length} kurze Lernschritte`)+`<div class="learn-layout"><article class="lesson-sheet"><div class="lesson-count">Lernschritt ${i+1} von ${p.lessons.length}</div><h3>${esc(lesson.title)}</h3>${md(lesson.body)}<div class="lesson-nav"><button class="button secondary small" data-action="lesson-prev" ${i===0?'disabled':''}>← Zurück</button><span class="lesson-dots">${i+1} / ${p.lessons.length}</span><button class="button small" data-action="lesson-next">${i===p.lessons.length-1?'Jetzt üben ↗':'Weiter →'}</button></div></article>${aside}</div>${materials()}<div class="reading-note"><h3>Du musst nicht alles auf einmal lernen.</h3><p>Übe ein Thema direkt oder probiere einen vollständigen Übungssatz aus. Du kannst jederzeit zu den Erklärungen zurückkehren.</p></div>`;
}
function updateGraph() {
  const m=Number($('#slope').value),t=Number($('#intercept').value);
  const at=x=>150-24*(m*x+t);
  $('#function-line').setAttribute('d',`M30 ${at(-5)}L270 ${at(5)}`);
  $('#function-intercept').setAttribute('cy',150-24*t);
  $('#slope-value').value=String(m).replace('.',','); $('#intercept-value').value=t;
  $('#formula').textContent=`y = ${m===1?'':m===-1?'−':String(m).replace('.',',')+' · '}x ${t<0?'−':'+'} ${Math.abs(t)}`;
  $('#graph-desc').textContent=`Gerade mit Steigung ${m} und y-Achsenabschnitt ${t}.`;
}
function materials(exam=false, submitted=false, label='A') {
  if(state.subject!=='englisch') return '';
  const sections=pack().materials.split(/^### /m).slice(1).map(chunk=>{const n=chunk.indexOf('\n');return [chunk,chunk.slice(0,n),chunk.slice(n+1)];});
  const want=label==='A'?['R1','H1']:['R2','H2'];
  return `<section class="materials" aria-label="Materialien"><h3>Materialien zum Paket</h3>${sections.filter(s=>!exam||want.some(w=>s[1].startsWith(w))).map(s=>{
    const h=s[1],audio=h.startsWith('H'),id=h.slice(0,2).toLowerCase();
    const transcript=s[2].split('\n').filter(l=>l.startsWith('> ')).join('\n');
    return `<details ${exam?'open':''}><summary>${esc(h)}</summary><div class="material-body" lang="en">${audio?`<audio controls preload="metadata" src="assets/${id}.wav" aria-label="Hörtext ${esc(id.toUpperCase())}"></audio><p lang="de" class="muted">Künstlich gesprochener Hörtext, britische Stimme. Hör ihn zweimal an.</p>${!exam||submitted?`<details><summary lang="de">Skript als Textalternative öffnen</summary><div class="material-body">${md(transcript)}<p lang="de">Mit geöffnetem Skript prüfst du Lesen, nicht Hörverstehen.</p></div></details>`:''}`:md(s[2])}</div></details>`;
  }).join('')}</section>`;
}
function mathFilter(){state.mathFilters ||= {};return state.mathFilters[context()] ||= {level:'all',topic:'all',competency:'all'};}
function practiceEntries(){
  const entries=pack().exercises.map((task,index)=>({task,index}));
  if(state.subject!=='mathematik')return entries;
  const f=mathFilter();return entries.filter(({task})=>(f.level==='all'||task.level===f.level)&&(f.topic==='all'||task.topic===f.topic)&&(f.competency==='all'||task.competencies.includes(f.competency)));
}
function currentExercise(){const entries=practiceEntries(),index=keyIndex(context(),pack().exercises.length,state.exercise);return (entries.find(e=>e.index===index)||entries[0])?.task;}
function mathPracticeFilters(count){
  if(state.subject!=='mathematik')return '';
  const config=pack().practiceStructure,f=mathFilter();
  const select=(key,label,values)=>`<div><label for="math-${key}">${label}</label><select id="math-${key}" data-math-filter="${key}"><option value="all">Alle</option>${Object.entries(values).map(([id,name])=>`<option value="${id}" ${f[key]===id?'selected':''}>${esc(name)}</option>`).join('')}</select></div>`;
  return `<section class="math-filters" aria-labelledby="math-filter-heading"><h3 id="math-filter-heading">Wähle, was du üben möchtest.</h3><p>Grundwissen festigen, Kernaufgaben lösen oder Zusammenhänge vertiefen. Alle Aufgaben bleiben beim Thema lineare Funktionen.</p><div class="math-filter-fields">${select('topic','Teilthema',config.topics)}${select('level','Aufgabengruppe',config.levels)}${select('competency','Was möchtest du trainieren?',config.competencies)}</div><div class="math-filter-status"><span role="status">${count} von ${pack().exercises.length} Aufgaben</span><button class="text-button" data-action="math-filter-reset">Alle Aufgaben anzeigen</button></div></section>`;
}
function mathTaskMeta(ex){if(state.subject!=='mathematik')return '';const c=pack().practiceStructure;return `<div class="math-task-meta"><span class="pill">${esc(c.levels[ex.level])}</span><span>${esc(c.topics[ex.topic])}</span><ul aria-label="Geübte Kompetenzen">${ex.competencies.map(id=>`<li>${esc(c.competencies[id])}</li>`).join('')}</ul></div>`;}
function mathPracticeSource(){return state.subject==='mathematik'?`<p class="reading-note math-source">Aufgabenstruktur inspiriert von <a href="${esc(pack().practiceStructure.source)}" target="_blank" rel="noopener">SMART der Universität Bayreuth ↗</a>. Die Aufgaben hier sind eigene Übungen.</p>`:'';}
function response(ex) { return state.answers[ex.id] || {text:'',hints:0}; }
function renderPractice() {
  const p=pack(),entries=practiceEntries(),ex=currentExercise();
  if(!ex){$('#panel').innerHTML=sectionTop('Unterricht üben','Lineare Funktionen gezielt trainieren.')+mathPracticeFilters(0)+'<div class="empty-note"><h3>Für diese Kombination gibt es noch keine Aufgabe.</h3><p>Ändere einen Filter oder zeige wieder alle Aufgaben an.</p><button class="button secondary" data-action="math-filter-reset">Filter zurücksetzen</button></div>'+mathPracticeSource();return;}
  state.exercise[context()]=p.exercises.indexOf(ex);const a=response(ex);
  $('#panel').innerHTML=sectionTop('Mach den nächsten Schritt.','Eine Aufgabe nach der anderen. Hilfen, wenn du sie brauchst.',`${entries.length} Übungen`)+mathPracticeFilters(entries.length)+`<div class="practice-layout"><nav class="exercise-list" aria-label="Übung wählen">${entries.map(({task:e,index:i})=>`<button data-exercise="${i}" aria-current="${e.id===ex.id}"><span class="exercise-index">${state.answers[e.id]?.self==='klar'||state.answers[e.id]?.correct?'✓':i+1}</span>${esc(e.title)}</button>`).join('')}</nav><article class="exercise-sheet"><div class="exercise-meta"><span>${esc(p.title)}</span><span class="pill">${ex.kind==='number'?'Zahl automatisch prüfbar':'KI-Bewertung verfügbar'}</span></div>${mathTaskMeta(ex)}<h3>${esc(ex.title)}</h3><p class="prompt">${esc(ex.prompt)}</p><form id="practice-form"><label for="answer">${ex.kind==='number'?'Dein Ergebnis':'Deine Antwort oder Notizen'}</label>${ex.kind==='number'?`<input id="answer" type="text" inputmode="decimal" autocomplete="off" value="${esc(a.text)}" required>`:`<textarea id="answer" maxlength="20000" required spellcheck="true" ${state.subject==='englisch'?'lang="en"':''}>${esc(a.text)}</textarea>`}<div class="actions"><button class="button" type="submit">${ex.kind==='number'?'Ergebnis prüfen':'Mit Lösung vergleichen'}</button><button type="button" class="button secondary" data-action="hint" ${(a.hints||0)>=ex.hints.length?'disabled':''}>Hinweis ${Math.min((a.hints||0)+1,ex.hints.length)} anzeigen</button></div><p class="self-check-note">${ex.kind==='number'?'Geprüft wird dein Zahlenwert. Deinen Rechenweg kannst du selbst mit der Lösung vergleichen.':'Lass deine Antwort unten mit KI bewerten oder vergleiche selbst mit dem Lösungsvorschlag.'}</p></form>${ex.hints.slice(0,a.hints||0).map((h,i)=>`<div class="hint"><strong>Hinweis ${i+1}:</strong> ${esc(h)}</div>`).join('')}${ex.kind==='speaking'?recordingUI():''}${a.revealed?feedback(ex,a):''}<div id="ai-exercise"></div></article></div>${materials()}${mathPracticeSource()}`;
  const aiPanel=$('#ai-exercise'),form=$('#practice-form');form.insertBefore(aiPanel,form.querySelector('.actions'));form.querySelector('button[type=submit]').className='button secondary';
  const task={subject:state.subject,grade:8,variant:state.variant,kind:'exercise',taskId:ex.id};
  LernKI.mount($('#ai-exercise'),{task,hintsUsed:(a.hints||0)>0,getAnswer:()=>$('#answer')?.value||state.answers[ex.id]?.text||'',focusAnswer:()=>$('#answer')?.focus(),getStored:()=>state.answers[ex.id]?.ai,onSave:record=>{if(state.answers[ex.id]?.text.trim()===record.answer){state.answers[ex.id].ai=record;save();}}});
}
function feedback(ex,a) {
  const title=ex.kind==='number'?(a.correct?'Das stimmt.':'Schau dir den Rechenweg noch einmal an.'):'Vergleiche deinen Gedankengang.';
  return `<div class="feedback ${ex.kind==='number'&&!a.correct?'error':''}" role="status"><h4>${esc(title)}</h4><p>${esc(ex.answer)}</p>${a.hints?'<p class="self-check-note">Du hast Hinweise genutzt. Probiere später eine ähnliche Aufgabe ohne Hilfe.</p>':''}${ex.kind!=='number'?`<label for="self-check">Wie sicher fühlst du dich nach dem Vergleich?</label><select id="self-check"><option value="">Bitte wählen</option><option value="klar" ${a.self==='klar'?'selected':''}>Ich kann es erklären</option><option value="noch-ueben" ${a.self==='noch-ueben'?'selected':''}>Ich möchte es noch üben</option></select>`:''}<div class="actions"><button class="button secondary" data-action="next-exercise">Nächste Übung →</button><button class="text-button" data-action="back-learn">Erklärung ansehen</button></div></div>`;
}
function numeric(s) {
  const normalized=s.trim().replaceAll('−','-').replace(',','.');
  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*\/\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(normalized)) return NaN;
  const n=normalized.split('/').map(Number); return n.length===1?n[0]:n[1]===0?NaN:n[0]/n[1];
}
function checkPractice(event) {
  event.preventDefault();
  const input=$('#answer'),text=input.value.trim();
  if(!text) { input.setCustomValidity('Schreibe zuerst eine eigene Antwort.');input.reportValidity();return; }
  const ex=currentExercise(),a={...response(ex),text,revealed:true};
  if(ex.kind==='number') {
    const value=numeric(text);
    if(!Number.isFinite(value)) { input.setCustomValidity('Gib eine Zahl ein, zum Beispiel 3, −2 oder 0,5.');input.reportValidity();return; }
    a.correct=Math.abs(value-ex.expected)<=ex.tolerance;
  }
  state.answers[ex.id]=a;save();renderPractice();announce(ex.kind==='number'?(a.correct?'Ergebnis richtig.':'Ergebnis noch nicht richtig. Rechenweg eingeblendet.'):'Lösungsvorschlag zum Vergleichen eingeblendet.');
  $('#panel .feedback')?.scrollIntoView({block:'nearest',behavior:'auto'});
}
function recordingUI() { return `<div class="recording"><strong>Optional: dich selbst aufnehmen</strong><p>Die Aufnahme bleibt nur während dieser Ansicht verfügbar. Lade sie herunter, wenn du sie behalten möchtest.</p><button class="button secondary small" id="record-start">Aufnahme starten</button><button class="button secondary small" id="record-stop" disabled>Aufnahme stoppen</button><p id="record-status" role="status"></p><div id="record-result"></div></div>`; }
async function startRecording() {
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder) { $('#record-status').textContent='Aufnahmen sind in diesem Browser nicht verfügbar. Du kannst die Aufgabe ohne Aufnahme laut bearbeiten.';return; }
  try {
    recordingStream=await navigator.mediaDevices.getUserMedia({audio:true});
    if(!$('#record-start')) { recordingStream.getTracks().forEach(t=>t.stop());return; }
    recorder=new MediaRecorder(recordingStream);const chunks=[];
    recorder.ondataavailable=e=>{if(e.data.size) chunks.push(e.data);};
    recorder.onstop=()=>{
      recordingStream?.getTracks().forEach(t=>t.stop());
      if(!$('#record-result')) return;
      if(recordingURL) URL.revokeObjectURL(recordingURL);
      const type=recorder.mimeType||'audio/webm'; recordingURL=URL.createObjectURL(new Blob(chunks,{type}));
      const ext=type.includes('mp4')?'m4a':'webm';
      $('#record-result').innerHTML=`<audio controls src="${recordingURL}" aria-label="Deine Sprechaufnahme"></audio><a class="text-button" href="${recordingURL}" download="meine-sprechuebung.${ext}">Aufnahme herunterladen</a>`;
      $('#record-start').disabled=false;$('#record-stop').disabled=true;$('#record-status').textContent='Aufnahme beendet. Du kannst sie anhören und selbst prüfen.';
    };
    recorder.start();$('#record-start').disabled=true;$('#record-stop').disabled=false;$('#record-status').textContent='Aufnahme läuft. Deine Stimme wird nicht hochgeladen.';
  } catch { $('#record-status').textContent='Kein Mikrofonzugriff. Du kannst die Aufgabe auch ohne Aufnahme bearbeiten.'; }
}
function renderExam(){Schultraining.mount({root:$('#panel'),state:()=>state,context,pack,md,materials,save});}
function info(kind='help') {
  $('#info-title').textContent=kind==='about'?'Über diese Testseite':'So funktioniert das Lernatelier';
  $('#info-content').innerHTML=kind==='about'?`<p>Dies ist eine eigenständige Testseite von Daniel Zahnweh. Sie ist von myAbiFlow technisch getrennt und nutzt einen eigenen KI-Bewertungsdienst ohne Zugriff auf myAbiFlow-Konten oder Lernergebnisse.</p><p>Interaktiv verfügbar: drei Klasse-8-Pakete. Klassen 9 bis 11 und Englisch 8 als zweite Fremdsprache zeigen den geplanten Ausbau. Die Inhalte sind Referenzentwürfe zur Erprobung, keine amtlichen Prüfungen.</p><p>Entwürfe, Eigenkontrollen und erhaltene KI-Rückmeldungen werden in deinem Browser gespeichert. Wenn du eine KI-Bewertung anforderst, werden deine Antwort, Aufgabenstellung und Bewertungsraster an den separaten Bewertungsdienst und OpenAI übermittelt. Der Dienst speichert keine Antworttexte dauerhaft; für die Wiederholung derselben Anfrage können sie vorübergehend bis zu einer Stunde im Arbeitsspeicher vorliegen. OpenAI verarbeitet die Anfrage nach seinen API-Datenschutzbedingungen. Bitte keine Namen oder persönlichen Angaben eingeben. Die Punkte sind KI-Einschätzungen und keine offiziellen Schulnoten. Bei der Aufgabenerstellung werden die gewählte Konfiguration und gegebenenfalls die eingegebene eigene Aufgabe an OpenAI gesendet. Eingelesene Textdateien kannst du vorher prüfen. Mikrofonaufnahmen werden nicht hochgeladen und verschwinden beim Verlassen der Aufnahmeansicht, wenn du sie nicht herunterlädst. Es gibt keine Analyse- oder Werbedienste.</p><p>GitHub Pages stellt die Website bereit und verarbeitet dabei technisch notwendige Zugriffsdaten. <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener">Datenschutzhinweise von GitHub</a>.</p><p>Kontakt: <a href="mailto:info@myabiflow.de">info@myabiflow.de</a>. <a href="https://myabiflow.de/impressum.html" target="_blank" rel="noopener">Angaben zum Anbieter</a>.</p>`:`<p>Wähle links deinen Jahrgang und ein Fach. In Klasse 8 kannst du drei ausgearbeitete Themen ausprobieren.</p><ol><li><strong>Stoff lernen:</strong> kurze Erklärungen, Beispiele und Verständnisfragen.</li><li><strong>Unterricht üben:</strong> einzelne Aufgaben, gestufte Hinweise und Lösungen zum Vergleichen.</li><li><strong>Schulaufgabe:</strong> KI-generierte Aufgaben oder eigene Aufgaben konfigurieren, ansehen, abgeben und mit KI auswerten. Zwei feste Beispielsätze je Fach bleiben verfügbar.</li></ol><p>Kurze Zahlenergebnisse werden automatisch geprüft. Freie Antworten und Schulaufgaben kannst du mit KI bewerten lassen: Punkte je Kriterium, Stärken, Fehler und nächste Schritte. Du kannst zusätzlich selbst mit Lösungsvorschlägen vergleichen. Eine KI-Einschätzung ist keine offizielle Schulnote.</p><p>Dein Lernstand bleibt in diesem Browser. Lade ihn zum Sichern herunter. Gib bitte keine Namen oder anderen persönlichen Angaben in deine Antworten ein.</p>`;
  $('#info-dialog').showModal();
}
document.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.dataset.subject) { state.subject=b.dataset.subject;save();render();focusHeading(); }
  if(b.dataset.mode) setMode(b.dataset.mode);
  if(b.dataset.exercise!==undefined) {state.exercise[context()]=Number(b.dataset.exercise);save();renderPractice();}
  const action=b.dataset.action;
  if(action==='demo'){state.grade=8;state.variant='E1';save();render();focusHeading();}
  if(action==='lesson-prev'||action==='lesson-next') {
    const i=keyIndex(context(),pack().lessons.length,state.lesson);
    if(action==='lesson-next'&&i===pack().lessons.length-1) setMode('ueben');
    else {state.lesson[context()]=i+(action==='lesson-next'?1:-1);save();renderLearn();}
  }
  if(action==='hint'){const ex=currentExercise(),a=response(ex);state.answers[ex.id]={...a,hints:Math.min((a.hints||0)+1,ex.hints.length)};save();renderPractice();announce('Hinweis eingeblendet.');}
  if(action==='next-exercise'){const entries=practiceEntries(),i=entries.findIndex(e=>e.task.id===currentExercise()?.id);state.exercise[context()]=entries[(i+1)%entries.length]?.index||0;save();renderPractice();}
  if(action==='math-filter-reset'){state.mathFilters[context()]={level:'all',topic:'all',competency:'all'};save();renderPractice();$('#math-topic')?.focus();announce('Alle Matheaufgaben werden angezeigt.');}
  if(action==='back-learn'||action==='pause-exam') setMode('lernen');
  if(action==='print') window.print();
  if(b.id==='record-start')startRecording();if(b.id==='record-stop')stopRecording();
  if(b.id==='help-open')info();if(b.id==='about-open')info('about');
  if(b.hasAttribute('data-close'))b.closest('dialog').close();
  if(b.id==='reset-open')$('#reset-dialog').showModal();
  if(b.id==='reset-confirm'){stopRecording();state=fresh();save();$('#reset-dialog').close();render();announce('Lernstand zurückgesetzt.');}
  if(b.id==='export'){
    const blob=new Blob([JSON.stringify({application:'Lernatelier Test',exported_at:new Date().toISOString(),learning_state:state},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='lernatelier-lernstand.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Dein Lernstand wird heruntergeladen.');
  }
});
document.addEventListener('change',event=>{
  const el=event.target;
  if(el.dataset.mathFilter){mathFilter()[el.dataset.mathFilter]=el.value;renderPractice();save();document.querySelector(`[data-math-filter="${el.dataset.mathFilter}"]`)?.focus();announce(`${practiceEntries().length} passende Aufgaben.`);}
  if(el.id==='grade'){state.grade=Number(el.value);save();render();focusHeading();}
  if(el.id==='variant'){state.variant=el.value;save();render();focusHeading();}
  if(el.id==='self-check'){const ex=currentExercise();state.answers[ex.id]={...response(ex),self:el.value};save();}
});
document.addEventListener('input',event=>{
  const el=event.target;
  if(el.id==='slope'||el.id==='intercept')updateGraph();
  if(el.id==='answer'){el.setCustomValidity('');const ex=currentExercise();state.answers[ex.id]={...response(ex),text:el.value};save();const result=$('#ai-exercise .ai-result');if(result)result.innerHTML='<p class="self-check-note">Deine Antwort wurde verändert. Fordere eine neue KI-Bewertung an.</p>';}
});
document.addEventListener('submit',event=>{
  if(event.target.id==='practice-form')checkPractice(event);
});
document.querySelector('.mode-tabs').addEventListener('keydown',event=>{
  const buttons=[...document.querySelectorAll('[data-mode]')],i=buttons.indexOf(document.activeElement);if(i<0)return;
  let next;if(event.key==='ArrowRight')next=(i+1)%3;if(event.key==='ArrowLeft')next=(i+2)%3;if(event.key==='Home')next=0;if(event.key==='End')next=2;
  if(next!==undefined){event.preventDefault();setMode(buttons[next].dataset.mode);buttons[next].focus();}
});
window.addEventListener('beforeunload',stopRecording);
async function init(){
  $('#panel').innerHTML='<div class="loading" role="status">Dein Lernbereich wird geladen …</div>';
  try {
    [packs,catalog]=await Promise.all(['content/packages.json','content/catalog.json'].map(async path=>{const r=await fetch(path);if(!r.ok)throw new Error('load');return r.json();}));
    render();
  } catch {$('#panel').innerHTML='<div class="error-banner" role="alert"><h2>Die Inhalte konnten nicht geladen werden.</h2><p>Prüfe deine Verbindung und lade die Seite erneut. Bereits gespeicherte Antworten bleiben erhalten.</p><button class="button" id="retry">Erneut laden</button></div>';$('#retry').addEventListener('click',()=>location.reload());}
}
init();
