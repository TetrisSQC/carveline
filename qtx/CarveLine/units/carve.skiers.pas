unit carve.skiers;

// SkierAI — KI-Skifahrer, prozedural animiert, Rendering komplett per InstancedMesh
// Lokaler Frame: X = Skirichtung, Y = Normale, Z = rechts

interface

uses
  qtx.sysutils, carve.web, carve.util, carve.config, carve.three, carve.course, carve.skeleton, carve.rider;

type
  TSkierType = class
  public
    name: String;
    w, sp0, sp1, amp0, amp1, fq0, fq1: Float;
    plough: Boolean;
    comp, stop, cross: Float;
    jackets: array of Integer;
  end;

  TSkier = class
  public
    active: Boolean;
    pos, vel, a, b, n: JVector3;
    typ: Integer;
    z, lane, speed, baseSpeed, amp, fq, phase: Float;
    state: Integer;
    timer, crossTo, stopTurn, lean, yaw, prevYaw: Float;
    hasPrevYaw: Boolean;
    plant, plantSide, prevSin, comp, minDist, prevRel, hit, stopSide, d: Float;
    cJ, cP, cH, cS: Integer;
  end;

  TNearMissProc = procedure(s: TSkier; dist: Float);

  TSkierTemps = class
  public
    f, r, up, Fo, Si, sp, tmp, tmp2, pole, x, y, z, w, tip, hd: JVector3;
    m: JMatrix4;
    col: JColor;
  end;

  TSkierAI = class
  private
    jt: TJoints;
    t: TSkierTemps;
    procedure ToWorld(s: TSkier; v, outV: JVector3);
    procedure Seg(mesh: JInstancedMesh; i: Integer; a, b: JVector3; col: Integer);
    // Box(): ya = Hauptachse (Y), xa = zweite Achse; swap=true: xa ist Y-Achse, ya ist X-Achse (fuer Ski/Boot)
    procedure Box(mesh: JInstancedMesh; i: Integer; pos, xa, ya: JVector3; sx, sy, sz: Float; col: Integer; swapAxes: Boolean = False);
    procedure At(mesh: JInstancedMesh; i: Integer; p: JVector3; col: Integer);
    procedure Ball(mesh: JInstancedMesh; i: Integer; p: JVector3; r: Float; col: Integer);
  public
    course: TCourse;
    maxN: Integer;
    skiers: array of TSkier;
    mLeg, mArm, mJoint, mTorso, mPelvis, mFace, mHead, mHair, mStrap, mGog, mHand, mBoot, mSki, mPole: JInstancedMesh;
    parts: array of JInstancedMesh;
    partsPer: array of Integer;
    onNearMiss: TNearMissProc;
    elapsed: Float;
    constructor Create(scene: JScene; c: TCourse);
    procedure Reset(z: Float);
    function SpawnFree(z: Float): TSkier;
    procedure Spawn(s: TSkier; z: Float);
    procedure Update(dt, playerZ, progress: Float);
    // Treffer eines beliebigen Koerpers (KI-Gegner): Skifahrer bleibt stehen
    function CheckHit(pa, pb: JVector3; z: Float): TSkier;
    // Kollision & Near-Miss gegen die Rider-Kapsel
    function CheckPlayer(pa, pb: JVector3; pz, pspeed: Float; canHit: Boolean): TSkier;
    procedure Render;
  end;

// Kapsel-Kapsel: Abstand zweier Segmente (p1-q1, p2-q2)
function SegSegDist(p1, q1, p2, q2: JVector3): Float;
// Verbindung der naechsten Punkte der letzten SegSegDist-Berechnung (c2 - c1)
procedure SegClosestDelta(outV: JVector3);

var
  SKIER_TYPES: array of TSkierType;

implementation

const
  PANTS: array [0..5] of Integer = ($1b1f2a, $3a3f4b, $0f2d4a, $4a2c2a, $dcdcdc, $2d4a2d);
  HELMS: array [0..5] of Integer = ($ffffff, $111111, $ff3b30, $1e90ff, $ffd60a, $8e8e93);
  SKICOLS: array [0..4] of Integer = ($ff3b30, $1e90ff, $111111, $ffffff, $ffd60a);

var _sd1, _sd2, _sr, _sc1, _sc2: JVector3;

function SegSegDist(p1, q1, p2, q2: JVector3): Float;
var a, e, f, c, b, den, s, t: Float;
begin
  if _sd1 = nil then begin _sd1 := new JVector3; _sd2 := new JVector3; _sr := new JVector3; _sc1 := new JVector3; _sc2 := new JVector3; end;
  var d1 := _sd1.subVectors(q1, p1); var d2 := _sd2.subVectors(q2, p2); var r := _sr.subVectors(p1, p2);
  a := d1.dot(d1); e := d2.dot(d2); f := d2.dot(r); c := d1.dot(r); b := d1.dot(d2); den := a * e - b * b;
  s := if den > 1e-8 then ClampF((b * f - c * e) / den, 0, 1) else 0.0; t := (b * s + f) / e;
  if t < 0 then begin t := 0; s := ClampF(-c / a, 0, 1); end
  else if t > 1 then begin t := 1; s := ClampF((b - c) / a, 0, 1); end;
  _sc1.copy(p1).addScaledVector(d1, s); _sc2.copy(p2).addScaledVector(d2, t);
  Result := _sc1.distanceTo(_sc2);
end;

procedure SegClosestDelta(outV: JVector3);
begin
  outV.subVectors(_sc2, _sc1);
end;

function MkType(name: String; w, sp0, sp1, amp0, amp1, fq0, fq1: Float; plough: Boolean; comp, stop, cross: Float; jackets: array of Integer): TSkierType;
begin
  Result := TSkierType.Create;
  Result.name := name; Result.w := w; Result.sp0 := sp0; Result.sp1 := sp1; Result.amp0 := amp0; Result.amp1 := amp1;
  Result.fq0 := fq0; Result.fq1 := fq1; Result.plough := plough; Result.comp := comp; Result.stop := stop; Result.cross := cross; Result.jackets := jackets;
end;

function White(rgh: Float = 0.65; mtl: Float = 0): JMeshStandardMaterial;
begin
  Result := new JMeshStandardMaterial(class color := $ffffff; roughness := rgh; metalness := mtl; end);
end;

constructor TSkierAI.Create(scene: JScene; c: TCourse);
begin
  course := c; maxN := CONFIG.skierMax;
  for var i := 0 to maxN - 1 do begin
    var s := TSkier.Create; s.active := False; s.pos := new JVector3; s.vel := new JVector3; s.a := new JVector3; s.b := new JVector3; s.n := new JVector3(0, 1, 0);
    skiers.Add(s);
  end;
  var cnt := maxN;
  var im := function(geo: JBufferGeometry; mat: JMaterial; per: Integer; shadow: Boolean = True): JInstancedMesh
  begin
    Result := new JInstancedMesh(geo, mat, cnt * per); Result.count := 0; Result.castShadow := shadow; Result.frustumCulled := False;
    Result.setColorAt(0, new JColor(1, 1, 1)); scene.add(Result);
  end;
  // Chibi-Skifahrer aus Primitiven, Farben pro Instanz
  mLeg := im(SegGeo(0.125, 0.112, 10), White, 4);
  mArm := im(SegGeo(0.1, 0.088, 8), White, 4);
  mJoint := im(new JSphereGeometry(1, 10, 8), White, 8);                           // Hueften, Knie, Schultern, Ellbogen
  mTorso := im(new JCapsuleGeometry(0.23, 0.14, 4, 14), White, 1);
  mPelvis := im(new JCapsuleGeometry(0.17, 0.1, 3, 12), White, 1);
  mFace := im(new JSphereGeometry(0.275, 16, 12), White, 1);
  mHead := im(new JSphereGeometry(0.29, 16, 8, 0, TAU, 0, PI_ * 0.47), White(0.3), 1); // Helm
  mHair := im(new JSphereGeometry(0.279, 20, 8, PI_, PI_, PI_ * 0.5, PI_ * 0.3), White(0.9), 1, False);
  mStrap := im(new JCylinderGeometry(0.293, 0.293, 0.075, 18, 1, True, 1.1, TAU - 2.2), White, 1, False);
  mGog := im(new JCylinderGeometry(0.305, 0.3, 0.17, 24, 1, True, -1.15, 2.3), White(0.1, 0.8), 1, False);
  mHand := im(new JSphereGeometry(0.088, 10, 8).scale(1, 1.15, 0.9), White, 2, False);
  mBoot := im(new JCapsuleGeometry(0.09, 0.13, 4, 10).rotateZ(PI_ / 2).scale(1, 1.1, 0.95), White, 2);
  mSki := im(new JBoxGeometry(1.65, 0.02, 0.085), White(0.3), 2);
  mPole := im(SegGeo(0.012, 0.01, 5), White(0.3, 0.6), 2, False);
  parts := [mLeg, mArm, mJoint, mTorso, mPelvis, mFace, mHead, mHair, mStrap, mGog, mHand, mBoot, mSki, mPole];
  partsPer := [4, 4, 8, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2];
  jt := NewJoints;
  t := TSkierTemps.Create;
  t.f := new JVector3; t.r := new JVector3; t.up := new JVector3; t.Fo := new JVector3; t.Si := new JVector3; t.sp := new JVector3;
  t.tmp := new JVector3; t.tmp2 := new JVector3; t.pole := new JVector3; t.x := new JVector3; t.y := new JVector3; t.z := new JVector3;
  t.w := new JVector3; t.m := new JMatrix4; t.col := new JColor; t.tip := new JVector3; t.hd := new JVector3;
  onNearMiss := nil; elapsed := 0;
end;

procedure TSkierAI.Reset(z: Float);
begin
  for var s in skiers do s.active := False;
  for var i := 0 to CONFIG.skierBase - 1 do SpawnFree(z + 40 + i * 45 + Random * 30);
end;

function TSkierAI.SpawnFree(z: Float): TSkier;
begin
  for var s in skiers do if not s.active then begin Spawn(s, z); exit(s); end;
  Result := nil;
end;

procedure TSkierAI.Spawn(s: TSkier; z: Float);
var r, W: Float; ti: Integer;
begin
  r := Random; ti := 0;
  while ti < 2 do begin r -= SKIER_TYPES[ti].w; if r < 0 then break; Inc(ti); end;
  var ty := SKIER_TYPES[ti]; W := course.width(z);
  s.active := True; s.typ := ti; s.z := z; s.lane := (Random * 2 - 1) * (W - 5) * 0.7;
  s.speed := ty.sp0 * 0.7; s.baseSpeed := Lerp(ty.sp0, ty.sp1, Random) * CONFIG.skierSpeedScale;
  s.amp := Lerp(ty.amp0, ty.amp1, Random); s.fq := Lerp(ty.fq0, ty.fq1, Random); s.phase := Random * TAU;
  s.state := 0; s.timer := 0; s.crossTo := 0; s.stopTurn := 0; s.lean := 0; s.yaw := 0; s.hasPrevYaw := False; s.plant := 0; s.plantSide := 1; s.prevSin := 0;
  s.comp := ty.comp; s.minDist := 99; s.prevRel := -1; s.hit := 0;
  s.cJ := ty.jackets[Trunc(Random * ty.jackets.Length)]; s.cP := PANTS[Trunc(Random * 6)]; s.cH := HELMS[Trunc(Random * 6)];
  s.cS := SKICOLS[Trunc(Random * 5)];
  s.d := s.lane + s.amp * Sin(s.phase);
end;

procedure TSkierAI.Update(dt, playerZ, progress: Float);
var target, count: Integer; W, chaos, tgtSpeed, dTg, dd, vz, x, y, yaw, yawRate, sn: Float;
begin
  var c := course;
  elapsed += dt;
  target := Round(Lerp(CONFIG.skierBase, CONFIG.skierMax, ClampF(progress, 0, 1)));
  count := 0;
  for var s in skiers do if s.active then Inc(count);
  if (count < target) and (playerZ + 150 < c.zf - 20) then SpawnFree(playerZ + 150 + Random * 190);
  for var s in skiers do begin
    if not s.active then continue;
    if (s.z < playerZ - 60) or (s.z > c.zf + 30) then begin s.active := False; continue; end;
    var ty := SKIER_TYPES[s.typ]; W := c.width(s.z); chaos := CONFIG.skierChaos;
    tgtSpeed := s.baseSpeed * (1 + CONFIG.skierProgressSpeedup * progress);
    if s.state = 0 then begin                         // normales Schwingen
      s.speed := Damp(s.speed, tgtSpeed, 1.2, dt);
      s.phase += TAU * s.fq * dt;
      dTg := s.lane + s.amp * Sin(s.phase);
      s.stopTurn := Damp(s.stopTurn, 0, 3, dt);
      if Random < ty.stop * chaos * dt then begin s.state := 1; s.timer := 1.8 + Random * 2.5; s.stopSide := if Random < 0.5 then -1.0 else 1.0; end
      else if Random < ty.cross * chaos * dt then begin s.state := 2; s.crossTo := -SignF(s.lane) * (W - 5) * (0.4 + Random * 0.5); end;
    end else if s.state = 1 then begin                // ploetzlicher Stopp (quer stellen)
      s.speed := Damp(s.speed, 0, 2.4, dt); dTg := s.d; s.stopTurn := Damp(s.stopTurn, s.stopSide * 1.35, 5, dt);
      s.timer -= dt;
      if s.timer <= 0 then s.state := 0;
    end else begin                                    // Querfahren ueber die Piste
      s.speed := Damp(s.speed, tgtSpeed * 0.75, 1.5, dt);
      s.lane := Damp(s.lane, s.crossTo, 0.55, dt); dTg := s.lane + s.amp * 0.2 * Sin(s.phase);
      if Abs(s.lane - s.crossTo) < 0.6 then s.state := 0;
    end;
    if s.hit > 0 then begin s.hit -= dt; s.speed := Damp(s.speed, 0, 4, dt); end;
    dTg := ClampF(dTg, -(W - 1.5), W - 1.5);
    dd := (dTg - s.d) / Max(dt, 1e-4);
    vz := Sqrt(Max(s.speed * s.speed - dd * dd, s.speed * s.speed * 0.15));
    s.d := dTg; s.z += vz * dt;
    x := c.cx(s.z) + s.d; y := c.height(x, s.z);
    s.vel.set(dd + c.cxp(s.z) * vz, 0, vz);
    s.pos.set(x, y, s.z);
    yaw := ArcTan2(s.vel.x, s.vel.z);
    yawRate := if not s.hasPrevYaw then 0.0 else WrapAngle(yaw - s.prevYaw) / Max(dt, 1e-4);
    s.prevYaw := yaw; s.hasPrevYaw := True; s.yaw := yaw;
    s.lean := Damp(s.lean, ClampF(-ArcTan(yawRate * s.speed / CONFIG.gravity), -0.7, 0.7) + s.stopTurn * -0.25, 8, dt);
    // Stockeinsatz beim Schwungwechsel
    sn := Sin(s.phase);
    if (s.state = 0) and (SignF(sn) <> SignF(s.prevSin)) and not ty.plough then begin s.plant := 0.35; s.plantSide := if sn > 0 then 1.0 else -1.0; end;
    s.prevSin := sn;
    s.plant := Max(0.0, s.plant - dt);
    c.normal(x, s.z, s.n);
    s.a.copy(s.pos).addScaledVector(s.n, 0.35); s.b.copy(s.pos).addScaledVector(s.n, 1.55);
  end;
end;

function TSkierAI.CheckHit(pa, pb: JVector3; z: Float): TSkier;
begin
  for var s in skiers do begin
    if not s.active or (s.hit > 0) or (Abs(s.z - z) > 6) then continue;
    if SegSegDist(pa, pb, s.a, s.b) < 0.3 + CONFIG.bodyRadius then begin s.hit := 3; s.state := 1; s.timer := 3; s.stopSide := 1; exit(s); end;
  end;
  Result := nil;
end;

function TSkierAI.CheckPlayer(pa, pb: JVector3; pz, pspeed: Float; canHit: Boolean): TSkier;
var rel, d: Float;
begin
  Result := nil;
  for var s in skiers do begin
    if not s.active then continue;
    rel := pz - s.z;
    if Abs(rel) > 8 then begin s.minDist := 99; s.prevRel := rel; continue; end;
    d := SegSegDist(pa, pb, s.a, s.b);
    if (d < 0.3 + 0.35) and canHit and (s.hit <= 0) then begin Result := s; s.hit := 3; s.state := 1; s.timer := 3; s.stopSide := 1; end;
    s.minDist := Min(s.minDist, d);
    if (s.prevRel < 0) and (rel >= 0) and (s.hit <= 0) and (s.minDist < CONFIG.nearMissDist) and (pspeed > s.speed + 2) and Assigned(onNearMiss) then onNearMiss(s, s.minDist);
    s.prevRel := rel;
  end;
end;

// Pose + Instanz-Matrizen
procedure TSkierAI.Render;
var k, k4, k8, sd, q: Integer; yaw, ln, comp, bend, rho, fw, H, px, cl, sl, plantL, plantR, ang, pl, zs: Float; plough: Boolean;
const AY = RIG.skiAnkleY; ka = RIG.reach;
begin
  k := 0; var jj := jt;
  for var s in skiers do begin
    if not s.active then continue;
    var ty := SKIER_TYPES[s.typ];
    // Frame
    yaw := s.yaw + s.stopTurn;
    t.hd.set(Sin(yaw), 0, Cos(yaw));
    t.up.copy(s.n); t.f.copy(t.hd).addScaledVector(t.up, -t.hd.dot(t.up)).normalize; t.r.crossVectors(t.f, t.up);
    ln := s.lean; plough := ty.plough and (s.state <> 1);
    comp := s.comp + (if s.state = 1 then 0.15 else 0.0) + (if s.hit > 0 then 0.5 else 0.0) + Abs(ln) * 0.15 + 0.04 * Sin(elapsed * 3 + s.phase);
    bend := 0.3 + comp * 0.35;
    rho := ClampF(-s.stopTurn * 0.6 - ln * 0.3, -0.9, 0.9);   // Oberkoerper bleibt Richtung Falllinie
    t.Fo.set(Cos(rho), 0, -Sin(rho)); t.Si.set(Sin(rho), 0, Cos(rho));
    fw := if plough then 0.29 else 0.13;
    jj[J.ANL].set(if plough then -0.05 else 0.0, AY, -fw); jj[J.ANR].set(if plough then -0.05 else 0.0, AY, fw);
    H := AY + (RIG.leg1 + RIG.leg2) * (0.95 - 0.45 * comp); px := -0.04 - comp * 0.06; cl := Cos(ln); sl := Sin(ln);
    jj[J.PELVIS].set(px, H * cl, H * sl);
    jj[J.HIPL].copy(jj[J.PELVIS]).addScaledVector(t.Si, -RIG.hipW); jj[J.HIPL].y -= RIG.hipDrop;
    jj[J.HIPR].copy(jj[J.PELVIS]).addScaledVector(t.Si, RIG.hipW); jj[J.HIPR].y -= RIG.hipDrop;
    t.sp.set(Sin(bend), Cos(bend), 0); RotX(t.sp, ln * 0.35);
    jj[J.CHEST].copy(jj[J.PELVIS]).addScaledVector(t.sp, RIG.spine);
    jj[J.NECK].copy(jj[J.CHEST]).add(t.tmp.set(0.02, RIG.neck, 0)); jj[J.HEAD].copy(jj[J.NECK]).add(t.tmp.set(0.03, RIG.headL, 0));
    jj[J.FACE].copy(jj[J.HEAD]).addScaledVector(t.Fo, RIG.face);
    jj[J.SHL_].copy(jj[J.CHEST]).addScaledVector(t.Si, -RIG.shW).addScaledVector(t.sp, RIG.shUp); jj[J.SHR_].copy(jj[J.CHEST]).addScaledVector(t.Si, RIG.shW).addScaledVector(t.sp, RIG.shUp);
    plantL := if (s.plant > 0) and (s.plantSide < 0) then s.plant / 0.35 else 0.0;
    plantR := if (s.plant > 0) and (s.plantSide > 0) then s.plant / 0.35 else 0.0;
    jj[J.HAL].copy(jj[J.SHL_]).addScaledVector(t.Fo, ka * (0.3 + plantL * 0.15)).addScaledVector(t.Si, -0.1 * ka); jj[J.HAL].y -= ka * (0.32 + plantL * 0.08);
    jj[J.HAR].copy(jj[J.SHR_]).addScaledVector(t.Fo, ka * (0.3 + plantR * 0.15)).addScaledVector(t.Si, 0.1 * ka); jj[J.HAR].y -= ka * (0.32 + plantR * 0.08);
    t.pole.copy(t.Fo).add(t.tmp.set(0, 0.1, if plough then 0.35 else 0.0)); SolveIK(jj[J.HIPL], jj[J.ANL], RIG.leg1, RIG.leg2, t.pole, jj[J.KNL]);
    t.pole.copy(t.Fo).add(t.tmp.set(0, 0.1, if plough then -0.35 else 0.0)); SolveIK(jj[J.HIPR], jj[J.ANR], RIG.leg1, RIG.leg2, t.pole, jj[J.KNR]);
    t.pole.set(-0.5, -0.6, -0.4); SolveIK(jj[J.SHL_], jj[J.HAL], RIG.arm1, RIG.arm2, t.pole, jj[J.ELL]);
    t.pole.set(-0.5, -0.6, 0.4); SolveIK(jj[J.SHR_], jj[J.HAR], RIG.arm1, RIG.arm2, t.pole, jj[J.ELR]);
    // lokal -> Welt
    for var i := 0 to NJ - 1 do ToWorld(s, jj[i], jj[i]);
    k4 := k * 4; k8 := k * 8;
    Seg(mLeg, k4, jj[J.HIPL], jj[J.KNL], s.cP); Seg(mLeg, k4 + 1, jj[J.KNL], jj[J.ANL], s.cP);
    Seg(mLeg, k4 + 2, jj[J.HIPR], jj[J.KNR], s.cP); Seg(mLeg, k4 + 3, jj[J.KNR], jj[J.ANR], s.cP);
    Seg(mArm, k4, jj[J.SHL_], jj[J.ELL], s.cJ); Seg(mArm, k4 + 1, jj[J.ELL], jj[J.HAL], s.cJ);
    Seg(mArm, k4 + 2, jj[J.SHR_], jj[J.ELR], s.cJ); Seg(mArm, k4 + 3, jj[J.ELR], jj[J.HAR], s.cJ);
    Ball(mJoint, k8, jj[J.HIPL], 0.135, s.cP); Ball(mJoint, k8 + 1, jj[J.HIPR], 0.135, s.cP);
    Ball(mJoint, k8 + 2, jj[J.KNL], 0.12, s.cP); Ball(mJoint, k8 + 3, jj[J.KNR], 0.12, s.cP);
    Ball(mJoint, k8 + 4, jj[J.SHL_], 0.105, s.cJ); Ball(mJoint, k8 + 5, jj[J.SHR_], 0.105, s.cJ);
    Ball(mJoint, k8 + 6, jj[J.ELL], 0.092, s.cJ); Ball(mJoint, k8 + 7, jj[J.ELR], 0.092, s.cJ);
    t.x.subVectors(jj[J.SHR_], jj[J.SHL_]); t.y.subVectors(jj[J.CHEST], jj[J.PELVIS]);
    t.w.addVectors(jj[J.CHEST], jj[J.PELVIS]).multiplyScalar(0.5).addScaledVector(t.y, 0.25);
    Box(mTorso, k, t.w, t.x, t.y, 1.15, 1, 0.92, s.cJ);
    t.x.subVectors(jj[J.HIPR], jj[J.HIPL]); Box(mPelvis, k, jj[J.PELVIS], t.x, t.y, 1.2, 0.9, 1, s.cP);
    // Kopf: Y = Hals->Kopf, Z = Blickrichtung, X = Y x Z
    var kk := k;
    var hk := procedure(mesh: JInstancedMesh; col: Integer)
    begin
      t.y.subVectors(jj[J.HEAD], jj[J.NECK]); t.z.subVectors(jj[J.FACE], jj[J.HEAD]); t.x.crossVectors(t.y, t.z); Box(mesh, kk, jj[J.HEAD], t.x, t.y, 1, 1, 1, col);
    end;
    hk(mFace, FIG.skin); hk(mHead, s.cH); hk(mHair, FIG.hair); hk(mStrap, FIG.strap); hk(mGog, FIG.goggle);
    At(mHand, k * 2, jj[J.HAL], FIG.glove); At(mHand, k * 2 + 1, jj[J.HAR], FIG.glove);
    // Ski & Boots (Pflug: Spitzen zusammen), Aufkanten mit Lean
    for sd := 0 to 1 do begin
      var an := if sd = 0 then jj[J.ANL] else jj[J.ANR];
      ang := if plough then (if sd = 0 then 0.36 else -0.36) else 0.0;
      t.x.copy(t.f).multiplyScalar(Cos(ang)).addScaledVector(t.r, Sin(ang));
      t.y.copy(t.up).multiplyScalar(Cos(ln * 0.7)).addScaledVector(t.r, Sin(ln * 0.7) * (if plough then (if sd = 0 then -0.6 else 0.6) else 1.0));
      t.w.copy(an).addScaledVector(t.up, 0.01 - AY).addScaledVector(t.x, 0.1);
      Box(mSki, k * 2 + sd, t.w, t.y, t.x, 1, 1, 1, s.cS, True);
      t.w.copy(an).addScaledVector(t.up, 0.1 - AY).addScaledVector(t.x, 0.03);
      Box(mBoot, k * 2 + sd, t.w, t.y, t.x, 1, 1, 1, $2a2d33, True);
    end;
    // Stoecke: normal nach hinten geneigt, beim Einsatz Spitze vorne im Schnee
    for sd := 0 to 1 do begin
      var hv := if sd = 0 then jj[J.HAL] else jj[J.HAR];
      pl := if sd = 0 then plantL else plantR; zs := if sd = 0 then -1.0 else 1.0;
      t.tip.set(Lerp(-0.55, 0.55, pl), Lerp(0.25, 0.0, pl), zs * Lerp(0.3, 0.42, pl)); ToWorld(s, t.tip, t.tip);
      t.tmp2.subVectors(t.tip, hv).normalize; t.tip.copy(hv).addScaledVector(t.tmp2, 0.9);
      Seg(mPole, k * 2 + sd, hv, t.tip, $9aa0a6);
    end;
    Inc(k);
  end;
  for q := 0 to parts.Length - 1 do begin
    var m := parts[q]; m.count := k * partsPer[q]; m.instanceMatrix.needsUpdate := True;
    if Truthy(m.instanceColor) then m.instanceColor.needsUpdate := True;
  end;
end;

procedure TSkierAI.ToWorld(s: TSkier; v, outV: JVector3);
var x, y, z: Float;
begin
  x := v.x; y := v.y; z := v.z;
  outV.copy(s.pos).addScaledVector(t.f, x).addScaledVector(t.up, y).addScaledVector(t.r, z);
end;

procedure TSkierAI.Seg(mesh: JInstancedMesh; i: Integer; a, b: JVector3; col: Integer);
var len: Float;
begin
  t.y.subVectors(b, a); len := t.y.length; if len = 0 then len := 1e-4; t.y.divideScalar(len);
  t.x.set(1, 0, 0); if Abs(t.y.x) > 0.9 then t.x.set(0, 0, 1);
  t.z.crossVectors(t.x, t.y).normalize; t.x.crossVectors(t.y, t.z);
  t.m.makeBasis(t.x, t.y.multiplyScalar(len), t.z).setPosition(a); mesh.setMatrixAt(i, t.m); mesh.setColorAt(i, t.col.setHex(col));
end;

procedure TSkierAI.Box(mesh: JInstancedMesh; i: Integer; pos, xa, ya: JVector3; sx, sy, sz: Float; col: Integer; swapAxes: Boolean = False);
begin
  if not swapAxes then begin t.y.copy(ya).normalize; t.x.copy(xa).addScaledVector(t.y, -xa.dot(t.y)).normalize; t.z.crossVectors(t.x, t.y); end
  else begin t.y.copy(xa).normalize; t.x.copy(ya).addScaledVector(t.y, -ya.dot(t.y)).normalize; t.z.crossVectors(t.x, t.y); end;
  t.m.makeBasis(t.x.multiplyScalar(sx), t.y.multiplyScalar(sy), t.z.multiplyScalar(sz)).setPosition(pos); mesh.setMatrixAt(i, t.m); mesh.setColorAt(i, t.col.setHex(col));
end;

procedure TSkierAI.At(mesh: JInstancedMesh; i: Integer; p: JVector3; col: Integer);
begin
  t.m.makeTranslation(p.x, p.y, p.z); mesh.setMatrixAt(i, t.m); mesh.setColorAt(i, t.col.setHex(col));
end;

procedure TSkierAI.Ball(mesh: JInstancedMesh; i: Integer; p: JVector3; r: Float; col: Integer);
begin
  t.m.makeScale(r, r, r).setPosition(p); mesh.setMatrixAt(i, t.m); mesh.setColorAt(i, t.col.setHex(col));
end;

initialization
  SKIER_TYPES := [
    MkType('Anfaenger', 0.33, 4.5, 7.0, 2.5, 4.5, 0.16, 0.26, True, 0.3, 0.05, 0.028, [$ffd23f, $ff5fa2, $9be15d]),
    MkType('Geniesser', 0.42, 9.0, 13.0, 5, 9, 0.11, 0.19, False, 0.22, 0.012, 0.02, [$3dd6d0, $7b61ff, $f4f4f4, $1e90ff]),
    MkType('Kurzschw.', 0.25, 11, 15, 1.0, 1.8, 0.75, 0.95, False, 0.34, 0.006, 0.01, [$e63946, $111827, $ff8c1a])];
end.
