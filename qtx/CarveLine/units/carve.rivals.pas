unit carve.rivals;

// KI-Gegner (gleiche Physik/Animation wie der Spieler) und Geist (Aufzeichnung der Bestzeit-Fahrt)

interface

uses
  qtx.sysutils, carve.web, carve.util, carve.config, carve.three, carve.course, carve.world,
  carve.physics, carve.skeleton, carve.rider, carve.skiers;

type
  TRivalDef = class
  public
    name: String;
    vmax, lane, seed: Float;
    col: TRiderColors;
  end;

  TDownProc = procedure(pos, vel: JVector3);

  // KI-Gegner — folgt einer eigenen Linie, regelt Tempo ueber Hocke/Bremse
  TRival = class
  public
    def: TRivalDef;
    course: TCourse;
    phys: TRiderPhysics;
    rider: TRider;
    anim: TRiderAnimator;
    wj: TJoints;
    boardPos: JVector3;
    boardQ: JQuaternion;
    st: TPoseState;
    inp: TControls;
    active, finished: Boolean;
    time, downT: Float;
    onDown: TDownProc;
    constructor Create(scene: JScene; c: TCourse; terrain: TTerrain; d: TRivalDef);
    procedure Reset(z: Float; isActive: Boolean);
    // KI-Eingabe: Zielpunkt voraus auf eigener Linie, Lenken nach Richtungsfehler, Tempo ueber Hocke/Bremse
    procedure Think(progress: Float; skiers: TSkierAI);
    procedure KnockDown;
    procedure Step(dt: Float; playing: Boolean; progress, runTime: Float; skiers: TSkierAI);
    procedure Render(alpha, dt: Float);
  end;

  // Geist — Aufzeichnung der Fahrt (20 Hz) und Wiedergabe als transparente Figur
  TGhost = class
  private
    i: Integer;
  public
    rider: TRider;
    anim: TRiderAnimator;
    data: JFloat32Array;
    wj: TJoints;
    boardPos: JVector3;
    boardQ: JQuaternion;
    st: TPoseState;
    constructor Create(scene: JScene);
    class function Encode(arr: array of Float): String;
    class function Decode(str: String): JFloat32Array;
    procedure Load;
    procedure Save(arr: array of Float; tm: Float);
    class procedure Sample(arr: array of Float; t: Float; p: TRiderPhysics; mode: String);
    // Pose zur Rennzeit t (lineare Interpolation zwischen Samples)
    procedure Update(t, dt: Float; show: Boolean);
  end;

const
  GHOST_HZ = 20;
  GHOST_F = 22;   // t, pos3, up3, yaw, edge, latAcc, load, tuck, brake, charge, grounded, airTime, vel3, flip, grab, sichtbar

var
  RIVAL_DEFS: array of TRivalDef;   // im Original RIVALS (kollidiert in Pascal mit Game.rivals)

implementation

function MkRival(name: String; vmax, lane, seed: Float; col: TRiderColors): TRivalDef;
begin
  Result := TRivalDef.Create; Result.name := name; Result.vmax := vmax; Result.lane := lane; Result.seed := seed; Result.col := col;
end;

function NewPoseState(vel: JVector3): TPoseState;
begin
  Result := TPoseState.Create;
  Result.pos := new JVector3; Result.up := new JVector3; Result.vel := vel;
  Result.yaw := 0; Result.edge := 0; Result.flip := 0;
  Result.anim := TAnimState.Create; Result.anim.grounded := True;
end;

{ TRival }

constructor TRival.Create(scene: JScene; c: TCourse; terrain: TTerrain; d: TRivalDef);
begin
  def := d; course := c; phys := TRiderPhysics.Create(c, terrain);
  rider := TRider.Create(scene); rider.SetColors(d.col); anim := TRiderAnimator.Create;
  wj := NewJoints;
  boardPos := new JVector3; boardQ := new JQuaternion;
  st := NewPoseState(phys.vel);
  inp := TControls.Create;
  active := False; rider.root.visible := False;
end;

procedure TRival.Reset(z: Float; isActive: Boolean);
begin
  var p := phys; var c := course;
  p.Reset(z); p.pos.x += def.lane * 12; p.pos.y := c.height(p.pos.x, p.pos.z); p.prevPos.copy(p.pos); p.frozen := True;
  active := isActive; finished := False; time := 0; downT := 0; rider.root.visible := isActive;
end;

procedure TRival.Think(progress: Float; skiers: TSkierAI);
var sp, zt, W, d, dr, dz, sd, xt, velYaw, err, vt: Float;
begin
  var p := phys; var c := course; var df := def; var ip := inp; sp := p.speed;
  if finished then begin ip.steer := 0; ip.tuck := 0; ip.brake := if sp > 2 then 1.0 else 0.0; exit; end;
  zt := p.pos.z + 9 + sp * 0.9; W := c.width(zt);
  d := df.lane * W + Sin(zt * 0.012 + df.seed) * W * 0.28;
  // Skifahrern voraus ausweichen (nicht perfekt – Treffer bleiben moeglich)
  dr := p.pos.x - c.cx(p.pos.z);
  if skiers <> nil then for var s in skiers.skiers do begin
    dz := s.z - p.pos.z;
    if not s.active or (dz < 2) or (dz > 26) then continue;
    sd := s.pos.x - c.cx(s.z);
    if Abs(sd - dr) < 3 then d := sd + (if dr >= sd then 1.0 else -1.0) * 4;
  end;
  d := ClampF(d, -(W - 3), W - 3); xt := c.cx(zt) + d;
  velYaw := if sp > 2 then ArcTan2(p.vel.x, p.vel.z) else p.yaw;
  err := WrapAngle(ArcTan2(xt - p.pos.x, zt - p.pos.z) - velYaw);
  ip.steer := ClampF(-err * 3.4, -1, 1);
  vt := df.vmax * (0.9 + 0.15 * progress);
  ip.tuck := if (sp < vt) and (Abs(ip.steer) < 0.35) then 1.0 else 0.0;
  ip.brake := if sp > vt + 1 then ClampF((sp - vt) / 5, 0, 0.5) else 0.0;
end;

procedure TRival.KnockDown;
begin
  var p := phys; p.crashReason := ''; downT := 1.6; rider.root.visible := False;
  if Assigned(onDown) then onDown(p.pos, p.vel);
end;

procedure TRival.Step(dt: Float; playing: Boolean; progress, runTime: Float; skiers: TSkierAI);
var d, z: Float;
begin
  if not active then exit;
  var p := phys;
  if downT > 0 then begin    // nach Sturz kurz aussetzen, dann auf der Piste weiter
    p.prevPos.copy(p.pos);
    downT -= dt;
    if downT <= 0 then begin
      var c := course; d := def.lane * c.width(p.pos.z) * 0.5; z := c.safeZ(p.pos.z, d);
      p.Reset(z); p.pos.x := c.cx(z) + d; p.vel.set(Sin(p.yaw), 0, Cos(p.yaw)).multiplyScalar(3); p.pos.y := c.height(p.pos.x, z); p.prevPos.copy(p.pos);
      rider.root.visible := True;
    end;
    exit;
  end;
  p.frozen := not playing; Think(progress, skiers); p.Step(dt, inp);
  if p.crashReason <> '' then KnockDown;
  if playing and not finished and (p.pos.z > course.zf) then begin finished := True; time := runTime; end;
end;

procedure TRival.Render(alpha, dt: Float);
begin
  if not active or not rider.root.visible then exit;
  var p := phys; var S := st.anim;
  st.pos.lerpVectors(p.prevPos, p.pos, alpha); st.up.lerpVectors(p.prevBoardUp, p.boardUp, alpha).normalize;
  st.yaw := p.prevYaw + WrapAngle(p.yaw - p.prevYaw) * alpha; st.edge := Lerp(p.prevEdge, p.edge, alpha); st.flip := 0;
  S.latAcc := p.latAcc; S.load := if p.grounded then p.load else 0.0; S.tuck := p.tuck; S.brake := p.brake; S.charge := 0;
  S.grounded := p.grounded; S.airTime := p.airTime; S.idle := p.frozen; S.grab := 0;
  PoseFromState(anim, st, dt, wj, boardPos, boardQ);
  rider.Pose(wj, boardPos, boardQ);
end;

{ TGhost }

constructor TGhost.Create(scene: JScene);
begin
  rider := TRider.Create(scene); anim := TRiderAnimator.Create; data := nil; i := 0;
  rider.root.traverse(procedure(o: JObject3D)
  begin
    var ov: Variant := o;
    if not Truthy(ov.isMesh) then exit;
    o.castShadow := False;
    var mesh := JMesh(o); var m := mesh.material.clone;
    m.transparent := True; m.opacity := 0.42; m.depthWrite := False;
    var mv: Variant := m;
    if Truthy(mv.emissive) then begin JMeshStandardMaterial(m).emissive.setHex($3f7fc8); JMeshStandardMaterial(m).emissiveIntensity := 0.7; end;
    mesh.material := m; o.renderOrder := 2;
  end);
  wj := NewJoints;
  boardPos := new JVector3; boardQ := new JQuaternion;
  st := NewPoseState(new JVector3);
  rider.root.visible := False;
end;

class function TGhost.Encode(arr: array of Float): String;
begin
  asm
    var b = new Uint8Array(new Float32Array(@arr).buffer), s = '';
    for (var i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    @Result = btoa(s);
  end;
end;

class function TGhost.Decode(str: String): JFloat32Array;
begin
  asm
    var s = atob(@str), b = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
    @Result = new Float32Array(b.buffer);
  end;
end;

procedure TGhost.Load;
begin
  try
    var raw := localStorage.getItem(StoreKey('ghost'));
    var g := JSON.parse(if Truthy(raw) then String(raw) else 'null');
    if Truthy(g) and (g.f = GHOST_F) then data := Decode(g.data) else data := nil;
  except
    data := nil;
  end;
  i := 0;
end;

procedure TGhost.Save(arr: array of Float; tm: Float);
begin
  try
    localStorage.setItem(StoreKey('ghost'), JSON.stringify(class time := tm; f := GHOST_F; data := Encode(arr); end));
  except
    // Speicher voll
  end;
  data := new JFloat32Array(arr);
end;

class procedure TGhost.Sample(arr: array of Float; t: Float; p: TRiderPhysics; mode: String);
begin
  arr.Push(t); arr.Push(p.pos.x); arr.Push(p.pos.y); arr.Push(p.pos.z); arr.Push(p.boardUp.x); arr.Push(p.boardUp.y); arr.Push(p.boardUp.z);
  arr.Push(p.yaw); arr.Push(p.edge); arr.Push(p.latAcc); arr.Push(if p.grounded then p.load else 0.0); arr.Push(p.tuck); arr.Push(p.brake); arr.Push(p.charge);
  arr.Push(if p.grounded then 1.0 else 0.0); arr.Push(p.airTime); arr.Push(p.vel.x); arr.Push(p.vel.y); arr.Push(p.vel.z); arr.Push(p.flip); arr.Push(p.grab);
  arr.Push(if mode = 'ride' then 1.0 else 0.0);
end;

procedure TGhost.Update(t, dt: Float; show: Boolean);
var n, a, b: Integer; u: Float;
begin
  var D := data; var R := rider;
  if not show or (D = nil) or (D.length < GHOST_F * 2) then begin R.root.visible := False; exit; end;
  n := D.length div GHOST_F;
  while (i > 0) and (D[i * GHOST_F] > t) do Dec(i);
  while (i < n - 2) and (D[(i + 1) * GHOST_F] <= t) do Inc(i);
  a := i * GHOST_F; b := a + GHOST_F; u := ClampF((t - D[a]) / Max(D[b] - D[a], 1e-3), 0, 1);
  var L := function(k: Integer): Float begin Result := D[a + k] + (D[b + k] - D[a + k]) * u; end;
  if (D[a + 21] < 0.5) or (D[b + 21] < 0.5) or (t > D[(n - 1) * GHOST_F] + 1.5) then begin R.root.visible := False; exit; end;
  var S := st.anim;
  st.pos.set(L(1), L(2), L(3)); st.up.set(L(4), L(5), L(6)).normalize;
  st.yaw := D[a + 7] + WrapAngle(D[b + 7] - D[a + 7]) * u; st.edge := L(8);
  S.latAcc := L(9); S.load := L(10); S.tuck := L(11); S.brake := L(12); S.charge := L(13); S.grounded := D[a + 14] > 0.5; S.airTime := L(15);
  st.vel.set(L(16), L(17), L(18)); st.flip := L(19); S.grab := L(20);
  PoseFromState(anim, st, dt, wj, boardPos, boardQ);
  R.Pose(wj, boardPos, boardQ); R.root.visible := True;
end;

initialization
  RIVAL_DEFS := [MkRival('Mia', 24.5, -0.38, 1.7, TRiderColors.Create($2ecc71, $1b1f2a, $111111, $f1f3f6)),
    MkRival('Tom', 27.5, 0.34, 4.2, TRiderColors.Create($7b61ff, $3a3f4b, $ffd60a, $111111))];
end.
