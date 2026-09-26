unit carve.input;

// Input — Tastatur + Gamepad + Touch, geglaettet

interface

uses
  carve.web, carve.util;

type
  TTouchState = class
  public
    active: Boolean;
    x, y: Float;
    jump, grab: Boolean;
  end;

  TInput = class(TControls)
  private
    FKeys: Variant;
    FPadPrev3, FPadPrev9: Boolean;
    procedure InitTouch;
    function Key(code: String): Boolean;
  public
    analog: Boolean;
    pressedCamera, pressedPause: Boolean;
    touch: TTouchState;
    constructor Create;
    function Consume(name: String): Boolean;
    procedure Update(dt: Float);
  end;

implementation

constructor TInput.Create;
begin
  FKeys := NewDict;
  touch := TTouchState.Create;
  InitTouch;
  window.addEventListener('keydown', procedure(e: JEvent)
  begin
    var c := e.code;
    if (c = 'ArrowLeft') or (c = 'ArrowRight') or (c = 'ArrowUp') or (c = 'ArrowDown') or (c = 'Space') then e.preventDefault;
    if not e.&repeat then begin
      if c = 'KeyC' then pressedCamera := True;
      if (c = 'KeyP') or (c = 'Escape') then pressedPause := True;
    end;
    VSet(FKeys, c, True);
  end);
  window.addEventListener('keyup', procedure(e: JEvent) begin VSet(FKeys, e.code, False); end);
  window.addEventListener('blur', procedure(e: JEvent) begin FKeys := NewDict; end);
end;

function TInput.Key(code: String): Boolean;
begin
  Result := Truthy(VGet(FKeys, code));
end;

// Touch: Stick links (x = Lenken analog, hoch = Hocke, runter = Bremsen), Sprung/Kamera/Pause rechts; Multi-Touch ueber pointerId
procedure TInput.InitTouch;
var padId: Integer; hasPad: Boolean;
begin
  // Touch-UI nur bei grobem Zeiger (Handy/Tablet) oder sobald wirklich per Finger getippt wird (nicht bloss maxTouchPoints)
  if window.matchMedia('(pointer: coarse)').matches then document.body.classList.add('touch');
  var capOpt: Variant := new JObject; capOpt.capture := True;
  window.addEventListener('pointerdown', procedure(e: JEvent)
  begin
    if e.pointerType = 'touch' then document.body.classList.add('touch');
  end, capOpt);
  var pad := El('tPad'); var knob := El('tKnob'); var T := touch;
  var ar: array of JElement := [pad.querySelector('.u'), pad.querySelector('.d'), pad.querySelector('.l'), pad.querySelector('.r')];
  hasPad := False; padId := 0;
  var move := procedure(e: JEvent)
  begin
    var b := pad.getBoundingClientRect; var R := b.width / 2;
    var dx := (e.clientX - b.left - R) / R; var dy := (e.clientY - b.top - R) / R; var l := Hypot2(dx, dy);
    if l > 1 then begin dx /= l; dy /= l; end;
    T.x := dx; T.y := dy; knob.style.transform := 'translate(' + NumStr(dx * R * 0.58) + 'px,' + NumStr(dy * R * 0.58) + 'px)';
    ar[0].classList.toggle('on', dy < -0.45); ar[1].classList.toggle('on', dy > 0.45); ar[2].classList.toggle('on', dx < -0.15); ar[3].classList.toggle('on', dx > 0.15);
  end;
  var endProc := procedure(e: JEvent)
  begin
    if not hasPad or (e.pointerId <> padId) then exit;
    hasPad := False; T.active := False; T.x := 0; T.y := 0; knob.style.transform := '';
    for var a in ar do a.classList.remove('on');
  end;
  var capture := procedure(el: JElement; e: JEvent)
  begin
    try el.setPointerCapture(e.pointerId); except end;           // Pointer schon weg
  end;
  pad.addEventListener('pointerdown', procedure(e: JEvent)
  begin
    e.preventDefault; padId := e.pointerId; hasPad := True; T.active := True; move(e); capture(pad, e);
  end);
  pad.addEventListener('pointermove', procedure(e: JEvent) begin if hasPad and (e.pointerId = padId) then move(e); end);
  pad.addEventListener('pointerup', endProc); pad.addEventListener('pointercancel', endProc);
  var btn := procedure(b: JElement; down: procedure; up: procedure)
  begin
    b.addEventListener('pointerdown', procedure(e: JEvent)
    begin
      e.preventDefault; b.classList.add(if Assigned(up) then 'on' else 'tap'); down(); capture(b, e);
    end);
    var rel := procedure(e: JEvent) begin b.classList.remove('on'); b.classList.remove('tap'); if Assigned(up) then up(); end;
    b.addEventListener('pointerup', rel); b.addEventListener('pointercancel', rel);
  end;
  btn(El('tJump'), procedure begin T.jump := True; end, procedure begin T.jump := False; end);
  btn(El('tGrab'), procedure begin T.grab := True; end, procedure begin T.grab := False; end);
  btn(El('tCam'), procedure begin pressedCamera := True; end, nil);
  btn(El('tPause'), procedure begin pressedPause := True; end, nil);
  window.addEventListener('contextmenu', procedure(e: JEvent) begin if document.body.classList.contains('touch') then e.preventDefault; end);
end;

function TInput.Consume(name: String): Boolean;
begin
  if name = 'camera' then begin Result := pressedCamera; pressedCamera := False; end
  else begin Result := pressedPause; pressedPause := False; end;
end;

function PadButton(p: JGamepad; i: Integer): Float;
begin
  if (i < p.buttons.Length) and Truthy(p.buttons[i]) then Result := p.buttons[i].value else Result := 0;
end;

procedure TInput.Update(dt: Float);
var st, tu, br, ax, rise: Float; ju, gr, an: Boolean;
begin
  st := (if Key('KeyD') or Key('ArrowRight') then 1.0 else 0.0) - (if Key('KeyA') or Key('ArrowLeft') then 1.0 else 0.0);
  tu := if Key('KeyW') or Key('ArrowUp') then 1.0 else 0.0;
  br := if Key('KeyS') or Key('ArrowDown') then 1.0 else 0.0;
  ju := Key('Space'); gr := Key('KeyE') or Key('ShiftLeft') or Key('ShiftRight');
  an := False;
  var T := touch;
  if T.active then begin
    const dz = 0.15;
    ax := Abs(T.x);
    if ax > dz then begin st := SignF(T.x) * Min(1.0, Power((ax - dz) / (0.8 - dz), 1.2)); an := True; end;
    if T.y < -0.45 then tu := 1;
    if T.y > 0.45 then br := 1;
  end;
  if T.jump then ju := True;
  if T.grab then gr := True;
  var pads: array of JGamepad;
  asm @pads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; end;
  for var p in pads do begin
    if not Truthy(p) then continue;
    const pdz = 0.12;
    ax := 0; if p.axes.Length > 0 then ax := p.axes[0];
    if Abs(ax) > pdz then begin st := SignF(ax) * Power((Abs(ax) - pdz) / (1 - pdz), 1.4); an := True; end;
    tu := Max(tu, PadButton(p, 7)); br := Max(br, PadButton(p, 6));
    if PadButton(p, 0) > 0.5 then ju := True;
    if (PadButton(p, 2) > 0.5) or (PadButton(p, 5) > 0.5) then gr := True;
    if (PadButton(p, 3) > 0.5) and not FPadPrev3 then pressedCamera := True;
    if (PadButton(p, 9) > 0.5) and not FPadPrev9 then pressedPause := True;
    FPadPrev3 := PadButton(p, 3) > 0.5; FPadPrev9 := PadButton(p, 9) > 0.5;
    break;
  end;
  // Glaettung: Tastatur baut Lenkung progressiv auf (kein digitales Ruckeln), analog reagiert direkt
  if an then rise := 18
  else if (Abs(st) > Abs(steer)) and (SignF(st) = SignF(if steer <> 0 then steer else st)) then rise := 4.2
  else rise := 7.5;
  steer := Damp(steer, st, rise, dt);
  tuck := Damp(tuck, tu, 6, dt);
  brake := Damp(brake, br, 8, dt);
  jump := ju; grab := gr; analog := an;
end;

end.
