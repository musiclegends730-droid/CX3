import { useState, useMemo } from "react";
import { ReadoutValue } from "@/components/ui/ReadoutValue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  timeFromDistSpeed,
  distanceFromTimeSpeed,
  speedFromDistTime,
  formatHMS,
  fuelBurn,
} from "@/lib/aviation-calc";

function safeNum(v: string): number | null {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function parseTime(v: string): number | null {
  v = v.trim();
  if (v === "") return null;
  // HH:MM:SS or MM:SS
  if (v.includes(":")) {
    const parts = v.split(":").map(Number);
    if (parts.some(isNaN)) return null;
    if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60;
    if (parts.length === 2) return parts[0] + parts[1] / 60;
  }
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

export function TimeSpeedDistance() {
  const [dist, setDist] = useState("");
  const [speed, setSpeed] = useState("");
  const [time, setTime] = useState("");
  const [fuelFlow, setFuelFlow] = useState("");

  const solve = useMemo(() => {
    const d = safeNum(dist);
    const s = safeNum(speed);
    const t = parseTime(time);

    let computedDist: number | null = null;
    let computedSpeed: number | null = null;
    let computedTime: number | null = null;

    const filled = [d !== null, s !== null, t !== null];
    const count = filled.filter(Boolean).length;

    if (count === 2) {
      if (d !== null && s !== null) {
        computedTime = timeFromDistSpeed(d, s);
      } else if (d !== null && t !== null) {
        computedSpeed = speedFromDistTime(d, t);
      } else if (s !== null && t !== null) {
        computedDist = distanceFromTimeSpeed(t, s);
      }
    }

    const timeForFuel =
      computedTime !== null ? computedTime : t;
    const ff = safeNum(fuelFlow);
    const fuel =
      ff !== null && timeForFuel !== null
        ? fuelBurn(timeForFuel, ff)
        : null;

    return {
      computedDist,
      computedSpeed,
      computedTime,
      fuel,
      count,
    };
  }, [dist, speed, time, fuelFlow]);

  const displayDist = solve.computedDist !== null ? solve.computedDist.toFixed(1) : (safeNum(dist) !== null ? safeNum(dist)!.toFixed(1) : null);
  const displaySpeed = solve.computedSpeed !== null ? solve.computedSpeed.toFixed(1) : (safeNum(speed) !== null ? safeNum(speed)!.toFixed(1) : null);
  const rawTime = solve.computedTime !== null ? solve.computedTime : parseTime(time);
  const displayTime = rawTime !== null ? formatHMS(rawTime) : null;

  const computedCount = [solve.computedDist, solve.computedSpeed, solve.computedTime].filter(v => v !== null).length;

  return (
    <div className="p-5">
      <p className="text-xs text-muted-foreground mb-4">
        Enter any <span className="text-primary font-semibold">two</span> of the three fields — the third is computed automatically.
        Time can be entered as <span className="font-mono text-foreground/70">decimal minutes</span> or <span className="font-mono text-foreground/70">HH:MM:SS</span>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
        <div className="space-y-1.5">
          <Label htmlFor="dist-tsd">
            Distance
            {solve.computedDist !== null && <span className="ml-2 text-xs text-primary font-mono">(computed)</span>}
          </Label>
          <div className="relative">
            <Input
              id="dist-tsd"
              data-testid="input-distance"
              placeholder="nm"
              value={dist}
              onChange={(e) => setDist(e.target.value)}
              className={`pr-10 ${solve.computedDist !== null ? "opacity-50" : ""}`}
              disabled={computedCount > 0 && solve.computedDist !== null}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">nm</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="speed-tsd">
            Speed
            {solve.computedSpeed !== null && <span className="ml-2 text-xs text-primary font-mono">(computed)</span>}
          </Label>
          <div className="relative">
            <Input
              id="speed-tsd"
              data-testid="input-speed"
              placeholder="knots"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              className={`pr-10 ${solve.computedSpeed !== null ? "opacity-50" : ""}`}
              disabled={computedCount > 0 && solve.computedSpeed !== null}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">kt</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="time-tsd">
            Time
            {solve.computedTime !== null && <span className="ml-2 text-xs text-primary font-mono">(computed)</span>}
          </Label>
          <div className="relative">
            <Input
              id="time-tsd"
              data-testid="input-time"
              placeholder="min or HH:MM:SS"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`pr-14 ${solve.computedTime !== null ? "opacity-50" : ""}`}
              disabled={computedCount > 0 && solve.computedTime !== null}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">min</span>
          </div>
        </div>
      </div>

      <div className="mb-6 mt-4 max-w-xs">
        <Label htmlFor="fuel-flow-tsd">Fuel Flow <span className="text-muted-foreground text-xs">(optional)</span></Label>
        <div className="relative mt-1.5">
          <Input
            id="fuel-flow-tsd"
            data-testid="input-fuel-flow"
            placeholder="gph"
            value={fuelFlow}
            onChange={(e) => setFuelFlow(e.target.value)}
            className="pr-12"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">gph</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReadoutValue
          data-testid="result-tsd-distance"
          label="Distance"
          value={displayDist ?? "—"}
          unit="nm"
          accent={solve.computedDist !== null ? "primary" : "muted"}
          tooltip="Distance in nautical miles"
        />
        <ReadoutValue
          data-testid="result-tsd-speed"
          label="Speed"
          value={displaySpeed ?? "—"}
          unit="kt"
          accent={solve.computedSpeed !== null ? "primary" : "muted"}
          tooltip="Speed in knots"
        />
        <ReadoutValue
          data-testid="result-tsd-time"
          label="Time"
          value={displayTime ?? "—"}
          unit=""
          accent={solve.computedTime !== null ? "primary" : "muted"}
          tooltip="Elapsed time in H:MM:SS"
        />
        <ReadoutValue
          data-testid="result-tsd-fuel"
          label="Fuel Burn"
          value={solve.fuel !== null ? solve.fuel.toFixed(1) : "—"}
          unit="gal"
          accent="accent"
          tooltip="Fuel burned for this time at the entered fuel flow"
        />
      </div>
    </div>
  );
}
