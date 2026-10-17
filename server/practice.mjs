import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {selection,getTopics,getTopicScope,LEVELS,FOCUSES} from './curriculum.mjs';
const math=JSON.parse(readFileSync(new URL('../site/content/packages.json',import.meta.url),'utf8')).mathematik;
export function preparePracticeGeneration(body){
 const s=selection(body),all=getTopics(s);
 const avoid=Array.isArray(body.avoid)?body.avoid.slice(-3):[];
 if(avoid.some(text=>typeof text!=='string'||text.length>10000))throw new Error('Der Variantenverlauf ist zu umfangreich.');
 let template,topic,level=body.level||'kern',focus=body.focus||(s.subject==='englisch'?'reading':'passend');
 if(!Object.hasOwn(LEVELS,level)||!Object.hasOwn(FOCUSES[s.subject],focus))throw new Error('Bitte wähle einen verfügbaren Anspruch und Aufgabentyp.');
 if(body.templateId){
  if(s.subject!=='mathematik'||s.grade!==8)throw new Error('Diese Beispielvorlage passt nicht zu Fach und Jahrgang.');
  const t=math.exercises.find(e=>e.id===body.templateId);if(!t)throw new Error('Wähle eine verfügbare Matheaufgabe als Vorlage.');
  topic=all.find(t=>t.id==='mathematik-8-02');level=t.level;template={id:t.id,title:t.title,prompt:t.prompt,reference:t.answer};
 }else{
  topic=all.find(t=>t.id===body.topicId);if(!topic)throw new Error('Wähle ein Thema aus dem Lehrplan dieses Jahrgangs und dieser Sprachfolge.');
 }
 return {...s,mode:'practice',source:'generate',count:1,points:6,minutes:s.subject==='mathematik'?10:20,context:'',ownTask:'',topics:[topic.title],curriculumScope:getTopicScope(s,[topic]),topicIds:[topic.id],learningGoal:topic.competency_goal,prerequisites:topic.prerequisite_skills,level:LEVELS[level],focus:FOCUSES[s.subject][focus],focusId:focus,competencies:template?math.exercises.find(t=>t.id===template.id).competencies.map(k=>math.practiceStructure.competencies[k]):[topic.competency_goal],...(template?{template}:{}),avoid,requestId:typeof body.requestId==='string'?body.requestId.slice(0,80):randomUUID()};
}
