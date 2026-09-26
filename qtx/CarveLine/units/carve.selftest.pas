unit carve.selftest;

// Test-Hook fuer den Vergleich mit dem JS-Original: window.carveTest.physRun(n)
// faehrt n Physik-Schritte mit einer festen Eingabesequenz (ohne Baeume) und liefert alle 10 Schritte x, y, z, yaw, edge, speed.

interface

uses
  carve.web, carve.util, carve.config, carve.three, carve.course, carve.world, carve.physics;

procedure InstallSelfTest(course: TCourse; resort: TResort);

implementation

var
  TCourseRef: TCourse;
  TResortRef: TResort;

function PhysRun(n: Integer): array of Float;
const dt = 1 / 120;
begin
  var ph := TRiderPhysics.Create(TCourseRef, TTerrain.CreateStub(TCourseRef, TResortRef));
  var inp := TControls.Create;
  ph.Reset(4); ph.frozen := False;
  for var i := 0 to n - 1 do begin
    inp.steer := Sin(i * 0.013) * 0.9;
    inp.tuck := if (i mod 600) < 300 then 1.0 else 0.0;
    inp.brake := if (i mod 1000) > 900 then 0.6 else 0.0;
    inp.jump := ((i mod 400) >= 350) and ((i mod 400) < 380);
    inp.grab := False;
    ph.Step(dt, inp);
    if ph.crashReason <> '' then begin
      Result.Add(-1); Result.Add(ph.pos.z);                  // Sturz markieren, dann weiter unten neu starten
      ph.Reset(ph.pos.z + 5); ph.frozen := False;
    end;
    if i mod 10 = 0 then begin
      Result.Add(ph.pos.x); Result.Add(ph.pos.y); Result.Add(ph.pos.z); Result.Add(ph.yaw); Result.Add(ph.edge); Result.Add(ph.speed);
    end;
  end;
end;

procedure InstallSelfTest(course: TCourse; resort: TResort);
begin
  TCourseRef := course; TResortRef := resort;
  var run: function(n: Integer): array of Float := @PhysRun;
  asm window.carveTest = { physRun: @run }; end;
end;

end.
