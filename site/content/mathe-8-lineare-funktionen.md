# Mathematik 8 Lineare Funktionen

Status: redaktioneller Referenzentwurf, fachliche Freigabe offen. Paketkennung: `mathematik-8-02`, Version 1. Gymnasium Bayern G9. Aufgaben, Zeiten und Punkte sind eigene didaktische Vorschläge.

Lehrplanbezug: [M8 Lernbereich 2](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/mathematik), ergänzt um vorausgesetzte Funktionsbegriffe aus Lernbereich 1. Das Paket übt einen abgegrenzten Ausschnitt; lineare Gleichungssysteme sind nicht erforderlich.

## Ziele und Voraussetzungen

Nach dem Paket kannst du Steigung und Achsenabschnitt erklären, Wertetabellen ergänzen, Geraden zeichnen, aus zwei Punkten eine Gleichung bestimmen und lineare Modelle in einer Alltagssituation prüfen.

Du benötigst rationale Zahlen, das Einsetzen in Terme, einfache lineare Gleichungen und ein Koordinatensystem. Bei Problemen wird die passende Grundlagenübung angeboten. Jeder Lernbereich ist direkt zugänglich.

## Stoff lernen

### 1 Was bedeutet eine lineare Funktion?

Eine Funktion ordnet jedem erlaubten x-Wert genau einen y-Wert zu. Bei einer linearen Funktion lautet die Gleichung `y = m · x + t`. Ihr Graph ist eine Gerade. Der Wert `t` ist der y-Achsenabschnitt, denn für `x = 0` gilt `y = t`. `m` beschreibt, um wie viel sich y ändert, wenn x um 1 größer wird.

Beispiel: `f(x) = 2x + 1`. Für `x = 0, 1, 2` erhältst du `1, 3, 5`. Mit jedem Schritt nach rechts wächst der Funktionswert um 2. Die Gerade verläuft durch `(0|1)`.

Verständnisfrage: Welchen Wert hat `g(0)` bei `g(x) = -3x + 4`? **Antwort: 4.** Der negative Faktor verändert diesen Startwert nicht.

### 2 Steigung bestimmen

Die Steigung ist `m = Änderung von y / Änderung von x`. Verwende bei beiden Differenzen dieselbe Reihenfolge. Für `A(1|3)` und `B(4|9)` gilt `m = (9-3)/(4-1) = 2`. Bei einer negativen Steigung fällt die Gerade von links nach rechts. Bei `m = 0` ist sie waagrecht. Eine senkrechte Gerade hat keine Funktionsgleichung dieser Form.

Verständnisfrage: y sinkt um 6, während x um 3 steigt. Wie groß ist m? **Antwort: -2.**

### 3 Eine Gerade zeichnen

Bei `y = -0,5x + 3` markierst du zuerst `(0|3)`. Für einen zweiten Punkt gehst du 2 nach rechts und 1 nach unten: `(2|2)`. Zeichne die Gerade durch beide Punkte. Prüfe den zweiten Punkt durch Einsetzen. Beschrifte die Achsen und beachte ihre Skalierung.

Verständnisfrage: Liegt `(4|1)` auf dieser Geraden? **Antwort: ja, denn -0,5 · 4 + 3 = 1.**

### 4 Aus zwei Punkten zur Gleichung

Für `A(1|3)` und `B(4|9)` ist `m = 2`. Setze A in `y = 2x + t` ein: `3 = 2 · 1 + t`, also `t = 1`. Prüfe B: `2 · 4 + 1 = 9`. Die Gleichung lautet `y = 2x + 1`.

Verständnisfrage: Warum reicht die Steigung allein nicht aus? **Antwort: Es gibt mehrere parallele Geraden mit derselben Steigung und unterschiedlichen Achsenabschnitten.**

### 5 Ein Modell deuten

Ein fiktiver Fahrradverleih verlangt 4 Euro Grundpreis und 3 Euro je gebuchter Stunde. Nur ganze Stunden werden gebucht. Das Modell lautet `K(h) = 3h + 4`, mit `h = 0, 1, 2, …`. Für 2 Stunden beträgt K 10 Euro. Im Kontext bedeutet die Steigung 3 Euro pro Stunde und der Achsenabschnitt 4 Euro Grundpreis. Zwischenwerte des Geradenmodells sind hier keine buchbaren Zeiten.

Verständnisfrage: Ist das Modell proportional? **Antwort: nein, weil der Grundpreis ungleich null ist.**

## Üben

Bearbeite zunächst selbst. Hinweis 1 lenkt deinen Blick, Hinweis 2 zeigt einen Ansatz. Die Lösungen sind für die spätere Umsetzung getrennt von den Schüleraufgaben auszuliefern.

| ID | Aufgabe | Hinweis 1 | Hinweis 2 | Lösung und Rückmeldung |
|---|---|---|---|---|
| M8-LF-U1 | Nenne m und t bei `f(x)=3x-2`. Erkläre beide Werte. | Vergleiche mit `mx+t`. | Setze für den Startwert x=0 ein. | m=3, t=-2. Pro x-Schritt wächst y um 3; die Gerade schneidet die y-Achse bei -2. |
| M8-LF-U2 | Ergänze für `f(x)=-2x+5` die Werte zu x=-1, 0, 2. | Setze jeden Wert mit Klammern ein. | Für x=-1 steht dort `-2·(-1)+5`. | 7, 5, 1. Bei 3 statt 7 im ersten Feld: Vorzeichen beim Produkt prüfen. |
| M8-LF-U3 | Bestimme die Steigung durch `A(-1|4)` und `B(3|-4)`. | Berechne zwei Differenzen. | `(-4-4)/(3-(-1))`. | m=-2. Die Steigung ist negativ, weil y bei wachsendem x sinkt. |
| M8-LF-U4 | Zeichne `y=0,5x-1` und nenne zwei Punkte. | Beginne am y-Achsenabschnitt. | Gehe 2 nach rechts und 1 nach oben. | Zum Beispiel `(0|-1)` und `(2|0)`. Auch andere passende Punkte akzeptieren. |
| M8-LF-U5 | Bestimme die Gleichung durch `A(2|1)` und `B(6|9)`. | Bestimme zuerst m. | Setze danach A in `y=mx+t` ein. | m=2, t=-3, also `y=2x-3`; beide Punkte erfüllen die Gleichung. |
| M8-LF-U6 | Prüfe, ob `P(3|8)` auf `f(x)=2x+1` liegt. | Vergleiche Punktwert und Funktionswert. | Berechne f(3). | Nein, f(3)=7. Der Punkt liegt 1 Einheit über dem Graphen. |
| M8-LF-U7 | Jemand sagt: Bei `y=2x+3` bedeutet die 3, dass die Gerade pro Schritt um 3 steigt. Verbessere die Erklärung. | Unterscheide Startwert und Änderung. | Vergleiche f(0) mit f(1). | 3 ist der Achsenabschnitt. Die Funktionswerte 3 und 5 unterscheiden sich um 2; die Steigung ist 2. |
| M8-LF-U8 | Ein fiktiver Tarif kostet 6 Euro Grundpreis plus 2 Euro pro ganzzahliger Nutzung. Stelle K(n) auf, berechne K(4) und bestimme n für K(n)=20. | Grundpreis und Preis pro Nutzung trennen. | `2n+6=20`. | `K(n)=2n+6`, K(4)=14 Euro, n=7. Die Lösungszahl passt zur ganzzahligen Nutzung. |

Schwierigkeit: U1/U2 Grundlagen, U3–U6 Anwendung, U7/U8 Begründen und Modellieren. Eine Einstufung allein über die Zahl der Aufgaben ist nicht vorgesehen.

## Schulaufgaben vorbereiten

Beide Sätze sind thematische Übungsformate mit je 20 Punkten und vorgeschlagenen 30 Minuten. Sie sind keine Aussage zur verbindlichen Dauer oder Zusammensetzung echter Schulaufgaben. Hilfsmittel: Lineal, kariertes Papier; die Zahlen sind ohne Taschenrechner bearbeitbar. In der Simulation keine Hinweise vor Abgabe. Im Lernmodus sind Hinweise möglich und werden als genutzt erfasst.

### Übungssatz A

1. Gegeben ist `f(x)=-2x+6`. Nenne m und t, berechne f(3) und erkläre das Vorzeichen der Steigung. **4 Punkte**
2. Zeichne f für `-1 ≤ x ≤ 4`. Beschrifte die Achsen und markiere die Schnittpunkte mit beiden Achsen. **4 Punkte**
3. Eine Gerade geht durch `A(1|1)` und `B(4|7)`. Bestimme ihre Gleichung und prüfe beide Punkte. **6 Punkte**
4. Ein fiktiver Kopierservice berechnet für einen Auftrag 3 Euro Vorbereitung und 0,5 Euro je gedrucktem Plakat. Stelle K(n) auf, berechne den Preis für 10 Plakate und bestimme die Anzahl bei 13 Euro. Erkläre, ob das Modell proportional ist. **6 Punkte**

### Erwartungshorizont A

| Aufgabe | Lösung | Punkte |
|---|---|---|
| 1 | m=-2; t=6; f(3)=0; fallende Gerade, weil y pro x-Schritt um 2 sinkt | je 1, zusammen 4 |
| 2 | Achsen und passende Skalierung; `(0|6)`; `(3|0)`; passende Gerade im angegebenen Bereich | je 1, zusammen 4 |
| 3 | Differenzenansatz 1; m=2 mit Rechnung 1; Ansatz `1=2·1+t` 1; t=-1 und Gleichung `y=2x-1` 1; Prüfung A 1 und B 1 | 6 |
| 4 | `K(n)=0,5n+3` 2; K(10)=8 Euro 1; `0,5n+3=13` 1; n=20 1; nicht proportional wegen Grundpreis 1 | 6 |

### Übungssatz B

1. Gegeben ist `g(x)=0,5x-2`. Bestimme g(-2) und g(4), nenne den Achsenabschnitt und erkläre die Steigung. **4 Punkte**
2. Zeichne g anhand zweier geeigneter Punkte. Eine Schülerin behauptet, `(2|0)` liege auf g. Prüfe die Aussage rechnerisch. **4 Punkte**
3. Bestimme die Gleichung der Geraden durch `C(-2|5)` und `D(2|-3)`. Prüfe beide Punkte. **6 Punkte**
4. Ein fiktives Wasserbecken enthält 50 Liter. Gleichmäßig fließen 5 Liter pro Minute ab, bis es leer ist. Stelle V(t) auf, bestimme V(6) und den Leerungszeitpunkt. Gib den sinnvollen Zeitbereich an. **6 Punkte**

### Erwartungshorizont B

| Aufgabe | Lösung | Punkte |
|---|---|---|
| 1 | g(-2)=-3; g(4)=0; Achsenabschnitt -2; y wächst um 0,5 pro x-Schritt | je 1, zusammen 4 |
| 2 | Zwei passende Punkte und Gerade, etwa `(0|-2)` und `(4|0)` 2; g(2)=-1 1; Aussage falsch 1 | 4 |
| 3 | Differenzenansatz 1; m=-2 mit Rechnung 1; Ansatz `5=(-2)·(-2)+t` 1; t=1 und `y=-2x+1` 1; Prüfung C 1 und D 1 | 6 |
| 4 | `V(t)=50-5t` 2; V(6)=20 Liter 1; Ansatz V(t)=0 1; leer nach 10 Minuten 1; `0≤t≤10` 1 | 6 |

Alternative korrekte Wege sind gleichwertig. Bei einem Folgefehler werden danach korrekt ausgeführte Schritte weiter gewertet; derselbe Fehler wird nicht erneut abgezogen. Skizzen werden nicht anhand identischer Pixelpositionen bewertet, sondern nach Skalierung, Punkten und Verlauf.

## Rückmeldung und Wiederholung

Beispiel für U3: „Du hast die Änderungen richtig erkannt. Im Nenner hast du die Punktreihenfolge vertauscht. Schreibe beide Differenzen in derselben Reihenfolge und berechne dann erneut.“

Danach eine neue Aufgabe: Gerade durch `(0|4)` und `(2|0)`. Lösung: m=-2 und t=4. Erst dieser neue selbstständige Versuch liefert einen zusätzlichen Kompetenznachweis. Hinweise und Musterlösungsansicht machen die ursprüngliche Bearbeitung zu einem unterstützten Versuch.

Freigabeprüfung: Aufgaben und Punktsummen fachlich prüfen; Handschrift- und Graphenabgabe erproben; tatsächliche Schülerbearbeitungen mit Rubrik vergleichen. Keine automatische Umrechnung der 20 Übungspunkte in eine Schulnote ohne gewählten Notenschlüssel.
