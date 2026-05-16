import { useState, useMemo } from "react";
import { ReadoutValue } from "@/components/ui/ReadoutValue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  offCourseCorrection,
  standardRateTurnBank,
  turnRadius,
  timeForTurn,
  trueTomagnetic,
  magneticToTrue,
  compassToMagnetic,
  magneticToCompass,
  requiredDescentRate,
  topOfDescent,
  normalizeHeading,
} from "@/lib/aviation-calc";

function safeNum(v: string): number | null {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

export function Corrections() {
  const [activeSection, setActiveSection] = useState<"offcourse" | "turn" | "heading" | "descent">("offcourse");

  // Off-course
  const [ocDist, setOcDist] = useState("");
  const [ocFlown, setOcFlown] = useState("");
  const [ocRemaining, setOcRemaining] = useState("");

  // Turn
  const [turnTas, setTurnTas] = useState("");
  const [turnBank, setTurnBank] = useState("");
  const [turnChange, setTurnChange] = useState("");

  // Heading
  const [trueHdg, setTrueHdg] = useState("");
  const [variation, setVariation] = useState("");
  const [varDir, setVarDir] = useState<"E" | "W">("W");
  const [deviation, setDeviation] = useState("");
  const [devDir, setDevDir] = useState<"E" | "W">("E");

  // Descent
  const [currentAlt, setCurrentAlt] = useState("");
  const [targetAlt, setTargetAlt] = useState("");
  const [descentGs, setDescentGs] = useState("");
  const [descentDist, setDescentDist] = useState("");

  const ocResult = useMemo(() => {
    const d = safeNum(ocDist);
    const f = safeNum(ocFlown);
    const r = safeNum(ocRemaining);
    if (d === null || f === null || r === null || f === 0 || r === 0) return null;
    return offCourseCorrection(d, f, r);
  }, [ocDist, ocFlown, ocRemaining]);

  const turnResult = useMemo(() => {
    const t = safeNum(turnTas);
    if (t === null || t <= 0) return null;
    const stdBank = standardRateTurnBank(t);
    const bank = safeNum(turnBank) ?? stdBank;
    const radius = turnRadius(t, bank);
    const tc = safeNum(turnChange);
    const timeSec = tc !== null ? timeForTurn(tc, 3) : null;
    return { stdBank, radius, timeSec };
  }, [turnTas, turnBank, turnChange]);

  const hdgResult = useMemo(() => {
    const t = safeNum(trueHdg);
    const v = safeNum(variation) ?? 0;
    const d = safeNum(deviation) ?? 0;
    if (t === null) return null;
    const mag = trueTomagnetic(t, v, varDir);
    const comp = magneticToCompass(mag, d, devDir);
    return { mag: Math.round(mag * 10) / 10, comp: Math.round(comp * 10) / 10 };
  }, [trueHdg, variation, varDir, deviation, devDir]);

  const descentResult = useMemo(() => {
    const ca = safeNum(currentAlt);
    const ta = safeNum(targetAlt);
    const gs = safeNum(descentGs);
    const dd = safeNum(descentDist);
    if (ca === null || ta === null) return null;
    const altLoss = ca - ta;
    if (altLoss <= 0) return null;
    let reqRate: number | null = null;
    let tod: { distanceNm: number; timeMin: number } | null = null;
    if (dd !== null && gs !== null && gs > 0) {
      reqRate = requiredDescentRate(altLoss, dd, gs);
    }
    if (gs !== null && gs > 0 && reqRate !== null) {
      tod = topOfDescent(ca, ta, reqRate, gs);
    }
    return { altLoss, reqRate, tod };
  }, [currentAlt, targetAlt, descentGs, descentDist]);

  const sections = [
    { id: "offcourse" as const, label: "Off-Course" },
    { id: "turn" as const, label: "Std Rate Turn" },
    { id: "heading" as const, label: "Hdg Correction" },
    { id: "descent" as const, label: "Descent" },
  ];

  return (
    <div className="p-5">
      <div className="flex gap-2 flex-wrap mb-6">
        {sections.map((s) => (
          <button
            key={s.id}
            data-testid={`section-${s.id}`}
            onClick={() => setActiveSection(s.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
              activeSection === s.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === "offcourse" && (
        <div>
          <p className="text-xs text-muted-foreground mb-4">Uses the 1-in-60 rule to compute heading correction to return to course and intercept destination.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="oc-dist">Distance Off Course</Label>
              <div className="relative">
                <Input id="oc-dist" data-testid="input-oc-dist" placeholder="nm" value={ocDist} onChange={(e) => setOcDist(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">nm</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oc-flown">Distance Already Flown</Label>
              <div className="relative">
                <Input id="oc-flown" data-testid="input-oc-flown" placeholder="nm" value={ocFlown} onChange={(e) => setOcFlown(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">nm</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oc-remaining">Distance Remaining</Label>
              <div className="relative">
                <Input id="oc-remaining" data-testid="input-oc-remaining" placeholder="nm" value={ocRemaining} onChange={(e) => setOcRemaining(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">nm</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ReadoutValue data-testid="result-opening-angle" label="Opening Angle" value={ocResult ? ocResult.openingAngle.toFixed(1) : "—"} unit="°" tooltip="Angle to parallel the course" />
            <ReadoutValue data-testid="result-closing-angle" label="Closing Angle" value={ocResult ? ocResult.closingAngle.toFixed(1) : "—"} unit="°" accent="muted" tooltip="Additional angle to reach destination" />
            <ReadoutValue data-testid="result-total-correction" label="Total Correction" value={ocResult ? ocResult.totalCorrection.toFixed(1) : "—"} unit="°" accent="primary" tooltip="Total heading change to fly direct to destination" />
          </div>
        </div>
      )}

      {activeSection === "turn" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="turn-tas">TAS</Label>
              <div className="relative">
                <Input id="turn-tas" data-testid="input-turn-tas" placeholder="knots" value={turnTas} onChange={(e) => setTurnTas(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">kt</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="turn-bank">Bank Angle <span className="text-muted-foreground text-xs">(blank = std rate)</span></Label>
              <div className="relative">
                <Input id="turn-bank" data-testid="input-turn-bank" placeholder="optional" value={turnBank} onChange={(e) => setTurnBank(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">°</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="turn-change">Heading Change</Label>
              <div className="relative">
                <Input id="turn-change" data-testid="input-turn-change" placeholder="degrees" value={turnChange} onChange={(e) => setTurnChange(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">°</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ReadoutValue data-testid="result-std-bank" label="Std Rate Bank" value={turnResult ? turnResult.stdBank.toFixed(1) : "—"} unit="°" tooltip="Bank angle for 3°/sec standard rate turn at this TAS" />
            <ReadoutValue data-testid="result-turn-radius" label="Turn Radius" value={turnResult ? turnResult.radius.toLocaleString() : "—"} unit="ft" accent="muted" tooltip="Radius of turn at entered bank angle (or standard rate bank)" />
            <ReadoutValue data-testid="result-turn-time" label="Time for Turn" value={turnResult?.timeSec !== null && turnResult?.timeSec !== undefined ? turnResult.timeSec.toFixed(0) : "—"} unit="sec" accent="accent" tooltip="Time to complete heading change at standard rate (3°/sec)" />
          </div>
        </div>
      )}

      {activeSection === "heading" && (
        <div>
          <p className="text-xs text-muted-foreground mb-4 font-mono">
            True → Magnetic → Compass&nbsp;&nbsp;|&nbsp;&nbsp;East is least, West is best (variation)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="true-hdg">True Heading</Label>
              <div className="relative">
                <Input id="true-hdg" data-testid="input-true-hdg" placeholder="0–360" value={trueHdg} onChange={(e) => setTrueHdg(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">°T</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="variation">Magnetic Variation</Label>
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <Input id="variation" data-testid="input-variation" placeholder="degrees" value={variation} onChange={(e) => setVariation(e.target.value)} className="pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">°</span>
                </div>
                <button
                  data-testid="toggle-var-dir"
                  onClick={() => setVarDir((d) => (d === "E" ? "W" : "E"))}
                  className="px-3 py-2 rounded-lg border border-border font-bold text-sm text-primary hover:bg-muted transition-colors min-w-[42px]"
                >
                  {varDir}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deviation">Compass Deviation</Label>
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <Input id="deviation" data-testid="input-deviation" placeholder="degrees" value={deviation} onChange={(e) => setDeviation(e.target.value)} className="pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">°</span>
                </div>
                <button
                  data-testid="toggle-dev-dir"
                  onClick={() => setDevDir((d) => (d === "E" ? "W" : "E"))}
                  className="px-3 py-2 rounded-lg border border-border font-bold text-sm text-primary hover:bg-muted transition-colors min-w-[42px]"
                >
                  {devDir}
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <ReadoutValue data-testid="result-mag-hdg" label="Magnetic Heading" value={hdgResult ? hdgResult.mag.toFixed(1) : "—"} unit="°M" tooltip="True heading corrected for magnetic variation" />
            <ReadoutValue data-testid="result-comp-hdg" label="Compass Heading" value={hdgResult ? hdgResult.comp.toFixed(1) : "—"} unit="°C" accent="accent" tooltip="Magnetic heading corrected for compass deviation" />
          </div>
        </div>
      )}

      {activeSection === "descent" && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="current-alt">Current Altitude</Label>
              <div className="relative">
                <Input id="current-alt" data-testid="input-current-alt" placeholder="ft" value={currentAlt} onChange={(e) => setCurrentAlt(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">ft</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="target-alt">Target Altitude</Label>
              <div className="relative">
                <Input id="target-alt" data-testid="input-target-alt" placeholder="ft" value={targetAlt} onChange={(e) => setTargetAlt(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">ft</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descent-gs">Ground Speed</Label>
              <div className="relative">
                <Input id="descent-gs" data-testid="input-descent-gs" placeholder="knots" value={descentGs} onChange={(e) => setDescentGs(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">kt</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descent-dist">Distance to Fix</Label>
              <div className="relative">
                <Input id="descent-dist" data-testid="input-descent-dist" placeholder="nm" value={descentDist} onChange={(e) => setDescentDist(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">nm</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ReadoutValue data-testid="result-alt-loss" label="Altitude to Lose" value={descentResult ? descentResult.altLoss.toLocaleString() : "—"} unit="ft" accent="muted" tooltip="Difference between current and target altitude" />
            <ReadoutValue data-testid="result-req-rate" label="Required Rate" value={descentResult?.reqRate != null ? descentResult.reqRate.toLocaleString() : "—"} unit="fpm" accent={descentResult?.reqRate != null && descentResult.reqRate > 1500 ? "destructive" : "primary"} tooltip="Vertical speed needed to reach target altitude over the distance" />
            <ReadoutValue data-testid="result-tod-dist" label="ToD Distance" value={descentResult?.tod != null ? descentResult.tod.distanceNm.toFixed(1) : "—"} unit="nm" accent="accent" tooltip="Start descent this far from destination" />
          </div>
        </div>
      )}
    </div>
  );
}
