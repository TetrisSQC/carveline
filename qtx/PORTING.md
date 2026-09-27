# CARVE LINE: Porting Log (JavaScript → Quartex Pascal)

> **Note:** The original JavaScript game was built entirely by **Claude Opus via Claude Code**, driven by a conversation held **in German**. That's why the game's UI text and the code comments are German, in both versions. This log is in English. It documents how the finished JS game was ported to **Quartex Pascal (QTX)**, again by Claude Opus through Claude Code, using the Quartex Pascal IDE's MCP server.

## Result

The complete game now runs from Pascal source:

| | JavaScript original | Quartex Pascal port |
|---|---|---|
| Game logic | `index.html` (one `<script type="module">`, ~3,000 dense lines) | 24 units in `CarveLine/units/`, 7,783 lines |
| Music engine | `downhill-music.js` (467 lines) | `carve.music.pas` (ported as well) |
| Output | the source itself | `CarveLine/index.js`, ~525 KB unminified (compiled by QTX 1.2.0.1; see step 8 for why size optimization is off) |
| three.js | r0.186.1 from jsDelivr | same, bound through `external` classes |
| Inline JavaScript (`asm`) | – | 34 small blocks, mostly one-liners (see below) |

Every feature was ported: snowboard physics, tricks with the landing aid, three tracks, AI rivals, the ghost, gates and stars, NPC skiers, the resort (lifts, huts, villages), mountains, time of day and weather, the cel-shading/outline/bloom/grade post chain, dynamic music, touch/gamepad/keyboard input, the HUD and menus, and the PWA.

The port was checked against the original. The two versions agree to the last bit in the course function, the physics matches over 50 simulated seconds, and the feature checks and screenshots match (see "Verification").

## Goal and scope

"A nice project in JS, then port it to pure QTX." All of the game logic is Object Pascal, compiled to JavaScript by the Quartex Pascal compiler (DWScript JS codegen). Only these parts are not Pascal:

| Stays external | Why |
|---|---|
| **three.js r0.186.1** plus addons (EffectComposer, RenderPass, UnrealBloomPass, SMAAPass, ShaderPass, OutputPass, Sky, BufferGeometryUtils) | A third-party WebGL library, used through typed `external` class bindings, the same way a Delphi app uses the Win32 API. |
| **GLSL shader source** | GPU code. It lives in Pascal string constants, but it is GLSL, not Pascal. |
| **HTML markup + CSS** | The static page skeleton (HUD panels, menus, touch controls), copied unchanged. All behaviour behind it is Pascal. |
| A 12-line module loader in `index.html` | three.js ships only as an ES module. The loader imports it, puts `THREE` and the addon classes on `window`, and then calls the Pascal `main()`. |

## Environment and workflow

- **Quartex Pascal IDE 1.2.0.1 ("Kailash")** with its MCP server on `http://localhost:3030/mcp`.
- The MCP server was not registered in Claude Code, so a ~70-line Python JSON-RPC client talked to it directly: `initialize`, then the `Mcp-Session-Id` header, then `tools/call`. A `sync` command copied the Pascal files from disk into the IDE buffers (`set_file`), and a small `build.sh` ran `compile` and printed only errors and warnings. Every build in this log went through the IDE's own compiler via MCP.
- The project was created with the MCP tool `create_project` from the **Simple2D** template. The template's form, widget framework, CSS and polyfills were removed afterwards: the game does not use the QTX widget library, and `app.entrypoint.pas` only calls `StartCarveLine`.
- During the port the IDE stopped once (the MCP port went away). It was restarted, the project was re-opened with `open_project`, and the work continued. The build script now re-opens the project automatically.
- Testing used a small Chrome DevTools Protocol driver written in Node.js. It starts a headless Chrome with a separate profile, can call functions inside the page, send key and pointer events and take screenshots. Both the original and the port were served by the same local `python -m http.server`.

## Unit map

| Pascal unit | Ported from (JS) | Content |
|---|---|---|
| `carve.web` | – | Hand-written externals: DOM, events, `localStorage`, Canvas 2D, Web Audio, Gamepad, plus small helpers (`JsReplace`, `NumStr`, `ToFixed`, …) |
| `carve.three` | – | Externals for the ~45 three.js classes the game uses, plus r186 constants |
| `carve.util` | utilities, `RNG`, `spring` | `ClampF`, `Lerp`, `Smoothstep`, `Damp`, `WrapAngle`, value noise, fbm, mulberry32 `TRNG`, `TControls` |
| `carve.config` | `CONFIG`, `PRESETS`, `TRACKS` | `CONFIG` as a class with class constants, so call sites read exactly like the JS (`CONFIG.maxEdge`) |
| `carve.course` | `Course` | Analytic slope function |
| `carve.gfx` | shader patches, canvas textures, `makeSnowMaterial` | Cel-shading and height-fog chunk patches, corduroy normal map, snow shader hooks |
| `carve.props` | tree, rock, building and lift geometry | Chalet, farmhouse, church, pylon, chair, station |
| `carve.world` | `Resort`, `Terrain` | Lifts, villages and chunk streaming |
| `carve.scenery` | `Mountains`, `makeGate`, `Snowfall` | |
| `carve.input` | `Input` | Keyboard, gamepad, touch stick and buttons |
| `carve.music` | `downhill-music.js` | The whole dynamic music engine (layers, dice-driven phrases, stingers) |
| `carve.audio` | `AudioEngine` | Board sounds, SFX, music bus, built-in fallback loop |
| `carve.physics` | `RiderPhysics` | Edge, grip and sidecut model, ollie, flips, grabs, landing |
| `carve.skeleton` | `J`, `solveIK`, `RIG`, `RiderAnimator`, `poseFromState`, `Ragdoll` | |
| `carve.rider` | `Rider`, `makeBoardGeometry`, `FIG` | The chibi snowboarder |
| `carve.challenges` | `Challenges` | Gates and stars |
| `carve.skiers` | `SkierAI`, `segSegDist` | Instanced NPC skiers |
| `carve.rivals` | `Rival`, `Ghost` | |
| `carve.fx` | `ParticleSystem`, `Trail`, `CameraRig` | |
| `carve.hud` | `HUD`, `Score` | |
| `carve.post` | `OutlineShader`, `GradeShader`, `clampSky` | |
| `carve.game` | `Game`, the error overlay, PWA registration | State machine, loop, UI binding, contacts, landing aid |
| `carve.selftest` | – | `window.carveTest.physRun(n)` for the physics comparison |

## Step-by-step log

### 1. Probing the toolchain

Before porting any code, small probe programs checked how DWScript's JS codegen handles the constructs the game needs:

| Construct | Result |
|---|---|
| `JVector3 = class external 'THREE.Vector3'` | `new JVector3(1,2,3)` → `new THREE.Vector3(1,2,3)`; methods map 1:1, so chaining works (`v.set(..).normalize`). |
| `var document external 'document': JDocument;` | Direct access to JS globals. |
| `function imul(a, b: Integer): Integer; external 'Math.imul';` | External functions can point at any JS function. |
| `Variant` member access (`sh.uniforms.uSunView := x`) | Plain JS property access. Used for `onBeforeCompile` shader hooks. |
| Anonymous classes `class color := $ffffff; roughness := 0.66; end` | JS object literals with the field names kept. Used for all three.js parameter objects. |
| Pascal classes | Non-virtual calls compile to plain functions (`TCourse.height(Self, x, z)`), fast and readable. |
| `initialization` sections | Run when `index.js` loads, before three.js exists. Anything that touches three.js therefore runs from `main()` (`InitGfx`) or lazily. |

### 2. Foundation (`web`, `three`, `util`, `config`, `course`)

An existing community three.js binding (`threejs.defs.pas`, ~270 KB, for r181) was on the machine. It was not used, for three reasons: many members were still marked TODO (for example `EffectComposer.addPass`), it targets r181, and a small, exact binding for the classes the game needs is easier to verify.

`Course` was ported first, because terrain, physics, AI and camera all depend on it. It was then checked for **numeric parity** before anything else was built on top of it (see "Verification").

### 3. World (`gfx`, `props`, `world`, `scenery`)

These parts are straight translations. The GLSL chunks moved into multi-line `#"…"` strings. The shader patches use a `JsReplace` helper that calls `String.prototype.replace` with a replacer function, so it keeps the original's "replace the first match only" semantics and never interprets `$` patterns.

Everything placed by the seeded RNG (lifts, villages, trees, rocks, poles) is bit-identical as long as the order of the `rng.next()` calls stays the same. In Pascal, function arguments are evaluated left to right, just like in JS, so calls like `TryHouse(x + (rng.Next - 0.5) * 30, z + (rng.Next - 0.5) * 40, Pick(...), ...)` kept the same order.

### 4. Input, audio, music

`downhill-music.js` was the user's own file, not generated code. It was ported as well so that nothing on the game side stays JavaScript. The option objects of `_tone`/`_noise` became Pascal default parameters, and the chord tables and dice phrases became Pascal data. The optional `on('bar'…)` listener API was kept as `OnEvent`.

### 5. Rider pipeline (`physics`, `skeleton`, `rider`)

The riding-rider and ghost states that were anonymous objects in JS (`{ pos, up, yaw, edge, flip, anim }`) became small classes (`TPoseState`, `TAnimState`). The physics `onEvent(type, a, b)` callback became a procedure type with `Variant` arguments. The original emitter passed only two arguments, so a third one it was given (`rot`) was silently dropped. The port reproduces that as well.

### 6. AI and features (`challenges`, `skiers`, `rivals`, `fx`, `hud`, `post`)

`Map` and `Set` usages became arrays with linear search: at most 14 terrain chunks and a few bump cooldown keys. The HUD used to read the whole `Game` object. It now receives a small `THudInfo` record, which avoids a circular unit dependency.

### 7. Game

`Game` became the `TGame` class. `Object.assign`-style settings handling was rewritten explicitly, but it writes the **same JSON format under the same `localStorage` keys**. As a result, the Pascal version and the JS version share settings, best times and ghosts when they are served from the same origin.

The `ShaderPass.render` override, which binds the depth texture of the read buffer, stayed as a four-line `asm` block, because it rebinds a JS method.

### 8. Tests, bugs found, optimization, cleanup

See "Verification" and "Pitfalls". After the tests passed, the compiler options were switched to `Optimize=1`, `InlineMagic=1` and `OptimizeForSize=1`, with source maps off. That took `index.js` from 524 KB to 299 KB, and the automated tests passed on the optimized build as well.

A test on a real phone then showed broken characters in the HUD and menus (`·`, `ü`, `Ü`, `ß`, `°` appeared as `�`). With `OptimizeForSize=1`, the compiler writes every string character in the range `#$80..#$FF` as U+FFFD. That also affects literals inside the QTX RTL. Characters from `#$100` up (for example `★`) are written correctly as `\uXXXX`. The automated tests had only checked numbers and states, not these characters.

The fix has two parts:
- These characters are now built at runtime with `UC(code)`, which calls `String.fromCharCode`, so they are correct in every compiler mode.
- The size optimization is off again, because it also corrupts RTL literals. `index.js` is back at about 525 KB, and a server with gzip shrinks it considerably anyway.

The IDE also writes its own in-memory project settings back to `app.config.ini` when it closes. Changes made to the file from outside while the IDE is running can be lost that way, so project options should be set inside the IDE.

The template leftovers (form, widget CSS, polyfills, `platform.js`) were deleted.

## Verification

1. **Course parity (Node.js).** The original `Course` and `RNG` code was extracted from `index.html` and run next to the compiled Pascal build. The test compared 1,540 samples of `height()`, `features()`, `safeZ()` and `RNG.next()` along the whole track. The result was `maxdiff 0`, so the values are bit-identical.
2. **Physics parity (headless Chrome).** Both builds ran 6,000 steps at 120 Hz (50 simulated seconds) with the same scripted input: steering sine, tuck and brake phases, and ollies. Both runs had exactly **13 crashes** at the same places. The largest difference in any logged value (x, y, z, yaw, edge, speed) was **1.1 × 10⁻¹³**, which is floating-point noise from the compiler turning `x*x` into `Math.pow(x, 2)`.
3. **Feature checks**, identical results in both versions:

   | Check | Result |
   |---|---|
   | Gate pass | "Tor +150", `Tore 1/17` |
   | Star pickup | `★ 1/164` |
   | Flip landing aid | ring shown, "Abbrechen!" / "Loslassen!" |
   | Crash chain | ragdoll → stand-up → ride |
   | Helmet cam | head hidden |
   | Touch stick | knob moves, up and left arrows highlighted |
   | Finish | results screen, "Neue Bestzeit!", ghost saved (~9–10 KB base64) |
   | Next run | ghost visible |
   | Track switch | reload, "Waldpfad" selected |
   | Music | TDownhillMusic running |
   | Auto preset | drops a level at low FPS |
   | Evening + snowfall | the same values for sky, fog, mountains and lights |

4. **Visual comparison.** Screenshots of the title flyover, the countdown with the rivals, and evening with snowfall look the same in both versions.
5. **CPU performance.** 60,000 physics steps took a median of about 0.6–0.7 s in both versions, within measurement noise. The per-frame cost is dominated by WebGL and three.js, which both versions share.

## Pitfalls (worth knowing before porting JS to QTX)

1. **Pascal is case-insensitive, JS is not.** This was by far the most frequent source of errors. Every place where JS used two names that differ only in case had to be renamed:
   - `T`/`t` in `Course`
   - `H`/`h`, `X`/`x`, `A`/`a`, `B`/`b`, `C`/`c`, `G`/`g`, `N`/`n`, `P`/`p` in the terrain builder
   - `dT`/`dt` in the skier AI, where the target offset would have replaced the time step
   - `R`/`r` in the star shape
   - `j`/`J` (joint array vs. joint enum)
   - `D`/`d` in the rival AI
   - the field `rig` vs. the type `RIG`
   - the field `rivals` vs. the constant `RIVALS`
   - the Trail's `P, B, K` buffers vs. the parameters `p, b, k`

   The compiler reports some of these as type errors. Others (two `Float` locals such as `dT`/`dt`) compile without complaint, so every function was checked by hand for such pairs.
2. **Reserved words used as JS names.** `set`, `repeat`, `type`, `array` and `on` are escaped with `&` on externals (`&repeat`, `&type`, `&array`). Some names can't be used at all: `lambda`, `Low`, `Swap`, `shl`/`shr` (the joints `SHL`/`SHR` became `SHL_`/`SHR_`), and `on`, which also rules out a method called `On`.
3. **Every local variable is hoisted to one function-scoped JS `var`**, including inline `var`s declared inside a loop body. Closures created in that loop share one variable. In the options menu, every weather button ended up setting "fog". The fix is one small function per element (`BindClick(b, handler)`), so each closure gets its own parameter.
4. **Anonymous-class field initialisers can refer to themselves.** In `class uniforms := uniforms; end`, the right-hand side means the new field, not the outer variable. Outer variables therefore get other names (`unis`, `cv`, `tm`, …).
5. **The type of an `if` expression comes from its `then` branch.** `(if c then 1 else 0.72)` is an Integer expression. Float literals (`1.0`) are needed.
6. **A `//` comment runs to the end of the line.** One dense line of constants lost its last two declarations after a comment was inserted in the middle of it. The compiler then reported the missing names.
7. **`shr 0` is optimized away**, but JS relies on `>>> 0` to make a value unsigned. The last step of the mulberry32 RNG therefore stays in a small `asm` block.
8. **`Format`/`FloatToStr` are locale-dependent** (on a German system: `3,14`). All displayed numbers go through `Number.toFixed`/`String()`. `Round` compiles to `Math.round`, so it matches JS exactly.
9. **The compiler renames fields when names collide** (`pos` → `pos$2`). `asm` blocks therefore only reference Pascal *variables* via `@name`, never fields by their JS name. External test scripts need a small name lookup.
10. **Characters `#$80..#$FF` break with `OptimizeForSize=1`.** They come out as U+FFFD (see step 8). Build them at runtime (`UC($B7)`) or leave that option off.
11. **Service worker caching during development.** The PWA serves `index.js` from its cache first, so a freshly compiled build only shows up on the next load. The test driver disables the cache and bypasses the service worker.

## Where `asm` is still used, and why

- **mulberry32** unsigned shift (pitfall 7).
- **`String.replace`** with a replacer function (`JsReplace`) and **`includes`**.
- **Object-as-dictionary helpers**: `VGet`, `VSet`, `NewDict`, `typeof`.
- **`toFixed`**, **`toLocaleString('de-DE')`**, **`padStart`**, and the thousands-dots regex.
- The **ghost's base64 encode/decode** of a `Float32Array` (`btoa`/`atob` on a byte view).
- Rebinding **`ShaderPass.render`**, and copying all **Sky uniforms** into the environment sky.
- **Fullscreen/orientation lock**, **`navigator.vibrate`**, **service worker registration** and **`beforeinstallprompt`**, all feature-detected browser APIs with promises.
- `NewAudioContext` (`AudioContext || webkitAudioContext`), plus exposing `window.game` and `window.carveTest`.

## Intentional differences from the original

- `TDownhillMusic.Start` doesn't `await ctx.resume()`, because the game always starts it inside a user gesture, where the context is already running. `Emit` skips scheduling timers when nobody listens.
- The constant `RIVALS` is `RIVAL_DEFS`, the camera rig field is `camRig`, and some locals got new names (pitfall 1). The Trail buffers are `PosA`, `BirthA`, `OnA`, `SideA` and `KindA`.
- `window.carveTest.physRun(n)` exists only for the physics comparison.
- The PWA files are copied. `sw.js` caches `index.js` instead of `downhill-music.js`.

## Changes after the port

- **Touch buttons (both versions):** The right-hand touch buttons (jump, grab, cam, pause) are now subtly domed buttons instead of flat translucent circles. Each has a light rim, a soft highlight, an inner ring and a low coloured drop edge (`--c` per button). When pressed, a button sinks slightly and glows. After feedback from a phone screenshot, all four buttons are smaller than before, both on regular and on short screens. This is pure CSS in `index.html`, so the JS original and the QTX port received the same change.
- **Cel-shading outlines on small displays (both versions):** The ink lines are drawn with a fixed offset in render pixels. On phones the image is upscaled, so the lines looked heavy. `OutlineShader` now has `uWidth` and `uAlpha` uniforms. `updateOutlineTexel()` / `TGame.UpdateOutlineTexel` sets them from the short side of the viewport: at about 380 px (phone in landscape) they are 1.15 px and 55 %. From 600 px up they stay at the original 1.8 px and 90 %, so desktop is unchanged. Both versions were checked to produce the same values at phone and desktop size.

- **Rotation on phones (both versions):** When the phone was turned from portrait to landscape, the scene was sometimes squashed. On mobile browsers the `resize` event can fire before `innerWidth`/`innerHeight` hold the new values, and the camera kept the old aspect ratio. The game now also listens to `orientationchange` and `visualViewport` `resize`. In addition, the loop compares the viewport size with the last applied size every frame (two integer comparisons) and resizes when it differs. Test: with all resize and orientation events blocked, a switch from 393×852 to 852×393 still ends with the correct camera aspect (2.168) in both versions.

- **Mojibake with the IDE's web server (QTX version):** When the game was opened through the Quartex IDE's built-in web server, markup text was garbled in Edge (`überhole` → `Ã¼berhole`, `▼` → `â–¼`). Opened any other way it was fine, and `index.html` itself is valid UTF-8 with `<meta charset="utf-8">`. An HTTP `Content-Type` charset takes precedence over the meta tag, and the IDE server evidently declares or reads the file as a Windows code page. The QTX `index.html` is therefore now **pure ASCII**: non-ASCII characters in the markup are numeric entities (`&#252;`, `&#9660;`, …), and umlauts in CSS comments are transliterated. `manifest.webmanifest` uses `—`. `index.js` is not affected, because it starts with a UTF-8 BOM, which wins over the HTTP header, and its strings are `\uXXXX` escapes or built with `UC()`. Test: a local server that deliberately sends `charset=windows-1252` shows every character correctly (title, text, arrows, ▼, HUD `·`/`★`, `Zurück`).

## Building and running

1. Open `qtx/CarveLine` in the Quartex Pascal IDE (1.2+) and compile. This writes `index.js`.
2. Serve `qtx/CarveLine/` over HTTP, since ES modules don't work from `file://`. For example: `python -m http.server 8000`, then open `http://localhost:8000/`.
3. On first start, three.js is loaded from jsDelivr. After that the PWA works offline.

Command-line builds are possible through the IDE's MCP server: `set_file` for each unit, then `compile`.
