unit carve.post;

// Post-Processing: Umrisslinien (Tiefen-Laplace), Farbkorrektur, Vignette, radiale Motion-Blur-Naeherung

interface

uses
  carve.web, carve.three;

// Shader-Definitionen fuer ShaderPass (uniforms/vertexShader/fragmentShader)
function OutlineShader: Variant;
function GradeShader: Variant;
// Sonnenscheibe begrenzen: sonst ueberstrahlt das extrem helle HDR-Sonnenpixel den ganzen Bloom
procedure ClampSky(sky: JSky);

implementation

const VS_QUAD = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

function OutlineShader: Variant;
begin
  Result := new JObject;
  var u: Variant := new JObject;
  u.tDiffuse := Uniform(null); u.tDepth := Uniform(null); u.uTexel := Uniform(new JVector2(1 / 1920, 1 / 1080)); u.uWidth := Uniform(1.8); u.uAlpha := Uniform(0.9);
  u.cameraNear := Uniform(0.1); u.cameraFar := Uniform(6000);
  u.uInk := Uniform(new JColor($0b1424)); u.uHaze := Uniform(new JColor($7f97b8));
  Result.uniforms := u;
  Result.vertexShader := VS_QUAD;
  Result.fragmentShader := #"#include <packing>
    uniform sampler2D tDiffuse; uniform sampler2D tDepth; uniform vec2 uTexel; uniform float uWidth; uniform float uAlpha; uniform float cameraNear; uniform float cameraFar; uniform vec3 uInk; uniform vec3 uHaze; varying vec2 vUv;
    float dist(vec2 uv){ return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, cameraNear, cameraFar); }
    // Objekt = kein Gelaende (Schnee schreibt Alpha 0.5) und nicht Himmel
    float isObj(vec2 uv, float dd){ return texture2D(tDiffuse, uv).a > 0.75 && dd < cameraFar * 0.97 ? 1.0 : 0.0; }
    void main(){
      vec3 col = texture2D(tDiffuse, vUv).rgb;
      vec2 o = uTexel * uWidth;
      float c = dist(vUv), l = dist(vUv - vec2(o.x, 0.0)), r = dist(vUv + vec2(o.x, 0.0)), u = dist(vUv + vec2(0.0, o.y)), d = dist(vUv - vec2(0.0, o.y));
      float wc = 1.0 / c, lap = abs(1.0 / l + 1.0 / r - 2.0 * wc) + abs(1.0 / u + 1.0 / d - 2.0 * wc);
      float e = smoothstep(0.035, 0.09, lap / wc);
      float nearest = min(c, min(min(l, r), min(u, d))), farthest = max(c, max(max(l, r), max(u, d)));
      float sky = step(cameraFar * 0.97, farthest);                       // Silhouette gegen den Himmel (Berge, Baeume)
      float a = e * max(1.0 - smoothstep(180.0, 800.0, nearest), sky * 0.8);
      // Volle Linie nur, wenn die vordere Flaeche an der Kante ein Objekt ist; Gelaende-Kuppen vor Bergen/Himmel nur zart und nah
      vec2 nuv = vUv;
      if (l < c && l <= r && l <= u && l <= d) nuv = vUv - vec2(o.x, 0.0); else if (r < c && r <= u && r <= d) nuv = vUv + vec2(o.x, 0.0);
      else if (u < c && u <= d) nuv = vUv + vec2(0.0, o.y); else if (d < c) nuv = vUv - vec2(0.0, o.y);
      float obj = isObj(nuv, nearest);
      a *= mix(0.2 * (1.0 - smoothstep(40.0, 220.0, nearest)), 1.0, obj);
      gl_FragColor = vec4(mix(col, mix(uInk, uHaze, smoothstep(120.0, 2600.0, nearest)), a * uAlpha), 1.0);
    }";
end;

function GradeShader: Variant;
begin
  Result := new JObject;
  var u: Variant := new JObject;
  u.tDiffuse := Uniform(null); u.uBlur := Uniform(0); u.uVignette := Uniform(0.32); u.uSat := Uniform(1.1); u.uTime := Uniform(0);
  Result.uniforms := u;
  Result.vertexShader := VS_QUAD;
  Result.fragmentShader := #"uniform sampler2D tDiffuse; uniform float uBlur; uniform float uVignette; uniform float uSat; uniform float uTime; varying vec2 vUv;
    void main(){
      vec2 dir = vUv - vec2(0.5, 0.52);
      vec3 col = texture2D(tDiffuse, vUv).rgb;
      // chromatische Aberration zum Rand hin
      vec2 ca = dir * (0.0012 + uBlur * 0.08) * smoothstep(0.2, 0.8, length(dir));
      col.r = texture2D(tDiffuse, vUv + ca).r; col.b = texture2D(tDiffuse, vUv - ca).b;
      if (uBlur > 0.0005) {   // radialer Blur zum Bildrand hin (Tempo-Eindruck)
        float amt = uBlur * smoothstep(0.12, 0.7, length(dir));
        vec3 acc = col; for (int i = 1; i < 8; i++) acc += texture2D(tDiffuse, vUv - dir * amt * float(i) / 7.0).rgb;
        col = acc / 8.0;
      }
      float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = max(mix(vec3(l), col, uSat), 0.0);
      col *= mix(vec3(0.95, 0.99, 1.07), vec3(1.05, 1.0, 0.95), smoothstep(0.02, 1.0, l)); // kuehle Schatten, warme Lichter
      col = 0.18 * pow(max(col, 0.0) / 0.18, vec3(1.08));                                   // Kontrast um Mittelgrau (HDR-sicher, vor Tone-Mapping)
      col = max(col * (1.0 + (fract(sin(dot(vUv * 913.7 + uTime, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.03), 0.0); // Filmkorn
      float v = smoothstep(0.95, 0.3, length(dir * vec2(1.0, 0.85)));
      col *= mix(1.0 - uVignette, 1.0, v);
      gl_FragColor = vec4(col, 1.0);
    }";
end;

procedure ClampSky(sky: JSky);
begin
  var m := JShaderMaterial(sky.material);
  m.fragmentShader := JsReplace(m.fragmentShader, 'gl_FragColor = vec4( texColor, 1.0 );', 'gl_FragColor = vec4( min( texColor, vec3( 2.2 ) ), 1.0 );');
end;

end.
