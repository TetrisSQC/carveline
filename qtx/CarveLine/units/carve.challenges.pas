unit carve.challenges;

// Challenges — Slalom-Tore (Bonus/Strafzeit) und Sterne zum Einsammeln, deterministisch aus dem Course

interface

uses
  qtx.sysutils, carve.web, carve.util, carve.three, carve.course, carve.gfx;

type
  TGate = class
  public
    z, d, hw, x: Float;
    col, state: Integer;
  end;

  TStar = class
  public
    z, d, h, x, y: Float;
    got: Boolean;
  end;

  TGateProc = procedure(ok: Boolean);
  TStarProc = procedure(st: TStar);

  TChallenges = class
  private
    _m: JMatrix4; _q: JQuaternion; _s, _p, _up: JVector3;
    function NearKicker(z: Float): Boolean;
  public
    course: TCourse;
    gates: array of TGate;
    stars: array of TStar;
    poles, flags, stripes, starMesh: JInstancedMesh;
    t: Float;
    gateNext, passed, missed, got: Integer;
    constructor Create(scene: JScene; c: TCourse);
    procedure Reset;
    procedure SetGateColor(i, hex: Integer);
    // riding: Spieler faehrt (kein Sturz); center: Koerpermitte; liefert Ereignisse ueber Callbacks
    procedure Update(dt, z, x: Float; center: JVector3; riding: Boolean; onGate: TGateProc; onStar: TStarProc);
  end;

function MakeStar(Ro, Ri: Float): JBufferGeometry;

implementation

// Stern: aussen Ro, innen Ri (im Original R/r - in Pascal derselbe Bezeichner)
function MakeStar(Ro, Ri: Float): JBufferGeometry;
var a, q: Float;
begin
  var sh := new JShape;
  for var i := 0 to 10 do begin
    a := i / 10 * TAU + PI_ / 2; q := if i mod 2 = 1 then Ri else Ro;
    if i = 0 then sh.moveTo(Cos(a) * q, Sin(a) * q) else sh.lineTo(Cos(a) * q, Sin(a) * q);
  end;
  var g: JBufferGeometry := new JExtrudeGeometry(sh, class depth := 0.08; bevelEnabled := True; bevelThickness := 0.04; bevelSize := 0.04; bevelSegments := 2; end);
  g.translate(0, 0, -0.04); g.computeVertexNormals;
  Result := g;
end;

function TChallenges.NearKicker(z: Float): Boolean;
var cell: Float; kc: Integer;
begin
  var c := course; cell := c.Trk.kickCell;
  var k := TKicker.Create;
  for kc := Floor(z / cell) - 1 to Floor(z / cell) + 1 do
    if c.kicker(kc, k) and (z > k.z - 25) and (z < k.z + k.L + 30) then exit(True);
  Result := False;
end;

constructor TChallenges.Create(scene: JScene; c: TCourse);
var side, zf, z, gz, W, rr, d: Float; tt, i, n, kc: Integer;
begin
  course := c; zf := c.zf;
  // Tore: alle ~170 m, abwechselnd links/rechts versetzt, nicht im Bereich von Kickern
  side := 1;
  z := 230;
  while z < zf - 140 do begin
    gz := z; tt := 0;
    while (tt < 6) and NearKicker(gz) do begin gz += 25; Inc(tt); end;
    if not NearKicker(gz) then begin
      var g := TGate.Create; g.z := gz; g.d := side * c.width(gz) * 0.42; g.hw := 3.6; g.col := if side > 0 then $d7263d else $1f6bff; g.state := 0;
      gates.Add(g); side := -side;
    end;
    z += 170;
  end;
  // Sterne: Reihen auf der Piste, riskante am Rand, Boegen ueber Kickern
  var rng := TRNG.Create(Trunc(99 + zf));
  var addStar := procedure(sz, sd, sh: Float) begin var st := TStar.Create; st.z := sz; st.d := sd; st.h := sh; stars.Add(st); end;
  z := 140;
  while z < zf - 60 do begin
    W := c.width(z); rr := rng.Next;
    if rr < 0.55 then begin d := (rng.Next - 0.5) * W * 1.3; for i := 0 to 2 do addStar(z + i * 6, d, 1.0); end
    else if rr < 0.72 then addStar(z, (if rng.Next < 0.5 then -1.0 else 1.0) * (W + 3 + rng.Next * 3), 1.0);
    z += 55;
  end;
  var k := TKicker.Create;
  kc := 1;
  while kc * c.Trk.kickCell < zf do begin
    if c.kicker(kc, k) then
      for i := 0 to 2 do addStar(k.z + k.L + 5 + i * 5, k.d, 2.4 + Sin((i + 1) / 4 * PI_) * 1.2);
    Inc(kc);
  end;
  stars.Sort(lambda (a, b: TStar): Integer => if a.z < b.z then -1 else if a.z > b.z then 1 else 0);
  for var st in stars do begin st.x := c.cx(st.z) + st.d; st.y := c.height(st.x, st.z) + st.h; st.got := False; end;
  // Darstellung
  // Gut sichtbar auch bei Tempo: hohe Stangen, grosse Fahnen in unbeleuchteter Vollfarbe, farbiger Streifen auf dem Schnee
  n := gates.Length;
  poles := new JInstancedMesh(new JCylinderGeometry(0.07, 0.08, 2.5, 8).translate(0, 1.25, 0), new JMeshStandardMaterial(class roughness := 0.5; end), n * 2);
  flags := new JInstancedMesh(new JBoxGeometry(1.15, 1.0, 0.05).translate(0.58, 1.95, 0), new JMeshBasicMaterial, n * 2);
  stripes := new JInstancedMesh(AO_GEO, new JMeshBasicMaterial(class transparent := True; opacity := 0.8; depthWrite := False; polygonOffset := True; polygonOffsetFactor := -2; polygonOffsetUnits := -2; end), n);
  poles.castShadow := True; scene.add(poles); flags.castShadow := True; scene.add(flags);
  scene.add(stripes);
  _m := new JMatrix4; _q := new JQuaternion; _s := new JVector3(1, 1, 1); _p := new JVector3; _up := new JVector3(0, 1, 0);
  for i := 0 to n - 1 do begin
    var g := gates[i];
    g.x := c.cx(g.z) + g.d;
    for var kk := 0 to 1 do begin
      var s := if kk = 1 then 1.0 else -1.0; var x := g.x + s * g.hw; _p.set(x, c.height(x, g.z) - 0.05, g.z);
      poles.setMatrixAt(i * 2 + kk, _m.compose(_p, _q.setFromAxisAngle(_up, 0), _s));
      flags.setMatrixAt(i * 2 + kk, _m.compose(_p, _q.setFromAxisAngle(_up, if s > 0 then PI_ else 0.0), _s));   // Fahnen zeigen zur Tormitte
    end;
    var nrm := c.normal(g.x, g.z, new JVector3); _p.set(g.x, c.height(g.x, g.z) + 0.05, g.z);
    stripes.setMatrixAt(i, _m.compose(_p, _q.setFromUnitVectors(_up, nrm), new JVector3(g.hw * 2, 1, 1.4)));
  end;
  starMesh := new JInstancedMesh(MakeStar(0.42, 0.18), new JMeshStandardMaterial(class color := $ffc53d; emissive := $ff9d00; emissiveIntensity := 0.55; metalness := 0.35; roughness := 0.35; end), stars.Length);
  starMesh.castShadow := True; starMesh.frustumCulled := False; scene.add(starMesh);
  t := 0;
  Reset;
end;

procedure TChallenges.Reset;
begin
  var col := new JColor;
  for var i := 0 to gates.Length - 1 do begin
    var g := gates[i];
    g.state := 0; stripes.setColorAt(i, col.setHex(g.col));
    for var k := 0 to 1 do begin poles.setColorAt(i * 2 + k, col.setHex($f2f2f2)); flags.setColorAt(i * 2 + k, col.setHex(g.col)); end;
  end;
  for var m in [poles, flags, stripes] do begin
    m.instanceMatrix.needsUpdate := True;
    if Truthy(m.instanceColor) then m.instanceColor.needsUpdate := True;
    m.computeBoundingSphere;
  end;
  for var st in stars do st.got := False;
  gateNext := 0; passed := 0; missed := 0; got := 0;
end;

procedure TChallenges.SetGateColor(i, hex: Integer);
begin
  var col := new JColor(hex);
  for var k := 0 to 1 do flags.setColorAt(i * 2 + k, col);
  stripes.setColorAt(i, col); flags.instanceColor.needsUpdate := True; stripes.instanceColor.needsUpdate := True;
end;

procedure TChallenges.Update(dt, z, x: Float; center: JVector3; riding: Boolean; onGate: TGateProc; onStar: TStarProc);
var ok: Boolean;
begin
  t += dt;
  while (gateNext < gates.Length) and (gates[gateNext].z <= z) do begin
    var g := gates[gateNext]; ok := riding and (Abs(x - g.x) <= g.hw);
    g.state := if ok then 1 else 2;
    if ok then Inc(passed) else Inc(missed);
    SetGateColor(gateNext, if ok then $2ecc71 else $8a8f99); onGate(ok); Inc(gateNext);
  end;
  for var i := 0 to stars.Length - 1 do begin
    var st := stars[i];
    if not st.got and riding and (Abs(st.z - center.z) < 2) and (Sqr(st.x - center.x) + Sqr(st.y - center.y) + Sqr(st.z - center.z) < 1.7) then begin
      st.got := True; Inc(got); onStar(st);
    end;
    _s.setScalar(if st.got then 0.0001 else 1.0); _p.set(st.x, st.y + Sin(t * 2.2 + i) * 0.12, st.z);
    starMesh.setMatrixAt(i, _m.compose(_p, _q.setFromAxisAngle(_up, t * 2.4 + i * 0.7), _s));
  end;
  _s.setScalar(1); starMesh.instanceMatrix.needsUpdate := True;
end;

end.
