# Lernatelier für Klasse 8 bis 11

Eigenständige Testwebsite für Gymnasium Bayern G9. Dieses Repository ist unabhängig von myAbiFlow. Es enthält keine Zugangsdaten, Konten oder API-Anbindung an das Produktivsystem.

Liveadresse: https://danizahnweh-oss.github.io/lernatelier-8-11-test/

## Benutzbare Inhalte

- Mathematik 8: lineare Funktionen mit fünf Lernschritten, interaktivem Graphen und zwölf Übungen.
- Deutsch 8: lineares Argumentieren mit vier Lernschritten und sechs Übungen.
- Englisch 8 E1: London mit fünf Lernschritten, sechs Fertigkeitsübungen, eigenen Lesetexten und zwei künstlich gesprochenen britischen Hörtexten.
- Bei Erstellungs- oder Prüfungsfehlern werden KI-Aufgaben automatisch bis zu dreimal neu generiert. Einstellungen bleiben erhalten; Eingabefehler und Tageslimits werden ohne Wiederholung angezeigt.
- Schulaufgabentraining im myAbiFlow-Ablauf: Aufgabe wählen, Aufgabe ansehen, Lösung abgeben, KI-Feedback.
- KI-generierte Aufgaben mit verbindlicher Themenauswahl, Aufgabenanzahl, Zeit und Punkten; unabhängige zweite Aufgabenprüfung vor der Ausgabe. Eigene Aufgaben können als Text eingegeben oder aus .txt/.md eingelesen werden. Zwei feste Beispielsätze je Fach bleiben in den vorhandenen Klasse-8-Paketen verfügbar.
- Start- und pausierbarer Timer, Entwurfsspeicherung, Textdatei-Import für Antworten, Wortzählung und Ausdruck. Bilder/PDF sind in dieser Testfassung noch nicht als Upload implementiert.
- myAbiFlow-Farben mit Indigo-Akzent, hellen Flächen und dunklen Textfarben.
- Lehrplanbibliothek für alle zugeordneten Bereiche in Mathe, Deutsch und Englisch 8–11: 87 Themenfelder und 261 Kurzlektionen mit Erklärungen, Beispielen, Verständnisfragen und Lösungen. Suche und lokale Verständnis-Markierungen erleichtern das Wiederholen. Alle 157 Abschnitte der 14 bereitgestellten PDFs sind zugeordnet; siehe [Lehrplanabdeckung](CURRICULUM.md).
- Jeder Themenblock und jedes Teilthema ist in Übungs- und Schulaufgabengenerierung auswählbar. Der Server ordnet die Original-Lehrplanziele zu. Englisch 8/9 trennt E1/E2. MuG ist als Zusatz gekennzeichnet. Mündliche und praktische Kompetenzen können schriftlich vorbereitet werden; eine tatsächliche Hör-, Sprech- oder Aufführungsprüfung braucht entsprechendes Material.

Die Inhalte sind Referenzentwürfe zur Erprobung. Sie sind keine amtlichen Prüfungen und noch nicht von Fachlehrkräften freigegeben. Kurze Zahlenergebnisse werden automatisch geprüft. Freie Texte, Rechenwege und Schulaufgabensätze erhalten eine echte KI-Bewertung über OpenAI: serverseitig vorgegebene Aufgaben und Kriterien, Punkte je Kriterium, Stärken, Fehlererklärungen und nächste Schritte. Die KI-Einschätzung ist keine offizielle Schulnote. Eine zusätzliche Eigenkontrolle bleibt möglich. Ein Zeitlimit löscht keine Antworten und erzwingt keine Abgabe.

## Speicherung und Daten

Entwürfe, Selbsteinschätzungen und KI-Rückmeldungen liegen im lokalen Browser unter einem eigenen Schlüssel. Mit dem Klick auf die KI-Bewertung werden Antwort, Aufgabe und Bewertungsraster zur KI-Bewertung an den separaten Serverdienst und OpenAI gesendet. Der OpenAI-Schlüssel liegt ausschließlich serverseitig. Die Responses API wird mit `store: false` aufgerufen; das ist keine Zusicherung einer bestimmten Aufbewahrungsfrist beim Anbieter. Der eigene Dienst speichert keine Schülerantworten auf Festplatte, hält Rückmeldungen für identische Wiederholungsanfragen bis zu einer Stunde im Arbeitsspeicher vor und führt nur Tageskontingente mit täglich wechselnden gehashten IP-Kennungen. Voreinstellung: insgesamt 100 Bewertungen am Tag, maximal 30 je IP und drei gleichzeitig. JSON-Export dient der Sicherung; ein Import ist derzeit nicht vorgesehen. Keine Analytics, externen Schriftaufrufe oder Aufrufe der myAbiFlow-API. Sprechaufnahmen sind optional, werden nicht hochgeladen und bleiben nur während der aktuellen Aufnahmeansicht verfügbar. Sie können heruntergeladen werden. Auslieferung über GitHub Pages verursacht dort technisch notwendige Zugriffsdaten.

## Lokal öffnen und prüfen

`site/` mit einem beliebigen statischen Webserver bereitstellen, zum Beispiel `python3 -m http.server 4173 --directory site`. Keine Installation oder Build-Schritte für die Website nötig.

Für die Browserprüfungen: `npm ci`, bei Bedarf `npx playwright install chromium`, danach `npm test`. `npm run test:curriculum` prüft alle Themenauswahlen, Quellenzuordnungen und Sprachfolgegrenzen. `npm run test:grading` prüft die serverseitigen Bewertungsregeln ohne echte API-Aufrufe. `TEST_BASE_URL` kann eine bereits laufende lokale Instanz oder die veröffentlichte Adresse setzen. Screenshot- und Prüfdateien landen in `test-results/` und werden nicht veröffentlicht.

## Veröffentlichung

Eigenes GitHub-Repository mit GitHub Pages über `.github/workflows/pages.yml`. Nur `site/` wird ausgeliefert. Die geänderten Frontend-Dateien tragen eine Versionskennung in den Asset-URLs, damit bereits geöffnete Browser nach dem Neuladen die aktuelle Oberfläche verwenden. Bei weiteren Änderungen diese Kennung aktualisieren. Relative Assetpfade unterstützen einen eigenen Unterpfad. `robots.txt` und Meta-Tag bitten Suchmaschinen, die Testseite nicht zu indexieren; das ist kein Zugriffsschutz.

Die gewünschte Adresse daniel-zahnweh.de ist bereits einer bestehenden Homepage zugeordnet. Dieses Projekt verändert deren DNS, Inhalte und Hosting nicht. Es wird zunächst auf einer separaten GitHub-Pages-Adresse veröffentlicht. Ein späterer eigener Unterpfad oder eine Subdomain kann gezielt eingerichtet werden.

## Quellen und Bibliotheken

Lehrplanquellen stehen an den Inhalten. Die Materialien sind eigene fiktive Unterrichtstexte. Die Audiofassungen H1/H2 wurden lokal mit der britischen macOS-Stimme Daniel bei 145 Wörtern pro Minute synthetisiert. Es handelt sich nicht um authentische Aufnahmen von Personen vor Ort.

DM Sans: Copyright The DM Sans Project Authors, SIL Open Font License 1.1, siehe `site/assets/OFL.txt`. Marked 9.1.6: MIT, siehe `site/assets/marked.LICENSE`. DOMPurify 3.2.4: Apache 2.0 oder MPL 2.0, siehe `site/assets/DOMPurify.LICENSE`. Die Bibliotheken werden lokal ausgeliefert; Eingaben werden als Text behandelt, Markdown-Inhalte zusätzlich bereinigt.

## Separater KI-Dienst

`server/server.mjs` ist ein eigener Node-22-Dienst. `deploy/setup-server.sh` beschreibt die isolierte Einrichtung unter `/opt/lernatelier-test`, mit eigener systemd-Unit, eigener Konfiguration und eigenem Nginx-Virtualhost. Die vorhandene myAbiFlow-Anwendung wird nicht verändert. Für diesen Test wird der vorhandene OpenAI-Zugang nur serverseitig in die eigene Konfiguration übernommen; es werden keine myAbiFlow-Konten oder Lerndaten verwendet. Das Anbietermodell steht in `OPENAI_MODEL` (initial `gpt-5-mini`). Öffentliche API-Adresse in `site/api-config.json`.

Offizielle Implementierungsreferenzen: [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses), [Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses) und [Modellbeschreibung](https://developers.openai.com/api/docs/models/gpt-5-mini). Schülerdaten werden nur nach der im Chat erteilten Freigabe an OpenAI übermittelt.

Generierte Aufgaben samt Erwartungshorizont und Raster werden in einem verschlüsselten und authentifizierten Aufgaben-Token mit sieben Tagen Laufzeit gehalten. Der Browser sendet zur Bewertung das Token; der Server prüft es und verwendet ausschließlich den darin bestätigten Auftrag und dessen Kriterien. Die Lösung wird nicht vor der Abgabe angezeigt. Im eigenen Aufgabentext enthaltene Anweisungen dürfen die Systemregeln nicht ersetzen. Eine neue Aufgabe sichert die bisherige Bearbeitung im lokalen Verlauf (maximal zehn je Fachkontext); der JSON-Export enthält den Verlauf.

## SMART als Orientierung für Mathematik

Die Mathe-Übungsauswahl orientiert sich an der Gliederung der [SMART-Aufgabensammlung der Universität Bayreuth](https://smart.uni-bayreuth.de/data/gym/Mathematik/j08/j08.html): Thema, Grundwissen, Kernaufgaben und Vertiefung sowie mathematische Kompetenzen. Die konkrete Kompetenzzuordnung dient hier als vereinfachte Orientierung für Lernende. Die zwölf Aufgaben zu linearen Funktionen sind eigene Formulierungen; SMART-Aufgaben und Abbildungen wurden nicht übernommen. Vertiefung bedeutet in diesem Paket anspruchsvollere Verknüpfungen innerhalb des aktuellen Themas, keine zusätzlichen Inhalte späterer Jahrgänge.

Vier neue Aufgaben trainieren Tarifvergleiche, Gegenbeispiele zur Eindeutigkeit einer Geraden, den Abgleich von Tabelle/Beschreibung/Term und die Grenzen eines linearen Modells. Filter sind kombinierbar, bleiben beim Neuladen erhalten und gelten auch für „Nächste Übung“. Nicht passende Kombinationen zeigen einen Hinweis mit Rückweg zu allen Aufgaben. Freie Antworten bleiben mit KI bewertbar.

## Wiederholbar neue Übungsvarianten

Bei jeder der zwölf Matheaufgaben in Klasse 8 öffnet „Ähnliche Aufgabe mit KI“ die Variante-Erstellung. Die Vorlage wird vom Server ausgewählt, einschließlich Lernziel, Aufgabengruppe und Kompetenz. Jede neue Anfrage hat eine eigene Kennung und berücksichtigt die letzten drei Aufgaben, um Wiederholungen zu vermeiden. Eine unabhängige KI-Prüfung kontrolliert die erstellte Variante. Bei vorübergehenden Fehlern gibt es bis zu drei Versuche; Eingabefehler und Kontingente werden direkt gemeldet.

Aufgaben und Erwartungshorizonte werden verschlüsselt für die Bewertung übergeben. Die Übungsvarianten haben 6 BE mit fachbezogenen Kriterien: Mathe 4/2 für Inhalt und Lösungsweg; Deutsch 3/1/1/1 für Inhalt, Aufbau, Ausdruck und Richtigkeit; Englisch je nach Reading, Writing, Mediation oder Sprachaufgabe mit passender Inhalts- und Sprachgewichtung. Vor der Bewertung wird der Erwartungshorizont nicht an die Oberfläche ausgegeben; danach kann er zur Eigenkontrolle geöffnet werden. Bis zu zehn frühere Varianten samt Antwort und KI-Rückmeldung bleiben im Browser. Eine fehlgeschlagene Generierung ersetzt keine vorhandene Bearbeitung.

Die [14 ausführlichen Erstellungsprompts](PROMPTS.md) decken Mathe, Deutsch und Englisch in Klasse 8–11 ab, mit getrennten Englisch-Profilen E1/E2 in Klasse 8/9. Sie verwenden die bereitgestellten Lehrpläne und werden serverseitig auch für die unabhängige Prüfung eingesetzt. Alle 14 Profile werden für Erstellung, unabhängige Aufgabenprüfung und KI-Bewertung verwendet. Zusätzliche Lerntexte sind hiervon getrennt und werden ergänzt.

Die allgemeinen Übungsgeneratoren bieten Thema, Anspruch (Grundwissen/Kernaufgabe/Vertiefung) und Aufgabentyp. Aufgaben, Antworten und Verlauf sind nach Fach, Jahrgang und Sprachfolge getrennt; Englisch 10/11 teilt denselben Verlauf unabhängig von der zuvor gewählten Sprachfolge. Die feste Klasse-8-Themeneinschränkung gilt nur noch für die zugehörigen alten Referenzvorlagen. Differenzieren in Mathe 11 und jahrgangsgemäße Textsorten in Deutsch sowie die tatsächlichen Englisch-Themen sind damit möglich. Neue Generatoren erstellen schriftlich prüfbare Aufgaben mit vollständig mitgelieferten Materialien.

Die redaktionellen Lerneinheiten liegen in `curriculum/*.txt`. `python3 scripts/build-curriculum.py` erstellt Themenkatalog, Quellenzuordnung und Abdeckungsbericht reproduzierbar. Die vollständigen Lehrplanziele bleiben als aus den PDFs abgeleitete Referenztexte erhalten.
