# Lehrplanabdeckung der Testseite

Basis: die 14 am 17.10.2026 bereitgestellten Lehrplan-PDFs. Die Originaldateien und ihre SHA-256-Prüfsummen sind im Promptmanifest dokumentiert. Die abgeleiteten Lehrplantexte dienen ausschließlich als Referenzdaten.

Alle enthaltenen Lehrplanabschnitte sind verknüpft. Die Bibliothek enthält kurze redaktionelle Einstiege, Beispiele und Selbstkontrollen, keinen Ersatz für vollständige Unterrichtsreihen, Ganzschriften oder praktische Hör-, Sprech- und Aufführungsleistungen. Der MuG-Profilbereich ist als Zusatz markiert.

| Profil | Zugeordnete Abschnitte | Kurzlektionen |
| --- | ---: | ---: |
| mathematik-8 | 7/7 | 17 |
| mathematik-9 | 9/9 | 12 |
| mathematik-10 | 5/5 | 10 |
| mathematik-11 | 5/5 | 11 |
| deutsch-8 | 15/15 | 30 |
| deutsch-9 | 15/15 | 30 |
| deutsch-10 | 15/15 | 31 |
| deutsch-11 | 14/14 | 34 |
| englisch-8-e1 | 12/12 | 20 |
| englisch-8-e2 | 12/12 | 23 |
| englisch-9-e1 | 12/12 | 20 |
| englisch-9-e2 | 12/12 | 22 |
| englisch-10 | 12/12 | 18 |
| englisch-11 | 12/12 | 20 |

## Aufbau

Die bisherigen Themen-IDs bleiben für gespeicherte Aufgaben erhalten. Unter jedem Themenblock stehen jetzt gezielte Teilthemen. Jedes Teilthema verbindet Lernen, wiederholbare Übungen und Schulaufgabentraining. Die serverseitige Konfiguration übernimmt die zugehörigen Lehrplanziele aus dem passenden Fach-, Jahrgangs- und Sprachfolgeprofil.

Quellen: `server/prompts/index.json`, `site/content/curriculum-reference.json`. Redaktionelle Ausgangsdaten: `curriculum/*.txt`. Reproduzierbar mit `python3 scripts/build-curriculum.py`.
