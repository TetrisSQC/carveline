unit carve.rider;

// Rider — prozedural modellierter Snowboarder aus gegliederten Meshes (Chibi-Proportionen)

interface

uses
  qtx.sysutils, carve.web, carve.util, carve.three, carve.skeleton;

type
  // Farbpalette der Chibi-Figur (fest; Jacke/Hose/Helm kommen pro Fahrer)
  FIG = class
  public
    const glove = $15171c; const goggle = $2a1a0a; const strap = $19c3ff; const skin = $d9a383; const hair = $4a2c1a;
    const boot = $2a2d33; const deck = $1b2638; const tip = $ff4d2e;
  end;

  TRiderColors = class
  public
    jacket, pants, helmet, deck: Integer;
    constructor Create(j, p, h, d: Integer);
  end;

  TRiderTemps = class
  public
    a, b, x, y, z, p, ax, s: JVector3;
    m: JMatrix4;
    q, qe: JQuaternion;
  end;

  TRider = class
  private
    procedure SetSeg(mesh: JObject3D; a, b: JVector3);
    procedure SetBasis(mesh: JObject3D; pos, xa, ya: JVector3; sx, sy, sz: Float);
    procedure SetAt(mesh: JObject3D; p: JVector3);
  public
    matJacket, matPants, matHelmet: JMeshPhysicalMaterial;
    deckU: Variant;
    root, head, board: JGroup;
    thighL, thighR, shinL, shinR, uarmL, uarmR, farmL, farmR, neck: JMesh;
    kneeL, kneeR, elbL, elbR, shoL, shoR, hipL, hipR: JMesh;
    handL, handR, torso, pelvis: JMesh;
    t: TRiderTemps;
    constructor Create(scene: JScene; envMap: Variant = nil);
    procedure SetColors(c: TRiderColors);
    procedure Pose(w: TJoints; boardPos: JVector3; boardQuat: JQuaternion);
  end;

function MakeBoardGeometry: JBufferGeometry;
function SegGeo(r0, r1: Float; seg: Integer = 10): JBufferGeometry;

implementation

constructor TRiderColors.Create(j, p, h, d: Integer);
begin
  jacket := j; pants := p; helmet := h; deck := d;
end;

function BoardHalfWidth(x: Float): Float;
const L = 0.815; W = 0.15;
var ax, tt: Float;
begin
  ax := Abs(x);
  if ax < 0.62 then exit(W - 0.014 * (1 - Power(x / 0.62, 2)));
  tt := (ax - 0.62) / (L - 0.62);
  Result := W * Sqrt(Max(0.0, 1 - tt * tt * tt));
end;

function MakeBoardGeometry: JBufferGeometry;
const L = 0.815; pts = 40;
var i: Integer; x, ax: Float;
begin
  var shape := new JShape;
  for i := 0 to pts do begin
    x := -L + 2 * L * i / pts;
    if i = 0 then shape.moveTo(x, -BoardHalfWidth(x)) else shape.lineTo(x, -BoardHalfWidth(x));
  end;
  for i := pts downto 0 do begin x := -L + 2 * L * i / pts; shape.lineTo(x, BoardHalfWidth(x)); end;
  var g: JBufferGeometry := new JExtrudeGeometry(shape, class depth := 0.02; bevelEnabled := True; bevelThickness := 0.004; bevelSize := 0.005; bevelSegments := 1; curveSegments := 4; end);
  g.rotateX(-PI_ / 2); g.deleteAttribute('uv');       // Shape-Y -> -Z, Extrusion -> +Y
  var p := g.attributes.position;
  for i := 0 to p.count - 1 do begin
    x := p.getX(i); ax := Abs(x);
    if ax > 0.6 then p.setY(i, p.getY(i) + Power(ax - 0.6, 2) * 1.6);
  end;
  g.computeVertexNormals;
  Result := g;
end;

function SegGeo(r0, r1: Float; seg: Integer = 10): JBufferGeometry;
begin
  Result := new JCylinderGeometry(r1, r0, 1, seg, 1); Result.translate(0, 0.5, 0);
end;

function Std(hex: Integer; r: Float = 0.7): JMeshStandardMaterial;
begin
  Result := new JMeshStandardMaterial(class color := hex; roughness := r; end);
end;

constructor TRider.Create(scene: JScene; envMap: Variant = nil);
begin
  // Chibi-Snowboarder aus Primitiven (dicke Glieder, grosser Kopf mit Helm, Band und Brille)
  var jacket := new JMeshPhysicalMaterial(class color := $e0442c; roughness := 0.55; sheen := 0.6; sheenRoughness := 0.5; sheenColor := new JColor($ff9a80); end);
  var pants := new JMeshPhysicalMaterial(class color := $223452; roughness := 0.8; sheen := 0.4; sheenColor := new JColor($6688bb); end);
  var helmet := new JMeshPhysicalMaterial(class color := $f1f3f6; roughness := 0.25; clearcoat := 1; clearcoatRoughness := 0.08; end);
  var goggle := new JMeshPhysicalMaterial(class color := FIG.goggle; metalness := 0.9; roughness := 0.06; iridescence := 1; iridescenceIOR := 1.6; iridescenceThicknessRange := [200, 600]; clearcoat := 1; end);
  var glove := Std(FIG.glove, 0.6); var strap := Std(FIG.strap, 0.6); var boot := Std(FIG.boot); var skin := Std(FIG.skin); var hair := Std(FIG.hair, 0.9); var bind := Std($0d0f13, 0.4);
  var deckMat := new JMeshPhysicalMaterial(class roughness := 0.3; clearcoat := 0.8; end);
  var dU := Uniform(new JColor(FIG.deck));
  matJacket := jacket; matPants := pants; matHelmet := helmet; deckU := dU;
  deckMat.onBeforeCompile := procedure(sh: Variant)   // Farbe nach Board-Position: orange Spitzen, harte Kante
  begin
    sh.uniforms.uDeck := dU; sh.uniforms.uTip := Uniform(new JColor(FIG.tip));
    sh.vertexShader := JsReplace(JsReplace(sh.vertexShader, '#include <common>', '#include <common>' + #10 + 'varying float vBx;'),
      '#include <begin_vertex>', '#include <begin_vertex>' + #10 + 'vBx = position.x;');
    sh.fragmentShader := JsReplace(JsReplace(sh.fragmentShader, '#include <common>', '#include <common>' + #10 + 'varying float vBx; uniform vec3 uDeck; uniform vec3 uTip;'),
      '#include <color_fragment>', '#include <color_fragment>' + #10 + '  diffuseColor.rgb = abs(vBx) > 0.6 ? uTip : uDeck;');
  end;
  root := new JGroup; scene.add(root);
  var rt := root;
  var mk := function(geo: JBufferGeometry; mat: JMaterial): JMesh
  begin
    Result := new JMesh(geo, mat); Result.castShadow := True; Result.matrixAutoUpdate := False; rt.add(Result);
  end;
  var sub := function(parent: JObject3D; geo: JBufferGeometry; mat: JMaterial; x: Float = 0; y: Float = 0; z: Float = 0): JMesh
  begin
    Result := new JMesh(geo, mat); Result.position.set(x, y, z); Result.castShadow := True; parent.add(Result);
  end;
  // Dicke Gliedmassen (Puffer-Jacke, Schneehose)
  thighL := mk(SegGeo(0.13, 0.12), pants); thighR := mk(SegGeo(0.13, 0.12), pants);
  shinL := mk(SegGeo(0.12, 0.115), pants); shinR := mk(SegGeo(0.12, 0.115), pants);
  uarmL := mk(SegGeo(0.105, 0.095), jacket); uarmR := mk(SegGeo(0.105, 0.095), jacket);
  farmL := mk(SegGeo(0.095, 0.088), jacket); farmR := mk(SegGeo(0.095, 0.088), jacket);
  neck := mk(SegGeo(0.13, 0.12), jacket);  // Kragen
  kneeL := mk(new JSphereGeometry(0.12, 14, 10), pants); kneeR := mk(new JSphereGeometry(0.12, 14, 10), pants);
  elbL := mk(new JSphereGeometry(0.095, 14, 10), jacket); elbR := mk(new JSphereGeometry(0.095, 14, 10), jacket);
  shoL := mk(new JSphereGeometry(0.11, 14, 10), jacket); shoR := mk(new JSphereGeometry(0.11, 14, 10), jacket);
  hipL := mk(new JSphereGeometry(0.14, 14, 10), pants); hipR := mk(new JSphereGeometry(0.14, 14, 10), pants);
  var mitt := new JSphereGeometry(0.088, 14, 10).scale(1, 1.15, 0.9);
  handL := mk(mitt, glove); handR := mk(mitt, glove);
  // Rumpf: Puffer-Jacke mit Steppringen, Becken in Hosenfarbe
  torso := mk(new JCapsuleGeometry(0.23, 0.14, 6, 18), jacket);
  for var yy in [-0.08, 0.06] do sub(torso, new JTorusGeometry(0.226, 0.016, 6, 24).rotateX(PI_ / 2), jacket, 0, yy, 0);
  pelvis := mk(new JCapsuleGeometry(0.17, 0.1, 4, 14), pants);
  // Kopf-Gruppe (Y = Hals->Kopf, Z = Blickrichtung): grosser Chibi-Kopf, Helm, Band, Brille, Haare, Nase, Ohren
  head := new JGroup; head.matrixAutoUpdate := False; root.add(head);
  sub(head, new JSphereGeometry(0.275, 24, 18), skin);
  sub(head, new JSphereGeometry(0.29, 28, 16, 0, TAU, 0, PI_ * 0.47), helmet, 0, 0.015, 0);
  sub(head, new JSphereGeometry(0.279, 20, 10, PI_, PI_, PI_ * 0.5, PI_ * 0.3), hair);
  sub(head, new JCylinderGeometry(0.293, 0.293, 0.075, 28, 1, True, 1.1, TAU - 2.2), strap, 0, 0.03, 0);
  sub(head, new JCylinderGeometry(0.305, 0.3, 0.17, 24, 1, True, -1.15, 2.3), goggle, 0, 0.005, 0);
  sub(head, new JSphereGeometry(0.05, 10, 8), skin, 0, -0.1, 0.27);
  for var sx in [-1.0, 1.0] do sub(head, new JSphereGeometry(0.06, 10, 8).scale(0.6, 1, 1), skin, sx * 0.272, -0.04, -0.01);
  // Board-Gruppe: Deck (marineblau, orange Spitzen), Bindungen, runde Boots im Stand der Figur
  board := new JGroup; board.matrixAutoUpdate := False; root.add(board);
  var deck := new JMesh(MakeBoardGeometry, deckMat); deck.castShadow := True; board.add(deck);
  for var bi := 0 to 1 do begin
    var bx := if bi = 0 then RIG.stance else -RIG.stance; var ang := if bi = 0 then 0.26 else -0.1;
    var b := new JGroup; b.position.set(bx, 0.026, 0); b.rotation.y := ang; board.add(b);
    sub(b, new JBoxGeometry(0.16, 0.02, 0.3), bind);
    var hb := sub(b, new JBoxGeometry(0.15, 0.2, 0.025), bind, 0, 0.13, -0.16); hb.rotation.x := -0.25;
    sub(b, new JCapsuleGeometry(0.09, 0.2, 4, 12).rotateX(PI_ / 2).scale(1.05, 1.05, 1), boot, 0, 0.1, 0.01);
  end;
  t := TRiderTemps.Create;
  t.a := new JVector3; t.b := new JVector3; t.x := new JVector3; t.y := new JVector3; t.z := new JVector3; t.p := new JVector3;
  t.m := new JMatrix4; t.q := new JQuaternion; t.qe := new JQuaternion; t.ax := new JVector3(1, 0, 0); t.s := new JVector3(1, 1, 1);
end;

procedure TRider.SetColors(c: TRiderColors);
begin
  var w := new JColor($ffffff);
  matJacket.color.setHex(c.jacket); matJacket.sheenColor.setHex(c.jacket).lerp(w, 0.45);
  matPants.color.setHex(c.pants); matPants.sheenColor.setHex(c.pants).lerp(w, 0.35);
  matHelmet.color.setHex(c.helmet); JColor(deckU.value).setHex(c.deck);
end;

// Zylinder-Segment von a nach b
procedure TRider.SetSeg(mesh: JObject3D; a, b: JVector3);
var len: Float;
begin
  var y := t.y.subVectors(b, a); len := y.length;
  if len = 0 then len := 1e-4;
  y.divideScalar(len);
  t.x.set(1, 0, 0);
  if Abs(y.x) > 0.9 then t.x.set(0, 0, 1);
  t.z.crossVectors(t.x, y).normalize; t.x.crossVectors(y, t.z);
  mesh.matrix.makeBasis(t.x, t.y.multiplyScalar(len), t.z).setPosition(a); mesh.matrixWorldNeedsUpdate := True;
end;

procedure TRider.SetBasis(mesh: JObject3D; pos, xa, ya: JVector3; sx, sy, sz: Float);
begin
  t.y.copy(ya).normalize; t.x.copy(xa).addScaledVector(t.y, -xa.dot(t.y)).normalize; t.z.crossVectors(t.x, t.y);
  mesh.matrix.makeBasis(t.x.multiplyScalar(sx), t.y.multiplyScalar(sy), t.z.multiplyScalar(sz)).setPosition(pos); mesh.matrixWorldNeedsUpdate := True;
end;

procedure TRider.SetAt(mesh: JObject3D; p: JVector3);
begin
  mesh.matrix.makeTranslation(p.x, p.y, p.z); mesh.matrixWorldNeedsUpdate := True;
end;

procedure TRider.Pose(w: TJoints; boardPos: JVector3; boardQuat: JQuaternion);
begin
  SetSeg(thighL, w[J.HIPL], w[J.KNL]); SetSeg(thighR, w[J.HIPR], w[J.KNR]);
  SetSeg(shinL, w[J.KNL], w[J.ANL]); SetSeg(shinR, w[J.KNR], w[J.ANR]);
  SetSeg(uarmL, w[J.SHL_], w[J.ELL]); SetSeg(uarmR, w[J.SHR_], w[J.ELR]);
  SetSeg(farmL, w[J.ELL], w[J.HAL]); SetSeg(farmR, w[J.ELR], w[J.HAR]);
  SetSeg(neck, w[J.CHEST], w[J.HEAD]);
  SetAt(kneeL, w[J.KNL]); SetAt(kneeR, w[J.KNR]); SetAt(elbL, w[J.ELL]); SetAt(elbR, w[J.ELR]);
  SetAt(shoL, w[J.SHL_]); SetAt(shoR, w[J.SHR_]); SetAt(hipL, w[J.HIPL]); SetAt(hipR, w[J.HIPR]);
  SetAt(handL, w[J.HAL]); SetAt(handR, w[J.HAR]);
  // Torso: Achse Becken->Brust, Schulterlinie als X
  t.a.subVectors(w[J.SHL_], w[J.SHR_]); t.b.subVectors(w[J.CHEST], w[J.PELVIS]);
  t.p.addVectors(w[J.CHEST], w[J.PELVIS]).multiplyScalar(0.5).addScaledVector(t.b, 0.25);
  SetBasis(torso, t.p, t.a, t.b, 1.15, 1.0, 0.92);
  t.a.subVectors(w[J.HIPL], w[J.HIPR]);
  SetBasis(pelvis, w[J.PELVIS], t.a, t.b, 1.2, 0.9, 1.0);
  // Kopf: Y = Hals->Kopf, Z = Blickrichtung
  t.b.subVectors(w[J.HEAD], w[J.NECK]); t.a.subVectors(w[J.FACE], w[J.HEAD]);
  t.y.copy(t.b).normalize; t.z.copy(t.a).addScaledVector(t.y, -t.a.dot(t.y)).normalize; t.x.crossVectors(t.y, t.z);
  head.matrix.makeBasis(t.x, t.y, t.z).setPosition(w[J.HEAD]); head.matrixWorldNeedsUpdate := True;
  board.matrix.compose(boardPos, boardQuat, t.s); board.matrixWorldNeedsUpdate := True;
end;

end.
