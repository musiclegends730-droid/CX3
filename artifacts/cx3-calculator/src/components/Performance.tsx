import { useState, useMemo } from "react";
import { ReadoutValue } from "@/components/ui/ReadoutValue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loadFactor,
  stallSpeedInBank,
  maneuveringSpeed,
  vviForGlideslope,
  glideslopeAngle,
  vviTable3deg,
  climbGradientPct,
  climbFeetPerNm,
  rocForGradient,
  rocForFeetPerNm,
  timeToClimb,
  topOfClimbDist,
  glideRangeNm,
  glideRatioFromDist,
  altForGlide,
  standardRateTurnBank,
  turnRadius,
} from "@/lib/aviation-calc";

function safeNum(v: string): number | null {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function InlineUnit({ u }: { u: string }) {
  return <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">{u}</span>;
}

type Section = "stall" | "climb" | "glideslope" | "glide";

export function Performance() {
  const [section, setSection] = useState<Section>("stall");

  // Stall / Load Factor
  const [vs1g, setVs1g] = useState("");
  const [bankAngle, setBankAngle] = useState("");
  const [vaMax, setVaMax] = useState("");
  const [maxGross, setMaxGross] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [vs0, setVs0] = useState("");

  // Climb
  const [climbRoc, setClimbRoc] = useState("");
  const [climbTas, setClimbTas] = useState("");
  const [climbGs, setClimbGs] = useState("");
  const [climbAlt, setClimbAlt] = useState("");
  const [climbGradPct, setClimbGradPct] = useState("");

  // Glideslope / VVI
  const [vviGs, setVviGs] = useState("");
  const [vviAngle, setVviAngle] = useState("3.0");
  const [vviKnown, setVviKnown] = useState("");
  const [vviKnownGs, setVviKnownGs] = useState("");

  // Glide
  const [glideAlt, setGlideAlt] = useState("");
  const [glideRatio, setGlideRatio] = useState("");
  const [glideTas, setGlideTas] = useState("");
  const [glideWind, setGlideWind] = useState("");
  const [glideDistKnown, setGlideDistKnown] = useState("");
  const [glideAltLost, setGlideAltLost] = useState("");

  const stallResults = useMemo(() => {
    const vs = safeNum(vs1g);
    const bank = safeNum(bankAngle);
    if (vs === null) return null;
    const banks = bank !== null ? [bank] : [0, 15, 30, 45, 60];
    const lf = bank !== null ? loadFactor(bank) : null;
    const vs_bank = bank !== null ? stallSpeedInBank(vs, bank) : null;
    const va_curr =
      safeNum(vaMax) !== null && safeNum(maxGross) !== null && safeNum(currentWeight) !== null
        ? maneuveringSpeed(safeNum(vaMax)!, safeNum(maxGross)!, safeNum(currentWeight)!)
        : null;
    const vs0_bank = safeNum(vs0) !== null && bank !== null ? stallSpeedInBank(safeNum(vs0)!, bank) : null;
    const table = [0, 15, 20, 30, 40, 45, 50, 60].map((b) => ({
      bank: b,
      lf: loadFactor(b),
      vs: stallSpeedInBank(vs, b),
      vs0: safeNum(vs0) !== null ? stallSpeedInBank(safeNum(vs0)!, b) : null,
    }));
    return { lf, vs_bank, va_curr, table, vs0_bank };
  }, [vs1g, bankAngle, vaMax, maxGross, currentWeight, vs0]);

  const climbResults = useMemo(() => {
    const roc = safeNum(climbRoc);
    const tas = safeNum(climbTas);
    const gs = safeNum(climbGs) ?? safeNum(climbTas);
    const alt = safeNum(climbAlt);
    const grad = safeNum(climbGradPct);

    let gradPct: number | null = null;
    let fpm_nm: number | null = null;
    let tocDist: number | null = null;
    let tocTime: number | null = null;
    let rocNeeded: number | null = null;

    if (roc !== null && tas !== null && tas > 0) gradPct = climbGradientPct(roc, tas);
    if (roc !== null && gs !== null && gs > 0) fpm_nm = climbFeetPerNm(roc, gs);
    if (alt !== null && roc !== null && roc > 0) {
      tocTime = timeToClimb(alt, roc);
      if (gs !== null && gs > 0) tocDist = topOfClimbDist(alt, roc, gs);
    }
    if (grad !== null && tas !== null && tas > 0) rocNeeded = rocForGradient(grad, tas);

    return { gradPct, fpm_nm, tocDist, tocTime, rocNeeded };
  }, [climbRoc, climbTas, climbGs, climbAlt, climbGradPct]);

  const vviResults = useMemo(() => {
    const gs = safeNum(vviGs);
    const angle = safeNum(vviAngle) ?? 3;
    const knownVvi = safeNum(vviKnown);
    const knownGs = safeNum(vviKnownGs);
    const vvi = gs !== null ? vviForGlideslope(gs, angle) : null;
    const actualAngle = knownVvi !== null && knownGs !== null && knownGs > 0 ? glideslopeAngle(knownVvi, knownGs) : null;
    return { vvi, actualAngle };
  }, [vviGs, vviAngle, vviKnown, vviKnownGs]);

  const glideResults = useMemo(() => {
    const alt = safeNum(glideAlt);
    const ratio = safeNum(glideRatio);
    const tas = safeNum(glideTas) ?? 65;
    const wind = safeNum(glideWind) ?? 0;
    const distKnown = safeNum(glideDistKnown);
    const altLost = safeNum(glideAltLost);

    const range = alt !== null && ratio !== null ? glideRangeNm(alt, ratio, tas, wind) : null;
    const ratioFromDist = distKnown !== null && altLost !== null ? glideRatioFromDist(distKnown, altLost * 100) : null;
    const altNeeded = distKnown !== null && ratio !== null ? altForGlide(distKnown, ratio, tas, wind) : null;

    return { range, ratioFromDist, altNeeded };
  }, [glideAlt, glideRatio, glideTas, glideWind, glideDistKnown, glideAltLost]);

  const common3deg = vviTable3deg();

  const sections: { id: Section; label: string }[] = [
    { id: "stall", label: "Stall & Load Factor" },
    { id: "climb", label: "Climb Performance" },
    { id: "glideslope", label: "Glideslope / VVI" },
    { id: "glide", label: "Glide Range" },
  ];

  return (
    <div className="p-5">
      <div className="flex gap-2 flex-wrap mb-6">
        {sections.map((s) => (
          <button
            key={s.id}
            data-testid={`perf-section-${s.id}`}
            onClick={() => setSection(s.id)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              section === s.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Stall & Load Factor ── */}
      {section === "stall" && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            <div className="space-y-1.5">
              <Label htmlFor="vs1g">Vs (1g stall speed)</Label>
              <div className="relative"><Input id="vs1g" data-testid="input-vs1g" placeholder="KIAS" value={vs1g} onChange={(e) => setVs1g(e.target.value)} className="pr-10" /><InlineUnit u="kt" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vs0-stall">Vs0 (flaps-down stall) <span className="text-xs text-muted-foreground">opt</span></Label>
              <div className="relative"><Input id="vs0-stall" data-testid="input-vs0" placeholder="KIAS" value={vs0} onChange={(e) => setVs0(e.target.value)} className="pr-10" /><InlineUnit u="kt" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bank-stall">Bank Angle <span className="text-xs text-muted-foreground">opt</span></Label>
              <div className="relative"><Input id="bank-stall" data-testid="input-bank-angle" placeholder="degrees" value={bankAngle} onChange={(e) => setBankAngle(e.target.value)} className="pr-10" /><InlineUnit u="°" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="va-max">Va at Max Gross <span className="text-xs text-muted-foreground">opt</span></Label>
              <div className="relative"><Input id="va-max" data-testid="input-va-max" placeholder="KIAS" value={vaMax} onChange={(e) => setVaMax(e.target.value)} className="pr-10" /><InlineUnit u="kt" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max-gross-stall">Max Gross Weight <span className="text-xs text-muted-foreground">opt</span></Label>
              <div className="relative"><Input id="max-gross-stall" data-testid="input-max-gross" placeholder="lbs" value={maxGross} onChange={(e) => setMaxGross(e.target.value)} className="pr-10" /><InlineUnit u="lbs" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="curr-weight-stall">Current Weight <span className="text-xs text-muted-foreground">opt</span></Label>
              <div className="relative"><Input id="curr-weight-stall" data-testid="input-curr-weight" placeholder="lbs" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className="pr-10" /><InlineUnit u="lbs" /></div>
            </div>
          </div>

          {safeNum(bankAngle) !== null && stallResults && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <ReadoutValue data-testid="result-load-factor" label="Load Factor" value={stallResults.lf !== null ? stallResults.lf.toFixed(2) : "—"} unit="G" accent="primary" tooltip="G-load in a coordinated banked turn = 1/cos(bank)" />
              <ReadoutValue data-testid="result-vs-bank" label="Vs in Turn" value={stallResults.vs_bank !== null ? stallResults.vs_bank.toFixed(1) : "—"} unit="kt" accent="destructive" tooltip="Stall speed in banked turn = Vs × √G" />
              {stallResults.vs0_bank !== null && (
                <ReadoutValue data-testid="result-vs0-bank" label="Vs0 in Turn" value={stallResults.vs0_bank.toFixed(1)} unit="kt" accent="destructive" tooltip="Flaps-down stall speed in this banked turn" />
              )}
              {stallResults.va_curr !== null && (
                <ReadoutValue data-testid="result-va-curr" label="Va at Curr Wt" value={stallResults.va_curr.toFixed(1)} unit="kt" accent="accent" tooltip="Maneuvering speed at current weight (Va scales with √weight)" />
              )}
            </div>
          )}

          {stallResults && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 bg-muted/50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                <span>Bank</span>
                <span className="text-right">Load Factor</span>
                <span className="text-right">Vs (clean)</span>
                {safeNum(vs0) !== null && <span className="text-right">Vs0 (flaps)</span>}
              </div>
              {stallResults.table.map((row) => (
                <div
                  key={row.bank}
                  data-testid={`stall-row-${row.bank}`}
                  className={`grid grid-cols-4 px-3 py-2 text-sm border-b border-border/40 last:border-b-0 ${
                    safeNum(bankAngle) === row.bank ? "bg-primary/10" : "hover:bg-muted/20"
                  }`}
                >
                  <span className="font-mono text-muted-foreground">{row.bank}°</span>
                  <span className="font-mono text-right text-foreground">{row.lf.toFixed(2)} G</span>
                  <span className={`font-mono text-right font-bold ${row.bank >= 45 ? "text-destructive" : row.bank >= 30 ? "text-primary" : "text-accent"}`}>
                    {safeNum(vs1g) !== null ? row.vs.toFixed(1) : "—"} kt
                  </span>
                  {safeNum(vs0) !== null && (
                    <span className={`font-mono text-right ${row.bank >= 45 ? "text-destructive" : "text-muted-foreground"}`}>
                      {row.vs0 !== null ? row.vs0.toFixed(1) : "—"} kt
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Climb Performance ── */}
      {section === "climb" && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            <div className="space-y-1.5">
              <Label htmlFor="climb-roc">Rate of Climb</Label>
              <div className="relative"><Input id="climb-roc" data-testid="input-climb-roc" placeholder="fpm" value={climbRoc} onChange={(e) => setClimbRoc(e.target.value)} className="pr-12" /><InlineUnit u="fpm" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="climb-tas">TAS (for gradient)</Label>
              <div className="relative"><Input id="climb-tas" data-testid="input-climb-tas" placeholder="knots" value={climbTas} onChange={(e) => setClimbTas(e.target.value)} className="pr-10" /><InlineUnit u="kt" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="climb-gs">Ground Speed <span className="text-xs text-muted-foreground">opt</span></Label>
              <div className="relative"><Input id="climb-gs" data-testid="input-climb-gs" placeholder="defaults to TAS" value={climbGs} onChange={(e) => setClimbGs(e.target.value)} className="pr-10" /><InlineUnit u="kt" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="climb-alt">Altitude to Gain</Label>
              <div className="relative"><Input id="climb-alt" data-testid="input-climb-alt" placeholder="feet" value={climbAlt} onChange={(e) => setClimbAlt(e.target.value)} className="pr-10" /><InlineUnit u="ft" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="climb-grad">Target Gradient <span className="text-xs text-muted-foreground">opt</span></Label>
              <div className="relative"><Input id="climb-grad" data-testid="input-climb-grad" placeholder="%" value={climbGradPct} onChange={(e) => setClimbGradPct(e.target.value)} className="pr-10" /><InlineUnit u="%" /></div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <ReadoutValue data-testid="result-climb-grad-pct" label="Gradient" value={climbResults.gradPct !== null ? climbResults.gradPct.toFixed(1) : "—"} unit="%" tooltip="Climb gradient = RoC / TAS (in fpm) × 100" />
            <ReadoutValue data-testid="result-fpm-nm" label="Feet per NM" value={climbResults.fpm_nm !== null ? climbResults.fpm_nm.toLocaleString() : "—"} unit="ft/nm" accent="accent" tooltip="Altitude gained per nautical mile over ground" />
            <ReadoutValue data-testid="result-toc-time" label="Time to Climb" value={climbResults.tocTime !== null ? climbResults.tocTime.toFixed(1) : "—"} unit="min" accent="muted" tooltip="Time to gain the entered altitude at this RoC" />
            <ReadoutValue data-testid="result-toc-dist" label="ToC Distance" value={climbResults.tocDist !== null ? climbResults.tocDist.toFixed(1) : "—"} unit="nm" tooltip="Distance covered while climbing to altitude" />
          </div>

          {climbResults.rocNeeded !== null && (
            <div className="p-3 bg-muted/30 rounded-lg border border-border/50 mb-4">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">RoC needed for {safeNum(climbGradPct)}% gradient at {safeNum(climbTas) ?? "—"} kt TAS: </span>
              <span className="text-primary font-bold font-mono">{climbResults.rocNeeded.toLocaleString()} fpm</span>
            </div>
          )}

          <div className="border border-border rounded-lg overflow-hidden mt-2">
            <div className="px-3 py-2 bg-muted/50 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Common ODP Gradients (at entered GS / TAS)
            </div>
            {[2.5, 3.0, 3.3, 4.0, 5.0, 7.0, 10.0].map((g) => {
              const tas = safeNum(climbTas);
              const gs = safeNum(climbGs) ?? tas;
              const roc = tas !== null ? rocForGradient(g, tas) : null;
              const fpm_nm = gs !== null && roc !== null ? climbFeetPerNm(roc, gs) : null;
              return (
                <div key={g} className="grid grid-cols-3 px-3 py-2 text-sm border-b border-border/40 last:border-b-0 hover:bg-muted/20">
                  <span className="font-mono text-muted-foreground">{g.toFixed(1)}%</span>
                  <span className="font-mono text-right text-foreground">{roc !== null ? roc.toLocaleString() + " fpm" : "—"}</span>
                  <span className="font-mono text-right text-accent">{fpm_nm !== null ? fpm_nm.toLocaleString() + " ft/nm" : "—"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Glideslope / VVI ── */}
      {section === "glideslope" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div className="space-y-1.5">
              <Label htmlFor="vvi-gs">Ground Speed</Label>
              <div className="relative"><Input id="vvi-gs" data-testid="input-vvi-gs" placeholder="knots" value={vviGs} onChange={(e) => setVviGs(e.target.value)} className="pr-10" /><InlineUnit u="kt" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vvi-angle">Glidepath Angle</Label>
              <div className="relative">
                <Input id="vvi-angle" data-testid="input-vvi-angle" placeholder="3.0" value={vviAngle} onChange={(e) => setVviAngle(e.target.value)} className="pr-10" />
                <InlineUnit u="°" />
              </div>
              <div className="flex gap-1 flex-wrap mt-1">
                {["2.5", "3.0", "3.5", "4.0", "5.0"].map((a) => (
                  <button key={a} data-testid={`vvi-angle-preset-${a}`} onClick={() => setVviAngle(a)} className={`text-xs px-2 py-1 rounded border font-mono transition-colors ${vviAngle === a ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{a}°</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <ReadoutValue data-testid="result-vvi-required" label="Required VVI" value={vviResults.vvi !== null ? vviResults.vvi.toLocaleString() : "—"} unit="fpm" tooltip="Vertical velocity needed to track this glidepath at your ground speed" />
            </div>
          </div>

          <div className="mb-5 p-4 bg-muted/20 rounded-lg border border-border/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Find Actual Glidepath Angle</p>
            <div className="grid grid-cols-2 gap-3 max-w-sm mb-3">
              <div className="space-y-1.5">
                <Label htmlFor="vvi-known">Actual VVI</Label>
                <div className="relative"><Input id="vvi-known" data-testid="input-vvi-known" placeholder="fpm" value={vviKnown} onChange={(e) => setVviKnown(e.target.value)} className="pr-12" /><InlineUnit u="fpm" /></div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vvi-known-gs">Ground Speed</Label>
                <div className="relative"><Input id="vvi-known-gs" data-testid="input-vvi-known-gs" placeholder="kt" value={vviKnownGs} onChange={(e) => setVviKnownGs(e.target.value)} className="pr-10" /><InlineUnit u="kt" /></div>
              </div>
            </div>
            <ReadoutValue data-testid="result-actual-angle" label="Actual Glidepath" value={vviResults.actualAngle !== null ? vviResults.actualAngle.toFixed(2) : "—"} unit="°" accent="accent" tooltip="Glidepath angle from your actual VVI and GS" />
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-muted/50 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Standard 3.0° ILS / VVI Table
            </div>
            {common3deg.map((row) => (
              <div key={row.gsKt} data-testid={`vvi-row-${row.gsKt}`} className={`grid grid-cols-2 px-3 py-2 text-sm border-b border-border/40 last:border-b-0 hover:bg-muted/20 ${safeNum(vviGs) === row.gsKt ? "bg-primary/10" : ""}`}>
                <span className="font-mono text-muted-foreground">{row.gsKt} kt GS</span>
                <span className="font-mono text-primary font-bold text-right">{row.vviFpm.toLocaleString()} fpm</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Glide Range ── */}
      {section === "glide" && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            <div className="space-y-1.5">
              <Label htmlFor="glide-alt">AGL Altitude</Label>
              <div className="relative"><Input id="glide-alt" data-testid="input-glide-alt" placeholder="feet AGL" value={glideAlt} onChange={(e) => setGlideAlt(e.target.value)} className="pr-10" /><InlineUnit u="ft" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="glide-ratio">Glide Ratio</Label>
              <div className="relative"><Input id="glide-ratio" data-testid="input-glide-ratio" placeholder="e.g. 9 (9:1)" value={glideRatio} onChange={(e) => setGlideRatio(e.target.value)} className="pr-8" /><InlineUnit u=":1" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="glide-tas">Best Glide TAS</Label>
              <div className="relative"><Input id="glide-tas" data-testid="input-glide-tas" placeholder="65" value={glideTas} onChange={(e) => setGlideTas(e.target.value)} className="pr-10" /><InlineUnit u="kt" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="glide-wind">Wind <span className="text-xs text-muted-foreground">(+ = headwind)</span></Label>
              <div className="relative"><Input id="glide-wind" data-testid="input-glide-wind" placeholder="0" value={glideWind} onChange={(e) => setGlideWind(e.target.value)} className="pr-10" /><InlineUnit u="kt" /></div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <ReadoutValue data-testid="result-glide-range" label="Glide Range" value={glideResults.range !== null ? glideResults.range.toFixed(1) : "—"} unit="nm" tooltip="Maximum glide distance from AGL altitude with wind correction" />
            {glideResults.altNeeded !== null && (
              <ReadoutValue data-testid="result-alt-needed" label="Alt for Dist" value={glideResults.altNeeded.toLocaleString()} unit="ft AGL" accent="muted" tooltip="Altitude needed to glide to the entered distance" />
            )}
          </div>

          <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Find Glide Ratio from Known Performance</p>
            <div className="grid grid-cols-2 gap-3 max-w-sm mb-3">
              <div className="space-y-1.5">
                <Label htmlFor="glide-dist-known">Distance Glided</Label>
                <div className="relative"><Input id="glide-dist-known" data-testid="input-glide-dist-known" placeholder="nm" value={glideDistKnown} onChange={(e) => setGlideDistKnown(e.target.value)} className="pr-10" /><InlineUnit u="nm" /></div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="glide-alt-lost">Alt Lost</Label>
                <div className="relative"><Input id="glide-alt-lost" data-testid="input-glide-alt-lost" placeholder="hundreds ft" value={glideAltLost} onChange={(e) => setGlideAltLost(e.target.value)} className="pr-16" /><InlineUnit u="×100 ft" /></div>
              </div>
            </div>
            <ReadoutValue data-testid="result-glide-ratio-known" label="Glide Ratio" value={glideResults.ratioFromDist !== null ? glideResults.ratioFromDist.toFixed(1) + ":1" : "—"} unit="" accent="accent" tooltip="Computed glide ratio from observed distance and altitude loss" />
          </div>

          <div className="border border-border rounded-lg overflow-hidden mt-4">
            <div className="px-3 py-2 bg-muted/50 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Glide Range Table — {safeNum(glideRatio) ?? "9"}:1 at {safeNum(glideTas) ?? 65} kt TAS, {safeNum(glideWind) ?? 0} kt headwind
            </div>
            {[500, 1000, 2000, 3000, 4000, 5000, 6000, 8000, 10000].map((alt) => {
              const ratio = safeNum(glideRatio) ?? 9;
              const tas = safeNum(glideTas) ?? 65;
              const wind = safeNum(glideWind) ?? 0;
              const nm = glideRangeNm(alt, ratio, tas, wind);
              return (
                <div key={alt} data-testid={`glide-row-${alt}`} className="grid grid-cols-2 px-3 py-2 text-sm border-b border-border/40 last:border-b-0 hover:bg-muted/20">
                  <span className="font-mono text-muted-foreground">{alt.toLocaleString()} ft AGL</span>
                  <span className="font-mono text-accent font-bold text-right">{nm.toFixed(1)} nm</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
