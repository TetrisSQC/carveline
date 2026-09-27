unit carve.hud;

// HUD (DOM-Overlay im Broadcast-Stil) und Score (Speed, Near Miss, Carving, Airtime, Combo)

interface

uses
  qtx.sysutils, carve.web, carve.util, carve.config, carve.audio, carve.physics;

type
  TPop = class
  public
    d: JElement;
    t: Float;
  end;

  THud = class;

  TScore = class
  public
    hud: THud;
    audio: TAudioEngine;
    score, comboT, comboP, airTotal, topSpeed, carveT, carveSign, bestAir: Float;
    combo, nearMiss, crashes, carves, flips, grabs, stars: Integer;
    constructor Create(h: THud; a: TAudioEngine);
    procedure Reset;
    procedure Bump(p: Float);
    function Add(pts: Float): Integer;
    procedure Update(dt: Float; phys: TRiderPhysics; riding: Boolean);
    procedure OnNearMiss(dist: Float);
    procedure OnAir(t, rot: Float; tr: TTrick);
    procedure OnCrash;
  end;

  // Was das HUD pro Aktualisierung vom Spiel braucht
  THudInfo = class
  public
    timeScale, speed, finishTime, penalty, runTime, posZ: Float;
    riding, finished: Boolean;
    score: TScore;
    gatesPassed, gatesTotal, starsGot, starsTotal: Integer;
    rivalText: String;
  end;

  THud = class
  private
    FEl: Variant;
    FLast: Variant;
    FPops: array of TPop;
    FPi: Integer;
    FAcc, FToastT: Float;
    procedure SetText(k, v: String);
    function E(k: String): JElement;
  public
    constructor Create;
    procedure Pop(text: String; sub: String = ''; bad: Boolean = False);
    procedure Toast(text: String);
    procedure Countdown(text: String; isOn: Boolean);
    procedure Update(dt: Float; g: THudInfo);
  end;

function FmtTime(t: Float): String;
function ThousandsDots(n: Float): String;

implementation

function FmtTime(t: Float): String;
var m: Integer; s: Float;
begin
  m := Floor(t / 60); s := t - m * 60;
  Result := IntToStr(m) + ':' + (if s < 10 then '0' else '') + ToFixed(s, 2);
end;

function ThousandsDots(n: Float): String;
begin
  asm @Result = String(Math.floor(@n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); end;
end;

{ THud }

constructor THud.Create;
begin
  FEl := new JObject;
  FEl.T := El('hT'); FEl.Pen := El('hPen'); FEl.Prog := El('hProgBar'); FEl.Dist := El('hDist'); FEl.Extra := El('hExtra');
  FEl.S := El('hS'); FEl.Combo := El('hCombo'); FEl.V := El('hV'); FEl.G := El('hGaugeBar'); FEl.Cam := El('hCam');
  FEl.count := El('count'); FEl.toast := El('toast'); FEl.slow := El('slowmo');
  var box := El('pops');
  for var i := 0 to 4 do begin
    var p := TPop.Create; p.d := document.createElement('div'); p.d.className := 'pop'; box.appendChild(p.d); p.t := 0;
    FPops.Add(p);
  end;
  FPi := 0; FAcc := 0; FLast := new JObject; FToastT := 0;
end;

function THud.E(k: String): JElement;
begin
  Result := JElement(VGet(FEl, k));
end;

procedure THud.SetText(k, v: String);
begin
  if VGet(FLast, k) <> v then begin VSet(FLast, k, v); E(k).textContent := v; end;
end;

procedure THud.Pop(text: String; sub: String = ''; bad: Boolean = False);
begin
  var p := FPops[FPi]; FPi := (FPi + 1) mod FPops.Length;
  p.d.innerHTML := text + (if sub <> '' then '<small>' + sub + '</small>' else '');
  p.d.classList.toggle('bad', bad);
  p.d.parentElement.appendChild(p.d); p.d.classList.remove('show');
  ForceReflow(p.d);                          // Reflow erzwingen, damit die Animation neu startet
  p.d.classList.add('show'); p.t := 1.5;
end;

procedure THud.Toast(text: String);
begin
  E('toast').textContent := text; E('toast').style.opacity := 1; FToastT := 2.5;
end;

procedure THud.Countdown(text: String; isOn: Boolean);
begin
  E('count').textContent := text; E('count').style.opacity := if isOn then 1 else 0;
end;

procedure THud.Update(dt: Float; g: THudInfo);
var kmh: Integer; dist: Float;
begin
  for var p in FPops do
    if p.t > 0 then begin p.t -= dt; if p.t <= 0 then p.d.classList.remove('show'); end;
  if FToastT > 0 then begin FToastT -= dt; if FToastT <= 0 then E('toast').style.opacity := 0; end;
  E('slow').style.opacity := if g.timeScale < 0.9 then 1 else 0;
  FAcc += dt;
  if FAcc < 1 / 15 then exit;
  FAcc := 0;
  kmh := if g.riding then Round(g.speed * 3.6) else 0;
  SetText('T', FmtTime(if g.finished then g.finishTime - g.penalty else g.runTime));
  SetText('Pen', if g.penalty > 0 then '+' + ToFixed(g.penalty, 0) + 's' else '');
  SetText('V', IntToStr(kmh)); E('G').style.width := NumStr(ClampF(kmh / 130, 0, 1) * 100) + '%';
  SetText('S', ThousandsDots(g.score.score));
  var bars := '';
  if (g.score.comboT > 0) and (g.score.combo > 1) then begin
    bars := '  ';
    for var i := 1 to Ceil(g.score.comboT) do bars += #$25AE;
  end;
  SetText('Combo', 'x' + IntToStr(g.score.combo) + bars);
  dist := ClampF(g.posZ - 4, 0, CONFIG.courseLength);
  E('Prog').style.width := ToFixed(dist / CONFIG.courseLength * 100, 1) + '%';
  SetText('Dist', IntToStr(Round(dist)) + ' m  /  ' + NumStr(CONFIG.courseLength) + ' m');
  SetText('Extra', 'Tore ' + IntToStr(g.gatesPassed) + '/' + IntToStr(g.gatesTotal) + '  ' + UC($B7) + '  '#$2605' ' + IntToStr(g.starsGot) + '/' + IntToStr(g.starsTotal) +
    (if g.rivalText <> '' then '  ' + UC($B7) + '  ' + g.rivalText else ''));
end;

{ TScore }

constructor TScore.Create(h: THud; a: TAudioEngine);
begin
  hud := h; audio := a; Reset;
end;

procedure TScore.Reset;
begin
  score := 0; combo := 1; comboT := 0; comboP := 0; nearMiss := 0; crashes := 0; airTotal := 0; topSpeed := 0; carves := 0; carveT := 0;
  carveSign := 0; bestAir := 0; flips := 0; grabs := 0; stars := 0;
end;

procedure TScore.Bump(p: Float);
begin
  comboP += p;
  while comboP >= 1 do begin comboP -= 1; combo := Min(CONFIG.comboMax, combo + 1); end;
  comboT := CONFIG.comboTime;
end;

function TScore.Add(pts: Float): Integer;
begin
  Result := Round(pts * combo); score += Result;
end;

procedure TScore.Update(dt: Float; phys: TRiderPhysics; riding: Boolean);
var kmh, ae, sg: Float; clean: Boolean; v: Integer;
begin
  kmh := phys.speed * 3.6;
  if riding then topSpeed := Max(topSpeed, kmh);
  if comboT > 0 then begin comboT -= dt; if comboT <= 0 then begin combo := 1; comboP := 0; end; end;
  if not riding then exit;
  if kmh > CONFIG.speedPointsFrom then score += (kmh - CONFIG.speedPointsFrom) * 0.5 * dt * combo;
  if not phys.grounded then begin carveT := 0; exit; end;
  ae := Abs(phys.edge); sg := SignF(phys.edge);
  clean := (ae > 0.32) and (phys.carveQ > 0.85) and (phys.skid < 1.2) and (phys.speed > 8);
  if clean and ((carveSign = sg) or (carveT = 0)) then begin carveT += dt; carveSign := sg; end
  else if ((ae < 0.15) or (clean and (sg <> carveSign)) or (phys.skid > 2.5)) and (carveT > 0) then begin
    if (carveT > 0.6) and (phys.skid < 2.5) then begin
      v := Add(CONFIG.carvePoints * (0.6 + Min(carveT, 2.5) * 0.5)); Inc(carves); Bump(0.34);
      hud.Pop('Clean Carve', '+' + IntToStr(v)); audio.Pop(1);
    end;
    carveT := if clean then dt else 0.0; carveSign := sg;
  end;
end;

procedure TScore.OnNearMiss(dist: Float);
begin
  Inc(nearMiss);
  var v := Add(CONFIG.nearMissPoints * (1 + (CONFIG.nearMissDist - dist))); Bump(1); hud.Pop('Near Miss', '+' + IntToStr(v));
end;

procedure TScore.OnAir(t, rot: Float; tr: TTrick);
var spins, fl: Integer; grab: Float;
begin
  airTotal += t; bestAir := Max(bestAir, t);
  spins := Floor(rot / 360); fl := if tr <> nil then tr.flips else 0;
  grab := if (tr <> nil) and (tr.grabT > 0.25) then tr.grabT else 0.0;
  var v := Add(t * CONFIG.airPointsPerSec + spins * CONFIG.spinPoints + fl * CONFIG.flipPoints + grab * CONFIG.grabPoints);
  Bump(0.5 + (if spins <> 0 then 0.5 else 0.0) + fl * 0.8 + (if grab <> 0 then 0.4 else 0.0));
  var parts: array of String;
  if fl <> 0 then begin
    var prefix := '';
    if fl > 1 then prefix := if Min(fl, 3) = 2 then 'Double ' else 'Triple ';
    parts.Add(prefix + (if tr.flipDir > 0 then 'Frontflip' else 'Backflip')); flips += fl;
  end;
  if spins <> 0 then parts.Add(IntToStr(spins * 360) + UC($B0));
  if grab <> 0 then begin parts.Add('Indy'); Inc(grabs); end;
  hud.Pop(if parts.Length > 0 then parts.Join(' ' + UC($B7) + ' ') else 'Air ' + ToFixed(t, 1) + 's', '+' + IntToStr(v));
end;

procedure TScore.OnCrash;
begin
  Inc(crashes); combo := 1; comboP := 0; comboT := 0; carveT := 0;
end;

end.
