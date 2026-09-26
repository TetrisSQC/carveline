# CARVE LINE — Snowboard Downhill

Ein Snowboard-Downhill-Spiel im Comic-Look, das komplett im Browser läuft: eine einzige HTML-Datei, kein Build-Schritt, keine Asset-Dateien. Figuren, Bäume, Häuser, Gelände, Texturen und Sound werden prozedural erzeugt. Das Spiel lässt sich als PWA installieren und läuft danach auch offline, am Desktop wie auf dem Handy.

## Features

- **Snowboard-Physik** mit Kanten-, Grip- und Taillierungsmodell, Carven, Rutschen, Bremsen, Ollie und Anschieben aus dem Stand
- **Tricks:** Spins, Front- und Backflips, Grab („Indy") mit Combo-Wertung, dazu eine **Landehilfe** in der Luft, die sagt, wann du loslassen, weiterdrehen oder abbrechen solltest
- **Drei Strecken** mit eigenem Charakter (siehe unten), Bestzeit pro Strecke
- **KI-Gegner** Mia und Tom: gleiche Physik wie du, Namensschilder, Platzierung live und im Ziel, abgestufte Kollision (Rempler oder Auffahrunfall)
- **Geist:** Deine Bestzeit-Fahrt fährt beim nächsten Versuch als transparente Figur mit
- **Slalom-Tore** mit Bonus und Strafzeit, Marker zum nächsten Tor, **Sterne** zum Einsammeln
- **Skifahrer** auf der Piste mit Near-Miss-Wertung und Zeitlupe
- **Lebendiges Skigebiet:** Sessellifte mit fahrenden Sesseln, Berghütten mit Terrasse, ein Weiler mit Kirche am Hang, ein Talort am Ende der Abfahrt, Fangnetze in den Kurven
- **Tageszeit und Wetter:** Mittag oder Abend, klar, Schneefall oder Nebel
- **Figur anpassen:** Farben für Jacke, Hose, Helm und Board
- **Dynamische Musik**, die mit Tempo, Combos und Airtime intensiver wird und Stinger für Sturz, Überholen und Zieleinfahrt spielt
- **Comic-Grafik:** Cel-Shading, Umrisslinien, Bloom, Color-Grading, drei Grafik-Presets mit automatischer Anpassung
- **Steuerung:** Tastatur, Gamepad und Touch mit virtuellem Stick; das Layout passt sich auch an kleine Handy-Bildschirme im Querformat an

## Steuerung

| Aktion | Tastatur | Gamepad | Touch |
|---|---|---|---|
| Lenken / Kante | A / D oder ← / → | linker Stick | Stick seitlich |
| Hocke | W / ↑ | RT | Stick hoch |
| Bremsen | S / ↓ | LT | Stick runter |
| Ollie (halten = laden) | Leertaste | A | Sprung |
| Grab (in der Luft) | E / Shift | X / RB | Grab |
| Flip (in der Luft) | W / S | RT / LT | Stick hoch/runter |
| Spin (in der Luft) | lenken | lenken | Stick seitlich |
| Kamera | C | Y | Cam |
| Pause | P / Esc | Start | ❚❚ |

Wer bei sehr wenig Tempo W hält, schiebt sich an, zum Beispiel nach einem Sturz vor einem Buckel.

## Strecken

| | Classic | Waldpfad | Nordwand |
|---|---|---|---|
| Länge | 3,2 km | 2,6 km | 2,8 km |
| Pistenbreite | 26–58 m | 18–38 m | 38–70 m |
| Gefälle | 11–49 % | 11–41 % | 16–58 % |
| Charakter | Allrounder | eng, technisch, viel Wald | schnell, viele Kicker |

## Starten

ES-Module brauchen einen Webserver, `file://` funktioniert nicht:

```bash
python -m http.server 8000
# dann http://localhost:8000/ öffnen
```

three.js (r0.186.1) wird per Import-Map von jsDelivr geladen; beim ersten Start braucht das Spiel deshalb Internet.

## PWA / Offline

- `manifest.webmanifest`, `sw.js` und `icons/` machen das Spiel installierbar. Im Browser erscheint auf dem Titelbild ein „Installieren"-Knopf, sobald die Installation angeboten wird.
- Nach dem ersten Online-Start läuft das Spiel offline; three.js wird mitgecacht.
- Der Service Worker braucht HTTPS oder `localhost`.
- Alle Pfade sind relativ. Jeder Unterordner (z. B. `Version1/`, `Version2/`) ist deshalb eine eigene App mit eigenem Cache.

## Projektstruktur

```
index.html            Das komplette Spiel (HTML, CSS, JS in einem <script type="module">)
downhill-music.js     Dynamische Musik-Engine (Web Audio API); fehlt sie, spielt eine eingebaute Musik
manifest.webmanifest  PWA-Manifest
sw.js                 Service Worker (Offline-Cache)
icons/                App-Icons
CLAUDE.md             Architektur-Notizen für die Weiterentwicklung mit Claude Code
```

Technik: [three.js](https://threejs.org/) für Rendering und Post-Processing, Web Audio API für Sound und Musik, sonst keine Abhängigkeiten und kein Build-Schritt.

## Entstehung

Das Spiel wurde **ausschließlich mit Claude Opus** (Anthropic) über [Claude Code](https://claude.com/claude-code) entwickelt: Code, Grafik-Shader, Gebäude- und Figurenmodelle, Physik, KI-Gegner, PWA und diese README. Die Arbeit lief als fortlaufendes Gespräch, vom ersten Snowboarder bis zur installierbaren App mit drei Strecken. Bis zu diesem Stand ist das Projekt dabei **zweimal ins Nutzungslimit** gelaufen.
