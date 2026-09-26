unit carve.skeleton;

// Skelett (Gelenkpositionen) + 2-Bone-IK, prozedurale Animation (RiderAnimator), gemeinsames Posieren, Ragdoll.
// Lokaler Rider-Frame: X = Nose, Y = Board-Normale, Z = Toe-Seite (Blickrichtung). Regular: linker Fuss vorne (+X).

interface

uses
  qtx.sysutils, carve.web, carve.util, carve.config, carve.three, carve.course;

type
  J = class
  public
    const PELVIS = 0; const CHEST = 1; const NECK = 2; const HEAD = 3; const FACE = 4;
    const SHL_ = 5; const ELL = 6; const HAL = 7; const SHR_ = 8; const ELR = 9; const HAR = 10;   // SHL/SHR sind in Pascal Operatoren
    const HIPL = 11; const KNL = 12; const ANL = 13; const HIPR = 14; const KNR = 15; const ANR = 16;
  end;

  // Proportionen der Chibi-Figur (Spieler + Skifahrer: kurze Beine, grosser Kopf) [m]
  RIG = class
  public
    const stance = 0.30; const ankleY = 0.17;      // Fussgelenke: halber Stand, Hoehe ueber Board-Unterseite
    const hipW = 0.15; const hipDrop = 0.05; const leg1 = 0.233; const leg2 = 0.233;
    const spine = 0.277; const neck = 0.155; const headL = 0.279; const face = 0.2; const headR = 0.25;
    const shW = 0.22; const shUp = 0.03; const arm1 = 0.237; const arm2 = 0.214; const reach = 0.8; // reach: Skalierung der Hand-Ziele
    const skiAnkleY = 0.13;                          // Skifahrer: Fussgelenk ueber Schnee
  end;

  TJoints = array of JVector3;

  // Eingaben fuer den Animator (aus Physik oder Aufzeichnung)
  TAnimState = class
  public
    edge, tuck, charge, brake, load, latAcc, airTime, grab: Float;
    grounded, idle: Boolean;
    velLocal: JVector3;
    constructor Create;
  end;

  TAnimTemps = class
  public
    F, L, up, spine, upH, tmp, tmp2, pole, tgt, Lp, upP, acc: JVector3;
    constructor Create;
  end;

  // RiderAnimator — prozedurale Animation (Spring-Damper + IK)
  TRiderAnimator = class
  private
    procedure ClampArm(sh, h: JVector3);
    procedure HandSpring(p, v, target: JVector3; s: TAnimState; dt: Float);
  public
    jnt: TJoints;
    comp, lean, rot, bend: TSpring;
    hL, hLv, hR, hRv, bc, look: JVector3;
    edge: Float;
    t: TAnimTemps;
    constructor Create;
    procedure Kick(amount: Float);
    procedure Update(dt: Float; s: TAnimState);
  end;

  // Fahrzustand fuer poseFromState: Position, Board-Normale, Gier, Kante, Flip, Geschwindigkeit, Animator-Eingaben
  TPoseState = class
  public
    pos, up, vel: JVector3;
    yaw, edge, flip: Float;
    anim: TAnimState;
  end;

  // Ragdoll — Verlet-Punktmassen mit Distanz-Constraints, Terrain-Kollision
  TRagdoll = class
  private
    _d: JVector3;
  public
    course: TCourse;
    p, o: TJoints;
    rest: JFloat32Array;
    contact: array of Boolean;
    speed: Float;
    netHit: Boolean;
    constructor Create(c: TCourse);
    procedure Start(joints: TJoints; vel: JVector3; dt: Float);
    procedure Step(dt: Float);
  end;

const NJ = 17;

// Analytische Zwei-Knochen-IK: Wurzel a, Ziel t, Pol-Richtung pole => Mittelgelenk out
procedure SolveIK(a, t: JVector3; l1, l2: Float; pole, outV: JVector3);
function RotX(v: JVector3; a: Float): JVector3;
// Pose aus Fahrzustand st: Gelenke (Welt) + Board-Transform; PV_F/PV_R = Rider-Frame
procedure PoseFromState(anim: TRiderAnimator; st: TPoseState; dt: Float; wj: TJoints; boardPos: JVector3; boardQ: JQuaternion);
// Flip: alle Gelenke + Board um eine Achse durch den Schwerpunkt drehen
procedure RotateRiderPose(wj: TJoints; boardPos: JVector3; boardQ: JQuaternion; pivot, axis: JVector3; ang: Float; q: JQuaternion);
function NewJoints: TJoints;
// Rider-Frame der letzten PoseFromState-Berechnung (vorwaerts / rechts)
function PoseF: JVector3;
function PoseR: JVector3;

implementation

var
  _ikD, _ikB: JVector3;
  _pvF, _pvR, _pvHd, _pvX, _pvPiv: JVector3; _pvM: JMatrix4; _pvQe, _pvFq: JQuaternion;
  RAG_LINKS: array of Integer;

procedure InitTemps;
begin
  if _ikD <> nil then exit;
  _ikD := new JVector3; _ikB := new JVector3;
  _pvF := new JVector3; _pvR := new JVector3; _pvHd := new JVector3; _pvM := new JMatrix4; _pvQe := new JQuaternion;
  _pvX := new JVector3(1, 0, 0); _pvPiv := new JVector3; _pvFq := new JQuaternion;
end;

function NewJoints: TJoints;
begin
  for var i := 0 to NJ - 1 do Result.Add(new JVector3);
end;

function PoseF: JVector3;
begin
  InitTemps; Result := _pvF;
end;

function PoseR: JVector3;
begin
  InitTemps; Result := _pvR;
end;

procedure SolveIK(a, t: JVector3; l1, l2: Float; pole, outV: JVector3);
var dist, cosA, sinA: Float;
begin
  InitTemps;
  var d := _ikD.subVectors(t, a); dist := d.length;
  if dist < 1e-4 then begin outV.copy(a).addScaledVector(pole, l1); exit; end;
  d.divideScalar(dist); dist := Min(dist, l1 + l2 - 1e-4);
  cosA := ClampF((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1); sinA := Sqrt(1 - cosA * cosA);
  var b := _ikB.copy(pole).addScaledVector(d, -pole.dot(d));
  if b.lengthSq < 1e-8 then b.set(0, 1, 0);
  b.normalize;
  outV.copy(a).addScaledVector(d, cosA * l1).addScaledVector(b, sinA * l1);
end;

function RotX(v: JVector3; a: Float): JVector3;
var c, s, y, z: Float;
begin
  c := Cos(a); s := Sin(a); y := v.y; z := v.z; v.y := y * c - z * s; v.z := y * s + z * c;
  Result := v;
end;

{ TAnimState }

constructor TAnimState.Create;
begin
  velLocal := new JVector3; load := 1;
end;

constructor TAnimTemps.Create;
begin
  F := new JVector3; L := new JVector3; up := new JVector3; spine := new JVector3; upH := new JVector3; tmp := new JVector3;
  tmp2 := new JVector3; pole := new JVector3; tgt := new JVector3; Lp := new JVector3; upP := new JVector3; acc := new JVector3;
end;

{ TRiderAnimator }

constructor TRiderAnimator.Create;
begin
  jnt := NewJoints;
  comp := TSpring.Create(0.2, 0); lean := TSpring.Create(0, 0); rot := TSpring.Create(0.42, 0); bend := TSpring.Create(0.25, 0);
  hL := new JVector3(0.3, 1.0, 0.3); hLv := new JVector3; hR := new JVector3(-0.3, 1.0, 0.3); hRv := new JVector3;
  bc := new JVector3; edge := 0; look := new JVector3(1, 0, 0.3);
  t := TAnimTemps.Create;
end;

procedure TRiderAnimator.Kick(amount: Float);
begin
  comp.v += amount;
end;

procedure TRiderAnimator.Update(dt: Float; s: TAnimState);
var en, heel, toe, compT, leanT, rotT, bendT, grb, cmp, ln, rho, bnd, e, es, ce, se, H, cl, sl, pz, rp, dl, dr, mx, air, spread, ka: Float;
    it: Integer;
begin
  dt := Min(dt, 1 / 30);
  var jt := jnt;
  en := ClampF(s.edge / CONFIG.maxEdge, -1, 1); heel := Max(0.0, -en); toe := Max(0.0, en);
  // --- Ziele
  compT := 0.2 + 0.5 * s.tuck + 0.45 * s.charge + 0.18 * s.brake + 0.12 * heel + 0.06 * toe + ClampF((s.load - 1) * 0.25, -0.08, 0.3);
  leanT := ClampF(ArcTan2(s.latAcc, Max(s.load * CONFIG.gravity, 3.0)), -0.85, 0.85) + en * 0.08;
  rotT := 0.42 - 0.3 * toe + 0.25 * heel + 0.2 * s.tuck + 0.15 * s.brake;
  bendT := 0.22 + 0.55 * s.tuck + 0.18 * heel + 0.3 * s.charge - 0.05 * toe;
  if not s.grounded then begin compT := 0.3 + 0.35 * Smoothstep(0, 0.35, s.airTime); leanT := 0; bendT := 0.35; end;
  grb := s.grab; compT := Max(compT, 0.9 * grb); bendT += 0.45 * grb;
  if s.idle then begin compT := 0.12; leanT := 0; rotT := 0.5; bendT := 0.12; end;
  SpringStep(comp, compT, 140, 17, dt); comp.x := ClampF(comp.x, -0.1, 0.95);
  SpringStep(lean, leanT, 70, 13, dt); SpringStep(rot, rotT, 60, 12, dt); SpringStep(bend, bendT + comp.x * 0.22, 80, 14, dt);
  cmp := comp.x; ln := lean.x; rho := rot.x; bnd := bend.x; e := s.edge;
  // --- Board-Mitte (Board rollt um die Kontaktkante)
  es := SignF(e) * 0.125; bc.set(0, es * Sin(e), es * (1 - Cos(e))); edge := e;
  ce := Cos(e); se := Sin(e);
  jt[J.ANL].set(RIG.stance, RIG.ankleY * ce, RIG.ankleY * se).add(bc); jt[J.ANR].set(-RIG.stance, RIG.ankleY * ce, RIG.ankleY * se).add(bc);
  // --- Becken: Schwerpunkt verlagert sich per Lean ueber die Kante
  H := RIG.ankleY + (RIG.leg1 + RIG.leg2) * (0.95 - 0.45 * cmp); cl := Cos(ln); sl := Sin(ln);
  pz := -0.05 * cmp;
  jt[J.PELVIS].set(0.02 + bc.x, bc.y + H * cl - pz * sl, bc.z + H * sl + pz * cl);
  rp := rho * 0.55;
  t.Lp.set(Cos(rp), 0, -Sin(rp)); RotX(t.Lp, ln);
  t.upP.set(0, 1, 0); RotX(t.upP, ln);
  jt[J.HIPL].copy(jt[J.PELVIS]).addScaledVector(t.Lp, RIG.hipW).addScaledVector(t.upP, -RIG.hipDrop);
  jt[J.HIPR].copy(jt[J.PELVIS]).addScaledVector(t.Lp, -RIG.hipW).addScaledVector(t.upP, -RIG.hipDrop);
  // Beine nicht ueberstrecken: Becken ggf. absenken
  for it := 0 to 1 do begin
    dl := jt[J.HIPL].distanceTo(jt[J.ANL]); dr := jt[J.HIPR].distanceTo(jt[J.ANR]); mx := Max(dl, dr) - (RIG.leg1 + RIG.leg2 - 0.02);
    if mx > 0 then begin jt[J.PELVIS].addScaledVector(t.upP, -mx); jt[J.HIPL].addScaledVector(t.upP, -mx); jt[J.HIPR].addScaledVector(t.upP, -mx); end;
  end;
  // --- Oberkoerper: Rotation in die Kurve, Vorlage, Angulation
  t.F.set(Sin(rho), 0, Cos(rho)); t.L.set(Cos(rho), 0, -Sin(rho)); t.up.set(0, 1, 0);
  t.spine.copy(t.up).multiplyScalar(Cos(bnd)).addScaledVector(t.F, Sin(bnd));
  RotX(t.spine, ln * 0.75); RotX(t.L, ln * 0.75); RotX(t.F, ln * 0.4);
  jt[J.CHEST].copy(jt[J.PELVIS]).addScaledVector(t.spine, RIG.spine);
  t.upH.copy(t.spine).addScaledVector(t.up, 0.9).normalize;
  jt[J.NECK].copy(jt[J.CHEST]).addScaledVector(t.upH, RIG.neck);
  jt[J.HEAD].copy(jt[J.NECK]).addScaledVector(t.upH, RIG.headL);
  // Kopf blickt in Fahrtrichtung
  t.tmp.set(s.velLocal.x, 0, s.velLocal.z);
  if t.tmp.lengthSq < 1 then t.tmp.set(1, 0, 0.3);
  t.tmp.normalize;
  if s.grounded then t.tmp.addScaledVector(t.F, 0.35).normalize;
  look.lerp(t.tmp, 1 - Exp(-8 * dt)).normalize;
  jt[J.FACE].copy(jt[J.HEAD]).addScaledVector(look, RIG.face);
  jt[J.SHL_].copy(jt[J.CHEST]).addScaledVector(t.L, RIG.shW).addScaledVector(t.spine, RIG.shUp);
  jt[J.SHR_].copy(jt[J.CHEST]).addScaledVector(t.L, -RIG.shW).addScaledVector(t.spine, RIG.shUp);
  // --- Knie: IK, Pol Richtung Zehen, leicht zur Board-Mitte
  t.pole.copy(t.F).add(t.tmp2.set(-0.3, 0.15, 0)); SolveIK(jt[J.HIPL], jt[J.ANL], RIG.leg1, RIG.leg2, t.pole, jt[J.KNL]);
  t.pole.copy(t.F).add(t.tmp2.set(0.3, 0.15, 0)); SolveIK(jt[J.HIPR], jt[J.ANR], RIG.leg1, RIG.leg2, t.pole, jt[J.KNR]);
  // --- Haende: Balance-Ziele + Feder mit Traegheit (Pseudokraft aus Querbeschleunigung)
  air := if s.grounded then 0.0 else 1.0;
  spread := 0.25 + 0.4 * Abs(en) + air * 0.55 + 0.3 * s.brake + (if s.idle then -0.2 else 0.0);
  var tg := t.tgt; ka := RIG.reach;
  tg.copy(jt[J.SHL_]).addScaledVector(t.L, ka * (0.15 + spread * 0.3)).addScaledVector(t.F, ka * (0.25 + 0.15 * heel + 0.1 * toe - 0.15 * s.charge)).addScaledVector(t.up, -ka * (0.42 - spread * 0.28 + 0.1 * toe));
  if s.tuck > 0.01 then tg.lerp(t.tmp2.copy(jt[J.KNL]).addScaledVector(t.F, 0.14).addScaledVector(t.up, 0.08), s.tuck * 0.85);
  HandSpring(hL, hLv, tg, s, dt);
  tg.copy(jt[J.SHR_]).addScaledVector(t.L, -ka * (0.15 + spread * 0.3)).addScaledVector(t.F, ka * (0.18 + 0.1 * heel + 0.1 * toe - 0.15 * s.charge)).addScaledVector(t.up, -ka * (0.45 - spread * 0.3 + 0.1 * toe));
  if s.tuck > 0.01 then tg.lerp(t.tmp2.copy(jt[J.KNR]).addScaledVector(t.F, 0.14).addScaledVector(t.up, 0.1), s.tuck * 0.85);
  HandSpring(hR, hRv, tg, s, dt);
  // Armlaenge begrenzen
  if grb > 0.01 then begin // Beine anziehen, hintere Hand greift zwischen den Bindungen an die Toe-Kante, vordere Hand weit raus
    jt[J.ANL].y += 0.12 * grb; jt[J.ANR].y += 0.12 * grb;
    hR.lerp(t.tmp2.set(bc.x - 0.04, bc.y + 0.08 + 0.12 * grb, bc.z + 0.17), grb);
    hL.lerp(t.tmp2.copy(jt[J.SHL_]).addScaledVector(t.L, 0.3).addScaledVector(t.up, 0.18), grb * 0.8);
    SolveIK(jt[J.HIPL], jt[J.ANL], RIG.leg1, RIG.leg2, t.pole.copy(t.F).add(t.tmp.set(-0.3, 0.15, 0)), jt[J.KNL]);
    SolveIK(jt[J.HIPR], jt[J.ANR], RIG.leg1, RIG.leg2, t.pole.copy(t.F).add(t.tmp.set(0.3, 0.15, 0)), jt[J.KNR]);
  end;
  ClampArm(jt[J.SHL_], hL); ClampArm(jt[J.SHR_], hR);
  jt[J.HAL].copy(hL); jt[J.HAR].copy(hR);
  t.pole.copy(t.up).multiplyScalar(-0.8).addScaledVector(t.F, -0.4).addScaledVector(t.L, 0.4); SolveIK(jt[J.SHL_], jt[J.HAL], RIG.arm1, RIG.arm2, t.pole, jt[J.ELL]);
  t.pole.copy(t.up).multiplyScalar(-0.8).addScaledVector(t.F, -0.4).addScaledVector(t.L, -0.4); SolveIK(jt[J.SHR_], jt[J.HAR], RIG.arm1, RIG.arm2, t.pole, jt[J.ELR]);
end;

procedure TRiderAnimator.ClampArm(sh, h: JVector3);
var l, mx: Float;
begin
  var d := t.tmp2.subVectors(h, sh); l := d.length; mx := RIG.arm1 + RIG.arm2 - 0.01;
  if l > mx then h.copy(sh).addScaledVector(d, mx / l);
end;

procedure TRiderAnimator.HandSpring(p, v, target: JVector3; s: TAnimState; dt: Float);
const k = 110; c = 13;
begin
  var acc := t.acc;
  acc.subVectors(target, p).multiplyScalar(k).addScaledVector(v, -c);
  acc.z -= s.latAcc * 0.9; acc.y -= (s.load - 1) * CONFIG.gravity * 0.6;   // Traegheit im beschleunigten Frame
  v.addScaledVector(acc, dt); p.addScaledVector(v, dt);
end;

procedure PoseFromState(anim: TRiderAnimator; st: TPoseState; dt: Float; wj: TJoints; boardPos: JVector3; boardQ: JQuaternion);
begin
  InitTemps;
  var up := st.up; var f := _pvF; var r := _pvR; var S := st.anim;
  _pvHd.set(Sin(st.yaw), 0, Cos(st.yaw));
  f.copy(_pvHd).addScaledVector(up, -_pvHd.dot(up)).normalize; r.crossVectors(f, up);
  S.edge := st.edge; S.velLocal.set(st.vel.dot(f), st.vel.dot(up), st.vel.dot(r));
  anim.Update(dt, S);
  var lj := anim.jnt; var bc := anim.bc;
  for var i := 0 to NJ - 1 do begin
    var l := lj[i]; wj[i].copy(st.pos).addScaledVector(f, l.x).addScaledVector(up, l.y).addScaledVector(r, l.z);
  end;
  boardPos.copy(st.pos).addScaledVector(f, bc.x).addScaledVector(up, bc.y).addScaledVector(r, bc.z);
  boardQ.setFromRotationMatrix(_pvM.makeBasis(f, up, r)).multiply(_pvQe.setFromAxisAngle(_pvX, st.edge));
  if st.flip <> 0 then RotateRiderPose(wj, boardPos, boardQ, _pvPiv.copy(st.pos).addScaledVector(up, 0.55), r, st.flip, _pvFq);
end;

procedure RotateRiderPose(wj: TJoints; boardPos: JVector3; boardQ: JQuaternion; pivot, axis: JVector3; ang: Float; q: JQuaternion);
begin
  q.setFromAxisAngle(axis, -ang);
  for var w in wj do w.sub(pivot).applyQuaternion(q).add(pivot);
  boardPos.sub(pivot).applyQuaternion(q).add(pivot); boardQ.premultiply(q);
end;

{ TRagdoll }

constructor TRagdoll.Create(c: TCourse);
begin
  course := c; rest := new JFloat32Array(RAG_LINKS.Length div 2);
  for var i := 0 to NJ - 1 do begin p.Add(new JVector3); o.Add(new JVector3); contact.Add(False); end;
  _d := new JVector3; speed := 0;
end;

procedure TRagdoll.Start(joints: TJoints; vel: JVector3; dt: Float);
var tumble: Float;
begin
  for var i := 0 to NJ - 1 do begin p[i].copy(joints[i]); o[i].copy(joints[i]).addScaledVector(vel, -dt); end;
  // Ueberschlag: Oberkoerper bekommt Vorwaerts-/Rotationsimpuls
  tumble := 0.35 + Random * 0.3;
  for var i in [J.HEAD, J.FACE, J.NECK, J.CHEST, J.SHL_, J.SHR_] do begin o[i].addScaledVector(vel, -dt * tumble); o[i].y -= dt * 1.5; end;
  for var k := 0 to RAG_LINKS.Length div 2 - 1 do rest[k] := joints[RAG_LINKS[k * 2]].distanceTo(joints[RAG_LINKS[k * 2 + 1]]);
end;

procedure TRagdoll.Step(dt: Float);
var g, sp, vx, vy, vz, l, corr, rad, h, cz, lim, d: Float; i, it, k, ns: Integer;
begin
  g := CONFIG.gravity * dt * dt; var c := course; sp := 0;
  for i := 0 to NJ - 1 do begin
    var pp := p[i]; var oo := o[i];
    vx := (pp.x - oo.x) * 0.998; vy := (pp.y - oo.y) * 0.998; vz := (pp.z - oo.z) * 0.998;
    oo.copy(pp); pp.x += vx; pp.y += vy - g; pp.z += vz; sp += vx * vx + vy * vy + vz * vz;
  end;
  speed := Sqrt(sp / NJ) / dt;
  for it := 0 to 7 do begin
    for k := 0 to RAG_LINKS.Length div 2 - 1 do begin
      var a := p[RAG_LINKS[k * 2]]; var b := p[RAG_LINKS[k * 2 + 1]]; var dv := _d.subVectors(b, a); l := dv.length;
      if l = 0 then l := 1e-6;
      corr := (l - rest[k]) / l * 0.5; a.addScaledVector(dv, corr); b.addScaledVector(dv, -corr);
    end;
    if (it mod 2 = 0) or (it = 7) then for i := 0 to NJ - 1 do begin
      var pp := p[i];
      rad := if i = J.HEAD then RIG.headR else if (i = J.CHEST) or (i = J.PELVIS) then 0.14 else 0.07;
      h := c.height(pp.x, pp.z) + rad;
      if pp.y < h then begin pp.y := h; contact[i] := True; end;
      // Fangnetz an der Kurvenaussenseite: nicht durchfallen, sondern daran entlangschlittern
      ns := c.netSide(pp.z);
      if (ns <> 0) and (pp.y < h + 1.4) then begin
        cz := c.cx(pp.z); lim := c.width(pp.z) + 1.7 - rad; d := pp.x - cz;
        if ns * d > lim then begin
          var oo := o[i]; vx := pp.x - oo.x; pp.x := cz + ns * lim; oo.x := pp.x + vx * 0.2; oo.z := pp.z - (pp.z - oo.z) * 0.92; netHit := True;
        end;
      end;
    end;
  end;
  // Schneereibung einmal pro Schritt fuer Punkte mit Bodenkontakt
  for i := 0 to NJ - 1 do if contact[i] then begin
    var pp := p[i]; var oo := o[i]; contact[i] := False;
    oo.x := pp.x - (pp.x - oo.x) * 0.968; oo.z := pp.z - (pp.z - oo.z) * 0.968; oo.y := pp.y;
  end;
end;

initialization
  RAG_LINKS := [
    J.PELVIS, J.CHEST, J.CHEST, J.NECK, J.NECK, J.HEAD, J.HEAD, J.FACE, J.NECK, J.FACE, J.CHEST, J.FACE,
    J.CHEST, J.SHL_, J.CHEST, J.SHR_, J.SHL_, J.SHR_, J.SHL_, J.ELL, J.ELL, J.HAL, J.SHR_, J.ELR, J.ELR, J.HAR,
    J.PELVIS, J.HIPL, J.PELVIS, J.HIPR, J.HIPL, J.HIPR, J.HIPL, J.KNL, J.KNL, J.ANL, J.HIPR, J.KNR, J.KNR, J.ANR,
    J.ANL, J.ANR, J.SHL_, J.HIPL, J.SHR_, J.HIPR, J.SHL_, J.HIPR, J.SHR_, J.HIPL, J.PELVIS, J.HEAD, J.HIPL, J.ANR, J.HIPR, J.ANL];
end.
