import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  ktToMph, mphToKt, ktToKmh, kmhToKt, ktToMs, msToKt, ktToFps, fpsToKt,
  mphToKmh, kmhToMph, fpmToMs, msToFpm, fpmToFps, fpsToFpm,
  nmToSm, smToNm, nmToKm, kmToNm, nmToFt, ftToNm, smToKm, kmToSm, nmToM, mToNm,
  ftToM, mToFt,
  cToF, fToC, cToK, kToC, fToK, kToF,
  inHgToHpa, hpaToInhg, mbToInhg, inHgToMb, kpaToInhg, inHgToKpa,
  lbsToKg, kgToLbs, lbsToOz, ozToLbs, kgToG, gToKg, ozToG, gToOz,
  galToL, lToGal, usGalToImpGal, impGalToUsGal, galToQt, qtToGal, lToMl, mlToL,
  gradPctToDeg, gradDegToPct, ftPerNmToPct, pctToFtPerNm,
  degToRad, radToDeg,
} from "@/lib/aviation-calc";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ConvRowProps {
  label: string;
  unitA: string;
  unitB: string;
  unitC?: string;
  toB: (a: number) => number;
  toA: (b: number) => number;
  toC?: (a: number) => number;
  fromC?: (c: number) => number;
  testId: string;
}

// ─── Bidirectional conversion row ───────────────────────────────────────────────
function ConvRow({ label, unitA, unitB, unitC, toB, toA, toC, fromC, testId }: ConvRowProps) {
  const [aVal, setAVal] = useState("");
  const [bVal, setBVal] = useState("");
  const [cVal, setCVal] = useState("");

  const round4 = (n: number) => String(Math.round(n * 10000) / 10000);

  const handleA = (v: string) => {
    setAVal(v);
    const n = parseFloat(v);
    if (!isNaN(n)) { setBVal(round4(toB(n))); if (toC) setCVal(round4(toC(n))); }
    else            { setBVal(""); if (toC) setCVal(""); }
  };

  const handleB = (v: string) => {
    setBVal(v);
    const n = parseFloat(v);
    if (!isNaN(n)) {
      const a = toA(n);
      setAVal(round4(a));
      if (toC) setCVal(round4(toC(a)));
    } else { setAVal(""); if (toC) setCVal(""); }
  };

  const handleC = (v: string) => {
    if (!fromC || !toC) return;
    setCVal(v);
    const n = parseFloat(v);
    if (!isNaN(n)) {
      const a = fromC(n);
      setAVal(round4(a));
      setBVal(round4(toB(a)));
    } else { setAVal(""); setBVal(""); }
  };

  const inputCls = "h-8 text-sm text-right bg-background";
  const unitCls  = "text-[11px] font-mono text-muted-foreground w-14 shrink-0";

  return (
    <div className="flex items-center gap-2 py-2 border-b border-border/40 last:border-b-0">
      <span className="w-24 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0">{label}</span>
      <div className="flex-1 flex items-center gap-1.5 flex-wrap">
        <div className="flex items-center gap-1 min-w-[100px]">
          <Input data-testid={`conv-a-${testId}`} value={aVal} onChange={(e) => handleA(e.target.value)} placeholder="0" className={inputCls + " w-20"} />
          <span className={unitCls}>{unitA}</span>
        </div>
        <span className="text-muted-foreground text-xs">=</span>
        <div className="flex items-center gap-1 min-w-[100px]">
          <Input data-testid={`conv-b-${testId}`} value={bVal} onChange={(e) => handleB(e.target.value)} placeholder="0" className={inputCls + " w-20"} />
          <span className={unitCls}>{unitB}</span>
        </div>
        {unitC && toC && fromC && (
          <>
            <span className="text-muted-foreground text-xs">=</span>
            <div className="flex items-center gap-1 min-w-[100px]">
              <Input data-testid={`conv-c-${testId}`} value={cVal} onChange={(e) => handleC(e.target.value)} placeholder="0" className={inputCls + " w-20"} />
              <span className={unitCls}>{unitC}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function Section({ label }: { label: string }) {
  return <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1.5 mt-4 first:mt-1 border-b border-primary/20 pb-0.5">{label}</div>;
}

// ─── Category tabs ────────────────────────────────────────────────────────────
type Cat = "speed" | "distance" | "alt" | "temp" | "pressure" | "weight" | "volume" | "gradient" | "angle";

const CATS: { id: Cat; label: string }[] = [
  { id: "speed",    label: "Speed"    },
  { id: "distance", label: "Distance" },
  { id: "alt",      label: "Altitude" },
  { id: "temp",     label: "Temp"     },
  { id: "pressure", label: "Pressure" },
  { id: "weight",   label: "Weight"   },
  { id: "volume",   label: "Volume"   },
  { id: "gradient", label: "Gradient" },
  { id: "angle",    label: "Angle"    },
];

export function Conversions() {
  const [cat, setCat] = useState<Cat>("speed");

  return (
    <div className="p-4">
      {/* Category selector */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {CATS.map((c) => (
          <button
            key={c.id}
            data-testid={`conv-cat-${c.id}`}
            onClick={() => setCat(c.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
              cat === c.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="space-y-0">

        {/* ── SPEED ── */}
        {cat === "speed" && (
          <>
            <Section label="Airspeed" />
            <ConvRow label="kt ↔ mph"  unitA="kt"  unitB="mph"  unitC="km/h" toB={ktToMph}  toA={mphToKt}  toC={ktToKmh} fromC={kmhToKt} testId="kt-mph" />
            <ConvRow label="kt ↔ m/s"  unitA="kt"  unitB="m/s"  toB={ktToMs}  toA={msToKt}  testId="kt-ms" />
            <ConvRow label="kt ↔ ft/s" unitA="kt"  unitB="ft/s" toB={ktToFps} toA={fpsToKt} testId="kt-fps" />
            <ConvRow label="mph ↔ km/h" unitA="mph" unitB="km/h" toB={mphToKmh} toA={kmhToMph} testId="mph-kmh" />
            <Section label="Vertical Speed" />
            <ConvRow label="fpm ↔ m/s"  unitA="fpm" unitB="m/s"  toB={fpmToMs}  toA={msToFpm}  testId="fpm-ms" />
            <ConvRow label="fpm ↔ ft/s" unitA="fpm" unitB="ft/s" toB={fpmToFps} toA={fpsToFpm} testId="fpm-fps" />
          </>
        )}

        {/* ── DISTANCE ── */}
        {cat === "distance" && (
          <>
            <Section label="Navigation Distance" />
            <ConvRow label="nm ↔ sm"  unitA="nm" unitB="sm" unitC="km" toB={nmToSm} toA={smToNm} toC={nmToKm} fromC={kmToNm} testId="nm-sm" />
            <ConvRow label="nm ↔ ft"  unitA="nm" unitB="ft"            toB={nmToFt} toA={ftToNm} testId="nm-ft" />
            <ConvRow label="nm ↔ m"   unitA="nm" unitB="m"             toB={nmToM}  toA={mToNm}  testId="nm-m" />
            <Section label="Land Distance" />
            <ConvRow label="sm ↔ km"  unitA="sm" unitB="km" toB={smToKm} toA={kmToSm} testId="sm-km" />
            <Section label="Short Distance" />
            <ConvRow label="ft ↔ m"   unitA="ft" unitB="m"  toB={ftToM}  toA={mToFt}  testId="ft-m" />
          </>
        )}

        {/* ── ALTITUDE ── */}
        {cat === "alt" && (
          <>
            <Section label="Altitude" />
            <ConvRow label="ft ↔ m"   unitA="ft" unitB="m"   toB={ftToM}  toA={mToFt}  testId="alt-ft-m" />
            <ConvRow label="ft ↔ nm"  unitA="ft" unitB="nm"  toB={ftToNm} toA={nmToFt} testId="alt-ft-nm" />
          </>
        )}

        {/* ── TEMPERATURE ── */}
        {cat === "temp" && (
          <>
            <Section label="Temperature" />
            <ConvRow label="°C ↔ °F" unitA="°C" unitB="°F" toB={cToF} toA={fToC} testId="c-f" />
            <ConvRow label="°C ↔ K"  unitA="°C" unitB="K"  toB={cToK} toA={kToC} testId="c-k" />
            <ConvRow label="°F ↔ K"  unitA="°F" unitB="K"  toB={fToK} toA={kToF} testId="f-k" />
          </>
        )}

        {/* ── PRESSURE ── */}
        {cat === "pressure" && (
          <>
            <Section label="Altimeter / Barometric Pressure" />
            <ConvRow label="inHg ↔ hPa" unitA="inHg" unitB="hPa"   toB={inHgToHpa} toA={hpaToInhg} testId="inhg-hpa" />
            <ConvRow label="inHg ↔ mb"  unitA="inHg" unitB="mb"    toB={inHgToMb}  toA={mbToInhg}  testId="inhg-mb" />
            <ConvRow label="inHg ↔ kPa" unitA="inHg" unitB="kPa"   toB={inHgToKpa} toA={kpaToInhg} testId="inhg-kpa" />
          </>
        )}

        {/* ── WEIGHT ── */}
        {cat === "weight" && (
          <>
            <Section label="Gross Weight" />
            <ConvRow label="lbs ↔ kg" unitA="lbs" unitB="kg" toB={lbsToKg} toA={kgToLbs} testId="lbs-kg" />
            <Section label="Small Weight" />
            <ConvRow label="lbs ↔ oz" unitA="lbs" unitB="oz" toB={lbsToOz}  toA={ozToLbs}  testId="lbs-oz" />
            <ConvRow label="kg ↔ g"   unitA="kg"  unitB="g"  toB={kgToG}   toA={gToKg}   testId="kg-g" />
            <ConvRow label="oz ↔ g"   unitA="oz"  unitB="g"  toB={ozToG}   toA={gToOz}   testId="oz-g" />
          </>
        )}

        {/* ── VOLUME ── */}
        {cat === "volume" && (
          <>
            <Section label="Fuel Volume" />
            <ConvRow label="US gal ↔ L"    unitA="US gal" unitB="L"        toB={galToL}        toA={lToGal}        testId="gal-l" />
            <ConvRow label="US ↔ Imp gal"  unitA="US gal" unitB="Imp gal"  toB={usGalToImpGal} toA={impGalToUsGal} testId="usgal-impgal" />
            <Section label="Smaller Volume" />
            <ConvRow label="gal ↔ qt"  unitA="US gal" unitB="qt"   toB={galToQt} toA={qtToGal} testId="gal-qt" />
            <ConvRow label="L ↔ mL"    unitA="L"      unitB="mL"   toB={lToMl}   toA={mlToL}   testId="l-ml" />
          </>
        )}

        {/* ── GRADIENT ── */}
        {cat === "gradient" && (
          <>
            <Section label="Climb / Descent Gradient" />
            <ConvRow label="% ↔ °"        unitA="%"     unitB="°"      toB={gradPctToDeg} toA={gradDegToPct} testId="pct-deg" />
            <ConvRow label="% ↔ ft/nm"    unitA="%"     unitB="ft/nm"  toB={pctToFtPerNm} toA={ftPerNmToPct} testId="pct-ftnm" />
          </>
        )}

        {/* ── ANGLE ── */}
        {cat === "angle" && (
          <>
            <Section label="Angle" />
            <ConvRow label="° ↔ rad" unitA="°" unitB="rad" toB={degToRad} toA={radToDeg} testId="deg-rad" />
          </>
        )}
      </div>
    </div>
  );
}
