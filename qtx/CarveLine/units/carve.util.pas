unit carve.util;

// Mathe-Helfer, Rauschen und deterministischer Zufall (bitgenau wie im JS-Original)

interface

uses
  carve.web;

const
  TAU = 6.283185307179586;
  PI_ = 3.141592653589793;

type
  TRNG = class
  public
    s: Float;
    constructor Create(seed: Integer);
    function Next: Float;
    function Range(a, b: Float): Float;
  end;

  // Feder-Zustand (kritisch gedaempfte Feder, 1D)
  TSpring = class
  public
    x, v: Float;
    constructor Create(ax: Float = 0; av: Float = 0);
  end;

  // Steuereingabe fuer RiderPhysics (Spieler: TInput, Gegner: KI-Regler)
  TControls = class
  public
    steer, tuck, brake: Float;
    jump, grab: Boolean;
  end;

function ClampF(x, a, b: Float): Float;
function Lerp(a, b, t: Float): Float;
function Smoothstep(a, b, x: Float): Float;
function Damp(a, b, lam, dt: Float): Float;
function WrapAngle(a: Float): Float;
function SignF(x: Float): Float;
function Hash1(n: Float): Float;
function Hash2(x, y: Float): Float;
function VNoise(x, y: Float): Float;
function Fbm(x, y: Float; oct: Integer): Float;
function Hypot2(a, b: Float): Float; external 'Math.hypot';
function Hypot3(a, b, c: Float): Float; external 'Math.hypot';
procedure SpringStep(st: TSpring; target, k, c, dt: Float);
// JS-Modulo (Rest mit Vorzeichen des Dividenden) fuer Floats
function FMod(a, b: Float): Float;
// Math.round (rundet .5 immer nach oben, anders als Round() mit Banker's Rounding)
function JsRound(x: Float): Float;
// Formatierung wie im Original
function Pad2(n: Integer): String;

implementation

constructor TRNG.Create(seed: Integer);
begin
  s := seed;
  if s = 0 then s := 1;
end;

// mulberry32: identisch zur JS-Version (Math.imul, >>>)
function TRNG.Next: Float;
begin
  s := s + $6D2B79F5;
  asm
    var t = (@s);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    @Result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  end;
end;

constructor TSpring.Create(ax: Float = 0; av: Float = 0);
begin
  x := ax; v := av;
end;

function TRNG.Range(a, b: Float): Float;
begin
  Result := a + (b - a) * Next;
end;

function ClampF(x, a, b: Float): Float;
begin
  if x < a then Result := a
  else if x > b then Result := b
  else Result := x;
end;

function Lerp(a, b, t: Float): Float;
begin
  Result := a + (b - a) * t;
end;

function Smoothstep(a, b, x: Float): Float;
var t: Float;
begin
  t := ClampF((x - a) / (b - a), 0, 1);
  Result := t * t * (3 - 2 * t);
end;

function Damp(a, b, lam, dt: Float): Float;
begin
  Result := Lerp(a, b, 1 - Exp(-lam * dt));
end;

function FMod(a, b: Float): Float;
begin
  asm @Result = (@a) % (@b); end;
end;

function WrapAngle(a: Float): Float;
begin
  a := FMod(a + PI_, TAU);
  if a < 0 then a += TAU;
  Result := a - PI_;
end;

function SignF(x: Float): Float;
begin
  if x < 0 then Result := -1 else Result := 1;
end;

function Hash1(n: Float): Float;
var s: Float;
begin
  s := Sin(n * 127.1 + 311.7) * 43758.5453;
  Result := s - Floor(s);
end;

function Hash2(x, y: Float): Float;
var s: Float;
begin
  s := Sin(x * 127.1 + y * 311.7) * 43758.5453;
  Result := s - Floor(s);
end;

function VNoise(x, y: Float): Float;
var xi, yi, xf, yf, u, v, a, b, c, d: Float;
begin
  xi := Floor(x); yi := Floor(y); xf := x - xi; yf := y - yi;
  u := xf * xf * (3 - 2 * xf); v := yf * yf * (3 - 2 * yf);
  a := Hash2(xi, yi); b := Hash2(xi + 1, yi); c := Hash2(xi, yi + 1); d := Hash2(xi + 1, yi + 1);
  Result := (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
end;

function Fbm(x, y: Float; oct: Integer): Float;
var s, a, f: Float; i: Integer;
begin
  s := 0; a := 0.5; f := 1;
  for i := 0 to oct - 1 do begin
    s += a * VNoise(x * f, y * f); f *= 2.03; a *= 0.5;
  end;
  Result := s;
end;

procedure SpringStep(st: TSpring; target, k, c, dt: Float);
begin
  st.v += (k * (target - st.x) - c * st.v) * dt;
  st.x += st.v * dt;
end;

function JsRound(x: Float): Float;
begin
  Result := Floor(x + 0.5);
end;

function Pad2(n: Integer): String;
begin
  Result := IntToStr(n);
  if n < 10 then Result := '0' + Result;
end;

end.
