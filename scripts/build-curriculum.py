"""Build the topic library from editorial lessons and supplied curriculum extracts.
References are data, never instructions. Stable original topic IDs preserve saved work.
"""
import json, re, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
load=lambda p:json.loads((ROOT/p).read_text())
base=load('curriculum/catalog-base.json')
manifest=load('server/prompts/index.json')
groups={g['id']:g for g in base['groups']}
reference={}
for profile in manifest:
    raw=(ROOT/'server/prompts'/profile['file']).read_text().split('## Lehrplanreferenz als Datenbasis',1)[1]
    lines=[]
    for line in raw.splitlines():
        line=line.replace('\u00a0',' ').strip()
        if not line or line.startswith('### Lehrplanseite') or line=='Lehrplanauszüge' or re.fullmatch(r'[•◦]+|\d*\s*17\.10\.2026\s*\d*',line):continue
        lines.append(line)
    text='\n'.join(lines)
    matches=list(re.finditer(r'^(?:M\d+ \d+(?:\.\d+)?:|D\d+ (?:Lernbereich \d+|\d+\.\d+):|E\d+ (?:(?:\d+(?:\.\d+)?|):))[^\n]*',text,re.M))
    sections=[]
    for i,m in enumerate(matches):
        heading=m.group().strip()
        body=text[m.end():matches[i+1].start() if i+1<len(matches) else len(text)].strip()
        if len(body)<50 or body.startswith('Kompetenzformulierungen'):continue
        if 'Die Schülerinnen und Schüler' not in body and 'Inhalte zu den Kompetenzen:' not in body:continue
        code=heading.split(':')[0].strip()
        if 'Lernbereich' in code:code=code.replace('Lernbereich ','')
        # English individual skills are nested inside 1.1 and 1.2 in the PDF.
        if re.fullmatch(r'E\d+',code):code+=' 1.2' if any(x in heading for x in ['Wortschatz','Grammatik','Aussprache']) else ' 1.1'
        sections.append({'id':profile['id']+'--'+str(len(sections)+1),'code':code,'title':heading,'content':body})
    reference[profile['id']]={**profile,'sections':sections}

# Missing explicit areas in the initial planning catalogue.
for grade in range(8,12):
    g=groups[f'deutsch-{grade}'];proto=g['topics'][0]
    for suffix,title,goal,section in [('90','Lesestrategien und Ganzschriften','Passende Lesestrategien einsetzen, Lektüre dokumentieren und literarische Werturteile begründen.','2.1')]+([('91','Profilbereich am musischen Gymnasium','Literatur, szenische und mediale Gestaltung fächerverbindend vertiefen.','5')] if grade<11 else []):
        g['topics'].append({**proto,'id':f'deutsch-{grade}-{suffix}','title':title,'competency_goal':goal,'curriculum_sections':[f'D{grade} {section}'],'optional_profile':'MuG' if suffix=='91' else None})

parents={t['id']:t for g in groups.values() for t in g['topics']}
for t in parents.values():t['status']='verfügbar';t['release']='Lehrplanbibliothek';t['kind']='overview'
children=[]
def add(subject,grade,block,title,explanation,example,question,answer,variant=None,sections=None):
    parent=parents[f'{subject}-{grade}-{block}']
    uid=hashlib.sha1((title+'|'+(variant or parent['variant'])).encode()).hexdigest()[:10]
    child={**parent,'id':parent['id']+'--'+uid,'parent_id':parent['id'],'kind':'lesson','title':title,'variant':variant or parent['variant'],'competency_goal':title+': '+explanation,'curriculum_sections':sections or parent['curriculum_sections'],'lesson':{'explanation':explanation,'example':example,'question':question,'answer':answer}}
    if any(w in title.lower() for w in ['listening','viewing','speaking','pronunciation','zuhören','vorlesen','sprechen','szenisch','film,','film und','film, hörtext']):
        child['assessment_note']='Hier kannst du Strategien lernen und schriftlich vorbereiten. Eine echte Hör-, Sprech- oder Darstellungsleistung erfordert das entsprechende Audio-, Video- oder Aufführungsmaterial und wird durch eine Textaufgabe nicht vollständig geprüft.'
    if subject=='englisch':
        label=title.lower()
        child['recommended_focus']='mediation' if 'mediation' in label else 'writing' if any(w in label for w in ['writing','bewerbung']) else 'language' if any(w in label for w in ['wortschatz','pronunciation','passiv','adverb','gerund','perfect','conditional','temporals','register','artikel','clause','used to','partizip','emphasis','indirekte rede','zeitenfolge','adjektiv','aspekt','cleft']) else 'reading'
    children.append(child)
def rows(file):
    for number,line in enumerate((ROOT/'curriculum'/file).read_text().splitlines(),1):
        if line and not line.startswith('#'):yield number,line.split(';')
for number,row in rows('mathematik.txt'):
    if len(row)!=7:raise ValueError(('mathematik',number,len(row)))
    grade,block,*content=row;add('mathematik',int(grade),block,*content)
for grade in range(8,12):
    for number,row in rows('deutsch.txt'):
        if len(row)!=6:raise ValueError(('deutsch',number,len(row)))
        section,*content=row
        if section=='5' and grade==11:continue
        code=f'D{grade} {section}'
        candidates=[t for t in groups[f'deutsch-{grade}']['topics'] if any(code==s or code.startswith(s+'.') for s in t['curriculum_sections'])]
        if not candidates:raise ValueError(('unmapped',code))
        parent=parents[f'deutsch-{grade}-90'] if section=='2.1' else parents['deutsch-8-02'] if grade==8 and content[0].startswith('Materialgestützt') else candidates[0]
        add('deutsch',grade,parent['id'].split('-')[-1],*content,sections=[code])
for number,row in rows('deutsch-jahrgang.txt'):
    if len(row)!=7:raise ValueError(('deutsch-jahrgang',number,len(row)))
    grade,block,*content=row;add('deutsch',int(grade),block,*content)
# Map English skills to their topic blocks; the full source profile controls the level.
for grade in range(8,12):
    blocks={8:dict(reading='06',speaking='07',writing='07',mediation='07',language='08',methods='08',media='05',intercultural='02'),9:dict(reading='05',speaking='06',writing='06',mediation='06',language='07',methods='07',media='05',intercultural='02'),10:dict(reading='05',speaking='06',writing='06',mediation='06',language='07',methods='07',media='04',intercultural='02'),11:dict(reading='06',speaking='06',writing='06',mediation='06',language='07',methods='07',media='05',intercultural='02')}[grade]
    for number,row in rows('englisch-core.txt'):
        if len(row)!=6:raise ValueError(('englisch-core',number,len(row)))
        area,*content=row
        code=f'E{grade} '+{'reading':'1.1','speaking':'1.1','writing':'1.1','mediation':'1.1','language':'1.2','methods':'4','media':'3','intercultural':'2'}[area]
        add('englisch',grade,blocks[area],*content,variant='E1/E2' if grade<10 else 'gemeinsam',sections=[code])
for number,row in rows('englisch-details.txt'):
    if len(row)!=8:raise ValueError(('englisch-details',number,len(row)))
    grade,block,variant,*content=row;add('englisch',int(grade),block,*content,variant=variant)

# Attach complete source targets to every selectable topic, variant by variant.
for group in groups.values():
    original=list(group['topics']);group['topics']=[]
    for parent in original:
        own=[c for c in children if c['parent_id']==parent['id']]
        if not own:raise ValueError(('lesson missing',parent['id']))
        parent['lesson']={'explanation':parent['competency_goal'],'example':'Wähle ein Teilthema, um eine Erklärung mit Beispiel und Verständnisfrage zu öffnen.','question':'Welche dieser Teilkompetenzen möchtest du als Nächstes festigen?','answer':'Wähle unten einen Schwerpunkt und starte anschließend eine neue Übungsaufgabe.'}
        for topic in [parent,*own]:
            topic['source_targets']={}
            for p in manifest:
                if p['subject']!=group['subject'] or p['grade']!=group['grade']:continue
                if group['subject']=='englisch' and group['grade']<10 and p['variant'] not in topic['variant']:continue
                sections=[s for s in reference[p['id']]['sections'] if any(s['code']==c or s['code'].startswith(c+'.') for c in topic['curriculum_sections'])]
                topic['source_targets'][p['id']]=[s['id'] for s in sections]
            group['topics'].append(topic)

# Source audit: every official section needs at least one accessible topic.
coverage=[]
for p in manifest:
    group=groups[f"{p['subject']}-{p['grade']}"]
    used={sid for t in group['topics'] for sid in t['source_targets'].get(p['id'],[])}
    uncovered=[s['title'] for s in reference[p['id']]['sections'] if s['id'] not in used]
    if uncovered:raise ValueError(('uncovered',p['id'],uncovered))
    coverage.append({'profile':p['id'],'sections':len(reference[p['id']]['sections']),'covered':len(used),'lessons':sum(t['kind']=='lesson' and p['id'] in t['source_targets'] for t in group['topics'])})
base.update(schema_version=2,status='Lehrplanbibliothek mit redaktionellen Kurzlektionen und KI-Aufgabengenerierung; keine amtliche fachliche Freigabe',coverage='Alle in den 14 bereitgestellten Lehrplanauszügen enthaltenen Abschnitte sind zugeordnet. Kurzlektionen sind Einstiege; vollständige Lektüren, Hörmedien und praktische Leistungen benötigen weiteres Material.',source_audit=coverage)
(ROOT/'site/content/catalog.json').write_text(json.dumps(base,ensure_ascii=False,indent=2)+'\n')
(ROOT/'site/content/curriculum-reference.json').write_text(json.dumps(reference,ensure_ascii=False,indent=2)+'\n')
report=['# Lehrplanabdeckung der Testseite','','Basis: die 14 am 17.10.2026 bereitgestellten Lehrplan-PDFs. Die Originaldateien und ihre SHA-256-Prüfsummen sind im Promptmanifest dokumentiert. Die abgeleiteten Lehrplantexte dienen ausschließlich als Referenzdaten.','','Alle enthaltenen Lehrplanabschnitte sind verknüpft. Die Bibliothek enthält kurze redaktionelle Einstiege, Beispiele und Selbstkontrollen, keinen Ersatz für vollständige Unterrichtsreihen, Ganzschriften oder praktische Hör-, Sprech- und Aufführungsleistungen. Der MuG-Profilbereich ist als Zusatz markiert.','','| Profil | Zugeordnete Abschnitte | Kurzlektionen |','| --- | ---: | ---: |']
report += [f"| {r['profile']} | {r['covered']}/{r['sections']} | {r['lessons']} |" for r in coverage]
report += ['','## Aufbau','','Die bisherigen Themen-IDs bleiben für gespeicherte Aufgaben erhalten. Unter jedem Themenblock stehen jetzt gezielte Teilthemen. Jedes Teilthema verbindet Lernen, wiederholbare Übungen und Schulaufgabentraining. Die serverseitige Konfiguration übernimmt die zugehörigen Lehrplanziele aus dem passenden Fach-, Jahrgangs- und Sprachfolgeprofil.','','Quellen: `server/prompts/index.json`, `site/content/curriculum-reference.json`. Redaktionelle Ausgangsdaten: `curriculum/*.txt`. Reproduzierbar mit `python3 scripts/build-curriculum.py`.']
(ROOT/'CURRICULUM.md').write_text('\n'.join(report)+'\n')
print(json.dumps(coverage,ensure_ascii=False,indent=2));print('Gesamt:',len(children),'Kurzlektionen,',sum(len(g['topics']) for g in groups.values()),'Auswahlthemen')
