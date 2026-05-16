import { useState, useMemo } from "react";
import { ReadoutValue } from "@/components/ui/ReadoutValue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { runwayWindComponents } from "@/lib/aviation-calc";

function safeNum(v: string): number | null {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

const CROSSWIND_LIMITS = [5, 10, 15, 20, 25, 30];

export function WindComponents() {
  const [windDir, setWindDir] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [runway, setRunway] = useState("");
  const [maxXwind, setMaxXwind] = useState("15");

  const results = useMemo(() => {
    const wdN = safeNum(windDir);
    const wsN = safeNum(windSpeed);
    const rwN = safeNum(runway);
    if (wdN === null || wsN === null || rwN === null) return null;
    const rwyHeading = rwN <= 36 ? rwN * 10 : rwN;
    return runwayWindComponents(wdN, wsN, rwyHeading);
  }, [windDir, windSpeed, runway]);

  const maxXW = safeNum(maxXwind) ?? 15;
  const xwindExceeded = results !== null && results.crosswind > maxXW;
  const xwindPct = results !== null ? Math.min((results.crosswind / maxXW) * 100, 100) : 0;

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="space-y-1.5">
          <Label htmlFor="wind-dir-xw">Wind Direction</Label>
          <div className="relative">
            <Input
              id="wind-dir-xw"
              data-testid="input-wind-dir-xw"
              placeholder="magnetic FROM"
              value={windDir}
              onChange={(e) => setWindDir(e.target.value)}
              className="pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">°M</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wind-speed-xw">Wind Speed</Label>
          <div className="relative">
            <Input
              id="wind-speed-xw"
              data-testid="input-wind-speed-xw"
              placeholder="knots"
              value={windSpeed}
              onChange={(e) => setWindSpeed(e.target.value)}
              className="pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">kt</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="runway-xw">Runway <span className="text-muted-foreground text-xs">(number or °M)</span></Label>
          <div className="relative">
            <Input
              id="runway-xw"
              data-testid="input-runway"
              placeholder="e.g. 27 or 270"
              value={runway}
              onChange={(e) => setRunway(e.target.value)}
              className="pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">°M</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <ReadoutValue
          data-testid="result-headwind-comp"
          label={results && results.headwind < 0 ? "Tailwind" : "Headwind"}
          value={results ? Math.abs(results.headwind).toFixed(1) : "—"}
          unit="kt"
          accent={results && results.headwind < 0 ? "accent" : "primary"}
          tooltip="Component of wind aligned with the runway centerline"
        />
        <ReadoutValue
          data-testid="result-crosswind-comp"
          label={`Crosswind ${results ? `(${results.crosswindDirection.toUpperCase()})` : ""}`}
          value={results ? results.crosswind.toFixed(1) : "—"}
          unit="kt"
          accent={xwindExceeded ? "destructive" : "muted"}
          tooltip="Perpendicular component of wind across the runway"
        />
        <div className="space-y-1.5">
          <Label htmlFor="max-xwind" className="text-xs text-muted-foreground uppercase tracking-wider">Max Crosswind Limit</Label>
          <div className="flex gap-1 flex-wrap">
            {CROSSWIND_LIMITS.map((v) => (
              <button
                key={v}
                data-testid={`xwind-limit-${v}`}
                onClick={() => setMaxXwind(String(v))}
                className={`px-2 py-1 rounded text-xs font-mono font-semibold border transition-colors ${
                  maxXwind === String(v)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {v}kt
              </button>
            ))}
          </div>
        </div>
      </div>

      {results && (
        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Crosswind vs Limit
            </span>
            <span className={`text-xs font-bold font-mono ${xwindExceeded ? "text-destructive" : "text-accent"}`}>
              {results.crosswind.toFixed(1)} / {maxXW} kt
            </span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              data-testid="crosswind-bar"
              className={`h-full rounded-full transition-all duration-300 ${xwindExceeded ? "bg-destructive" : "bg-accent"}`}
              style={{ width: `${xwindPct}%` }}
            />
          </div>
          {xwindExceeded && (
            <p className="text-xs text-destructive font-semibold mt-2">
              EXCEEDS maximum demonstrated crosswind
            </p>
          )}
        </div>
      )}
    </div>
  );
}
