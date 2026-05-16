import { useState, useMemo } from "react";
import { ReadoutValue } from "@/components/ui/ReadoutValue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { windTriangle, findWind, normalizeHeading } from "@/lib/aviation-calc";

function safeNum(v: string): number | null {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

export function WindTriangle() {
  const [mode, setMode] = useState<"find-heading" | "find-wind">("find-heading");

  const [tc, setTc] = useState("");
  const [tas, setTas] = useState("");
  const [wd, setWd] = useState("");
  const [ws, setWs] = useState("");

  const [th, setTh] = useState("");
  const [tasFW, setTasFW] = useState("");
  const [tcFW, setTcFW] = useState("");
  const [gsFW, setGsFW] = useState("");

  const result = useMemo(() => {
    const tcN = safeNum(tc);
    const tasN = safeNum(tas);
    const wdN = safeNum(wd);
    const wsN = safeNum(ws);
    if (tcN === null || tasN === null || wdN === null || wsN === null) return null;
    if (tasN <= 0 || wsN < 0) return null;
    try {
      return windTriangle(tcN, tasN, wdN, wsN);
    } catch {
      return null;
    }
  }, [tc, tas, wd, ws]);

  const windResult = useMemo(() => {
    const thN = safeNum(th);
    const tasN = safeNum(tasFW);
    const tcN = safeNum(tcFW);
    const gsN = safeNum(gsFW);
    if (thN === null || tasN === null || tcN === null || gsN === null) return null;
    if (tasN <= 0 || gsN <= 0) return null;
    try {
      return findWind(thN, tasN, tcN, gsN);
    } catch {
      return null;
    }
  }, [th, tasFW, tcFW, gsFW]);

  return (
    <div className="p-5">
      <div className="flex gap-2 mb-6">
        <button
          data-testid="mode-find-heading"
          onClick={() => setMode("find-heading")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
            mode === "find-heading"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Find Heading &amp; GS
        </button>
        <button
          data-testid="mode-find-wind"
          onClick={() => setMode("find-wind")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
            mode === "find-wind"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Find Wind
        </button>
      </div>

      {mode === "find-heading" ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="tc">True Course</Label>
              <div className="relative">
                <Input id="tc" data-testid="input-true-course" placeholder="0–360" value={tc} onChange={(e) => setTc(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">°</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tas">TAS</Label>
              <div className="relative">
                <Input id="tas" data-testid="input-tas" placeholder="knots" value={tas} onChange={(e) => setTas(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">kt</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wd">Wind Direction</Label>
              <div className="relative">
                <Input id="wd" data-testid="input-wind-dir" placeholder="FROM 0–360" value={wd} onChange={(e) => setWd(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">°</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ws">Wind Speed</Label>
              <div className="relative">
                <Input id="ws" data-testid="input-wind-speed" placeholder="knots" value={ws} onChange={(e) => setWs(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">kt</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <ReadoutValue
              data-testid="result-true-heading"
              label="True Heading"
              value={result ? result.trueHeading.toFixed(1) : "—"}
              unit="°"
              tooltip="The heading you must fly to track your desired true course"
            />
            <ReadoutValue
              data-testid="result-ground-speed"
              label="Ground Speed"
              value={result ? result.groundSpeed.toFixed(1) : "—"}
              unit="kt"
              accent={result && result.groundSpeed < 0 ? "destructive" : "primary"}
              tooltip="Actual speed over the ground"
            />
            <ReadoutValue
              data-testid="result-wca"
              label="Wind Correction"
              value={result ? (result.windCorrectionAngle > 0 ? "+" : "") + result.windCorrectionAngle.toFixed(1) : "—"}
              unit="°"
              accent="accent"
              tooltip="Wind Correction Angle — positive means correction to the right"
            />
            <ReadoutValue
              data-testid="result-headwind"
              label="Headwind"
              value={result ? result.headwindComponent.toFixed(1) : "—"}
              unit="kt"
              accent={result && result.headwindComponent < 0 ? "accent" : "muted"}
              tooltip="Headwind component (negative = tailwind)"
            />
            <ReadoutValue
              data-testid="result-crosswind"
              label="Crosswind"
              value={result ? result.crosswindComponent.toFixed(1) : "—"}
              unit="kt"
              accent="muted"
              tooltip="Crosswind component (positive = from right)"
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="th-fw">True Heading</Label>
              <div className="relative">
                <Input id="th-fw" data-testid="input-fw-true-heading" placeholder="0–360" value={th} onChange={(e) => setTh(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">°</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tas-fw">TAS</Label>
              <div className="relative">
                <Input id="tas-fw" data-testid="input-fw-tas" placeholder="knots" value={tasFW} onChange={(e) => setTasFW(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">kt</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tc-fw">True Course</Label>
              <div className="relative">
                <Input id="tc-fw" data-testid="input-fw-true-course" placeholder="0–360" value={tcFW} onChange={(e) => setTcFW(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">°</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gs-fw">Ground Speed</Label>
              <div className="relative">
                <Input id="gs-fw" data-testid="input-fw-gs" placeholder="knots" value={gsFW} onChange={(e) => setGsFW(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">kt</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <ReadoutValue
              data-testid="result-wind-dir"
              label="Wind Direction"
              value={windResult ? windResult.windDirection.toFixed(1) : "—"}
              unit="°"
              tooltip="Wind direction in degrees true (FROM)"
            />
            <ReadoutValue
              data-testid="result-wind-speed"
              label="Wind Speed"
              value={windResult ? windResult.windSpeed.toFixed(1) : "—"}
              unit="kt"
              tooltip="Wind speed in knots"
            />
          </div>
        </>
      )}
    </div>
  );
}
