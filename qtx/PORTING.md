# CARVE LINE: Porting Log (JavaScript → Quartex Pascal)

> **Note:** The original JavaScript game was built entirely by **Claude Opus via Claude Code**, driven by a conversation held **in German**. That's why the game's UI text and the code comments are German. This log is in English. It documents how the finished JS game was ported to **Quartex Pascal (QTX)**, again by Claude Opus through Claude Code, using the Quartex Pascal IDE's MCP server.

## Goal

"A nice project in JS, then port it to pure QTX." All of the game logic becomes Object Pascal and is compiled to JavaScript by the Quartex Pascal compiler (DWScript JS codegen). That covers physics, animation, world generation, AI, HUD, audio and menus.

Only these parts stay outside Pascal:

| Stays external | Why |
|---|---|
| **three.js r0.186.1** (+ addons: EffectComposer, RenderPass, UnrealBloomPass, SMAAPass, ShaderPass, OutputPass, BufferGeometryUtils) | A third-party WebGL library, used through typed `external` class bindings, the same way a Delphi app uses the Win32 API. |
| **GLSL shader source** | GPU code. It lives in Pascal string constants, but it is GLSL, not Pascal. |
| **HTML markup + CSS** | The static page skeleton (HUD panels, menus, touch controls). All behaviour behind it is Pascal. |

## Environment

- Quartex Pascal IDE 1.2.0.1 ("Kailash") with its MCP server on `http://localhost:3030/mcp`.
- The MCP server was not registered in Claude Code. A tiny Python JSON-RPC client (`initialize` → `Mcp-Session-Id` → `tools/call`) talked to it: `set_file` mirrored the sources into the IDE, `compile` built them, and `create_project` created the project.
- Project: `qtx/CarveLine/`, created from the IDE template **Simple2D**. The template form and the widget framework were removed; `app.entrypoint.pas` starts the game directly.
- Build output: `qtx/CarveLine/index.js`, loaded by the hand-written `qtx/CarveLine/index.html`.

## Step 1: Probing the toolchain

Before porting any code, small probe programs checked how DWScript's JS codegen handles the constructs the game needs:

| Construct | Result |
|---|---|
| `JVector3 = class external 'THREE.Vector3'` | `new JVector3(1,2,3)` → `new THREE.Vector3(1,2,3)`; methods map 1:1, so chaining works (`v.set(..).normalize`). |
| `var document external 'document': JDocument;` | Direct access to JS globals, no wrapper. |
| `function imul(a, b: Integer): Integer; external 'Math.imul';` | External functions map to any JS function. |
| `Variant` member access (`v.foo.bar := 1`) | Emitted as plain JS property access. Useful for shader hooks (`shader.uniforms.x := ...`). |
| Anonymous classes `class x := 1.0; y := 'a'; end` | Emitted as JS object literals with the field names kept. Used for three.js parameter objects. |
| Pascal classes | Emitted as plain prototype-like objects, non-virtual calls devirtualized to `TCourse.height(Self, x, z)`. Fast and readable. |

### Pitfalls found on the way (and kept in mind for the rest of the port)

1. **Pascal is case-insensitive, JS is not.** The JS `Course` has a field `T` (track) and a local `t` in the same method. In Pascal they are the same identifier. Such fields were renamed (`T` → `Trk`). The same trap shows up everywhere (`H`/`h`, `L`/`l`, `W`/`w`), so every port of a JS function gets checked for it.
2. **Reserved words used as JS names**: `set`, `repeat`, `type`, `array`, `lambda` (DWScript!). External members get escaped with `&` (`&repeat: JVector2`), and parameters get renamed.
3. **`shr 0` is optimized away**, but JS relies on `x >>> 0` to turn a value unsigned. The mulberry32 RNG's final step therefore sits in a 4-line `asm` block, so it stays bit-identical to the original (world generation depends on it).
4. **`Format`/`FloatToStr` are locale-dependent** (a German locale produced `3,14`). Numbers shown in the HUD go through `Number.toFixed` (`ToFixed` helper).
5. **`Round` uses banker's rounding** in some paths. `JsRound` (floor(x + 0.5)) is used wherever the original used `Math.round`.
6. **Float vs Integer literals**: `var s := 0;` infers `Integer`. Accumulators are declared explicitly as `Float`.
7. JS float `%` → `FMod` helper (emits `a % b`).

## Step 2: Foundation units

| Unit | Content |
|---|---|
| `carve.web.pas` | Hand-written externals for the DOM, events, `localStorage`, Canvas 2D, Web Audio and the Gamepad API, kept deliberately small. |
| `carve.three.pas` | Hand-written externals for the parts of three.js the game uses, plus r186 constants. |
| `carve.util.pas` | `clamp/lerp/smoothstep/damp/wrapAngle`, value noise, fbm, the mulberry32 `TRNG`, and the spring. |
| `carve.config.pas` | `CONFIG` as a class with class constants, so call sites read exactly like the JS (`CONFIG.maxEdge`). Also `PRESETS`, `TRACKS` and the per-track storage keys. |
| `carve.course.pas` | The analytic slope function (`TCourse`). |

An existing community three.js binding (`threejs.defs.pas`, ~270 KB, for r181) was on the machine. It was not used, for three reasons: many of its members were still marked TODO (for example `EffectComposer.addPass`), it targets r181, and a small, exact binding for the ~40 classes the game needs is easier to verify.

### Verification: numeric parity

Terrain, physics, AI and camera all query `Course`, so every one of them depends on it being exact. A Node.js harness evaluates the original JS `Course` and `RNG` (extracted from `index.html`) next to the compiled Pascal build and compares 1,540 samples of `height()`, `features()`, `safeZ()` and `RNG.next()` along the whole track:

```
n 1540 1540 maxdiff 0 bad 0
```

The results are bit-identical.
