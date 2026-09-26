unit carve.fx;

// ParticleSystem (Schneespray), Trail (Boardspur im Schnee), CameraRig (Verfolger / Action / Helm)

interface

uses
  qtx.sysutils, carve.web, carve.util, carve.config, carve.three, carve.course, carve.gfx, carve.skeleton;

type
  // ParticleSystem — gepoolte Schneepartikel (Spray, Pulverwolken)
  TParticleSystem = class
  public
    maxN, cursor, limit: Integer;
    pos, vel, life, maxLife, size0: JFloat32Array;
    aPos, aSize, aAlpha: JBufferAttribute;
    mat: JShaderMaterial;
    points: JPoints;
    constructor Create(scene: JScene; aMax: Integer = 4000);
    procedure SetLimit(n: Integer);
    procedure Emit(x, y, z, vx, vy, vz, lf, size: Float);
    procedure Burst(p, v: JVector3; count: Integer; spread, up, lf, size: Float);
    procedure Update(dt: Float);
    procedure Clear;
  end;

  // Trail — Boardspur im Schnee (Ringpuffer-Ribbon, verblasst)
  TTrail = class
  private
    _r: JVector3;
  public
    n, head: Integer;
    last: JVector3;
    broken: Boolean;
    PosA, BirthA, OnA, SideA, KindA: JFloat32Array;   // im Original P, B, O, U, K (kollidiert in Pascal mit p/b/k)
    mat: JShaderMaterial;
    mesh: JMesh;
    constructor Create(scene: JScene; aN: Integer = 700);
    procedure Reset;
    procedure Add(p, right, nrm: JVector3; width, kind, time: Float);
    procedure BreakLine;
  end;

  // Kamera-Ziel pro Frame (vom Spiel gefuellt)
  TCamTarget = class
  public
    speed, latAcc: Float;
    vel, heading, focus, head, lookDir: JVector3;
    crashed, grounded: Boolean;
    constructor Create;
  end;

  // CameraRig — Verfolger / Action-Cam / Helmkamera, gedaempft, Speed-FOV, Shake
  TCameraRig = class
  private
    _d, _side, _tmp, _up: JVector3;
  public
    cam: JPerspectiveCamera;
    course: TCourse;
    mode: Integer;
    pos, look, dir: JVector3;
    fov, trauma, t, roll: Float;
    constructor Create(camera: JPerspectiveCamera; c: TCourse);
    procedure AddTrauma(x: Float);
    procedure Snap(tg: TCamTarget);
    procedure Update(dt: Float; tg: TCamTarget; snapNow: Boolean = False);
  end;

const
  CAM_NAMES: array [0..2] of String = ('VERFOLGER', 'ACTION', 'HELM');

implementation

{ TParticleSystem }

constructor TParticleSystem.Create(scene: JScene; aMax: Integer = 4000);
begin
  maxN := aMax; cursor := 0; limit := aMax;
  pos := new JFloat32Array(aMax * 3); vel := new JFloat32Array(aMax * 3); life := new JFloat32Array(aMax); maxLife := new JFloat32Array(aMax);
  size0 := new JFloat32Array(aMax);
  var g := new JBufferGeometry;
  aPos := new JBufferAttribute(pos, 3); aPos.setUsage(DynamicDrawUsage);
  aSize := new JBufferAttribute(new JFloat32Array(aMax), 1); aSize.setUsage(DynamicDrawUsage);
  aAlpha := new JBufferAttribute(new JFloat32Array(aMax), 1); aAlpha.setUsage(DynamicDrawUsage);
  g.setAttribute('position', aPos); g.setAttribute('size', aSize); g.setAttribute('alpha', aAlpha);
  var unis: Variant := new JObject;
  unis.uScale := Uniform(600); unis.uSun := Uniform(new JColor(1.25, 1.22, 1.15)); unis.uShade := Uniform(new JColor(0.62, 0.72, 0.9));
  mat := new JShaderMaterial(class
    transparent := True; depthWrite := False;
    uniforms := unis;
    vertexShader := #"attribute float size; attribute float alpha; uniform float uScale; varying float vA; varying float vY;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size * uScale / max(-mv.z, 0.1); vA = alpha; vY = 0.0;
          gl_Position = projectionMatrix * mv; if (alpha <= 0.0) gl_PointSize = 0.0; }";
    fragmentShader := #"uniform vec3 uSun; uniform vec3 uShade; varying float vA;
        void main(){ vec2 d = gl_PointCoord - 0.5; float r = dot(d, d) * 4.0; if (r > 1.0) discard;
          float a = pow(1.0 - r, 1.6) * vA; vec3 col = mix(uShade, uSun, 0.55 + 0.45 * (0.5 - d.y));
          gl_FragColor = vec4(col, a); }";
  end);
  points := new JPoints(g, mat); points.frustumCulled := False; scene.add(points);
end;

procedure TParticleSystem.SetLimit(n: Integer);
begin
  limit := Min(n, maxN);
end;

procedure TParticleSystem.Emit(x, y, z, vx, vy, vz, lf, size: Float);
var i: Integer;
begin
  i := cursor; cursor := (cursor + 1) mod limit;
  pos[i * 3] := x; pos[i * 3 + 1] := y; pos[i * 3 + 2] := z;
  vel[i * 3] := vx; vel[i * 3 + 1] := vy; vel[i * 3 + 2] := vz;
  life[i] := lf; maxLife[i] := lf; size0[i] := size;
end;

procedure TParticleSystem.Burst(p, v: JVector3; count: Integer; spread, up, lf, size: Float);
var a, r: Float;
begin
  for var k := 0 to count - 1 do begin
    a := Random * TAU; r := Random * spread;
    Emit(p.x + (Random - 0.5) * 0.6, p.y + 0.1, p.z + (Random - 0.5) * 0.6,
      v.x * 0.4 + Cos(a) * r, Random * up, v.z * 0.4 + Sin(a) * r, lf * (0.6 + Random * 0.8), size * (0.6 + Random * 0.8));
  end;
end;

procedure TParticleSystem.Update(dt: Float);
var drag, g, t: Float;
begin
  var PP := pos; var VV := vel; var S := aSize.&array; var A := aAlpha.&array;
  drag := Exp(-2.4 * dt); g := CONFIG.gravity * 0.45 * dt;
  for var i := 0 to limit - 1 do begin
    if life[i] <= 0 then begin A[i] := 0; continue; end;
    life[i] := life[i] - dt; t := 1 - life[i] / maxLife[i];
    VV[i * 3] := VV[i * 3] * drag; VV[i * 3 + 1] := VV[i * 3 + 1] * drag - g; VV[i * 3 + 2] := VV[i * 3 + 2] * drag;
    PP[i * 3] := PP[i * 3] + VV[i * 3] * dt; PP[i * 3 + 1] := PP[i * 3 + 1] + VV[i * 3 + 1] * dt; PP[i * 3 + 2] := PP[i * 3 + 2] + VV[i * 3 + 2] * dt;
    S[i] := size0[i] * (0.5 + t * 1.8); A[i] := Sin(Min(t * 6, 1.0) * PI_ * 0.5) * (1 - t) * 0.75;
  end;
  aPos.needsUpdate := True; aSize.needsUpdate := True; aAlpha.needsUpdate := True;
end;

procedure TParticleSystem.Clear;
begin
  life.fill(0);
end;

{ TTrail }

constructor TTrail.Create(scene: JScene; aN: Integer = 700);
var a, b: Integer;
begin
  n := aN; head := 0; last := new JVector3(1e9, 0, 0); broken := True;
  var g := new JBufferGeometry;
  PosA := new JFloat32Array(aN * 2 * 3); BirthA := new JFloat32Array(aN * 2); OnA := new JFloat32Array(aN * 2); SideA := new JFloat32Array(aN * 2); KindA := new JFloat32Array(aN * 2);
  for var i := 0 to aN - 1 do begin SideA[i * 2] := 0; SideA[i * 2 + 1] := 1; BirthA[i * 2] := -1e4; BirthA[i * 2 + 1] := -1e4; end;
  g.setAttribute('position', new JBufferAttribute(PosA, 3)); g.setAttribute('birth', new JBufferAttribute(BirthA, 1));
  g.setAttribute('on', new JBufferAttribute(OnA, 1)); g.setAttribute('side', new JBufferAttribute(SideA, 1)); g.setAttribute('kind', new JBufferAttribute(KindA, 1));
  var idx: array of Integer;
  for var i := 0 to aN - 1 do begin
    a := i * 2; b := ((i + 1) mod aN) * 2;
    idx.Add(a); idx.Add(b); idx.Add(a + 1); idx.Add(a + 1); idx.Add(b); idx.Add(b + 1);
  end;
  g.setIndex(idx);
  var unis: Variant := new JObject;
  unis.uTime := SHARED.time; unis.uFade := Uniform(28);
  mat := new JShaderMaterial(class
    transparent := True; depthWrite := False; polygonOffset := True; polygonOffsetFactor := -2; polygonOffsetUnits := -4;
    uniforms := unis;
    vertexShader := #"attribute float birth; attribute float on; attribute float side; attribute float kind; uniform float uTime; uniform float uFade;
        varying float vA; varying float vS; varying float vK;
        void main(){ float age = uTime - birth; vA = on * (1.0 - smoothstep(uFade * 0.4, uFade, age)); vS = side; vK = kind;
          vec4 mv = modelViewMatrix * vec4(position, 1.0); vA *= 1.0 - smoothstep(60.0, 140.0, -mv.z); gl_Position = projectionMatrix * mv; }";
    fragmentShader := #"varying float vA; varying float vS; varying float vK;
        void main(){ float e = 1.0 - pow(abs(vS * 2.0 - 1.0), mix(1.5, 6.0, vK)); // Carve = scharfe Rille, Rutschen = breite Flaeche
          vec3 col = mix(vec3(0.56, 0.64, 0.80), vec3(0.42, 0.50, 0.70), vK);
          gl_FragColor = vec4(col, vA * e * mix(0.28, 0.55, vK)); }";
  end);
  mesh := new JMesh(g, mat); mesh.frustumCulled := False; scene.add(mesh);
  _r := new JVector3;
end;

procedure TTrail.Reset;
begin
  OnA.fill(0); broken := True; last.set(1e9, 0, 0); mesh.geometry.getAttribute('on').needsUpdate := True;
end;

procedure TTrail.Add(p, right, nrm: JVector3; width, kind, time: Float);
var NN, i, a, pv, g1, g2: Integer; onV: Float;
begin
  if not broken and (p.distanceToSquared(last) < 0.09) then exit;
  NN := n; i := head; a := i * 2; head := (head + 1) mod NN;
  if broken then begin pv := ((i - 1 + NN) mod NN) * 2; OnA[pv] := 0; OnA[pv + 1] := 0; end;   // kein Streifen ueber Spruenge
  var r := _r.copy(right).multiplyScalar(width * 0.5);
  PosA[a * 3] := p.x - r.x + nrm.x * 0.04; PosA[a * 3 + 1] := p.y - r.y + nrm.y * 0.04; PosA[a * 3 + 2] := p.z - r.z + nrm.z * 0.04;
  PosA[a * 3 + 3] := p.x + r.x + nrm.x * 0.04; PosA[a * 3 + 4] := p.y + r.y + nrm.y * 0.04; PosA[a * 3 + 5] := p.z + r.z + nrm.z * 0.04;
  BirthA[a] := time; BirthA[a + 1] := time; KindA[a] := kind; KindA[a + 1] := kind;
  onV := if broken then 0.0 else 1.0; OnA[a] := onV; OnA[a + 1] := onV; broken := False;
  // Ringpuffer-Naht: naechster Slot = degenerierte Kopie, uebernaechster aus => keine Verbindung neu<->alt
  g1 := head * 2; g2 := ((head + 1) mod NN) * 2;
  for var k := 0 to 5 do PosA[g1 * 3 + k] := PosA[a * 3 + k];
  OnA[g1] := 0; OnA[g1 + 1] := 0; OnA[g2] := 0; OnA[g2 + 1] := 0;
  last.copy(p);
  var geo := mesh.geometry;
  geo.getAttribute('position').needsUpdate := True; geo.getAttribute('birth').needsUpdate := True;
  geo.getAttribute('on').needsUpdate := True; geo.getAttribute('kind').needsUpdate := True;
end;

procedure TTrail.BreakLine;
begin
  broken := True;
end;

{ TCamTarget }

constructor TCamTarget.Create;
begin
  vel := new JVector3; heading := new JVector3; focus := new JVector3; head := new JVector3; lookDir := new JVector3;
end;

{ TCameraRig }

constructor TCameraRig.Create(camera: JPerspectiveCamera; c: TCourse);
begin
  cam := camera; course := c; mode := 0;
  pos := new JVector3; look := new JVector3; dir := new JVector3(0, 0, 1);
  fov := CONFIG.fovBase; trauma := 0; t := 0; roll := 0;
  _d := new JVector3; _side := new JVector3; _tmp := new JVector3; _up := new JVector3(0, 1, 0);
end;

procedure TCameraRig.AddTrauma(x: Float);
begin
  trauma := Min(1.0, trauma + x);
end;

procedure TCameraRig.Snap(tg: TCamTarget);
begin
  Update(1, tg, True);
end;

procedure TCameraRig.Update(dt: Float; tg: TCamTarget; snapNow: Boolean = False);
var kmh, desiredLambda, fovT, lookLambda, lx, ly, lz, dist, hgt, gh, sp, tr, tt, amp, ox, oy: Float; md: Integer;
begin
  kmh := tg.speed * 3.6; t += dt;
  // Blickrichtung: geglaettete horizontale Geschwindigkeit, bei Stillstand Board-Richtung
  var d := _d;
  if tg.speed > 2.5 then d.set(tg.vel.x, 0, tg.vel.z).normalize else d.copy(tg.heading);
  if snapNow then dir.copy(d) else dir.lerp(d, 1 - Exp(-3.0 * dt)).normalize;
  var side := _side.crossVectors(dir, _up);
  desiredLambda := 6; fovT := CONFIG.fovBase + kmh * CONFIG.fovSpeed; lookLambda := 10;
  var want := _tmp;
  md := if tg.crashed and (mode = 2) then 0 else mode;
  if md = 0 then begin
    dist := CONFIG.camDistance + tg.speed * 0.05 + (if tg.crashed then 2.0 else 0.0);
    hgt := CONFIG.camHeight + tg.speed * 0.012 + (if tg.crashed then 1.0 else 0.0);
    want.copy(tg.focus).addScaledVector(dir, -dist); want.y += hgt;
    lx := tg.focus.x + dir.x * 6; ly := tg.focus.y + 0.9; lz := tg.focus.z + dir.z * 6;
  end else if md = 1 then begin
    want.copy(tg.focus).addScaledVector(dir, -2.5).addScaledVector(side, 0.6); want.y += 0.55;
    lx := tg.focus.x + dir.x * 8; ly := tg.focus.y + 0.7; lz := tg.focus.z + dir.z * 8;
    desiredLambda := 12; fovT += 16;
  end else begin
    want.copy(tg.head).addScaledVector(tg.lookDir, RIG.headR); want.y += 0.04;
    lx := tg.head.x + tg.lookDir.x * 10; ly := tg.head.y + tg.lookDir.y * 10 - 0.8; lz := tg.head.z + tg.lookDir.z * 10;
    desiredLambda := 40; lookLambda := 14; fovT += 20;
  end;
  gh := course.height(want.x, want.z) + (if md = 1 then 0.25 else 0.7);
  if want.y < gh then want.y := gh;
  if snapNow then begin pos.copy(want); look.set(lx, ly, lz); fov := fovT; end
  else begin
    pos.x := Damp(pos.x, want.x, desiredLambda, dt); pos.y := Damp(pos.y, want.y, desiredLambda, dt); pos.z := Damp(pos.z, want.z, desiredLambda, dt);
    look.x := Damp(look.x, lx, lookLambda, dt); look.y := Damp(look.y, ly, lookLambda, dt); look.z := Damp(look.z, lz, lookLambda, dt);
    fov := Damp(fov, Min(fovT, CONFIG.fovMax + (if md <> 0 then 12.0 else 0.0)), 3, dt);
  end;
  // Shake: Trauma2 (Landungen/Stuerze) + Hochgeschwindigkeits-Vibration
  trauma := Max(0.0, trauma - dt * 1.4);
  sp := Max(0.0, (kmh - CONFIG.shakeSpeedFrom) / 70) * (if tg.grounded then 1.0 else 0.3); tr := trauma * trauma; tt := t;
  amp := tr * 0.35 + sp * 0.025;
  ox := (Sin(tt * 37.1) + Sin(tt * 23.7 + 1.3)) * 0.5 * amp; oy := (Sin(tt * 41.3 + 2.1) + Sin(tt * 19.1)) * 0.5 * amp;
  cam.position.copy(pos); cam.position.x += ox * side.x; cam.position.z += ox * side.z; cam.position.y += oy;
  cam.lookAt(look);
  roll := Damp(roll, if md = 0 then ClampF(-tg.latAcc * 0.006, -0.08, 0.08) else ClampF(-tg.latAcc * 0.012, -0.2, 0.2), 4, dt);
  cam.rotateZ(roll + tr * Sin(tt * 29) * 0.04);
  if Abs(cam.fov - fov) > 0.01 then begin cam.fov := fov; cam.updateProjectionMatrix; end;
end;

end.
