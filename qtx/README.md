# CARVE LINE: Quartex-Pascal-Port

Dies ist das komplette Snowboard-Spiel CARVE LINE, portiert von JavaScript nach **Quartex Pascal (QTX)**. Die gesamte Spiellogik ist Object Pascal: Physik, Animation, Welt, KI, HUD, Menüs, Audio und die dynamische Musik. Der Quartex-Compiler übersetzt sie nach JavaScript. three.js bleibt als externe WebGL-Bibliothek eingebunden, über typisierte `external`-Klassen.

Alle Details zum Vorgehen, zu den Stolperfallen und zur Verifikation (bitgenaue Parität von Strecke und Physik mit dem Original) stehen im englischen Protokoll **[PORTING.md](PORTING.md)**.

## Aufbau

```
CarveLine/
  app.entrypoint.pas    Programm: ruft StartCarveLine auf
  app.config.ini        Quartex-Projekt (Compiler-Optionen)
  units/                24 Units (carve.*.pas), siehe PORTING.md
  index.html            HTML/CSS (unverändert aus dem Original) + Loader für three.js
  index.js              Build-Ausgabe des Quartex-Compilers
  sw.js, manifest.webmanifest, icons/   PWA
```

## Bauen und starten

1. `CarveLine` in der Quartex Pascal IDE (ab 1.2) öffnen und kompilieren. Das erzeugt `index.js`.
2. Den Ordner über HTTP ausliefern, `file://` funktioniert nicht:
   ```bash
   cd CarveLine
   python -m http.server 8000
   # dann http://localhost:8000/ öffnen
   ```
3. three.js (r0.186.1) kommt beim ersten Start von jsDelivr. Danach läuft das Spiel als PWA auch offline.

## Entstehung

Das Original wurde auf Deutsch mit **Claude Opus** über **Claude Code** gepromptet. Auch der Port stammt von Claude Opus, der die Quartex-IDE über deren MCP-Server bediente: Dateien setzen, kompilieren, Fehler lesen.
