unit carve.audio;

// AudioEngine — komplett prozedural (WebAudio): Fahrgeraeusche, Effekte, Musik (TDownhillMusic oder eingebauter Loop)

interface

uses
  qtx.sysutils, carve.web, carve.util, carve.music;

type
  TNoiseLoop = class
  public
    fl: JBiquadFilterNode;
    g: JGainNode;
  end;

  // Was die Audio-Engine pro Frame vom Fahrer wissen muss
  TAudioState = class
  public
    speed, edgePressure, skid: Float;
    grounded, riding: Boolean;
  end;

  TAudioEngine = class
  private
    FStep: Integer;
    FNextTime: Float;
    FNoise: JAudioBuffer;
    FCarve, FSkid, FWind: TNoiseLoop;
    function Loop(filterType: String; f, q: Float): TNoiseLoop;
    procedure Schedule;
    procedure Pad(f, dur, at: Float);
    procedure Hat(at: Float);
  public
    ctx: JAudioContext;
    master, sfx, music: JGainNode;
    dm: TDownhillMusic;
    vol, musicVol: Float;
    constructor Create;
    procedure Init;
    // Musik: Intensitaet 0..1 (pro Frame), Stinger, Neustart nach dem Schlussakkord
    procedure MusicIntensity(x: Float);
    procedure MusicRestart;
    procedure MusicFall;
    procedure MusicOvertake;
    procedure MusicFinish;
    procedure SetVolumes(v, m: Float);
    procedure Update(s: TAudioState; dt: Float);
    procedure Burst(dur, f0, f1, gain: Float; typ: String = 'lowpass');
    procedure Tone(f, dur, gain: Float; typ: String = 'sine'; at: Float = 0; dest: JAudioNode = nil; f2: Float = 0);
    procedure Landing(i: Float);
    procedure Crash;
    procedure NearMiss;
    procedure Pop(n: Float = 1);
    procedure Ollie;
    procedure Click;
    procedure Beep(hi: Boolean);
  end;

implementation

constructor TAudioEngine.Create;
begin
  ctx := nil; vol := 0.8; musicVol := 0.5; FStep := 0; FNextTime := 0;
end;

function TAudioEngine.Loop(filterType: String; f, q: Float): TNoiseLoop;
begin
  var s := ctx.createBufferSource; s.buffer := FNoise; s.loop := True; s.playbackRate.value := 0.8 + Random * 0.4;
  var fl := ctx.createBiquadFilter; fl.&type := filterType; fl.frequency.value := f; fl.Q.value := q;
  var g := ctx.createGain; g.gain.value := 0; s.connect(fl).connect(g).connect(sfx); s.start;
  Result := TNoiseLoop.Create; Result.fl := fl; Result.g := g;
end;

procedure TAudioEngine.Init;
var len, i: Integer; b0, w: Float;
begin
  if ctx <> nil then begin if ctx.state = 'suspended' then ctx.resume; exit; end;
  var ok: Boolean;
  asm @ok = !!(window.AudioContext || window.webkitAudioContext); end;
  if not ok then exit;
  ctx := NewAudioContext;
  master := ctx.createGain; master.gain.value := vol;
  var comp := ctx.createDynamicsCompressor; comp.threshold.value := -14; comp.ratio.value := 4;
  master.connect(comp).connect(ctx.destination);
  sfx := ctx.createGain; sfx.connect(master);
  music := ctx.createGain; music.gain.value := musicVol * 0.5; music.connect(master);
  // Rausch-Puffer
  len := Round(ctx.sampleRate * 2);
  var buf := ctx.createBuffer(1, len, ctx.sampleRate); var d := buf.getChannelData(0);
  b0 := 0;
  for i := 0 to len - 1 do begin w := Random * 2 - 1; b0 := 0.97 * b0 + 0.03 * w; d[i] := w * 0.6 + b0 * 2.5; end;
  FNoise := buf;
  FCarve := Loop('bandpass', 700, 0.7);   // tiefes Kanten-Rauschen
  FSkid := Loop('bandpass', 2600, 1.2);   // kratziges Rutschen
  FWind := Loop('lowpass', 500, 0.9);
  var lfo := ctx.createOscillator; var lg := ctx.createGain; lfo.frequency.value := 0.17; lg.gain.value := 180;
  lfo.connect(lg).connect(FWind.fl.frequency); lfo.start;
  FNextTime := ctx.currentTime + 0.1;
  // Dynamische Musik (TDownhillMusic): gleicher AudioContext, Ausgang auf den Musik-Bus (Lautstaerkeregler), Fahrtwind macht das Spiel selbst
  try
    dm := TDownhillMusic.Create(ctx); dm.Init;
    dm.master.disconnect; dm.master.connect(music); dm.wind.gain.disconnect;
    music.gain.value := musicVol * 1.1; dm.Start;
  except
    on e: Exception do begin consoleWarn('DownhillMusic nicht nutzbar, eingebaute Musik: ' + e.Message); dm := nil; end;
  end;
end;

procedure TAudioEngine.MusicIntensity(x: Float);
begin
  if dm <> nil then dm.SetIntensity(x);
end;

procedure TAudioEngine.MusicRestart;
begin
  if (dm <> nil) and not dm.running then dm.Start;
end;

procedure TAudioEngine.MusicFall;
begin
  if dm <> nil then dm.Fall;
end;

procedure TAudioEngine.MusicOvertake;
begin
  if dm <> nil then dm.Overtake;
end;

procedure TAudioEngine.MusicFinish;
begin
  if dm <> nil then dm.Finish;
end;

procedure TAudioEngine.SetVolumes(v, m: Float);
begin
  vol := v; musicVol := m;
  if ctx = nil then exit;
  master.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
  music.gain.setTargetAtTime(m * (if dm <> nil then 1.1 else 0.5), ctx.currentTime, 0.05);
end;

// pro Frame: Parameter nachfuehren
procedure TAudioEngine.Update(s: TAudioState; dt: Float);
var t, v, onF, carveG, skidG, wg: Float;
begin
  if ctx = nil then exit;
  t := ctx.currentTime; v := s.speed; onF := if s.grounded and s.riding then 1.0 else 0.0;
  carveG := onF * ClampF(v / 25, 0, 1) * (0.12 + 0.35 * ClampF(s.edgePressure, 0, 1.3));
  FCarve.g.gain.setTargetAtTime(carveG * 0.6, t, 0.05);
  FCarve.fl.frequency.setTargetAtTime(300 + v * 28 + s.edgePressure * 400, t, 0.05);
  skidG := onF * ClampF(s.skid / 6, 0, 1) * ClampF(v / 6, 0, 1);
  FSkid.g.gain.setTargetAtTime(skidG * 0.5, t, 0.04);
  FSkid.fl.frequency.setTargetAtTime(1800 + s.skid * 150, t, 0.05);
  wg := ClampF(v / 32, 0, 1.2); FWind.g.gain.setTargetAtTime(wg * wg * 0.55 * (if s.riding then 1.0 else 0.3), t, 0.2);
  FWind.fl.frequency.setTargetAtTime(250 + v * 45, t, 0.2);
  if dm = nil then Schedule;
end;

procedure TAudioEngine.Burst(dur, f0, f1, gain: Float; typ: String = 'lowpass');
var t: Float;
begin
  if ctx = nil then exit;
  t := ctx.currentTime;
  var s := ctx.createBufferSource; s.buffer := FNoise; var fl := ctx.createBiquadFilter; fl.&type := typ;
  fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
  var g := ctx.createGain; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl).connect(g).connect(sfx); s.start(t, Random); s.stop(t + dur + 0.05);
end;

procedure TAudioEngine.Tone(f, dur, gain: Float; typ: String = 'sine'; at: Float = 0; dest: JAudioNode = nil; f2: Float = 0);
var t: Float;
begin
  if ctx = nil then exit;
  if dest = nil then dest := sfx;
  t := ctx.currentTime + at;
  var o := ctx.createOscillator; o.&type := typ; o.frequency.setValueAtTime(f, t);
  if f2 <> 0 then o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  var g := ctx.createGain; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest); o.start(t); o.stop(t + dur + 0.05);
end;

procedure TAudioEngine.Landing(i: Float);
begin
  Burst(0.25 + i * 0.25, 1400, 200, 0.25 + i * 0.5); Tone(90, 0.25, 0.3 + i * 0.4, 'sine', 0, sfx, 40);
end;

procedure TAudioEngine.Crash;
begin
  Burst(1.1, 3000, 150, 0.9); Tone(70, 0.4, 0.8, 'sine', 0, sfx, 30); Tone(55, 0.3, 0.5, 'sine', 0.22, sfx, 30);
end;

procedure TAudioEngine.NearMiss;
begin
  Burst(0.45, 600, 4000, 0.35, 'bandpass'); Tone(1320, 0.25, 0.12, 'triangle', 0.05); Tone(1760, 0.35, 0.1, 'triangle', 0.12);
end;

procedure TAudioEngine.Pop(n: Float = 1);
begin
  Tone(660 * n, 0.12, 0.1, 'triangle'); Tone(990 * n, 0.18, 0.07, 'triangle', 0.06);
end;

procedure TAudioEngine.Ollie;
begin
  Burst(0.12, 2500, 800, 0.25, 'bandpass');
end;

procedure TAudioEngine.Click;
begin
  Tone(880, 0.06, 0.08, 'square');
end;

procedure TAudioEngine.Beep(hi: Boolean);
begin
  Tone(if hi then 1320 else 660, if hi then 0.5 else 0.18, 0.18, 'sine');
end;

function Mtof(m: Float): Float;
begin
  Result := 440 * Power(2, (m - 69) / 12);
end;

// Dezente Synth-Musik (Fallback): Pad + Bass + Arp + HiHat, 112 BPM, Am-F-C-G, Lookahead-Scheduler
procedure TAudioEngine.Schedule;
const spb = 60 / 112 / 4;
var st, bar, s16: Integer; t, at: Float;
begin
  var chords: array of array of Integer;
  chords.Add([57, 60, 64]); chords.Add([53, 57, 60]); chords.Add([48, 55, 60]); chords.Add([55, 59, 62]);
  if FNextTime < ctx.currentTime - 0.05 then FNextTime := ctx.currentTime + 0.02;
  while FNextTime < ctx.currentTime + 0.2 do begin
    st := FStep; bar := (st div 16) mod 4; s16 := st mod 16; t := FNextTime; var ch := chords[bar];
    at := t - ctx.currentTime;
    if s16 = 0 then for var n in ch do Pad(Mtof(n), spb * 16, at);
    if (s16 mod 4 = 0) or (s16 = 10) then Tone(Mtof(ch[0] - 24), spb * 1.8, 0.16, 'triangle', at, music);
    if s16 mod 2 = 1 then Hat(at);
    if st mod 3 = 0 then Tone(Mtof(ch[(st div 3) mod 3] + 12), spb * 1.2, 0.035, 'sine', at, music);
    Inc(FStep); FNextTime += spb;
  end;
end;

procedure TAudioEngine.Pad(f, dur, at: Float);
var t: Float;
begin
  t := ctx.currentTime + at; var g := ctx.createGain; var fl := ctx.createBiquadFilter;
  fl.&type := 'lowpass'; fl.frequency.value := 900; fl.Q.value := 0.5;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.045, t + dur * 0.3); g.gain.linearRampToValueAtTime(0.0001, t + dur);
  for var det in [-7.0, 7.0] do begin
    var o := ctx.createOscillator; o.&type := 'sawtooth'; o.frequency.value := f; o.detune.value := det; o.connect(fl); o.start(t); o.stop(t + dur + 0.1);
  end;
  fl.connect(g).connect(music);
end;

procedure TAudioEngine.Hat(at: Float);
var t: Float;
begin
  t := ctx.currentTime + at; var s := ctx.createBufferSource; s.buffer := FNoise;
  var fl := ctx.createBiquadFilter; fl.&type := 'highpass'; fl.frequency.value := 7000;
  var g := ctx.createGain; g.gain.setValueAtTime(0.03, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  s.connect(fl).connect(g).connect(music); s.start(t, Random); s.stop(t + 0.08);
end;

end.
