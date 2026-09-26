unit carve.course;

// Course — analytische Pistenfunktion (Hoehe, Normale, Features).
// Downhill = +Z. Piste folgt einer Mittellinie cx(z). Alles (Gelaende, Physik, KI, Kamera, Ragdoll) fragt den Course ab.

interface

uses
  carve.util, carve.config, carve.three;

type
  TRoller = class
  public
    z, H, s: Float;
  end;

  TKicker = class
  public
    z, d, H, L: Float;
  end;

  TCourse = class
  private
    FR: TRoller;
    FK: TKicker;
  public
    Trk: TTrack;
    zf, cx0, runT, gEnd, Fzf, g0: Float;
    constructor Create; overload;
    constructor Create(aT: TTrack); overload;
    function cx(z: Float): Float;
    function cxp(z: Float): Float;
    function cxpp(z: Float): Float;
    function width(z: Float): Float;              // halbe Pistenbreite
    function gradeRaw(z: Float): Float;           // Gefaelle (positiv = bergab pro Meter)
    function Fraw(z: Float): Float;               // Stammfunktion (Hoehe)
    function grade(z: Float): Float;
    function y0(z: Float): Float;
    function netSide(z: Float): Integer;          // Netze an der Kurvenaussenseite: -1 / 0 / +1
    function roller(c: Integer; r: TRoller): Boolean;   // Kuppe in Zelle c (90 m)
    function kicker(c: Integer; k: TKicker): Boolean;   // Kicker in Zelle c (Rastergroesse je Strecke)
    function features(z, d: Float): Float;
    function safeZ(z, d: Float): Float;          // Aufstehpunkt talwaerts, nicht auf Kicker/Kuppe
    function groom(x, z: Float): Float;           // 1 = Piste, 0 = Tiefschnee
    function height(x, z: Float): Float;
    function normal(x, z: Float; outV: JVector3): JVector3;
  end;

implementation

constructor TCourse.Create;
begin
  Create(TRACK);
end;

constructor TCourse.Create(aT: TTrack);
var s: Float;
begin
  Trk := aT; zf := Trk.len;
  if Trk.hasCx0 then cx0 := Trk.cx0
  else begin
    s := 0;
    for var t in Trk.cx do s += t.A * Sin(t.ph);
    cx0 := -s;                                   // Start bei x ~ 0
  end;
  runT := 90;                                    // Uebergang in den Auslauf [m]
  gEnd := 0.04;
  FR := TRoller.Create; FK := TKicker.Create;
  Fzf := Fraw(zf);
  g0 := gradeRaw(zf);
end;

function TCourse.cx(z: Float): Float;
var s: Float;
begin
  s := cx0;
  for var t in Trk.cx do s += t.A * Sin(z * t.k + t.ph);
  Result := s;
end;

function TCourse.cxp(z: Float): Float;
var s: Float;
begin
  s := 0;
  for var t in Trk.cx do s += t.A * t.k * Cos(z * t.k + t.ph);
  Result := s;
end;

function TCourse.cxpp(z: Float): Float;
var s: Float;
begin
  s := 0;
  for var t in Trk.cx do s -= t.A * t.k * t.k * Sin(z * t.k + t.ph);
  Result := s;
end;

function TCourse.width(z: Float): Float;
var s: Float;
begin
  s := Trk.w0;
  for var t in Trk.w do s += t.A * Sin(z * t.k + t.ph);
  Result := s;
end;

function TCourse.gradeRaw(z: Float): Float;
var s: Float;
begin
  s := Trk.g0;
  for var t in Trk.g do s -= t.A * Sin(z * t.k + t.ph);
  Result := s;
end;

function TCourse.Fraw(z: Float): Float;
var s: Float;
begin
  s := Trk.g0 * z;
  for var t in Trk.g do s += (t.A / t.k) * Cos(z * t.k + t.ph);
  Result := -s;
end;

function TCourse.grade(z: Float): Float;
var t: Float;
begin
  if z <= zf then exit(gradeRaw(z));
  t := z - zf;
  if t >= runT then exit(gEnd);
  Result := g0 + (gEnd - g0) * t / runT;
end;

function TCourse.y0(z: Float): Float;
var t, TT, g1: Float;
begin
  if z <= zf then exit(Fraw(z));
  t := z - zf; TT := runT; g1 := gEnd;
  if t < TT then exit(Fzf - (g0 * t + (g1 - g0) * t * t / (2 * TT)));
  Result := Fzf - (g0 * TT + (g1 - g0) * TT / 2) - g1 * (t - TT);
end;

function TCourse.netSide(z: Float): Integer;
var k: Float;
begin
  if (z < 20) or (z > zf + 60) then exit(0);
  k := cxpp(z);
  if Abs(k) > 0.0021 then Result := -Round(SignF(k)) else Result := 0;
end;

function TCourse.roller(c: Integer; r: TRoller): Boolean;
begin
  if (c < 2) or (c * 90 > zf - 150) or (Hash1(c * 3.1 + 7) > 0.5) then exit(False);
  r.z := c * 90 + 45 + (Hash1(c * 5.3) - 0.5) * 30;
  r.H := 1.0 + Hash1(c * 9.7) * 1.6;
  r.s := 6 + Hash1(c * 2.9) * 4;
  Result := True;
end;

function TCourse.kicker(c: Integer; k: TKicker): Boolean;
var KC, z: Float;
begin
  KC := Trk.kickCell;
  if (c < 1) or (c * KC > zf - 220) or (Hash1(c * 11.3 + 1) > Trk.kickP) then exit(False);
  z := c * KC + KC * 0.28 + Hash1(c * 4.1) * KC * 0.43;
  k.z := z;
  k.d := (Hash1(c * 6.7) - 0.5) * width(z) * 0.8;
  k.H := 0.95 + Hash1(c * 8.3) * 0.65;
  k.L := 10;
  Result := True;
end;

function TCourse.features(z, d: Float): Float;
var y, dz, t, lat, prof: Float; rc, kc, c: Integer;
begin
  y := 0;
  rc := Floor(z / 90);
  for c := rc - 1 to rc + 1 do begin
    if not roller(c, FR) then continue;
    dz := z - FR.z;
    if Abs(dz) < FR.s * 4 then y += FR.H * Exp(-dz * dz / (2 * FR.s * FR.s));
  end;
  kc := Floor(z / Trk.kickCell);
  for c := kc - 1 to kc do begin
    if not kicker(c, FK) then continue;
    t := (z - FK.z) / FK.L;
    if (t < 0) or (t > 1.3) then continue;
    lat := 1 - Smoothstep(3.0, 4.2, Abs(d - FK.d));
    if lat <= 0 then continue;
    if t <= 1 then prof := FK.H * t * t
    else prof := FK.H * Power(1 - (t - 1) / 0.3, 2);    // Parabel-Rampe, steile Rueckseite
    y += prof * lat;
  end;
  Result := y;
end;

function TCourse.safeZ(z, d: Float): Float;
var k: Integer; x: Float;
begin
  k := 0;
  while (k < 30) and (z < zf) do begin
    x := cx(z) + d;
    if ((height(x, z + 1.5) - height(x, z - 1.5)) / 3 < -0.06) and (features(z, d) < 0.05) then exit(z);
    z += 3;
    Inc(k);
  end;
  Result := z;
end;

function TCourse.groom(x, z: Float): Float;
var d: Float;
begin
  d := x - cx(z);
  Result := 1 - Smoothstep(width(z) - 1.5, width(z) + 7, Abs(d));
end;

function TCourse.height(x, z: Float): Float;
var c, d, W, ad, y, edge, g, o, far: Float;
begin
  c := cx(z); d := x - c; W := width(z); ad := Abs(d);
  y := y0(z);
  y += -0.7 * cxp(z) * grade(z) * d;                  // Querneigung: Falllinie folgt grob der Piste
  edge := Smoothstep(W - 1.5, W + 7, ad); g := 1 - edge;
  y += 0.0015 * d * d * g;                             // leichte Mulde
  o := Max(0.0, ad - W); far := Smoothstep(W + 4, W + 60, ad);
  y += Smoothstep(0, 7, o) * 0.9;                      // Boeschung am Pistenrand
  // offener Hang: links Bergseite (steigt), rechts Talseite: erst steiler, dann flacher Talboden
  if d < 0 then y += o * Smoothstep(0, 40, o) * 0.13
  else y += -(38 * (1 - Exp(-o / 140)) + 0.02 * o) * Smoothstep(0, 25, o);
  y += edge * VNoise(x * 0.11, z * 0.11) * 0.35;       // Tiefschnee-Wellen
  y += far * (Fbm(x * 0.012, z * 0.012, 4) + 0.3) * 16; // sanfte Huegel
  y += Smoothstep(W + 150, W + 400, ad) * Fbm(x * 0.005 + 7, z * 0.005, 3) * 40; // Fernrelief
  y += g * VNoise(x * 0.25, z * 0.25) * 0.05;          // leichte Pistenunebenheit
  if g > 0.001 then y += features(z, d) * g;
  Result := y;
end;

// Normale per zentralen finiten Differenzen (keine Raycasts)
function TCourse.normal(x, z: Float; outV: JVector3): JVector3;
const e = 0.25;
var hx, hz: Float;
begin
  hx := height(x + e, z) - height(x - e, z);
  hz := height(x, z + e) - height(x, z - e);
  Result := outV.set(-hx / (2 * e), 1, -hz / (2 * e)).normalize;
end;

end.
