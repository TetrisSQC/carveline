unit carve.world;

// Resort (Lifte, Gebaeude, Doerfer) und Terrain (gestreamte Chunks mit Props per InstancedMesh)

interface

uses
  qtx.sysutils, carve.web, carve.util, carve.config, carve.three, carve.course, carve.gfx, carve.props;

type
  TCircle = class
  public
    x, z, r: Float;
    constructor Create(ax, az, ar: Float);
  end;

  TSpan = class
  public
    a, b: JVector3;
  end;

  TLiftNode = class
  public
    p: JVector3;
    g, h: Float;
    st: Boolean;
    lat, top: JVector3;
  end;

  TLift = class
  public
    nodes: array of TLiftNode;
    side: Float;
    path: array of JVector3;
    cum: array of Float;
  end;

  THouse = class
  public
    typ: Integer;
    x, z, rot: Float;
    im: JInstancedMesh;
    idx: Integer;
    m: JMatrix4;
  end;

  // Resort — Sessellifte (Stationen, Stuetzen, Seile, fahrende Sessel) und Gebaeude.
  // Statisch einmal gebaut (deterministisch); liefert Kollisions- und Sperrflaechen.
  TResort = class
  private
    FScene: JScene;
    FRng: TRNG;
    FHouses: array of THouse;
    FMat: JMeshStandardMaterial;
    _m: JMatrix4; _q: JQuaternion; _p: JVector3; _x, _y, _z, _a: JVector3;
    function Mk(geo: JBufferGeometry; count: Integer): JInstancedMesh;
    function TryHouse(x, z: Float; typ: Integer; rot: Float): Boolean;
    function Pick(list: array of Integer): Integer;
    procedure Village(x0, z0, R: Float; count: Integer; types: array of Integer);
  public
    course: TCourse;
    obst: array of TCircle;
    spans: array of TSpan;
    clearings: array of TCircle;
    lifts: array of TLift;
    houseMeshes: array of JInstancedMesh;
    chairs: JInstancedMesh;
    chairSp, t: Float;
    visKey: String;
    constructor Create(scene: JScene; c: TCourse);
    procedure Update(dt: Float);
    procedure UpdateVisibility(z0, z1: Float);
    function Hit(x, z, rad: Float): Boolean;
    function Blocked(x, z, pad: Float; clear: Boolean = True): Boolean;
    property houses: array of THouse read FHouses;
  end;

  TChunk = class
  public
    idx: Integer;
    mesh: JMesh;
    hi, lo, rocks, poles, ao: JInstancedMesh;
    net: JMesh;
    H, X: JFloat32Array;
    center: JVector3;
    tx, tz, tr: JFloat32Array;
    tn: Integer;
  end;

  // Terrain — gestreamte Chunks (Pooling), Props per InstancedMesh
  TTerrain = class
  private
    FScene: JScene;
    _m: JMatrix4; _q: JQuaternion; _s, _p: JVector3; _e: JEuler; _c: JColor;
    _n: JVector3; _qa: JQuaternion; _up: JVector3;
    function CreateChunk: TChunk;
    procedure BuildProps(ch: TChunk; idx: Integer; z0, CL: Float; kick: array of TKicker);
    procedure Release(ch: TChunk);
    function Ensure(i: Integer): Boolean;
    function FindActive(i: Integer): TChunk;
    procedure RemoveActive(k: Integer);
  public
    course: TCourse;
    resort: TResort;
    snowMat: JMeshStandardMaterial;
    treeMat, rockMat, poleMat, netMat: JMeshStandardMaterial;
    aoMat: JMeshBasicMaterial;
    treeHi, treeLo, rockGeo, poleGeo: JBufferGeometry;
    pool: array of TChunk;
    active: array of TChunk;
    treeCount, ahead: Integer;
    constructor Create(scene: JScene; c: TCourse);
    // Gelaende ohne Chunks (keine Baeume) - nur fuer Tests der Physik
    constructor CreateStub(c: TCourse; r: TResort);
    procedure Build(ch: TChunk; idx: Integer);
    procedure Update(z: Float; camPos: JVector3; maxBuilds: Integer = 1);
    procedure RebuildAll(z: Float; camPos: JVector3);
    function HitTree(x, z, rad: Float): Boolean;
  end;

implementation

constructor TCircle.Create(ax, az, ar: Float);
begin
  x := ax; z := az; r := ar;
end;

function V3(x, y, z: Float): JVector3;
begin
  Result := new JVector3(x, y, z);
end;

{ TResort }

const RADII: array [0..7] of Float = (5.6, 4.6, 10, 12, 11, 10, 3.5, 6.2); // Kollisionsradius je Gebaeudetyp

function TResort.Mk(geo: JBufferGeometry; count: Integer): JInstancedMesh;
begin
  if FMat = nil then FMat := new JMeshStandardMaterial(class vertexColors := True; roughness := 0.85; end);
  Result := new JInstancedMesh(geo, FMat, Max(count, 1));
  Result.castShadow := True; Result.receiveShadow := True; Result.count := 0;
  FScene.add(Result);
end;

function TResort.TryHouse(x, z: Float; typ: Integer; rot: Float): Boolean;
var sx, sz: Float;
begin
  var c := course;
  sx := (c.height(x + 4, z) - c.height(x - 4, z)) / 8; sz := (c.height(x, z + 4) - c.height(x, z - 4)) / 8;
  if (Hypot2(sx, sz) > 0.42) or Blocked(x, z, 7, False) then exit(False);
  var h := THouse.Create; h.typ := typ; h.x := x; h.z := z; h.rot := rot;
  FHouses.Add(h); obst.Add(TCircle.Create(x, z, RADII[typ]));
  Result := True;
end;

function TResort.Pick(list: array of Integer): Integer;
begin
  Result := list[Trunc(FRng.Next * list.Length)];
end;

// Dorf: Kirche in der Mitte, gemischte Haeuser im Ring drumherum (Lichtung fuer Baeume)
procedure TResort.Village(x0, z0, R: Float; count: Integer; types: array of Integer);
var t, i, n: Integer; a, rr: Float;
begin
  clearings.Add(TCircle.Create(x0, z0, R + 25));
  t := 0;
  while (t < 14) and not TryHouse(x0 + (FRng.Next - 0.5) * t * 8, z0 + (FRng.Next - 0.5) * t * 8, 3, (FRng.Next - 0.5) * 0.4 + PI_ / 2) do Inc(t);
  i := 0; n := 0;
  while (i < count * 5) and (n < count) do begin
    a := FRng.Next * TAU; rr := 24 + Sqrt(FRng.Next) * (R - 24);
    if TryHouse(x0 + Cos(a) * rr, z0 + Sin(a) * rr, Pick(types), (FRng.Next - 0.5) * 0.5 + (if FRng.Next < 0.3 then PI_ / 2 else 0.0)) then Inc(n);
    Inc(i);
  end;
end;

constructor TResort.Create(scene: JScene; c: TCourse);
var LZ, za, zb, side, off, z, x, g, u, len, need, y, zv, xv, zt, tt, sd, yaw: Float;
    n, k, it, li, i, kk, dir: Integer;
    liftDefs: array of Float;
begin
  FScene := scene; course := c; t := 0;
  // Gebaeudetypen: 0 Chalet, 1 kleines Chalet, 2 Berghuette, 3 Kirche, 4 Bauernhaus, 5 Hotel, 6 Heustadel, 7 Chalet verputzt
  FRng := TRNG.Create(4242);
  // --- Lifte: [Bergstation z, Talstation z, Seite (-1 Bergseite / +1 Talseite), Abstand vom Pistenrand]
  LZ := c.zf;
  liftDefs := [22.0, LZ * 0.31, -1.0, 16.0, LZ * 0.34, LZ * 0.66, 1.0, 18.0, LZ * 0.69, LZ + 60, -1.0, 16.0];
  for li := 0 to 2 do begin
    za := liftDefs[li * 4]; zb := liftDefs[li * 4 + 1]; side := liftDefs[li * 4 + 2]; off := liftDefs[li * 4 + 3];
    n := Ceil((zb - za) / 72);
    var lift := TLift.Create; lift.side := side;
    for k := 0 to n do begin
      z := za + (zb - za) * k / n; x := c.cx(z) + side * (c.width(z) + off); g := c.height(x, z);
      var nd := TLiftNode.Create; nd.p := V3(x, g, z); nd.g := g; nd.st := (k = 0) or (k = n);
      nd.h := if nd.st then 5.6 else 10.0;
      lift.nodes.Add(nd);
    end;
    // Stuetzen anheben, bis das Seil ueberall >= 5 m ueber Grund haengt
    for it := 0 to 3 do for k := 0 to n - 1 do begin
      var A := lift.nodes[k]; var B := lift.nodes[k + 1]; len := A.p.distanceTo(B.p);
      need := 0;
      u := 0.2;
      while u < 0.9 do begin
        x := Lerp(A.p.x, B.p.x, u); z := Lerp(A.p.z, B.p.z, u); y := Lerp(A.g + A.h, B.g + B.h, u) - 0.012 * len * 4 * u * (1 - u);
        need := Max(need, c.height(x, z) + 5 - y);
        u += 0.2;
      end;
      if need > 0 then begin
        if not A.st then A.h := Min(A.h + need, 24.0);
        if not B.st then B.h := Min(B.h + need, 24.0);
      end;
    end;
    for k := 0 to n do begin                                   // Querrichtung je Knoten
      var a := lift.nodes[Max(0, k - 1)].p; var b := lift.nodes[Min(n, k + 1)].p;
      var dx := b.x - a.x; var dz := b.z - a.z; var l := Hypot2(dx, dz);
      lift.nodes[k].lat := V3(dz / l, 0, -dx / l); lift.nodes[k].top := V3(lift.nodes[k].p.x, lift.nodes[k].g + lift.nodes[k].h, lift.nodes[k].p.z);
    end;
    lifts.Add(lift);
    for k := 0 to n - 1 do begin
      var sp := TSpan.Create; sp.a := lift.nodes[k].p; sp.b := lift.nodes[k + 1].p; spans.Add(sp);
    end;
    for var nd in lift.nodes do obst.Add(TCircle.Create(nd.p.x, nd.p.z, if nd.st then 6.5 else 0.8));
    // Berghuette neben der Bergstation
    var hh := THouse.Create; hh.typ := 2; hh.x := lift.nodes[0].p.x + side * 19; hh.z := za + 6; hh.rot := 0;
    FHouses.Add(hh); obst.Add(TCircle.Create(lift.nodes[0].p.x + side * 19, za + 6, RADII[2]));
  end;
  // --- Berghuetten an der Piste (Talseite, Terrasse zur Piste) + Streusiedlung + Zieldorf
  for var zz in [LZ * 0.19, LZ * 0.49, LZ * 0.81] do begin
    x := c.cx(zz) + c.width(zz) + 15;
    var hh := THouse.Create; hh.typ := 2; hh.x := x; hh.z := zz; hh.rot := -PI_ / 2;
    FHouses.Add(hh); obst.Add(TCircle.Create(x, zz, RADII[2]));
  end;
  z := 140;
  while z < c.zf - 120 do begin
    if FRng.Next > 0.5 then begin z += 85; continue; end;
    side := if FRng.Next < 0.65 then -1.0 else 1.0;                 // meist Bergseite: dort sichtbar
    off := c.width(z) + 30 + FRng.Next * 150;
    kk := 1 + Trunc(FRng.Next * 3);
    for i := 0 to kk - 1 do
      TryHouse(c.cx(z) + side * (off + (FRng.Next - 0.5) * 30), z + (FRng.Next - 0.5) * 40, Pick([0, 1, 4, 6, 7, 6]), (FRng.Next - 0.5) * 0.4);
    z += 85;
  end;
  // Weiler mit Kirche auf halber Strecke auf einer Hangterrasse der Bergseite (liegt ueber der Piste -> beim Heranfahren sichtbar)
  zv := LZ * 0.56; xv := c.cx(zv) - c.width(zv) - 80;
  Village(xv, zv, 60, 10, [0, 1, 4, 6, 7]);
  tt := 0;
  while tt <= 1 do begin
    z := zv - 220 * (1 - tt); x := Lerp(c.cx(z) - c.width(z) - 20, xv, tt);
    clearings.Add(TCircle.Create(x, z, 30 + 25 * tt));
    tt += 0.2;
  end;
  // Talort am Ende der Abfahrt: auf dem flachen Auslauf, von der ganzen unteren Strecke aus im Tal zu sehen
  zt := LZ + 330; Village(c.cx(zt) + c.width(zt) + 70, zt, 115, 22, [0, 0, 1, 4, 5, 5, 6, 7, 7]);
  TryHouse(c.cx(LZ + 80) - c.width(LZ + 80) - 20, LZ + 80, 5, 0);
  z := c.zf + 30;
  while z < c.zf + 520 do begin
    for var si := 0 to 1 do begin
      side := if si = 0 then -1.0 else 1.0;
      if FRng.Next < 0.3 then continue;
      TryHouse(c.cx(z) + side * (c.width(z) + 12 + FRng.Next * 110), z + (FRng.Next - 0.5) * 10, Pick([0, 0, 1, 4, 5, 6, 7, 7]), (FRng.Next - 0.5) * 0.5 + (if FRng.Next < 0.25 then PI_ / 2 else 0.0));
    end;
    z += 26;
  end;
  // --- Gebaeude-Instanzen
  var types: array of JBufferGeometry := [MakeChalet(9, 7.5, 2), MakeChalet(7, 6, 1, ChaletOpts($7a4b2a)), MakeChalet(15, 10, 2, ChaletOpts($5c3920, False, False, True)), MakeChurch, MakeFarmhouse,
    MakeChalet(16, 11, 3, ChaletOpts($5c3920, True, True)), MakeChalet(5, 4.5, 1, ChaletOpts($5a3a24, False, False, False, True, True)), MakeChalet(10, 8, 2, ChaletOpts($7a4b2a, True))];
  var m := new JMatrix4; var q := new JQuaternion; var s := new JVector3(1, 1, 1); var p := new JVector3; var up := V3(0, 1, 0);
  for var ti := 0 to types.Length - 1 do begin
    var cnt := 0;
    for var h in FHouses do if h.typ = ti then Inc(cnt);
    houseMeshes.Add(Mk(types[ti], cnt));
  end;
  for var h in FHouses do begin
    var im := houseMeshes[h.typ]; g := c.height(h.x, h.z);
    p.set(h.x, g - 0.3, h.z); q.setFromAxisAngle(up, h.rot); m.compose(p, q, s);
    h.im := im; h.idx := im.count; h.m := m.clone; im.setMatrixAt(im.count, m); im.count := im.count + 1;
  end;
  for var im in houseMeshes do begin im.instanceMatrix.needsUpdate := True; im.computeBoundingSphere; end;
  visKey := '';
  // --- Stuetzen, Stationen, Seile
  var pylons: array of JMatrix4; var stations: array of JMatrix4; var cable: array of Float;
  for var lf in lifts do begin
    var NN := lf.nodes;
    for k := 0 to NN.Length - 1 do begin
      var nd := NN[k]; yaw := ArcTan2(nd.lat.x, nd.lat.z) - PI_ / 2;
      q.setFromAxisAngle(up, yaw);
      if nd.st then begin
        p.set(nd.p.x, nd.g - 0.2, nd.p.z);
        var qs := q.clone.multiply(new JQuaternion().setFromAxisAngle(up, if k = 0 then PI_ else 0.0));
        stations.Add(new JMatrix4().compose(p, qs, s));
      end else begin
        p.set(nd.p.x, nd.g, nd.p.z); pylons.Add(new JMatrix4().compose(p, q, new JVector3(1, nd.h / 10, 1)));
      end;
    end;
    // Seilschleife: bergauf auf Seite +lat, bergab auf -lat (Talstation -> Bergstation -> zurueck)
    for dir := 0 to 1 do begin
      var seq: array of TLiftNode;
      if dir = 0 then begin for k := NN.Length - 1 downto 0 do seq.Add(NN[k]); sd := 2.3; end
      else begin seq := NN; sd := -2.3; end;
      for k := 0 to seq.Length - 2 do begin
        var A := seq[k]; var B := seq[k + 1]; len := A.top.distanceTo(B.top);
        u := 0;
        while u < 1 do begin
          var pt := V3(0, 0, 0).lerpVectors(A.top, B.top, u).addScaledVector(A.lat.clone.lerp(B.lat, u), sd);
          pt.y -= 0.012 * len * 4 * u * (1 - u); lf.path.Add(pt);
          u += 1 / 8;
        end;
      end;
      var E := seq[seq.Length - 1]; lf.path.Add(E.top.clone.addScaledVector(E.lat, sd));
    end;
    lf.path.Add(lf.path[0].clone);
    for k := 0 to lf.path.Length - 2 do begin
      cable.Add(lf.path[k].x); cable.Add(lf.path[k].y + 0.02); cable.Add(lf.path[k].z);
      cable.Add(lf.path[k + 1].x); cable.Add(lf.path[k + 1].y + 0.02); cable.Add(lf.path[k + 1].z);
    end;
    lf.cum := [0.0];
    for k := 1 to lf.path.Length - 1 do lf.cum.Add(lf.cum[k - 1] + lf.path[k].distanceTo(lf.path[k - 1]));
  end;
  begin // Kontaktschatten unter allen Hindernissen
    var ao := new JInstancedMesh(AO_GEO, MakeAOMaterial, obst.Length); var nv := V3(0, 0, 0); var qa := new JQuaternion;
    for i := 0 to obst.Length - 1 do begin
      var o := obst[i];
      c.normal(o.x, o.z, nv); qa.setFromUnitVectors(up, nv);
      var r := if o.r < 1 then 3.2 else o.r * 2.9;
      m.compose(p.set(o.x, c.height(o.x, o.z) + 0.08, o.z), qa, new JVector3(r, 1, r)); ao.setMatrixAt(i, m);
    end;
    ao.instanceMatrix.needsUpdate := True; ao.computeBoundingSphere; scene.add(ao);
  end;
  var pyl := Mk(MakePylon, pylons.Length);
  for i := 0 to pylons.Length - 1 do pyl.setMatrixAt(i, pylons[i]);
  pyl.count := pylons.Length; pyl.instanceMatrix.needsUpdate := True; pyl.computeBoundingSphere;
  var sta := Mk(MakeStation, stations.Length);
  for i := 0 to stations.Length - 1 do sta.setMatrixAt(i, stations[i]);
  sta.count := stations.Length; sta.instanceMatrix.needsUpdate := True; sta.computeBoundingSphere;
  var cg := new JBufferGeometry; cg.setAttribute('position', new JFloat32BufferAttribute(cable, 3));
  scene.add(new JLineSegments(cg, new JLineBasicMaterial(class color := $23272e; end)));
  // Sessel (Abstand 15 m), ueber die Schleife verteilt
  chairSp := 15; var nc := 0;
  for var lf in lifts do nc += Floor(lf.cum[lf.cum.Length - 1] / chairSp);
  chairs := Mk(MakeChair, nc); chairs.frustumCulled := False; chairs.castShadow := False; chairs.count := nc;
  _m := m; _q := q; _p := p; _x := V3(0, 0, 0); _y := up; _z := V3(0, 0, 0); _a := V3(0, 0, 0);
  Update(0);
end;

// Sessel entlang der Seilschleife bewegen (2.3 m/s)
procedure TResort.Update(dt: Float);
var i, n, k, ci: Integer; tot, s, u, dd: Float;
begin
  t += dt; i := 0;
  for var lf in lifts do begin
    var P := lf.path; var cum := lf.cum; tot := cum[cum.Length - 1]; n := Floor(tot / chairSp); k := 0;
    for ci := 0 to n - 1 do begin
      s := FMod(ci * chairSp + t * 2.3, tot);
      while (k > 0) and (cum[k] > s) do Dec(k);
      while (k < cum.Length - 2) and (cum[k + 1] < s) do Inc(k);
      dd := cum[k + 1] - cum[k]; if dd = 0 then dd := 1;
      u := (s - cum[k]) / dd;
      _a.lerpVectors(P[k], P[k + 1], u); _z.subVectors(P[k + 1], P[k]).setY(0).normalize; _x.crossVectors(_y, _z);
      _m.makeBasis(_x, _y, _z).setPosition(_a); chairs.setMatrixAt(i, _m); Inc(i);
    end;
  end;
  chairs.instanceMatrix.needsUpdate := True;
end;

// Haeuser nur zeigen, wo das Gelaende geladen ist (sonst schweben sie weit voraus in der Luft)
procedure TResort.UpdateVisibility(z0, z1: Float);
begin
  var key := FloatToStr(JsRound(z0 / 32)) + ':' + FloatToStr(JsRound(z1 / 32));
  if key = visKey then exit;
  visKey := key;
  var zero := new JMatrix4().makeScale(0, 0, 0);
  for var h in FHouses do h.im.setMatrixAt(h.idx, if (h.z > z0) and (h.z < z1) then h.m else zero);
  for var im in houseMeshes do im.instanceMatrix.needsUpdate := True;
end;

// Kollision (Kreise) fuer den Fahrer
function TResort.Hit(x, z, rad: Float): Boolean;
var dx, dz, rr: Float;
begin
  for var o in obst do begin
    if Abs(o.z - z) > 12 then continue;
    dx := x - o.x; dz := z - o.z; rr := o.r + rad;
    if dx * dx + dz * dz < rr * rr then exit(True);
  end;
  Result := False;
end;

// Sperrflaechen fuer Baeume/Haeuser: Gebaeude, Stuetzen, Lifttrassen
function TResort.Blocked(x, z, pad: Float; clear: Boolean = True): Boolean;
var dx, dz, rr, tt: Float;
begin
  if clear then for var o in clearings do begin
    dx := x - o.x; dz := z - o.z;
    if dx * dx + dz * dz < o.r * o.r then exit(True);
  end;
  for var o in obst do begin
    if Abs(o.z - z) > 30 then continue;
    dx := x - o.x; dz := z - o.z; rr := o.r + pad;
    if dx * dx + dz * dz < rr * rr then exit(True);
  end;
  for var sp in spans do begin
    var a := sp.a; var b := sp.b;
    if (z < Min(a.z, b.z) - 8) or (z > Max(a.z, b.z) + 8) then continue;
    dx := b.x - a.x; dz := b.z - a.z; tt := ClampF(((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz), 0, 1);
    if Hypot2(x - a.x - tt * dx, z - a.z - tt * dz) < 7 + pad * 0.3 then exit(True);
  end;
  Result := False;
end;

{ TTerrain }

constructor TTerrain.Create(scene: JScene; c: TCourse);
begin
  FScene := scene; course := c;
  snowMat := MakeSnowMaterial;
  treeMat := new JMeshStandardMaterial(class vertexColors := True; roughness := 0.9; side := DoubleSide; end);
  treeMat.onBeforeCompile := procedure(sh: Variant)
  begin
    sh.fragmentShader := JsReplace(sh.fragmentShader, '#include <color_fragment>', '#include <color_fragment>' + #10 + '  if (!gl_FrontFacing) diffuseColor.rgb = vec3(0.035, 0.09, 0.055);');
  end;
  aoMat := MakeAOMaterial;
  rockMat := new JMeshStandardMaterial(class vertexColors := True; roughness := 0.95; flatShading := True; end);
  poleMat := new JMeshStandardMaterial(class map := MakeStripeTex; roughness := 0.5; end);
  var netTex := MakeNetTex; netTex.&repeat.set(1, 1);
  netMat := new JMeshStandardMaterial(class map := netTex; color := $ff5a1f; alphaTest := 0.5; side := DoubleSide; roughness := 0.8; end);
  treeHi := MakeTreeGeometry(True); treeLo := MakeTreeGeometry(False);
  rockGeo := MakeRockGeometry;
  poleGeo := new JCylinderGeometry(0.03, 0.035, 1.7, 6); poleGeo.translate(0, 0.85, 0);
  treeCount := PRESET_HIGH.trees; ahead := 9;
  _m := new JMatrix4; _q := new JQuaternion; _s := new JVector3; _p := new JVector3; _e := new JEuler; _c := new JColor;
  _n := new JVector3; _qa := new JQuaternion; _up := new JVector3(0, 1, 0);
  for var i := 0 to MAX_CHUNKS - 1 do pool.Add(CreateChunk);
end;

constructor TTerrain.CreateStub(c: TCourse; r: TResort);
begin
  course := c; resort := r;
end;

function TTerrain.CreateChunk: TChunk;
const A = CONFIG.chunkSegAlong; B = CONFIG.chunkSegLat; maxNetV = 33 * 2 * 6;
var nv, k, aa, bb, i0, i1, i2, i3: Integer;
begin
  nv := (A + 1) * (B + 1);
  var geo := new JBufferGeometry;
  geo.setAttribute('position', new JBufferAttribute(new JFloat32Array(nv * 3), 3));
  geo.setAttribute('normal', new JBufferAttribute(new JFloat32Array(nv * 3), 3));
  geo.setAttribute('uv', new JBufferAttribute(new JFloat32Array(nv * 2), 2));
  geo.setAttribute('color', new JBufferAttribute(new JFloat32Array(nv * 3), 3));
  geo.setAttribute('groom', new JBufferAttribute(new JFloat32Array(nv), 1));
  var idx := new JUint32Array(A * B * 6); k := 0;
  for aa := 0 to A - 1 do for bb := 0 to B - 1 do begin
    i0 := aa * (B + 1) + bb; i1 := i0 + 1; i2 := i0 + B + 1; i3 := i2 + 1;
    idx[k] := i0; idx[k + 1] := i2; idx[k + 2] := i1; idx[k + 3] := i1; idx[k + 4] := i2; idx[k + 5] := i3; k += 6;
  end;
  geo.setIndex(new JBufferAttribute(idx, 1));
  var ch := TChunk.Create;
  ch.mesh := new JMesh(geo, snowMat); ch.mesh.receiveShadow := True; ch.mesh.visible := False;
  ch.hi := new JInstancedMesh(treeHi, treeMat, MAX_TREES); ch.hi.castShadow := True; ch.hi.receiveShadow := True;
  ch.lo := new JInstancedMesh(treeLo, treeMat, MAX_TREES);
  ch.rocks := new JInstancedMesh(rockGeo, rockMat, 16); ch.rocks.castShadow := True; ch.rocks.receiveShadow := True;
  ch.poles := new JInstancedMesh(poleGeo, poleMat, 72); ch.poles.castShadow := True;
  ch.ao := new JInstancedMesh(AO_GEO, aoMat, MAX_TREES + 16);
  var ng := new JBufferGeometry;
  ng.setAttribute('position', new JBufferAttribute(new JFloat32Array(maxNetV * 3), 3));
  ng.setAttribute('normal', new JBufferAttribute(new JFloat32Array(maxNetV * 3), 3));
  ng.setAttribute('uv', new JBufferAttribute(new JFloat32Array(maxNetV * 2), 2));
  ch.net := new JMesh(ng, netMat);
  for var o in [JObject3D(ch.hi), ch.lo, ch.rocks, ch.poles, ch.net, ch.ao] do begin o.visible := False; FScene.add(o); end;
  FScene.add(ch.mesh);
  // Grid-Zwischenspeicher (inkl. Randzeilen fuer Normalen)
  ch.H := new JFloat32Array((A + 3) * (B + 1)); ch.X := new JFloat32Array((A + 3) * (B + 1));
  ch.idx := -1; ch.center := new JVector3;
  ch.tx := new JFloat32Array(MAX_TREES); ch.tz := new JFloat32Array(MAX_TREES); ch.tr := new JFloat32Array(MAX_TREES); ch.tn := 0;
  Result := ch;
end;

procedure TTerrain.Build(ch: TChunk; idx: Integer);
const SA = CONFIG.chunkSegAlong; SB = CONFIG.chunkSegLat; CL = CONFIG.chunkLength; HW = CONFIG.chunkHalfWidth;
var z0, dz, z, cz, tt, u, x, y, d, dhdx, dhdz, nx, ny, nz, l, ad, g, r, gg, bb, wind, rock, rn, W: Float;
    a, b, i, gi, vi, bl, br, up, dn, kc: Integer;
begin
  var c := course;
  z0 := idx * CL; dz := CL / SA;
  var Hg := ch.H; var Xg := ch.X;
  ch.idx := idx;
  // Hoehen-Grid
  for a := -1 to SA + 1 do begin
    z := z0 + a * dz; cz := c.cx(z);
    for b := 0 to SB do begin
      tt := b / SB * 2 - 1; u := HW * (0.15 * tt + 0.85 * Power(tt, 5)); x := cz + u; i := (a + 1) * (SB + 1) + b;
      Xg[i] := x; Hg[i] := c.height(x, z);
    end;
  end;
  var geo := ch.mesh.geometry; var Pos := geo.attributes.position.&array; var Nrm := geo.attributes.normal.&array;
  var UV := geo.attributes.uv.&array; var Col := geo.attributes.color.&array; var Grm := geo.attributes.groom.&array;
  var kick: array of TKicker;
  for kc := Floor(z0 / c.Trk.kickCell) - 1 to Floor((z0 + CL) / c.Trk.kickCell) do begin
    var k := TKicker.Create;
    if c.kicker(kc, k) then kick.Add(k);
  end;
  for a := 0 to SA do begin
    z := z0 + a * dz; cz := c.cx(z); W := c.width(z);
    for b := 0 to SB do begin
      gi := (a + 1) * (SB + 1) + b; vi := a * (SB + 1) + b;
      x := Xg[gi]; y := Hg[gi]; d := x - cz;
      bl := if b > 0 then b - 1 else b; br := if b < SB then b + 1 else b;
      dhdx := (Hg[(a + 1) * (SB + 1) + br] - Hg[(a + 1) * (SB + 1) + bl]) / (Xg[(a + 1) * (SB + 1) + br] - Xg[(a + 1) * (SB + 1) + bl]);
      up := (a + 2) * (SB + 1) + b; dn := a * (SB + 1) + b;
      dhdz := ((Hg[up] - Hg[dn]) - dhdx * (Xg[up] - Xg[dn])) / (2 * dz);
      nx := -dhdx; ny := 1; nz := -dhdz; l := Hypot3(nx, ny, nz); nx /= l; ny /= l; nz /= l;
      Pos[vi * 3] := x; Pos[vi * 3 + 1] := y; Pos[vi * 3 + 2] := z;
      Nrm[vi * 3] := nx; Nrm[vi * 3 + 1] := ny; Nrm[vi * 3 + 2] := nz;
      tt := b / SB * 2 - 1; UV[vi * 2] := HW * (0.15 * tt + 0.85 * Power(tt, 5)) / 4; UV[vi * 2 + 1] := z / 4;
      ad := Abs(d); g := 1 - Smoothstep(W - 1.5, W + 7, ad); Grm[vi] := g;
      // Farbe: praeparierter Schnee etwas grauer/kompakter, Tiefschnee heller, steile Flanken = Fels
      r := Lerp(0.97, 0.84, g); gg := Lerp(0.98, 0.88, g); bb := Lerp(1.0, 0.95, g);
      wind := Lerp(0.955 + 0.06 * Fbm(x * 0.045, z * 0.045, 2), 1, g); r *= wind; gg *= wind; bb *= Lerp(wind, 1, 0.5); // Windverwehungen
      rock := Smoothstep(0.66, 0.52, ny) * (0.6 + 0.4 * VNoise(x * 0.07, z * 0.07));
      rn := 0.9 + 0.1 * Hash2(Floor(x * 0.5), Floor(z * 0.5));
      r := Lerp(r, 0.33 * rn, rock); gg := Lerp(gg, 0.31 * rn, rock); bb := Lerp(bb, 0.30 * rn, rock);
      for var k in kick do if (Abs(z - (k.z + k.L)) < 0.55) and (Abs(d - k.d) < 3.6) then begin r := 0.15; gg := 0.4; bb := 0.95; end;
      if ((Abs(z - c.zf) < 0.6) or (Abs(z - 3) < 0.4)) and (ad < W) then begin r := 0.95; gg := 0.12; bb := 0.08; end;
      Col[vi * 3] := r; Col[vi * 3 + 1] := gg; Col[vi * 3 + 2] := bb;
    end;
  end;
  geo.attributes.position.needsUpdate := True; geo.attributes.normal.needsUpdate := True; geo.attributes.uv.needsUpdate := True;
  geo.attributes.color.needsUpdate := True; geo.attributes.groom.needsUpdate := True;
  geo.computeBoundingSphere;
  ch.center.set(c.cx(z0 + CL / 2), Hg[(SA div 2 + 1) * (SB + 1) + SB div 2], z0 + CL / 2);
  ch.mesh.visible := True;
  BuildProps(ch, idx, z0, CL, kick);
end;

procedure TTerrain.BuildProps(ch: TChunk; idx: Integer; z0, CL: Float; kick: array of TKicker);
const hh = 1.35;
var na, n, k, r, pc, nv, si, v, sd: Integer; z, W, off, x, sc, rot, forest, y, slope, zz, cz, zl, za, zb, xa, xb, ya, yb, side: Float;
begin
  var c := course; var m := _m; var q := _q; var s := _s; var p := _p; var e := _e;
  var rng := TRNG.Create(idx * 7919 + 13);
  na := 0; var nrm := _n; var qa := _qa; var UP := _up;
  var addAO := procedure(x, z, r: Float)                   // Fleck an die Gelaendeneigung angelegt
  begin
    c.normal(x, z, nrm); qa.setFromUnitVectors(UP, nrm); p.set(x, c.height(x, z) + 0.06, z); s.set(r, 1, r);
    m.compose(p, qa, s); ch.ao.setMatrixAt(na, m); Inc(na);
  end;
  // Baeume (hi+lo teilen Matrizen)
  n := 0; ch.tn := 0; k := 0;
  while (k < treeCount * 6) and (n < treeCount) do begin
    Inc(k);
    z := z0 + rng.Next * CL; side := if rng.Next < 0.5 then -1.0 else 1.0; W := c.width(z);
    off := W + 8 + rng.Next * 290; x := c.cx(z) + side * off;
    sc := 0.7 + rng.Next * 0.85; rot := rng.Next * TAU;
    // Dichte: nahe der Piste locker verstreute Einzelbaeume, weiter weg Waldbaender (Rauschmaske)
    forest := Smoothstep(-0.05, 0.25, Fbm(x * 0.008 + 3, z * 0.008, 3)) * Smoothstep(W + c.Trk.forestFrom, W + c.Trk.forestFrom + 70, off);
    if rng.Next > c.Trk.forest + (1 - c.Trk.forest) * forest then continue;
    if (resort <> nil) and resort.Blocked(x, z, 2) then continue;
    y := c.height(x, z);
    slope := Abs(c.height(x + 1, z) - c.height(x - 1, z)) * 0.5;
    if slope > 1.1 then continue;
    p.set(x, y - 0.3, z); q.setFromEuler(e.set(0, rot, 0)); s.set(sc, sc * (0.9 + rng.Next * 0.35), sc);
    m.compose(p, q, s); ch.hi.setMatrixAt(n, m); ch.lo.setMatrixAt(n, m); addAO(x, z, 3.6 * sc);
    if off < W + 140 then begin ch.tx[ch.tn] := x; ch.tz[ch.tn] := z; ch.tr[ch.tn] := 0.35 * sc + 0.25; Inc(ch.tn); end;
    Inc(n);
  end;
  ch.hi.count := n; ch.lo.count := n;
  ch.hi.instanceMatrix.needsUpdate := True; ch.lo.instanceMatrix.needsUpdate := True;
  ch.hi.computeBoundingSphere; ch.lo.boundingSphere := ch.hi.boundingSphere.clone;
  // Felsen
  r := 0;
  for k := 0 to 15 do begin
    z := z0 + rng.Next * CL; side := if rng.Next < 0.5 then -1.0 else 1.0; W := c.width(z);
    x := c.cx(z) + side * (W + 5 + rng.Next * 80); sc := 0.4 + Power(rng.Next, 2) * 2.4;
    if (resort <> nil) and resort.Blocked(x, z, 3) then continue;
    p.set(x, c.height(x, z) - sc * 0.3, z); q.setFromEuler(e.set(rng.Next * 0.5, rng.Next * TAU, rng.Next * 0.5)); s.set(sc, sc * (0.6 + rng.Next * 0.6), sc * (0.8 + rng.Next * 0.5));
    m.compose(p, q, s); ch.rocks.setMatrixAt(r, m); Inc(r); addAO(x, z, 2.6 * sc);
  end;
  ch.rocks.count := r; ch.rocks.instanceMatrix.needsUpdate := True; ch.rocks.computeBoundingSphere;
  ch.ao.count := na; ch.ao.instanceMatrix.needsUpdate := True; ch.ao.computeBoundingSphere; ch.ao.visible := na > 0;
  // Stangen: Pistenmarkierung, Kicker-Flaggen, Netzpfosten
  pc := 0; var col := _c;
  var addPole := procedure(x, z, sy: Float; hex: Integer; tilt: Float)
  begin
    if pc >= 72 then exit;
    p.set(x, c.height(x, z) - 0.05, z); q.setFromEuler(e.set(tilt, 0, tilt * 0.7)); s.set(1, sy, 1);
    m.compose(p, q, s); ch.poles.setMatrixAt(pc, m); ch.poles.setColorAt(pc, col.setHex(hex)); Inc(pc);
  end;
  zz := Ceil(z0 / 16) * 16;
  while zz < z0 + CL do begin
    W := c.width(zz); cz := c.cx(zz);
    addPole(cz - W - 0.6, zz, 1, $ff3b1f, (Hash1(zz) - 0.5) * 0.08);
    addPole(cz + W + 0.6, zz, 1, $ff3b1f, (Hash1(zz + 3) - 0.5) * 0.08);
    zz += 16;
  end;
  for var kk in kick do begin
    zl := kk.z + kk.L;
    if (zl < z0) or (zl >= z0 + CL) then continue;
    cz := c.cx(zl); addPole(cz + kk.d - 3.9, zl, 0.8, $1f6bff, 0); addPole(cz + kk.d + 3.9, zl, 0.8, $1f6bff, 0);
  end;
  // Netze: Band an der Kurvenaussenseite
  var ng := ch.net.geometry; var NP := ng.attributes.position.&array; var NN := ng.attributes.normal.&array; var NU := ng.attributes.uv.&array;
  nv := 0;
  for si := 0 to Trunc(CL / 2) - 1 do begin
    za := z0 + si * 2; zb := za + 2;
    for sd := -1 to 1 do begin
      if sd = 0 then continue;
      if (c.netSide(za) <> sd) or (c.netSide(zb) <> sd) then continue;
      side := sd;
      xa := c.cx(za) + side * (c.width(za) + 2.2); xb := c.cx(zb) + side * (c.width(zb) + 2.2);
      ya := c.height(xa, za) + 0.05; yb := c.height(xb, zb) + 0.05;
      var quad: array of Float := [xa, ya, za, 0, 0, xb, yb, zb, 1, 0, xb, yb + hh, zb, 1, 1, xa, ya, za, 0, 0, xb, yb + hh, zb, 1, 1, xa, ya + hh, za, 0, 1];
      for v := 0 to 5 do begin
        NP[nv * 3] := quad[v * 5]; NP[nv * 3 + 1] := quad[v * 5 + 1]; NP[nv * 3 + 2] := quad[v * 5 + 2];
        NN[nv * 3] := -side; NN[nv * 3 + 1] := 0; NN[nv * 3 + 2] := 0;
        NU[nv * 2] := (za + quad[v * 5 + 3] * 2) / 1.35; NU[nv * 2 + 1] := quad[v * 5 + 4]; Inc(nv);
      end;
      if si mod 2 = 0 then addPole(xa, za, 0.85, $2a2f38, 0);
    end;
  end;
  ng.setDrawRange(0, nv);
  ng.attributes.position.needsUpdate := True; ng.attributes.normal.needsUpdate := True; ng.attributes.uv.needsUpdate := True;
  if nv > 0 then ng.computeBoundingSphere;
  ch.net.visible := nv > 0;
  ch.poles.count := pc; ch.poles.instanceMatrix.needsUpdate := True;
  if Truthy(ch.poles.instanceColor) then ch.poles.instanceColor.needsUpdate := True;
  if pc > 0 then ch.poles.computeBoundingSphere;
  ch.poles.visible := pc > 0; ch.rocks.visible := True;
end;

procedure TTerrain.Release(ch: TChunk);
begin
  ch.idx := -1;
  ch.mesh.visible := False; ch.hi.visible := False; ch.lo.visible := False; ch.rocks.visible := False;
  ch.poles.visible := False; ch.net.visible := False; ch.ao.visible := False;
end;

function TTerrain.FindActive(i: Integer): TChunk;
begin
  for var ch in active do if ch.idx = i then exit(ch);
  Result := nil;
end;

procedure TTerrain.RemoveActive(k: Integer);
begin
  active.Delete(k);
end;

procedure TTerrain.Update(z: Float; camPos: JVector3; maxBuilds: Integer = 1);
var ci, from, toI, i, built, k: Integer; lod2: Float;
begin
  ci := Floor(z / CONFIG.chunkLength); from := ci - 2; toI := ci + ahead;
  k := 0;
  while k < active.Length do begin
    var ch := active[k];
    if (ch.idx < from) or (ch.idx > toI) then begin Release(ch); RemoveActive(k); pool.Add(ch); end
    else Inc(k);
  end;
  for i := ci - 1 to ci + 2 do Ensure(i);              // Nahbereich sofort
  built := 0;
  i := ci + 3;
  while (i <= toI) and (built < maxBuilds) do begin if Ensure(i) then Inc(built); Inc(i); end;
  i := ci - 1;
  while (i >= from) and (built < maxBuilds) do begin if Ensure(i) then Inc(built); Dec(i); end;
  lod2 := CONFIG.lodDistance * CONFIG.lodDistance;
  for var ch in active do begin
    var near := ch.center.distanceToSquared(camPos) < lod2;
    ch.hi.visible := near; ch.lo.visible := not near;
  end;
end;

function TTerrain.Ensure(i: Integer): Boolean;
begin
  if (FindActive(i) <> nil) or (pool.Length = 0) then exit(False);
  var ch := pool.Pop;
  Build(ch, i);
  active.Add(ch);
  Result := True;
end;

procedure TTerrain.RebuildAll(z: Float; camPos: JVector3);
begin
  for var ch in active do begin Release(ch); pool.Add(ch); end;
  active.Clear;
  Update(z, camPos, 99);
end;

// Baum-Kollision: prueft nur den Chunk des Riders und Nachbarn
function TTerrain.HitTree(x, z, rad: Float): Boolean;
var ci, i, k: Integer; dx, dz, rr: Float;
begin
  ci := Floor(z / CONFIG.chunkLength);
  for i := ci - 1 to ci + 1 do begin
    var ch := FindActive(i);
    if ch = nil then continue;
    for k := 0 to ch.tn - 1 do begin
      dx := x - ch.tx[k]; dz := z - ch.tz[k]; rr := ch.tr[k] + rad;
      if dx * dx + dz * dz < rr * rr then exit(True);
    end;
  end;
  Result := False;
end;

end.
