unit carve.scenery;

// Hintergrund-Berge (Ring um die Kamera), Start/Ziel-Tore, fallender Schnee

interface

uses
  qtx.sysutils, carve.web, carve.util, carve.three, carve.course, carve.gfx;

type
  TPeak = class
  public
    a, H, w, dr, s: Float;
  end;

  TRange = class
  public
    R, depth: Float;
    n: Integer;
    h0, h1, haze: Float;
    peaks: array of TPeak;
  end;

  TMountains = class
  public
    mesh: JMesh;
    shear, fade, fadeCol: Variant;
    constructor Create(scene: JScene);
    procedure SetFade(f: Float; col: JColor);
    // grade: mittleres Gefaelle der Abfahrt um die Kamera (dy/dz, negativ = bergab Richtung +z)
    procedure Update(camPos: JVector3; riderY: Float; grade: Float = 0);
  end;

  TSnowfall = class
  public
    mat: JShaderMaterial;
    points: JPoints;
    constructor Create(scene: JScene; count: Integer = 2200);
    procedure Update(cam: JVector3);
    // storm: dichter (kleineres Volumen), schneller, windiger
    procedure SetStorm(on: Boolean);
  end;

function MakeGate(scene: JScene; course: TCourse; z: Float; text, bg: String): JGroup;

implementation

function MkRange(R, depth: Float; n: Integer; h0, h1, haze: Float): TRange;
begin
  Result := TRange.Create;
  Result.R := R; Result.depth := depth; Result.n := n; Result.h0 := h0; Result.h1 := h1; Result.haze := haze;
end;

function AngDiff(a, b: Float): Float;
var d: Float;
begin
  d := a - b; d -= JsRound(d / TAU) * TAU;
  Result := d;
end;

constructor TMountains.Create(scene: JScene);
// Drei gestaffelte Ketten (nah/mittel/fern) aus einzelnen Gipfeln: Kegel mit geraden Flanken, durch Grat-Sporne
// gebrochen, ueber eine Kammlinie verbunden. Farbe: Schnee, Fels an Steilwaenden, Wald am Fuss, Luftperspektive je Kette.
const AS_ = 720; RS = 140; R0 = 450.0; R1 = 4100.0;
var i, j, l, k, best, i1, a0, a1, b0, b1: Integer;
    HH, rr, a, floorH, fd, h, across, hl, da, dr, d, th, spur, tt, hm, x, y, z, ny, n, s: Float;
begin
  var rng := TRNG.Create(777);
  var ranges: array of TRange := [MkRange(1700, 520, 22, 340, 760, 0.14), MkRange(2450, 680, 16, 650, 1300, 0.34), MkRange(3300, 820, 12, 950, 1800, 0.52)];
  for var LR in ranges do
    for i := 0 to LR.n - 1 do begin
      HH := Lerp(LR.h0, LR.h1, Power(rng.Next, 1.4));
      var P := TPeak.Create;
      P.a := (i + rng.Next * 0.7) / LR.n * TAU; P.H := HH; P.w := HH * (0.95 + rng.Next * 0.5);
      P.dr := (rng.Next - 0.5) * LR.depth * 0.5; P.s := rng.Next * 50;
      LR.peaks.Add(P);
    end;
  var pos: array of Float; var rangeOf: array of Integer; var idx: array of Integer;
  for j := 0 to RS do begin
    rr := R0 + (R1 - R0) * Power(j / RS, 1.15);
    for i := 0 to AS_ - 1 do begin
      a := i / AS_ * TAU;
      floorH := -30 + Fbm(a * 18, rr * 0.004, 3) * 28; fd := Smoothstep(R0 + 100, R0 + 900, rr); // huegeliger Talboden; Berge laufen innen aus
      h := floorH; best := -1;
      for l := 0 to ranges.Length - 1 do begin
        var LR := ranges[l]; across := Abs(rr - LR.R) / LR.depth;
        // Kammlinie: durchgehender Ruecken der Kette
        if across < 1 then hl := LR.h0 * 0.42 * (0.75 + 0.25 * Fbm(a * 6 + l * 3, l, 2)) * Power(1 - across, 1.25) else hl := 0;
        for var P in LR.peaks do begin
          da := AngDiff(a, P.a) * LR.R;
          if Abs(da) > P.w * 1.4 then continue;
          dr := rr - (LR.R + P.dr); d := Hypot2(da, dr * 1.25);
          if d > P.w * 1.4 then continue;
          // Grat-Sporne: Abstand je nach Richtung um den Gipfel verzerren -> gerade Grate und Rinnen
          th := ArcTan2(dr, da); spur := 1 - 0.3 * Abs(VNoise(th * 1.9 + P.s, P.s));
          tt := 1 - d * spur / P.w;
          if tt > 0 then hl := Max(hl, P.H * Power(tt, 1.15));
        end;
        if hl > 0 then begin
          hl += Fbm(a * 40 + l * 11, rr * 0.006, 3) * hl * 0.02; hm := Lerp(floorH, -60 + hl, fd);
          if hm > h then begin h := hm; best := l; end;
        end;
      end;
      if j = 0 then h := -260;                                // Schuerze am Innenrand: nie Luecke zum Gelaende
      pos.Add(Cos(a) * rr); pos.Add(h); pos.Add(Sin(a) * rr); rangeOf.Add(best);
    end;
  end;
  for j := 0 to RS - 1 do for i := 0 to AS_ - 1 do begin
    i1 := (i + 1) mod AS_; a0 := j * AS_ + i; a1 := j * AS_ + i1; b0 := a0 + AS_; b1 := a1 + AS_;
    idx.Add(a0); idx.Add(a1); idx.Add(b0); idx.Add(a1); idx.Add(b1); idx.Add(b0);
  end;
  var g := new JBufferGeometry; g.setAttribute('position', new JFloat32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals;
  var PA := g.attributes.position; var Nn := g.attributes.normal; var col := new JFloat32Array(PA.count * 3);
  var rock := new JColor($4e5d72); var snow := new JColor($f3f7fd); var forest := new JColor($2e4550); var haze := new JColor($b7cbe4); var c := new JColor;
  for k := 0 to PA.count - 1 do begin
    x := PA.getX(k); y := PA.getY(k) + 60; z := PA.getZ(k); ny := Nn.getY(k); l := rangeOf[k];
    n := Fbm(x * 0.008 + y * 0.012, z * 0.008 - y * 0.009, 3);   // hoehenabhaengig: keine senkrechten Streifen
    // Fels an steilen Waenden, Schnee sonst; Wald als Guertel am Fuss (nur nahe/mittlere Kette)
    s := Smoothstep(0.5, 0.74, ny + n * 0.12 + y * 0.00008);
    c.copy(rock).lerp(snow, s);
    // Waldguertel am Fuss der Ketten und Waldflecken mit Lichtungen im Talboden
    if l < 2 then c.lerp(forest, Smoothstep(200, 80, y + n * 70) * Smoothstep(0.55, 0.8, ny) * Smoothstep(-0.15, 0.2, Fbm(x * 0.004 + 3, z * 0.004, 3)) * 0.9);
    c.lerp(haze, if l < 0 then 0.16 else ranges[l].haze);
    col[k * 3] := c.r; col[k * 3 + 1] := c.g; col[k * 3 + 2] := c.b;
  end;
  g.setAttribute('color', new JBufferAttribute(col, 3));
  var mat := new JMeshStandardMaterial(class vertexColors := True; roughness := 0.95; fog := False; end);
  shear := Uniform(0); fade := Uniform(0); fadeCol := Uniform(new JColor);
  var ush := shear; var ufd := fade; var ufc := fadeCol;
  mat.onBeforeCompile := procedure(sh: Variant)
  begin
    sh.uniforms.uShear := ush; sh.uniforms.uFade := ufd; sh.uniforms.uFadeCol := ufc;
    sh.vertexShader := JsReplace(JsReplace(sh.vertexShader, '#include <common>', '#include <common>' + #10 + 'uniform float uShear;'),
      '#include <begin_vertex>', '#include <begin_vertex>' + #10 + 'transformed.y += uShear * transformed.z;');
    sh.fragmentShader := JsReplace(JsReplace(sh.fragmentShader, '#include <common>', '#include <common>' + #10 + 'uniform float uFade; uniform vec3 uFadeCol;'),
      '#include <dithering_fragment>', '#include <dithering_fragment>' + #10 + 'gl_FragColor.rgb = mix(gl_FragColor.rgb, uFadeCol, uFade);');
  end;
  mesh := new JMesh(g, mat); mesh.frustumCulled := False; scene.add(mesh);
end;

procedure TMountains.SetFade(f: Float; col: JColor);
begin
  fade.value := f; JColor(fadeCol.value).copy(col); mesh.visible := f < 0.99;
end;

procedure TMountains.Update(camPos: JVector3; riderY: Float; grade: Float = 0);
begin
  mesh.position.set(camPos.x, riderY - 40, camPos.z); shear.value := grade;
end;

function MakeGate(scene: JScene; course: TCourse; z: Float; text, bg: String): JGroup;
var W, cz, y: Float;
begin
  var grp := new JGroup; W := course.width(z); cz := course.cx(z); y := course.height(cz, z);
  var postMat := new JMeshStandardMaterial(class color := $1b2638; roughness := 0.5; metalness := 0.3; end);
  for var s in [-1.0, 1.0] do begin
    var post := new JMesh(new JBoxGeometry(0.6, 6.5, 0.6), postMat);
    post.position.set(cz + s * (W + 1.2), course.height(cz + s * (W + 1.2), z) + 3.25, z); post.castShadow := True; grp.add(post);
  end;
  var banner := new JMesh(new JPlaneGeometry(2 * W + 2.4, 1.6), new JMeshStandardMaterial(class map := MakeBannerTex(text, bg); side := DoubleSide; roughness := 0.7; end));
  banner.position.set(cz, y + 5.8, z); banner.castShadow := True; grp.add(banner);
  scene.add(grp);
  Result := grp;
end;

constructor TSnowfall.Create(scene: JScene; count: Integer = 2200);
begin
  var g := new JBufferGeometry; var p := new JFloat32Array(count * 3); var r := new JFloat32Array(count);
  for var i := 0 to count - 1 do begin
    p[i * 3] := Random * 60; p[i * 3 + 1] := Random * 30; p[i * 3 + 2] := Random * 60; r[i] := Random;
  end;
  g.setAttribute('position', new JBufferAttribute(p, 3)); g.setAttribute('rnd', new JBufferAttribute(r, 1));
  var unis: Variant := new JObject;
  unis.uTime := SHARED.time; unis.uCam := Uniform(new JVector3); unis.uBox := Uniform(new JVector3(60, 30, 60));
  unis.uWind := Uniform(1); unis.uAmt := Uniform(1);
  mat := new JShaderMaterial(class
    transparent := True; depthWrite := False;
    uniforms := unis;
    vertexShader := #"uniform float uTime; uniform vec3 uCam; uniform vec3 uBox; uniform float uWind; attribute float rnd; varying float vA;
        void main(){ vec3 box = uBox;
          vec3 p = position + vec3(sin(uTime*0.7+rnd*20.0)*0.8 + uTime*1.2*uWind, -uTime*(1.2+rnd*0.8)*(0.7+0.3*uWind), uTime*0.4*uWind);
          p = mod(p - uCam + box*0.5, box) + uCam - box*0.5;   // Volumen wandert mit der Kamera (keine CPU-Kosten)
          vec4 mv = modelViewMatrix * vec4(p,1.0); gl_PointSize = min((14.0 + rnd*16.0) / -mv.z, 7.0); vA = smoothstep(55.0, 8.0, -mv.z) * smoothstep(1.5, 4.0, -mv.z);
          gl_Position = projectionMatrix * mv; }";
    fragmentShader := 'uniform float uAmt; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.1, length(d)); gl_FragColor = vec4(vec3(1.0), a*vA*0.8*uAmt); }';
  end);
  points := new JPoints(g, mat); points.frustumCulled := False; scene.add(points);
end;

procedure TSnowfall.Update(cam: JVector3);
begin
  JVector3(mat.uniforms.uCam.value).copy(cam);
end;

procedure TSnowfall.SetStorm(on: Boolean);
begin
  var u := mat.uniforms;
  if on then JVector3(u.uBox.value).set(30, 20, 30) else JVector3(u.uBox.value).set(60, 30, 60);
  u.uWind.value := if on then 3.2 else 1.0;
  u.uAmt.value := if on then 1.15 else 1.0;
end;

end.
