unit carve.web;

// Schlanke Bindungen an die Browser-APIs, die das Spiel braucht (DOM, Events, Storage, Canvas 2D, Web Audio, Gamepad).
// Bewusst eigenstaendig statt qtx.dom.*: nur das Noetige, 1:1 auf die JS-Namen abgebildet.

interface

uses
  qtx.sysutils;

type
  JDOMRect = class external 'DOMRect'
  public
    left, top, right, bottom, width, height, x, y: Float;
  end;

  JClassList = class external 'DOMTokenList'
  public
    procedure add(c: String);
    procedure remove(c: String);
    function toggle(c: String): Boolean; overload;
    function toggle(c: String; force: Boolean): Boolean; overload;
    function contains(c: String): Boolean;
  end;

  JEvent = class;
  TEventHandler = procedure(e: JEvent);

  JEventTarget = class external 'EventTarget'
  public
    procedure addEventListener(typ: String; cb: TEventHandler); overload;
    procedure addEventListener(typ: String; cb: TEventHandler; opts: Variant); overload;
    procedure removeEventListener(typ: String; cb: TEventHandler);
  end;

  JElement = class external 'HTMLElement' (JEventTarget)
  public
    id: String;
    className: String;
    textContent: String;
    innerHTML: String;
    style: Variant;
    dataset: Variant;
    classList: JClassList;
    offsetWidth, offsetHeight, clientWidth, clientHeight: Integer;
    parentElement: JElement;
    children: array of JElement;
    firstElementChild, lastElementChild: JElement;
    onclick, oninput: TEventHandler;
    function getBoundingClientRect: JDOMRect;
    function appendChild(e: JElement): JElement;
    procedure remove;
    function querySelector(sel: String): JElement;
    function querySelectorAll(sel: String): array of JElement;
    procedure setAttribute(n, v: String);
    function getAttribute(n: String): String;
    procedure setPointerCapture(id: Integer);
    procedure releasePointerCapture(id: Integer);
    function hasPointerCapture(id: Integer): Boolean;
    procedure focus;
    procedure blur;
  end;

  JInputElement = class external 'HTMLInputElement' (JElement)
  public
    value: String;
    valueAsNumber: Float;
  end;

  JCanvas2D = class;

  // Uint8ClampedArray mit Float-Zugriff (JS rundet/klemmt beim Schreiben selbst)
  JPixelArray = class external 'Uint8ClampedArray'
  public
    length: Integer;
    function GetItem(i: Integer): Float; external array;
    procedure SetItem(i: Integer; v: Float); external array;
    property Items[i: Integer]: Float read GetItem write SetItem; default;
  end;

  JImageData = class external 'ImageData'
  public
    width, height: Integer;
    data: JPixelArray;
  end;

  JCanvasGradient = class external 'CanvasGradient'
  public
    procedure addColorStop(o: Float; c: String);
  end;

  JCanvas = class external 'HTMLCanvasElement' (JElement)
  public
    width, height: Integer;
    function getContext(kind: String): JCanvas2D;
  end;

  JCanvas2D = class external 'CanvasRenderingContext2D'
  public
    fillStyle, strokeStyle: Variant;
    lineWidth, globalAlpha: Float;
    font, textAlign, textBaseline, lineCap, lineJoin, globalCompositeOperation, filter: String;
    procedure fillRect(x, y, w, h: Float);
    procedure clearRect(x, y, w, h: Float);
    procedure strokeRect(x, y, w, h: Float);
    procedure beginPath;
    procedure closePath;
    procedure moveTo(x, y: Float);
    procedure lineTo(x, y: Float);
    procedure quadraticCurveTo(cx, cy, x, y: Float);
    procedure bezierCurveTo(c1x, c1y, c2x, c2y, x, y: Float);
    procedure arc(x, y, r, a0, a1: Float); overload;
    procedure arc(x, y, r, a0, a1: Float; ccw: Boolean); overload;
    procedure ellipse(x, y, rx, ry, rot, a0, a1: Float);
    procedure rect(x, y, w, h: Float);
    procedure fill;
    procedure stroke;
    procedure fillText(t: String; x, y: Float);
    procedure save;
    procedure restore;
    procedure translate(x, y: Float);
    procedure rotate(a: Float);
    procedure scale(x, y: Float);
    procedure setTransform(a, b, c, d, e, f: Float);
    procedure drawImage(img: JCanvas; x, y: Float); overload;
    procedure drawImage(img: JCanvas; x, y, w, h: Float); overload;
    function createImageData(w, h: Integer): JImageData;
    function getImageData(x, y, w, h: Integer): JImageData;
    procedure putImageData(d: JImageData; x, y: Integer);
    function createRadialGradient(x0, y0, r0, x1, y1, r1: Float): JCanvasGradient;
    function createLinearGradient(x0, y0, x1, y1: Float): JCanvasGradient;
  end;

  // Ein Event-Typ fuer alles (Keyboard, Pointer, Touch, Resize ...): JS ist hier ohnehin duck-typed
  JEvent = class external 'Event'
  public
    &type: String;
    target: JElement;
    key, code: String;
    &repeat: Boolean;
    pointerId: Integer;
    pointerType: String;
    clientX, clientY: Float;
    button: Integer;
    isTrusted: Boolean;
    message, filename: String;
    lineno, colno: Integer;
    error: Variant;
    reason: Variant;
    gamepad: Variant;
    procedure preventDefault;
    procedure stopPropagation;
    function prompt: Variant;
  end;


  JDocument = class external 'Document' (JEventTarget)
  public
    body: JElement;
    documentElement: JElement;
    hidden: Boolean;
    visibilityState: String;
    fullscreenElement: JElement;
    function getElementById(id: String): JElement;
    function createElement(tag: String): JElement;
    function querySelector(sel: String): JElement;
    function querySelectorAll(sel: String): array of JElement;
    procedure exitFullscreen;
  end;

  JMediaQueryList = class external 'MediaQueryList'
  public
    matches: Boolean;
  end;

  JStorage = class external 'Storage'
  public
    function getItem(k: String): Variant;
    procedure setItem(k, v: String);
    procedure removeItem(k: String);
  end;

  JPerformance = class external 'Performance'
  public
    function now: Float;
  end;

  JGamepadButton = class external 'GamepadButton'
  public
    pressed: Boolean;
    value: Float;
  end;

  JGamepad = class external 'Gamepad'
  public
    connected: Boolean;
    axes: array of Float;
    buttons: array of JGamepadButton;
    mapping: String;
  end;

  JServiceWorkerContainer = class external 'ServiceWorkerContainer'
  public
    function register(url: String): Variant;
  end;

  JNavigator = class external 'Navigator'
  public
    maxTouchPoints: Integer;
    userAgent: String;
    serviceWorker: JServiceWorkerContainer;
    function getGamepads: array of JGamepad;
  end;

  JLocation = class external 'Location'
  public
    href, protocol, hostname, search: String;
    procedure reload;
  end;

  TFrameCallback = procedure(t: Float);

  JWindow = class external 'Window' (JEventTarget)
  public
    innerWidth, innerHeight: Integer;
    devicePixelRatio: Float;
    location: JLocation;
    function matchMedia(q: String): JMediaQueryList;
  end;

  JJSON = class external 'JSON'
  public
    function parse(s: String): Variant;
    function stringify(v: Variant): String;
  end;

  // ---------- Web Audio ----------
  JAudioParam = class external 'AudioParam'
  public
    value: Float;
    procedure setValueAtTime(v, t: Float);
    procedure linearRampToValueAtTime(v, t: Float);
    procedure exponentialRampToValueAtTime(v, t: Float);
    procedure setTargetAtTime(v, t, tau: Float);
    procedure cancelScheduledValues(t: Float);
  end;

  JAudioNode = class external 'AudioNode'
  public
    function connect(n: JAudioNode): JAudioNode; overload;
    procedure connect(p: JAudioParam); overload;
    procedure disconnect; overload;
    procedure disconnect(n: JAudioNode); overload;
  end;

  JAudioScheduledSourceNode = class external 'AudioScheduledSourceNode' (JAudioNode)
  public
    onended: procedure;
    procedure start; overload;
    procedure start(t: Float); overload;
    procedure start(t, offset: Float); overload;
    procedure stop; overload;
    procedure stop(t: Float); overload;
  end;

  JOscillatorNode = class external 'OscillatorNode' (JAudioScheduledSourceNode)
  public
    &type: String;
    frequency: JAudioParam;
    detune: JAudioParam;
  end;

  JAudioBuffer = class external 'AudioBuffer'
  public
    duration: Float;
    length: Integer;
    sampleRate: Float;
    numberOfChannels: Integer;
    function getChannelData(ch: Integer): JFloat32Array;
  end;

  JAudioBufferSourceNode = class external 'AudioBufferSourceNode' (JAudioScheduledSourceNode)
  public
    buffer: JAudioBuffer;
    loop: Boolean;
    playbackRate: JAudioParam;
  end;

  JGainNode = class external 'GainNode' (JAudioNode)
  public
    gain: JAudioParam;
  end;

  JBiquadFilterNode = class external 'BiquadFilterNode' (JAudioNode)
  public
    &type: String;
    frequency: JAudioParam;
    Q: JAudioParam;
    gain: JAudioParam;
  end;

  JStereoPannerNode = class external 'StereoPannerNode' (JAudioNode)
  public
    pan: JAudioParam;
  end;

  JDynamicsCompressorNode = class external 'DynamicsCompressorNode' (JAudioNode)
  public
    threshold, knee, ratio, attack, release: JAudioParam;
  end;

  JDelayNode = class external 'DelayNode' (JAudioNode)
  public
    delayTime: JAudioParam;
  end;

  JConvolverNode = class external 'ConvolverNode' (JAudioNode)
  public
    buffer: JAudioBuffer;
  end;

  JWaveShaperNode = class external 'WaveShaperNode' (JAudioNode)
  public
    curve: JFloat32Array;
    oversample: String;
  end;

  JAudioContext = class external 'AudioContext'
  public
    currentTime: Float;
    sampleRate: Float;
    state: String;
    destination: JAudioNode;
    constructor Create;
    function resume: Variant;
    function suspend: Variant;
    function createOscillator: JOscillatorNode;
    function createGain: JGainNode;
    function createBiquadFilter: JBiquadFilterNode;
    function createBufferSource: JAudioBufferSourceNode;
    function createBuffer(ch, len: Integer; rate: Float): JAudioBuffer;
    function createStereoPanner: JStereoPannerNode;
    function createDynamicsCompressor: JDynamicsCompressorNode;
    function createDelay(max: Float): JDelayNode;
    function createConvolver: JConvolverNode;
    function createWaveShaper: JWaveShaperNode;
  end;

var document external 'document': JDocument;
var window external 'window': JWindow;
var navigator external 'navigator': JNavigator;
var localStorage external 'localStorage': JStorage;
var performance external 'performance': JPerformance;
var JSON external 'JSON': JJSON;

function requestAnimationFrame(cb: TFrameCallback): Integer; external 'requestAnimationFrame';
function setTimeout(cb: procedure; ms: Integer): Integer; external 'setTimeout';
procedure consoleLog(v: Variant); external 'console.log';
procedure consoleWarn(v: Variant); external 'console.warn';
function imul(a, b: Integer): Integer; external 'Math.imul';
function IsFiniteF(v: Float): Boolean; external 'Number.isFinite';

// Kurzform fuer document.getElementById
function El(id: String): JElement;
// Zahl mit fester Nachkommastellenzahl, immer mit Punkt (Number.toFixed; Format() waere locale-abhaengig)
function ToFixed(v: Float; digits: Integer): String;
// JS-Wahrheitswert eines Variants (undefined/null/0/'' => false)
function Truthy(v: Variant): Boolean;
function IsUndef(v: Variant): Boolean;
function NewAudioContext: JAudioContext;
// String.prototype.replace mit String-Muster: ersetzt nur das erste Vorkommen (wie im Original fuer Shader-Patches)
function JsReplace(s, pattern, repl: String): String;
function JsIncludes(s, pattern: String): Boolean;
// Zahl -> String wie in JS (String(x), immer mit Punkt)
function NumStr(v: Float): String;
// Variant-Objekt als Woerterbuch: v[key]
function VGet(o: Variant; key: String): Variant;
procedure VSet(o: Variant; key: String; val: Variant);
function NewDict: Variant;
// void el.offsetWidth: Layout erzwingen (CSS-Transition neu starten)
procedure ForceReflow(e: JElement);
// Zeichen per String.fromCharCode. Noetig fuer #$80..#$FF (·, ü, ß, °): der Quartex-Compiler gibt diese mit OptimizeForSize=1
// als Ersatzzeichen U+FFFD aus; Zeichen ab #$100 (★) schreibt er korrekt als \uXXXX.
function UC(code: Integer): String;
// typeof v
function JsTypeOf(v: Variant): String;
// Farbe als CSS-Hex ohne '#': h.toString(16).padStart(6, '0')
function HexColor(h: Integer): String;

implementation

function UC(code: Integer): String;
begin
  asm @Result = String.fromCharCode(@code); end;
end;

function JsTypeOf(v: Variant): String;
begin
  asm @Result = typeof (@v); end;
end;

function HexColor(h: Integer): String;
begin
  asm @Result = (@h).toString(16).padStart(6, '0'); end;
end;

procedure ForceReflow(e: JElement);
begin
  asm void (@e).offsetWidth; end;
end;

function NumStr(v: Float): String;
begin
  asm @Result = String(@v); end;
end;

function VGet(o: Variant; key: String): Variant;
begin
  asm @Result = (@o)[@key]; end;
end;

procedure VSet(o: Variant; key: String; val: Variant);
begin
  asm (@o)[@key] = @val; end;
end;

function NewDict: Variant;
begin
  asm @Result = Object.create(null); end;
end;

function JsReplace(s, pattern, repl: String): String;
begin
  asm @Result = (@s).replace(@pattern, function () { return @repl; }); end;
end;

function JsIncludes(s, pattern: String): Boolean;
begin
  asm @Result = (@s).includes(@pattern); end;
end;

function El(id: String): JElement;
begin
  Result := document.getElementById(id);
end;

function ToFixed(v: Float; digits: Integer): String;
begin
  asm @Result = (@v).toFixed(@digits); end;
end;

function Truthy(v: Variant): Boolean;
begin
  asm @Result = !!(@v); end;
end;

function IsUndef(v: Variant): Boolean;
begin
  asm @Result = (@v) === undefined || (@v) === null; end;
end;

function NewAudioContext: JAudioContext;
begin
  asm @Result = new (window.AudioContext || window.webkitAudioContext)(); end;
end;

end.
