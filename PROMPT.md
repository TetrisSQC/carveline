# Prompt: Snowboard-Downhill-Spiel im Comic-Look (Browser, PWA)

> Dieser Prompt beschreibt das Gesamtprojekt „CARVE LINE" so, dass ein KI-Coding-Assistent (z. B. Claude Code) ein vergleichbares Spiel von Grund auf bauen kann. Am besten in einer leeren Arbeitsumgebung verwenden und den Assistenten die Phasen nacheinander abarbeiten lassen, mit Browser-Test nach jeder Phase.

---

Baue ein **Snowboard-Downhill-Spiel für den Browser** im **Comic-/Cel-Shading-Look**. Es soll sich hochwertig anfühlen („AAA-Politur") und am Desktop wie auf dem Handy flüssig laufen. Oberfläche und Code-Kommentare auf **Deutsch**.

## Technische Rahmenbedingungen

- **Eine einzige `index.html`** mit HTML, CSS und JS (ein `<script type="module">`). Kein Build-Schritt, kein npm, keine Asset-Dateien.
- **three.js** (aktuelle Version) per Import-Map von jsDelivr, dazu Addons: EffectComposer, RenderPass, UnrealBloomPass, SMAAPass, ShaderPass, OutputPass, Sky, BufferGeometryUtils.
- **Alles prozedural:** Figuren aus Grundformen, Bäume, Gebäude, Gelände, Canvas-Texturen, Sound (Web Audio API).
- Zentrale **CONFIG** mit allen Tuning-Werten (Physik, Kamera, Punkte, Welt) und **Grafik-Presets** (low/medium/high) mit automatischem Herunterschalten bei niedrigen FPS.
- Die Hauptschleife ist **allokationsfrei** (Scratch-Vektoren im Konstruktor). Die Physik läuft mit **festem Zeitschritt** (120 Hz, Akkumulator), gerendert wird interpoliert.
- Fehler-Overlay für echte Laufzeitfehler (per Antippen schließbar). Generische „Script error."-Meldungen fremder Skripte nur in die Konsole.
- `window.game` für Debugging im Browser verfügbar machen.

## Phase 1 – Kern: Piste, Physik, Fahrer

1. **Analytische Piste** (`Course`): Mittellinie `cx(z)`, halbe Breite `width(z)`, Gefälle `grade(z)` jeweils als Summe von Sinus-Termen, Höhe als Stammfunktion des Gefälles. Dazu ein flacher Auslauf nach dem Ziel, Kuppen (Roller) und **Kicker** (parabolische Rampen), und Fangnetze an Kurven-Außenseiten. Alles (Physik, Gelände, KI, Kamera) fragt diese eine Definition ab.
2. **Snowboard-Physik** (`RiderPhysics`):
   - Kantwinkel folgt der Lenkung.
   - Carving-Radius aus Taillierung und Tempo; Balance-Grenze: zu viel Kante bei zu wenig Tempo führt zum Rutschen.
   - Gleitreibung (Piste vs. Tiefschnee), quadratischer Luftwiderstand (Hocke reduziert ihn).
   - Seitenführung durch Grip, Bremsen durch Querstellen, Verkanten führt zum Sturz.
   - Ollie: halten lädt, loslassen springt.
   - In der Luft: Spin durch Lenken, Landung prüfen (Aufprall, Richtungsfehler; im Stand keine Richtungsprüfung).
   - **Anschieben** bei sehr wenig Tempo (W halten).
3. **Prozedurales Skelett** (17 Gelenke) mit Feder-Dämpfer-Animation und 2-Knochen-IK: Hocke, Lage in die Kurve, Oberkörperrotation, Arme als Balance mit Trägheit, Kopf blickt in Fahrtrichtung. Bei Stürzen übernimmt eine **Ragdoll** (Verlet, Distanz-Constraints, Kollision mit Boden und Fangnetzen). Danach **Aufstehen** mit Überblendung an einer sicheren Stelle talwärts (nicht auf Kicker oder Kuppe), mit etwas Anfangstempo.
4. **Chibi-Figur** aus Grundformen: großer Kopf mit Helm, Brillenband und großer Brille, Puffer-Jacke mit Steppringen, dicke Arme und Beine, Fäustlinge, runde Boots, Board mit farbigen Spitzen (Farbe per Shader nach Position, nicht per Vertex-Farbe).
5. **Kamera** mit 3 Modi (Verfolger, Action, Helm): geschwindigkeitsabhängiges FOV, Kamerawackeln bei Landungen und hohem Tempo. Im Helm-Modus wird der Kopf ausgeblendet.
6. **Ablauf:** Titel mit Kameraflug → Countdown → Rennen → Ziel mit Statistik. Dazu Pause-/Optionsmenü und Bestzeit in `localStorage`.

## Phase 2 – Welt: offen, nicht wie ein Tunnel

- **Gestreamtes Gelände** in Chunks (Pooling, weiter Streifen von ±400 m).
  - Neben der Piste **keine Wände**: Auf der einen Seite steigt ein Berghang an, auf der anderen fällt das Gelände in ein **konkaves Tal** ab, damit man hineinsehen kann.
  - Pistenrand mit Böschung, sanfte Hügel, Windverwehungen im Tiefschnee.
  - Schnee-Shader mit Cord-Rillen (Normal-Map), Glitzer-Partikeln gegen die Sonne und bläulicher Streuung.
- **Verschneite Fichten** (Etagen mit gezackten, hängenden Astspitzen, Schnee auf den Oberseiten, dunkle Unterseiten): nahe der Piste locker verstreut, weiter draußen als Waldbänder mit Lichtungen. LOD für die Ferne. Weiche **Kontaktschatten** (AO-Flecken) unter Bäumen, Felsen und Gebäuden.
- **Hintergrundberge:** Ein Ring um die Kamera mit drei gestaffelten Ketten einzelner Gipfel (gerade Grate, Fels an Steilwänden, Waldgürtel am Fuß) und eigenem Dunst pro Kette. Der Boden des Rings folgt per Shader-Scherung dem Gefälle der Abfahrt, sonst schweben die Berge. Innen ist er nach unten gezogen, damit keine Lücke entsteht.
- **Skigebiet:**
  - 3 Sessellifte mit Tal- und Bergstation, Stützen (automatisch so hoch, dass das Seil den Boden nicht berührt), durchhängenden Seilen und umlaufenden Sesseln.
  - Berghütten mit Sonnenterrasse.
  - Häusertypen: Chalet, verputztes Chalet, Bauernhaus mit Stadel, Hotel, Heustadel, **Dorfkirche mit Zwiebelturm und Uhren**.
  - Ein Weiler auf einer Hangterrasse über der Piste und ein **Talort am Ende der Abfahrt**.
  - Häuser nur dort zeigen, wo das Gelände geladen ist.
- **Skifahrer-KI** (Instanced Meshes, gleicher Chibi-Stil) mit verschiedenen Fahrtypen: Pflug, Genießer, Kurzschwinger, plötzliche Stopps, Querfahren. Kollision und Near-Miss mit Zeitlupe.

## Phase 3 – Look: Comic-Stil und Licht

- **Cel-Shading global:** Im three.js-Shader-Chunk `lights_physical_pars_fragment` das direkte Licht durch eine 3-Stufen-Kurve ersetzen. Das Umgebungslicht bleibt weich, dadurch werden die Schatten blau.
- **Umrisslinien** als Post-Pass aus dem Tiefenpuffer (Laplace der inversen Tiefe).
  - Gelände wird über den Alpha-Kanal markiert. Eine volle Linie gibt es nur, wenn die vordere Fläche ein Objekt ist, sonst entstehen schwarze Linien an Pistenkuppen.
  - Die Cord-Rillen als bläuliche Schraffur einfärben, weil die harten Lichtstufen die Normal-Map schlucken.
- **Licht:** Seitenlicht bei ~30° Sonnenhöhe, warme Sonne, bläuliches Himmelslicht, IBL aus dem Himmel.
- **Post-Kette:** Render → Umriss → Bloom (hohe Schwelle, sonst überstrahlt der Schnee bei tiefer Sonne) → Grading (HDR-sichere Kontrastkurve, Filmkorn, leichte chromatische Aberration und radiale Unschärfe bei Tempo, Vignette) → SMAA → Output.

## Phase 4 – Gameplay-Features

- **Tricks:**
  - Flips (W/S in der Luft; erst wenn die Taste nach dem Absprung neu gedrückt wird).
  - Grab „Indy" (E/Shift): hintere Hand an die Kante, Beine angezogen.
  - Spins. Die Wertung benennt Kombinationen, z. B. „Backflip · 360° · Indy".
- **Landehilfe in der Luft:** Ein Ring zeigt die aktuelle Drehung und die Vorhersage „wenn du jetzt loslässt". Der Landezeitpunkt wird aus der Flugbahn gegen das Gelände berechnet, dazu das Auslaufen bzw. Weiterlaufen der Drehung. Tipps in fester Rangfolge (sauber > sicher abbrechen > riskant zu Ende drehen): „Loslassen!", „Weiterdrehen!" mit Tastenhinweis, „Abbrechen!", „Knapp", „Sturzgefahr!".
- **Score:** Tempo-Punkte, sauberes Carven, Near Miss, Airtime, Tricks und Combo-Multiplikator.
- **Slalom-Tore:** gut sichtbar (große unbeleuchtete Fahnen, farbiger Bodenstreifen, schwebender Marker mit Entfernung zum nächsten Tor). Bonus bei Durchfahrt, +1 s beim Verpassen.
- **Sterne** zum Einsammeln: in Reihen, riskant am Rand und im Bogen über Kickern.
- **Geist:** Die Fahrt mit 20 Hz aufzeichnen (Position, Lage, Animationszustand, Tricks) und bei neuer Bestzeit speichern. Beim nächsten Versuch als leuchtend-transparente Figur abspielen.
- **Zwei KI-Gegner** mit derselben Physik:
  - Ideallinie mit Vorausschau, Tempo über Hocke oder Bremse, weichen Skifahrern aus.
  - Namensschilder, Platzierung live und im Ziel.
  - **Abgestufte Kollision:** Ein Rempler schiebt auseinander, ein harter Auffahrunfall wirft den Auffahrenden um.
- **Drei Strecken** (Classic, eng-technischer Waldpfad, steile Nordwand mit vielen Kickern); Bestzeit und Geist pro Strecke.
- **Optionen:** Tageszeit (Mittag/Abend), Wetter (klar/Schneefall/Nebel), Geist an/aus, Gegner an/aus, Farben für Jacke, Hose, Helm und Board, Kamera, Lautstärken, Grafik.

## Phase 5 – Sound

- Prozedurale Geräusche: Kantenrauschen, Rutschen, Fahrtwind, Landung, Sturz, Near Miss, Pops.
- **Dynamische Musik** mit Intensität 0–1:
  - Spuren blenden abhängig von der Intensität ein; Tempo 104–144 BPM.
  - Die Intensität steigt mit Tempo, Combo, Airtime und Zeitlupe, plus Schub auf dem letzten Streckenabschnitt.
  - Stinger für Sturz, Überholen und einen Schlussakkord im Ziel.

## Phase 6 – Mobil und PWA

- **Touch:**
  - Links ein virtueller Stick: seitlich analog lenken, hoch = Hocke, runter = Bremse.
  - Rechts die Knöpfe Sprung, Grab, Kamera und Pause.
  - Multi-Touch, nur auf Touch-Geräten einblenden.
  - Vibration bei Sturz und Landung, Hinweis im Hochformat.
- **Niedrige Bildschirme** (Handy quer mit Browserleisten, ~300 px Höhe): Titelbild zweispaltig, Optionsmenü zweispaltig mit immer sichtbarer Knopfzeile.
- **PWA:**
  - Manifest (Vollbild, Querformat) und Icons.
  - Service Worker: Seite online zuerst, eigene Dateien aus dem Cache mit Hintergrund-Update, CDN aus dem Cache.
  - Alle Pfade relativ, damit jeder Unterordner (`Version1/`, `Version2/` …) eine eigene App mit eigenem Cache ist.
  - Dazu ein „Installieren"-Knopf.

## Arbeitsweise

- Nach jeder Phase im Browser testen: Screenshots, Konsole, Frame-Zeit messen. Zielwert ~60 FPS auf „high" am Desktop.
- Physik- und Logik-Tests per JavaScript im Browser. Zum Beispiel den Fahrer vor einen Kicker setzen und prüfen, ob ein Bot, der nur den Landehilfe-Tipps folgt, sauber landet.
- Eine `CLAUDE.md` mit Architektur-Notizen, Konventionen und Fallstricken führen und aktuell halten.
- Testdaten (Bestzeiten, Geist) nach Tests wieder aus `localStorage` entfernen.
