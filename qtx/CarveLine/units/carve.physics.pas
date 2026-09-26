unit carve.physics;

// RiderPhysics — Board als Rigid Body auf analytischem Terrain
// Koordinaten: Y oben, bergab +Z. yaw=0 => Nose zeigt nach +Z.
// Regular-Stance: Toeside = rechts der Fahrtrichtung, Heelside = links.
// Kante > 0 = Toeside, < 0 = Heelside.

interface

uses
  carve.web, carve.util, carve.config, carve.three, carve.course, carve.world;

type
  // Ereignisse: 'ollie', 'takeoff', 'land' (a = sauber 0/1, b = Aufprall), 'air' (a = Luftzeit, b = Drehung), 'bump', 'crash' (a = Grund)
  TPhysicsEvent = procedure(typ: String; a, b: Variant);

  TTrick = class
  public
    flips: Integer;
    flipDir: Float;
    grabT: Float;
  end;

  TRiderPhysics = class
  private
    _a, _t, _hd, _n2: JVector3;
    FBrakeWas: Boolean;
    procedure Emit(typ: String; a: Variant = 0; b: Variant = 0);
    procedure Takeoff(input: TControls);
    procedure Land(impact: Float);
  public
    course: TCourse;
    terrain: TTerrain;
    pos, prevPos, vel, n, boardUp, prevBoardUp, f, r: JVector3;
    onEvent: TPhysicsEvent;
    yaw, prevYaw, yawRate, edge, prevEdge: Float;
    grounded: Boolean;
    airTime, spin, Nsm, load, latAcc, skid, edgePressure, carveQ, charge: Float;
    jumpPrev: Boolean;
    brakeSide, catchT, maxEdgeNow, speed: Float;
    frozen: Boolean;
    tuck, brake, lastImpact: Float;
    crashReason: String;
    flip, prevFlip, flipRate, grab, grabT: Float;
    armF, armB: Boolean;
    lastTrick: TTrick;
    constructor Create(c: TCourse; t: TTerrain);
    procedure Reset(z: Float);
    procedure Step(dt: Float; input: TControls);
    procedure Crash(reason: String);
  end;

implementation

constructor TRiderPhysics.Create(c: TCourse; t: TTerrain);
begin
  course := c; terrain := t;
  pos := new JVector3; prevPos := new JVector3; vel := new JVector3;
  n := new JVector3(0, 1, 0); boardUp := new JVector3(0, 1, 0); prevBoardUp := new JVector3(0, 1, 0);
  f := new JVector3; r := new JVector3;
  _a := new JVector3; _t := new JVector3; _hd := new JVector3; _n2 := new JVector3;
  onEvent := nil;
  Reset(4);
end;

procedure TRiderPhysics.Reset(z: Float);
var x: Float;
begin
  var c := course; x := c.cx(z);
  pos.set(x, c.height(x, z), z); prevPos.copy(pos); vel.set(0, 0, 0);
  yaw := ArcTan2(c.cxp(z), 1); prevYaw := yaw; yawRate := 0;
  edge := 0; prevEdge := 0; grounded := True; airTime := 0; spin := 0;
  Nsm := CONFIG.mass * CONFIG.gravity; load := 1;
  latAcc := 0; skid := 0; edgePressure := 0; carveQ := 1; charge := 0; jumpPrev := False;
  brakeSide := -1; catchT := 0; maxEdgeNow := CONFIG.maxEdge; speed := 0; frozen := False;
  tuck := 0; brake := 0; lastImpact := 0; crashReason := '';
  flip := 0; prevFlip := 0; flipRate := 0; grab := 0; grabT := 0; armF := False; armB := False; lastTrick := nil;
  c.normal(pos.x, pos.z, n); boardUp.copy(n); prevBoardUp.copy(n);
end;

procedure TRiderPhysics.Emit(typ: String; a: Variant = 0; b: Variant = 0);
begin
  if Assigned(onEvent) then onEvent(typ, a, b);
end;

procedure TRiderPhysics.Step(dt: Float; input: TControls);
const m = CONFIG.mass; g = CONFIG.gravity;
var spd, velYaw, cda, kd, vf, vl, vfp, groom, maxE, eT, ae, sinE, Rad, aCarve, aReq, q, wT, Nf, vts, mu, muE, Fmax, Fdes, Flat,
    fIn, h, Nraw, vn, impact, cz, d, W, sp, lat: Float; ns: Integer;
begin
  var c := course; var v := vel; var p := pos; var a := _a;
  prevPos.copy(p); prevYaw := yaw; prevEdge := edge; prevBoardUp.copy(boardUp); prevFlip := flip;
  if frozen then exit;
  tuck := input.tuck; brake := input.brake;
  spd := v.length;
  c.normal(p.x, p.z, n);
  velYaw := if spd > 1 then ArcTan2(v.x, v.z) else yaw;
  a.set(0, -g, 0);
  // quadratischer Luftwiderstand: F = 1/2 rho cA v2
  cda := Lerp(CONFIG.cdaUpright, CONFIG.cdaTuck, tuck) + brake * CONFIG.cdaBrakeExtra;
  kd := 0.5 * CONFIG.airDensity * cda / m;
  a.addScaledVector(v, -kd * spd);

  if grounded then begin
    var hd := _hd.set(Sin(yaw), 0, Cos(yaw));
    f.copy(hd).addScaledVector(n, -hd.dot(n)).normalize;
    r.crossVectors(f, n);                                 // Toe-Seite (rechts)
    vf := v.dot(f); vl := v.dot(r); vfp := Max(vf, 0.0);
    groom := c.groom(p.x, p.z);
    // --- Kantwinkel folgt der Eingabe; Hocke reduziert Kantwinkel & Reaktion
    maxE := CONFIG.maxEdge * (1 - CONFIG.tuckEdgeLoss * tuck); maxEdgeNow := maxE;
    eT := input.steer * maxE;
    if (brake > 0.05) and (spd > 1.5) then begin
      if not FBrakeWas then brakeSide := if input.steer > 0.25 then 1.0 else -1.0;
      eT := Lerp(eT, brakeSide * CONFIG.brakeEdge, brake);
    end;
    FBrakeWas := brake > 0.05;
    edge := Damp(edge, eT, Lerp(CONFIG.edgeRate, CONFIG.edgeRateTuck, tuck), dt);
    ae := Abs(edge); sinE := Sin(ae);
    // --- Carving-Radius: R = (Rsc + k*v2)/sin(Kante)  (Taillierung + Flex/Balancegrenze)
    Rad := (CONFIG.sidecutRadius + CONFIG.speedRadiusK * vfp * vfp) / Max(sinE, 0.02);
    aCarve := vfp * vfp / Rad; aReq := g * Tan(ae) * CONFIG.balanceFactor;
    // Balance: zu viel Kante bei zu wenig Speed => Kante waescht aus (Rutschen)
    q := if ae < 0.05 then 1.0 else Power(ClampF(aCarve / aReq, 0, 1), 1.3);
    q := Max(q, Max(brake, ClampF(Abs(vl) / 4, 0, 1) * 0.9));
    carveQ := q;
    wT := if ae > 0.01 then -SignF(edge) * vfp / Rad * q else 0.0;                 // Carve-Drehrate
    wT += -input.steer * CONFIG.pivotRate * (1 - q) * (1 - 0.6 * tuck);           // Andrehen (geschlittert)
    if (brake > 0.05) and (spd > 1.5) then wT := Lerp(wT, WrapAngle(velYaw - brakeSide * CONFIG.brakeAngle - yaw) * CONFIG.brakeTurnRate, brake);
    if spd > 0.5 then wT += WrapAngle(velYaw - yaw) * CONFIG.selfAlign * (1 - ae / CONFIG.maxEdge) * (1 - brake) * Min(spd / 3, 1.0);
    yawRate := Damp(yawRate, wT, CONFIG.yawResponse, dt);
    yaw += yawRate * dt;
    // --- Normalkraft aus geglaetteten Kontaktimpulsen (inkl. Kompression in Senken)
    Nf := Max(Nsm, 0.2 * m * g * n.y);
    load := Nf / (m * g);
    // --- Gleitreibung
    var vt := _t.copy(v).addScaledVector(n, -v.dot(n)); vts := vt.length;
    mu := Lerp(CONFIG.muPowder, CONFIG.muGroomed, groom);
    if vts > 1e-3 then a.addScaledVector(vt, -Min(mu * Nf / m, vts / dt) / vts);
    // Anschieben (Skaten) aus dem Stand: W bei sehr wenig Tempo schiebt in Board-Richtung – z. B. nach einem Sturz vor einem Buckel
    if (tuck > 0.5) and (brake < 0.1) and (vfp < 5.5) then a.addScaledVector(f, CONFIG.pushAcc * tuck * (1 - vfp / 5.5));
    // --- Seitenfuehrung der Kante (begrenzt durch Grip)
    muE := (CONFIG.gripFlat + (CONFIG.gripMax - CONFIG.gripFlat) * sinE / Sin(CONFIG.maxEdge)) * (0.35 + 0.65 * q) * Lerp(CONFIG.powderGrip, 1, groom);
    Fmax := muE * Nf; Fdes := -m * vl / Max(CONFIG.gripTau, dt);
    Flat := ClampF(Fdes, -Fmax, Fmax);
    a.addScaledVector(r, Flat / m);
    latAcc := Flat / m;
    edgePressure := Abs(Flat) / (m * g) + (Nf / (m * g) - 1) * 0.3;
    skid := Damp(skid, Abs(vl), 12, dt);
    // Verkanten: gekippte Kante auf der Seite, in die das Board rutscht
    if (vl * edge > 0) and (Abs(vl) > CONFIG.catchEdgeSlip) and (ae > 0.4) then begin
      catchT += dt;
      if catchT > 0.12 then begin Crash('edge'); exit; end;
    end else catchT := 0;
    // --- Ollie: Halten laedt, Loslassen springt
    if input.jump then charge := Min(1.0, charge + dt / CONFIG.ollieChargeTime)
    else if jumpPrev and (charge > 0.02) then begin
      v.addScaledVector(n, CONFIG.ollieBase + CONFIG.ollieCharge * charge);
      grounded := False; airTime := 0; spin := 0; charge := 0; Takeoff(input); Emit('ollie');
    end else charge := 0;
    boardUp.lerp(n, 1 - Exp(-20 * dt)).normalize;
    grab := Damp(grab, 0, 14, dt);
  end else begin
    // --- Luft: Spin-Steuerung, Board richtet sich zur Landeflaeche aus
    yawRate := Damp(yawRate, -input.steer * CONFIG.airSpinRate, 6, dt);
    yaw += yawRate * dt; spin += yawRate * dt;
    edge := Damp(edge, 0, 4, dt);
    airTime += dt; charge := 0;
    // Flip: W vorwaerts / S rueckwaerts – erst wenn die Taste nach dem Absprung neu gedrueckt wurde (Hocke halten loest keinen Flip aus)
    if input.tuck < 0.3 then armF := True;
    if input.brake < 0.3 then armB := True;
    fIn := (if armF then input.tuck else 0.0) - (if armB then input.brake else 0.0);
    flipRate := Damp(flipRate, if airTime > 0.06 then fIn * CONFIG.flipRate else 0.0, 9, dt); flip += flipRate * dt;
    // Grab: haelt die Kante, zaehlt fuer Punkte
    grab := Damp(grab, if input.grab then 1.0 else 0.0, 12, dt);
    if grab > 0.6 then grabT += dt;
    latAcc := Damp(latAcc, 0, 5, dt); skid := Damp(skid, 0, 5, dt); edgePressure := 0;
    c.normal(p.x, p.z, _n2); boardUp.lerp(_n2, 1 - Exp(-3.2 * dt)).normalize;
    load := 0;
  end;
  jumpPrev := input.jump;
  // --- Integration (semi-implizit)
  v.addScaledVector(a, dt); p.addScaledVector(v, dt);
  // --- Bodenkontakt
  h := c.height(p.x, p.z); Nraw := 0;
  if p.y <= h then begin
    p.y := h; c.normal(p.x, p.z, _n2); vn := v.dot(_n2);
    impact := 0;
    if vn < 0 then begin v.addScaledVector(_n2, -vn); impact := -vn; end;
    Nraw := m * impact / dt;
    if not grounded then begin grounded := True; Land(impact); if crashReason <> '' then exit; end;
  end else if grounded and (p.y - h > CONFIG.airThreshold) then begin
    grounded := False; airTime := 0; spin := 0; Takeoff(input); Emit('takeoff');
  end;
  Nsm += (Nraw - Nsm) * (1 - Exp(-dt / 0.035));
  // --- Hindernisse: Fangnetze, Baeume, Weltgrenze
  cz := c.cx(p.z); d := p.x - cz; W := c.width(p.z); ns := c.netSide(p.z); sp := v.length;
  if (ns <> 0) and (SignF(d) = ns) and (Abs(d) > W + 1.9) then begin
    if sp > CONFIG.netCrashSpeed then begin Crash('net'); exit; end;
    p.x := cz + ns * (W + 1.7); lat := v.x; v.x := -lat * 0.3; v.multiplyScalar(0.6); Emit('bump', 0.6);
  end;
  if (Abs(d) > W + 8) and terrain.HitTree(p.x, p.z, 0.35) then begin Crash('tree'); exit; end;
  if (Abs(d) > W + 4) and (terrain.resort <> nil) and terrain.resort.Hit(p.x, p.z, 0.35) then begin Crash('obstacle'); exit; end;
  if (Abs(d) > W + 140) or not IsFiniteF(p.x + p.y + p.z) then begin Crash('lost'); exit; end;
  speed := sp;
end;

procedure TRiderPhysics.Takeoff(input: TControls);
begin
  flip := 0; prevFlip := 0; flipRate := 0; grabT := 0; armF := input.tuck < 0.3; armB := input.brake < 0.3;
end;

procedure TRiderPhysics.Land(impact: Float);
var velYaw, hs, err, flipErr, rot: Float; flips: Integer;
begin
  var v := vel; velYaw := ArcTan2(v.x, v.z); hs := Hypot2(v.x, v.z);
  err := if hs > 3 then Abs(WrapAngle(yaw - velYaw)) else 0.0;       // im Stand gibt es keine Fahrtrichtung
  flipErr := Abs(WrapAngle(flip)); flips := Round(Abs(flip) / TAU);
  lastTrick := TTrick.Create;
  lastTrick.flips := if flipErr < CONFIG.landFlipCrash then flips else 0;
  lastTrick.flipDir := SignF(flip); lastTrick.grabT := grabT;
  flip := 0; prevFlip := 0; flipRate := 0; grab := 0;
  lastImpact := impact;
  if (impact > CONFIG.landCrashImpact) or (err > CONFIG.landCrashAngle) or (flipErr > CONFIG.landFlipCrash) then begin Crash('landing'); exit; end;
  rot := Round(Abs(spin) / PI_) * 180;
  if (err > CONFIG.landCleanAngle) or (impact > CONFIG.landHardImpact) or (flipErr > CONFIG.landFlipClean) then begin
    v.multiplyScalar(0.72); yaw := Lerp(yaw, yaw - WrapAngle(yaw - velYaw), 0.6);
    Emit('land', 0, impact);   // sketchy
  end else Emit('land', 1, impact);
  if airTime > 0.25 then Emit('air', airTime, rot);
end;

procedure TRiderPhysics.Crash(reason: String);
begin
  crashReason := reason; Emit('crash', reason);
end;

end.
