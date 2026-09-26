unit carve.gfx;

// Globale Shader-Patches (Cel-Shading, Hoehennebel), prozedurale Canvas-Texturen, Schnee- und AO-Material

interface

uses
  qtx.sysutils, carve.web, carve.util, carve.three;

type
  TDrawProc = procedure(g: JCanvas2D; w, h: Integer);

  // gemeinsame Uniforms (Sonnenrichtung im View-Space, Zeit)
  TShared = class
  public
    sunView: Variant;
    time: Variant;
  end;

var
  SHARED: TShared;
  AO_GEO: JBufferGeometry;

// Muss nach dem Laden von three.js und vor dem ersten Material aufgerufen werden
procedure InitGfx;
function CanvasTex(w, h: Integer; draw: TDrawProc; srgb: Boolean = True): JCanvasTexture;
function MakeCorduroyNormal: JCanvasTexture;
function MakeStripeTex: JCanvasTexture;
function MakeNetTex: JCanvasTexture;
function MakeBannerTex(text, bg: String): JCanvasTexture;
function MakeSnowMaterial: JMeshStandardMaterial;
function MakeAOMaterial: JMeshBasicMaterial;

implementation

// Comic-Look: Cel-Shading fuer alle MeshStandard/Physical-Materialien (direktes Licht in harte Stufen, Umgebungslicht bleibt weich)
procedure PatchToon;
const key = 'vec3 irradiance = dotNL * directLight.color;';
begin
  var ch := THREE.ShaderChunk;
  if not JsIncludes(ch.lights_physical_pars_fragment, key) then consoleWarn('Cel-Shading: Shader-Stelle nicht gefunden');
  ch.lights_physical_pars_fragment := 'float toonNL( float d ) { return smoothstep( 0.0, 0.06, d ) * ( 0.7 + 0.3 * smoothstep( 0.3, 0.38, d ) ); }' + #10 +
    JsReplace(ch.lights_physical_pars_fragment, key, 'vec3 irradiance = toonNL( dot( geometryNormal, directLight.direction ) ) * directLight.color;');
end;

// Hoehenabhaengiger Nebel: Nebeldichte nimmt mit der Hoehe ueber der Kamera exponentiell ab => Gipfel ragen aus dem Dunst
procedure PatchFog;
begin
  var ch := THREE.ShaderChunk;
  ch.fog_pars_vertex := #"
#ifdef USE_FOG
  varying float vFogDepth;
  varying vec3 vFogWorldPos;
#endif";
  ch.fog_vertex := #"
#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
  vec4 fogWP = vec4( transformed, 1.0 );
  #ifdef USE_INSTANCING
    fogWP = instanceMatrix * fogWP;
  #endif
  vFogWorldPos = ( modelMatrix * fogWP ).xyz;
#endif";
  ch.fog_pars_fragment := #"
#ifdef USE_FOG
  uniform vec3 fogColor;
  varying float vFogDepth;
  varying vec3 vFogWorldPos;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
#endif";
  ch.fog_fragment := #"
#ifdef USE_FOG
  #ifdef FOG_EXP2
    float fogH = max( 0.0, vFogWorldPos.y - ( cameraPosition.y - 25.0 ) );
    float fogFactor = ( 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth ) ) * exp( - fogH * 0.0045 );
  #else
    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
  #endif
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif";
end;

procedure InitGfx;
begin
  PatchToon;
  PatchFog;
  SHARED := TShared.Create;
  SHARED.sunView := Uniform(new JVector3(0, 1, 0));
  SHARED.time := Uniform(0);
  AO_GEO := new JPlaneGeometry(1, 1).rotateX(-PI_ / 2);
end;

function CanvasTex(w, h: Integer; draw: TDrawProc; srgb: Boolean = True): JCanvasTexture;
begin
  var c := JCanvas(document.createElement('canvas'));
  c.width := w; c.height := h;
  draw(c.getContext('2d'), w, h);
  Result := new JCanvasTexture(c);
  if srgb then Result.colorSpace := SRGBColorSpace else Result.colorSpace := NoColorSpace;
  Result.wrapS := RepeatWrapping; Result.wrapT := RepeatWrapping; Result.anisotropy := 8;
end;

// Praeparier-Rillen ("Cord") als Normal-Map, kachelbar: 512 px = 4 m, Rille alle 25 cm
procedure DrawCorduroy(g: JCanvas2D; S, hh: Integer);
var H: JFloat32Array; img: JImageData; x, y, i: Integer;
    wob, p, ridge, grain, lowv, dx, dy, nx, ny, nz, l: Float;
begin
  H := new JFloat32Array(S * S); img := g.createImageData(S, S);
  for y := 0 to S - 1 do for x := 0 to S - 1 do begin
    wob := Sin(y / S * TAU * 2) * 1.6 + Sin(y / S * TAU * 5 + 1) * 0.6;
    p := FMod(FMod(x + wob, 32) + 32, 32) / 32;
    ridge := Power(Sin(p * PI_), 0.65);
    grain := Hash2(x, y) * 0.22 + Hash2(x shr 2, y shr 2) * 0.18;
    lowv := 0.25 * Sin(x / S * TAU * 3 + Sin(y / S * TAU) * 2) * Sin(y / S * TAU * 4);
    H[y * S + x] := ridge + grain + lowv;
  end;
  for y := 0 to S - 1 do for x := 0 to S - 1 do begin
    dx := H[y * S + ((x + 1) mod S)] - H[y * S + ((x - 1 + S) mod S)];
    dy := H[((y + 1) mod S) * S + x] - H[((y - 1 + S) mod S) * S + x];
    nx := -dx * 1.4; ny := -dy * 1.4; nz := 1; l := Hypot3(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    i := (y * S + x) * 4;
    img.data[i] := (nx * 0.5 + 0.5) * 255; img.data[i + 1] := (ny * 0.5 + 0.5) * 255; img.data[i + 2] := (nz * 0.5 + 0.5) * 255; img.data[i + 3] := 255;
  end;
  g.putImageData(img, 0, 0);
end;

function MakeCorduroyNormal: JCanvasTexture;
begin
  Result := CanvasTex(512, 512, DrawCorduroy, False);
end;

function MakeStripeTex: JCanvasTexture;
begin
  Result := CanvasTex(8, 64, procedure(g: JCanvas2D; w, h: Integer)
  begin
    for var i := 0 to 7 do begin
      if i mod 2 = 1 then g.fillStyle := '#202020' else g.fillStyle := '#ffffff';
      g.fillRect(0, i * h / 8, w, h / 8);
    end;
  end);
end;

function MakeNetTex: JCanvasTexture;
begin
  Result := CanvasTex(64, 64, procedure(g: JCanvas2D; w, h: Integer)
  begin
    g.clearRect(0, 0, w, h); g.strokeStyle := '#ffffff'; g.lineWidth := 5;
    g.beginPath; g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke;
    g.fillRect(0, 0, w, 6);
  end);
end;

function MakeBannerTex(text, bg: String): JCanvasTexture;
begin
  Result := CanvasTex(1024, 192, procedure(g: JCanvas2D; w, h: Integer)
  begin
    g.fillStyle := bg; g.fillRect(0, 0, w, h);
    g.fillStyle := '#ffffff'; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10);
    g.font := 'italic 900 120px Arial'; g.textAlign := 'center'; g.textBaseline := 'middle'; g.fillText(text, w / 2, h / 2 + 6);
  end);
end;

// Schnee-Material: PBR + Cord-Normalmap (nur auf Piste), Glitzer, Subsurface-Anmutung
function MakeSnowMaterial: JMeshStandardMaterial;
begin
  Result := new JMeshStandardMaterial(class
    color := $ffffff; vertexColors := True; roughness := 0.66; metalness := 0;
    normalMap := MakeCorduroyNormal; normalScale := new JVector2(0.85, 0.85);
  end);
  Result.onBeforeCompile := procedure(sh: Variant)
  begin
    sh.uniforms.uSunView := SHARED.sunView;
    var vs: String := sh.vertexShader;
    vs := JsReplace(vs, '#include <common>', '#include <common>' + #10 + 'attribute float groom;' + #10 + 'varying float vGroom;' + #10 + 'varying vec3 vSnowW;');
    vs := JsReplace(vs, '#include <worldpos_vertex>', '#include <worldpos_vertex>' + #10 + 'vGroom = groom;' + #10 + 'vSnowW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.vertexShader := vs;
    var fs: String := sh.fragmentShader;
    fs := JsReplace(fs, '#include <common>', '#include <common>' + #10 + 'uniform vec3 uSunView;' + #10 + 'varying float vGroom;' + #10 + 'varying vec3 vSnowW;');
    // Comic-Rillen: eine Flanke jeder Cord-Rippe als blaeuliche Schraffur (unabhaengig von der Toon-Lichtstufe), in der Ferne ausgeblendet
    fs := JsReplace(fs, 'mapN.xy *= normalScale;', #"
        float rib = smoothstep(0.06, 0.4, mapN.x) * vGroom * (1.0 - smoothstep(15.0, 90.0, length(vViewPosition)));
        diffuseColor.rgb *= mix(vec3(1.0), vec3(0.72, 0.82, 0.97), rib);
        mapN.xy *= normalScale * (0.18 + 0.82 * vGroom);");
    fs := JsReplace(fs, '#include <emissivemap_fragment>', #"
        #include <emissivemap_fragment>
        // Subsurface-Anmutung: blaeuliche Streuung, im Tiefschnee etwas staerker
        totalEmissiveRadiance += vec3(0.010, 0.024, 0.050) * (1.0 + 0.6 * (1.0 - vGroom));");
    fs := JsReplace(fs, '#include <opaque_fragment>', #"
        {
          // Glitzer: zufaellige Eiskristall-Facetten pro ~5 cm Zelle, Blinn-Spekular gegen die Sonne
          vec3 cell = floor(vSnowW * 19.0);
          float rnd = fract(sin(dot(cell, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
          vec3 r3 = vec3(fract(rnd * 13.17), fract(rnd * 7.73), fract(rnd * 3.31)) - 0.5;
          vec3 facet = normalize(normal * 0.9 + (viewMatrix * vec4(r3, 0.0)).xyz);
          vec3 V = normalize(vViewPosition);
          vec3 Hh = normalize(uSunView + V);
          float s = pow(max(dot(facet, Hh), 0.0), 320.0) * step(0.55, rnd);
          float fade = 1.0 - smoothstep(8.0, 70.0, length(vViewPosition));
          float lit = clamp(length(reflectedLight.directDiffuse) * 1.2, 0.0, 1.0);
          outgoingLight += vec3(1.0, 0.97, 0.92) * s * 9.0 * fade * lit;
        }
        #include <opaque_fragment>
        gl_FragColor.a = 0.5; // Markierung Gelaende fuer den Umriss-Pass (Alpha wird sonst nicht genutzt)");
    sh.fragmentShader := fs;
  end;
end;

// Weicher Kontaktschatten (Ambient Occlusion) unter Baeumen, Felsen, Gebaeuden
function MakeAOMaterial: JMeshBasicMaterial;
begin
  var tex := CanvasTex(64, 64, procedure(x: JCanvas2D; w, h: Integer)
  begin
    var gr := x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle := gr; x.fillRect(0, 0, w, h);
  end);
  Result := new JMeshBasicMaterial(class
    map := tex; color := $1c2c48; transparent := True; opacity := 0.42; depthWrite := False;
    polygonOffset := True; polygonOffsetFactor := -2; polygonOffsetUnits := -2;
  end);
end;

end.
