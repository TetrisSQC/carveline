unit carve.props;

// Geometrien fuer Props: Baeume, Felsen, Gebaeude und Lifte — prozedural, Vertex-Farben, gemerged

interface

uses
  qtx.sysutils, carve.web, carve.util, carve.three;

type
  TColorFn = procedure(c: JColor; x, y, z, ny: Float; i: Integer);

  // Teileliste fuer mergeGeometries
  TParts = class
  public
    list: array of JBufferGeometry;
    procedure Add(g: JBufferGeometry);
  end;

  TChaletOpts = class
  public
    wood: Integer;
    plaster, noWindows, noDoor, balconies, terrace: Boolean;
  end;

function Colorize(geo: JBufferGeometry; fn: TColorFn): JBufferGeometry;
function MakeTreeGeometry(detail: Boolean): JBufferGeometry;
function MakeRockGeometry: JBufferGeometry;
procedure BoxPart(parts: TParts; w, h, d, x, y, z: Float; hex: Integer; rx: Float = 0; ry: Float = 0; rz: Float = 0);
procedure GeoPart(parts: TParts; g: JBufferGeometry; hex: Integer);
function MergeParts(parts: TParts): JBufferGeometry;
function AddGableRoof(parts: TParts; w, d, wallTop: Float; pitch: Float = 0.48; ov: Float = 0.9; roof: Integer = $3b2618; gable: Integer = $8b5a33): Float;
procedure AddWindows(parts: TParts; x0, x1, d, y: Float; shutters: Boolean = True);
function ChaletOpts(wood: Integer = 0; plaster: Boolean = False; balconies: Boolean = False; terrace: Boolean = False; noWindows: Boolean = False; noDoor: Boolean = False): TChaletOpts;
function MakeChalet(w, d: Float; floors: Integer; o: TChaletOpts = nil): JBufferGeometry;
function MakeFarmhouse: JBufferGeometry;
function MakeChurch: JBufferGeometry;
function MakePylon: JBufferGeometry;
function MakeChair: JBufferGeometry;
function MakeStation: JBufferGeometry;

implementation

var _eul: JEuler; _rm: JMatrix4;

procedure TParts.Add(g: JBufferGeometry);
begin
  list.Add(g);
end;

function Colorize(geo: JBufferGeometry; fn: TColorFn): JBufferGeometry;
begin
  var p := geo.attributes.position; var n := geo.attributes.normal;
  var col := new JFloat32Array(p.count * 3); var c := new JColor;
  for var i := 0 to p.count - 1 do begin
    fn(c, p.getX(i), p.getY(i), p.getZ(i), n.getY(i), i);
    col[i * 3] := c.r; col[i * 3 + 1] := c.g; col[i * 3 + 2] := c.b;
  end;
  geo.setAttribute('color', new JBufferAttribute(col, 3));
  Result := geo;
end;

function MakeTreeGeometry(detail: Boolean): JBufferGeometry;
var seg, tiers, i, k, row, cc: Integer; v, f, r, h, yb, a, tip, rr, hs, snow, gv, yy: Float;
begin
  // Verschneite Fichte: Etagen als offene Kegel-Schuerzen mit sternfoermigen, haengenden Astspitzen; Schnee auf den Oberseiten
  var parts := TParts.Create;
  if detail then begin seg := 12; tiers := 7; v := 0; end else begin seg := 6; tiers := 4; v := 9; end;
  var trunk := new JCylinderGeometry(0.1, 0.24, 2.6, if detail then 7 else 4); trunk.translate(0, 1.3, 0); trunk.deleteAttribute('uv');
  parts.Add(Colorize(trunk.toNonIndexed, procedure(c: JColor; x, y, z, ny: Float; i: Integer) begin c.setRGB(0.19, 0.12, 0.08); end));
  for i := 0 to tiers - 1 do begin
    f := i / (tiers - 1); r := 2.35 * (1 - f * 0.8) * (if detail then 1.0 else 1.08); h := 2.5 * (1 - f * 0.35);
    yb := 1.25 + 6.6 * Power(f, 0.92);
    var g := new JConeGeometry(r, h, seg, 2, True); g.deleteAttribute('uv');
    var pos := g.attributes.position; var col := new JFloat32Array(pos.count * 3);
    for k := 0 to pos.count - 1 do begin
      row := k div (seg + 1); cc := (k mod (seg + 1)) mod seg; a := cc / seg * TAU + i * 0.9;
      if row = 2 then tip := (if cc mod 2 = 0 then 1.0 else 0.72) * (0.88 + 0.24 * Hash1(cc * 3.1 + i * 7 + v)) else tip := 1;
      rr := r * (row / 2) * tip * (if row = 1 then 1.12 else 1.0);
      if row = 2 then yy := 0.4 * tip else if row = 1 then yy := 0.05 else yy := 0;
      pos.setXYZ(k, Sin(a) * rr, h / 2 - h * row / 2 - yy, Cos(a) * rr);
    end;
    g.computeVertexNormals; g.translate(0, yb + h / 2, 0);
    var N := g.attributes.normal;
    for k := 0 to pos.count - 1 do begin
      row := k div (seg + 1); cc := (k mod (seg + 1)) mod seg; hs := Hash1(cc * 5.3 + i * 11.7 + v);
      // Schnee: oben auf der Etage und auf einem Teil der Astspitzen
      if row = 0 then snow := 1
      else if row = 1 then snow := (if hs > 0.25 then 1.0 else 0.35)
      else snow := (if (hs > 0.55) and (N.getY(k) > 0.2) then 0.85 else 0.0);
      gv := 0.85 + 0.3 * Hash1(k * 1.7 + i);
      col[k * 3] := Lerp(0.05 * gv, 0.88, snow); col[k * 3 + 1] := Lerp(0.15 * gv, 0.92, snow); col[k * 3 + 2] := Lerp(0.09 * gv, 0.98, snow);
    end;
    g.setAttribute('color', new JBufferAttribute(col, 3));
    parts.Add(g.toNonIndexed);
  end;
  var cap := new JConeGeometry(0.28, 0.9, if detail then 8 else 4); cap.deleteAttribute('uv'); cap.translate(0, 9.7, 0);
  parts.Add(Colorize(cap.toNonIndexed, procedure(c: JColor; x, y, z, ny: Float; i: Integer) begin c.setRGB(0.9, 0.93, 0.98); end));
  Result := mergeGeometries(parts.list);
  Result.computeBoundingSphere;
end;

function MakeRockGeometry: JBufferGeometry;
var n: Float;
begin
  var g: JBufferGeometry := new JIcosahedronGeometry(1, 1);
  var p := g.attributes.position; var v := new JVector3;
  for var i := 0 to p.count - 1 do begin
    v.fromBufferAttribute(p, i); n := 0.75 + 0.45 * (VNoise(v.x * 1.7 + 3, v.z * 1.7 + v.y * 1.3) * 0.5 + 0.5);
    v.multiplyScalar(n); v.y *= 0.7; p.setXYZ(i, v.x, v.y, v.z);
  end;
  var ng := if Truthy(g.index) then g.toNonIndexed else g;
  ng.computeVertexNormals;
  Result := Colorize(ng, procedure(c: JColor; x, y, z, ny: Float; i: Integer)
  begin
    var s := Smoothstep(0.45, 0.75, ny);
    c.setRGB(Lerp(0.30, 0.9, s), Lerp(0.29, 0.92, s), Lerp(0.28, 0.97, s));
  end);
end;

// Quader in Teileliste: Masse, Mitte, Farbe, optionale Rotation
procedure BoxPart(parts: TParts; w, h, d, x, y, z: Float; hex: Integer; rx: Float = 0; ry: Float = 0; rz: Float = 0);
begin
  if _eul = nil then begin _eul := new JEuler; _rm := new JMatrix4; end;
  var g: JBufferGeometry := new JBoxGeometry(w, h, d); g.deleteAttribute('uv');
  if (rx <> 0) or (ry <> 0) or (rz <> 0) then g.applyMatrix4(_rm.makeRotationFromEuler(_eul.set(rx, ry, rz)));
  g.translate(x, y, z);
  var c := new JColor(hex);
  parts.Add(Colorize(g.toNonIndexed, procedure(cc: JColor; x, y, z, ny: Float; i: Integer) begin cc.copy(c); end));
end;

procedure GeoPart(parts: TParts; g: JBufferGeometry; hex: Integer);
begin
  g.deleteAttribute('uv');
  var c := new JColor(hex);
  parts.Add(Colorize(if Truthy(g.index) then g.toNonIndexed else g, procedure(cc: JColor; x, y, z, ny: Float; i: Integer) begin cc.copy(c); end));
end;

function MergeParts(parts: TParts): JBufferGeometry;
begin
  Result := mergeGeometries(parts.list);
  Result.computeBoundingSphere;
end;

// Satteldach (First entlang X) mit Giebelfuellung und Schneeauflage; liefert die Firsthoehe
function AddGableRoof(parts: TParts; w, d, wallTop: Float; pitch: Float = 0.48; ov: Float = 0.9; roof: Integer = $3b2618; gable: Integer = $8b5a33): Float;
const snow = $f4f7fb;
var rh, ridge, L, cz, cy, s, ny, nz: Float; si: Integer;
begin
  rh := (d / 2) * Tan(pitch); ridge := wallTop + rh;
  var gs := new JShape; gs.moveTo(-d / 2, 0); gs.lineTo(d / 2, 0); gs.lineTo(0, rh); gs.lineTo(-d / 2, 0);
  var gg := new JExtrudeGeometry(gs, class depth := w; bevelEnabled := False; end); gg.rotateY(-PI_ / 2); gg.translate(w / 2, wallTop, 0);
  GeoPart(parts, gg, gable);                                                          // Giebel
  L := (d / 2 + ov) / Cos(pitch);
  for si := 0 to 1 do begin
    s := if si = 0 then -1 else 1;
    cz := s * (L / 2) * Cos(pitch); cy := ridge + 0.12 - (L / 2) * Sin(pitch);
    BoxPart(parts, w + 2 * ov, 0.22, L, 0, cy, cz, roof, s * pitch);                     // Dachflaeche
    ny := Cos(pitch); nz := s * Sin(pitch);
    BoxPart(parts, w + 2 * ov - 0.25, 0.3, L - 0.2, 0, cy + ny * 0.26, cz + nz * 0.26, snow, s * pitch); // Schnee
  end;
  Result := ridge;
end;

// Fensterreihe auf Front/Rueckseite (Rahmen hell, Glas dunkel, gruene Laeden vorne) zwischen x0..x1
procedure AddWindows(parts: TParts; x0, x1, d, y: Float; shutters: Boolean = True);
var n, k: Integer; x, sz: Float;
begin
  n := Max(1, Floor((x1 - x0) / 2.8));
  for k := 0 to n - 1 do begin
    x := x0 + (k + 0.5) * (x1 - x0) / n;
    for var si := 0 to 1 do begin
      sz := if si = 0 then 1 else -1;
      BoxPart(parts, 1.05, 1.25, 0.1, x, y, sz * (d / 2 + 0.02), $e8e2d6); BoxPart(parts, 0.8, 1.0, 0.1, x, y, sz * (d / 2 + 0.05), $1c2632);
      if (sz > 0) and shutters then begin
        BoxPart(parts, 0.4, 1.25, 0.07, x - 0.78, y, d / 2 + 0.04, $2f5d3a);
        BoxPart(parts, 0.4, 1.25, 0.07, x + 0.78, y, d / 2 + 0.04, $2f5d3a);
      end;
    end;
  end;
end;

function ChaletOpts(wood: Integer = 0; plaster: Boolean = False; balconies: Boolean = False; terrace: Boolean = False; noWindows: Boolean = False; noDoor: Boolean = False): TChaletOpts;
begin
  Result := TChaletOpts.Create;
  Result.wood := wood; Result.plaster := plaster; Result.balconies := balconies; Result.terrace := terrace;
  Result.noWindows := noWindows; Result.noDoor := noDoor;
end;

// Chalet: Steinsockel, Holzwaende (optional unten verputzt), Satteldach mit Schnee; Front (+Z) mit Fenstern, Laeden, Balkon(en)
function MakeChalet(w, d: Float; floors: Integer; o: TChaletOpts = nil): JBufferGeometry;
const woodLt = $8b5a33; stone = $85837c; snow = $f4f7fb; plaster = $efe9df;
var wood, f, k: Integer; baseH, wallH, wallTop, plasterH, ridge, y, by, tz, x: Float;
begin
  if o = nil then o := ChaletOpts;
  var parts := TParts.Create;
  wood := if o.wood <> 0 then o.wood else $6b4226;
  baseH := 1.0; wallH := floors * 2.6; wallTop := baseH + wallH;
  BoxPart(parts, w + 0.3, baseH + 5, d + 0.3, 0, (baseH - 5) / 2, 0, stone);              // Sockel (reicht in den Hang)
  plasterH := if o.plaster then Max(1, floors - 1) * 2.6 else 0;
  if plasterH <> 0 then BoxPart(parts, w, plasterH, d, 0, baseH + plasterH / 2, 0, plaster);      // verputzte Geschosse
  if wallH > plasterH then BoxPart(parts, w, wallH - plasterH, d, 0, baseH + plasterH + (wallH - plasterH) / 2, 0, wood); // Holzgeschoss(e)
  ridge := AddGableRoof(parts, w, d, wallTop, 0.48, 0.9, $3b2618, woodLt);
  BoxPart(parts, 0.7, 2.2, 0.7, w * 0.25, ridge - 0.2, -d * 0.18, stone);                   // Kamin
  BoxPart(parts, 0.8, 0.2, 0.8, w * 0.25, ridge + 0.95, -d * 0.18, snow);
  if o.noWindows then begin                                                               // Stadel: nur Tor
    BoxPart(parts, w * 0.5, 2.4, 0.1, 0, baseH + 1.2, d / 2 + 0.04, $3d2616);
    exit(MergeParts(parts));
  end;
  for f := 0 to floors - 1 do begin
    y := baseH + 1.45 + f * 2.6;
    AddWindows(parts, -w / 2, w / 2, d, y);
    for var si := 0 to 1 do begin
      var sx := if si = 0 then 1 else -1;
      BoxPart(parts, 0.1, 1.25, 1.05, sx * (w / 2 + 0.02), y, 0, $e8e2d6); BoxPart(parts, 0.1, 1.0, 0.8, sx * (w / 2 + 0.05), y, 0, $1c2632);
    end;
  end;
  if not o.noDoor then BoxPart(parts, 1.1, 2.1, 0.14, w / 2 - 1.4, baseH + 1.05, d / 2 + 0.05, $3d2616); // Tuer
  for f := 1 to floors - 1 do begin                                                       // Balkon im 1. OG (Hotel: alle Obergeschosse)
    if (f > 1) and not o.balconies then break;
    by := baseH + f * 2.6;
    BoxPart(parts, w * 0.85, 0.16, 1.3, 0, by, d / 2 + 0.65, woodLt);
    BoxPart(parts, w * 0.85, 0.95, 0.07, 0, by + 0.55, d / 2 + 1.28, woodLt);
    BoxPart(parts, w * 0.85, 0.08, 1.2, 0, by + 0.1, d / 2 + 0.65, snow);
  end;
  if o.terrace then begin                                                                 // Sonnenterrasse mit Tischen und Schirmen (Berghuette)
    tz := d / 2 + 3.4;
    BoxPart(parts, w + 2, 0.35, 6, 0, baseH - 0.1, tz, woodLt);
    BoxPart(parts, w + 2, 5, 6, 0, baseH - 2.8, tz, stone);
    for k := 0 to 2 do begin
      x := (k - 1) * (w / 3.2);
      BoxPart(parts, 1.6, 0.08, 0.8, x, baseH + 0.8, tz + 0.6, woodLt); BoxPart(parts, 0.1, 0.75, 0.1, x, baseH + 0.4, tz + 0.6, woodLt);
      BoxPart(parts, 0.06, 2.3, 0.06, x, baseH + 1.3, tz + 0.6, $dddddd);
      var u := new JConeGeometry(1.5, 0.6, 8, 1, True); u.translate(x, baseH + 2.5, tz + 0.6);
      GeoPart(parts, u, if k mod 2 = 1 then $e8e2d6 else $d7263d);
    end;
  end;
  Result := MergeParts(parts);
end;

// Bauernhaus: Wohnteil (unten verputzt) + angebauter Holzstadel mit Toren unter einem langen Dach, Balkon mit Blumenkaesten
function MakeFarmhouse: JBufferGeometry;
const wood = $6b4226; barn = $5a3a24; plaster = $efe9df; stone = $85837c; baseH = 1.0; W = 20.0; D = 10.0;
var wallTop, by, ridge: Float;
begin
  var parts := TParts.Create;
  wallTop := baseH + 5.2;
  BoxPart(parts, W + 0.3, baseH + 5, D + 0.3, 0, (baseH - 5) / 2, 0, stone);
  BoxPart(parts, 9, 2.6, D, -5.5, baseH + 1.3, 0, plaster); BoxPart(parts, 9, 2.6, D, -5.5, baseH + 3.9, 0, wood);   // Wohnteil
  BoxPart(parts, 11, 5.2, D, 4.5, baseH + 2.6, 0, barn);                                                               // Stadel
  for var x in [2.2, 6.8] do begin
    BoxPart(parts, 3.2, 3.6, 0.14, x, baseH + 1.8, D / 2 + 0.05, $3d2616); BoxPart(parts, 0.12, 3.6, 0.16, x, baseH + 1.8, D / 2 + 0.07, $2a1a0e);
  end;
  for var k := 0 to 6 do BoxPart(parts, 0.08, 5.2, 0.08, -0.5 + k * 1.65, baseH + 2.6, D / 2 + 0.05, $46301c);    // Bretterfugen
  AddWindows(parts, -10, -1, D, baseH + 1.45); AddWindows(parts, -10, -1, D, baseH + 4.05);
  BoxPart(parts, 1.1, 2.1, 0.14, -2.2, baseH + 1.05, D / 2 + 0.05, $3d2616);
  by := baseH + 2.6;                                                                                                   // Balkon + Blumenkaesten
  BoxPart(parts, 8, 0.16, 1.2, -5.5, by, D / 2 + 0.6, $8b5a33); BoxPart(parts, 8, 0.9, 0.07, -5.5, by + 0.5, D / 2 + 1.18, $8b5a33);
  BoxPart(parts, 8, 0.22, 0.3, -5.5, by + 1.02, D / 2 + 1.18, $d7263d);
  ridge := AddGableRoof(parts, W, D, wallTop, 0.4, 1.1, $3b2618, $6b4226);
  BoxPart(parts, 0.7, 2, 0.7, -6, ridge - 0.3, -2, stone);
  Result := MergeParts(parts);
end;

// Dorfkirche: weisses Schiff mit rotbraunem Dach, runder Chor, Turm mit Uhren, Schalloeffnungen, Zwiebelhaube und Kreuz
function MakeChurch: JBufferGeometry;
const white = $f1ece2; stone = $85837c; roof = $6b2e22; copper = $4f8f7a; dark = $1c2632; gold = $e0b040; tx = -10.1;
var nx, nz, ox, oz, ry: Float;
begin
  var parts := TParts.Create;
  BoxPart(parts, 16.4, 6, 8.4, 0, -2.5, 0, stone);
  BoxPart(parts, 16, 7, 8, 0, 4.0, 0, white);                                                                         // Schiff (First entlang X)
  AddGableRoof(parts, 16, 8, 7.5, 0.62, 0.5, roof, white);
  GeoPart(parts, new JCylinderGeometry(3.9, 3.9, 7, 16, 1, False, 0, PI_).translate(8, 4.0, 0), white);                // Chor
  GeoPart(parts, new JConeGeometry(4.3, 2.8, 16, 1, False, 0, PI_).translate(8, 8.9, 0), roof);
  for var x in [-5.0, -1.5, 2.0, 5.5] do for var sz in [1.0, -1.0] do BoxPart(parts, 1.0, 2.8, 0.12, x, 4.3, sz * 4.05, dark); // Fenster
  BoxPart(parts, 4.6, 5, 4.6, tx, -2, 0, stone);                                                                      // Turm
  BoxPart(parts, 4.2, 19.5, 4.2, tx, 10.25, 0, white);
  BoxPart(parts, 4.5, 0.4, 4.5, tx, 14.5, 0, $d9d2c4); BoxPart(parts, 4.5, 0.4, 4.5, tx, 19.8, 0, $d9d2c4);           // Gesimse
  for var dirIdx := 0 to 3 do begin
    case dirIdx of
      0: begin nx := -1; nz := 0; end;
      1: begin nx := 0; nz := 1; end;
      2: begin nx := 0; nz := -1; end;
    else begin nx := 1; nz := 0; end;
    end;
    ox := tx + nx * 2.12; oz := nz * 2.12; ry := if nx <> 0 then PI_ / 2 else 0;
    BoxPart(parts, 1.1, 1.8, 0.12, ox, 18.1, oz, dark, 0, ry);                                                          // Schalloeffnung
    if nx <> 1 then begin                                                                                                // Uhr
      var face: JBufferGeometry := new JCylinderGeometry(0.95, 0.95, 0.12, 20); face.rotateX(PI_ / 2); face.rotateY(ry); face.translate(tx + nx * 2.14, 16.2, nz * 2.14);
      GeoPart(parts, face, $f7f4ea);
      BoxPart(parts, 0.1, 0.75, 0.14, tx + nx * 2.22, 16.45, nz * 2.22, dark, 0, ry);
      BoxPart(parts, 0.55, 0.1, 0.14, tx + nx * 2.22 + (if nz <> 0 then 0.22 else 0), 16.2, nz * 2.22 + (if nx <> 0 then 0.22 * nx else 0), dark, 0, ry);
    end;
  end;
  GeoPart(parts, new JSphereGeometry(2.3, 18, 12).scale(1, 1.25, 1).translate(tx, 21.9, 0), copper);                  // Zwiebelhaube
  GeoPart(parts, new JCylinderGeometry(0.75, 0.75, 1.4, 12).translate(tx, 24.8, 0), white);                            // Laterne
  GeoPart(parts, new JSphereGeometry(0.9, 14, 10).scale(1, 1.3, 1).translate(tx, 26.1, 0), copper);
  GeoPart(parts, new JConeGeometry(0.35, 2.2, 10).translate(tx, 28.0, 0), copper);
  BoxPart(parts, 0.14, 1.4, 0.14, tx, 29.6, 0, gold); BoxPart(parts, 0.7, 0.14, 0.14, tx, 29.9, 0, gold);                  // Kreuz
  BoxPart(parts, 0.16, 3.0, 1.8, tx - 2.18, 2.0, 0, $3d2616);                                                            // Portal
  Result := MergeParts(parts);
end;

// Liftstuetze (Hoehe 10 m, per Instanz-Skalierung angepasst): Stahlrohr, Traverse quer (X), Rollenbatterien
function MakePylon: JBufferGeometry;
const steel = $9aa3ad; dark = $2a2f38;
begin
  var parts := TParts.Create;
  BoxPart(parts, 1.6, 1.2, 1.6, 0, -0.2, 0, $a3a3a0);
  GeoPart(parts, new JCylinderGeometry(0.26, 0.4, 10, 10).translate(0, 5, 0), steel);
  BoxPart(parts, 5.4, 0.4, 0.4, 0, 10, 0, steel);
  for var s in [-1.0, 1.0] do begin
    BoxPart(parts, 0.3, 0.45, 1.8, s * 2.3, 9.7, 0, dark); BoxPart(parts, 0.08, 1.2, 0.08, s * 1.2, 10.7, 0, steel);
  end;
  BoxPart(parts, 3.0, 0.08, 0.08, 0, 11.3, 0, steel);
  Result := MergeParts(parts);
end;

// 4er-Sessel, Ursprung an der Seilklemme, haengt nach -Y, Blick +Z
function MakeChair: JBufferGeometry;
const steel = $6f7780; seat = $1f3f7a;
begin
  var parts := TParts.Create;
  BoxPart(parts, 0.08, 2.3, 0.08, 0, -1.15, 0, steel);
  BoxPart(parts, 1.9, 0.08, 0.08, 0, -2.3, 0, steel);
  BoxPart(parts, 1.9, 0.14, 0.6, 0, -2.55, 0.25, seat);
  BoxPart(parts, 1.9, 0.7, 0.1, 0, -2.15, -0.05, seat);
  BoxPart(parts, 1.9, 0.05, 0.05, 0, -1.9, 0.75, steel);
  Result := MergeParts(parts);
end;

// Liftstation (Laenge entlang Z): Betonbau mit Glasband, Flachdach mit Schnee, gelbe Umlenkscheibe auf Seilhoehe
function MakeStation: JBufferGeometry;
begin
  var parts := TParts.Create;
  BoxPart(parts, 9, 4.2 + 4, 11, 0, (4.2 - 4) / 2, 0, $c9ccd1);
  BoxPart(parts, 9.05, 1.1, 11.05, 0, 2.6, 0, $2b3845);
  BoxPart(parts, 10, 0.45, 12.5, 0, 4.4, 0, $3a3f47);
  BoxPart(parts, 9.7, 0.3, 12.2, 0, 4.75, 0, $f4f7fb);
  GeoPart(parts, new JCylinderGeometry(2.7, 2.7, 0.7, 24).translate(0, 5.6, 5.5), $f2b705);
  BoxPart(parts, 0.6, 1.4, 0.6, 0, 5.0, 5.5, $2a2f38);
  Result := MergeParts(parts);
end;

end.
