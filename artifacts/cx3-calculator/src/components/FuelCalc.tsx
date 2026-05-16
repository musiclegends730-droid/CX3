import { useState, useMemo } from "react";
import { ReadoutValue } from "@/components/ui/ReadoutValue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  endurance,
  rangeFromFuel,
  fuelRequired,
  specificRange,
  fuelGalToLbs,
  fuelLbsToGal,
  pphToGph,
  gphToPph,
  formatHMS,
  type FuelType,
  FUEL_DENSITIES,
} from "@/lib/aviation-calc";

function safeNum(v: string): number | null {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

const FUEL_LABELS: Record<FuelType, string> = {
  avgas100ll: "100LL AvGas",
  jeta: "Jet-A",
  mogas: "MoGas",
  custom: "Custom",
};

export function FuelCalc() {
  const [activeSection, setActiveSection] = useState<"planning" | "weight" | "flow">("planning");

  // Planning
  const [totalFuel, setTotalFuel] = useState("");
  const [fuelFlow, setFuelFlow] = useState("");
  const [groundSpeed, setGroundSpeed] = useState("");
  const [distance, setDistance] = useState("");
  const [reserve, setReserve] = useState("");

  // Weight conversion
  const [fuelType, setFuelType] = useState<FuelType>("avgas100ll");
  const [customDensity, setCustomDensity] = useState("");
  const [gallons, setGallons] = useState("");
  const [lbs, setLbs] = useState("");

  // Flow conversion
  const [pph, setPph] = useState("");
  const [gph, setGph] = useState("");
  const [flowType, setFlowType] = useState<FuelType>("avgas100ll");

  const density =
    fuelType === "custom"
      ? safeNum(customDensity) ?? FUEL_DENSITIES.avgas100ll
      : FUEL_DENSITIES[fuelType];

  const flowDensity =
    flowType === "custom"
      ? safeNum(customDensity) ?? FUEL_DENSITIES.avgas100ll
      : FUEL_DENSITIES[flowType];

  const planResults = useMemo(() => {
    const tf = safeNum(totalFuel);
    const ff = safeNum(fuelFlow);
    const gs = safeNum(groundSpeed);
    const d = safeNum(distance);
    const res = safeNum(reserve) ?? 0;
    const usable = tf !== null ? tf - res : null;

    const enduranceMin = usable !== null && ff !== null && ff > 0 ? endurance(usable, ff) : null;
    const range = usable !== null && ff !== null && ff > 0 && gs !== null && gs > 0 ? rangeFromFuel(usable, ff, gs) : null;
    const fuelToDest = d !== null && gs !== null && gs > 0 && ff !== null && ff > 0 ? fuelRequired(d, gs, ff) : null;
    const remaining = fuelToDest !== null && tf !== null ? tf - fuelToDest : null;
    const sr = ff !== null && ff > 0 && gs !== null && gs > 0 ? specificRange(gs, ff) : null;
    const fuelToDestLbs = fuelToDest !== null ? fuelGalToLbs(fuelToDest, "avgas100ll") : null;

    return { enduranceMin, range, fuelToDest, remaining, sr, fuelToDestLbs };
  }, [totalFuel, fuelFlow, groundSpeed, distance, reserve]);

  const handleGallons = (v: string) => {
    setGallons(v);
    const n = safeNum(v);
    if (n !== null) setLbs(String(Math.round(fuelGalToLbs(n, fuelType, density) * 10) / 10));
    else setLbs("");
  };

  const handleLbs = (v: string) => {
    setLbs(v);
    const n = safeNum(v);
    if (n !== null) setGallons(String(Math.round(fuelLbsToGal(n, fuelType, density) * 10) / 10));
    else setGallons("");
  };

  const handlePph = (v: string) => {
    setPph(v);
    const n = safeNum(v);
    if (n !== null) setGph(String(Math.round(pphToGph(n, flowType, flowDensity) * 100) / 100));
    else setGph("");
  };

  const handleGph = (v: string) => {
    setGph(v);
    const n = safeNum(v);
    if (n !== null) setPph(String(Math.round(gphToPph(n, flowType, flowDensity) * 100) / 100));
    else setPph("");
  };

  const reserveOk = planResults.remaining !== null && planResults.remaining > 0;

  const sections = [
    { id: "planning" as const, label: "Flight Planning" },
    { id: "weight" as const, label: "Gal ↔ Lbs" },
    { id: "flow" as const, label: "GPH ↔ PPH" },
  ];

  return (
    <div className="p-5">
      <div className="flex gap-2 mb-6 flex-wrap">
        {sections.map((s) => (
          <button
            key={s.id}
            data-testid={`fuel-section-${s.id}`}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              activeSection === s.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === "planning" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="total-fuel">Total Usable Fuel</Label>
              <div className="relative">
                <Input id="total-fuel" data-testid="input-total-fuel" placeholder="gallons" value={totalFuel} onChange={(e) => setTotalFuel(e.target.value)} className="pr-12" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">gal</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fuel-flow">Fuel Flow</Label>
              <div className="relative">
                <Input id="fuel-flow" data-testid="input-fuel-flow-main" placeholder="gph" value={fuelFlow} onChange={(e) => setFuelFlow(e.target.value)} className="pr-12" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">gph</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reserve-fuel">Reserve <span className="text-muted-foreground text-xs">(excluded)</span></Label>
              <div className="relative">
                <Input id="reserve-fuel" data-testid="input-reserve-fuel" placeholder="0" value={reserve} onChange={(e) => setReserve(e.target.value)} className="pr-12" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">gal</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gs-fuel">Ground Speed</Label>
              <div className="relative">
                <Input id="gs-fuel" data-testid="input-gs-fuel" placeholder="knots" value={groundSpeed} onChange={(e) => setGroundSpeed(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">kt</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dist-fuel">Distance to Dest</Label>
              <div className="relative">
                <Input id="dist-fuel" data-testid="input-dist-fuel" placeholder="nm" value={distance} onChange={(e) => setDistance(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">nm</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <ReadoutValue data-testid="result-endurance" label="Endurance" value={planResults.enduranceMin !== null ? formatHMS(planResults.enduranceMin) : "—"} unit="" tooltip="Max flight time on usable fuel at this fuel flow" />
            <ReadoutValue data-testid="result-range" label="Range" value={planResults.range !== null ? planResults.range.toFixed(0) : "—"} unit="nm" accent="accent" tooltip="Maximum range on usable fuel" />
            <ReadoutValue data-testid="result-fuel-to-dest" label="Fuel to Dest" value={planResults.fuelToDest !== null ? planResults.fuelToDest.toFixed(1) : "—"} unit="gal" accent={planResults.fuelToDest !== null && safeNum(totalFuel) !== null && planResults.fuelToDest > (safeNum(totalFuel) ?? Infinity) ? "destructive" : "muted"} tooltip="Fuel required to reach destination" />
            <ReadoutValue data-testid="result-reserve-remaining" label="Fuel Remaining" value={planResults.remaining !== null ? planResults.remaining.toFixed(1) : "—"} unit="gal" accent={reserveOk ? "accent" : "destructive"} tooltip="Fuel remaining at destination (vs. your reserve)" />
            <ReadoutValue data-testid="result-specific-range" label="Specific Range" value={planResults.sr !== null ? planResults.sr.toFixed(2) : "—"} unit="nm/gal" accent="muted" tooltip="Nautical miles per gallon of fuel — efficiency metric" />
          </div>
        </>
      )}

      {activeSection === "weight" && (
        <>
          <div className="mb-4">
            <Label className="mb-2 block">Fuel Type</Label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(FUEL_LABELS) as FuelType[]).map((ft) => (
                <button
                  key={ft}
                  data-testid={`fuel-type-${ft}`}
                  onClick={() => {
                    setFuelType(ft);
                    if (gallons) handleGallons(gallons);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                    fuelType === ft
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {FUEL_LABELS[ft]}
                  {ft !== "custom" && (
                    <span className="ml-1 text-xs opacity-70 font-mono">{FUEL_DENSITIES[ft]} lb/gal</span>
                  )}
                </button>
              ))}
            </div>
            {fuelType === "custom" && (
              <div className="mt-3 max-w-xs">
                <Label htmlFor="custom-density">Custom Density</Label>
                <div className="relative mt-1.5">
                  <Input id="custom-density" data-testid="input-custom-density" placeholder="6.01" value={customDensity} onChange={(e) => { setCustomDensity(e.target.value); if (gallons) handleGallons(gallons); }} className="pr-16" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">lb/gal</span>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="space-y-1.5">
              <Label htmlFor="fuel-gal">Volume</Label>
              <div className="relative">
                <Input id="fuel-gal" data-testid="input-fuel-gal" placeholder="gallons" value={gallons} onChange={(e) => handleGallons(e.target.value)} className="pr-12" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">gal</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fuel-lbs">Weight</Label>
              <div className="relative">
                <Input id="fuel-lbs" data-testid="input-fuel-lbs" placeholder="pounds" value={lbs} onChange={(e) => handleLbs(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">lbs</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-4">
            Using {FUEL_LABELS[fuelType]} at {fuelType === "custom" ? (safeNum(customDensity) ?? FUEL_DENSITIES.avgas100ll).toFixed(2) : FUEL_DENSITIES[fuelType]} lbs/US gal
          </p>
        </>
      )}

      {activeSection === "flow" && (
        <>
          <p className="text-xs text-muted-foreground mb-4">
            Convert between volume flow (GPH) and mass flow (PPH / lbs per hour).
          </p>
          <div className="mb-4">
            <Label className="mb-2 block">Fuel Type</Label>
            <div className="flex gap-2 flex-wrap">
              {(["avgas100ll", "jeta", "mogas"] as FuelType[]).map((ft) => (
                <button
                  key={ft}
                  data-testid={`flow-type-${ft}`}
                  onClick={() => { setFlowType(ft); if (gph) handleGph(gph); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                    flowType === ft
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {FUEL_LABELS[ft]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="space-y-1.5">
              <Label htmlFor="flow-gph">GPH (vol/hr)</Label>
              <div className="relative">
                <Input id="flow-gph" data-testid="input-flow-gph" placeholder="gal/hr" value={gph} onChange={(e) => handleGph(e.target.value)} className="pr-12" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">gph</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="flow-pph">PPH (mass/hr)</Label>
              <div className="relative">
                <Input id="flow-pph" data-testid="input-flow-pph" placeholder="lbs/hr" value={pph} onChange={(e) => handlePph(e.target.value)} className="pr-12" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">pph</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-4">
            {FUEL_LABELS[flowType]}: {FUEL_DENSITIES[flowType]} lbs/gal &nbsp;|&nbsp; 1 gph = {FUEL_DENSITIES[flowType]} pph
          </p>
        </>
      )}
    </div>
  );
}
