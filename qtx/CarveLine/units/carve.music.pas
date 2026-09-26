unit carve.music;

(*
  TDownhillMusic – dynamische Abfahrtsmusik, reine Web Audio API (Pascal-Port von downhill-music.js)

    music := TDownhillMusic.Create(ctx);
    music.Start;                  // nach einer User-Geste aufrufen
    music.SetIntensity(0.4);      // 0..1, darf jeden Frame gesetzt werden
    music.Overtake;               // Stinger: Ueberholmanoever
    music.Fall;                   // Stinger: Sturz, Musik bricht kurz weg
    music.Finish;                 // Zieleinfahrt, Schlussakkord auf naechstem Beat
    music.OnEvent('bar', procedure(info: Variant) ...)   // Taktinfo (Akkord, Wuerfel, BPM, Layer)
    music.OnEvent('step', procedure(s: Variant) ...)     // 16tel-Position, zeitgenau

  Aufbau:
    - Mozart-Prinzip: 8-taktige Phrase, pro Taktposition mehrere harmonisch
      gleichwertige Akkordvarianten, zwei Wuerfel waehlen aus.
    - Vertical Layering: 7 Spuren blenden abhaengig von der Intensitaet ein.
    - Tempo 104-144 BPM, Rhythmusdichte und Filteroeffnung folgen der Intensitaet.
    - Finale: ab Intensitaet 0.85 Rueckung um einen Ganzton an der Phrasengrenze.
    - Lookahead-Scheduler auf AudioContext.currentTime.
*)

interface

uses
  qtx.sysutils, carve.web;

type
  TMusicListener = procedure(data: Variant);

  TLayer = class
  public
    id, name: String;
    th, level, send: Float;
    node: JGainNode;
    &on: Boolean;
  end;

  TChord = class
  public
    key: String;
    root: Integer;
    t: array of Integer;
  end;

  TMelNote = class
  public
    m, len: Integer;
  end;

  TWind = class
  public
    filter: JBiquadFilterNode;
    gain: JGainNode;
  end;

  TDownhillMusic = class
  private
    FListeners: Variant;
    FTimer: Integer;
    FLayers: array of TLayer;
    FBar, FStep, FPos, FTranspose, FLastPitch, FDuckBars, FBpm: Integer;
    FStepDur, FNextTime, FI: Float;
    FFinishPending: Boolean;
    FRhythm: array of Integer;
    FMelody: array of TMelNote;
    FDice: array of Integer;
    FChordKey: String;
    FReverb: JConvolverNode;
    FNoiseBuf: JAudioBuffer;
    function Layer(id: String): TLayer;
    function Impulse(sec, decay: Float): JAudioBuffer;
    function NoiseBuffer(sec: Float): JAudioBuffer;
    procedure Tick;
    function NextGrid(every: Integer): Float;
    procedure NewBar(t: Float);
    procedure ScheduleStep(s: Integer; t: Float);
    procedure Finale(t: Float);
    function KeyRoot: Integer;
    function ChordTones(ch: TChord): array of Integer;
    function ChordName(ch: TChord): String;
    function Euclid(k, n: Integer): array of Integer;
    function MakeMelody: array of TMelNote;
    function F(m: Float): Float;
    procedure Tone(dest: JAudioNode; typ: String; freq, t, dur: Float; vol: Float = 0.3; a: Float = 0.005; r: Float = 0.08;
      cutoff: Float = 0; fEnv: Float = 0; q: Float = 1; detune: Float = 0);
    procedure Noise(dest: JAudioNode; t, dur, vol: Float; typ: String = 'highpass'; f0: Float = 5000; f1: Float = 0; q: Float = 0.7);
    procedure Pad(t, dur, I: Float);
    procedure Kick(dest: JAudioNode; t: Float);
    procedure Snare(dest: JAudioNode; t, vel: Float);
    procedure Hat(dest: JAudioNode; t, vol: Float; open: Boolean);
    procedure Cymbal(t, vol: Float);
    procedure Emit(ev: String; data: Variant; time: Float);
  public
    ctx: JAudioContext;
    master: JGainNode;
    wind: TWind;
    intensity, boost: Float;
    running: Boolean;
    chord: TChord;
    constructor Create(context: JAudioContext = nil);
    // ---------- oeffentliche API ----------
    function OnEvent(ev: String; fn: TMusicListener): TDownhillMusic;
    procedure SetIntensity(x: Float);
    procedure Start;
    procedure Stop;
    procedure Overtake;
    procedure Fall;
    procedure Finish;
    procedure Init;                 // Setup (im Original: _init)
  end;

implementation

function setInterval(cb: procedure; ms: Integer): Integer; external 'setInterval';
procedure clearInterval(id: Integer); external 'clearInterval';

const NOTE_NAMES: array [0..11] of String = ('C', 'C'#$266F, 'D', 'D'#$266F, 'E', 'F', 'F'#$266F, 'G', 'G'#$266F, 'A', 'B', 'H');

var
  CHORDS: array of TChord;
  PHRASE: array of array of String;

function MkChord(key: String; root: Integer; t: array of Integer): TChord;
begin
  Result := TChord.Create; Result.key := key; Result.root := root; Result.t := t;
end;

// Akkorde relativ zum Grundton (a-Moll): root = Stufe in Halbtoenen, t = Intervalle
function ChordByKey(key: String): TChord;
begin
  for var c in CHORDS do if c.key = key then exit(c);
  Result := nil;
end;

function MkLayer(id, name: String; th, level, send: Float): TLayer;
begin
  Result := TLayer.Create; Result.id := id; Result.name := name; Result.th := th; Result.level := level; Result.send := send;
end;

function PosMod(a, n: Integer): Integer;
begin
  Result := ((a mod n) + n) mod n;
end;

constructor TDownhillMusic.Create(context: JAudioContext = nil);
begin
  ctx := context;
  intensity := 0; boost := 0; running := False;
  FListeners := NewDict;
end;

function TDownhillMusic.Layer(id: String): TLayer;
begin
  for var L in FLayers do if L.id = id then exit(L);
  Result := nil;
end;

function TDownhillMusic.OnEvent(ev: String; fn: TMusicListener): TDownhillMusic;
begin
  var list := VGet(FListeners, ev);
  if not Truthy(list) then begin asm @list = []; end; VSet(FListeners, ev, list); end;
  asm (@list).push(@fn); end;
  Result := Self;
end;

procedure TDownhillMusic.SetIntensity(x: Float);
var t: Float;
begin
  intensity := Min(1.0, Max(0.0, x));
  if (wind <> nil) and running then begin
    t := ctx.currentTime;
    wind.gain.gain.setTargetAtTime(0.05 + 0.16 * intensity, t, 0.3);
    wind.filter.Q.setTargetAtTime(0.8 + 2 * intensity, t, 0.3);
  end;
end;

procedure TDownhillMusic.Start;
begin
  if ctx = nil then ctx := NewAudioContext;
  if master = nil then Init;
  ctx.resume;                     // Original: await; hier asynchron ohne Warten (Kontext laeuft nach User-Geste ohnehin)
  if running then exit;
  running := True;
  FFinishPending := False;
  FBar := -1;
  FStep := 0;
  FStepDur := 60 / 104 / 4;
  FNextTime := ctx.currentTime + 0.1;
  FTranspose := 0;
  FLastPitch := 76;
  FDuckBars := 0;
  boost := 0;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setTargetAtTime(0.8, ctx.currentTime, 0.05);
  SetIntensity(intensity);
  FTimer := setInterval(Tick, 25);
end;

procedure TDownhillMusic.Stop;
var t: Float;
begin
  if not running then exit;
  running := False;
  clearInterval(FTimer);
  t := ctx.currentTime;
  master.gain.setTargetAtTime(0, t, 0.25);
  for var L in FLayers do begin L.&on := False; L.node.gain.setTargetAtTime(0, t, 0.25); end;
  wind.gain.gain.setTargetAtTime(0, t, 0.4);
  Emit('stop', null, t);
end;

procedure TDownhillMusic.Overtake;
var t: Float; k, i: Integer;
begin
  if not running or (chord = nil) then exit;
  t := NextGrid(2);
  k := KeyRoot;
  var tones := ChordTones(chord);
  for i := 0 to 5 do
    Tone(master, 'square', F(k + 12 + tones[i mod 3] + 12 * (i div 3)), t + i * FStepDur / 2, FStepDur * 0.6, 0.07, 0.005, 0.08, 3500);
  Noise(master, t, 0.55, 0.12, 'bandpass', 400, 6000, 1.5);
  boost := Min(0.2, boost + 0.12);
  Emit('stinger', 'overtake', t);
end;

procedure TDownhillMusic.Fall;
var t: Float;
begin
  if not running then exit;
  t := ctx.currentTime + 0.01;
  for var L in FLayers do
    if L.id <> 'pad' then begin L.node.gain.setTargetAtTime(0, t, 0.04); L.&on := False; end;
  FDuckBars := 1;
  boost := 0;
  var o := ctx.createOscillator; var g := ctx.createGain; var fl := ctx.createBiquadFilter;
  o.&type := 'sawtooth';
  o.frequency.setValueAtTime(520, t);
  o.frequency.exponentialRampToValueAtTime(55, t + 0.7);
  fl.&type := 'lowpass'; fl.frequency.setValueAtTime(2400, t); fl.frequency.exponentialRampToValueAtTime(200, t + 0.7);
  g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
  o.connect(fl); fl.connect(g); g.connect(master);
  o.start(t); o.stop(t + 0.85);
  Noise(master, t, 0.5, 0.3, 'lowpass', 900, 120);
  Emit('stinger', 'fall', t);
end;

procedure TDownhillMusic.Finish;
begin
  if running then FFinishPending := True;
end;

// ---------- Setup ----------
procedure TDownhillMusic.Init;
begin
  master := ctx.createGain();
  master.gain.value := 0.8;
  var comp := ctx.createDynamicsCompressor;
  comp.threshold.value := -16; comp.ratio.value := 4; comp.attack.value := 0.004; comp.release.value := 0.2;
  master.connect(comp); comp.connect(ctx.destination);

  FReverb := ctx.createConvolver;
  FReverb.buffer := Impulse(2.6, 2.4);
  var rg := ctx.createGain; rg.gain.value := 0.4;
  FReverb.connect(rg); rg.connect(master);

  FNoiseBuf := NoiseBuffer(2);

  FLayers := [MkLayer('pad', 'Flaechen', 0.00, 0.9, 0.55), MkLayer('bass', 'Bass', 0.12, 0.55, 0), MkLayer('hats', 'Hi-Hats', 0.25, 0.5, 0.05),
    MkLayer('kick', 'Kick', 0.36, 0.9, 0), MkLayer('arp', 'Arpeggio', 0.50, 0.45, 0.35), MkLayer('snare', 'Snare', 0.60, 0.6, 0.15),
    MkLayer('lead', 'Melodie', 0.75, 0.5, 0.3)];
  for var L in FLayers do begin
    L.node := ctx.createGain; L.node.gain.value := 0; L.node.connect(master);
    if L.send <> 0 then begin var s := ctx.createGain; s.gain.value := L.send; L.node.connect(s); s.connect(FReverb); end;
    L.&on := False;
  end;

  // Fahrtwind: gefiltertes Rauschen mit langsamem LFO
  var src := ctx.createBufferSource; src.buffer := FNoiseBuf; src.loop := True;
  var filter := ctx.createBiquadFilter; filter.&type := 'bandpass'; filter.frequency.value := 700; filter.Q.value := 0.8;
  var gain := ctx.createGain; gain.gain.value := 0;
  var lfo := ctx.createOscillator; var lfoG := ctx.createGain;
  lfo.frequency.value := 0.13; lfoG.gain.value := 350;
  lfo.connect(lfoG); lfoG.connect(filter.frequency);
  src.connect(filter); filter.connect(gain); gain.connect(master);
  src.start; lfo.start;
  wind := TWind.Create; wind.filter := filter; wind.gain := gain;
end;

function TDownhillMusic.Impulse(sec, decay: Float): JAudioBuffer;
var rate: Float; len, c, i: Integer;
begin
  rate := ctx.sampleRate; len := Floor(rate * sec);
  var b := ctx.createBuffer(2, len, rate);
  for c := 0 to 1 do begin
    var d := b.getChannelData(c);
    for i := 0 to len - 1 do d[i] := (Random * 2 - 1) * Power(1 - i / len, decay);
  end;
  Result := b;
end;

function TDownhillMusic.NoiseBuffer(sec: Float): JAudioBuffer;
var rate: Float; len, i: Integer;
begin
  rate := ctx.sampleRate; len := Floor(rate * sec);
  var b := ctx.createBuffer(1, len, rate); var d := b.getChannelData(0);
  for i := 0 to len - 1 do d[i] := Random * 2 - 1;
  Result := b;
end;

// ---------- Scheduler ----------
procedure TDownhillMusic.Tick;
var horizon: Float;
begin
  horizon := ctx.currentTime + 0.12;
  while running and (FNextTime < horizon) do begin
    if FFinishPending and (FStep mod 4 = 0) then begin Finale(FNextTime); exit; end;
    if FStep = 0 then NewBar(FNextTime);
    ScheduleStep(FStep, FNextTime);
    Emit('step', class step := FStep; bar := FBar; end, FNextTime);
    FNextTime += FStepDur;
    FStep := (FStep + 1) mod 16;
  end;
end;

function TDownhillMusic.NextGrid(every: Integer): Float;
var t: Float; s: Integer;
begin
  t := FNextTime; s := FStep;
  while s mod every <> 0 do begin t += FStepDur; Inc(s); end;
  Result := t;
end;

procedure TDownhillMusic.NewBar(t: Float);
var I, amt: Float; d1, d2: Integer; duck, isOn: Boolean;
begin
  Inc(FBar);
  I := Min(1.0, intensity + boost); FI := I;
  boost *= 0.5;
  FPos := FBar mod 8;

  if FPos = 0 then begin
    FTranspose := if I > 0.85 then 2 else 0;          // Rueckung im Finale
    FRhythm := Euclid(Round(3 + 6 * I), 16);
  end;
  FBpm := Round(104 + 40 * I);
  FStepDur := 60 / FBpm / 4;

  var opts := PHRASE[FPos];
  d1 := 1 + Floor(Random * 6); d2 := 1 + Floor(Random * 6);
  FDice := [d1, d2];
  FChordKey := opts[(d1 + d2) mod opts.Length];
  chord := ChordByKey(FChordKey);

  duck := FDuckBars > 0;
  if duck then Dec(FDuckBars);
  var states: Variant := new JObject;
  for var L in FLayers do begin
    isOn := (I >= L.th) and (not duck or (L.id = 'pad'));
    amt := if isOn then L.level * (0.6 + 0.4 * Min(1.0, (I - L.th) / 0.2)) else 0.0;
    L.node.gain.setTargetAtTime(amt, t, if isOn then 0.12 else 0.35);
    L.&on := isOn; VSet(states, L.id, isOn);
  end;

  FMelody := MakeMelody;
  Pad(t, FStepDur * 16, I);
  if (FPos = 0) and (I > 0.6) and not duck then Cymbal(t, 0.35);

  var info: Variant := new JObject;
  info.bar := FBar; info.pos := FPos; info.bpm := FBpm; info.dice := FDice;
  info.degree := FChordKey; info.chord := ChordName(chord);
  info.layers := states; info.transpose := FTranspose; info.intensity := I;
  Emit('bar', info, t);
end;

procedure TDownhillMusic.ScheduleStep(s: Integer; t: Float);
var inten, sd, dur: Float; k, root, m, i: Integer; hit: Boolean;
begin
  inten := FI; sd := FStepDur; k := KeyRoot;
  var ch := chord; var tones := ChordTones(ch);

  // Bass
  var LB := Layer('bass');
  if LB.&on then begin
    root := k - 24 + ch.root;
    hit := False; m := root; dur := sd * 1.8;
    if inten < 0.35 then begin hit := (s = 0) or (s = 8); dur := sd * 7; end
    else if inten < 0.6 then begin hit := s mod 2 = 0; if (s = 6) or (s = 14) then m := root + 12; end
    else begin hit := True; dur := sd * 0.9; if s mod 4 = 3 then m := root + 12; end;
    if hit then Tone(LB.node, 'sawtooth', F(m), t, dur, if s mod 4 = 0 then 0.5 else 0.38, 0.005, 0.06, 280 + 700 * inten, 3, 4);
  end;

  // Kick
  var LK := Layer('kick');
  if LK.&on then begin
    if inten < 0.6 then hit := (s = 0) or (s = 8) or ((inten > 0.45) and (s = 10))
    else hit := (s mod 4 = 0) or ((inten > 0.85) and (s = 14));
    if hit then Kick(LK.node, t);
  end;

  // Snare mit Fill im letzten Phrasentakt
  var LS := Layer('snare');
  if LS.&on then begin
    if (s = 4) or (s = 12) then Snare(LS.node, t, 0.8)
    else if (FPos = 7) and (inten > 0.55) and (s > 12) then Snare(LS.node, t, 0.35 + 0.15 * (s - 12))
    else if (inten > 0.8) and (s = 15) then Snare(LS.node, t, 0.2);
  end;

  // Hi-Hats
  var LH := Layer('hats');
  if LH.&on then begin
    if inten < 0.5 then hit := s mod 4 = 2 else if inten < 0.75 then hit := s mod 2 = 0 else hit := True;
    if hit then Hat(LH.node, t, if s mod 4 = 2 then 0.5 else 0.3, (inten > 0.75) and (s = 14));
  end;

  // Arpeggio
  var LA := Layer('arp');
  if LA.&on and ((inten >= 0.65) or (s mod 2 = 0)) then begin
    var seq: array of Integer := [0, 1, 2, 3, 4, 5, 4, 3];
    i := seq[(if inten >= 0.65 then s else s div 2) mod 8];
    m := k + 12 + tones[i mod 3] + 12 * (i div 3);
    Tone(LA.node, 'square', F(m), t, sd * 0.7, 0.14, 0.005, 0.05, 1200 + 3000 * inten, 2);
  end;

  // Melodie
  var n := FMelody[s];
  var LL := Layer('lead');
  if LL.&on and (n <> nil) then begin
    Tone(LL.node, 'triangle', F(n.m), t, sd * n.len * 0.92, 0.34, 0.01, 0.12);
    Tone(LL.node, 'sawtooth', F(n.m), t, sd * n.len * 0.92, 0.06, 0.02, 0.12, 2200, 0, 1, 7);
  end;
end;

procedure TDownhillMusic.Finale(t: Float);
var k: Integer;
begin
  running := False;
  clearInterval(FTimer);
  k := KeyRoot;
  for var L in FLayers do begin
    L.&on := (L.id = 'pad') or (L.id = 'lead') or (L.id = 'bass');
    L.node.gain.cancelScheduledValues(t);
    L.node.gain.setTargetAtTime(if L.&on then L.level else 0.0, t, 0.02);
  end;
  var tonic := ChordByKey('i');
  chord := tonic;
  Pad(t, 3.5, 1);
  for var iv in [0, 7, 12, 15, 19] do
    Tone(Layer('lead').node, 'sawtooth', F(k + 12 + iv), t, 3.2, 0.07, 0.03, 1.2, 3000);
  Tone(Layer('bass').node, 'sawtooth', F(k - 24), t, 3, 0.5, 0.005, 1, 600);
  Kick(master, t);
  Cymbal(t, 0.5);
  master.gain.setTargetAtTime(0, t + 3.2, 0.6);
  wind.gain.gain.setTargetAtTime(0, t + 2, 0.8);
  Emit('finish', class chord := ChordName(tonic); end, t);
end;

// ---------- Komposition ----------
function TDownhillMusic.KeyRoot: Integer;
begin
  Result := 57 + FTranspose;                    // A3 + Rueckung
end;

function TDownhillMusic.ChordTones(ch: TChord): array of Integer;
begin
  for var x in ch.t do Result.Add(ch.root + x);
end;

function TDownhillMusic.ChordName(ch: TChord): String;
begin
  Result := NOTE_NAMES[(9 + ch.root + FTranspose) mod 12];
  if ch.t[1] = 3 then Result += 'm';
end;

function TDownhillMusic.Euclid(k, n: Integer): array of Integer;
var b, i: Integer;
begin
  b := n - k;
  for i := 0 to n - 1 do begin
    b += k;
    if b >= n then begin b -= n; Result.Add(1); end else Result.Add(0);
  end;
end;

type
  TCand = class
  public
    m, i: Integer;
  end;

function TDownhillMusic.MakeMelody: array of TMelNote;
var k, m, i, h, idx, best, dir, s, nxt: Integer; center: Float;
begin
  k := KeyRoot; var ch := chord;
  var scale: array of Integer := [0, 2, 3, 5, 7, 8, 10];
  if FChordKey = 'V' then scale[6] := 11;
  var pcs: array of Integer;
  for var x in ChordTones(ch) do pcs.Add(PosMod(x, 12));
  var notes: array of Integer;
  for m := 64 to 88 do if scale.IndexOf(PosMod(m - k, 12)) >= 0 then notes.Add(m);

  var outNotes: array of TMelNote;
  for i := 0 to 15 do outNotes.Add(nil);
  var hits: array of Integer;
  for i := 0 to FRhythm.Length - 1 do if FRhythm[i] <> 0 then hits.Add(i);
  best := 0;
  for i := 0 to notes.Length - 1 do if Abs(notes[i] - FLastPitch) < Abs(notes[best] - FLastPitch) then best := i;
  idx := best;

  for h := 0 to hits.Length - 1 do begin
    s := hits[h];
    if s mod 4 = 0 then begin
      // schwere Zaehlzeit: naechstgelegener Akkordton
      var cands: array of TCand;
      for i := 0 to notes.Length - 1 do
        if pcs.IndexOf(PosMod(notes[i] - k, 12)) >= 0 then begin var cd := TCand.Create; cd.m := notes[i]; cd.i := i; cands.Add(cd); end;
      var ci := idx;
      cands.Sort(lambda (a, b: TCand): Integer => Abs(a.i - ci) - Abs(b.i - ci));
      idx := cands[if Random < 0.7 then 0 else Min(1, cands.Length - 1)].i;
    end else begin
      center := notes.Length / 2;
      dir := if Random < 0.5 then -1 else 1;
      if Abs(idx - center) > 5 then dir := if idx > center then -1 else 1;
      idx += dir * (if Random < 0.75 then 1 else 2);
      idx := Max(0, Min(notes.Length - 1, idx));
    end;
    nxt := if h + 1 < hits.Length then hits[h + 1] else 16;
    var nn := TMelNote.Create; nn.m := notes[idx]; nn.len := Min(4, nxt - s);
    outNotes[s] := nn;
  end;
  if hits.Length > 0 then FLastPitch := notes[idx];
  Result := outNotes;
end;

// ---------- Klangerzeugung ----------
function TDownhillMusic.F(m: Float): Float;
begin
  Result := 440 * Power(2, (m - 69) / 12);
end;

procedure TDownhillMusic.Tone(dest: JAudioNode; typ: String; freq, t, dur: Float; vol: Float = 0.3; a: Float = 0.005; r: Float = 0.08;
  cutoff: Float = 0; fEnv: Float = 0; q: Float = 1; detune: Float = 0);
var hold: Float;
begin
  var o := ctx.createOscillator; var g := ctx.createGain;
  o.&type := typ; o.frequency.value := freq; o.detune.value := detune;
  var last: JAudioNode := o;
  if cutoff <> 0 then begin
    var fl := ctx.createBiquadFilter; fl.&type := 'lowpass'; fl.Q.value := q;
    if fEnv <> 0 then begin fl.frequency.setValueAtTime(cutoff * fEnv, t); fl.frequency.exponentialRampToValueAtTime(cutoff, t + Max(0.05, dur)); end
    else fl.frequency.value := cutoff;
    o.connect(fl); last := fl;
  end;
  hold := Max(t + a, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + a);
  g.gain.setValueAtTime(vol, hold);
  g.gain.setTargetAtTime(0, hold, r / 3);
  last.connect(g); g.connect(dest);
  o.start(t); o.stop(hold + r * 2 + 0.05);
end;

procedure TDownhillMusic.Noise(dest: JAudioNode; t, dur, vol: Float; typ: String = 'highpass'; f0: Float = 5000; f1: Float = 0; q: Float = 0.7);
begin
  var src := ctx.createBufferSource; var fl := ctx.createBiquadFilter; var g := ctx.createGain;
  src.buffer := FNoiseBuf;
  fl.&type := typ; fl.Q.value := q;
  fl.frequency.setValueAtTime(f0, t);
  if f1 <> 0 then fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(fl); fl.connect(g); g.connect(dest);
  src.start(t, Random * 1.5); src.stop(t + dur + 0.02);
end;

procedure TDownhillMusic.Pad(t, dur, I: Float);
var k, m: Integer;
begin
  k := KeyRoot;
  var voiced: array of Integer;
  for var x in ChordTones(chord) do begin
    m := k - 12 + x;
    while m < 52 do m += 12;
    while m > 64 do m -= 12;
    voiced.Add(m);
  end;
  voiced.Add(voiced[0] + 12);
  for var vm in voiced do for var dt in [-8.0, 8.0] do
    Tone(Layer('pad').node, 'sawtooth', F(vm), t, dur, 0.045, 0.35, 0.6, 450 + 2200 * I, 0, 1, dt);
end;

procedure TDownhillMusic.Kick(dest: JAudioNode; t: Float);
begin
  var o := ctx.createOscillator; var g := ctx.createGain;
  o.&type := 'sine';
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  g.gain.setValueAtTime(1, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
  o.connect(g); g.connect(dest);
  o.start(t); o.stop(t + 0.4);
end;

procedure TDownhillMusic.Snare(dest: JAudioNode; t, vel: Float);
begin
  Noise(dest, t, 0.18, 0.5 * vel, 'highpass', 1400);
  Tone(dest, 'triangle', 190, t, 0.02, 0.4 * vel, 0.005, 0.08);
end;

procedure TDownhillMusic.Hat(dest: JAudioNode; t, vol: Float; open: Boolean);
begin
  Noise(dest, t, if open then 0.16 else 0.045, vol, 'highpass', 7500);
end;

procedure TDownhillMusic.Cymbal(t, vol: Float);
begin
  Noise(master, t, 1.6, vol, 'highpass', 4500);
end;

procedure TDownhillMusic.Emit(ev: String; data: Variant; time: Float);
var delay: Float;
begin
  var list := VGet(FListeners, ev);
  if not Truthy(list) then exit;                 // niemand hoert zu: kein Timer noetig
  delay := Max(0.0, (time - ctx.currentTime) * 1000);
  setTimeout(procedure begin asm (@list).forEach(function (fn) { fn(@data); }); end; end, Round(delay));
end;

initialization
  CHORDS := [MkChord('i', 0, [0, 3, 7]), MkChord('III', 3, [0, 4, 7]), MkChord('iv', 5, [0, 3, 7]),
    MkChord('V', 7, [0, 4, 7]), MkChord('VI', 8, [0, 4, 7]), MkChord('VII', 10, [0, 4, 7])];
  // Wuerfeltabelle: je Taktposition der Phrase austauschbare Varianten
  for var row in ['i,i,VI', 'VI,iv,III', 'III,VII,iv', 'VII,V,VII', 'i,VI,iv', 'iv,VI,III', 'VI,iv,VII', 'V,VII,V'] do
    PHRASE.Add(StrSplit(row, ','));
end.
