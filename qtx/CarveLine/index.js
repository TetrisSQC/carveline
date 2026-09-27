var $R = [
	"Invalid bit index, expected 0..31",
	"Failed to convert bytes[] to intrinsic type, unknown identifier [%s] error",
	"Invalid datatype, failed to identify number [int32] type error",
	"Invalid datatype, byte conversion failed error",
	"Seek failed, stream is empty error",
	"Read operation failed, %s bytes exceeds storage medium error",
	"Read operation failed, invalid signature error [%s]",
	"Bookmarks not supported by medium error",
	"No bookmarks to roll back error",
	"Invalid length, %s bytes exceeds storage boundaries error",
	"Write failed, invalid datasize [%d] error",
	"Owner was rejected in %s.%s error",
	"'Invalid handle [%s], reference was rejected error",
	"Assign() failed, expected class of <%s>",
	"FromJSON() failed, string was empty",
	"FromJSON() failed, source was nil",
	"Failed to register delegate, instance was nil error",
	"Failed to unregister delegate, instance was nil error",
	"Failed to unregister delegate, not in collection error",
	"Codec already registered error",
	"Internal codec error, failed to obtain registration info error",
	"Binding already connected to codec error",
	"Binding not connected to codec error",
	"Binding failed, invalid endpoint error",
	"Invalid input, IManagedData is nil or unassigned error",
	"Invalid output, IManagedData is nil or unassigned error",
	"No codec associated with this binding error",
	"Failed to write value, property [%s] not found error",
	"Failed to read value, property [%s] not found error",
	"Failed to locate object, property [%s] not found error"];
var Random = Math.random;
function Trunc(v) { return (v>=0)?Math.floor(v):Math.ceil(v) }
function Trim$_String_(s) { return s.replace(/^\s\s*/, "").replace(/\s\s*$/, "") }
var TObject={
	$ClassName: "TObject",
	$Parent: null,
	ClassName: function (s) { return s.$ClassName },
	ClassType: function (s) { return s },
	ClassParent: function (s) { return s.$Parent },
	$Init: function (s) {},
	Create: function (s) { return s },
	Destroy: function (s) { for (var prop in s) if (s.hasOwnProperty(prop)) delete s[prop] },
	Destroy$: function(s) { return s.ClassType.Destroy(s) },
	Free: function (s) { if (s!==null) s.ClassType.Destroy(s) }
}
var Tan = Math.tan;
function StrToInt$_String_(v) { return parseInt(v) }
function StrToFloat(v) { return parseFloat(v) }
function StrSplit(s,d) { return s.split(d) }
function StrJoin(a,d) { return a.join(d) }
function StrEndsWith(s,e) { return s.substr(s.length-e.length)==e }
function StrDeleteLeft(s,n) { return s.substring(n) }
function StrBeginsWith(s,b) { return b.length ? s.substr(0, b.length)==b : false }
var Sqrt = Math.sqrt;
function Sqr$_Float_(v) { return v*v }
var Sin = Math.sin;
var Sign$_Integer_ = $Sign;
function SetLength(s,n) { if (s.v.length>n) s.v=s.v.substring(0,n);else while (s.v.length<n) s.v+=" " }
var Round = Math.round;
function RightStr(s,n) { return s.substr(s.length-n) }
function Power(x,y) { return Math.pow(x,y) }
function Pos$_String_String_(a,b) { return b.indexOf(a)+1 }
function Now() {
	var d=new Date();
	return (d.getTime()-d.getTimezoneOffset()*6e4)/864e5+25569
}
function Min$_Integer_Integer_(a,b) { return (a<b)?a:b }
function Min$_Float_Float_(a,b) { return (a<b)?a:b }
function Max$_Integer_Integer_(a,b) { return (a>b)?a:b }
function Max$_Float_Float_(a,b) { return (a>b)?a:b }
function IsNaN(v) { return isNaN(v) }
function IsLeapYear(y) { return !(y % 4) && (y % 100) || !(y % 400) ? true : false }
function IntToStr$_Integer_(i) { return i.toString() }
function IntToHex(v,d) { var r=v.toString(16); return "00000000".substr(0, d-r.length)+r }
function HexToInt(v) {
	var r=parseInt(v,16);
	if (isFinite(r)) return r;
	throw Exception.Create($New(Exception),"'"+v.toString()+"' is not a valid hexadecimal value");
}
/**
sprintf() for JavaScript 0.7-beta1
http://www.diveintojavascript.com/projects/javascript-sprintf

Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of sprintf() for JavaScript nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL Alexandru Marasteanu BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/

var sprintf = (function() {
	function get_type(variable) {
		return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
	}
	function str_repeat(input, multiplier) {
		for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
		return output.join('');
	}

	var str_format = function() {
		if (!str_format.cache.hasOwnProperty(arguments[0])) {
			str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
		}
		return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
	};

	str_format.format = function(parse_tree, argv) {
		var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
		for (i = 0; i < tree_length; i++) {
			node_type = get_type(parse_tree[i]);
			if (node_type === 'string') {
				output.push(parse_tree[i]);
			}
			else if (node_type === 'array') {
				match = parse_tree[i]; // convenience purposes only
				if (match[2]) { // keyword argument
					arg = argv[cursor];
					for (k = 0; k < match[2].length; k++) {
						if (!arg.hasOwnProperty(match[2][k])) {
							throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
						}
						arg = arg[match[2][k]];
					}
				}
				else if (match[1]) { // positional argument (explicit)
					arg = argv[match[1]];
				}
				else { // positional argument (implicit)
					arg = argv[cursor++];
				}

				if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
					throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
				}
				switch (match[8]) {
					case 'b': arg = arg.toString(2); break;
					case 'c': arg = String.fromCharCode(arg); break;
					case 'd': arg = String(parseInt(arg, 10)); if (match[7]) { arg = str_repeat('0', match[7]-arg.length)+arg } break;
					case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
					case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
                    case 'g': arg = parseFloat(arg); break;
					case 'o': arg = arg.toString(8); break;
					case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
					case 'u': arg = Math.abs(arg); break;
					case 'x': arg = arg.toString(16); break;
					case 'X': arg = arg.toString(16).toUpperCase(); break;
				}
				arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
				pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
				pad_length = match[6] - String(arg).length;
				pad = match[6] ? str_repeat(pad_character, pad_length) : '';
				output.push(match[5] ? arg + pad : pad + arg);
			}
		}
		return output.join('');
	};

	str_format.cache = {};

	str_format.parse = function(fmt) {
		var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
		while (_fmt) {
			if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
				parse_tree.push(match[0]);
			}
			else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
				parse_tree.push('%');
			}
			else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gosuxX])/.exec(_fmt)) !== null) {
				if (match[2]) {
					arg_names |= 1;
					var field_list = [], replacement_field = match[2], field_match = [];
					if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
						field_list.push(field_match[1]);
						while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
							if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
								field_list.push(field_match[1]);
							}
							else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
								field_list.push(field_match[1]);
							}
							else {
								throw('[sprintf] huh?');
							}
						}
					}
					else {
						throw('[sprintf] huh?');
					}
					match[2] = field_list;
				}
				else {
					arg_names |= 2;
				}
				if (arg_names === 3) {
					throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
				}
				parse_tree.push(match);
			}
			else {
				throw('[sprintf] huh?');
			}
			_fmt = _fmt.substring(match[0].length);
		}
		return parse_tree;
	};

	return str_format;
})();
function Format(f,a) { a.unshift(f); return sprintf.apply(null,a) }
var Floor = Math.floor;
function FloatToStr$_Float_(i) { return i.toString() }
function FloatToStr$_Float_Integer_(i,p) { return (p==99)?i.toString():i.toFixed(p) }
var Exp = Math.exp;
var Exception={
	$ClassName: "Exception",
	$Parent: TObject,
	$Init: function (s) { s.FMessage="" },
	Create: function (s,Msg) { s.FMessage=Msg; return s }
}
function DecodeTime(dt,h,m,s,z,u) {
	var o=DateTimeToDate(dt);
	if ((u||$TZ)==1) {
	h.v=o.getUTCHours();
	m.v=o.getUTCMinutes();
	s.v=o.getUTCSeconds();
	z.v=o.getUTCMilliseconds();
	} else {
	h.v=o.getHours();
	m.v=o.getMinutes();
	s.v=o.getSeconds();
	z.v=o.getMilliseconds();
	}
}
function DecodeDate(dt,y,m,d,u) {
	var o=DateTimeToDate(dt);
	if ((u||$TZ)==1) {
		y.v=o.getUTCFullYear();
		m.v=o.getUTCMonth()+1;
		d.v=o.getUTCDate();
	} else {
		y.v=o.getFullYear();
		m.v=o.getMonth()+1;
		d.v=o.getDate();
	}
}
function DateTimeToDate(v,d) {
	if(v||!d) return new Date(Math.round((v-25569)*864e5));
	var o=new Date();
	o.setTime(o.getTime()-o.getTimezoneOffset()*6e4);
	return o
}
var Cos = Math.cos;
function Copy$_String_Integer_Integer_(s,f,n) { return s.substr(f-1,n) }
var Ceil = Math.ceil;
var ArcTan2 = Math.atan2;
var ArcTan = Math.atan;
function AnsiUpperCase(v) { return v.toLocaleUpperCase() }
function AnsiLowerCase(v) { return v.toLocaleLowerCase() }
var Abs$_Integer_ = Math.abs;
var Abs$_Float_ = Math.abs;
function $W(e) { return e.ClassType?e:Exception.Create($New(Exception),(typeof e == "string") ? e : e.constructor.name+", "+e.message) }
function $VarToInt(v,z) {
	var r = parseInt(v || 0, 10);
	if (isNaN(r)) throw Exception.Create($New(Exception),"Not a valid integer: "+v+z);
	return r
}
function $VarToBool(v) { return !!(typeof v == "string" ? {"1":1,"t":1,"y":1,"true":1}[v.toLowerCase()] : v) }
// inspired from 
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/charCodeAt
function $uniCharAt(str, idx) {
    var c = str.charCodeAt(idx);
    if (0xD800 <= c && c <= 0xDBFF) { // High surrogate
        return str.substr(idx, 2);
    }
    if (0xDC00 <= c && c <= 0xDFFF) { // Low surrogate
        return null;
    }
    return str.charAt(idx);
}var $TZ = 1, $fmt = { 
	ShortDayNames : [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
	LongDayNames : [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
	ShortMonthNames : [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
	LongMonthNames : [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
	ShortDateFormat : "yyyy-mm-dd",
	ShortTimeFormat : "hh:nn",
	LongTimeFormat : "hh:nn:ss",
	TimeAMString : "AM",
	TimePMString : "PM"
}
function $StrSet(s,i,v,z) {
	if (i<1) throw Exception.Create($New(Exception),"Lower bound exceeded! Index "+i.toString()+z);
	if (i>s.length) throw Exception.Create($New(Exception),"Upper bound exceeded! Index "+i.toString()+z);
	return s.substring(0,i-1)+v+s.substring(i);
}
function $Sign(v) { return v>0?1:v<0?-1:v===v?0:NaN }
function $SetIn(s,v,m,n) { v-=m; return (v<0 && v>=n)?false:(s[v>>5]&(1<<(v&31)))!=0 }
function $SetEqual(a,b) { for(var i=0;i<a.length;i++) if (a[i]!==b[i]) return !1; return !0 }
Array.prototype.pusha = function (e) { this.push.apply(this, e); return this }
function $NewDyn(c,z) {
	if (c==null) throw Exception.Create($New(Exception),"ClassType is nil"+z);
	var i={ClassType:c};
	c.$Init(i);
	return i
}
function $New(c) { var i={ClassType:c}; c.$Init(i); return i }
function $Is(o,c) {
	if (o===null) return false;
	return $Inh(o.ClassType,c);
}
;
function $Inh(s,c) {
	if (s===null) return false;
	while ((s)&&(s!==c)) s=s.$Parent;
	return (s)?true:false;
}
;
function $Extend(base, sub, props) {
	function F() {};
	F.prototype = base.prototype;
	sub.prototype = new F();
	sub.prototype.constructor = sub;
	for (var n in props) {
		if (props.hasOwnProperty(n)) {
			sub.prototype[n]=props[n];
		}
	}
}
function $Event3(i,f) {
	var li=i,lf=f;
	return function(a,b,c) {
		return lf.call(li,li,a,b,c)
	}
}
function $Event2(i,f) {
	var li=i,lf=f;
	return function(a,b) {
		return lf.call(li,li,a,b)
	}
}
function $Event1(i,f) {
	var li=i,lf=f;
	return function(a) {
		return lf.call(li,li,a)
	}
}
function $Event0(i,f) {
	var li=i,lf=f;
	return function() {
		return lf.call(li,li)
	}
}
function $Div(a,b) { var r=a/b; return (r>=0)?Math.floor(r):Math.ceil(r) }
function $CmpNum(a,b) { return a-b }
function $AsIntf(o,i) {
	if (o===null) return null;
	var r = o.ClassType.$Intf[i].map(function (e) {
		return function () {
			var arg=Array.prototype.slice.call(arguments);
			arg.splice(0,0,o);
			return e.apply(o, arg);
		}
	});
	r.O = o;
	return r;
}
;
function $As(o,c) {
	if ((o===null)||$Is(o,c)) return o;
	throw Exception.Create($New(Exception),"Cannot cast instance of type \""+o.ClassType.$ClassName+"\" to class \""+c.$ClassName+"\"");
}
function $ArraySetLenC(a,n,d) {
	var o=a.length;
	if (o==n) return;
	if (o>n) a.length=n; else for (;o<n;o++) a.push(d());
}
/*

Copyright (C) 2010 by Johannes Baagoe <baagoe@baagoe.org>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

From http://baagoe.com/en/RandomMusings/javascript/
*/
function $alea() {
  return (function(args) {
    var s0 = 0, s1 = 0, s2 = 0, c = 1;

    if (args.length == 0) {
      args = [+new Date];
    }
    var mash = function() {
       var n = 0xefc8249d;
       var mash = function(data) {
         data = data.toString();
         for (var i = 0; i < data.length; i++) {
           n += data.charCodeAt(i);
           var h = 0.02519603282416938 * n;
           n = h >>> 0;
           h -= n;
           h *= n;
           n = h >>> 0;
           h -= n;
           n += h * 0x100000000; // 2^32
         }
         return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
       };
       return mash;
    }();
    s0 = mash(' ');
    s1 = mash(' ');
    s2 = mash(' ');

    for (var i = 0; i < args.length; i++) {
      s0 -= mash(args[i]);
      if (s0 < 0) {
        s0 += 1;
      }
      s1 -= mash(args[i]);
      if (s1 < 0) {
        s1 += 1;
      }
      s2 -= mash(args[i]);
      if (s2 < 0) {
        s2 += 1;
      }
    }
    mash = null;

    var random = function() {
      var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
      s0 = s1;
      s1 = s2;
      return s2 = t - (c = t | 0);
    };
    random.args = args;
    return random;

  } (Array.prototype.slice.call(arguments)));
};/// TGameOpts = class (TObject)
var TGameOpts = {
   $ClassName:"TGameOpts",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.col = null;
      $.ghost = $.rivals = false;
      $.tod = $.weather = "";
   }
   ,Destroy:TObject.Destroy
};
/// TGame = class (TObject)
var TGame = {
   $ClassName:"TGame",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.acc = $.cdT = $.clock = $.finishT = $.finishTime = $.flyT = $.flyZ = $.fpsTime = $.ghostNext = $.invuln = $.last = $.musicI = $.penalty = $.ragT = $.runTime = $.slowT = $.sprayAcc = $.standT = $.timeScale = 0;
      $.animator = $.animS = $.audio = $.audioS = $.boardPos = $.boardQ = $.camera = $.camRig = $.camT = $.capA = $.capB = $.chal = $.composer = $.course = $.envRT = $.FLoopProc = $.frameM = $.frameQ = $.fromBoardPos = $.fromBoardQ = $.gateMarkEl = $.ghost$1 = $.gradePass = $.hd = $.hemi = $.hud = $.hudInfo = $.input = $.lightInv = $.lightRot = $.mountains = $.nrm = $.opts = $.outlinePass = $.particles = $.phys = $.pin = $.preset = $.pst = $.qe = $.ragdoll = $.renderer = $.resort = $.rf = $.rider = $.rp = $.rr = $.rUp = $.scene = $.score = $.skiers = $.sky = $.snapC = $.snowfall = $.sun = $.sunDir = $.terrain = $.tmp = $.tmp2 = $.tmp3 = $.trail = $.trEl = $.trKey = $.trNow = $.trPred = $.trTxt = $.xAxis = null;
      $.autoPreset = $.finished = $.hasGhostRec = $.hasMusicI = $.menuFromTitle = $.paused = false;
      $.bodies = [];
      $.bumpKeys = [];
      $.bumpTimes = [];
      $.cdLast = $.fpsFrames = $.lowCount = $.rank = $.vh = $.vw = 0;
      $.fromJ = [];
      $.ghostRec = [];
      $.presetName = $.riderMode = $.rivalText = $.state = "";
      $.rivals$1 = [];
      $.tagEls = [];
      $.wj = [];
   }
   /// procedure TGame.ApplyAtmosphere()
   ,ApplyAtmosphere:function(Self) {
      var ev = false,
         w$5 = "",
         su,
         fog$2 = null;
      ev = Self.opts.tod == "evening";
      w$5 = Self.opts.weather;
      su = Self.sky.material.uniforms;
      fog$2 = Self.scene.fog;
      if (ev) {
         Self.sunDir.set(-0.88,0.17,0.44).normalize();
      } else {
         Self.sunDir.set(-0.82,0.5,0.12).normalize();
      }
      su.sunPosition.value.copy(Self.sunDir);
      su.turbidity.value = (w$5 == "fog")?12:(w$5 == "snow")?7:(ev)?4.5:2;
      su.rayleigh.value = (w$5 == "fog")?0.5:(w$5 == "snow")?0.9:(ev)?2.6:1.2;
      su.mieCoefficient.value = (ev)?0.004:0.0018;
      su.mieDirectionalG.value = (ev)?0.86:0.9;
      if (Truthy(su.cloudCoverage)) {
         su.cloudCoverage.value = (w$5 == "clear")?0.3:0.9;
         su.cloudDensity.value = (w$5 == "clear")?0.35:0.8;
      }
      Self.sun.color.setHex((ev)?16753242:16770244);
      Self.sun.intensity = ((ev)?2.8:3.3) * ((w$5 == "fog")?0.35:(w$5 == "snow")?0.6:1);
      Self.hemi.color.setHex((ev)?9277398:10732277);
      Self.hemi.groundColor.setHex((ev)?15979202:15659768);
      Self.hemi.intensity = (w$5 == "clear")?0.62:0.9;
      if (w$5 == "clear") {
         fog$2.color.setHex((ev)?14926774:12768750);
         fog$2.density = 0.0011;
      } else if (w$5 == "snow") {
         fog$2.color.setHex((ev)?13483199:13884390);
         fog$2.density = 0.0034;
      } else {
         fog$2.color.setHex((ev)?14339015:14673388);
         fog$2.density = 0.0075;
      }
      TMountains.SetFade(Self.mountains,(w$5 == "clear")?0:(w$5 == "snow")?0.6:1,fog$2.color);
      TSnowfall.SetStorm(Self.snowfall,w$5 == "snow");
      Self.snowfall.points.visible = Self.preset.snowfall$1 || w$5 == "snow";
      Self.lightRot.lookAt(Self.sunDir,new THREE.Vector3(),new THREE.Vector3(0,1,0));
      Self.lightInv.copy(Self.lightRot).invert();
      TGame.BuildEnvironment(Self,su);
   }
   /// procedure TGame.ApplyPreset(name: String; initial: Boolean = False)
   ,ApplyPreset:function(Self, name$8, initial) {
      var dpr = 0,
         pr$1 = null,
         a$110 = 0,
         b$8 = null,
         a$111 = [];
      pr$1 = PresetByName(name$8);
      Self.presetName = name$8;
      Self.preset = pr$1;
      dpr = window.devicePixelRatio;
      if (dpr == 0) {
         dpr = 1;
      }
      Self.renderer.setPixelRatio(Min$_Float_Float_(dpr,pr$1.pr));
      Self.sun.shadow.mapSize.set(pr$1.shadow$1,pr$1.shadow$1);
      if (Truthy(Self.sun.shadow.map)) {
         Self.sun.shadow.map.dispose();
         Self.sun.shadow.map = null;
      }
      Self.terrain.treeCount = pr$1.trees;
      Self.terrain.ahead = pr$1.ahead$1;
      Self.snowfall.points.visible = pr$1.snowfall$1 || Self.opts.weather == "snow";
      TParticleSystem.SetLimit(Self.particles,pr$1.particles$1);
      TGame.BuildComposer(Self);
      TTerrain.RebuildAll(Self.terrain,(Self.state == "title")?(Self.flyZ != 0)?Self.flyZ:30:Self.phys.pos$2.z,Self.camera.position);
      a$111 = document.querySelectorAll("#optPreset button");
      var $temp1;
      for(a$110=0,$temp1=a$111.length;a$110<$temp1;a$110++) {
         b$8 = a$111[a$110];
         b$8.classList.toggle("sel",(String(b$8.dataset.v)) == name$8);
      }
      Self.fpsFrames = 0;
      Self.fpsTime = -1;
      Self.lowCount = 0;
      if (!(initial)) {
         TGame.SaveSettings(Self);
      }
   }
   /// procedure TGame.AutoAdjust(dtReal: Float)
   ,AutoAdjust:function(Self, dtReal) {
      var fps = 0,
         order$1 = [],
         i$6 = 0;
      ++Self.fpsFrames;
      Self.fpsTime += dtReal;
      if (Self.fpsTime < 2.5) {
         return;
      }
      fps = Self.fpsFrames / Self.fpsTime;
      Self.fpsFrames = 0;
      Self.fpsTime = 0;
      if ((!(Self.autoPreset)) || Self.state != "play") {
         return;
      }
      if (fps < 48) {
         ++Self.lowCount;
         if (Self.lowCount >= 2) {
            order$1 = ["low", "medium", "high"];
            i$6 = order$1.indexOf(Self.presetName);
            if (i$6 > 0) {
               TGame.ApplyPreset(Self,order$1[i$6 - 1],false);
               THud.Toast(Self.hud,"Grafik: "+order$1[i$6 - 1]+" (auto, "+IntToStr$_Integer_(Round(fps))+" FPS)");
            }
            Self.lowCount = 0;
         }
      } else {
         Self.lowCount = 0;
      }
   }
   /// procedure TGame.BeginStandUp()
   ,BeginStandUp:function(Self) {
      var z$13 = 0,
         W$1 = 0,
         d$8 = 0,
         c$7 = null,
         pel = null;
      c$7 = Self.course;
      pel = Self.ragdoll.p$4[0];
      z$13 = ClampF(pel.z,4,c$7.zf + 150);
      W$1 = TCourse.width$4(c$7,z$13);
      d$8 = ClampF(pel.x - TCourse.cx(c$7,z$13),-(W$1 - 3),W$1 - 3);
      z$13 = TCourse.safeZ(c$7,z$13,d$8);
      for(let i$6=0;i$6<=16;i$6++) {
         Self.fromJ[i$6].copy(Self.ragdoll.p$4[i$6]);
      }
      Self.fromBoardPos.copy(Self.boardPos);
      Self.fromBoardQ.copy(Self.boardQ);
      TRiderPhysics.Reset$2(Self.phys,z$13);
      Self.phys.pos$2.x = TCourse.cx(c$7,z$13) + d$8;
      Self.phys.pos$2.y = TCourse.height$4(c$7,Self.phys.pos$2.x,z$13);
      Self.phys.prevPos.copy(Self.phys.pos$2);
      Self.phys.frozen = true;
      Self.riderMode = "standup";
      Self.standT = 0;
      TTrail.BreakLine(Self.trail);
   }
   /// procedure TGame.BindUI()
   ,BindUI:function(Self) {
      var click = null,
         segOpt = null,
         palJacket = [],
         palPants = [],
         palHelmet = [],
         palDeck = [],
         swatch = null,
         th$1 = "",
         a$110 = 0,
         t$11 = null;
      click = function () {
         TAudioEngine.Click(Self.audio);
      };
      El("bStart").onclick = function (e$1) {
         if (document.body.classList.contains("touch")) {
            try { var r = document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); r && r.then(function () { return screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape'); }).catch(function () {}); } catch (e) {}
         }
         TAudioEngine.Init$1(Self.audio);
         TAudioEngine.SetVolumes(Self.audio,Self.audio.vol,Self.audio.musicVol);
         click();
         TGame.StartRun(Self);
      };
      El("bTitleOpts").onclick = function (e$1) {
         TAudioEngine.Init$1(Self.audio);
         click();
         TGame.OpenMenu(Self,true);
      };
      El("bResume").onclick = function (e$1) {
         click();
         TGame.CloseMenu(Self);
      };
      El("bRestart").onclick = function (e$1) {
         click();
         TGame.CloseMenu(Self);
         TGame.StartRun(Self);
      };
      El("bMenu").onclick = function (e$1) {
         click();
         TGame.CloseMenu(Self);
         TGame.ToTitle(Self);
      };
      El("bAgain").onclick = function (e$1) {
         click();
         El("finish").classList.remove("on");
         TGame.StartRun(Self);
      };
      El("bFinMenu").onclick = function (e$1) {
         click();
         El("finish").classList.remove("on");
         TGame.ToTitle(Self);
      };
      OnClickEach(document.querySelectorAll("#optPreset button"),function (b$8) {
         click();
         TGame.ApplyPreset(Self,String(b$8.dataset.v),false);
      });
      OnClickEach(document.querySelectorAll("#optAuto button"),function (b$8) {
         click();
         Self.autoPreset = (String(b$8.dataset.v)) == "1";
         TGame.SyncMenu(Self);
         TGame.SaveSettings(Self);
      });
      OnClickEach(document.querySelectorAll("#optCam button"),function (b$8) {
         click();
         TGame.SetCam(Self,StrToInt$_String_(String(b$8.dataset.v)));
      });
      segOpt = function (id$4, key$2, apply) {
         OnClickEach(document.querySelectorAll("#"+id$4+" button"),function (b$8) {
            var v$4 = "";
            click();
            v$4 = String(b$8.dataset.v);
            if (key$2 == "tod") {
               Self.opts.tod = v$4;
            } else if (key$2 == "weather") {
               Self.opts.weather = v$4;
            } else if (key$2 == "ghost") {
               Self.opts.ghost = v$4 == "1";
            } else if (key$2 == "rivals") {
               Self.opts.rivals = v$4 == "1";
            }
            TGame.SyncMenu(Self);
            TGame.SaveSettings(Self);
            if (apply) {
               apply();
            }
         });
      };
      segOpt("optTod","tod",$Event0(Self,TGame.ApplyAtmosphere));
      segOpt("optWeather","weather",$Event0(Self,TGame.ApplyAtmosphere));
      segOpt("optGhost","ghost",null);
      segOpt("optRivals","rivals",null);
      palJacket = [14697516, 16747546, 16765503, 3066993, 2059263, 8086015, 1120295];
      palPants = [2241618, 1777450, 3817291, 4860970, 14474460, 2968109];
      palHelmet = [15856630, 1118481, 16726832, 2003199, 16766474, 3066993];
      palDeck = [1779256, 1118481, 15856630, 2059263, 8086015, 3066993];
      swatch = function (part, id$4, pal) {
         var html = "",
            a$111 = 0,
            h$3 = 0;
         html = "";
         var $temp2;
         for(a$111=0,$temp2=pal.length;a$111<$temp2;a$111++) {
            h$3 = pal[a$111];
            html += "<button data-v=\""+IntToStr$_Integer_(h$3)+"\" style=\"background:#"+HexColor(h$3)+"\"><\/button>";
         }
         El(id$4).innerHTML = html;
         OnClickEach(El(id$4).querySelectorAll("button"),function (b$8) {
            var v$4 = 0;
            click();
            v$4 = StrToInt$_String_(String(b$8.dataset.v));
            if (part == "jacket") {
               Self.opts.col.jacket = v$4;
            } else if (part == "pants") {
               Self.opts.col.pants = v$4;
            } else if (part == "helmet") {
               Self.opts.col.helmet = v$4;
            } else {
               Self.opts.col.deck = v$4;
            }
            TRider.SetColors(Self.rider,Self.opts.col);
            TGame.SyncMenu(Self);
            TGame.SaveSettings(Self);
         });
      };
      swatch("jacket","colJacket",palJacket);
      swatch("pants","colPants",palPants);
      swatch("helmet","colHelmet",palHelmet);
      swatch("deck","colDeck",palDeck);
      El("optVol").oninput = function (e$1) {
         TAudioEngine.SetVolumes(Self.audio,e$1.target.valueAsNumber,Self.audio.musicVol);
         TGame.SaveSettings(Self);
      };
      El("optMus").oninput = function (e$1) {
         TAudioEngine.SetVolumes(Self.audio,Self.audio.vol,e$1.target.valueAsNumber);
         TGame.SaveSettings(Self);
      };
      th$1 = "";
      var $temp3;
      for(a$110=0,$temp3=TRACKS.length;a$110<$temp3;a$110++) {
         t$11 = TRACKS[a$110];
         th$1 += "<button data-v=\""+t$11.id$1+"\""+((t$11.id$1 == TRACK_ID)?" class=\"sel\"":"")+">"+t$11.name$3+"<\/button>";
      }
      El("optTrack").innerHTML = th$1;
      OnClickEach(document.querySelectorAll("#optTrack button"),function (b$8) {
         var raw,
            st$3;
         if ((String(b$8.dataset.v)) == TRACK_ID) {
            return;
         }
         click();
         try {
            raw = localStorage.getItem("carveline.settings");
            st$3 = JSON.parse((Truthy(raw))?String(raw):"{}");
            st$3.track = b$8.dataset.v;
            localStorage.setItem("carveline.settings",JSON.stringify(st$3));
         } catch ($e) {
            /* null */
         }
         window.location.reload();
      });
      TGame.SyncMenu(Self);
   }
   /// procedure TGame.BoardFromJoints(w: TJoints; pos: JVector3; q: JQuaternion)
   ,BoardFromJoints:function(Self, w$5, pos$5, q$2) {
      var x$18 = null,
         mid = null,
         y$13 = null,
         z$13 = null;
      x$18 = Self.tmp.subVectors(w$5[13],w$5[16]).normalize();
      mid = Self.tmp2.addVectors(w$5[13],w$5[16]).multiplyScalar(0.5);
      y$13 = Self.tmp3.subVectors(w$5[0],mid);
      y$13.addScaledVector(x$18,-y$13.dot(x$18)).normalize();
      z$13 = Self.snapC.crossVectors(x$18,y$13);
      Self.frameM.makeBasis(x$18,y$13,z$13);
      q$2.setFromRotationMatrix(Self.frameM);
      pos$5.copy(mid).addScaledVector(y$13,-0.17);
   }
   /// procedure TGame.BuildComposer()
   ,BuildComposer:function(Self) {
      var w$5 = 0,
         h$3 = 0,
         old = null,
         c$7 = null,
         a$110 = 0,
         rt = null,
         ol = null,
         a$111 = [null,null];
      if (!!Self.composer) {
         old = Self.composer;
         for (var p of (old).passes) if (p.dispose) p.dispose();
         old.dispose();
      }
      Self.composer = new EffectComposer(Self.renderer);
      c$7 = Self.composer;
      w$5 = window.innerWidth;
      h$3 = window.innerHeight;
      a$111 = [c$7.renderTarget1, c$7.renderTarget2];
      for(a$110=0;a$110<=1;a$110++) {
         rt = a$111[a$110];
         rt.depthTexture = new THREE.DepthTexture(w$5,h$3);
         rt.depthTexture.type = 1014;
      }
      c$7.setPixelRatio(Self.renderer.getPixelRatio());
      c$7.setSize(w$5,h$3);
      c$7.addPass(new RenderPass(Self.scene,Self.camera));
      Self.outlinePass = new ShaderPass(OutlineShader());
      ol = Self.outlinePass;
      var olRender = (ol).render.bind(ol);
    (ol).render = function (ren, wb, rb, dt, mask) { (ol).uniforms.tDepth.value = rb.depthTexture; olRender(ren, wb, rb, dt, mask); };
      ol.uniforms.cameraNear.value = Self.camera.near;
      ol.uniforms.cameraFar.value = Self.camera.far;
      TGame.UpdateOutlineTexel(Self);
      c$7.addPass(ol);
      if (Self.preset.bloom) {
         c$7.addPass(new UnrealBloomPass(new THREE.Vector2(w$5,h$3),0.3,0.4,3.2));
      }
      Self.gradePass = new ShaderPass(GradeShader());
      c$7.addPass(Self.gradePass);
      if (Self.preset.smaa) {
         c$7.addPass(new SMAAPass());
      }
      c$7.addPass(new OutputPass());
   }
   /// procedure TGame.BuildEnvironment(su: Variant)
   ,BuildEnvironment:function(Self, su) {
      var pm = null,
         es = null,
         sky2 = null,
         u2,
         ground = null,
         rt = null;
      pm = new THREE.PMREMGenerator(Self.renderer);
      es = new THREE.Scene();
      sky2 = new Sky();
      sky2.scale.setScalar(900);
      ClampSky(sky2);
      u2 = sky2.material.uniforms;
      for (var k in su) if ((u2)[k]) (u2)[k].value = (su)[k].value;
      es.add(sky2);
      ground = new THREE.Mesh(new THREE.CircleGeometry(800,16,0,6.28318530717959),new THREE.MeshBasicMaterial({
         "color" : 13621734
      }));
      ground.rotation.x = -1.5707963267949;
      ground.position.y = -20;
      es.add(ground);
      rt = pm.fromScene(es,0.04,0.1,2000);
      if (!!Self.envRT) {
         Self.envRT.dispose();
      }
      Self.envRT = rt;
      Self.scene.environment = rt.texture;
      AsVar(Self.scene).environmentIntensity = 0.5;
      pm.dispose();
   }
   /// procedure TGame.Buzz(ms: Integer)
   ,Buzz:function(Self, ms) {
      if (document.body.classList.contains("touch")) {
         if (navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {}
      }
   }
   /// procedure TGame.CloseMenu()
   ,CloseMenu:function(Self) {
      El("pause").classList.remove("on");
      Self.paused = false;
      Self.last = performance.now();
   }
   /// procedure TGame.Contacts(dt: Float)
   ,Contacts:function(Self, dt) {
      var n$7 = 0,
         i$6 = 0,
         jx = 0,
         k$4 = 0,
         rad2 = 0,
         d$8 = 0,
         va = 0,
         vb = 0,
         closing = 0,
         push = 0,
         avg = 0,
         BB = [],
         p$7 = null,
         add$4 = null,
         a$110 = 0,
         rv$1 = null,
         o$1 = null,
         nr = null,
         A$2 = null,
         Bj = null,
         pa = null,
         pb = null,
         key$2 = "",
         ram = null,
         a$111 = [];
      k$4 = 0;
      while (k$4 < Self.bumpKeys.length) {
         if (Self.bumpTimes[k$4] - dt <= 0) {
            Self.bumpKeys.splice(k$4,1)
            ;
            Self.bumpTimes.splice(k$4,1)
            ;
         } else {
            Self.bumpTimes[k$4]=Self.bumpTimes[k$4] - dt;
            ++k$4;
         }
      }
      if (Self.state != "play") {
         return;
      }
      BB = Self.bodies;
      p$7 = Self.phys;
      n$7 = 0;
      add$4 = function (ph$2, rv$2) {
         var o$2 = null;
         o$2 = BB[n$7];
         ++n$7;
         o$2.phys$1 = ph$2;
         o$2.rv = rv$2;
         o$2.a.copy(ph$2.pos$2).addScaledVector(ph$2.boardUp,0.25);
         o$2.b.copy(ph$2.pos$2).addScaledVector(ph$2.boardUp,1.45);
      };
      if (Self.riderMode == "ride" && Self.invuln <= 0 && (!(Self.finished))) {
         add$4(p$7,null);
      }
      a$111 = Self.rivals$1;
      var $temp4;
      for(a$110=0,$temp4=a$111.length;a$110<$temp4;a$110++) {
         rv$1 = a$111[a$110];
         if (rv$1.active$2 && rv$1.downT <= 0 && (!(rv$1.finished$1))) {
            add$4(rv$1.phys$2,rv$1);
            o$1 = BB[n$7 - 1];
            if (!!TSkierAI.CheckHit(Self.skiers,o$1.a,o$1.b,rv$1.phys$2.pos$2.z)) {
               TRival.KnockDown(rv$1);
               --n$7;
            }
         }
      }
      rad2 = 0.7;
      nr = Self.nrm;
      var $temp5;
      for(i$6=0,$temp5=n$7;i$6<$temp5;i$6++) {
         var $temp6;
         for(jx=i$6 + 1,$temp6=n$7;jx<$temp6;jx++) {
            A$2 = BB[i$6];
            Bj = BB[jx];
            pa = A$2.phys$1;
            pb = Bj.phys$1;
            if (Abs$_Float_(pa.pos$2.z - pb.pos$2.z) > 3) {
               continue;
            }
            d$8 = SegSegDist(A$2.a,A$2.b,Bj.a,Bj.b);
            if (d$8 >= rad2) {
               continue;
            }
            SegClosestDelta(nr);
            nr.setY(0);
            if (nr.lengthSq() < 1E-6) {
               nr.set(pb.pos$2.x - pa.pos$2.x,0,pb.pos$2.z - pa.pos$2.z);
            }
            if (nr.lengthSq() < 1E-6) {
               nr.set(1,0,0);
            }
            nr.normalize();
            va = pa.vel$2.dot(nr);
            vb = pb.vel$2.dot(nr);
            closing = va - vb;
            key$2 = ((!!A$2.rv)?A$2.rv.def.name$6:"P") + ((!!Bj.rv)?Bj.rv.def.name$6:"P");
            if (closing > 7) {
               ram = (va > (-vb))?A$2:Bj;
               if (!!ram.rv) {
                  TRival.KnockDown(ram.rv);
               } else {
                  TRiderPhysics.Crash(p$7,"rival");
                  TGame.StartCrash(Self,"rival");
               }
               if (ram === A$2) {
                  pb.vel$2.addScaledVector(nr,1.5);
               } else {
                  pa.vel$2.addScaledVector(nr,-1.5);
               }
               continue;
            }
            push = (rad2 - d$8) * 0.5 + 0.02;
            avg = (va + vb) * 0.5;
            pa.pos$2.addScaledVector(nr,-push);
            pb.pos$2.addScaledVector(nr,push);
            pa.vel$2.addScaledVector(nr,avg - va - 0.8).multiplyScalar(0.985);
            pb.vel$2.addScaledVector(nr,avg - vb + 0.8).multiplyScalar(0.985);
            if ((!A$2.rv || !Bj.rv) && Self.bumpKeys.indexOf(key$2) < 0) {
               Self.bumpKeys.push(key$2);
               Self.bumpTimes.push(0.6);
               TCameraRig.AddTrauma(Self.camRig,0.28);
               TAudioEngine.Landing(Self.audio,0.35);
               TGame.Buzz(Self,25);
               THud.Pop$1(Self.hud,"Rempler",((!!A$2.rv)?A$2.rv:Bj.rv).def.name$6,false);
            }
         }
      }
   }
   /// constructor TGame.Create()
   ,Create$3:function(Self) {
      var cv = null,
         r$7 = null,
         su,
         sc = null,
         a$111 = 0,
         d$8 = null,
         a$110 = 0,
         rv$1 = null,
         bd = null,
         vv = undefined,
         a$113 = [];
      cv = El("c");
      Self.renderer = new THREE.WebGLRenderer({
         "stencil" : false
         ,"powerPreference" : "high-performance"
         ,"canvas" : cv
         ,"antialias" : false
      });
      r$7 = Self.renderer;
      r$7.toneMapping = 4;
      r$7.toneMappingExposure = 0.95;
      r$7.outputColorSpace = "srgb";
      r$7.shadowMap.enabled = true;
      r$7.shadowMap.type = 1;
      Self.scene = new THREE.Scene();
      Self.scene.fog = new THREE.FogExp2(12768750,0.0011);
      Self.camera = new THREE.PerspectiveCamera(62,window.innerWidth / window.innerHeight,0.1,6000);
      Self.sunDir = new THREE.Vector3(-0.82,0.5,0.12).normalize();
      Self.sky = new Sky();
      Self.sky.scale.setScalar(4500);
      Self.scene.add(Self.sky);
      ClampSky(Self.sky);
      su = Self.sky.material.uniforms;
      su.turbidity.value = 2;
      su.rayleigh.value = 1.2;
      su.mieCoefficient.value = 0.0018;
      su.mieDirectionalG.value = 0.9;
      su.sunPosition.value.copy(Self.sunDir);
      if (Truthy(su.cloudCoverage)) {
         su.cloudCoverage.value = 0.3;
         su.cloudDensity.value = 0.35;
      }
      TGame.BuildEnvironment(Self,su);
      Self.hemi = new THREE.HemisphereLight(10732277,15659768,0.62);
      Self.scene.add(Self.hemi);
      Self.sun = new THREE.DirectionalLight(16770244,3.3);
      Self.sun.castShadow = true;
      sc = Self.sun.shadow.camera;
      sc.left = -34;
      sc.bottom = -34;
      sc.right = 34;
      sc.top = 34;
      sc.near = 1;
      sc.far = 260;
      Self.sun.shadow.bias = -0.0004;
      Self.sun.shadow.normalBias = 0.04;
      Self.sun.shadow.radius = 2.5;
      Self.scene.add(Self.sun);
      Self.scene.add(Self.sun.target);
      Self.lightRot = new THREE.Matrix4().lookAt(Self.sunDir,new THREE.Vector3(),new THREE.Vector3(0,1,0));
      Self.lightInv = Self.lightRot.clone().invert();
      Self.course = TCourse.Create$141($New(TCourse));
      Self.terrain = TTerrain.Create$67($New(TTerrain),Self.scene,Self.course);
      Self.resort = TResort.Create$68($New(TResort),Self.scene,Self.course);
      Self.terrain.resort$1 = Self.resort;
      Self.mountains = TMountains.Create$152($New(TMountains),Self.scene);
      Self.chal = TChallenges.Create$164($New(TChallenges),Self.scene,Self.course);
      MakeGate(Self.scene,Self.course,1.5,"START","#1d2a44");
      MakeGate(Self.scene,Self.course,Self.course.zf,"ZIEL "+UC(183)+" FINISH","#e0442c");
      Self.snowfall = TSnowfall.Create$151($New(TSnowfall),Self.scene,2200);
      Self.particles = TParticleSystem.Create$161($New(TParticleSystem),Self.scene,PRESET_HIGH.particles$1);
      Self.trail = TTrail.Create$160($New(TTrail),Self.scene,700);
      Self.rider = TRider.Create$149($New(TRider),Self.scene,null);
      Self.animator = TRiderAnimator.Create$144($New(TRiderAnimator));
      Self.ragdoll = TRagdoll.Create$145($New(TRagdoll),Self.course);
      Self.phys = TRiderPhysics.Create$150($New(TRiderPhysics),Self.course,Self.terrain);
      Self.phys.onEvent = $Event3(Self,TGame.OnPhysEvent);
      Self.skiers = TSkierAI.Create$143($New(TSkierAI),Self.scene,Self.course);
      Self.skiers.onNearMiss = $Event2(Self,TGame.OnNearMiss);
      Self.input = TInput.Create$156($New(TInput));
      Self.audio = TAudioEngine.Create$159($New(TAudioEngine));
      Self.hud = THud.Create$158($New(THud));
      Self.score = TScore.Create$157($New(TScore),Self.hud,Self.audio);
      Self.camRig = TCameraRig.Create$163($New(TCameraRig),Self.camera,Self.course);
      Self.wj = NewJoints();
      Self.fromJ = NewJoints();
      Self.rp = new THREE.Vector3();
      Self.rUp = new THREE.Vector3();
      Self.rf = new THREE.Vector3();
      Self.rr = new THREE.Vector3();
      Self.hd = new THREE.Vector3();
      Self.frameM = new THREE.Matrix4();
      Self.frameQ = new THREE.Quaternion();
      Self.boardPos = new THREE.Vector3();
      Self.boardQ = new THREE.Quaternion();
      Self.fromBoardPos = new THREE.Vector3();
      Self.fromBoardQ = new THREE.Quaternion();
      Self.qe = new THREE.Quaternion();
      Self.xAxis = new THREE.Vector3(1,0,0);
      Self.capA = new THREE.Vector3();
      Self.capB = new THREE.Vector3();
      Self.tmp = new THREE.Vector3();
      Self.tmp2 = new THREE.Vector3();
      Self.tmp3 = new THREE.Vector3();
      Self.snapC = new THREE.Vector3();
      Self.animS = TAnimState.Create$147($New(TAnimState));
      Self.animS.grounded = true;
      Self.animS.idle = true;
      Self.pst = TObject.Create($New(TPoseState));
      Self.pst.pos$1 = Self.rp;
      Self.pst.up$2 = Self.rUp;
      Self.pst.vel$1 = Self.phys.vel$2;
      Self.pst.anim = Self.animS;
      Self.opts = TObject.Create($New(TGameOpts));
      Self.opts.ghost = true;
      Self.opts.rivals = true;
      Self.opts.tod = "noon";
      Self.opts.weather = "clear";
      Self.opts.col = TRiderColors.Create$148($New(TRiderColors),14697516,2241618,15856630,1779256);
      Self.ghost$1 = TGhost.Create$154($New(TGhost),Self.scene);
      Self.hasGhostRec = false;
      var $temp7;
      for(a$111=0,$temp7=RIVAL_DEFS.length;a$111<$temp7;a$111++) {
         d$8 = RIVAL_DEFS[a$111];
         Self.rivals$1.push(TRival.Create$153($New(TRival),Self.scene,Self.course,Self.terrain,d$8));
      }
      Self.rivalText = "";
      a$113 = Self.rivals$1;
      var $temp8;
      for(a$110=0,$temp8=a$113.length;a$110<$temp8;a$110++) {
         rv$1 = a$113[a$110];
         rv$1.onDown = function (pos$5, vel$5) {
            TParticleSystem.Burst$1(Self.particles,pos$5,vel$5,60,4,3,1.4,0.5);
         };
      }
      for(let i$6=0;i$6<=2;i$6++) {
         bd = TObject.Create($New(TBody));
         bd.a = new THREE.Vector3();
         bd.b = new THREE.Vector3();
         Self.bodies.push(bd);
      }
      Self.nrm = new THREE.Vector3();
      Self.camT = TCamTarget.Create$162($New(TCamTarget));
      Self.camT.grounded$3 = true;
      Self.pin = TObject.Create($New(TControls));
      Self.audioS = TObject.Create($New(TAudioState));
      Self.audioS.grounded$2 = true;
      Self.hudInfo = TObject.Create($New(THudInfo));
      Self.state = "title";
      Self.paused = false;
      Self.riderMode = "ride";
      Self.acc = 0;
      Self.timeScale = 1;
      Self.slowT = 0;
      Self.runTime = 0;
      Self.penalty = 0;
      Self.finished = false;
      Self.finishTime = 0;
      Self.finishT = 0;
      Self.invuln = 0;
      Self.flyT = 0;
      Self.flyZ = 0;
      Self.sprayAcc = 0;
      Self.clock = 0;
      Self.last = performance.now();
      Self.presetName = "high";
      Self.autoPreset = true;
      Self.fpsFrames = 0;
      Self.fpsTime = 0;
      Self.lowCount = 0;
      TGame.LoadSettings(Self);
      TRiderPhysics.Reset$2(Self.phys,4);
      Self.phys.frozen = true;
      TGame.ApplyPreset(Self,Self.presetName,true);
      TGame.ApplyAtmosphere(Self);
      TRider.SetColors(Self.rider,Self.opts.col);
      TGame.BindUI(Self);
      TGame.OnResize(Self);
      window.addEventListener("resize",function (e$1) {
         TGame.OnResize(Self);
      });
      window.addEventListener("orientationchange",function (e$1) {
         TGame.OnResize(Self);
      });
      vv = window.visualViewport;
      if (Truthy(vv)) {
         vv.addEventListener("resize",function (e$1) {
            TGame.OnResize(Self);
         });
      }
      TSkierAI.Reset$1(Self.skiers,20);
      TGame.ShowBest(Self);
      Self.FLoopProc = $Event1(Self,TGame.Loop);
      requestAnimationFrame(Self.FLoopProc);
      return Self
   }
   /// procedure TGame.EmitRideFx(FIX: Float)
   ,EmitRideFx:function(Self, FIX) {
      var es = 0,
         skidN = 0,
         rate = 0,
         along = 0,
         outv = 0,
         upv = 0,
         bx = 0,
         by$2 = 0,
         bz = 0,
         p$7 = null,
         f$7 = null,
         r$7 = null,
         n$7 = null;
      p$7 = Self.phys;
      if ((!(p$7.grounded$1)) || p$7.speed$2 < 3) {
         if (!(p$7.grounded$1)) {
            TTrail.BreakLine(Self.trail);
         }
         return;
      }
      es = SignF(p$7.edge$3);
      f$7 = p$7.f$6;
      r$7 = p$7.r$6;
      n$7 = p$7.n$4;
      Self.tmp.copy(p$7.pos$2).addScaledVector(r$7,es * 0.1 * Min$_Float_Float_(1,Abs$_Float_(p$7.edge$3) * 3));
      skidN = ClampF(p$7.skid / 3.5,0,1);
      TTrail.Add$3(Self.trail,Self.tmp,r$7,n$7,Lerp(0.07,0.36,skidN),skidN,Self.clock);
      rate = (p$7.skid * 16 + Max$_Float_Float_(0,p$7.edgePressure - 0.25) * p$7.speed$2 * 2.4) * (Self.preset.particles$1 / 4000 + 0.3);
      Self.sprayAcc += rate * FIX;
      while (Self.sprayAcc >= 1) {
         Self.sprayAcc -= 1;
         along = (Random() - 0.5) * 1.3;
         outv = (-es) * (1.5 + p$7.skid * 0.55 + Random() * 1.5);
         upv = 1 + Random() * 2.2 + p$7.skid * 0.25;
         bx = p$7.pos$2.x + r$7.x * es * 0.13 + f$7.x * along;
         by$2 = p$7.pos$2.y + 0.05;
         bz = p$7.pos$2.z + r$7.z * es * 0.13 + f$7.z * along;
         TParticleSystem.Emit$2(Self.particles,bx,by$2,bz,p$7.vel$2.x * 0.55 + r$7.x * outv + n$7.x * upv + Random() - 0.5,p$7.vel$2.y * 0.55 + r$7.y * outv + n$7.y * upv,p$7.vel$2.z * 0.55 + r$7.z * outv + n$7.z * upv + Random() - 0.5,0.6 + Random() * 0.7,0.12 + Random() * 0.18 + p$7.skid * 0.02);
      }
   }
   /// procedure TGame.FillCamTarget()
   ,FillCamTarget:function(Self) {
      var t$11 = null,
         p$7 = null;
      t$11 = Self.camT;
      p$7 = Self.phys;
      t$11.speed$5 = (Self.riderMode == "ride")?p$7.speed$2:Self.ragdoll.speed$1 * 0.5;
      t$11.grounded$3 = p$7.grounded$1;
      t$11.latAcc$2 = p$7.latAcc$1;
      t$11.crashed = Self.riderMode != "ride";
      if (Self.riderMode == "ragdoll") {
         t$11.focus$2.copy(Self.ragdoll.p$4[0]);
         t$11.vel$4.set(0,0,0);
      } else {
         t$11.focus$2.copy(Self.rp);
         t$11.focus$2.y += 0.3;
         t$11.vel$4.copy(p$7.vel$2);
      }
      t$11.head$2.copy(Self.wj[3]);
      t$11.lookDir.subVectors(Self.wj[4],Self.wj[3]).normalize();
      t$11.heading.set(Sin(p$7.yaw$2),0,Cos(p$7.yaw$2));
   }
   /// function TGame.GetBest() : Variant
   ,GetBest:function(Self) {
      var Result = undefined;
      var raw;
      try {
         raw = localStorage.getItem(StoreKey("best"));
         Result = JSON.parse((Truthy(raw))?String(raw):"null");
      } catch ($e) {
         Result = null;
      }
      return Result
   }
   /// procedure TGame.LoadSettings()
   ,LoadSettings:function(Self) {
      var raw,
         s$12,
         o$1;
      try {
         raw = localStorage.getItem("carveline.settings");
         s$12 = JSON.parse((Truthy(raw))?String(raw):"{}");
         if (Truthy(s$12.preset) && !!PresetByName(String(s$12.preset))) {
            Self.presetName = String(s$12.preset);
         }
         if (JsTypeOf(s$12.auto) == "boolean") {
            Self.autoPreset = $VarToBool(s$12.auto);
         }
         if (JsTypeOf(s$12.vol) == "number") {
            Self.audio.vol = Number(s$12.vol);
            El("optVol").value = String(s$12.vol);
         }
         if (JsTypeOf(s$12.mus) == "number") {
            Self.audio.musicVol = Number(s$12.mus);
            El("optMus").value = String(s$12.mus);
         }
         if (JsTypeOf(s$12.cam) == "number") {
            Self.camRig.mode = $VarToInt(s$12.cam,"") % 3;
         }
         if (Truthy(s$12.opts)) {
            o$1 = s$12.opts;
            if (JsTypeOf(o$1.ghost) == "boolean") {
               Self.opts.ghost = $VarToBool(o$1.ghost);
            }
            if (JsTypeOf(o$1.rivals) == "boolean") {
               Self.opts.rivals = $VarToBool(o$1.rivals);
            }
            if (JsTypeOf(o$1.tod) == "string") {
               Self.opts.tod = String(o$1.tod);
            }
            if (JsTypeOf(o$1.weather) == "string") {
               Self.opts.weather = String(o$1.weather);
            }
            if (Truthy(o$1.col)) {
               if (JsTypeOf(o$1.col.jacket) == "number") {
                  Self.opts.col.jacket = $VarToInt(o$1.col.jacket,"");
               }
               if (JsTypeOf(o$1.col.pants) == "number") {
                  Self.opts.col.pants = $VarToInt(o$1.col.pants,"");
               }
               if (JsTypeOf(o$1.col.helmet) == "number") {
                  Self.opts.col.helmet = $VarToInt(o$1.col.helmet,"");
               }
               if (JsTypeOf(o$1.col.deck) == "number") {
                  Self.opts.col.deck = $VarToInt(o$1.col.deck,"");
               }
            }
         }
      } catch ($e) {
         /* null */
      }
   }
   /// procedure TGame.Loop(now: Float)
   ,Loop:function(Self, now$2) {
      var dtReal = 0,
         dt = 0,
         cz$2 = 0,
         mz = 0,
         grd = 0,
         kmh = 0,
         mi = 0,
         au = null,
         hi$1 = null;
      requestAnimationFrame(Self.FLoopProc);
      if (window.innerWidth != Self.vw || window.innerHeight != Self.vh) {
         TGame.OnResize(Self);
      }
      dtReal = ClampF((now$2 - Self.last) / 1000,0,0.1);
      Self.last = now$2;
      TInput.Update$7(Self.input,dtReal);
      if (TInput.Consume(Self.input,"pause") && (Self.state == "play" || Self.state == "countdown")) {
         if (Self.paused) {
            TGame.CloseMenu(Self);
         } else {
            TGame.OpenMenu(Self,false);
         }
      }
      if (TInput.Consume(Self.input,"camera")) {
         TGame.SetCam(Self,(Self.camRig.mode + 1) % 3);
      }
      if (Self.paused) {
         Self.composer.render();
         return;
      }
      if (Self.slowT > 0) {
         Self.slowT -= dtReal;
      }
      Self.timeScale = Damp(Self.timeScale,(Self.slowT > 0)?0.35:1,14,dtReal);
      dt = dtReal * Self.timeScale;
      Self.clock += dt;
      SHARED.time.value = Self.clock;
      TGame.AutoAdjust(Self,dtReal);
      if (Self.state == "title") {
         TGame.UpdateTitle(Self,dt,dtReal);
      } else {
         TGame.UpdateRun(Self,dt,dtReal);
      }
      cz$2 = (Self.state == "title")?Self.flyZ:Max$_Float_Float_(Self.phys.pos$2.z,(Self.riderMode == "ragdoll")?Self.ragdoll.p$4[0].z:0);
      TTerrain.Update(Self.terrain,cz$2,Self.camera.position,1);
      TResort.UpdateVisibility(Self.resort,cz$2 - 128,cz$2 + (Self.terrain.ahead - 0.5) * 64);
      TGame.UpdateSun(Self,(Self.state == "title")?Self.camera.position:Self.rp);
      mz = Self.camera.position.z;
      grd = (TCourse.y0(Self.course,mz + 900) - TCourse.y0(Self.course,mz - 100)) / 1000;
      TMountains.Update$5(Self.mountains,Self.camera.position,(Self.state == "title")?Self.camera.position.y - 10:Self.rp.y,grd);
      Self.sky.position.copy(Self.camera.position);
      TSnowfall.Update$4(Self.snowfall,Self.camera.position);
      TResort.Update$1(Self.resort,dtReal);
      SHARED.sunView.value.copy(Self.sunDir).transformDirection(Self.camera.matrixWorldInverse);
      TParticleSystem.Update$11(Self.particles,dt);
      TSkierAI.Render(Self.skiers);
      kmh = Self.phys.speed$2 * 3.6;
      Self.gradePass.uniforms.uTime.value = FMod(Self.clock,100);
      Self.gradePass.uniforms.uBlur.value = (Self.preset.blur$2 && Self.state != "title")?ClampF((kmh - 55) / 70,0,1) * 0.024:0;
      au = Self.audioS;
      au.speed$4 = (Self.state == "title")?0:Self.phys.speed$2;
      au.grounded$2 = Self.phys.grounded$1;
      au.riding$1 = Self.state != "title" && Self.riderMode == "ride";
      au.edgePressure$1 = Self.phys.edgePressure;
      au.skid$1 = Self.phys.skid;
      TAudioEngine.Update$10(Self.audio,au,dtReal);
      mi = 0.06;
      if (Self.state == "countdown") {
         mi = 0.22;
      } else if (Self.state == "finished") {
         mi = 0.3;
      } else if (Self.state == "play") {
         if (Self.riderMode != "ride") {
            mi = 0.15;
         } else {
            mi = ClampF(0.2 + (kmh - 20) / 110 * 0.6,0.2,0.8) + (Self.score.combo - 1) * 0.03 + ((Self.phys.grounded$1)?0:0.08) + ((Self.timeScale < 0.9)?0.06:0) + ((Self.phys.pos$2.z > Self.course.zf * 0.85)?0.15:0);
         }
      }
      Self.musicI = Damp((Self.hasMusicI)?Self.musicI:mi,ClampF(mi,0,1),1.2,dtReal);
      Self.hasMusicI = true;
      TAudioEngine.MusicIntensity(Self.audio,Self.musicI);
      hi$1 = Self.hudInfo;
      hi$1.timeScale$1 = Self.timeScale;
      hi$1.riding = Self.riderMode == "ride";
      hi$1.speed$3 = Self.phys.speed$2;
      hi$1.finished$2 = Self.finished;
      hi$1.finishTime$1 = Self.finishTime;
      hi$1.penalty$1 = Self.penalty;
      hi$1.runTime$1 = Self.runTime;
      hi$1.score$2 = Self.score;
      hi$1.posZ = Self.phys.pos$2.z;
      hi$1.gatesPassed = Self.chal.passed;
      hi$1.gatesTotal = Self.chal.gates.length;
      hi$1.starsGot = Self.chal.got$1;
      hi$1.starsTotal = Self.chal.stars$1.length;
      hi$1.rivalText$1 = Self.rivalText;
      THud.Update$9(Self.hud,dtReal,hi$1);
      Self.composer.render();
   }
   /// procedure TGame.OnGate(ok: Boolean)
   ,OnGate:function(Self, ok) {
      var v$4 = 0;
      if (ok) {
         v$4 = TScore.Add$2(Self.score,150);
         TScore.Bump(Self.score,0.3);
         THud.Pop$1(Self.hud,"Tor","+" + IntToStr$_Integer_(v$4),false);
         TAudioEngine.Pop$2(Self.audio,1.2);
      } else {
         Self.penalty += 1;
         THud.Pop$1(Self.hud,"Tor verpasst","+"+FmtInt(1)+"s",true);
      }
   }
   /// procedure TGame.OnNearMiss(s: TSkier; d: Float)
   ,OnNearMiss:function(Self, s$12, d$8) {
      if (Self.state != "play" || Self.riderMode != "ride" || Self.finished) {
         return;
      }
      TScore.OnNearMiss$1(Self.score,d$8);
      TAudioEngine.NearMiss(Self.audio);
      TAudioEngine.MusicOvertake(Self.audio);
      Self.slowT = 0.4;
   }
   /// procedure TGame.OnPhysEvent(typ: String; a: Variant; b: Variant)
   ,OnPhysEvent:function(Self, typ$2, a$110, b$8) {
      var i$6 = 0,
         p$7 = null;
      p$7 = Self.phys;
      if (typ$2 == "ollie") {
         TAudioEngine.Ollie(Self.audio);
      } else if (typ$2 == "takeoff") {
         TTrail.BreakLine(Self.trail);
      } else if (typ$2 == "land") {
         i$6 = ClampF((Number(b$8)) / 10,0,1);
         TAudioEngine.Landing(Self.audio,i$6);
         TCameraRig.AddTrauma(Self.camRig,0.1 + i$6 * 0.5);
         TRiderAnimator.Kick(Self.animator,(Number(b$8)) * 0.35);
         Self.tmp.set(0,0,0);
         TParticleSystem.Burst$1(Self.particles,p$7.pos$2,p$7.vel$2,10 + Round(i$6 * 40),2 + i$6 * 3,1.5 + i$6 * 2,1,0.35);
         if (!(Truthy(a$110))) {
            THud.Pop$1(Self.hud,"Wackelig","",true);
            Self.score.comboT = Min$_Float_Float_(Self.score.comboT,1);
         }
         if (i$6 > 0.45) {
            TGame.Buzz(Self,35);
         }
      } else if (typ$2 == "air") {
         if (Self.state == "play" && (!(Self.finished))) {
            TScore.OnAir(Self.score,Number(a$110),Number(b$8),p$7.lastTrick);
         }
      } else if (typ$2 == "bump") {
         TCameraRig.AddTrauma(Self.camRig,Number(a$110));
         TAudioEngine.Landing(Self.audio,0.4);
      }
   }
   /// procedure TGame.OnResize()
   ,OnResize:function(Self) {
      var w$5 = 0,
         h$3 = 0;
      w$5 = window.innerWidth;
      h$3 = window.innerHeight;
      Self.vw = w$5;
      Self.vh = h$3;
      Self.camera.aspect = w$5 / h$3;
      Self.camera.updateProjectionMatrix();
      Self.renderer.setSize(w$5,h$3,false);
      Self.composer.setSize(w$5,h$3);
      TGame.UpdateOutlineTexel(Self);
   }
   /// procedure TGame.OnStar(st: TStar)
   ,OnStar:function(Self, st$3) {
      var v$4 = 0;
      TGame.Buzz(Self,12);
      v$4 = TScore.Add$2(Self.score,100);
      TScore.Bump(Self.score,0.2);
      ++Self.score.stars;
      TAudioEngine.Pop$2(Self.audio,1.8);
      THud.Pop$1(Self.hud,"\u2605","+" + IntToStr$_Integer_(v$4),false);
   }
   /// procedure TGame.OpenMenu(fromTitle: Boolean)
   ,OpenMenu:function(Self, fromTitle) {
      Self.menuFromTitle = fromTitle;
      Self.paused = !(fromTitle);
      El("pTitle").textContent = (fromTitle)?"Optionen":"Pause";
      El("bResume").textContent = (fromTitle)?"Zur"+UC(252)+"ck":"Weiter";
      El("bRestart").style.display = (fromTitle)?"none":"";
      El("bMenu").style.display = (fromTitle)?"none":"";
      TGame.SyncMenu(Self);
      El("pause").classList.add("on");
   }
   /// function TGame.OptsToJS() : Variant
   ,OptsToJS:function(Self) {
      var Result = undefined;
      var c$7;
      Result = {};
      Result.ghost = Self.opts.ghost;
      Result.rivals = Self.opts.rivals;
      Result.tod = Self.opts.tod;
      Result.weather = Self.opts.weather;
      c$7 = {};
      c$7.jacket = Self.opts.col.jacket;
      c$7.pants = Self.opts.col.pants;
      c$7.helmet = Self.opts.col.helmet;
      c$7.deck = Self.opts.col.deck;
      Result.col = c$7;
      return Result
   }
   /// procedure TGame.RenderRider(alpha: Float; dt: Float)
   ,RenderRider:function(Self, alpha, dt) {
      var bl = 0,
         p$7 = null,
         S$1 = null,
         st$3 = null;
      p$7 = Self.phys;
      S$1 = Self.animS;
      if (Self.riderMode == "ragdoll") {
         for(let i$6=0;i$6<=16;i$6++) {
            Self.wj[i$6].copy(Self.ragdoll.p$4[i$6]);
         }
         TGame.BoardFromJoints(Self,Self.wj,Self.boardPos,Self.boardQ);
         Self.rider.head.visible = true;
         TRider.Pose(Self.rider,Self.wj,Self.boardPos,Self.boardQ);
         return;
      }
      Self.rp.lerpVectors(p$7.prevPos,p$7.pos$2,alpha);
      Self.rUp.lerpVectors(p$7.prevBoardUp,p$7.boardUp,alpha).normalize();
      st$3 = Self.pst;
      st$3.yaw$1 = p$7.prevYaw$1 + WrapAngle(p$7.yaw$2 - p$7.prevYaw$1) * alpha;
      st$3.edge$1 = Lerp(p$7.prevEdge,p$7.edge$3,alpha);
      st$3.flip = Lerp(p$7.prevFlip,p$7.flip$1,alpha);
      S$1.latAcc = p$7.latAcc$1;
      S$1.load = (p$7.grounded$1)?p$7.load$1:0;
      S$1.tuck$1 = p$7.tuck$2;
      S$1.brake$1 = p$7.brake$2;
      S$1.charge = p$7.charge$1;
      S$1.grounded = p$7.grounded$1;
      S$1.airTime = p$7.airTime$1;
      S$1.idle = Self.state == "title" || Self.state == "countdown" || Self.riderMode == "standup";
      S$1.grab$1 = p$7.grab$2;
      PoseFromState(Self.animator,st$3,dt,Self.wj,Self.boardPos,Self.boardQ);
      Self.rf.copy(PoseF());
      Self.rr.copy(PoseR());
      if (Self.riderMode == "standup") {
         bl = Smoothstep(0,1,Self.standT / 0.9);
         for(let i$7=0;i$7<=16;i$7++) {
            Self.wj[i$7].lerpVectors(Self.fromJ[i$7],Self.wj[i$7],bl);
         }
         Self.boardPos.lerpVectors(Self.fromBoardPos,Self.boardPos,bl);
         Self.boardQ.slerpQuaternions(Self.fromBoardQ,Self.boardQ,bl);
      }
      TRider.Pose(Self.rider,Self.wj,Self.boardPos,Self.boardQ);
      Self.rider.head.visible = !(Self.camRig.mode == 2 && Self.riderMode == "ride" && Self.state != "title");
   }
   /// procedure TGame.SaveSettings()
   ,SaveSettings:function(Self) {
      var s$12;
      try {
         s$12 = TGame.SettingsExtra(Self);
         s$12.preset = Self.presetName;
         s$12.auto = Self.autoPreset;
         s$12.vol = Self.audio.vol;
         s$12.mus = Self.audio.musicVol;
         s$12.cam = Self.camRig.mode;
         s$12.track = TRACK_ID;
         localStorage.setItem("carveline.settings",JSON.stringify(s$12));
      } catch ($e) {
         /* null */
      }
   }
   /// procedure TGame.SetCam(m: Integer)
   ,SetCam:function(Self, m$7) {
      Self.camRig.mode = m$7;
      TGame.SyncMenu(Self);
      TGame.SaveSettings(Self);
   }
   /// function TGame.SettingsExtra() : Variant
   ,SettingsExtra:function(Self) {
      var Result = undefined;
      Result = {};
      Result.opts = TGame.OptsToJS(Self);
      return Result
   }
   /// procedure TGame.ShowBest()
   ,ShowBest:function(Self) {
      var b$8;
      b$8 = TGame.GetBest(Self);
      El("tBest").textContent = TRACK.name$3 + ((Truthy(b$8))?"  "+UC(183)+"  Bestzeit  "+FmtTime(Number(b$8.time))+"   "+UC(183)+"   Score "+FmtInt(Number(b$8.score)):"  "+UC(183)+"  noch keine Bestzeit");
   }
   /// procedure TGame.ShowFinish()
   ,ShowFinish:function(Self) {
      var t$11 = 0,
         bt = 0,
         rec = "",
         html = "",
         nRiv = 0,
         s$12 = null,
         best,
         a$112 = 0,
         rv$1 = null,
         rows = [],
         row$1 = null,
         a$113 = 0,
         rv$2 = null,
         a$114 = 0,
         rw = "",
         a$115 = [],
         a$116 = [];
      Self.state = "finished";
      s$12 = Self.score;
      best = TGame.GetBest(Self);
      t$11 = Self.finishTime;
      rec = "";
      if ((!(Truthy(best))) || t$11 < (Number(best.time))) {
         rec = "Neue Bestzeit!";
         if (Self.hasGhostRec && Self.ghostRec.length > 0) {
            TGhost.Save(Self.ghost$1,Self.ghostRec,t$11);
         }
         try {
            localStorage.setItem(StoreKey("best"),JSON.stringify({
               "time" : t$11
               ,"score" : Floor(s$12.score$1)
            }));
         } catch ($e) {
            /* null */
         }
      }
      El("fRec").textContent = rec;
      nRiv = 0;
      a$115 = Self.rivals$1;
      var $temp9;
      for(a$112=0,$temp9=a$115.length;a$112<$temp9;a$112++) {
         rv$1 = a$115[a$112];
         if (rv$1.active$2) {
            ++nRiv;
         }
      }
      bt = (Truthy(best) && (Number(best.time)) < t$11)?Number(best.time):t$11;
      row$1 = function (a$110, b$8) {
         rows.push("<div>"+a$110+"<\/div><div>"+b$8+"<\/div>");
      };
      if (nRiv > 0) {
         row$1("Platz",IntToStr$_Integer_(Self.rank)+" \/ "+IntToStr$_Integer_(nRiv + 1));
      }
      row$1("Zeit",FmtTime(t$11));
      row$1("davon Strafzeit","+"+ToFixed(Self.penalty,0)+" s");
      row$1("Score",GermanNum(s$12.score$1));
      row$1("Top-Speed",IntToStr$_Integer_(Round(s$12.topSpeed)) + " km\/h");
      row$1("Near Misses",IntToStr$_Integer_(s$12.nearMiss));
      row$1("Clean Carves",IntToStr$_Integer_(s$12.carves));
      row$1("Airtime",ToFixed(s$12.airTotal,1) + " s");
      row$1("Flips \/ Grabs",IntToStr$_Integer_(s$12.flips$1)+" \/ "+IntToStr$_Integer_(s$12.grabs));
      row$1("Tore",IntToStr$_Integer_(Self.chal.passed)+" \/ "+IntToStr$_Integer_(Self.chal.gates.length));
      row$1("Sterne",IntToStr$_Integer_(Self.chal.got$1)+" \/ "+IntToStr$_Integer_(Self.chal.stars$1.length));
      row$1("St"+UC(252)+"rze",IntToStr$_Integer_(s$12.crashes));
      row$1("Bestzeit",FmtTime(bt));
      a$116 = Self.rivals$1;
      var $temp10;
      for(a$113=0,$temp10=a$116.length;a$113<$temp10;a$113++) {
         rv$2 = a$116[a$113];
         if (rv$2.active$2) {
            row$1(rv$2.def.name$6,(rv$2.finished$1)?FmtTime(rv$2.time$1):"noch unterwegs");
         }
      }
      html = "";
      var $temp11;
      for(a$114=0,$temp11=rows.length;a$114<$temp11;a$114++) {
         rw = rows[a$114];
         html += rw;
      }
      El("fStats").innerHTML = html;
      El("finish").classList.add("on");
      El("hud").classList.remove("on");
   }
   /// procedure TGame.StartCrash(reason: String)
   ,StartCrash:function(Self, reason$1) {
      var why = "",
         p$7 = null;
      p$7 = Self.phys;
      Self.riderMode = "ragdoll";
      Self.ragT = 0;
      TRagdoll.Start(Self.ragdoll,Self.wj,p$7.vel$2,0.00833333333333333);
      TAudioEngine.Crash$1(Self.audio);
      TAudioEngine.MusicFall(Self.audio);
      TCameraRig.AddTrauma(Self.camRig,0.85);
      TGame.Buzz(Self,140);
      TParticleSystem.Burst$1(Self.particles,p$7.pos$2,p$7.vel$2,90,4,3.5,1.6,0.55);
      TTrail.BreakLine(Self.trail);
      TScore.OnCrash(Self.score);
      if (!(Self.finished)) {
         Self.penalty += 3;
      }
      if (reason$1 == "skier") {
         why = "Kollision";
      } else if (reason$1 == "tree") {
         why = "Baum";
      } else if (reason$1 == "net") {
         why = "Fangnetz";
      } else if (reason$1 == "obstacle") {
         why = "Hindernis";
      } else if (reason$1 == "rival") {
         why = "Auffahrunfall";
      } else if (reason$1 == "landing") {
         why = "Landung";
      } else if (reason$1 == "edge") {
         why = "Verkantet";
      } else if (reason$1 == "lost") {
         why = "Abgekommen";
      } else {
         why = "";
      }
      THud.Pop$1(Self.hud,"Sturz",why + ((Self.finished)?"":" "+UC(183)+" +"+FmtInt(3)+"s"),true);
      p$7.crashReason = "";
      p$7.frozen = true;
   }
   /// procedure TGame.StartRun()
   ,StartRun:function(Self) {
      var a$117 = 0,
         rv$1 = null,
         a$118 = [];
      El("title").classList.remove("on");
      El("hud").classList.add("on");
      TRiderPhysics.Reset$2(Self.phys,4);
      Self.phys.frozen = true;
      Self.riderMode = "ride";
      TScore.Reset$4(Self.score);
      Self.runTime = 0;
      Self.penalty = 0;
      Self.finished = false;
      Self.finishT = 0;
      Self.invuln = 0;
      Self.timeScale = 1;
      Self.slowT = 0;
      Self.acc = 0;
      TSkierAI.Reset$1(Self.skiers,4);
      TTrail.Reset$5(Self.trail);
      TParticleSystem.Clear$2(Self.particles);
      TChallenges.Reset$6(Self.chal);
      TTerrain.Update(Self.terrain,4,Self.camera.position,99);
      Self.state = "countdown";
      Self.cdT = 0;
      Self.cdLast = -1;
      Self.ghostRec.length=0;
      Self.hasGhostRec = true;
      Self.ghostNext = 0;
      TGhost.Load(Self.ghost$1);
      Self.rank = 0;
      TAudioEngine.MusicRestart(Self.audio);
      a$118 = Self.rivals$1;
      var $temp12;
      for(a$117=0,$temp12=a$118.length;a$117<$temp12;a$117++) {
         rv$1 = a$118[a$117];
         TRival.Reset$3(rv$1,4,Self.opts.rivals);
      }
      TGame.RenderRider(Self,0,0.016);
      TGame.FillCamTarget(Self);
      TCameraRig.Snap(Self.camRig,Self.camT);
   }
   /// procedure TGame.SyncMenu()
   ,SyncMenu:function(Self) {
      var a$119 = 0,
         b$8 = null,
         a$120 = 0,
         b$9 = null,
         sel = null,
         selCol = null,
         a$121 = [],
         a$122 = [];
      a$121 = document.querySelectorAll("#optAuto button");
      var $temp13;
      for(a$119=0,$temp13=a$121.length;a$119<$temp13;a$119++) {
         b$8 = a$121[a$119];
         b$8.classList.toggle("sel",(String(b$8.dataset.v)) == "1" == Self.autoPreset);
      }
      a$122 = document.querySelectorAll("#optCam button");
      var $temp14;
      for(a$120=0,$temp14=a$122.length;a$120<$temp14;a$120++) {
         b$9 = a$122[a$120];
         b$9.classList.toggle("sel",StrToInt$_String_(String(b$9.dataset.v)) == Self.camRig.mode);
      }
      sel = function (id$4, sv) {
         var a$123 = 0,
            b$10 = null,
            a$124 = [];
         a$124 = document.querySelectorAll("#"+id$4+" button");
         var $temp15;
         for(a$123=0,$temp15=a$124.length;a$123<$temp15;a$123++) {
            b$10 = a$124[a$123];
            b$10.classList.toggle("sel",(String(b$10.dataset.v)) == sv);
         }
      };
      sel("optTod",Self.opts.tod);
      sel("optWeather",Self.opts.weather);
      sel("optGhost",(Self.opts.ghost)?"1":"0");
      sel("optRivals",(Self.opts.rivals)?"1":"0");
      selCol = function (id$4, v$4) {
         var a$125 = 0,
            b$10 = null,
            a$126 = [];
         a$126 = El(id$4).querySelectorAll("button");
         var $temp16;
         for(a$125=0,$temp16=a$126.length;a$125<$temp16;a$125++) {
            b$10 = a$126[a$125];
            b$10.classList.toggle("sel",StrToInt$_String_(String(b$10.dataset.v)) == v$4);
         }
      };
      selCol("colJacket",Self.opts.col.jacket);
      selCol("colPants",Self.opts.col.pants);
      selCol("colHelmet",Self.opts.col.helmet);
      selCol("colDeck",Self.opts.col.deck);
      El("hCam").textContent = "CAM "+UC(183)+" "+CAM_NAMES[Self.camRig.mode];
   }
   /// procedure TGame.ToTitle()
   ,ToTitle:function(Self) {
      var a$127 = 0,
         rv$1 = null,
         a$128 = [];
      Self.state = "title";
      Self.paused = false;
      El("hud").classList.remove("on");
      El("title").classList.add("on");
      Self.ghost$1.rider$2.root.visible = false;
      a$128 = Self.rivals$1;
      var $temp17;
      for(a$127=0,$temp17=a$128.length;a$127<$temp17;a$127++) {
         rv$1 = a$128[a$127];
         TRival.Reset$3(rv$1,4,false);
      }
      Self.rivalText = "";
      TAudioEngine.MusicRestart(Self.audio);
      TRiderPhysics.Reset$2(Self.phys,4);
      Self.phys.frozen = true;
      Self.riderMode = "ride";
      Self.flyT = 0;
      TSkierAI.Reset$1(Self.skiers,20);
      TTrail.Reset$5(Self.trail);
      TGame.ShowBest(Self);
   }
   /// procedure TGame.UpdateGateMark()
   ,UpdateGateMark:function(Self) {
      var dist$1 = 0,
         W$1 = 0,
         H$5 = 0,
         x$18 = 0,
         y$13 = 0,
         el$1 = null,
         ch$2 = null,
         p$7 = null,
         g$8 = null,
         v$4 = null;
      if (!Self.gateMarkEl) {
         Self.gateMarkEl = El("gateMark");
      }
      el$1 = Self.gateMarkEl;
      ch$2 = Self.chal;
      p$7 = Self.phys;
      g$8 = (ch$2.gateNext < ch$2.gates.length)?ch$2.gates[ch$2.gateNext]:null;
      dist$1 = (!!g$8)?g$8.z$12 - p$7.pos$2.z:1000000000;
      if (!g$8 || Self.state != "play" || Self.finished || dist$1 > 450 || dist$1 < -2) {
         el$1.style.display = "none";
         return;
      }
      v$4 = Self.tmp2.set(g$8.x$16,TCourse.height$4(Self.course,g$8.x$16,g$8.z$12) + 3.1,g$8.z$12).project(Self.camera);
      if (v$4.z > 1) {
         el$1.style.display = "none";
         return;
      }
      W$1 = window.innerWidth;
      H$5 = window.innerHeight;
      x$18 = ClampF((v$4.x * 0.5 + 0.5) * W$1,40,W$1 - 40);
      y$13 = ClampF(((-v$4.y) * 0.5 + 0.5) * H$5,70,H$5 - 40);
      el$1.style.display = "block";
      el$1.style.transform = "translate("+ToFixed(x$18,0)+"px,"+ToFixed(y$13,0)+"px) translate(-50%,-100%)";
      el$1.className = (g$8.col$4 == 14100029)?"red":"blue";
      el$1.lastElementChild.textContent = IntToStr$_Integer_(Max$_Integer_Integer_(0,Round(dist$1))) + " m";
   }
   /// procedure TGame.UpdateOutlineTexel()
   ,UpdateOutlineTexel:function(Self) {
      var pr$1 = 0,
         s$12 = 0,
         u$3;
      if (!Self.outlinePass) {
         return;
      }
      pr$1 = Self.renderer.getPixelRatio();
      u$3 = Self.outlinePass.uniforms;
      s$12 = Smoothstep(380,600,Min$_Integer_Integer_(window.innerWidth,window.innerHeight));
      u$3.uTexel.value.set(1 / (window.innerWidth * pr$1),1 / (window.innerHeight * pr$1));
      u$3.uWidth.value = Lerp(1.15,1.8,s$12);
      u$3.uAlpha.value = Lerp(0.55,0.9,s$12);
   }
   /// procedure TGame.UpdateRun(dt: Float; dtReal: Float)
   ,UpdateRun:function(Self, dt, dtReal) {
      var steps = 0,
         n$7 = 0,
         rk = 0,
         activeCount = 0,
         FIX = 0,
         prog = 0,
         alpha = 0,
         progress = 0,
         zc = 0,
         canHit = false,
         p$7 = null,
         inp$2 = null,
         q$2 = null,
         a$129 = 0,
         rv$1 = null,
         a$130 = 0,
         rv$2 = null,
         a$131 = 0,
         rv$3 = null,
         a$132 = 0,
         rv$4 = null,
         hit$1 = null,
         a$133 = [],
         a$134 = [];
      p$7 = Self.phys;
      FIX = 0.00833333333333333;
      inp$2 = Self.input;
      if (Self.state == "countdown") {
         Self.cdT += dtReal;
         n$7 = 3 - Floor(Self.cdT / 0.8);
         if (n$7 != Self.cdLast) {
            Self.cdLast = n$7;
            if (n$7 > 0) {
               THud.Countdown(Self.hud,IntToStr$_Integer_(n$7),true);
               TAudioEngine.Beep(Self.audio,false);
            } else if (!n$7) {
               THud.Countdown(Self.hud,"GO",true);
               TAudioEngine.Beep(Self.audio,true);
            }
         }
         if (Self.cdT > 2.4) {
            Self.state = "play";
            p$7.frozen = false;
         }
      } else if (Self.cdT < 3.2) {
         Self.cdT += dtReal;
         if (Self.cdT >= 3.2) {
            THud.Countdown(Self.hud,"",false);
         }
      }
      if (Self.state == "play" && (!(Self.finished))) {
         Self.runTime += dt;
      }
      if (Self.hasGhostRec && Self.state == "play" && (!(Self.finished)) && Self.runTime >= Self.ghostNext) {
         TGhost.Sample(TGhost,Self.ghostRec,Self.runTime,p$7,Self.riderMode);
         Self.ghostNext += 0.05;
      }
      TGhost.Update$6(Self.ghost$1,Self.runTime,dt,Self.opts.ghost && (Self.state == "play" || Self.state == "countdown"));
      if (Self.invuln > 0) {
         Self.invuln -= dt;
      }
      if (Self.finished) {
         Self.pin.steer = 0;
         Self.pin.tuck = 0;
         Self.pin.brake = (p$7.speed$2 > 2)?1:0;
         Self.pin.jump = false;
         Self.pin.grab = false;
      } else {
         Self.pin.steer = inp$2.steer;
         Self.pin.tuck = inp$2.tuck;
         Self.pin.brake = inp$2.brake;
         Self.pin.jump = inp$2.jump;
         Self.pin.grab = inp$2.grab;
      }
      Self.acc += dt;
      steps = 0;
      while (Self.acc >= FIX && steps < 10) {
         var a$135 = [];
         if (Self.riderMode == "ride") {
            TRiderPhysics.Step$1(p$7,FIX,Self.pin);
            if (p$7.crashReason != "") {
               TGame.StartCrash(Self,p$7.crashReason);
            } else if (!(p$7.frozen)) {
               TGame.EmitRideFx(Self,FIX);
            }
         } else if (Self.riderMode == "ragdoll") {
            TRagdoll.Step(Self.ragdoll,FIX);
            Self.ragT += FIX;
            if (Self.ragdoll.speed$1 > 4 && Random() < 0.5) {
               q$2 = Self.ragdoll.p$4[0];
               TParticleSystem.Emit$2(Self.particles,q$2.x,q$2.y,q$2.z,(Random() - 0.5) * 2,Random() * 2,(Random() - 0.5) * 2,1,0.45);
            }
            if (Self.ragT > 2.4 && Self.ragdoll.speed$1 < 2.5 || Self.ragT > 4.9) {
               TGame.BeginStandUp(Self);
            }
         } else {
            TRiderPhysics.Step$1(p$7,FIX,Self.pin);
         }
         prog = ClampF(p$7.pos$2.z / Self.course.zf,0,1);
         a$135 = Self.rivals$1;
         var $temp18;
         for(a$129=0,$temp18=a$135.length;a$129<$temp18;a$129++) {
            rv$1 = a$135[a$129];
            TRival.Step$2(rv$1,FIX,Self.state == "play",prog,Self.runTime,Self.skiers);
         }
         Self.acc -= FIX;
         ++steps;
      }
      if (steps >= 10) {
         Self.acc = 0;
      }
      alpha = Self.acc / FIX;
      if (Self.riderMode == "standup") {
         Self.standT += dt;
         if (Self.standT >= 0.9) {
            Self.riderMode = "ride";
            p$7.frozen = !(Self.state == "play");
            Self.invuln = 1.6;
            if (!(p$7.frozen)) {
               p$7.vel$2.set(Sin(p$7.yaw$2),0,Cos(p$7.yaw$2)).multiplyScalar(3);
            }
         }
      }
      TGame.RenderRider(Self,alpha,dt);
      a$133 = Self.rivals$1;
      var $temp19;
      for(a$130=0,$temp19=a$133.length;a$130<$temp19;a$130++) {
         rv$2 = a$133[a$130];
         TRival.Render$1(rv$2,alpha,dt);
      }
      activeCount = 0;
      a$134 = Self.rivals$1;
      var $temp20;
      for(a$131=0,$temp20=a$134.length;a$131<$temp20;a$131++) {
         rv$3 = a$134[a$131];
         if (rv$3.active$2) {
            ++activeCount;
         }
      }
      if (activeCount > 0) {
         var a$136 = [];
         rk = 1;
         a$136 = Self.rivals$1;
         var $temp21;
         for(a$132=0,$temp21=a$136.length;a$132<$temp21;a$132++) {
            rv$4 = a$136[a$132];
            if (rv$4.active$2 && ((Self.finished)?rv$4.finished$1 && rv$4.time$1 < Self.finishTime:rv$4.finished$1 || rv$4.phys$2.pos$2.z > p$7.pos$2.z)) {
               ++rk;
            }
         }
         if (Self.state == "play" && (Self.rank!=0) && rk < Self.rank && (!(Self.finished))) {
            TAudioEngine.MusicOvertake(Self.audio);
            THud.Pop$1(Self.hud,UC(220) + "berholt!","Platz " + IntToStr$_Integer_(rk),false);
         }
         Self.rank = rk;
         Self.rivalText = "Platz "+IntToStr$_Integer_(rk)+"\/"+IntToStr$_Integer_(1 + activeCount);
      } else {
         Self.rivalText = "";
      }
      progress = ClampF(p$7.pos$2.z / Self.course.zf,0,1);
      TSkierAI.Update$2(Self.skiers,dt,p$7.pos$2.z,progress);
      Self.capA.copy(Self.rp).addScaledVector(Self.rUp,0.25);
      Self.capB.copy(Self.rp).addScaledVector(Self.rUp,1.45);
      canHit = Self.state == "play" && Self.riderMode == "ride" && Self.invuln <= 0 && (!(Self.finished));
      hit$1 = TSkierAI.CheckPlayer(Self.skiers,Self.capA,Self.capB,p$7.pos$2.z,p$7.speed$2,canHit);
      if (!!hit$1 && canHit) {
         TRiderPhysics.Crash(p$7,"skier");
         TGame.StartCrash(Self,"skier");
      }
      TGame.Contacts(Self,dt);
      if (Self.state == "play" && (!(Self.finished))) {
         zc = (Self.riderMode == "ragdoll")?Max$_Float_Float_(p$7.pos$2.z,Self.ragdoll.p$4[0].z):p$7.pos$2.z;
         Self.tmp3.copy(Self.rp).addScaledVector(Self.rUp,0.7);
         TChallenges.Update$13(Self.chal,dt,zc,p$7.pos$2.x,Self.tmp3,Self.riderMode == "ride",$Event1(Self,TGame.OnGate),$Event1(Self,TGame.OnStar));
      } else {
         TChallenges.Update$13(Self.chal,dt,-1000000000,0,Self.tmp3,false,function (ok) {
            /* null */
         },function (st$3) {
            /* null */
         });
      }
      TScore.Update$8(Self.score,dt,p$7,Self.state == "play" && Self.riderMode == "ride" && (!(Self.finished)));
      if (Self.state == "play" && (!(Self.finished)) && p$7.pos$2.z > Self.course.zf) {
         Self.finished = true;
         Self.finishTime = Self.runTime + Self.penalty;
         THud.Pop$1(Self.hud,"Ziel!",FmtTime(Self.finishTime),false);
         TAudioEngine.Pop$2(Self.audio,2);
         TAudioEngine.Pop$2(Self.audio,1.5);
         TAudioEngine.MusicFinish(Self.audio);
      }
      if (Self.finished && Self.state == "play") {
         Self.finishT += dtReal;
         if (Self.finishT > 2.2) {
            TGame.ShowFinish(Self);
         }
      }
      TGame.FillCamTarget(Self);
      TCameraRig.Update$12(Self.camRig,dtReal,Self.camT,false);
      TGame.UpdateGateMark(Self);
      TGame.UpdateTags(Self);
      TGame.UpdateTrickHint(Self);
   }
   /// procedure TGame.UpdateSun(center: JVector3)
   ,UpdateSun:function(Self, center$2) {
      var texel = 0,
         s$12 = null;
      s$12 = Self.snapC.copy(center$2).applyMatrix4(Self.lightInv);
      texel = 68 / Self.preset.shadow$1;
      s$12.x = Round(s$12.x / texel) * texel;
      s$12.y = Round(s$12.y / texel) * texel;
      s$12.applyMatrix4(Self.lightRot);
      Self.sun.target.position.copy(s$12);
      Self.sun.position.copy(s$12).addScaledVector(Self.sunDir,120);
      Self.sun.target.updateMatrixWorld();
   }
   /// procedure TGame.UpdateTags()
   ,UpdateTags:function(Self) {
      var show = false,
         dist$1 = 0,
         box = null,
         a$137 = 0,
         rv$1 = null,
         d$8 = null,
         rv$2 = null,
         el$1 = null,
         head$3 = null,
         v$4 = null;
      if (!Self.tagEls.length) {
         var a$138 = [];
         box = El("tags");
         a$138 = Self.rivals$1;
         var $temp22;
         for(a$137=0,$temp22=a$138.length;a$137<$temp22;a$137++) {
            rv$1 = a$138[a$137];
            d$8 = document.createElement("div");
            d$8.className = "tag";
            d$8.innerHTML = "<i style=\"background:#"+HexColor(rv$1.def.col$3.jacket)+"\"><\/i>"+rv$1.def.name$6;
            box.appendChild(d$8);
            Self.tagEls.push(d$8);
         }
      }
      show = Self.state == "play" || Self.state == "countdown";
      for(let i$6=0,$temp23=Self.rivals$1.length;i$6<$temp23;i$6++) {
         rv$2 = Self.rivals$1[i$6];
         el$1 = Self.tagEls[i$6];
         if ((!(show)) || (!(rv$2.active$2)) || (!(rv$2.rider$1.root.visible))) {
            el$1.style.display = "none";
            continue;
         }
         head$3 = rv$2.wj$1[3];
         dist$1 = head$3.distanceTo(Self.camera.position);
         v$4 = Self.tmp2.copy(head$3).addScaledVector(rv$2.st$1.up$2,0.55).project(Self.camera);
         if (v$4.z > 1 || dist$1 > 160 || Abs$_Float_(v$4.x) > 1.1 || Abs$_Float_(v$4.y) > 1.1) {
            el$1.style.display = "none";
            continue;
         }
         el$1.style.display = "block";
         el$1.style.opacity = ToFixed(0.9 * (1 - Smoothstep(60,160,dist$1)),2);
         el$1.style.transform = "translate("+ToFixed((v$4.x * 0.5 + 0.5) * window.innerWidth,0)+"px,"+ToFixed(((-v$4.y) * 0.5 + 0.5) * window.innerHeight,0)+"px) translate(-50%,-100%)";
      }
   }
   /// procedure TGame.UpdateTitle(dt: Float; dtReal: Float)
   ,UpdateTitle:function(Self, dt, dtReal) {
      var z$13 = 0,
         x$18 = 0,
         y$13 = 0,
         lz = 0,
         c$7 = null;
      Self.flyT += dtReal;
      c$7 = Self.course;
      z$13 = 30 + FMod(Self.flyT * 16,650);
      Self.flyZ = z$13;
      x$18 = TCourse.cx(c$7,z$13) + Sin(Self.flyT * 0.23) * 16;
      y$13 = TCourse.height$4(c$7,x$18,z$13) + 8 + Sin(Self.flyT * 0.31) * 3;
      Self.camera.position.set(x$18,y$13,z$13);
      lz = z$13 + 40;
      Self.camera.lookAt(TCourse.cx(c$7,lz) + Sin(Self.flyT * 0.17) * 6,TCourse.height$4(c$7,TCourse.cx(c$7,lz),lz) + 1.5,lz);
      if (Self.camera.fov != 60) {
         Self.camera.fov = 60;
         Self.camera.updateProjectionMatrix();
      }
      TSkierAI.Update$2(Self.skiers,dt,z$13 - 40,0.2);
      TGame.RenderRider(Self,1,dt);
   }
   /// procedure TGame.UpdateTrickHint()
   ,UpdateTrickHint:function(Self) {
      var show = false,
         flipping = false,
         spinning = false,
         holding = false,
         touch$1 = false,
         tl = 0,
         tt$1 = 0,
         velYaw = 0,
         hs$1 = 0,
         yawErr = 0,
         now$2 = 0,
         rate = 0,
         k$4 = 0,
         e$1 = 0,
         target$3 = 0,
         relU = 0,
         holdU = 0,
         rel = 0,
         eR = 0,
         eH = 0,
         clean = 0,
         crash = 0,
         turns = 0,
         cls = "",
         txt = "",
         key$2 = "",
         stop$4 = "",
         dirKey = "",
         keyHint = "",
         p$7 = null,
         c$7 = null,
         el$1 = null;
      if (!Self.trEl) {
         Self.trEl = El("trick");
         Self.trTxt = El("trTxt");
         Self.trKey = El("trKey");
         Self.trNow = El("trNow");
         Self.trPred = El("trPred");
         El("trOk").setAttribute("d",ArcPath(38,0.45));
         El("trWarn").setAttribute("d",ArcPath(38,1));
      }
      p$7 = Self.phys;
      c$7 = Self.course;
      el$1 = Self.trEl;
      show = false;
      if (Self.state == "play" && Self.riderMode == "ride" && (!(p$7.grounded$1)) && p$7.airTime$1 > 0.05 && (!(Self.finished))) {
         tl = 1.2;
         tt$1 = 0.03;
         while (tt$1 < 3) {
            if (p$7.pos$2.y + p$7.vel$2.y * tt$1 - 4.905 * tt$1 * tt$1 <= TCourse.height$4(c$7,p$7.pos$2.x + p$7.vel$2.x * tt$1,p$7.pos$2.z + p$7.vel$2.z * tt$1)) {
               tl = tt$1;
               break;
            }
            tt$1 += 0.03;
         }
         velYaw = ArcTan2(p$7.vel$2.x,p$7.vel$2.z);
         hs$1 = Math.hypot(p$7.vel$2.x,p$7.vel$2.z);
         flipping = Abs$_Float_(p$7.flip$1) > 0.25 || Abs$_Float_(p$7.flipRate$1) > 1.5;
         yawErr = (hs$1 > 3)?WrapAngle(p$7.yaw$2 - velYaw):0;
         spinning = hs$1 > 3 && (Abs$_Float_(yawErr) > 0.3 || Abs$_Float_(p$7.yawRate) > 1.5);
         if (flipping || spinning) {
            show = true;
            now$2 = (flipping)?p$7.flip$1:yawErr;
            rate = (flipping)?p$7.flipRate$1:p$7.yawRate;
            k$4 = (flipping)?9:6;
            e$1 = 1 - Exp((-k$4) * tl);
            target$3 = MathSign(rate);
            if (target$3 == 0) {
               target$3 = MathSign(now$2);
            }
            if (target$3 == 0) {
               target$3 = 1;
            }
            target$3 *= (flipping)?8.5:5.5;
            relU = now$2 + rate / k$4 * e$1;
            holdU = now$2 + target$3 * tl - (target$3 - rate) / k$4 * e$1;
            rel = WrapAngle(relU);
            eR = Abs$_Float_(rel);
            eH = Abs$_Float_(WrapAngle(holdU));
            turns = Round(Abs$_Float_(relU) / 6.28318530717959);
            holding = (flipping)?Self.pin.tuck > 0.5 || Self.pin.brake > 0.5:Abs$_Float_(Self.pin.steer) > 0.3;
            clean = 0.45;
            crash = (flipping)?1:1.1;
            touch$1 = document.body.classList.contains("touch");
            dirKey = (flipping)?(now$2 > 0)?"W":"S":(rate < 0)?"\u2192 \/ D":"\u2190 \/ A";
            keyHint = (touch$1)?(flipping)?(now$2 > 0)?"Stick hoch":"Stick runter":"Stick seitlich":dirKey + " halten";
            cls = "ok";
            txt = "";
            key$2 = "";
            if (holding) {
               stop$4 = (!turns)?"Abbrechen!":"Loslassen!";
               if ((turns==0) && eR <= clean) {
                  if (eH > crash) {
                     cls = "warn";
                     txt = "Abbrechen!";
                  }
               } else if (eR <= clean) {
                  cls = "ok go";
                  txt = "Loslassen!";
               } else if (eH <= clean) {
                  cls = "warn";
                  txt = "Weiterdrehen!";
                  key$2 = keyHint;
               } else if (eR <= crash) {
                  cls = "warn";
                  txt = stop$4;
               } else if (eH <= crash) {
                  cls = "warn";
                  txt = "Weiterdrehen!";
                  key$2 = keyHint;
               } else {
                  cls = "bad";
                  txt = (eH < eR)?"Weiterdrehen!":stop$4;
                  if (eH < eR) {
                     key$2 = keyHint;
                  }
               }
            } else {
               if (eR <= clean) {
                  txt = "\u2713";
               } else if (eH < eR) {
                  cls = (eH <= crash)?"warn":"bad";
                  txt = "Weiterdrehen!";
                  key$2 = keyHint;
               } else {
                  cls = (eR <= crash)?"warn":"bad";
                  txt = (eR <= crash)?"Knapp":"Sturzgefahr!";
               }
            }
            if (p$7.airTime$1 < 0.15) {
               cls = "ok";
               txt = "";
               key$2 = "";
            }
            el$1.className = "on " + cls;
            Self.trTxt.textContent = txt;
            Self.trKey.textContent = key$2;
            Self.trNow.setAttribute("transform","rotate("+ToFixed(now$2 * 180 / 3.14159265358979,1)+")");
            Self.trPred.setAttribute("transform","rotate("+ToFixed(rel * 180 / 3.14159265358979,1)+")");
         }
      }
      if ((!(show)) && el$1.classList.contains("on")) {
         el$1.className = "";
         Self.trTxt.textContent = "";
         Self.trKey.textContent = "";
      }
   }
   ,Destroy:TObject.Destroy
};
/// TBody = class (TObject)
var TBody = {
   $ClassName:"TBody",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.a = $.b = $.phys$1 = $.rv = null;
   }
   ,Destroy:TObject.Destroy
};
function StartCarveLine() {
   var game = null;
   window.addEventListener("error",function (e$1) {
      var msg = "",
         el = null;
      msg = e$1.message || "";
      if (e$1.filename == "" && (msg == "Script error." || msg == "Script error")) {
         console.warn("Fremdes Skript meldete einen Fehler ohne Details");
         return;
      }
      el = El("err");
      el.style.display = "block";
      el.textContent = "Fehler: "+((msg != "")?msg:String(e$1))+((e$1.filename != "")?"\n"+e$1.filename+":"+IntToStr$_Integer_(e$1.lineno):"")+"\n(antippen zum Schlie"+UC(223)+"en)";
   });
   El("err").onclick = function (e$1) {
      El("err").style.display = "none";
   };
   InitGfx();
   game = TGame.Create$3($New(TGame));
   window.game = game;
   InstallSelfTest(game.course,game.resort);
   if ('serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname)))
      navigator.serviceWorker.register('sw.js').catch(function (e) { console.warn('Service Worker nicht registriert', e); });
   window.addEventListener("beforeinstallprompt",function (e$1) {
      e$1.preventDefault();
      installPrompt = e$1;
      El("bInstall").style.display = "";
   });
   window.addEventListener("appinstalled",function (e$1) {
      installPrompt = null;
      El("bInstall").style.display = "none";
   });
   El("bInstall").onclick = function (e$1) {
      if (!(Truthy(installPrompt))) {
         return;
      }
      installPrompt.prompt();
      (installPrompt).userChoice.then(function () { installPrompt = null; document.getElementById('bInstall').style.display = 'none'; });
   };
}
function OnClickEach(list$1, h$3) {
   var a$108 = 0,
      b$8 = null;
   var $temp24;
   for(a$108=0,$temp24=list$1.length;a$108<$temp24;a$108++) {
      b$8 = list$1[a$108];
      BindClick(b$8,h$3);
   }
}
function MathSign(x$18) {
   var Result = 0;
   if (x$18 > 0) {
      Result = 1;
   } else if (x$18 < 0) {
      Result = -1;
   } else {
      Result = 0;
   }
   return Result
}
function GermanNum(v$4) {
   var Result = "";
   Result = Math.floor(v$4).toLocaleString('de-DE');
   return Result
}
function FmtInt(v$4) {
   var Result = "";
   Result = String(v$4);
   return Result
}
function BindClick(b$8, h$3) {
   b$8.onclick = function (e$1) {
      h$3(b$8);
   };
}
function AsVar(o$1) {
   var Result = undefined;
   Result = o$1;
   return Result
}
function ArcPath(r$7, a$110) {
   var Result = "";
   var x$17 = 0;
   x$17 = r$7 * Sin(a$110);
   Result = "M "+ToFixed(-x$17,2)+" "+ToFixed((-r$7) * Cos(a$110),2)+" A "+NumStr(r$7)+" "+NumStr(r$7)+" 0 0 1 "+ToFixed(x$17,2)+" "+ToFixed((-r$7) * Cos(a$110),2);
   return Result
}
function WriteLnF(Text$1, Values$1) {
   var FormText = "";
   try {
      FormText = Format(Text$1,Values$1.slice(0));
      console.log(FormText);
   } catch ($e) {
      var e$1 = $W($e);
      /* null */
   }
}
function WriteLn(value$4) {
   console.log(value$4);
}
/// function TVariantHelper.DataType() : TVariantExportType
function TVariantHelper$DataType(Self$1) {
   var Result = 1;
   var LType = "";
   if (TVariantHelper$Valid(Self$1)) {
      LType = typeof(Self$1);
      {var $temp25 = AnsiLowerCase(LType);
         if ($temp25=="object") {
            if (!Self$1.length) {
               Result = 8;
            } else {
               Result = 9;
            }
         }
          else if ($temp25=="function") {
            Result = 7;
         }
          else if ($temp25=="symbol") {
            Result = 6;
         }
          else if ($temp25=="boolean") {
            Result = 2;
         }
          else if ($temp25=="string") {
            Result = 5;
         }
          else if ($temp25=="number") {
            if (Round(Number(Self$1)) != Self$1) {
               Result = 4;
            } else {
               Result = 3;
            }
         }
          else if ($temp25=="array") {
            Result = 9;
         }
          else {
            Result = 1;
         }
      }
   } else if (Self$1 == null) {
      Result = 10;
   } else {
      Result = 1;
   }
   return Result
}
/// function TVariantHelper.Defined() : Boolean
function TVariantHelper$Defined(Self$2) {
   var Result = false;
   Result = !(Self$2 == undefined);
   return Result
}
/// function TVariantHelper.Equals(const Reference: Variant) : Boolean
function TVariantHelper$Equals$3(Self$3, Reference) {
   var Result = false;
   Result = (Self$3 == Reference);
   return Result
}
/// function TVariantHelper.IsArray() : Boolean
function TVariantHelper$IsArray$1(Self$4) {
   var Result = false;
   Result = ((Self$4) !== undefined)
      && (Self$4 !== null)
      && (typeof Self$4 === "object")
      && ((Self$4).length !== undefined);
   return Result
}
/// function TVariantHelper.IsArrayBuffer() : Boolean
function TVariantHelper$IsArrayBuffer(Self$5) {
   var Result = false;
   var lTypeName = "";
   if (TVariantHelper$Valid(Self$5)) {
      lTypeName = Object.prototype.toString.call(Self$5);
      Result = lTypeName == "[object ArrayBuffer]";
   }
   return Result
}
/// function TVariantHelper.IsBoolean() : Boolean
function TVariantHelper$IsBoolean(Self$6) {
   var Result = false;
   Result = ((Self$6) !== undefined)
      && (Self$6 !== null)
      && (typeof Self$6 === "boolean");
   return Result
}
/// function TVariantHelper.Isfloat() : Boolean
function TVariantHelper$Isfloat(Self$7) {
   var Result = false;
   Result = ((Self$7) !== undefined)
      && (Self$7 !== null)
      && (typeof Self$7  === "number")
      && (Math.round(Self$7) != Self$7);
   return Result
}
/// function TVariantHelper.IsFunction() : Boolean
function TVariantHelper$IsFunction(Self$8) {
   var Result = false;
   Result = ((Self$8) !== undefined)
      && (Self$8 !== null)
      && (typeof Self$8 === "function");
   return Result
}
/// function TVariantHelper.IsInteger() : Boolean
function TVariantHelper$IsInteger(Self$9) {
   var Result = false;
   Result = ((Self$9) !== undefined)
      && (Self$9 !== null)
      && (typeof Self$9  === "number")
      && (Math.round(Self$9) === Self$9);
   return Result
}
/// function TVariantHelper.IsObject() : Boolean
function TVariantHelper$IsObject(Self$10) {
   var Result = false;
   Result = ((Self$10) !== undefined)
      && (Self$10 !== null)
      && (typeof Self$10  === "object")
      && ((Self$10).length === undefined);
   return Result
}
/// function TVariantHelper.IsString() : Boolean
function TVariantHelper$IsString$1(Self$11) {
   var Result = false;
   Result = (Self$11 !== undefined)
      && (Self$11 !== null)
      && (typeof Self$11  === "string");
   return Result
}
/// function TVariantHelper.IsSymbol() : Boolean
function TVariantHelper$IsSymbol(Self$12) {
   var Result = false;
   Result = ((Self$12) !== undefined)
      && (Self$12 !== null)
      && (typeof Self$12 === "symbol");
   return Result
}
/// function TVariantHelper.IsUInt8Array() : Boolean
function TVariantHelper$IsUInt8Array(Self$13) {
   var Result = false;
   var lTypeName$1 = "";
   if (TVariantHelper$Valid(Self$13)) {
      lTypeName$1 = Object.prototype.toString.call(Self$13);
      Result = lTypeName$1 == "[object Uint8Array]";
   }
   return Result
}
/// function TVariantHelper.UnDefined() : Boolean
function TVariantHelper$UnDefined(Self$14) {
   var Result = false;
   Result = (Self$14 == undefined);
   return Result
}
/// function TVariantHelper.Valid() : Boolean
function TVariantHelper$Valid(Self$15) {
   var Result = false;
   Result = !( (Self$15 == undefined) || (Self$15 == null) );
   return Result
}
/// TVariantExportType enumeration
var TVariantExportType = { 1:"vdUnknown", 2:"vdBoolean", 3:"vdinteger", 4:"vdfloat", 5:"vdstring", 6:"vdSymbol", 7:"vdFunction", 8:"vdObject", 9:"vdArray", 10:"vdVariant" };
/// TVariant = class (TObject)
var TVariant = {
   $ClassName:"TVariant",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   /// function TVariant.AsBool(const Value: Variant) : Boolean
   ,AsBool:function(Self, Value) {
      var Result = false;
      if (Value) {
         Result = $VarToBool(Value);
      }
      return Result
   }
   /// function TVariant.AsFloat(const Value: Variant) : Float
   ,AsFloat:function(Self, Value) {
      var Result = 0;
      if (Value) {
         Result = Number(Value);
      }
      return Result
   }
   /// function TVariant.AsInteger(const Value: Variant) : int32
   ,AsInteger:function(Self, Value) {
      var Result = 0;
      if (Value) {
         Result = $VarToInt(Value,"");
      }
      return Result
   }
   /// function TVariant.AsObject(const Value: Variant) : TObject
   ,AsObject:function(Self, Value) {
      var Result = null;
      if (TVariant.IsObjectInstance(Self,Value)) {
         Result = Value;
      }
      return Result
   }
   /// procedure TVariant.Assign(const Object: Variant; var target: Variant)
   ,Assign:function(Self, Object$4, target$3) {
      if (Object$4) {
         if (TVariant.ExamineType(TVariant,Object$4) == 8) {
            if (target$3.v) {
               if (TVariant.ExamineType(TVariant,target$3.v) == 8) {
                  target$3.v.assign(Object$4);
               }
            }
         }
      }
   }
   /// function TVariant.AsString(const Value: Variant) : String
   ,AsString:function(Self, Value) {
      var Result = "";
      if (Value) {
         Result = String(Value);
      }
      return Result
   }
   /// function TVariant.ClassInstance(const instance: Variant) : Boolean
   ,ClassInstance:function(Self, instance) {
      var Result = false;
      if (typeof(instance) == "object") {
         if (instance.hasOwnProperty("ClassType")) {
            if (instance.ClassType.hasOwnProperty("$ClassName")) {
               if (typeof(instance.ClassType["$ClassName"]) == "string") {
                  Result = (String(instance.ClassType["$ClassName"])).length > 0;
               }
            }
         }
      }
      return Result
   }
   /// function TVariant.Clone(const Object: Variant) : Variant
   ,Clone:function(Self, Object$4) {
      var Result = undefined;
      if (Object$4) {
         Result = TVariant.CreateObject(TVariant);
         Result.assign(Object$4);
      }
      return Result
   }
   /// function TVariant.CreateArray() : Variant
   ,CreateArray:function(Self) {
      var Result = undefined;
      Result = new Array();
      return Result
   }
   /// function TVariant.CreateArrayEx(const Items: array of Variant) : Variant
   ,CreateArrayEx:function(Self, Items$4) {
      var Result = undefined;
      Result = new Array(Items$4);
      return Result
   }
   /// function TVariant.CreateObject() : Variant
   ,CreateObject:function(Self) {
      var Result = undefined;
      Result = new Object();
      return Result
   }
   /// function TVariant.CreateObjectEx(const Names: TStrArray; const Values: TVariantArray) : Variant
   ,CreateObjectEx:function(Self, Names, Values$1) {
      var Result = undefined;
      Result = new Object();
      for(let x$18=0,$temp26=Names.length;x$18<$temp26;x$18++) {
         Result[Names[x$18]] = Values$1[x$18];
      }
      return Result
   }
   /// function TVariant.CreateObjectEx2(const Names: TVariantArray; const Values: TVariantArray) : Variant
   ,CreateObjectEx2:function(Self, Names, Values$1) {
      var Result = undefined;
      Result = new Object();
      for(let x$18=0,$temp27=Names.length;x$18<$temp27;x$18++) {
         Result[Names[x$18]] = Values$1[x$18];
      }
      return Result
   }
   /// function TVariant.ExamineType(const Value: Variant) : TVariantExportType
   ,ExamineType:function(Self, Value) {
      var Result = 1;
      if (Value) {
         {var $temp28 = AnsiLowerCase(typeof(Value));
            if ($temp28=="object") {
               Result = (Value.hasOwnProperty("length"))?9:8;
            }
             else if ($temp28=="function") {
               Result = 7;
            }
             else if ($temp28=="symbol") {
               Result = 6;
            }
             else if ($temp28=="boolean") {
               Result = 2;
            }
             else if ($temp28=="string") {
               Result = 5;
            }
             else if ($temp28=="number") {
               Result = (!(~(Value % 1)))?4:3;
            }
             else if ($temp28=="array") {
               Result = 9;
            }
             else {
               Result = 1;
            }
         }
      } else {
         Result = 1;
      }
      return Result
   }
   /// procedure TVariant.ForEachProperty(const Object: Variant; const CB: TJSObjectKeyCB)
   ,ForEachProperty:function(Self, Object$4, CB) {
      var lKeys,
         ltoken = "";
      if (CB) {
         lKeys = Object.getOwnPropertyNames(Object$4);
         for (ltoken in lKeys) {
            if (CB(ltoken,Object$4[ltoken]) != 1) {
               break;
            }
         }
      }
   }
   /// function TVariant.FromObject(const Instance: TObject) : Variant
   ,FromObject:function(Self, Instance) {
      var Result = undefined;
      Result = Instance;
      return Result
   }
   /// function TVariant.GetKeys(const Object: Variant) : TStrArray
   ,GetKeys:function(Self, Object$4) {
      var Result = [];
      Result = Object.getOwnPropertyNames(Object$4);
      return Result
   }
   /// function TVariant.IsArray(const AValue: Variant) : Boolean
   ,IsArray:function(Self, AValue) {
      var Result = false;
      Result = Array.isArray(AValue);
      return Result
   }
   /// function TVariant.IsBool(const AValue: Variant) : Boolean
   ,IsBool:function(Self, AValue) {
      var Result = false;
      Result = typeof(AValue) == __TYPE_MAP.Boolean;
      return Result
   }
   /// function TVariant.Isint32(const AValue: Variant) : Boolean
   ,Isint32:function(Self, AValue) {
      var Result = false;
      if (AValue == undefined) return false;
    if (AValue == null) return false;
    if (typeof(AValue) === "number") {
      if (parseInt(AValue) === AValue) return true;
    }
      return Result
   }
   /// function TVariant.IsNAN(const AValue: Variant) : Boolean
   ,IsNAN:function(Self, AValue) {
      var Result = false;
      Result = IsNaN(Number(AValue));
      return Result
   }
   /// function TVariant.IsNull(const AValue: Variant) : Boolean
   ,IsNull:function(Self, AValue) {
      var Result = false;
      Result = AValue == null;
      return Result
   }
   /// function TVariant.IsNumber(const AValue: Variant) : Boolean
   ,IsNumber:function(Self, AValue) {
      var Result = false;
      Result = typeof(AValue) == __TYPE_MAP.Number$1;
      return Result
   }
   /// function TVariant.IsObjectInstance(const instance: Variant) : Boolean
   ,IsObjectInstance:function(Self, instance) {
      var Result = false;
      Result = typeof(instance) == "object";
      return Result
   }
   /// function TVariant.IsString(const AValue: Variant) : Boolean
   ,IsString:function(Self, AValue) {
      var Result = false;
      Result = typeof(AValue) == __TYPE_MAP.String$1;
      return Result
   }
   /// function TVariant.IsUnDefined(const AValue: Variant) : Boolean
   ,IsUnDefined:function(Self, AValue) {
      var Result = false;
      Result = typeof(AValue) == "undefined";
      return Result
   }
   /// function TVariant.Properties(const Data: Variant) : TStrArray
   ,Properties:function(Self, Data) {
      var Result = [];
      if (Data) {
         Result = Object.keys(Data);
      }
      return Result
   }
   /// function TVariant.PropertyDelete(const Data: Variant; const Field: String) : Variant
   ,PropertyDelete:function(Self, Data, Field) {
      var Result = undefined;
      if (Data.hasOwnProperty(Field)) {
         delete Data[Field];
      }
      Result = Data;
      return Result
   }
   /// function TVariant.PropertyExists(const Data: Variant; const Field: String) : Boolean
   ,PropertyExists:function(Self, Data, Field) {
      var Result = false;
      if (Data) {
         Result = $VarToBool(Data.hasOwnProperty(Field));
      }
      return Result
   }
   /// function TVariant.PropertyRead(const Data: Variant; const Field: String) : Variant
   ,PropertyRead:function(Self, Data, Field) {
      var Result = undefined;
      Result = Data[Field];
      return Result
   }
   /// function TVariant.PropertyWrite(const Data: Variant; const Field: String; const Value: Variant) : Variant
   ,PropertyWrite:function(Self, Data, Field, Value) {
      var Result = undefined;
      Result = Data;
    Result[Field] = Value;
      return Result
   }
   /// function TVariant.ProperyCount(const Data: Variant) : int32
   ,ProperyCount:function(Self, Data) {
      var Result = 0;
      if (Data) {
         Result = $VarToInt(Object.keys(Data).length,"");
      }
      return Result
   }
   /// function TVariant.SearchAssociate(const Associate: Variant; const Field: String; const Value: Variant) : Variant
   ,SearchAssociate:function(Self, Associate, Field, Value) {
      var Result = undefined;
      var index$1 = 0,
         LLongs = 0;
      if (Associate) {
         index$1 = 0;
         LLongs = Associate.length>>>3;
         while (LLongs > 0) {
            if (Associate[index$1][Field] == Value) {
               return Associate[index$1];
            }
            ++index$1;
            if (Associate[index$1][Field] == Value) {
               return Associate[index$1];
            }
            ++index$1;
            if (Associate[index$1][Field] == Value) {
               return Associate[index$1];
            }
            ++index$1;
            if (Associate[index$1][Field] == Value) {
               return Associate[index$1];
            }
            ++index$1;
            if (Associate[index$1][Field] == Value) {
               return Associate[index$1];
            }
            ++index$1;
            if (Associate[index$1][Field] == Value) {
               return Associate[index$1];
            }
            ++index$1;
            if (Associate[index$1][Field] == Value) {
               return Associate[index$1];
            }
            ++index$1;
            if (Associate[index$1][Field] == Value) {
               return Associate[index$1];
            }
            ++index$1;
            --LLongs;
         }
         LLongs = Associate.length % 8;
         while (LLongs > 0) {
            if (Associate[index$1][Field] == Value) {
               return Associate[index$1];
            }
            ++index$1;
            --LLongs;
         }
      }
      return Result
   }
   /// function TVariant.ToObject(const Value: Variant) : TObject
   ,ToObject:function(Self, Value) {
      var Result = null;
      Result = Value;
      return Result
   }
   ,Destroy:TObject.Destroy
};
/// TValuePrefixType enumeration
var TValuePrefixType = [ "vpNone", "vpHexPascal", "vpHexC", "vpBinPascal", "vpBinC", "vpString" ];
/// TStringFormat enumeration
var TStringFormat = [ "seUTF8", "seWindows1252", "seShiftJis" ];
/// TString = class (TObject)
var TString = {
   $ClassName:"TString",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   /// function TString.BinaryStrToInt(BinStr: String) : int32
   ,BinaryStrToInt:function(Self, BinStr) {
      var Result = {v:0};
      try {
         if (!(TString.ExamineBinary(Self,BinStr,Result))) {
            throw EException.CreateFmt$($New(EConvertBinaryStringInvalid),"Failed to convert binary string (%s)",[BinStr]);
         }
      } finally {return Result.v}
   }
   /// function TString.CharCodeAt(const Text: String; const Index: int32) : byte
   ,CharCodeAt:function(Self, Text$1, Index) {
      var Result = 0;
      var LIndex = 0;
      LIndex = (Index > 0)?Index - 1:Index;
      Result = (Text$1).charCodeAt(LIndex);
      return Result
   }
   /// function TString.CharCodeFor(const Character: char) : int32
   ,CharCodeFor:function(Self, Character) {
      var Result = 0;
      Result = (Character).charCodeAt(0);
      return Result
   }
   /// function TString.CheckBase64Encoded(const AText: String) : Boolean
   ,CheckBase64Encoded:function(Self, AText) {
      var Result = false;
      Result = TQTXBase64Core.CheckIsBase64Encoded(TQTXBase64Core,AText);
      return Result
   }
   /// function TString.CreateGUID() : String
   ,CreateGUID:function(Self) {
      var Result = "";
      var lTemp = "";
      lTemp = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      Result += lTemp;
      lTemp = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      Result += lTemp;
      Result += "-";
      lTemp = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      Result += lTemp;
      Result += "-";
      lTemp = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      Result += lTemp;
      Result += "-";
      lTemp = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      Result += lTemp;
      Result += "-";
      lTemp = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      Result += lTemp;
      lTemp = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      Result += lTemp;
      lTemp = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      Result += lTemp;
      return Result
   }
   /// function TString.DecodeBase64(const TextToDecode: String) : String
   ,DecodeBase64:function(Self, TextToDecode) {
      var Result = "";
      Result = TQTXBase64Core.Base64ToString(TQTXBase64Core,TextToDecode);
      return Result
   }
   /// function TString.DecodeURI(const Text: String) : String
   ,DecodeURI:function(Self, Text$1) {
      var Result = "";
      Result = decodeURI(Text$1);
      return Result
   }
   /// function TString.DecodeURIComponent(const Text: String) : String
   ,DecodeURIComponent:function(Self, Text$1) {
      var Result = "";
      Result = decodeURIComponent(Text$1);
      return Result
   }
   /// function TString.DecodeUTF8(const BytesToDecode: TUInt8Array) : String
   ,DecodeUTF8:function(Self, BytesToDecode) {
      var Result = {v:""};
      try {
         var lCodec = null;
         lCodec = TDataTypeConverter.Create$4$($New(TQTXCodecUTF8));
         try {
            Result.v = TQTXCodecUTF8.Decode$(lCodec,BytesToDecode);
         } finally {
            TObject.Free(lCodec);
         }
      } finally {return Result.v}
   }
   /// function TString.EncodeBase64(const TextToEncode: String) : String
   ,EncodeBase64:function(Self, TextToEncode) {
      var Result = "";
      Result = TQTXBase64Core.StringToBase64(TQTXBase64Core,TextToEncode);
      return Result
   }
   /// function TString.EncodeURI(const Text: String) : String
   ,EncodeURI:function(Self, Text$1) {
      var Result = "";
      Result = encodeURI(Text$1);
      return Result
   }
   /// function TString.EncodeURIComponent(const Text: String) : String
   ,EncodeURIComponent:function(Self, Text$1) {
      var Result = "";
      Result = encodeURIComponent(Text$1);
      return Result
   }
   /// function TString.EncodeUTF8(const Text: String) : TUInt8Array
   ,EncodeUTF8:function(Self, Text$1) {
      var Result = {v:[]};
      try {
         var LCodec = null;
         LCodec = TDataTypeConverter.Create$4$($New(TQTXCodecUTF8));
         try {
            Result.v = TQTXCodecUTF8.Encode$(LCodec,Text$1);
         } finally {
            TObject.Free(LCodec);
         }
      } finally {return Result.v}
   }
   /// function TString.Equals(const First: String; const Second: String) : Boolean
   ,Equals:function(Self, First, Second) {
      var Result = false;
      Result = AnsiLowerCase(First) == AnsiLowerCase(Second);
      return Result
   }
   /// function TString.ExamineBinary(Text: String; var value: longword) : Boolean
   ,ExamineBinary:function(Self, Text$1, value$4) {
      var Result = false;
      var BitIndex = 0;
      value$4.v = TDataTypeConverter.InitUint32(TDataTypeConverter,0);
      if (StrBeginsWith(Text$1,"%")) {
         Text$1 = StrDeleteLeft(Text$1,1);
      } else if (StrBeginsWith(Text$1,"0b")) {
         Text$1 = StrDeleteLeft(Text$1,2);
      }
      if (!(TString.ValidBinChars(Self,Text$1))) {
         Result = false;
         return Result;
      }
      BitIndex = 0;
      for(let x$18=Text$1.length;x$18>=1;x$18--) {
         if (Text$1.charAt(x$18-1) == "1") {
            TInt32.SetBit(TInt32,BitIndex,true,value$4);
         }
         ++BitIndex;
         if (BitIndex > 31) {
            break;
         }
      }
      Result = true;
      return Result
   }
   /// function TString.ExamineBoolean(const Text: String; var Value: Boolean) : Boolean
   ,ExamineBoolean:function(Self, Text$1, Value) {
      var Result = false;
      {var $temp29 = AnsiLowerCase(Trim$_String_(Text$1));
         if ($temp29=="true") {
            Result = true;
            Value.v = true;
         }
          else if ($temp29=="yes") {
            Result = true;
            Value.v = true;
         }
          else if ($temp29=="false") {
            Result = true;
            Value.v = false;
         }
          else if ($temp29=="no") {
            Result = true;
            Value.v = false;
         }
      }
      return Result
   }
   /// function TString.ExamineFloat(Text: String; var Value: Float) : Boolean
   ,ExamineFloat:function(Self, Text$1, Value) {
      var Result = false;
      var TextLen = 0,
         scan = false,
         offset$1 = 0,
         character = "";
      Text$1 = Trim$_String_(Text$1);
      TextLen = Text$1.length;
      if (TextLen >= 1) {
         scan = false;
         offset$1 = 0;
         for (var $temp30=0;$temp30<Text$1.length;$temp30++) {
            character=$uniCharAt(Text$1,$temp30);
            if (!character) continue;
            ++offset$1;
            if (character == ".") {
               if (offset$1 == 1 && TextLen == 1) {
                  break;
               }
               if (offset$1 == 1 && TextLen > 1) {
                  scan = true;
                  continue;
               }
               if (offset$1 > 1 && offset$1 < TextLen) {
                  if (scan) {
                     break;
                  } else {
                     scan = true;
                     continue;
                  }
               } else {
                  break;
               }
            }
            Result = character>="0" && character<="9";
            if (!(Result)) {
               break;
            }
         }
         if (Result) {
            Value.v = StrToFloat(Text$1);
         }
      }
      return Result
   }
   /// function TString.Examineint32(Text: String; var Value: int32) : Boolean
   ,Examineint32:function(Self, Text$1, Value) {
      var Result = false;
      var TextLen = 0,
         Prefix = {v:0};
      Text$1 = Trim$_String_(Text$1);
      TextLen = Text$1.length;
      if (TextLen > 0) {
         Prefix.v = 0;
         if (TString.ExamineTypePrefix(Self,Text$1,Prefix)) {
            switch (Prefix.v) {
               case 1 :
                  --TextLen;
                  Text$1 = RightStr(Text$1,TextLen);
                  Result = TString.ValidHexChars(Self,Text$1);
                  if (Result) {
                     Value.v = HexToInt("0x" + Text$1);
                  }
                  break;
               case 2 :
                  (TextLen-= 2);
                  Text$1 = RightStr(Text$1,TextLen);
                  Result = TString.ValidHexChars(Self,Text$1);
                  if (Result) {
                     Value.v = HexToInt("0x" + Text$1);
                  }
                  break;
               case 3 :
                  --TextLen;
                  Text$1 = RightStr(Text$1,TextLen);
                  Result = TString.ValidBinChars(Self,Text$1);
                  if (Result) {
                     Value.v = TString.BinaryStrToInt(Self,Text$1);
                  }
                  break;
               case 4 :
                  (TextLen-= 2);
                  Text$1 = RightStr(Text$1,TextLen);
                  Result = TString.ValidBinChars(Self,Text$1);
                  if (Result) {
                     Value.v = TString.BinaryStrToInt(Self,Text$1);
                  }
                  break;
               case 5 :
                  return Result;
                  break;
               default :
                  Result = TString.ValidDecChars(Self,Text$1);
                  if (Result) {
                     Value.v = StrToInt$_String_(Text$1);
                  }
            }
         } else {
            Result = TString.ValidDecChars(Self,Text$1);
            if (Result) {
               Value.v = StrToInt$_String_(Text$1);
            }
         }
      }
      return Result
   }
   /// function TString.ExamineQuotedString(Text: String; var Value: String) : Boolean
   ,ExamineQuotedString:function(Self, Text$1, Value) {
      var Result = false;
      var TextLen = 0;
      Text$1 = Trim$_String_(Text$1);
      TextLen = Text$1.length;
      if (TextLen > 1) {
         if (StrBeginsWith(Text$1,"\"")) {
            if (StrEndsWith(Text$1,"\"")) {
               if (TextLen > 2) {
                  (TextLen-= 2);
                  Value.v = Copy$_String_Integer_Integer_(Text$1,2,TextLen);
               }
               Result = true;
            }
         }
      }
      return Result
   }
   /// function TString.ExamineTypePrefix(const Text: String; var Prefix: TValuePrefixType) : Boolean
   ,ExamineTypePrefix:function(Self, Text$1, Prefix) {
      var Result = false;
      Prefix.v = 0;
      if (Text$1.length > 0) {
         if (StrBeginsWith(Text$1,"$")) {
            Prefix.v = 1;
         } else if (StrBeginsWith(Text$1,"0x")) {
            Prefix.v = 2;
         } else if (StrBeginsWith(Text$1,"%")) {
            Prefix.v = 3;
         } else if (StrBeginsWith(Text$1,"0b")) {
            Prefix.v = 4;
         } else if (StrBeginsWith(Text$1,"\"")) {
            Prefix.v = 5;
         }
         Result = (Prefix.v!=0);
      }
      return Result
   }
   /// function TString.ExtractFileExt(const Value: String) : String
   ,ExtractFileExt:function(Self, Value) {
      var Result = "";
      var x$18 = 0;
      if (StrEndsWith(Value,"\/")) {
         return Result;
      }
      if (StrEndsWith(Value,"\\")) {
         return Result;
      }
      x$18 = Value.length;
      while (x$18 > 0) {
         if (Value.charAt(x$18-1) == ".") {
            Result = Copy$_String_Integer_Integer_(Value,x$18,Value.length);
            break;
         }
         --x$18;
      }
      return Result
   }
   /// function TString.FromCharCode(const CharCode: uint8) : char
   ,FromCharCode:function(Self, CharCode) {
      var Result = "";
      Result = String.fromCharCode(CharCode);
      return Result
   }
   /// function TString.GetStringIsQuoted(const Text: String) : Boolean
   ,GetStringIsQuoted:function(Self, Text$1) {
      var Result = false;
      var TextLen = 0;
      TextLen = Text$1.length;
      if (TextLen > 1) {
         Result = StrBeginsWith(Text$1,"\"") && StrEndsWith(Text$1,"\"");
      }
      return Result
   }
   /// function TString.HexStrToInt(HexStr: String) : int32
   ,HexStrToInt:function(Self, HexStr) {
      var Result = {v:0};
      try {
         if (!(TString.Examineint32(Self,HexStr,Result))) {
            throw EException.CreateFmt$($New(EConvertHexStringInvalid),"Failed to convert hex string (%s)",[HexStr]);
         }
      } finally {return Result.v}
   }
   /// function TString.LeftPad(Pad: char; Value: String; FitLength: int32) : String
   ,LeftPad:function(Self, Pad$2, Value, FitLength) {
      var Result = "";
      Result = Value;
      Pad$2 = Pad$2.charAt(0);
      if (FitLength > Result.length) {
         while (Result.length < FitLength) {
            Result = Pad$2.charAt(0) + Result;
         }
      }
      return Result
   }
   /// function TString.QuoteString(const Text: String) : String
   ,QuoteString:function(Self, Text$1) {
      var Result = "";
      if (TString.GetStringIsQuoted(Self,Text$1)) {
         Result = Text$1;
      } else {
         Result = "\""+Text$1+"\"";
      }
      return Result
   }
   /// function TString.RepeatChar(const Count: int32; const Charcode: uint8) : String
   ,RepeatChar:function(Self, Count, Charcode) {
      var Result = {v:""};
      try {
         var LCache = "";
         if (Count > 0) {
            LCache = TString.FromCharCode(Self,Charcode);
            SetLength(Result,Count);
            for(let x$18=1,$temp31=Count;x$18<=$temp31;x$18++) {
               Result.v = $StrSet(Result.v,x$18,LCache.charAt(0));
            }
         }
      } finally {return Result.v}
   }
   /// function TString.ResolveDataType(Text: String) : TJSVMDataType
   ,ResolveDataType$1:function(Self, Text$1) {
      var Result = {v:0};
      try {
         if (!(TString.ResolveDataType(Self,Text$1,Result))) {
            Result.v = 0;
         }
      } finally {return Result.v}
   }
   /// function TString.ResolveDataType(Text: String; var Determined: TJSVMDataType) : Boolean
   ,ResolveDataType:function(Self, Text$1, Determined) {
      var Result = false;
      var DummyBoolean = { v : false },
         DummyFloat = { v : 0 },
         Prefix = { v : 0 };
      Result = false;
      Determined.v = 0;
      if (TString.ExamineBoolean(Self,Text$1,DummyBoolean)) {
         Determined.v = 1;
         Result = true;
         return Result;
      }
      if (TString.ExamineFloat(Self,Text$1,DummyFloat)) {
         Determined.v = 9;
         Result = true;
         return Result;
      }
      if (TString.ValidDecChars(Self,Text$1)) {
         Determined.v = 7;
         Result = true;
         return Result;
      }
      if (TString.ExamineTypePrefix(Self,Text$1,Prefix)) {
         switch (Prefix.v) {
            case 5 :
               Determined.v = 10;
               break;
            case 1 :
               Text$1 = RightStr(Text$1,Text$1.length - 1);
               switch (Text$1.length) {
                  case 1 :
                     Determined.v = 2;
                     break;
                  case 2 :
                     Determined.v = 2;
                     break;
                  case 4 :
                     Determined.v = 4;
                     break;
                  case 8 :
                     Determined.v = 5;
                     break;
               }
               break;
            case 2 :
               Text$1 = RightStr(Text$1,Text$1.length - 2);
               switch (Text$1.length) {
                  case 1 :
                     Determined.v = 2;
                     break;
                  case 2 :
                     Determined.v = 2;
                     break;
                  case 4 :
                     Determined.v = 4;
                     break;
                  case 8 :
                     Determined.v = 5;
                     break;
               }
               break;
            case 3 :
               Text$1 = RightStr(Text$1,Text$1.length - 1);
               if (TString.ValidBinChars(TString,Text$1)) {
                  if (Text$1.length <= 8) {
                     Determined.v = 2;
                  } else if (Text$1.length > 8 && Text$1.length <= 16) {
                     Determined.v = 4;
                  } else if (Text$1.length > 16 || Text$1.length >= 32) {
                     Determined.v = 5;
                  }
               }
               break;
            case 4 :
               Text$1 = RightStr(Text$1,Text$1.length - 2);
               if (Text$1.length <= 8) {
                  Determined.v = 2;
               } else if (Text$1.length > 8 && Text$1.length <= 16) {
                  Determined.v = 4;
               } else if (Text$1.length > 16 && Text$1.length <= 32) {
                  Determined.v = 5;
               }
               break;
         }
         Result = (Determined.v!=0);
      }
      return Result
   }
   /// function TString.Split(const Value: String; const Delimiter: String) : TStrArray
   ,Split:function(Self, Value, Delimiter) {
      var Result = [];
      Result = (Value).split(Delimiter);
      return Result
   }
   /// function TString.UnQuoteString(const Text: String) : String
   ,UnQuoteString:function(Self, Text$1) {
      var Result = "";
      var TextLen = 0;
      TextLen = Text$1.length;
      if (TextLen > 1) {
         if (StrBeginsWith(Text$1,"\"") && StrEndsWith(Text$1,"\"")) {
            (TextLen-= 2);
            Result = Copy$_String_Integer_Integer_(Text$1,2,TextLen);
         } else {
            Result = Text$1;
         }
      }
      return Result
   }
   /// function TString.ValidBinChars(const Text: String) : Boolean
   ,ValidBinChars:function(Self, Text$1) {
      var Result = false;
      var character = "";
      for (var $temp32=0;$temp32<Text$1.length;$temp32++) {
         character=$uniCharAt(Text$1,$temp32);
         if (!character) continue;
         Result = ((character=="0")||(character=="1"));
         if (!(Result)) {
            break;
         }
      }
      return Result
   }
   /// function TString.ValidDecChars(const Text: String) : Boolean
   ,ValidDecChars:function(Self, Text$1) {
      var Result = false;
      var character = "";
      for (var $temp33=0;$temp33<Text$1.length;$temp33++) {
         character=$uniCharAt(Text$1,$temp33);
         if (!character) continue;
         Result = character>="0" && character<="9";
         if (!(Result)) {
            break;
         }
      }
      return Result
   }
   /// function TString.ValidHexChars(const Text: String) : Boolean
   ,ValidHexChars:function(Self, Text$1) {
      var Result = false;
      var character = "";
      for (var $temp34=0;$temp34<Text$1.length;$temp34++) {
         character=$uniCharAt(Text$1,$temp34);
         if (!character) continue;
         Result = ((character>="0" && character<="9")||(character>="a" && character<="f")||(character>="A" && character<="F"));
         if (!(Result)) {
            break;
         }
      }
      return Result
   }
   ,Destroy:TObject.Destroy
};
function TryStrToInt$1(Data, Value) {
   var Result = false;
   Result = TString.Examineint32(TString,Data,Value);
   return Result
}
function TryStrToFloat$1(Data, Value) {
   var Result = false;
   Result = TString.ExamineFloat(TString,Data,Value);
   return Result
}
function TryStrToBool(Data, Value) {
   var Result = false;
   Result = TString.ExamineBoolean(TString,Data,Value);
   return Result
}
/// TQTXWidgetDialogType enumeration
var TQTXWidgetDialogType = [ "dlgHTML", "dlgText", "dlgColor", "dlgFont", "dlgPicture", "dlgVideo", "dlgBackground", "dlgDataField", "dlgDataBinding", "dlgBinary", "dlgView", "dlgViewDesign" ];
/// TQTXWidgetCategory enumeration
var TQTXWidgetCategory = [ "ccGeneral", "ccContainers", "ccLists", "ccDatabase", "ccDOM" ];
/// TQTXPlatformId enumeration
var TQTXPlatformId = { 4608:"pidBrowser", 4609:"pidNode", 4610:"pidAny" };
/// TQTXOperatingSystem enumeration
var TQTXOperatingSystem = [ "osUnknown", "osWindows", "osMacOS", "osLinux" ];
/// TQTXIdentifiers = class (TObject)
var TQTXIdentifiers = {
   $ClassName:"TQTXIdentifiers",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   /// function TQTXIdentifiers.MakeUniqueComponentId() : String
   ,MakeUniqueComponentId:function(Self) {
      var Result = "";
      ++Counter;
      Result = "Component" + IntToStr$_Integer_(Counter);
      return Result
   }
   /// function TQTXIdentifiers.MakeUniqueFormName() : String
   ,MakeUniqueFormName:function(Self) {
      var Result = "";
      ++Counter;
      Result = "Form" + IntToStr$_Integer_(Counter);
      return Result
   }
   /// function TQTXIdentifiers.MakeUniqueId(Prefix: String) : String
   ,MakeUniqueId:function(Self, Prefix) {
      var Result = "";
      ++Counter;
      Prefix = Trim$_String_(Prefix);
      Result = (Prefix.length < 1)?"Object" + IntToStr$_Integer_(Counter):Prefix + IntToStr$_Integer_(Counter);
      return Result
   }
   /// function TQTXIdentifiers.MakeUniqueNumber() : int32
   ,MakeUniqueNumber:function(Self) {
      var Result = 0;
      ++Counter;
      Result = Counter;
      return Result
   }
   /// function TQTXIdentifiers.MakeUniqueObjectId() : String
   ,MakeUniqueObjectId:function(Self) {
      var Result = "";
      ++Counter;
      Result = "OBJ" + IntToStr$_Integer_(Counter);
      return Result
   }
   /// function TQTXIdentifiers.MakeUniqueWidgetId(const Prefix: String) : String
   ,MakeUniqueWidgetId$1:function(Self, Prefix) {
      var Result = "";
      ++Counter;
      Result = Prefix+"Widget"+IntToStr$_Integer_(Counter);
      return Result
   }
   /// function TQTXIdentifiers.MakeUniqueWidgetId() : String
   ,MakeUniqueWidgetId:function(Self) {
      var Result = "";
      ++Counter;
      Result = "Widget" + IntToStr$_Integer_(Counter);
      return Result
   }
   ,Destroy:TObject.Destroy
};
/// TQTXFilePermissionMask enumeration
var TQTXFilePermissionMask = { 0:"fpNone", 111:"fpExecute", 222:"fpWrite", 333:"fpWriteExecute", 444:"fpRead", 555:"fpReadExecute", 666:"fpDefault", 777:"fpReadWriteExecute", 740:"fpRWEGroupReadOnly" };
/// TQTXCRC = class (TObject)
var TQTXCRC = {
   $ClassName:"TQTXCRC",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   /// procedure TQTXCRC.BuildCRCTable()
   ,BuildCRCTable:function(Self) {
      var x$18 = 0,
         y$13 = 0,
         r$7 = 0;
      for(x$18=0;x$18<=255;x$18++) {
         r$7 = x$18;
         for(y$13=0;y$13<=7;y$13++) {
            if (r$7&1) {
               r$7 = (r$7>>>1)^3988292384;
            } else {
               r$7 = r$7>>>1;
            }
         }
         CRC_Table[x$18] = r$7;
      }
   }
   /// function TQTXCRC.CalcCRC32(const AData: TUInt8Array) : int32
   ,CalcCRC32$4:function(Self, AData) {
      var Result = 0;
      var LResult = 0,
         lCharCode = 0;
      if (!(CRC_Table_Ready)) {
         TQTXCRC.BuildCRCTable(Self);
         CRC_Table_Ready = true;
      }
      if (AData.length > 0) {
         LResult = 4294967295;
         for(let x$18=0,$temp35=AData.length;x$18<$temp35;x$18++) {
            lCharCode = AData[x$18];
            LResult = (LResult>>>8)^CRC_Table[lCharCode^(LResult&255)];
         }
         Result = (LResult ^ 0xFFFFFFFF) >>> 0;
      }
      return Result
   }
   /// function TQTXCRC.CalcCRC32(const AData: JUint8Array) : int32
   ,CalcCRC32$3:function(Self, AData) {
      var Result = 0;
      if (!!AData) {
         Result = TQTXCRC.CalcCRC32$1(Self,AData.buffer);
      }
      return Result
   }
   /// function TQTXCRC.CalcCRC32(const AData: TManagedMemory) : int32
   ,CalcCRC32$2:function(Self, AData) {
      var Result = 0;
      if (!!AData && TManagedMemory.a$46(AData) > 0) {
         Result = TQTXCRC.CalcCRC32$1(Self,AData.fBuffer);
      }
      return Result
   }
   /// function TQTXCRC.CalcCRC32(const AData: JArrayBuffer) : int32
   ,CalcCRC32$1:function(Self, AData) {
      var Result = 0;
      var lView = null,
         LResult = 0;
      if (!(CRC_Table_Ready)) {
         TQTXCRC.BuildCRCTable(Self);
         CRC_Table_Ready = true;
      }
      if (!!AData) {
         if (AData.byteLength > 0) {
            lView = new DataView(AData);
            try {
               LResult = 4294967295;
               for(let x$18=0,$temp36=AData.byteLength;x$18<$temp36;x$18++) {
                  LResult = (LResult>>>8)^CRC_Table[lView.getUint8(x$18)^(LResult&255)];
               }
               Result = (LResult ^ 0xFFFFFFFF) >>> 0;
            } finally {
               lView = null;
            }
         }
      }
      return Result
   }
   /// function TQTXCRC.CalcCRC32(const Text: String) : int32
   ,CalcCRC32:function(Self, Text$1) {
      var Result = 0;
      if (Text$1.length > 0) {
         Result = TQTXCRC.CalcCRC32$4(Self,TString.EncodeUTF8(TString,Text$1));
      }
      return Result
   }
   ,Destroy:TObject.Destroy
};
/// TQTXAdler32 = class (TObject)
var TQTXAdler32 = {
   $ClassName:"TQTXAdler32",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   /// function TQTXAdler32.CalcAdler32(const AData: JArrayBuffer) : int32
   ,CalcAdler32$3:function(Self, AData) {
      var Result = 0;
      var s1 = 0,
         s2 = 0,
         lView = null;
      s1 = 1;
      s2 = 0;
      if (!!AData && AData.byteLength > 0) {
         lView = new DataView(AData);
         try {
            for(let x$18=0,$temp37=AData.byteLength;x$18<$temp37;x$18++) {
               s1 = (s1 + lView.getUint8(x$18)) % 65521;
               s2 = (s2 + s1) % 65521;
            }
         } finally {
            lView = null;
         }
      }
      Result = (((s2) << 16) | (s1)) >>> 0;
      return Result
   }
   /// function TQTXAdler32.CalcAdler32(const AData: JUint8Array) : int32
   ,CalcAdler32$2:function(Self, AData) {
      var Result = 0;
      if (!!AData) {
         Result = TQTXAdler32.CalcAdler32$3(Self,AData.buffer);
      } else {
         Result = 1;
      }
      return Result
   }
   /// function TQTXAdler32.CalcAdler32(const AData: TUInt8Array) : int32
   ,CalcAdler32$1:function(Self, AData) {
      var Result = 0;
      var s1 = 0,
         s2 = 0;
      s1 = 1;
      s2 = 0;
      if (AData.length > 0) {
         for(let x$18=0,$temp38=AData.length;x$18<$temp38;x$18++) {
            s1 = (s1 + AData[x$18]) % 65521;
            s2 = (s2 + s1) % 65521;
         }
      }
      Result = (((s2) << 16) | (s1)) >>> 0;
      return Result
   }
   /// function TQTXAdler32.CalcAdler32(const Text: String) : int32
   ,CalcAdler32:function(Self, Text$1) {
      var Result = 0;
      if (Text$1.length > 0) {
         Result = TQTXAdler32.CalcAdler32$1(Self,TString.EncodeUTF8(TString,Text$1));
      } else {
         Result = 1;
      }
      return Result
   }
   ,Destroy:TObject.Destroy
};
/// function TObjectHelper.InheritsFrom(const ClsType: TClass) : Boolean
function TObjectHelper$InheritsFrom(Self$16, ClsType) {
   var Result = false;
   var Current = null;
   Current = TObject.ClassType(Self$16.ClassType);
   do {
      Result = Current == ClsType;
      if (Result) {
         break;
      }
      Current = TObject.ClassParent(Current);
   } while (!(!(!!Current)));
   return Result
}
/// function TObjectHelper.InheritsFromAny(const ClsTypes: array of TClass) : Boolean
function TObjectHelper$InheritsFromAny(Self$17, ClsTypes) {
   var Result = false;
   var a$139 = 0,
      el$1 = null;
   var $temp39;
   for(a$139=0,$temp39=ClsTypes.length;a$139<$temp39;a$139++) {
      el$1 = ClsTypes[a$139];
      Result = TObjectHelper$InheritsFrom(Self$17,el$1);
      if (Result) {
         break;
      }
   }
   return Result
}
/// function TObjectHelper.QualifiedClassName() : String
function TObjectHelper$QualifiedClassName(Self$18) {
   var Result = "";
   Result = "qtx.sysutils."+TObject.ClassName(Self$18.ClassType);
   return Result
}
/// TJSVMEndianType enumeration
var TJSVMEndianType = [ "stDefault", "stLittleEndian", "stBigEndian" ];
/// TJSVMDataType enumeration
var TJSVMDataType = [ "dtUnknown", "dtBoolean", "dtByte", "dtChar", "dtWord", "dtLong", "dtInt16", "dtInt32", "dtFloat32", "dtFloat64", "dtString" ];
/// TInt32 = class (TObject)
var TInt32 = {
   $ClassName:"TInt32",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   /// function TInt32.Average(const Domain: TInt32Array) : int32
   ,Average:function(Self, Domain) {
      var Result = 0;
      var LCount = 0;
      LCount = Domain.length;
      if (LCount > 0) {
         Result = $Div(TInt32.Sum(TInt32,Domain),LCount);
      }
      return Result
   }
   /// function TInt32.Diff(const Primary: int32; const Secondary: int32) : int32
   ,Diff:function(Self, Primary, Secondary) {
      var Result = 0;
      if (Primary != Secondary) {
         if (Primary > Secondary) {
            Result = Primary - Secondary;
         } else {
            Result = Secondary - Primary;
         }
         if (Result < 0) {
            Result = (Result - 1)^(-1);
         }
      } else {
         Result = 0;
      }
      return Result
   }
   /// function TInt32.EnsureRange(const Value: int32; const Lowest: int32; const Highest: int32) : int32
   ,EnsureRange:function(Self, Value, Lowest, Highest) {
      var Result = 0;
      Result = (Value < Lowest)?Lowest:(Value > Highest)?Highest:Value;
      return Result
   }
   /// function TInt32.FromEmStr(const Value: String) : int32
   ,FromEmStr:function(Self, Value) {
      var Result = 0;
      var lText = "";
      if (AnsiLowerCase(RightStr(Value,2)) == "em") {
         lText = Copy$_String_Integer_Integer_(Value,1,Value.length - 2);
         if (TVariant.IsNumber(TVariant,lText)) {
            Result = StrToInt$_String_(lText);
         }
      }
      return Result
   }
   /// function TInt32.FromPsStr(const Value: String) : int32
   ,FromPsStr:function(Self, Value) {
      var Result = 0;
      var LText = "";
      if (StrEndsWith(Value,"%")) {
         LText = Copy$_String_Integer_Integer_(Value,1,Value.length - 1);
         if (TVariant.IsNumber(TVariant,LText)) {
            Result = StrToInt$_String_(LText);
         }
      }
      return Result
   }
   /// function TInt32.FromPxStr(const Value: String) : int32
   ,FromPxStr:function(Self, Value) {
      var Result = 0;
      var lText = "";
      if (AnsiLowerCase(RightStr(Value,2)) == "px") {
         lText = Copy$_String_Integer_Integer_(Value,1,Value.length - 2);
         if (TVariant.IsNumber(TVariant,lText)) {
            Result = StrToInt$_String_(lText);
         }
      }
      return Result
   }
   /// function TInt32.GetBit(const Index: int32; const Buffer: int32) : Boolean
   ,GetBit:function(Self, Index, Buffer$1) {
      var Result = false;
      if (Index >= 0 && Index <= 31) {
         Result = ((Buffer$1&(1<<Index))!=0);
      } else {
         throw Exception.Create($New(EException),$R[0]);
      }
      return Result
   }
   /// function TInt32.IsNaN(const Value: int32) : Boolean
   ,IsNaN$1:function(Self, Value) {
      var Result = false;
      Result = Number.isNaN(Value);
      return Result
   }
   /// function TInt32.Largest(const Domain: TInt32Array) : int32
   ,Largest$1:function(Self, Domain) {
      var Result = 0;
      var a$140 = 0,
         el$2 = 0;
      var $temp40;
      for(a$140=0,$temp40=Domain.length;a$140<$temp40;a$140++) {
         el$2 = Domain[a$140];
         if (el$2 > Result) {
            Result = el$2;
         }
      }
      return Result
   }
   /// function TInt32.Largest(const Primary: int32; const Secondary: int32) : int32
   ,Largest:function(Self, Primary, Secondary) {
      var Result = 0;
      if (Primary > Secondary) {
         Result = Primary;
      } else {
         Result = Secondary;
      }
      return Result
   }
   /// function TInt32.MaxSafeNumber() : int32
   ,MaxSafeNumber:function(Self) {
      var Result = 0;
      Result = Number.MAX_SAFE_INTEGER;
      return Result
   }
   /// function TInt32.Middle(const Primary: int32; const Secondary: int32) : int32
   ,Middle:function(Self, Primary, Secondary) {
      var Result = 0;
      Result = $Div(Primary + Secondary,2);
      return Result
   }
   /// function TInt32.PercentOf(const ATotal: int32; const APercent: int32) : int32
   ,PercentOf:function(Self, ATotal, APercent) {
      var Result = 0;
      if (ATotal > 0) {
         Result = Trunc(APercent * ATotal / 100);
      }
      return Result
   }
   /// function TInt32.PercentOfValue(const Value: int32; const Total: int32) : int32
   ,PercentOfValue:function(Self, Value, Total) {
      var Result = 0;
      if (Value <= Total) {
         Result = Trunc(Value / Total * 100);
      }
      return Result
   }
   /// function TInt32.Power(const Value: int32; const Factor: int32) : int32
   ,Power$1:function(Self, Value, Factor) {
      var Result = 0;
      Result = math.pow(Value,Factor);
      return Result
   }
   /// procedure TInt32.SetBit(const index: int32; const Value: Boolean; var buffer: int32)
   ,SetBit:function(Self, index$1, Value, buffer$3) {
      if (index$1 >= 0 && index$1 <= 31) {
         if (Value) {
            buffer$3.v = buffer$3.v|(1<<index$1);
         } else {
            buffer$3.v = buffer$3.v&(~(1<<index$1));
         }
      } else {
         throw Exception.Create($New(EException),$R[0]);
      }
   }
   /// function TInt32.Sign(const Value: int32) : int32
   ,Sign$3:function(Self, Value) {
      var Result = 0;
      Result = Sign$_Integer_(Value);
      return Result
   }
   /// function TInt32.Smallest(const Domain: TInt32Array) : int32
   ,Smallest$1:function(Self, Domain) {
      var Result = 0;
      var a$141 = 0,
         el$2 = 0;
      Result = (Domain.length-1);
      if (Result >= 0) {
         Result = Domain[0];
         var $temp41;
         for(a$141=0,$temp41=Domain.length;a$141<$temp41;a$141++) {
            el$2 = Domain[a$141];
            if (el$2 < Result) {
               Result = el$2;
            }
         }
      }
      return Result
   }
   /// function TInt32.Smallest(const Primary: int32; const Secondary: int32) : int32
   ,Smallest:function(Self, Primary, Secondary) {
      var Result = 0;
      if (Primary < Secondary) {
         Result = Primary;
      } else {
         Result = Secondary;
      }
      return Result
   }
   /// procedure TInt32.Sort(var Domain: TInt32Array)
   ,Sort:function(Self, Domain) {
      Domain.v.sort($CmpNum);
   }
   /// function TInt32.SubtractLargest(const First: int32; const Second: int32) : int32
   ,SubtractLargest:function(Self, First, Second) {
      var Result = 0;
      if (First > Second) {
         Result = Second - First;
      } else {
         Result = First - Second;
      }
      return Result
   }
   /// function TInt32.SubtractSmallest(const First: int32; const Second: int32) : int32
   ,SubtractSmallest:function(Self, First, Second) {
      var Result = 0;
      if (First < Second) {
         Result = Second - First;
      } else {
         Result = First - Second;
      }
      return Result
   }
   /// function TInt32.Sum(const Domain: TInt32Array) : int32
   ,Sum:function(Self, Domain) {
      var Result = 0;
      var a$142 = 0,
         x$18 = 0;
      Result = 0;
      var $temp42;
      for(a$142=0,$temp42=Domain.length;a$142<$temp42;a$142++) {
         x$18 = Domain[a$142];
         Result+=x$18;
      }
      return Result
   }
   /// procedure TInt32.Swap(var Primary: int32; var Secondary: int32)
   ,Swap:function(Self, Primary, Secondary) {
      var temp = 0;
      temp = Primary.v;
      Primary.v = Secondary.v;
      Secondary.v = temp;
   }
   /// function TInt32.ToEmStr(const Value: int32) : String
   ,ToEmStr:function(Self, Value) {
      var Result = "";
      Result = IntToStr$_Integer_(Value) + "em";
      return Result
   }
   /// function TInt32.ToHex(const Value: int32) : String
   ,ToHex:function(Self, Value) {
      var Result = "";
      Result = ( (Value) >>> 0).toString(16);
      return Result
   }
   /// function TInt32.ToNearest(const Value: int32; const Factor: int32) : int32
   ,ToNearest:function(Self, Value, Factor) {
      var Result = 0;
      var lTemp = 0;
      Result = Value;
      lTemp = Value % Factor;
      if (lTemp > 0) {
         (Result+= (Factor - lTemp));
      }
      return Result
   }
   /// function TInt32.ToNearestSigned(const Value: int32; const Factor: int32) : int32
   ,ToNearestSigned:function(Self, Value, Factor) {
      var Result = 0;
      Result = (1 + ($Div(Value - 1,Factor))) * Factor;
      return Result
   }
   /// function TInt32.ToPsStr(const Percent: int32) : String
   ,ToPsStr:function(Self, Percent) {
      var Result = "";
      Result = IntToStr$_Integer_(Percent) + "%";
      return Result
   }
   /// function TInt32.ToPxStr(const Value: int32) : String
   ,ToPxStr:function(Self, Value) {
      var Result = "";
      Result = IntToStr$_Integer_(Value) + "px";
      return Result
   }
   /// function TInt32.WithinRange(const Value: int32; const Lowest: int32; const Highest: int32) : Boolean
   ,WithinRange:function(Self, Value, Lowest, Highest) {
      var Result = false;
      Result = Value >= Lowest && Value <= Highest;
      return Result
   }
   /// function TInt32.WrapRange(const Value: int32; const LowRange: int32; const HighRange: int32) : int32
   ,WrapRange:function(Self, Value, LowRange, HighRange) {
      var Result = 0;
      if (Value > HighRange) {
         Result = LowRange + TInt32.Diff(Self,HighRange,Value - 1);
         if (Result > HighRange) {
            Result = TInt32.WrapRange(Self,Result,LowRange,HighRange);
         }
      } else if (Value < LowRange) {
         Result = HighRange - TInt32.Diff(Self,LowRange,Value + 1);
         if (Result < LowRange) {
            Result = TInt32.WrapRange(Self,Result,LowRange,HighRange);
         }
      } else {
         Result = Value;
      }
      return Result
   }
   ,Destroy:TObject.Destroy
};
/// TFloat = class (TObject)
var TFloat = {
   $ClassName:"TFloat",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   /// function TFloat.PercentOfValue(const Value: double; Total: double) : double
   ,PercentOfValue$1:function(Self, Value, Total) {
      var Result = undefined;
      if (Value <= Total) {
         Result = Value / Total * 100;
      }
      return Result
   }
   /// function TFloat.Power(const Value: double; const Factor: double) : double
   ,Power$2:function(Self, Value, Factor) {
      var Result = undefined;
      Result = Math.pow(Value,Factor);
      return Result
   }
   ,Destroy:TObject.Destroy
};
/// TEnumState enumeration
var TEnumState = [ "esBreak", "esContinue" ];
/// TDateUtils = class (TObject)
var TDateUtils = {
   $ClassName:"TDateUtils",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   /// function TDateUtils.BytesToDateTime(const Bytes: TUInt8Array) : TDateTime
   ,BytesToDateTime:function(Self, Bytes) {
      var Result = undefined;
      var mRaw = null,
         mWrite = null;
      mRaw = new Uint8Array(8);
    mWrite = new DataView((mRaw).buffer);
      mWrite.setUint8(0,Bytes[0]);
      mWrite.setUint8(1,Bytes[1]);
      mWrite.setUint8(2,Bytes[2]);
      mWrite.setUint8(3,Bytes[3]);
      mWrite.setUint8(4,Bytes[4]);
      mWrite.setUint8(5,Bytes[5]);
      mWrite.setUint8(6,Bytes[6]);
      mWrite.setUint8(7,Bytes[7]);
      Result = mWrite.getFloat64(0,false);
      return Result
   }
   /// function TDateUtils.DateOf(const Value: TDateTime) : TDate
   ,DateOf:function(Self, Value) {
      var Result = 0;
      var myear = { v : 0 },
         mMonth = { v : 0 },
         mDay = { v : 0 };
      DecodeDate(Number(Value),myear,mMonth,mDay,0);
      Result = TDateUtils.EncodeDate$1(Self,myear.v,mMonth.v,mDay.v);
      return Result
   }
   /// function TDateUtils.DateTimeToBytes(const Value: TDateTime) : TUInt8Array
   ,DateTimeToBytes:function(Self, Value) {
      var Result = [];
      var mRaw = null,
         mWrite = null;
      mRaw = new Uint8Array(8);
    mWrite = new DataView((mRaw).buffer);
      mWrite.setFloat64(0,Number(Value),false);
      Result.push(mWrite.getUint8(0));
      Result.push(mWrite.getUint8(1));
      Result.push(mWrite.getUint8(2));
      Result.push(mWrite.getUint8(3));
      Result.push(mWrite.getUint8(4));
      Result.push(mWrite.getUint8(5));
      Result.push(mWrite.getUint8(6));
      Result.push(mWrite.getUint8(7));
      return Result
   }
   /// function TDateUtils.DateTimeToTimestamp(const Value: TDateTime) : JTimeStamp
   ,DateTimeToTimestamp:function(Self, Value) {
      var Result = {Date$2:0,Time$1:0};
      var lFlat = 0,
         lDays = 0;
      lFlat = Round(Number(Value * 86400000));
      lDays = $Div(lFlat,86400000);
      Result.Date$2 = 693594 + lDays;
      Result.Time$1 = Abs$_Integer_(lFlat) % 86400000;
      return Result
   }
   /// function TDateUtils.DayOf(const Value: TDateTime) : int32
   ,DayOf:function(Self, Value) {
      var Result = {v:0};
      try {
         var lTemp = { v : 0 };
         DecodeDate(Number(Value),lTemp,lTemp,Result,0);
      } finally {return Result.v}
   }
   /// function TDateUtils.DayOfYear(const Value: TDateTime) : int32
   ,DayOfYear$1:function(Self, Value) {
      var Result = 0;
      var lMonth = 0;
      lMonth = TDateUtils.MonthOf(Self,Value);
      for(let segment=1,$temp43=lMonth;segment<$temp43;segment++) {
         (Result+= TDateUtils.DaysInMonth$1(Self,segment));
      }
      (Result+= TDateUtils.DayOf(Self,Value));
      return Result
   }
   /// function TDateUtils.DaysInMonth(const Month: int32) : int32
   ,DaysInMonth$1:function(Self, Month) {
      var Result = 0;
      if (Month > 0 && Month < 13) {
         Result = DaysInMonthTable[IsLeapYear(TDateUtils.YearOf$1(Self,Now()))?1:0][(Month)-1];
      }
      return Result
   }
   /// function TDateUtils.DaysInMonth(const Value: TDateTime) : int32
   ,DaysInMonth:function(Self, Value) {
      var Result = 0;
      var lMonth = 0;
      lMonth = TDateUtils.MonthOf(Self,Value);
      if (lMonth > 0 && lMonth < 13) {
         Result = DaysInMonthTable[IsLeapYear(TDateUtils.YearOf$1(Self,Value))?1:0][(lMonth)-1];
      }
      return Result
   }
   /// function TDateUtils.EncodeDate(const Year: int32; const Month: int32; const Day: int32) : TDate
   ,EncodeDate$1:function(Self, Year, Month, Day) {
      var Result = {v:0};
      try {
         TDateUtils.TryEncodeDate(Self,Year,Month,Day,Result);
      } finally {return Result.v}
   }
   /// function TDateUtils.EncodeDateTime(const Date: TDate; const Time: TTime) : TDateTime
   ,EncodeDateTime$2:function(Self, Date$3, Time$2) {
      var Result = undefined;
      Result = Date$3;
      if (Result >= 0) {
         Result += Time$2;
      } else {
         Result -= Time$2;
      }
      return Result
   }
   /// function TDateUtils.EncodeDateTime(const Year: int32; const Months: int32; const Days: int32; const Hours: int32; const Minutes: int32; const Seconds: int32; const MilliSeconds: int32) : TDateTime
   ,EncodeDateTime$1:function(Self, Year, Months, Days, Hours, Minutes, Seconds, MilliSeconds) {
      var Result = undefined;
      var LDate = {v:0},
         LTime = {v:0};
      Result = TDataTypeConverter.InitFloat64(TDataTypeConverter,0);
      LDate.v = TDataTypeConverter.InitFloat32(TDataTypeConverter,0);
      if (TDateUtils.TryEncodeDate(Self,Year,Months,Days,LDate)) {
         LTime.v = TDataTypeConverter.InitFloat32(TDataTypeConverter,0);
         if (TDateUtils.TryEncodeTime(Self,Hours,Minutes,Seconds,MilliSeconds,LTime)) {
            if (LDate.v >= 0) {
               Result += LDate.v + LTime.v;
            } else {
               Result += LDate.v - LTime.v;
            }
         }
      }
      return Result
   }
   /// function TDateUtils.EncodeTime(const Hour: int32; const Minute: int32; const Second: int32; const Millisecond: int32) : TTime
   ,EncodeTime$1:function(Self, Hour, Minute, Second, Millisecond) {
      var Result = {v:0};
      try {
         TDateUtils.TryEncodeTime(Self,Hour,Minute,Second,Millisecond,Result);
      } finally {return Result.v}
   }
   /// function TDateUtils.FromJsDate(const Value: JDate) : TDateTime
   ,FromJsDate:function(Self, Value) {
      var Result = undefined;
      Result = Value.getTime() / 86400000 + 25569;
      return Result
   }
   /// function TDateUtils.FromJsDateLocal(const Value: JDate) : TDateTime
   ,FromJsDateLocal:function(Self, Value) {
      var Result = undefined;
      Result = (Value.getTime() - 60000 * Value.getTimezoneOffset()) / 86400000 + 25569;
      return Result
   }
   /// function TDateUtils.HourOf(const Value: TDateTime) : int32
   ,HourOf:function(Self, Value) {
      var Result = {v:0};
      try {
         var lTemp = { v : 0 };
         DecodeTime(TDateUtils.TimeOf(Self,Value),Result,lTemp,lTemp,lTemp,0);
      } finally {return Result.v}
   }
   /// function TDateUtils.HoursBetween(const aThen: TDateTime; const aNow: TDateTime) : int32
   ,HoursBetween:function(Self, aThen, aNow) {
      var Result = 0;
      Result = Round(TDateUtils.MillisecondsBetween(Self,aThen,aNow) / 3600000);
      return Result
   }
   /// function TDateUtils.MillisecondsBetween(const aThen: TDateTime; const aNow: TDateTime) : int32
   ,MillisecondsBetween:function(Self, aThen, aNow) {
      var Result = 0;
      var lSrc = 0,
         lDst = 0;
      lSrc = TDateUtils.TimeToMilliSeconds(Self,aNow);
      lDst = TDateUtils.TimeToMilliSeconds(Self,aThen);
      Result = Max$_Integer_Integer_(lSrc,lDst) - Min$_Integer_Integer_(lSrc,lDst);
      return Result
   }
   /// function TDateUtils.MillisecondsOf(const Value: TDateTime) : int32
   ,MillisecondsOf:function(Self, Value) {
      var Result = {v:0};
      try {
         var lTemp = { v : 0 };
         DecodeTime(TDateUtils.TimeOf(Self,Value),lTemp,lTemp,lTemp,Result,0);
      } finally {return Result.v}
   }
   /// function TDateUtils.MinuteOf(const Value: TDateTime) : int32
   ,MinuteOf:function(Self, Value) {
      var Result = {v:0};
      try {
         var lTemp = { v : 0 };
         DecodeTime(TDateUtils.TimeOf(Self,Value),lTemp,Result,lTemp,lTemp,0);
      } finally {return Result.v}
   }
   /// function TDateUtils.MinutesBetween(const aThen: TDateTime; const aNow: TDateTime) : int32
   ,MinutesBetween:function(Self, aThen, aNow) {
      var Result = 0;
      Result = Round(TDateUtils.MillisecondsBetween(Self,aThen,aNow) / 60000);
      return Result
   }
   /// function TDateUtils.MonthOf(const Value: TDateTime) : int32
   ,MonthOf:function(Self, Value) {
      var Result = {v:0};
      try {
         var lTemp = { v : 0 };
         DecodeDate(Number(Value),lTemp,Result,lTemp,0);
      } finally {return Result.v}
   }
   /// function TDateUtils.SecondsBetween(const aThen: TDateTime; const aNow: TDateTime) : int32
   ,SecondsBetween:function(Self, aThen, aNow) {
      var Result = 0;
      Result = Round(TDateUtils.MillisecondsBetween(Self,aThen,aNow) / 1000);
      return Result
   }
   /// function TDateUtils.SecondsOf(const Value: TDateTime) : int32
   ,SecondsOf:function(Self, Value) {
      var Result = {v:0};
      try {
         var lTemp = { v : 0 };
         DecodeTime(TDateUtils.TimeOf(Self,Value),lTemp,lTemp,Result,lTemp,0);
      } finally {return Result.v}
   }
   /// function TDateUtils.TimeOf(const Value: TDateTime) : TTime
   ,TimeOf:function(Self, Value) {
      var Result = 0;
      var mHour = { v : 0 },
         mMinute = { v : 0 },
         mSecond = { v : 0 },
         mMSec = { v : 0 };
      DecodeTime(Number(Value),mHour,mMinute,mSecond,mMSec,0);
      Result = TDateUtils.EncodeTime$1(Self,mHour.v,mMinute.v,mSecond.v,mMSec.v);
      return Result
   }
   /// function TDateUtils.TimestampToDateTime(const Value: JTimeStamp) : TDateTime
   ,TimestampToDateTime:function(Self, Value) {
      var Result = undefined;
      var lFlat = 0;
      lFlat = Value.Date$2;
      (lFlat-= 693594);
      lFlat *= 86400000;
      if (lFlat >= 0) {
         (lFlat+= Value.Time$1);
      } else {
         (lFlat-= Value.Time$1);
      }
      Result = lFlat / 86400000;
      return Result
   }
   /// function TDateUtils.TimeToMilliSeconds(const Value: TDateTime) : int32
   ,TimeToMilliSeconds:function(Self, Value) {
      var Result = 0;
      var mHour = { v : 0 },
         mMinute = { v : 0 },
         mSecond = { v : 0 },
         mMSec = { v : 0 };
      DecodeTime(Number(Value),mHour,mMinute,mSecond,mMSec,0);
      Result = mHour.v * 3600000 + mMinute.v * 60000 + mSecond.v * 1000 + mMSec.v;
      return Result
   }
   /// function TDateUtils.ToJsDate(const Value: TDateTime) : JDate
   ,ToJsDate:function(Self, Value) {
      var Result = null;
      Result = new Date();
      Result.setTime(Round((Value - 25569) * 86400000));
      return Result
   }
   /// function TDateUtils.ToJsDateLocal(const Value: TDateTime) : JDate
   ,ToJsDateLocal:function(Self, Value) {
      var Result = null;
      Result = new Date();
      Result.setTime(Round((Value - 25569) * 86400000) + 60000 * Result.getTimezoneOffset());
      return Result
   }
   /// function TDateUtils.TryEncodeDate(Year: int32; Month: int32; Day: int32; var Date: TDate) : Boolean
   ,TryEncodeDate:function(Self, Year, Month, Day, Date$3) {
      var Result = false;
      var LLeap = false,
         i$6 = 0;
      Date$3.v = TDataTypeConverter.InitFloat32(TDataTypeConverter,0);
      if (Year < 1) {
         return Result;
      }
      if (Year > 9999) {
         return Result;
      }
      if (Month < 1) {
         return Result;
      }
      if (Month > 12) {
         return Result;
      }
      if (Day < 1) {
         return Result;
      }
      LLeap = IsLeapYear(Year);
      Result = Day <= DaysInMonthTable[LLeap?1:0][(Month)-1];
      if (Result) {
         var $temp44;
         for(i$6=1,$temp44=Month;i$6<$temp44;i$6++) {
            (Day+= DaysInMonthTable[LLeap?1:0][(i$6)-1]);
         }
         i$6 = Year - 1;
         Date$3.v += i$6 * 365 + ($Div(i$6,4)) - ($Div(i$6,100)) + ($Div(i$6,400)) + Day - 693594;
      }
      return Result
   }
   /// function TDateUtils.TryEncodeTime(Hour: int32; Min: int32; Sec: int32; MSec: int32; var Time: TTime) : Boolean
   ,TryEncodeTime:function(Self, Hour, Min$2, Sec, MSec, Time$2) {
      var Result = false;
      var lTimeStamp = {Date$2:0,Time$1:0};
      if (Hour > 24) {
         return Result;
      }
      if (Min$2 > 60) {
         return Result;
      }
      if (Sec > 60) {
         return Result;
      }
      if (MSec > 1000) {
         return Result;
      }
      lTimeStamp.Time$1 = Hour * 3600000 + Min$2 * 60 * 1000 + Sec * 1000 + MSec;
      lTimeStamp.Date$2 = 693594;
      Time$2.v = Number(TDateUtils.TimestampToDateTime(Self,lTimeStamp));
      Result = true;
      return Result
   }
   /// function TDateUtils.WeekOfYear(const Value: TDateTime) : int32
   ,WeekOfYear:function(Self, Value) {
      var Result = 0;
      var lDays = 0;
      lDays = TDateUtils.DayOfYear$1(Self,Value);
      Result = $Div(lDays,7);
      if (lDays % 7 > 0) {
         ++Result;
      }
      return Result
   }
   /// function TDateUtils.WeeksOfYear(const Value: TDateTime) : int32
   ,WeeksOfYear$1:function(Self, Value) {
      var Result = 0;
      Result = (IsLeapYear(TDateUtils.YearOf$1(Self,Value)))?53:52;
      return Result
   }
   /// function TDateUtils.WeeksOfYear(const Year: int32) : int32
   ,WeeksOfYear:function(Self, Year) {
      var Result = 0;
      Result = (IsLeapYear(Year))?53:52;
      return Result
   }
   /// function TDateUtils.YearOf(const Value: TDateTime) : int32
   ,YearOf$1:function(Self, Value) {
      var Result = {v:0};
      try {
         var lTemp = { v : 0 };
         DecodeDate(Number(Value),Result,lTemp,lTemp,0);
      } finally {return Result.v}
   }
   ,Destroy:TObject.Destroy
};
/// TDataTypeConverter = class (TObject)
var TDataTypeConverter = {
   $ClassName:"TDataTypeConverter",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.OnEndianChanged = null;
      $.FBuffer = $.FView = null;
      $.FEndian = 0;
      $.FTyped = null;
   }
   /// function TDataTypeConverter.Base64ToBytes(const Base64: String) : TUInt8Array
   ,Base64ToBytes:function(Self, Base64) {
      var Result = [];
      var __buffer = Buffer.from(Base64, 'base64');
      Result = Array.prototype.slice.call(__buffer);
      return Result
   }
   /// function TDataTypeConverter.BooleanToBytes(const Value: Boolean) : TUInt8Array
   ,BooleanToBytes:function(Self, Value) {
      var Result = [];
      Result.push((Value)?1:0);
      return Result
   }
   /// function TDataTypeConverter.BooleanToTypedArray(const Value: Boolean) : TMemoryHandle
   ,BooleanToTypedArray:function(Self, Value) {
      var Result = undefined;
      Result = new Uint8Array(1);
      Result[0] = (Value)?1:0;
      return Result
   }
   /// function TDataTypeConverter.BytesToBase64(const Bytes: JTypedArray) : String
   ,BytesToBase64$2:function(Self, Bytes) {
      var Result = "";
      Result = Buffer.from( Bytes ).toString("base64");
      return Result
   }
   /// function TDataTypeConverter.BytesToBase64(const ABuffer: JArrayBuffer) : String
   ,BytesToBase64$1:function(Self, ABuffer) {
      var Result = "";
      Result = Buffer.from(ABuffer).toString("base64");
      return Result
   }
   /// function TDataTypeConverter.BytesToBase64(const Bytes: TUInt8Array) : String
   ,BytesToBase64:function(Self, Bytes) {
      var Result = "";
      Result = Buffer.from( Bytes ).toString("base64");
      return Result
   }
   /// function TDataTypeConverter.BytesToBoolean(const Data: TUInt8Array) : Boolean
   ,BytesToBoolean:function(Self, Data) {
      var Result = false;
      Result = Data[0] > 0;
      return Result
   }
   /// function TDataTypeConverter.BytesToChar(const Value: TUInt8Array) : char
   ,BytesToChar:function(Self, Value) {
      var Result = "";
      Result = TString.DecodeUTF8(TString,Value);
      return Result
   }
   /// function TDataTypeConverter.BytesToFloat32(const Data: TUInt8Array) : Float
   ,BytesToFloat32:function(Self, Data) {
      var Result = 0;
      Self.FView.setUint8(0,Data[0]);
      Self.FView.setUint8(1,Data[1]);
      Self.FView.setUint8(2,Data[2]);
      Self.FView.setUint8(3,Data[3]);
      switch (Self.FEndian) {
         case 0 :
            Result = Self.FView.getFloat32(0);
            break;
         case 1 :
            Result = Self.FView.getFloat32(0,true);
            break;
         case 2 :
            Result = Self.FView.getFloat32(0,false);
            break;
      }
      return Result
   }
   /// function TDataTypeConverter.BytesToFloat64(const Data: TUInt8Array) : Float
   ,BytesToFloat64:function(Self, Data) {
      var Result = 0;
      Self.FView.setUint8(0,Data[0]);
      Self.FView.setUint8(1,Data[1]);
      Self.FView.setUint8(2,Data[2]);
      Self.FView.setUint8(3,Data[3]);
      Self.FView.setUint8(4,Data[4]);
      Self.FView.setUint8(5,Data[5]);
      Self.FView.setUint8(6,Data[6]);
      Self.FView.setUint8(7,Data[7]);
      switch (Self.FEndian) {
         case 0 :
            Result = Self.FView.getFloat64(0);
            break;
         case 1 :
            Result = Self.FView.getFloat64(0,true);
            break;
         case 2 :
            Result = Self.FView.getFloat64(0,false);
            break;
      }
      return Result
   }
   /// function TDataTypeConverter.BytesToInt16(const Data: TUInt8Array) : smallint
   ,BytesToInt16:function(Self, Data) {
      var Result = 0;
      Self.FView.setUint8(0,Data[0]);
      Self.FView.setUint8(1,Data[1]);
      switch (Self.FEndian) {
         case 0 :
            Result = Self.FView.getInt16(0);
            break;
         case 1 :
            Result = Self.FView.getInt16(0,true);
            break;
         case 2 :
            Result = Self.FView.getInt16(0,false);
            break;
      }
      return Result
   }
   /// function TDataTypeConverter.BytesToInt32(const Data: TUInt8Array) : int32
   ,BytesToInt32:function(Self, Data) {
      var Result = 0;
      Self.FView.setUint8(0,Data[0]);
      Self.FView.setUint8(1,Data[1]);
      Self.FView.setUint8(2,Data[2]);
      Self.FView.setUint8(3,Data[3]);
      switch (Self.FEndian) {
         case 0 :
            Result = Self.FView.getInt32(0);
            break;
         case 1 :
            Result = Self.FView.getInt32(0,true);
            break;
         case 2 :
            Result = Self.FView.getInt32(0,false);
            break;
      }
      return Result
   }
   /// function TDataTypeConverter.BytesToString(const Data: TUInt8Array) : String
   ,BytesToString:function(Self, Data) {
      var Result = "";
      var LTemp = null,
         Codec__ = null;
      if (Data.length > 0) {
         LTemp = new Uint8Array(Data.length);
         (LTemp).set(Data, 0);
         Codec__ = new TextDecoder("utf8");
         Result = Codec__.decode(LTemp);
         Codec__ = null;
      }
      return Result
   }
   /// function TDataTypeConverter.BytesToTypedArray(const Values: TUInt8Array) : TMemoryHandle
   ,BytesToTypedArray:function(Self, Values$1) {
      var Result = undefined;
      Result = new Uint8Array(Values$1.length);
      (Result).set(Values$1, 0);
      return Result
   }
   /// function TDataTypeConverter.BytesToUInt16(const Data: TUInt8Array) : word
   ,BytesToUInt16:function(Self, Data) {
      var Result = 0;
      Self.FView.setUint8(0,Data[0]);
      Self.FView.setUint8(1,Data[1]);
      switch (Self.FEndian) {
         case 0 :
            Result = Self.FView.getUint16(0);
            break;
         case 1 :
            Result = Self.FView.getUint16(0,true);
            break;
         case 2 :
            Result = Self.FView.getUint16(0,false);
            break;
      }
      return Result
   }
   /// function TDataTypeConverter.BytesToUInt32(const Data: TUInt8Array) : longword
   ,BytesToUInt32:function(Self, Data) {
      var Result = 0;
      Self.FView.setUint8(0,Data[0]);
      Self.FView.setUint8(1,Data[1]);
      Self.FView.setUint8(2,Data[2]);
      Self.FView.setUint8(3,Data[3]);
      switch (Self.FEndian) {
         case 0 :
            Result = Self.FView.getUint32(0);
            break;
         case 1 :
            Result = Self.FView.getUint32(0,true);
            break;
         case 2 :
            Result = Self.FView.getUint32(0,false);
            break;
      }
      return Result
   }
   /// function TDataTypeConverter.BytesToVariant(Data: TUInt8Array) : Variant
   ,BytesToVariant:function(Self, Data) {
      var Result = undefined;
      var LType$1 = 0;
      LType$1 = Data[0];
      Data.shift();
      switch (LType$1) {
         case 17 :
            Result = TDataTypeConverter.BytesToBoolean(Self.ClassType,Data);
            break;
         case 18 :
            Result = Data[0];
            break;
         case 24 :
            Result = TDataTypeConverter.BytesToUInt16(Self,Data);
            break;
         case 25 :
            Result = TDataTypeConverter.BytesToUInt32(Self,Data);
            break;
         case 19 :
            Result = TDataTypeConverter.BytesToInt16(Self,Data);
            break;
         case 20 :
            Result = TDataTypeConverter.BytesToInt32(Self,Data);
            break;
         case 21 :
            Result = TDataTypeConverter.BytesToFloat32(Self,Data);
            break;
         case 22 :
            Result = TDataTypeConverter.BytesToFloat64(Self,Data);
            break;
         case 23 :
            Result = TString.DecodeUTF8(TString,Data);
            break;
         default :
            throw EException.CreateFmt$($New(EConvertError),$R[1],[IntToHex(LType$1,2)]);
      }
      return Result
   }
   /// function TDataTypeConverter.ByteToChar(const Value: byte) : char
   ,ByteToChar:function(Self, Value) {
      var Result = "";
      Result = String.fromCharCode(Value);
      return Result
   }
   /// function TDataTypeConverter.ByteToTypedArray(const Value: byte) : TMemoryHandle
   ,ByteToTypedArray:function(Self, Value) {
      var Result = undefined;
      Result = new Uint8Array(1);
      Result[0] = (Value < 0)?0:(Value > 255)?255:Value;
      return Result
   }
   /// function TDataTypeConverter.CharToByte(const Value: char) : word
   ,CharToByte:function(Self, Value) {
      var Result = 0;
      Result = (Value).charCodeAt(0);
      return Result
   }
   /// function TDataTypeConverter.CharToBytes(const Value: char) : TUInt8Array
   ,CharToBytes:function(Self, Value) {
      var Result = [];
      Result = TString.EncodeUTF8(TString,Value.charAt(-1));
      return Result
   }
   /// constructor TDataTypeConverter.Create()
   ,Create$4:function(Self) {
      TObject.Create(Self);
      Self.FBuffer = new ArrayBuffer(16);
    Self.FView   = new DataView(Self.FBuffer);
      Self.FTyped = new Uint8Array(Self.FBuffer,0,15);
      return Self
   }
   /// destructor TDataTypeConverter.Destroy()
   ,Destroy:function(Self) {
      Self.FTyped = null;
      Self.FView = null;
      Self.FBuffer = null;
      TObject.Destroy(Self);
   }
   /// function TDataTypeConverter.Float32ToBytes(const Value: float32) : TUInt8Array
   ,Float32ToBytes:function(Self, Value) {
      var Result = [];
      switch (Self.FEndian) {
         case 0 :
            Self.FView.setFloat32(0,Value);
            break;
         case 1 :
            Self.FView.setFloat32(0,Value,true);
            break;
         case 2 :
            Self.FView.setFloat32(0,Value,false);
            break;
      }
      Result = Array.prototype.slice.call( Self.FTyped, 0, 4 );
      return Result
   }
   /// function TDataTypeConverter.Float32ToTypedArray(const Value: float32) : TMemoryHandle
   ,Float32ToTypedArray:function(Self, Value) {
      var Result = undefined;
      switch (Self.FEndian) {
         case 0 :
            Self.FView.setFloat32(0,Value);
            break;
         case 1 :
            Self.FView.setFloat32(0,Value,true);
            break;
         case 2 :
            Self.FView.setFloat32(0,Value,false);
            break;
      }
      Result = Self.FTyped.slice(0,__SIZES[8]);
      return Result
   }
   /// function TDataTypeConverter.Float64ToBytes(const Value: float64) : TUInt8Array
   ,Float64ToBytes:function(Self, Value) {
      var Result = [];
      var LTypeSize = 0;
      switch (Self.FEndian) {
         case 0 :
            Self.FView.setFloat64(0,Number(Value));
            break;
         case 1 :
            Self.FView.setFloat64(0,Number(Value),true);
            break;
         case 2 :
            Self.FView.setFloat64(0,Number(Value),false);
            break;
      }
      LTypeSize = __SIZES[9];
      Result = Array.prototype.slice.call( Self.FTyped, 0, LTypeSize );
      return Result
   }
   /// function TDataTypeConverter.Float64ToTypedArray(const Value: float64) : TMemoryHandle
   ,Float64ToTypedArray:function(Self, Value) {
      var Result = undefined;
      switch (Self.FEndian) {
         case 0 :
            Self.FView.setFloat64(0,Number(Value));
            break;
         case 1 :
            Self.FView.setFloat64(0,Number(Value),true);
            break;
         case 2 :
            Self.FView.setFloat64(0,Number(Value),false);
            break;
      }
      Result = Self.FTyped.slice(0,__SIZES[9]);
      return Result
   }
   /// function TDataTypeConverter.InitFloat32(const Value: float32) : float32
   ,InitFloat32:function(Self, Value) {
      var Result = 0;
      var temp = null;
      temp = new Float32Array(1);
      temp[0]=Value;
      Result = temp[0];
      return Result
   }
   /// function TDataTypeConverter.InitFloat64(const Value: float64) : float64
   ,InitFloat64:function(Self, Value) {
      var Result = undefined;
      var temp = null;
      temp = new Float64Array(1);
      temp[0]=(Number(Value));
      Result = temp[0];
      return Result
   }
   /// function TDataTypeConverter.InitInt08(const Value: int8) : int8
   ,InitInt08:function(Self, Value) {
      var Result = 0;
      var temp = null;
      temp = new Int8Array(1);
      temp[0]=((Value < -128)?-128:(Value > 127)?127:Value);
      Result = temp[0];
      return Result
   }
   /// function TDataTypeConverter.InitInt16(const Value: int16) : int16
   ,InitInt16:function(Self, Value) {
      var Result = 0;
      var temp = null;
      temp = new Int16Array(1);
      temp[0]=((Value < -32768)?-32768:(Value > 32767)?32767:Value);
      Result = temp[0];
      return Result
   }
   /// function TDataTypeConverter.InitInt32(const Value: int32) : int32
   ,InitInt32:function(Self, Value) {
      var Result = 0;
      var temp = null;
      temp = new Int32Array(1);
      temp[0]=((Value < -2147483648)?-2147483648:(Value > 2147483647)?2147483647:Value);
      Result = temp[0];
      return Result
   }
   /// function TDataTypeConverter.InitUint08(const Value: uint8) : uint8
   ,InitUint08:function(Self, Value) {
      var Result = 0;
      var LTemp = null;
      LTemp = new Uint8Array(1);
      LTemp[0]=Value;
      Result = LTemp[0];
      return Result
   }
   /// function TDataTypeConverter.InitUint16(const Value: uint16) : uint16
   ,InitUint16:function(Self, Value) {
      var Result = 0;
      var temp = null;
      temp = new Uint16Array(1);
      temp[0]=((Value < 0)?0:(Value > 65536)?65536:Value);
      Result = temp[0];
      return Result
   }
   /// function TDataTypeConverter.InitUint32(const Value: uint32) : uint32
   ,InitUint32:function(Self, Value) {
      var Result = 0;
      var temp = null;
      temp = new Uint32Array(1);
      temp[0]=((Value < 0)?0:(Value > 4294967295)?4294967295:Value);
      Result = temp[0];
      return Result
   }
   /// function TDataTypeConverter.Int16ToBytes(const Value: int16) : TUInt8Array
   ,Int16ToBytes:function(Self, Value) {
      var Result = [];
      switch (Self.FEndian) {
         case 0 :
            Self.FView.setInt16(0,Value);
            break;
         case 1 :
            Self.FView.setInt16(0,Value,true);
            break;
         case 2 :
            Self.FView.setInt16(0,Value,false);
            break;
      }
      Result = Array.prototype.slice.call( Self.FTyped, 0, 2 );
      return Result
   }
   /// function TDataTypeConverter.Int16ToTypedArray(const Value: word) : TMemoryHandle
   ,Int16ToTypedArray:function(Self, Value) {
      var Result = undefined;
      switch (Self.FEndian) {
         case 0 :
            Self.FView.setInt16(0,Value);
            break;
         case 1 :
            Self.FView.setInt16(0,Value,true);
            break;
         case 2 :
            Self.FView.setInt16(0,Value,false);
            break;
      }
      Result = Self.FTyped.slice(0,__SIZES[6]);
      return Result
   }
   /// function TDataTypeConverter.Int32ToBytes(const Value: int32) : TUInt8Array
   ,Int32ToBytes:function(Self, Value) {
      var Result = [];
      var LTypeSize = 0;
      switch (Self.FEndian) {
         case 0 :
            Self.FView.setInt32(0,Value);
            break;
         case 1 :
            Self.FView.setInt32(0,Value,true);
            break;
         case 2 :
            Self.FView.setInt32(0,Value,false);
            break;
      }
      LTypeSize = __SIZES[7];
      Result = Array.prototype.slice.call( Self.FTyped, 0, LTypeSize );
      return Result
   }
   /// function TDataTypeConverter.Int32ToTypedArray(const Value: longword) : TMemoryHandle
   ,Int32ToTypedArray:function(Self, Value) {
      var Result = undefined;
      switch (Self.FEndian) {
         case 0 :
            Self.FView.setInt32(0,Value);
            break;
         case 1 :
            Self.FView.setInt32(0,Value,true);
            break;
         case 2 :
            Self.FView.setInt32(0,Value,false);
            break;
      }
      Result = Self.FTyped.slice(0,__SIZES[7]);
      return Result
   }
   /// function TDataTypeConverter.NameOfType(const Kind: TJSVMDataType) : String
   ,NameOfType:function(Self, Kind) {
      var Result = "";
      Result = _NAMES[Kind];
      return Result
   }
   /// procedure TDataTypeConverter.SetEndian(const NewEndian: TJSVMEndianType)
   ,SetEndian:function(Self, NewEndian) {
      if (NewEndian != Self.FEndian) {
         Self.FEndian = NewEndian;
         if (Self.OnEndianChanged) {
            Self.OnEndianChanged(Self);
         }
      }
   }
   /// function TDataTypeConverter.SizeOfType(const Kind: TJSVMDataType) : int32
   ,SizeOfType:function(Self, Kind) {
      var Result = 0;
      Result = __SIZES[Kind];
      return Result
   }
   /// function TDataTypeConverter.StringToBytes(const Value: String) : TUInt8Array
   ,StringToBytes$1:function(Self, Value) {
      var Result = [];
      Result = TDataTypeConverter.StringToBytes(Self,Value,0);
      return Result
   }
   /// function TDataTypeConverter.StringToBytes(const Value: String; const AType: TStringFormat) : TUInt8Array
   ,StringToBytes:function(Self, Value, AType) {
      var Result = [];
      var lEncType = "",
         Codec__ = null,
         rw = null;
      lEncType = (!AType)?"utf8":(AType == 1)?"windows-1252":(AType == 2)?"shift-jis":"utf8";
      if (Value.length > 0) {
         Codec__ = new TextEncoder(lEncType);
         rw = Codec__.encode(Value);
         Codec__ = null;
         Result = Array.prototype.slice.call(rw, 0, (rw).byteLength);
         rw = null;
      }
      return Result
   }
   /// function TDataTypeConverter.StringToTypedArray(const Value: String) : TMemoryHandle
   ,StringToTypedArray:function(Self, Value) {
      var Result = undefined;
      var Codec__ = null;
      Codec__ = new TextEncoder("utf8");
      Result = Codec__.encode(Value);
      Codec__ = null;
      return Result
   }
   /// function TDataTypeConverter.SystemEndian() : TJSVMEndianType
   ,SystemEndian:function(Self) {
      var Result = 0;
      var LLittle = 0,
         LBig = 0;
      LLittle = 1;
      LBig = 2;
      try {
         var LBuffer = new ArrayBuffer(2);
      var L8Array = new Uint8Array(LBuffer);
      var L16array = new Uint16Array(LBuffer);
      L8Array[0] = 0xAA;
      L8Array[1] = 0xBB;
      if(L16array[0] === 0xBBAA) {
        Result = LLittle;
      } else {
        if (L16array[0] === 0xAABB) Result = LBig;
      }
      } catch ($e) {
         /* null */
      }
      return Result
   }
   /// function TDataTypeConverter.TypeByName(TypeName: String) : TJSVMDataType
   ,TypeByName:function(Self, TypeName) {
      var Result = 0;
      var x$18 = 0,
         a$143 = 0,
         Name$6 = "";
      Result = 0;
      TypeName = AnsiLowerCase(Trim$_String_(TypeName));
      if (TypeName.length > 0) {
         x$18 = 0;
         for(a$143=0;a$143<=10;a$143++) {
            Name$6 = _NAMES[a$143];
            if (AnsiLowerCase(Name$6) == TypeName) {
               Result = x$18;
               break;
            }
            ++x$18;
         }
      }
      return Result
   }
   /// function TDataTypeConverter.TypedArrayToBytes(const Value: TMemoryHandle) : TUInt8Array
   ,TypedArrayToBytes:function(Self, Value) {
      var Result = [];
      if (Value) {
         Result = Array.prototype.slice.call(Value);
      } else {
         throw Exception.Create($New(EConvertError),"Failed to convert, handle is nil or unassigned error");
      }
      return Result
   }
   /// function TDataTypeConverter.TypedArrayToFloat32(const Value: TMemoryHandle) : float32
   ,TypedArrayToFloat32:function(Self, Value) {
      var Result = 0;
      var LBuffer = null,
         LBytes = 0,
         LView = null;
      if (!Value) {
         throw Exception.Create($New(EConvertError),"Failed to convert, handle was nil or unassigned error");
      }
      LBuffer = Value.buffer;
      LBytes = LBuffer.byteLength;
      if (LBytes < __SIZES[8]) {
         throw Exception.Create($New(EConvertError),"Failed to convert, insufficient data error");
      }
      if (LBytes > __SIZES[8]) {
         LBytes = __SIZES[8];
      }
      LView = new DataView(LBuffer);
      switch (Self.FEndian) {
         case 0 :
            Result = LView.getFloat32(0);
            break;
         case 1 :
            Result = LView.getFloat32(0,true);
            break;
         case 2 :
            Result = LView.getFloat32(0,false);
            break;
      }
      LView = null;
      return Result
   }
   /// function TDataTypeConverter.TypedArrayToStr(const Value: TMemoryHandle) : String
   ,TypedArrayToStr:function(Self, Value) {
      var Result = "";
      var Codec__ = null;
      if (Value) {
         if (Value.length > 0) {
            Codec__ = new TextDecoder("utf8");
            Result = Codec__.decode(Value);
            Codec__ = null;
         }
      }
      return Result
   }
   /// function TDataTypeConverter.TypedArrayToUInt32(const Value: TMemoryHandle) : uint32
   ,TypedArrayToUInt32:function(Self, Value) {
      var Result = 0;
      var LBuffer = null,
         LBytes = 0,
         LView = null;
      if (!Value) {
         throw Exception.Create($New(EConvertError),"Failed to convert, handle was nil or unassigned error");
      }
      LBuffer = Value.buffer;
      LBytes = LBuffer.byteLength;
      if (LBytes < __SIZES[7]) {
         throw Exception.Create($New(EConvertError),"Failed to convert, insufficient data error");
      }
      if (LBytes > __SIZES[7]) {
         LBytes = __SIZES[7];
      }
      LView = new DataView(LBuffer);
      switch (Self.FEndian) {
         case 0 :
            Result = LView.getUint32(0);
            break;
         case 1 :
            Result = LView.getUint32(0,true);
            break;
         case 2 :
            Result = LView.getUint32(0,false);
            break;
      }
      LView = null;
      return Result
   }
   /// function TDataTypeConverter.UInt16ToBytes(const Value: uint16) : TUInt8Array
   ,UInt16ToBytes:function(Self, Value) {
      var Result = [];
      var LTypeSize = 0;
      switch (Self.FEndian) {
         case 0 :
            Self.FView.setUint16(0,Value);
            break;
         case 1 :
            Self.FView.setUint16(0,Value,true);
            break;
         case 2 :
            Self.FView.setUint16(0,Value,false);
            break;
      }
      LTypeSize = __SIZES[6];
      Result = Array.prototype.slice.call( Self.FTyped, 0, LTypeSize );
      return Result
   }
   /// function TDataTypeConverter.UInt32ToBytes(const Value: uint32) : TUInt8Array
   ,UInt32ToBytes:function(Self, Value) {
      var Result = [];
      var LTypeSize = 0;
      switch (Self.FEndian) {
         case 0 :
            Self.FView.setUint32(0,Value);
            break;
         case 1 :
            Self.FView.setUint32(0,Value,true);
            break;
         case 2 :
            Self.FView.setUint32(0,Value,false);
            break;
      }
      LTypeSize = __SIZES[5];
      Result = Array.prototype.slice.call( Self.FTyped, 0, LTypeSize );
      return Result
   }
   /// function TDataTypeConverter.UnTypedBufferToBytes(const ABuffer: JArrayBuffer) : TUInt8Array
   ,UnTypedBufferToBytes:function(Self, ABuffer) {
      var Result = [];
      var __TypedTemp = null;
      if (ABuffer) {
         __TypedTemp = new Uint8Array(ABuffer);
         Result = Array.prototype.slice.call(__TypedTemp);
      } else {
         throw Exception.Create($New(EConvertError),"Failed to convert, handle is nil or unassigned error");
      }
      return Result
   }
   /// function TDataTypeConverter.VariantToBytes(const Value: Variant) : TUInt8Array
   ,VariantToBytes:function(Self, Value) {
      var Result = [];
      var LType$1 = 0;
      function IsFloat32(x$18) {
         var Result = false;
         Result = isFinite(x$18) && x$18 == Math.fround(x$18);
         return Result
      }
      function GetUnSignedIntType() {
         var Result = 0;
         if (Value <= 255) {
            return 18;
         }
         if (Value <= 65536) {
            return 24;
         }
         if (Value <= 2147483647) {
            Result = 25;
         }
         return Result
      }
      function GetSignedIntType() {
         var Result = 0;
         if (Value > -32768) {
            return 19;
         }
         if (Value > -2147483648) {
            Result = 20;
         }
         return Result
      }
      switch (TVariant.ExamineType(TVariant,Value)) {
         case 2 :
            Result = [17];
            Result.pusha(TDataTypeConverter.BooleanToBytes(Self.ClassType,$VarToBool(Value)));
            break;
         case 3 :
            if (Value < 0) {
               LType$1 = GetSignedIntType();
            } else {
               LType$1 = GetUnSignedIntType();
            }
            if (LType$1) {
               Result = [LType$1];
               switch (LType$1) {
                  case 18 :
                     Result.push(TDataTypeConverter.InitInt08(Self.ClassType,$VarToInt(Value,"")));
                     break;
                  case 24 :
                     Result.pusha(TDataTypeConverter.UInt16ToBytes(Self,TDataTypeConverter.InitUint16(Self.ClassType,$VarToInt(Value,""))));
                     break;
                  case 25 :
                     Result.pusha(TDataTypeConverter.UInt32ToBytes(Self,TDataTypeConverter.InitUint32(Self.ClassType,$VarToInt(Value,""))));
                     break;
                  case 19 :
                     Result.pusha(TDataTypeConverter.Int16ToBytes(Self,TDataTypeConverter.InitInt16(Self.ClassType,$VarToInt(Value,""))));
                     break;
                  case 20 :
                     Result.pusha(TDataTypeConverter.Int32ToBytes(Self,TDataTypeConverter.InitInt32(Self.ClassType,$VarToInt(Value,""))));
                     break;
               }
            } else {
               throw Exception.Create($New(EConvertError),$R[2]);
            }
            break;
         case 4 :
            if (IsFloat32(Value)) {
               Result = [21];
               Result.pusha(TDataTypeConverter.Float32ToBytes(Self,Number(Value)));
            } else {
               Result = [22];
               Result.pusha(TDataTypeConverter.Float64ToBytes(Self,Number(Value)));
            }
            break;
         case 5 :
            Result = [23];
            Result.pusha(TString.EncodeUTF8(TString,String(Value)));
            break;
         default :
            throw Exception.Create($New(EConvertError),$R[3]);
      }
      return Result
   }
   ,Destroy$:function($){return $.ClassType.Destroy($)}
   ,Create$4$:function($){return $.ClassType.Create$4($)}
   ,SetEndian$:function($){return $.ClassType.SetEndian.apply($.ClassType, arguments)}
};
/// TBounds = record
function Copy$TBounds(s,d) {
   d.Height=s.Height;
   d.Left=s.Left;
   d.Top=s.Top;
   d.Width=s.Width;
   return d;
}
function Clone$TBounds($) {
   return {
      Height:$.Height,
      Left:$.Left,
      Top:$.Top,
      Width:$.Width
   }
}
/// function TBounds.Create(ALeft: int32; ATop: int32; AWidth: int32; AHeight: int32) : TBounds
function Create$6(ALeft, ATop, AWidth, AHeight) {
   var Result = {Height:0,Left:0,Top:0,Width:0};
   Result.Left = ALeft;
   Result.Top = ATop;
   Result.Width = AWidth;
   Result.Height = AHeight;
   return Result
}
/// function TBounds.Create(AWidth: int32; AHeight: int32) : TBounds
function Create$5(AWidth$1, AHeight$1) {
   var Result = {Height:0,Left:0,Top:0,Width:0};
   Result.Width = AWidth$1;
   Result.Height = AHeight$1;
   return Result
}
/// procedure TBounds.SetBounds(var Self: TBounds; const ALeft: int32; const ATop: int32; const AWidth: int32; const AHeight: int32)
function TBounds$SetBounds(Self$19, ALeft$1, ATop$1, AWidth$2, AHeight$2) {
   Self$19.Left = ALeft$1;
   Self$19.Top = ATop$1;
   Self$19.Width = AWidth$2;
   Self$19.Height = AHeight$2;
}
/// procedure TBounds.SetHeight(var Self: TBounds; const Value: int32)
function TBounds$SetHeight(Self$20, Value) {
   Self$20.Height = Value;
}
/// procedure TBounds.SetLeft(var Self: TBounds; const Value: int32)
function TBounds$SetLeft(Self$21, Value$1) {
   Self$21.Left = Value$1;
}
/// procedure TBounds.SetSize(var Self: TBounds; const AWidth: int32; const AHeight: int32)
function TBounds$SetSize(Self$22, AWidth$3, AHeight$3) {
   Self$22.Width = AWidth$3;
   Self$22.Height = AHeight$3;
}
/// procedure TBounds.SetTop(var Self: TBounds; const Value: int32)
function TBounds$SetTop(Self$23, Value$2) {
   Self$23.Top = Value$2;
}
/// procedure TBounds.SetWidth(var Self: TBounds; const Value: int32)
function TBounds$SetWidth(Self$24, Value$3) {
   Self$24.Width = Value$3;
}
/// function TBounds.ToString(var Self: TBounds) : String
function TBounds$ToString(Self$25) {
   var Result = "";
   Result = Format("%d,%d,%d,%d",[Self$25.Left, Self$25.Top, Self$25.Width, Self$25.Height]);
   return Result
}
/// TCustomAttribute = class (TObject)
var TCustomAttribute = {
   $ClassName:"TCustomAttribute",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   ,Destroy:TObject.Destroy
};
/// RegisterWidget = class (TCustomAttribute)
var RegisterWidget = {
   $ClassName:"RegisterWidget",$Parent:TCustomAttribute
   ,$Init:function ($) {
      TCustomAttribute.$Init($);
      $.Category = 0;
      $.PlatformId = 4608;
   }
   /// constructor RegisterWidget.Create(PlatformId: TQTXPlatformId; Category: TQTXWidgetCategory)
   ,Create$7:function(Self, PlatformId$1, Category$1) {
      TObject.Create(Self);
      Self.PlatformId = PlatformId$1;
      Self.Category = Category$1;
      return Self
   }
   ,Destroy:TObject.Destroy
};
/// RegisterInfo = class (TCustomAttribute)
var RegisterInfo = {
   $ClassName:"RegisterInfo",$Parent:TCustomAttribute
   ,$Init:function ($) {
      TCustomAttribute.$Init($);
      $.Glyph = $.Description = "";
   }
   /// constructor RegisterInfo.Create(Info: String; GlyphName: String)
   ,Create$9:function(Self, Info$2, GlyphName) {
      TObject.Create(Self);
      Self.Description = Info$2;
      Self.Glyph = GlyphName;
      return Self
   }
   /// constructor RegisterInfo.Create(Info: String)
   ,Create$8:function(Self, Info$2) {
      TObject.Create(Self);
      Self.Description = Trim$_String_(Info$2);
      return Self
   }
   ,Destroy:TObject.Destroy
};
/// RegisterComponent = class (TCustomAttribute)
var RegisterComponent = {
   $ClassName:"RegisterComponent",$Parent:TCustomAttribute
   ,$Init:function ($) {
      TCustomAttribute.$Init($);
   }
   ,Destroy:TObject.Destroy
};
/// PropertyDialog = class (TCustomAttribute)
var PropertyDialog = {
   $ClassName:"PropertyDialog",$Parent:TCustomAttribute
   ,$Init:function ($) {
      TCustomAttribute.$Init($);
      $.Encoding = $.PropertyName = "";
      $.DialogType = 0;
   }
   /// constructor PropertyDialog.Create(PropName: String; Kind: TQTXWidgetDialogType)
   ,Create$10:function(Self, PropName, Kind) {
      TObject.Create(Self);
      Self.PropertyName = Trim$_String_(PropName);
      Self.DialogType = Kind;
      return Self
   }
   ,Destroy:TObject.Destroy
};
function NodeJs() {
   var Result = false;
   Result = (typeof process !== 'undefined') &&
          (process !== null) &&
          (typeof process.release !== 'undefined') &&
          (process.release !== null) &&
          (typeof process.release.name === 'string') &&
          (process.release.name.search(/node|io\.js/) !== -1);
   return Result
}
/// JTimeStamp = record
function Copy$JTimeStamp(s,d) {
   d.Date$2=s.Date$2;
   d.Time$1=s.Time$1;
   return d;
}
function Clone$JTimeStamp($) {
   return {
      Date$2:$.Date$2,
      Time$1:$.Time$1
   }
}
/// JStorageObjectType enumeration
var JStorageObjectType = [ "otUnknown", "otFile", "otFolder", "otBlockDevice", "otCharacterDevice", "otSymbolicLink", "otFIFO", "otSocket" ];
/// JFileItemType enumeration
var JFileItemType = [ "wtFile", "wtFolder", "wtSymbol" ];
/// JFileItemList = class (JObject)
function JFileItemList() {
   this.dlItems = [];
}
$Extend(Object,JFileItemList,
   {
      "dlPath" : ""
   });

/// JFileItem = class (JObject)
function JFileItem() {
}
$Extend(Object,JFileItem,
   {
      "diCreated" : undefined,
      "diFileMode" : "",
      "diFileName" : "",
      "diFileSize" : 0,
      "diFileType" : 0,
      "diModified" : undefined
   });

/// JDateTimeResolvedOptions = class (TObject)
var JDateTimeResolvedOptions = {
   $ClassName:"JDateTimeResolvedOptions",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.calendar = $.locale = $.numberingSystem = $.timeZone = "";
   }
   ,Destroy:TObject.Destroy
};
/// JDateTimeFormatOptions = class (TObject)
var JDateTimeFormatOptions = {
   $ClassName:"JDateTimeFormatOptions",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.day = $.hour = $.minute = $.month = $.second = $.timeZone$1 = $.weekday = $.year = "";
      $.fractionalSecondDigits = 0;
      $.hour12 = false;
   }
   ,Destroy:TObject.Destroy
};
/// EException = class (Exception)
var EException = {
   $ClassName:"EException",$Parent:Exception
   ,$Init:function ($) {
      Exception.$Init($);
   }
   /// constructor EException.CreateFmt(Message: String; const Values: array of const)
   ,CreateFmt:function(Self, Message$1, Values$1) {
      Exception.Create(Self,Format(Message$1,Values$1.slice(0)));
      return Self
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt$:function($){return $.ClassType.CreateFmt.apply($.ClassType, arguments)}
};
/// EQTXException = class (EException)
var EQTXException = {
   $ClassName:"EQTXException",$Parent:EException
   ,$Init:function ($) {
      EException.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// EConvertError = class (EQTXException)
var EConvertError = {
   $ClassName:"EConvertError",$Parent:EQTXException
   ,$Init:function ($) {
      EQTXException.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// EConvertHexStringInvalid = class (EConvertError)
var EConvertHexStringInvalid = {
   $ClassName:"EConvertHexStringInvalid",$Parent:EConvertError
   ,$Init:function ($) {
      EConvertError.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// EConvertHexInvalidContent = class (EConvertError)
var EConvertHexInvalidContent = {
   $ClassName:"EConvertHexInvalidContent",$Parent:EConvertError
   ,$Init:function ($) {
      EConvertError.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// EConvertBinaryStringInvalid = class (EConvertError)
var EConvertBinaryStringInvalid = {
   $ClassName:"EConvertBinaryStringInvalid",$Parent:EConvertError
   ,$Init:function ($) {
      EConvertError.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// EConvertBinaryInvalidChar = class (EConvertError)
var EConvertBinaryInvalidChar = {
   $ClassName:"EConvertBinaryInvalidChar",$Parent:EConvertError
   ,$Init:function ($) {
      EConvertError.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// DefaultName = class (TCustomAttribute)
var DefaultName = {
   $ClassName:"DefaultName",$Parent:TCustomAttribute
   ,$Init:function ($) {
      TCustomAttribute.$Init($);
      $.Name = "";
   }
   /// constructor DefaultName.Create(DefName: String)
   ,Create$41:function(Self, DefName) {
      TObject.Create(Self);
      Self.Name = DefName;
      return Self
   }
   ,Destroy:TObject.Destroy
};
/// ApplyLate = class (TCustomAttribute)
var ApplyLate = {
   $ClassName:"ApplyLate",$Parent:TCustomAttribute
   ,$Init:function ($) {
      TCustomAttribute.$Init($);
   }
   ,Destroy:TObject.Destroy
};
/// TTypeLookup = record
function Copy$TTypeLookup(s,d) {
   d.Boolean=s.Boolean;
   d.Function$1=s.Function$1;
   d.Number$1=s.Number$1;
   d.Object$2=s.Object$2;
   d.String$1=s.String$1;
   d.Undefined=s.Undefined;
   return d;
}
function Clone$TTypeLookup($) {
   return {
      Boolean:$.Boolean,
      Function$1:$.Function$1,
      Number$1:$.Number$1,
      Object$2:$.Object$2,
      String$1:$.String$1,
      Undefined:$.Undefined
   }
}
function VSet(o$1, key$2, val) {
   (o$1)[key$2] = val;
}
function VGet(o$1, key$2) {
   var Result = undefined;
   Result = (o$1)[key$2];
   return Result
}
function UC(code$2) {
   var Result = "";
   Result = String.fromCharCode(code$2);
   return Result
}
function Truthy(v$4) {
   var Result = false;
   Result = !!(v$4);
   return Result
}
function ToFixed(v$4, digits) {
   var Result = "";
   Result = (v$4).toFixed(digits);
   return Result
}
function NumStr(v$4) {
   var Result = "";
   Result = String(v$4);
   return Result
}
function NewDict() {
   var Result = undefined;
   Result = Object.create(null);
   return Result
}
function NewAudioContext() {
   var Result = null;
   Result = new (window.AudioContext || window.webkitAudioContext)();
   return Result
}
function JsTypeOf(v$4) {
   var Result = "";
   Result = typeof (v$4);
   return Result
}
function JsReplace(s$12, pattern, repl) {
   var Result = "";
   Result = (s$12).replace(pattern, function () { return repl; });
   return Result
}
function JsIncludes(s$12, pattern) {
   var Result = false;
   Result = (s$12).includes(pattern);
   return Result
}
function IsUndef(v$4) {
   var Result = false;
   Result = (v$4) === undefined || (v$4) === null;
   return Result
}
function HexColor(h$3) {
   var Result = "";
   Result = (h$3).toString(16).padStart(6, '0');
   return Result
}
function ForceReflow(e$1) {
   void (e$1).offsetWidth;
}
function El(id$4) {
   var Result = null;
   Result = document.getElementById(id$4);
   return Result
}
function WrapAngle(a$110) {
   var Result = 0;
   a$110 = FMod(a$110 + 3.14159265358979,6.28318530717959);
   if (a$110 < 0) {
      a$110 += 6.28318530717959;
   }
   Result = a$110 - 3.14159265358979;
   return Result
}
function VNoise(x$18, y$13) {
   var Result = 0;
   var xi = 0,
      yi = 0,
      xf = 0,
      yf = 0,
      u = 0,
      v = 0,
      a$68 = 0,
      b$2 = 0,
      c = 0,
      d = 0;
   xi = Floor(x$18);
   yi = Floor(y$13);
   xf = x$18 - xi;
   yf = y$13 - yi;
   u = xf*xf * (3 - 2 * xf);
   v = yf*yf * (3 - 2 * yf);
   a$68 = Hash2(xi,yi);
   b$2 = Hash2(xi + 1,yi);
   c = Hash2(xi,yi + 1);
   d = Hash2(xi + 1,yi + 1);
   Result = (a$68 + (b$2 - a$68) * u + (c - a$68) * v + (a$68 - b$2 - c + d) * u * v) * 2 - 1;
   return Result
}
/// TSpring = class (TObject)
var TSpring = {
   $ClassName:"TSpring",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.v$1 = $.x$3 = 0;
   }
   /// constructor TSpring.Create(ax: Float = 0; av: Float = 0)
   ,Create$71:function(Self, ax$3, av) {
      Self.x$3 = ax$3;
      Self.v$1 = av;
      return Self
   }
   ,Destroy:TObject.Destroy
};
/// TRNG = class (TObject)
var TRNG = {
   $ClassName:"TRNG",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.s = 0;
   }
   /// constructor TRNG.Create(seed: Integer)
   ,Create$72:function(Self, seed$1) {
      Self.s = seed$1;
      if (Self.s == 0) {
         Self.s = 1;
      }
      return Self
   }
   /// function TRNG.Next() : Float
   ,Next:function(Self) {
      var Result = 0;
      Self.s += 1831565813;
      var t = (Self.s);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    Result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      return Result
   }
   /// function TRNG.Range(a: Float; b: Float) : Float
   ,Range:function(Self, a$110, b$8) {
      var Result = 0;
      Result = a$110 + (b$8 - a$110) * TRNG.Next(Self);
      return Result
   }
   ,Destroy:TObject.Destroy
};
/// TControls = class (TObject)
var TControls = {
   $ClassName:"TControls",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.brake = $.steer = $.tuck = 0;
      $.grab = $.jump = false;
   }
   ,Destroy:TObject.Destroy
};
function SpringStep(st$3, target$3, k$4, c$7, dt) {
   st$3.v$1 += (k$4 * (target$3 - st$3.x$3) - c$7 * st$3.v$1) * dt;
   st$3.x$3 += st$3.v$1 * dt;
}
function Smoothstep(a$110, b$8, x$18) {
   var Result = 0;
   var t$1 = 0;
   t$1 = ClampF((x$18 - a$110) / (b$8 - a$110),0,1);
   Result = t$1*t$1 * (3 - 2 * t$1);
   return Result
}
function SignF(x$18) {
   var Result = 0;
   if (x$18 < 0) {
      Result = -1;
   } else {
      Result = 1;
   }
   return Result
}
function Pad2(n$7) {
   var Result = "";
   Result = IntToStr$_Integer_(n$7);
   if (n$7 < 10) {
      Result = "0" + Result;
   }
   return Result
}
function Lerp(a$110, b$8, t$11) {
   var Result = 0;
   Result = a$110 + (b$8 - a$110) * t$11;
   return Result
}
function JsRound(x$18) {
   var Result = 0;
   Result = Floor(x$18 + 0.5);
   return Result
}
function Hash2(x$18, y$13) {
   var Result = 0;
   var s$1 = 0;
   s$1 = Sin(x$18 * 127.1 + y$13 * 311.7) * 43758.5453;
   Result = s$1 - Floor(s$1);
   return Result
}
function Hash1(n$7) {
   var Result = 0;
   var s$2 = 0;
   s$2 = Sin(n$7 * 127.1 + 311.7) * 43758.5453;
   Result = s$2 - Floor(s$2);
   return Result
}
function FMod(a$110, b$8) {
   var Result = 0;
   Result = (a$110) % (b$8);
   return Result
}
function Fbm(x$18, y$13, oct) {
   var Result = 0;
   var s$3 = 0,
      a$69 = 0,
      f = 0,
      i = 0;
   s$3 = 0;
   a$69 = 0.5;
   f = 1;
   var $temp45;
   for(i=0,$temp45=oct;i<$temp45;i++) {
      s$3 += a$69 * VNoise(x$18 * f,y$13 * f);
      f *= 2.03;
      a$69 *= 0.5;
   }
   Result = s$3;
   return Result
}
function Damp(a$110, b$8, lam, dt) {
   var Result = 0;
   Result = Lerp(a$110,b$8,1 - Exp((-lam) * dt));
   return Result
}
function ClampF(x$18, a$110, b$8) {
   var Result = 0;
   if (x$18 < a$110) {
      Result = a$110;
   } else if (x$18 > b$8) {
      Result = b$8;
   } else {
      Result = x$18;
   }
   return Result
}
/// TTrack = class (TObject)
var TTrack = {
   $ClassName:"TTrack",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.cx$1 = [];
      $.cx0$1 = $.forest = $.forestFrom = $.g0$1 = $.kickCell = $.kickP = $.len = $.w0 = 0;
      $.g$4 = [];
      $.hasCx0 = false;
      $.id$1 = $.name$3 = "";
      $.w$1 = [];
   }
   ,Destroy:TObject.Destroy
};
/// TSine = record
function Copy$TSine(s,d) {
   d.A$1=s.A$1;
   d.k$3=s.k$3;
   d.ph=s.ph;
   return d;
}
function Clone$TSine($) {
   return {
      A$1:$.A$1,
      k$3:$.k$3,
      ph:$.ph
   }
}
function TrackById(id$4) {
   var Result = null;
   var a$90 = 0,
      t$11 = null;
   Result = null;
   var $temp46;
   for(a$90=0,$temp46=TRACKS.length;a$90<$temp46;a$90++) {
      t$11 = TRACKS[a$90];
      if (t$11.id$1 == id$4) {
         return t$11;
      }
   }
   return Result
}
/// TPreset = class (TObject)
var TPreset = {
   $ClassName:"TPreset",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.ahead$1 = $.particles$1 = $.shadow$1 = $.trees = 0;
      $.bloom = $.blur$2 = $.smaa = $.snowfall$1 = false;
      $.name$4 = "";
      $.pr = 0;
   }
   ,Destroy:TObject.Destroy
};
function StoreKey(k$4) {
   var Result = "";
   Result = "carveline." + k$4;
   if (TRACK_ID != "classic") {
      Result += "." + TRACK_ID;
   }
   return Result
}
function PresetByName(n$7) {
   var Result = null;
   if (n$7 == "low") {
      Result = PRESET_LOW;
   } else if (n$7 == "medium") {
      Result = PRESET_MEDIUM;
   } else if (n$7 == "high") {
      Result = PRESET_HIGH;
   } else {
      Result = null;
   }
   return Result
}
/// CONFIG = class (TObject)
var CONFIG = {
   $ClassName:"CONFIG",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   ,Destroy:TObject.Destroy
};
function S3(A$2, k$4, ph$2) {
   var Result = {A$1:0,k$3:0,ph:0};
   Result.A$1 = A$2;
   Result.k$3 = k$4;
   Result.ph = ph$2;
   return Result
}
function ReadTrackId() {
   var id$2 = "",
      raw,
      o$1;
   id$2 = "classic";
   try {
      raw = localStorage.getItem("carveline.settings");
      if (Truthy(raw)) {
         o$1 = JSON.parse(String(raw));
         if (Truthy(o$1) && Truthy(o$1.track)) {
            if (!!TrackById(String(o$1.track))) {
               id$2 = String(o$1.track);
            }
         }
      }
   } catch ($e) {
      id$2 = "classic";
   }
   TRACK_ID = id$2;
   TRACK = TrackById(id$2);
}
function MkPreset(n$7, pr$1, shadow$2, bloom$1, smaa$1, snowfall$2, trees$1, ahead$2, particles$2, blur$3) {
   var Result = null;
   Result = TObject.Create($New(TPreset));
   Result.name$4 = n$7;
   Result.pr = pr$1;
   Result.shadow$1 = shadow$2;
   Result.bloom = bloom$1;
   Result.smaa = smaa$1;
   Result.snowfall$1 = snowfall$2;
   Result.trees = trees$1;
   Result.ahead$1 = ahead$2;
   Result.particles$1 = particles$2;
   Result.blur$2 = blur$3;
   return Result
}
function InitTracks() {
   var t$2 = null;
   t$2 = TObject.Create($New(TTrack));
   t$2.id$1 = "classic";
   t$2.name$3 = "Classic";
   t$2.len = 3200;
   t$2.cx$1 = [S3(55,0.0023,0.4), S3(22,0.0061,1.3), S3(9,0.0197,0.7)];
   t$2.hasCx0 = true;
   t$2.cx0$1 = -37.7;
   t$2.w0 = 21;
   t$2.w$1 = [S3(5,0.0041,1), S3(3,0.0113,2.1)];
   t$2.g0$1 = 0.3;
   t$2.g$4 = [S3(0.12,0.0045,0.3), S3(0.07,0.013,2)];
   t$2.kickCell = 210;
   t$2.kickP = 0.85;
   t$2.forest = 0.2;
   t$2.forestFrom = 40;
   TRACKS.push(t$2);
   t$2 = TObject.Create($New(TTrack));
   t$2.id$1 = "wald";
   t$2.name$3 = "Waldpfad";
   t$2.len = 2600;
   t$2.cx$1 = [S3(42,0.0033,1.1), S3(26,0.0088,0.2), S3(11,0.0231,2.4)];
   t$2.w0 = 14;
   t$2.w$1 = [S3(3,0.0052,0.3), S3(2,0.017,1.7)];
   t$2.g0$1 = 0.26;
   t$2.g$4 = [S3(0.09,0.0051,1.2), S3(0.06,0.016,0.5)];
   t$2.kickCell = 260;
   t$2.kickP = 0.6;
   t$2.forest = 0.5;
   t$2.forestFrom = 12;
   TRACKS.push(t$2);
   t$2 = TObject.Create($New(TTrack));
   t$2.id$1 = "nordwand";
   t$2.name$3 = "Nordwand";
   t$2.len = 2800;
   t$2.cx$1 = [S3(70,0.0017,2.2), S3(18,0.0057,0.9), S3(6,0.015,1.9)];
   t$2.w0 = 27;
   t$2.w$1 = [S3(5,0.0035,2), S3(3,0.01,0.4)];
   t$2.g0$1 = 0.37;
   t$2.g$4 = [S3(0.13,0.0039,1.4), S3(0.08,0.011,0.2)];
   t$2.kickCell = 150;
   t$2.kickP = 0.92;
   t$2.forest = 0.12;
   t$2.forestFrom = 60;
   TRACKS.push(t$2);
}
function Uniform(v$4) {
   var Result = undefined;
   Result = {};
   Result.value = v$4;
   return Result
}
/// TRoller = class (TObject)
var TRoller = {
   $ClassName:"TRoller",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.H$2 = $.s$6 = $.z$5 = 0;
   }
   ,Destroy:TObject.Destroy
};
/// TKicker = class (TObject)
var TKicker = {
   $ClassName:"TKicker",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.d$1 = $.H$3 = $.L$1 = $.z$6 = 0;
   }
   ,Destroy:TObject.Destroy
};
/// TCourse = class (TObject)
var TCourse = {
   $ClassName:"TCourse",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.cx0 = $.Fzf = $.g0 = $.gEnd = $.runT = $.zf = 0;
      $.FK = $.FR = $.Trk = null;
   }
   /// constructor TCourse.Create(aT: TTrack)
   ,Create$142:function(Self, aT) {
      var s$12 = 0,
         a$144 = 0,
         t$11 = {A$1:0,k$3:0,ph:0};
      Self.Trk = aT;
      Self.zf = Self.Trk.len;
      if (Self.Trk.hasCx0) {
         Self.cx0 = Self.Trk.cx0$1;
      } else {
         var a$145 = [];
         s$12 = 0;
         a$145 = Self.Trk.cx$1;
         var $temp47;
         for(a$144=0,$temp47=a$145.length;a$144<$temp47;a$144++) {
            Copy$TSine(a$145[a$144],t$11);
            s$12 += t$11.A$1 * Sin(t$11.ph);
         }
         Self.cx0 = -s$12;
      }
      Self.runT = 90;
      Self.gEnd = 0.04;
      Self.FR = TObject.Create($New(TRoller));
      Self.FK = TObject.Create($New(TKicker));
      Self.Fzf = TCourse.Fraw(Self,Self.zf);
      Self.g0 = TCourse.gradeRaw(Self,Self.zf);
      return Self
   }
   /// constructor TCourse.Create()
   ,Create$141:function(Self) {
      TCourse.Create$142(Self,TRACK);
      return Self
   }
   /// function TCourse.cx(z: Float) : Float
   ,cx:function(Self, z$13) {
      var Result = 0;
      var s$12 = 0,
         a$146 = 0,
         t$11 = {A$1:0,k$3:0,ph:0},
         a$147 = [];
      s$12 = Self.cx0;
      a$147 = Self.Trk.cx$1;
      var $temp48;
      for(a$146=0,$temp48=a$147.length;a$146<$temp48;a$146++) {
         Copy$TSine(a$147[a$146],t$11);
         s$12 += t$11.A$1 * Sin(z$13 * t$11.k$3 + t$11.ph);
      }
      Result = s$12;
      return Result
   }
   /// function TCourse.cxp(z: Float) : Float
   ,cxp:function(Self, z$13) {
      var Result = 0;
      var s$12 = 0,
         a$148 = 0,
         t$11 = {A$1:0,k$3:0,ph:0},
         a$149 = [];
      s$12 = 0;
      a$149 = Self.Trk.cx$1;
      var $temp49;
      for(a$148=0,$temp49=a$149.length;a$148<$temp49;a$148++) {
         Copy$TSine(a$149[a$148],t$11);
         s$12 += t$11.A$1 * t$11.k$3 * Cos(z$13 * t$11.k$3 + t$11.ph);
      }
      Result = s$12;
      return Result
   }
   /// function TCourse.cxpp(z: Float) : Float
   ,cxpp:function(Self, z$13) {
      var Result = 0;
      var s$12 = 0,
         a$150 = 0,
         t$11 = {A$1:0,k$3:0,ph:0},
         a$151 = [];
      s$12 = 0;
      a$151 = Self.Trk.cx$1;
      var $temp50;
      for(a$150=0,$temp50=a$151.length;a$150<$temp50;a$150++) {
         Copy$TSine(a$151[a$150],t$11);
         s$12 -= t$11.A$1 * t$11.k$3 * t$11.k$3 * Sin(z$13 * t$11.k$3 + t$11.ph);
      }
      Result = s$12;
      return Result
   }
   /// function TCourse.features(z: Float; d: Float) : Float
   ,features:function(Self, z$13, d$8) {
      var Result = 0;
      var y$13 = 0,
         dz = 0,
         t$11 = 0,
         lat$1 = 0,
         prof = 0,
         rc = 0,
         kc = 0,
         c$7 = 0;
      y$13 = 0;
      rc = Floor(z$13 / 90);
      var $temp51;
      for(c$7=rc - 1,$temp51=rc + 1;c$7<=$temp51;c$7++) {
         if (!(TCourse.roller(Self,c$7,Self.FR))) {
            continue;
         }
         dz = z$13 - Self.FR.z$5;
         if (Abs$_Float_(dz) < Self.FR.s$6 * 4) {
            y$13 += Self.FR.H$2 * Exp((-dz) * dz / (2 * Self.FR.s$6 * Self.FR.s$6));
         }
      }
      kc = Floor(z$13 / Self.Trk.kickCell);
      var $temp52;
      for(c$7=kc - 1,$temp52=kc;c$7<=$temp52;c$7++) {
         if (!(TCourse.kicker(Self,c$7,Self.FK))) {
            continue;
         }
         t$11 = (z$13 - Self.FK.z$6) / Self.FK.L$1;
         if (t$11 < 0 || t$11 > 1.3) {
            continue;
         }
         lat$1 = 1 - Smoothstep(3,4.2,Abs$_Float_(d$8 - Self.FK.d$1));
         if (lat$1 <= 0) {
            continue;
         }
         if (t$11 <= 1) {
            prof = Self.FK.H$3 * t$11 * t$11;
         } else {
            prof = Self.FK.H$3 * Power(1 - (t$11 - 1) / 0.3,2);
         }
         y$13 += prof * lat$1;
      }
      Result = y$13;
      return Result
   }
   /// function TCourse.Fraw(z: Float) : Float
   ,Fraw:function(Self, z$13) {
      var Result = 0;
      var s$12 = 0,
         a$152 = 0,
         t$11 = {A$1:0,k$3:0,ph:0},
         a$153 = [];
      s$12 = Self.Trk.g0$1 * z$13;
      a$153 = Self.Trk.g$4;
      var $temp53;
      for(a$152=0,$temp53=a$153.length;a$152<$temp53;a$152++) {
         Copy$TSine(a$153[a$152],t$11);
         s$12 += t$11.A$1 / t$11.k$3 * Cos(z$13 * t$11.k$3 + t$11.ph);
      }
      Result = -s$12;
      return Result
   }
   /// function TCourse.grade(z: Float) : Float
   ,grade:function(Self, z$13) {
      var Result = 0;
      var t$11 = 0;
      if (z$13 <= Self.zf) {
         return TCourse.gradeRaw(Self,z$13);
      }
      t$11 = z$13 - Self.zf;
      if (t$11 >= Self.runT) {
         return Self.gEnd;
      }
      Result = Self.g0 + (Self.gEnd - Self.g0) * t$11 / Self.runT;
      return Result
   }
   /// function TCourse.gradeRaw(z: Float) : Float
   ,gradeRaw:function(Self, z$13) {
      var Result = 0;
      var s$12 = 0,
         a$154 = 0,
         t$11 = {A$1:0,k$3:0,ph:0},
         a$155 = [];
      s$12 = Self.Trk.g0$1;
      a$155 = Self.Trk.g$4;
      var $temp54;
      for(a$154=0,$temp54=a$155.length;a$154<$temp54;a$154++) {
         Copy$TSine(a$155[a$154],t$11);
         s$12 -= t$11.A$1 * Sin(z$13 * t$11.k$3 + t$11.ph);
      }
      Result = s$12;
      return Result
   }
   /// function TCourse.groom(x: Float; z: Float) : Float
   ,groom$1:function(Self, x$18, z$13) {
      var Result = 0;
      var d$8 = 0;
      d$8 = x$18 - TCourse.cx(Self,z$13);
      Result = 1 - Smoothstep(TCourse.width$4(Self,z$13) - 1.5,TCourse.width$4(Self,z$13) + 7,Abs$_Float_(d$8));
      return Result
   }
   /// function TCourse.height(x: Float; z: Float) : Float
   ,height$4:function(Self, x$18, z$13) {
      var Result = 0;
      var c$7 = 0,
         d$8 = 0,
         W$1 = 0,
         ad = 0,
         y$13 = 0,
         edge$4 = 0,
         g$8 = 0,
         o$1 = 0,
         far$2 = 0;
      c$7 = TCourse.cx(Self,z$13);
      d$8 = x$18 - c$7;
      W$1 = TCourse.width$4(Self,z$13);
      ad = Abs$_Float_(d$8);
      y$13 = TCourse.y0(Self,z$13);
      y$13 += -0.7 * TCourse.cxp(Self,z$13) * TCourse.grade(Self,z$13) * d$8;
      edge$4 = Smoothstep(W$1 - 1.5,W$1 + 7,ad);
      g$8 = 1 - edge$4;
      y$13 += 0.0015 * d$8 * d$8 * g$8;
      o$1 = Max$_Float_Float_(0,ad - W$1);
      far$2 = Smoothstep(W$1 + 4,W$1 + 60,ad);
      y$13 += Smoothstep(0,7,o$1) * 0.9;
      if (d$8 < 0) {
         y$13 += o$1 * Smoothstep(0,40,o$1) * 0.13;
      } else {
         y$13 += (-(38 * (1 - Exp((-o$1) / 140)) + 0.02 * o$1)) * Smoothstep(0,25,o$1);
      }
      y$13 += edge$4 * VNoise(x$18 * 0.11,z$13 * 0.11) * 0.35;
      y$13 += far$2 * (Fbm(x$18 * 0.012,z$13 * 0.012,4) + 0.3) * 16;
      y$13 += Smoothstep(W$1 + 150,W$1 + 400,ad) * Fbm(x$18 * 0.005 + 7,z$13 * 0.005,3) * 40;
      y$13 += g$8 * VNoise(x$18 * 0.25,z$13 * 0.25) * 0.05;
      if (g$8 > 0.001) {
         y$13 += TCourse.features(Self,z$13,d$8) * g$8;
      }
      Result = y$13;
      return Result
   }
   /// function TCourse.kicker(c: Integer; k: TKicker) : Boolean
   ,kicker:function(Self, c$7, k$4) {
      var Result = false;
      var KC = 0,
         z$13 = 0;
      KC = Self.Trk.kickCell;
      if (c$7 < 1 || c$7 * KC > Self.zf - 220 || Hash1(c$7 * 11.3 + 1) > Self.Trk.kickP) {
         return false;
      }
      z$13 = c$7 * KC + KC * 0.28 + Hash1(c$7 * 4.1) * KC * 0.43;
      k$4.z$6 = z$13;
      k$4.d$1 = (Hash1(c$7 * 6.7) - 0.5) * TCourse.width$4(Self,z$13) * 0.8;
      k$4.H$3 = 0.95 + Hash1(c$7 * 8.3) * 0.65;
      k$4.L$1 = 10;
      Result = true;
      return Result
   }
   /// function TCourse.netSide(z: Float) : Integer
   ,netSide:function(Self, z$13) {
      var Result = 0;
      var k$4 = 0;
      if (z$13 < 20 || z$13 > Self.zf + 60) {
         return 0;
      }
      k$4 = TCourse.cxpp(Self,z$13);
      if (Abs$_Float_(k$4) > 0.0021) {
         Result = -Round(SignF(k$4));
      } else {
         Result = 0;
      }
      return Result
   }
   /// function TCourse.normal(x: Float; z: Float; outV: JVector3) : JVector3
   ,normal$1:function(Self, x$18, z$13, outV) {
      var Result = null;
      var hx = 0,
         hz = 0;
      hx = TCourse.height$4(Self,x$18 + 0.25,z$13) - TCourse.height$4(Self,x$18 - 0.25,z$13);
      hz = TCourse.height$4(Self,x$18,z$13 + 0.25) - TCourse.height$4(Self,x$18,z$13 - 0.25);
      Result = outV.set((-hx) / 0.5,1,(-hz) / 0.5).normalize();
      return Result
   }
   /// function TCourse.roller(c: Integer; r: TRoller) : Boolean
   ,roller:function(Self, c$7, r$7) {
      var Result = false;
      if (c$7 < 2 || c$7 * 90 > Self.zf - 150 || Hash1(c$7 * 3.1 + 7) > 0.5) {
         return false;
      }
      r$7.z$5 = c$7 * 90 + 45 + (Hash1(c$7 * 5.3) - 0.5) * 30;
      r$7.H$2 = 1 + Hash1(c$7 * 9.7) * 1.6;
      r$7.s$6 = 6 + Hash1(c$7 * 2.9) * 4;
      Result = true;
      return Result
   }
   /// function TCourse.safeZ(z: Float; d: Float) : Float
   ,safeZ:function(Self, z$13, d$8) {
      var Result = 0;
      var k$4 = 0,
         x$18 = 0;
      k$4 = 0;
      while (k$4 < 30 && z$13 < Self.zf) {
         x$18 = TCourse.cx(Self,z$13) + d$8;
         if ((TCourse.height$4(Self,x$18,z$13 + 1.5) - TCourse.height$4(Self,x$18,z$13 - 1.5)) / 3 < -0.06 && TCourse.features(Self,z$13,d$8) < 0.05) {
            return z$13;
         }
         z$13 += 3;
         ++k$4;
      }
      Result = z$13;
      return Result
   }
   /// function TCourse.width(z: Float) : Float
   ,width$4:function(Self, z$13) {
      var Result = 0;
      var s$12 = 0,
         a$156 = 0,
         t$11 = {A$1:0,k$3:0,ph:0},
         a$157 = [];
      s$12 = Self.Trk.w0;
      a$157 = Self.Trk.w$1;
      var $temp55;
      for(a$156=0,$temp55=a$157.length;a$156<$temp55;a$156++) {
         Copy$TSine(a$157[a$156],t$11);
         s$12 += t$11.A$1 * Sin(z$13 * t$11.k$3 + t$11.ph);
      }
      Result = s$12;
      return Result
   }
   /// function TCourse.y0(z: Float) : Float
   ,y0:function(Self, z$13) {
      var Result = 0;
      var t$11 = 0,
         TT = 0,
         g1 = 0;
      if (z$13 <= Self.zf) {
         return TCourse.Fraw(Self,z$13);
      }
      t$11 = z$13 - Self.zf;
      TT = Self.runT;
      g1 = Self.gEnd;
      if (t$11 < TT) {
         return Self.Fzf - (Self.g0 * t$11 + (g1 - Self.g0) * t$11 * t$11 / (2 * TT));
      }
      Result = Self.Fzf - (Self.g0 * TT + (g1 - Self.g0) * TT / 2) - g1 * (t$11 - TT);
      return Result
   }
   ,Destroy:TObject.Destroy
};
/// TShared = class (TObject)
var TShared = {
   $ClassName:"TShared",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.sunView = $.time = undefined;
   }
   ,Destroy:TObject.Destroy
};
function MakeStripeTex() {
   var Result = null;
   Result = CanvasTex(8,64,function (g$8, w$5, h$3) {
      for(let i$6=0;i$6<=7;i$6++) {
         if (i$6 % 2 == 1) {
            g$8.fillStyle = "#202020";
         } else {
            g$8.fillStyle = "#ffffff";
         }
         g$8.fillRect(0,i$6 * h$3 / 8,w$5,h$3 / 8);
      }
   },true);
   return Result
}
function MakeSnowMaterial() {
   var Result = null;
   Result = new THREE.MeshStandardMaterial({
      "vertexColors" : true
      ,"roughness" : 0.66
      ,"normalScale" : new THREE.Vector2(0.85,0.85)
      ,"normalMap" : MakeCorduroyNormal()
      ,"metalness" : 0
      ,"color" : 16777215
   });
   Result.onBeforeCompile = function (sh$1) {
      var vs = "",
         fs = "";
      sh$1.uniforms.uSunView = SHARED.sunView;
      vs = String(sh$1.vertexShader);
      vs = JsReplace(vs,"#include <common>","#include <common>\nattribute float groom;\nvarying float vGroom;\nvarying vec3 vSnowW;");
      vs = JsReplace(vs,"#include <worldpos_vertex>","#include <worldpos_vertex>\nvGroom = groom;\nvSnowW = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh$1.vertexShader = vs;
      fs = String(sh$1.fragmentShader);
      fs = JsReplace(fs,"#include <common>","#include <common>\nuniform vec3 uSunView;\nvarying float vGroom;\nvarying vec3 vSnowW;");
      fs = JsReplace(fs,"mapN.xy *= normalScale;","float rib = smoothstep(0.06, 0.4, mapN.x) * vGroom * (1.0 - smoothstep(15.0, 90.0, length(vViewPosition)));\r\ndiffuseColor.rgb *= mix(vec3(1.0), vec3(0.72, 0.82, 0.97), rib);\r\nmapN.xy *= normalScale * (0.18 + 0.82 * vGroom);");
      fs = JsReplace(fs,"#include <emissivemap_fragment>","#include <emissivemap_fragment>\r\n\/\/ Subsurface-Anmutung: blaeuliche Streuung, im Tiefschnee etwas staerker\r\ntotalEmissiveRadiance += vec3(0.010, 0.024, 0.050) * (1.0 + 0.6 * (1.0 - vGroom));");
      fs = JsReplace(fs,"#include <opaque_fragment>","{\r\n  \/\/ Glitzer: zufaellige Eiskristall-Facetten pro ~5 cm Zelle, Blinn-Spekular gegen die Sonne\r\n  vec3 cell = floor(vSnowW * 19.0);\r\n  float rnd = fract(sin(dot(cell, vec3(12.9898, 78.233, 37.719))) * 43758.5453);\r\n  vec3 r3 = vec3(fract(rnd * 13.17), fract(rnd * 7.73), fract(rnd * 3.31)) - 0.5;\r\n  vec3 facet = normalize(normal * 0.9 + (viewMatrix * vec4(r3, 0.0)).xyz);\r\n  vec3 V = normalize(vViewPosition);\r\n  vec3 Hh = normalize(uSunView + V);\r\n  float s = pow(max(dot(facet, Hh), 0.0), 320.0) * step(0.55, rnd);\r\n  float fade = 1.0 - smoothstep(8.0, 70.0, length(vViewPosition));\r\n  float lit = clamp(length(reflectedLight.directDiffuse) * 1.2, 0.0, 1.0);\r\n  outgoingLight += vec3(1.0, 0.97, 0.92) * s * 9.0 * fade * lit;\r\n}\r\n#include <opaque_fragment>\r\ngl_FragColor.a = 0.5; \/\/ Markierung Gelaende fuer den Umriss-Pass (Alpha wird sonst nicht genutzt)");
      sh$1.fragmentShader = fs;
   };
   return Result
}
function MakeNetTex() {
   var Result = null;
   Result = CanvasTex(64,64,function (g$8, w$5, h$3) {
      g$8.clearRect(0,0,w$5,h$3);
      g$8.strokeStyle = "#ffffff";
      g$8.lineWidth = 5;
      g$8.beginPath();
      g$8.moveTo(0,0);
      g$8.lineTo(w$5,h$3);
      g$8.moveTo(w$5,0);
      g$8.lineTo(0,h$3);
      g$8.stroke();
      g$8.fillRect(0,0,w$5,6);
   },true);
   return Result
}
function MakeCorduroyNormal() {
   var Result = null;
   Result = CanvasTex(512,512,DrawCorduroy,false);
   return Result
}
function MakeBannerTex(text, bg) {
   var Result = null;
   Result = CanvasTex(1024,192,function (g$8, w$5, h$3) {
      g$8.fillStyle = bg;
      g$8.fillRect(0,0,w$5,h$3);
      g$8.fillStyle = "#ffffff";
      g$8.fillRect(0,0,w$5,10);
      g$8.fillRect(0,h$3 - 10,w$5,10);
      g$8.font = "italic 900 120px Arial";
      g$8.textAlign = "center";
      g$8.textBaseline = "middle";
      g$8.fillText(text,w$5 / 2,h$3 / 2 + 6);
   },true);
   return Result
}
function MakeAOMaterial() {
   var Result = null;
   var tex = null;
   tex = CanvasTex(64,64,function (x$18, w$5, h$3) {
      var gr = null;
      gr = x$18.createRadialGradient(w$5 / 2,h$3 / 2,0,w$5 / 2,h$3 / 2,w$5 / 2);
      gr.addColorStop(0,"rgba(255,255,255,1)");
      gr.addColorStop(0.45,"rgba(255,255,255,0.55)");
      gr.addColorStop(1,"rgba(255,255,255,0)");
      x$18.fillStyle = gr;
      x$18.fillRect(0,0,w$5,h$3);
   },true);
   Result = new THREE.MeshBasicMaterial({
      "transparent" : true
      ,"polygonOffsetUnits" : -2
      ,"polygonOffsetFactor" : -2
      ,"polygonOffset" : true
      ,"opacity" : 0.42
      ,"map" : tex
      ,"depthWrite" : false
      ,"color" : 1846344
   });
   return Result
}
function InitGfx() {
   PatchToon();
   PatchFog();
   SHARED = TObject.Create($New(TShared));
   SHARED.sunView = Uniform(new THREE.Vector3(0,1,0));
   SHARED.time = Uniform(0);
   AO_GEO = new THREE.PlaneGeometry(1,1,1,1).rotateX(-1.5707963267949);
}
function CanvasTex(w$5, h$3, draw, srgb) {
   var Result = null;
   var c$4 = null;
   c$4 = document.createElement("canvas");
   c$4.width = w$5;
   c$4.height = h$3;
   draw(c$4.getContext("2d"),w$5,h$3);
   Result = new THREE.CanvasTexture(c$4);
   if (srgb) {
      Result.colorSpace = "srgb";
   } else {
      Result.colorSpace = "";
   }
   Result.wrapS = 1000;
   Result.wrapT = 1000;
   Result.anisotropy = 8;
   return Result
}
function PatchToon() {
   var ch = null;
   ch = THREE.ShaderChunk;
   if (!(JsIncludes(ch.lights_physical_pars_fragment,"vec3 irradiance = dotNL * directLight.color;"))) {
      console.warn("Cel-Shading: Shader-Stelle nicht gefunden");
   }
   ch.lights_physical_pars_fragment = "float toonNL( float d ) { return smoothstep( 0.0, 0.06, d ) * ( 0.7 + 0.3 * smoothstep( 0.3, 0.38, d ) ); }\n"+JsReplace(ch.lights_physical_pars_fragment,"vec3 irradiance = dotNL * directLight.color;","vec3 irradiance = toonNL( dot( geometryNormal, directLight.direction ) ) * directLight.color;");
}
function PatchFog() {
   var ch$1 = null;
   ch$1 = THREE.ShaderChunk;
   ch$1.fog_pars_vertex = "#ifdef USE_FOG\r\n  varying float vFogDepth;\r\n  varying vec3 vFogWorldPos;\r\n#endif";
   ch$1.fog_vertex = "#ifdef USE_FOG\r\n  vFogDepth = - mvPosition.z;\r\n  vec4 fogWP = vec4( transformed, 1.0 );\r\n  #ifdef USE_INSTANCING\r\n    fogWP = instanceMatrix * fogWP;\r\n  #endif\r\n  vFogWorldPos = ( modelMatrix * fogWP ).xyz;\r\n#endif";
   ch$1.fog_pars_fragment = "#ifdef USE_FOG\r\n  uniform vec3 fogColor;\r\n  varying float vFogDepth;\r\n  varying vec3 vFogWorldPos;\r\n  #ifdef FOG_EXP2\r\n    uniform float fogDensity;\r\n  #else\r\n    uniform float fogNear;\r\n    uniform float fogFar;\r\n  #endif\r\n#endif";
   ch$1.fog_fragment = "#ifdef USE_FOG\r\n  #ifdef FOG_EXP2\r\n    float fogH = max( 0.0, vFogWorldPos.y - ( cameraPosition.y - 25.0 ) );\r\n    float fogFactor = ( 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth ) ) * exp( - fogH * 0.0045 );\r\n  #else\r\n    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );\r\n  #endif\r\n  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );\r\n#endif";
}
function DrawCorduroy(g$8, S$1, hh) {
   var H$1 = null,
      img = null,
      x$10 = 0,
      y$6 = 0,
      i$2 = 0,
      wob = 0,
      p$3 = 0,
      ridge$3 = 0,
      grain = 0,
      lowv = 0,
      dx = 0,
      dy = 0,
      nx$1 = 0,
      ny$1 = 0,
      nz$2 = 0,
      l = 0;
   H$1 = new Float32Array(S$1*S$1);
   img = g$8.createImageData(S$1,S$1);
   var $temp56;
   for(y$6=0,$temp56=S$1;y$6<$temp56;y$6++) {
      var $temp57;
      for(x$10=0,$temp57=S$1;x$10<$temp57;x$10++) {
         wob = Sin(y$6 / S$1 * 6.28318530717959 * 2) * 1.6 + Sin(y$6 / S$1 * 6.28318530717959 * 5 + 1) * 0.6;
         p$3 = FMod(FMod(x$10 + wob,32) + 32,32) / 32;
         ridge$3 = Power(Sin(p$3 * 3.14159265358979),0.65);
         grain = Hash2(x$10,y$6) * 0.22 + Hash2(x$10>>>2,y$6>>>2) * 0.18;
         lowv = 0.25 * Sin(x$10 / S$1 * 6.28318530717959 * 3 + Sin(y$6 / S$1 * 6.28318530717959) * 2) * Sin(y$6 / S$1 * 6.28318530717959 * 4);
         H$1[(y$6 * S$1 + x$10)]=(ridge$3 + grain + lowv);
      }
   }
   var $temp58;
   for(y$6=0,$temp58=S$1;y$6<$temp58;y$6++) {
      var $temp59;
      for(x$10=0,$temp59=S$1;x$10<$temp59;x$10++) {
         dx = H$1[(y$6 * S$1 + (x$10 + 1) % S$1)] - H$1[(y$6 * S$1 + (x$10 - 1 + S$1) % S$1)];
         dy = H$1[((y$6 + 1) % S$1 * S$1 + x$10)] - H$1[((y$6 - 1 + S$1) % S$1 * S$1 + x$10)];
         nx$1 = (-dx) * 1.4;
         ny$1 = (-dy) * 1.4;
         nz$2 = 1;
         l = Math.hypot(nx$1,ny$1,nz$2);
         nx$1 /= l;
         ny$1 /= l;
         nz$2 /= l;
         i$2 = (y$6 * S$1 + x$10)*4;
         img.data[i$2]=((nx$1 * 0.5 + 0.5) * 255);
         img.data[(i$2 + 1)]=((ny$1 * 0.5 + 0.5) * 255);
         img.data[(i$2 + 2)]=((nz$2 * 0.5 + 0.5) * 255);
         img.data[(i$2 + 3)]=255;
      }
   }
   g$8.putImageData(img,0,0);
}
/// TParts = class (TObject)
var TParts = {
   $ClassName:"TParts",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.list = [];
   }
   /// procedure TParts.Add(g: JBufferGeometry)
   ,Add$1:function(Self, g$8) {
      Self.list.push(g$8);
   }
   ,Destroy:TObject.Destroy
};
/// TChaletOpts = class (TObject)
var TChaletOpts = {
   $ClassName:"TChaletOpts",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.balconies = $.noDoor = $.noWindows = $.plaster = $.terrace = false;
      $.wood = 0;
   }
   ,Destroy:TObject.Destroy
};
function MergeParts(parts$8) {
   var Result = null;
   Result = mergeGeometries(parts$8.list);
   Result.computeBoundingSphere();
   return Result
}
function MakeTreeGeometry(detail$1) {
   var Result = null;
   var seg = 0,
      tiers = 0,
      i$1 = 0,
      k = 0,
      row = 0,
      cc = 0,
      v$2 = 0,
      f$1 = 0,
      r$2 = 0,
      h$1 = 0,
      yb = 0,
      a$70 = 0,
      tip = 0,
      rr$1 = 0,
      hs = 0,
      snow = 0,
      gv = 0,
      yy = 0,
      parts = null,
      trunk = null,
      g$8 = null,
      pos$5 = null,
      col$5 = null,
      N = null,
      cap = null;
   parts = TObject.Create($New(TParts));
   if (detail$1) {
      seg = 12;
      tiers = 7;
      v$2 = 0;
   } else {
      seg = 6;
      tiers = 4;
      v$2 = 9;
   }
   trunk = new THREE.CylinderGeometry(0.1,0.24,2.6,(detail$1)?7:4,1,false,0,6.28318530717959);
   trunk.translate(0,1.3,0);
   trunk.deleteAttribute("uv");
   TParts.Add$1(parts,Colorize(trunk.toNonIndexed(),function (c$7, x$18, y$13, z$13, ny$2, i$6) {
      c$7.setRGB(0.19,0.12,0.08);
   }));
   var $temp60;
   for(i$1=0,$temp60=tiers;i$1<$temp60;i$1++) {
      f$1 = i$1 / (tiers - 1);
      r$2 = 2.35 * (1 - f$1 * 0.8) * ((detail$1)?1:1.08);
      h$1 = 2.5 * (1 - f$1 * 0.35);
      yb = 1.25 + 6.6 * Power(f$1,0.92);
      g$8 = new THREE.ConeGeometry(r$2,h$1,seg,2,true,0,6.28318530717959);
      g$8.deleteAttribute("uv");
      pos$5 = g$8.attributes.position;
      col$5 = new Float32Array(pos$5.count * 3);
      var $temp61;
      for(k=0,$temp61=pos$5.count;k<$temp61;k++) {
         row = $Div(k,seg + 1);
         cc = k % (seg + 1) % seg;
         a$70 = cc / seg * 6.28318530717959 + i$1 * 0.9;
         if (row == 2) {
            tip = ((!(cc % 2))?1:0.72) * (0.88 + 0.24 * Hash1(cc * 3.1 + i$1 * 7 + v$2));
         } else {
            tip = 1;
         }
         rr$1 = r$2 * row / 2 * tip * ((row == 1)?1.12:1);
         if (row == 2) {
            yy = 0.4 * tip;
         } else if (row == 1) {
            yy = 0.05;
         } else {
            yy = 0;
         }
         pos$5.setXYZ(k,Sin(a$70) * rr$1,h$1 / 2 - h$1 * row / 2 - yy,Cos(a$70) * rr$1);
      }
      g$8.computeVertexNormals();
      g$8.translate(0,yb + h$1 / 2,0);
      N = g$8.attributes.normal;
      var $temp62;
      for(k=0,$temp62=pos$5.count;k<$temp62;k++) {
         row = $Div(k,seg + 1);
         cc = k % (seg + 1) % seg;
         hs = Hash1(cc * 5.3 + i$1 * 11.7 + v$2);
         if (!row) {
            snow = 1;
         } else if (row == 1) {
            snow = (hs > 0.25)?1:0.35;
         } else {
            snow = (hs > 0.55 && N.getY(k) > 0.2)?0.85:0;
         }
         gv = 0.85 + 0.3 * Hash1(k * 1.7 + i$1);
         col$5[(k * 3)]=Lerp(0.05 * gv,0.88,snow);
         col$5[(k * 3 + 1)]=Lerp(0.15 * gv,0.92,snow);
         col$5[(k * 3 + 2)]=Lerp(0.09 * gv,0.98,snow);
      }
      g$8.setAttribute("color",new THREE.BufferAttribute(col$5,3));
      TParts.Add$1(parts,g$8.toNonIndexed());
   }
   cap = new THREE.ConeGeometry(0.28,0.9,(detail$1)?8:4,1,false,0,6.28318530717959);
   cap.deleteAttribute("uv");
   cap.translate(0,9.7,0);
   TParts.Add$1(parts,Colorize(cap.toNonIndexed(),function (c$7, x$18, y$13, z$13, ny$2, i$6) {
      c$7.setRGB(0.9,0.93,0.98);
   }));
   Result = mergeGeometries(parts.list);
   Result.computeBoundingSphere();
   return Result
}
function MakeStation() {
   var Result = null;
   var parts$1 = null;
   parts$1 = TObject.Create($New(TParts));
   BoxPart(parts$1,9,8.2,11,0,0.1,0,13225169,0,0,0);
   BoxPart(parts$1,9.05,1.1,11.05,0,2.6,0,2832453,0,0,0);
   BoxPart(parts$1,10,0.45,12.5,0,4.4,0,3817287,0,0,0);
   BoxPart(parts$1,9.7,0.3,12.2,0,4.75,0,16054267,0,0,0);
   GeoPart(parts$1,new THREE.CylinderGeometry(2.7,2.7,0.7,24,1,false,0,6.28318530717959).translate(0,5.6,5.5),15906565);
   BoxPart(parts$1,0.6,1.4,0.6,0,5,5.5,2764600,0,0,0);
   Result = MergeParts(parts$1);
   return Result
}
function MakeRockGeometry() {
   var Result = null;
   var n = 0,
      g$2 = null,
      p$1 = null,
      v$3 = null,
      ng = null;
   g$2 = new THREE.IcosahedronGeometry(1,1);
   p$1 = g$2.attributes.position;
   v$3 = new THREE.Vector3();
   for(let i$6=0,$temp63=p$1.count;i$6<$temp63;i$6++) {
      v$3.fromBufferAttribute(p$1,i$6);
      n = 0.75 + 0.45 * (VNoise(v$3.x * 1.7 + 3,v$3.z * 1.7 + v$3.y * 1.3) * 0.5 + 0.5);
      v$3.multiplyScalar(n);
      v$3.y *= 0.7;
      p$1.setXYZ(i$6,v$3.x,v$3.y,v$3.z);
   }
   ng = (Truthy(g$2.index))?g$2.toNonIndexed():g$2;
   ng.computeVertexNormals();
   Result = Colorize(ng,function (c$7, x$18, y$13, z$13, ny$2, i$7) {
      var s$4 = 0;
      s$4 = Smoothstep(0.45,0.75,ny$2);
      c$7.setRGB(Lerp(0.3,0.9,s$4),Lerp(0.29,0.92,s$4),Lerp(0.28,0.97,s$4));
   });
   return Result
}
function MakePylon() {
   var Result = null;
   var parts$2 = null,
      a$75 = 0,
      s$12 = 0,
      a$74 = [0,0];
   parts$2 = TObject.Create($New(TParts));
   BoxPart(parts$2,1.6,1.2,1.6,0,-0.2,0,10724256,0,0,0);
   GeoPart(parts$2,new THREE.CylinderGeometry(0.26,0.4,10,10,1,false,0,6.28318530717959).translate(0,5,0),10134445);
   BoxPart(parts$2,5.4,0.4,0.4,0,10,0,10134445,0,0,0);
   a$74 = [-1, 1];
   for(a$75=0;a$75<=1;a$75++) {
      s$12 = a$74[a$75];
      BoxPart(parts$2,0.3,0.45,1.8,s$12 * 2.3,9.7,0,2764600,0,0,0);
      BoxPart(parts$2,0.08,1.2,0.08,s$12 * 1.2,10.7,0,10134445,0,0,0);
   }
   BoxPart(parts$2,3,0.08,0.08,0,11.3,0,10134445,0,0,0);
   Result = MergeParts(parts$2);
   return Result
}
function MakeFarmhouse() {
   var Result = null;
   var wallTop = 0,
      by = 0,
      ridge = 0,
      parts$3 = null,
      a$77 = 0,
      x$18 = 0,
      a$76 = [0,0];
   parts$3 = TObject.Create($New(TParts));
   wallTop = 6.2;
   BoxPart(parts$3,20.3,6,10.3,0,-2,0,8749948,0,0,0);
   BoxPart(parts$3,9,2.6,10,-5.5,2.3,0,15722975,0,0,0);
   BoxPart(parts$3,9,2.6,10,-5.5,4.9,0,7029286,0,0,0);
   BoxPart(parts$3,11,5.2,10,4.5,3.6,0,5913124,0,0,0);
   a$76 = [2.2, 6.8];
   for(a$77=0;a$77<=1;a$77++) {
      x$18 = a$76[a$77];
      BoxPart(parts$3,3.2,3.6,0.14,x$18,2.8,5.05,4007446,0,0,0);
      BoxPart(parts$3,0.12,3.6,0.16,x$18,2.8,5.07,2759182,0,0,0);
   }
   for(let k$4=0;k$4<=6;k$4++) {
      BoxPart(parts$3,0.08,5.2,0.08,-0.5 + k$4 * 1.65,3.6,5.05,4599836,0,0,0);
   }
   AddWindows(parts$3,-10,-1,10,2.45,true);
   AddWindows(parts$3,-10,-1,10,5.05,true);
   BoxPart(parts$3,1.1,2.1,0.14,-2.2,2.05,5.05,4007446,0,0,0);
   by = 3.6;
   BoxPart(parts$3,8,0.16,1.2,-5.5,by,5.6,9132595,0,0,0);
   BoxPart(parts$3,8,0.9,0.07,-5.5,by + 0.5,6.18,9132595,0,0,0);
   BoxPart(parts$3,8,0.22,0.3,-5.5,by + 1.02,6.18,14100029,0,0,0);
   ridge = AddGableRoof(parts$3,20,10,wallTop,0.4,1.1,3876376,7029286);
   BoxPart(parts$3,0.7,2,0.7,-6,ridge - 0.3,-2,8749948,0,0,0);
   Result = MergeParts(parts$3);
   return Result
}
function MakeChurch() {
   var Result = null;
   var nx = 0,
      nz = 0,
      ox = 0,
      oz = 0,
      ry = 0,
      parts$4 = null,
      a$78 = 0,
      x$18 = 0,
      a$158 = 0,
      sz$1 = 0,
      face$1 = null,
      a$79 = [0,0,0,0];
   parts$4 = TObject.Create($New(TParts));
   BoxPart(parts$4,16.4,6,8.4,0,-2.5,0,8749948,0,0,0);
   BoxPart(parts$4,16,7,8,0,4,0,15854818,0,0,0);
   AddGableRoof(parts$4,16,8,7.5,0.62,0.5,7024162,15854818);
   GeoPart(parts$4,new THREE.CylinderGeometry(3.9,3.9,7,16,1,false,0,3.14159265358979).translate(8,4,0),15854818);
   GeoPart(parts$4,new THREE.ConeGeometry(4.3,2.8,16,1,false,0,3.14159265358979).translate(8,8.9,0),7024162);
   var a$159 = [0,0];
   a$79 = [-5, -1.5, 2, 5.5];
   for(a$78=0;a$78<=3;a$78++) {
      x$18 = a$79[a$78];
      a$159 = [1, -1];
      for(a$158=0;a$158<=1;a$158++) {
         sz$1 = a$159[a$158];
         BoxPart(parts$4,1,2.8,0.12,x$18,4.3,sz$1 * 4.05,1844786,0,0,0);
      }
   }
   BoxPart(parts$4,4.6,5,4.6,-10.1,-2,0,8749948,0,0,0);
   BoxPart(parts$4,4.2,19.5,4.2,-10.1,10.25,0,15854818,0,0,0);
   BoxPart(parts$4,4.5,0.4,4.5,-10.1,14.5,0,14275268,0,0,0);
   BoxPart(parts$4,4.5,0.4,4.5,-10.1,19.8,0,14275268,0,0,0);
   for(let dirIdx=0;dirIdx<=3;dirIdx++) {
      switch (dirIdx) {
         case 0 :
            nx = -1;
            nz = 0;
            break;
         case 1 :
            nx = 0;
            nz = 1;
            break;
         case 2 :
            nx = 0;
            nz = -1;
            break;
         default :
            nx = 1;
            nz = 0;
      }
      ox = -10.1 + nx * 2.12;
      oz = nz * 2.12;
      ry = (nx != 0)?1.5707963267949:0;
      BoxPart(parts$4,1.1,1.8,0.12,ox,18.1,oz,1844786,0,ry,0);
      if (nx != 1) {
         face$1 = new THREE.CylinderGeometry(0.95,0.95,0.12,20,1,false,0,6.28318530717959);
         face$1.rotateX(1.5707963267949);
         face$1.rotateY(ry);
         face$1.translate(-10.1 + nx * 2.14,16.2,nz * 2.14);
         GeoPart(parts$4,face$1,16250090);
         BoxPart(parts$4,0.1,0.75,0.14,-10.1 + nx * 2.22,16.45,nz * 2.22,1844786,0,ry,0);
         BoxPart(parts$4,0.55,0.1,0.14,-10.1 + nx * 2.22 + ((nz != 0)?0.22:0),16.2,nz * 2.22 + ((nx != 0)?0.22 * nx:0),1844786,0,ry,0);
      }
   }
   GeoPart(parts$4,new THREE.SphereGeometry(2.3,18,12,0,6.28318530717959,0,3.14159265358979).scale(1,1.25,1).translate(-10.1,21.9,0),5214074);
   GeoPart(parts$4,new THREE.CylinderGeometry(0.75,0.75,1.4,12,1,false,0,6.28318530717959).translate(-10.1,24.8,0),15854818);
   GeoPart(parts$4,new THREE.SphereGeometry(0.9,14,10,0,6.28318530717959,0,3.14159265358979).scale(1,1.3,1).translate(-10.1,26.1,0),5214074);
   GeoPart(parts$4,new THREE.ConeGeometry(0.35,2.2,10,1,false,0,6.28318530717959).translate(-10.1,28,0),5214074);
   BoxPart(parts$4,0.14,1.4,0.14,-10.1,29.6,0,14725184,0,0,0);
   BoxPart(parts$4,0.7,0.14,0.14,-10.1,29.9,0,14725184,0,0,0);
   BoxPart(parts$4,0.16,3,1.8,-12.28,2,0,4007446,0,0,0);
   Result = MergeParts(parts$4);
   return Result
}
function MakeChalet(w$5, d$8, floors, o$1) {
   var Result = null;
   var wood$1 = 0,
      f$2 = 0,
      k$1 = 0,
      baseH = 0,
      wallH = 0,
      wallTop$1 = 0,
      plasterH = 0,
      ridge$1 = 0,
      y$5 = 0,
      by$1 = 0,
      tz$1 = 0,
      x$8 = 0,
      parts$5 = null,
      sx = 0,
      u$3 = null;
   if (!o$1) {
      o$1 = ChaletOpts(0,false,false,false,false,false);
   }
   parts$5 = TObject.Create($New(TParts));
   wood$1 = (o$1.wood)?o$1.wood:7029286;
   baseH = 1;
   wallH = floors * 2.6;
   wallTop$1 = baseH + wallH;
   BoxPart(parts$5,w$5 + 0.3,baseH + 5,d$8 + 0.3,0,(baseH - 5) / 2,0,8749948,0,0,0);
   plasterH = (o$1.plaster)?Max$_Integer_Integer_(1,floors - 1) * 2.6:0;
   if (plasterH != 0) {
      BoxPart(parts$5,w$5,plasterH,d$8,0,baseH + plasterH / 2,0,15722975,0,0,0);
   }
   if (wallH > plasterH) {
      BoxPart(parts$5,w$5,wallH - plasterH,d$8,0,baseH + plasterH + (wallH - plasterH) / 2,0,wood$1,0,0,0);
   }
   ridge$1 = AddGableRoof(parts$5,w$5,d$8,wallTop$1,0.48,0.9,3876376,9132595);
   BoxPart(parts$5,0.7,2.2,0.7,w$5 * 0.25,ridge$1 - 0.2,(-d$8) * 0.18,8749948,0,0,0);
   BoxPart(parts$5,0.8,0.2,0.8,w$5 * 0.25,ridge$1 + 0.95,(-d$8) * 0.18,16054267,0,0,0);
   if (o$1.noWindows) {
      BoxPart(parts$5,w$5 * 0.5,2.4,0.1,0,baseH + 1.2,d$8 / 2 + 0.04,4007446,0,0,0);
      return MergeParts(parts$5);
   }
   var $temp64;
   for(f$2=0,$temp64=floors;f$2<$temp64;f$2++) {
      y$5 = baseH + 1.45 + f$2 * 2.6;
      AddWindows(parts$5,(-w$5) / 2,w$5 / 2,d$8,y$5,true);
      for(let si$1=0;si$1<=1;si$1++) {
         sx = (!si$1)?1:-1;
         BoxPart(parts$5,0.1,1.25,1.05,sx * (w$5 / 2 + 0.02),y$5,0,15262422,0,0,0);
         BoxPart(parts$5,0.1,1,0.8,sx * (w$5 / 2 + 0.05),y$5,0,1844786,0,0,0);
      }
   }
   if (!(o$1.noDoor)) {
      BoxPart(parts$5,1.1,2.1,0.14,w$5 / 2 - 1.4,baseH + 1.05,d$8 / 2 + 0.05,4007446,0,0,0);
   }
   var $temp65;
   for(f$2=1,$temp65=floors;f$2<$temp65;f$2++) {
      if (f$2 > 1 && (!(o$1.balconies))) {
         break;
      }
      by$1 = baseH + f$2 * 2.6;
      BoxPart(parts$5,w$5 * 0.85,0.16,1.3,0,by$1,d$8 / 2 + 0.65,9132595,0,0,0);
      BoxPart(parts$5,w$5 * 0.85,0.95,0.07,0,by$1 + 0.55,d$8 / 2 + 1.28,9132595,0,0,0);
      BoxPart(parts$5,w$5 * 0.85,0.08,1.2,0,by$1 + 0.1,d$8 / 2 + 0.65,16054267,0,0,0);
   }
   if (o$1.terrace) {
      tz$1 = d$8 / 2 + 3.4;
      BoxPart(parts$5,w$5 + 2,0.35,6,0,baseH - 0.1,tz$1,9132595,0,0,0);
      BoxPart(parts$5,w$5 + 2,5,6,0,baseH - 2.8,tz$1,8749948,0,0,0);
      for(k$1=0;k$1<=2;k$1++) {
         x$8 = (k$1 - 1) * w$5 / 3.2;
         BoxPart(parts$5,1.6,0.08,0.8,x$8,baseH + 0.8,tz$1 + 0.6,9132595,0,0,0);
         BoxPart(parts$5,0.1,0.75,0.1,x$8,baseH + 0.4,tz$1 + 0.6,9132595,0,0,0);
         BoxPart(parts$5,0.06,2.3,0.06,x$8,baseH + 1.3,tz$1 + 0.6,14540253,0,0,0);
         u$3 = new THREE.ConeGeometry(1.5,0.6,8,1,true,0,6.28318530717959);
         u$3.translate(x$8,baseH + 2.5,tz$1 + 0.6);
         GeoPart(parts$5,u$3,(k$1 % 2 == 1)?15262422:14100029);
      }
   }
   Result = MergeParts(parts$5);
   return Result
}
function MakeChair() {
   var Result = null;
   var parts$6 = null;
   parts$6 = TObject.Create($New(TParts));
   BoxPart(parts$6,0.08,2.3,0.08,0,-1.15,0,7305088,0,0,0);
   BoxPart(parts$6,1.9,0.08,0.08,0,-2.3,0,7305088,0,0,0);
   BoxPart(parts$6,1.9,0.14,0.6,0,-2.55,0.25,2047866,0,0,0);
   BoxPart(parts$6,1.9,0.7,0.1,0,-2.15,-0.05,2047866,0,0,0);
   BoxPart(parts$6,1.9,0.05,0.05,0,-1.9,0.75,7305088,0,0,0);
   Result = MergeParts(parts$6);
   return Result
}
function GeoPart(parts$8, g$8, hex) {
   var c$1 = null;
   g$8.deleteAttribute("uv");
   c$1 = new THREE.Color(hex);
   TParts.Add$1(parts$8,Colorize((Truthy(g$8.index))?g$8.toNonIndexed():g$8,function (cc$1, x$18, y$13, z$13, ny$2, i$6) {
      cc$1.copy(c$1);
   }));
}
function Colorize(geo, fn) {
   var Result = null;
   var p$2 = null,
      n$1 = null,
      col$1 = null,
      c$2 = null;
   p$2 = geo.attributes.position;
   n$1 = geo.attributes.normal;
   col$1 = new Float32Array(p$2.count * 3);
   c$2 = new THREE.Color();
   for(let i$6=0,$temp66=p$2.count;i$6<$temp66;i$6++) {
      fn(c$2,p$2.getX(i$6),p$2.getY(i$6),p$2.getZ(i$6),n$1.getY(i$6),i$6);
      col$1[(i$6 * 3)]=c$2.r;
      col$1[(i$6 * 3 + 1)]=c$2.g;
      col$1[(i$6 * 3 + 2)]=c$2.b;
   }
   geo.setAttribute("color",new THREE.BufferAttribute(col$1,3));
   Result = geo;
   return Result
}
function ChaletOpts(wood$2, plaster$1, balconies$1, terrace$1, noWindows$1, noDoor$1) {
   var Result = null;
   Result = TObject.Create($New(TChaletOpts));
   Result.wood = wood$2;
   Result.plaster = plaster$1;
   Result.balconies = balconies$1;
   Result.terrace = terrace$1;
   Result.noWindows = noWindows$1;
   Result.noDoor = noDoor$1;
   return Result
}
function BoxPart(parts$8, w$5, h$3, d$8, x$18, y$13, z$13, hex, rx, ry$1, rz) {
   var g$3 = null,
      c$3 = null;
   if (!_eul) {
      _eul = new THREE.Euler();
      _rm = new THREE.Matrix4();
   }
   g$3 = new THREE.BoxGeometry(w$5,h$3,d$8);
   g$3.deleteAttribute("uv");
   if (rx != 0 || ry$1 != 0 || rz != 0) {
      g$3.applyMatrix4(_rm.makeRotationFromEuler(_eul.set(rx,ry$1,rz)));
   }
   g$3.translate(x$18,y$13,z$13);
   c$3 = new THREE.Color(hex);
   TParts.Add$1(parts$8,Colorize(g$3.toNonIndexed(),function (cc$1, x$19, y$14, z$14, ny$2, i$6) {
      cc$1.copy(c$3);
   }));
}
function AddWindows(parts$8, x0, x1, d$8, y$13, shutters) {
   var n$2 = 0,
      k$2 = 0,
      x$9 = 0,
      sz = 0;
   n$2 = Max$_Integer_Integer_(1,Floor((x1 - x0) / 2.8));
   var $temp67;
   for(k$2=0,$temp67=n$2;k$2<$temp67;k$2++) {
      x$9 = x0 + (k$2 + 0.5) * (x1 - x0) / n$2;
      for(let si$1=0;si$1<=1;si$1++) {
         sz = (!si$1)?1:-1;
         BoxPart(parts$8,1.05,1.25,0.1,x$9,y$13,sz * (d$8 / 2 + 0.02),15262422,0,0,0);
         BoxPart(parts$8,0.8,1,0.1,x$9,y$13,sz * (d$8 / 2 + 0.05),1844786,0,0,0);
         if (sz > 0 && shutters) {
            BoxPart(parts$8,0.4,1.25,0.07,x$9 - 0.78,y$13,d$8 / 2 + 0.04,3104058,0,0,0);
            BoxPart(parts$8,0.4,1.25,0.07,x$9 + 0.78,y$13,d$8 / 2 + 0.04,3104058,0,0,0);
         }
      }
   }
}
function AddGableRoof(parts$8, w$5, d$8, wallTop$2, pitch, ov, roof, gable) {
   var Result = 0;
   var rh = 0,
      ridge$2 = 0,
      L = 0,
      cz = 0,
      cy = 0,
      s$5 = 0,
      ny = 0,
      nz$1 = 0,
      si = 0,
      gs = null,
      gg = null;
   rh = d$8 / 2 * Tan(pitch);
   ridge$2 = wallTop$2 + rh;
   gs = new THREE.Shape();
   gs.moveTo((-d$8) / 2,0);
   gs.lineTo(d$8 / 2,0);
   gs.lineTo(0,rh);
   gs.lineTo((-d$8) / 2,0);
   gg = new THREE.ExtrudeGeometry(gs,{
      "depth" : w$5
      ,"bevelEnabled" : false
   });
   gg.rotateY(-1.5707963267949);
   gg.translate(w$5 / 2,wallTop$2,0);
   GeoPart(parts$8,gg,gable);
   L = (d$8 / 2 + ov) / Cos(pitch);
   for(si=0;si<=1;si++) {
      s$5 = (!si)?-1:1;
      cz = s$5 * L / 2 * Cos(pitch);
      cy = ridge$2 + 0.12 - L / 2 * Sin(pitch);
      BoxPart(parts$8,w$5 + 2 * ov,0.22,L,0,cy,cz,roof,s$5 * pitch,0,0);
      ny = Cos(pitch);
      nz$1 = s$5 * Sin(pitch);
      BoxPart(parts$8,w$5 + 2 * ov - 0.25,0.3,L - 0.2,0,cy + ny * 0.26,cz + nz$1 * 0.26,16054267,s$5 * pitch,0,0);
   }
   Result = ridge$2;
   return Result
}
/// TTerrain = class (TObject)
var TTerrain = {
   $ClassName:"TTerrain",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.active = [];
      $.ahead = $.treeCount = 0;
      $.aoMat = $.course$1 = $.FScene = $.netMat = $.poleGeo = $.poleMat = $.resort$1 = $.rockGeo = $.rockMat = $.snowMat = $.treeHi = $.treeLo = $.treeMat = $._c = $._e = $._m = $._n = $._p = $._q = $._qa = $._s = $._up = null;
      $.pool = [];
   }
   /// procedure TTerrain.Build(ch: TChunk; idx: Integer)
   ,Build:function(Self, ch$2, idx$2) {
      var z0 = 0,
         dz = 0,
         z$13 = 0,
         cz$2 = 0,
         tt$1 = 0,
         u$3 = 0,
         x$18 = 0,
         y$13 = 0,
         d$8 = 0,
         dhdx = 0,
         dhdz = 0,
         nx$2 = 0,
         ny$2 = 0,
         nz$3 = 0,
         l$1 = 0,
         ad = 0,
         g$8 = 0,
         r$7 = 0,
         gg$1 = 0,
         bb = 0,
         wind$1 = 0,
         rock = 0,
         rn = 0,
         W$1 = 0,
         a$110 = 0,
         b$8 = 0,
         i$6 = 0,
         gi = 0,
         vi = 0,
         bl = 0,
         br = 0,
         up$5 = 0,
         dn = 0,
         kc = 0,
         c$7 = null,
         Hg = null,
         Xg = null,
         geo = null,
         Pos$2 = null,
         Nrm = null,
         UV = null,
         Col = null,
         Grm = null,
         kick = [],
         k$4 = null,
         a$160 = 0,
         k$5 = null;
      c$7 = Self.course$1;
      z0 = idx$2 * 64;
      dz = 1;
      Hg = ch$2.H;
      Xg = ch$2.X;
      ch$2.idx$1 = idx$2;
      for(a$110=-1;a$110<=65;a$110++) {
         z$13 = z0 + a$110 * dz;
         cz$2 = TCourse.cx(c$7,z$13);
         for(b$8=0;b$8<=110;b$8++) {
            tt$1 = b$8 / 110 * 2 - 1;
            u$3 = 420 * (0.15 * tt$1 + 0.85 * Power(tt$1,5));
            x$18 = cz$2 + u$3;
            i$6 = (a$110 + 1) * 111 + b$8;
            Xg[i$6]=x$18;
            Hg[i$6]=TCourse.height$4(c$7,x$18,z$13);
         }
      }
      geo = ch$2.mesh.geometry;
      Pos$2 = geo.attributes.position.array;
      Nrm = geo.attributes.normal.array;
      UV = geo.attributes.uv.array;
      Col = geo.attributes.color.array;
      Grm = geo.attributes.groom.array;
      var $temp68;
      for(kc=Floor(z0 / c$7.Trk.kickCell) - 1,$temp68=Floor((z0 + 64) / c$7.Trk.kickCell);kc<=$temp68;kc++) {
         k$4 = TObject.Create($New(TKicker));
         if (TCourse.kicker(c$7,kc,k$4)) {
            kick.push(k$4);
         }
      }
      for(a$110=0;a$110<=64;a$110++) {
         z$13 = z0 + a$110 * dz;
         cz$2 = TCourse.cx(c$7,z$13);
         W$1 = TCourse.width$4(c$7,z$13);
         for(b$8=0;b$8<=110;b$8++) {
            gi = (a$110 + 1) * 111 + b$8;
            vi = a$110 * 111 + b$8;
            x$18 = Xg[gi];
            y$13 = Hg[gi];
            d$8 = x$18 - cz$2;
            bl = (b$8 > 0)?b$8 - 1:b$8;
            br = (b$8 < 110)?b$8 + 1:b$8;
            dhdx = (Hg[((a$110 + 1) * 111 + br)] - Hg[((a$110 + 1) * 111 + bl)]) / (Xg[((a$110 + 1) * 111 + br)] - Xg[((a$110 + 1) * 111 + bl)]);
            up$5 = (a$110 + 2) * 111 + b$8;
            dn = a$110 * 111 + b$8;
            dhdz = (Hg[up$5] - Hg[dn] - dhdx * (Xg[up$5] - Xg[dn])) / (2 * dz);
            nx$2 = -dhdx;
            ny$2 = 1;
            nz$3 = -dhdz;
            l$1 = Math.hypot(nx$2,ny$2,nz$3);
            nx$2 /= l$1;
            ny$2 /= l$1;
            nz$3 /= l$1;
            Pos$2[(vi * 3)]=x$18;
            Pos$2[(vi * 3 + 1)]=y$13;
            Pos$2[(vi * 3 + 2)]=z$13;
            Nrm[(vi * 3)]=nx$2;
            Nrm[(vi * 3 + 1)]=ny$2;
            Nrm[(vi * 3 + 2)]=nz$3;
            tt$1 = b$8 / 110 * 2 - 1;
            UV[(vi*2)]=(420 * (0.15 * tt$1 + 0.85 * Power(tt$1,5)) / 4);
            UV[((vi*2) + 1)]=(z$13 / 4);
            ad = Abs$_Float_(d$8);
            g$8 = 1 - Smoothstep(W$1 - 1.5,W$1 + 7,ad);
            Grm[vi]=g$8;
            r$7 = Lerp(0.97,0.84,g$8);
            gg$1 = Lerp(0.98,0.88,g$8);
            bb = Lerp(1,0.95,g$8);
            wind$1 = Lerp(0.955 + 0.06 * Fbm(x$18 * 0.045,z$13 * 0.045,2),1,g$8);
            r$7 *= wind$1;
            gg$1 *= wind$1;
            bb *= Lerp(wind$1,1,0.5);
            rock = Smoothstep(0.66,0.52,ny$2) * (0.6 + 0.4 * VNoise(x$18 * 0.07,z$13 * 0.07));
            rn = 0.9 + 0.1 * Hash2(Floor(x$18 * 0.5),Floor(z$13 * 0.5));
            r$7 = Lerp(r$7,0.33 * rn,rock);
            gg$1 = Lerp(gg$1,0.31 * rn,rock);
            bb = Lerp(bb,0.3 * rn,rock);
            var $temp69;
            for(a$160=0,$temp69=kick.length;a$160<$temp69;a$160++) {
               k$5 = kick[a$160];
               if (Abs$_Float_(z$13 - (k$5.z$6 + k$5.L$1)) < 0.55 && Abs$_Float_(d$8 - k$5.d$1) < 3.6) {
                  r$7 = 0.15;
                  gg$1 = 0.4;
                  bb = 0.95;
               }
            }
            if ((Abs$_Float_(z$13 - c$7.zf) < 0.6 || Abs$_Float_(z$13 - 3) < 0.4) && ad < W$1) {
               r$7 = 0.95;
               gg$1 = 0.12;
               bb = 0.08;
            }
            Col[(vi * 3)]=r$7;
            Col[(vi * 3 + 1)]=gg$1;
            Col[(vi * 3 + 2)]=bb;
         }
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.normal.needsUpdate = true;
      geo.attributes.uv.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      geo.attributes.groom.needsUpdate = true;
      geo.computeBoundingSphere();
      ch$2.center.set(TCourse.cx(c$7,z0 + 32),Hg[3718],z0 + 32);
      ch$2.mesh.visible = true;
      TTerrain.BuildProps(Self,ch$2,idx$2,z0,64,kick);
   }
   /// procedure TTerrain.BuildProps(ch: TChunk; idx: Integer; z0: Float; CL: Float; kick: array of TKicker)
   ,BuildProps:function(Self, ch$2, idx$2, z0, CL, kick) {
      var na = 0,
         n$7 = 0,
         k$4 = 0,
         r$7 = 0,
         pc = 0,
         nv = 0,
         si$1 = 0,
         v$4 = 0,
         sd = 0,
         z$13 = 0,
         W$1 = 0,
         off$8 = 0,
         x$18 = 0,
         sc = 0,
         rot$2 = 0,
         forest$1 = 0,
         y$13 = 0,
         slope = 0,
         zz = 0,
         cz$2 = 0,
         zl = 0,
         za = 0,
         zb = 0,
         xa = 0,
         xb = 0,
         ya = 0,
         yb$1 = 0,
         side$3 = 0,
         c$7 = null,
         m$7 = null,
         q$2 = null,
         s$12 = null,
         p$7 = null,
         e$1 = null,
         rng = null,
         nrm$1 = null,
         qa = null,
         UP = null,
         addAO = null,
         col$5 = null,
         addPole = null,
         a$161 = 0,
         kk = null,
         ng$1 = null,
         NP = null,
         NN = null,
         NU = null,
         quad = [];
      c$7 = Self.course$1;
      m$7 = Self._m;
      q$2 = Self._q;
      s$12 = Self._s;
      p$7 = Self._p;
      e$1 = Self._e;
      rng = TRNG.Create$72($New(TRNG),idx$2 * 7919 + 13);
      na = 0;
      nrm$1 = Self._n;
      qa = Self._qa;
      UP = Self._up;
      addAO = function (x$19, z$14, r$8) {
         TCourse.normal$1(c$7,x$19,z$14,nrm$1);
         qa.setFromUnitVectors(UP,nrm$1);
         p$7.set(x$19,TCourse.height$4(c$7,x$19,z$14) + 0.06,z$14);
         s$12.set(r$8,1,r$8);
         m$7.compose(p$7,qa,s$12);
         ch$2.ao.setMatrixAt(na,m$7);
         ++na;
      };
      n$7 = 0;
      ch$2.tn = 0;
      k$4 = 0;
      while (k$4 < Self.treeCount * 6 && n$7 < Self.treeCount) {
         ++k$4;
         z$13 = z0 + TRNG.Next(rng) * CL;
         side$3 = (TRNG.Next(rng) < 0.5)?-1:1;
         W$1 = TCourse.width$4(c$7,z$13);
         off$8 = W$1 + 8 + TRNG.Next(rng) * 290;
         x$18 = TCourse.cx(c$7,z$13) + side$3 * off$8;
         sc = 0.7 + TRNG.Next(rng) * 0.85;
         rot$2 = TRNG.Next(rng) * 6.28318530717959;
         forest$1 = Smoothstep(-0.05,0.25,Fbm(x$18 * 0.008 + 3,z$13 * 0.008,3)) * Smoothstep(W$1 + c$7.Trk.forestFrom,W$1 + c$7.Trk.forestFrom + 70,off$8);
         if (TRNG.Next(rng) > c$7.Trk.forest + (1 - c$7.Trk.forest) * forest$1) {
            continue;
         }
         if (!!Self.resort$1 && TResort.Blocked(Self.resort$1,x$18,z$13,2,true)) {
            continue;
         }
         y$13 = TCourse.height$4(c$7,x$18,z$13);
         slope = Abs$_Float_(TCourse.height$4(c$7,x$18 + 1,z$13) - TCourse.height$4(c$7,x$18 - 1,z$13)) * 0.5;
         if (slope > 1.1) {
            continue;
         }
         p$7.set(x$18,y$13 - 0.3,z$13);
         q$2.setFromEuler(e$1.set(0,rot$2,0));
         s$12.set(sc,sc * (0.9 + TRNG.Next(rng) * 0.35),sc);
         m$7.compose(p$7,q$2,s$12);
         ch$2.hi.setMatrixAt(n$7,m$7);
         ch$2.lo.setMatrixAt(n$7,m$7);
         addAO(x$18,z$13,3.6 * sc);
         if (off$8 < W$1 + 140) {
            ch$2.tx[ch$2.tn]=x$18;
            ch$2.tz[ch$2.tn]=z$13;
            ch$2.tr[ch$2.tn]=(0.35 * sc + 0.25);
            ++ch$2.tn;
         }
         ++n$7;
      }
      ch$2.hi.count = n$7;
      ch$2.lo.count = n$7;
      ch$2.hi.instanceMatrix.needsUpdate = true;
      ch$2.lo.instanceMatrix.needsUpdate = true;
      ch$2.hi.computeBoundingSphere();
      ch$2.lo.boundingSphere = ch$2.hi.boundingSphere.clone();
      r$7 = 0;
      for(k$4=0;k$4<=15;k$4++) {
         z$13 = z0 + TRNG.Next(rng) * CL;
         side$3 = (TRNG.Next(rng) < 0.5)?-1:1;
         W$1 = TCourse.width$4(c$7,z$13);
         x$18 = TCourse.cx(c$7,z$13) + side$3 * (W$1 + 5 + TRNG.Next(rng) * 80);
         sc = 0.4 + Power(TRNG.Next(rng),2) * 2.4;
         if (!!Self.resort$1 && TResort.Blocked(Self.resort$1,x$18,z$13,3,true)) {
            continue;
         }
         p$7.set(x$18,TCourse.height$4(c$7,x$18,z$13) - sc * 0.3,z$13);
         q$2.setFromEuler(e$1.set(TRNG.Next(rng) * 0.5,TRNG.Next(rng) * 6.28318530717959,TRNG.Next(rng) * 0.5));
         s$12.set(sc,sc * (0.6 + TRNG.Next(rng) * 0.6),sc * (0.8 + TRNG.Next(rng) * 0.5));
         m$7.compose(p$7,q$2,s$12);
         ch$2.rocks.setMatrixAt(r$7,m$7);
         ++r$7;
         addAO(x$18,z$13,2.6 * sc);
      }
      ch$2.rocks.count = r$7;
      ch$2.rocks.instanceMatrix.needsUpdate = true;
      ch$2.rocks.computeBoundingSphere();
      ch$2.ao.count = na;
      ch$2.ao.instanceMatrix.needsUpdate = true;
      ch$2.ao.computeBoundingSphere();
      ch$2.ao.visible = na > 0;
      pc = 0;
      col$5 = Self._c;
      addPole = function (x$19, z$14, sy, hex, tilt) {
         if (pc >= 72) {
            return;
         }
         p$7.set(x$19,TCourse.height$4(c$7,x$19,z$14) - 0.05,z$14);
         q$2.setFromEuler(e$1.set(tilt,0,tilt * 0.7));
         s$12.set(1,sy,1);
         m$7.compose(p$7,q$2,s$12);
         ch$2.poles.setMatrixAt(pc,m$7);
         ch$2.poles.setColorAt(pc,col$5.setHex(hex));
         ++pc;
      };
      zz = Ceil(z0 / 16)*16;
      while (zz < z0 + CL) {
         W$1 = TCourse.width$4(c$7,zz);
         cz$2 = TCourse.cx(c$7,zz);
         addPole(cz$2 - W$1 - 0.6,zz,1,16726815,(Hash1(zz) - 0.5) * 0.08);
         addPole(cz$2 + W$1 + 0.6,zz,1,16726815,(Hash1(zz + 3) - 0.5) * 0.08);
         zz += 16;
      }
      var $temp70;
      for(a$161=0,$temp70=kick.length;a$161<$temp70;a$161++) {
         kk = kick[a$161];
         zl = kk.z$6 + kk.L$1;
         if (zl < z0 || zl >= z0 + CL) {
            continue;
         }
         cz$2 = TCourse.cx(c$7,zl);
         addPole(cz$2 + kk.d$1 - 3.9,zl,0.8,2059263,0);
         addPole(cz$2 + kk.d$1 + 3.9,zl,0.8,2059263,0);
      }
      ng$1 = ch$2.net.geometry;
      NP = ng$1.attributes.position.array;
      NN = ng$1.attributes.normal.array;
      NU = ng$1.attributes.uv.array;
      nv = 0;
      var $temp71;
      for(si$1=0,$temp71=Trunc(CL / 2);si$1<$temp71;si$1++) {
         za = z0 + (si$1*2);
         zb = za + 2;
         for(sd=-1;sd<=1;sd++) {
            if (!sd) {
               continue;
            }
            if (TCourse.netSide(c$7,za) != sd || TCourse.netSide(c$7,zb) != sd) {
               continue;
            }
            side$3 = sd;
            xa = TCourse.cx(c$7,za) + side$3 * (TCourse.width$4(c$7,za) + 2.2);
            xb = TCourse.cx(c$7,zb) + side$3 * (TCourse.width$4(c$7,zb) + 2.2);
            ya = TCourse.height$4(c$7,xa,za) + 0.05;
            yb$1 = TCourse.height$4(c$7,xb,zb) + 0.05;
            quad = [xa, ya, za, 0, 0, xb, yb$1, zb, 1, 0, xb, yb$1 + 1.35, zb, 1, 1, xa, ya, za, 0, 0, xb, yb$1 + 1.35, zb, 1, 1, xa, ya + 1.35, za, 0, 1];
            for(v$4=0;v$4<=5;v$4++) {
               NP[(nv * 3)]=quad[v$4 * 5];
               NP[(nv * 3 + 1)]=quad[v$4 * 5 + 1];
               NP[(nv * 3 + 2)]=quad[v$4 * 5 + 2];
               NN[(nv * 3)]=(-side$3);
               NN[(nv * 3 + 1)]=0;
               NN[(nv * 3 + 2)]=0;
               NU[(nv*2)]=((za + quad[v$4 * 5 + 3] * 2) / 1.35);
               NU[((nv*2) + 1)]=quad[v$4 * 5 + 4];
               ++nv;
            }
            if (!(si$1 % 2)) {
               addPole(xa,za,0.85,2764600,0);
            }
         }
      }
      ng$1.setDrawRange(0,nv);
      ng$1.attributes.position.needsUpdate = true;
      ng$1.attributes.normal.needsUpdate = true;
      ng$1.attributes.uv.needsUpdate = true;
      if (nv > 0) {
         ng$1.computeBoundingSphere();
      }
      ch$2.net.visible = nv > 0;
      ch$2.poles.count = pc;
      ch$2.poles.instanceMatrix.needsUpdate = true;
      if (Truthy(ch$2.poles.instanceColor)) {
         ch$2.poles.instanceColor.needsUpdate = true;
      }
      if (pc > 0) {
         ch$2.poles.computeBoundingSphere();
      }
      ch$2.poles.visible = pc > 0;
      ch$2.rocks.visible = true;
   }
   /// constructor TTerrain.Create(scene: JScene; c: TCourse)
   ,Create$67:function(Self, scene$1, c$7) {
      var netTex = null;
      Self.FScene = scene$1;
      Self.course$1 = c$7;
      Self.snowMat = MakeSnowMaterial();
      Self.treeMat = new THREE.MeshStandardMaterial({
         "vertexColors" : true
         ,"side" : 2
         ,"roughness" : 0.9
      });
      Self.treeMat.onBeforeCompile = function (sh$1) {
         sh$1.fragmentShader = JsReplace(String(sh$1.fragmentShader),"#include <color_fragment>","#include <color_fragment>\n  if (!gl_FrontFacing) diffuseColor.rgb = vec3(0.035, 0.09, 0.055);");
      };
      Self.aoMat = MakeAOMaterial();
      Self.rockMat = new THREE.MeshStandardMaterial({
         "vertexColors" : true
         ,"roughness" : 0.95
         ,"flatShading" : true
      });
      Self.poleMat = new THREE.MeshStandardMaterial({
         "roughness" : 0.5
         ,"map" : MakeStripeTex()
      });
      netTex = MakeNetTex();
      netTex.repeat.set(1,1);
      Self.netMat = new THREE.MeshStandardMaterial({
         "side" : 2
         ,"roughness" : 0.8
         ,"map" : netTex
         ,"color" : 16734751
         ,"alphaTest" : 0.5
      });
      Self.treeHi = MakeTreeGeometry(true);
      Self.treeLo = MakeTreeGeometry(false);
      Self.rockGeo = MakeRockGeometry();
      Self.poleGeo = new THREE.CylinderGeometry(0.03,0.035,1.7,6,1,false,0,6.28318530717959);
      Self.poleGeo.translate(0,0.85,0);
      Self.treeCount = PRESET_HIGH.trees;
      Self.ahead = 9;
      Self._m = new THREE.Matrix4();
      Self._q = new THREE.Quaternion();
      Self._s = new THREE.Vector3();
      Self._p = new THREE.Vector3();
      Self._e = new THREE.Euler();
      Self._c = new THREE.Color();
      Self._n = new THREE.Vector3();
      Self._qa = new THREE.Quaternion();
      Self._up = new THREE.Vector3(0,1,0);
      for(let i$6=0;i$6<=13;i$6++) {
         Self.pool.push(TTerrain.CreateChunk(Self));
      }
      return Self
   }
   /// function TTerrain.CreateChunk() : TChunk
   ,CreateChunk:function(Self) {
      var Result = null;
      var nv = 0,
         k$4 = 0,
         aa = 0,
         bb = 0,
         i0 = 0,
         i1 = 0,
         i2 = 0,
         i3 = 0,
         geo = null,
         idx$2 = null,
         ch$2 = null,
         ng$1 = null,
         a$162 = 0,
         o$1 = null,
         a$163 = [null,null,null,null,null,null];
      nv = 7215;
      geo = new THREE.BufferGeometry();
      geo.setAttribute("position",new THREE.BufferAttribute(new Float32Array(nv * 3),3));
      geo.setAttribute("normal",new THREE.BufferAttribute(new Float32Array(nv * 3),3));
      geo.setAttribute("uv",new THREE.BufferAttribute(new Float32Array(nv*2),2));
      geo.setAttribute("color",new THREE.BufferAttribute(new Float32Array(nv * 3),3));
      geo.setAttribute("groom",new THREE.BufferAttribute(new Float32Array(nv),1));
      idx$2 = new Uint32Array(42240);
      k$4 = 0;
      for(aa=0;aa<=63;aa++) {
         for(bb=0;bb<=109;bb++) {
            i0 = aa * 111 + bb;
            i1 = i0 + 1;
            i2 = i0 + 110 + 1;
            i3 = i2 + 1;
            idx$2[k$4]=i0;
            idx$2[(k$4 + 1)]=i2;
            idx$2[(k$4 + 2)]=i1;
            idx$2[(k$4 + 3)]=i1;
            idx$2[(k$4 + 4)]=i2;
            idx$2[(k$4 + 5)]=i3;
            k$4 += 6;
         }
      }
      geo.setIndex(new THREE.BufferAttribute(idx$2,1));
      ch$2 = TObject.Create($New(TChunk));
      ch$2.mesh = new THREE.Mesh(geo,Self.snowMat);
      ch$2.mesh.receiveShadow = true;
      ch$2.mesh.visible = false;
      ch$2.hi = new THREE.InstancedMesh(Self.treeHi,Self.treeMat,175);
      ch$2.hi.castShadow = true;
      ch$2.hi.receiveShadow = true;
      ch$2.lo = new THREE.InstancedMesh(Self.treeLo,Self.treeMat,175);
      ch$2.rocks = new THREE.InstancedMesh(Self.rockGeo,Self.rockMat,16);
      ch$2.rocks.castShadow = true;
      ch$2.rocks.receiveShadow = true;
      ch$2.poles = new THREE.InstancedMesh(Self.poleGeo,Self.poleMat,72);
      ch$2.poles.castShadow = true;
      ch$2.ao = new THREE.InstancedMesh(AO_GEO,Self.aoMat,191);
      ng$1 = new THREE.BufferGeometry();
      ng$1.setAttribute("position",new THREE.BufferAttribute(new Float32Array(1188),3));
      ng$1.setAttribute("normal",new THREE.BufferAttribute(new Float32Array(1188),3));
      ng$1.setAttribute("uv",new THREE.BufferAttribute(new Float32Array(792),2));
      ch$2.net = new THREE.Mesh(ng$1,Self.netMat);
      a$163 = [ch$2.hi, ch$2.lo, ch$2.rocks, ch$2.poles, ch$2.net, ch$2.ao];
      for(a$162=0;a$162<=5;a$162++) {
         o$1 = a$163[a$162];
         o$1.visible = false;
         Self.FScene.add(o$1);
      }
      Self.FScene.add(ch$2.mesh);
      ch$2.H = new Float32Array(7437);
      ch$2.X = new Float32Array(7437);
      ch$2.idx$1 = -1;
      ch$2.center = new THREE.Vector3();
      ch$2.tx = new Float32Array(175);
      ch$2.tz = new Float32Array(175);
      ch$2.tr = new Float32Array(175);
      ch$2.tn = 0;
      Result = ch$2;
      return Result
   }
   /// constructor TTerrain.CreateStub(c: TCourse; r: TResort)
   ,CreateStub:function(Self, c$7, r$7) {
      Self.course$1 = c$7;
      Self.resort$1 = r$7;
      return Self
   }
   /// function TTerrain.Ensure(i: Integer) : Boolean
   ,Ensure:function(Self, i$6) {
      var Result = false;
      var ch$2 = null;
      if (!!TTerrain.FindActive(Self,i$6) || (Self.pool.length==0)) {
         return false;
      }
      ch$2 = Self.pool.pop();
      TTerrain.Build(Self,ch$2,i$6);
      Self.active.push(ch$2);
      Result = true;
      return Result
   }
   /// function TTerrain.FindActive(i: Integer) : TChunk
   ,FindActive:function(Self, i$6) {
      var Result = null;
      var a$164 = 0,
         ch$2 = null,
         a$165 = [];
      a$165 = Self.active;
      var $temp72;
      for(a$164=0,$temp72=a$165.length;a$164<$temp72;a$164++) {
         ch$2 = a$165[a$164];
         if (ch$2.idx$1 == i$6) {
            return ch$2;
         }
      }
      Result = null;
      return Result
   }
   /// function TTerrain.HitTree(x: Float; z: Float; rad: Float) : Boolean
   ,HitTree:function(Self, x$18, z$13, rad) {
      var Result = false;
      var ci = 0,
         i$6 = 0,
         k$4 = 0,
         dx$1 = 0,
         dz = 0,
         rr$2 = 0,
         ch$2 = null;
      ci = Floor(z$13 / 64);
      var $temp73;
      for(i$6=ci - 1,$temp73=ci + 1;i$6<=$temp73;i$6++) {
         ch$2 = TTerrain.FindActive(Self,i$6);
         if (!ch$2) {
            continue;
         }
         var $temp74;
         for(k$4=0,$temp74=ch$2.tn;k$4<$temp74;k$4++) {
            dx$1 = x$18 - ch$2.tx[k$4];
            dz = z$13 - ch$2.tz[k$4];
            rr$2 = ch$2.tr[k$4] + rad;
            if (dx$1*dx$1 + dz*dz < rr$2*rr$2) {
               return true;
            }
         }
      }
      Result = false;
      return Result
   }
   /// procedure TTerrain.RebuildAll(z: Float; camPos: JVector3)
   ,RebuildAll:function(Self, z$13, camPos) {
      var a$166 = 0,
         ch$2 = null,
         a$167 = [];
      a$167 = Self.active;
      var $temp75;
      for(a$166=0,$temp75=a$167.length;a$166<$temp75;a$166++) {
         ch$2 = a$167[a$166];
         TTerrain.Release$2(Self,ch$2);
         Self.pool.push(ch$2);
      }
      Self.active.length=0;
      TTerrain.Update(Self,z$13,camPos,99);
   }
   /// procedure TTerrain.Release(ch: TChunk)
   ,Release$2:function(Self, ch$2) {
      ch$2.idx$1 = -1;
      ch$2.mesh.visible = false;
      ch$2.hi.visible = false;
      ch$2.lo.visible = false;
      ch$2.rocks.visible = false;
      ch$2.poles.visible = false;
      ch$2.net.visible = false;
      ch$2.ao.visible = false;
   }
   /// procedure TTerrain.RemoveActive(k: Integer)
   ,RemoveActive:function(Self, k$4) {
      Self.active.splice(k$4,1)
      ;
   }
   /// procedure TTerrain.Update(z: Float; camPos: JVector3; maxBuilds: Integer = 1)
   ,Update:function(Self, z$13, camPos, maxBuilds) {
      var ci = 0,
         from = 0,
         toI = 0,
         i$6 = 0,
         built = 0,
         k$4 = 0,
         lod2 = 0,
         ch$2 = null,
         a$168 = 0,
         ch$3 = null,
         near$2 = false,
         a$169 = [];
      ci = Floor(z$13 / 64);
      from = ci - 2;
      toI = ci + Self.ahead;
      k$4 = 0;
      while (k$4 < Self.active.length) {
         ch$2 = Self.active[k$4];
         if (ch$2.idx$1 < from || ch$2.idx$1 > toI) {
            TTerrain.Release$2(Self,ch$2);
            TTerrain.RemoveActive(Self,k$4);
            Self.pool.push(ch$2);
         } else {
            ++k$4;
         }
      }
      var $temp76;
      for(i$6=ci - 1,$temp76=ci + 2;i$6<=$temp76;i$6++) {
         TTerrain.Ensure(Self,i$6);
      }
      built = 0;
      i$6 = ci + 3;
      while (i$6 <= toI && built < maxBuilds) {
         if (TTerrain.Ensure(Self,i$6)) {
            ++built;
         }
         ++i$6;
      }
      i$6 = ci - 1;
      while (i$6 >= from && built < maxBuilds) {
         if (TTerrain.Ensure(Self,i$6)) {
            ++built;
         }
         --i$6;
      }
      lod2 = 44100;
      a$169 = Self.active;
      var $temp77;
      for(a$168=0,$temp77=a$169.length;a$168<$temp77;a$168++) {
         ch$3 = a$169[a$168];
         near$2 = ch$3.center.distanceToSquared(camPos) < lod2;
         ch$3.hi.visible = near$2;
         ch$3.lo.visible = !(near$2);
      }
   }
   ,Destroy:TObject.Destroy
};
/// TSpan = class (TObject)
var TSpan = {
   $ClassName:"TSpan",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.a$67 = $.b$1 = null;
   }
   ,Destroy:TObject.Destroy
};
/// TResort = class (TObject)
var TResort = {
   $ClassName:"TResort",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.chairs = $.course$2 = $.FMat = $.FRng = $.FScene$1 = $._a = $._m$1 = $._p$1 = $._q$1 = $._x = $._y = $._z = null;
      $.chairSp = $.t = 0;
      $.clearings = [];
      $.FHouses = [];
      $.houseMeshes = [];
      $.lifts = [];
      $.obst = [];
      $.spans = [];
      $.visKey = "";
   }
   /// function TResort.Blocked(x: Float; z: Float; pad: Float; clear: Boolean = True) : Boolean
   ,Blocked:function(Self, x$18, z$13, pad, clear) {
      var Result = false;
      var dx$1 = 0,
         dz = 0,
         rr$2 = 0,
         tt$1 = 0,
         a$170 = 0,
         o$1 = null,
         a$171 = 0,
         o$2 = null,
         a$172 = 0,
         sp$1 = null,
         a$110 = null,
         b$8 = null,
         a$173 = [],
         a$174 = [],
         a$175 = [];
      if (clear) {
         a$173 = Self.clearings;
         var $temp78;
         for(a$170=0,$temp78=a$173.length;a$170<$temp78;a$170++) {
            o$1 = a$173[a$170];
            dx$1 = x$18 - o$1.x$1;
            dz = z$13 - o$1.z$1;
            if (dx$1*dx$1 + dz*dz < Math.pow(o$1.r,2)) {
               return true;
            }
         }
      }
      a$175 = Self.obst;
      var $temp79;
      for(a$171=0,$temp79=a$175.length;a$171<$temp79;a$171++) {
         o$2 = a$175[a$171];
         if (Abs$_Float_(o$2.z$1 - z$13) > 30) {
            continue;
         }
         dx$1 = x$18 - o$2.x$1;
         dz = z$13 - o$2.z$1;
         rr$2 = o$2.r + pad;
         if (dx$1*dx$1 + dz*dz < rr$2*rr$2) {
            return true;
         }
      }
      a$174 = Self.spans;
      var $temp80;
      for(a$172=0,$temp80=a$174.length;a$172<$temp80;a$172++) {
         sp$1 = a$174[a$172];
         a$110 = sp$1.a$67;
         b$8 = sp$1.b$1;
         if (z$13 < Min$_Float_Float_(a$110.z,b$8.z) - 8 || z$13 > Max$_Float_Float_(a$110.z,b$8.z) + 8) {
            continue;
         }
         dx$1 = b$8.x - a$110.x;
         dz = b$8.z - a$110.z;
         tt$1 = ClampF(((x$18 - a$110.x) * dx$1 + (z$13 - a$110.z) * dz) / (dx$1*dx$1 + dz*dz),0,1);
         if (Math.hypot(x$18 - a$110.x - tt$1 * dx$1,z$13 - a$110.z - tt$1 * dz) < 7 + pad * 0.3) {
            return true;
         }
      }
      Result = false;
      return Result
   }
   /// constructor TResort.Create(scene: JScene; c: TCourse)
   ,Create$68:function(Self, scene$1, c$7) {
      var LZ = 0,
         za = 0,
         zb = 0,
         side$3 = 0,
         off$8 = 0,
         z$13 = 0,
         x$18 = 0,
         g$8 = 0,
         u$3 = 0,
         len$2 = 0,
         need = 0,
         y$13 = 0,
         zv = 0,
         xv = 0,
         zt = 0,
         tt$1 = 0,
         sd = 0,
         yaw$3 = 0,
         n$7 = 0,
         k$4 = 0,
         it = 0,
         li = 0,
         i$6 = 0,
         kk = 0,
         dir$1 = 0,
         liftDefs = [],
         lift = null,
         nd = null,
         A$2 = null,
         B = null,
         a$110 = null,
         b$8 = null,
         dx$1 = 0,
         dz = 0,
         l$1 = 0,
         sp$1 = null,
         a$176 = 0,
         nd$1 = null,
         hh = null,
         a$177 = 0,
         zz = 0,
         hh$1 = null,
         types = [],
         m$7 = null,
         q$2 = null,
         s$12 = null,
         p$7 = null,
         up$5 = null,
         cnt = 0,
         a$178 = 0,
         h$3 = null,
         a$179 = 0,
         h$4 = null,
         im$1 = null,
         a$180 = 0,
         im$2 = null,
         pylons = [],
         stations = [],
         cable = [],
         a$181 = 0,
         lf = null,
         NN = [],
         nd$2 = null,
         qs = null,
         seq = [],
         A$3 = null,
         B$1 = null,
         pt = null,
         E$1 = null,
         ao$1 = null,
         nv = null,
         qa = null,
         o$1 = null,
         r$7 = 0,
         pyl = null,
         sta = null,
         cg = null,
         nc = 0,
         a$182 = 0,
         lf$1 = null,
         a$183 = [],
         a$184 = [],
         a$185 = [],
         a$186 = [],
         a$187 = [0,0,0];
      Self.FScene$1 = scene$1;
      Self.course$2 = c$7;
      Self.t = 0;
      Self.FRng = TRNG.Create$72($New(TRNG),4242);
      LZ = c$7.zf;
      liftDefs = [22, LZ * 0.31, -1, 16, LZ * 0.34, LZ * 0.66, 1, 18, LZ * 0.69, LZ + 60, -1, 16];
      for(li=0;li<=2;li++) {
         var a$188 = [];
         za = liftDefs[li*4];
         zb = liftDefs[(li*4) + 1];
         side$3 = liftDefs[(li*4) + 2];
         off$8 = liftDefs[(li*4) + 3];
         n$7 = Ceil((zb - za) / 72);
         lift = TObject.Create($New(TLift));
         lift.side = side$3;
         var $temp81;
         for(k$4=0,$temp81=n$7;k$4<=$temp81;k$4++) {
            z$13 = za + (zb - za) * k$4 / n$7;
            x$18 = TCourse.cx(c$7,z$13) + side$3 * (TCourse.width$4(c$7,z$13) + off$8);
            g$8 = TCourse.height$4(c$7,x$18,z$13);
            nd = TObject.Create($New(TLiftNode));
            nd.p = V3(x$18,g$8,z$13);
            nd.g = g$8;
            nd.st = (k$4==0) || k$4 == n$7;
            nd.h = (nd.st)?5.6:10;
            lift.nodes.push(nd);
         }
         for(it=0;it<=3;it++) {
            var $temp82;
            for(k$4=0,$temp82=n$7;k$4<$temp82;k$4++) {
               A$2 = lift.nodes[k$4];
               B = lift.nodes[k$4 + 1];
               len$2 = A$2.p.distanceTo(B.p);
               need = 0;
               u$3 = 0.2;
               while (u$3 < 0.9) {
                  x$18 = Lerp(A$2.p.x,B.p.x,u$3);
                  z$13 = Lerp(A$2.p.z,B.p.z,u$3);
                  y$13 = Lerp(A$2.g + A$2.h,B.g + B.h,u$3) - 0.012 * len$2 * 4 * u$3 * (1 - u$3);
                  need = Max$_Float_Float_(need,TCourse.height$4(c$7,x$18,z$13) + 5 - y$13);
                  u$3 += 0.2;
               }
               if (need > 0) {
                  if (!(A$2.st)) {
                     A$2.h = Min$_Float_Float_(A$2.h + need,24);
                  }
                  if (!(B.st)) {
                     B.h = Min$_Float_Float_(B.h + need,24);
                  }
               }
            }
         }
         var $temp83;
         for(k$4=0,$temp83=n$7;k$4<=$temp83;k$4++) {
            a$110 = lift.nodes[Max$_Integer_Integer_(0,k$4 - 1)].p;
            b$8 = lift.nodes[Min$_Integer_Integer_(n$7,k$4 + 1)].p;
            dx$1 = b$8.x - a$110.x;
            dz = b$8.z - a$110.z;
            l$1 = Math.hypot(dx$1,dz);
            lift.nodes[k$4].lat = V3(dz / l$1,0,(-dx$1) / l$1);
            lift.nodes[k$4].top$1 = V3(lift.nodes[k$4].p.x,lift.nodes[k$4].g + lift.nodes[k$4].h,lift.nodes[k$4].p.z);
         }
         Self.lifts.push(lift);
         var $temp84;
         for(k$4=0,$temp84=n$7;k$4<$temp84;k$4++) {
            sp$1 = TObject.Create($New(TSpan));
            sp$1.a$67 = lift.nodes[k$4].p;
            sp$1.b$1 = lift.nodes[k$4 + 1].p;
            Self.spans.push(sp$1);
         }
         a$188 = lift.nodes;
         var $temp85;
         for(a$176=0,$temp85=a$188.length;a$176<$temp85;a$176++) {
            nd$1 = a$188[a$176];
            Self.obst.push(TCircle.Create$69($New(TCircle),nd$1.p.x,nd$1.p.z,(nd$1.st)?6.5:0.8));
         }
         hh = TObject.Create($New(THouse));
         hh.typ = 2;
         hh.x = lift.nodes[0].p.x + side$3 * 19;
         hh.z = za + 6;
         hh.rot = 0;
         Self.FHouses.push(hh);
         Self.obst.push(TCircle.Create$69($New(TCircle),lift.nodes[0].p.x + side$3 * 19,za + 6,10));
      }
      a$187 = [LZ * 0.19, LZ * 0.49, LZ * 0.81];
      for(a$177=0;a$177<=2;a$177++) {
         zz = a$187[a$177];
         x$18 = TCourse.cx(c$7,zz) + TCourse.width$4(c$7,zz) + 15;
         hh$1 = TObject.Create($New(THouse));
         hh$1.typ = 2;
         hh$1.x = x$18;
         hh$1.z = zz;
         hh$1.rot = -1.5707963267949;
         Self.FHouses.push(hh$1);
         Self.obst.push(TCircle.Create$69($New(TCircle),x$18,zz,10));
      }
      z$13 = 140;
      while (z$13 < c$7.zf - 120) {
         if (TRNG.Next(Self.FRng) > 0.5) {
            z$13 += 85;
            continue;
         }
         side$3 = (TRNG.Next(Self.FRng) < 0.65)?-1:1;
         off$8 = TCourse.width$4(c$7,z$13) + 30 + TRNG.Next(Self.FRng) * 150;
         kk = 1 + Trunc(TRNG.Next(Self.FRng) * 3);
         var $temp86;
         for(i$6=0,$temp86=kk;i$6<$temp86;i$6++) {
            TResort.TryHouse(Self,TCourse.cx(c$7,z$13) + side$3 * (off$8 + (TRNG.Next(Self.FRng) - 0.5) * 30),z$13 + (TRNG.Next(Self.FRng) - 0.5) * 40,TResort.Pick(Self,[0, 1, 4, 6, 7, 6]),(TRNG.Next(Self.FRng) - 0.5) * 0.4);
         }
         z$13 += 85;
      }
      zv = LZ * 0.56;
      xv = TCourse.cx(c$7,zv) - TCourse.width$4(c$7,zv) - 80;
      TResort.Village(Self,xv,zv,60,10,[0, 1, 4, 6, 7]);
      tt$1 = 0;
      while (tt$1 <= 1) {
         z$13 = zv - 220 * (1 - tt$1);
         x$18 = Lerp(TCourse.cx(c$7,z$13) - TCourse.width$4(c$7,z$13) - 20,xv,tt$1);
         Self.clearings.push(TCircle.Create$69($New(TCircle),x$18,z$13,30 + 25 * tt$1));
         tt$1 += 0.2;
      }
      zt = LZ + 330;
      TResort.Village(Self,TCourse.cx(c$7,zt) + TCourse.width$4(c$7,zt) + 70,zt,115,22,[0, 0, 1, 4, 5, 5, 6, 7, 7]);
      TResort.TryHouse(Self,TCourse.cx(c$7,LZ + 80) - TCourse.width$4(c$7,LZ + 80) - 20,LZ + 80,5,0);
      z$13 = c$7.zf + 30;
      while (z$13 < c$7.zf + 520) {
         for(let si$1=0;si$1<=1;si$1++) {
            side$3 = (!si$1)?-1:1;
            if (TRNG.Next(Self.FRng) < 0.3) {
               continue;
            }
            TResort.TryHouse(Self,TCourse.cx(c$7,z$13) + side$3 * (TCourse.width$4(c$7,z$13) + 12 + TRNG.Next(Self.FRng) * 110),z$13 + (TRNG.Next(Self.FRng) - 0.5) * 10,TResort.Pick(Self,[0, 0, 1, 4, 5, 6, 7, 7]),(TRNG.Next(Self.FRng) - 0.5) * 0.5 + ((TRNG.Next(Self.FRng) < 0.25)?1.5707963267949:0));
         }
         z$13 += 26;
      }
      types = [MakeChalet(9,7.5,2,null), MakeChalet(7,6,1,ChaletOpts(8014634,false,false,false,false,false)), MakeChalet(15,10,2,ChaletOpts(6043936,false,false,true,false,false)), MakeChurch(), MakeFarmhouse(), MakeChalet(16,11,3,ChaletOpts(6043936,true,true,false,false,false)), MakeChalet(5,4.5,1,ChaletOpts(5913124,false,false,false,true,true)), MakeChalet(10,8,2,ChaletOpts(8014634,true,false,false,false,false))];
      m$7 = new THREE.Matrix4();
      q$2 = new THREE.Quaternion();
      s$12 = new THREE.Vector3(1,1,1);
      p$7 = new THREE.Vector3();
      up$5 = V3(0,1,0);
      for(let ti=0,$temp87=types.length;ti<$temp87;ti++) {
         var a$189 = [];
         cnt = 0;
         a$189 = Self.FHouses;
         var $temp88;
         for(a$178=0,$temp88=a$189.length;a$178<$temp88;a$178++) {
            h$3 = a$189[a$178];
            if (h$3.typ == ti) {
               ++cnt;
            }
         }
         Self.houseMeshes.push(TResort.Mk(Self,types[ti],cnt));
      }
      a$185 = Self.FHouses;
      var $temp89;
      for(a$179=0,$temp89=a$185.length;a$179<$temp89;a$179++) {
         h$4 = a$185[a$179];
         im$1 = Self.houseMeshes[h$4.typ];
         g$8 = TCourse.height$4(c$7,h$4.x,h$4.z);
         p$7.set(h$4.x,g$8 - 0.3,h$4.z);
         q$2.setFromAxisAngle(up$5,h$4.rot);
         m$7.compose(p$7,q$2,s$12);
         h$4.im = im$1;
         h$4.idx = im$1.count;
         h$4.m = m$7.clone();
         im$1.setMatrixAt(im$1.count,m$7);
         im$1.count += 1;
      }
      a$186 = Self.houseMeshes;
      var $temp90;
      for(a$180=0,$temp90=a$186.length;a$180<$temp90;a$180++) {
         im$2 = a$186[a$180];
         im$2.instanceMatrix.needsUpdate = true;
         im$2.computeBoundingSphere();
      }
      Self.visKey = "";
      a$184 = Self.lifts;
      var $temp91;
      for(a$181=0,$temp91=a$184.length;a$181<$temp91;a$181++) {
         lf = a$184[a$181];
         NN = lf.nodes;
         var $temp92;
         for(k$4=0,$temp92=NN.length;k$4<$temp92;k$4++) {
            nd$2 = NN[k$4];
            yaw$3 = ArcTan2(nd$2.lat.x,nd$2.lat.z) - 1.5707963267949;
            q$2.setFromAxisAngle(up$5,yaw$3);
            if (nd$2.st) {
               p$7.set(nd$2.p.x,nd$2.g - 0.2,nd$2.p.z);
               qs = q$2.clone().multiply(new THREE.Quaternion().setFromAxisAngle(up$5,(!k$4)?3.14159265358979:0));
               stations.push(new THREE.Matrix4().compose(p$7,qs,s$12));
            } else {
               p$7.set(nd$2.p.x,nd$2.g,nd$2.p.z);
               pylons.push(new THREE.Matrix4().compose(p$7,q$2,new THREE.Vector3(1,nd$2.h / 10,1)));
            }
         }
         for(dir$1=0;dir$1<=1;dir$1++) {
            if (!dir$1) {
               for(k$4=NN.length - 1;k$4>=0;k$4--) {
                  seq.push(NN[k$4]);
               }
               sd = 2.3;
            } else {
               seq = NN;
               sd = -2.3;
            }
            var $temp93;
            for(k$4=0,$temp93=seq.length - 2;k$4<=$temp93;k$4++) {
               A$3 = seq[k$4];
               B$1 = seq[k$4 + 1];
               len$2 = A$3.top$1.distanceTo(B$1.top$1);
               u$3 = 0;
               while (u$3 < 1) {
                  pt = V3(0,0,0).lerpVectors(A$3.top$1,B$1.top$1,u$3).addScaledVector(A$3.lat.clone().lerp(B$1.lat,u$3),sd);
                  pt.y -= 0.012 * len$2 * 4 * u$3 * (1 - u$3);
                  lf.path.push(pt);
                  u$3 += 0.125;
               }
            }
            E$1 = seq[seq.length - 1];
            lf.path.push(E$1.top$1.clone().addScaledVector(E$1.lat,sd));
         }
         lf.path.push(lf.path[0].clone());
         var $temp94;
         for(k$4=0,$temp94=lf.path.length - 2;k$4<=$temp94;k$4++) {
            cable.push(lf.path[k$4].x);
            cable.push(lf.path[k$4].y + 0.02);
            cable.push(lf.path[k$4].z);
            cable.push(lf.path[k$4 + 1].x);
            cable.push(lf.path[k$4 + 1].y + 0.02);
            cable.push(lf.path[k$4 + 1].z);
         }
         lf.cum = [0];
         var $temp95;
         for(k$4=1,$temp95=lf.path.length;k$4<$temp95;k$4++) {
            lf.cum.push(lf.cum[k$4 - 1] + lf.path[k$4].distanceTo(lf.path[k$4 - 1]));
         }
      }
      ao$1 = new THREE.InstancedMesh(AO_GEO,MakeAOMaterial(),Self.obst.length);
      nv = V3(0,0,0);
      qa = new THREE.Quaternion();
      var $temp96;
      for(i$6=0,$temp96=Self.obst.length;i$6<$temp96;i$6++) {
         o$1 = Self.obst[i$6];
         TCourse.normal$1(c$7,o$1.x$1,o$1.z$1,nv);
         qa.setFromUnitVectors(up$5,nv);
         r$7 = (o$1.r < 1)?3.2:o$1.r * 2.9;
         m$7.compose(p$7.set(o$1.x$1,TCourse.height$4(c$7,o$1.x$1,o$1.z$1) + 0.08,o$1.z$1),qa,new THREE.Vector3(r$7,1,r$7));
         ao$1.setMatrixAt(i$6,m$7);
      }
      ao$1.instanceMatrix.needsUpdate = true;
      ao$1.computeBoundingSphere();
      scene$1.add(ao$1);
      pyl = TResort.Mk(Self,MakePylon(),pylons.length);
      var $temp97;
      for(i$6=0,$temp97=pylons.length;i$6<$temp97;i$6++) {
         pyl.setMatrixAt(i$6,pylons[i$6]);
      }
      pyl.count = pylons.length;
      pyl.instanceMatrix.needsUpdate = true;
      pyl.computeBoundingSphere();
      sta = TResort.Mk(Self,MakeStation(),stations.length);
      var $temp98;
      for(i$6=0,$temp98=stations.length;i$6<$temp98;i$6++) {
         sta.setMatrixAt(i$6,stations[i$6]);
      }
      sta.count = stations.length;
      sta.instanceMatrix.needsUpdate = true;
      sta.computeBoundingSphere();
      cg = new THREE.BufferGeometry();
      cg.setAttribute("position",new THREE.Float32BufferAttribute(cable,3));
      scene$1.add(new THREE.LineSegments(cg,new THREE.LineBasicMaterial({
         "color" : 2303790
      })));
      Self.chairSp = 15;
      nc = 0;
      a$183 = Self.lifts;
      var $temp99;
      for(a$182=0,$temp99=a$183.length;a$182<$temp99;a$182++) {
         lf$1 = a$183[a$182];
         nc+=Floor(lf$1.cum[lf$1.cum.length - 1] / Self.chairSp);
      }
      Self.chairs = TResort.Mk(Self,MakeChair(),nc);
      Self.chairs.frustumCulled = false;
      Self.chairs.castShadow = false;
      Self.chairs.count = nc;
      Self._m$1 = m$7;
      Self._q$1 = q$2;
      Self._p$1 = p$7;
      Self._x = V3(0,0,0);
      Self._y = up$5;
      Self._z = V3(0,0,0);
      Self._a = V3(0,0,0);
      TResort.Update$1(Self,0);
      return Self
   }
   /// function TResort.Hit(x: Float; z: Float; rad: Float) : Boolean
   ,Hit:function(Self, x$18, z$13, rad) {
      var Result = false;
      var dx$1 = 0,
         dz = 0,
         rr$2 = 0,
         a$190 = 0,
         o$1 = null,
         a$191 = [];
      a$191 = Self.obst;
      var $temp100;
      for(a$190=0,$temp100=a$191.length;a$190<$temp100;a$190++) {
         o$1 = a$191[a$190];
         if (Abs$_Float_(o$1.z$1 - z$13) > 12) {
            continue;
         }
         dx$1 = x$18 - o$1.x$1;
         dz = z$13 - o$1.z$1;
         rr$2 = o$1.r + rad;
         if (dx$1*dx$1 + dz*dz < rr$2*rr$2) {
            return true;
         }
      }
      Result = false;
      return Result
   }
   /// function TResort.Mk(geo: JBufferGeometry; count: Integer) : JInstancedMesh
   ,Mk:function(Self, geo, count$2) {
      var Result = null;
      if (!Self.FMat) {
         Self.FMat = new THREE.MeshStandardMaterial({
            "vertexColors" : true
            ,"roughness" : 0.85
         });
      }
      Result = new THREE.InstancedMesh(geo,Self.FMat,Max$_Integer_Integer_(count$2,1));
      Result.castShadow = true;
      Result.receiveShadow = true;
      Result.count = 0;
      Self.FScene$1.add(Result);
      return Result
   }
   /// function TResort.Pick(list: array of Integer) : Integer
   ,Pick:function(Self, list$1) {
      var Result = 0;
      Result = list$1[Trunc(TRNG.Next(Self.FRng) * list$1.length)];
      return Result
   }
   /// function TResort.TryHouse(x: Float; z: Float; typ: Integer; rot: Float) : Boolean
   ,TryHouse:function(Self, x$18, z$13, typ$2, rot$2) {
      var Result = false;
      var sx = 0,
         sz$1 = 0,
         c$7 = null,
         h$3 = null;
      c$7 = Self.course$2;
      sx = (TCourse.height$4(c$7,x$18 + 4,z$13) - TCourse.height$4(c$7,x$18 - 4,z$13)) / 8;
      sz$1 = (TCourse.height$4(c$7,x$18,z$13 + 4) - TCourse.height$4(c$7,x$18,z$13 - 4)) / 8;
      if (Math.hypot(sx,sz$1) > 0.42 || TResort.Blocked(Self,x$18,z$13,7,false)) {
         return false;
      }
      h$3 = TObject.Create($New(THouse));
      h$3.typ = typ$2;
      h$3.x = x$18;
      h$3.z = z$13;
      h$3.rot = rot$2;
      Self.FHouses.push(h$3);
      Self.obst.push(TCircle.Create$69($New(TCircle),x$18,z$13,RADII[typ$2]));
      Result = true;
      return Result
   }
   /// procedure TResort.Update(dt: Float)
   ,Update$1:function(Self, dt) {
      var i$6 = 0,
         n$7 = 0,
         k$4 = 0,
         ci = 0,
         tot = 0,
         s$12 = 0,
         u$3 = 0,
         dd = 0,
         a$192 = 0,
         lf = null,
         P = [],
         cum$1 = [],
         a$193 = [];
      Self.t += dt;
      i$6 = 0;
      a$193 = Self.lifts;
      var $temp101;
      for(a$192=0,$temp101=a$193.length;a$192<$temp101;a$192++) {
         lf = a$193[a$192];
         P = lf.path;
         cum$1 = lf.cum;
         tot = cum$1[cum$1.length - 1];
         n$7 = Floor(tot / Self.chairSp);
         k$4 = 0;
         var $temp102;
         for(ci=0,$temp102=n$7;ci<$temp102;ci++) {
            s$12 = FMod(ci * Self.chairSp + Self.t * 2.3,tot);
            while (k$4 > 0 && cum$1[k$4] > s$12) {
               --k$4            }
            while (k$4 < cum$1.length - 2 && cum$1[k$4 + 1] < s$12) {
               ++k$4            }
            dd = cum$1[k$4 + 1] - cum$1[k$4];
            if (dd == 0) {
               dd = 1;
            }
            u$3 = (s$12 - cum$1[k$4]) / dd;
            Self._a.lerpVectors(P[k$4],P[k$4 + 1],u$3);
            Self._z.subVectors(P[k$4 + 1],P[k$4]).setY(0).normalize();
            Self._x.crossVectors(Self._y,Self._z);
            Self._m$1.makeBasis(Self._x,Self._y,Self._z).setPosition(Self._a);
            Self.chairs.setMatrixAt(i$6,Self._m$1);
            ++i$6;
         }
      }
      Self.chairs.instanceMatrix.needsUpdate = true;
   }
   /// procedure TResort.UpdateVisibility(z0: Float; z1: Float)
   ,UpdateVisibility:function(Self, z0, z1) {
      var key$2 = "",
         zero = null,
         a$194 = 0,
         h$3 = null,
         a$195 = 0,
         im$1 = null,
         a$196 = [],
         a$197 = [];
      key$2 = FloatToStr$_Float_(JsRound(z0 / 32))+":"+FloatToStr$_Float_(JsRound(z1 / 32));
      if (key$2 == Self.visKey) {
         return;
      }
      Self.visKey = key$2;
      zero = new THREE.Matrix4().makeScale(0,0,0);
      a$196 = Self.FHouses;
      var $temp103;
      for(a$194=0,$temp103=a$196.length;a$194<$temp103;a$194++) {
         h$3 = a$196[a$194];
         h$3.im.setMatrixAt(h$3.idx,(h$3.z > z0 && h$3.z < z1)?h$3.m:zero);
      }
      a$197 = Self.houseMeshes;
      var $temp104;
      for(a$195=0,$temp104=a$197.length;a$195<$temp104;a$195++) {
         im$1 = a$197[a$195];
         im$1.instanceMatrix.needsUpdate = true;
      }
   }
   /// procedure TResort.Village(x0: Float; z0: Float; R: Float; count: Integer; types: array of Integer)
   ,Village:function(Self, x0, z0, R$1, count$2, types) {
      var t$11 = 0,
         i$6 = 0,
         n$7 = 0,
         a$110 = 0,
         rr$2 = 0;
      Self.clearings.push(TCircle.Create$69($New(TCircle),x0,z0,R$1 + 25));
      t$11 = 0;
      while (t$11 < 14 && (!(TResort.TryHouse(Self,x0 + (TRNG.Next(Self.FRng) - 0.5) * t$11 * 8,z0 + (TRNG.Next(Self.FRng) - 0.5) * t$11 * 8,3,(TRNG.Next(Self.FRng) - 0.5) * 0.4 + 1.5707963267949)))) {
         ++t$11      }
      i$6 = 0;
      n$7 = 0;
      while (i$6 < count$2 * 5 && n$7 < count$2) {
         a$110 = TRNG.Next(Self.FRng) * 6.28318530717959;
         rr$2 = 24 + Sqrt(TRNG.Next(Self.FRng)) * (R$1 - 24);
         if (TResort.TryHouse(Self,x0 + Cos(a$110) * rr$2,z0 + Sin(a$110) * rr$2,TResort.Pick(Self,types),(TRNG.Next(Self.FRng) - 0.5) * 0.5 + ((TRNG.Next(Self.FRng) < 0.3)?1.5707963267949:0))) {
            ++n$7;
         }
         ++i$6;
      }
   }
   ,Destroy:TObject.Destroy
};
/// TLiftNode = class (TObject)
var TLiftNode = {
   $ClassName:"TLiftNode",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.g = $.h = 0;
      $.lat = $.p = $.top$1 = null;
      $.st = false;
   }
   ,Destroy:TObject.Destroy
};
/// TLift = class (TObject)
var TLift = {
   $ClassName:"TLift",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.cum = [];
      $.nodes = [];
      $.path = [];
      $.side = 0;
   }
   ,Destroy:TObject.Destroy
};
/// THouse = class (TObject)
var THouse = {
   $ClassName:"THouse",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.idx = $.typ = 0;
      $.im = $.m = null;
      $.rot = $.x = $.z = 0;
   }
   ,Destroy:TObject.Destroy
};
/// TCircle = class (TObject)
var TCircle = {
   $ClassName:"TCircle",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.r = $.x$1 = $.z$1 = 0;
   }
   /// constructor TCircle.Create(ax: Float; az: Float; ar: Float)
   ,Create$69:function(Self, ax$3, az, ar) {
      Self.x$1 = ax$3;
      Self.z$1 = az;
      Self.r = ar;
      return Self
   }
   ,Destroy:TObject.Destroy
};
/// TChunk = class (TObject)
var TChunk = {
   $ClassName:"TChunk",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.ao = $.center = $.H = $.hi = $.lo = $.mesh = $.net = $.poles = $.rocks = $.tr = $.tx = $.tz = $.X = null;
      $.idx$1 = $.tn = 0;
   }
   ,Destroy:TObject.Destroy
};
function V3(x$18, y$13, z$13) {
   var Result = null;
   Result = new THREE.Vector3(x$18,y$13,z$13);
   return Result
}
var RADII = [5.6,4.6,10,12,11,10,3.5,6.2];
/// TSnowfall = class (TObject)
var TSnowfall = {
   $ClassName:"TSnowfall",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.mat = $.points = null;
   }
   /// constructor TSnowfall.Create(scene: JScene; count: Integer = 2200)
   ,Create$151:function(Self, scene$1, count$2) {
      var g$8 = null,
         p$7 = null,
         r$7 = null,
         unis;
      g$8 = new THREE.BufferGeometry();
      p$7 = new Float32Array(count$2 * 3);
      r$7 = new Float32Array(count$2);
      for(let i$6=0,$temp105=count$2;i$6<$temp105;i$6++) {
         p$7[(i$6 * 3)]=(Random() * 60);
         p$7[(i$6 * 3 + 1)]=(Random() * 30);
         p$7[(i$6 * 3 + 2)]=(Random() * 60);
         r$7[i$6]=Random();
      }
      g$8.setAttribute("position",new THREE.BufferAttribute(p$7,3));
      g$8.setAttribute("rnd",new THREE.BufferAttribute(r$7,1));
      unis = {};
      unis.uTime = SHARED.time;
      unis.uCam = Uniform(new THREE.Vector3());
      unis.uBox = Uniform(new THREE.Vector3(60,30,60));
      unis.uWind = Uniform(1);
      unis.uAmt = Uniform(1);
      Self.mat = new THREE.ShaderMaterial({
         "vertexShader" : "uniform float uTime; uniform vec3 uCam; uniform vec3 uBox; uniform float uWind; attribute float rnd; varying float vA;\r\n        void main(){ vec3 box = uBox;\r\n          vec3 p = position + vec3(sin(uTime*0.7+rnd*20.0)*0.8 + uTime*1.2*uWind, -uTime*(1.2+rnd*0.8)*(0.7+0.3*uWind), uTime*0.4*uWind);\r\n          p = mod(p - uCam + box*0.5, box) + uCam - box*0.5;   \/\/ Volumen wandert mit der Kamera (keine CPU-Kosten)\r\n          vec4 mv = modelViewMatrix * vec4(p,1.0); gl_PointSize = min((14.0 + rnd*16.0) \/ -mv.z, 7.0); vA = smoothstep(55.0, 8.0, -mv.z) * smoothstep(1.5, 4.0, -mv.z);\r\n          gl_Position = projectionMatrix * mv; }"
         ,"uniforms" : unis
         ,"transparent" : true
         ,"fragmentShader" : "uniform float uAmt; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.1, length(d)); gl_FragColor = vec4(vec3(1.0), a*vA*0.8*uAmt); }"
         ,"depthWrite" : false
      });
      Self.points = new THREE.Points(g$8,Self.mat);
      Self.points.frustumCulled = false;
      scene$1.add(Self.points);
      return Self
   }
   /// procedure TSnowfall.SetStorm(on: Boolean)
   ,SetStorm:function(Self, on$9) {
      var u$3;
      u$3 = Self.mat.uniforms;
      if (on$9) {
         u$3.uBox.value.set(30,20,30);
      } else {
         u$3.uBox.value.set(60,30,60);
      }
      u$3.uWind.value = (on$9)?3.2:1;
      u$3.uAmt.value = (on$9)?1.15:1;
   }
   /// procedure TSnowfall.Update(cam: JVector3)
   ,Update$4:function(Self, cam$1) {
      Self.mat.uniforms.uCam.value.copy(cam$1);
   }
   ,Destroy:TObject.Destroy
};
/// TRange = class (TObject)
var TRange = {
   $ClassName:"TRange",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.depth$2 = $.h0 = $.h1 = $.haze = $.R = 0;
      $.n$5 = 0;
      $.peaks = [];
   }
   ,Destroy:TObject.Destroy
};
/// TPeak = class (TObject)
var TPeak = {
   $ClassName:"TPeak",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.a$98 = $.dr = $.H$4 = $.s$10 = $.w$4 = 0;
   }
   ,Destroy:TObject.Destroy
};
/// TMountains = class (TObject)
var TMountains = {
   $ClassName:"TMountains",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.fade = $.fadeCol = $.shear = undefined;
      $.mesh$1 = null;
   }
   /// constructor TMountains.Create(scene: JScene)
   ,Create$152:function(Self, scene$1) {
      var i$6 = 0,
         j = 0,
         l$1 = 0,
         k$4 = 0,
         best = 0,
         i1 = 0,
         a0 = 0,
         a1 = 0,
         b0 = 0,
         b1 = 0,
         HH = 0,
         rr$2 = 0,
         a$110 = 0,
         floorH = 0,
         fd = 0,
         h$3 = 0,
         across = 0,
         hl = 0,
         da = 0,
         dr$1 = 0,
         d$8 = 0,
         th$1 = 0,
         spur = 0,
         tt$1 = 0,
         hm = 0,
         x$18 = 0,
         y$13 = 0,
         z$13 = 0,
         ny$2 = 0,
         n$7 = 0,
         s$12 = 0,
         rng = null,
         ranges = [],
         a$198 = 0,
         LR = null,
         P = null,
         pos$5 = [],
         rangeOf = [],
         idx$2 = [],
         LR$1 = null,
         a$199 = 0,
         P$1 = null,
         g$8 = null,
         PA = null,
         Nn = null,
         col$5 = null,
         rock = null,
         snow$1 = null,
         forest$1 = null,
         haze$1 = null,
         c$7 = null,
         mat$3 = null,
         ush,
         ufd,
         ufc;
      rng = TRNG.Create$72($New(TRNG),777);
      ranges = [MkRange(1700,520,22,340,760,0.14), MkRange(2450,680,16,650,1300,0.34), MkRange(3300,820,12,950,1800,0.52)];
      var $temp106;
      for(a$198=0,$temp106=ranges.length;a$198<$temp106;a$198++) {
         LR = ranges[a$198];
         var $temp107;
         for(i$6=0,$temp107=LR.n$5;i$6<$temp107;i$6++) {
            HH = Lerp(LR.h0,LR.h1,Power(TRNG.Next(rng),1.4));
            P = TObject.Create($New(TPeak));
            P.a$98 = (i$6 + TRNG.Next(rng) * 0.7) / LR.n$5 * 6.28318530717959;
            P.H$4 = HH;
            P.w$4 = HH * (0.95 + TRNG.Next(rng) * 0.5);
            P.dr = (TRNG.Next(rng) - 0.5) * LR.depth$2 * 0.5;
            P.s$10 = TRNG.Next(rng) * 50;
            LR.peaks.push(P);
         }
      }
      for(j=0;j<=140;j++) {
         rr$2 = 450 + 3650 * Power(j / 140,1.15);
         for(i$6=0;i$6<=719;i$6++) {
            a$110 = i$6 / 720 * 6.28318530717959;
            floorH = -30 + Fbm(a$110 * 18,rr$2 * 0.004,3) * 28;
            fd = Smoothstep(550,1350,rr$2);
            h$3 = floorH;
            best = -1;
            var $temp108;
            for(l$1=0,$temp108=ranges.length;l$1<$temp108;l$1++) {
               var a$200 = [];
               LR$1 = ranges[l$1];
               across = Abs$_Float_(rr$2 - LR$1.R) / LR$1.depth$2;
               if (across < 1) {
                  hl = LR$1.h0 * 0.42 * (0.75 + 0.25 * Fbm(a$110 * 6 + l$1 * 3,l$1,2)) * Power(1 - across,1.25);
               } else {
                  hl = 0;
               }
               a$200 = LR$1.peaks;
               var $temp109;
               for(a$199=0,$temp109=a$200.length;a$199<$temp109;a$199++) {
                  P$1 = a$200[a$199];
                  da = AngDiff(a$110,P$1.a$98) * LR$1.R;
                  if (Abs$_Float_(da) > P$1.w$4 * 1.4) {
                     continue;
                  }
                  dr$1 = rr$2 - (LR$1.R + P$1.dr);
                  d$8 = Math.hypot(da,dr$1 * 1.25);
                  if (d$8 > P$1.w$4 * 1.4) {
                     continue;
                  }
                  th$1 = ArcTan2(dr$1,da);
                  spur = 1 - 0.3 * Abs$_Float_(VNoise(th$1 * 1.9 + P$1.s$10,P$1.s$10));
                  tt$1 = 1 - d$8 * spur / P$1.w$4;
                  if (tt$1 > 0) {
                     hl = Max$_Float_Float_(hl,P$1.H$4 * Power(tt$1,1.15));
                  }
               }
               if (hl > 0) {
                  hl += Fbm(a$110 * 40 + l$1 * 11,rr$2 * 0.006,3) * hl * 0.02;
                  hm = Lerp(floorH,-60 + hl,fd);
                  if (hm > h$3) {
                     h$3 = hm;
                     best = l$1;
                  }
               }
            }
            if (!j) {
               h$3 = -260;
            }
            pos$5.push(Cos(a$110) * rr$2);
            pos$5.push(h$3);
            pos$5.push(Sin(a$110) * rr$2);
            rangeOf.push(best);
         }
      }
      for(j=0;j<=139;j++) {
         for(i$6=0;i$6<=719;i$6++) {
            i1 = (i$6 + 1) % 720;
            a0 = j * 720 + i$6;
            a1 = j * 720 + i1;
            b0 = a0 + 720;
            b1 = a1 + 720;
            idx$2.push(a0);
            idx$2.push(a1);
            idx$2.push(b0);
            idx$2.push(a1);
            idx$2.push(b1);
            idx$2.push(b0);
         }
      }
      g$8 = new THREE.BufferGeometry();
      g$8.setAttribute("position",new THREE.Float32BufferAttribute(pos$5,3));
      g$8.setIndex(idx$2);
      g$8.computeVertexNormals();
      PA = g$8.attributes.position;
      Nn = g$8.attributes.normal;
      col$5 = new Float32Array(PA.count * 3);
      rock = new THREE.Color(5135730);
      snow$1 = new THREE.Color(15988733);
      forest$1 = new THREE.Color(3032400);
      haze$1 = new THREE.Color(12045284);
      c$7 = new THREE.Color();
      var $temp110;
      for(k$4=0,$temp110=PA.count;k$4<$temp110;k$4++) {
         x$18 = PA.getX(k$4);
         y$13 = PA.getY(k$4) + 60;
         z$13 = PA.getZ(k$4);
         ny$2 = Nn.getY(k$4);
         l$1 = rangeOf[k$4];
         n$7 = Fbm(x$18 * 0.008 + y$13 * 0.012,z$13 * 0.008 - y$13 * 0.009,3);
         s$12 = Smoothstep(0.5,0.74,ny$2 + n$7 * 0.12 + y$13 * 8E-5);
         c$7.copy(rock).lerp(snow$1,s$12);
         if (l$1 < 2) {
            c$7.lerp(forest$1,Smoothstep(200,80,y$13 + n$7 * 70) * Smoothstep(0.55,0.8,ny$2) * Smoothstep(-0.15,0.2,Fbm(x$18 * 0.004 + 3,z$13 * 0.004,3)) * 0.9);
         }
         c$7.lerp(haze$1,(l$1 < 0)?0.16:ranges[l$1].haze);
         col$5[(k$4 * 3)]=c$7.r;
         col$5[(k$4 * 3 + 1)]=c$7.g;
         col$5[(k$4 * 3 + 2)]=c$7.b;
      }
      g$8.setAttribute("color",new THREE.BufferAttribute(col$5,3));
      mat$3 = new THREE.MeshStandardMaterial({
         "vertexColors" : true
         ,"roughness" : 0.95
         ,"fog" : false
      });
      Self.shear = Uniform(0);
      Self.fade = Uniform(0);
      Self.fadeCol = Uniform(new THREE.Color());
      ush = Self.shear;
      ufd = Self.fade;
      ufc = Self.fadeCol;
      mat$3.onBeforeCompile = function (sh$1) {
         sh$1.uniforms.uShear = ush;
         sh$1.uniforms.uFade = ufd;
         sh$1.uniforms.uFadeCol = ufc;
         sh$1.vertexShader = JsReplace(JsReplace(String(sh$1.vertexShader),"#include <common>","#include <common>\nuniform float uShear;"),"#include <begin_vertex>","#include <begin_vertex>\ntransformed.y += uShear * transformed.z;");
         sh$1.fragmentShader = JsReplace(JsReplace(String(sh$1.fragmentShader),"#include <common>","#include <common>\nuniform float uFade; uniform vec3 uFadeCol;"),"#include <dithering_fragment>","#include <dithering_fragment>\ngl_FragColor.rgb = mix(gl_FragColor.rgb, uFadeCol, uFade);");
      };
      Self.mesh$1 = new THREE.Mesh(g$8,mat$3);
      Self.mesh$1.frustumCulled = false;
      scene$1.add(Self.mesh$1);
      return Self
   }
   /// procedure TMountains.SetFade(f: Float; col: JColor)
   ,SetFade:function(Self, f$7, col$5) {
      Self.fade.value = f$7;
      Self.fadeCol.value.copy(col$5);
      Self.mesh$1.visible = f$7 < 0.99;
   }
   /// procedure TMountains.Update(camPos: JVector3; riderY: Float; grade: Float = 0)
   ,Update$5:function(Self, camPos, riderY, grade$1) {
      Self.mesh$1.position.set(camPos.x,riderY - 40,camPos.z);
      Self.shear.value = grade$1;
   }
   ,Destroy:TObject.Destroy
};
function MakeGate(scene$1, course$9, z$13, text, bg) {
   var Result = null;
   var W = 0,
      cz$1 = 0,
      y$10 = 0,
      grp = null,
      postMat = null,
      a$101 = 0,
      s$12 = 0,
      post = null,
      banner = null,
      a$100 = [0,0];
   grp = new THREE.Group();
   W = TCourse.width$4(course$9,z$13);
   cz$1 = TCourse.cx(course$9,z$13);
   y$10 = TCourse.height$4(course$9,cz$1,z$13);
   postMat = new THREE.MeshStandardMaterial({
      "roughness" : 0.5
      ,"metalness" : 0.3
      ,"color" : 1779256
   });
   a$100 = [-1, 1];
   for(a$101=0;a$101<=1;a$101++) {
      s$12 = a$100[a$101];
      post = new THREE.Mesh(new THREE.BoxGeometry(0.6,6.5,0.6),postMat);
      post.position.set(cz$1 + s$12 * (W + 1.2),TCourse.height$4(course$9,cz$1 + s$12 * (W + 1.2),z$13) + 3.25,z$13);
      post.castShadow = true;
      grp.add(post);
   }
   banner = new THREE.Mesh(new THREE.PlaneGeometry(2 * W + 2.4,1.6,1,1),new THREE.MeshStandardMaterial({
      "side" : 2
      ,"roughness" : 0.7
      ,"map" : MakeBannerTex(text,bg)
   }));
   banner.position.set(cz$1,y$10 + 5.8,z$13);
   banner.castShadow = true;
   grp.add(banner);
   scene$1.add(grp);
   Result = grp;
   return Result
}
function MkRange(R$1, depth$4, n$7, h0$1, h1$1, haze$1) {
   var Result = null;
   Result = TObject.Create($New(TRange));
   Result.R = R$1;
   Result.depth$2 = depth$4;
   Result.n$5 = n$7;
   Result.h0 = h0$1;
   Result.h1 = h1$1;
   Result.haze = haze$1;
   return Result
}
function AngDiff(a$110, b$8) {
   var Result = 0;
   var d$4 = 0;
   d$4 = a$110 - b$8;
   d$4 -= JsRound(d$4 / 6.28318530717959) * 6.28318530717959;
   Result = d$4;
   return Result
}
/// TTouchState = class (TObject)
var TTouchState = {
   $ClassName:"TTouchState",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.active$3 = $.grab$3 = $.jump$1 = false;
      $.x$14 = $.y$11 = 0;
   }
   ,Destroy:TObject.Destroy
};
/// TInput = class (TControls)
var TInput = {
   $ClassName:"TInput",$Parent:TControls
   ,$Init:function ($) {
      TControls.$Init($);
      $.analog = $.FPadPrev3 = $.FPadPrev9 = $.pressedCamera = $.pressedPause = false;
      $.FKeys = undefined;
      $.touch = null;
   }
   /// function TInput.Consume(name: String) : Boolean
   ,Consume:function(Self, name$8) {
      var Result = false;
      if (name$8 == "camera") {
         Result = Self.pressedCamera;
         Self.pressedCamera = false;
      } else {
         Result = Self.pressedPause;
         Self.pressedPause = false;
      }
      return Result
   }
   /// constructor TInput.Create()
   ,Create$156:function(Self) {
      Self.FKeys = NewDict();
      Self.touch = TObject.Create($New(TTouchState));
      TInput.InitTouch(Self);
      window.addEventListener("keydown",function (e$1) {
         var c$7 = "";
         c$7 = e$1.code;
         if (c$7 == "ArrowLeft" || c$7 == "ArrowRight" || c$7 == "ArrowUp" || c$7 == "ArrowDown" || c$7 == "Space") {
            e$1.preventDefault();
         }
         if (!(e$1.repeat)) {
            if (c$7 == "KeyC") {
               Self.pressedCamera = true;
            }
            if (c$7 == "KeyP" || c$7 == "Escape") {
               Self.pressedPause = true;
            }
         }
         VSet(Self.FKeys,c$7,true);
      });
      window.addEventListener("keyup",function (e$1) {
         VSet(Self.FKeys,e$1.code,false);
      });
      window.addEventListener("blur",function (e$1) {
         Self.FKeys = NewDict();
      });
      return Self
   }
   /// procedure TInput.InitTouch()
   ,InitTouch:function(Self) {
      var padId = 0,
         hasPad = false,
         capOpt,
         pad = null,
         knob = null,
         T$1 = null,
         ar = [],
         move = null,
         endProc = null,
         capture = null,
         btn = null;
      if (window.matchMedia("(pointer: coarse)").matches) {
         document.body.classList.add("touch");
      }
      capOpt = {};
      capOpt.capture = true;
      window.addEventListener("pointerdown",function (e$1) {
         if (e$1.pointerType == "touch") {
            document.body.classList.add("touch");
         }
      },capOpt);
      pad = El("tPad");
      knob = El("tKnob");
      T$1 = Self.touch;
      ar = [pad.querySelector(".u"), pad.querySelector(".d"), pad.querySelector(".l"), pad.querySelector(".r")];
      hasPad = false;
      padId = 0;
      move = function (e$1) {
         var b$8 = null,
            R$1 = 0,
            dx$1 = 0,
            dy$1 = 0,
            l$1 = 0;
         b$8 = pad.getBoundingClientRect();
         R$1 = b$8.width / 2;
         dx$1 = (e$1.clientX - b$8.left - R$1) / R$1;
         dy$1 = (e$1.clientY - b$8.top - R$1) / R$1;
         l$1 = Math.hypot(dx$1,dy$1);
         if (l$1 > 1) {
            dx$1 /= l$1;
            dy$1 /= l$1;
         }
         T$1.x$14 = dx$1;
         T$1.y$11 = dy$1;
         knob.style.transform = "translate("+NumStr(dx$1 * R$1 * 0.58)+"px,"+NumStr(dy$1 * R$1 * 0.58)+"px)";
         ar[0].classList.toggle("on",dy$1 < -0.45);
         ar[1].classList.toggle("on",dy$1 > 0.45);
         ar[2].classList.toggle("on",dx$1 < -0.15);
         ar[3].classList.toggle("on",dx$1 > 0.15);
      };
      endProc = function (e$1) {
         var a$201 = 0,
            a$110 = null;
         if ((!(hasPad)) || e$1.pointerId != padId) {
            return;
         }
         hasPad = false;
         T$1.active$3 = false;
         T$1.x$14 = 0;
         T$1.y$11 = 0;
         knob.style.transform = "";
         var $temp111;
         for(a$201=0,$temp111=ar.length;a$201<$temp111;a$201++) {
            a$110 = ar[a$201];
            a$110.classList.remove("on");
         }
      };
      capture = function (el$2, e$1) {
         try {
            el$2.setPointerCapture(e$1.pointerId);
         } catch ($e) {
            /* null */
         }
      };
      pad.addEventListener("pointerdown",function (e$1) {
         e$1.preventDefault();
         padId = e$1.pointerId;
         hasPad = true;
         T$1.active$3 = true;
         move(e$1);
         capture(pad,e$1);
      });
      pad.addEventListener("pointermove",function (e$1) {
         if (hasPad && e$1.pointerId == padId) {
            move(e$1);
         }
      });
      pad.addEventListener("pointerup",endProc);
      pad.addEventListener("pointercancel",endProc);
      btn = function (b$8, down, up$5) {
         var rel = null;
         b$8.addEventListener("pointerdown",function (e$1) {
            e$1.preventDefault();
            b$8.classList.add((up$5)?"on":"tap");
            down();
            capture(b$8,e$1);
         });
         rel = function (e$1) {
            b$8.classList.remove("on");
            b$8.classList.remove("tap");
            if (up$5) {
               up$5();
            }
         };
         b$8.addEventListener("pointerup",rel);
         b$8.addEventListener("pointercancel",rel);
      };
      btn(El("tJump"),function () {
         T$1.jump$1 = true;
      },function () {
         T$1.jump$1 = false;
      });
      btn(El("tGrab"),function () {
         T$1.grab$3 = true;
      },function () {
         T$1.grab$3 = false;
      });
      btn(El("tCam"),function () {
         Self.pressedCamera = true;
      },null);
      btn(El("tPause"),function () {
         Self.pressedPause = true;
      },null);
      window.addEventListener("contextmenu",function (e$1) {
         if (document.body.classList.contains("touch")) {
            e$1.preventDefault();
         }
      });
   }
   /// function TInput.Key(code: String) : Boolean
   ,Key:function(Self, code$2) {
      var Result = false;
      Result = Truthy(VGet(Self.FKeys,code$2));
      return Result
   }
   /// procedure TInput.Update(dt: Float)
   ,Update$7:function(Self, dt) {
      var st$3 = 0,
         tu = 0,
         br = 0,
         ax$3 = 0,
         rise = 0,
         ju = false,
         gr$1 = false,
         an = false,
         T$1 = null,
         pads = [],
         a$202 = 0,
         p$7 = null;
      st$3 = ((TInput.Key(Self,"KeyD") || TInput.Key(Self,"ArrowRight"))?1:0) - ((TInput.Key(Self,"KeyA") || TInput.Key(Self,"ArrowLeft"))?1:0);
      tu = (TInput.Key(Self,"KeyW") || TInput.Key(Self,"ArrowUp"))?1:0;
      br = (TInput.Key(Self,"KeyS") || TInput.Key(Self,"ArrowDown"))?1:0;
      ju = TInput.Key(Self,"Space");
      gr$1 = TInput.Key(Self,"KeyE") || TInput.Key(Self,"ShiftLeft") || TInput.Key(Self,"ShiftRight");
      an = false;
      T$1 = Self.touch;
      if (T$1.active$3) {
         ax$3 = Abs$_Float_(T$1.x$14);
         if (ax$3 > 0.15) {
            st$3 = SignF(T$1.x$14) * Min$_Float_Float_(1,Power((ax$3 - 0.15) / 0.65,1.2));
            an = true;
         }
         if (T$1.y$11 < -0.45) {
            tu = 1;
         }
         if (T$1.y$11 > 0.45) {
            br = 1;
         }
      }
      if (T$1.jump$1) {
         ju = true;
      }
      if (T$1.grab$3) {
         gr$1 = true;
      }
      pads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
      var $temp112;
      for(a$202=0,$temp112=pads.length;a$202<$temp112;a$202++) {
         p$7 = pads[a$202];
         if (!(Truthy(p$7))) {
            continue;
         }
         ax$3 = 0;
         if (p$7.axes.length > 0) {
            ax$3 = p$7.axes[0];
         }
         if (Abs$_Float_(ax$3) > 0.12) {
            st$3 = SignF(ax$3) * Power((Abs$_Float_(ax$3) - 0.12) / 0.88,1.4);
            an = true;
         }
         tu = Max$_Float_Float_(tu,PadButton(p$7,7));
         br = Max$_Float_Float_(br,PadButton(p$7,6));
         if (PadButton(p$7,0) > 0.5) {
            ju = true;
         }
         if (PadButton(p$7,2) > 0.5 || PadButton(p$7,5) > 0.5) {
            gr$1 = true;
         }
         if (PadButton(p$7,3) > 0.5 && (!(Self.FPadPrev3))) {
            Self.pressedCamera = true;
         }
         if (PadButton(p$7,9) > 0.5 && (!(Self.FPadPrev9))) {
            Self.pressedPause = true;
         }
         Self.FPadPrev3 = PadButton(p$7,3) > 0.5;
         Self.FPadPrev9 = PadButton(p$7,9) > 0.5;
         break;
      }
      if (an) {
         rise = 18;
      } else if (Abs$_Float_(st$3) > Abs$_Float_(Self.steer) && SignF(st$3) == SignF((Self.steer != 0)?Self.steer:st$3)) {
         rise = 4.2;
      } else {
         rise = 7.5;
      }
      Self.steer = Damp(Self.steer,st$3,rise,dt);
      Self.tuck = Damp(Self.tuck,tu,6,dt);
      Self.brake = Damp(Self.brake,br,8,dt);
      Self.jump = ju;
      Self.grab = gr$1;
      Self.analog = an;
   }
   ,Destroy:TObject.Destroy
};
function PadButton(p$7, i$6) {
   var Result = 0;
   if (i$6 < p$7.buttons.length && Truthy(p$7.buttons[i$6])) {
      Result = p$7.buttons[i$6].value;
   } else {
      Result = 0;
   }
   return Result
}
/// TWind = class (TObject)
var TWind = {
   $ClassName:"TWind",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.filter$1 = $.gain$2 = null;
   }
   ,Destroy:TObject.Destroy
};
/// TMelNote = class (TObject)
var TMelNote = {
   $ClassName:"TMelNote",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.len$1 = $.m$4 = 0;
   }
   ,Destroy:TObject.Destroy
};
/// TLayer = class (TObject)
var TLayer = {
   $ClassName:"TLayer",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.id$3 = $.name$7 = "";
      $.level = $.send = $.th = 0;
      $.node = null;
      $.on$8 = false;
   }
   ,Destroy:TObject.Destroy
};
/// TDownhillMusic = class (TObject)
var TDownhillMusic = {
   $ClassName:"TDownhillMusic",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.boost = $.FI = $.FNextTime = $.FStepDur = $.intensity$1 = 0;
      $.chord = $.ctx = $.FNoiseBuf = $.FReverb = $.master = $.wind = null;
      $.FBar = $.FBpm = $.FDuckBars = $.FLastPitch = $.FPos$1 = $.FStep = $.FTimer = $.FTranspose = 0;
      $.FChordKey = "";
      $.FDice = [];
      $.FFinishPending = $.running = false;
      $.FLayers = [];
      $.FListeners = undefined;
      $.FMelody = [];
      $.FRhythm = [];
   }
   /// function TDownhillMusic.ChordName(ch: TChord) : String
   ,ChordName:function(Self, ch$2) {
      var Result = "";
      Result = NOTE_NAMES[(9 + ch$2.root$1 + Self.FTranspose) % 12];
      if (ch$2.t$7[1] == 3) {
         Result += "m";
      }
      return Result
   }
   /// function TDownhillMusic.ChordTones(ch: TChord) : 
   ,ChordTones:function(Self, ch$2) {
      var Result = [];
      var a$203 = 0,
         x$18 = 0,
         a$204 = [];
      a$204 = ch$2.t$7;
      var $temp113;
      for(a$203=0,$temp113=a$204.length;a$203<$temp113;a$203++) {
         x$18 = a$204[a$203];
         Result.push(ch$2.root$1 + x$18);
      }
      return Result
   }
   /// constructor TDownhillMusic.Create(context: JAudioContext = nil)
   ,Create$155:function(Self, context) {
      Self.ctx = context;
      Self.intensity$1 = 0;
      Self.boost = 0;
      Self.running = false;
      Self.FListeners = NewDict();
      return Self
   }
   /// procedure TDownhillMusic.Cymbal(t: Float; vol: Float)
   ,Cymbal:function(Self, t$11, vol$1) {
      TDownhillMusic.Noise(Self,Self.master,t$11,1.6,vol$1,"highpass",4500,0,0.7);
   }
   /// procedure TDownhillMusic.Emit(ev: String; data: Variant; time: Float)
   ,Emit$1:function(Self, ev, data$2, time$2) {
      var delay = 0,
         list$1;
      list$1 = VGet(Self.FListeners,ev);
      if (!(Truthy(list$1))) {
         return;
      }
      delay = Max$_Float_Float_(0,(time$2 - Self.ctx.currentTime) * 1000);
      setTimeout(function () {
         (list$1).forEach(function (fn) { fn(data$2); });
      },Round(delay));
   }
   /// function TDownhillMusic.Euclid(k: Integer; n: Integer) : 
   ,Euclid:function(Self, k$4, n$7) {
      var Result = [];
      var b$8 = 0,
         i$6 = 0;
      b$8 = n$7 - k$4;
      var $temp114;
      for(i$6=0,$temp114=n$7;i$6<$temp114;i$6++) {
         b$8+=k$4;
         if (b$8 >= n$7) {
            b$8-=n$7;
            Result.push(1);
         } else {
            Result.push(0);
         }
      }
      return Result
   }
   /// function TDownhillMusic.F(m: Float) : Float
   ,F$1:function(Self, m$7) {
      var Result = 0;
      Result = 440 * Power(2,(m$7 - 69) / 12);
      return Result
   }
   /// procedure TDownhillMusic.Fall()
   ,Fall:function(Self) {
      var t$11 = 0,
         a$205 = 0,
         L$3 = null,
         o$1 = null,
         g$8 = null,
         fl$1 = null,
         a$206 = [];
      if (!(Self.running)) {
         return;
      }
      t$11 = Self.ctx.currentTime + 0.01;
      a$206 = Self.FLayers;
      var $temp115;
      for(a$205=0,$temp115=a$206.length;a$205<$temp115;a$205++) {
         L$3 = a$206[a$205];
         if (L$3.id$3 != "pad") {
            L$3.node.gain.setTargetAtTime(0,t$11,0.04);
            L$3.on$8 = false;
         }
      }
      Self.FDuckBars = 1;
      Self.boost = 0;
      o$1 = Self.ctx.createOscillator();
      g$8 = Self.ctx.createGain();
      fl$1 = Self.ctx.createBiquadFilter();
      o$1.type = "sawtooth";
      o$1.frequency.setValueAtTime(520,t$11);
      o$1.frequency.exponentialRampToValueAtTime(55,t$11 + 0.7);
      fl$1.type = "lowpass";
      fl$1.frequency.setValueAtTime(2400,t$11);
      fl$1.frequency.exponentialRampToValueAtTime(200,t$11 + 0.7);
      g$8.gain.setValueAtTime(0.18,t$11);
      g$8.gain.exponentialRampToValueAtTime(0.001,t$11 + 0.8);
      o$1.connect(fl$1);
      fl$1.connect(g$8);
      g$8.connect(Self.master);
      o$1.start(t$11);
      o$1.stop(t$11 + 0.85);
      TDownhillMusic.Noise(Self,Self.master,t$11,0.5,0.3,"lowpass",900,120,0.7);
      TDownhillMusic.Emit$1(Self,"stinger","fall",t$11);
   }
   /// procedure TDownhillMusic.Finale(t: Float)
   ,Finale:function(Self, t$11) {
      var k$4 = 0,
         a$207 = 0,
         L$3 = null,
         tonic = null,
         a$208 = 0,
         iv = 0,
         a$209 = [],
         a$210 = [0,0,0,0,0];
      Self.running = false;
      clearInterval(Self.FTimer);
      k$4 = TDownhillMusic.KeyRoot(Self);
      a$209 = Self.FLayers;
      var $temp116;
      for(a$207=0,$temp116=a$209.length;a$207<$temp116;a$207++) {
         L$3 = a$209[a$207];
         L$3.on$8 = L$3.id$3 == "pad" || L$3.id$3 == "lead" || L$3.id$3 == "bass";
         L$3.node.gain.cancelScheduledValues(t$11);
         L$3.node.gain.setTargetAtTime((L$3.on$8)?L$3.level:0,t$11,0.02);
      }
      tonic = ChordByKey("i");
      Self.chord = tonic;
      TDownhillMusic.Pad(Self,t$11,3.5,1);
      a$210 = [0, 7, 12, 15, 19];
      for(a$208=0;a$208<=4;a$208++) {
         iv = a$210[a$208];
         TDownhillMusic.Tone(Self,TDownhillMusic.Layer(Self,"lead").node,"sawtooth",TDownhillMusic.F$1(Self,k$4 + 12 + iv),t$11,3.2,0.07,0.03,1.2,3000,0,1,0);
      }
      TDownhillMusic.Tone(Self,TDownhillMusic.Layer(Self,"bass").node,"sawtooth",TDownhillMusic.F$1(Self,k$4 - 24),t$11,3,0.5,0.005,1,600,0,1,0);
      TDownhillMusic.Kick$1(Self,Self.master,t$11);
      TDownhillMusic.Cymbal(Self,t$11,0.5);
      Self.master.gain.setTargetAtTime(0,t$11 + 3.2,0.6);
      Self.wind.gain$2.gain.setTargetAtTime(0,t$11 + 2,0.8);
      TDownhillMusic.Emit$1(Self,"finish",{
         "chord" : TDownhillMusic.ChordName(Self,tonic)
      },t$11);
   }
   /// procedure TDownhillMusic.Finish()
   ,Finish:function(Self) {
      if (Self.running) {
         Self.FFinishPending = true;
      }
   }
   /// procedure TDownhillMusic.Hat(dest: JAudioNode; t: Float; vol: Float; open: Boolean)
   ,Hat:function(Self, dest, t$11, vol$1, open$1) {
      TDownhillMusic.Noise(Self,dest,t$11,(open$1)?0.16:0.045,vol$1,"highpass",7500,0,0.7);
   }
   /// function TDownhillMusic.Impulse(sec: Float; decay: Float) : JAudioBuffer
   ,Impulse:function(Self, sec, decay) {
      var Result = null;
      var rate = 0,
         len$2 = 0,
         c$7 = 0,
         i$6 = 0,
         b$8 = null,
         d$8 = null;
      rate = Self.ctx.sampleRate;
      len$2 = Floor(rate * sec);
      b$8 = Self.ctx.createBuffer(2,len$2,rate);
      for(c$7=0;c$7<=1;c$7++) {
         d$8 = b$8.getChannelData(c$7);
         var $temp117;
         for(i$6=0,$temp117=len$2;i$6<$temp117;i$6++) {
            d$8[i$6]=((Random() * 2 - 1) * Power(1 - i$6 / len$2,decay));
         }
      }
      Result = b$8;
      return Result
   }
   /// procedure TDownhillMusic.Init()
   ,Init:function(Self) {
      var comp$3 = null,
         rg = null,
         a$211 = 0,
         L$3 = null,
         s$12 = null,
         src = null,
         filter$2 = null,
         gain$3 = null,
         lfo = null,
         lfoG = null,
         a$212 = [];
      Self.master = Self.ctx.createGain();
      Self.master.gain.value = 0.8;
      comp$3 = Self.ctx.createDynamicsCompressor();
      comp$3.threshold.value = -16;
      comp$3.ratio.value = 4;
      comp$3.attack.value = 0.004;
      comp$3.release.value = 0.2;
      Self.master.connect(comp$3);
      comp$3.connect(Self.ctx.destination);
      Self.FReverb = Self.ctx.createConvolver();
      Self.FReverb.buffer = TDownhillMusic.Impulse(Self,2.6,2.4);
      rg = Self.ctx.createGain();
      rg.gain.value = 0.4;
      Self.FReverb.connect(rg);
      rg.connect(Self.master);
      Self.FNoiseBuf = TDownhillMusic.NoiseBuffer(Self,2);
      Self.FLayers = [MkLayer("pad","Flaechen",0,0.9,0.55), MkLayer("bass","Bass",0.12,0.55,0), MkLayer("hats","Hi-Hats",0.25,0.5,0.05), MkLayer("kick","Kick",0.36,0.9,0), MkLayer("arp","Arpeggio",0.5,0.45,0.35), MkLayer("snare","Snare",0.6,0.6,0.15), MkLayer("lead","Melodie",0.75,0.5,0.3)];
      a$212 = Self.FLayers;
      var $temp118;
      for(a$211=0,$temp118=a$212.length;a$211<$temp118;a$211++) {
         L$3 = a$212[a$211];
         L$3.node = Self.ctx.createGain();
         L$3.node.gain.value = 0;
         L$3.node.connect(Self.master);
         if (L$3.send != 0) {
            s$12 = Self.ctx.createGain();
            s$12.gain.value = L$3.send;
            L$3.node.connect(s$12);
            s$12.connect(Self.FReverb);
         }
         L$3.on$8 = false;
      }
      src = Self.ctx.createBufferSource();
      src.buffer = Self.FNoiseBuf;
      src.loop = true;
      filter$2 = Self.ctx.createBiquadFilter();
      filter$2.type = "bandpass";
      filter$2.frequency.value = 700;
      filter$2.Q.value = 0.8;
      gain$3 = Self.ctx.createGain();
      gain$3.gain.value = 0;
      lfo = Self.ctx.createOscillator();
      lfoG = Self.ctx.createGain();
      lfo.frequency.value = 0.13;
      lfoG.gain.value = 350;
      lfo.connect(lfoG);
      lfoG.connect(filter$2.frequency);
      src.connect(filter$2);
      filter$2.connect(gain$3);
      gain$3.connect(Self.master);
      src.start();
      lfo.start();
      Self.wind = TObject.Create($New(TWind));
      Self.wind.filter$1 = filter$2;
      Self.wind.gain$2 = gain$3;
   }
   /// function TDownhillMusic.KeyRoot() : Integer
   ,KeyRoot:function(Self) {
      var Result = 0;
      Result = 57 + Self.FTranspose;
      return Result
   }
   /// procedure TDownhillMusic.Kick(dest: JAudioNode; t: Float)
   ,Kick$1:function(Self, dest, t$11) {
      var o$1 = null,
         g$8 = null;
      o$1 = Self.ctx.createOscillator();
      g$8 = Self.ctx.createGain();
      o$1.type = "sine";
      o$1.frequency.setValueAtTime(150,t$11);
      o$1.frequency.exponentialRampToValueAtTime(42,t$11 + 0.12);
      g$8.gain.setValueAtTime(1,t$11);
      g$8.gain.exponentialRampToValueAtTime(0.001,t$11 + 0.38);
      o$1.connect(g$8);
      g$8.connect(dest);
      o$1.start(t$11);
      o$1.stop(t$11 + 0.4);
   }
   /// function TDownhillMusic.Layer(id: String) : TLayer
   ,Layer:function(Self, id$4) {
      var Result = null;
      var a$213 = 0,
         L$3 = null,
         a$214 = [];
      a$214 = Self.FLayers;
      var $temp119;
      for(a$213=0,$temp119=a$214.length;a$213<$temp119;a$213++) {
         L$3 = a$214[a$213];
         if (L$3.id$3 == id$4) {
            return L$3;
         }
      }
      Result = null;
      return Result
   }
   /// function TDownhillMusic.MakeMelody() : 
   ,MakeMelody:function(Self) {
      var Result = [];
      var k$4 = 0,
         m$7 = 0,
         i$6 = 0,
         h$3 = 0,
         idx$2 = 0,
         best = 0,
         dir$1 = 0,
         s$12 = 0,
         nxt = 0,
         center$2 = 0,
         ch$2 = null,
         scale$3 = [],
         pcs = [],
         a$215 = 0,
         x$18 = 0,
         notes = [],
         outNotes = [],
         hits = [],
         cands = [],
         cd = null,
         ci = 0,
         nn = null,
         a$216 = [];
      k$4 = TDownhillMusic.KeyRoot(Self);
      ch$2 = Self.chord;
      scale$3 = [0, 2, 3, 5, 7, 8, 10];
      if (Self.FChordKey == "V") {
         scale$3[6]=11;
      }
      a$216 = TDownhillMusic.ChordTones(Self,ch$2);
      var $temp120;
      for(a$215=0,$temp120=a$216.length;a$215<$temp120;a$215++) {
         x$18 = a$216[a$215];
         pcs.push(PosMod(x$18,12));
      }
      for(m$7=64;m$7<=88;m$7++) {
         if (scale$3.indexOf(PosMod(m$7 - k$4,12)) >= 0) {
            notes.push(m$7);
         }
      }
      for(i$6=0;i$6<=15;i$6++) {
         outNotes.push(null);
      }
      var $temp121;
      for(i$6=0,$temp121=Self.FRhythm.length;i$6<$temp121;i$6++) {
         if (Self.FRhythm[i$6]) {
            hits.push(i$6);
         }
      }
      best = 0;
      var $temp122;
      for(i$6=0,$temp122=notes.length;i$6<$temp122;i$6++) {
         if (Abs$_Integer_(notes[i$6] - Self.FLastPitch) < Abs$_Integer_(notes[best] - Self.FLastPitch)) {
            best = i$6;
         }
      }
      idx$2 = best;
      var $temp123;
      for(h$3=0,$temp123=hits.length;h$3<$temp123;h$3++) {
         s$12 = hits[h$3];
         if (!(s$12 % 4)) {
            var $temp124;
            for(i$6=0,$temp124=notes.length;i$6<$temp124;i$6++) {
               if (pcs.indexOf(PosMod(notes[i$6] - k$4,12)) >= 0) {
                  cd = TObject.Create($New(TCand));
                  cd.m$5 = notes[i$6];
                  cd.i$5 = i$6;
                  cands.push(cd);
               }
            }
            ci = idx$2;
            cands.sort(function (a$110, b$8) {
               var Result = 0;
               Result = Abs$_Integer_(a$110.i$5 - ci) - Abs$_Integer_(b$8.i$5 - ci);
               return Result
            });
            idx$2 = cands[(Random() < 0.7)?0:Min$_Integer_Integer_(1,cands.length - 1)].i$5;
         } else {
            center$2 = notes.length / 2;
            dir$1 = (Random() < 0.5)?-1:1;
            if (Abs$_Float_(idx$2 - center$2) > 5) {
               dir$1 = (idx$2 > center$2)?-1:1;
            }
            idx$2+=dir$1 * ((Random() < 0.75)?1:2);
            idx$2 = Max$_Integer_Integer_(0,Min$_Integer_Integer_(notes.length - 1,idx$2));
         }
         nxt = (h$3 + 1 < hits.length)?hits[h$3 + 1]:16;
         nn = TObject.Create($New(TMelNote));
         nn.m$4 = notes[idx$2];
         nn.len$1 = Min$_Integer_Integer_(4,nxt - s$12);
         outNotes[s$12]=nn;
      }
      if (hits.length > 0) {
         Self.FLastPitch = notes[idx$2];
      }
      Result = outNotes;
      return Result
   }
   /// procedure TDownhillMusic.NewBar(t: Float)
   ,NewBar:function(Self, t$11) {
      var I = 0,
         amt = 0,
         d1$1 = 0,
         d2$1 = 0,
         duck = false,
         isOn = false,
         opts$1 = [],
         states,
         a$217 = 0,
         L$3 = null,
         info$1,
         a$218 = [];
      ++Self.FBar;
      I = Min$_Float_Float_(1,Self.intensity$1 + Self.boost);
      Self.FI = I;
      Self.boost *= 0.5;
      Self.FPos$1 = Self.FBar % 8;
      if (!Self.FPos$1) {
         Self.FTranspose = (I > 0.85)?2:0;
         Self.FRhythm = TDownhillMusic.Euclid(Self,Round(3 + 6 * I),16);
      }
      Self.FBpm = Round(104 + 40 * I);
      Self.FStepDur = 60 / Self.FBpm / 4;
      opts$1 = PHRASE[Self.FPos$1];
      d1$1 = 1 + Floor(Random() * 6);
      d2$1 = 1 + Floor(Random() * 6);
      Self.FDice = [d1$1, d2$1];
      Self.FChordKey = opts$1[(d1$1 + d2$1) % opts$1.length];
      Self.chord = ChordByKey(Self.FChordKey);
      duck = Self.FDuckBars > 0;
      if (duck) {
         --Self.FDuckBars;
      }
      states = {};
      a$218 = Self.FLayers;
      var $temp125;
      for(a$217=0,$temp125=a$218.length;a$217<$temp125;a$217++) {
         L$3 = a$218[a$217];
         isOn = I >= L$3.th && ((!(duck)) || L$3.id$3 == "pad");
         amt = (isOn)?L$3.level * (0.6 + 0.4 * Min$_Float_Float_(1,(I - L$3.th) / 0.2)):0;
         L$3.node.gain.setTargetAtTime(amt,t$11,(isOn)?0.12:0.35);
         L$3.on$8 = isOn;
         VSet(states,L$3.id$3,isOn);
      }
      Self.FMelody = TDownhillMusic.MakeMelody(Self);
      TDownhillMusic.Pad(Self,t$11,Self.FStepDur * 16,I);
      if ((Self.FPos$1==0) && I > 0.6 && (!(duck))) {
         TDownhillMusic.Cymbal(Self,t$11,0.35);
      }
      info$1 = {};
      info$1.bar = Self.FBar;
      info$1.pos = Self.FPos$1;
      info$1.bpm = Self.FBpm;
      info$1.dice = Self.FDice;
      info$1.degree = Self.FChordKey;
      info$1.chord = TDownhillMusic.ChordName(Self,Self.chord);
      info$1.layers = states;
      info$1.transpose = Self.FTranspose;
      info$1.intensity = I;
      TDownhillMusic.Emit$1(Self,"bar",info$1,t$11);
   }
   /// function TDownhillMusic.NextGrid(every: Integer) : Float
   ,NextGrid:function(Self, every) {
      var Result = 0;
      var t$11 = 0,
         s$12 = 0;
      t$11 = Self.FNextTime;
      s$12 = Self.FStep;
      while (((s$12 % every)!=0)) {
         t$11 += Self.FStepDur;
         ++s$12;
      }
      Result = t$11;
      return Result
   }
   /// procedure TDownhillMusic.Noise(dest: JAudioNode; t: Float; dur: Float; vol: Float; typ: String = 'highpass'; f0: Float = 5000; f1: Float = 0; q: Float = 0,7)
   ,Noise:function(Self, dest, t$11, dur, vol$1, typ$2, f0, f1, q$2) {
      var src = null,
         fl$1 = null,
         g$8 = null;
      src = Self.ctx.createBufferSource();
      fl$1 = Self.ctx.createBiquadFilter();
      g$8 = Self.ctx.createGain();
      src.buffer = Self.FNoiseBuf;
      fl$1.type = typ$2;
      fl$1.Q.value = q$2;
      fl$1.frequency.setValueAtTime(f0,t$11);
      if (f1 != 0) {
         fl$1.frequency.exponentialRampToValueAtTime(f1,t$11 + dur);
      }
      g$8.gain.setValueAtTime(vol$1,t$11);
      g$8.gain.exponentialRampToValueAtTime(0.001,t$11 + dur);
      src.connect(fl$1);
      fl$1.connect(g$8);
      g$8.connect(dest);
      src.start(t$11,Random() * 1.5);
      src.stop(t$11 + dur + 0.02);
   }
   /// function TDownhillMusic.NoiseBuffer(sec: Float) : JAudioBuffer
   ,NoiseBuffer:function(Self, sec) {
      var Result = null;
      var rate = 0,
         len$2 = 0,
         i$6 = 0,
         b$8 = null,
         d$8 = null;
      rate = Self.ctx.sampleRate;
      len$2 = Floor(rate * sec);
      b$8 = Self.ctx.createBuffer(1,len$2,rate);
      d$8 = b$8.getChannelData(0);
      var $temp126;
      for(i$6=0,$temp126=len$2;i$6<$temp126;i$6++) {
         d$8[i$6]=(Random() * 2 - 1);
      }
      Result = b$8;
      return Result
   }
   /// function TDownhillMusic.OnEvent(ev: String; fn: TMusicListener) : TDownhillMusic
   ,OnEvent:function(Self, ev, fn) {
      var Result = null;
      var list$1;
      list$1 = VGet(Self.FListeners,ev);
      if (!(Truthy(list$1))) {
         list$1 = [];
         VSet(Self.FListeners,ev,list$1);
      }
      (list$1).push(fn);
      Result = Self;
      return Result
   }
   /// procedure TDownhillMusic.Overtake()
   ,Overtake:function(Self) {
      var t$11 = 0,
         k$4 = 0,
         i$6 = 0,
         tones = [];
      if ((!(Self.running)) || !Self.chord) {
         return;
      }
      t$11 = TDownhillMusic.NextGrid(Self,2);
      k$4 = TDownhillMusic.KeyRoot(Self);
      tones = TDownhillMusic.ChordTones(Self,Self.chord);
      for(i$6=0;i$6<=5;i$6++) {
         TDownhillMusic.Tone(Self,Self.master,"square",TDownhillMusic.F$1(Self,k$4 + 12 + tones[i$6 % 3] + 12 * ($Div(i$6,3))),t$11 + i$6 * Self.FStepDur / 2,Self.FStepDur * 0.6,0.07,0.005,0.08,3500,0,1,0);
      }
      TDownhillMusic.Noise(Self,Self.master,t$11,0.55,0.12,"bandpass",400,6000,1.5);
      Self.boost = Min$_Float_Float_(0.2,Self.boost + 0.12);
      TDownhillMusic.Emit$1(Self,"stinger","overtake",t$11);
   }
   /// procedure TDownhillMusic.Pad(t: Float; dur: Float; I: Float)
   ,Pad:function(Self, t$11, dur, I) {
      var k$4 = 0,
         m$7 = 0,
         voiced = [],
         a$219 = 0,
         x$18 = 0,
         a$220 = 0,
         vm = 0,
         a$221 = 0,
         dt = 0,
         a$222 = [];
      k$4 = TDownhillMusic.KeyRoot(Self);
      a$222 = TDownhillMusic.ChordTones(Self,Self.chord);
      var $temp127;
      for(a$219=0,$temp127=a$222.length;a$219<$temp127;a$219++) {
         x$18 = a$222[a$219];
         m$7 = k$4 - 12 + x$18;
         while (m$7 < 52) {
            m$7 += 12;
         }
         while (m$7 > 64) {
            m$7-=12;
         }
         voiced.push(m$7);
      }
      voiced.push(voiced[0] + 12);
      var a$223 = [0,0];
      var $temp128;
      for(a$220=0,$temp128=voiced.length;a$220<$temp128;a$220++) {
         vm = voiced[a$220];
         a$223 = [-8, 8];
         for(a$221=0;a$221<=1;a$221++) {
            dt = a$223[a$221];
            TDownhillMusic.Tone(Self,TDownhillMusic.Layer(Self,"pad").node,"sawtooth",TDownhillMusic.F$1(Self,vm),t$11,dur,0.045,0.35,0.6,450 + 2200 * I,0,1,dt);
         }
      }
   }
   /// procedure TDownhillMusic.ScheduleStep(s: Integer; t: Float)
   ,ScheduleStep:function(Self, s$12, t$11) {
      var inten = 0,
         sd = 0,
         dur = 0,
         k$4 = 0,
         root$2 = 0,
         m$7 = 0,
         i$6 = 0,
         hit$1 = false,
         ch$2 = null,
         tones = [],
         LB = null,
         LK = null,
         LS = null,
         LH = null,
         LA = null,
         seq = [],
         n$7 = null,
         LL = null;
      inten = Self.FI;
      sd = Self.FStepDur;
      k$4 = TDownhillMusic.KeyRoot(Self);
      ch$2 = Self.chord;
      tones = TDownhillMusic.ChordTones(Self,ch$2);
      LB = TDownhillMusic.Layer(Self,"bass");
      if (LB.on$8) {
         root$2 = k$4 - 24 + ch$2.root$1;
         hit$1 = false;
         m$7 = root$2;
         dur = sd * 1.8;
         if (inten < 0.35) {
            hit$1 = (s$12==0) || s$12 == 8;
            dur = sd * 7;
         } else if (inten < 0.6) {
            hit$1 = ((s$12 % 2)==0);
            if (s$12 == 6 || s$12 == 14) {
               m$7 = root$2 + 12;
            }
         } else {
            hit$1 = true;
            dur = sd * 0.9;
            if (s$12 % 4 == 3) {
               m$7 = root$2 + 12;
            }
         }
         if (hit$1) {
            TDownhillMusic.Tone(Self,LB.node,"sawtooth",TDownhillMusic.F$1(Self,m$7),t$11,dur,(!(s$12 % 4))?0.5:0.38,0.005,0.06,280 + 700 * inten,3,4,0);
         }
      }
      LK = TDownhillMusic.Layer(Self,"kick");
      if (LK.on$8) {
         if (inten < 0.6) {
            hit$1 = (s$12==0) || s$12 == 8 || inten > 0.45 && s$12 == 10;
         } else {
            hit$1 = ((s$12 % 4)==0) || inten > 0.85 && s$12 == 14;
         }
         if (hit$1) {
            TDownhillMusic.Kick$1(Self,LK.node,t$11);
         }
      }
      LS = TDownhillMusic.Layer(Self,"snare");
      if (LS.on$8) {
         if (s$12 == 4 || s$12 == 12) {
            TDownhillMusic.Snare(Self,LS.node,t$11,0.8);
         } else if (Self.FPos$1 == 7 && inten > 0.55 && s$12 > 12) {
            TDownhillMusic.Snare(Self,LS.node,t$11,0.35 + 0.15 * (s$12 - 12));
         } else if (inten > 0.8 && s$12 == 15) {
            TDownhillMusic.Snare(Self,LS.node,t$11,0.2);
         }
      }
      LH = TDownhillMusic.Layer(Self,"hats");
      if (LH.on$8) {
         if (inten < 0.5) {
            hit$1 = s$12 % 4 == 2;
         } else if (inten < 0.75) {
            hit$1 = ((s$12 % 2)==0);
         } else {
            hit$1 = true;
         }
         if (hit$1) {
            TDownhillMusic.Hat(Self,LH.node,t$11,(s$12 % 4 == 2)?0.5:0.3,inten > 0.75 && s$12 == 14);
         }
      }
      LA = TDownhillMusic.Layer(Self,"arp");
      if (LA.on$8 && (inten >= 0.65 || ((s$12 % 2)==0))) {
         seq = [0, 1, 2, 3, 4, 5, 4, 3];
         i$6 = seq[((inten >= 0.65)?s$12:$Div(s$12,2)) % 8];
         m$7 = k$4 + 12 + tones[i$6 % 3] + 12 * ($Div(i$6,3));
         TDownhillMusic.Tone(Self,LA.node,"square",TDownhillMusic.F$1(Self,m$7),t$11,sd * 0.7,0.14,0.005,0.05,1200 + 3000 * inten,2,1,0);
      }
      n$7 = Self.FMelody[s$12];
      LL = TDownhillMusic.Layer(Self,"lead");
      if (LL.on$8 && !!n$7) {
         TDownhillMusic.Tone(Self,LL.node,"triangle",TDownhillMusic.F$1(Self,n$7.m$4),t$11,sd * n$7.len$1 * 0.92,0.34,0.01,0.12,0,0,1,0);
         TDownhillMusic.Tone(Self,LL.node,"sawtooth",TDownhillMusic.F$1(Self,n$7.m$4),t$11,sd * n$7.len$1 * 0.92,0.06,0.02,0.12,2200,0,1,7);
      }
   }
   /// procedure TDownhillMusic.SetIntensity(x: Float)
   ,SetIntensity:function(Self, x$18) {
      var t$11 = 0;
      Self.intensity$1 = Min$_Float_Float_(1,Max$_Float_Float_(0,x$18));
      if (!!Self.wind && Self.running) {
         t$11 = Self.ctx.currentTime;
         Self.wind.gain$2.gain.setTargetAtTime(0.05 + 0.16 * Self.intensity$1,t$11,0.3);
         Self.wind.filter$1.Q.setTargetAtTime(0.8 + 2 * Self.intensity$1,t$11,0.3);
      }
   }
   /// procedure TDownhillMusic.Snare(dest: JAudioNode; t: Float; vel: Float)
   ,Snare:function(Self, dest, t$11, vel$5) {
      TDownhillMusic.Noise(Self,dest,t$11,0.18,0.5 * vel$5,"highpass",1400,0,0.7);
      TDownhillMusic.Tone(Self,dest,"triangle",190,t$11,0.02,0.4 * vel$5,0.005,0.08,0,0,1,0);
   }
   /// procedure TDownhillMusic.Start()
   ,Start$1:function(Self) {
      if (!Self.ctx) {
         Self.ctx = NewAudioContext();
      }
      if (!Self.master) {
         TDownhillMusic.Init(Self);
      }
      Self.ctx.resume();
      if (Self.running) {
         return;
      }
      Self.running = true;
      Self.FFinishPending = false;
      Self.FBar = -1;
      Self.FStep = 0;
      Self.FStepDur = 0.144230769230769;
      Self.FNextTime = Self.ctx.currentTime + 0.1;
      Self.FTranspose = 0;
      Self.FLastPitch = 76;
      Self.FDuckBars = 0;
      Self.boost = 0;
      Self.master.gain.cancelScheduledValues(Self.ctx.currentTime);
      Self.master.gain.setTargetAtTime(0.8,Self.ctx.currentTime,0.05);
      TDownhillMusic.SetIntensity(Self,Self.intensity$1);
      Self.FTimer = setInterval($Event0(Self,TDownhillMusic.Tick),25);
   }
   /// procedure TDownhillMusic.Stop()
   ,Stop:function(Self) {
      var t$11 = 0,
         a$224 = 0,
         L$3 = null,
         a$225 = [];
      if (!(Self.running)) {
         return;
      }
      Self.running = false;
      clearInterval(Self.FTimer);
      t$11 = Self.ctx.currentTime;
      Self.master.gain.setTargetAtTime(0,t$11,0.25);
      a$225 = Self.FLayers;
      var $temp129;
      for(a$224=0,$temp129=a$225.length;a$224<$temp129;a$224++) {
         L$3 = a$225[a$224];
         L$3.on$8 = false;
         L$3.node.gain.setTargetAtTime(0,t$11,0.25);
      }
      Self.wind.gain$2.gain.setTargetAtTime(0,t$11,0.4);
      TDownhillMusic.Emit$1(Self,"stop",null,t$11);
   }
   /// procedure TDownhillMusic.Tick()
   ,Tick:function(Self) {
      var horizon = 0;
      horizon = Self.ctx.currentTime + 0.12;
      while (Self.running && Self.FNextTime < horizon) {
         if (Self.FFinishPending && ((Self.FStep % 4)==0)) {
            TDownhillMusic.Finale(Self,Self.FNextTime);
            return;
         }
         if (!Self.FStep) {
            TDownhillMusic.NewBar(Self,Self.FNextTime);
         }
         TDownhillMusic.ScheduleStep(Self,Self.FStep,Self.FNextTime);
         TDownhillMusic.Emit$1(Self,"step",{
            "step" : Self.FStep
            ,"bar" : Self.FBar
         },Self.FNextTime);
         Self.FNextTime += Self.FStepDur;
         Self.FStep = (Self.FStep + 1) % 16;
      }
   }
   /// procedure TDownhillMusic.Tone(dest: JAudioNode; typ: String; freq: Float; t: Float; dur: Float; vol: Float = 0,3; a: Float = 0,005; r: Float = 0,08; cutoff: Float = 0; fEnv: Float = 0; q: Float = 1; detune: Float = 0)
   ,Tone:function(Self, dest, typ$2, freq, t$11, dur, vol$1, a$110, r$7, cutoff, fEnv, q$2, detune$1) {
      var hold = 0,
         o$1 = null,
         g$8 = null,
         last$2 = null,
         fl$1 = null;
      o$1 = Self.ctx.createOscillator();
      g$8 = Self.ctx.createGain();
      o$1.type = typ$2;
      o$1.frequency.value = freq;
      o$1.detune.value = detune$1;
      last$2 = o$1;
      if (cutoff != 0) {
         fl$1 = Self.ctx.createBiquadFilter();
         fl$1.type = "lowpass";
         fl$1.Q.value = q$2;
         if (fEnv != 0) {
            fl$1.frequency.setValueAtTime(cutoff * fEnv,t$11);
            fl$1.frequency.exponentialRampToValueAtTime(cutoff,t$11 + Max$_Float_Float_(0.05,dur));
         } else {
            fl$1.frequency.value = cutoff;
         }
         o$1.connect(fl$1);
         last$2 = fl$1;
      }
      hold = Max$_Float_Float_(t$11 + a$110,t$11 + dur);
      g$8.gain.setValueAtTime(0,t$11);
      g$8.gain.linearRampToValueAtTime(vol$1,t$11 + a$110);
      g$8.gain.setValueAtTime(vol$1,hold);
      g$8.gain.setTargetAtTime(0,hold,r$7 / 3);
      last$2.connect(g$8);
      g$8.connect(dest);
      o$1.start(t$11);
      o$1.stop(hold + r$7 * 2 + 0.05);
   }
   ,Destroy:TObject.Destroy
};
/// TChord = class (TObject)
var TChord = {
   $ClassName:"TChord",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.key$1 = "";
      $.root$1 = 0;
      $.t$7 = [];
   }
   ,Destroy:TObject.Destroy
};
/// TCand = class (TObject)
var TCand = {
   $ClassName:"TCand",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.i$5 = $.m$5 = 0;
   }
   ,Destroy:TObject.Destroy
};
function PosMod(a$110, n$7) {
   var Result = 0;
   Result = (a$110 % n$7 + n$7) % n$7;
   return Result
}
function MkLayer(id$4, name$8, th$1, level$1, send$1) {
   var Result = null;
   Result = TObject.Create($New(TLayer));
   Result.id$3 = id$4;
   Result.name$7 = name$8;
   Result.th = th$1;
   Result.level = level$1;
   Result.send = send$1;
   return Result
}
function MkChord(key$2, root$2, t$11) {
   var Result = null;
   Result = TObject.Create($New(TChord));
   Result.key$1 = key$2;
   Result.root$1 = root$2;
   Result.t$7 = t$11;
   return Result
}
function ChordByKey(key$2) {
   var Result = null;
   var a$103 = 0,
      c$7 = null;
   var $temp130;
   for(a$103=0,$temp130=CHORDS.length;a$103<$temp130;a$103++) {
      c$7 = CHORDS[a$103];
      if (c$7.key$1 == key$2) {
         return c$7;
      }
   }
   Result = null;
   return Result
}
var NOTE_NAMES = ["C","C\u266F","D","D\u266F","E","F","F\u266F","G","G\u266F","A","B","H"];
/// TNoiseLoop = class (TObject)
var TNoiseLoop = {
   $ClassName:"TNoiseLoop",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.fl = $.g$6 = null;
   }
   ,Destroy:TObject.Destroy
};
/// TAudioState = class (TObject)
var TAudioState = {
   $ClassName:"TAudioState",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.edgePressure$1 = $.skid$1 = $.speed$4 = 0;
      $.grounded$2 = $.riding$1 = false;
   }
   ,Destroy:TObject.Destroy
};
/// TAudioEngine = class (TObject)
var TAudioEngine = {
   $ClassName:"TAudioEngine",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.ctx$1 = $.dm = $.FCarve = $.FNoise = $.FSkid = $.FWind = $.master$1 = $.music = $.sfx = null;
      $.FNextTime$1 = $.musicVol = $.vol = 0;
      $.FStep$1 = 0;
   }
   /// procedure TAudioEngine.Beep(hi: Boolean)
   ,Beep:function(Self, hi$1) {
      TAudioEngine.Tone$1(Self,(hi$1)?1320:660,(hi$1)?0.5:0.18,0.18,"sine",0,null,0);
   }
   /// procedure TAudioEngine.Burst(dur: Float; f0: Float; f1: Float; gain: Float; typ: String = 'lowpass')
   ,Burst:function(Self, dur, f0, f1, gain$3, typ$2) {
      var t$11 = 0,
         s$12 = null,
         fl$1 = null,
         g$8 = null;
      if (!Self.ctx$1) {
         return;
      }
      t$11 = Self.ctx$1.currentTime;
      s$12 = Self.ctx$1.createBufferSource();
      s$12.buffer = Self.FNoise;
      fl$1 = Self.ctx$1.createBiquadFilter();
      fl$1.type = typ$2;
      fl$1.frequency.setValueAtTime(f0,t$11);
      fl$1.frequency.exponentialRampToValueAtTime(f1,t$11 + dur);
      g$8 = Self.ctx$1.createGain();
      g$8.gain.setValueAtTime(0.0001,t$11);
      g$8.gain.exponentialRampToValueAtTime(gain$3,t$11 + 0.01);
      g$8.gain.exponentialRampToValueAtTime(0.0001,t$11 + dur);
      s$12.connect(fl$1).connect(g$8).connect(Self.sfx);
      s$12.start(t$11,Random());
      s$12.stop(t$11 + dur + 0.05);
   }
   /// procedure TAudioEngine.Click()
   ,Click:function(Self) {
      TAudioEngine.Tone$1(Self,880,0.06,0.08,"square",0,null,0);
   }
   /// procedure TAudioEngine.Crash()
   ,Crash$1:function(Self) {
      TAudioEngine.Burst(Self,1.1,3000,150,0.9,"lowpass");
      TAudioEngine.Tone$1(Self,70,0.4,0.8,"sine",0,Self.sfx,30);
      TAudioEngine.Tone$1(Self,55,0.3,0.5,"sine",0.22,Self.sfx,30);
   }
   /// constructor TAudioEngine.Create()
   ,Create$159:function(Self) {
      Self.ctx$1 = null;
      Self.vol = 0.8;
      Self.musicVol = 0.5;
      Self.FStep$1 = 0;
      Self.FNextTime$1 = 0;
      return Self
   }
   /// procedure TAudioEngine.Hat(at: Float)
   ,Hat$1:function(Self, at) {
      var t$11 = 0,
         s$12 = null,
         fl$1 = null,
         g$8 = null;
      t$11 = Self.ctx$1.currentTime + at;
      s$12 = Self.ctx$1.createBufferSource();
      s$12.buffer = Self.FNoise;
      fl$1 = Self.ctx$1.createBiquadFilter();
      fl$1.type = "highpass";
      fl$1.frequency.value = 7000;
      g$8 = Self.ctx$1.createGain();
      g$8.gain.setValueAtTime(0.03,t$11);
      g$8.gain.exponentialRampToValueAtTime(0.0001,t$11 + 0.05);
      s$12.connect(fl$1).connect(g$8).connect(Self.music);
      s$12.start(t$11,Random());
      s$12.stop(t$11 + 0.08);
   }
   /// procedure TAudioEngine.Init()
   ,Init$1:function(Self) {
      var len$2 = 0,
         i$6 = 0,
         b0 = 0,
         w$5 = 0,
         ok = false,
         comp$3 = null,
         buf = null,
         d$8 = null,
         lfo = null,
         lg = null;
      if (!!Self.ctx$1) {
         if (Self.ctx$1.state == "suspended") {
            Self.ctx$1.resume();
         }
         return;
      }
      ok = !!(window.AudioContext || window.webkitAudioContext);
      if (!(ok)) {
         return;
      }
      Self.ctx$1 = NewAudioContext();
      Self.master$1 = Self.ctx$1.createGain();
      Self.master$1.gain.value = Self.vol;
      comp$3 = Self.ctx$1.createDynamicsCompressor();
      comp$3.threshold.value = -14;
      comp$3.ratio.value = 4;
      Self.master$1.connect(comp$3).connect(Self.ctx$1.destination);
      Self.sfx = Self.ctx$1.createGain();
      Self.sfx.connect(Self.master$1);
      Self.music = Self.ctx$1.createGain();
      Self.music.gain.value = Self.musicVol * 0.5;
      Self.music.connect(Self.master$1);
      len$2 = Round(Self.ctx$1.sampleRate * 2);
      buf = Self.ctx$1.createBuffer(1,len$2,Self.ctx$1.sampleRate);
      d$8 = buf.getChannelData(0);
      b0 = 0;
      var $temp131;
      for(i$6=0,$temp131=len$2;i$6<$temp131;i$6++) {
         w$5 = Random() * 2 - 1;
         b0 = 0.97 * b0 + 0.03 * w$5;
         d$8[i$6]=(w$5 * 0.6 + b0 * 2.5);
      }
      Self.FNoise = buf;
      Self.FCarve = TAudioEngine.Loop$1(Self,"bandpass",700,0.7);
      Self.FSkid = TAudioEngine.Loop$1(Self,"bandpass",2600,1.2);
      Self.FWind = TAudioEngine.Loop$1(Self,"lowpass",500,0.9);
      lfo = Self.ctx$1.createOscillator();
      lg = Self.ctx$1.createGain();
      lfo.frequency.value = 0.17;
      lg.gain.value = 180;
      lfo.connect(lg).connect(Self.FWind.fl.frequency);
      lfo.start();
      Self.FNextTime$1 = Self.ctx$1.currentTime + 0.1;
      try {
         Self.dm = TDownhillMusic.Create$155($New(TDownhillMusic),Self.ctx$1);
         TDownhillMusic.Init(Self.dm);
         Self.dm.master.disconnect();
         Self.dm.master.connect(Self.music);
         Self.dm.wind.gain$2.disconnect();
         Self.music.gain.value = Self.musicVol * 1.1;
         TDownhillMusic.Start$1(Self.dm);
      } catch ($e) {
         var e$1 = $W($e);
         console.warn("DownhillMusic nicht nutzbar, eingebaute Musik: " + e$1.FMessage);
         Self.dm = null;
      }
   }
   /// procedure TAudioEngine.Landing(i: Float)
   ,Landing:function(Self, i$6) {
      TAudioEngine.Burst(Self,0.25 + i$6 * 0.25,1400,200,0.25 + i$6 * 0.5,"lowpass");
      TAudioEngine.Tone$1(Self,90,0.25,0.3 + i$6 * 0.4,"sine",0,Self.sfx,40);
   }
   /// function TAudioEngine.Loop(filterType: String; f: Float; q: Float) : TNoiseLoop
   ,Loop$1:function(Self, filterType, f$7, q$2) {
      var Result = null;
      var s$12 = null,
         fl$1 = null,
         g$8 = null;
      s$12 = Self.ctx$1.createBufferSource();
      s$12.buffer = Self.FNoise;
      s$12.loop = true;
      s$12.playbackRate.value = 0.8 + Random() * 0.4;
      fl$1 = Self.ctx$1.createBiquadFilter();
      fl$1.type = filterType;
      fl$1.frequency.value = f$7;
      fl$1.Q.value = q$2;
      g$8 = Self.ctx$1.createGain();
      g$8.gain.value = 0;
      s$12.connect(fl$1).connect(g$8).connect(Self.sfx);
      s$12.start();
      Result = TObject.Create($New(TNoiseLoop));
      Result.fl = fl$1;
      Result.g$6 = g$8;
      return Result
   }
   /// procedure TAudioEngine.MusicFall()
   ,MusicFall:function(Self) {
      if (!!Self.dm) {
         TDownhillMusic.Fall(Self.dm);
      }
   }
   /// procedure TAudioEngine.MusicFinish()
   ,MusicFinish:function(Self) {
      if (!!Self.dm) {
         TDownhillMusic.Finish(Self.dm);
      }
   }
   /// procedure TAudioEngine.MusicIntensity(x: Float)
   ,MusicIntensity:function(Self, x$18) {
      if (!!Self.dm) {
         TDownhillMusic.SetIntensity(Self.dm,x$18);
      }
   }
   /// procedure TAudioEngine.MusicOvertake()
   ,MusicOvertake:function(Self) {
      if (!!Self.dm) {
         TDownhillMusic.Overtake(Self.dm);
      }
   }
   /// procedure TAudioEngine.MusicRestart()
   ,MusicRestart:function(Self) {
      if (!!Self.dm && (!(Self.dm.running))) {
         TDownhillMusic.Start$1(Self.dm);
      }
   }
   /// procedure TAudioEngine.NearMiss()
   ,NearMiss:function(Self) {
      TAudioEngine.Burst(Self,0.45,600,4000,0.35,"bandpass");
      TAudioEngine.Tone$1(Self,1320,0.25,0.12,"triangle",0.05,null,0);
      TAudioEngine.Tone$1(Self,1760,0.35,0.1,"triangle",0.12,null,0);
   }
   /// procedure TAudioEngine.Ollie()
   ,Ollie:function(Self) {
      TAudioEngine.Burst(Self,0.12,2500,800,0.25,"bandpass");
   }
   /// procedure TAudioEngine.Pad(f: Float; dur: Float; at: Float)
   ,Pad$1:function(Self, f$7, dur, at) {
      var t$11 = 0,
         g$8 = null,
         fl$1 = null,
         a$226 = 0,
         det = 0,
         o$1 = null,
         a$227 = [0,0];
      t$11 = Self.ctx$1.currentTime + at;
      g$8 = Self.ctx$1.createGain();
      fl$1 = Self.ctx$1.createBiquadFilter();
      fl$1.type = "lowpass";
      fl$1.frequency.value = 900;
      fl$1.Q.value = 0.5;
      g$8.gain.setValueAtTime(0.0001,t$11);
      g$8.gain.linearRampToValueAtTime(0.045,t$11 + dur * 0.3);
      g$8.gain.linearRampToValueAtTime(0.0001,t$11 + dur);
      a$227 = [-7, 7];
      for(a$226=0;a$226<=1;a$226++) {
         det = a$227[a$226];
         o$1 = Self.ctx$1.createOscillator();
         o$1.type = "sawtooth";
         o$1.frequency.value = f$7;
         o$1.detune.value = det;
         o$1.connect(fl$1);
         o$1.start(t$11);
         o$1.stop(t$11 + dur + 0.1);
      }
      fl$1.connect(g$8).connect(Self.music);
   }
   /// procedure TAudioEngine.Pop(n: Float = 1)
   ,Pop$2:function(Self, n$7) {
      TAudioEngine.Tone$1(Self,660 * n$7,0.12,0.1,"triangle",0,null,0);
      TAudioEngine.Tone$1(Self,990 * n$7,0.18,0.07,"triangle",0.06,null,0);
   }
   /// procedure TAudioEngine.Schedule()
   ,Schedule:function(Self) {
      var st$3 = 0,
         bar = 0,
         s16 = 0,
         t$11 = 0,
         at = 0,
         chords = [],
         ch$2 = [],
         a$228 = 0,
         n$7 = 0;
      chords.push([57, 60, 64]);
      chords.push([53, 57, 60]);
      chords.push([48, 55, 60]);
      chords.push([55, 59, 62]);
      if (Self.FNextTime$1 < Self.ctx$1.currentTime - 0.05) {
         Self.FNextTime$1 = Self.ctx$1.currentTime + 0.02;
      }
      while (Self.FNextTime$1 < Self.ctx$1.currentTime + 0.2) {
         st$3 = Self.FStep$1;
         bar = ($Div(st$3,16)) % 4;
         s16 = st$3 % 16;
         t$11 = Self.FNextTime$1;
         ch$2 = chords[bar];
         at = t$11 - Self.ctx$1.currentTime;
         if (!s16) {
            var $temp132;
            for(a$228=0,$temp132=ch$2.length;a$228<$temp132;a$228++) {
               n$7 = ch$2[a$228];
               TAudioEngine.Pad$1(Self,Mtof(n$7),2.14285714285714,at);
            }
         }
         if (((s16 % 4)==0) || s16 == 10) {
            TAudioEngine.Tone$1(Self,Mtof(ch$2[0] - 24),0.241071428571429,0.16,"triangle",at,Self.music,0);
         }
         if (s16 % 2 == 1) {
            TAudioEngine.Hat$1(Self,at);
         }
         if (!(st$3 % 3)) {
            TAudioEngine.Tone$1(Self,Mtof(ch$2[($Div(st$3,3)) % 3] + 12),0.160714285714286,0.035,"sine",at,Self.music,0);
         }
         ++Self.FStep$1;
         Self.FNextTime$1 += 0.133928571428571;
      }
   }
   /// procedure TAudioEngine.SetVolumes(v: Float; m: Float)
   ,SetVolumes:function(Self, v$4, m$7) {
      Self.vol = v$4;
      Self.musicVol = m$7;
      if (!Self.ctx$1) {
         return;
      }
      Self.master$1.gain.setTargetAtTime(v$4,Self.ctx$1.currentTime,0.05);
      Self.music.gain.setTargetAtTime(m$7 * ((!!Self.dm)?1.1:0.5),Self.ctx$1.currentTime,0.05);
   }
   /// procedure TAudioEngine.Tone(f: Float; dur: Float; gain: Float; typ: String = 'sine'; at: Float = 0; dest: JAudioNode = nil; f2: Float = 0)
   ,Tone$1:function(Self, f$7, dur, gain$3, typ$2, at, dest, f2) {
      var t$11 = 0,
         o$1 = null,
         g$8 = null;
      if (!Self.ctx$1) {
         return;
      }
      if (!dest) {
         dest = Self.sfx;
      }
      t$11 = Self.ctx$1.currentTime + at;
      o$1 = Self.ctx$1.createOscillator();
      o$1.type = typ$2;
      o$1.frequency.setValueAtTime(f$7,t$11);
      if (f2 != 0) {
         o$1.frequency.exponentialRampToValueAtTime(f2,t$11 + dur);
      }
      g$8 = Self.ctx$1.createGain();
      g$8.gain.setValueAtTime(0.0001,t$11);
      g$8.gain.exponentialRampToValueAtTime(gain$3,t$11 + 0.008);
      g$8.gain.exponentialRampToValueAtTime(0.0001,t$11 + dur);
      o$1.connect(g$8).connect(dest);
      o$1.start(t$11);
      o$1.stop(t$11 + dur + 0.05);
   }
   /// procedure TAudioEngine.Update(s: TAudioState; dt: Float)
   ,Update$10:function(Self, s$12, dt) {
      var t$11 = 0,
         v$4 = 0,
         onF = 0,
         carveG = 0,
         skidG = 0,
         wg = 0;
      if (!Self.ctx$1) {
         return;
      }
      t$11 = Self.ctx$1.currentTime;
      v$4 = s$12.speed$4;
      onF = (s$12.grounded$2 && s$12.riding$1)?1:0;
      carveG = onF * ClampF(v$4 / 25,0,1) * (0.12 + 0.35 * ClampF(s$12.edgePressure$1,0,1.3));
      Self.FCarve.g$6.gain.setTargetAtTime(carveG * 0.6,t$11,0.05);
      Self.FCarve.fl.frequency.setTargetAtTime(300 + v$4 * 28 + s$12.edgePressure$1 * 400,t$11,0.05);
      skidG = onF * ClampF(s$12.skid$1 / 6,0,1) * ClampF(v$4 / 6,0,1);
      Self.FSkid.g$6.gain.setTargetAtTime(skidG * 0.5,t$11,0.04);
      Self.FSkid.fl.frequency.setTargetAtTime(1800 + s$12.skid$1 * 150,t$11,0.05);
      wg = ClampF(v$4 / 32,0,1.2);
      Self.FWind.g$6.gain.setTargetAtTime(wg*wg * 0.55 * ((s$12.riding$1)?1:0.3),t$11,0.2);
      Self.FWind.fl.frequency.setTargetAtTime(250 + v$4 * 45,t$11,0.2);
      if (!Self.dm) {
         TAudioEngine.Schedule(Self);
      }
   }
   ,Destroy:TObject.Destroy
};
function Mtof(m$7) {
   var Result = 0;
   Result = 440 * Power(2,(m$7 - 69) / 12);
   return Result
}
/// TTrick = class (TObject)
var TTrick = {
   $ClassName:"TTrick",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.flipDir = $.grabT = 0;
      $.flips = 0;
   }
   ,Destroy:TObject.Destroy
};
/// TRiderPhysics = class (TObject)
var TRiderPhysics = {
   $ClassName:"TRiderPhysics",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.airTime$1 = $.brake$2 = $.brakeSide = $.carveQ = $.catchT = $.charge$1 = $.edge$3 = $.edgePressure = $.flip$1 = $.flipRate$1 = $.grab$2 = $.grabT$1 = $.lastImpact = $.latAcc$1 = $.load$1 = $.maxEdgeNow = $.Nsm = $.prevEdge = $.prevFlip = $.prevYaw$1 = $.skid = $.speed$2 = $.spin = $.tuck$2 = $.yaw$2 = $.yawRate = 0;
      $.armB = $.armF = $.FBrakeWas = $.frozen = $.grounded$1 = $.jumpPrev = false;
      $.boardUp = $.course$5 = $.f$6 = $.lastTrick = $.n$4 = $.onEvent = $.pos$2 = $.prevBoardUp = $.prevPos = $.r$6 = $.terrain$1 = $.vel$2 = $._a$1 = $._hd = $._n2 = $._t = null;
      $.crashReason = "";
   }
   /// procedure TRiderPhysics.Crash(reason: String)
   ,Crash:function(Self, reason$1) {
      Self.crashReason = reason$1;
      TRiderPhysics.Emit(Self,"crash",reason$1,0);
   }
   /// constructor TRiderPhysics.Create(c: TCourse; t: TTerrain)
   ,Create$150:function(Self, c$7, t$11) {
      Self.course$5 = c$7;
      Self.terrain$1 = t$11;
      Self.pos$2 = new THREE.Vector3();
      Self.prevPos = new THREE.Vector3();
      Self.vel$2 = new THREE.Vector3();
      Self.n$4 = new THREE.Vector3(0,1,0);
      Self.boardUp = new THREE.Vector3(0,1,0);
      Self.prevBoardUp = new THREE.Vector3(0,1,0);
      Self.f$6 = new THREE.Vector3();
      Self.r$6 = new THREE.Vector3();
      Self._a$1 = new THREE.Vector3();
      Self._t = new THREE.Vector3();
      Self._hd = new THREE.Vector3();
      Self._n2 = new THREE.Vector3();
      Self.onEvent = null;
      TRiderPhysics.Reset$2(Self,4);
      return Self
   }
   /// procedure TRiderPhysics.Emit(typ: String; a: Variant = 0; b: Variant = 0)
   ,Emit:function(Self, typ$2, a$110, b$8) {
      if (Self.onEvent) {
         Self.onEvent(typ$2,a$110,b$8);
      }
   }
   /// procedure TRiderPhysics.Land(impact: Float)
   ,Land:function(Self, impact) {
      var velYaw = 0,
         hs$1 = 0,
         err = 0,
         flipErr = 0,
         rot$2 = 0,
         flips$2 = 0,
         v$4 = null;
      v$4 = Self.vel$2;
      velYaw = ArcTan2(v$4.x,v$4.z);
      hs$1 = Math.hypot(v$4.x,v$4.z);
      err = (hs$1 > 3)?Abs$_Float_(WrapAngle(Self.yaw$2 - velYaw)):0;
      flipErr = Abs$_Float_(WrapAngle(Self.flip$1));
      flips$2 = Round(Abs$_Float_(Self.flip$1) / 6.28318530717959);
      Self.lastTrick = TObject.Create($New(TTrick));
      Self.lastTrick.flips = (flipErr < 1)?flips$2:0;
      Self.lastTrick.flipDir = SignF(Self.flip$1);
      Self.lastTrick.grabT = Self.grabT$1;
      Self.flip$1 = 0;
      Self.prevFlip = 0;
      Self.flipRate$1 = 0;
      Self.grab$2 = 0;
      Self.lastImpact = impact;
      if (impact > 13.5 || err > 1.1 || flipErr > 1) {
         TRiderPhysics.Crash(Self,"landing");
         return;
      }
      rot$2 = Round(Abs$_Float_(Self.spin) / 3.14159265358979) * 180;
      if (err > 0.45 || impact > 8.5 || flipErr > 0.45) {
         v$4.multiplyScalar(0.72);
         Self.yaw$2 = Lerp(Self.yaw$2,Self.yaw$2 - WrapAngle(Self.yaw$2 - velYaw),0.6);
         TRiderPhysics.Emit(Self,"land",0,impact);
      } else {
         TRiderPhysics.Emit(Self,"land",1,impact);
      }
      if (Self.airTime$1 > 0.25) {
         TRiderPhysics.Emit(Self,"air",Self.airTime$1,rot$2);
      }
   }
   /// procedure TRiderPhysics.Reset(z: Float)
   ,Reset$2:function(Self, z$13) {
      var x$18 = 0,
         c$7 = null;
      c$7 = Self.course$5;
      x$18 = TCourse.cx(c$7,z$13);
      Self.pos$2.set(x$18,TCourse.height$4(c$7,x$18,z$13),z$13);
      Self.prevPos.copy(Self.pos$2);
      Self.vel$2.set(0,0,0);
      Self.yaw$2 = ArcTan2(TCourse.cxp(c$7,z$13),1);
      Self.prevYaw$1 = Self.yaw$2;
      Self.yawRate = 0;
      Self.edge$3 = 0;
      Self.prevEdge = 0;
      Self.grounded$1 = true;
      Self.airTime$1 = 0;
      Self.spin = 0;
      Self.Nsm = 765.18;
      Self.load$1 = 1;
      Self.latAcc$1 = 0;
      Self.skid = 0;
      Self.edgePressure = 0;
      Self.carveQ = 1;
      Self.charge$1 = 0;
      Self.jumpPrev = false;
      Self.brakeSide = -1;
      Self.catchT = 0;
      Self.maxEdgeNow = 0.95;
      Self.speed$2 = 0;
      Self.frozen = false;
      Self.tuck$2 = 0;
      Self.brake$2 = 0;
      Self.lastImpact = 0;
      Self.crashReason = "";
      Self.flip$1 = 0;
      Self.prevFlip = 0;
      Self.flipRate$1 = 0;
      Self.grab$2 = 0;
      Self.grabT$1 = 0;
      Self.armF = false;
      Self.armB = false;
      Self.lastTrick = null;
      TCourse.normal$1(c$7,Self.pos$2.x,Self.pos$2.z,Self.n$4);
      Self.boardUp.copy(Self.n$4);
      Self.prevBoardUp.copy(Self.n$4);
   }
   /// procedure TRiderPhysics.Step(dt: Float; input: TControls)
   ,Step$1:function(Self, dt, input$1) {
      var spd = 0,
         velYaw = 0,
         cda = 0,
         kd = 0,
         vf = 0,
         vl = 0,
         vfp = 0,
         groom$2 = 0,
         maxE = 0,
         eT = 0,
         ae = 0,
         sinE = 0,
         Rad = 0,
         aCarve = 0,
         aReq = 0,
         q$2 = 0,
         wT = 0,
         Nf = 0,
         vts = 0,
         mu = 0,
         muE = 0,
         Fmax = 0,
         Fdes = 0,
         Flat = 0,
         fIn = 0,
         h$3 = 0,
         Nraw = 0,
         vn = 0,
         impact = 0,
         cz$2 = 0,
         d$8 = 0,
         W$1 = 0,
         sp$1 = 0,
         lat$1 = 0,
         ns = 0,
         c$7 = null,
         v$4 = null,
         p$7 = null,
         a$110 = null,
         hd$2 = null,
         vt = null;
      c$7 = Self.course$5;
      v$4 = Self.vel$2;
      p$7 = Self.pos$2;
      a$110 = Self._a$1;
      Self.prevPos.copy(p$7);
      Self.prevYaw$1 = Self.yaw$2;
      Self.prevEdge = Self.edge$3;
      Self.prevBoardUp.copy(Self.boardUp);
      Self.prevFlip = Self.flip$1;
      if (Self.frozen) {
         return;
      }
      Self.tuck$2 = input$1.tuck;
      Self.brake$2 = input$1.brake;
      spd = v$4.length();
      TCourse.normal$1(c$7,p$7.x,p$7.z,Self.n$4);
      velYaw = (spd > 1)?ArcTan2(v$4.x,v$4.z):Self.yaw$2;
      a$110.set(0,-9.81,0);
      cda = Lerp(0.52,0.27,Self.tuck$2) + Self.brake$2 * 0.22;
      kd = 0.6 * cda / 78;
      a$110.addScaledVector(v$4,(-kd) * spd);
      if (Self.grounded$1) {
         hd$2 = Self._hd.set(Sin(Self.yaw$2),0,Cos(Self.yaw$2));
         Self.f$6.copy(hd$2).addScaledVector(Self.n$4,-hd$2.dot(Self.n$4)).normalize();
         Self.r$6.crossVectors(Self.f$6,Self.n$4);
         vf = v$4.dot(Self.f$6);
         vl = v$4.dot(Self.r$6);
         vfp = Max$_Float_Float_(vf,0);
         groom$2 = TCourse.groom$1(c$7,p$7.x,p$7.z);
         maxE = 0.95 * (1 - 0.55 * Self.tuck$2);
         Self.maxEdgeNow = maxE;
         eT = input$1.steer * maxE;
         if (Self.brake$2 > 0.05 && spd > 1.5) {
            if (!(Self.FBrakeWas)) {
               Self.brakeSide = (input$1.steer > 0.25)?1:-1;
            }
            eT = Lerp(eT,Self.brakeSide * 0.45,Self.brake$2);
         }
         Self.FBrakeWas = Self.brake$2 > 0.05;
         Self.edge$3 = Damp(Self.edge$3,eT,Lerp(7.5,4,Self.tuck$2),dt);
         ae = Abs$_Float_(Self.edge$3);
         sinE = Sin(ae);
         Rad = (7.5 + 0.085 * vfp * vfp) / Max$_Float_Float_(sinE,0.02);
         aCarve = vfp*vfp / Rad;
         aReq = 9.81 * Tan(ae) * 0.55;
         q$2 = (ae < 0.05)?1:Power(ClampF(aCarve / aReq,0,1),1.3);
         q$2 = Max$_Float_Float_(q$2,Max$_Float_Float_(Self.brake$2,ClampF(Abs$_Float_(vl) / 4,0,1) * 0.9));
         Self.carveQ = q$2;
         wT = (ae > 0.01)?(-SignF(Self.edge$3)) * vfp / Rad * q$2:0;
         wT += (-input$1.steer) * 2.3 * (1 - q$2) * (1 - 0.6 * Self.tuck$2);
         if (Self.brake$2 > 0.05 && spd > 1.5) {
            wT = Lerp(wT,WrapAngle(velYaw - Self.brakeSide * 1.35 - Self.yaw$2) * 5,Self.brake$2);
         }
         if (spd > 0.5) {
            wT += WrapAngle(velYaw - Self.yaw$2) * 1.4 * (1 - ae / 0.95) * (1 - Self.brake$2) * Min$_Float_Float_(spd / 3,1);
         }
         Self.yawRate = Damp(Self.yawRate,wT,12,dt);
         Self.yaw$2 += Self.yawRate * dt;
         Nf = Max$_Float_Float_(Self.Nsm,153.036 * Self.n$4.y);
         Self.load$1 = Nf / 765.18;
         vt = Self._t.copy(v$4).addScaledVector(Self.n$4,-v$4.dot(Self.n$4));
         vts = vt.length();
         mu = Lerp(0.17,0.045,groom$2);
         if (vts > 0.001) {
            a$110.addScaledVector(vt,(-Min$_Float_Float_(mu * Nf / 78,vts / dt)) / vts);
         }
         if (Self.tuck$2 > 0.5 && Self.brake$2 < 0.1 && vfp < 5.5) {
            a$110.addScaledVector(Self.f$6,4.6 * Self.tuck$2 * (1 - vfp / 5.5));
         }
         muE = (0.22 + 1.03 * sinE / 0.813415504789374) * (0.35 + 0.65 * q$2) * Lerp(0.72,1,groom$2);
         Fmax = muE * Nf;
         Fdes = -78 * vl / Max$_Float_Float_(0.045,dt);
         Flat = ClampF(Fdes,-Fmax,Fmax);
         a$110.addScaledVector(Self.r$6,Flat / 78);
         Self.latAcc$1 = Flat / 78;
         Self.edgePressure = Abs$_Float_(Flat) / 765.18 + (Nf / 765.18 - 1) * 0.3;
         Self.skid = Damp(Self.skid,Abs$_Float_(vl),12,dt);
         if (vl * Self.edge$3 > 0 && Abs$_Float_(vl) > 7 && ae > 0.4) {
            Self.catchT += dt;
            if (Self.catchT > 0.12) {
               TRiderPhysics.Crash(Self,"edge");
               return;
            }
         } else {
            Self.catchT = 0;
         }
         if (input$1.jump) {
            Self.charge$1 = Min$_Float_Float_(1,Self.charge$1 + dt / 0.35);
         } else if (Self.jumpPrev && Self.charge$1 > 0.02) {
            v$4.addScaledVector(Self.n$4,2.4 + 2.3 * Self.charge$1);
            Self.grounded$1 = false;
            Self.airTime$1 = 0;
            Self.spin = 0;
            Self.charge$1 = 0;
            TRiderPhysics.Takeoff(Self,input$1);
            TRiderPhysics.Emit(Self,"ollie",0,0);
         } else {
            Self.charge$1 = 0;
         }
         Self.boardUp.lerp(Self.n$4,1 - Exp(-20 * dt)).normalize();
         Self.grab$2 = Damp(Self.grab$2,0,14,dt);
      } else {
         Self.yawRate = Damp(Self.yawRate,(-input$1.steer) * 5.5,6,dt);
         Self.yaw$2 += Self.yawRate * dt;
         Self.spin += Self.yawRate * dt;
         Self.edge$3 = Damp(Self.edge$3,0,4,dt);
         Self.airTime$1 += dt;
         Self.charge$1 = 0;
         if (input$1.tuck < 0.3) {
            Self.armF = true;
         }
         if (input$1.brake < 0.3) {
            Self.armB = true;
         }
         fIn = ((Self.armF)?input$1.tuck:0) - ((Self.armB)?input$1.brake:0);
         Self.flipRate$1 = Damp(Self.flipRate$1,(Self.airTime$1 > 0.06)?fIn * 8.5:0,9,dt);
         Self.flip$1 += Self.flipRate$1 * dt;
         Self.grab$2 = Damp(Self.grab$2,(input$1.grab)?1:0,12,dt);
         if (Self.grab$2 > 0.6) {
            Self.grabT$1 += dt;
         }
         Self.latAcc$1 = Damp(Self.latAcc$1,0,5,dt);
         Self.skid = Damp(Self.skid,0,5,dt);
         Self.edgePressure = 0;
         TCourse.normal$1(c$7,p$7.x,p$7.z,Self._n2);
         Self.boardUp.lerp(Self._n2,1 - Exp(-3.2 * dt)).normalize();
         Self.load$1 = 0;
      }
      Self.jumpPrev = input$1.jump;
      v$4.addScaledVector(a$110,dt);
      p$7.addScaledVector(v$4,dt);
      h$3 = TCourse.height$4(c$7,p$7.x,p$7.z);
      Nraw = 0;
      if (p$7.y <= h$3) {
         p$7.y = h$3;
         TCourse.normal$1(c$7,p$7.x,p$7.z,Self._n2);
         vn = v$4.dot(Self._n2);
         impact = 0;
         if (vn < 0) {
            v$4.addScaledVector(Self._n2,-vn);
            impact = -vn;
         }
         Nraw = 78 * impact / dt;
         if (!(Self.grounded$1)) {
            Self.grounded$1 = true;
            TRiderPhysics.Land(Self,impact);
            if (Self.crashReason != "") {
               return;
            }
         }
      } else if (Self.grounded$1 && p$7.y - h$3 > 0.12) {
         Self.grounded$1 = false;
         Self.airTime$1 = 0;
         Self.spin = 0;
         TRiderPhysics.Takeoff(Self,input$1);
         TRiderPhysics.Emit(Self,"takeoff",0,0);
      }
      Self.Nsm += (Nraw - Self.Nsm) * (1 - Exp((-dt) / 0.035));
      cz$2 = TCourse.cx(c$7,p$7.z);
      d$8 = p$7.x - cz$2;
      W$1 = TCourse.width$4(c$7,p$7.z);
      ns = TCourse.netSide(c$7,p$7.z);
      sp$1 = v$4.length();
      if ((ns!=0) && SignF(d$8) == ns && Abs$_Float_(d$8) > W$1 + 1.9) {
         if (sp$1 > 15) {
            TRiderPhysics.Crash(Self,"net");
            return;
         }
         p$7.x = cz$2 + ns * (W$1 + 1.7);
         lat$1 = v$4.x;
         v$4.x = (-lat$1) * 0.3;
         v$4.multiplyScalar(0.6);
         TRiderPhysics.Emit(Self,"bump",0.6,0);
      }
      if (Abs$_Float_(d$8) > W$1 + 8 && TTerrain.HitTree(Self.terrain$1,p$7.x,p$7.z,0.35)) {
         TRiderPhysics.Crash(Self,"tree");
         return;
      }
      if (Abs$_Float_(d$8) > W$1 + 4 && !!Self.terrain$1.resort$1 && TResort.Hit(Self.terrain$1.resort$1,p$7.x,p$7.z,0.35)) {
         TRiderPhysics.Crash(Self,"obstacle");
         return;
      }
      if (Abs$_Float_(d$8) > W$1 + 140 || (!(Number.isFinite(p$7.x + p$7.y + p$7.z)))) {
         TRiderPhysics.Crash(Self,"lost");
         return;
      }
      Self.speed$2 = sp$1;
   }
   /// procedure TRiderPhysics.Takeoff(input: TControls)
   ,Takeoff:function(Self, input$1) {
      Self.flip$1 = 0;
      Self.prevFlip = 0;
      Self.flipRate$1 = 0;
      Self.grabT$1 = 0;
      Self.armF = input$1.tuck < 0.3;
      Self.armB = input$1.brake < 0.3;
   }
   ,Destroy:TObject.Destroy
};
/// TRiderAnimator = class (TObject)
var TRiderAnimator = {
   $ClassName:"TRiderAnimator",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.bc = $.bend = $.comp$2 = $.hL = $.hLv = $.hR = $.hRv = $.lean$1 = $.look = $.rot$1 = $.t$5 = null;
      $.edge = 0;
      $.jnt = [];
   }
   /// procedure TRiderAnimator.ClampArm(sh: JVector3; h: JVector3)
   ,ClampArm:function(Self, sh$1, h$3) {
      var l$1 = 0,
         mx = 0,
         d$8 = null;
      d$8 = Self.t$5.tmp2$2.subVectors(h$3,sh$1);
      l$1 = d$8.length();
      mx = 0.441;
      if (l$1 > mx) {
         h$3.copy(sh$1).addScaledVector(d$8,mx / l$1);
      }
   }
   /// constructor TRiderAnimator.Create()
   ,Create$144:function(Self) {
      Self.jnt = NewJoints();
      Self.comp$2 = TSpring.Create$71($New(TSpring),0.2,0);
      Self.lean$1 = TSpring.Create$71($New(TSpring),0,0);
      Self.rot$1 = TSpring.Create$71($New(TSpring),0.42,0);
      Self.bend = TSpring.Create$71($New(TSpring),0.25,0);
      Self.hL = new THREE.Vector3(0.3,1,0.3);
      Self.hLv = new THREE.Vector3();
      Self.hR = new THREE.Vector3(-0.3,1,0.3);
      Self.hRv = new THREE.Vector3();
      Self.bc = new THREE.Vector3();
      Self.edge = 0;
      Self.look = new THREE.Vector3(1,0,0.3);
      Self.t$5 = TAnimTemps.Create$146($New(TAnimTemps));
      return Self
   }
   /// procedure TRiderAnimator.HandSpring(p: JVector3; v: JVector3; target: JVector3; s: TAnimState; dt: Float)
   ,HandSpring:function(Self, p$7, v$4, target$3, s$12, dt) {
      var acc$2 = null;
      acc$2 = Self.t$5.acc$1;
      acc$2.subVectors(target$3,p$7).multiplyScalar(110).addScaledVector(v$4,-13);
      acc$2.z -= s$12.latAcc * 0.9;
      acc$2.y -= (s$12.load - 1) * 9.81 * 0.6;
      v$4.addScaledVector(acc$2,dt);
      p$7.addScaledVector(v$4,dt);
   }
   /// procedure TRiderAnimator.Kick(amount: Float)
   ,Kick:function(Self, amount) {
      Self.comp$2.v$1 += amount;
   }
   /// procedure TRiderAnimator.Update(dt: Float; s: TAnimState)
   ,Update$3:function(Self, dt, s$12) {
      var en = 0,
         heel = 0,
         toe = 0,
         compT = 0,
         leanT = 0,
         rotT = 0,
         bendT = 0,
         grb = 0,
         cmp = 0,
         ln = 0,
         rho = 0,
         bnd = 0,
         e$1 = 0,
         es = 0,
         ce = 0,
         se = 0,
         H$5 = 0,
         cl = 0,
         sl = 0,
         pz = 0,
         rp$1 = 0,
         dl = 0,
         dr$1 = 0,
         mx = 0,
         air = 0,
         spread = 0,
         ka = 0,
         it = 0,
         jt$1 = [],
         tg = null;
      dt = Min$_Float_Float_(dt,0.0333333333333333);
      jt$1 = Self.jnt;
      en = ClampF(s$12.edge$2 / 0.95,-1,1);
      heel = Max$_Float_Float_(0,-en);
      toe = Max$_Float_Float_(0,en);
      compT = 0.2 + 0.5 * s$12.tuck$1 + 0.45 * s$12.charge + 0.18 * s$12.brake$1 + 0.12 * heel + 0.06 * toe + ClampF((s$12.load - 1) * 0.25,-0.08,0.3);
      leanT = ClampF(ArcTan2(s$12.latAcc,Max$_Float_Float_(s$12.load * 9.81,3)),-0.85,0.85) + en * 0.08;
      rotT = 0.42 - 0.3 * toe + 0.25 * heel + 0.2 * s$12.tuck$1 + 0.15 * s$12.brake$1;
      bendT = 0.22 + 0.55 * s$12.tuck$1 + 0.18 * heel + 0.3 * s$12.charge - 0.05 * toe;
      if (!(s$12.grounded)) {
         compT = 0.3 + 0.35 * Smoothstep(0,0.35,s$12.airTime);
         leanT = 0;
         bendT = 0.35;
      }
      grb = s$12.grab$1;
      compT = Max$_Float_Float_(compT,0.9 * grb);
      bendT += 0.45 * grb;
      if (s$12.idle) {
         compT = 0.12;
         leanT = 0;
         rotT = 0.5;
         bendT = 0.12;
      }
      SpringStep(Self.comp$2,compT,140,17,dt);
      Self.comp$2.x$3 = ClampF(Self.comp$2.x$3,-0.1,0.95);
      SpringStep(Self.lean$1,leanT,70,13,dt);
      SpringStep(Self.rot$1,rotT,60,12,dt);
      SpringStep(Self.bend,bendT + Self.comp$2.x$3 * 0.22,80,14,dt);
      cmp = Self.comp$2.x$3;
      ln = Self.lean$1.x$3;
      rho = Self.rot$1.x$3;
      bnd = Self.bend.x$3;
      e$1 = s$12.edge$2;
      es = SignF(e$1) * 0.125;
      Self.bc.set(0,es * Sin(e$1),es * (1 - Cos(e$1)));
      Self.edge = e$1;
      ce = Cos(e$1);
      se = Sin(e$1);
      jt$1[13].set(0.3,0.17 * ce,0.17 * se).add(Self.bc);
      jt$1[16].set(-0.3,0.17 * ce,0.17 * se).add(Self.bc);
      H$5 = 0.17 + 0.466 * (0.95 - 0.45 * cmp);
      cl = Cos(ln);
      sl = Sin(ln);
      pz = -0.05 * cmp;
      jt$1[0].set(0.02 + Self.bc.x,Self.bc.y + H$5 * cl - pz * sl,Self.bc.z + H$5 * sl + pz * cl);
      rp$1 = rho * 0.55;
      Self.t$5.Lp.set(Cos(rp$1),0,-Sin(rp$1));
      RotX(Self.t$5.Lp,ln);
      Self.t$5.upP.set(0,1,0);
      RotX(Self.t$5.upP,ln);
      jt$1[11].copy(jt$1[0]).addScaledVector(Self.t$5.Lp,0.15).addScaledVector(Self.t$5.upP,-0.05);
      jt$1[14].copy(jt$1[0]).addScaledVector(Self.t$5.Lp,-0.15).addScaledVector(Self.t$5.upP,-0.05);
      for(it=0;it<=1;it++) {
         dl = jt$1[11].distanceTo(jt$1[13]);
         dr$1 = jt$1[14].distanceTo(jt$1[16]);
         mx = Max$_Float_Float_(dl,dr$1) - 0.446;
         if (mx > 0) {
            jt$1[0].addScaledVector(Self.t$5.upP,-mx);
            jt$1[11].addScaledVector(Self.t$5.upP,-mx);
            jt$1[14].addScaledVector(Self.t$5.upP,-mx);
         }
      }
      Self.t$5.F.set(Sin(rho),0,Cos(rho));
      Self.t$5.L$2.set(Cos(rho),0,-Sin(rho));
      Self.t$5.up$3.set(0,1,0);
      Self.t$5.spine.copy(Self.t$5.up$3).multiplyScalar(Cos(bnd)).addScaledVector(Self.t$5.F,Sin(bnd));
      RotX(Self.t$5.spine,ln * 0.75);
      RotX(Self.t$5.L$2,ln * 0.75);
      RotX(Self.t$5.F,ln * 0.4);
      jt$1[1].copy(jt$1[0]).addScaledVector(Self.t$5.spine,0.277);
      Self.t$5.upH.copy(Self.t$5.spine).addScaledVector(Self.t$5.up$3,0.9).normalize();
      jt$1[2].copy(jt$1[1]).addScaledVector(Self.t$5.upH,0.155);
      jt$1[3].copy(jt$1[2]).addScaledVector(Self.t$5.upH,0.279);
      Self.t$5.tmp$2.set(s$12.velLocal.x,0,s$12.velLocal.z);
      if (Self.t$5.tmp$2.lengthSq() < 1) {
         Self.t$5.tmp$2.set(1,0,0.3);
      }
      Self.t$5.tmp$2.normalize();
      if (s$12.grounded) {
         Self.t$5.tmp$2.addScaledVector(Self.t$5.F,0.35).normalize();
      }
      Self.look.lerp(Self.t$5.tmp$2,1 - Exp(-8 * dt)).normalize();
      jt$1[4].copy(jt$1[3]).addScaledVector(Self.look,0.2);
      jt$1[5].copy(jt$1[1]).addScaledVector(Self.t$5.L$2,0.22).addScaledVector(Self.t$5.spine,0.03);
      jt$1[8].copy(jt$1[1]).addScaledVector(Self.t$5.L$2,-0.22).addScaledVector(Self.t$5.spine,0.03);
      Self.t$5.pole$1.copy(Self.t$5.F).add(Self.t$5.tmp2$2.set(-0.3,0.15,0));
      SolveIK(jt$1[11],jt$1[13],0.233,0.233,Self.t$5.pole$1,jt$1[12]);
      Self.t$5.pole$1.copy(Self.t$5.F).add(Self.t$5.tmp2$2.set(0.3,0.15,0));
      SolveIK(jt$1[14],jt$1[16],0.233,0.233,Self.t$5.pole$1,jt$1[15]);
      air = (s$12.grounded)?0:1;
      spread = 0.25 + 0.4 * Abs$_Float_(en) + air * 0.55 + 0.3 * s$12.brake$1 + ((s$12.idle)?-0.2:0);
      tg = Self.t$5.tgt;
      ka = 0.8;
      tg.copy(jt$1[5]).addScaledVector(Self.t$5.L$2,ka * (0.15 + spread * 0.3)).addScaledVector(Self.t$5.F,ka * (0.25 + 0.15 * heel + 0.1 * toe - 0.15 * s$12.charge)).addScaledVector(Self.t$5.up$3,(-ka) * (0.42 - spread * 0.28 + 0.1 * toe));
      if (s$12.tuck$1 > 0.01) {
         tg.lerp(Self.t$5.tmp2$2.copy(jt$1[12]).addScaledVector(Self.t$5.F,0.14).addScaledVector(Self.t$5.up$3,0.08),s$12.tuck$1 * 0.85);
      }
      TRiderAnimator.HandSpring(Self,Self.hL,Self.hLv,tg,s$12,dt);
      tg.copy(jt$1[8]).addScaledVector(Self.t$5.L$2,(-ka) * (0.15 + spread * 0.3)).addScaledVector(Self.t$5.F,ka * (0.18 + 0.1 * heel + 0.1 * toe - 0.15 * s$12.charge)).addScaledVector(Self.t$5.up$3,(-ka) * (0.45 - spread * 0.3 + 0.1 * toe));
      if (s$12.tuck$1 > 0.01) {
         tg.lerp(Self.t$5.tmp2$2.copy(jt$1[15]).addScaledVector(Self.t$5.F,0.14).addScaledVector(Self.t$5.up$3,0.1),s$12.tuck$1 * 0.85);
      }
      TRiderAnimator.HandSpring(Self,Self.hR,Self.hRv,tg,s$12,dt);
      if (grb > 0.01) {
         jt$1[13].y += 0.12 * grb;
         jt$1[16].y += 0.12 * grb;
         Self.hR.lerp(Self.t$5.tmp2$2.set(Self.bc.x - 0.04,Self.bc.y + 0.08 + 0.12 * grb,Self.bc.z + 0.17),grb);
         Self.hL.lerp(Self.t$5.tmp2$2.copy(jt$1[5]).addScaledVector(Self.t$5.L$2,0.3).addScaledVector(Self.t$5.up$3,0.18),grb * 0.8);
         SolveIK(jt$1[11],jt$1[13],0.233,0.233,Self.t$5.pole$1.copy(Self.t$5.F).add(Self.t$5.tmp$2.set(-0.3,0.15,0)),jt$1[12]);
         SolveIK(jt$1[14],jt$1[16],0.233,0.233,Self.t$5.pole$1.copy(Self.t$5.F).add(Self.t$5.tmp$2.set(0.3,0.15,0)),jt$1[15]);
      }
      TRiderAnimator.ClampArm(Self,jt$1[5],Self.hL);
      TRiderAnimator.ClampArm(Self,jt$1[8],Self.hR);
      jt$1[7].copy(Self.hL);
      jt$1[10].copy(Self.hR);
      Self.t$5.pole$1.copy(Self.t$5.up$3).multiplyScalar(-0.8).addScaledVector(Self.t$5.F,-0.4).addScaledVector(Self.t$5.L$2,0.4);
      SolveIK(jt$1[5],jt$1[7],0.237,0.214,Self.t$5.pole$1,jt$1[6]);
      Self.t$5.pole$1.copy(Self.t$5.up$3).multiplyScalar(-0.8).addScaledVector(Self.t$5.F,-0.4).addScaledVector(Self.t$5.L$2,-0.4);
      SolveIK(jt$1[8],jt$1[10],0.237,0.214,Self.t$5.pole$1,jt$1[9]);
   }
   ,Destroy:TObject.Destroy
};
/// TRagdoll = class (TObject)
var TRagdoll = {
   $ClassName:"TRagdoll",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.contact = [];
      $.course$4 = $.rest = $._d = null;
      $.netHit = false;
      $.o = [];
      $.p$4 = [];
      $.speed$1 = 0;
   }
   /// constructor TRagdoll.Create(c: TCourse)
   ,Create$145:function(Self, c$7) {
      Self.course$4 = c$7;
      Self.rest = new Float32Array($Div(RAG_LINKS.length,2));
      for(let i$6=0;i$6<=16;i$6++) {
         Self.p$4.push(new THREE.Vector3());
         Self.o.push(new THREE.Vector3());
         Self.contact.push(false);
      }
      Self._d = new THREE.Vector3();
      Self.speed$1 = 0;
      return Self
   }
   /// procedure TRagdoll.Start(joints: TJoints; vel: JVector3; dt: Float)
   ,Start:function(Self, joints, vel$5, dt) {
      var tumble = 0,
         a$229 = 0,
         i$6 = 0,
         a$230 = [0,0,0,0,0,0];
      for(let i$7=0;i$7<=16;i$7++) {
         Self.p$4[i$7].copy(joints[i$7]);
         Self.o[i$7].copy(joints[i$7]).addScaledVector(vel$5,-dt);
      }
      tumble = 0.35 + Random() * 0.3;
      a$230 = [3, 4, 2, 1, 5, 8];
      for(a$229=0;a$229<=5;a$229++) {
         i$6 = a$230[a$229];
         Self.o[i$6].addScaledVector(vel$5,(-dt) * tumble);
         Self.o[i$6].y -= dt * 1.5;
      }
      for(let k$4=0,$temp133=($Div(RAG_LINKS.length,2));k$4<$temp133;k$4++) {
         Self.rest[k$4]=joints[RAG_LINKS[k$4*2]].distanceTo(joints[RAG_LINKS[(k$4*2) + 1]]);
      }
   }
   /// procedure TRagdoll.Step(dt: Float)
   ,Step:function(Self, dt) {
      var g$8 = 0,
         sp$1 = 0,
         vx = 0,
         vy = 0,
         vz = 0,
         l$1 = 0,
         corr = 0,
         rad = 0,
         h$3 = 0,
         cz$2 = 0,
         lim = 0,
         d$8 = 0,
         i$6 = 0,
         it = 0,
         k$4 = 0,
         ns = 0,
         c$7 = null,
         pp = null,
         oo = null,
         a$110 = null,
         b$8 = null,
         dv = null,
         pp$1 = null,
         oo$1 = null,
         pp$2 = null,
         oo$2 = null;
      g$8 = 9.81 * dt * dt;
      c$7 = Self.course$4;
      sp$1 = 0;
      for(i$6=0;i$6<=16;i$6++) {
         pp = Self.p$4[i$6];
         oo = Self.o[i$6];
         vx = (pp.x - oo.x) * 0.998;
         vy = (pp.y - oo.y) * 0.998;
         vz = (pp.z - oo.z) * 0.998;
         oo.copy(pp);
         pp.x += vx;
         pp.y += vy - g$8;
         pp.z += vz;
         sp$1 += vx*vx + vy*vy + vz*vz;
      }
      Self.speed$1 = Sqrt(sp$1 / 17) / dt;
      for(it=0;it<=7;it++) {
         var $temp134;
         for(k$4=0,$temp134=($Div(RAG_LINKS.length,2));k$4<$temp134;k$4++) {
            a$110 = Self.p$4[RAG_LINKS[k$4*2]];
            b$8 = Self.p$4[RAG_LINKS[(k$4*2) + 1]];
            dv = Self._d.subVectors(b$8,a$110);
            l$1 = dv.length();
            if (l$1 == 0) {
               l$1 = 1E-6;
            }
            corr = (l$1 - Self.rest[k$4]) / l$1 * 0.5;
            a$110.addScaledVector(dv,corr);
            b$8.addScaledVector(dv,-corr);
         }
         if (((it % 2)==0) || it == 7) {
            for(i$6=0;i$6<=16;i$6++) {
               pp$1 = Self.p$4[i$6];
               rad = (i$6 == 3)?0.25:(i$6 == 1 || (i$6==0))?0.14:0.07;
               h$3 = TCourse.height$4(c$7,pp$1.x,pp$1.z) + rad;
               if (pp$1.y < h$3) {
                  pp$1.y = h$3;
                  Self.contact[i$6]=true;
               }
               ns = TCourse.netSide(c$7,pp$1.z);
               if ((ns!=0) && pp$1.y < h$3 + 1.4) {
                  cz$2 = TCourse.cx(c$7,pp$1.z);
                  lim = TCourse.width$4(c$7,pp$1.z) + 1.7 - rad;
                  d$8 = pp$1.x - cz$2;
                  if (ns * d$8 > lim) {
                     oo$1 = Self.o[i$6];
                     vx = pp$1.x - oo$1.x;
                     pp$1.x = cz$2 + ns * lim;
                     oo$1.x = pp$1.x + vx * 0.2;
                     oo$1.z = pp$1.z - (pp$1.z - oo$1.z) * 0.92;
                     Self.netHit = true;
                  }
               }
            }
         }
      }
      for(i$6=0;i$6<=16;i$6++) {
         if (Self.contact[i$6]) {
            pp$2 = Self.p$4[i$6];
            oo$2 = Self.o[i$6];
            Self.contact[i$6]=false;
            oo$2.x = pp$2.x - (pp$2.x - oo$2.x) * 0.968;
            oo$2.z = pp$2.z - (pp$2.z - oo$2.z) * 0.968;
            oo$2.y = pp$2.y;
         }
      }
   }
   ,Destroy:TObject.Destroy
};
/// TPoseState = class (TObject)
var TPoseState = {
   $ClassName:"TPoseState",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.anim = $.pos$1 = $.up$2 = $.vel$1 = null;
      $.edge$1 = $.flip = $.yaw$1 = 0;
   }
   ,Destroy:TObject.Destroy
};
/// TAnimTemps = class (TObject)
var TAnimTemps = {
   $ClassName:"TAnimTemps",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.acc$1 = $.F = $.L$2 = $.Lp = $.pole$1 = $.spine = $.tgt = $.tmp$2 = $.tmp2$2 = $.up$3 = $.upH = $.upP = null;
   }
   /// constructor TAnimTemps.Create()
   ,Create$146:function(Self) {
      Self.F = new THREE.Vector3();
      Self.L$2 = new THREE.Vector3();
      Self.up$3 = new THREE.Vector3();
      Self.spine = new THREE.Vector3();
      Self.upH = new THREE.Vector3();
      Self.tmp$2 = new THREE.Vector3();
      Self.tmp2$2 = new THREE.Vector3();
      Self.pole$1 = new THREE.Vector3();
      Self.tgt = new THREE.Vector3();
      Self.Lp = new THREE.Vector3();
      Self.upP = new THREE.Vector3();
      Self.acc$1 = new THREE.Vector3();
      return Self
   }
   ,Destroy:TObject.Destroy
};
/// TAnimState = class (TObject)
var TAnimState = {
   $ClassName:"TAnimState",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.airTime = $.brake$1 = $.charge = $.edge$2 = $.grab$1 = $.latAcc = $.load = $.tuck$1 = 0;
      $.grounded = $.idle = false;
      $.velLocal = null;
   }
   /// constructor TAnimState.Create()
   ,Create$147:function(Self) {
      Self.velLocal = new THREE.Vector3();
      Self.load = 1;
      return Self
   }
   ,Destroy:TObject.Destroy
};
function SolveIK(a$110, t$11, l1, l2, pole$2, outV) {
   var dist = 0,
      cosA = 0,
      sinA = 0,
      d$3 = null,
      b$6 = null;
   InitTemps();
   d$3 = _ikD.subVectors(t$11,a$110);
   dist = d$3.length();
   if (dist < 0.0001) {
      outV.copy(a$110).addScaledVector(pole$2,l1);
      return;
   }
   d$3.divideScalar(dist);
   dist = Min$_Float_Float_(dist,l1 + l2 - 0.0001);
   cosA = ClampF((l1*l1 + dist*dist - l2*l2) / (2 * l1 * dist),-1,1);
   sinA = Sqrt(1 - cosA*cosA);
   b$6 = _ikB.copy(pole$2).addScaledVector(d$3,-pole$2.dot(d$3));
   if (b$6.lengthSq() < 1E-8) {
      b$6.set(0,1,0);
   }
   b$6.normalize();
   outV.copy(a$110).addScaledVector(d$3,cosA * l1).addScaledVector(b$6,sinA * l1);
}
function RotX(v$4, a$110) {
   var Result = null;
   var c$6 = 0,
      s$8 = 0,
      y$8 = 0,
      z$9 = 0;
   c$6 = Cos(a$110);
   s$8 = Sin(a$110);
   y$8 = v$4.y;
   z$9 = v$4.z;
   v$4.y = y$8 * c$6 - z$9 * s$8;
   v$4.z = y$8 * s$8 + z$9 * c$6;
   Result = v$4;
   return Result
}
function RotateRiderPose(wj$3, boardPos$3, boardQ$3, pivot, axis, ang, q$2) {
   var a$93 = 0,
      w$5 = null;
   q$2.setFromAxisAngle(axis,-ang);
   var $temp135;
   for(a$93=0,$temp135=wj$3.length;a$93<$temp135;a$93++) {
      w$5 = wj$3[a$93];
      w$5.sub(pivot).applyQuaternion(q$2).add(pivot);
   }
   boardPos$3.sub(pivot).applyQuaternion(q$2).add(pivot);
   boardQ$3.premultiply(q$2);
}
/// RIG = class (TObject)
var RIG = {
   $ClassName:"RIG",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   ,Destroy:TObject.Destroy
};
function PoseR() {
   var Result = null;
   InitTemps();
   Result = _pvR;
   return Result
}
function PoseFromState(anim$3, st$3, dt, wj$3, boardPos$3, boardQ$3) {
   var up$4 = null,
      f$5 = null,
      r$5 = null,
      S = null,
      lj = [],
      bc$1 = null,
      l$1 = null;
   InitTemps();
   up$4 = st$3.up$2;
   f$5 = _pvF;
   r$5 = _pvR;
   S = st$3.anim;
   _pvHd.set(Sin(st$3.yaw$1),0,Cos(st$3.yaw$1));
   f$5.copy(_pvHd).addScaledVector(up$4,-_pvHd.dot(up$4)).normalize();
   r$5.crossVectors(f$5,up$4);
   S.edge$2 = st$3.edge$1;
   S.velLocal.set(st$3.vel$1.dot(f$5),st$3.vel$1.dot(up$4),st$3.vel$1.dot(r$5));
   TRiderAnimator.Update$3(anim$3,dt,S);
   lj = anim$3.jnt;
   bc$1 = anim$3.bc;
   for(let i$6=0;i$6<=16;i$6++) {
      l$1 = lj[i$6];
      wj$3[i$6].copy(st$3.pos$1).addScaledVector(f$5,l$1.x).addScaledVector(up$4,l$1.y).addScaledVector(r$5,l$1.z);
   }
   boardPos$3.copy(st$3.pos$1).addScaledVector(f$5,bc$1.x).addScaledVector(up$4,bc$1.y).addScaledVector(r$5,bc$1.z);
   boardQ$3.setFromRotationMatrix(_pvM.makeBasis(f$5,up$4,r$5)).multiply(_pvQe.setFromAxisAngle(_pvX,st$3.edge$1));
   if (st$3.flip != 0) {
      RotateRiderPose(wj$3,boardPos$3,boardQ$3,_pvPiv.copy(st$3.pos$1).addScaledVector(up$4,0.55),r$5,st$3.flip,_pvFq);
   }
}
function PoseF() {
   var Result = null;
   InitTemps();
   Result = _pvF;
   return Result
}
function NewJoints() {
   var Result = [];
   for(let i$6=0;i$6<=16;i$6++) {
      Result.push(new THREE.Vector3());
   }
   return Result
}
/// J = class (TObject)
var J = {
   $ClassName:"J",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   ,Destroy:TObject.Destroy
};
function InitTemps() {
   if (!!_ikD) {
      return;
   }
   _ikD = new THREE.Vector3();
   _ikB = new THREE.Vector3();
   _pvF = new THREE.Vector3();
   _pvR = new THREE.Vector3();
   _pvHd = new THREE.Vector3();
   _pvM = new THREE.Matrix4();
   _pvQe = new THREE.Quaternion();
   _pvX = new THREE.Vector3(1,0,0);
   _pvPiv = new THREE.Vector3();
   _pvFq = new THREE.Quaternion();
}
/// TRiderTemps = class (TObject)
var TRiderTemps = {
   $ClassName:"TRiderTemps",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.a$94 = $.ax = $.b$7 = $.m$2 = $.p$5 = $.q = $.qe$1 = $.s$9 = $.x$12 = $.y$9 = $.z$10 = null;
   }
   ,Destroy:TObject.Destroy
};
/// TRiderColors = class (TObject)
var TRiderColors = {
   $ClassName:"TRiderColors",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.deck = $.helmet = $.jacket = $.pants = 0;
   }
   /// constructor TRiderColors.Create(j: Integer; p: Integer; h: Integer; d: Integer)
   ,Create$148:function(Self, j, p$7, h$3, d$8) {
      Self.jacket = j;
      Self.pants = p$7;
      Self.helmet = h$3;
      Self.deck = d$8;
      return Self
   }
   ,Destroy:TObject.Destroy
};
/// TRider = class (TObject)
var TRider = {
   $ClassName:"TRider",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.board = $.elbL = $.elbR = $.farmL = $.farmR = $.handL = $.handR = $.head = $.hipL = $.hipR = $.kneeL = $.kneeR = $.matHelmet = $.matJacket = $.matPants = $.neck$1 = $.pelvis = $.root = $.shinL = $.shinR = $.shoL = $.shoR = $.t$6 = $.thighL = $.thighR = $.torso = $.uarmL = $.uarmR = null;
      $.deckU = undefined;
   }
   /// constructor TRider.Create(scene: JScene; envMap: Variant = nil)
   ,Create$149:function(Self, scene$1, envMap) {
      var jacket$1 = null,
         pants$1 = null,
         helmet$1 = null,
         goggle$1 = null,
         glove$1 = null,
         strap$1 = null,
         boot$1 = null,
         skin$1 = null,
         hair$1 = null,
         bind = null,
         deckMat = null,
         dU,
         rt = null,
         mk = null,
         sub$1 = null,
         mitt = null,
         a$231 = 0,
         yy$1 = 0,
         a$232 = 0,
         sx = 0,
         deck$2 = null,
         bx = 0,
         ang = 0,
         b$8 = null,
         hb = null,
         a$233 = [0,0],
         a$234 = [0,0];
      jacket$1 = new THREE.MeshPhysicalMaterial({
         "sheenRoughness" : 0.5
         ,"sheenColor" : new THREE.Color(16751232)
         ,"sheen" : 0.6
         ,"roughness" : 0.55
         ,"color" : 14697516
      });
      pants$1 = new THREE.MeshPhysicalMaterial({
         "sheenColor" : new THREE.Color(6719675)
         ,"sheen" : 0.4
         ,"roughness" : 0.8
         ,"color" : 2241618
      });
      helmet$1 = new THREE.MeshPhysicalMaterial({
         "roughness" : 0.25
         ,"color" : 15856630
         ,"clearcoatRoughness" : 0.08
         ,"clearcoat" : 1
      });
      goggle$1 = new THREE.MeshPhysicalMaterial({
         "roughness" : 0.06
         ,"metalness" : 0.9
         ,"iridescenceThicknessRange" : [200,600]
         ,"iridescenceIOR" : 1.6
         ,"iridescence" : 1
         ,"color" : 2759178
         ,"clearcoat" : 1
      });
      glove$1 = Std(1382172,0.6);
      strap$1 = Std(1688575,0.6);
      boot$1 = Std(2764083,0.7);
      skin$1 = Std(14263171,0.7);
      hair$1 = Std(4860954,0.9);
      bind = Std(855827,0.4);
      deckMat = new THREE.MeshPhysicalMaterial({
         "roughness" : 0.3
         ,"clearcoat" : 0.8
      });
      dU = Uniform(new THREE.Color(1779256));
      Self.matJacket = jacket$1;
      Self.matPants = pants$1;
      Self.matHelmet = helmet$1;
      Self.deckU = dU;
      deckMat.onBeforeCompile = function (sh$1) {
         sh$1.uniforms.uDeck = dU;
         sh$1.uniforms.uTip = Uniform(new THREE.Color(16731438));
         sh$1.vertexShader = JsReplace(JsReplace(String(sh$1.vertexShader),"#include <common>","#include <common>\nvarying float vBx;"),"#include <begin_vertex>","#include <begin_vertex>\nvBx = position.x;");
         sh$1.fragmentShader = JsReplace(JsReplace(String(sh$1.fragmentShader),"#include <common>","#include <common>\nvarying float vBx; uniform vec3 uDeck; uniform vec3 uTip;"),"#include <color_fragment>","#include <color_fragment>\n  diffuseColor.rgb = abs(vBx) > 0.6 ? uTip : uDeck;");
      };
      Self.root = new THREE.Group();
      scene$1.add(Self.root);
      rt = Self.root;
      mk = function (geo, mat$3) {
         var Result = null;
         Result = new THREE.Mesh(geo,mat$3);
         Result.castShadow = true;
         Result.matrixAutoUpdate = false;
         rt.add(Result);
         return Result
      };
      sub$1 = function (parent$2, geo, mat$3, x$18, y$13, z$13) {
         var Result = null;
         Result = new THREE.Mesh(geo,mat$3);
         Result.position.set(x$18,y$13,z$13);
         Result.castShadow = true;
         parent$2.add(Result);
         return Result
      };
      Self.thighL = mk(SegGeo(0.13,0.12,10),pants$1);
      Self.thighR = mk(SegGeo(0.13,0.12,10),pants$1);
      Self.shinL = mk(SegGeo(0.12,0.115,10),pants$1);
      Self.shinR = mk(SegGeo(0.12,0.115,10),pants$1);
      Self.uarmL = mk(SegGeo(0.105,0.095,10),jacket$1);
      Self.uarmR = mk(SegGeo(0.105,0.095,10),jacket$1);
      Self.farmL = mk(SegGeo(0.095,0.088,10),jacket$1);
      Self.farmR = mk(SegGeo(0.095,0.088,10),jacket$1);
      Self.neck$1 = mk(SegGeo(0.13,0.12,10),jacket$1);
      Self.kneeL = mk(new THREE.SphereGeometry(0.12,14,10,0,6.28318530717959,0,3.14159265358979),pants$1);
      Self.kneeR = mk(new THREE.SphereGeometry(0.12,14,10,0,6.28318530717959,0,3.14159265358979),pants$1);
      Self.elbL = mk(new THREE.SphereGeometry(0.095,14,10,0,6.28318530717959,0,3.14159265358979),jacket$1);
      Self.elbR = mk(new THREE.SphereGeometry(0.095,14,10,0,6.28318530717959,0,3.14159265358979),jacket$1);
      Self.shoL = mk(new THREE.SphereGeometry(0.11,14,10,0,6.28318530717959,0,3.14159265358979),jacket$1);
      Self.shoR = mk(new THREE.SphereGeometry(0.11,14,10,0,6.28318530717959,0,3.14159265358979),jacket$1);
      Self.hipL = mk(new THREE.SphereGeometry(0.14,14,10,0,6.28318530717959,0,3.14159265358979),pants$1);
      Self.hipR = mk(new THREE.SphereGeometry(0.14,14,10,0,6.28318530717959,0,3.14159265358979),pants$1);
      mitt = new THREE.SphereGeometry(0.088,14,10,0,6.28318530717959,0,3.14159265358979).scale(1,1.15,0.9);
      Self.handL = mk(mitt,glove$1);
      Self.handR = mk(mitt,glove$1);
      Self.torso = mk(new THREE.CapsuleGeometry(0.23,0.14,6,18,1),jacket$1);
      a$234 = [-0.08, 0.06];
      for(a$231=0;a$231<=1;a$231++) {
         yy$1 = a$234[a$231];
         sub$1(Self.torso,new THREE.TorusGeometry(0.226,0.016,6,24,6.28318530717959).rotateX(1.5707963267949),jacket$1,0,yy$1,0);
      }
      Self.pelvis = mk(new THREE.CapsuleGeometry(0.17,0.1,4,14,1),pants$1);
      Self.head = new THREE.Group();
      Self.head.matrixAutoUpdate = false;
      Self.root.add(Self.head);
      sub$1(Self.head,new THREE.SphereGeometry(0.275,24,18,0,6.28318530717959,0,3.14159265358979),skin$1,0,0,0);
      sub$1(Self.head,new THREE.SphereGeometry(0.29,28,16,0,6.28318530717959,0,1.4765485471872),helmet$1,0,0.015,0);
      sub$1(Self.head,new THREE.SphereGeometry(0.279,20,10,3.14159265358979,3.14159265358979,1.5707963267949,0.942477796076938),hair$1,0,0,0);
      sub$1(Self.head,new THREE.CylinderGeometry(0.293,0.293,0.075,28,1,true,1.1,4.08318530717959),strap$1,0,0.03,0);
      sub$1(Self.head,new THREE.CylinderGeometry(0.305,0.3,0.17,24,1,true,-1.15,2.3),goggle$1,0,0.005,0);
      sub$1(Self.head,new THREE.SphereGeometry(0.05,10,8,0,6.28318530717959,0,3.14159265358979),skin$1,0,-0.1,0.27);
      a$233 = [-1, 1];
      for(a$232=0;a$232<=1;a$232++) {
         sx = a$233[a$232];
         sub$1(Self.head,new THREE.SphereGeometry(0.06,10,8,0,6.28318530717959,0,3.14159265358979).scale(0.6,1,1),skin$1,sx * 0.272,-0.04,-0.01);
      }
      Self.board = new THREE.Group();
      Self.board.matrixAutoUpdate = false;
      Self.root.add(Self.board);
      deck$2 = new THREE.Mesh(MakeBoardGeometry(),deckMat);
      deck$2.castShadow = true;
      Self.board.add(deck$2);
      for(let bi=0;bi<=1;bi++) {
         bx = (!bi)?0.3:-0.3;
         ang = (!bi)?0.26:-0.1;
         b$8 = new THREE.Group();
         b$8.position.set(bx,0.026,0);
         b$8.rotation.y = ang;
         Self.board.add(b$8);
         sub$1(b$8,new THREE.BoxGeometry(0.16,0.02,0.3),bind,0,0,0);
         hb = sub$1(b$8,new THREE.BoxGeometry(0.15,0.2,0.025),bind,0,0.13,-0.16);
         hb.rotation.x = -0.25;
         sub$1(b$8,new THREE.CapsuleGeometry(0.09,0.2,4,12,1).rotateX(1.5707963267949).scale(1.05,1.05,1),boot$1,0,0.1,0.01);
      }
      Self.t$6 = TObject.Create($New(TRiderTemps));
      Self.t$6.a$94 = new THREE.Vector3();
      Self.t$6.b$7 = new THREE.Vector3();
      Self.t$6.x$12 = new THREE.Vector3();
      Self.t$6.y$9 = new THREE.Vector3();
      Self.t$6.z$10 = new THREE.Vector3();
      Self.t$6.p$5 = new THREE.Vector3();
      Self.t$6.m$2 = new THREE.Matrix4();
      Self.t$6.q = new THREE.Quaternion();
      Self.t$6.qe$1 = new THREE.Quaternion();
      Self.t$6.ax = new THREE.Vector3(1,0,0);
      Self.t$6.s$9 = new THREE.Vector3(1,1,1);
      return Self
   }
   /// procedure TRider.Pose(w: TJoints; boardPos: JVector3; boardQuat: JQuaternion)
   ,Pose:function(Self, w$5, boardPos$3, boardQuat) {
      TRider.SetSeg(Self,Self.thighL,w$5[11],w$5[12]);
      TRider.SetSeg(Self,Self.thighR,w$5[14],w$5[15]);
      TRider.SetSeg(Self,Self.shinL,w$5[12],w$5[13]);
      TRider.SetSeg(Self,Self.shinR,w$5[15],w$5[16]);
      TRider.SetSeg(Self,Self.uarmL,w$5[5],w$5[6]);
      TRider.SetSeg(Self,Self.uarmR,w$5[8],w$5[9]);
      TRider.SetSeg(Self,Self.farmL,w$5[6],w$5[7]);
      TRider.SetSeg(Self,Self.farmR,w$5[9],w$5[10]);
      TRider.SetSeg(Self,Self.neck$1,w$5[1],w$5[3]);
      TRider.SetAt(Self,Self.kneeL,w$5[12]);
      TRider.SetAt(Self,Self.kneeR,w$5[15]);
      TRider.SetAt(Self,Self.elbL,w$5[6]);
      TRider.SetAt(Self,Self.elbR,w$5[9]);
      TRider.SetAt(Self,Self.shoL,w$5[5]);
      TRider.SetAt(Self,Self.shoR,w$5[8]);
      TRider.SetAt(Self,Self.hipL,w$5[11]);
      TRider.SetAt(Self,Self.hipR,w$5[14]);
      TRider.SetAt(Self,Self.handL,w$5[7]);
      TRider.SetAt(Self,Self.handR,w$5[10]);
      Self.t$6.a$94.subVectors(w$5[5],w$5[8]);
      Self.t$6.b$7.subVectors(w$5[1],w$5[0]);
      Self.t$6.p$5.addVectors(w$5[1],w$5[0]).multiplyScalar(0.5).addScaledVector(Self.t$6.b$7,0.25);
      TRider.SetBasis(Self,Self.torso,Self.t$6.p$5,Self.t$6.a$94,Self.t$6.b$7,1.15,1,0.92);
      Self.t$6.a$94.subVectors(w$5[11],w$5[14]);
      TRider.SetBasis(Self,Self.pelvis,w$5[0],Self.t$6.a$94,Self.t$6.b$7,1.2,0.9,1);
      Self.t$6.b$7.subVectors(w$5[3],w$5[2]);
      Self.t$6.a$94.subVectors(w$5[4],w$5[3]);
      Self.t$6.y$9.copy(Self.t$6.b$7).normalize();
      Self.t$6.z$10.copy(Self.t$6.a$94).addScaledVector(Self.t$6.y$9,-Self.t$6.a$94.dot(Self.t$6.y$9)).normalize();
      Self.t$6.x$12.crossVectors(Self.t$6.y$9,Self.t$6.z$10);
      Self.head.matrix.makeBasis(Self.t$6.x$12,Self.t$6.y$9,Self.t$6.z$10).setPosition(w$5[3]);
      Self.head.matrixWorldNeedsUpdate = true;
      Self.board.matrix.compose(boardPos$3,boardQuat,Self.t$6.s$9);
      Self.board.matrixWorldNeedsUpdate = true;
   }
   /// procedure TRider.SetAt(mesh: JObject3D; p: JVector3)
   ,SetAt:function(Self, mesh$3, p$7) {
      mesh$3.matrix.makeTranslation(p$7.x,p$7.y,p$7.z);
      mesh$3.matrixWorldNeedsUpdate = true;
   }
   /// procedure TRider.SetBasis(mesh: JObject3D; pos: JVector3; xa: JVector3; ya: JVector3; sx: Float; sy: Float; sz: Float)
   ,SetBasis:function(Self, mesh$3, pos$5, xa, ya, sx, sy, sz$1) {
      Self.t$6.y$9.copy(ya).normalize();
      Self.t$6.x$12.copy(xa).addScaledVector(Self.t$6.y$9,-xa.dot(Self.t$6.y$9)).normalize();
      Self.t$6.z$10.crossVectors(Self.t$6.x$12,Self.t$6.y$9);
      mesh$3.matrix.makeBasis(Self.t$6.x$12.multiplyScalar(sx),Self.t$6.y$9.multiplyScalar(sy),Self.t$6.z$10.multiplyScalar(sz$1)).setPosition(pos$5);
      mesh$3.matrixWorldNeedsUpdate = true;
   }
   /// procedure TRider.SetColors(c: TRiderColors)
   ,SetColors:function(Self, c$7) {
      var w$5 = null;
      w$5 = new THREE.Color(16777215);
      Self.matJacket.color.setHex(c$7.jacket);
      Self.matJacket.sheenColor.setHex(c$7.jacket).lerp(w$5,0.45);
      Self.matPants.color.setHex(c$7.pants);
      Self.matPants.sheenColor.setHex(c$7.pants).lerp(w$5,0.35);
      Self.matHelmet.color.setHex(c$7.helmet);
      Self.deckU.value.setHex(c$7.deck);
   }
   /// procedure TRider.SetSeg(mesh: JObject3D; a: JVector3; b: JVector3)
   ,SetSeg:function(Self, mesh$3, a$110, b$8) {
      var len$2 = 0,
         y$13 = null;
      y$13 = Self.t$6.y$9.subVectors(b$8,a$110);
      len$2 = y$13.length();
      if (len$2 == 0) {
         len$2 = 0.0001;
      }
      y$13.divideScalar(len$2);
      Self.t$6.x$12.set(1,0,0);
      if (Abs$_Float_(y$13.x) > 0.9) {
         Self.t$6.x$12.set(0,0,1);
      }
      Self.t$6.z$10.crossVectors(Self.t$6.x$12,y$13).normalize();
      Self.t$6.x$12.crossVectors(y$13,Self.t$6.z$10);
      mesh$3.matrix.makeBasis(Self.t$6.x$12,Self.t$6.y$9.multiplyScalar(len$2),Self.t$6.z$10).setPosition(a$110);
      mesh$3.matrixWorldNeedsUpdate = true;
   }
   ,Destroy:TObject.Destroy
};
function SegGeo(r0, r1, seg$1) {
   var Result = null;
   Result = new THREE.CylinderGeometry(r1,r0,1,seg$1,1,false,0,6.28318530717959);
   Result.translate(0,0.5,0);
   return Result
}
function MakeBoardGeometry() {
   var Result = null;
   var i$3 = 0,
      x$13 = 0,
      ax$1 = 0,
      shape = null,
      g$5 = null,
      p$6 = null;
   shape = new THREE.Shape();
   for(i$3=0;i$3<=40;i$3++) {
      x$13 = -0.815 + 1.63 * i$3 / 40;
      if (!i$3) {
         shape.moveTo(x$13,-BoardHalfWidth(x$13));
      } else {
         shape.lineTo(x$13,-BoardHalfWidth(x$13));
      }
   }
   for(i$3=40;i$3>=0;i$3--) {
      x$13 = -0.815 + 1.63 * i$3 / 40;
      shape.lineTo(x$13,BoardHalfWidth(x$13));
   }
   g$5 = new THREE.ExtrudeGeometry(shape,{
      "depth" : 0.02
      ,"curveSegments" : 4
      ,"bevelThickness" : 0.004
      ,"bevelSize" : 0.005
      ,"bevelSegments" : 1
      ,"bevelEnabled" : true
   });
   g$5.rotateX(-1.5707963267949);
   g$5.deleteAttribute("uv");
   p$6 = g$5.attributes.position;
   var $temp136;
   for(i$3=0,$temp136=p$6.count;i$3<$temp136;i$3++) {
      x$13 = p$6.getX(i$3);
      ax$1 = Abs$_Float_(x$13);
      if (ax$1 > 0.6) {
         p$6.setY(i$3,p$6.getY(i$3) + Power(ax$1 - 0.6,2) * 1.6);
      }
   }
   g$5.computeVertexNormals();
   Result = g$5;
   return Result
}
/// FIG = class (TObject)
var FIG = {
   $ClassName:"FIG",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   ,Destroy:TObject.Destroy
};
function Std(hex, r$7) {
   var Result = null;
   Result = new THREE.MeshStandardMaterial({
      "roughness" : r$7
      ,"color" : hex
   });
   return Result
}
function BoardHalfWidth(x$18) {
   var Result = 0;
   var ax$2 = 0,
      tt = 0;
   ax$2 = Abs$_Float_(x$18);
   if (ax$2 < 0.62) {
      return 0.15 - 0.014 * (1 - Power(x$18 / 0.62,2));
   }
   tt = (ax$2 - 0.62) / 0.195;
   Result = 0.15 * Sqrt(Max$_Float_Float_(0,1 - tt*tt * tt));
   return Result
}
/// TStar = class (TObject)
var TStar = {
   $ClassName:"TStar",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.d$6 = $.h$2 = $.x$15 = $.y$12 = $.z$11 = 0;
      $.got = false;
   }
   ,Destroy:TObject.Destroy
};
/// TGate = class (TObject)
var TGate = {
   $ClassName:"TGate",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.col$4 = $.state$3 = 0;
      $.d$7 = $.hw = $.x$16 = $.z$12 = 0;
   }
   ,Destroy:TObject.Destroy
};
/// TChallenges = class (TObject)
var TChallenges = {
   $ClassName:"TChallenges",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.course$8 = $.flags = $.poles$1 = $.starMesh = $.stripes = $._m$2 = $._p$2 = $._q$2 = $._s$1 = $._up$2 = null;
      $.gateNext = $.got$1 = $.missed = $.passed = 0;
      $.gates = [];
      $.stars$1 = [];
      $.t$10 = 0;
   }
   /// constructor TChallenges.Create(scene: JScene; c: TCourse)
   ,Create$164:function(Self, scene$1, c$7) {
      var side$3 = 0,
         zf$1 = 0,
         z$13 = 0,
         gz = 0,
         W$1 = 0,
         rr$2 = 0,
         d$8 = 0,
         tt$1 = 0,
         i$6 = 0,
         n$7 = 0,
         kc = 0,
         g$8 = null,
         rng = null,
         addStar = null,
         k$4 = null,
         a$235 = 0,
         st$3 = null,
         g$9 = null,
         s$12 = 0,
         x$18 = 0,
         nrm$1 = null,
         a$236 = [];
      Self.course$8 = c$7;
      zf$1 = c$7.zf;
      side$3 = 1;
      z$13 = 230;
      while (z$13 < zf$1 - 140) {
         gz = z$13;
         tt$1 = 0;
         while (tt$1 < 6 && TChallenges.NearKicker(Self,gz)) {
            gz += 25;
            ++tt$1;
         }
         if (!(TChallenges.NearKicker(Self,gz))) {
            g$8 = TObject.Create($New(TGate));
            g$8.z$12 = gz;
            g$8.d$7 = side$3 * TCourse.width$4(c$7,gz) * 0.42;
            g$8.hw = 3.6;
            g$8.col$4 = (side$3 > 0)?14100029:2059263;
            g$8.state$3 = 0;
            Self.gates.push(g$8);
            side$3 = -side$3;
         }
         z$13 += 170;
      }
      rng = TRNG.Create$72($New(TRNG),Trunc(99 + zf$1));
      addStar = function (sz$1, sd, sh$1) {
         var st$4 = null;
         st$4 = TObject.Create($New(TStar));
         st$4.z$11 = sz$1;
         st$4.d$6 = sd;
         st$4.h$2 = sh$1;
         Self.stars$1.push(st$4);
      };
      z$13 = 140;
      while (z$13 < zf$1 - 60) {
         W$1 = TCourse.width$4(c$7,z$13);
         rr$2 = TRNG.Next(rng);
         if (rr$2 < 0.55) {
            d$8 = (TRNG.Next(rng) - 0.5) * W$1 * 1.3;
            for(i$6=0;i$6<=2;i$6++) {
               addStar(z$13 + i$6 * 6,d$8,1);
            }
         } else if (rr$2 < 0.72) {
            addStar(z$13,((TRNG.Next(rng) < 0.5)?-1:1) * (W$1 + 3 + TRNG.Next(rng) * 3),1);
         }
         z$13 += 55;
      }
      k$4 = TObject.Create($New(TKicker));
      kc = 1;
      while (kc * c$7.Trk.kickCell < zf$1) {
         if (TCourse.kicker(c$7,kc,k$4)) {
            for(i$6=0;i$6<=2;i$6++) {
               addStar(k$4.z$6 + k$4.L$1 + 5 + i$6 * 5,k$4.d$1,2.4 + Sin((i$6 + 1) / 4 * 3.14159265358979) * 1.2);
            }
         }
         ++kc;
      }
      Self.stars$1.sort(function (a$110, b$8) {
         var Result = 0;
         Result = (a$110.z$11 < b$8.z$11)?-1:(a$110.z$11 > b$8.z$11)?1:0;
         return Result
      });
      a$236 = Self.stars$1;
      var $temp137;
      for(a$235=0,$temp137=a$236.length;a$235<$temp137;a$235++) {
         st$3 = a$236[a$235];
         st$3.x$15 = TCourse.cx(c$7,st$3.z$11) + st$3.d$6;
         st$3.y$12 = TCourse.height$4(c$7,st$3.x$15,st$3.z$11) + st$3.h$2;
         st$3.got = false;
      }
      n$7 = Self.gates.length;
      Self.poles$1 = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07,0.08,2.5,8,1,false,0,6.28318530717959).translate(0,1.25,0),new THREE.MeshStandardMaterial({
         "roughness" : 0.5
      }),n$7*2);
      Self.flags = new THREE.InstancedMesh(new THREE.BoxGeometry(1.15,1,0.05).translate(0.58,1.95,0),new THREE.MeshBasicMaterial(),n$7*2);
      Self.stripes = new THREE.InstancedMesh(AO_GEO,new THREE.MeshBasicMaterial({
         "transparent" : true
         ,"polygonOffsetUnits" : -2
         ,"polygonOffsetFactor" : -2
         ,"polygonOffset" : true
         ,"opacity" : 0.8
         ,"depthWrite" : false
      }),n$7);
      Self.poles$1.castShadow = true;
      scene$1.add(Self.poles$1);
      Self.flags.castShadow = true;
      scene$1.add(Self.flags);
      scene$1.add(Self.stripes);
      Self._m$2 = new THREE.Matrix4();
      Self._q$2 = new THREE.Quaternion();
      Self._s$1 = new THREE.Vector3(1,1,1);
      Self._p$2 = new THREE.Vector3();
      Self._up$2 = new THREE.Vector3(0,1,0);
      var $temp138;
      for(i$6=0,$temp138=n$7;i$6<$temp138;i$6++) {
         g$9 = Self.gates[i$6];
         g$9.x$16 = TCourse.cx(c$7,g$9.z$12) + g$9.d$7;
         for(let kk=0;kk<=1;kk++) {
            s$12 = (kk == 1)?1:-1;
            x$18 = g$9.x$16 + s$12 * g$9.hw;
            Self._p$2.set(x$18,TCourse.height$4(c$7,x$18,g$9.z$12) - 0.05,g$9.z$12);
            Self.poles$1.setMatrixAt((i$6*2) + kk,Self._m$2.compose(Self._p$2,Self._q$2.setFromAxisAngle(Self._up$2,0),Self._s$1));
            Self.flags.setMatrixAt((i$6*2) + kk,Self._m$2.compose(Self._p$2,Self._q$2.setFromAxisAngle(Self._up$2,(s$12 > 0)?3.14159265358979:0),Self._s$1));
         }
         nrm$1 = TCourse.normal$1(c$7,g$9.x$16,g$9.z$12,new THREE.Vector3());
         Self._p$2.set(g$9.x$16,TCourse.height$4(c$7,g$9.x$16,g$9.z$12) + 0.05,g$9.z$12);
         Self.stripes.setMatrixAt(i$6,Self._m$2.compose(Self._p$2,Self._q$2.setFromUnitVectors(Self._up$2,nrm$1),new THREE.Vector3(g$9.hw * 2,1,1.4)));
      }
      Self.starMesh = new THREE.InstancedMesh(MakeStar(0.42,0.18),new THREE.MeshStandardMaterial({
         "roughness" : 0.35
         ,"metalness" : 0.35
         ,"emissiveIntensity" : 0.55
         ,"emissive" : 16751872
         ,"color" : 16762173
      }),Self.stars$1.length);
      Self.starMesh.castShadow = true;
      Self.starMesh.frustumCulled = false;
      scene$1.add(Self.starMesh);
      Self.t$10 = 0;
      TChallenges.Reset$6(Self);
      return Self
   }
   /// function TChallenges.NearKicker(z: Float) : Boolean
   ,NearKicker:function(Self, z$13) {
      var Result = false;
      var cell = 0,
         kc = 0,
         c$7 = null,
         k$4 = null;
      c$7 = Self.course$8;
      cell = c$7.Trk.kickCell;
      k$4 = TObject.Create($New(TKicker));
      var $temp139;
      for(kc=Floor(z$13 / cell) - 1,$temp139=Floor(z$13 / cell) + 1;kc<=$temp139;kc++) {
         if (TCourse.kicker(c$7,kc,k$4) && z$13 > k$4.z$6 - 25 && z$13 < k$4.z$6 + k$4.L$1 + 30) {
            return true;
         }
      }
      Result = false;
      return Result
   }
   /// procedure TChallenges.Reset()
   ,Reset$6:function(Self) {
      var col$5 = null,
         g$8 = null,
         a$237 = 0,
         m$7 = null,
         a$238 = 0,
         st$3 = null,
         a$239 = [],
         a$240 = [null,null,null];
      col$5 = new THREE.Color();
      for(let i$6=0,$temp140=Self.gates.length;i$6<$temp140;i$6++) {
         g$8 = Self.gates[i$6];
         g$8.state$3 = 0;
         Self.stripes.setColorAt(i$6,col$5.setHex(g$8.col$4));
         for(let k$4=0;k$4<=1;k$4++) {
            Self.poles$1.setColorAt((i$6*2) + k$4,col$5.setHex(15921906));
            Self.flags.setColorAt((i$6*2) + k$4,col$5.setHex(g$8.col$4));
         }
      }
      a$240 = [Self.poles$1, Self.flags, Self.stripes];
      for(a$237=0;a$237<=2;a$237++) {
         m$7 = a$240[a$237];
         m$7.instanceMatrix.needsUpdate = true;
         if (Truthy(m$7.instanceColor)) {
            m$7.instanceColor.needsUpdate = true;
         }
         m$7.computeBoundingSphere();
      }
      a$239 = Self.stars$1;
      var $temp141;
      for(a$238=0,$temp141=a$239.length;a$238<$temp141;a$238++) {
         st$3 = a$239[a$238];
         st$3.got = false;
      }
      Self.gateNext = 0;
      Self.passed = 0;
      Self.missed = 0;
      Self.got$1 = 0;
   }
   /// procedure TChallenges.SetGateColor(i: Integer; hex: Integer)
   ,SetGateColor:function(Self, i$6, hex) {
      var col$5 = null;
      col$5 = new THREE.Color(hex);
      for(let k$4=0;k$4<=1;k$4++) {
         Self.flags.setColorAt((i$6*2) + k$4,col$5);
      }
      Self.stripes.setColorAt(i$6,col$5);
      Self.flags.instanceColor.needsUpdate = true;
      Self.stripes.instanceColor.needsUpdate = true;
   }
   /// procedure TChallenges.Update(dt: Float; z: Float; x: Float; center: JVector3; riding: Boolean; onGate: TGateProc; onStar: TStarProc)
   ,Update$13:function(Self, dt, z$13, x$18, center$2, riding$2, onGate, onStar) {
      var ok = false,
         g$8 = null,
         st$3 = null;
      Self.t$10 += dt;
      while (Self.gateNext < Self.gates.length && Self.gates[Self.gateNext].z$12 <= z$13) {
         g$8 = Self.gates[Self.gateNext];
         ok = riding$2 && Abs$_Float_(x$18 - g$8.x$16) <= g$8.hw;
         g$8.state$3 = (ok)?1:2;
         if (ok) {
            ++Self.passed;
         } else {
            ++Self.missed;
         }
         TChallenges.SetGateColor(Self,Self.gateNext,(ok)?3066993:9080729);
         onGate(ok);
         ++Self.gateNext;
      }
      for(let i$6=0,$temp142=Self.stars$1.length;i$6<$temp142;i$6++) {
         st$3 = Self.stars$1[i$6];
         if ((!(st$3.got)) && riding$2 && Abs$_Float_(st$3.z$11 - center$2.z) < 2 && Sqr$_Float_(st$3.x$15 - center$2.x) + Sqr$_Float_(st$3.y$12 - center$2.y) + Sqr$_Float_(st$3.z$11 - center$2.z) < 1.7) {
            st$3.got = true;
            ++Self.got$1;
            onStar(st$3);
         }
         Self._s$1.setScalar((st$3.got)?0.0001:1);
         Self._p$2.set(st$3.x$15,st$3.y$12 + Sin(Self.t$10 * 2.2 + i$6) * 0.12,st$3.z$11);
         Self.starMesh.setMatrixAt(i$6,Self._m$2.compose(Self._p$2,Self._q$2.setFromAxisAngle(Self._up$2,Self.t$10 * 2.4 + i$6 * 0.7),Self._s$1));
      }
      Self._s$1.setScalar(1);
      Self.starMesh.instanceMatrix.needsUpdate = true;
   }
   ,Destroy:TObject.Destroy
};
function MakeStar(Ro, Ri) {
   var Result = null;
   var a$106 = 0,
      q$1 = 0,
      sh = null,
      g$7 = null;
   sh = new THREE.Shape();
   for(let i$6=0;i$6<=10;i$6++) {
      a$106 = i$6 / 10 * 6.28318530717959 + 1.5707963267949;
      q$1 = (i$6 % 2 == 1)?Ri:Ro;
      if (!i$6) {
         sh.moveTo(Cos(a$106) * q$1,Sin(a$106) * q$1);
      } else {
         sh.lineTo(Cos(a$106) * q$1,Sin(a$106) * q$1);
      }
   }
   g$7 = new THREE.ExtrudeGeometry(sh,{
      "depth" : 0.08
      ,"bevelThickness" : 0.04
      ,"bevelSize" : 0.04
      ,"bevelSegments" : 2
      ,"bevelEnabled" : true
   });
   g$7.translate(0,0,-0.04);
   g$7.computeVertexNormals();
   Result = g$7;
   return Result
}
/// TSkierType = class (TObject)
var TSkierType = {
   $ClassName:"TSkierType",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.amp0 = $.amp1 = $.comp = $.cross$1 = $.fq0 = $.fq1 = $.sp0 = $.sp1 = $.stop$3 = $.w$2 = 0;
      $.jackets = [];
      $.name$5 = "";
      $.plough = false;
   }
   ,Destroy:TObject.Destroy
};
/// TSkierTemps = class (TObject)
var TSkierTemps = {
   $ClassName:"TSkierTemps",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.col$2 = $.f$3 = $.Fo = $.hd$1 = $.m$1 = $.pole = $.r$3 = $.Si = $.sp = $.tip$1 = $.tmp$1 = $.tmp2$1 = $.up$1 = $.w$3 = $.x$11 = $.y$7 = $.z$7 = null;
   }
   ,Destroy:TObject.Destroy
};
/// TSkierAI = class (TObject)
var TSkierAI = {
   $ClassName:"TSkierAI",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.course$3 = $.mArm = $.mBoot = $.mFace = $.mGog = $.mHair = $.mHand = $.mHead = $.mJoint = $.mLeg = $.mPelvis = $.mPole = $.mSki = $.mStrap = $.mTorso = $.onNearMiss = $.t$3 = null;
      $.elapsed = 0;
      $.jt = [];
      $.maxN = 0;
      $.parts$7 = [];
      $.partsPer = [];
      $.skiers$1 = [];
   }
   /// procedure TSkierAI.At(mesh: JInstancedMesh; i: Integer; p: JVector3; col: Integer)
   ,At:function(Self, mesh$3, i$6, p$7, col$5) {
      Self.t$3.m$1.makeTranslation(p$7.x,p$7.y,p$7.z);
      mesh$3.setMatrixAt(i$6,Self.t$3.m$1);
      mesh$3.setColorAt(i$6,Self.t$3.col$2.setHex(col$5));
   }
   /// procedure TSkierAI.Ball(mesh: JInstancedMesh; i: Integer; p: JVector3; r: Float; col: Integer)
   ,Ball:function(Self, mesh$3, i$6, p$7, r$7, col$5) {
      Self.t$3.m$1.makeScale(r$7,r$7,r$7).setPosition(p$7);
      mesh$3.setMatrixAt(i$6,Self.t$3.m$1);
      mesh$3.setColorAt(i$6,Self.t$3.col$2.setHex(col$5));
   }
   /// procedure TSkierAI.Box(mesh: JInstancedMesh; i: Integer; pos: JVector3; xa: JVector3; ya: JVector3; sx: Float; sy: Float; sz: Float; col: Integer; swapAxes: Boolean = False)
   ,Box:function(Self, mesh$3, i$6, pos$5, xa, ya, sx, sy, sz$1, col$5, swapAxes) {
      if (swapAxes) {
         Self.t$3.y$7.copy(xa).normalize();
         Self.t$3.x$11.copy(ya).addScaledVector(Self.t$3.y$7,-ya.dot(Self.t$3.y$7)).normalize();
         Self.t$3.z$7.crossVectors(Self.t$3.x$11,Self.t$3.y$7);
      } else {
         Self.t$3.y$7.copy(ya).normalize();
         Self.t$3.x$11.copy(xa).addScaledVector(Self.t$3.y$7,-xa.dot(Self.t$3.y$7)).normalize();
         Self.t$3.z$7.crossVectors(Self.t$3.x$11,Self.t$3.y$7);
      }
      Self.t$3.m$1.makeBasis(Self.t$3.x$11.multiplyScalar(sx),Self.t$3.y$7.multiplyScalar(sy),Self.t$3.z$7.multiplyScalar(sz$1)).setPosition(pos$5);
      mesh$3.setMatrixAt(i$6,Self.t$3.m$1);
      mesh$3.setColorAt(i$6,Self.t$3.col$2.setHex(col$5));
   }
   /// function TSkierAI.CheckHit(pa: JVector3; pb: JVector3; z: Float) : TSkier
   ,CheckHit:function(Self, pa, pb, z$13) {
      var Result = null;
      var a$241 = 0,
         s$12 = null,
         a$242 = [];
      a$242 = Self.skiers$1;
      var $temp143;
      for(a$241=0,$temp143=a$242.length;a$241<$temp143;a$241++) {
         s$12 = a$242[a$241];
         if ((!(s$12.active$1)) || s$12.hit > 0 || Abs$_Float_(s$12.z$8 - z$13) > 6) {
            continue;
         }
         if (SegSegDist(pa,pb,s$12.a$91,s$12.b$4) < 0.65) {
            s$12.hit = 3;
            s$12.state$2 = 1;
            s$12.timer = 3;
            s$12.stopSide = 1;
            return s$12;
         }
      }
      Result = null;
      return Result
   }
   /// function TSkierAI.CheckPlayer(pa: JVector3; pb: JVector3; pz: Float; pspeed: Float; canHit: Boolean) : TSkier
   ,CheckPlayer:function(Self, pa, pb, pz, pspeed, canHit) {
      var Result = null;
      var rel = 0,
         d$8 = 0,
         a$243 = 0,
         s$12 = null,
         a$244 = [];
      Result = null;
      a$244 = Self.skiers$1;
      var $temp144;
      for(a$243=0,$temp144=a$244.length;a$243<$temp144;a$243++) {
         s$12 = a$244[a$243];
         if (!(s$12.active$1)) {
            continue;
         }
         rel = pz - s$12.z$8;
         if (Abs$_Float_(rel) > 8) {
            s$12.minDist = 99;
            s$12.prevRel = rel;
            continue;
         }
         d$8 = SegSegDist(pa,pb,s$12.a$91,s$12.b$4);
         if (d$8 < 0.65 && canHit && s$12.hit <= 0) {
            Result = s$12;
            s$12.hit = 3;
            s$12.state$2 = 1;
            s$12.timer = 3;
            s$12.stopSide = 1;
         }
         s$12.minDist = Min$_Float_Float_(s$12.minDist,d$8);
         if (s$12.prevRel < 0 && rel >= 0 && s$12.hit <= 0 && s$12.minDist < 1.9 && pspeed > s$12.speed + 2 && !!Self.onNearMiss) {
            Self.onNearMiss(s$12,s$12.minDist);
         }
         s$12.prevRel = rel;
      }
      return Result
   }
   /// constructor TSkierAI.Create(scene: JScene; c: TCourse)
   ,Create$143:function(Self, scene$1, c$7) {
      var s$12 = null,
         cnt = 0,
         im$1 = null;
      Self.course$3 = c$7;
      Self.maxN = 26;
      for(let i$6=0,$temp145=Self.maxN;i$6<$temp145;i$6++) {
         s$12 = TObject.Create($New(TSkier));
         s$12.active$1 = false;
         s$12.pos = new THREE.Vector3();
         s$12.vel = new THREE.Vector3();
         s$12.a$91 = new THREE.Vector3();
         s$12.b$4 = new THREE.Vector3();
         s$12.n$3 = new THREE.Vector3(0,1,0);
         Self.skiers$1.push(s$12);
      }
      cnt = Self.maxN;
      im$1 = function (geo, mat$3, per, shadow$2) {
         var Result = null;
         Result = new THREE.InstancedMesh(geo,mat$3,cnt * per);
         Result.count = 0;
         Result.castShadow = shadow$2;
         Result.frustumCulled = false;
         Result.setColorAt(0,new THREE.Color(1,1,1));
         scene$1.add(Result);
         return Result
      };
      Self.mLeg = im$1(SegGeo(0.125,0.112,10),White(0.65,0),4,true);
      Self.mArm = im$1(SegGeo(0.1,0.088,8),White(0.65,0),4,true);
      Self.mJoint = im$1(new THREE.SphereGeometry(1,10,8,0,6.28318530717959,0,3.14159265358979),White(0.65,0),8,true);
      Self.mTorso = im$1(new THREE.CapsuleGeometry(0.23,0.14,4,14,1),White(0.65,0),1,true);
      Self.mPelvis = im$1(new THREE.CapsuleGeometry(0.17,0.1,3,12,1),White(0.65,0),1,true);
      Self.mFace = im$1(new THREE.SphereGeometry(0.275,16,12,0,6.28318530717959,0,3.14159265358979),White(0.65,0),1,true);
      Self.mHead = im$1(new THREE.SphereGeometry(0.29,16,8,0,6.28318530717959,0,1.4765485471872),White(0.3,0),1,true);
      Self.mHair = im$1(new THREE.SphereGeometry(0.279,20,8,3.14159265358979,3.14159265358979,1.5707963267949,0.942477796076938),White(0.9,0),1,false);
      Self.mStrap = im$1(new THREE.CylinderGeometry(0.293,0.293,0.075,18,1,true,1.1,4.08318530717959),White(0.65,0),1,false);
      Self.mGog = im$1(new THREE.CylinderGeometry(0.305,0.3,0.17,24,1,true,-1.15,2.3),White(0.1,0.8),1,false);
      Self.mHand = im$1(new THREE.SphereGeometry(0.088,10,8,0,6.28318530717959,0,3.14159265358979).scale(1,1.15,0.9),White(0.65,0),2,false);
      Self.mBoot = im$1(new THREE.CapsuleGeometry(0.09,0.13,4,10,1).rotateZ(1.5707963267949).scale(1,1.1,0.95),White(0.65,0),2,true);
      Self.mSki = im$1(new THREE.BoxGeometry(1.65,0.02,0.085),White(0.3,0),2,true);
      Self.mPole = im$1(SegGeo(0.012,0.01,5),White(0.3,0.6),2,false);
      Self.parts$7 = [Self.mLeg, Self.mArm, Self.mJoint, Self.mTorso, Self.mPelvis, Self.mFace, Self.mHead, Self.mHair, Self.mStrap, Self.mGog, Self.mHand, Self.mBoot, Self.mSki, Self.mPole];
      Self.partsPer = [4, 4, 8, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2];
      Self.jt = NewJoints();
      Self.t$3 = TObject.Create($New(TSkierTemps));
      Self.t$3.f$3 = new THREE.Vector3();
      Self.t$3.r$3 = new THREE.Vector3();
      Self.t$3.up$1 = new THREE.Vector3();
      Self.t$3.Fo = new THREE.Vector3();
      Self.t$3.Si = new THREE.Vector3();
      Self.t$3.sp = new THREE.Vector3();
      Self.t$3.tmp$1 = new THREE.Vector3();
      Self.t$3.tmp2$1 = new THREE.Vector3();
      Self.t$3.pole = new THREE.Vector3();
      Self.t$3.x$11 = new THREE.Vector3();
      Self.t$3.y$7 = new THREE.Vector3();
      Self.t$3.z$7 = new THREE.Vector3();
      Self.t$3.w$3 = new THREE.Vector3();
      Self.t$3.m$1 = new THREE.Matrix4();
      Self.t$3.col$2 = new THREE.Color();
      Self.t$3.tip$1 = new THREE.Vector3();
      Self.t$3.hd$1 = new THREE.Vector3();
      Self.onNearMiss = null;
      Self.elapsed = 0;
      return Self
   }
   /// procedure TSkierAI.Render()
   ,Render:function(Self) {
      var k$4 = 0,
         k4 = 0,
         k8 = 0,
         sd = 0,
         q$2 = 0,
         yaw$3 = 0,
         ln = 0,
         comp$3 = 0,
         bend$1 = 0,
         rho = 0,
         fw = 0,
         H$5 = 0,
         px = 0,
         cl = 0,
         sl = 0,
         plantL = 0,
         plantR = 0,
         ang = 0,
         pl = 0,
         zs = 0,
         plough$1 = false,
         jj = [],
         a$245 = 0,
         s$12 = null,
         ty = null,
         kk = 0,
         hk = null,
         an = null,
         hv = null,
         m$7 = null,
         a$246 = [];
      k$4 = 0;
      jj = Self.jt;
      a$246 = Self.skiers$1;
      var $temp146;
      for(a$245=0,$temp146=a$246.length;a$245<$temp146;a$245++) {
         s$12 = a$246[a$245];
         if (!(s$12.active$1)) {
            continue;
         }
         ty = SKIER_TYPES[s$12.typ$1];
         yaw$3 = s$12.yaw + s$12.stopTurn;
         Self.t$3.hd$1.set(Sin(yaw$3),0,Cos(yaw$3));
         Self.t$3.up$1.copy(s$12.n$3);
         Self.t$3.f$3.copy(Self.t$3.hd$1).addScaledVector(Self.t$3.up$1,-Self.t$3.hd$1.dot(Self.t$3.up$1)).normalize();
         Self.t$3.r$3.crossVectors(Self.t$3.f$3,Self.t$3.up$1);
         ln = s$12.lean;
         plough$1 = ty.plough && s$12.state$2 != 1;
         comp$3 = s$12.comp$1 + ((s$12.state$2 == 1)?0.15:0) + ((s$12.hit > 0)?0.5:0) + Abs$_Float_(ln) * 0.15 + 0.04 * Sin(Self.elapsed * 3 + s$12.phase);
         bend$1 = 0.3 + comp$3 * 0.35;
         rho = ClampF((-s$12.stopTurn) * 0.6 - ln * 0.3,-0.9,0.9);
         Self.t$3.Fo.set(Cos(rho),0,-Sin(rho));
         Self.t$3.Si.set(Sin(rho),0,Cos(rho));
         fw = (plough$1)?0.29:0.13;
         jj[13].set((plough$1)?-0.05:0,0.13,-fw);
         jj[16].set((plough$1)?-0.05:0,0.13,fw);
         H$5 = 0.13 + 0.466 * (0.95 - 0.45 * comp$3);
         px = -0.04 - comp$3 * 0.06;
         cl = Cos(ln);
         sl = Sin(ln);
         jj[0].set(px,H$5 * cl,H$5 * sl);
         jj[11].copy(jj[0]).addScaledVector(Self.t$3.Si,-0.15);
         jj[11].y -= 0.05;
         jj[14].copy(jj[0]).addScaledVector(Self.t$3.Si,0.15);
         jj[14].y -= 0.05;
         Self.t$3.sp.set(Sin(bend$1),Cos(bend$1),0);
         RotX(Self.t$3.sp,ln * 0.35);
         jj[1].copy(jj[0]).addScaledVector(Self.t$3.sp,0.277);
         jj[2].copy(jj[1]).add(Self.t$3.tmp$1.set(0.02,0.155,0));
         jj[3].copy(jj[2]).add(Self.t$3.tmp$1.set(0.03,0.279,0));
         jj[4].copy(jj[3]).addScaledVector(Self.t$3.Fo,0.2);
         jj[5].copy(jj[1]).addScaledVector(Self.t$3.Si,-0.22).addScaledVector(Self.t$3.sp,0.03);
         jj[8].copy(jj[1]).addScaledVector(Self.t$3.Si,0.22).addScaledVector(Self.t$3.sp,0.03);
         plantL = (s$12.plant > 0 && s$12.plantSide < 0)?s$12.plant / 0.35:0;
         plantR = (s$12.plant > 0 && s$12.plantSide > 0)?s$12.plant / 0.35:0;
         jj[7].copy(jj[5]).addScaledVector(Self.t$3.Fo,0.8 * (0.3 + plantL * 0.15)).addScaledVector(Self.t$3.Si,-0.08);
         jj[7].y -= 0.8 * (0.32 + plantL * 0.08);
         jj[10].copy(jj[8]).addScaledVector(Self.t$3.Fo,0.8 * (0.3 + plantR * 0.15)).addScaledVector(Self.t$3.Si,0.08);
         jj[10].y -= 0.8 * (0.32 + plantR * 0.08);
         Self.t$3.pole.copy(Self.t$3.Fo).add(Self.t$3.tmp$1.set(0,0.1,(plough$1)?0.35:0));
         SolveIK(jj[11],jj[13],0.233,0.233,Self.t$3.pole,jj[12]);
         Self.t$3.pole.copy(Self.t$3.Fo).add(Self.t$3.tmp$1.set(0,0.1,(plough$1)?-0.35:0));
         SolveIK(jj[14],jj[16],0.233,0.233,Self.t$3.pole,jj[15]);
         Self.t$3.pole.set(-0.5,-0.6,-0.4);
         SolveIK(jj[5],jj[7],0.237,0.214,Self.t$3.pole,jj[6]);
         Self.t$3.pole.set(-0.5,-0.6,0.4);
         SolveIK(jj[8],jj[10],0.237,0.214,Self.t$3.pole,jj[9]);
         for(let i$6=0;i$6<=16;i$6++) {
            TSkierAI.ToWorld(Self,s$12,jj[i$6],jj[i$6]);
         }
         k4 = k$4*4;
         k8 = k$4*8;
         TSkierAI.Seg(Self,Self.mLeg,k4,jj[11],jj[12],s$12.cP);
         TSkierAI.Seg(Self,Self.mLeg,k4 + 1,jj[12],jj[13],s$12.cP);
         TSkierAI.Seg(Self,Self.mLeg,k4 + 2,jj[14],jj[15],s$12.cP);
         TSkierAI.Seg(Self,Self.mLeg,k4 + 3,jj[15],jj[16],s$12.cP);
         TSkierAI.Seg(Self,Self.mArm,k4,jj[5],jj[6],s$12.cJ);
         TSkierAI.Seg(Self,Self.mArm,k4 + 1,jj[6],jj[7],s$12.cJ);
         TSkierAI.Seg(Self,Self.mArm,k4 + 2,jj[8],jj[9],s$12.cJ);
         TSkierAI.Seg(Self,Self.mArm,k4 + 3,jj[9],jj[10],s$12.cJ);
         TSkierAI.Ball(Self,Self.mJoint,k8,jj[11],0.135,s$12.cP);
         TSkierAI.Ball(Self,Self.mJoint,k8 + 1,jj[14],0.135,s$12.cP);
         TSkierAI.Ball(Self,Self.mJoint,k8 + 2,jj[12],0.12,s$12.cP);
         TSkierAI.Ball(Self,Self.mJoint,k8 + 3,jj[15],0.12,s$12.cP);
         TSkierAI.Ball(Self,Self.mJoint,k8 + 4,jj[5],0.105,s$12.cJ);
         TSkierAI.Ball(Self,Self.mJoint,k8 + 5,jj[8],0.105,s$12.cJ);
         TSkierAI.Ball(Self,Self.mJoint,k8 + 6,jj[6],0.092,s$12.cJ);
         TSkierAI.Ball(Self,Self.mJoint,k8 + 7,jj[9],0.092,s$12.cJ);
         Self.t$3.x$11.subVectors(jj[8],jj[5]);
         Self.t$3.y$7.subVectors(jj[1],jj[0]);
         Self.t$3.w$3.addVectors(jj[1],jj[0]).multiplyScalar(0.5).addScaledVector(Self.t$3.y$7,0.25);
         TSkierAI.Box(Self,Self.mTorso,k$4,Self.t$3.w$3,Self.t$3.x$11,Self.t$3.y$7,1.15,1,0.92,s$12.cJ,false);
         Self.t$3.x$11.subVectors(jj[14],jj[11]);
         TSkierAI.Box(Self,Self.mPelvis,k$4,jj[0],Self.t$3.x$11,Self.t$3.y$7,1.2,0.9,1,s$12.cP,false);
         kk = k$4;
         hk = function (mesh$3, col$5) {
            Self.t$3.y$7.subVectors(jj[3],jj[2]);
            Self.t$3.z$7.subVectors(jj[4],jj[3]);
            Self.t$3.x$11.crossVectors(Self.t$3.y$7,Self.t$3.z$7);
            TSkierAI.Box(Self,mesh$3,kk,jj[3],Self.t$3.x$11,Self.t$3.y$7,1,1,1,col$5,false);
         };
         hk(Self.mFace,14263171);
         hk(Self.mHead,s$12.cH);
         hk(Self.mHair,4860954);
         hk(Self.mStrap,1688575);
         hk(Self.mGog,2759178);
         TSkierAI.At(Self,Self.mHand,k$4*2,jj[7],1382172);
         TSkierAI.At(Self,Self.mHand,(k$4*2) + 1,jj[10],1382172);
         for(sd=0;sd<=1;sd++) {
            an = (!sd)?jj[13]:jj[16];
            ang = (plough$1)?(!sd)?0.36:-0.36:0;
            Self.t$3.x$11.copy(Self.t$3.f$3).multiplyScalar(Cos(ang)).addScaledVector(Self.t$3.r$3,Sin(ang));
            Self.t$3.y$7.copy(Self.t$3.up$1).multiplyScalar(Cos(ln * 0.7)).addScaledVector(Self.t$3.r$3,Sin(ln * 0.7) * ((plough$1)?(!sd)?-0.6:0.6:1));
            Self.t$3.w$3.copy(an).addScaledVector(Self.t$3.up$1,-0.12).addScaledVector(Self.t$3.x$11,0.1);
            TSkierAI.Box(Self,Self.mSki,(k$4*2) + sd,Self.t$3.w$3,Self.t$3.y$7,Self.t$3.x$11,1,1,1,s$12.cS,true);
            Self.t$3.w$3.copy(an).addScaledVector(Self.t$3.up$1,-0.03).addScaledVector(Self.t$3.x$11,0.03);
            TSkierAI.Box(Self,Self.mBoot,(k$4*2) + sd,Self.t$3.w$3,Self.t$3.y$7,Self.t$3.x$11,1,1,1,2764083,true);
         }
         for(sd=0;sd<=1;sd++) {
            hv = (!sd)?jj[7]:jj[10];
            pl = (!sd)?plantL:plantR;
            zs = (!sd)?-1:1;
            Self.t$3.tip$1.set(Lerp(-0.55,0.55,pl),Lerp(0.25,0,pl),zs * Lerp(0.3,0.42,pl));
            TSkierAI.ToWorld(Self,s$12,Self.t$3.tip$1,Self.t$3.tip$1);
            Self.t$3.tmp2$1.subVectors(Self.t$3.tip$1,hv).normalize();
            Self.t$3.tip$1.copy(hv).addScaledVector(Self.t$3.tmp2$1,0.9);
            TSkierAI.Seg(Self,Self.mPole,(k$4*2) + sd,hv,Self.t$3.tip$1,10133670);
         }
         ++k$4;
      }
      var $temp147;
      for(q$2=0,$temp147=Self.parts$7.length;q$2<$temp147;q$2++) {
         m$7 = Self.parts$7[q$2];
         m$7.count = k$4 * Self.partsPer[q$2];
         m$7.instanceMatrix.needsUpdate = true;
         if (Truthy(m$7.instanceColor)) {
            m$7.instanceColor.needsUpdate = true;
         }
      }
   }
   /// procedure TSkierAI.Reset(z: Float)
   ,Reset$1:function(Self, z$13) {
      var a$247 = 0,
         s$12 = null,
         a$248 = [];
      a$248 = Self.skiers$1;
      var $temp148;
      for(a$247=0,$temp148=a$248.length;a$247<$temp148;a$247++) {
         s$12 = a$248[a$247];
         s$12.active$1 = false;
      }
      for(let i$6=0;i$6<=7;i$6++) {
         TSkierAI.SpawnFree(Self,z$13 + 40 + i$6 * 45 + Random() * 30);
      }
   }
   /// procedure TSkierAI.Seg(mesh: JInstancedMesh; i: Integer; a: JVector3; b: JVector3; col: Integer)
   ,Seg:function(Self, mesh$3, i$6, a$110, b$8, col$5) {
      var len$2 = 0;
      Self.t$3.y$7.subVectors(b$8,a$110);
      len$2 = Self.t$3.y$7.length();
      if (len$2 == 0) {
         len$2 = 0.0001;
      }
      Self.t$3.y$7.divideScalar(len$2);
      Self.t$3.x$11.set(1,0,0);
      if (Abs$_Float_(Self.t$3.y$7.x) > 0.9) {
         Self.t$3.x$11.set(0,0,1);
      }
      Self.t$3.z$7.crossVectors(Self.t$3.x$11,Self.t$3.y$7).normalize();
      Self.t$3.x$11.crossVectors(Self.t$3.y$7,Self.t$3.z$7);
      Self.t$3.m$1.makeBasis(Self.t$3.x$11,Self.t$3.y$7.multiplyScalar(len$2),Self.t$3.z$7).setPosition(a$110);
      mesh$3.setMatrixAt(i$6,Self.t$3.m$1);
      mesh$3.setColorAt(i$6,Self.t$3.col$2.setHex(col$5));
   }
   /// procedure TSkierAI.Spawn(s: TSkier; z: Float)
   ,Spawn:function(Self, s$12, z$13) {
      var r$7 = 0,
         W$1 = 0,
         ti = 0,
         ty = null;
      r$7 = Random();
      ti = 0;
      while (ti < 2) {
         r$7 -= SKIER_TYPES[ti].w$2;
         if (r$7 < 0) {
            break;
         }
         ++ti;
      }
      ty = SKIER_TYPES[ti];
      W$1 = TCourse.width$4(Self.course$3,z$13);
      s$12.active$1 = true;
      s$12.typ$1 = ti;
      s$12.z$8 = z$13;
      s$12.lane = (Random() * 2 - 1) * (W$1 - 5) * 0.7;
      s$12.speed = ty.sp0 * 0.7;
      s$12.baseSpeed = Lerp(ty.sp0,ty.sp1,Random()) * 1;
      s$12.amp = Lerp(ty.amp0,ty.amp1,Random());
      s$12.fq = Lerp(ty.fq0,ty.fq1,Random());
      s$12.phase = Random() * 6.28318530717959;
      s$12.state$2 = 0;
      s$12.timer = 0;
      s$12.crossTo = 0;
      s$12.stopTurn = 0;
      s$12.lean = 0;
      s$12.yaw = 0;
      s$12.hasPrevYaw = false;
      s$12.plant = 0;
      s$12.plantSide = 1;
      s$12.prevSin = 0;
      s$12.comp$1 = ty.comp;
      s$12.minDist = 99;
      s$12.prevRel = -1;
      s$12.hit = 0;
      s$12.cJ = ty.jackets[Trunc(Random() * ty.jackets.length)];
      s$12.cP = PANTS[Trunc(Random() * 6)];
      s$12.cH = HELMS[Trunc(Random() * 6)];
      s$12.cS = SKICOLS[Trunc(Random() * 5)];
      s$12.d$2 = s$12.lane + s$12.amp * Sin(s$12.phase);
   }
   /// function TSkierAI.SpawnFree(z: Float) : TSkier
   ,SpawnFree:function(Self, z$13) {
      var Result = null;
      var a$249 = 0,
         s$12 = null,
         a$250 = [];
      a$250 = Self.skiers$1;
      var $temp149;
      for(a$249=0,$temp149=a$250.length;a$249<$temp149;a$249++) {
         s$12 = a$250[a$249];
         if (!(s$12.active$1)) {
            TSkierAI.Spawn(Self,s$12,z$13);
            return s$12;
         }
      }
      Result = null;
      return Result
   }
   /// procedure TSkierAI.ToWorld(s: TSkier; v: JVector3; outV: JVector3)
   ,ToWorld:function(Self, s$12, v$4, outV) {
      var x$18 = 0,
         y$13 = 0,
         z$13 = 0;
      x$18 = v$4.x;
      y$13 = v$4.y;
      z$13 = v$4.z;
      outV.copy(s$12.pos).addScaledVector(Self.t$3.f$3,x$18).addScaledVector(Self.t$3.up$1,y$13).addScaledVector(Self.t$3.r$3,z$13);
   }
   /// procedure TSkierAI.Update(dt: Float; playerZ: Float; progress: Float)
   ,Update$2:function(Self, dt, playerZ, progress) {
      var target$3 = 0,
         count$2 = 0,
         W$1 = 0,
         chaos = 0,
         tgtSpeed = 0,
         dTg = 0,
         dd = 0,
         vz = 0,
         x$18 = 0,
         y$13 = 0,
         yaw$3 = 0,
         yawRate$1 = 0,
         sn = 0,
         c$7 = null,
         a$251 = 0,
         s$12 = null,
         a$252 = 0,
         s$13 = null,
         ty = null,
         a$253 = [],
         a$254 = [];
      c$7 = Self.course$3;
      Self.elapsed += dt;
      target$3 = Round(Lerp(8,26,ClampF(progress,0,1)));
      count$2 = 0;
      a$253 = Self.skiers$1;
      var $temp150;
      for(a$251=0,$temp150=a$253.length;a$251<$temp150;a$251++) {
         s$12 = a$253[a$251];
         if (s$12.active$1) {
            ++count$2;
         }
      }
      if (count$2 < target$3 && playerZ + 150 < c$7.zf - 20) {
         TSkierAI.SpawnFree(Self,playerZ + 150 + Random() * 190);
      }
      a$254 = Self.skiers$1;
      var $temp151;
      for(a$252=0,$temp151=a$254.length;a$252<$temp151;a$252++) {
         s$13 = a$254[a$252];
         if (!(s$13.active$1)) {
            continue;
         }
         if (s$13.z$8 < playerZ - 60 || s$13.z$8 > c$7.zf + 30) {
            s$13.active$1 = false;
            continue;
         }
         ty = SKIER_TYPES[s$13.typ$1];
         W$1 = TCourse.width$4(c$7,s$13.z$8);
         chaos = 1;
         tgtSpeed = s$13.baseSpeed * (1 + 0.35 * progress);
         if (!s$13.state$2) {
            s$13.speed = Damp(s$13.speed,tgtSpeed,1.2,dt);
            s$13.phase += 6.28318530717959 * s$13.fq * dt;
            dTg = s$13.lane + s$13.amp * Sin(s$13.phase);
            s$13.stopTurn = Damp(s$13.stopTurn,0,3,dt);
            if (Random() < ty.stop$3 * chaos * dt) {
               s$13.state$2 = 1;
               s$13.timer = 1.8 + Random() * 2.5;
               s$13.stopSide = (Random() < 0.5)?-1:1;
            } else if (Random() < ty.cross$1 * chaos * dt) {
               s$13.state$2 = 2;
               s$13.crossTo = (-SignF(s$13.lane)) * (W$1 - 5) * (0.4 + Random() * 0.5);
            }
         } else if (s$13.state$2 == 1) {
            s$13.speed = Damp(s$13.speed,0,2.4,dt);
            dTg = s$13.d$2;
            s$13.stopTurn = Damp(s$13.stopTurn,s$13.stopSide * 1.35,5,dt);
            s$13.timer -= dt;
            if (s$13.timer <= 0) {
               s$13.state$2 = 0;
            }
         } else {
            s$13.speed = Damp(s$13.speed,tgtSpeed * 0.75,1.5,dt);
            s$13.lane = Damp(s$13.lane,s$13.crossTo,0.55,dt);
            dTg = s$13.lane + s$13.amp * 0.2 * Sin(s$13.phase);
            if (Abs$_Float_(s$13.lane - s$13.crossTo) < 0.6) {
               s$13.state$2 = 0;
            }
         }
         if (s$13.hit > 0) {
            s$13.hit -= dt;
            s$13.speed = Damp(s$13.speed,0,4,dt);
         }
         dTg = ClampF(dTg,-(W$1 - 1.5),W$1 - 1.5);
         dd = (dTg - s$13.d$2) / Max$_Float_Float_(dt,0.0001);
         vz = Sqrt(Max$_Float_Float_(Math.pow(s$13.speed,2) - dd*dd,Math.pow(s$13.speed,2) * 0.15));
         s$13.d$2 = dTg;
         s$13.z$8 += vz * dt;
         x$18 = TCourse.cx(c$7,s$13.z$8) + s$13.d$2;
         y$13 = TCourse.height$4(c$7,x$18,s$13.z$8);
         s$13.vel.set(dd + TCourse.cxp(c$7,s$13.z$8) * vz,0,vz);
         s$13.pos.set(x$18,y$13,s$13.z$8);
         yaw$3 = ArcTan2(s$13.vel.x,s$13.vel.z);
         yawRate$1 = (!(s$13.hasPrevYaw))?0:WrapAngle(yaw$3 - s$13.prevYaw) / Max$_Float_Float_(dt,0.0001);
         s$13.prevYaw = yaw$3;
         s$13.hasPrevYaw = true;
         s$13.yaw = yaw$3;
         s$13.lean = Damp(s$13.lean,ClampF(-ArcTan(yawRate$1 * s$13.speed / 9.81),-0.7,0.7) + s$13.stopTurn * -0.25,8,dt);
         sn = Sin(s$13.phase);
         if ((s$13.state$2==0) && SignF(sn) != SignF(s$13.prevSin) && (!(ty.plough))) {
            s$13.plant = 0.35;
            s$13.plantSide = (sn > 0)?1:-1;
         }
         s$13.prevSin = sn;
         s$13.plant = Max$_Float_Float_(0,s$13.plant - dt);
         TCourse.normal$1(c$7,x$18,s$13.z$8,s$13.n$3);
         s$13.a$91.copy(s$13.pos).addScaledVector(s$13.n$3,0.35);
         s$13.b$4.copy(s$13.pos).addScaledVector(s$13.n$3,1.55);
      }
   }
   ,Destroy:TObject.Destroy
};
/// TSkier = class (TObject)
var TSkier = {
   $ClassName:"TSkier",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.a$91 = $.b$4 = $.n$3 = $.pos = $.vel = null;
      $.active$1 = $.hasPrevYaw = false;
      $.amp = $.baseSpeed = $.comp$1 = $.crossTo = $.d$2 = $.fq = $.hit = $.lane = $.lean = $.minDist = $.phase = $.plant = $.plantSide = $.prevRel = $.prevSin = $.prevYaw = $.speed = $.stopSide = $.stopTurn = $.timer = $.yaw = $.z$8 = 0;
      $.cH = $.cJ = $.cP = $.cS = $.state$2 = $.typ$1 = 0;
   }
   ,Destroy:TObject.Destroy
};
function SegSegDist(p1, q1, p2, q2) {
   var Result = 0;
   var a$92 = 0,
      e = 0,
      f$4 = 0,
      c$5 = 0,
      b$5 = 0,
      den = 0,
      s$7 = 0,
      t$4 = 0,
      d1 = null,
      d2 = null,
      r$4 = null;
   if (!_sd1) {
      _sd1 = new THREE.Vector3();
      _sd2 = new THREE.Vector3();
      _sr = new THREE.Vector3();
      _sc1 = new THREE.Vector3();
      _sc2 = new THREE.Vector3();
   }
   d1 = _sd1.subVectors(q1,p1);
   d2 = _sd2.subVectors(q2,p2);
   r$4 = _sr.subVectors(p1,p2);
   a$92 = d1.dot(d1);
   e = d2.dot(d2);
   f$4 = d2.dot(r$4);
   c$5 = d1.dot(r$4);
   b$5 = d1.dot(d2);
   den = a$92 * e - b$5*b$5;
   s$7 = (den > 1E-8)?ClampF((b$5 * f$4 - c$5 * e) / den,0,1):0;
   t$4 = (b$5 * s$7 + f$4) / e;
   if (t$4 < 0) {
      t$4 = 0;
      s$7 = ClampF((-c$5) / a$92,0,1);
   } else if (t$4 > 1) {
      t$4 = 1;
      s$7 = ClampF((b$5 - c$5) / a$92,0,1);
   }
   _sc1.copy(p1).addScaledVector(d1,s$7);
   _sc2.copy(p2).addScaledVector(d2,t$4);
   Result = _sc1.distanceTo(_sc2);
   return Result
}
function SegClosestDelta(outV) {
   outV.subVectors(_sc2,_sc1);
}
function White(rgh, mtl) {
   var Result = null;
   Result = new THREE.MeshStandardMaterial({
      "roughness" : rgh
      ,"metalness" : mtl
      ,"color" : 16777215
   });
   return Result
}
function MkType(name$8, w$5, sp0$1, sp1$1, amp0$1, amp1$1, fq0$1, fq1$1, plough$1, comp$3, stop$4, cross$2, jackets$1) {
   var Result = null;
   Result = TObject.Create($New(TSkierType));
   Result.name$5 = name$8;
   Result.w$2 = w$5;
   Result.sp0 = sp0$1;
   Result.sp1 = sp1$1;
   Result.amp0 = amp0$1;
   Result.amp1 = amp1$1;
   Result.fq0 = fq0$1;
   Result.fq1 = fq1$1;
   Result.plough = plough$1;
   Result.comp = comp$3;
   Result.stop$3 = stop$4;
   Result.cross$1 = cross$2;
   Result.jackets = jackets$1;
   return Result
}
var SKICOLS = [16726832,2003199,1118481,16777215,16766474],
    PANTS = [1777450,3817291,994634,4860970,14474460,2968109],
    HELMS = [16777215,1118481,16726832,2003199,16766474,9342611];
/// TRivalDef = class (TObject)
var TRivalDef = {
   $ClassName:"TRivalDef",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.col$3 = null;
      $.lane$1 = $.seed = $.vmax = 0;
      $.name$6 = "";
   }
   ,Destroy:TObject.Destroy
};
/// TRival = class (TObject)
var TRival = {
   $ClassName:"TRival",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.active$2 = $.finished$1 = false;
      $.anim$1 = $.boardPos$1 = $.boardQ$1 = $.course$6 = $.def = $.inp$1 = $.onDown = $.phys$2 = $.rider$1 = $.st$1 = null;
      $.downT = $.time$1 = 0;
      $.wj$1 = [];
   }
   /// constructor TRival.Create(scene: JScene; c: TCourse; terrain: TTerrain; d: TRivalDef)
   ,Create$153:function(Self, scene$1, c$7, terrain$2, d$8) {
      Self.def = d$8;
      Self.course$6 = c$7;
      Self.phys$2 = TRiderPhysics.Create$150($New(TRiderPhysics),c$7,terrain$2);
      Self.rider$1 = TRider.Create$149($New(TRider),scene$1,null);
      TRider.SetColors(Self.rider$1,d$8.col$3);
      Self.anim$1 = TRiderAnimator.Create$144($New(TRiderAnimator));
      Self.wj$1 = NewJoints();
      Self.boardPos$1 = new THREE.Vector3();
      Self.boardQ$1 = new THREE.Quaternion();
      Self.st$1 = NewPoseState(Self.phys$2.vel$2);
      Self.inp$1 = TObject.Create($New(TControls));
      Self.active$2 = false;
      Self.rider$1.root.visible = false;
      return Self
   }
   /// procedure TRival.KnockDown()
   ,KnockDown:function(Self) {
      var p$7 = null;
      p$7 = Self.phys$2;
      p$7.crashReason = "";
      Self.downT = 1.6;
      Self.rider$1.root.visible = false;
      if (Self.onDown) {
         Self.onDown(p$7.pos$2,p$7.vel$2);
      }
   }
   /// procedure TRival.Render(alpha: Float; dt: Float)
   ,Render$1:function(Self, alpha, dt) {
      var p$7 = null,
         S$1 = null;
      if ((!(Self.active$2)) || (!(Self.rider$1.root.visible))) {
         return;
      }
      p$7 = Self.phys$2;
      S$1 = Self.st$1.anim;
      Self.st$1.pos$1.lerpVectors(p$7.prevPos,p$7.pos$2,alpha);
      Self.st$1.up$2.lerpVectors(p$7.prevBoardUp,p$7.boardUp,alpha).normalize();
      Self.st$1.yaw$1 = p$7.prevYaw$1 + WrapAngle(p$7.yaw$2 - p$7.prevYaw$1) * alpha;
      Self.st$1.edge$1 = Lerp(p$7.prevEdge,p$7.edge$3,alpha);
      Self.st$1.flip = 0;
      S$1.latAcc = p$7.latAcc$1;
      S$1.load = (p$7.grounded$1)?p$7.load$1:0;
      S$1.tuck$1 = p$7.tuck$2;
      S$1.brake$1 = p$7.brake$2;
      S$1.charge = 0;
      S$1.grounded = p$7.grounded$1;
      S$1.airTime = p$7.airTime$1;
      S$1.idle = p$7.frozen;
      S$1.grab$1 = 0;
      PoseFromState(Self.anim$1,Self.st$1,dt,Self.wj$1,Self.boardPos$1,Self.boardQ$1);
      TRider.Pose(Self.rider$1,Self.wj$1,Self.boardPos$1,Self.boardQ$1);
   }
   /// procedure TRival.Reset(z: Float; isActive: Boolean)
   ,Reset$3:function(Self, z$13, isActive) {
      var p$7 = null,
         c$7 = null;
      p$7 = Self.phys$2;
      c$7 = Self.course$6;
      TRiderPhysics.Reset$2(p$7,z$13);
      p$7.pos$2.x += Self.def.lane$1 * 12;
      p$7.pos$2.y = TCourse.height$4(c$7,p$7.pos$2.x,p$7.pos$2.z);
      p$7.prevPos.copy(p$7.pos$2);
      p$7.frozen = true;
      Self.active$2 = isActive;
      Self.finished$1 = false;
      Self.time$1 = 0;
      Self.downT = 0;
      Self.rider$1.root.visible = isActive;
   }
   /// procedure TRival.Step(dt: Float; playing: Boolean; progress: Float; runTime: Float; skiers: TSkierAI)
   ,Step$2:function(Self, dt, playing, progress, runTime$2, skiers$2) {
      var d$8 = 0,
         z$13 = 0,
         p$7 = null,
         c$7 = null;
      if (!(Self.active$2)) {
         return;
      }
      p$7 = Self.phys$2;
      if (Self.downT > 0) {
         p$7.prevPos.copy(p$7.pos$2);
         Self.downT -= dt;
         if (Self.downT <= 0) {
            c$7 = Self.course$6;
            d$8 = Self.def.lane$1 * TCourse.width$4(c$7,p$7.pos$2.z) * 0.5;
            z$13 = TCourse.safeZ(c$7,p$7.pos$2.z,d$8);
            TRiderPhysics.Reset$2(p$7,z$13);
            p$7.pos$2.x = TCourse.cx(c$7,z$13) + d$8;
            p$7.vel$2.set(Sin(p$7.yaw$2),0,Cos(p$7.yaw$2)).multiplyScalar(3);
            p$7.pos$2.y = TCourse.height$4(c$7,p$7.pos$2.x,z$13);
            p$7.prevPos.copy(p$7.pos$2);
            Self.rider$1.root.visible = true;
         }
         return;
      }
      p$7.frozen = !(playing);
      TRival.Think(Self,progress,skiers$2);
      TRiderPhysics.Step$1(p$7,dt,Self.inp$1);
      if (p$7.crashReason != "") {
         TRival.KnockDown(Self);
      }
      if (playing && (!(Self.finished$1)) && p$7.pos$2.z > Self.course$6.zf) {
         Self.finished$1 = true;
         Self.time$1 = runTime$2;
      }
   }
   /// procedure TRival.Think(progress: Float; skiers: TSkierAI)
   ,Think:function(Self, progress, skiers$2) {
      var sp$1 = 0,
         zt = 0,
         W$1 = 0,
         d$8 = 0,
         dr$1 = 0,
         dz = 0,
         sd = 0,
         xt = 0,
         velYaw = 0,
         err = 0,
         vt = 0,
         p$7 = null,
         c$7 = null,
         df = null,
         ip = null,
         a$255 = 0,
         s$12 = null,
         a$256 = [];
      p$7 = Self.phys$2;
      c$7 = Self.course$6;
      df = Self.def;
      ip = Self.inp$1;
      sp$1 = p$7.speed$2;
      if (Self.finished$1) {
         ip.steer = 0;
         ip.tuck = 0;
         ip.brake = (sp$1 > 2)?1:0;
         return;
      }
      zt = p$7.pos$2.z + 9 + sp$1 * 0.9;
      W$1 = TCourse.width$4(c$7,zt);
      d$8 = df.lane$1 * W$1 + Sin(zt * 0.012 + df.seed) * W$1 * 0.28;
      dr$1 = p$7.pos$2.x - TCourse.cx(c$7,p$7.pos$2.z);
      if (!!skiers$2) {
         a$256 = skiers$2.skiers$1;
         var $temp152;
         for(a$255=0,$temp152=a$256.length;a$255<$temp152;a$255++) {
            s$12 = a$256[a$255];
            dz = s$12.z$8 - p$7.pos$2.z;
            if ((!(s$12.active$1)) || dz < 2 || dz > 26) {
               continue;
            }
            sd = s$12.pos.x - TCourse.cx(c$7,s$12.z$8);
            if (Abs$_Float_(sd - dr$1) < 3) {
               d$8 = sd + ((dr$1 >= sd)?1:-1) * 4;
            }
         }
      }
      d$8 = ClampF(d$8,-(W$1 - 3),W$1 - 3);
      xt = TCourse.cx(c$7,zt) + d$8;
      velYaw = (sp$1 > 2)?ArcTan2(p$7.vel$2.x,p$7.vel$2.z):p$7.yaw$2;
      err = WrapAngle(ArcTan2(xt - p$7.pos$2.x,zt - p$7.pos$2.z) - velYaw);
      ip.steer = ClampF((-err) * 3.4,-1,1);
      vt = df.vmax * (0.9 + 0.15 * progress);
      ip.tuck = (sp$1 < vt && Abs$_Float_(ip.steer) < 0.35)?1:0;
      ip.brake = (sp$1 > vt + 1)?ClampF((sp$1 - vt) / 5,0,0.5):0;
   }
   ,Destroy:TObject.Destroy
};
/// TGhost = class (TObject)
var TGhost = {
   $ClassName:"TGhost",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.anim$2 = $.boardPos$2 = $.boardQ$2 = $.data$1 = $.rider$2 = $.st$2 = null;
      $.i$4 = 0;
      $.wj$2 = [];
   }
   /// constructor TGhost.Create(scene: JScene)
   ,Create$154:function(Self, scene$1) {
      Self.rider$2 = TRider.Create$149($New(TRider),scene$1,null);
      Self.anim$2 = TRiderAnimator.Create$144($New(TRiderAnimator));
      Self.data$1 = null;
      Self.i$4 = 0;
      Self.rider$2.root.traverse(function (o$1) {
         var ov,
            mesh$3 = null,
            m$7 = null,
            mv;
         ov = o$1;
         if (!(Truthy(ov.isMesh))) {
            return;
         }
         o$1.castShadow = false;
         mesh$3 = o$1;
         m$7 = mesh$3.material.clone();
         m$7.transparent = true;
         m$7.opacity = 0.42;
         m$7.depthWrite = false;
         mv = m$7;
         if (Truthy(mv.emissive)) {
            m$7.emissive.setHex(4161480);
            m$7.emissiveIntensity = 0.7;
         }
         mesh$3.material = m$7;
         o$1.renderOrder = 2;
      });
      Self.wj$2 = NewJoints();
      Self.boardPos$2 = new THREE.Vector3();
      Self.boardQ$2 = new THREE.Quaternion();
      Self.st$2 = NewPoseState(new THREE.Vector3());
      Self.rider$2.root.visible = false;
      return Self
   }
   /// function TGhost.Decode(str: String) : JFloat32Array
   ,Decode$4:function(Self, str) {
      var Result = null;
      var s = atob(str), b = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
    Result = new Float32Array(b.buffer);
      return Result
   }
   /// function TGhost.Encode(arr: array of Float) : String
   ,Encode$4:function(Self, arr) {
      var Result = "";
      var b = new Uint8Array(new Float32Array(arr).buffer), s = '';
    for (var i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    Result = btoa(s);
      return Result
   }
   /// procedure TGhost.Load()
   ,Load:function(Self) {
      var raw,
         g$8;
      try {
         raw = localStorage.getItem(StoreKey("ghost"));
         g$8 = JSON.parse((Truthy(raw))?String(raw):"null");
         if (Truthy(g$8) && g$8.f == 22) {
            Self.data$1 = TGhost.Decode$4(Self.ClassType,String(g$8.data));
         } else {
            Self.data$1 = null;
         }
      } catch ($e) {
         Self.data$1 = null;
      }
      Self.i$4 = 0;
   }
   /// procedure TGhost.Sample(arr: array of Float; t: Float; p: TRiderPhysics; mode: String)
   ,Sample:function(Self, arr, t$11, p$7, mode$1) {
      arr.push(t$11);
      arr.push(p$7.pos$2.x);
      arr.push(p$7.pos$2.y);
      arr.push(p$7.pos$2.z);
      arr.push(p$7.boardUp.x);
      arr.push(p$7.boardUp.y);
      arr.push(p$7.boardUp.z);
      arr.push(p$7.yaw$2);
      arr.push(p$7.edge$3);
      arr.push(p$7.latAcc$1);
      arr.push((p$7.grounded$1)?p$7.load$1:0);
      arr.push(p$7.tuck$2);
      arr.push(p$7.brake$2);
      arr.push(p$7.charge$1);
      arr.push((p$7.grounded$1)?1:0);
      arr.push(p$7.airTime$1);
      arr.push(p$7.vel$2.x);
      arr.push(p$7.vel$2.y);
      arr.push(p$7.vel$2.z);
      arr.push(p$7.flip$1);
      arr.push(p$7.grab$2);
      arr.push((mode$1 == "ride")?1:0);
   }
   /// procedure TGhost.Save(arr: array of Float; tm: Float)
   ,Save:function(Self, arr, tm) {
      try {
         localStorage.setItem(StoreKey("ghost"),JSON.stringify({
            "time" : tm
            ,"f" : 22
            ,"data" : TGhost.Encode$4(Self.ClassType,arr)
         }));
      } catch ($e) {
         /* null */
      }
      Self.data$1 = new Float32Array(arr);
   }
   /// procedure TGhost.Update(t: Float; dt: Float; show: Boolean)
   ,Update$6:function(Self, t$11, dt, show) {
      var n$7 = 0,
         a$110 = 0,
         b$8 = 0,
         u$3 = 0,
         D = null,
         R$1 = null,
         L$3 = null,
         S$1 = null;
      D = Self.data$1;
      R$1 = Self.rider$2;
      if ((!(show)) || !D || D.length < 44) {
         R$1.root.visible = false;
         return;
      }
      n$7 = $Div(D.length,22);
      while (Self.i$4 > 0 && D[(Self.i$4 * 22)] > t$11) {
         --Self.i$4      }
      while (Self.i$4 < n$7 - 2 && D[((Self.i$4 + 1) * 22)] <= t$11) {
         ++Self.i$4      }
      a$110 = Self.i$4 * 22;
      b$8 = a$110 + 22;
      u$3 = ClampF((t$11 - D[a$110]) / Max$_Float_Float_(D[b$8] - D[a$110],0.001),0,1);
      L$3 = function (k$4) {
         var Result = 0;
         Result = D[(a$110 + k$4)] + (D[(b$8 + k$4)] - D[(a$110 + k$4)]) * u$3;
         return Result
      };
      if (D[(a$110 + 21)] < 0.5 || D[(b$8 + 21)] < 0.5 || t$11 > D[((n$7 - 1) * 22)] + 1.5) {
         R$1.root.visible = false;
         return;
      }
      S$1 = Self.st$2.anim;
      Self.st$2.pos$1.set(L$3(1),L$3(2),L$3(3));
      Self.st$2.up$2.set(L$3(4),L$3(5),L$3(6)).normalize();
      Self.st$2.yaw$1 = D[(a$110 + 7)] + WrapAngle(D[(b$8 + 7)] - D[(a$110 + 7)]) * u$3;
      Self.st$2.edge$1 = L$3(8);
      S$1.latAcc = L$3(9);
      S$1.load = L$3(10);
      S$1.tuck$1 = L$3(11);
      S$1.brake$1 = L$3(12);
      S$1.charge = L$3(13);
      S$1.grounded = D[(a$110 + 14)] > 0.5;
      S$1.airTime = L$3(15);
      Self.st$2.vel$1.set(L$3(16),L$3(17),L$3(18));
      Self.st$2.flip = L$3(19);
      S$1.grab$1 = L$3(20);
      PoseFromState(Self.anim$2,Self.st$2,dt,Self.wj$2,Self.boardPos$2,Self.boardQ$2);
      TRider.Pose(R$1,Self.wj$2,Self.boardPos$2,Self.boardQ$2);
      R$1.root.visible = true;
   }
   ,Destroy:TObject.Destroy
};
function NewPoseState(vel$5) {
   var Result = null;
   Result = TObject.Create($New(TPoseState));
   Result.pos$1 = new THREE.Vector3();
   Result.up$2 = new THREE.Vector3();
   Result.vel$1 = vel$5;
   Result.yaw$1 = 0;
   Result.edge$1 = 0;
   Result.flip = 0;
   Result.anim = TAnimState.Create$147($New(TAnimState));
   Result.anim.grounded = true;
   return Result
}
function MkRival(name$8, vmax$1, lane$2, seed$1, col$5) {
   var Result = null;
   Result = TObject.Create($New(TRivalDef));
   Result.name$6 = name$8;
   Result.vmax = vmax$1;
   Result.lane$1 = lane$2;
   Result.seed = seed$1;
   Result.col$3 = col$5;
   return Result
}
/// TTrail = class (TObject)
var TTrail = {
   $ClassName:"TTrail",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.BirthA = $.KindA = $.last$1 = $.mat$1 = $.mesh$2 = $.OnA = $.PosA = $.SideA = $._r = null;
      $.broken = false;
      $.head$1 = $.n$6 = 0;
   }
   /// procedure TTrail.Add(p: JVector3; right: JVector3; nrm: JVector3; width: Float; kind: Float; time: Float)
   ,Add$3:function(Self, p$7, right$2, nrm$1, width$5, kind, time$2) {
      var NN = 0,
         i$6 = 0,
         a$110 = 0,
         pv = 0,
         g1 = 0,
         g2 = 0,
         onV = 0,
         r$7 = null,
         geo = null;
      if ((!(Self.broken)) && p$7.distanceToSquared(Self.last$1) < 0.09) {
         return;
      }
      NN = Self.n$6;
      i$6 = Self.head$1;
      a$110 = i$6*2;
      Self.head$1 = (Self.head$1 + 1) % NN;
      if (Self.broken) {
         pv = ((i$6 - 1 + NN) % NN)*2;
         Self.OnA[pv]=0;
         Self.OnA[(pv + 1)]=0;
      }
      r$7 = Self._r.copy(right$2).multiplyScalar(width$5 * 0.5);
      Self.PosA[(a$110 * 3)]=(p$7.x - r$7.x + nrm$1.x * 0.04);
      Self.PosA[(a$110 * 3 + 1)]=(p$7.y - r$7.y + nrm$1.y * 0.04);
      Self.PosA[(a$110 * 3 + 2)]=(p$7.z - r$7.z + nrm$1.z * 0.04);
      Self.PosA[(a$110 * 3 + 3)]=(p$7.x + r$7.x + nrm$1.x * 0.04);
      Self.PosA[(a$110 * 3 + 4)]=(p$7.y + r$7.y + nrm$1.y * 0.04);
      Self.PosA[(a$110 * 3 + 5)]=(p$7.z + r$7.z + nrm$1.z * 0.04);
      Self.BirthA[a$110]=time$2;
      Self.BirthA[(a$110 + 1)]=time$2;
      Self.KindA[a$110]=kind;
      Self.KindA[(a$110 + 1)]=kind;
      onV = (Self.broken)?0:1;
      Self.OnA[a$110]=onV;
      Self.OnA[(a$110 + 1)]=onV;
      Self.broken = false;
      g1 = Self.head$1*2;
      g2 = ((Self.head$1 + 1) % NN)*2;
      for(let k$4=0;k$4<=5;k$4++) {
         Self.PosA[(g1 * 3 + k$4)]=Self.PosA[(a$110 * 3 + k$4)];
      }
      Self.OnA[g1]=0;
      Self.OnA[(g1 + 1)]=0;
      Self.OnA[g2]=0;
      Self.OnA[(g2 + 1)]=0;
      Self.last$1.copy(p$7);
      geo = Self.mesh$2.geometry;
      geo.getAttribute("position").needsUpdate = true;
      geo.getAttribute("birth").needsUpdate = true;
      geo.getAttribute("on").needsUpdate = true;
      geo.getAttribute("kind").needsUpdate = true;
   }
   /// procedure TTrail.BreakLine()
   ,BreakLine:function(Self) {
      Self.broken = true;
   }
   /// constructor TTrail.Create(scene: JScene; aN: Integer = 700)
   ,Create$160:function(Self, scene$1, aN) {
      var a$110 = 0,
         b$8 = 0,
         g$8 = null,
         idx$2 = [],
         unis;
      Self.n$6 = aN;
      Self.head$1 = 0;
      Self.last$1 = new THREE.Vector3(1000000000,0,0);
      Self.broken = true;
      g$8 = new THREE.BufferGeometry();
      Self.PosA = new Float32Array((aN*2) * 3);
      Self.BirthA = new Float32Array(aN*2);
      Self.OnA = new Float32Array(aN*2);
      Self.SideA = new Float32Array(aN*2);
      Self.KindA = new Float32Array(aN*2);
      for(let i$6=0,$temp153=aN;i$6<$temp153;i$6++) {
         Self.SideA[(i$6*2)]=0;
         Self.SideA[((i$6*2) + 1)]=1;
         Self.BirthA[(i$6*2)]=(-10000);
         Self.BirthA[((i$6*2) + 1)]=(-10000);
      }
      g$8.setAttribute("position",new THREE.BufferAttribute(Self.PosA,3));
      g$8.setAttribute("birth",new THREE.BufferAttribute(Self.BirthA,1));
      g$8.setAttribute("on",new THREE.BufferAttribute(Self.OnA,1));
      g$8.setAttribute("side",new THREE.BufferAttribute(Self.SideA,1));
      g$8.setAttribute("kind",new THREE.BufferAttribute(Self.KindA,1));
      for(let i$7=0,$temp154=aN;i$7<$temp154;i$7++) {
         a$110 = i$7*2;
         b$8 = ((i$7 + 1) % aN)*2;
         idx$2.push(a$110);
         idx$2.push(b$8);
         idx$2.push(a$110 + 1);
         idx$2.push(a$110 + 1);
         idx$2.push(b$8);
         idx$2.push(b$8 + 1);
      }
      g$8.setIndex(idx$2);
      unis = {};
      unis.uTime = SHARED.time;
      unis.uFade = Uniform(28);
      Self.mat$1 = new THREE.ShaderMaterial({
         "vertexShader" : "attribute float birth; attribute float on; attribute float side; attribute float kind; uniform float uTime; uniform float uFade;\r\n        varying float vA; varying float vS; varying float vK;\r\n        void main(){ float age = uTime - birth; vA = on * (1.0 - smoothstep(uFade * 0.4, uFade, age)); vS = side; vK = kind;\r\n          vec4 mv = modelViewMatrix * vec4(position, 1.0); vA *= 1.0 - smoothstep(60.0, 140.0, -mv.z); gl_Position = projectionMatrix * mv; }"
         ,"uniforms" : unis
         ,"transparent" : true
         ,"polygonOffsetUnits" : -4
         ,"polygonOffsetFactor" : -2
         ,"polygonOffset" : true
         ,"fragmentShader" : "varying float vA; varying float vS; varying float vK;\r\n        void main(){ float e = 1.0 - pow(abs(vS * 2.0 - 1.0), mix(1.5, 6.0, vK)); \/\/ Carve = scharfe Rille, Rutschen = breite Flaeche\r\n          vec3 col = mix(vec3(0.56, 0.64, 0.80), vec3(0.42, 0.50, 0.70), vK);\r\n          gl_FragColor = vec4(col, vA * e * mix(0.28, 0.55, vK)); }"
         ,"depthWrite" : false
      });
      Self.mesh$2 = new THREE.Mesh(g$8,Self.mat$1);
      Self.mesh$2.frustumCulled = false;
      scene$1.add(Self.mesh$2);
      Self._r = new THREE.Vector3();
      return Self
   }
   /// procedure TTrail.Reset()
   ,Reset$5:function(Self) {
      Self.OnA.fill(0);
      Self.broken = true;
      Self.last$1.set(1000000000,0,0);
      Self.mesh$2.geometry.getAttribute("on").needsUpdate = true;
   }
   ,Destroy:TObject.Destroy
};
/// TParticleSystem = class (TObject)
var TParticleSystem = {
   $ClassName:"TParticleSystem",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.aAlpha = $.aPos = $.aSize = $.life = $.mat$2 = $.maxLife = $.points$1 = $.pos$3 = $.size0 = $.vel$3 = null;
      $.cursor = $.limit = $.maxN$1 = 0;
   }
   /// procedure TParticleSystem.Burst(p: JVector3; v: JVector3; count: Integer; spread: Float; up: Float; lf: Float; size: Float)
   ,Burst$1:function(Self, p$7, v$4, count$2, spread, up$5, lf, size$1) {
      var a$110 = 0,
         r$7 = 0;
      for(let k$4=0,$temp155=count$2;k$4<$temp155;k$4++) {
         a$110 = Random() * 6.28318530717959;
         r$7 = Random() * spread;
         TParticleSystem.Emit$2(Self,p$7.x + (Random() - 0.5) * 0.6,p$7.y + 0.1,p$7.z + (Random() - 0.5) * 0.6,v$4.x * 0.4 + Cos(a$110) * r$7,Random() * up$5,v$4.z * 0.4 + Sin(a$110) * r$7,lf * (0.6 + Random() * 0.8),size$1 * (0.6 + Random() * 0.8));
      }
   }
   /// procedure TParticleSystem.Clear()
   ,Clear$2:function(Self) {
      Self.life.fill(0);
   }
   /// constructor TParticleSystem.Create(scene: JScene; aMax: Integer = 4000)
   ,Create$161:function(Self, scene$1, aMax) {
      var g$8 = null,
         unis;
      Self.maxN$1 = aMax;
      Self.cursor = 0;
      Self.limit = aMax;
      Self.pos$3 = new Float32Array(aMax * 3);
      Self.vel$3 = new Float32Array(aMax * 3);
      Self.life = new Float32Array(aMax);
      Self.maxLife = new Float32Array(aMax);
      Self.size0 = new Float32Array(aMax);
      g$8 = new THREE.BufferGeometry();
      Self.aPos = new THREE.BufferAttribute(Self.pos$3,3);
      Self.aPos.setUsage(35048);
      Self.aSize = new THREE.BufferAttribute(new Float32Array(aMax),1);
      Self.aSize.setUsage(35048);
      Self.aAlpha = new THREE.BufferAttribute(new Float32Array(aMax),1);
      Self.aAlpha.setUsage(35048);
      g$8.setAttribute("position",Self.aPos);
      g$8.setAttribute("size",Self.aSize);
      g$8.setAttribute("alpha",Self.aAlpha);
      unis = {};
      unis.uScale = Uniform(600);
      unis.uSun = Uniform(new THREE.Color(1.25,1.22,1.15));
      unis.uShade = Uniform(new THREE.Color(0.62,0.72,0.9));
      Self.mat$2 = new THREE.ShaderMaterial({
         "vertexShader" : "attribute float size; attribute float alpha; uniform float uScale; varying float vA; varying float vY;\r\n        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size * uScale \/ max(-mv.z, 0.1); vA = alpha; vY = 0.0;\r\n          gl_Position = projectionMatrix * mv; if (alpha <= 0.0) gl_PointSize = 0.0; }"
         ,"uniforms" : unis
         ,"transparent" : true
         ,"fragmentShader" : "uniform vec3 uSun; uniform vec3 uShade; varying float vA;\r\n        void main(){ vec2 d = gl_PointCoord - 0.5; float r = dot(d, d) * 4.0; if (r > 1.0) discard;\r\n          float a = pow(1.0 - r, 1.6) * vA; vec3 col = mix(uShade, uSun, 0.55 + 0.45 * (0.5 - d.y));\r\n          gl_FragColor = vec4(col, a); }"
         ,"depthWrite" : false
      });
      Self.points$1 = new THREE.Points(g$8,Self.mat$2);
      Self.points$1.frustumCulled = false;
      scene$1.add(Self.points$1);
      return Self
   }
   /// procedure TParticleSystem.Emit(x: Float; y: Float; z: Float; vx: Float; vy: Float; vz: Float; lf: Float; size: Float)
   ,Emit$2:function(Self, x$18, y$13, z$13, vx, vy, vz, lf, size$1) {
      var i$6 = 0;
      i$6 = Self.cursor;
      Self.cursor = (Self.cursor + 1) % Self.limit;
      Self.pos$3[(i$6 * 3)]=x$18;
      Self.pos$3[(i$6 * 3 + 1)]=y$13;
      Self.pos$3[(i$6 * 3 + 2)]=z$13;
      Self.vel$3[(i$6 * 3)]=vx;
      Self.vel$3[(i$6 * 3 + 1)]=vy;
      Self.vel$3[(i$6 * 3 + 2)]=vz;
      Self.life[i$6]=lf;
      Self.maxLife[i$6]=lf;
      Self.size0[i$6]=size$1;
   }
   /// procedure TParticleSystem.SetLimit(n: Integer)
   ,SetLimit:function(Self, n$7) {
      Self.limit = Min$_Integer_Integer_(n$7,Self.maxN$1);
   }
   /// procedure TParticleSystem.Update(dt: Float)
   ,Update$11:function(Self, dt) {
      var drag = 0,
         g$8 = 0,
         t$11 = 0,
         PP = null,
         VV = null,
         S$1 = null,
         A$2 = null;
      PP = Self.pos$3;
      VV = Self.vel$3;
      S$1 = Self.aSize.array;
      A$2 = Self.aAlpha.array;
      drag = Exp(-2.4 * dt);
      g$8 = 4.4145 * dt;
      for(let i$6=0,$temp156=Self.limit;i$6<$temp156;i$6++) {
         if (Self.life[i$6] <= 0) {
            A$2[i$6]=0;
            continue;
         }
         Self.life[i$6]=(Self.life[i$6] - dt);
         t$11 = 1 - Self.life[i$6] / Self.maxLife[i$6];
         VV[(i$6 * 3)]=(VV[(i$6 * 3)] * drag);
         VV[(i$6 * 3 + 1)]=(VV[(i$6 * 3 + 1)] * drag - g$8);
         VV[(i$6 * 3 + 2)]=(VV[(i$6 * 3 + 2)] * drag);
         PP[(i$6 * 3)]=(PP[(i$6 * 3)] + VV[(i$6 * 3)] * dt);
         PP[(i$6 * 3 + 1)]=(PP[(i$6 * 3 + 1)] + VV[(i$6 * 3 + 1)] * dt);
         PP[(i$6 * 3 + 2)]=(PP[(i$6 * 3 + 2)] + VV[(i$6 * 3 + 2)] * dt);
         S$1[i$6]=(Self.size0[i$6] * (0.5 + t$11 * 1.8));
         A$2[i$6]=(Sin(Min$_Float_Float_(t$11 * 6,1) * 3.14159265358979 * 0.5) * (1 - t$11) * 0.75);
      }
      Self.aPos.needsUpdate = true;
      Self.aSize.needsUpdate = true;
      Self.aAlpha.needsUpdate = true;
   }
   ,Destroy:TObject.Destroy
};
/// TCamTarget = class (TObject)
var TCamTarget = {
   $ClassName:"TCamTarget",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.crashed = $.grounded$3 = false;
      $.focus$2 = $.head$2 = $.heading = $.lookDir = $.vel$4 = null;
      $.latAcc$2 = $.speed$5 = 0;
   }
   /// constructor TCamTarget.Create()
   ,Create$162:function(Self) {
      Self.vel$4 = new THREE.Vector3();
      Self.heading = new THREE.Vector3();
      Self.focus$2 = new THREE.Vector3();
      Self.head$2 = new THREE.Vector3();
      Self.lookDir = new THREE.Vector3();
      return Self
   }
   ,Destroy:TObject.Destroy
};
/// TCameraRig = class (TObject)
var TCameraRig = {
   $ClassName:"TCameraRig",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.cam = $.course$7 = $.dir = $.look$1 = $.pos$4 = $._d$1 = $._side = $._tmp = $._up$1 = null;
      $.fov$1 = $.roll = $.t$9 = $.trauma = 0;
      $.mode = 0;
   }
   /// procedure TCameraRig.AddTrauma(x: Float)
   ,AddTrauma:function(Self, x$18) {
      Self.trauma = Min$_Float_Float_(1,Self.trauma + x$18);
   }
   /// constructor TCameraRig.Create(camera: JPerspectiveCamera; c: TCourse)
   ,Create$163:function(Self, camera$2, c$7) {
      Self.cam = camera$2;
      Self.course$7 = c$7;
      Self.mode = 0;
      Self.pos$4 = new THREE.Vector3();
      Self.look$1 = new THREE.Vector3();
      Self.dir = new THREE.Vector3(0,0,1);
      Self.fov$1 = 62;
      Self.trauma = 0;
      Self.t$9 = 0;
      Self.roll = 0;
      Self._d$1 = new THREE.Vector3();
      Self._side = new THREE.Vector3();
      Self._tmp = new THREE.Vector3();
      Self._up$1 = new THREE.Vector3(0,1,0);
      return Self
   }
   /// procedure TCameraRig.Snap(tg: TCamTarget)
   ,Snap:function(Self, tg) {
      TCameraRig.Update$12(Self,1,tg,true);
   }
   /// procedure TCameraRig.Update(dt: Float; tg: TCamTarget; snapNow: Boolean = False)
   ,Update$12:function(Self, dt, tg, snapNow) {
      var kmh = 0,
         desiredLambda = 0,
         fovT = 0,
         lookLambda = 0,
         lx = 0,
         ly = 0,
         lz = 0,
         dist$1 = 0,
         hgt = 0,
         gh = 0,
         sp$1 = 0,
         tr$1 = 0,
         tt$1 = 0,
         amp$1 = 0,
         ox$1 = 0,
         oy = 0,
         md = 0,
         d$8 = null,
         side$3 = null,
         want = null;
      kmh = tg.speed$5 * 3.6;
      Self.t$9 += dt;
      d$8 = Self._d$1;
      if (tg.speed$5 > 2.5) {
         d$8.set(tg.vel$4.x,0,tg.vel$4.z).normalize();
      } else {
         d$8.copy(tg.heading);
      }
      if (snapNow) {
         Self.dir.copy(d$8);
      } else {
         Self.dir.lerp(d$8,1 - Exp(-3 * dt)).normalize();
      }
      side$3 = Self._side.crossVectors(Self.dir,Self._up$1);
      desiredLambda = 6;
      fovT = 62 + kmh * 0.2;
      lookLambda = 10;
      want = Self._tmp;
      md = (tg.crashed && Self.mode == 2)?0:Self.mode;
      if (!md) {
         dist$1 = 4.6 + tg.speed$5 * 0.05 + ((tg.crashed)?2:0);
         hgt = 1.9 + tg.speed$5 * 0.012 + ((tg.crashed)?1:0);
         want.copy(tg.focus$2).addScaledVector(Self.dir,-dist$1);
         want.y += hgt;
         lx = tg.focus$2.x + Self.dir.x * 6;
         ly = tg.focus$2.y + 0.9;
         lz = tg.focus$2.z + Self.dir.z * 6;
      } else if (md == 1) {
         want.copy(tg.focus$2).addScaledVector(Self.dir,-2.5).addScaledVector(side$3,0.6);
         want.y += 0.55;
         lx = tg.focus$2.x + Self.dir.x * 8;
         ly = tg.focus$2.y + 0.7;
         lz = tg.focus$2.z + Self.dir.z * 8;
         desiredLambda = 12;
         fovT += 16;
      } else {
         want.copy(tg.head$2).addScaledVector(tg.lookDir,0.25);
         want.y += 0.04;
         lx = tg.head$2.x + tg.lookDir.x * 10;
         ly = tg.head$2.y + tg.lookDir.y * 10 - 0.8;
         lz = tg.head$2.z + tg.lookDir.z * 10;
         desiredLambda = 40;
         lookLambda = 14;
         fovT += 20;
      }
      gh = TCourse.height$4(Self.course$7,want.x,want.z) + ((md == 1)?0.25:0.7);
      if (want.y < gh) {
         want.y = gh;
      }
      if (snapNow) {
         Self.pos$4.copy(want);
         Self.look$1.set(lx,ly,lz);
         Self.fov$1 = fovT;
      } else {
         Self.pos$4.x = Damp(Self.pos$4.x,want.x,desiredLambda,dt);
         Self.pos$4.y = Damp(Self.pos$4.y,want.y,desiredLambda,dt);
         Self.pos$4.z = Damp(Self.pos$4.z,want.z,desiredLambda,dt);
         Self.look$1.x = Damp(Self.look$1.x,lx,lookLambda,dt);
         Self.look$1.y = Damp(Self.look$1.y,ly,lookLambda,dt);
         Self.look$1.z = Damp(Self.look$1.z,lz,lookLambda,dt);
         Self.fov$1 = Damp(Self.fov$1,Min$_Float_Float_(fovT,92 + ((md)?12:0)),3,dt);
      }
      Self.trauma = Max$_Float_Float_(0,Self.trauma - dt * 1.4);
      sp$1 = Max$_Float_Float_(0,(kmh - 55) / 70) * ((tg.grounded$3)?1:0.3);
      tr$1 = Math.pow(Self.trauma,2);
      tt$1 = Self.t$9;
      amp$1 = tr$1 * 0.35 + sp$1 * 0.025;
      ox$1 = (Sin(tt$1 * 37.1) + Sin(tt$1 * 23.7 + 1.3)) * 0.5 * amp$1;
      oy = (Sin(tt$1 * 41.3 + 2.1) + Sin(tt$1 * 19.1)) * 0.5 * amp$1;
      Self.cam.position.copy(Self.pos$4);
      Self.cam.position.x += ox$1 * side$3.x;
      Self.cam.position.z += ox$1 * side$3.z;
      Self.cam.position.y += oy;
      Self.cam.lookAt(Self.look$1);
      Self.roll = Damp(Self.roll,(!md)?ClampF((-tg.latAcc$2) * 0.006,-0.08,0.08):ClampF((-tg.latAcc$2) * 0.012,-0.2,0.2),4,dt);
      Self.cam.rotateZ(Self.roll + tr$1 * Sin(tt$1 * 29) * 0.04);
      if (Abs$_Float_(Self.cam.fov - Self.fov$1) > 0.01) {
         Self.cam.fov = Self.fov$1;
         Self.cam.updateProjectionMatrix();
      }
   }
   ,Destroy:TObject.Destroy
};
var CAM_NAMES = ["VERFOLGER","ACTION","HELM"];
/// TScore = class (TObject)
var TScore = {
   $ClassName:"TScore",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.airTotal = $.bestAir = $.carveSign = $.carveT = $.comboP = $.comboT = $.score$1 = $.topSpeed = 0;
      $.audio$1 = $.hud$1 = null;
      $.carves = $.combo = $.crashes = $.flips$1 = $.grabs = $.nearMiss = $.stars = 0;
   }
   /// function TScore.Add(pts: Float) : Integer
   ,Add$2:function(Self, pts) {
      var Result = 0;
      Result = Round(pts * Self.combo);
      Self.score$1 += Result;
      return Result
   }
   /// procedure TScore.Bump(p: Float)
   ,Bump:function(Self, p$7) {
      Self.comboP += p$7;
      while (Self.comboP >= 1) {
         Self.comboP -= 1;
         Self.combo = Min$_Integer_Integer_(8,Self.combo + 1);
      }
      Self.comboT = 5;
   }
   /// constructor TScore.Create(h: THud; a: TAudioEngine)
   ,Create$157:function(Self, h$3, a$110) {
      Self.hud$1 = h$3;
      Self.audio$1 = a$110;
      TScore.Reset$4(Self);
      return Self
   }
   /// procedure TScore.OnAir(t: Float; rot: Float; tr: TTrick)
   ,OnAir:function(Self, t$11, rot$2, tr$1) {
      var spins = 0,
         fl$1 = 0,
         grab$4 = 0,
         v$4 = 0,
         parts$8 = [],
         prefix = "";
      Self.airTotal += t$11;
      Self.bestAir = Max$_Float_Float_(Self.bestAir,t$11);
      spins = Floor(rot$2 / 360);
      fl$1 = (!!tr$1)?tr$1.flips:0;
      grab$4 = (!!tr$1 && tr$1.grabT > 0.25)?tr$1.grabT:0;
      v$4 = TScore.Add$2(Self,t$11 * 180 + spins * 400 + fl$1 * 700 + grab$4 * 260);
      TScore.Bump(Self,0.5 + ((spins)?0.5:0) + fl$1 * 0.8 + ((grab$4 != 0)?0.4:0));
      if (fl$1) {
         prefix = "";
         if (fl$1 > 1) {
            prefix = (Min$_Integer_Integer_(fl$1,3) == 2)?"Double ":"Triple ";
         }
         parts$8.push(prefix + ((tr$1.flipDir > 0)?"Frontflip":"Backflip"));
         Self.flips$1 += fl$1;
      }
      if (spins) {
         parts$8.push(IntToStr$_Integer_(spins * 360) + UC(176));
      }
      if (grab$4 != 0) {
         parts$8.push("Indy");
         ++Self.grabs;
      }
      THud.Pop$1(Self.hud$1,(parts$8.length > 0)?StrJoin(parts$8," "+UC(183)+" "):"Air "+ToFixed(t$11,1)+"s","+" + IntToStr$_Integer_(v$4),false);
   }
   /// procedure TScore.OnCrash()
   ,OnCrash:function(Self) {
      ++Self.crashes;
      Self.combo = 1;
      Self.comboP = 0;
      Self.comboT = 0;
      Self.carveT = 0;
   }
   /// procedure TScore.OnNearMiss(dist: Float)
   ,OnNearMiss$1:function(Self, dist$1) {
      var v$4 = 0;
      ++Self.nearMiss;
      v$4 = TScore.Add$2(Self,250 * (1 + 1.9 - dist$1));
      TScore.Bump(Self,1);
      THud.Pop$1(Self.hud$1,"Near Miss","+" + IntToStr$_Integer_(v$4),false);
   }
   /// procedure TScore.Reset()
   ,Reset$4:function(Self) {
      Self.score$1 = 0;
      Self.combo = 1;
      Self.comboT = 0;
      Self.comboP = 0;
      Self.nearMiss = 0;
      Self.crashes = 0;
      Self.airTotal = 0;
      Self.topSpeed = 0;
      Self.carves = 0;
      Self.carveT = 0;
      Self.carveSign = 0;
      Self.bestAir = 0;
      Self.flips$1 = 0;
      Self.grabs = 0;
      Self.stars = 0;
   }
   /// procedure TScore.Update(dt: Float; phys: TRiderPhysics; riding: Boolean)
   ,Update$8:function(Self, dt, phys$3, riding$2) {
      var kmh = 0,
         ae = 0,
         sg = 0,
         clean = false,
         v$4 = 0;
      kmh = phys$3.speed$2 * 3.6;
      if (riding$2) {
         Self.topSpeed = Max$_Float_Float_(Self.topSpeed,kmh);
      }
      if (Self.comboT > 0) {
         Self.comboT -= dt;
         if (Self.comboT <= 0) {
            Self.combo = 1;
            Self.comboP = 0;
         }
      }
      if (!(riding$2)) {
         return;
      }
      if (kmh > 45) {
         Self.score$1 += (kmh - 45) * 0.5 * dt * Self.combo;
      }
      if (!(phys$3.grounded$1)) {
         Self.carveT = 0;
         return;
      }
      ae = Abs$_Float_(phys$3.edge$3);
      sg = SignF(phys$3.edge$3);
      clean = ae > 0.32 && phys$3.carveQ > 0.85 && phys$3.skid < 1.2 && phys$3.speed$2 > 8;
      if (clean && (Self.carveSign == sg || Self.carveT == 0)) {
         Self.carveT += dt;
         Self.carveSign = sg;
      } else if ((ae < 0.15 || clean && sg != Self.carveSign || phys$3.skid > 2.5) && Self.carveT > 0) {
         if (Self.carveT > 0.6 && phys$3.skid < 2.5) {
            v$4 = TScore.Add$2(Self,80 * (0.6 + Min$_Float_Float_(Self.carveT,2.5) * 0.5));
            ++Self.carves;
            TScore.Bump(Self,0.34);
            THud.Pop$1(Self.hud$1,"Clean Carve","+" + IntToStr$_Integer_(v$4),false);
            TAudioEngine.Pop$2(Self.audio$1,1);
         }
         Self.carveT = (clean)?dt:0;
         Self.carveSign = sg;
      }
   }
   ,Destroy:TObject.Destroy
};
/// TPop = class (TObject)
var TPop = {
   $ClassName:"TPop",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.d$5 = null;
      $.t$8 = 0;
   }
   ,Destroy:TObject.Destroy
};
/// THudInfo = class (TObject)
var THudInfo = {
   $ClassName:"THudInfo",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.finished$2 = $.riding = false;
      $.finishTime$1 = $.penalty$1 = $.posZ = $.runTime$1 = $.speed$3 = $.timeScale$1 = 0;
      $.gatesPassed = $.gatesTotal = $.starsGot = $.starsTotal = 0;
      $.rivalText$1 = "";
      $.score$2 = null;
   }
   ,Destroy:TObject.Destroy
};
/// THud = class (TObject)
var THud = {
   $ClassName:"THud",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.FAcc = $.FToastT = 0;
      $.FEl = $.FLast = undefined;
      $.FPi = 0;
      $.FPops = [];
   }
   /// procedure THud.Countdown(text: String; isOn: Boolean)
   ,Countdown:function(Self, text, isOn) {
      THud.E(Self,"count").textContent = text;
      THud.E(Self,"count").style.opacity = (isOn)?1:0;
   }
   /// constructor THud.Create()
   ,Create$158:function(Self) {
      var box = null,
         p$7 = null;
      Self.FEl = {};
      Self.FEl.T = El("hT");
      Self.FEl.Pen = El("hPen");
      Self.FEl.Prog = El("hProgBar");
      Self.FEl.Dist = El("hDist");
      Self.FEl.Extra = El("hExtra");
      Self.FEl.S = El("hS");
      Self.FEl.Combo = El("hCombo");
      Self.FEl.V = El("hV");
      Self.FEl.G = El("hGaugeBar");
      Self.FEl.Cam = El("hCam");
      Self.FEl.count = El("count");
      Self.FEl.toast = El("toast");
      Self.FEl.slow = El("slowmo");
      box = El("pops");
      for(let i$6=0;i$6<=4;i$6++) {
         p$7 = TObject.Create($New(TPop));
         p$7.d$5 = document.createElement("div");
         p$7.d$5.className = "pop";
         box.appendChild(p$7.d$5);
         p$7.t$8 = 0;
         Self.FPops.push(p$7);
      }
      Self.FPi = 0;
      Self.FAcc = 0;
      Self.FLast = {};
      Self.FToastT = 0;
      return Self
   }
   /// function THud.E(k: String) : JElement
   ,E:function(Self, k$4) {
      var Result = null;
      Result = VGet(Self.FEl,k$4);
      return Result
   }
   /// procedure THud.Pop(text: String; sub: String = ''; bad: Boolean = False)
   ,Pop$1:function(Self, text, sub$1, bad) {
      var p$7 = null;
      p$7 = Self.FPops[Self.FPi];
      Self.FPi = (Self.FPi + 1) % Self.FPops.length;
      p$7.d$5.innerHTML = text + ((sub$1 != "")?"<small>"+sub$1+"<\/small>":"");
      p$7.d$5.classList.toggle("bad",bad);
      p$7.d$5.parentElement.appendChild(p$7.d$5);
      p$7.d$5.classList.remove("show");
      ForceReflow(p$7.d$5);
      p$7.d$5.classList.add("show");
      p$7.t$8 = 1.5;
   }
   /// procedure THud.SetText(k: String; v: String)
   ,SetText:function(Self, k$4, v$4) {
      if (VGet(Self.FLast,k$4) != v$4) {
         VSet(Self.FLast,k$4,v$4);
         THud.E(Self,k$4).textContent = v$4;
      }
   }
   /// procedure THud.Toast(text: String)
   ,Toast:function(Self, text) {
      THud.E(Self,"toast").textContent = text;
      THud.E(Self,"toast").style.opacity = 1;
      Self.FToastT = 2.5;
   }
   /// procedure THud.Update(dt: Float; g: THudInfo)
   ,Update$9:function(Self, dt, g$8) {
      var kmh = 0,
         dist$1 = 0,
         a$257 = 0,
         p$7 = null,
         bars = "",
         a$258 = [];
      a$258 = Self.FPops;
      var $temp157;
      for(a$257=0,$temp157=a$258.length;a$257<$temp157;a$257++) {
         p$7 = a$258[a$257];
         if (p$7.t$8 > 0) {
            p$7.t$8 -= dt;
            if (p$7.t$8 <= 0) {
               p$7.d$5.classList.remove("show");
            }
         }
      }
      if (Self.FToastT > 0) {
         Self.FToastT -= dt;
         if (Self.FToastT <= 0) {
            THud.E(Self,"toast").style.opacity = 0;
         }
      }
      THud.E(Self,"slow").style.opacity = (g$8.timeScale$1 < 0.9)?1:0;
      Self.FAcc += dt;
      if (Self.FAcc < 0.0666666666666667) {
         return;
      }
      Self.FAcc = 0;
      kmh = (g$8.riding)?Round(g$8.speed$3 * 3.6):0;
      THud.SetText(Self,"T",FmtTime((g$8.finished$2)?g$8.finishTime$1 - g$8.penalty$1:g$8.runTime$1));
      THud.SetText(Self,"Pen",(g$8.penalty$1 > 0)?"+"+ToFixed(g$8.penalty$1,0)+"s":"");
      THud.SetText(Self,"V",IntToStr$_Integer_(kmh));
      THud.E(Self,"G").style.width = NumStr(ClampF(kmh / 130,0,1) * 100) + "%";
      THud.SetText(Self,"S",ThousandsDots(g$8.score$2.score$1));
      bars = "";
      if (g$8.score$2.comboT > 0 && g$8.score$2.combo > 1) {
         bars = "  ";
         for(let i$6=1,$temp158=Ceil(g$8.score$2.comboT);i$6<=$temp158;i$6++) {
            bars += "\u25AE";
         }
      }
      THud.SetText(Self,"Combo","x"+IntToStr$_Integer_(g$8.score$2.combo)+bars);
      dist$1 = ClampF(g$8.posZ - 4,0,courseLength);
      THud.E(Self,"Prog").style.width = ToFixed(dist$1 / courseLength * 100,1) + "%";
      THud.SetText(Self,"Dist",IntToStr$_Integer_(Round(dist$1))+" m  \/  "+NumStr(courseLength)+" m");
      THud.SetText(Self,"Extra","Tore "+IntToStr$_Integer_(g$8.gatesPassed)+"\/"+IntToStr$_Integer_(g$8.gatesTotal)+"  "+UC(183)+"  \u2605 "+IntToStr$_Integer_(g$8.starsGot)+"\/"+IntToStr$_Integer_(g$8.starsTotal)+((g$8.rivalText$1 != "")?"  "+UC(183)+"  "+g$8.rivalText$1:""));
   }
   ,Destroy:TObject.Destroy
};
function ThousandsDots(n$7) {
   var Result = "";
   Result = String(Math.floor(n$7)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
   return Result
}
function FmtTime(t$11) {
   var Result = "";
   var m$6 = 0,
      s$11 = 0;
   m$6 = Floor(t$11 / 60);
   s$11 = t$11 - m$6 * 60;
   Result = IntToStr$_Integer_(m$6)+":"+((s$11 < 10)?"0":"")+ToFixed(s$11,2);
   return Result
}
function OutlineShader() {
   var Result = undefined;
   var u$1;
   Result = {};
   u$1 = {};
   u$1.tDiffuse = Uniform(null);
   u$1.tDepth = Uniform(null);
   u$1.uTexel = Uniform(new THREE.Vector2(0.000520833333333333,0.000925925925925926));
   u$1.uWidth = Uniform(1.8);
   u$1.uAlpha = Uniform(0.9);
   u$1.cameraNear = Uniform(0.1);
   u$1.cameraFar = Uniform(6000);
   u$1.uInk = Uniform(new THREE.Color(726052));
   u$1.uHaze = Uniform(new THREE.Color(8361912));
   Result.uniforms = u$1;
   Result.vertexShader = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
   Result.fragmentShader = "#include <packing>\r\n    uniform sampler2D tDiffuse; uniform sampler2D tDepth; uniform vec2 uTexel; uniform float uWidth; uniform float uAlpha; uniform float cameraNear; uniform float cameraFar; uniform vec3 uInk; uniform vec3 uHaze; varying vec2 vUv;\r\n    float dist(vec2 uv){ return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, cameraNear, cameraFar); }\r\n    \/\/ Objekt = kein Gelaende (Schnee schreibt Alpha 0.5) und nicht Himmel\r\n    float isObj(vec2 uv, float dd){ return texture2D(tDiffuse, uv).a > 0.75 && dd < cameraFar * 0.97 ? 1.0 : 0.0; }\r\n    void main(){\r\n      vec3 col = texture2D(tDiffuse, vUv).rgb;\r\n      vec2 o = uTexel * uWidth;\r\n      float c = dist(vUv), l = dist(vUv - vec2(o.x, 0.0)), r = dist(vUv + vec2(o.x, 0.0)), u = dist(vUv + vec2(0.0, o.y)), d = dist(vUv - vec2(0.0, o.y));\r\n      float wc = 1.0 \/ c, lap = abs(1.0 \/ l + 1.0 \/ r - 2.0 * wc) + abs(1.0 \/ u + 1.0 \/ d - 2.0 * wc);\r\n      float e = smoothstep(0.035, 0.09, lap \/ wc);\r\n      float nearest = min(c, min(min(l, r), min(u, d))), farthest = max(c, max(max(l, r), max(u, d)));\r\n      float sky = step(cameraFar * 0.97, farthest);                       \/\/ Silhouette gegen den Himmel (Berge, Baeume)\r\n      float a = e * max(1.0 - smoothstep(180.0, 800.0, nearest), sky * 0.8);\r\n      \/\/ Volle Linie nur, wenn die vordere Flaeche an der Kante ein Objekt ist; Gelaende-Kuppen vor Bergen\/Himmel nur zart und nah\r\n      vec2 nuv = vUv;\r\n      if (l < c && l <= r && l <= u && l <= d) nuv = vUv - vec2(o.x, 0.0); else if (r < c && r <= u && r <= d) nuv = vUv + vec2(o.x, 0.0);\r\n      else if (u < c && u <= d) nuv = vUv + vec2(0.0, o.y); else if (d < c) nuv = vUv - vec2(0.0, o.y);\r\n      float obj = isObj(nuv, nearest);\r\n      a *= mix(0.2 * (1.0 - smoothstep(40.0, 220.0, nearest)), 1.0, obj);\r\n      gl_FragColor = vec4(mix(col, mix(uInk, uHaze, smoothstep(120.0, 2600.0, nearest)), a * uAlpha), 1.0);\r\n    }";
   return Result
}
function GradeShader() {
   var Result = undefined;
   var u$2;
   Result = {};
   u$2 = {};
   u$2.tDiffuse = Uniform(null);
   u$2.uBlur = Uniform(0);
   u$2.uVignette = Uniform(0.32);
   u$2.uSat = Uniform(1.1);
   u$2.uTime = Uniform(0);
   Result.uniforms = u$2;
   Result.vertexShader = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
   Result.fragmentShader = "uniform sampler2D tDiffuse; uniform float uBlur; uniform float uVignette; uniform float uSat; uniform float uTime; varying vec2 vUv;\r\n    void main(){\r\n      vec2 dir = vUv - vec2(0.5, 0.52);\r\n      vec3 col = texture2D(tDiffuse, vUv).rgb;\r\n      \/\/ chromatische Aberration zum Rand hin\r\n      vec2 ca = dir * (0.0012 + uBlur * 0.08) * smoothstep(0.2, 0.8, length(dir));\r\n      col.r = texture2D(tDiffuse, vUv + ca).r; col.b = texture2D(tDiffuse, vUv - ca).b;\r\n      if (uBlur > 0.0005) {   \/\/ radialer Blur zum Bildrand hin (Tempo-Eindruck)\r\n        float amt = uBlur * smoothstep(0.12, 0.7, length(dir));\r\n        vec3 acc = col; for (int i = 1; i < 8; i++) acc += texture2D(tDiffuse, vUv - dir * amt * float(i) \/ 7.0).rgb;\r\n        col = acc \/ 8.0;\r\n      }\r\n      float l = dot(col, vec3(0.2126, 0.7152, 0.0722));\r\n      col = max(mix(vec3(l), col, uSat), 0.0);\r\n      col *= mix(vec3(0.95, 0.99, 1.07), vec3(1.05, 1.0, 0.95), smoothstep(0.02, 1.0, l)); \/\/ kuehle Schatten, warme Lichter\r\n      col = 0.18 * pow(max(col, 0.0) \/ 0.18, vec3(1.08));                                   \/\/ Kontrast um Mittelgrau (HDR-sicher, vor Tone-Mapping)\r\n      col = max(col * (1.0 + (fract(sin(dot(vUv * 913.7 + uTime, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.03), 0.0); \/\/ Filmkorn\r\n      float v = smoothstep(0.95, 0.3, length(dir * vec2(1.0, 0.85)));\r\n      col *= mix(1.0 - uVignette, 1.0, v);\r\n      gl_FragColor = vec4(col, 1.0);\r\n    }";
   return Result
}
function ClampSky(sky$1) {
   var m$3 = null;
   m$3 = sky$1.material;
   m$3.fragmentShader = JsReplace(m$3.fragmentShader,"gl_FragColor = vec4( texColor, 1.0 );","gl_FragColor = vec4( min( texColor, vec3( 2.2 ) ), 1.0 );");
}
function InstallSelfTest(course$9, resort$2) {
   var run = null;
   TCourseRef = course$9;
   TResortRef = resort$2;
   run = PhysRun;
   window.carveTest = { physRun: run };
}
function PhysRun(n$7) {
   var Result = [];
   var ph$1 = null,
      inp = null;
   ph$1 = TRiderPhysics.Create$150($New(TRiderPhysics),TCourseRef,TTerrain.CreateStub($New(TTerrain),TCourseRef,TResortRef));
   inp = TObject.Create($New(TControls));
   TRiderPhysics.Reset$2(ph$1,4);
   ph$1.frozen = false;
   for(let i$6=0,$temp159=n$7;i$6<$temp159;i$6++) {
      inp.steer = Sin(i$6 * 0.013) * 0.9;
      inp.tuck = (i$6 % 600 < 300)?1:0;
      inp.brake = (i$6 % 1000 > 900)?0.6:0;
      inp.jump = i$6 % 400 >= 350 && i$6 % 400 < 380;
      inp.grab = false;
      TRiderPhysics.Step$1(ph$1,0.00833333333333333,inp);
      if (ph$1.crashReason != "") {
         Result.push(-1);
         Result.push(ph$1.pos$2.z);
         TRiderPhysics.Reset$2(ph$1,ph$1.pos$2.z + 5);
         ph$1.frozen = false;
      }
      if (!(i$6 % 10)) {
         Result.push(ph$1.pos$2.x);
         Result.push(ph$1.pos$2.y);
         Result.push(ph$1.pos$2.z);
         Result.push(ph$1.yaw$2);
         Result.push(ph$1.edge$3);
         Result.push(ph$1.speed$2);
      }
   }
   return Result
}
/// TQTXBase64Core = class (TObject)
var TQTXBase64Core = {
   $ClassName:"TQTXBase64Core",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   /// function TQTXBase64Core.Base64ToBytes(const b64: String) : TUInt8Array
   ,Base64ToBytes$1:function(Self, b64) {
      var Result = [];
      var ASeg = 0,
         BSeg = 0,
         CSeg = 0,
         DSeg = 0,
         LTextLen = 0,
         LPlaceholderCount = 0,
         BufferSize = 0,
         xpos = 0,
         idx$2 = 0,
         temp = 0,
         temp$1 = 0,
         temp$2 = 0;
      LTextLen = b64.length;
      if (LTextLen > 0) {
         LPlaceholderCount = 0;
         if (LTextLen % 4 < 1) {
            LPlaceholderCount = (b64.charAt((LTextLen - 1)-1) == "=")?2:(b64.charAt(LTextLen-1) == "=")?1:0;
         }
         BufferSize = ($Div(LTextLen * 3,4)) - LPlaceholderCount;
         $ArraySetLenC(Result,BufferSize,function (){return 0});
         if (LPlaceholderCount > 0) {
            (LTextLen-= 4);
         }
         xpos = 1;
         idx$2 = 0;
         while (xpos < LTextLen) {
            ASeg = __B64_RevLookup[TDataTypeConverter.CharToByte(TDataTypeConverter,b64.charAt(xpos-1))]<<18;
            BSeg = __B64_RevLookup[TDataTypeConverter.CharToByte(TDataTypeConverter,b64.charAt(xpos))]<<12;
            CSeg = __B64_RevLookup[TDataTypeConverter.CharToByte(TDataTypeConverter,b64.charAt(xpos+1))]<<6;
            DSeg = __B64_RevLookup[TDataTypeConverter.CharToByte(TDataTypeConverter,b64.charAt(xpos+2))];
            temp = ((ASeg|BSeg)|CSeg)|DSeg;
            Result[idx$2]=(temp>>>16)&255;
            ++idx$2;
            Result[idx$2]=(temp>>>8)&255;
            ++idx$2;
            Result[idx$2]=temp&255;
            ++idx$2;
            (xpos+= 4);
         }
         switch (LPlaceholderCount) {
            case 1 :
               ASeg = __B64_RevLookup[TDataTypeConverter.CharToByte(TDataTypeConverter,b64.charAt(xpos-1))]<<2;
               BSeg = __B64_RevLookup[TDataTypeConverter.CharToByte(TDataTypeConverter,b64.charAt(xpos))]>>>4;
               temp$1 = ASeg|BSeg;
               Result[idx$2]=temp$1&255;
               break;
            case 2 :
               ASeg = __B64_RevLookup[TDataTypeConverter.CharToByte(TDataTypeConverter,b64.charAt(xpos-1))]<<10;
               BSeg = __B64_RevLookup[TDataTypeConverter.CharToByte(TDataTypeConverter,b64.charAt(xpos))]<<4;
               CSeg = __B64_RevLookup[TDataTypeConverter.CharToByte(TDataTypeConverter,b64.charAt(xpos+1))]>>>2;
               temp$2 = (ASeg|BSeg)|CSeg;
               Result[idx$2]=(temp$2>>>8)&255;
               ++idx$2;
               Result[idx$2]=temp$2&255;
               break;
         }
      }
      return Result
   }
   /// function TQTXBase64Core.Base64ToString(const b64: String) : String
   ,Base64ToString:function(Self, b64) {
      var Result = "";
      if (NodeJs()) {
         Result = Buffer.from(b64, "base64").toString("binary");
      } else {
         Result = new TextDecoder().decode(Uint8Array.from(atob(b64), (m) => m.codePointAt(0)));
      }
      return Result
   }
   /// function TQTXBase64Core.BytesToBase64(const Data: TUInt8Array) : String
   ,BytesToBase64$3:function(Self, Data) {
      var Result = "";
      var LLen = 0,
         LExtra = 0,
         LStrideLen = 0,
         LMaxChunkLength = 0,
         i$6 = 0,
         Ahead = 0,
         SegSize = 0,
         output = "",
         LTemp = 0,
         LTemp$1 = 0;
      LLen = Data.length;
      if (LLen > 0) {
         LExtra = Data.length % 3;
         LStrideLen = LLen - LExtra;
         LMaxChunkLength = 16383;
         i$6 = 0;
         while (i$6 < LStrideLen) {
            Ahead = i$6 + LMaxChunkLength;
            SegSize = (Ahead > LStrideLen)?LStrideLen:Ahead;
            Result += TQTXBase64Core.EncodeChunk(Self,Data,i$6,SegSize);
            (i$6+= LMaxChunkLength);
         }
         if (LExtra > 0) {
            --LLen;
         }
         output = "";
         switch (LExtra) {
            case 1 :
               LTemp = Data[LLen];
               output += __B64_Lookup[LTemp>>>2];
               output += __B64_Lookup[(LTemp<<4)&63];
               output += "==";
               break;
            case 2 :
               LTemp$1 = (Data[LLen - 1]<<8) + Data[LLen];
               output += __B64_Lookup[LTemp$1>>>10];
               output += __B64_Lookup[(LTemp$1>>>4)&63];
               output += __B64_Lookup[(LTemp$1<<2)&63];
               output += "=";
               break;
         }
         Result += output;
      }
      return Result
   }
   /// function TQTXBase64Core.CalcByteLength(const b64: String) : Integer
   ,CalcByteLength:function(Self, b64) {
      var Result = 0;
      var LLen = 0,
         LPlaceholderCount = 0;
      LLen = b64.length;
      if (LLen > 0) {
         LPlaceholderCount = 0;
         if (LLen % 4 < 1) {
            LPlaceholderCount = (b64.charAt((LLen - 1)-1) == "=")?2:(b64.charAt(LLen-1) == "=")?1:0;
         }
         Result = ($Div(LLen * 3,4)) - LPlaceholderCount;
      }
      return Result
   }
   /// function TQTXBase64Core.CheckIsBase64Encoded(const AText: String) : Boolean
   ,CheckIsBase64Encoded:function(Self, AText) {
      var Result = false;
      var el$2 = 0,
         llen = 0,
         PadCount = 0;
      Result = false;
      llen = AText.length;
      if (llen > 0) {
         if (llen % 4) {
            return Result;
         }
         PadCount = 0;
         var $temp160;
         for(el$2=1,$temp160=llen;el$2<=$temp160;el$2++) {
            if (AText.charAt(el$2-1) == "=") {
               ++PadCount;
               if (el$2 < llen - 1 || PadCount > 2) {
                  return Result;
               }
            } else if (Pos$_String_String_(AText.charAt(el$2-1),__CNT_B64_CHARSET) < 1) {
               return Result;
            }
         }
         Result = true;
      }
      return Result
   }
   /// function TQTXBase64Core.EncodeChunk(const Data: TUInt8Array; startpos: Integer; endpos: Integer) : String
   ,EncodeChunk:function(Self, Data, startpos, endpos) {
      var Result = "";
      var temp = 0;
      while (startpos < endpos) {
         temp = (Data[startpos]<<16) + (Data[startpos + 1]<<8) + Data[startpos + 2];
         Result += __B64_Lookup[(temp>>>18)&63]+__B64_Lookup[(temp>>>12)&63]+__B64_Lookup[(temp>>>6)&63]+__B64_Lookup[temp&63];
         (startpos+= 3);
      }
      return Result
   }
   /// function TQTXBase64Core.ExtractPlaceholderCount(const b64: String) : Integer
   ,ExtractPlaceholderCount:function(Self, b64) {
      var Result = 0;
      var LLen = 0;
      LLen = b64.length;
      if (LLen > 0) {
         if (LLen % 4 < 1) {
            Result = (b64.charAt((LLen - 1)-1) == "=")?2:(b64.charAt(LLen-1) == "=")?1:0;
         }
      }
      return Result
   }
   /// function TQTXBase64Core.StringToBase64(const Text: String) : String
   ,StringToBase64:function(Self, Text$1) {
      var Result = "";
      if (NodeJs()) {
         Result = Buffer.from(Text$1, "binary").toString("base64");
      } else {
         Result = btoa(Array.from(new TextEncoder().encode(Text$1), (byte) => String.fromCodePoint(byte), ).join(""));
      }
      return Result
   }
   /// function TQTXBase64Core.TripletToBase64(const num: Integer) : String
   ,TripletToBase64:function(Self, num) {
      var Result = "";
      Result = __B64_Lookup[(num>>>18)&63]+__B64_Lookup[(num>>>12)&63]+__B64_Lookup[(num>>>6)&63]+__B64_Lookup[num&63];
      return Result
   }
   ,Destroy:TObject.Destroy
};
/// TQTXCodec = class (TDataTypeConverter)
var TQTXCodec = {
   $ClassName:"TQTXCodec",$Parent:TDataTypeConverter
   ,$Init:function ($) {
      TDataTypeConverter.$Init($);
      $.fBindings = [];
      $.fCodecInfo = null;
   }
   /// constructor TQTXCodec.Create()
   ,Create$4:function(Self) {
      TDataTypeConverter.Create$4(Self);
      Self.fCodecInfo = TQTXCodec.MakeCodecInfo$(Self);
      if (!Self.fCodecInfo) {
         throw Exception.Create($New(ECodecError),$R[20]);
      }
      return Self
   }
   /// destructor TQTXCodec.Destroy()
   ,Destroy:function(Self) {
      TObject.Free(Self.fCodecInfo);
      TDataTypeConverter.Destroy(Self);
   }
   /// procedure TQTXCodec.RegisterBinding(const Binding: TQTXCodecBinding)
   ,RegisterBinding:function(Self, Binding) {
      if (Self.fBindings.indexOf(Binding) < 0) {
         Self.fBindings.push(Binding);
      } else {
         throw Exception.Create($New(ECodecError),$R[21]);
      }
   }
   /// procedure TQTXCodec.UnRegisterBinding(const Binding: TQTXCodecBinding)
   ,UnRegisterBinding:function(Self, Binding) {
      var LIndex = 0;
      LIndex = Self.fBindings.indexOf(Binding);
      if (LIndex >= 0) {
         Self.fBindings.splice(LIndex,1)
         ;
      } else {
         throw Exception.Create($New(ECodecError),$R[22]);
      }
   }
   ,Destroy$:function($){return $.ClassType.Destroy($)}
   ,Create$4$:function($){return $.ClassType.Create$4($)}
   ,SetEndian:TDataTypeConverter.SetEndian
   ,DecodeData$:function($){return $.ClassType.DecodeData.apply($.ClassType, arguments)}
   ,EncodeData$:function($){return $.ClassType.EncodeData.apply($.ClassType, arguments)}
   ,MakeCodecInfo$:function($){return $.ClassType.MakeCodecInfo($)}
};
TQTXCodec.$Intf={
   IQTXCodecBinding:[TQTXCodec.RegisterBinding,TQTXCodec.UnRegisterBinding]
   ,IQTXCodecProcess:[TQTXCodec.EncodeData,TQTXCodec.DecodeData]
}
/// TBase64Codec = class (TQTXCodec)
var TBase64Codec = {
   $ClassName:"TBase64Codec",$Parent:TQTXCodec
   ,$Init:function ($) {
      TQTXCodec.$Init($);
      $.__initialized = false;
   }
   /// constructor TBase64Codec.Create()
   ,Create$4:function(Self) {
      TQTXCodec.Create$4(Self);
      if (!(Self.__initialized)) {
         Self.__initialized = true;
         for(let i$6=1,$temp161=__CNT_B64_CHARSET.length;i$6<=$temp161;i$6++) {
            __B64_Lookup[i$6 - 1] = __CNT_B64_CHARSET.charAt(i$6-1);
            __B64_RevLookup[TDataTypeConverter.CharToByte(TDataTypeConverter,__CNT_B64_CHARSET.charAt(i$6-1))] = i$6 - 1;
         }
         __B64_RevLookup[TDataTypeConverter.CharToByte(TDataTypeConverter,"-")] = 62;
         __B64_RevLookup[TDataTypeConverter.CharToByte(TDataTypeConverter,"_")] = 63;
      }
      return Self
   }
   /// function TBase64Codec.Decode(TextToDecode: String) : String
   ,Decode$3:function(Self, TextToDecode) {
      var Result = "";
      Result = TQTXBase64Core.Base64ToString(TQTXBase64Core,TextToDecode);
      return Result
   }
   /// procedure TBase64Codec.DecodeData(const Source: IManagedData; const Target: IManagedData)
   ,DecodeData:function(Self, Source, Target) {
      /* null */
   }
   /// function TBase64Codec.Encode(TextToEncode: String) : String
   ,Encode$3:function(Self, TextToEncode) {
      var Result = "";
      Result = TQTXBase64Core.StringToBase64(TQTXBase64Core,TextToEncode);
      return Result
   }
   /// procedure TBase64Codec.EncodeData(const Source: IManagedData; const Target: IManagedData)
   ,EncodeData:function(Self, Source, Target) {
      /* null */
   }
   /// function TBase64Codec.MakeCodecInfo() : TQTXCodecInfo
   ,MakeCodecInfo:function(Self) {
      var Result = null;
      var LVersion = {viMajor:0,viMinor:0,viRevision:0},
         LAccess = null;
      Result = TObject.Create($New(TQTXCodecInfo));
      LVersion = Create$43(0,1,0);
      LVersion.viMajor = 0;
      LVersion.viMinor = 1;
      LVersion.viRevision = 0;
      LAccess = $AsIntf(Result,"ICodecInfo");
      LAccess[0]("Base64Codec");
      LAccess[1]("application\/base64");
      LAccess[2](LVersion);
      LAccess[3]([0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]);
      LAccess[5](1);
      LAccess[6](0);
      return Result
   }
   ,Destroy:TQTXCodec.Destroy
   ,Create$4$:function($){return $.ClassType.Create$4($)}
   ,SetEndian:TDataTypeConverter.SetEndian
   ,DecodeData$:function($){return $.ClassType.DecodeData.apply($.ClassType, arguments)}
   ,EncodeData$:function($){return $.ClassType.EncodeData.apply($.ClassType, arguments)}
   ,MakeCodecInfo$:function($){return $.ClassType.MakeCodecInfo($)}
   ,Decode$3$:function($){return $.ClassType.Decode$3.apply($.ClassType, arguments)}
   ,Encode$3$:function($){return $.ClassType.Encode$3.apply($.ClassType, arguments)}
};
TBase64Codec.$Intf={
   IQTXCodecProcess:[TBase64Codec.EncodeData,TBase64Codec.DecodeData]
   ,IQTXCodecBinding:[TQTXCodec.RegisterBinding,TQTXCodec.UnRegisterBinding]
}
/// TQTXCodecVersionInfo = record
function Copy$TQTXCodecVersionInfo(s,d) {
   d.viMajor=s.viMajor;
   d.viMinor=s.viMinor;
   d.viRevision=s.viRevision;
   return d;
}
function Clone$TQTXCodecVersionInfo($) {
   return {
      viMajor:$.viMajor,
      viMinor:$.viMinor,
      viRevision:$.viRevision
   }
}
/// function TQTXCodecVersionInfo.Create(const Major: Integer; const Minor: Integer; const Revision: Integer) : TQTXCodecVersionInfo
function Create$43(Major, Minor, Revision) {
   var Result = {viMajor:0,viMinor:0,viRevision:0};
   Result.viMajor = Major;
   Result.viMinor = Minor;
   Result.viRevision = Revision;
   return Result
}
/// function TQTXCodecVersionInfo.Equals(var Self: TQTXCodecVersionInfo; const Info: TQTXCodecVersionInfo) : Boolean
function TQTXCodecVersionInfo$Equals$1(Self$26, Info$2) {
   var Result = false;
   if (Self$26.viMajor == Info$2.viMajor) {
      if (Self$26.viMinor == Info$2.viMinor) {
         Result = Self$26.viRevision == Info$2.viRevision;
      }
   }
   return Result
}
/// function TQTXCodecVersionInfo.ToString(var Self: TQTXCodecVersionInfo) : String
function TQTXCodecVersionInfo$ToString$1(Self$27) {
   var Result = "";
   Result = Format("%d.%d.%d",[Self$27.viMajor, Self$27.viMinor, Self$27.viRevision]);
   return Result
}
/// TQTXCodecManager = class (TObject)
var TQTXCodecManager = {
   $ClassName:"TQTXCodecManager",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.FCodecs = [];
   }
   /// procedure TQTXCodecManager.Clear()
   ,Clear:function(Self) {
      var a$259 = 0,
         codec = null;
      try {
         var a$260 = [];
         a$260 = Self.FCodecs;
         var $temp162;
         for(a$259=0,$temp162=a$260.length;a$259<$temp162;a$259++) {
            codec = a$260[a$259];
            try {
               TObject.Free(codec);
            } catch ($e) {
               /* null */
            }
         }
      } finally {
         Self.FCodecs.length=0;
      }
   }
   /// function TQTXCodecManager.CodecByClass(const ClsType: TQTXCodecClass) : TQTXCodec
   ,CodecByClass:function(Self, ClsType$1) {
      var Result = null;
      var a$261 = 0,
         LItem = null,
         a$262 = [];
      a$262 = Self.FCodecs;
      var $temp163;
      for(a$261=0,$temp163=a$262.length;a$261<$temp163;a$261++) {
         LItem = a$262[a$261];
         if (TObject.ClassType(LItem.ClassType) == ClsType$1) {
            Result = LItem;
            break;
         }
      }
      return Result
   }
   /// destructor TQTXCodecManager.Destroy()
   ,Destroy:function(Self) {
      if (Self.FCodecs.length > 0) {
         TQTXCodecManager.Clear(Self);
      }
      TObject.Destroy(Self);
   }
   /// function TQTXCodecManager.QueryByName(AName: String; var AList: TQTXCodecCollection) : Boolean
   ,QueryByName:function(Self, AName, AList) {
      var Result = false;
      var a$263 = 0,
         LItem = null,
         LText = "";
      AName = AnsiLowerCase(Trim$_String_(AName));
      if (AName.length > 0) {
         var a$264 = [];
         AList.v.length=0;
         a$264 = Self.FCodecs;
         var $temp164;
         for(a$263=0,$temp164=a$264.length;a$263<$temp164;a$263++) {
            LItem = a$264[a$263];
            LText = Trim$_String_(AnsiLowerCase(LItem.fCodecInfo.fName));
            if (StrBeginsWith(LText,AName)) {
               AList.v.push(LItem);
            }
         }
         Result = AList.v.length > 0;
      }
      return Result
   }
   /// function TQTXCodecManager.QueryByType(AMimeType: String; var AList: TQTXCodecCollection) : Boolean
   ,QueryByType:function(Self, AMimeType, AList) {
      var Result = false;
      var a$265 = 0,
         LItem = null,
         LText = "";
      AMimeType = Trim$_String_(AnsiLowerCase(AMimeType));
      if (AMimeType.length > 0) {
         var a$266 = [];
         AList.v.length=0;
         a$266 = Self.FCodecs;
         var $temp165;
         for(a$265=0,$temp165=a$266.length;a$265<$temp165;a$265++) {
            LItem = a$266[a$265];
            LText = AnsiLowerCase(LItem.fCodecInfo.fMime);
            if (LText == AMimeType) {
               AList.v.push(LItem);
            }
         }
         Result = AList.v.length > 0;
      }
      return Result
   }
   /// procedure TQTXCodecManager.RegisterCodec(const CodecClass: TQTXCodecClass)
   ,RegisterCodec:function(Self, CodecClass) {
      var LItem = null;
      LItem = TQTXCodecManager.CodecByClass(Self,CodecClass);
      if (!LItem) {
         LItem = TDataTypeConverter.Create$4$($NewDyn(CodecClass,""));
         Self.FCodecs.push(LItem);
      } else {
         throw Exception.Create($New(ECodecManager),$R[19]);
      }
   }
   /// procedure TQTXCodecManager.UnRegisterCodec(const CodecClass: TQTXCodecClass)
   ,UnRegisterCodec:function(Self, CodecClass) {
      for(let x$18=0,$temp166=Self.FCodecs.length;x$18<$temp166;x$18++) {
         if (TObject.ClassType(Self.FCodecs[x$18].ClassType) == CodecClass) {
            TObject.Free(Self.FCodecs[x$18]);
            Self.FCodecs.splice(x$18,1)
            ;
            break;
         }
      }
   }
   ,Destroy$:function($){return $.ClassType.Destroy($)}
};
/// TQTXCodecInfo = class (TObject)
var TQTXCodecInfo = {
   $ClassName:"TQTXCodecInfo",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.fAbout = $.fMime = $.fName = "";
      $.fDataFlow = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      $.fInput = 0;
      $.fOutput = 0;
      $.fVersion = {viMajor:0,viMinor:0,viRevision:0};
   }
   /// function TQTXCodecInfo.Equals(const Info: TQTXCodecInfo) : Boolean
   ,Equals$2:function(Self, Info$3) {
      var Result = false;
      Result = Self.fName == Self.fName && Self.fMime == Info$3.fMime && Self.fAbout == Info$3.fAbout && TQTXCodecVersionInfo$Equals$1(Self.fVersion,Info$3.fVersion) && $SetEqual(Self.fDataFlow,Info$3.fDataFlow);
      return Result
   }
   /// procedure TQTXCodecInfo.SetDataFlow(const coFlow: TCodecDataFlow)
   ,SetDataFlow:function(Self, coFlow) {
      Self.fDataFlow = coFlow.slice(0);
   }
   /// procedure TQTXCodecInfo.SetDescription(const coInfo: String)
   ,SetDescription:function(Self, coInfo) {
      Self.fAbout = coInfo;
   }
   /// procedure TQTXCodecInfo.SetInput(const InputType: TCodecDataFormat)
   ,SetInput:function(Self, InputType) {
      Self.fInput = InputType;
   }
   /// procedure TQTXCodecInfo.SetMime(const coMime: String)
   ,SetMime:function(Self, coMime) {
      Self.fMime = coMime;
   }
   /// procedure TQTXCodecInfo.SetName(const coName: String)
   ,SetName:function(Self, coName) {
      Self.fName = coName;
   }
   /// procedure TQTXCodecInfo.SetOutput(const OutputType: TCodecDataFormat)
   ,SetOutput:function(Self, OutputType) {
      Self.fOutput = OutputType;
   }
   /// procedure TQTXCodecInfo.SetVersion(const coVersion: TQTXCodecVersionInfo)
   ,SetVersion:function(Self, coVersion) {
      Self.fVersion.viMajor = coVersion.viMajor;
      Self.fVersion.viMinor = coVersion.viMinor;
      Self.fVersion.viRevision = coVersion.viRevision;
   }
   /// function TQTXCodecInfo.ToString() : String
   ,ToString$2:function(Self) {
      var Result = "";
      Result = "Codec: "+Self.fName+"\rVersion: "+TQTXCodecVersionInfo$ToString$1(Self.fVersion)+"\rDataflow: "+TCodecDataFlowHelper$ToString$3(Self.fDataFlow)+"\rAbout: "+Self.fAbout;
      return Result
   }
   ,Destroy:TObject.Destroy
   ,SetDataFlow$:function($){return $.ClassType.SetDataFlow.apply($.ClassType, arguments)}
   ,SetDescription$:function($){return $.ClassType.SetDescription.apply($.ClassType, arguments)}
   ,SetInput$:function($){return $.ClassType.SetInput.apply($.ClassType, arguments)}
   ,SetMime$:function($){return $.ClassType.SetMime.apply($.ClassType, arguments)}
   ,SetName$:function($){return $.ClassType.SetName.apply($.ClassType, arguments)}
   ,SetOutput$:function($){return $.ClassType.SetOutput.apply($.ClassType, arguments)}
   ,SetVersion$:function($){return $.ClassType.SetVersion.apply($.ClassType, arguments)}
};
TQTXCodecInfo.$Intf={
   ICodecInfo:[TQTXCodecInfo.SetName,TQTXCodecInfo.SetMime,TQTXCodecInfo.SetVersion,TQTXCodecInfo.SetDataFlow,TQTXCodecInfo.SetDescription,TQTXCodecInfo.SetInput,TQTXCodecInfo.SetOutput]
}
/// TQTXCodecBinding = class (TObject)
var TQTXCodecBinding = {
   $ClassName:"TQTXCodecBinding",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.Output = $.Input = $.fCodec = null;
   }
   /// constructor TQTXCodecBinding.Create(const AEndPoint: TQTXCodec)
   ,Create$44:function(Self, AEndPoint) {
      var LAccess = null;
      TObject.Create(Self);
      if (!!AEndPoint) {
         Self.fCodec = AEndPoint;
         LAccess = $AsIntf(Self.fCodec,"IQTXCodecBinding");
         LAccess[0](Self);
      } else {
         throw Exception.Create($New(ECodecBinding),$R[23]);
      }
      return Self
   }
   /// procedure TQTXCodecBinding.Decode(const DataInput: IManagedData; const DataOutput: IManagedData)
   ,Decode$2:function(Self, DataInput, DataOutput) {
      Self.Input = DataInput;
      Self.Output = DataOutput;
      TQTXCodecBinding.Decode$1(Self);
   }
   /// procedure TQTXCodecBinding.Decode()
   ,Decode$1:function(Self) {
      var lAccess = null;
      if (Self.Input) {
         if (Self.Output) {
            if (!!Self.fCodec) {
               lAccess = $AsIntf(Self.fCodec,"IQTXCodecProcess");
               lAccess[1](Self.Input,Self.Output);
            } else {
               throw Exception.Create($New(ECodecBinding),$R[26]);
            }
         } else {
            throw Exception.Create($New(ECodecBinding),$R[25]);
         }
      } else {
         throw Exception.Create($New(ECodecBinding),$R[24]);
      }
   }
   /// destructor TQTXCodecBinding.Destroy()
   ,Destroy:function(Self) {
      var LAccess = null;
      LAccess = $AsIntf(Self.fCodec,"IQTXCodecBinding");
      LAccess[1](Self);
      TObject.Destroy(Self);
   }
   /// procedure TQTXCodecBinding.Encode(const DataInput: IManagedData; const DataOutput: IManagedData)
   ,Encode$2:function(Self, DataInput, DataOutput) {
      Self.Input = DataInput;
      Self.Output = DataOutput;
      TQTXCodecBinding.Encode$1(Self);
   }
   /// procedure TQTXCodecBinding.Encode()
   ,Encode$1:function(Self) {
      var lAccess = null;
      if (Self.Input) {
         if (Self.Output) {
            if (!!Self.fCodec) {
               lAccess = $AsIntf(Self.fCodec,"IQTXCodecProcess");
               lAccess[0](Self.Input,Self.Output);
            } else {
               throw Exception.Create($New(ECodecBinding),$R[26]);
            }
         } else {
            throw Exception.Create($New(ECodecBinding),$R[25]);
         }
      } else {
         throw Exception.Create($New(ECodecBinding),$R[24]);
      }
   }
   ,Destroy$:function($){return $.ClassType.Destroy($)}
   ,Create$44$:function($){return $.ClassType.Create$44.apply($.ClassType, arguments)}
};
/// TCodecDataFormat enumeration
var TCodecDataFormat = [ "cdBinary", "cdText" ];
/// function TCodecDataFlowHelper.Equals(const AFlow: TCodecDataFlow) : Boolean
function TCodecDataFlowHelper$Equals$4(Self$28, AFlow) {
   var Result = false;
   Result = TCodecDataFlowHelper$Ordinal(Self$28) == TCodecDataFlowHelper$Ordinal(AFlow);
   return Result
}
/// function TCodecDataFlowHelper.Ordinal() : int32
function TCodecDataFlowHelper$Ordinal(Self$29) {
   var Result = 0;
   Result = 0;
   if ($SetIn(Self$29,256,0,513)) {
      (Result+= 256);
   }
   if ($SetIn(Self$29,512,0,513)) {
      (Result+= 512);
   }
   return Result
}
/// function TCodecDataFlowHelper.ToString() : String
function TCodecDataFlowHelper$ToString$3(Self$30) {
   var Result = "";
   Result = Format("[%s, %s]",[($SetIn(Self$30,256,0,513))?"read":"", ($SetIn(Self$30,512,0,513))?"write":""]);
   return Result
}
/// TCodecDataDirection enumeration
var TCodecDataDirection = { 256:"cdRead", 512:"cdWrite" };
/// ECodecError = class (EException)
var ECodecError = {
   $ClassName:"ECodecError",$Parent:EException
   ,$Init:function ($) {
      EException.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// ECodecManager = class (ECodecError)
var ECodecManager = {
   $ClassName:"ECodecManager",$Parent:ECodecError
   ,$Init:function ($) {
      ECodecError.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// ECodecBinding = class (ECodecError)
var ECodecBinding = {
   $ClassName:"ECodecBinding",$Parent:ECodecError
   ,$Init:function ($) {
      ECodecError.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
function CodecManager() {
   var Result = null;
   if (!__Manager) {
      __Manager = TObject.Create($New(TQTXCodecManager));
   }
   Result = __Manager;
   return Result
}
/// TSeekOrigin enumeration
var TSeekOrigin = [ "soFromBeginning", "soFromCurrent", "soFromEnd" ];
/// TQTXWriter = class (TDataTypeConverter)
var TQTXWriter = {
   $ClassName:"TQTXWriter",$Parent:TDataTypeConverter
   ,$Init:function ($) {
      TDataTypeConverter.$Init($);
      $.FAccess = null;
      $.FCurEmulate = $.FScaling = false;
      $.FOffset = 0;
      $.FTotalSize = 0;
   }
   /// anonymous TSourceMethodSymbol
   ,a$57:function(Self) {
      var Result = false;
      Result = TQTXWriter.GetOffset(Self) >= TQTXWriter.GetTotalSize(Self);
      return Result
   }
   /// anonymous TSourceMethodSymbol
   ,a$56:function(Self) {
      var Result = false;
      Result = TQTXWriter.GetTotalSize(Self) > 0 && TQTXWriter.GetOffset(Self) < TQTXWriter.GetTotalSize(Self);
      return Result
   }
   /// function TQTXWriter.CheckWriteForEOF(NumberOfBytes: int32) : Boolean
   ,CheckWriteForEOF:function(Self, NumberOfBytes) {
      var Result = false;
      if (NumberOfBytes >= 1) {
         if (!(Self.FScaling)) {
            Result = TQTXWriter.GetTotalFree(Self) < NumberOfBytes;
         }
      }
      return Result
   }
   /// constructor TQTXWriter.Create(Access: IManagedData)
   ,Create$53:function(Self, Access) {
      TDataTypeConverter.Create$4(Self);
      Self.FAccess = Access;
      Self.FOffset = Self.FAccess[3]();
      if (Self.FOffset < 0) {
         Self.FOffset = 0;
      }
      Self.FTotalSize = Self.FAccess[2]();
      Self.FScaling = true;
      Self.FCurEmulate = true;
      return Self
   }
   /// function TQTXWriter.GetOffset() : int32
   ,GetOffset:function(Self) {
      var Result = 0;
      if (Self.FCurEmulate) {
         Result = Self.FOffset;
      } else {
         Result = Self.FAccess[3]();
      }
      return Result
   }
   /// function TQTXWriter.GetTotalFree() : int32
   ,GetTotalFree:function(Self) {
      var Result = 0;
      Result = Self.FAccess[2]() - TQTXWriter.GetOffset(Self);
      return Result
   }
   /// function TQTXWriter.GetTotalSize() : int32
   ,GetTotalSize:function(Self) {
      var Result = 0;
      if (Self.FCurEmulate) {
         Result = 2147483647;
      } else {
         Result = Self.FAccess[2]();
      }
      return Result
   }
   /// procedure TQTXWriter.SetCursorEmulation(Value: Boolean)
   ,SetCursorEmulation:function(Self, Value$4) {
      Self.FCurEmulate = Value$4;
   }
   /// procedure TQTXWriter.SetScaling(Value: Boolean)
   ,SetScaling:function(Self, Value$4) {
      Self.FScaling = Value$4;
   }
   /// function TQTXWriter.Write(Data: TUInt8Array) : int32
   ,Write:function(Self, Data) {
      var Result = 0;
      var LBytesToWrite = 0,
         LBytesLeft = 0,
         LBytesMissing = 0;
      LBytesToWrite = Data.length;
      if (LBytesToWrite < 1) {
         throw EException.CreateFmt$($New(EQTXWriterError),$R[10],[LBytesToWrite]);
      }
      if (Self.FScaling) {
         Self.FAccess[5](TQTXWriter.GetOffset(Self),Data);
         if (Self.FCurEmulate) {
            (Self.FOffset+= LBytesToWrite);
         }
      } else {
         if (TQTXWriter.CheckWriteForEOF(Self,LBytesToWrite)) {
            LBytesLeft = TQTXWriter.GetTotalSize(Self) - TQTXWriter.GetOffset(Self);
            LBytesMissing = Abs$_Integer_(LBytesLeft - LBytesToWrite);
            (LBytesToWrite-= LBytesMissing);
            $ArraySetLenC(Data,LBytesToWrite,function (){return 0});
         }
         if (LBytesToWrite > 1) {
            Self.FAccess[5](TQTXWriter.GetOffset(Self),Data);
            if (Self.FCurEmulate) {
               (Self.FOffset+= LBytesToWrite);
            }
         } else {
            throw EException.CreateFmt$($New(EQTXWriterError),$R[9],[Data.length]);
         }
      }
      Result = Data.length;
      return Result
   }
   /// procedure TQTXWriter.WriteBool(Value: Boolean)
   ,WriteBool:function(Self, Value$4) {
      var LBytesToWrite = 0;
      LBytesToWrite = TDataTypeConverter.SizeOfType(Self.ClassType,1);
      TQTXWriter.Write(Self,TDataTypeConverter.BooleanToBytes(Self.ClassType,Value$4));
   }
   /// procedure TQTXWriter.WriteChar(Value: char)
   ,WriteChar:function(Self, Value$4) {
      var LBytesToWrite = 0;
      LBytesToWrite = TDataTypeConverter.SizeOfType(Self.ClassType,3);
      TQTXWriter.Write(Self,TString.EncodeUTF8(TString,Value$4.charAt(0)));
   }
   /// procedure TQTXWriter.WriteDateTime(Value: TDateTime)
   ,WriteDateTime:function(Self, Value$4) {
      TQTXWriter.Write(Self,TDataTypeConverter.Float64ToBytes(Self,Value$4));
   }
   /// procedure TQTXWriter.WriteDouble(Value: double)
   ,WriteDouble:function(Self, Value$4) {
      TQTXWriter.Write(Self,TDataTypeConverter.Float64ToBytes(Self,Value$4));
   }
   /// procedure TQTXWriter.WriteInt16(Value: int16)
   ,WriteInt16:function(Self, Value$4) {
      var LValue = 0;
      LValue = TInt32.EnsureRange(TInt32,Value$4,-32768,32767);
      TQTXWriter.Write(Self,TDataTypeConverter.Int16ToBytes(Self,LValue));
   }
   /// procedure TQTXWriter.WriteInt32(Value: int32)
   ,WriteInt32:function(Self, Value$4) {
      TQTXWriter.Write(Self,TDataTypeConverter.Int32ToBytes(Self,Value$4));
   }
   /// procedure TQTXWriter.WriteInt8(Value: int8)
   ,WriteInt8:function(Self, Value$4) {
      var LValue = 0;
      LValue = TInt32.EnsureRange(TInt32,Value$4,0,255);
      TQTXWriter.Write(Self,[LValue]);
   }
   /// procedure TQTXWriter.WriteSingle(Value: Float)
   ,WriteSingle:function(Self, Value$4) {
      TQTXWriter.Write(Self,TDataTypeConverter.Float32ToBytes(Self,Value$4));
   }
   /// procedure TQTXWriter.WriteStr(const Value: String; const AFormat: TStringFormat)
   ,WriteStr$1:function(Self, Value$4, AFormat) {
      var LBytes = [],
         LBytesToWrite = 0;
      LBytes = TDataTypeConverter.StringToBytes(Self,Value$4,AFormat);
      LBytesToWrite = LBytes.length;
      if (LBytesToWrite > 0) {
         TQTXWriter.Write(Self,LBytes);
      }
   }
   /// procedure TQTXWriter.WriteStr(const Value: String)
   ,WriteStr:function(Self, Value$4) {
      TQTXWriter.WriteStr$1(Self,Value$4,0);
   }
   /// procedure TQTXWriter.WriteString(const Value: String)
   ,WriteString:function(Self, Value$4) {
      var LTotal = 0,
         LBytes = [];
      LTotal = TDataTypeConverter.SizeOfType(Self.ClassType,7);
      (LTotal+= TDataTypeConverter.SizeOfType(Self.ClassType,7));
      LBytes = TDataTypeConverter.StringToBytes$1(Self,Value$4);
      (LTotal+= LBytes.length);
      TQTXWriter.WriteUint32(Self,3131756270);
      TQTXWriter.WriteUint32(Self,LBytes.length);
      if (LBytes.length > 0) {
         TQTXWriter.Write(Self,LBytes);
      }
   }
   /// procedure TQTXWriter.WriteUInt16(Value: uint16)
   ,WriteUInt16:function(Self, Value$4) {
      var LValue = 0;
      LValue = TInt32.EnsureRange(TInt32,Value$4,0,65536);
      TQTXWriter.Write(Self,TDataTypeConverter.Int16ToBytes(Self,LValue));
   }
   /// procedure TQTXWriter.WriteUint32(Value: uint32)
   ,WriteUint32:function(Self, Value$4) {
      TQTXWriter.Write(Self,TDataTypeConverter.UInt32ToBytes(Self,Value$4));
   }
   /// procedure TQTXWriter.WriteUInt8(Value: uint8)
   ,WriteUInt8:function(Self, Value$4) {
      var LValue = 0;
      LValue = TInt32.EnsureRange(TInt32,Value$4,0,255);
      TQTXWriter.Write(Self,[LValue]);
   }
   /// procedure TQTXWriter.WriteVariant(const Value: Variant)
   ,WriteVariant:function(Self, Value$4) {
      var LDataType = 1,
         LBytes = [];
      LDataType = TVariantHelper$DataType(Value$4);
      if (LDataType == 1) {
         TQTXWriter.WriteUint32(Self,1);
      } else {
         LBytes = TDataTypeConverter.VariantToBytes(Self,Value$4);
         TQTXWriter.WriteUint32(Self,LDataType);
         TQTXWriter.WriteUint32(Self,LBytes.length);
         TQTXWriter.Write(Self,LBytes);
      }
   }
   ,Destroy:TDataTypeConverter.Destroy
   ,Create$4:TDataTypeConverter.Create$4
   ,SetEndian:TDataTypeConverter.SetEndian
   ,Create$53$:function($){return $.ClassType.Create$53.apply($.ClassType, arguments)}
};
/// TQTXStreamWriter = class (TQTXWriter)
var TQTXStreamWriter = {
   $ClassName:"TQTXStreamWriter",$Parent:TQTXWriter
   ,$Init:function ($) {
      TQTXWriter.$Init($);
   }
   /// constructor TQTXStreamWriter.Create(Stream: TQTXStream)
   ,Create$54:function(Self, Stream) {
      TQTXWriter.Create$53(Self,$AsIntf(Stream,"IManagedData"));
      return Self
   }
   ,Destroy:TDataTypeConverter.Destroy
   ,Create$4:TDataTypeConverter.Create$4
   ,SetEndian:TDataTypeConverter.SetEndian
   ,Create$53:TQTXWriter.Create$53
   ,Create$54$:function($){return $.ClassType.Create$54.apply($.ClassType, arguments)}
};
/// TQTXReader = class (TDataTypeConverter)
var TQTXReader = {
   $ClassName:"TQTXReader",$Parent:TDataTypeConverter
   ,$Init:function ($) {
      TDataTypeConverter.$Init($);
      $.FAccess$1 = null;
      $.FBookmarks = [];
      $.FCurEmulate$1 = false;
      $.FOffset$1 = 0;
      $.FTotalSize$1 = 0;
   }
   /// anonymous TSourceMethodSymbol
   ,a$59:function(Self) {
      var Result = false;
      Result = TQTXReader.GetReadOffset$(Self) >= TQTXReader.GetTotalSize$1$(Self);
      return Result
   }
   /// anonymous TSourceMethodSymbol
   ,a$58:function(Self) {
      var Result = false;
      Result = TQTXReader.GetTotalSize$1$(Self) > 0 && TQTXReader.GetReadOffset$(Self) < TQTXReader.GetTotalSize$1$(Self);
      return Result
   }
   /// procedure TQTXReader.Bookmark()
   ,Bookmark:function(Self) {
      if (Self.FCurEmulate$1) {
         Self.FBookmarks.push(TQTXReader.GetReadOffset$(Self));
      } else {
         throw Exception.Create($New(EQTXReaderError),$R[7]);
      }
   }
   /// function TQTXReader.CheckReadForEOF(NumberOfBytes: int32) : Boolean
   ,CheckReadForEOF:function(Self, NumberOfBytes) {
      var Result = false;
      Result = TQTXReader.GetTotalSize$1$(Self) - TQTXReader.GetReadOffset$(Self) < NumberOfBytes;
      return Result
   }
   /// constructor TQTXReader.Create(Access: IManagedData)
   ,Create$55:function(Self, Access) {
      TDataTypeConverter.Create$4(Self);
      Self.FAccess$1 = Access;
      Self.FCurEmulate$1 = true;
      Self.FOffset$1 = Self.FAccess$1[3]();
      if (Self.FOffset$1 < 0) {
         Self.FOffset$1 = 0;
      }
      Self.FTotalSize$1 = Self.FAccess$1[2]();
      return Self
   }
   /// function TQTXReader.GetReadOffset() : int32
   ,GetReadOffset:function(Self) {
      var Result = 0;
      if (Self.FCurEmulate$1) {
         Result = Self.FOffset$1;
      } else {
         Result = Self.FAccess$1[3]();
      }
      return Result
   }
   /// function TQTXReader.GetTotalSize() : int32
   ,GetTotalSize$1:function(Self) {
      var Result = 0;
      if (Self.FCurEmulate$1) {
         Result = Self.FTotalSize$1;
      } else {
         Result = Self.FAccess$1[2]();
      }
      return Result
   }
   /// function TQTXReader.Read(Count: int32) : TUInt8Array
   ,Read:function(Self, Count) {
      var Result = [];
      if (Count < 1) {
         throw EException.CreateFmt$($New(EQTXReaderError),"Invalid read length (%s)",[Count]);
      }
      Result = Self.FAccess$1[4](TQTXReader.GetReadOffset$(Self),Count);
      if (Self.FCurEmulate$1) {
         (Self.FOffset$1+= Result.length);
      }
      return Result
   }
   /// function TQTXReader.ReadBool() : Boolean
   ,ReadBool:function(Self) {
      var Result = false;
      var LTypeSize = 0;
      LTypeSize = TDataTypeConverter.SizeOfType(Self.ClassType,1);
      Result = TDataTypeConverter.BytesToBoolean(Self.ClassType,TQTXReader.Read(Self,LTypeSize));
      return Result
   }
   /// function TQTXReader.ReadChar() : char
   ,ReadChar:function(Self) {
      var Result = "";
      var LTypeSize = 0;
      LTypeSize = TDataTypeConverter.SizeOfType(Self.ClassType,3);
      Result = TString.DecodeUTF8(TString,TQTXReader.Read(Self,LTypeSize));
      return Result
   }
   /// function TQTXReader.ReadDateTime() : TDateTime
   ,ReadDateTime:function(Self) {
      var Result = undefined;
      var LTypeSize = 0;
      LTypeSize = TDataTypeConverter.SizeOfType(Self.ClassType,9);
      Result = TDataTypeConverter.BytesToFloat64(Self,TQTXReader.Read(Self,LTypeSize));
      return Result
   }
   /// function TQTXReader.ReadDouble() : double
   ,ReadDouble:function(Self) {
      var Result = undefined;
      var LTypeSize = 0;
      LTypeSize = TDataTypeConverter.SizeOfType(Self.ClassType,9);
      Result = TDataTypeConverter.BytesToFloat64(Self,TQTXReader.Read(Self,LTypeSize));
      return Result
   }
   /// function TQTXReader.ReadInt16() : int16
   ,ReadInt16:function(Self) {
      var Result = 0;
      var LTypeSize = 0;
      LTypeSize = TDataTypeConverter.SizeOfType(Self.ClassType,6);
      Result = TDataTypeConverter.BytesToInt16(Self,TQTXReader.Read(Self,LTypeSize));
      return Result
   }
   /// function TQTXReader.ReadInt32() : int32
   ,ReadInt32:function(Self) {
      var Result = 0;
      var LTypeSize = 0;
      LTypeSize = TDataTypeConverter.SizeOfType(Self.ClassType,7);
      Result = TDataTypeConverter.BytesToInt32(Self,TQTXReader.Read(Self,LTypeSize));
      return Result
   }
   /// function TQTXReader.ReadInt8() : int8
   ,ReadInt8:function(Self) {
      var Result = 0;
      var LTypeSize = 0,
         lTemp = 0;
      LTypeSize = TDataTypeConverter.SizeOfType(Self.ClassType,2);
      lTemp = TQTXReader.Read(Self,LTypeSize)[0];
      Result = (lTemp < -128)?-128:(lTemp > 127)?127:lTemp;
      return Result
   }
   /// function TQTXReader.ReadSingle() : Float
   ,ReadSingle:function(Self) {
      var Result = 0;
      var LTypeSize = 0;
      LTypeSize = TDataTypeConverter.SizeOfType(Self.ClassType,8);
      Result = TDataTypeConverter.BytesToFloat32(Self,TQTXReader.Read(Self,LTypeSize));
      return Result
   }
   /// function TQTXReader.ReadStr(Count: int32) : String
   ,ReadStr:function(Self, Count) {
      var Result = "";
      if (Count < 1) {
         return "";
      }
      Result = TDataTypeConverter.BytesToString(Self,TQTXReader.Read(Self,Count));
      return Result
   }
   /// function TQTXReader.ReadString() : String
   ,ReadString:function(Self) {
      var Result = "";
      if (TQTXReader.ReadUint32(Self) == 3131756270) {
         Result = TQTXReader.ReadStr(Self,TQTXReader.ReadUint32(Self));
      } else {
         throw EException.CreateFmt$($New(EQTXReaderError),$R[6],["string"]);
      }
      return Result
   }
   /// function TQTXReader.ReadUint16() : uint16
   ,ReadUint16:function(Self) {
      var Result = 0;
      var LTypeSize = 0;
      LTypeSize = TDataTypeConverter.SizeOfType(Self.ClassType,6);
      Result = TDataTypeConverter.BytesToUInt16(Self,TQTXReader.Read(Self,LTypeSize));
      return Result
   }
   /// function TQTXReader.ReadUint32() : longword
   ,ReadUint32:function(Self) {
      var Result = 0;
      var LTypeSize = 0;
      LTypeSize = TDataTypeConverter.SizeOfType(Self.ClassType,7);
      Result = TDataTypeConverter.BytesToUInt32(Self,TQTXReader.Read(Self,LTypeSize));
      return Result
   }
   /// function TQTXReader.ReadUint8() : byte
   ,ReadUint8:function(Self) {
      var Result = 0;
      var LTypeSize = 0;
      LTypeSize = TDataTypeConverter.SizeOfType(Self.ClassType,2);
      Result = TQTXReader.Read(Self,LTypeSize)[0];
      return Result
   }
   /// function TQTXReader.ReadVariant() : Variant
   ,ReadVariant:function(Self) {
      var Result = undefined;
      var LVariantType = 1,
         StringLen_ = 0;
      LVariantType = TQTXReader.ReadInt32(Self);
      if (LVariantType != 1) {
         StringLen_ = TQTXReader.ReadInt32(Self);
         if (StringLen_ > 0) {
            Result = TDataTypeConverter.BytesToVariant(Self,TQTXReader.Read(Self,StringLen_));
         }
      }
      return Result
   }
   /// procedure TQTXReader.SetCursorEmulation(Value: Boolean)
   ,SetCursorEmulation$1:function(Self, Value$4) {
      Self.FCurEmulate$1 = Value$4;
   }
   /// procedure TQTXReader.UnBookmark()
   ,UnBookmark:function(Self) {
      if (Self.FCurEmulate$1) {
         if (Self.FBookmarks.length > 0) {
            Self.FOffset$1 = Self.FBookmarks.pop();
         } else {
            throw Exception.Create($New(EQTXReaderError),$R[8]);
         }
      } else {
         throw Exception.Create($New(EQTXReaderError),$R[7]);
      }
   }
   ,Destroy:TDataTypeConverter.Destroy
   ,Create$4:TDataTypeConverter.Create$4
   ,SetEndian:TDataTypeConverter.SetEndian
   ,Create$55$:function($){return $.ClassType.Create$55.apply($.ClassType, arguments)}
   ,GetReadOffset$:function($){return $.ClassType.GetReadOffset($)}
   ,GetTotalSize$1$:function($){return $.ClassType.GetTotalSize$1($)}
};
/// TQTXStreamReader = class (TQTXReader)
var TQTXStreamReader = {
   $ClassName:"TQTXStreamReader",$Parent:TQTXReader
   ,$Init:function ($) {
      TQTXReader.$Init($);
   }
   /// constructor TQTXStreamReader.Create(Stream: TQTXStream)
   ,Create$56:function(Self, Stream) {
      TQTXReader.Create$55(Self,$AsIntf(Stream,"IManagedData"));
      return Self
   }
   ,Destroy:TDataTypeConverter.Destroy
   ,Create$4:TDataTypeConverter.Create$4
   ,SetEndian:TDataTypeConverter.SetEndian
   ,Create$55:TQTXReader.Create$55
   ,GetReadOffset:TQTXReader.GetReadOffset
   ,GetTotalSize$1:TQTXReader.GetTotalSize$1
   ,Create$56$:function($){return $.ClassType.Create$56.apply($.ClassType, arguments)}
};
/// TQTXStream = class (TDataTypeConverter)
var TQTXStream = {
   $ClassName:"TQTXStream",$Parent:TDataTypeConverter
   ,$Init:function ($) {
      TDataTypeConverter.$Init($);
   }
   /// procedure TQTXStream.Append(const Buffer: JArrayBuffer)
   ,Append$4:function(Self, Buffer$1) {
      var lTotal = 0,
         dx$1 = 0,
         lChunkSize = 0,
         lTarget = 0,
         lCache = null,
         bytes = [];
      if (!!Buffer$1) {
         lTotal = Buffer$1.byteLength;
         if (lTotal > 0) {
            dx$1 = 0;
            do {
               lChunkSize = 10485760;
               lTarget = dx$1 + lChunkSize;
               if (lTarget > lTotal) {
                  (lChunkSize-= (lTarget - lTotal));
               }
               if (lChunkSize <= 0) {
                  break;
               }
               lCache = Buffer$1.slice(dx$1,dx$1 + lChunkSize);
               bytes = TDataTypeConverter.UnTypedBufferToBytes(Self.ClassType,lCache);
               TQTXStream.Append$3(Self,bytes);
               WriteLnF("appended %d bytes",[lChunkSize]);
               (dx$1+= lChunkSize);
            } while (!(dx$1 >= lTotal));
         }
      } else {
         throw Exception.Create($New(EQTXException),"Append() failed, Buffer was nil error");
      }
   }
   /// procedure TQTXStream.Append(Data: TUInt8Array)
   ,Append$3:function(Self, Data) {
      var lOffset = 0,
         lPositionAdjust = 0;
      if (Data.length > 0) {
         lOffset = TQTXStream.GetSize$1$(Self);
         TQTXStream.Grow$1(Self,Data.length);
         TQTXStream.WriteBuffer$1$(Self,lOffset,Data);
         lPositionAdjust = TQTXStream.GetPosition$1$(Self);
         if (lPositionAdjust < 0) {
            lPositionAdjust = 0;
         }
         (lPositionAdjust+= Data.length);
         TQTXStream.SetPosition$(Self,lPositionAdjust);
      }
   }
   /// procedure TQTXStream.Assign(Memory: IManagedData)
   ,Assign$3:function(Self, Memory$1) {
      var LSize = 0,
         LCache = [];
      if (TQTXStream.GetSize$1$(Self) > 0) {
         TQTXStream.SetSize$1$(Self,0);
      }
      if (Memory$1) {
         LSize = Memory$1[2]();
         if (LSize > 0) {
            LCache = Memory$1[4](0,LSize);
            TQTXStream.WriteBuffer$1$(Self,0,LCache);
            LCache.length=0;
         }
      }
   }
   /// function TQTXStream.CalcAdler32() : int32
   ,CalcAdler32$6:function(Self) {
      var Result = 0;
      Result = TQTXAdler32.CalcAdler32$1(TQTXAdler32,TQTXStream.ToBytes$1(Self));
      return Result
   }
   /// function TQTXStream.CalcCRC32() : int32
   ,CalcCRC32$6:function(Self) {
      var Result = 0;
      Result = TQTXCRC.CalcCRC32$4(TQTXCRC,TQTXStream.ToBytes$1(Self));
      return Result
   }
   /// function TQTXStream.CopyFrom(Source: TQTXStream; Count: int64) : int32
   ,CopyFrom:function(Self, Source, Count) {
      var Result = 0;
      Result = TQTXStream.Write$1$(Self,TQTXStream.Read$1$(Source,Count));
      return Result
   }
   /// procedure TQTXStream.FromBytes(Bytes: TUInt8Array)
   ,FromBytes$3:function(Self, Bytes) {
      if (TQTXStream.GetSize$1$(Self) > 0) {
         TQTXStream.SetSize$1$(Self,0);
         if (Bytes.length > 0) {
            TQTXStream.Append$3(Self,Bytes);
         }
      } else {
         TQTXStream.Append$3(Self,Bytes);
      }
   }
   /// function TQTXStream.GetBOF() : Boolean
   ,GetBOF:function(Self) {
      var Result = false;
      Result = TQTXStream.GetPosition$1$(Self) <= 0;
      return Result
   }
   /// function TQTXStream.GetEOF() : Boolean
   ,GetEOF:function(Self) {
      var Result = false;
      Result = TQTXStream.GetPosition$1$(Self) >= TQTXStream.GetSize$1$(Self);
      return Result
   }
   /// procedure TQTXStream.GetPositionA(TagValue: Variant; CB: TQTXStreamGetPosCB)
   ,GetPositionA:function(Self, TagValue, CB) {
      if (CB) {
         CB(TagValue,null,TQTXStream.GetPosition$1$(Self));
      }
   }
   /// procedure TQTXStream.GetSizeA(TagValue: Variant; CB: TQTXStreamGetSizeCB)
   ,GetSizeA:function(Self, TagValue, CB) {
      if (CB) {
         CB(TagValue,null,TQTXStream.GetSize$1$(Self));
      }
   }
   /// procedure TQTXStream.Grow(BytesToGrow: int32)
   ,Grow$1:function(Self, BytesToGrow) {
      if (BytesToGrow > 0) {
         TQTXStream.SetSize$1$(Self,TQTXStream.GetSize$1$(Self) + BytesToGrow);
      }
   }
   /// function TQTXStream.Read(Count: int64) : TUInt8Array
   ,Read$1:function(Self, Count) {
      var Result = [];
      Result = TQTXStream.ReadBuffer$1$(Self,TQTXStream.GetPosition$1$(Self),Count);
      return Result
   }
   /// procedure TQTXStream.ReadA(TagValue: Variant; BytesToRead: int32; CB: TQTXStreamReadCB)
   ,ReadA:function(Self, TagValue, BytesToRead, CB) {
      var LBytes = [];
      try {
         LBytes = TQTXStream.Read$1$(Self,BytesToRead);
      } catch ($e) {
         var e$1 = $W($e);
         if (CB) {
            CB(TagValue,e$1,LBytes);
         } else {
            throw $e;
         }
         return;
      }
      if (CB) {
         CB(TagValue,null,LBytes);
      }
   }
   /// procedure TQTXStream.ReadAll(TagValue: Variant; CB: TQTXStreamReadCB)
   ,ReadAll:function(Self, TagValue, CB) {
      var LBytes = [];
      try {
         TQTXStream.SetPosition$(Self,0);
         LBytes = TQTXStream.Read$1$(Self,TQTXStream.GetSize$1$(Self));
      } catch ($e) {
         var e$1 = $W($e);
         if (CB) {
            CB(TagValue,e$1,LBytes);
         } else {
            throw $e;
         }
         return;
      }
      if (CB) {
         CB(TagValue,null,LBytes);
      }
   }
   /// procedure TQTXStream.SeekA(TagValue: Variant; NewPosition: int64; CB: TQTXStreamSeekCB)
   ,SeekA:function(Self, TagValue, NewPosition, CB) {
      try {
         TQTXStream.SetPosition$(Self,NewPosition);
      } catch ($e) {
         var e$1 = $W($e);
         if (CB) {
            CB(TagValue,e$1,TQTXStream.GetPosition$1$(Self));
         } else {
            throw $e;
         }
         return;
      }
      if (CB) {
         CB(TagValue,null,TQTXStream.GetPosition$1$(Self));
      }
   }
   /// procedure TQTXStream.SetSizeA(TagValue: Variant; NewSize: int64; CB: TQTXStreamSetSizeCB)
   ,SetSizeA:function(Self, TagValue, NewSize, CB) {
      try {
         TQTXStream.SetSize$1$(Self,NewSize);
      } catch ($e) {
         var e$1 = $W($e);
         if (CB) {
            CB(TagValue,e$1,TQTXStream.GetSize$1$(Self));
         } else {
            throw $e;
         }
         return;
      }
      if (CB) {
         CB(TagValue,null,TQTXStream.GetSize$1$(Self));
      }
   }
   /// procedure TQTXStream.Shrink(BytesToShrink: int32)
   ,Shrink$1:function(Self, BytesToShrink) {
      var LSize = 0;
      if (BytesToShrink > 0) {
         LSize = TQTXStream.GetSize$1$(Self);
         if (LSize > 0) {
            (LSize-= BytesToShrink);
            if (BytesToShrink > 0) {
               TQTXStream.SetSize$1$(Self,LSize);
            } else {
               TQTXStream.SetSize$1$(Self,0);
            }
         }
      }
   }
   /// function TQTXStream.ToBytes() : TUInt8Array
   ,ToBytes$1:function(Self) {
      var Result = [];
      Result = TQTXStream.ReadBuffer$1$(Self,0,TQTXStream.GetSize$1$(Self));
      return Result
   }
   /// function TQTXStream.Write(Buffer: TUInt8Array) : int64
   ,Write$1:function(Self, Buffer$1) {
      var Result = 0;
      TQTXStream.WriteBuffer$1$(Self,TQTXStream.GetPosition$1$(Self),Buffer$1);
      Result = Buffer$1.length;
      return Result
   }
   /// procedure TQTXStream.WriteA(TagValue: Variant; Data: TUInt8Array; CB: TQTXStreamWriteCB)
   ,WriteA:function(Self, TagValue, Data, CB) {
      try {
         TQTXStream.Write$1$(Self,Data);
      } catch ($e) {
         var e$1 = $W($e);
         if (CB) {
            CB(TagValue,e$1);
         } else {
            throw $e;
         }
         return;
      }
      if (CB) {
         CB(TagValue,null);
      }
   }
   ,Destroy:TDataTypeConverter.Destroy
   ,Create$4:TDataTypeConverter.Create$4
   ,SetEndian:TDataTypeConverter.SetEndian
   ,CalcAdler32$6$:function($){return $.ClassType.CalcAdler32$6($)}
   ,CalcCRC32$6$:function($){return $.ClassType.CalcCRC32$6($)}
   ,GetPosition$1$:function($){return $.ClassType.GetPosition$1($)}
   ,GetSize$1$:function($){return $.ClassType.GetSize$1($)}
   ,Read$1$:function($){return $.ClassType.Read$1.apply($.ClassType, arguments)}
   ,ReadBuffer$1$:function($){return $.ClassType.ReadBuffer$1.apply($.ClassType, arguments)}
   ,Seek$:function($){return $.ClassType.Seek.apply($.ClassType, arguments)}
   ,SetPosition$:function($){return $.ClassType.SetPosition.apply($.ClassType, arguments)}
   ,SetSize$1$:function($){return $.ClassType.SetSize$1.apply($.ClassType, arguments)}
   ,Write$1$:function($){return $.ClassType.Write$1.apply($.ClassType, arguments)}
   ,WriteBuffer$1$:function($){return $.ClassType.WriteBuffer$1.apply($.ClassType, arguments)}
};
TQTXStream.$Intf={
   IAsyncStream:[TQTXStream.ReadA,TQTXStream.WriteA,TQTXStream.GetSizeA,TQTXStream.SetSizeA,TQTXStream.SeekA,TQTXStream.ReadAll,TQTXStream.GetPositionA]
   ,IManagedData:[TQTXStream.ToBytes$1,TQTXStream.FromBytes$3,TQTXStream.GetSize$1,TQTXStream.GetPosition$1,TQTXStream.ReadBuffer$1,TQTXStream.WriteBuffer$1,TQTXStream.Grow$1,TQTXStream.Shrink$1,TQTXStream.Assign$3,TQTXStream.Append$3,TQTXStream.CalcCRC32$6,TQTXStream.CalcAdler32$6]
}
/// TQTXErrorObject = class (TObject)
var TQTXErrorObject = {
   $ClassName:"TQTXErrorObject",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.FLastError = "";
      $.FOptions = [0];
   }
   /// anonymous TSourceMethodSymbol
   ,a$49:function(Self) {
      var Result = false;
      Result = Self.FLastError.length > 0;
      return Result
   }
   /// procedure TQTXErrorObject.ClearLastError()
   ,ClearLastError:function(Self) {
      Self.FLastError = "";
   }
   /// constructor TQTXErrorObject.Create()
   ,Create$45:function(Self) {
      TObject.Create(Self);
      Self.FOptions = [1];
      return Self
   }
   /// function TQTXErrorObject.GetExceptionClass() : EExceptionClass
   ,GetExceptionClass:function(Self) {
      var Result = null;
      Result = EQTXException;
      return Result
   }
   /// procedure TQTXErrorObject.InterceptError(var Error: EQTXException)
   ,InterceptError:function(Self, Error$1) {
      /* null */
   }
   /// procedure TQTXErrorObject.SetErrorOptions(NewOptions: TQTXErrorOptions)
   ,SetErrorOptions:function(Self, NewOptions) {
      Self.FOptions = NewOptions.slice(0);
   }
   /// procedure TQTXErrorObject.SetLastError(Text: String)
   ,SetLastError:function(Self, Text$1) {
      var lError = {v:null};
      Self.FLastError = Text$1;
      if ($SetIn(Self.FOptions,1,0,2)) {
         lError.v = Exception.Create($New(EQTXException),Self.FLastError);
         TQTXErrorObject.InterceptError$(Self,lError);
         if (!!lError.v) {
            throw lError.v;
         }
      }
   }
   /// procedure TQTXErrorObject.SetLastErrorF(Text: String; const Values: array of const)
   ,SetLastErrorF:function(Self, Text$1, Values$1) {
      var lError = {v:null};
      Self.FLastError = Format(Text$1,Values$1.slice(0));
      if ($SetIn(Self.FOptions,1,0,2)) {
         lError.v = Exception.Create($New(EQTXException),Self.FLastError);
         TQTXErrorObject.InterceptError$(Self,lError);
         if (!!lError.v) {
            throw lError.v;
         }
      }
   }
   ,Destroy:TObject.Destroy
   ,ClearLastError$:function($){return $.ClassType.ClearLastError($)}
   ,Create$45$:function($){return $.ClassType.Create$45($)}
   ,GetExceptionClass$:function($){return $.ClassType.GetExceptionClass($)}
   ,InterceptError$:function($){return $.ClassType.InterceptError.apply($.ClassType, arguments)}
   ,SetErrorOptions$:function($){return $.ClassType.SetErrorOptions.apply($.ClassType, arguments)}
   ,SetLastError$:function($){return $.ClassType.SetLastError.apply($.ClassType, arguments)}
   ,SetLastErrorF$:function($){return $.ClassType.SetLastErrorF.apply($.ClassType, arguments)}
};
/// TQTXOwnedObject = class (TQTXErrorObject)
var TQTXOwnedObject = {
   $ClassName:"TQTXOwnedObject",$Parent:TQTXErrorObject
   ,$Init:function ($) {
      TQTXErrorObject.$Init($);
      $.fOwner = null;
   }
   /// function TQTXOwnedObject.AcceptOwner(const Candidate: TObject) : Boolean
   ,AcceptOwner:function(Self, Candidate) {
      var Result = false;
      Result = true;
      return Result
   }
   /// constructor TQTXOwnedObject.Create(AOwner: TObject)
   ,Create$46:function(Self, AOwner) {
      TQTXErrorObject.Create$45(Self);
      TQTXOwnedObject.SetOwner$(Self,AOwner);
      return Self
   }
   /// function TQTXOwnedObject.GetOwner() : TObject
   ,GetOwner:function(Self) {
      var Result = null;
      Result = Self.fOwner;
      return Result
   }
   /// procedure TQTXOwnedObject.SetOwner(const NewOwner: TObject)
   ,SetOwner:function(Self, NewOwner) {
      if (NewOwner !== Self.fOwner) {
         if (TQTXOwnedObject.AcceptOwner$(Self,NewOwner)) {
            Self.fOwner = NewOwner;
         } else {
            throw EException.CreateFmt$($New(EQTXOwnedObject),$R[11],[TObject.ClassName(Self.ClassType), "TQTXOwnedObject.SetOwner"]);
         }
      }
   }
   ,Destroy:TObject.Destroy
   ,ClearLastError:TQTXErrorObject.ClearLastError
   ,Create$45:TQTXErrorObject.Create$45
   ,GetExceptionClass:TQTXErrorObject.GetExceptionClass
   ,InterceptError:TQTXErrorObject.InterceptError
   ,SetErrorOptions:TQTXErrorObject.SetErrorOptions
   ,SetLastError:TQTXErrorObject.SetLastError
   ,SetLastErrorF:TQTXErrorObject.SetLastErrorF
   ,AcceptOwner$:function($){return $.ClassType.AcceptOwner.apply($.ClassType, arguments)}
   ,Create$46$:function($){return $.ClassType.Create$46.apply($.ClassType, arguments)}
   ,GetOwner$:function($){return $.ClassType.GetOwner($)}
   ,SetOwner$:function($){return $.ClassType.SetOwner.apply($.ClassType, arguments)}
};
TQTXOwnedObject.$Intf={
   IQTXOwnedObjectAccess:[TQTXOwnedObject.AcceptOwner,TQTXOwnedObject.SetOwner,TQTXOwnedObject.GetOwner]
}
/// TQTXPersistent = class (TQTXOwnedObject)
var TQTXPersistent = {
   $ClassName:"TQTXPersistent",$Parent:TQTXOwnedObject
   ,$Init:function ($) {
      TQTXOwnedObject.$Init($);
   }
   /// procedure TQTXPersistent.Assign(Source: TQTXPersistent)
   ,Assign$2:function(Self, Source) {
      if (!!Source) {
         if ($Is(Source,TObject) || TObjectHelper$InheritsFrom(Source,TObject.ClassType(Self.ClassType))) {
            TQTXPersistent.FromJSON$(Self,TQTXPersistent.ToJSON$(Source));
         } else {
            throw EException.CreateFmt$($New(EQTXPersistentError),$R[13],[TObject.ClassType(Self.ClassType)]);
         }
      }
   }
   /// procedure TQTXPersistent.FromJSON(Value: String)
   ,FromJSON:function(Self, Value$4) {
      var lData = null;
      Value$4 = Trim$_String_(Value$4);
      if (Value$4.length > 0) {
         lData = TQTXJSONObject.Create$58$($New(TQTXJSONObject));
         try {
            TQTXJSONObject.FromJSON$1(lData,Value$4);
            TQTXPersistent.ReadObject$(Self,lData);
         } finally {
            TObject.Free(lData);
         }
      } else {
         throw Exception.Create($New(EQTXPersistentError),$R[14]);
      }
   }
   /// procedure TQTXPersistent.FromJSONObject(const Value: TQTXJSONObject)
   ,FromJSONObject:function(Self, Value$4) {
      if (!!Value$4) {
         TQTXPersistent.ReadObject$(Self,Value$4);
      } else {
         throw Exception.Create($New(EQTXPersistentError),$R[15]);
      }
   }
   /// procedure TQTXPersistent.ReadObject(const Source: TQTXJSONObject)
   ,ReadObject:function(Self, Source) {
      /* null */
   }
   /// function TQTXPersistent.ToJSON() : String
   ,ToJSON:function(Self) {
      var Result = "";
      var lData = null;
      lData = TQTXJSONObject.Create$58$($New(TQTXJSONObject));
      try {
         TQTXPersistent.WriteObject$(Self,lData);
         Result = TQTXJSONObject.ToJSON$3(lData,4);
      } finally {
         TObject.Free(lData);
      }
      return Result
   }
   /// function TQTXPersistent.ToJSONObject() : TQTXJSONObject
   ,ToJSONObject:function(Self) {
      var Result = null;
      Result = TQTXJSONObject.Create$58$($New(TQTXJSONObject));
      TQTXPersistent.WriteObject$(Self,Result);
      return Result
   }
   /// procedure TQTXPersistent.WriteObject(const Target: TQTXJSONObject)
   ,WriteObject:function(Self, Target) {
      /* null */
   }
   ,Destroy:TObject.Destroy
   ,ClearLastError:TQTXErrorObject.ClearLastError
   ,Create$45:TQTXErrorObject.Create$45
   ,GetExceptionClass:TQTXErrorObject.GetExceptionClass
   ,InterceptError:TQTXErrorObject.InterceptError
   ,SetErrorOptions:TQTXErrorObject.SetErrorOptions
   ,SetLastError:TQTXErrorObject.SetLastError
   ,SetLastErrorF:TQTXErrorObject.SetLastErrorF
   ,AcceptOwner:TQTXOwnedObject.AcceptOwner
   ,Create$46:TQTXOwnedObject.Create$46
   ,GetOwner:TQTXOwnedObject.GetOwner
   ,SetOwner:TQTXOwnedObject.SetOwner
   ,Assign$2$:function($){return $.ClassType.Assign$2.apply($.ClassType, arguments)}
   ,FromJSON$:function($){return $.ClassType.FromJSON.apply($.ClassType, arguments)}
   ,FromJSONObject$:function($){return $.ClassType.FromJSONObject.apply($.ClassType, arguments)}
   ,ReadObject$:function($){return $.ClassType.ReadObject.apply($.ClassType, arguments)}
   ,ToJSON$:function($){return $.ClassType.ToJSON($)}
   ,ToJSONObject$:function($){return $.ClassType.ToJSONObject($)}
   ,WriteObject$:function($){return $.ClassType.WriteObject.apply($.ClassType, arguments)}
};
TQTXPersistent.$Intf={
   IQTXPersistent:[TQTXPersistent.ReadObject,TQTXPersistent.WriteObject,TQTXPersistent.ToJSON,TQTXPersistent.FromJSON,TQTXPersistent.FromJSONObject]
   ,IQTXOwnedObjectAccess:[TQTXOwnedObject.AcceptOwner,TQTXOwnedObject.SetOwner,TQTXOwnedObject.GetOwner]
}
/// TQTXOwnedLockedObject = class (TQTXOwnedObject)
var TQTXOwnedLockedObject = {
   $ClassName:"TQTXOwnedLockedObject",$Parent:TQTXOwnedObject
   ,$Init:function ($) {
      TQTXOwnedObject.$Init($);
      $.OnObjectUnLocked = null;
      $.OnObjectLocked = null;
      $.fLocked = 0;
   }
   /// procedure TQTXOwnedLockedObject.DisableAlteration()
   ,DisableAlteration:function(Self) {
      ++Self.fLocked;
      if (Self.fLocked == 1) {
         TQTXOwnedLockedObject.ObjectLocked$(Self);
      }
   }
   /// procedure TQTXOwnedLockedObject.EnableAlteration()
   ,EnableAlteration:function(Self) {
      if (Self.fLocked > 0) {
         --Self.fLocked;
         if (!Self.fLocked) {
            TQTXOwnedLockedObject.ObjectUnLocked$(Self);
         }
      }
   }
   /// function TQTXOwnedLockedObject.GetLockState() : Boolean
   ,GetLockState:function(Self) {
      var Result = false;
      Result = Self.fLocked > 0;
      return Result
   }
   /// procedure TQTXOwnedLockedObject.ObjectLocked()
   ,ObjectLocked:function(Self) {
      if (Self.OnObjectLocked) {
         Self.OnObjectLocked(Self);
      }
   }
   /// procedure TQTXOwnedLockedObject.ObjectUnLocked()
   ,ObjectUnLocked:function(Self) {
      if (Self.OnObjectUnLocked) {
         Self.OnObjectUnLocked(Self);
      }
   }
   ,Destroy:TObject.Destroy
   ,ClearLastError:TQTXErrorObject.ClearLastError
   ,Create$45:TQTXErrorObject.Create$45
   ,GetExceptionClass:TQTXErrorObject.GetExceptionClass
   ,InterceptError:TQTXErrorObject.InterceptError
   ,SetErrorOptions:TQTXErrorObject.SetErrorOptions
   ,SetLastError:TQTXErrorObject.SetLastError
   ,SetLastErrorF:TQTXErrorObject.SetLastErrorF
   ,AcceptOwner:TQTXOwnedObject.AcceptOwner
   ,Create$46:TQTXOwnedObject.Create$46
   ,GetOwner:TQTXOwnedObject.GetOwner
   ,SetOwner:TQTXOwnedObject.SetOwner
   ,ObjectLocked$:function($){return $.ClassType.ObjectLocked($)}
   ,ObjectUnLocked$:function($){return $.ClassType.ObjectUnLocked($)}
};
TQTXOwnedLockedObject.$Intf={
   IQTXLockObject:[TQTXOwnedLockedObject.DisableAlteration,TQTXOwnedLockedObject.EnableAlteration,TQTXOwnedLockedObject.GetLockState]
   ,IQTXOwnedObjectAccess:[TQTXOwnedObject.AcceptOwner,TQTXOwnedObject.SetOwner,TQTXOwnedObject.GetOwner]
}
/// TQTXMemoryStream = class (TQTXStream)
var TQTXMemoryStream = {
   $ClassName:"TQTXMemoryStream",$Parent:TQTXStream
   ,$Init:function ($) {
      TQTXStream.$Init($);
      $.fBuffer$1 = null;
      $.fOffset = 0;
   }
   /// function TQTXMemoryStream.CalcAdler32() : int32
   ,CalcAdler32$6:function(Self) {
      var Result = 0;
      Result = TManagedMemory.CalcAdler32$5(Self.fBuffer$1);
      return Result
   }
   /// function TQTXMemoryStream.CalcCRC32() : int32
   ,CalcCRC32$6:function(Self) {
      var Result = 0;
      Result = TManagedMemory.CalcCRC32$5(Self.fBuffer$1);
      return Result
   }
   /// constructor TQTXMemoryStream.Create()
   ,Create$4:function(Self) {
      TDataTypeConverter.Create$4(Self);
      Self.fBuffer$1 = TDataTypeConverter.Create$4$($New(TManagedMemory));
      Self.fOffset = -1;
      return Self
   }
   /// destructor TQTXMemoryStream.Destroy()
   ,Destroy:function(Self) {
      TObject.Free(Self.fBuffer$1);
      TDataTypeConverter.Destroy(Self);
   }
   /// procedure TQTXMemoryStream.FromJSArray(const Data: JUint8Array)
   ,FromJSArray:function(Self, Data) {
      if (!!Data) {
         if (TQTXStream.GetSize$1$(Self) > 0) {
            TQTXStream.SetSize$1$(Self,0);
         }
         if (Data.length > 0) {
            TManagedMemory.Allocate(Self.fBuffer$1,Data.length);
            Self.fBuffer$1.fArray.set(Data,0);
            TQTXStream.SetPosition$(Self,Data.length);
         }
      }
   }
   /// procedure TQTXMemoryStream.FromJsBuffer(const Data: JArrayBuffer)
   ,FromJsBuffer:function(Self, Data) {
      var lTemp = null;
      if (!!Data) {
         if (TQTXStream.GetSize$1$(Self) > 0) {
            TQTXStream.SetSize$1$(Self,0);
         }
         if (Data.byteLength > 0) {
            lTemp = new Uint8Array(Data);
            TManagedMemory.Allocate(Self.fBuffer$1,lTemp.length);
            Self.fBuffer$1.fArray.set(lTemp,0);
            TQTXStream.SetPosition$(Self,lTemp.length);
         }
      }
   }
   /// function TQTXMemoryStream.GetPosition() : int64
   ,GetPosition$1:function(Self) {
      var Result = 0;
      Result = Self.fOffset;
      return Result
   }
   /// function TQTXMemoryStream.GetSize() : int64
   ,GetSize$1:function(Self) {
      var Result = 0;
      Result = TManagedMemory.a$46(Self.fBuffer$1);
      return Result
   }
   /// function TQTXMemoryStream.ReadBuffer(const Offset: int64; const Count: int32; const Buffer: JUint8Array) : Integer
   ,ReadBuffer$4:function(Self, Offset, Count, Buffer$1) {
      var Result = 0;
      var lSize = 0,
         lBytesLeft = 0,
         lBytesToRead = 0,
         lTemp = [];
      lSize = TManagedMemory.a$46(Self.fBuffer$1);
      if (lSize > 0) {
         if (Count > 0) {
            lBytesLeft = (Offset < lSize)?lSize - Offset:0;
            if (lBytesLeft > 0) {
               lBytesToRead = (Count > lBytesLeft)?lBytesLeft:Count;
               lTemp = TManagedMemory.ReadBuffer(Self.fBuffer$1,Offset,lBytesToRead);
               (Buffer$1).set(lTemp, 0);
               TQTXStream.SetPosition$(Self,Offset + lBytesToRead);
               Result = lBytesToRead;
            }
         }
      }
      return Result
   }
   /// function TQTXMemoryStream.ReadBuffer(const Offset: int64; const Count: int32; const Buffer: JArrayBuffer) : Integer
   ,ReadBuffer$3:function(Self, Offset, Count, Buffer$1) {
      var Result = 0;
      if (!!Buffer$1) {
         Result = TQTXMemoryStream.ReadBuffer$4(Self,Offset,Count,new Uint8Array(Buffer$1));
      }
      return Result
   }
   /// function TQTXMemoryStream.ReadBuffer(Offset: int64; Count: int32) : TUInt8Array
   ,ReadBuffer$1:function(Self, Offset, Count) {
      var Result = [];
      var lSize = 0,
         lBytesLeft = 0,
         lBytesToRead = 0;
      lSize = TManagedMemory.a$46(Self.fBuffer$1);
      if (lSize > 0) {
         if (Offset >= 0) {
            if (Count > 0) {
               lBytesLeft = (Offset < lSize)?lSize - Offset:0;
               if (lBytesLeft > 0) {
                  lBytesToRead = (Count > lBytesLeft)?lBytesLeft:Count;
                  Result = TManagedMemory.ReadBuffer(Self.fBuffer$1,Offset,lBytesToRead);
                  TQTXStream.SetPosition$(Self,Offset + Result.length);
               }
            }
         }
      }
      return Result
   }
   /// function TQTXMemoryStream.Seek(Offset: int32; Origin: TSeekOrigin) : int32
   ,Seek:function(Self, Offset, Origin) {
      var Result = 0;
      var LSize = 0,
         LNewPos = 0,
         LNewPos$1 = 0,
         LNewPos$2 = 0;
      LSize = TQTXStream.GetSize$1$(Self);
      if (LSize < 1) {
         return 0;
      }
      switch (Origin) {
         case 0 :
            if (Offset > -1) {
               LNewPos = Offset;
               LNewPos = (LNewPos < 0)?0:(LNewPos > LSize)?LSize:LNewPos;
               TQTXStream.SetPosition$(Self,LNewPos);
               Result = LNewPos;
            }
            break;
         case 1 :
            LNewPos$1 = TQTXStream.GetPosition$1$(Self);
            (LNewPos$1+= Offset);
            Result = (LNewPos$1 < 0)?0:(LNewPos$1 > LSize)?LSize:LNewPos$1;
            TQTXStream.SetPosition$(Self,Result);
            break;
         case 2 :
            LNewPos$2 = LSize;
            (LSize-= Abs$_Integer_(Offset));
            Result = (LNewPos$2 < 0)?0:(LNewPos$2 > LSize)?LSize:LNewPos$2;
            TQTXStream.SetPosition$(Self,Result);
            break;
      }
      return Result
   }
   /// procedure TQTXMemoryStream.SetBuffer(const Value: TManagedMemory)
   ,SetBuffer:function(Self, Value$4) {
      if (!!Value$4) {
         TManagedMemory.Assign$1(Self.fBuffer$1,$AsIntf(Value$4,"IManagedData"));
         Self.fOffset = (TManagedMemory.a$46(Self.fBuffer$1) > 0)?0:-1;
      } else {
         TManagedMemory.Release(Self.fBuffer$1);
         Self.fOffset = -1;
      }
   }
   /// procedure TQTXMemoryStream.SetPosition(NewPosition: int64)
   ,SetPosition:function(Self, NewPosition) {
      var LSize = 0;
      LSize = TQTXStream.GetSize$1$(Self);
      if (LSize > 0) {
         Self.fOffset = (NewPosition < 0)?0:(NewPosition > LSize)?LSize:NewPosition;
      }
   }
   /// procedure TQTXMemoryStream.SetSize(NewSize: int64)
   ,SetSize$1:function(Self, NewSize) {
      var LSize = 0,
         LDiff = 0,
         LDiff$1 = 0;
      LSize = TQTXStream.GetSize$1$(Self);
      if (NewSize > 0) {
         if (NewSize == LSize) {
            return;
         }
         if (NewSize > LSize) {
            LDiff = NewSize - LSize;
            if (TManagedMemory.a$46(Self.fBuffer$1) + LDiff > 0) {
               TManagedMemory.Grow(Self.fBuffer$1,LDiff);
            } else {
               TManagedMemory.Release(Self.fBuffer$1);
            }
         } else {
            LDiff$1 = LSize - NewSize;
            if (TManagedMemory.a$46(Self.fBuffer$1) - LDiff$1 > 0) {
               TManagedMemory.Shrink(Self.fBuffer$1,LDiff$1);
            } else {
               TManagedMemory.Release(Self.fBuffer$1);
            }
         }
      } else {
         TManagedMemory.Release(Self.fBuffer$1);
      }
      LSize = TQTXStream.GetSize$1$(Self);
      Self.fOffset = (Self.fOffset < 0)?0:(Self.fOffset > LSize)?LSize:Self.fOffset;
   }
   /// function TQTXMemoryStream.ToJsArray() : JUint8Array
   ,ToJsArray:function(Self) {
      var Result = null;
      if (!!Self.fBuffer$1) {
         Result = new Uint8Array(TManagedMemory.a$46(Self.fBuffer$1));
         Result.set(Self.fBuffer$1.fArray,0);
      } else {
         Result = new Uint8Array(0);
      }
      return Result
   }
   /// function TQTXMemoryStream.ToJsBuffer() : JArrayBuffer
   ,ToJsBuffer:function(Self) {
      var Result = null;
      var temp = null;
      temp = new Uint8Array(TManagedMemory.a$46(Self.fBuffer$1));
      temp.set(Self.fBuffer$1.fArray,0);
      Result = temp.buffer;
      return Result
   }
   /// procedure TQTXMemoryStream.WriteBuffer(const Offset: int64; const Buffer: JArrayBuffer)
   ,WriteBuffer$4:function(Self, Offset, Buffer$1) {
      var lArray = null;
      if (!!Buffer$1) {
         lArray = new Uint8Array(Buffer$1);
         Self.fBuffer$1.fArray.set(lArray,Offset);
         TQTXStream.SetPosition$(Self,Offset + lArray.length);
      }
   }
   /// procedure TQTXMemoryStream.WriteBuffer(const Offset: int64; const Buffer: JUint8Array)
   ,WriteBuffer$3:function(Self, Offset, Buffer$1) {
      if (!!Buffer$1) {
         Self.fBuffer$1.fArray.set(Buffer$1,Offset);
         TQTXStream.SetPosition$(Self,Offset + Buffer$1.length);
      }
   }
   /// procedure TQTXMemoryStream.WriteBuffer(Offset: int64; Buffer: TUInt8Array)
   ,WriteBuffer$1:function(Self, Offset, Buffer$1) {
      var LSize = 0,
         LNewEnd = 0;
      if (Offset < 0) {
         Offset = 0;
      }
      if (TManagedMemory.a$42(Self.fBuffer$1) && Offset < 1) {
         TManagedMemory.Append(Self.fBuffer$1,Buffer$1);
         TQTXStream.SetPosition$(Self,Buffer$1.length);
      } else {
         if (TQTXStream.GetEOF(Self)) {
            TManagedMemory.Grow(Self.fBuffer$1,Buffer$1.length);
            TManagedMemory.WriteBuffer(Self.fBuffer$1,Offset,Buffer$1);
         } else {
            LSize = TManagedMemory.a$46(Self.fBuffer$1);
            LNewEnd = Offset + Buffer$1.length;
            if (LNewEnd > LSize) {
               TManagedMemory.Grow(Self.fBuffer$1,LNewEnd - LSize);
            }
            TManagedMemory.WriteBuffer(Self.fBuffer$1,Offset,Buffer$1);
         }
         TQTXStream.SetPosition$(Self,Offset + Buffer$1.length);
      }
   }
   ,Destroy$:function($){return $.ClassType.Destroy($)}
   ,Create$4$:function($){return $.ClassType.Create$4($)}
   ,SetEndian:TDataTypeConverter.SetEndian
   ,CalcAdler32$6$:function($){return $.ClassType.CalcAdler32$6($)}
   ,CalcCRC32$6$:function($){return $.ClassType.CalcCRC32$6($)}
   ,GetPosition$1$:function($){return $.ClassType.GetPosition$1($)}
   ,GetSize$1$:function($){return $.ClassType.GetSize$1($)}
   ,Read$1:TQTXStream.Read$1
   ,ReadBuffer$1$:function($){return $.ClassType.ReadBuffer$1.apply($.ClassType, arguments)}
   ,Seek$:function($){return $.ClassType.Seek.apply($.ClassType, arguments)}
   ,SetPosition$:function($){return $.ClassType.SetPosition.apply($.ClassType, arguments)}
   ,SetSize$1$:function($){return $.ClassType.SetSize$1.apply($.ClassType, arguments)}
   ,Write$1:TQTXStream.Write$1
   ,WriteBuffer$1$:function($){return $.ClassType.WriteBuffer$1.apply($.ClassType, arguments)}
   ,SetBuffer$:function($){return $.ClassType.SetBuffer.apply($.ClassType, arguments)}
};
TQTXMemoryStream.$Intf={
   IManagedData:[TQTXStream.ToBytes$1,TQTXStream.FromBytes$3,TQTXMemoryStream.GetSize$1,TQTXMemoryStream.GetPosition$1,TQTXMemoryStream.ReadBuffer$1,TQTXMemoryStream.WriteBuffer$1,TQTXStream.Grow$1,TQTXStream.Shrink$1,TQTXStream.Assign$3,TQTXStream.Append$3,TQTXMemoryStream.CalcCRC32$6,TQTXMemoryStream.CalcAdler32$6]
   ,IAsyncStream:[TQTXStream.ReadA,TQTXStream.WriteA,TQTXStream.GetSizeA,TQTXStream.SetSizeA,TQTXStream.SeekA,TQTXStream.ReadAll,TQTXStream.GetPositionA]
}
/// TQTXLockedObject = class (TObject)
var TQTXLockedObject = {
   $ClassName:"TQTXLockedObject",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.OnObjectUnLocked = null;
      $.OnObjectLocked = null;
      $.fLocked$1 = 0;
   }
   /// procedure TQTXLockedObject.DisableAlteration()
   ,DisableAlteration$1:function(Self) {
      ++Self.fLocked$1;
      if (Self.fLocked$1 == 1) {
         TQTXLockedObject.ObjectLocked$1$(Self);
      }
   }
   /// procedure TQTXLockedObject.EnableAlteration()
   ,EnableAlteration$1:function(Self) {
      if (Self.fLocked$1 > 0) {
         --Self.fLocked$1;
         if (!Self.fLocked$1) {
            TQTXLockedObject.ObjectUnLocked$1$(Self);
         }
      }
   }
   /// function TQTXLockedObject.GetLockState() : Boolean
   ,GetLockState$1:function(Self) {
      var Result = false;
      Result = Self.fLocked$1 > 0;
      return Result
   }
   /// procedure TQTXLockedObject.ObjectLocked()
   ,ObjectLocked$1:function(Self) {
      if (Self.OnObjectLocked) {
         Self.OnObjectLocked(Self);
      }
   }
   /// procedure TQTXLockedObject.ObjectUnLocked()
   ,ObjectUnLocked$1:function(Self) {
      if (Self.OnObjectUnLocked) {
         Self.OnObjectUnLocked(Self);
      }
   }
   ,Destroy:TObject.Destroy
   ,ObjectLocked$1$:function($){return $.ClassType.ObjectLocked$1($)}
   ,ObjectUnLocked$1$:function($){return $.ClassType.ObjectUnLocked$1($)}
};
TQTXLockedObject.$Intf={
   IQTXLockObject:[TQTXLockedObject.DisableAlteration$1,TQTXLockedObject.EnableAlteration$1,TQTXLockedObject.GetLockState$1]
}
/// TQTXJSONObject = class (TObject)
var TQTXJSONObject = {
   $ClassName:"TQTXJSONObject",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.fInstance = undefined;
   }
   /// anonymous TSourceMethodSymbol
   ,a$64:function(Self) {
      var Result = null;
      Result = Self.fInstance;
      return Result
   }
   /// procedure TQTXJSONObject.Add(const AItem: TQTXJSONObject)
   ,Add:function(Self, AItem) {
      if (TVariantHelper$IsArray$1(Self.fInstance)) {
         Self.fInstance.push(AItem.fInstance);
      } else {
         throw Exception.Create($New(EQTXJSONObject),"Cannot add to a JSON structure that is not an array");
      }
   }
   /// function TQTXJSONObject.Branch(const BranchName: String) : TQTXJSONObject
   ,Branch:function(Self, BranchName) {
      var Result = null;
      var lRef;
      if (Self.fInstance.hasOwnProperty(BranchName)) {
         Result = TQTXJSONObject.Create$59($New(TQTXJSONObject),Self.fInstance[BranchName]);
      } else {
         lRef = TVariant.CreateObject(TVariant);
         Self.fInstance[BranchName] = lRef;
         Result = TQTXJSONObject.Create$59($New(TQTXJSONObject),lRef);
      }
      return Result
   }
   /// function TQTXJSONObject.BranchArray(const BranchName: String) : TQTXJSONObject
   ,BranchArray:function(Self, BranchName) {
      var Result = null;
      var lRef;
      if (Self.fInstance.hasOwnProperty(BranchName)) {
         Result = TQTXJSONObject.Create$59($New(TQTXJSONObject),Self.fInstance[BranchName]);
      } else {
         lRef = TVariant.CreateArray(TVariant);
         Self.fInstance[BranchName] = lRef;
         Result = TQTXJSONObject.Create$59($New(TQTXJSONObject),lRef);
      }
      return Result
   }
   /// procedure TQTXJSONObject.Clear()
   ,Clear$1:function(Self) {
      Self.fInstance = TVariant.CreateObject(TVariant);
   }
   /// function TQTXJSONObject.Clone() : TQTXJSONObject
   ,Clone$2:function(Self) {
      var Result = null;
      Result = TQTXJSONObject.Create$58$($New(TQTXJSONObject));
      TQTXJSONObject.FromJSON$1(Result,TQTXJSONObject.ToJSON$1(Self));
      return Result
   }
   /// constructor TQTXJSONObject.Create(const AHandle: THandle)
   ,Create$59:function(Self, AHandle) {
      TObject.Create(Self);
      if (AHandle) {
         if (TVariantHelper$IsObject(AHandle) || TVariantHelper$IsArray$1(AHandle)) {
            Self.fInstance = AHandle;
         } else {
            throw Exception.Create($New(EQTXJSONObject),"Failed to attach to JSON instance, reference is not an object");
         }
      } else {
         throw Exception.Create($New(EQTXJSONObject),"Failed to attach to JSON instance, reference was NIL error");
      }
      return Self
   }
   /// constructor TQTXJSONObject.Create()
   ,Create$58:function(Self) {
      TObject.Create(Self);
      Self.fInstance = TVariant.CreateObject(TVariant);
      return Self
   }
   /// procedure TQTXJSONObject.Delete(const AItemIndex: int32)
   ,Delete$1:function(Self, AItemIndex) {
      if (TVariantHelper$IsArray$1(Self.fInstance)) {
         Self.fInstance.splice(AItemIndex,1);
      } else {
         throw Exception.Create($New(EQTXJSONObject),"Cannot delete from a JSON structure that is not an array");
      }
   }
   /// destructor TQTXJSONObject.Destroy()
   ,Destroy:function(Self) {
      Self.fInstance = null;
      TObject.Destroy(Self);
   }
   /// function TQTXJSONObject.Examine(PropertyName: String) : TQTXPropertyDataType
   ,Examine:function(Self, PropertyName$1) {
      var Result = 0;
      if (Self.fInstance.hasOwnProperty(PropertyName$1)) {
         Result = TQTXJSONDataTypeResolver.QueryDataType(TQTXJSONDataTypeResolver,Self.fInstance[PropertyName$1]);
      } else {
         throw EException.CreateFmt$($New(EQTXJSONObject),"Failed to examine datatype, property [%s] not found error",[PropertyName$1]);
      }
      return Result
   }
   /// function TQTXJSONObject.Exists(PropertyName: String) : Boolean
   ,Exists:function(Self, PropertyName$1) {
      var Result = false;
      if (Self.fInstance) {
         Result = $VarToBool(Self.fInstance.hasOwnProperty(PropertyName$1));
      } else {
         Result = false;
      }
      return Result
   }
   /// function TQTXJSONObject.ForEachField(CB: TQTXJSONEnumerator) : TQTXJSONObject
   ,ForEachField:function(Self, CB) {
      var Result = null;
      var a$267 = 0,
         el$2 = "",
         LData;
      Result = Self;
      if (CB) {
         var a$268 = [];
         a$268 = TQTXJSONObject.GetInstanceKeys(Self);
         var $temp167;
         for(a$267=0,$temp167=a$268.length;a$267<$temp167;a$267++) {
            el$2 = a$268[a$267];
            LData.v = TQTXJSONObject.ReadRaw(Self,el$2);
            if (CB(el$2,LData) == 1) {
               TQTXJSONObject.WriteRaw(Self,el$2,LData.v);
            } else {
               break;
            }
         }
      }
      return Result
   }
   /// procedure TQTXJSONObject.FromBytes(Value: TUInt8Array)
   ,FromBytes$4:function(Self, Value$4) {
      var lText = "";
      lText = TString.DecodeUTF8(TString,Value$4);
      Self.fInstance = JSON.parse(lText);
   }
   /// procedure TQTXJSONObject.FromJSON(Text: String)
   ,FromJSON$1:function(Self, Text$1) {
      Self.fInstance = JSON.parse(Text$1);
   }
   /// function TQTXJSONObject.GetArrayCount() : int32
   ,GetArrayCount:function(Self) {
      var Result = 0;
      if (TVariantHelper$IsArray$1(Self.fInstance)) {
         Result = TVariant.AsInteger(TVariant,Self.fInstance.length);
      } else {
         Result = -1;
      }
      return Result
   }
   /// function TQTXJSONObject.GetChild(Index: int32) : Variant
   ,GetChild:function(Self, Index) {
      var Result = undefined;
      var LRef;
      LRef = Self.fInstance;
      Result = LRef[Index];
      return Result
   }
   /// function TQTXJSONObject.GetInstanceKeys() : TStrArray
   ,GetInstanceKeys:function(Self) {
      var Result = [];
      var LRef;
      LRef = Self.fInstance;
      if (!(Object.keys === undefined)) {
      Result = Object.keys(LRef);
      return Result;
    }

    if (!(Object.getOwnPropertyNames === undefined)) {
        Result = Object.getOwnPropertyNames(LRef);
        return Result;
    }

    for (var _qtxenum in LRef) {
      if ( (LRef).hasOwnProperty(_qtxenum) == true )
        (Result).push(_qtxenum);
    }
    return Result;
      return Result
   }
   /// function TQTXJSONObject.GetIsArray() : Boolean
   ,GetIsArray:function(Self) {
      var Result = false;
      Result = Array.isArray( (Self).fInstance );
      return Result
   }
   /// function TQTXJSONObject.GetPropertyByName(PropertyName: String) : Variant
   ,GetPropertyByName:function(Self, PropertyName$1) {
      var Result = undefined;
      if (Self.fInstance.hasOwnProperty(PropertyName$1)) {
         Result = Self.fInstance[PropertyName$1];
      } else {
         throw EException.CreateFmt$($New(EQTXJSONObject),$R[28],[PropertyName$1]);
      }
      return Result
   }
   /// function TQTXJSONObject.GetPropertyCount() : int32
   ,GetPropertyCount:function(Self) {
      var Result = 0;
      var LRef;
      LRef = Self.fInstance;
      Result = Object.keys(LRef).length;
      return Result
   }
   /// procedure TQTXJSONObject.LoadFromStream(Stream: TQTXStream)
   ,LoadFromStream:function(Self, Stream) {
      var LBytes = [],
         LDecoder = null,
         LText = "";
      LBytes = TQTXStream.Read$1$(Stream,TQTXStream.GetSize$1$(Stream));
      LDecoder = new TextDecoder();
      LText = LDecoder.decode(TDataTypeConverter.BytesToTypedArray(Stream.ClassType,LBytes));
      Self.fInstance = JSON.parse(LText);
   }
   /// function TQTXJSONObject.Locate(const BranchName: String; AllowCreate: Boolean) : TQTXJSONObject
   ,Locate:function(Self, BranchName, AllowCreate) {
      var Result = null;
      var lRef;
      if (Self.fInstance.hasOwnProperty(BranchName)) {
         Result = TQTXJSONObject.Create$59($New(TQTXJSONObject),Self.fInstance[BranchName]);
      } else {
         if (AllowCreate) {
            lRef = TVariant.CreateObject(TVariant);
            Self.fInstance[BranchName] = lRef;
            Result = TQTXJSONObject.Create$59($New(TQTXJSONObject),lRef);
         }
      }
      return Result
   }
   /// function TQTXJSONObject.ReadAny(PropertyName: String) : Variant
   ,ReadAny:function(Self, PropertyName$1) {
      var Result = undefined;
      if (Self.fInstance.hasOwnProperty(PropertyName$1)) {
         Result = Self.fInstance[PropertyName$1];
      } else {
         throw EException.CreateFmt$($New(EQTXJSONObject),$R[28],[PropertyName$1]);
      }
      return Result
   }
   /// function TQTXJSONObject.ReadBoolean(PropertyName: String) : Boolean
   ,ReadBoolean:function(Self, PropertyName$1) {
      var Result = false;
      if (Self.fInstance.hasOwnProperty(PropertyName$1)) {
         Result = TVariant.AsBool(TVariant,Self.fInstance[PropertyName$1]);
      } else {
         throw EException.CreateFmt$($New(EQTXJSONObject),$R[28],[PropertyName$1]);
      }
      return Result
   }
   /// function TQTXJSONObject.ReadDateTime(PropertyName: String) : TDateTime
   ,ReadDateTime$1:function(Self, PropertyName$1) {
      var Result = undefined;
      if (Self.fInstance.hasOwnProperty(PropertyName$1)) {
         Result = TVariant.AsFloat(TVariant,Self.fInstance[PropertyName$1]);
      } else {
         throw EException.CreateFmt$($New(EQTXJSONObject),$R[28],[PropertyName$1]);
      }
      return Result
   }
   /// function TQTXJSONObject.ReadFloat(PropertyName: String) : Float
   ,ReadFloat:function(Self, PropertyName$1) {
      var Result = 0;
      if (Self.fInstance.hasOwnProperty(PropertyName$1)) {
         Result = TVariant.AsFloat(TVariant,Self.fInstance[PropertyName$1]);
      } else {
         throw EException.CreateFmt$($New(EQTXJSONObject),$R[28],[PropertyName$1]);
      }
      return Result
   }
   /// function TQTXJSONObject.ReadInteger(PropertyName: String) : int32
   ,ReadInteger:function(Self, PropertyName$1) {
      var Result = 0;
      if (Self.fInstance.hasOwnProperty(PropertyName$1)) {
         Result = TVariant.AsInteger(TVariant,Self.fInstance[PropertyName$1]);
      } else {
         throw EException.CreateFmt$($New(EQTXJSONObject),$R[28],[PropertyName$1]);
      }
      return Result
   }
   /// function TQTXJSONObject.ReadRaw(PropertyName: String) : Variant
   ,ReadRaw:function(Self, PropertyName$1) {
      var Result = undefined;
      var lConvert = null,
         LText = "",
         LBytes = [];
      if (TQTXJSONObject.Exists(Self,PropertyName$1)) {
         lConvert = TDataTypeConverter.Create$4$($New(TDataTypeConverter));
         try {
            LText = String(Self.fInstance[PropertyName$1]);
            if (LText.length > 0) {
               LBytes = TDataTypeConverter.Base64ToBytes(lConvert.ClassType,LText);
               Result = TDataTypeConverter.BytesToVariant(lConvert,LBytes);
            }
         } finally {
            TObject.Free(lConvert);
         }
      } else {
         throw EException.CreateFmt$($New(EQTXJSONObject),$R[28],[PropertyName$1]);
      }
      return Result
   }
   /// function TQTXJSONObject.ReadString(PropertyName: String) : String
   ,ReadString$1:function(Self, PropertyName$1) {
      var Result = "";
      if (Self.fInstance.hasOwnProperty(PropertyName$1)) {
         Result = TVariant.AsString(TVariant,Self.fInstance[PropertyName$1]);
      } else {
         throw EException.CreateFmt$($New(EQTXJSONObject),$R[28],[PropertyName$1]);
      }
      return Result
   }
   /// procedure TQTXJSONObject.Remove(const PropertyName: String)
   ,Remove:function(Self, PropertyName$1) {
      var LRef;
      if (Self.fInstance.hasOwnProperty(PropertyName$1)) {
         LRef = Self.fInstance;
         delete LRef[PropertyName$1];
      }
   }
   /// procedure TQTXJSONObject.SaveToStream(Stream: TQTXStream)
   ,SaveToStream:function(Self, Stream) {
      var LText = "",
         LEncoder = null,
         LTyped = null;
      LText = JSON.stringify(Self.fInstance);
      LEncoder = new TextEncoder();
      LTyped = LEncoder.encode(LText);
      TQTXStream.Write$1$(Stream,TDataTypeConverter.TypedArrayToBytes(Stream.ClassType,LTyped));
   }
   /// function TQTXJSONObject.ToBytes() : TUInt8Array
   ,ToBytes$2:function(Self) {
      var Result = [];
      var lText = "";
      lText = JSON.stringify(Self.fInstance);
      if (lText.length > 0) {
         Result = TString.EncodeUTF8(TString,lText);
      }
      return Result
   }
   /// function TQTXJSONObject.ToJSON(Indent: int32) : String
   ,ToJSON$3:function(Self, Indent) {
      var Result = "";
      Result = JSON.stringify(Self.fInstance,null,Indent);
      return Result
   }
   /// function TQTXJSONObject.ToJSON(Indent: int32; Replacer: TQTXKeyValueProcessor) : String
   ,ToJSON$2:function(Self, Indent, Replacer) {
      var Result = "";
      Result = JSON.stringify(Self.fInstance,Replacer,Indent);
      return Result
   }
   /// function TQTXJSONObject.ToJSON() : String
   ,ToJSON$1:function(Self) {
      var Result = "";
      Result = JSON.stringify(Self.fInstance,null,4);
      return Result
   }
   /// procedure TQTXJSONObject.WriteAny(PropertyName: String; Data: Variant)
   ,WriteAny:function(Self, PropertyName$1, Data) {
      Self.fInstance[PropertyName$1] = Data;
   }
   /// procedure TQTXJSONObject.WriteBoolean(PropertyName: String; Data: Boolean)
   ,WriteBoolean:function(Self, PropertyName$1, Data) {
      if (Self.fInstance.hasOwnProperty(PropertyName$1)) {
         Self.fInstance[PropertyName$1] = Data;
      } else {
         throw EException.CreateFmt$($New(EQTXJSONObject),$R[27],[PropertyName$1]);
      }
   }
   /// procedure TQTXJSONObject.WriteDateTime(PropertyName: String; Data: TDateTime)
   ,WriteDateTime$1:function(Self, PropertyName$1, Data) {
      if (Self.fInstance.hasOwnProperty(PropertyName$1)) {
         Self.fInstance[PropertyName$1] = Data;
      } else {
         throw EException.CreateFmt$($New(EQTXJSONObject),$R[27],[PropertyName$1]);
      }
   }
   /// procedure TQTXJSONObject.WriteFloat(PropertyName: String; Data: Float)
   ,WriteFloat:function(Self, PropertyName$1, Data) {
      if (Self.fInstance.hasOwnProperty(PropertyName$1)) {
         Self.fInstance[PropertyName$1] = FloatToStr$_Float_(Data);
      } else {
         throw EException.CreateFmt$($New(EQTXJSONObject),$R[27],[PropertyName$1]);
      }
   }
   /// procedure TQTXJSONObject.WriteInteger(PropertyName: String; Data: int32)
   ,WriteInteger:function(Self, PropertyName$1, Data) {
      if (Self.fInstance.hasOwnProperty(PropertyName$1)) {
         Self.fInstance[PropertyName$1] = IntToStr$_Integer_(Data);
      } else {
         throw EException.CreateFmt$($New(EQTXJSONObject),$R[27],[PropertyName$1]);
      }
   }
   /// procedure TQTXJSONObject.WriteOrAdd(PropertyName: String; Data: TQTXJSONObject)
   ,WriteOrAdd$1:function(Self, PropertyName$1, Data) {
      if (!!Data) {
         Self.fInstance[PropertyName$1] = Data.fInstance;
      } else {
         Self.fInstance[PropertyName$1] = TVariant.CreateObject(TVariant);
      }
   }
   /// procedure TQTXJSONObject.WriteOrAdd(PropertyName: String; Data: Variant)
   ,WriteOrAdd:function(Self, PropertyName$1, Data) {
      Self.fInstance[PropertyName$1] = Data;
   }
   /// procedure TQTXJSONObject.WriteRaw(PropertyName: String; Value: Variant)
   ,WriteRaw:function(Self, PropertyName$1, Value$4) {
      var lConvert = null,
         LBytes = [];
      if (Value$4) {
         lConvert = TDataTypeConverter.Create$4$($New(TDataTypeConverter));
         try {
            LBytes = TDataTypeConverter.VariantToBytes(lConvert,Value$4);
            Self.fInstance[PropertyName$1] = TDataTypeConverter.BytesToBase64(lConvert.ClassType,LBytes);
         } finally {
            TObject.Free(lConvert);
         }
      } else {
         Self.fInstance[PropertyName$1] = Value$4;
      }
   }
   /// procedure TQTXJSONObject.WriteString(PropertyName: String; Data: String)
   ,WriteString$1:function(Self, PropertyName$1, Data) {
      if (Self.fInstance.hasOwnProperty(PropertyName$1)) {
         Self.fInstance[PropertyName$1] = Data;
      } else {
         throw EException.CreateFmt$($New(EQTXJSONObject),$R[27],[PropertyName$1]);
      }
   }
   ,Destroy$:function($){return $.ClassType.Destroy($)}
   ,Create$58$:function($){return $.ClassType.Create$58($)}
};
TQTXJSONObject.$Intf={
   IQTXJSONStorage:[TQTXJSONObject.GetPropertyCount,TQTXJSONObject.GetArrayCount,TQTXJSONObject.GetChild,TQTXJSONObject.GetPropertyByName,TQTXJSONObject.GetInstanceKeys,TQTXJSONObject.ForEachField,TQTXJSONObject.Exists,TQTXJSONObject.Examine,TQTXJSONObject.ReadAny,TQTXJSONObject.ReadString$1,TQTXJSONObject.ReadInteger,TQTXJSONObject.ReadBoolean,TQTXJSONObject.ReadDateTime$1,TQTXJSONObject.ReadFloat,TQTXJSONObject.ReadRaw,TQTXJSONObject.WriteRaw,TQTXJSONObject.WriteAny,TQTXJSONObject.WriteOrAdd,TQTXJSONObject.WriteString$1,TQTXJSONObject.WriteInteger,TQTXJSONObject.WriteBoolean,TQTXJSONObject.WriteDateTime$1,TQTXJSONObject.WriteFloat,TQTXJSONObject.Branch,TQTXJSONObject.BranchArray,TQTXJSONObject.Locate,TQTXJSONObject.Remove,TQTXJSONObject.Add,TQTXJSONObject.Delete$1]
}
/// TQTXHandleObject = class (TQTXErrorObject)
var TQTXHandleObject = {
   $ClassName:"TQTXHandleObject",$Parent:TQTXErrorObject
   ,$Init:function ($) {
      TQTXErrorObject.$Init($);
      $.fHandle$1 = undefined;
   }
   /// function TQTXHandleObject.AcceptObjectHandle(const Value: THandle) : Boolean
   ,AcceptObjectHandle:function(Self, Value$4) {
      var Result = false;
      Result = $VarToBool(Value$4);
      return Result
   }
   /// function TQTXHandleObject.GetObjectHandle() : THandle
   ,GetObjectHandle:function(Self) {
      var Result = undefined;
      Result = Self.fHandle$1;
      return Result
   }
   /// procedure TQTXHandleObject.ObjectHandleChanged(const OldHandle: THandle; const NewHandle: THandle)
   ,ObjectHandleChanged:function(Self, OldHandle, NewHandle) {
      /* null */
   }
   /// procedure TQTXHandleObject.SetObjectHandle(const Value: THandle)
   ,SetObjectHandle:function(Self, Value$4) {
      var temp;
      if (Value$4 != Self.fHandle$1) {
         temp = Self.fHandle$1;
         Self.fHandle$1 = Value$4;
         TQTXHandleObject.ObjectHandleChanged$(Self,temp,Self.fHandle$1);
      }
   }
   ,Destroy:TObject.Destroy
   ,ClearLastError:TQTXErrorObject.ClearLastError
   ,Create$45:TQTXErrorObject.Create$45
   ,GetExceptionClass:TQTXErrorObject.GetExceptionClass
   ,InterceptError:TQTXErrorObject.InterceptError
   ,SetErrorOptions:TQTXErrorObject.SetErrorOptions
   ,SetLastError:TQTXErrorObject.SetLastError
   ,SetLastErrorF:TQTXErrorObject.SetLastErrorF
   ,GetObjectHandle$:function($){return $.ClassType.GetObjectHandle($)}
   ,ObjectHandleChanged$:function($){return $.ClassType.ObjectHandleChanged.apply($.ClassType, arguments)}
   ,SetObjectHandle$:function($){return $.ClassType.SetObjectHandle.apply($.ClassType, arguments)}
};
TQTXHandleObject.$Intf={
   IQTXHandleObject:[TQTXHandleObject.SetObjectHandle,TQTXHandleObject.GetObjectHandle,TQTXHandleObject.ObjectHandleChanged,TQTXHandleObject.AcceptObjectHandle]
}
/// TAsyncStream = class (TDataTypeConverter)
var TAsyncStream = {
   $ClassName:"TAsyncStream",$Parent:TDataTypeConverter
   ,$Init:function ($) {
      TDataTypeConverter.$Init($);
   }
   ,Destroy:TDataTypeConverter.Destroy
   ,Create$4:TDataTypeConverter.Create$4
   ,SetEndian:TDataTypeConverter.SetEndian
   ,GetPositionA$1$:function($){return $.ClassType.GetPositionA$1.apply($.ClassType, arguments)}
   ,GetSizeA$1$:function($){return $.ClassType.GetSizeA$1.apply($.ClassType, arguments)}
   ,ReadA$1$:function($){return $.ClassType.ReadA$1.apply($.ClassType, arguments)}
   ,ReadAll$1$:function($){return $.ClassType.ReadAll$1.apply($.ClassType, arguments)}
   ,SeekA$1$:function($){return $.ClassType.SeekA$1.apply($.ClassType, arguments)}
   ,SetSizeA$1$:function($){return $.ClassType.SetSizeA$1.apply($.ClassType, arguments)}
   ,WriteA$1$:function($){return $.ClassType.WriteA$1.apply($.ClassType, arguments)}
};
TAsyncStream.$Intf={
   IAsyncStream:[TAsyncStream.ReadA$1,TAsyncStream.WriteA$1,TAsyncStream.GetSizeA$1,TAsyncStream.SetSizeA$1,TAsyncStream.SeekA$1,TAsyncStream.ReadAll$1,TAsyncStream.GetPositionA$1]
}
/// TAsyncMemoryStream = class (TAsyncStream)
var TAsyncMemoryStream = {
   $ClassName:"TAsyncMemoryStream",$Parent:TAsyncStream
   ,$Init:function ($) {
      TAsyncStream.$Init($);
      $.FBuffer$1 = null;
      $.FPos = 0;
   }
   /// constructor TAsyncMemoryStream.Create()
   ,Create$4:function(Self) {
      TDataTypeConverter.Create$4(Self);
      Self.FBuffer$1 = TDataTypeConverter.Create$4$($New(TManagedMemory));
      Self.FPos = -1;
      return Self
   }
   /// destructor TAsyncMemoryStream.Destroy()
   ,Destroy:function(Self) {
      TObject.Free(Self.FBuffer$1);
      TDataTypeConverter.Destroy(Self);
   }
   /// procedure TAsyncMemoryStream.GetPositionA(TagValue: Variant; CB: TQTXStreamGetPosCB)
   ,GetPositionA$1:function(Self, TagValue, CB) {
      if (CB) {
         CB(TagValue,null,Self.FPos);
      }
   }
   /// procedure TAsyncMemoryStream.GetSizeA(TagValue: Variant; CB: TQTXStreamGetSizeCB)
   ,GetSizeA$1:function(Self, TagValue, CB) {
      if (CB) {
         CB(TagValue,null,TManagedMemory.a$46(Self.FBuffer$1));
      }
   }
   /// procedure TAsyncMemoryStream.ReadA(TagValue: Variant; BytesToRead: int32; CB: TQTXStreamReadCB)
   ,ReadA$1:function(Self, TagValue, BytesToRead, CB) {
      var LData = [],
         LError = null;
      if (TManagedMemory.a$46(Self.FBuffer$1) > 0) {
         if (Self.FPos < 0) {
            Self.FPos = 0;
         }
         try {
            LData = TManagedMemory.ReadBuffer(Self.FBuffer$1,Self.FPos,BytesToRead);
         } catch ($e) {
            var e$1 = $W($e);
            if (CB) {
               CB(TagValue,e$1,LData);
            } else {
               throw $e;
            }
            return;
         }
         (Self.FPos+= LData.length);
         if (CB) {
            CB(TagValue,null,LData);
         }
      } else {
         if (BytesToRead > 0) {
            LError = Exception.Create($New(EException),$R[4]);
            if (CB) {
               CB(TagValue,LError,[]);
            }
         } else {
            if (CB) {
               CB(TagValue,null,[]);
            }
         }
      }
   }
   /// procedure TAsyncMemoryStream.ReadAll(TagValue: Variant; CB: TQTXStreamReadCB)
   ,ReadAll$1:function(Self, TagValue, CB) {
      if (TManagedMemory.a$46(Self.FBuffer$1) > 0) {
         Self.FPos = TManagedMemory.a$46(Self.FBuffer$1);
         if (CB) {
            CB(TagValue,null,TManagedMemory.ToBytes(Self.FBuffer$1));
         }
      } else {
         Self.FPos = -1;
         if (CB) {
            CB(TagValue,null,[]);
         }
      }
   }
   /// procedure TAsyncMemoryStream.SeekA(TagValue: Variant; NewPosition: int64; CB: TQTXStreamSeekCB)
   ,SeekA$1:function(Self, TagValue, NewPosition, CB) {
      var LLastByte = 0,
         LError = null;
      if (TManagedMemory.a$46(Self.FBuffer$1) > 0) {
         LLastByte = TManagedMemory.a$46(Self.FBuffer$1);
         NewPosition = (NewPosition < 0)?0:(NewPosition > LLastByte)?LLastByte:NewPosition;
         Self.FPos = NewPosition;
         if (CB) {
            CB(TagValue,null,Self.FPos);
         }
      } else {
         LError = Exception.Create($New(EException),$R[4]);
         if (CB) {
            CB(TagValue,LError,Self.FPos);
         }
         TObject.Free(LError);
      }
   }
   /// procedure TAsyncMemoryStream.SetSizeA(TagValue: Variant; NewSize: int64; CB: TQTXStreamSetSizeCB)
   ,SetSizeA$1:function(Self, TagValue, NewSize, CB) {
      if (NewSize < 1) {
         TManagedMemory.Release(Self.FBuffer$1);
         Self.FPos = -1;
         if (CB) {
            CB(TagValue,null,0);
         }
         return;
      }
      try {
         TManagedMemory.ScaleTo(Self.FBuffer$1,NewSize);
         if (Self.FPos > TManagedMemory.a$46(Self.FBuffer$1)) {
            Self.FPos = TManagedMemory.a$46(Self.FBuffer$1);
         }
      } catch ($e) {
         var e$1 = $W($e);
         if (CB) {
            CB(TagValue,e$1,TManagedMemory.a$46(Self.FBuffer$1));
         } else {
            throw $e;
         }
         return;
      }
      if (CB) {
         CB(TagValue,null,TManagedMemory.a$46(Self.FBuffer$1));
      }
   }
   /// procedure TAsyncMemoryStream.WriteA(TagValue: Variant; Data: TUInt8Array; CB: TQTXStreamWriteCB)
   ,WriteA$1:function(Self, TagValue, Data, CB) {
      if (Data.length > 0) {
         if (Self.FPos < 0) {
            Self.FPos = 0;
         }
         try {
            TManagedMemory.WriteBuffer(Self.FBuffer$1,Self.FPos,Data);
            (Self.FPos+= Data.length);
         } catch ($e) {
            var e$1 = $W($e);
            if (CB) {
               CB(TagValue,e$1);
            } else {
               throw $e;
            }
            return;
         }
         if (CB) {
            CB(TagValue,null);
         }
      } else if (CB) {
         CB(TagValue,null);
      }
   }
   ,Destroy$:function($){return $.ClassType.Destroy($)}
   ,Create$4$:function($){return $.ClassType.Create$4($)}
   ,SetEndian:TDataTypeConverter.SetEndian
   ,GetPositionA$1$:function($){return $.ClassType.GetPositionA$1.apply($.ClassType, arguments)}
   ,GetSizeA$1$:function($){return $.ClassType.GetSizeA$1.apply($.ClassType, arguments)}
   ,ReadA$1$:function($){return $.ClassType.ReadA$1.apply($.ClassType, arguments)}
   ,ReadAll$1$:function($){return $.ClassType.ReadAll$1.apply($.ClassType, arguments)}
   ,SeekA$1$:function($){return $.ClassType.SeekA$1.apply($.ClassType, arguments)}
   ,SetSizeA$1$:function($){return $.ClassType.SetSizeA$1.apply($.ClassType, arguments)}
   ,WriteA$1$:function($){return $.ClassType.WriteA$1.apply($.ClassType, arguments)}
};
TAsyncMemoryStream.$Intf={
   IAsyncStream:[TAsyncMemoryStream.ReadA$1,TAsyncMemoryStream.WriteA$1,TAsyncMemoryStream.GetSizeA$1,TAsyncMemoryStream.SetSizeA$1,TAsyncMemoryStream.SeekA$1,TAsyncMemoryStream.ReadAll$1,TAsyncMemoryStream.GetPositionA$1]
}
/// EQTXWriterError = class (EQTXException)
var EQTXWriterError = {
   $ClassName:"EQTXWriterError",$Parent:EQTXException
   ,$Init:function ($) {
      EQTXException.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// EQTXReaderError = class (EQTXException)
var EQTXReaderError = {
   $ClassName:"EQTXReaderError",$Parent:EQTXException
   ,$Init:function ($) {
      EQTXException.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// EQTXPersistentError = class (EQTXException)
var EQTXPersistentError = {
   $ClassName:"EQTXPersistentError",$Parent:EQTXException
   ,$Init:function ($) {
      EQTXException.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// EQTXOwnedObject = class (EQTXException)
var EQTXOwnedObject = {
   $ClassName:"EQTXOwnedObject",$Parent:EQTXException
   ,$Init:function ($) {
      EQTXException.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// EQTXLockError = class (EQTXException)
var EQTXLockError = {
   $ClassName:"EQTXLockError",$Parent:EQTXException
   ,$Init:function ($) {
      EQTXException.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// EQTXHandleError = class (EQTXException)
var EQTXHandleError = {
   $ClassName:"EQTXHandleError",$Parent:EQTXException
   ,$Init:function ($) {
      EQTXException.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// TTypedDataFactory = class (TObject)
var TTypedDataFactory = {
   $ClassName:"TTypedDataFactory",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   /// function TTypedDataFactory.AllocUInt08(const DefaultData: TUInt8Array) : JInt32TypedArray
   ,AllocUInt08$1:function(Self, DefaultData) {
      var Result = null;
      if (__SupportCTA) {
         Result = new Uint8ClampedArray(DefaultData);
      } else {
         Result = new Uint8Array(DefaultData);
      }
      return Result
   }
   /// function TTypedDataFactory.AllocUInt08(const Size: int32) : JInt32TypedArray
   ,AllocUInt08:function(Self, Size$4) {
      var Result = null;
      if (__SupportCTA) {
         Result = new Uint8ClampedArray(Size$4);
      } else {
         Result = new Uint8Array(Size$4);
      }
      return Result
   }
   /// function TTypedDataFactory.QuerySystemCTASupport() : Boolean
   ,QuerySystemCTASupport:function() {
      var Result = {v:false};
      try {
         var LTemp = undefined;
         if (__Resolved) {
            Result.v = __SupportCTA;
         } else {
            __Resolved = true;
            try {
               LTemp = new Uint8ClampedArray(10);
            } catch ($e) {
               __SupportCTA = false;
               return false;
            }
            __SupportCTA = true;
            Result.v = __SupportCTA;
         }
      } finally {return Result.v}
   }
   ,Destroy:TObject.Destroy
};
/// TQTXAdler = class (TObject)
var TQTXAdler = {
   $ClassName:"TQTXAdler",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   /// function TQTXAdler.CalcAdler32(const AData: TManagedMemory) : int32
   ,CalcAdler32$4:function(Self, AData) {
      var Result = 0;
      if (!!AData && TManagedMemory.a$46(AData) > 0) {
         Result = TQTXAdler32.CalcAdler32$3(TQTXAdler32,AData.fBuffer);
      }
      return Result
   }
   ,Destroy:TObject.Destroy
};
/// TManagedMemory = class (TDataTypeConverter)
var TManagedMemory = {
   $ClassName:"TManagedMemory",$Parent:TDataTypeConverter
   ,$Init:function ($) {
      TDataTypeConverter.$Init($);
      $.OnMemoryAllocated = null;
      $.OnMemoryReleased = null;
      $.fArray = null;
      $.fBuffer = $.fView = null;
   }
   /// anonymous TSourceMethodSymbol
   ,a$46:function(Self) {
      var Result = 0;
      Result = (!(TManagedMemory.a$42(Self)))?Self.fBuffer.byteLength:0;
      return Result
   }
   /// anonymous TSourceMethodSymbol
   ,a$45:function(Self, Index, Value$4) {
      Self.fArray[Index]=Value$4;
   }
   /// anonymous TSourceMethodSymbol
   ,a$43:function(Self, Index) {
      var Result = 0;
      Result = Self.fArray[Index];
      return Result
   }
   /// anonymous TSourceMethodSymbol
   ,a$42:function(Self) {
      var Result = false;
      Result = !Self.fBuffer;
      return Result
   }
   /// anonymous TSourceMethodSymbol
   ,a$40:function(Self) {
      var Result = undefined;
      Result = Self.fArray;
      return Result
   }
   /// procedure TManagedMemory.AfterAllocate()
   ,AfterAllocate:function(Self) {
      if (Self.OnMemoryAllocated) {
         Self.OnMemoryAllocated(Self);
      }
   }
   /// procedure TManagedMemory.AfterRelease()
   ,AfterRelease:function(Self) {
      if (Self.OnMemoryReleased) {
         Self.OnMemoryReleased(Self);
      }
   }
   /// procedure TManagedMemory.Allocate(BytesToAllocate: int64)
   ,Allocate:function(Self, BytesToAllocate) {
      BytesToAllocate = { v : BytesToAllocate };
      if (!!Self.fBuffer) {
         TManagedMemory.Release(Self);
      }
      if (BytesToAllocate.v > 0) {
         TManagedMemory.BeforeAllocate$(Self,BytesToAllocate);
         try {
            Self.fBuffer = new ArrayBuffer(BytesToAllocate.v);
            Self.fView = new DataView(Self.fBuffer);
            Self.fArray = new Uint8Array(Self.fBuffer);
         } catch ($e) {
            var e$1 = $W($e);
            Self.fBuffer = null;
            Self.fView = null;
            Self.fArray = null;
            throw $e;
         }
         TManagedMemory.AfterAllocate$(Self);
      } else {
         throw Exception.Create($New(EManagedMemory),"Invalid size to allocate, value must be positive");
      }
   }
   /// procedure TManagedMemory.Append(Data: JArrayBuffer)
   ,Append$2:function(Self, Data) {
      var lOffset = 0;
      if (!!Data && Data.byteLength > 0) {
         lOffset = (!!Self.fBuffer)?TManagedMemory.a$46(Self):0;
         TManagedMemory.Grow(Self,Data.byteLength);
         Self.fArray.set(new Uint8Array(Data),lOffset);
      }
   }
   /// procedure TManagedMemory.Append(Data: JTypedArray)
   ,Append$1:function(Self, Data) {
      var lOffset = 0;
      if (!!Data && Data.length > 0) {
         lOffset = (!!Self.fBuffer)?TManagedMemory.a$46(Self):0;
         TManagedMemory.Grow(Self,Data.length);
         Self.fArray.set(Data,lOffset);
      }
   }
   /// procedure TManagedMemory.Append(Data: TUInt8Array)
   ,Append:function(Self, Data) {
      var lOffset = 0;
      if (Data.length > 0) {
         lOffset = (!!Self.fBuffer)?TManagedMemory.a$46(Self):0;
         TManagedMemory.Grow(Self,Data.length);
         TManagedMemory.WriteBuffer(Self,lOffset,Data);
      }
   }
   /// procedure TManagedMemory.Assign(Memory: IManagedData)
   ,Assign$1:function(Self, Memory$1) {
      var LSize = 0;
      if (Memory$1===null) {
         TManagedMemory.Release(Self);
         return;
      }
      LSize = Memory$1[2]();
      if (LSize < 1) {
         TManagedMemory.Release(Self);
         return;
      }
      TManagedMemory.Allocate(Self,LSize);
      Self.fArray.set(Memory$1[0](),0);
   }
   /// procedure TManagedMemory.BeforeAllocate(var NewSize: int32)
   ,BeforeAllocate:function(Self, NewSize) {
      /* null */
   }
   /// procedure TManagedMemory.BeforeRelease()
   ,BeforeRelease:function(Self) {
      /* null */
   }
   /// function TManagedMemory.CalcAdler32() : int32
   ,CalcAdler32$5:function(Self) {
      var Result = 0;
      Result = TQTXAdler.CalcAdler32$4(TQTXAdler,Self);
      return Result
   }
   /// function TManagedMemory.CalcCRC32() : int32
   ,CalcCRC32$5:function(Self) {
      var Result = 0;
      Result = TQTXCRC.CalcCRC32$2(TQTXCRC,Self);
      return Result
   }
   /// function TManagedMemory.Clone() : TManagedMemory
   ,Clone$1:function(Self) {
      var Result = null;
      Result = TDataTypeConverter.Create$4$($New(TManagedMemory));
      if (!(TManagedMemory.a$42(Self))) {
         TManagedMemory.Assign$1(Result,$AsIntf(Self,"IManagedData"));
      }
      return Result
   }
   /// destructor TManagedMemory.Destroy()
   ,Destroy:function(Self) {
      if (!!Self.fBuffer) {
         TManagedMemory.Release(Self);
      }
      TDataTypeConverter.Destroy(Self);
   }
   /// procedure TManagedMemory.FillByte(Offset: int64; ByteLen: int32; Value: byte)
   ,FillByte:function(Self, Offset, ByteLen, Value$4) {
      var LTotalSize = 0;
      if (TManagedMemory.a$42(Self)) {
         throw Exception.Create($New(EManagedMemory),"Memory fill failed, buffer is empty error");
      } else {
         LTotalSize = Self.fBuffer.byteLength;
         if (Offset >= 0 && Offset < LTotalSize) {
            if (Offset + ByteLen > LTotalSize) {
               ByteLen = LTotalSize - Offset;
            }
            (ByteLen+= Offset);
            Self.fArray.fill(TDataTypeConverter.InitUint08(Self.ClassType,Value$4),Offset,ByteLen);
         } else {
            throw Exception.Create($New(EManagedMemory),"Memory fill failed, invalid offset error");
         }
      }
   }
   /// procedure TManagedMemory.FromBase64(const Value: String)
   ,FromBase64:function(Self, Value$4) {
      var lBytes = [];
      if (!(TManagedMemory.a$42(Self))) {
         TManagedMemory.Release(Self);
      }
      lBytes = TDataTypeConverter.Base64ToBytes(TDataTypeConverter,Value$4);
      if (lBytes.length > 0) {
         TManagedMemory.Append(Self,lBytes);
      }
   }
   /// procedure TManagedMemory.FromBytes(Bytes: JUint8Array)
   ,FromBytes$2:function(Self, Bytes) {
      var LLen = 0;
      if (!!Self.fBuffer) {
         TManagedMemory.Release(Self);
      }
      LLen = Bytes.length;
      if (LLen > 0) {
         TManagedMemory.Allocate(Self,LLen);
         (Self.fArray).set(Bytes, 0);
      }
   }
   /// procedure TManagedMemory.FromBytes(Bytes: JUint8ClampedArray)
   ,FromBytes$1:function(Self, Bytes) {
      var LLen = 0;
      if (!!Self.fBuffer) {
         TManagedMemory.Release(Self);
      }
      LLen = Bytes.length;
      if (LLen > 0) {
         TManagedMemory.Allocate(Self,LLen);
         (Self.fArray).set(Bytes, 0);
      }
   }
   /// procedure TManagedMemory.FromBytes(Bytes: TUInt8Array)
   ,FromBytes:function(Self, Bytes) {
      var LLen = 0;
      if (!!Self.fBuffer) {
         TManagedMemory.Release(Self);
      }
      LLen = Bytes.length;
      if (LLen > 0) {
         TManagedMemory.Allocate(Self,LLen);
         (Self.fArray).set(Bytes, 0);
      }
   }
   /// function TManagedMemory.GetPosition() : int64
   ,GetPosition:function(Self) {
      var Result = 0;
      Result = 0;
      return Result
   }
   /// function TManagedMemory.GetSize() : int64
   ,GetSize:function(Self) {
      var Result = 0;
      Result = (!!Self.fBuffer)?Self.fBuffer.byteLength:0;
      return Result
   }
   /// procedure TManagedMemory.Grow(BytesToGrow: int32)
   ,Grow:function(Self, BytesToGrow) {
      var LOldData = [];
      if (BytesToGrow > 0) {
         if (!!Self.fBuffer) {
            LOldData = TManagedMemory.ToBytes(Self);
         }
         TManagedMemory.Allocate(Self,TManagedMemory.a$46(Self) + BytesToGrow);
         if (LOldData.length > 0) {
            TManagedMemory.WriteBuffer(Self,0,LOldData);
         }
      } else {
         throw Exception.Create($New(EManagedMemory),"Invalid growth value, expected 1 or above error");
      }
   }
   /// function TManagedMemory.HexDump(BytesPerRow: int32; Options: THexDumpOptions) : String
   ,HexDump:function(Self, BytesPerRow, Options$1) {
      var Result = "";
      var mDump = [],
         mCount = 0,
         LByte = 0,
         mPad = 0,
         mPad$1 = 0;
      function SliceToText(DataSlice) {
         var Result = "";
         var LChar = "",
            LOff = 0;
         if (DataSlice.length > 0) {
            for(let y$13=0,$temp168=DataSlice.length;y$13<$temp168;y$13++) {
               LChar = TDataTypeConverter.ByteToChar(TDataTypeConverter,DataSlice[y$13]);
               if (((LChar>="A" && LChar<="Z")||(LChar>="a" && LChar<="z")||(LChar>="0" && LChar<="9")||(LChar==",")||(LChar==";")||(LChar=="<")||(LChar==">")||(LChar=="{")||(LChar=="}")||(LChar=="[")||(LChar=="]")||(LChar=="-")||(LChar=="_")||(LChar=="#")||(LChar=="$")||(LChar=="%")||(LChar=="&")||(LChar=="\/")||(LChar=="(")||(LChar==")")||(LChar=="!")||(LChar=="\\")||(LChar=="§")||(LChar=="^")||(LChar==":")||(LChar==",")||(LChar=="?"))) {
                  Result += LChar;
               } else {
                  Result += "_";
               }
            }
         }
         LOff = BytesPerRow - DataSlice.length;
         while (LOff > 0) {
            Result += "_";
            --LOff;
         }
         Result += "\r" + "\n";
         return Result
      }
      if (TManagedMemory.a$40(Self)) {
         mCount = 0;
         BytesPerRow = TInt32.EnsureRange(TInt32,BytesPerRow,2,64);
         for(let x$18=0,$temp169=TManagedMemory.a$46(Self);x$18<$temp169;x$18++) {
            LByte = TManagedMemory.a$43(Self,x$18);
            mDump.push(LByte);
            if ($SetIn(Options$1,0,0,4)) {
               Result += "$";
            }
            Result += AnsiUpperCase(IntToHex(LByte,2));
            ++mCount;
            if (mCount >= BytesPerRow) {
               if ($SetIn(Options$1,1,0,4) && mCount > 0) {
                  Result += " ";
                  mPad = BytesPerRow - mCount;
                  for(let z$13=1,$temp170=mPad;z$13<=$temp170;z$13++) {
                     if ($SetIn(Options$1,0,0,4)) {
                        Result += "$";
                     }
                     Result += "00";
                     ++mCount;
                     if (mCount >= BytesPerRow) {
                        if ($SetIn(Options$1,3,0,4)) {
                           Result += "\r" + "\n";
                        }
                        mCount = 0;
                        break;
                     } else {
                        Result += " ";
                     }
                  }
               }
               if (mDump.length > 0) {
                  if ($SetIn(Options$1,2,0,4)) {
                     Result += SliceToText(mDump);
                  }
                  mDump.length=0;
                  mCount = 0;
               }
            } else {
               Result += " ";
            }
         }
         if (mDump.length > 0) {
            if ($SetIn(Options$1,1,0,4) && mCount > 0) {
               mPad$1 = BytesPerRow - mCount;
               for(let z$14=1,$temp171=mPad$1;z$14<=$temp171;z$14++) {
                  if ($SetIn(Options$1,0,0,4)) {
                     Result += "$";
                  }
                  Result += "00";
                  ++mCount;
                  if (mCount >= BytesPerRow) {
                     if ($SetIn(Options$1,3,0,4)) {
                        Result += "\r" + "\n";
                     }
                     break;
                  } else {
                     Result += " ";
                  }
               }
            }
            if ($SetIn(Options$1,2,0,4)) {
               Result += " " + SliceToText(mDump);
            }
            mCount = 0;
            mDump.length=0;
         }
      }
      return Result
   }
   /// function TManagedMemory.Pop(BlockSize: int32) : TUInt8Array
   ,Pop:function(Self, BlockSize) {
      var Result = [];
      var LTemp = [];
      if (BlockSize > TManagedMemory.a$46(Self)) {
         BlockSize = TManagedMemory.a$46(Self);
      }
      if (BlockSize > 0) {
         Result = TManagedMemory.ReadBuffer(Self,0,BlockSize);
         if (TManagedMemory.a$46(Self) - BlockSize < 1) {
            TManagedMemory.Release(Self);
         } else {
            LTemp = TManagedMemory.ReadBuffer(Self,BlockSize,TManagedMemory.a$46(Self) - BlockSize);
            TManagedMemory.WriteBuffer(Self,0,LTemp);
            TManagedMemory.Shrink(Self,BlockSize);
         }
      }
      return Result
   }
   /// procedure TManagedMemory.Push(Data: TUInt8Array)
   ,Push:function(Self, Data) {
      var LPushSize = 0,
         LOldData = [];
      LPushSize = Data.length;
      if (LPushSize > 0) {
         if (!Self.fBuffer) {
            TManagedMemory.Append(Self,Data);
            return;
         }
         if (!!Self.fBuffer) {
            LOldData = TManagedMemory.ToBytes(Self);
         }
         TManagedMemory.Allocate(Self,TManagedMemory.a$46(Self) + LPushSize);
         TManagedMemory.WriteBuffer(Self,0,Data);
         if (LOldData.length > 0) {
            TManagedMemory.WriteBuffer(Self,LPushSize,LOldData);
         }
      }
   }
   /// function TManagedMemory.ReadBuffer(Offset: int64; ReadLen: int64) : TUInt8Array
   ,ReadBuffer:function(Self, Offset, ReadLen) {
      var Result = [];
      var LTemp = null;
      if (!Self.fBuffer) {
         throw Exception.Create($New(EManagedMemory),"Read failed, buffer is empty error");
      }
      if (ReadLen < 1) {
         return null;
      }
      if (Offset < 0 || Offset >= TManagedMemory.a$46(Self)) {
         throw Exception.Create($New(EManagedMemory),"Invalid offset, expected 0.."+IntToStr$_Integer_(TManagedMemory.a$46(Self) - 1)+" not "+IntToStr$_Integer_(Offset)+" error");
      }
      LTemp = Self.fArray.subarray(Offset,Offset + ReadLen);
      Result = Array.prototype.slice.call(LTemp);
      return Result
   }
   /// procedure TManagedMemory.Release()
   ,Release:function(Self) {
      if (!!Self.fBuffer) {
         try {
            try {
               TManagedMemory.BeforeRelease$(Self);
            } finally {
               Self.fArray = null;
               Self.fView = null;
               Self.fBuffer = null;
            }
         } finally {
            TManagedMemory.AfterRelease$(Self);
         }
      }
   }
   /// procedure TManagedMemory.ScaleTo(NewSize: int64)
   ,ScaleTo:function(Self, NewSize) {
      if (NewSize > 0) {
         if (NewSize != TManagedMemory.a$46(Self)) {
            if (NewSize > TManagedMemory.a$46(Self)) {
               TManagedMemory.Grow(Self,NewSize - TManagedMemory.a$46(Self));
            } else {
               TManagedMemory.Shrink(Self,TManagedMemory.a$46(Self) - NewSize);
            }
         }
      } else {
         TManagedMemory.Release(Self);
      }
   }
   /// procedure TManagedMemory.Shrink(BytesToShrink: int32)
   ,Shrink:function(Self, BytesToShrink) {
      var LNewSize = 0,
         LCache = [];
      if (BytesToShrink > 0) {
         LNewSize = TManagedMemory.a$46(Self) - BytesToShrink;
         if (LNewSize <= 0) {
            TManagedMemory.Release(Self);
            return;
         }
         LCache = TManagedMemory.ReadBuffer(Self,0,LNewSize);
         TManagedMemory.Allocate(Self,LNewSize);
         TManagedMemory.WriteBuffer(Self,0,LCache);
      } else {
         throw Exception.Create($New(EManagedMemory),"Invalid shrink value, expected 1 or above error");
      }
   }
   /// function TManagedMemory.ToBase64() : String
   ,ToBase64:function(Self) {
      var Result = "";
      var lBytes = [];
      lBytes = TManagedMemory.ToBytes(Self);
      Result = TDataTypeConverter.BytesToBase64(TDataTypeConverter,lBytes);
      return Result
   }
   /// function TManagedMemory.ToBytes() : TUInt8Array
   ,ToBytes:function(Self) {
      var Result = [];
      if (!!Self.fBuffer) {
         Result = Array.prototype.slice.call(Self.fArray);
      }
      return Result
   }
   /// procedure TManagedMemory.WriteBuffer(Offset: int64; Data: TUInt8Array)
   ,WriteBuffer:function(Self, Offset, Data) {
      if (!Self.fBuffer) {
         throw Exception.Create($New(EManagedMemory),"Write failed, buffer is empty error");
      }
      if (Data.length < 1) {
         return;
      }
      if (Offset < 0 || Offset >= TManagedMemory.a$46(Self)) {
         throw Exception.Create($New(EManagedMemory),"Invalid offset, expected 0.."+IntToStr$_Integer_(TManagedMemory.a$46(Self) - 1)+" not "+IntToStr$_Integer_(Offset)+" error");
      }
      Self.fArray.set(Data,Offset);
   }
   ,Destroy$:function($){return $.ClassType.Destroy($)}
   ,Create$4:TDataTypeConverter.Create$4
   ,SetEndian:TDataTypeConverter.SetEndian
   ,AfterAllocate$:function($){return $.ClassType.AfterAllocate($)}
   ,AfterRelease$:function($){return $.ClassType.AfterRelease($)}
   ,BeforeAllocate$:function($){return $.ClassType.BeforeAllocate.apply($.ClassType, arguments)}
   ,BeforeRelease$:function($){return $.ClassType.BeforeRelease($)}
   ,GetPosition$:function($){return $.ClassType.GetPosition($)}
   ,GetSize$:function($){return $.ClassType.GetSize($)}
};
TManagedMemory.$Intf={
   IManagedData:[TManagedMemory.ToBytes,TManagedMemory.FromBytes,TManagedMemory.GetSize,TManagedMemory.GetPosition,TManagedMemory.ReadBuffer,TManagedMemory.WriteBuffer,TManagedMemory.Grow,TManagedMemory.Shrink,TManagedMemory.Assign$1,TManagedMemory.Append,TManagedMemory.CalcCRC32$5,TManagedMemory.CalcAdler32$5]
}
/// EManagedMemory = class (Exception)
var EManagedMemory = {
   $ClassName:"EManagedMemory",$Parent:Exception
   ,$Init:function ($) {
      Exception.$Init($);
   }
   ,Destroy:Exception.Destroy
};
/// TQTXComponent = class (TQTXPersistent)
var TQTXComponent = {
   $ClassName:"TQTXComponent",$Parent:TQTXPersistent
   ,$Init:function ($) {
      TQTXPersistent.$Init($);
      $.fDelegates = [];
      $.fHandle = undefined;
      $.fName$1 = "";
   }
   /// anonymous TSourceMethodSymbol
   ,a$51:function(Self) {
      var Result = 0;
      Result = Self.fDelegates.length;
      return Result
   }
   /// anonymous TSourceMethodSymbol
   ,a$50:function(Self, AIndex) {
      var Result = null;
      Result = Self.fDelegates[AIndex];
      return Result
   }
   /// constructor TQTXComponent.Create(AOwner: TQTXComponent; CB: TQTXComponentConstructor)
   ,Create$47:function(Self, AOwner, CB) {
      TQTXOwnedObject.Create$46(Self,AOwner);
      TQTXComponent.SetName$1$(Self,TQTXComponent.GetInstanceName$(Self));
      if (CB) {
         CB(Self);
      }
      return Self
   }
   /// function TQTXComponent.GetHandle() : THandle
   ,GetHandle:function(Self) {
      var Result = undefined;
      Result = Self.fHandle;
      return Result
   }
   /// function TQTXComponent.GetInstanceName() : String
   ,GetInstanceName:function(Self) {
      var Result = "";
      Result = TQTXIdentifiers.MakeUniqueComponentId(TQTXIdentifiers);
      return Result
   }
   /// function TQTXComponent.GetName() : String
   ,GetName:function(Self) {
      var Result = "";
      Result = Self.fName$1;
      return Result
   }
   /// function TQTXComponent.GetOwner() : TQTXComponent
   ,GetOwner$1:function(Self) {
      var Result = null;
      Result = $As(TQTXOwnedObject.GetOwner(Self),TQTXComponent);
      return Result
   }
   /// procedure TQTXComponent.ReadObject(const Source: TQTXJSONObject)
   ,ReadObject:function(Self, Source) {
      TQTXPersistent.ReadObject(Self,Source);
      Self.fName$1 = TQTXJSONObject.ReadString$1(Source,"name");
   }
   /// procedure TQTXComponent.RegisterDelegate(const Delegate: TQTXDelegate)
   ,RegisterDelegate:function(Self, Delegate$1) {
      if (!Delegate$1) {
         throw Exception.Create($New(EQTXDelegateFailedRegister),$R[16]);
      }
      if (Self.fDelegates.indexOf(Delegate$1) < 0) {
         Self.fDelegates.push(Delegate$1);
      }
   }
   /// procedure TQTXComponent.SetHandle(Value: THandle)
   ,SetHandle:function(Self, Value$4) {
      Self.fHandle = Value$4;
   }
   /// procedure TQTXComponent.SetName(Value: String)
   ,SetName$1:function(Self, Value$4) {
      Self.fName$1 = Value$4;
   }
   /// procedure TQTXComponent.SetOwner(NewOwner: TQTXComponent)
   ,SetOwner$1:function(Self, NewOwner) {
      TQTXOwnedObject.SetOwner(Self,NewOwner);
   }
   /// procedure TQTXComponent.UnRegisterDelegate(const Delegate: TQTXDelegate)
   ,UnRegisterDelegate:function(Self, Delegate$1) {
      var lIndex = 0;
      if (!Delegate$1) {
         throw Exception.Create($New(EQTXDelegateFailedRegister),$R[17]);
      }
      lIndex = Self.fDelegates.indexOf(Delegate$1);
      if (lIndex < 0) {
         throw Exception.Create($New(EQTXDelegateFailedRegister),$R[18]);
      }
      Self.fDelegates.splice(lIndex,1)
      ;
   }
   /// procedure TQTXComponent.WriteObject(const Target: TQTXJSONObject)
   ,WriteObject:function(Self, Target) {
      TQTXPersistent.WriteObject(Self,Target);
      TQTXJSONObject.WriteString$1(Target,"name",Self.fName$1);
   }
   ,Destroy:TObject.Destroy
   ,ClearLastError:TQTXErrorObject.ClearLastError
   ,Create$45:TQTXErrorObject.Create$45
   ,GetExceptionClass:TQTXErrorObject.GetExceptionClass
   ,InterceptError:TQTXErrorObject.InterceptError
   ,SetErrorOptions:TQTXErrorObject.SetErrorOptions
   ,SetLastError:TQTXErrorObject.SetLastError
   ,SetLastErrorF:TQTXErrorObject.SetLastErrorF
   ,AcceptOwner:TQTXOwnedObject.AcceptOwner
   ,Create$46:TQTXOwnedObject.Create$46
   ,GetOwner:TQTXOwnedObject.GetOwner
   ,SetOwner:TQTXOwnedObject.SetOwner
   ,Assign$2:TQTXPersistent.Assign$2
   ,FromJSON:TQTXPersistent.FromJSON
   ,FromJSONObject:TQTXPersistent.FromJSONObject
   ,ReadObject$:function($){return $.ClassType.ReadObject.apply($.ClassType, arguments)}
   ,ToJSON:TQTXPersistent.ToJSON
   ,ToJSONObject:TQTXPersistent.ToJSONObject
   ,WriteObject$:function($){return $.ClassType.WriteObject.apply($.ClassType, arguments)}
   ,Create$47$:function($){return $.ClassType.Create$47.apply($.ClassType, arguments)}
   ,GetHandle$:function($){return $.ClassType.GetHandle($)}
   ,GetInstanceName$:function($){return $.ClassType.GetInstanceName($)}
   ,GetName$:function($){return $.ClassType.GetName($)}
   ,GetOwner$1$:function($){return $.ClassType.GetOwner$1($)}
   ,RegisterDelegate$:function($){return $.ClassType.RegisterDelegate.apply($.ClassType, arguments)}
   ,SetHandle$:function($){return $.ClassType.SetHandle.apply($.ClassType, arguments)}
   ,SetName$1$:function($){return $.ClassType.SetName$1.apply($.ClassType, arguments)}
   ,SetOwner$1$:function($){return $.ClassType.SetOwner$1.apply($.ClassType, arguments)}
   ,UnRegisterDelegate$:function($){return $.ClassType.UnRegisterDelegate.apply($.ClassType, arguments)}
};
TQTXComponent.$Intf={
   IQTXDelegateHost:[TQTXComponent.RegisterDelegate,TQTXComponent.UnRegisterDelegate]
   ,IQTXPersistent:[TQTXComponent.ReadObject,TQTXComponent.WriteObject,TQTXPersistent.ToJSON,TQTXPersistent.FromJSON,TQTXPersistent.FromJSONObject]
   ,IQTXOwnedObjectAccess:[TQTXOwnedObject.AcceptOwner,TQTXOwnedObject.SetOwner,TQTXOwnedObject.GetOwner]
}
/// TQTXEventComponent = class (TQTXComponent)
var TQTXEventComponent = {
   $ClassName:"TQTXEventComponent",$Parent:TQTXComponent
   ,$Init:function ($) {
      TQTXComponent.$Init($);
      $.fTarget = null;
   }
   /// constructor TQTXEventComponent.Create(AOwner: TQTXComponent; CB: TQTXEventComponentConstructor)
   ,Create$48:function(Self, AOwner, CB) {
      TQTXComponent.Create$47(Self,AOwner,function (AComponent) {
         Self.fTarget = new EventTarget();
         TQTXComponent.SetHandle$(Self,Self.fTarget);
         if (CB) {
            CB(Self);
         }
      });
      return Self
   }
   /// destructor TQTXEventComponent.Destroy()
   ,Destroy:function(Self) {
      TQTXComponent.SetHandle$(Self,undefined);
      Self.fTarget = null;
      TObject.Destroy(Self);
   }
   /// function TQTXEventComponent.GetEventTarget() : JEventTarget
   ,GetEventTarget:function(Self) {
      var Result = null;
      Result = Self.fTarget;
      return Result
   }
   ,Destroy$:function($){return $.ClassType.Destroy($)}
   ,ClearLastError:TQTXErrorObject.ClearLastError
   ,Create$45:TQTXErrorObject.Create$45
   ,GetExceptionClass:TQTXErrorObject.GetExceptionClass
   ,InterceptError:TQTXErrorObject.InterceptError
   ,SetErrorOptions:TQTXErrorObject.SetErrorOptions
   ,SetLastError:TQTXErrorObject.SetLastError
   ,SetLastErrorF:TQTXErrorObject.SetLastErrorF
   ,AcceptOwner:TQTXOwnedObject.AcceptOwner
   ,Create$46:TQTXOwnedObject.Create$46
   ,GetOwner:TQTXOwnedObject.GetOwner
   ,SetOwner:TQTXOwnedObject.SetOwner
   ,Assign$2:TQTXPersistent.Assign$2
   ,FromJSON:TQTXPersistent.FromJSON
   ,FromJSONObject:TQTXPersistent.FromJSONObject
   ,ReadObject:TQTXComponent.ReadObject
   ,ToJSON:TQTXPersistent.ToJSON
   ,ToJSONObject:TQTXPersistent.ToJSONObject
   ,WriteObject:TQTXComponent.WriteObject
   ,Create$47:TQTXComponent.Create$47
   ,GetHandle:TQTXComponent.GetHandle
   ,GetInstanceName:TQTXComponent.GetInstanceName
   ,GetName:TQTXComponent.GetName
   ,GetOwner$1:TQTXComponent.GetOwner$1
   ,RegisterDelegate:TQTXComponent.RegisterDelegate
   ,SetHandle:TQTXComponent.SetHandle
   ,SetName$1:TQTXComponent.SetName$1
   ,SetOwner$1:TQTXComponent.SetOwner$1
   ,UnRegisterDelegate:TQTXComponent.UnRegisterDelegate
   ,Create$48$:function($){return $.ClassType.Create$48.apply($.ClassType, arguments)}
   ,GetEventTarget$:function($){return $.ClassType.GetEventTarget($)}
};
TQTXEventComponent.$Intf={
   IQTXEventTarget:[TQTXEventComponent.GetEventTarget]
   ,IQTXPersistent:[TQTXComponent.ReadObject,TQTXComponent.WriteObject,TQTXPersistent.ToJSON,TQTXPersistent.FromJSON,TQTXPersistent.FromJSONObject]
   ,IQTXDelegateHost:[TQTXComponent.RegisterDelegate,TQTXComponent.UnRegisterDelegate]
   ,IQTXOwnedObjectAccess:[TQTXOwnedObject.AcceptOwner,TQTXOwnedObject.SetOwner,TQTXOwnedObject.GetOwner]
}
/// TQTXDelegate = class (TQTXOwnedObject)
var TQTXDelegate = {
   $ClassName:"TQTXDelegate",$Parent:TQTXOwnedObject
   ,$Init:function ($) {
      TQTXOwnedObject.$Init($);
      $.OnExecute = null;
      $.fBound = false;
      $.fEventid = "";
      $.fMode = 1;
   }
   /// procedure TQTXDelegate.Bind(EventId: String; Handler: TQTXDelegateHandler)
   ,Bind$1:function(Self, EventId$1, Handler) {
      TQTXDelegate.Bind$(Self,EventId$1);
      Self.OnExecute = Handler;
   }
   /// procedure TQTXDelegate.Bind(EventId: String)
   ,Bind:function(Self, EventId$1) {
      if (Self.fBound) {
         TQTXDelegate.Release$1$(Self);
      }
      EventId$1 = Trim$_String_(EventId$1);
      if (EventId$1.length < 1) {
         throw Exception.Create($New(EQTXDelegateFailedBind),"Failed to bind delegate, invalid identifier");
      }
      TQTXDelegate.SetEventId$(Self,EventId$1);
      try {
         TQTXDelegate.DoBind$(Self);
      } catch ($e) {
         var e$1 = $W($e);
         TQTXDelegate.SetBound$(Self,false);
         throw Exception.Create($New(EQTXDelegateFailedBind),e$1.FMessage);
      }
   }
   /// destructor TQTXDelegate.Destroy()
   ,Destroy:function(Self) {
      if (Self.fBound) {
         TQTXDelegate.Release$1$(Self);
      }
      TObject.Destroy(Self);
   }
   /// procedure TQTXDelegate.DoExecute(Event: JEvent)
   ,DoExecute:function(Self, Event$1) {
      if (Self.OnExecute) {
         Self.OnExecute(Self,Event$1);
      }
   }
   /// procedure TQTXDelegate.Release()
   ,Release$1:function(Self) {
      if (Self.fBound) {
         try {
            try {
               TQTXDelegate.DoRelease$(Self);
            } catch ($e) {
               var e$1 = $W($e);
               throw Exception.Create($New(EQTXDelegateFailedRelease),e$1.FMessage);
            }
         } finally {
            TQTXDelegate.SetBound$(Self,false);
         }
      }
   }
   /// procedure TQTXDelegate.SetBound(const Value: Boolean)
   ,SetBound:function(Self, Value$4) {
      Self.fBound = Value$4;
   }
   /// procedure TQTXDelegate.SetEventId(const Value: String)
   ,SetEventId:function(Self, Value$4) {
      Self.fEventid = Trim$_String_(Value$4);
   }
   /// procedure TQTXDelegate.SetMode(const Value: TQTXEventMode)
   ,SetMode:function(Self, Value$4) {
      Self.fMode = Value$4;
   }
   ,Destroy$:function($){return $.ClassType.Destroy($)}
   ,ClearLastError:TQTXErrorObject.ClearLastError
   ,Create$45:TQTXErrorObject.Create$45
   ,GetExceptionClass:TQTXErrorObject.GetExceptionClass
   ,InterceptError:TQTXErrorObject.InterceptError
   ,SetErrorOptions:TQTXErrorObject.SetErrorOptions
   ,SetLastError:TQTXErrorObject.SetLastError
   ,SetLastErrorF:TQTXErrorObject.SetLastErrorF
   ,AcceptOwner:TQTXOwnedObject.AcceptOwner
   ,Create$46:TQTXOwnedObject.Create$46
   ,GetOwner:TQTXOwnedObject.GetOwner
   ,SetOwner:TQTXOwnedObject.SetOwner
   ,Bind$1$:function($){return $.ClassType.Bind$1.apply($.ClassType, arguments)}
   ,Bind$:function($){return $.ClassType.Bind.apply($.ClassType, arguments)}
   ,DoBind$:function($){return $.ClassType.DoBind($)}
   ,DoExecute$:function($){return $.ClassType.DoExecute.apply($.ClassType, arguments)}
   ,DoRelease$:function($){return $.ClassType.DoRelease($)}
   ,Release$1$:function($){return $.ClassType.Release$1($)}
   ,SetBound$:function($){return $.ClassType.SetBound.apply($.ClassType, arguments)}
   ,SetEventId$:function($){return $.ClassType.SetEventId.apply($.ClassType, arguments)}
   ,SetMode$:function($){return $.ClassType.SetMode.apply($.ClassType, arguments)}
};
TQTXDelegate.$Intf={
   IQTXOwnedObjectAccess:[TQTXOwnedObject.AcceptOwner,TQTXOwnedObject.SetOwner,TQTXOwnedObject.GetOwner]
}
/// TQTXComponentDelegate = class (TQTXDelegate)
var TQTXComponentDelegate = {
   $ClassName:"TQTXComponentDelegate",$Parent:TQTXDelegate
   ,$Init:function ($) {
      TQTXDelegate.$Init($);
      $.FProcRef = null;
   }
   /// procedure TQTXComponentDelegate.Bind()
   ,Bind$2:function(Self) {
      TQTXDelegate.Bind(Self,TQTXComponentDelegate.GetEventName$(Self));
   }
   /// constructor TQTXComponentDelegate.Create(Parent: TQTXComponent)
   ,Create$49:function(Self, Parent) {
      TQTXOwnedObject.Create$46(Self,Parent);
      Self.FProcRef = $Event1(Self,TQTXDelegate.DoExecute$);
      return Self
   }
   /// destructor TQTXComponentDelegate.Destroy()
   ,Destroy:function(Self) {
      TQTXDelegate.DoRelease$(Self);
      TQTXDelegate.Destroy(Self);
   }
   /// procedure TQTXComponentDelegate.DoBind()
   ,DoBind:function(Self) {
      var lOwner = null;
      lOwner = $As(TQTXOwnedObject.GetOwner$(Self),TQTXComponent);
      TQTXComponent.GetHandle$(lOwner).addEventListener(Self.fEventid,Self.FProcRef,(Self.fMode==0));
   }
   /// procedure TQTXComponentDelegate.DoRelease()
   ,DoRelease:function(Self) {
      var lOwner = null;
      lOwner = $As(TQTXOwnedObject.GetOwner$(Self),TQTXComponent);
      TQTXComponent.GetHandle$(lOwner).removeEventListener(Self.fEventid,Self.FProcRef,(Self.fMode==0));
   }
   ,Destroy$:function($){return $.ClassType.Destroy($)}
   ,ClearLastError:TQTXErrorObject.ClearLastError
   ,Create$45:TQTXErrorObject.Create$45
   ,GetExceptionClass:TQTXErrorObject.GetExceptionClass
   ,InterceptError:TQTXErrorObject.InterceptError
   ,SetErrorOptions:TQTXErrorObject.SetErrorOptions
   ,SetLastError:TQTXErrorObject.SetLastError
   ,SetLastErrorF:TQTXErrorObject.SetLastErrorF
   ,AcceptOwner:TQTXOwnedObject.AcceptOwner
   ,Create$46:TQTXOwnedObject.Create$46
   ,GetOwner:TQTXOwnedObject.GetOwner
   ,SetOwner:TQTXOwnedObject.SetOwner
   ,Bind$1:TQTXDelegate.Bind$1
   ,Bind:TQTXDelegate.Bind
   ,DoBind$:function($){return $.ClassType.DoBind($)}
   ,DoExecute:TQTXDelegate.DoExecute
   ,DoRelease$:function($){return $.ClassType.DoRelease($)}
   ,Release$1:TQTXDelegate.Release$1
   ,SetBound:TQTXDelegate.SetBound
   ,SetEventId:TQTXDelegate.SetEventId
   ,SetMode:TQTXDelegate.SetMode
   ,Bind$2$:function($){return $.ClassType.Bind$2($)}
   ,Create$49$:function($){return $.ClassType.Create$49.apply($.ClassType, arguments)}
   ,GetEventName$:function($){return $.ClassType.GetEventName($)}
};
TQTXComponentDelegate.$Intf={
   IQTXOwnedObjectAccess:[TQTXOwnedObject.AcceptOwner,TQTXOwnedObject.SetOwner,TQTXOwnedObject.GetOwner]
}
/// TQTXNamedDelegate = class (TQTXDelegate)
var TQTXNamedDelegate = {
   $ClassName:"TQTXNamedDelegate",$Parent:TQTXDelegate
   ,$Init:function ($) {
      TQTXDelegate.$Init($);
   }
   /// procedure TQTXNamedDelegate.Bind(Handler: TQTXDelegateHandler)
   ,Bind$4:function(Self, Handler) {
      var lTemp = null;
      lTemp = Handler;
      TQTXDelegate.Bind$1(Self,TQTXNamedDelegate.GetEventName$1$(Self),lTemp);
   }
   /// procedure TQTXNamedDelegate.Bind()
   ,Bind$3:function(Self) {
      TQTXDelegate.Bind(Self,TQTXNamedDelegate.GetEventName$1$(Self));
   }
   /// procedure TQTXNamedDelegate.DoExecute(Event: JEvent)
   ,DoExecute:function(Self, Event$1) {
      if (Self.OnExecute) {
         Self.OnExecute(Self,Event$1);
      }
   }
   ,Destroy:TQTXDelegate.Destroy
   ,ClearLastError:TQTXErrorObject.ClearLastError
   ,Create$45:TQTXErrorObject.Create$45
   ,GetExceptionClass:TQTXErrorObject.GetExceptionClass
   ,InterceptError:TQTXErrorObject.InterceptError
   ,SetErrorOptions:TQTXErrorObject.SetErrorOptions
   ,SetLastError:TQTXErrorObject.SetLastError
   ,SetLastErrorF:TQTXErrorObject.SetLastErrorF
   ,AcceptOwner:TQTXOwnedObject.AcceptOwner
   ,Create$46:TQTXOwnedObject.Create$46
   ,GetOwner:TQTXOwnedObject.GetOwner
   ,SetOwner:TQTXOwnedObject.SetOwner
   ,Bind$1:TQTXDelegate.Bind$1
   ,Bind:TQTXDelegate.Bind
   ,DoBind:TQTXDelegate.DoBind
   ,DoExecute$:function($){return $.ClassType.DoExecute.apply($.ClassType, arguments)}
   ,DoRelease:TQTXDelegate.DoRelease
   ,Release$1:TQTXDelegate.Release$1
   ,SetBound:TQTXDelegate.SetBound
   ,SetEventId:TQTXDelegate.SetEventId
   ,SetMode:TQTXDelegate.SetMode
   ,Bind$4$:function($){return $.ClassType.Bind$4.apply($.ClassType, arguments)}
   ,Bind$3$:function($){return $.ClassType.Bind$3($)}
   ,GetEventName$1$:function($){return $.ClassType.GetEventName$1($)}
};
TQTXNamedDelegate.$Intf={
   IQTXOwnedObjectAccess:[TQTXOwnedObject.AcceptOwner,TQTXOwnedObject.SetOwner,TQTXOwnedObject.GetOwner]
}
/// TQTXEventMode enumeration
var TQTXEventMode = [ "dmCapture", "dmBubble" ];
/// TQTXEvent = class (TObject)
var TQTXEvent = {
   $ClassName:"TQTXEvent",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
      $.fEvent = null;
      $.fId = "";
      $.fOptions = [0];
   }
   /// function TQTXEvent.BuildEventObject() : JEvent
   ,BuildEventObject:function(Self) {
      var Result = null;
      var lInit = null;
      lInit = new JEventInitB();
      lInit.bubbles = $SetIn(Self.fOptions,0,0,3);
      lInit.cancelable = $SetIn(Self.fOptions,1,0,3);
      lInit.composed = $SetIn(Self.fOptions,2,0,3);
      Result = new Event(Self.fId,lInit);
      return Result
   }
   /// constructor TQTXEvent.Create(EventId: String; EventOptions: TQTXEventOptions)
   ,Create$50:function(Self, EventId$1, EventOptions) {
      TObject.Create(Self);
      Self.fId = EventId$1;
      Self.fOptions = EventOptions.slice(0);
      Self.fEvent = TQTXEvent.BuildEventObject$(Self);
      return Self
   }
   /// destructor TQTXEvent.Destroy()
   ,Destroy:function(Self) {
      Self.fEvent = null;
      TObject.Destroy(Self);
   }
   /// procedure TQTXEvent.Dispatch(const Target: JEventTarget)
   ,Dispatch:function(Self, Target) {
      Target.dispatchEvent(Self.fEvent);
   }
   ,Destroy$:function($){return $.ClassType.Destroy($)}
   ,BuildEventObject$:function($){return $.ClassType.BuildEventObject($)}
   ,Create$50$:function($){return $.ClassType.Create$50.apply($.ClassType, arguments)}
   ,Dispatch$:function($){return $.ClassType.Dispatch.apply($.ClassType, arguments)}
};
/// TQTXCustomEvent = class (TQTXEvent)
var TQTXCustomEvent = {
   $ClassName:"TQTXCustomEvent",$Parent:TQTXEvent
   ,$Init:function ($) {
      TQTXEvent.$Init($);
      $.fDetail = undefined;
   }
   /// function TQTXCustomEvent.BuildEventObject() : JEvent
   ,BuildEventObject:function(Self) {
      var Result = null;
      Result = null;
      return Result
   }
   /// function TQTXCustomEvent.BuildEventObject2() : JEvent
   ,BuildEventObject2:function(Self) {
      var Result = null;
      Result = new CustomEvent(Self.fId,{
         "detail" : Self.fDetail
         ,"composed" : $SetIn(Self.fOptions,2,0,3)
         ,"cancelable" : $SetIn(Self.fOptions,1,0,3)
         ,"bubbles" : $SetIn(Self.fOptions,0,0,3)
      });
      return Result
   }
   /// constructor TQTXCustomEvent.Create(EventId: String; EventOptions: TQTXEventOptions; Detail: Variant)
   ,Create$51:function(Self, EventId$1, EventOptions, Detail) {
      TQTXEvent.Create$50(Self,EventId$1,EventOptions.slice(0));
      Self.fDetail = Detail;
      Self.fEvent = TQTXCustomEvent.BuildEventObject2$(Self);
      return Self
   }
   ,Destroy:TQTXEvent.Destroy
   ,BuildEventObject$:function($){return $.ClassType.BuildEventObject($)}
   ,Create$50:TQTXEvent.Create$50
   ,Dispatch:TQTXEvent.Dispatch
   ,BuildEventObject2$:function($){return $.ClassType.BuildEventObject2($)}
   ,Create$51$:function($){return $.ClassType.Create$51.apply($.ClassType, arguments)}
};
/// RegisterDelegate = class (TCustomAttribute)
var RegisterDelegate$1 = {
   $ClassName:"RegisterDelegate",$Parent:TCustomAttribute
   ,$Init:function ($) {
      TCustomAttribute.$Init($);
      $.Description = "";
   }
   /// constructor RegisterDelegate.Create(Info: String)
   ,Create$52:function(Self, Info$3) {
      TObject.Create(Self);
      Self.Description = Info$3;
      return Self
   }
   ,Destroy:TObject.Destroy
   ,Create$52$:function($){return $.ClassType.Create$52.apply($.ClassType, arguments)}
};
/// JEventInitB = class (JObject)
function JEventInitB() {
}
$Extend(Object,JEventInitB,
   {
      "bubbles" : false,
      "cancelable" : false,
      "composed" : false
   });

/// EQTXDelegate = class (EException)
var EQTXDelegate = {
   $ClassName:"EQTXDelegate",$Parent:EException
   ,$Init:function ($) {
      EException.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// EQTXDelegateFailedRelease = class (EQTXDelegate)
var EQTXDelegateFailedRelease = {
   $ClassName:"EQTXDelegateFailedRelease",$Parent:EQTXDelegate
   ,$Init:function ($) {
      EQTXDelegate.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// EQTXDelegateFailedRegister = class (EQTXDelegate)
var EQTXDelegateFailedRegister = {
   $ClassName:"EQTXDelegateFailedRegister",$Parent:EQTXDelegate
   ,$Init:function ($) {
      EQTXDelegate.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// EQTXDelegateFailedBind = class (EQTXDelegate)
var EQTXDelegateFailedBind = {
   $ClassName:"EQTXDelegateFailedBind",$Parent:EQTXDelegate
   ,$Init:function ($) {
      EQTXDelegate.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
/// BindDelegates = class (TCustomAttribute)
var BindDelegates = {
   $ClassName:"BindDelegates",$Parent:TCustomAttribute
   ,$Init:function ($) {
      TCustomAttribute.$Init($);
      $.DelegateClasses = [];
   }
   /// constructor BindDelegates.Create(Delegates: TQTXDelegateClassArray)
   ,Create$65:function(Self, Delegates$1) {
      TObject.Create(Self);
      Self.DelegateClasses = Delegates$1;
      return Self
   }
   ,Destroy:TObject.Destroy
   ,Create$65$:function($){return $.ClassType.Create$65.apply($.ClassType, arguments)}
};
/// TQTXCodecUTF8 = class (TQTXCodec)
var TQTXCodecUTF8 = {
   $ClassName:"TQTXCodecUTF8",$Parent:TQTXCodec
   ,$Init:function ($) {
      TQTXCodec.$Init($);
      $.EncodeBOM = false;
   }
   /// function TQTXCodecUTF8.CanUseClampedArray() : Boolean
   ,CanUseClampedArray:function(Self) {
      var Result = {v:false};
      try {
         var LTemp = undefined;
         try {
            LTemp = new Uint8ClampedArray(10);
         } catch ($e) {
            var e$1 = $W($e);
            return Result.v;
         }
         if (LTemp) {
            Result.v = true;
         }
      } finally {return Result.v}
   }
   /// function TQTXCodecUTF8.CanUseNativeConverter() : Boolean
   ,CanUseNativeConverter:function(Self) {
      var Result = {v:false};
      try {
         var LTemp = null;
         try {
            LTemp = new TextEncoder("utf8");
         } catch ($e) {
            var e$1 = $W($e);
            return false;
         }
         Result.v = !!LTemp;
      } finally {return Result.v}
   }
   /// function TQTXCodecUTF8.Decode(const BytesToDecode: TUInt8Array) : String
   ,Decode:function(Self, BytesToDecode) {
      var Result = "";
      var LDecoder = null,
         LTyped,
         i$6 = 0,
         bytelen = 0,
         c$7 = 0,
         c2 = 0,
         c2$1 = 0,
         c3 = 0,
         c4 = 0,
         u$3 = 0,
         c2$2 = 0,
         c3$1 = 0;
      if (BytesToDecode.length < 1) {
         return "";
      }
      if (TQTXCodecUTF8.CanUseNativeConverter(Self.ClassType)) {
         LDecoder = new TextDecoder("utf8");
         LTyped = TDataTypeConverter.BytesToTypedArray(Self.ClassType,BytesToDecode);
         Result = LDecoder.decode(LTyped);
         LTyped = null;
         LDecoder = null;
      } else {
         i$6 = 0;
         bytelen = BytesToDecode.length;
         if (bytelen > 2) {
            if (TQTXByteOrderMarkUTF8.CheckUTF8(TQTXByteOrderMarkUTF8,BytesToDecode)) {
               (i$6+= 3);
            }
         }
         while (i$6 < bytelen) {
            c$7 = BytesToDecode[i$6];
            ++i$6;
            if (c$7 < 128) {
               Result += TString.FromCharCode(TString,c$7);
            } else if (c$7 > 191 && c$7 < 224) {
               c2 = BytesToDecode[i$6];
               ++i$6;
               Result += TString.FromCharCode(TString,((c$7&31)<<6)|(c2&63));
            } else if (c$7 > 239 && c$7 < 365) {
               c2$1 = BytesToDecode[i$6];
               ++i$6;
               c3 = BytesToDecode[i$6];
               ++i$6;
               c4 = BytesToDecode[i$6];
               ++i$6;
               u$3 = (((((c$7&7)<<18)|((c2$1&63)<<12))|((c3&63)<<6))|(c4&63)) - 65536;
               Result += TString.FromCharCode(TString,55296 + (u$3>>>10));
               Result += TString.FromCharCode(TString,56320 + (u$3&1023));
            } else {
               c2$2 = BytesToDecode[i$6];
               ++i$6;
               c3$1 = BytesToDecode[i$6];
               ++i$6;
               Result += TString.FromCharCode(TString,((c$7&15)<<12)|(((c2$2&63)<<6)|(c3$1&63)));
            }
         }
      }
      return Result
   }
   /// procedure TQTXCodecUTF8.DecodeData(const Source: IManagedData; const Target: IManagedData)
   ,DecodeData:function(Self, Source, Target) {
      /* null */
   }
   /// function TQTXCodecUTF8.Encode(TextToEncode: String) : TUInt8Array
   ,Encode:function(Self, TextToEncode) {
      var Result = [];
      var LEncoder = null,
         LTyped = null,
         LClip = null,
         LTemp = null;
      if (TextToEncode.length < 1) {
         return null;
      }
      if (TQTXCodecUTF8.CanUseNativeConverter(Self.ClassType)) {
         LEncoder = new TextEncoder("utf8");
         LTyped = LEncoder.encode(TextToEncode);
         Result = TDataTypeConverter.TypedArrayToBytes(Self.ClassType,LTyped);
         LEncoder = null;
         LTyped = null;
      } else {
         if (TQTXCodecUTF8.CanUseClampedArray(Self.ClassType)) {
            LClip = new Uint8ClampedArray(1);
            LTemp = new Uint8ClampedArray(1);
         } else {
            LClip = new Uint8Array(1);
            LTemp = new Uint8Array(1);
         }
         if (Self.EncodeBOM) {
            switch (TDataTypeConverter.SystemEndian(TDataTypeConverter)) {
               case 1 :
                  Result.push([239, 187, 191]);
                  break;
               case 2 :
                  Result.push([187, 239, 191]);
                  break;
            }
         }
         for(let n$7=1,$temp172=TextToEncode.length;n$7<=$temp172;n$7++) {
            LClip[0]=TString.CharCodeFor(TString,TextToEncode.charAt(n$7-1));
            if (LClip[0] < 128) {
               Result.push(LClip[0]);
            } else if (LClip[0] > 127 && LClip[0] < 2048) {
               LTemp[0]=((LClip[0]>>>6)|192);
               Result.push(LTemp[0]);
               LTemp[0]=((LClip[0]&63)|128);
               Result.push(LTemp[0]);
            } else {
               LTemp[0]=((LClip[0]>>>12)|224);
               Result.push(LTemp[0]);
               LTemp[0]=(((LClip[0]>>>6)&63)|128);
               Result.push(LTemp[0]);
               Result.push((LClip[0]&63)|128);
               Result.push(LTemp[0]);
            }
         }
      }
      return Result
   }
   /// procedure TQTXCodecUTF8.EncodeData(const Source: IManagedData; const Target: IManagedData)
   ,EncodeData:function(Self, Source, Target) {
      /* null */
   }
   /// function TQTXCodecUTF8.MakeCodecInfo() : TQTXCodecInfo
   ,MakeCodecInfo:function(Self) {
      var Result = null;
      var LVersion = {viMajor:0,viMinor:0,viRevision:0},
         LAccess = null;
      Result = TObject.Create($New(TQTXCodecInfo));
      LVersion = Create$43(0,2,0);
      LAccess = $AsIntf(Result,"ICodecInfo");
      LAccess[0]("UTF8Codec");
      LAccess[1]("application\/utf8");
      LAccess[2](LVersion);
      LAccess[3]([0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]);
      LAccess[5](1);
      LAccess[6](0);
      return Result
   }
   ,Destroy:TQTXCodec.Destroy
   ,Create$4:TQTXCodec.Create$4
   ,SetEndian:TDataTypeConverter.SetEndian
   ,DecodeData$:function($){return $.ClassType.DecodeData.apply($.ClassType, arguments)}
   ,EncodeData$:function($){return $.ClassType.EncodeData.apply($.ClassType, arguments)}
   ,MakeCodecInfo$:function($){return $.ClassType.MakeCodecInfo($)}
   ,Decode$:function($){return $.ClassType.Decode.apply($.ClassType, arguments)}
   ,Encode$:function($){return $.ClassType.Encode.apply($.ClassType, arguments)}
};
TQTXCodecUTF8.$Intf={
   IQTXCodecProcess:[TQTXCodecUTF8.EncodeData,TQTXCodecUTF8.DecodeData]
   ,IQTXCodecBinding:[TQTXCodec.RegisterBinding,TQTXCodec.UnRegisterBinding]
}
/// TQTXByteOrderMarkUTF8 = class (TObject)
var TQTXByteOrderMarkUTF8 = {
   $ClassName:"TQTXByteOrderMarkUTF8",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   /// function TQTXByteOrderMarkUTF8.CheckBOM(const Bytes: TUInt8Array) : TQTXBomTypeUTF
   ,CheckBOM:function(Self, Bytes) {
      var Result = 0;
      if (TQTXByteOrderMarkUTF8.CheckUTF8(Self,Bytes)) {
         Result = 1;
      } else if (TQTXByteOrderMarkUTF8.CheckUTF16(Self,Bytes)) {
         Result = 2;
      } else if (TQTXByteOrderMarkUTF8.CheckUTF32(Self,Bytes)) {
         Result = 3;
      } else {
         Result = 0;
      }
      return Result
   }
   /// function TQTXByteOrderMarkUTF8.CheckUTF16(const Bytes: TUInt8Array) : Boolean
   ,CheckUTF16:function(Self, Bytes) {
      var Result = false;
      if (Bytes.length >= 2) {
         switch (TDataTypeConverter.SystemEndian(TDataTypeConverter)) {
            case 1 :
               Result = Bytes[0] == 239 && Bytes[1] == 187 && Bytes[2] == 191;
               break;
            case 2 :
               Result = Bytes[0] == 191 && Bytes[1] == 187 && Bytes[2] == 239;
               break;
         }
      }
      return Result
   }
   /// function TQTXByteOrderMarkUTF8.CheckUTF32(const Bytes: TUInt8Array) : Boolean
   ,CheckUTF32:function(Self, Bytes) {
      var Result = false;
      if (Bytes.length >= 4) {
         switch (TDataTypeConverter.SystemEndian(TDataTypeConverter)) {
            case 1 :
               Result = (Bytes[0]==0) && (Bytes[1]==0) && Bytes[2] == 254 && Bytes[3] == 255;
               break;
            case 2 :
               Result = (Bytes[0]==0) && (Bytes[1]==0) && Bytes[2] == 255 && Bytes[3] == 254;
               break;
         }
      }
      return Result
   }
   /// function TQTXByteOrderMarkUTF8.CheckUTF8(const Bytes: TUInt8Array) : Boolean
   ,CheckUTF8:function(Self, Bytes) {
      var Result = false;
      if (Bytes.length >= 3) {
         switch (TDataTypeConverter.SystemEndian(TDataTypeConverter)) {
            case 1 :
               Result = Bytes[0] == 254 && Bytes[1] == 255;
               break;
            case 2 :
               Result = Bytes[0] == 255 && Bytes[1] == 254;
               break;
         }
      }
      return Result
   }
   /// function TQTXByteOrderMarkUTF8.GetUTF16BOM() : TUInt8Array
   ,GetUTF16BOM:function(Self) {
      var Result = [];
      Result = [254, 255];
      return Result
   }
   /// function TQTXByteOrderMarkUTF8.GetUTF32BOM() : TUInt8Array
   ,GetUTF32BOM:function(Self) {
      var Result = [];
      Result = [0, 0, 254, 255];
      return Result
   }
   /// function TQTXByteOrderMarkUTF8.GetUTF8BOM() : TUInt8Array
   ,GetUTF8BOM:function(Self) {
      var Result = [];
      Result = [239, 187, 191];
      return Result
   }
   /// function TQTXByteOrderMarkUTF8.StripBOM(const Bytes: TUInt8Array) : TUInt8Array
   ,StripBOM:function(Self, Bytes) {
      var Result = [];
      Result = Bytes;
      if (TQTXByteOrderMarkUTF8.CheckUTF8(Self,Bytes)) {
         Result.splice(0,3)
         ;
      } else if (TQTXByteOrderMarkUTF8.CheckUTF16(Self,Bytes)) {
         Result.splice(0,2)
         ;
      } else if (TQTXByteOrderMarkUTF8.CheckUTF32(Self,Bytes)) {
         Result.splice(0,4)
         ;
      }
      return Result
   }
   ,Destroy:TObject.Destroy
};
/// TQTXBomTypeUTF enumeration
var TQTXBomTypeUTF = [ "bomNone", "bomUTF8", "bomUTF16", "bomUTF32" ];
/// TQTXPropertyDataType enumeration
var TQTXPropertyDataType = [ "qdtInvalid", "qdtBoolean", "qdtinteger", "qdtfloat", "qdtstring", "qdtSymbol", "qdtFunction", "qdtObject", "qdtArray", "qdtVariant" ];
/// function TQTXJSONHelper.SafeStringify(value: Variant) : String
function SafeStringify(Self$31, value$4) {
   var Result = "";
   Result = JSON.stringify(value$4,function (Key$1, Value$4) {
      var Result = undefined;
      if (AnsiLowerCase(typeof Value$4) == "bigint") {
         Result = Value$4.toString();
      } else {
         Result = Value$4;
      }
      return Result
   });
   return Result
}
/// TQTXJSONDataTypeResolver = class (TObject)
var TQTXJSONDataTypeResolver = {
   $ClassName:"TQTXJSONDataTypeResolver",$Parent:TObject
   ,$Init:function ($) {
      TObject.$Init($);
   }
   /// function TQTXJSONDataTypeResolver.QueryArray(el: THandle) : Boolean
   ,QueryArray:function(Self, el$2) {
      var Result = false;
      Result = (el$2 !== undefined)
      && (el$2 !== null)
      && (Array.isArray(el$2) === true);
      return Result
   }
   /// function TQTXJSONDataTypeResolver.QueryBoolean(el: THandle) : Boolean
   ,QueryBoolean:function(Self, el$2) {
      var Result = false;
      Result = (el$2 !== undefined)
      && (el$2 !== null)
      && (typeof el$2 === "boolean");
      return Result
   }
   /// function TQTXJSONDataTypeResolver.QueryDataType(el: THandle) : TQTXPropertyDataType
   ,QueryDataType:function(Self, el$2) {
      var Result = 0;
      var LType$1 = "";
      if (el$2) {
         LType$1 = typeof(el$2);
         {var $temp173 = AnsiLowerCase(LType$1);
            if ($temp173=="object") {
               if (!el$2.length) {
                  Result = 7;
               } else {
                  Result = 8;
               }
            }
             else if ($temp173=="function") {
               Result = 6;
            }
             else if ($temp173=="symbol") {
               Result = 5;
            }
             else if ($temp173=="boolean") {
               Result = 1;
            }
             else if ($temp173=="string") {
               Result = 4;
            }
             else if ($temp173=="number") {
               if (Round(Number(el$2)) != el$2) {
                  Result = 3;
               } else {
                  Result = 2;
               }
            }
             else if ($temp173=="array") {
               Result = 8;
            }
             else {
               Result = 9;
            }
         }
      } else {
         Result = 0;
      }
      return Result
   }
   /// function TQTXJSONDataTypeResolver.Queryfloat(el: THandle) : Boolean
   ,Queryfloat:function(Self, el$2) {
      var Result = false;
      Result = (el$2 !== undefined)
      && (el$2 !== null)
      && (typeof el$2  === "number")
      && (Number(el$2) === el$2 && el$2 % 1 !== 0);
      return Result
   }
   /// function TQTXJSONDataTypeResolver.QueryFunction(el: THandle) : Boolean
   ,QueryFunction:function(Self, el$2) {
      var Result = false;
      Result = (el$2 !== undefined)
      && (el$2 !== null)
      && (typeof el$2 === "function");
      return Result
   }
   /// function TQTXJSONDataTypeResolver.Queryinteger(el: THandle) : Boolean
   ,Queryinteger:function(Self, el$2) {
      var Result = false;
      Result = (el$2 !== undefined)
      && (el$2 !== null)
      && (typeof el$2  === "number")
      && (Number(el$2) === el$2 && el$2 % 1 === 0);
      return Result
   }
   /// function TQTXJSONDataTypeResolver.QueryObject(el: THandle) : Boolean
   ,QueryObject:function(Self, el$2) {
      var Result = false;
      Result = (el$2 !== undefined)
      && (el$2 !== null)
      && (typeof el$2  === "object")
      && ((el$2).length === undefined);
      return Result
   }
   /// function TQTXJSONDataTypeResolver.Querystring(el: THandle) : Boolean
   ,Querystring:function(Self, el$2) {
      var Result = false;
      Result = (el$2 !== undefined)
      && (el$2 !== null)
      && (typeof el$2  === "string");
      return Result
   }
   /// function TQTXJSONDataTypeResolver.QuerySymbol(el: THandle) : Boolean
   ,QuerySymbol:function(Self, el$2) {
      var Result = false;
      Result = (el$2 !== undefined)
      && (el$2 !== null)
      && (typeof el$2 === "symbol");
      return Result
   }
   /// function TQTXJSONDataTypeResolver.QueryUInt8Array(el: THandle) : Boolean
   ,QueryUInt8Array:function(Self, el$2) {
      var Result = false;
      var LTypeName = "";
      if (el$2) {
         LTypeName = "";
         LTypeName = Object.prototype.toString.call(el$2);
         Result = LTypeName == "[object Uint8Array]";
      }
      return Result
   }
   ,Destroy:TObject.Destroy
};
/// EQTXJSONObject = class (EException)
var EQTXJSONObject = {
   $ClassName:"EQTXJSONObject",$Parent:EException
   ,$Init:function ($) {
      EException.$Init($);
   }
   ,Destroy:Exception.Destroy
   ,CreateFmt:EException.CreateFmt
};
var CRC_Table_Ready = false,
   CRC_Table = (function(){var a=[],i=0;while(i++<513)a.push(0);return a})(),
   Counter = 0,
   courseLength = 0,
   PRESET_LOW = null,
   PRESET_MEDIUM = null,
   PRESET_HIGH = null,
   TRACKS = [],
   TRACK_ID = "",
   TRACK = null,
   SHARED = null,
   AO_GEO = null,
   SKIER_TYPES = [],
   RIVAL_DEFS = [],
   __Resolved = false,
   __SupportCTA = false,
   _NameId = 0,
   DaysInMonthTable = [[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0]],
   __TYPE_MAP = {Boolean:undefined,Function$1:undefined,Number$1:undefined,Object$2:undefined,String$1:undefined,Undefined:undefined},
   __SIZES = [0,0,0,0,0,0,0,0,0,0,0],
   _NAMES = ["","","","","","","","","","",""];
var DaysInMonthTable = [[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]];
var __SIZES = [0, 1, 1, 2, 2, 4, 2, 4, 4, 8, 8];
var _NAMES = ["Unknown", "Boolean", "Byte", "Char", "Word", "Longword", "Smallint", "int32", "Single", "Double", "String"];
var _eul = null,
   _rm = null,
   CHORDS = [],
   PHRASE = [],
   a$104 = 0,
   row$1 = "",
   _ikD = null,
   _ikB = null,
   _pvF = null,
   _pvR = null,
   _pvHd = null,
   _pvX = null,
   _pvPiv = null,
   _pvM = null,
   _pvQe = null,
   _pvFq = null,
   RAG_LINKS = [],
   _sd1 = null,
   _sd2 = null,
   _sr = null,
   _sc1 = null,
   _sc2 = null,
   TCourseRef = null,
   TResortRef = null,
   installPrompt = undefined,
   __Manager = null,
   __B64_Lookup = (function(){var a=[],i=0;while(i++<257)a.push("");return a})(),
   __B64_RevLookup = (function(){var a=[],i=0;while(i++<257)a.push(0);return a})(),
   __CNT_B64_CHARSET = "";
var __CNT_B64_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+\/";
__TYPE_MAP.Boolean = typeof(true);
__TYPE_MAP.Number$1 = typeof(0);
__TYPE_MAP.String$1 = typeof("");
__TYPE_MAP.Object$2 = typeof(TVariant.CreateObject(TVariant));
__TYPE_MAP.Undefined = typeof(undefined);
__TYPE_MAP.Function$1 = typeof(function () {
   /* null */
});
if (!Uint8Array.prototype.fill) {
      Uint8Array.prototype.fill = Array.prototype.fill;
    }
;
TQTXCodecManager.RegisterCodec(CodecManager(),TBase64Codec);
TQTXCodecManager.RegisterCodec(CodecManager(),TQTXCodecUTF8);
var PRESET_LOW = MkPreset("low",1,1024,false,false,false,70,7,1500,false);
var PRESET_MEDIUM = MkPreset("medium",1.25,1536,true,false,true,120,9,2500,true);
var PRESET_HIGH = MkPreset("high",1.5,2048,true,true,true,175,11,4000,true);
InitTracks();
ReadTrackId();
var courseLength = TRACK.len;
var RAG_LINKS = [0, 1, 1, 2, 2, 3, 3, 4, 2, 4, 1, 4, 1, 5, 1, 8, 5, 8, 5, 6, 6, 7, 8, 9, 9, 10, 0, 11, 0, 14, 11, 14, 11, 12, 12, 13, 14, 15, 15, 16, 13, 16, 5, 11, 8, 14, 5, 14, 8, 11, 0, 3, 11, 16, 14, 13];
var CHORDS = [MkChord("i",0,[0, 3, 7]), MkChord("III",3,[0, 4, 7]), MkChord("iv",5,[0, 3, 7]), MkChord("V",7,[0, 4, 7]), MkChord("VI",8,[0, 4, 7]), MkChord("VII",10,[0, 4, 7])];
var a$105 = ["i,i,VI", "VI,iv,III", "III,VII,iv", "VII,V,VII", "i,VI,iv", "iv,VI,III", "VI,iv,VII", "V,VII,V"];
for(a$104=0;a$104<=7;a$104++) {
   row$1 = a$105[a$104];
   PHRASE.push(StrSplit(row$1,","));
}
;
var SKIER_TYPES = [MkType("Anfaenger",0.33,4.5,7,2.5,4.5,0.16,0.26,true,0.3,0.05,0.028,[16765503, 16736162, 10215773]), MkType("Geniesser",0.42,9,13,5,9,0.11,0.19,false,0.22,0.012,0.02,[4052688, 8086015, 16053492, 2003199]), MkType("Kurzschw.",0.25,11,15,1,1.8,0.75,0.95,false,0.34,0.006,0.01,[15087942, 1120295, 16747546])];
var RIVAL_DEFS = [MkRival("Mia",24.5,-0.38,1.7,TRiderColors.Create$148($New(TRiderColors),3066993,1777450,1118481,15856630)), MkRival("Tom",27.5,0.34,4.2,TRiderColors.Create$148($New(TRiderColors),8086015,3817291,16766474,1118481))];
var main = function() {
   StartCarveLine()}
