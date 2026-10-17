import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
const math=JSON.parse(readFileSync(new URL('../site/content/packages.json',import.meta.url),'utf8')).mathematik;
export function preparePracticeGeneration(body){
 if(!body||body.subject!=='mathematik'||body.grade!==8)throw new Error('Neue Übungsvarianten gibt es aktuell für Mathematik, Klasse 8.');
 const template=math.exercises.find(e=>e.id===body.templateId);
 if(!template)throw new Error('Wähle eine verfügbare Matheaufgabe als Vorlage.');
 const avoid=Array.isArray(body.avoid)?body.avoid.slice(-3):[];
 if(avoid.some(text=>typeof text!=='string'||text.length>10000))throw new Error('Der Variantenverlauf ist zu umfangreich.');
 return {mode:'practice',subject:'mathematik',grade:8,variant:'E1',source:'generate',count:1,points:6,minutes:10,context:'',ownTask:'',topics:[math.practiceStructure.topics[template.topic]],level:math.practiceStructure.levels[template.level],competencies:template.competencies.map(k=>math.practiceStructure.competencies[k]),template:{id:template.id,title:template.title,prompt:template.prompt,reference:template.answer},avoid,requestId:typeof body.requestId==='string'?body.requestId.slice(0,80):randomUUID()};
}
