import {readFileSync} from 'node:fs';
const root=new URL('./prompts/',import.meta.url);
export const profiles=JSON.parse(readFileSync(new URL('index.json',root),'utf8'));
const texts=new Map(profiles.map(p=>[p.id,readFileSync(new URL(p.file,root),'utf8')]));
export function getCreationPrompt({subject,grade,variant='E1'}){
 const key=`${subject}-${grade}${subject==='englisch'&&grade<10?'-'+variant.toLowerCase():''}`;
 const prompt=texts.get(key);if(!prompt)throw new Error('Für diese Fach- und Jahrgangsauswahl fehlt ein geprüftes Lehrplanprofil.');return prompt+String.raw`

## Verbindliche Darstellung in allen Ausgabefeldern
- Tabellen immer als vollständige Markdown-Tabelle mit eigener Kopfzeile, Trennzeile (| --- | --- |) und separaten Datenzeilen ausgeben. Überschrift und Tabelle durch eine Leerzeile trennen. Keine Tabellenzeilen innerhalb einer Überschrift und keine bloß mit | getrennten Textzeilen.
- Tatsächliche Unicode-Zeichen schreiben (z. B. ½, −, ×), niemals wörtliche Unicode-Escapesequenzen. Einfache Terme dürfen Klartext sein. Für Brüche, Wurzeln, Potenzen und komplexe Formeln LaTeX mit $...$ im Fließtext oder $$...$$ als eigene Formel verwenden, z. B. $g(x)=-\frac{1}{2}x+2$. Im JSON Backslashes korrekt maskieren.
- Materialtitel nur als Titel, den Inhalt ausschließlich in text ausgeben. Überschriften im Materialtext höchstens Ebene 4. Dieselben Formatregeln gelten für Aufgaben, Musterlösungen und die unabhängige Nachprüfung.
`;
}
const catalog=JSON.parse(readFileSync(new URL('../site/content/catalog.json',import.meta.url),'utf8'));
export function selection(body){
 if(!body||!['mathematik','deutsch','englisch'].includes(body.subject)||![8,9,10,11].includes(body.grade))throw new Error('Bitte wähle ein verfügbares Fach und einen Jahrgang von 8 bis 11.');
 if(body.subject==='englisch'&&body.grade<10&&!['E1','E2'].includes(body.variant))throw new Error('Bitte wähle Englisch als erste oder zweite Fremdsprache.');
 const result={subject:body.subject,grade:body.grade,variant:body.subject==='englisch'&&body.grade<10?body.variant:'E1'};
 getCreationPrompt(result);return result;
}
export function getTopics(body){const s=selection(body);return catalog.groups.find(g=>g.subject===s.subject&&g.grade===s.grade).topics.filter(t=>t.variant==='gemeinsam'||t.variant.includes(s.variant));}
export const LEVELS={grundwissen:'Grundwissen',kern:'Kernaufgaben',vertiefung:'Vertiefung'};
export const FOCUSES={mathematik:{passend:'Passend zum Thema',rechnen:'Rechnen und Lösungsweg',begruenden:'Begründen und Prüfen',anwendung:'Modellieren und Anwenden'},deutsch:{passend:'Passend zum Thema',textarbeit:'Textarbeit und Deutung',schreiben:'Schreiben',ueberarbeiten:'Überarbeiten'},englisch:{reading:'Reading',writing:'Writing',mediation:'Mediation',language:'Wortschatz und Grammatik'}};
