import { useState, useMemo } from "react";
import { ReadoutValue } from "@/components/ui/ReadoutValue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  pressureAltitude,
  densityAltitudeFull,
  trueAltitude,
  isaDeviation,
  fToC,
} from "@/lib/aviation-calc";

function safeNum(v: string): number | null {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

export function AltitudeCalc() {
  const [indAlt, setIndAlt] = useState("");
  const [altimeter, setAltimeter] = useState("29.92");
  const [oat, setOat] = useState("");
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");

  const results = useMemo(() => {
    const ia = safeNum(indAlt);
    const alt = safeNum(altimeter);
    if (ia === null || alt === null) return null;

    const pa = pressureAltitude(ia, alt);

    let da: number | null = null;
    let ta: number | null = null;
    let isaDev: number | null = null;
    const oatN = safeNum(oat);

    if (oatN !== null) {
      const oatC = tempUnit === "F" ? fToC(oatN) : oatN;
      const daResult = densityAltitudeFull(ia, alt, oatC);
      da = daResult.densityAlt;
      ta = trueAltitude(ia, alt, oatC);
      isaDev = isaDeviation(pa, oatC);
    }

    return { pa: Math.round(pa), da, ta, isaDev };
  }, [indAlt, altimeter, oat, tempUnit]);

  const isaColor: "accent" | "destructive" | "muted" =
    !results || results.isaDev === null ? "muted"
    : results.isaDev > 0 ? "destructive"
    : results.isaDev < 0 ? "accent"
    : "muted";

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="space-y-1.5">
          <Label htmlFor="ind-alt">Indicated Altitude</Label>
          <div className="relative">
            <Input
              id="ind-alt"
              data-testid="input-indicated-alt"
              placeholder="feet"
              value={indAlt}
              onChange={(e) => setIndAlt(e.target.value)}
              className="pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">ft</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="altimeter">Altimeter Setting</Label>
          <div className="relative">
            <Input
              id="altimeter"
              data-testid="input-altimeter"
              placeholder="29.92"
              value={altimeter}
              onChange={(e) => setAltimeter(e.target.value)}
              className="pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">inHg</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oat-alt">OAT <span className="text-muted-foreground text-xs">(for DA &amp; TA)</span></Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="oat-alt"
                data-testid="input-oat-alt"
                placeholder="optional"
                value={oat}
                onChange={(e) => setOat(e.target.value)}
                className="pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">°{tempUnit}</span>
            </div>
            <button
              data-testid="toggle-temp-unit-alt"
              onClick={() => setTempUnit((u) => (u === "C" ? "F" : "C"))}
              className="px-3 py-2 rounded-lg border border-border text-sm font-mono font-bold text-primary hover:bg-muted transition-colors min-w-[50px]"
            >
              °{tempUnit}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReadoutValue
          data-testid="result-pressure-alt"
          label="Pressure Altitude"
          value={results ? results.pa.toLocaleString() : "—"}
          unit="ft"
          tooltip="Pressure Altitude = Indicated Altitude + (29.92 - Altimeter) × 1000"
        />
        <ReadoutValue
          data-testid="result-density-alt"
          label="Density Altitude"
          value={results?.da != null ? results.da.toLocaleString() : "—"}
          unit="ft"
          accent={results?.da != null && results.da > (safeNum(indAlt) ?? 0) + 1000 ? "destructive" : "accent"}
          tooltip="Density Altitude accounts for non-standard temperature. High DA reduces aircraft performance."
        />
        <ReadoutValue
          data-testid="result-true-alt"
          label="True Altitude"
          value={results?.ta != null ? results.ta.toLocaleString() : "—"}
          unit="ft"
          accent="muted"
          tooltip="True Altitude = actual height above mean sea level"
        />
        <ReadoutValue
          data-testid="result-isa-dev-alt"
          label="ISA Deviation"
          value={
            results?.isaDev != null
              ? (results.isaDev > 0 ? "+" : "") + results.isaDev.toFixed(1)
              : "—"
          }
          unit="°C"
          accent={isaColor}
          tooltip="Deviation from ISA standard temperature at this pressure altitude"
        />
      </div>

      <div className="mt-4 p-3 bg-muted/40 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground font-mono leading-relaxed">
          <span className="text-foreground/70">PA</span> = Indicated Alt + (29.92 − Altimeter) × 1000 ft&nbsp;&nbsp;|&nbsp;&nbsp;
          <span className="text-foreground/70">DA</span> = PA + 118.8 × (OAT − ISA_Temp)&nbsp;&nbsp;|&nbsp;&nbsp;
          <span className="text-foreground/70">ISA</span> = 15°C − PA × 0.001981
        </p>
      </div>
    </div>
  );
}
