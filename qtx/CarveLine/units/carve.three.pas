unit carve.three;

// Bindungen an three.js r0.186.1 (+ Addons). three.js selbst bleibt JavaScript (ES-Modul vom CDN);
// index.html laedt es und legt THREE sowie die Addon-Klassen global ab (window.THREE, window.EffectComposer, ...).
// Deklariert ist nur, was das Spiel benutzt. Methoden, die in JS "this" zurueckgeben, sind fuer Verkettung typisiert.

interface

uses
  qtx.sysutils, carve.web;

const
  // Konstanten aus three.core.js (r186)
  PCFShadowMap = 1; PCFSoftShadowMap = 2;
  FrontSide = 0; BackSide = 1; DoubleSide = 2;
  NormalBlending = 1; AdditiveBlending = 2;
  NoToneMapping = 0; ACESFilmicToneMapping = 4;
  RepeatWrapping = 1000; ClampToEdgeWrapping = 1001;
  NearestFilter = 1003; LinearFilter = 1006; LinearMipmapLinearFilter = 1008;
  UnsignedShortType = 1012; UnsignedIntType = 1014; FloatType = 1015; HalfFloatType = 1016;
  RGBAFormat = 1023; DepthFormat = 1026;
  NoColorSpace = ''; SRGBColorSpace = 'srgb'; LinearSRGBColorSpace = 'srgb-linear';
  StaticDrawUsage = 35044; DynamicDrawUsage = 35048;

type
  JVector3 = class;
  JQuaternion = class;
  JMatrix4 = class;
  JEuler = class;
  JObject3D = class;
  JBufferAttribute = class;
  JCamera = class;

  JVector2 = class external 'THREE.Vector2'
  public
    x, y: Float;
    constructor Create; overload;
    constructor Create(ax, ay: Float); overload;
    function &set(ax, ay: Float): JVector2;
    function copy(v: JVector2): JVector2;
    function setScalar(s: Float): JVector2;
  end;

  JVector3 = class external 'THREE.Vector3'
  public
    x, y, z: Float;
    constructor Create; overload;
    constructor Create(ax, ay, az: Float); overload;
    function &set(ax, ay, az: Float): JVector3;
    function setScalar(s: Float): JVector3;
    function setX(v: Float): JVector3;
    function setY(v: Float): JVector3;
    function setZ(v: Float): JVector3;
    function clone: JVector3;
    function copy(v: JVector3): JVector3;
    function add(v: JVector3): JVector3;
    function addScalar(s: Float): JVector3;
    function addVectors(a, b: JVector3): JVector3;
    function addScaledVector(v: JVector3; s: Float): JVector3;
    function sub(v: JVector3): JVector3;
    function subVectors(a, b: JVector3): JVector3;
    function multiply(v: JVector3): JVector3;
    function multiplyScalar(s: Float): JVector3;
    function divideScalar(s: Float): JVector3;
    function applyQuaternion(q: JQuaternion): JVector3;
    function applyMatrix4(m: JMatrix4): JVector3;
    function applyAxisAngle(axis: JVector3; a: Float): JVector3;
    function transformDirection(m: JMatrix4): JVector3;
    function project(cam: JCamera): JVector3;
    function min(v: JVector3): JVector3;
    function max(v: JVector3): JVector3;
    function negate: JVector3;
    function dot(v: JVector3): Float;
    function lengthSq: Float;
    function length: Float;
    function normalize: JVector3;
    function setLength(l: Float): JVector3;
    function lerp(v: JVector3; t: Float): JVector3;
    function lerpVectors(a, b: JVector3; t: Float): JVector3;
    function cross(v: JVector3): JVector3;
    function crossVectors(a, b: JVector3): JVector3;
    function projectOnPlane(n: JVector3): JVector3;
    function angleTo(v: JVector3): Float;
    function distanceTo(v: JVector3): Float;
    function distanceToSquared(v: JVector3): Float;
    function setFromMatrixPosition(m: JMatrix4): JVector3;
    function setFromMatrixColumn(m: JMatrix4; i: Integer): JVector3;
    function fromBufferAttribute(a: JBufferAttribute; i: Integer): JVector3;
    function equals(v: JVector3): Boolean;
  end;

  JQuaternion = class external 'THREE.Quaternion'
  public
    x, y, z, w: Float;
    constructor Create; overload;
    constructor Create(ax, ay, az, aw: Float); overload;
    function &set(ax, ay, az, aw: Float): JQuaternion;
    function clone: JQuaternion;
    function copy(q: JQuaternion): JQuaternion;
    function identity: JQuaternion;
    function setFromAxisAngle(axis: JVector3; a: Float): JQuaternion;
    function setFromEuler(e: JEuler): JQuaternion;
    function setFromRotationMatrix(m: JMatrix4): JQuaternion;
    function setFromUnitVectors(a, b: JVector3): JQuaternion;
    function multiply(q: JQuaternion): JQuaternion;
    function premultiply(q: JQuaternion): JQuaternion;
    function multiplyQuaternions(a, b: JQuaternion): JQuaternion;
    function slerp(q: JQuaternion; t: Float): JQuaternion;
    function slerpQuaternions(a, b: JQuaternion; t: Float): JQuaternion;
    function invert: JQuaternion;
    function conjugate: JQuaternion;
    function normalize: JQuaternion;
    function angleTo(q: JQuaternion): Float;
    function dot(q: JQuaternion): Float;
  end;

  JEuler = class external 'THREE.Euler'
  public
    x, y, z: Float;
    order: String;
    constructor Create; overload;
    constructor Create(ax, ay, az: Float); overload;
    constructor Create(ax, ay, az: Float; aorder: String); overload;
    function &set(ax, ay, az: Float): JEuler; overload;
    function &set(ax, ay, az: Float; aorder: String): JEuler; overload;
    function setFromQuaternion(q: JQuaternion): JEuler; overload;
    function setFromQuaternion(q: JQuaternion; aorder: String): JEuler; overload;
  end;

  JMatrix4 = class external 'THREE.Matrix4'
  public
    elements: JFloat32Array;
    constructor Create;
    function clone: JMatrix4;
    function copy(m: JMatrix4): JMatrix4;
    function identity: JMatrix4;
    function compose(p: JVector3; q: JQuaternion; s: JVector3): JMatrix4;
    procedure decompose(p: JVector3; q: JQuaternion; s: JVector3);
    function makeBasis(x, y, z: JVector3): JMatrix4;
    function setPosition(v: JVector3): JMatrix4; overload;
    function setPosition(x, y, z: Float): JMatrix4; overload;
    function makeTranslation(x, y, z: Float): JMatrix4;
    function makeScale(x, y, z: Float): JMatrix4;
    function makeRotationX(a: Float): JMatrix4;
    function makeRotationY(a: Float): JMatrix4;
    function makeRotationZ(a: Float): JMatrix4;
    function makeRotationFromEuler(e: JEuler): JMatrix4;
    function makeRotationFromQuaternion(q: JQuaternion): JMatrix4;
    function multiply(m: JMatrix4): JMatrix4;
    function premultiply(m: JMatrix4): JMatrix4;
    function multiplyMatrices(a, b: JMatrix4): JMatrix4;
    function invert: JMatrix4;
    function lookAt(eye, target, up: JVector3): JMatrix4;
  end;

  JColor = class external 'THREE.Color'
  public
    r, g, b: Float;
    constructor Create; overload;
    constructor Create(hex: Integer); overload;
    constructor Create(css: String); overload;
    constructor Create(ar, ag, ab: Float); overload;
    function &set(hex: Integer): JColor; overload;
    function &set(css: String): JColor; overload;
    function &set(c: JColor): JColor; overload;
    function setHex(hex: Integer): JColor;
    function setRGB(ar, ag, ab: Float): JColor;
    function setHSL(h, s, l: Float): JColor;
    function setStyle(css: String): JColor;
    function setScalar(s: Float): JColor;
    function clone: JColor;
    function copy(c: JColor): JColor;
    function lerp(c: JColor; t: Float): JColor;
    function lerpColors(a, b: JColor; t: Float): JColor;
    function multiply(c: JColor): JColor;
    function multiplyScalar(s: Float): JColor;
    function add(c: JColor): JColor;
    function offsetHSL(h, s, l: Float): JColor;
    function getHex: Integer;
    function getHexString: String;
    function getStyle: String;
    function convertSRGBToLinear: JColor;
    function convertLinearToSRGB: JColor;
  end;

  JLayers = class external 'THREE.Layers'
  public
    procedure &set(ch: Integer);
    procedure enable(ch: Integer);
  end;

  TObject3DCallback = procedure(o: JObject3D);

  JObject3D = class external 'THREE.Object3D'
  public
    name: String;
    position: JVector3;
    quaternion: JQuaternion;
    rotation: JEuler;
    scale: JVector3;
    up: JVector3;
    matrix: JMatrix4;
    matrixWorld: JMatrix4;
    matrixAutoUpdate: Boolean;
    matrixWorldNeedsUpdate: Boolean;
    visible: Boolean;
    castShadow, receiveShadow: Boolean;
    frustumCulled: Boolean;
    renderOrder: Integer;
    parent: JObject3D;
    children: array of JObject3D;
    userData: Variant;
    layers: JLayers;
    onBeforeRender: Variant;
    constructor Create;
    function add(o: JObject3D): JObject3D;
    function remove(o: JObject3D): JObject3D;
    procedure lookAt(v: JVector3); overload;
    procedure lookAt(x, y, z: Float); overload;
    procedure updateMatrix;
    procedure updateMatrixWorld; overload;
    procedure updateMatrixWorld(force: Boolean); overload;
    procedure traverse(cb: TObject3DCallback);
    function getWorldPosition(v: JVector3): JVector3;
    function getWorldQuaternion(q: JQuaternion): JQuaternion;
    function getWorldDirection(v: JVector3): JVector3;
    function rotateX(a: Float): JObject3D;
    function rotateY(a: Float): JObject3D;
    function rotateZ(a: Float): JObject3D;
  end;

  JGroup = class external 'THREE.Group' (JObject3D)
  public
    constructor Create;
  end;

  // ---------- Texturen ----------
  JTexture = class external 'THREE.Texture'
  public
    image: Variant;
    colorSpace: String;
    wrapS, wrapT: Integer;
    magFilter, minFilter: Integer;
    anisotropy: Integer;
    generateMipmaps: Boolean;
    flipY: Boolean;
    &repeat: JVector2;
    offset: JVector2;
    needsUpdate: Boolean;
    mapping: Integer;
    procedure dispose;
  end;

  JCanvasTexture = class external 'THREE.CanvasTexture' (JTexture)
  public
    constructor Create(c: JCanvas);
  end;

  JDataTexture = class external 'THREE.DataTexture' (JTexture)
  public
    constructor Create(data: Variant; w, h: Integer); overload;
    constructor Create(data: Variant; w, h, format, typ: Integer); overload;
  end;

  JDepthTexture = class external 'THREE.DepthTexture' (JTexture)
  public
    &type: Integer;
    format: Integer;
    constructor Create(w, h: Integer); overload;
    constructor Create(w, h, typ: Integer); overload;
  end;

  // ---------- Geometrie ----------
  JBufferAttribute = class external 'THREE.BufferAttribute'
  public
    &array: JFloat32Array;
    itemSize: Integer;
    count: Integer;
    needsUpdate: Boolean;
    constructor Create(arr: JTypedArray; itemSize: Integer); overload;
    constructor Create(arr: JTypedArray; itemSize: Integer; normalized: Boolean); overload;
    function setUsage(u: Integer): JBufferAttribute;
    function getX(i: Integer): Float;
    function getY(i: Integer): Float;
    function getZ(i: Integer): Float;
    function getW(i: Integer): Float;
    procedure setX(i: Integer; v: Float);
    procedure setY(i: Integer; v: Float);
    procedure setZ(i: Integer; v: Float);
    procedure setXY(i: Integer; x, y: Float);
    procedure setXYZ(i: Integer; x, y, z: Float);
    procedure setXYZW(i: Integer; x, y, z, w: Float);
    procedure addUpdateRange(start, count: Integer);
    procedure clearUpdateRanges;
  end;

  JFloat32BufferAttribute = class external 'THREE.Float32BufferAttribute' (JBufferAttribute)
  public
    constructor Create(arr: array of Float; itemSize: Integer); overload;
    constructor Create(arr: JFloat32Array; itemSize: Integer); overload;
  end;

  JInstancedBufferAttribute = class external 'THREE.InstancedBufferAttribute' (JBufferAttribute)
  public
    constructor Create(arr: JTypedArray; itemSize: Integer);
  end;

  JBufferGeometryAttributes = class external
  public
    position, normal, uv, color, groom: JBufferAttribute;
  end;

  JSphere = class external 'THREE.Sphere'
  public
    center: JVector3;
    radius: Float;
    function clone: JSphere;
  end;

  JBufferGeometry = class external 'THREE.BufferGeometry'
  public
    attributes: JBufferGeometryAttributes;
    index: JBufferAttribute;
    boundingSphere: JSphere;
    drawRange: Variant;
    userData: Variant;
    constructor Create;
    function setAttribute(n: String; a: JBufferAttribute): JBufferGeometry;
    function getAttribute(n: String): JBufferAttribute;
    function deleteAttribute(n: String): JBufferGeometry;
    function setIndex(a: JBufferAttribute): JBufferGeometry; overload;
    function setIndex(a: array of Integer): JBufferGeometry; overload;
    procedure setDrawRange(start, count: Integer);
    function toNonIndexed: JBufferGeometry;
    procedure computeVertexNormals;
    procedure computeBoundingSphere;
    procedure computeBoundingBox;
    function translate(x, y, z: Float): JBufferGeometry;
    function scale(x, y, z: Float): JBufferGeometry;
    function rotateX(a: Float): JBufferGeometry;
    function rotateY(a: Float): JBufferGeometry;
    function rotateZ(a: Float): JBufferGeometry;
    function applyMatrix4(m: JMatrix4): JBufferGeometry;
    function applyQuaternion(q: JQuaternion): JBufferGeometry;
    function clone: JBufferGeometry;
    procedure dispose;
  end;

  JBoxGeometry = class external 'THREE.BoxGeometry' (JBufferGeometry)
  public
    constructor Create(w, h, d: Float); overload;
    constructor Create(w, h, d: Float; ws, hs, ds: Integer); overload;
  end;

  JCylinderGeometry = class external 'THREE.CylinderGeometry' (JBufferGeometry)
  public
    constructor Create(rTop, rBottom, h: Float; radial: Integer = 32; hSeg: Integer = 1; openEnded: Boolean = False;
      thetaStart: Float = 0; thetaLength: Float = 6.283185307179586);
  end;

  JConeGeometry = class external 'THREE.ConeGeometry' (JBufferGeometry)
  public
    constructor Create(r, h: Float; radial: Integer = 32; hSeg: Integer = 1; openEnded: Boolean = False;
      thetaStart: Float = 0; thetaLength: Float = 6.283185307179586);
  end;

  JSphereGeometry = class external 'THREE.SphereGeometry' (JBufferGeometry)
  public
    constructor Create(r: Float; wSeg: Integer = 32; hSeg: Integer = 16; phiStart: Float = 0; phiLength: Float = 6.283185307179586;
      thetaStart: Float = 0; thetaLength: Float = 3.141592653589793);
  end;

  JCapsuleGeometry = class external 'THREE.CapsuleGeometry' (JBufferGeometry)
  public
    constructor Create(r, len: Float; capSeg: Integer = 4; radialSeg: Integer = 8; hSeg: Integer = 1);
  end;

  JPlaneGeometry = class external 'THREE.PlaneGeometry' (JBufferGeometry)
  public
    constructor Create(w, h: Float; ws: Integer = 1; hs: Integer = 1);
  end;

  JCircleGeometry = class external 'THREE.CircleGeometry' (JBufferGeometry)
  public
    constructor Create(r: Float; seg: Integer = 32; thetaStart: Float = 0; thetaLength: Float = 6.283185307179586);
  end;

  JIcosahedronGeometry = class external 'THREE.IcosahedronGeometry' (JBufferGeometry)
  public
    constructor Create(r: Float = 1; detail: Integer = 0);
  end;

  JTorusGeometry = class external 'THREE.TorusGeometry' (JBufferGeometry)
  public
    constructor Create(r: Float = 1; tube: Float = 0.4; radialSeg: Integer = 12; tubularSeg: Integer = 48; arc: Float = 6.283185307179586);
  end;

  JShape = class external 'THREE.Shape'
  public
    constructor Create;
    function moveTo(x, y: Float): JShape;
    function lineTo(x, y: Float): JShape;
    function quadraticCurveTo(cx, cy, x, y: Float): JShape;
    function absarc(x, y, r, a0, a1: Float; cw: Boolean): JShape;
  end;

  JExtrudeGeometry = class external 'THREE.ExtrudeGeometry' (JBufferGeometry)
  public
    constructor Create(shape: JShape; opts: Variant);
  end;

  // ---------- Materialien ----------
  TShaderHook = procedure(sh: Variant);

  JMaterial = class external 'THREE.Material'
  public
    transparent: Boolean;
    opacity: Float;
    depthWrite, depthTest: Boolean;
    side: Integer;
    blending: Integer;
    alphaTest: Float;
    vertexColors: Boolean;
    toneMapped: Boolean;
    fog: Boolean;
    visible: Boolean;
    polygonOffset: Boolean;
    polygonOffsetFactor, polygonOffsetUnits: Float;
    needsUpdate: Boolean;
    onBeforeCompile: TShaderHook;
    userData: Variant;
    defines: Variant;
    function clone: JMaterial;
    function customProgramCacheKey: String;
    procedure dispose;
  end;

  JMeshStandardMaterial = class external 'THREE.MeshStandardMaterial' (JMaterial)
  public
    color: JColor;
    emissive: JColor;
    emissiveIntensity: Float;
    roughness, metalness: Float;
    map: JTexture;
    normalMap: JTexture;
    normalScale: JVector2;
    envMapIntensity: Float;
    flatShading: Boolean;
    constructor Create; overload;
    constructor Create(params: Variant); overload;
  end;

  JMeshPhysicalMaterial = class external 'THREE.MeshPhysicalMaterial' (JMeshStandardMaterial)
  public
    clearcoat, clearcoatRoughness, sheen, sheenRoughness: Float;
    sheenColor: JColor;
    constructor Create; overload;
    constructor Create(params: Variant); overload;
  end;

  JMeshBasicMaterial = class external 'THREE.MeshBasicMaterial' (JMaterial)
  public
    color: JColor;
    map: JTexture;
    constructor Create; overload;
    constructor Create(params: Variant); overload;
  end;

  JLineBasicMaterial = class external 'THREE.LineBasicMaterial' (JMaterial)
  public
    color: JColor;
    constructor Create(params: Variant);
  end;

  JPointsMaterial = class external 'THREE.PointsMaterial' (JMaterial)
  public
    color: JColor;
    size: Float;
    map: JTexture;
    sizeAttenuation: Boolean;
    constructor Create(params: Variant);
  end;

  JShaderMaterial = class external 'THREE.ShaderMaterial' (JMaterial)
  public
    uniforms: Variant;
    vertexShader, fragmentShader: String;
    constructor Create(params: Variant);
  end;

  // ---------- Objekte ----------
  JMesh = class external 'THREE.Mesh' (JObject3D)
  public
    geometry: JBufferGeometry;
    material: JMaterial;
    constructor Create(g: JBufferGeometry; m: JMaterial);
  end;

  JInstancedMesh = class external 'THREE.InstancedMesh' (JMesh)
  public
    count: Integer;
    instanceMatrix: JInstancedBufferAttribute;
    instanceColor: JInstancedBufferAttribute;
    boundingSphere: JSphere;
    constructor Create(g: JBufferGeometry; m: JMaterial; count: Integer);
    procedure setMatrixAt(i: Integer; m: JMatrix4);
    procedure getMatrixAt(i: Integer; m: JMatrix4);
    procedure setColorAt(i: Integer; c: JColor);
    procedure computeBoundingSphere;
  end;

  JLineSegments = class external 'THREE.LineSegments' (JObject3D)
  public
    geometry: JBufferGeometry;
    material: JMaterial;
    constructor Create(g: JBufferGeometry; m: JMaterial);
  end;

  JPoints = class external 'THREE.Points' (JObject3D)
  public
    geometry: JBufferGeometry;
    material: JMaterial;
    constructor Create(g: JBufferGeometry; m: JMaterial);
  end;

  // ---------- Kamera, Licht, Szene ----------
  JCamera = class external 'THREE.Camera' (JObject3D)
  public
    projectionMatrix, projectionMatrixInverse, matrixWorldInverse: JMatrix4;
  end;

  JPerspectiveCamera = class external 'THREE.PerspectiveCamera' (JCamera)
  public
    fov, aspect, near, far: Float;
    constructor Create(fov, aspect, near, far: Float);
    procedure updateProjectionMatrix;
  end;

  JOrthographicCamera = class external 'THREE.OrthographicCamera' (JCamera)
  public
    left, right, top, bottom, near, far: Float;
    procedure updateProjectionMatrix;
  end;

  JLightShadow = class external 'THREE.LightShadow'
  public
    camera: JOrthographicCamera;
    mapSize: JVector2;
    bias, normalBias, radius: Float;
    map: Variant;
    needsUpdate: Boolean;
  end;

  JLight = class external 'THREE.Light' (JObject3D)
  public
    color: JColor;
    intensity: Float;
  end;

  JDirectionalLight = class external 'THREE.DirectionalLight' (JLight)
  public
    target: JObject3D;
    shadow: JLightShadow;
    constructor Create(color: Integer; intensity: Float);
  end;

  JHemisphereLight = class external 'THREE.HemisphereLight' (JLight)
  public
    groundColor: JColor;
    constructor Create(sky, ground: Integer; intensity: Float);
  end;

  JFogBase = class external 'THREE.Fog'
  public
    color: JColor;
  end;

  JFogExp2 = class external 'THREE.FogExp2' (JFogBase)
  public
    density: Float;
    constructor Create(color: Integer; density: Float);
  end;

  JScene = class external 'THREE.Scene' (JObject3D)
  public
    background: Variant;
    environment: JTexture;
    fog: JFogBase;
    constructor Create;
  end;

  // ---------- Renderer ----------
  JWebGLRenderTarget = class external 'THREE.WebGLRenderTarget'
  public
    texture: JTexture;
    depthTexture: JDepthTexture;
    width, height: Integer;
    samples: Integer;
    procedure setSize(w, h: Integer);
    procedure dispose;
  end;

  JShadowMapSettings = class external
  public
    enabled: Boolean;
    &type: Integer;
    autoUpdate: Boolean;
    needsUpdate: Boolean;
  end;

  JRenderInfo = class external
  public
    render: Variant;
    memory: Variant;
  end;

  JWebGLRenderer = class external 'THREE.WebGLRenderer'
  public
    domElement: JCanvas;
    shadowMap: JShadowMapSettings;
    toneMapping: Integer;
    toneMappingExposure: Float;
    outputColorSpace: String;
    info: JRenderInfo;
    autoClear: Boolean;
    capabilities: Variant;
    constructor Create(params: Variant);
    procedure setPixelRatio(r: Float);
    function getPixelRatio: Float;
    procedure setSize(w, h: Integer); overload;
    procedure setSize(w, h: Integer; updateStyle: Boolean); overload;
    procedure render(scene: JObject3D; cam: JCamera);
    procedure compile(scene: JObject3D; cam: JCamera);
    procedure setRenderTarget(rt: JWebGLRenderTarget);
    procedure setClearColor(c: Integer; a: Float);
    procedure dispose;
  end;

  JPMREMGenerator = class external 'THREE.PMREMGenerator'
  public
    constructor Create(r: JWebGLRenderer);
    function fromScene(s: JScene; sigma: Float): JWebGLRenderTarget; overload;
    function fromScene(s: JScene; sigma, near, far: Float): JWebGLRenderTarget; overload;
    procedure compileEquirectangularShader;
    procedure dispose;
  end;

  // ---------- Addons (global von index.html bereitgestellt) ----------
  JPass = class external 'Pass'
  public
    enabled: Boolean;
    needsSwap: Boolean;
    renderToScreen: Boolean;
    uniforms: Variant;
    material: JMaterial;
    procedure setSize(w, h: Integer);
    render: Variant;
  end;

  JRenderPass = class external 'RenderPass' (JPass)
  public
    constructor Create(scene: JScene; cam: JCamera);
  end;

  JShaderPass = class external 'ShaderPass' (JPass)
  public
    constructor Create(shader: Variant);
  end;

  JUnrealBloomPass = class external 'UnrealBloomPass' (JPass)
  public
    strength, radius, threshold: Float;
    constructor Create(res: JVector2; strength, radius, threshold: Float);
  end;

  JSMAAPass = class external 'SMAAPass' (JPass)
  public
    constructor Create; overload;
    constructor Create(w, h: Integer); overload;
  end;

  JOutputPass = class external 'OutputPass' (JPass)
  public
    constructor Create;
  end;

  JEffectComposer = class external 'EffectComposer'
  public
    renderTarget1, renderTarget2: JWebGLRenderTarget;
    passes: array of JPass;
    constructor Create(r: JWebGLRenderer); overload;
    constructor Create(r: JWebGLRenderer; rt: JWebGLRenderTarget); overload;
    procedure addPass(p: JPass);
    procedure render; overload;
    procedure render(dt: Float); overload;
    procedure setSize(w, h: Integer);
    procedure setPixelRatio(r: Float);
    procedure dispose;
  end;

  JSky = class external 'Sky' (JMesh)
  public
    constructor Create;
  end;

  JShaderChunkLib = class external
  public
    lights_physical_pars_fragment: String;
    fog_pars_vertex, fog_vertex, fog_pars_fragment, fog_fragment: String;
  end;

  JThreeNS = class external
  public
    ShaderChunk: JShaderChunkLib;
    UniformsLib: Variant;
    ShaderLib: Variant;
    REVISION: String;
  end;

var THREE external 'THREE': JThreeNS;

function mergeGeometries(parts: array of JBufferGeometry): JBufferGeometry; overload; external 'mergeGeometries';
function mergeGeometries(parts: array of JBufferGeometry; useGroups: Boolean): JBufferGeometry; overload; external 'mergeGeometries';

// Uniform-Objekt { value: v }
function Uniform(v: Variant): Variant;

implementation

function Uniform(v: Variant): Variant;
begin
  Result := new JObject;
  Result.value := v;
end;

end.
