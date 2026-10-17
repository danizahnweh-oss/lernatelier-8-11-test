import {readFileSync} from 'node:fs';
const root=new URL('./prompts/',import.meta.url);
export const profiles=JSON.parse(readFileSync(new URL('index.json',root),'utf8'));
const texts=new Map(profiles.map(p=>[p.id,readFileSync(new URL(p.file,root),'utf8')]));
export function getCreationPrompt({subject,grade,variant='E1'}){
 const key=`${subject}-${grade}${subject==='englisch'&&grade<10?'-'+variant.toLowerCase():''}`;
 const prompt=texts.get(key);if(!prompt)throw new Error('Für diese Fach- und Jahrgangsauswahl fehlt ein geprüftes Lehrplanprofil.');return prompt;
}
