import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {profiles,getTopics} from '../server/curriculum.mjs';
import {preparePracticeGeneration} from '../server/practice.mjs';
import {prepareGeneration,validateGenerated} from '../server/training.mjs';
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const catalog=read('../site/content/catalog.json'),reference=read('../site/content/curriculum-reference.json');
for(const p of profiles)test(`Lehrplanbibliothek und Generator verwenden alle gültigen Teilthemen: ${p.id}`,()=>{
 const selection={subject:p.subject,grade:p.grade,variant:p.variant==='E2'?'E2':'E1'},topics=getTopics(selection),lessons=topics.filter(t=>t.kind==='lesson');
 assert.ok(lessons.length>=10);
 const covered=new Set();
 for(const t of topics){
  assert.ok(t.source_targets[p.id]?.length,`${t.id}: Quellenzuordnung fehlt`);
  t.source_targets[p.id].forEach(id=>covered.add(id));
  const practice=preparePracticeGeneration({...selection,topicId:t.id});
  assert.equal(practice.curriculumScope.profileId,p.id);
  assert.equal(practice.curriculumScope.topics[0].id,t.id);
  assert.equal(practice.learningGoal,t.competency_goal);
  assert.ok(practice.curriculumScope.targets.length);
  assert.ok(practice.curriculumScope.targets.every(target=>reference[p.id].sections.some(s=>s.code===target.code&&s.content===target.content)));
  const exam=prepareGeneration({...selection,topics:[t.id],count:1,points:20,minutes:45,context:''});
  assert.deepEqual(exam.curriculumScope.topics.map(t=>t.id),[t.id]);
  if(t.kind==='lesson')for(const field of ['explanation','example','question','answer'])assert.ok(t.lesson[field].trim().length>5,`${t.id}: ${field}`);
 }
 assert.deepEqual([...covered].sort(),reference[p.id].sections.map(s=>s.id).sort());
 // Every specific subtopic from a different subject/year/profile is rejected.
 const foreign=catalog.groups.flatMap(g=>g.topics).find(t=>t.kind==='lesson'&&!topics.some(own=>own.id===t.id));
 assert.throws(()=>preparePracticeGeneration({...selection,topicId:foreign.id}));
});
test('Gezielte Inhalte und Sprachfolgen sind getrennt statt nur als Überblick verfügbar',()=>{
 const scopes=s=>getTopics(s).filter(t=>t.kind==='lesson').map(t=>t.title).join('\n');
 assert.match(scopes({subject:'mathematik',grade:8}),/Ungleichungen/);
 assert.match(scopes({subject:'mathematik',grade:9}),/Kosinussatz/);
 assert.match(scopes({subject:'mathematik',grade:11}),/Newton/);
 assert.match(scopes({subject:'deutsch',grade:8}),/Szenisches/);
 assert.match(scopes({subject:'deutsch',grade:11}),/Barock/);
 const e1=scopes({subject:'englisch',grade:8,variant:'E1'}),e2=scopes({subject:'englisch',grade:8,variant:'E2'});
 assert.match(e1,/London/);assert.doesNotMatch(e2,/London/);assert.match(e2,/Conditionals II/);assert.doesNotMatch(e1,/Conditionals II/);assert.match(e2,/Wales/);
 assert.ok(getTopics({subject:'deutsch',grade:8}).filter(t=>t.curriculum_sections.includes('D8 5')).every(t=>t.optional_profile==='MuG'));
});
test('Mathe-10-Methodengrenze gilt auch bei Auswahl eines neuen Wachstumsteilthemas',()=>{
 const topic=getTopics({subject:'mathematik',grade:10}).find(t=>t.parent_id==='mathematik-10-01');
 const config=preparePracticeGeneration({subject:'mathematik',grade:10,topicId:topic.id});
 assert.throws(()=>validateGenerated({title:'Vergleich',materials:[],tasks:[{instruction:'Bestimme rechnerisch, ab welcher Zeit die exponentielle Zahl die lineare Zahl übersteigt.',solution:'Iteration.'}]},config),/ungeeignetes rechnerisches Verfahren/);
});
