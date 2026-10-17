# Lernatelier für Klasse 8 bis 11

Eigenständige Testwebsite für Gymnasium Bayern G9. Dieses Repository ist unabhängig von myAbiFlow. Es enthält keine Zugangsdaten, Konten oder API-Anbindung an das Produktivsystem.

Liveadresse: https://danizahnweh-oss.github.io/lernatelier-8-11-test/

## Benutzbare Inhalte

- Mathematik 8: lineare Funktionen mit fünf Lernschritten, interaktivem Graphen und acht Übungen.
- Deutsch 8: lineares Argumentieren mit vier Lernschritten und sechs Übungen.
- Englisch 8 E1: London mit fünf Lernschritten, sechs Fertigkeitsübungen, eigenen Lesetexten und zwei künstlich gesprochenen britischen Hörtexten.
- Zwei Schulaufgaben-Übungssätze je Fach, wahlweise mit oder ohne Zeitvorgabe, mit Entwurfsspeicherung, KI-Bewertung und zusätzlicher Eigenkontrolle.
- Themenvorschau mit 80 geplanten Themenblöcken für die Klassen 8 bis 11; Englisch E1/E2 wird berücksichtigt.

Die Inhalte sind Referenzentwürfe zur Erprobung. Sie sind keine amtlichen Prüfungen und noch nicht von Fachlehrkräften freigegeben. Kurze Zahlenergebnisse werden automatisch geprüft. Freie Texte, Rechenwege und Schulaufgabensätze erhalten eine echte KI-Bewertung über OpenAI: serverseitig vorgegebene Aufgaben und Kriterien, Punkte je Kriterium, Stärken, Fehlererklärungen und nächste Schritte. Die KI-Einschätzung ist keine offizielle Schulnote. Eine zusätzliche Eigenkontrolle bleibt möglich. Ein Zeitlimit löscht keine Antworten und erzwingt keine Abgabe.

## Speicherung und Daten

Entwürfe, Selbsteinschätzungen und KI-Rückmeldungen liegen im lokalen Browser unter einem eigenen Schlüssel. Nach ausdrücklicher Bestätigung auf der Seite werden Antwort, Aufgabe und Bewertungsraster zur KI-Bewertung an den separaten Serverdienst und OpenAI gesendet. Der OpenAI-Schlüssel liegt ausschließlich serverseitig. Die Responses API wird mit `store: false` aufgerufen; das ist keine Zusicherung einer bestimmten Aufbewahrungsfrist beim Anbieter. Der eigene Dienst speichert keine Schülerantworten auf Festplatte, hält Rückmeldungen für identische Wiederholungsanfragen bis zu einer Stunde im Arbeitsspeicher vor und führt nur Tageskontingente mit täglich wechselnden gehashten IP-Kennungen. Voreinstellung: insgesamt 100 Bewertungen am Tag, maximal 30 je IP und drei gleichzeitig. JSON-Export dient der Sicherung; ein Import ist derzeit nicht vorgesehen. Keine Analytics, externen Schriftaufrufe oder Aufrufe der myAbiFlow-API. Sprechaufnahmen sind optional, werden nicht hochgeladen und bleiben nur während der aktuellen Aufnahmeansicht verfügbar. Sie können heruntergeladen werden. Auslieferung über GitHub Pages verursacht dort technisch notwendige Zugriffsdaten.

## Lokal öffnen und prüfen

`site/` mit einem beliebigen statischen Webserver bereitstellen, zum Beispiel `python3 -m http.server 4173 --directory site`. Keine Installation oder Build-Schritte für die Website nötig.

Für die Browserprüfungen: `npm ci`, bei Bedarf `npx playwright install chromium`, danach `npm test`. `npm run test:grading` prüft die serverseitigen Bewertungsregeln ohne echte API-Aufrufe. `TEST_BASE_URL` kann eine bereits laufende lokale Instanz oder die veröffentlichte Adresse setzen. Screenshot- und Prüfdateien landen in `test-results/` und werden nicht veröffentlicht.

## Veröffentlichung

Eigenes GitHub-Repository mit GitHub Pages über `.github/workflows/pages.yml`. Nur `site/` wird ausgeliefert. Relative Assetpfade unterstützen einen eigenen Unterpfad. `robots.txt` und Meta-Tag bitten Suchmaschinen, die Testseite nicht zu indexieren; das ist kein Zugriffsschutz.

Die gewünschte Adresse daniel-zahnweh.de ist bereits einer bestehenden Homepage zugeordnet. Dieses Projekt verändert deren DNS, Inhalte und Hosting nicht. Es wird zunächst auf einer separaten GitHub-Pages-Adresse veröffentlicht. Ein späterer eigener Unterpfad oder eine Subdomain kann gezielt eingerichtet werden.

## Quellen und Bibliotheken

Lehrplanquellen stehen an den Inhalten. Die Materialien sind eigene fiktive Unterrichtstexte. Die Audiofassungen H1/H2 wurden lokal mit der britischen macOS-Stimme Daniel bei 145 Wörtern pro Minute synthetisiert. Es handelt sich nicht um authentische Aufnahmen von Personen vor Ort.

DM Sans: Copyright The DM Sans Project Authors, SIL Open Font License 1.1, siehe `site/assets/OFL.txt`. Marked 9.1.6: MIT, siehe `site/assets/marked.LICENSE`. DOMPurify 3.2.4: Apache 2.0 oder MPL 2.0, siehe `site/assets/DOMPurify.LICENSE`. Die Bibliotheken werden lokal ausgeliefert; Eingaben werden als Text behandelt, Markdown-Inhalte zusätzlich bereinigt.

## Separater KI-Dienst

`server/server.mjs` ist ein eigener Node-22-Dienst. `deploy/setup-server.sh` beschreibt die isolierte Einrichtung unter `/opt/lernatelier-test`, mit eigener systemd-Unit, eigener Konfiguration und eigenem Nginx-Virtualhost. Die vorhandene myAbiFlow-Anwendung wird nicht verändert. Für diesen Test wird der vorhandene OpenAI-Zugang nur serverseitig in die eigene Konfiguration übernommen; es werden keine myAbiFlow-Konten oder Lerndaten verwendet. Das Anbietermodell steht in `OPENAI_MODEL` (initial `gpt-5-mini`). Öffentliche API-Adresse in `site/api-config.json`.

Offizielle Implementierungsreferenzen: [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses), [Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses) und [Modellbeschreibung](https://developers.openai.com/api/docs/models/gpt-5-mini). Schülerdaten werden nur nach der im Chat erteilten Freigabe an OpenAI übermittelt.
