unit carve.game;

// Game — Setup, Zustandsmaschine (title -> countdown -> play -> finished, dazu paused), Loop, UI

interface

uses
  qtx.sysutils, carve.web, carve.util, carve.config, carve.three, carve.course, carve.gfx, carve.props,
  carve.world, carve.scenery, carve.input, carve.music, carve.audio, carve.physics, carve.skeleton, carve.rider,
  carve.challenges, carve.skiers, carve.rivals, carve.fx, carve.hud, carve.post, carve.selftest;

type
  TGameOpts = class
  public
    ghost, rivals: Boolean;
    tod, weather: String;
    col: TRiderColors;
  end;

  TBody = class
  public
    phys: TRiderPhysics;
    rv: TRival;
    a, b: JVector3;
  end;

  TGame = class
  private
    FLoopProc: TFrameCallback;
    // DOM-Elemente der Landehilfe / Marker / Namensschilder (lazy)
    trEl, trTxt, trKey, trNow, trPred, gateMarkEl: JElement;
    tagEls: array of JElement;
    bumpKeys: array of String;
    bumpTimes: array of Float;
    hasMusicI: Boolean;
    hudInfo: THudInfo;
    procedure BuildEnvironment(su: Variant);
    procedure BuildComposer;
    procedure UpdateOutlineTexel;
    procedure BindUI;
    procedure SyncMenu;
    procedure SetCam(m: Integer);
    procedure OpenMenu(fromTitle: Boolean);
    procedure CloseMenu;
    procedure ToTitle;
    procedure StartRun;
    procedure OnPhysEvent(typ: String; a, b: Variant);
    procedure Buzz(ms: Integer);
    procedure Contacts(dt: Float);
    procedure OnGate(ok: Boolean);
    procedure OnStar(st: TStar);
    procedure OnNearMiss(s: TSkier; d: Float);
    procedure StartCrash(reason: String);
    procedure BeginStandUp;
    procedure RenderRider(alpha, dt: Float);
    procedure BoardFromJoints(w: TJoints; pos: JVector3; q: JQuaternion);
    procedure FillCamTarget;
    procedure UpdateSun(center: JVector3);
    procedure Loop(now: Float);
    procedure UpdateTitle(dt, dtReal: Float);
    procedure UpdateRun(dt, dtReal: Float);
    procedure UpdateTrickHint;
    procedure UpdateTags;
    procedure UpdateGateMark;
    procedure EmitRideFx(FIX: Float);
    procedure ShowFinish;
    procedure AutoAdjust(dtReal: Float);
    function GetBest: Variant;
    procedure ShowBest;
    procedure LoadSettings;
    procedure SaveSettings;
    function SettingsExtra: Variant;
    function OptsToJS: Variant;
  public
    renderer: JWebGLRenderer;
    scene: JScene;
    camera: JPerspectiveCamera;
    sunDir: JVector3;
    sky: JSky;
    hemi: JHemisphereLight;
    sun: JDirectionalLight;
    lightRot, lightInv: JMatrix4;
    envRT: JWebGLRenderTarget;
    course: TCourse;
    terrain: TTerrain;
    resort: TResort;
    mountains: TMountains;
    chal: TChallenges;
    snowfall: TSnowfall;
    particles: TParticleSystem;
    trail: TTrail;
    rider: TRider;
    animator: TRiderAnimator;
    ragdoll: TRagdoll;
    phys: TRiderPhysics;
    skiers: TSkierAI;
    input: TInput;
    audio: TAudioEngine;
    hud: THud;
    score: TScore;
    camRig: TCameraRig;   // im Original rig (kollidiert in Pascal mit dem Typ RIG)
    wj, fromJ: TJoints;
    rp, rUp, rf, rr, hd: JVector3;
    frameM: JMatrix4; frameQ: JQuaternion;
    boardPos: JVector3; boardQ: JQuaternion; fromBoardPos: JVector3; fromBoardQ, qe: JQuaternion; xAxis: JVector3;
    capA, capB, tmp, tmp2, tmp3, snapC, nrm: JVector3;
    animS: TAnimState;
    pst: TPoseState;
    opts: TGameOpts;
    ghost: TGhost;
    ghostRec: array of Float;
    hasGhostRec: Boolean;
    ghostNext: Float;
    rivals: array of TRival;
    rivalText: String;
    bodies: array of TBody;
    camT: TCamTarget;
    pin: TControls;
    audioS: TAudioState;
    composer: JEffectComposer;
    outlinePass, gradePass: JShaderPass;
    preset: TPreset;
    presetName: String;
    autoPreset: Boolean;
    state, riderMode: String;
    paused, finished, menuFromTitle: Boolean;
    acc, timeScale, slowT, runTime, penalty, finishTime, finishT, invuln, flyT, flyZ, sprayAcc, clock, last,
      fpsTime, ragT, standT, cdT, musicI: Float;
    fpsFrames, lowCount, cdLast, rank, vw, vh: Integer;
    constructor Create;
    procedure ApplyAtmosphere;
    procedure ApplyPreset(name: String; initial: Boolean = False);
    procedure OnResize;
  end;

// Einstieg: Fehler-Overlay, Spiel starten (window.game), Service Worker + Installieren-Knopf
procedure StartCarveLine;

implementation

// Datenaustausch mit three.js-Objekten, die in JS dynamisch sind
function AsVar(o: Variant): Variant;
begin
  Result := o;
end;

function FmtInt(v: Float): String;
begin
  asm @Result = String(@v); end;
end;

function GermanNum(v: Float): String;
begin
  asm @Result = Math.floor(@v).toLocaleString('de-DE'); end;
end;

{ TGame }

constructor TGame.Create;
begin
  var cv := El('c');
  renderer := new JWebGLRenderer(class canvas := cv; antialias := False; powerPreference := 'high-performance'; stencil := False; end);
  var r := renderer;
  r.toneMapping := ACESFilmicToneMapping; r.toneMappingExposure := 0.95; r.outputColorSpace := SRGBColorSpace;
  r.shadowMap.enabled := True; r.shadowMap.&type := PCFShadowMap;
  scene := new JScene;
  scene.fog := new JFogExp2($c2d5ee, 0.0011);
  camera := new JPerspectiveCamera(CONFIG.fovBase, window.innerWidth / window.innerHeight, 0.1, 6000);
  // Sonne & Himmel
  sunDir := new JVector3(-0.82, 0.5, 0.12).normalize;    // Seitenlicht von rechts (~30 Grad): Relief, lange Schatten
  sky := new JSky; sky.scale.setScalar(4500); scene.add(sky); ClampSky(sky);
  var su := JShaderMaterial(sky.material).uniforms;
  su.turbidity.value := 2.0; su.rayleigh.value := 1.2; su.mieCoefficient.value := 0.0018; su.mieDirectionalG.value := 0.9; JVector3(su.sunPosition.value).copy(sunDir);
  if Truthy(su.cloudCoverage) then begin su.cloudCoverage.value := 0.3; su.cloudDensity.value := 0.35; end;
  BuildEnvironment(su);
  hemi := new JHemisphereLight($a3c2f5, $eef2f8, 0.62); scene.add(hemi);
  sun := new JDirectionalLight($ffe4c4, 3.3);
  sun.castShadow := True; var sc := sun.shadow.camera; sc.left := -34; sc.bottom := -34; sc.right := 34; sc.top := 34; sc.near := 1; sc.far := 260;
  sun.shadow.bias := -0.0004; sun.shadow.normalBias := 0.04; sun.shadow.radius := 2.5; scene.add(sun); scene.add(sun.target);
  lightRot := new JMatrix4().lookAt(sunDir, new JVector3, new JVector3(0, 1, 0)); lightInv := lightRot.clone.invert;
  // Welt
  course := TCourse.Create;
  terrain := TTerrain.Create(scene, course);
  resort := TResort.Create(scene, course); terrain.resort := resort;
  mountains := TMountains.Create(scene);
  chal := TChallenges.Create(scene, course);
  MakeGate(scene, course, 1.5, 'START', '#1d2a44'); MakeGate(scene, course, course.zf, 'ZIEL ' + UC($B7) + ' FINISH', '#e0442c');
  snowfall := TSnowfall.Create(scene);
  particles := TParticleSystem.Create(scene, PRESET_HIGH.particles);
  trail := TTrail.Create(scene);
  // Rider
  rider := TRider.Create(scene); animator := TRiderAnimator.Create; ragdoll := TRagdoll.Create(course);
  phys := TRiderPhysics.Create(course, terrain); phys.onEvent := OnPhysEvent;
  skiers := TSkierAI.Create(scene, course); skiers.onNearMiss := OnNearMiss;
  input := TInput.Create; audio := TAudioEngine.Create; hud := THud.Create; score := TScore.Create(hud, audio);
  camRig := TCameraRig.Create(camera, course);
  // Zustaende & Puffer (keine Allokationen im Loop)
  wj := NewJoints; fromJ := NewJoints;
  rp := new JVector3; rUp := new JVector3; rf := new JVector3; rr := new JVector3; hd := new JVector3; frameM := new JMatrix4; frameQ := new JQuaternion;
  boardPos := new JVector3; boardQ := new JQuaternion; fromBoardPos := new JVector3; fromBoardQ := new JQuaternion; qe := new JQuaternion; xAxis := new JVector3(1, 0, 0);
  capA := new JVector3; capB := new JVector3; tmp := new JVector3; tmp2 := new JVector3; tmp3 := new JVector3; snapC := new JVector3;
  animS := TAnimState.Create; animS.grounded := True; animS.idle := True;
  pst := TPoseState.Create; pst.pos := rp; pst.up := rUp; pst.vel := phys.vel; pst.anim := animS;
  opts := TGameOpts.Create; opts.ghost := True; opts.rivals := True; opts.tod := 'noon'; opts.weather := 'clear';
  opts.col := TRiderColors.Create($e0442c, $223452, $f1f3f6, $1b2638);
  ghost := TGhost.Create(scene); hasGhostRec := False;
  for var d in RIVAL_DEFS do rivals.Add(TRival.Create(scene, course, terrain, d));
  rivalText := '';
  for var rv in rivals do rv.onDown := procedure(pos, vel: JVector3) begin particles.Burst(pos, vel, 60, 4, 3, 1.4, 0.5); end;
  for var i := 0 to 2 do begin var bd := TBody.Create; bd.a := new JVector3; bd.b := new JVector3; bodies.Add(bd); end;
  nrm := new JVector3;
  camT := TCamTarget.Create; camT.grounded := True;
  pin := TControls.Create; audioS := TAudioState.Create; audioS.grounded := True;
  hudInfo := THudInfo.Create;
  state := 'title'; paused := False; riderMode := 'ride'; acc := 0; timeScale := 1; slowT := 0;
  runTime := 0; penalty := 0; finished := False; finishTime := 0; finishT := 0; invuln := 0;
  flyT := 0; flyZ := 0; sprayAcc := 0; clock := 0; last := performance.now;
  presetName := 'high'; autoPreset := True; fpsFrames := 0; fpsTime := 0; lowCount := 0;
  LoadSettings;
  phys.Reset(4); phys.frozen := True;
  ApplyPreset(presetName, True);
  ApplyAtmosphere; rider.SetColors(opts.col);
  BindUI; OnResize; window.addEventListener('resize', procedure(e: JEvent) begin OnResize; end);
  window.addEventListener('orientationchange', procedure(e: JEvent) begin OnResize; end);
  var vv: Variant;
  asm @vv = window.visualViewport; end;
  if Truthy(vv) then JEventTarget(vv).addEventListener('resize', procedure(e: JEvent) begin OnResize; end);
  skiers.Reset(20);
  ShowBest;
  FLoopProc := Loop;
  requestAnimationFrame(FLoopProc);
end;

procedure TGame.BuildEnvironment(su: Variant);
begin
  // Image-Based-Lighting aus dem Himmel + hellem Schneeboden (fuer PBR-Reflexionen)
  var pm := new JPMREMGenerator(renderer); var es := new JScene; var sky2 := new JSky; sky2.scale.setScalar(900); ClampSky(sky2);
  var u2 := JShaderMaterial(sky2.material).uniforms;
  asm for (var k in @su) if ((@u2)[k]) (@u2)[k].value = (@su)[k].value; end;
  es.add(sky2);
  var ground := new JMesh(new JCircleGeometry(800, 16), new JMeshBasicMaterial(class color := $cfd9e6; end)); ground.rotation.x := -PI_ / 2; ground.position.y := -20; es.add(ground);
  var rt := pm.fromScene(es, 0.04, 0.1, 2000);
  if envRT <> nil then envRT.dispose;
  envRT := rt; scene.environment := rt.texture; AsVar(scene).environmentIntensity := 0.5; pm.dispose;
end;

// Tageszeit (Mittag/Abend) und Wetter (klar/Schneefall/Nebel): Sonne, Himmel, Umgebungslicht, Nebel, Berge, Schneefall
procedure TGame.ApplyAtmosphere;
var ev: Boolean; w: String;
begin
  ev := opts.tod = 'evening'; w := opts.weather; var su := JShaderMaterial(sky.material).uniforms; var fog := JFogExp2(scene.fog);
  if ev then sunDir.set(-0.88, 0.17, 0.44).normalize else sunDir.set(-0.82, 0.5, 0.12).normalize;
  JVector3(su.sunPosition.value).copy(sunDir);
  su.turbidity.value := if w = 'fog' then 12.0 else if w = 'snow' then 7.0 else if ev then 4.5 else 2.0;
  su.rayleigh.value := if w = 'fog' then 0.5 else if w = 'snow' then 0.9 else if ev then 2.6 else 1.2;
  su.mieCoefficient.value := if ev then 0.004 else 0.0018; su.mieDirectionalG.value := if ev then 0.86 else 0.9;
  if Truthy(su.cloudCoverage) then begin
    su.cloudCoverage.value := if w = 'clear' then 0.3 else 0.9; su.cloudDensity.value := if w = 'clear' then 0.35 else 0.8;
  end;
  sun.color.setHex(if ev then $ffa25a else $ffe4c4); sun.intensity := (if ev then 2.8 else 3.3) * (if w = 'fog' then 0.35 else if w = 'snow' then 0.6 else 1.0);
  hemi.color.setHex(if ev then $8d8fd6 else $a3c2f5); hemi.groundColor.setHex(if ev then $f3d2c2 else $eef2f8); hemi.intensity := if w = 'clear' then 0.62 else 0.9;
  if w = 'clear' then begin fog.color.setHex(if ev then $e3c3b6 else $c2d5ee); fog.density := 0.0011; end
  else if w = 'snow' then begin fog.color.setHex(if ev then $cdbcbf else $d3dbe6); fog.density := 0.0034; end
  else begin fog.color.setHex(if ev then $dacbc7 else $dfe5ec); fog.density := 0.0075; end;
  mountains.SetFade(if w = 'clear' then 0.0 else if w = 'snow' then 0.6 else 1.0, fog.color);
  snowfall.SetStorm(w = 'snow'); snowfall.points.visible := preset.snowfall or (w = 'snow');
  lightRot.lookAt(sunDir, new JVector3, new JVector3(0, 1, 0)); lightInv.copy(lightRot).invert;
  BuildEnvironment(su);
end;

procedure TGame.LoadSettings;
begin
  try
    var raw := localStorage.getItem('carveline.settings');
    var s := JSON.parse(if Truthy(raw) then String(raw) else '{}');
    if Truthy(s.preset) and (PresetByName(String(s.preset)) <> nil) then presetName := s.preset;
    if JsTypeOf(s.auto) = 'boolean' then autoPreset := s.auto;
    if JsTypeOf(s.vol) = 'number' then begin audio.vol := s.vol; JInputElement(El('optVol')).value := String(s.vol); end;
    if JsTypeOf(s.mus) = 'number' then begin audio.musicVol := s.mus; JInputElement(El('optMus')).value := String(s.mus); end;
    if JsTypeOf(s.cam) = 'number' then camRig.mode := Integer(s.cam) mod 3;
    if Truthy(s.opts) then begin
      var o := s.opts;
      if JsTypeOf(o.ghost) = 'boolean' then opts.ghost := o.ghost;
      if JsTypeOf(o.rivals) = 'boolean' then opts.rivals := o.rivals;
      if JsTypeOf(o.tod) = 'string' then opts.tod := o.tod;
      if JsTypeOf(o.weather) = 'string' then opts.weather := o.weather;
      if Truthy(o.col) then begin
        if JsTypeOf(o.col.jacket) = 'number' then opts.col.jacket := o.col.jacket;
        if JsTypeOf(o.col.pants) = 'number' then opts.col.pants := o.col.pants;
        if JsTypeOf(o.col.helmet) = 'number' then opts.col.helmet := o.col.helmet;
        if JsTypeOf(o.col.deck) = 'number' then opts.col.deck := o.col.deck;
      end;
    end;
  except
    // Storage nicht verfuegbar
  end;
end;

// gleiches JSON-Format wie das JS-Original (gleicher localStorage-Schluessel)
function TGame.OptsToJS: Variant;
begin
  Result := new JObject;
  Result.ghost := opts.ghost; Result.rivals := opts.rivals; Result.tod := opts.tod; Result.weather := opts.weather;
  var c: Variant := new JObject;
  c.jacket := opts.col.jacket; c.pants := opts.col.pants; c.helmet := opts.col.helmet; c.deck := opts.col.deck;
  Result.col := c;
end;

// weitere Einstellungen (von spaeteren Features befuellt)
function TGame.SettingsExtra: Variant;
begin
  Result := new JObject; Result.opts := OptsToJS;
end;

procedure TGame.SaveSettings;
begin
  try
    var s := SettingsExtra;
    s.preset := presetName; s.auto := autoPreset; s.vol := audio.vol; s.mus := audio.musicVol; s.cam := camRig.mode; s.track := TRACK_ID;
    localStorage.setItem('carveline.settings', JSON.stringify(s));
  except
  end;
end;

function TGame.GetBest: Variant;
begin
  try
    var raw := localStorage.getItem(StoreKey('best'));
    Result := JSON.parse(if Truthy(raw) then String(raw) else 'null');
  except
    Result := null;
  end;
end;

procedure TGame.ShowBest;
begin
  var b := GetBest;
  El('tBest').textContent := TRACK.name + (if Truthy(b) then '  ' + UC($B7) + '  Bestzeit  ' + FmtTime(b.time) + '   ' + UC($B7) + '   Score ' + FmtInt(b.score) else '  ' + UC($B7) + '  noch keine Bestzeit');
end;

// ---------- Grafik-Presets ----------
procedure TGame.ApplyPreset(name: String; initial: Boolean = False);
var dpr: Float;
begin
  var pr := PresetByName(name); presetName := name; preset := pr;
  dpr := window.devicePixelRatio; if dpr = 0 then dpr := 1;
  renderer.setPixelRatio(Min(dpr, pr.pr));
  sun.shadow.mapSize.set(pr.shadow, pr.shadow);
  if Truthy(sun.shadow.map) then begin sun.shadow.map.dispose(); sun.shadow.map := null; end;
  terrain.treeCount := pr.trees; terrain.ahead := pr.ahead;
  snowfall.points.visible := pr.snowfall or (opts.weather = 'snow'); particles.SetLimit(pr.particles);
  BuildComposer;
  terrain.RebuildAll(if state = 'title' then (if flyZ <> 0 then flyZ else 30.0) else phys.pos.z, camera.position);
  for var b in document.querySelectorAll('#optPreset button') do b.classList.toggle('sel', String(b.dataset.v) = name);
  fpsFrames := 0; fpsTime := -1; lowCount := 0;
  if not initial then SaveSettings;
end;

procedure TGame.BuildComposer;
var w, h: Integer;
begin
  if composer <> nil then begin
    var old := composer;
    asm for (var p of (@old).passes) if (p.dispose) p.dispose(); end;
    old.dispose;
  end;
  composer := new JEffectComposer(renderer); var c := composer; w := window.innerWidth; h := window.innerHeight;
  for var rt in [c.renderTarget1, c.renderTarget2] do begin rt.depthTexture := new JDepthTexture(w, h); rt.depthTexture.&type := UnsignedIntType; end;
  c.setPixelRatio(renderer.getPixelRatio); c.setSize(w, h);
  c.addPass(new JRenderPass(scene, camera));
  outlinePass := new JShaderPass(OutlineShader); var ol := outlinePass;
  // Umriss-Pass liest die Tiefe des Lese-Puffers: render() umhaengen (JS-Methode wird gebunden weiterverwendet)
  asm
    var olRender = (@ol).render.bind(@ol);
    (@ol).render = function (ren, wb, rb, dt, mask) { (@ol).uniforms.tDepth.value = rb.depthTexture; olRender(ren, wb, rb, dt, mask); };
  end;
  ol.uniforms.cameraNear.value := camera.near; ol.uniforms.cameraFar.value := camera.far; UpdateOutlineTexel;
  c.addPass(ol);
  if preset.bloom then c.addPass(new JUnrealBloomPass(new JVector2(w, h), 0.3, 0.4, 3.2));
  gradePass := new JShaderPass(GradeShader); c.addPass(gradePass);
  if preset.smaa then c.addPass(new JSMAAPass);
  c.addPass(new JOutputPass);
end;

procedure TGame.OnResize;
var w, h: Integer;
begin
  w := window.innerWidth; h := window.innerHeight; vw := w; vh := h; camera.aspect := w / h; camera.updateProjectionMatrix;
  renderer.setSize(w, h, False); composer.setSize(w, h); UpdateOutlineTexel;
end;

// Tuschelinien nach Bildschirmgroesse: auf Handys (kurze Seite ~400 px) duenner und blasser, ab ~600 px wie gehabt
procedure TGame.UpdateOutlineTexel;
var pr, s: Float;
begin
  if outlinePass = nil then exit;
  pr := renderer.getPixelRatio; var u := outlinePass.uniforms;
  s := Smoothstep(380, 600, Min(window.innerWidth, window.innerHeight));
  JVector2(u.uTexel.value).set(1 / (window.innerWidth * pr), 1 / (window.innerHeight * pr));
  u.uWidth.value := Lerp(1.15, 1.8, s); u.uAlpha.value := Lerp(0.55, 0.9, s);
end;

// ---------- UI ----------
type TButtonHandler = procedure(b: JElement);

// Eigene Funktion pro Knopf: ein Pascal-"var" im Schleifenrumpf wird zu einem funktionsweiten JS-"var",
// Closures aus einer Schleife wuerden sich sonst alle dasselbe Element teilen.
procedure BindClick(b: JElement; h: TButtonHandler);
begin
  b.onclick := procedure(e: JEvent) begin h(b); end;
end;

procedure OnClickEach(list: array of JElement; h: TButtonHandler);
begin
  for var b in list do BindClick(b, h);
end;

procedure TGame.BindUI;
begin
  var click := procedure begin audio.Click; end;
  El('bStart').onclick := procedure(e: JEvent)
  begin
    if document.body.classList.contains('touch') then
      asm try { var r = document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); r && r.then(function () { return screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape'); }).catch(function () {}); } catch (e) {} end;
    audio.Init; audio.SetVolumes(audio.vol, audio.musicVol); click(); StartRun;
  end;
  El('bTitleOpts').onclick := procedure(e: JEvent) begin audio.Init; click(); OpenMenu(True); end;
  El('bResume').onclick := procedure(e: JEvent) begin click(); CloseMenu; end;
  El('bRestart').onclick := procedure(e: JEvent) begin click(); CloseMenu; StartRun; end;
  El('bMenu').onclick := procedure(e: JEvent) begin click(); CloseMenu; ToTitle; end;
  El('bAgain').onclick := procedure(e: JEvent) begin click(); El('finish').classList.remove('on'); StartRun; end;
  El('bFinMenu').onclick := procedure(e: JEvent) begin click(); El('finish').classList.remove('on'); ToTitle; end;
  OnClickEach(document.querySelectorAll('#optPreset button'), procedure(b: JElement) begin click(); ApplyPreset(String(b.dataset.v)); end);
  OnClickEach(document.querySelectorAll('#optAuto button'), procedure(b: JElement) begin click(); autoPreset := String(b.dataset.v) = '1'; SyncMenu; SaveSettings; end);
  OnClickEach(document.querySelectorAll('#optCam button'), procedure(b: JElement) begin click(); SetCam(StrToInt(String(b.dataset.v))); end);
  // Schalter: data-v '1'/'0' = an/aus, sonst Wert
  var segOpt := procedure(id, key: String; apply: procedure)
  begin
    OnClickEach(document.querySelectorAll('#' + id + ' button'), procedure(b: JElement)
    begin
      click(); var v := String(b.dataset.v);
      if key = 'tod' then opts.tod := v
      else if key = 'weather' then opts.weather := v
      else if key = 'ghost' then opts.ghost := v = '1'
      else if key = 'rivals' then opts.rivals := v = '1';
      SyncMenu; SaveSettings;
      if Assigned(apply) then apply();
    end);
  end;
  segOpt('optTod', 'tod', ApplyAtmosphere); segOpt('optWeather', 'weather', ApplyAtmosphere);
  segOpt('optGhost', 'ghost', nil); segOpt('optRivals', 'rivals', nil);
  var palJacket: array of Integer := [$e0442c, $ff8c1a, $ffd23f, $2ecc71, $1f6bff, $7b61ff, $111827];
  var palPants: array of Integer := [$223452, $1b1f2a, $3a3f4b, $4a2c2a, $dcdcdc, $2d4a2d];
  var palHelmet: array of Integer := [$f1f3f6, $111111, $ff3b30, $1e90ff, $ffd60a, $2ecc71];
  var palDeck: array of Integer := [$1b2638, $111111, $f1f3f6, $1f6bff, $7b61ff, $2ecc71];
  var swatch := procedure(part, id: String; pal: array of Integer)
  begin
    var html := '';
    for var h in pal do html += '<button data-v="' + IntToStr(h) + '" style="background:#' + HexColor(h) + '"></button>';
    El(id).innerHTML := html;
    OnClickEach(El(id).querySelectorAll('button'), procedure(b: JElement)
    begin
      click(); var v := StrToInt(String(b.dataset.v));
      if part = 'jacket' then opts.col.jacket := v else if part = 'pants' then opts.col.pants := v
      else if part = 'helmet' then opts.col.helmet := v else opts.col.deck := v;
      rider.SetColors(opts.col); SyncMenu; SaveSettings;
    end);
  end;
  swatch('jacket', 'colJacket', palJacket); swatch('pants', 'colPants', palPants); swatch('helmet', 'colHelmet', palHelmet); swatch('deck', 'colDeck', palDeck);
  El('optVol').oninput := procedure(e: JEvent) begin audio.SetVolumes(JInputElement(e.target).valueAsNumber, audio.musicVol); SaveSettings; end;
  El('optMus').oninput := procedure(e: JEvent) begin audio.SetVolumes(audio.vol, JInputElement(e.target).valueAsNumber); SaveSettings; end;
  var th := '';
  for var t in TRACKS do th += '<button data-v="' + t.id + '"' + (if t.id = TRACK_ID then ' class="sel"' else '') + '>' + t.name + '</button>';
  El('optTrack').innerHTML := th;
  OnClickEach(document.querySelectorAll('#optTrack button'), procedure(b: JElement)
  begin
    if String(b.dataset.v) = TRACK_ID then exit;
    click();
    try
      var raw := localStorage.getItem('carveline.settings');
      var st := JSON.parse(if Truthy(raw) then String(raw) else '{}'); st.track := b.dataset.v;
      localStorage.setItem('carveline.settings', JSON.stringify(st));
    except
    end;
    window.location.reload;
  end);
  SyncMenu;
end;

procedure TGame.SyncMenu;
begin
  for var b in document.querySelectorAll('#optAuto button') do b.classList.toggle('sel', (String(b.dataset.v) = '1') = autoPreset);
  for var b in document.querySelectorAll('#optCam button') do b.classList.toggle('sel', StrToInt(String(b.dataset.v)) = camRig.mode);
  var sel := procedure(id, sv: String)
  begin
    for var b in document.querySelectorAll('#' + id + ' button') do b.classList.toggle('sel', String(b.dataset.v) = sv);
  end;
  sel('optTod', opts.tod); sel('optWeather', opts.weather);
  sel('optGhost', if opts.ghost then '1' else '0'); sel('optRivals', if opts.rivals then '1' else '0');
  var selCol := procedure(id: String; v: Integer)
  begin
    for var b in El(id).querySelectorAll('button') do b.classList.toggle('sel', StrToInt(String(b.dataset.v)) = v);
  end;
  selCol('colJacket', opts.col.jacket); selCol('colPants', opts.col.pants); selCol('colHelmet', opts.col.helmet); selCol('colDeck', opts.col.deck);
  El('hCam').textContent := 'CAM ' + UC($B7) + ' ' + CAM_NAMES[camRig.mode];
end;

procedure TGame.SetCam(m: Integer);
begin
  camRig.mode := m; SyncMenu; SaveSettings;
end;

procedure TGame.OpenMenu(fromTitle: Boolean);
begin
  menuFromTitle := fromTitle; paused := not fromTitle;
  El('pTitle').textContent := if fromTitle then 'Optionen' else 'Pause'; El('bResume').textContent := if fromTitle then 'Zur' + UC($FC) + 'ck' else 'Weiter';
  El('bRestart').style.display := if fromTitle then 'none' else ''; El('bMenu').style.display := if fromTitle then 'none' else '';
  SyncMenu; El('pause').classList.add('on');
end;

procedure TGame.CloseMenu;
begin
  El('pause').classList.remove('on'); paused := False; last := performance.now;
end;

procedure TGame.ToTitle;
begin
  state := 'title'; paused := False; El('hud').classList.remove('on'); El('title').classList.add('on'); ghost.rider.root.visible := False;
  for var rv in rivals do rv.Reset(4, False);
  rivalText := ''; audio.MusicRestart;
  phys.Reset(4); phys.frozen := True; riderMode := 'ride'; flyT := 0; skiers.Reset(20); trail.Reset; ShowBest;
end;

procedure TGame.StartRun;
begin
  El('title').classList.remove('on'); El('hud').classList.add('on');
  phys.Reset(4); phys.frozen := True; riderMode := 'ride'; score.Reset; runTime := 0; penalty := 0;
  finished := False; finishT := 0; invuln := 0; timeScale := 1; slowT := 0; acc := 0;
  skiers.Reset(4); trail.Reset; particles.Clear; chal.Reset;
  terrain.Update(4, camera.position, 99);
  state := 'countdown'; cdT := 0; cdLast := -1;
  ghostRec.Clear; hasGhostRec := True; ghostNext := 0; ghost.Load; rank := 0; audio.MusicRestart;
  for var rv in rivals do rv.Reset(4, opts.rivals);
  RenderRider(0, 0.016); FillCamTarget; camRig.Snap(camT);
end;

// ---------- Events ----------
procedure TGame.OnPhysEvent(typ: String; a, b: Variant);
var i: Float;
begin
  var p := phys;
  if typ = 'ollie' then audio.Ollie
  else if typ = 'takeoff' then trail.BreakLine
  else if typ = 'land' then begin
    i := ClampF(Float(b) / 10, 0, 1); audio.Landing(i); camRig.AddTrauma(0.1 + i * 0.5); animator.Kick(Float(b) * 0.35);
    tmp.set(0, 0, 0); particles.Burst(p.pos, p.vel, 10 + Round(i * 40), 2 + i * 3, 1.5 + i * 2, 1.0, 0.35);
    if not Truthy(a) then begin hud.Pop('Wackelig', '', True); score.comboT := Min(score.comboT, 1.0); end;
    if i > 0.45 then Buzz(35);
  end else if typ = 'air' then begin
    if (state = 'play') and not finished then score.OnAir(Float(a), Float(b), p.lastTrick);
  end else if typ = 'bump' then begin camRig.AddTrauma(Float(a)); audio.Landing(0.4); end;
end;

procedure TGame.Buzz(ms: Integer);
begin
  if document.body.classList.contains('touch') then
    asm if (navigator.vibrate) try { navigator.vibrate(@ms); } catch (e) {} end;
end;

// Kontakte: Spieler <-> Gegner und Gegner <-> Gegner abgestuft (Rempler schiebt, harter Auffahrunfall = Sturz des Auffahrenden); Gegner <-> Skifahrer
procedure TGame.Contacts(dt: Float);
var n, i, jx, k: Integer; rad2, d, va, vb, closing, push, avg: Float;
begin
  k := 0;
  while k < bumpKeys.Length do begin
    if bumpTimes[k] - dt <= 0 then begin bumpKeys.Delete(k); bumpTimes.Delete(k); end
    else begin bumpTimes[k] := bumpTimes[k] - dt; Inc(k); end;
  end;
  if state <> 'play' then exit;
  var BB := bodies; var p := phys; n := 0;
  var add := procedure(ph: TRiderPhysics; rv: TRival)
  begin
    var o := BB[n]; Inc(n); o.phys := ph; o.rv := rv;
    o.a.copy(ph.pos).addScaledVector(ph.boardUp, 0.25); o.b.copy(ph.pos).addScaledVector(ph.boardUp, 1.45);
  end;
  if (riderMode = 'ride') and (invuln <= 0) and not finished then add(p, nil);
  for var rv in rivals do
    if rv.active and (rv.downT <= 0) and not rv.finished then begin
      add(rv.phys, rv);
      var o := BB[n - 1];
      if skiers.CheckHit(o.a, o.b, rv.phys.pos.z) <> nil then begin rv.KnockDown; Dec(n); end;
    end;
  rad2 := 2 * CONFIG.bodyRadius; var nr := nrm;
  for i := 0 to n - 1 do for jx := i + 1 to n - 1 do begin
    var A := BB[i]; var Bj := BB[jx]; var pa := A.phys; var pb := Bj.phys;
    if Abs(pa.pos.z - pb.pos.z) > 3 then continue;
    d := SegSegDist(A.a, A.b, Bj.a, Bj.b);
    if d >= rad2 then continue;
    SegClosestDelta(nr); nr.setY(0);
    if nr.lengthSq < 1e-6 then nr.set(pb.pos.x - pa.pos.x, 0, pb.pos.z - pa.pos.z);
    if nr.lengthSq < 1e-6 then nr.set(1, 0, 0);
    nr.normalize;
    va := pa.vel.dot(nr); vb := pb.vel.dot(nr); closing := va - vb;
    var key := (if A.rv <> nil then A.rv.def.name else 'P') + (if Bj.rv <> nil then Bj.rv.def.name else 'P');
    if closing > CONFIG.bumpCrashSpeed then begin           // harter Aufprall: wer schneller auf den anderen zufaehrt, stuerzt
      var ram := if va > -vb then A else Bj;
      if ram.rv <> nil then ram.rv.KnockDown else begin p.Crash('rival'); StartCrash('rival'); end;
      if ram = A then pb.vel.addScaledVector(nr, 1.5) else pa.vel.addScaledVector(nr, -1.5);
      continue;
    end;
    // Rempler: auseinanderschieben, Geschwindigkeit entlang der Kontaktnormale angleichen, leicht abbremsen
    push := (rad2 - d) * 0.5 + 0.02; avg := (va + vb) * 0.5;
    pa.pos.addScaledVector(nr, -push); pb.pos.addScaledVector(nr, push);
    pa.vel.addScaledVector(nr, avg - va - 0.8).multiplyScalar(0.985); pb.vel.addScaledVector(nr, avg - vb + 0.8).multiplyScalar(0.985);
    if ((A.rv = nil) or (Bj.rv = nil)) and (bumpKeys.IndexOf(key) < 0) then begin
      bumpKeys.Add(key); bumpTimes.Add(0.6); camRig.AddTrauma(0.28); audio.Landing(0.35); Buzz(25);
      hud.Pop('Rempler', (if A.rv <> nil then A.rv else Bj.rv).def.name);
    end;
  end;
end;

procedure TGame.OnGate(ok: Boolean);
begin
  if ok then begin var v := score.Add(CONFIG.gatePoints); score.Bump(0.3); hud.Pop('Tor', '+' + IntToStr(v)); audio.Pop(1.2); end
  else begin penalty += CONFIG.gatePenalty; hud.Pop('Tor verpasst', '+' + FmtInt(CONFIG.gatePenalty) + 's', True); end;
end;

procedure TGame.OnStar(st: TStar);
begin
  Buzz(12); var v := score.Add(CONFIG.starPoints); score.Bump(0.2); Inc(score.stars); audio.Pop(1.8); hud.Pop(#$2605, '+' + IntToStr(v));
end;

procedure TGame.OnNearMiss(s: TSkier; d: Float);
begin
  if (state <> 'play') or (riderMode <> 'ride') or finished then exit;
  score.OnNearMiss(d); audio.NearMiss; audio.MusicOvertake; slowT := CONFIG.nearMissSlowmoTime;
end;

procedure TGame.StartCrash(reason: String);
var why: String;
begin
  var p := phys; riderMode := 'ragdoll'; ragT := 0;
  ragdoll.Start(wj, p.vel, 1 / CONFIG.physicsHz);
  audio.Crash; audio.MusicFall; camRig.AddTrauma(0.85); Buzz(140); particles.Burst(p.pos, p.vel, 90, 4, 3.5, 1.6, 0.55);
  trail.BreakLine; score.OnCrash;
  if not finished then penalty += CONFIG.crashPenalty;
  if reason = 'skier' then why := 'Kollision' else if reason = 'tree' then why := 'Baum' else if reason = 'net' then why := 'Fangnetz'
  else if reason = 'obstacle' then why := 'Hindernis' else if reason = 'rival' then why := 'Auffahrunfall' else if reason = 'landing' then why := 'Landung'
  else if reason = 'edge' then why := 'Verkantet' else if reason = 'lost' then why := 'Abgekommen' else why := '';
  hud.Pop('Sturz', why + (if finished then '' else ' ' + UC($B7) + ' +' + FmtInt(CONFIG.crashPenalty) + 's'), True);
  p.crashReason := ''; p.frozen := True;
end;

procedure TGame.BeginStandUp;
var z, W, d: Float;
begin
  var c := course; var pel := ragdoll.p[J.PELVIS];
  z := ClampF(pel.z, 4, c.zf + 150); W := c.width(z); d := ClampF(pel.x - c.cx(z), -(W - 3), W - 3); z := c.safeZ(z, d);
  for var i := 0 to NJ - 1 do fromJ[i].copy(ragdoll.p[i]);
  fromBoardPos.copy(boardPos); fromBoardQ.copy(boardQ);
  phys.Reset(z); phys.pos.x := c.cx(z) + d; phys.pos.y := c.height(phys.pos.x, z); phys.prevPos.copy(phys.pos);
  phys.frozen := True; riderMode := 'standup'; standT := 0; trail.BreakLine;
end;

// ---------- Rider-Pose (Interpolation + Animation / Ragdoll / Aufstehen) ----------
procedure TGame.RenderRider(alpha, dt: Float);
var bl: Float;
begin
  var p := phys; var S := animS;
  if riderMode = 'ragdoll' then begin
    for var i := 0 to NJ - 1 do wj[i].copy(ragdoll.p[i]);
    BoardFromJoints(wj, boardPos, boardQ);
    rider.head.visible := True; rider.Pose(wj, boardPos, boardQ); exit;
  end;
  rp.lerpVectors(p.prevPos, p.pos, alpha);
  rUp.lerpVectors(p.prevBoardUp, p.boardUp, alpha).normalize;
  var st := pst; st.yaw := p.prevYaw + WrapAngle(p.yaw - p.prevYaw) * alpha; st.edge := Lerp(p.prevEdge, p.edge, alpha); st.flip := Lerp(p.prevFlip, p.flip, alpha);
  S.latAcc := p.latAcc; S.load := if p.grounded then p.load else 0.0; S.tuck := p.tuck; S.brake := p.brake; S.charge := p.charge;
  S.grounded := p.grounded; S.airTime := p.airTime; S.idle := (state = 'title') or (state = 'countdown') or (riderMode = 'standup'); S.grab := p.grab;
  PoseFromState(animator, st, dt, wj, boardPos, boardQ); rf.copy(PoseF); rr.copy(PoseR);
  if riderMode = 'standup' then begin
    bl := Smoothstep(0, 1, standT / CONFIG.standUpTime);
    for var i := 0 to NJ - 1 do wj[i].lerpVectors(fromJ[i], wj[i], bl);
    boardPos.lerpVectors(fromBoardPos, boardPos, bl); boardQ.slerpQuaternions(fromBoardQ, boardQ, bl);
  end;
  rider.Pose(wj, boardPos, boardQ);
  rider.head.visible := not ((camRig.mode = 2) and (riderMode = 'ride') and (state <> 'title'));
end;

procedure TGame.BoardFromJoints(w: TJoints; pos: JVector3; q: JQuaternion);
begin
  var x := tmp.subVectors(w[J.ANL], w[J.ANR]).normalize; var mid := tmp2.addVectors(w[J.ANL], w[J.ANR]).multiplyScalar(0.5);
  var y := tmp3.subVectors(w[J.PELVIS], mid); y.addScaledVector(x, -y.dot(x)).normalize;
  var z := snapC.crossVectors(x, y);
  frameM.makeBasis(x, y, z); q.setFromRotationMatrix(frameM); pos.copy(mid).addScaledVector(y, -RIG.ankleY);
end;

procedure TGame.FillCamTarget;
begin
  var t := camT; var p := phys;
  t.speed := if riderMode = 'ride' then p.speed else ragdoll.speed * 0.5; t.grounded := p.grounded; t.latAcc := p.latAcc;
  t.crashed := riderMode <> 'ride';
  if riderMode = 'ragdoll' then begin t.focus.copy(ragdoll.p[J.PELVIS]); t.vel.set(0, 0, 0); end
  else begin t.focus.copy(rp); t.focus.y += 0.3; t.vel.copy(p.vel); end;
  t.head.copy(wj[J.HEAD]); t.lookDir.subVectors(wj[J.FACE], wj[J.HEAD]).normalize;
  t.heading.set(Sin(p.yaw), 0, Cos(p.yaw));
end;

// ---------- Sonne mitfuehren (Texel-Snapping gegen Schatten-Flimmern) ----------
procedure TGame.UpdateSun(center: JVector3);
var texel: Float;
begin
  var s := snapC.copy(center).applyMatrix4(lightInv); texel := 68 / preset.shadow;
  s.x := Round(s.x / texel) * texel; s.y := Round(s.y / texel) * texel; s.applyMatrix4(lightRot);
  sun.target.position.copy(s); sun.position.copy(s).addScaledVector(sunDir, 120); sun.target.updateMatrixWorld;
end;

// ---------- Main Loop ----------
procedure TGame.Loop(now: Float);
var dtReal, dt, cz, mz, grd, kmh, mi: Float;
begin
  requestAnimationFrame(FLoopProc);
  // Drehen: das resize-Event kommt auf Mobilgeraeten teils vor den neuen Massen
  if (window.innerWidth <> vw) or (window.innerHeight <> vh) then OnResize;
  dtReal := ClampF((now - last) / 1000, 0, 0.1); last := now;
  input.Update(dtReal);
  if input.Consume('pause') and ((state = 'play') or (state = 'countdown')) then begin if paused then CloseMenu else OpenMenu(False); end;
  if input.Consume('camera') then SetCam((camRig.mode + 1) mod 3);
  if paused then begin composer.render; exit; end;
  // Zeitlupe (Near Miss)
  if slowT > 0 then slowT -= dtReal;
  timeScale := Damp(timeScale, if slowT > 0 then CONFIG.nearMissSlowmo else 1.0, 14, dtReal);
  dt := dtReal * timeScale; clock += dt; SHARED.time.value := clock;
  AutoAdjust(dtReal);
  if state = 'title' then UpdateTitle(dt, dtReal) else UpdateRun(dt, dtReal);
  // Welt-Streaming, Licht, Hintergrund
  cz := if state = 'title' then flyZ else Max(phys.pos.z, if riderMode = 'ragdoll' then ragdoll.p[0].z else 0.0);
  terrain.Update(cz, camera.position);
  resort.UpdateVisibility(cz - 2 * CONFIG.chunkLength, cz + (terrain.ahead - 0.5) * CONFIG.chunkLength);
  UpdateSun(if state = 'title' then camera.position else rp);
  mz := camera.position.z; grd := (course.y0(mz + 900) - course.y0(mz - 100)) / 1000;    // Talboden der Berge folgt dem Gefaelle
  mountains.Update(camera.position, if state = 'title' then camera.position.y - 10 else rp.y, grd);
  sky.position.copy(camera.position);
  snowfall.Update(camera.position);
  resort.Update(dtReal);
  JVector3(SHARED.sunView.value).copy(sunDir).transformDirection(camera.matrixWorldInverse);
  particles.Update(dt);
  skiers.Render;
  kmh := phys.speed * 3.6;
  gradePass.uniforms.uTime.value := FMod(clock, 100);
  gradePass.uniforms.uBlur.value := if preset.blur and (state <> 'title') then ClampF((kmh - 55) / 70, 0, 1) * 0.024 else 0.0;
  var au := audioS; au.speed := if state = 'title' then 0.0 else phys.speed; au.grounded := phys.grounded;
  au.riding := (state <> 'title') and (riderMode = 'ride'); au.edgePressure := phys.edgePressure; au.skid := phys.skid;
  audio.Update(au, dtReal);
  // Musik-Intensitaet: Titel ruhig, Countdown Aufbau, im Rennen Tempo + Combo + Luft + Zeitlupe, Schlussabschnitt Richtung Finale
  mi := 0.06;
  if state = 'countdown' then mi := 0.22
  else if state = 'finished' then mi := 0.3
  else if state = 'play' then begin
    if riderMode <> 'ride' then mi := 0.15
    else mi := ClampF(0.2 + (kmh - 20) / 110 * 0.6, 0.2, 0.8) + (score.combo - 1) * 0.03 + (if phys.grounded then 0.0 else 0.08) + (if timeScale < 0.9 then 0.06 else 0.0)
      + (if phys.pos.z > course.zf * 0.85 then 0.15 else 0.0);
  end;
  musicI := Damp(if not hasMusicI then mi else musicI, ClampF(mi, 0, 1), 1.2, dtReal); hasMusicI := True; audio.MusicIntensity(musicI);
  var hi := hudInfo;
  hi.timeScale := timeScale; hi.riding := riderMode = 'ride'; hi.speed := phys.speed; hi.finished := finished; hi.finishTime := finishTime;
  hi.penalty := penalty; hi.runTime := runTime; hi.score := score; hi.posZ := phys.pos.z;
  hi.gatesPassed := chal.passed; hi.gatesTotal := chal.gates.Length; hi.starsGot := chal.got; hi.starsTotal := chal.stars.Length; hi.rivalText := rivalText;
  hud.Update(dtReal, hi);
  composer.render;
end;

procedure TGame.UpdateTitle(dt, dtReal: Float);
var z, x, y, lz: Float;
begin
  flyT += dtReal;
  var c := course; z := 30 + FMod(flyT * 16, 650); flyZ := z;
  x := c.cx(z) + Sin(flyT * 0.23) * 16; y := c.height(x, z) + 8 + Sin(flyT * 0.31) * 3;
  camera.position.set(x, y, z);
  lz := z + 40; camera.lookAt(c.cx(lz) + Sin(flyT * 0.17) * 6, c.height(c.cx(lz), lz) + 1.5, lz);
  if camera.fov <> 60 then begin camera.fov := 60; camera.updateProjectionMatrix; end;
  skiers.Update(dt, z - 40, 0.2);
  RenderRider(1, dt);
end;

procedure TGame.UpdateRun(dt, dtReal: Float);
var steps, n, rk, activeCount: Integer; FIX, prog, alpha, progress, zc: Float; canHit: Boolean;
begin
  var p := phys; FIX := 1 / CONFIG.physicsHz; var inp := input;
  if state = 'countdown' then begin
    cdT += dtReal; n := 3 - Floor(cdT / 0.8);
    if n <> cdLast then begin
      cdLast := n;
      if n > 0 then begin hud.Countdown(IntToStr(n), True); audio.Beep(False); end
      else if n = 0 then begin hud.Countdown('GO', True); audio.Beep(True); end;
    end;
    if cdT > 2.4 then begin state := 'play'; p.frozen := False; end;
  end else if cdT < 3.2 then begin cdT += dtReal; if cdT >= 3.2 then hud.Countdown('', False); end;
  if (state = 'play') and not finished then runTime += dt;
  // Geist: aufzeichnen (20 Hz) und Bestzeit-Fahrt abspielen
  if hasGhostRec and (state = 'play') and not finished and (runTime >= ghostNext) then begin TGhost.Sample(ghostRec, runTime, p, riderMode); ghostNext += 1 / GHOST_HZ; end;
  ghost.Update(runTime, dt, opts.ghost and ((state = 'play') or (state = 'countdown')));
  if invuln > 0 then invuln -= dt;
  // Eingabe fuer die Physik (im Ziel: automatisch abbremsen)
  if finished then begin pin.steer := 0; pin.tuck := 0; pin.brake := if p.speed > 2 then 1.0 else 0.0; pin.jump := False; pin.grab := False; end
  else begin pin.steer := inp.steer; pin.tuck := inp.tuck; pin.brake := inp.brake; pin.jump := inp.jump; pin.grab := inp.grab; end;
  // --- fester Physik-Timestep mit Akkumulator
  acc += dt; steps := 0;
  while (acc >= FIX) and (steps < CONFIG.maxSubSteps) do begin
    if riderMode = 'ride' then begin
      p.Step(FIX, pin);
      if p.crashReason <> '' then StartCrash(p.crashReason)
      else if not p.frozen then EmitRideFx(FIX);
    end else if riderMode = 'ragdoll' then begin
      ragdoll.Step(FIX); ragT += FIX;
      if (ragdoll.speed > 4) and (Random < 0.5) then begin
        var q := ragdoll.p[J.PELVIS]; particles.Emit(q.x, q.y, q.z, (Random - 0.5) * 2, Random * 2, (Random - 0.5) * 2, 1.0, 0.45);
      end;
      if ((ragT > CONFIG.ragdollTime) and (ragdoll.speed < 2.5)) or (ragT > CONFIG.ragdollTime + 2.5) then BeginStandUp;
    end else p.Step(FIX, pin);
    prog := ClampF(p.pos.z / course.zf, 0, 1);
    for var rv in rivals do rv.Step(FIX, state = 'play', prog, runTime, skiers);
    acc -= FIX; Inc(steps);
  end;
  if steps >= CONFIG.maxSubSteps then acc := 0;
  alpha := acc / FIX;
  if riderMode = 'standup' then begin
    standT += dt;
    if standT >= CONFIG.standUpTime then begin
      riderMode := 'ride'; p.frozen := not (state = 'play'); invuln := CONFIG.invulnTime;
      if not p.frozen then p.vel.set(Sin(p.yaw), 0, Cos(p.yaw)).multiplyScalar(3);   // mit etwas Anfangstempo weiter
    end;
  end;
  RenderRider(alpha, dt);
  for var rv in rivals do rv.Render(alpha, dt);
  // Platzierung: Gegner im Ziel vor dem Spieler (nach Zeit inkl. Strafen) bzw. weiter vorne
  activeCount := 0;
  for var rv in rivals do if rv.active then Inc(activeCount);
  if activeCount > 0 then begin
    rk := 1;
    for var rv in rivals do
      if rv.active and (if finished then rv.finished and (rv.time < finishTime) else rv.finished or (rv.phys.pos.z > p.pos.z)) then Inc(rk);
    if (state = 'play') and (rank <> 0) and (rk < rank) and not finished then begin audio.MusicOvertake; hud.Pop(UC($DC) + 'berholt!', 'Platz ' + IntToStr(rk)); end;
    rank := rk; rivalText := 'Platz ' + IntToStr(rk) + '/' + IntToStr(1 + activeCount);
  end else rivalText := '';
  // Skifahrer + Kollision (Kapsel vs Kapsel) + Near Miss
  progress := ClampF(p.pos.z / course.zf, 0, 1);
  skiers.Update(dt, p.pos.z, progress);
  capA.copy(rp).addScaledVector(rUp, 0.25); capB.copy(rp).addScaledVector(rUp, 1.45);
  canHit := (state = 'play') and (riderMode = 'ride') and (invuln <= 0) and not finished;
  var hit := skiers.CheckPlayer(capA, capB, p.pos.z, p.speed, canHit);
  if (hit <> nil) and canHit then begin p.Crash('skier'); StartCrash('skier'); end;
  Contacts(dt);
  // Tore & Sterne
  if (state = 'play') and not finished then begin
    zc := if riderMode = 'ragdoll' then Max(p.pos.z, ragdoll.p[J.PELVIS].z) else p.pos.z;
    tmp3.copy(rp).addScaledVector(rUp, 0.7);
    chal.Update(dt, zc, p.pos.x, tmp3, riderMode = 'ride', OnGate, OnStar);
  end else chal.Update(dt, -1e9, 0, tmp3, False, procedure(ok: Boolean) begin end, procedure(st: TStar) begin end);
  // Score & Ziel
  score.Update(dt, p, (state = 'play') and (riderMode = 'ride') and not finished);
  if (state = 'play') and not finished and (p.pos.z > course.zf) then begin
    finished := True; finishTime := runTime + penalty; hud.Pop('Ziel!', FmtTime(finishTime)); audio.Pop(2); audio.Pop(1.5); audio.MusicFinish;
  end;
  if finished and (state = 'play') then begin finishT += dtReal; if finishT > 2.2 then ShowFinish; end;
  FillCamTarget; camRig.Update(dtReal, camT);
  UpdateGateMark; UpdateTags; UpdateTrickHint;
end;

function ArcPath(r, a: Float): String;
var x: Float;
begin
  x := r * Sin(a);
  Result := 'M ' + ToFixed(-x, 2) + ' ' + ToFixed(-r * Cos(a), 2) + ' A ' + NumStr(r) + ' ' + NumStr(r) + ' 0 0 1 ' + ToFixed(x, 2) + ' ' + ToFixed(-r * Cos(a), 2);
end;

function MathSign(x: Float): Float;
begin
  if x > 0 then Result := 1 else if x < 0 then Result := -1 else Result := 0;
end;

// Landehilfe in der Luft: Ring mit Ist-Drehung und Vorhersage "wenn du jetzt loslaesst", dazu ein kurzer Tipp
procedure TGame.UpdateTrickHint;
var show, flipping, spinning, holding, touch: Boolean; tl, tt, velYaw, hs, yawErr, now, rate, k, e, target, relU, holdU, rel, eR, eH, clean, crash: Float;
    turns: Integer; cls, txt, key, stop, dirKey, keyHint: String;
begin
  if trEl = nil then begin
    trEl := El('trick'); trTxt := El('trTxt'); trKey := El('trKey'); trNow := El('trNow'); trPred := El('trPred');
    El('trOk').setAttribute('d', ArcPath(38, CONFIG.landFlipClean)); El('trWarn').setAttribute('d', ArcPath(38, CONFIG.landFlipCrash));
  end;
  var p := phys; var c := course; var el := trEl;
  show := False;
  if (state = 'play') and (riderMode = 'ride') and not p.grounded and (p.airTime > 0.05) and not finished then begin
    // Landezeitpunkt: ballistische Flugbahn gegen das Gelaende
    tl := 1.2; tt := 0.03;
    while tt < 3 do begin
      if p.pos.y + p.vel.y * tt - 0.5 * CONFIG.gravity * tt * tt <= c.height(p.pos.x + p.vel.x * tt, p.pos.z + p.vel.z * tt) then begin tl := tt; break; end;
      tt += 0.03;
    end;
    velYaw := ArcTan2(p.vel.x, p.vel.z); hs := Hypot2(p.vel.x, p.vel.z);
    flipping := (Abs(p.flip) > 0.25) or (Abs(p.flipRate) > 1.5);
    yawErr := if hs > 3 then WrapAngle(p.yaw - velYaw) else 0.0;
    spinning := (hs > 3) and ((Abs(yawErr) > 0.3) or (Abs(p.yawRate) > 1.5));
    if flipping or spinning then begin
      show := True;
      // Loslassen: Drehrate klingt exponentiell ab (Flip 9/s, Spin 6/s). Halten: Rate laeuft auf die volle Drehrate hoch.
      now := if flipping then p.flip else yawErr; rate := if flipping then p.flipRate else p.yawRate; k := if flipping then 9.0 else 6.0; e := 1 - Exp(-k * tl);
      target := MathSign(rate); if target = 0 then target := MathSign(now); if target = 0 then target := 1;
      target *= if flipping then CONFIG.flipRate else CONFIG.airSpinRate;
      relU := now + rate / k * e; holdU := now + target * tl - (target - rate) / k * e;
      rel := WrapAngle(relU); eR := Abs(rel); eH := Abs(WrapAngle(holdU)); turns := Round(Abs(relU) / TAU);
      holding := if flipping then (pin.tuck > 0.5) or (pin.brake > 0.5) else Abs(pin.steer) > 0.3;
      clean := CONFIG.landFlipClean; crash := if flipping then CONFIG.landFlipCrash else CONFIG.landCrashAngle;
      touch := document.body.classList.contains('touch');
      dirKey := if flipping then (if now > 0 then 'W' else 'S') else (if rate < 0 then #$2192' / D' else #$2190' / A');
      keyHint := if touch then (if flipping then (if now > 0 then 'Stick hoch' else 'Stick runter') else 'Stick seitlich') else dirKey + ' halten';
      cls := 'ok'; txt := ''; key := '';
      if holding then begin
        // Rangfolge: sauber landen > sicher (abbrechen/loslassen) > Drehung riskant zu Ende bringen
        stop := if turns = 0 then 'Abbrechen!' else 'Loslassen!';
        if (turns = 0) and (eR <= clean) then begin if eH > crash then begin cls := 'warn'; txt := 'Abbrechen!'; end; end   // Drehung beginnt: nur Ring, ausser die Zeit reicht nicht
        else if eR <= clean then begin cls := 'ok go'; txt := 'Loslassen!'; end                                          // volle Drehung geschafft
        else if eH <= clean then begin cls := 'warn'; txt := 'Weiterdrehen!'; key := keyHint; end
        else if eR <= crash then begin cls := 'warn'; txt := stop; end
        else if eH <= crash then begin cls := 'warn'; txt := 'Weiterdrehen!'; key := keyHint; end
        else begin cls := 'bad'; txt := if eH < eR then 'Weiterdrehen!' else stop; if eH < eR then key := keyHint; end;
      end else begin
        if eR <= clean then txt := #$2713
        else if eH < eR then begin cls := if eH <= crash then 'warn' else 'bad'; txt := 'Weiterdrehen!'; key := keyHint; end
        else begin cls := if eR <= crash then 'warn' else 'bad'; txt := if eR <= crash then 'Knapp' else 'Sturzgefahr!'; end;
      end;
      if p.airTime < 0.15 then begin cls := 'ok'; txt := ''; key := ''; end;   // direkt nach dem Absprung: Vorhersage noch unzuverlaessig (Kante) -> nur Ring
      el.className := 'on ' + cls; trTxt.textContent := txt; trKey.textContent := key;
      trNow.setAttribute('transform', 'rotate(' + ToFixed(now * 180 / PI_, 1) + ')');
      trPred.setAttribute('transform', 'rotate(' + ToFixed(rel * 180 / PI_, 1) + ')');
    end;
  end;
  if not show and el.classList.contains('on') then begin el.className := ''; trTxt.textContent := ''; trKey.textContent := ''; end;
end;

// Namensschild ueber jedem Gegner (dezent, blendet mit der Entfernung aus)
procedure TGame.UpdateTags;
var show: Boolean; dist: Float;
begin
  if tagEls.Length = 0 then begin
    var box := El('tags');
    for var rv in rivals do begin
      var d := document.createElement('div'); d.className := 'tag';
      d.innerHTML := '<i style="background:#' + HexColor(rv.def.col.jacket) + '"></i>' + rv.def.name; box.appendChild(d); tagEls.Add(d);
    end;
  end;
  show := (state = 'play') or (state = 'countdown');
  for var i := 0 to rivals.Length - 1 do begin
    var rv := rivals[i]; var el := tagEls[i];
    if not show or not rv.active or not rv.rider.root.visible then begin el.style.display := 'none'; continue; end;
    var head := rv.wj[J.HEAD]; dist := head.distanceTo(camera.position); var v := tmp2.copy(head).addScaledVector(rv.st.up, 0.55).project(camera);
    if (v.z > 1) or (dist > 160) or (Abs(v.x) > 1.1) or (Abs(v.y) > 1.1) then begin el.style.display := 'none'; continue; end;
    el.style.display := 'block'; el.style.opacity := ToFixed(0.9 * (1 - Smoothstep(60, 160, dist)), 2);
    el.style.transform := 'translate(' + ToFixed((v.x * 0.5 + 0.5) * window.innerWidth, 0) + 'px,' + ToFixed((-v.y * 0.5 + 0.5) * window.innerHeight, 0) + 'px) translate(-50%,-100%)';
  end;
end;

// Pfeil + Entfernung ueber dem naechsten Tor; ausserhalb des Bildes an den Rand geklemmt
procedure TGame.UpdateGateMark;
var dist, W, H, x, y: Float;
begin
  if gateMarkEl = nil then gateMarkEl := El('gateMark');
  var el := gateMarkEl; var ch := chal; var p := phys;
  var g: TGate := if ch.gateNext < ch.gates.Length then ch.gates[ch.gateNext] else nil;
  dist := if g <> nil then g.z - p.pos.z else 1e9;
  if (g = nil) or (state <> 'play') or finished or (dist > 450) or (dist < -2) then begin el.style.display := 'none'; exit; end;
  var v := tmp2.set(g.x, course.height(g.x, g.z) + 3.1, g.z).project(camera);
  if v.z > 1 then begin el.style.display := 'none'; exit; end;
  W := window.innerWidth; H := window.innerHeight; x := ClampF((v.x * 0.5 + 0.5) * W, 40, W - 40); y := ClampF((-v.y * 0.5 + 0.5) * H, 70, H - 40);
  el.style.display := 'block'; el.style.transform := 'translate(' + ToFixed(x, 0) + 'px,' + ToFixed(y, 0) + 'px) translate(-50%,-100%)';
  el.className := if g.col = $d7263d then 'red' else 'blue'; el.lastElementChild.textContent := IntToStr(Max(0, Round(dist))) + ' m';
end;

procedure TGame.EmitRideFx(FIX: Float);
var es, skidN, rate, along, outv, upv, bx, by, bz: Float;
begin
  var p := phys;
  if not p.grounded or (p.speed < 3) then begin if not p.grounded then trail.BreakLine; exit; end;
  es := SignF(p.edge); var f := p.f; var r := p.r; var n := p.n;
  // Board-Spur an der belasteten Kante
  tmp.copy(p.pos).addScaledVector(r, es * 0.1 * Min(1.0, Abs(p.edge) * 3));
  skidN := ClampF(p.skid / 3.5, 0, 1);
  trail.Add(tmp, r, n, Lerp(0.07, 0.36, skidN), skidN, clock);
  // Schneespray abhaengig von Kantendruck und Rutschen
  rate := (p.skid * 16 + Max(0.0, p.edgePressure - 0.25) * p.speed * 2.4) * (preset.particles / 4000 + 0.3);
  sprayAcc += rate * FIX;
  while sprayAcc >= 1 do begin
    sprayAcc -= 1;
    along := (Random - 0.5) * 1.3; outv := -es * (1.5 + p.skid * 0.55 + Random * 1.5); upv := 1.0 + Random * 2.2 + p.skid * 0.25;
    bx := p.pos.x + r.x * es * 0.13 + f.x * along; by := p.pos.y + 0.05; bz := p.pos.z + r.z * es * 0.13 + f.z * along;
    particles.Emit(bx, by, bz,
      p.vel.x * 0.55 + r.x * outv + n.x * upv + (Random - 0.5), p.vel.y * 0.55 + r.y * outv + n.y * upv, p.vel.z * 0.55 + r.z * outv + n.z * upv + (Random - 0.5),
      0.6 + Random * 0.7, 0.12 + Random * 0.18 + p.skid * 0.02);
  end;
end;

procedure TGame.ShowFinish;
var t, bt: Float; rec, html: String; nRiv: Integer;
begin
  state := 'finished';
  var s := score; var best := GetBest; t := finishTime; rec := '';
  if not Truthy(best) or (t < Float(best.time)) then begin
    rec := 'Neue Bestzeit!';
    if hasGhostRec and (ghostRec.Length > 0) then ghost.Save(ghostRec, t);
    try localStorage.setItem(StoreKey('best'), JSON.stringify(class time := t; score := Floor(s.score); end)); except end;
  end;
  El('fRec').textContent := rec;
  nRiv := 0;
  for var rv in rivals do if rv.active then Inc(nRiv);
  bt := if Truthy(best) and (Float(best.time) < t) then Float(best.time) else t;
  var rows: array of String;
  var row := procedure(a, b: String) begin rows.Add('<div>' + a + '</div><div>' + b + '</div>'); end;
  if nRiv > 0 then row('Platz', IntToStr(rank) + ' / ' + IntToStr(nRiv + 1));
  row('Zeit', FmtTime(t)); row('davon Strafzeit', '+' + ToFixed(penalty, 0) + ' s'); row('Score', GermanNum(s.score));
  row('Top-Speed', IntToStr(Round(s.topSpeed)) + ' km/h'); row('Near Misses', IntToStr(s.nearMiss)); row('Clean Carves', IntToStr(s.carves));
  row('Airtime', ToFixed(s.airTotal, 1) + ' s'); row('Flips / Grabs', IntToStr(s.flips) + ' / ' + IntToStr(s.grabs));
  row('Tore', IntToStr(chal.passed) + ' / ' + IntToStr(chal.gates.Length)); row('Sterne', IntToStr(chal.got) + ' / ' + IntToStr(chal.stars.Length));
  row('St' + UC($FC) + 'rze', IntToStr(s.crashes)); row('Bestzeit', FmtTime(bt));
  for var rv in rivals do if rv.active then row(rv.def.name, if rv.finished then FmtTime(rv.time) else 'noch unterwegs');
  html := '';
  for var rw in rows do html += rw;
  El('fStats').innerHTML := html;
  El('finish').classList.add('on'); El('hud').classList.remove('on');
end;

procedure TGame.AutoAdjust(dtReal: Float);
var fps: Float;
begin
  Inc(fpsFrames); fpsTime += dtReal;
  if fpsTime < 2.5 then exit;
  fps := fpsFrames / fpsTime; fpsFrames := 0; fpsTime := 0;
  if not autoPreset or (state <> 'play') then exit;
  if fps < CONFIG.autoPresetFps then begin
    Inc(lowCount);
    if lowCount >= 2 then begin
      var order: array of String := ['low', 'medium', 'high']; var i := order.IndexOf(presetName);
      if i > 0 then begin ApplyPreset(order[i - 1]); hud.Toast('Grafik: ' + order[i - 1] + ' (auto, ' + IntToStr(Round(fps)) + ' FPS)'); end;
      lowCount := 0;
    end;
  end else lowCount := 0;
end;

{ Einstieg }

var installPrompt: Variant;

procedure StartCarveLine;
begin
  // Fehler-Overlay (antippen schliesst es). "Script error." ohne Datei stammt aus fremden Skripten (CDN, Erweiterungen) und enthaelt keine Details -> nur Konsole
  window.addEventListener('error', procedure(e: JEvent)
  begin
    var msg := String(e.message ?? '');
    if (e.filename = '') and ((msg = 'Script error.') or (msg = 'Script error')) then begin consoleWarn('Fremdes Skript meldete einen Fehler ohne Details'); exit; end;
    var el := El('err'); el.style.display := 'block';
    el.textContent := 'Fehler: ' + (if msg <> '' then msg else String(Variant(e))) + (if e.filename <> '' then #10 + e.filename + ':' + IntToStr(e.lineno) else '') + #10'(antippen zum Schlie' + UC($DF) + 'en)';
  end);
  El('err').onclick := procedure(e: JEvent) begin El('err').style.display := 'none'; end;
  InitGfx;
  var game := TGame.Create;
  asm window.game = @game; end;
  InstallSelfTest(game.course, game.resort);
  // PWA: Service Worker (offline spielbar) - nur ueber HTTPS oder localhost; Installieren-Knopf, sobald der Browser es anbietet
  asm
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname)))
      navigator.serviceWorker.register('sw.js').catch(function (e) { console.warn('Service Worker nicht registriert', e); });
  end;
  window.addEventListener('beforeinstallprompt', procedure(e: JEvent) begin e.preventDefault; installPrompt := e; El('bInstall').style.display := ''; end);
  window.addEventListener('appinstalled', procedure(e: JEvent) begin installPrompt := null; El('bInstall').style.display := 'none'; end);
  El('bInstall').onclick := procedure(e: JEvent)
  begin
    if not Truthy(installPrompt) then exit;
    installPrompt.prompt();
    asm (@installPrompt).userChoice.then(function () { @installPrompt = null; document.getElementById('bInstall').style.display = 'none'; }); end;
  end;
end;

end.
