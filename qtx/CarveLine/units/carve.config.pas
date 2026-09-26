unit carve.config;

// CONFIG — alle Tuning-Konstanten zentral; PRESETS (Grafikstufen) und TRACKS (Strecken)

interface

uses
  carve.web;

type
  CONFIG = class
  public
    const physicsHz = 120;            // fester Physik-Timestep
    const maxSubSteps = 10;
    // --- Rider / Board ---
    const mass = 78.0;                // kg inkl. Ausruestung
    const gravity = 9.81;
    const airDensity = 1.2;
    const cdaUpright = 0.52;          // Luftwiderstandsflaeche aufrecht [m2]
    const cdaTuck = 0.27;             // in der Hocke
    const cdaBrakeExtra = 0.22;       // aufgerichteter Oberkoerper beim Bremsen
    const muGroomed = 0.045;          // Gleitreibung praeparierte Piste
    const muPowder = 0.17;            // Gleitreibung Tiefschnee
    const maxEdge = 0.95;             // max. Kantwinkel [rad] (~54 Grad)
    const edgeRate = 7.5;             // Kantwechsel-Geschwindigkeit
    const edgeRateTuck = 4.0;
    const tuckEdgeLoss = 0.55;        // Anteil Kantwinkel, der in der Hocke verloren geht
    const sidecutRadius = 7.5;        // Taillierungsradius [m]
    const speedRadiusK = 0.085;       // Radius waechst mit v2 (Board-Flex/Balancegrenze)
    const balanceFactor = 0.55;       // Querbeschl.-Bedarf pro tan(Kante): zu wenig Speed => Rutschen
    const gripFlat = 0.22;            // Seitenhalt flaches Board (mu)
    const gripMax = 1.25;             // Seitenhalt bei voller Kante (mu)
    const gripTau = 0.045;            // Zeitkonstante Seitenfuehrung [s]
    const powderGrip = 0.72;          // Seitenhalt-Faktor im Tiefschnee
    const pivotRate = 2.3;            // Andrehen (geschlitterter Schwung) [rad/s]
    const yawResponse = 12.0;         // Traegheit der Board-Gierbewegung
    const selfAlign = 1.4;            // Board richtet sich flach zur Fahrtrichtung aus
    const brakeEdge = 0.45;           // Kantwinkel beim Querstellen
    const brakeAngle = 1.35;          // Querstell-Winkel zur Fahrtrichtung [rad]
    const brakeTurnRate = 5.0;
    const catchEdgeSlip = 7.0;        // Seitrutsch-Tempo, ab dem eine falsche Kante verkantet [m/s]
    const ollieBase = 2.4;            // Absprung-Impuls [m/s]
    const ollieCharge = 2.3;          // Zusatz bei voll geladenem Ollie
    const ollieChargeTime = 0.35;
    const airSpinRate = 5.5;          // Drehrate in der Luft [rad/s]
    const airThreshold = 0.12;        // Bodenabstand ab dem man "in der Luft" ist [m]
    const landCleanAngle = 0.45;      // max. Gierfehler fuer saubere Landung [rad]
    const landCrashAngle = 1.1;       // ab hier Sturz
    const landHardImpact = 8.5;       // Aufprall normal zur Piste [m/s] => harte Landung
    const landCrashImpact = 13.5;     // => Sturz
    const netCrashSpeed = 15.0;       // Fangnetz-Kontakt ueber diesem Tempo => Sturz [m/s]
    const crashPenalty = 3.0;         // Zeitstrafe [s]
    const ragdollTime = 2.4;
    const standUpTime = 0.9;
    const invulnTime = 1.6;
    // --- Skifahrer ---
    const skierBase = 8;
    const skierMax = 26;
    const skierSpeedScale = 1.0;
    const skierProgressSpeedup = 0.35; // +35 % Tempo am Ende
    const skierChaos = 1.0;            // Faktor fuer ploetzliche Stopps / Querfahren
    const nearMissDist = 1.9;          // m (Kapsel-Abstand)
    const nearMissSlowmo = 0.35;
    const nearMissSlowmoTime = 0.4;
    // --- Punkte ---
    const speedPointsFrom = 45.0;      // km/h
    const nearMissPoints = 250;
    const carvePoints = 80;
    const airPointsPerSec = 180.0;
    const spinPoints = 400;
    const flipRate = 8.5;              // Flip-Drehrate in der Luft [rad/s]
    const flipPoints = 700;
    const grabPoints = 260.0;          // pro Sekunde gehaltenem Grab
    const gatePoints = 150; const gatePenalty = 1.0; const starPoints = 100;
    const bumpCrashSpeed = 7.0;        // Annaeherung [m/s], ab der ein Rempler zum Sturz des Auffahrenden wird
    const pushAcc = 4.6;               // Anschieben aus dem Stand (W bei < 5 m/s) [m/s2]
    const bodyRadius = 0.35;           // Kapselradius Fahrer
    const landFlipClean = 0.45;        // max. Flip-Restwinkel fuer saubere Landung [rad]
    const landFlipCrash = 1.0;
    const comboTime = 5.0;
    const comboMax = 8;
    // --- Kamera ---
    const camDistance = 4.6;
    const camHeight = 1.9;
    const fovBase = 62.0;
    const fovSpeed = 0.2;              // Grad pro km/h
    const fovMax = 92.0;
    const shakeSpeedFrom = 55.0;       // km/h
    // --- Welt ---
    const chunkLength = 64.0;
    const chunkHalfWidth = 420.0;
    const chunkSegAlong = 64;
    const chunkSegLat = 110;
    const lodDistance = 210.0;
    const autoPresetFps = 48.0;
    class var courseLength: Float;     // m bis zum Ziel (je Strecke)
  end;

  TPreset = class
  public
    name: String;
    pr: Float;
    shadow: Integer;
    bloom, smaa, snowfall, blur: Boolean;
    trees, ahead, particles: Integer;
  end;

  // Sinus-Term [Amplitude, Frequenz, Phase]
  TSine = record
    A, k, ph: Float;
  end;

  // Strecke: Kurvenverlauf cx, halbe Breite w und Gefaelle g als Summen von Sinus-Termen;
  // kickCell/kickP: Kicker-Raster [m] und Anteil belegter Zellen; forest: Baumdichte nahe der Piste, forestFrom: Beginn Waldbaender [m]
  TTrack = class
  public
    id, name: String;
    len: Float;
    cx: array of TSine;
    hasCx0: Boolean;
    cx0: Float;
    w0: Float;
    w: array of TSine;
    g0: Float;
    g: array of TSine;
    kickCell, kickP, forest, forestFrom: Float;
  end;

const
  MAX_TREES = 175;
  MAX_CHUNKS = 14;

var
  PRESET_LOW, PRESET_MEDIUM, PRESET_HIGH: TPreset;
  TRACKS: array of TTrack;
  TRACK_ID: String;
  TRACK: TTrack;

function PresetByName(n: String): TPreset;
function TrackById(id: String): TTrack;
// Speicher-Schluessel je Strecke (Bestzeit/Geist); classic behaelt die alten Schluessel
function StoreKey(k: String): String;

implementation

function MkPreset(n: String; pr: Float; shadow: Integer; bloom, smaa, snowfall: Boolean; trees, ahead, particles: Integer; blur: Boolean): TPreset;
begin
  Result := TPreset.Create;
  Result.name := n; Result.pr := pr; Result.shadow := shadow; Result.bloom := bloom; Result.smaa := smaa;
  Result.snowfall := snowfall; Result.trees := trees; Result.ahead := ahead; Result.particles := particles; Result.blur := blur;
end;

function S3(A, k, ph: Float): TSine;
begin
  Result.A := A; Result.k := k; Result.ph := ph;
end;

function PresetByName(n: String): TPreset;
begin
  if n = 'low' then Result := PRESET_LOW
  else if n = 'medium' then Result := PRESET_MEDIUM
  else if n = 'high' then Result := PRESET_HIGH
  else Result := nil;
end;

function TrackById(id: String): TTrack;
begin
  Result := nil;
  for var t in TRACKS do if t.id = id then exit(t);
end;

function StoreKey(k: String): String;
begin
  Result := 'carveline.' + k;
  if TRACK_ID <> 'classic' then Result += '.' + TRACK_ID;
end;

procedure InitTracks;
var t: TTrack;
begin
  t := TTrack.Create; t.id := 'classic'; t.name := 'Classic'; t.len := 3200;
  t.cx := [S3(55, 0.0023, 0.4), S3(22, 0.0061, 1.3), S3(9, 0.0197, 0.7)]; t.hasCx0 := True; t.cx0 := -37.7;
  t.w0 := 21; t.w := [S3(5, 0.0041, 1.0), S3(3, 0.0113, 2.1)];
  t.g0 := 0.30; t.g := [S3(0.12, 0.0045, 0.3), S3(0.07, 0.013, 2.0)];
  t.kickCell := 210; t.kickP := 0.85; t.forest := 0.2; t.forestFrom := 40;
  TRACKS.Add(t);

  t := TTrack.Create; t.id := 'wald'; t.name := 'Waldpfad'; t.len := 2600;
  t.cx := [S3(42, 0.0033, 1.1), S3(26, 0.0088, 0.2), S3(11, 0.0231, 2.4)];
  t.w0 := 14; t.w := [S3(3, 0.0052, 0.3), S3(2, 0.017, 1.7)];
  t.g0 := 0.26; t.g := [S3(0.09, 0.0051, 1.2), S3(0.06, 0.016, 0.5)];
  t.kickCell := 260; t.kickP := 0.6; t.forest := 0.5; t.forestFrom := 12;
  TRACKS.Add(t);

  t := TTrack.Create; t.id := 'nordwand'; t.name := 'Nordwand'; t.len := 2800;
  t.cx := [S3(70, 0.0017, 2.2), S3(18, 0.0057, 0.9), S3(6, 0.015, 1.9)];
  t.w0 := 27; t.w := [S3(5, 0.0035, 2.0), S3(3, 0.01, 0.4)];
  t.g0 := 0.37; t.g := [S3(0.13, 0.0039, 1.4), S3(0.08, 0.011, 0.2)];
  t.kickCell := 150; t.kickP := 0.92; t.forest := 0.12; t.forestFrom := 60;
  TRACKS.Add(t);
end;

procedure ReadTrackId;
var id: String;
begin
  id := 'classic';
  try
    var raw := localStorage.getItem('carveline.settings');
    if Truthy(raw) then begin
      var o := JSON.parse(raw);
      if Truthy(o) and Truthy(o.track) then
        if TrackById(String(o.track)) <> nil then id := String(o.track);
    end;
  except
    id := 'classic';
  end;
  TRACK_ID := id;
  TRACK := TrackById(id);
end;

initialization
  PRESET_LOW    := MkPreset('low',    1.0,  1024, False, False, False, 70,  7,  1500, False);
  PRESET_MEDIUM := MkPreset('medium', 1.25, 1536, True,  False, True,  120, 9,  2500, True);
  PRESET_HIGH   := MkPreset('high',   1.5,  2048, True,  True,  True,  175, 11, 4000, True);
  InitTracks;
  ReadTrackId;
  CONFIG.courseLength := TRACK.len;
end.
