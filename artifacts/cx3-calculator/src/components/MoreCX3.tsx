import { useState, useMemo } from "react";
import { ReadoutValue } from "@/components/ui/ReadoutValue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  isaTempAtAlt,
  pressureAltitude,
  densityAltitudeFull,
  STD_PRESSURE_INHG,
  hpaToInhg,
} from "@/lib/aviation-calc";

function safeNum(v: string): number | null {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

// ─── VDP ─────────────────────────────────────────────────────────────────────
function vdp(hatFt: number, approachAngleDeg: number): number {
  return Math.round((hatFt / Math.tan(approachAngleDeg * Math.PI / 180) / 6076.12) * 10) / 10;
}

// ─── Course Intercept ─────────────────────────────────────────────────────────
function interceptHeading(currentHeading: number, desiredCourse: number, interceptAngle: number): { hdg: number } {
  const diff = ((desiredCourse - currentHeading) + 360) % 360;
  const hdg = diff <= 180
    ? (desiredCourse - interceptAngle + 360) % 360
    : (desiredCourse + interceptAngle + 360) % 360;
  return { hdg: Math.round(hdg * 10) / 10 };
}

// ─── ISA Table data ─────────────────────────────────────────────────────────
function isaTableRow(altFt: number) {
  const tempC = isaTempAtAlt(altFt);
  const tempF = tempC * 9 / 5 + 32;
  // Standard pressure via barometric formula
  const pressHpa = 1013.25 * Math.pow(1 - 6.87559e-6 * altFt, 5.2561);
  const pressInhg = pressHpa / 33.8639;
  // Density ratio σ = (P/P0) / (T/T0) — relative to sea level standard
  const sigma = (pressHpa / 1013.25) / ((tempC + 273.15) / 288.15);
  const speedOfSound = Math.round(38.9678 * Math.sqrt(tempC + 273.15));
  return { altFt, tempC: Math.round(tempC * 10) / 10, tempF: Math.round(tempF * 10) / 10, pressHpa: Math.round(pressHpa * 10) / 10, pressInhg: Math.round(pressInhg * 1000) / 1000, sigma: Math.round(sigma * 10000) / 10000, speedOfSound };
}

// ─── PNR (Point of No Return) ────────────────────────────────────────────────
function calcPNR(totalFuel: number, fuelReserve: number, gs_out: number, gs_return: number, fuelFlow: number) {
  const usableFuel = totalFuel - fuelReserve;
  if (usableFuel <= 0 || fuelFlow <= 0) return null;
  const enduranceHr = usableFuel / fuelFlow;
  const pnrTime = enduranceHr * gs_return / (gs_out + gs_return);
  const pnrDist = pnrTime * gs_out;
  const fuelToReturn = (pnrDist / gs_return) * fuelFlow;
  return { pnrDistNm: Math.round(pnrDist), pnrTimeMin: Math.round(pnrTime * 60), fuelToReturn: Math.round(fuelToReturn) };
}

// ─── ETP (Equal Time Point / Critical Point) ─────────────────────────────────
function calcETP(totalDistNm: number, gs_out: number, gs_return: number) {
  if (gs_out <= 0 || gs_return <= 0) return null;
  const etpDist = totalDistNm * gs_return / (gs_out + gs_return);
  const etpTimeMin = (etpDist / gs_out) * 60;
  return { etpDistNm: Math.round(etpDist), etpTimeMin: Math.round(etpTimeMin) };
}

type Section = "isa" | "vdp" | "intercept" | "mda" | "pnr" | "etp";

export function MoreCX3() {
  const [section, setSection] = useState<Section>("isa");

  // VDP
  const [hat, setHat] = useState("");
  const [glideAngle, setGlideAngle] = useState("3.0");
  const [mapDist, setMapDist] = useState("");

  // Intercept
  const [currHdg, setCurrHdg] = useState("");
  const [desCourse, setDesCourse] = useState("");
  const [interceptAngle, setInterceptAngle] = useState("30");

  // MDA/DA approach
  const [mdaAlt, setMdaAlt] = useState("");
  const [touchdownElev, setTouchdownElev] = useState("");
  const [rwyLength, setRwyLength] = useState("");
  const [approachSpd, setApproachSpd] = useState("");
  const [altimeter, setAltimeter] = useState("29.92");

  // PNR
  const [pnrTotalFuel, setPnrTotalFuel] = useState("");
  const [pnrReserve,   setPnrReserve]   = useState("");
  const [pnrGsOut,     setPnrGsOut]     = useState("");
  const [pnrGsReturn,  setPnrGsReturn]  = useState("");
  const [pnrFlow,      setPnrFlow]      = useState("");

  // ETP
  const [etpDist,     setEtpDist]     = useState("");
  const [etpGsOut,    setEtpGsOut]    = useState("");
  const [etpGsReturn, setEtpGsReturn] = useState("");

  const vdpResult = useMemo(() => {
    const h = safeNum(hat);
    const a = safeNum(glideAngle) ?? 3;
    const map = safeNum(mapDist);
    if (h === null || h <= 0) return null;
    const dist = vdp(h, a);
    const mapOffset = map !== null ? map - dist : null;
    return { dist, mapOffset };
  }, [hat, glideAngle, mapDist]);

  const interceptResult = useMemo(() => {
    const ch = safeNum(currHdg);
    const dc = safeNum(desCourse);
    const ia = safeNum(interceptAngle) ?? 30;
    if (ch === null || dc === null) return null;
    return interceptHeading(ch, dc, ia);
  }, [currHdg, desCourse, interceptAngle]);

  const mdaResult = useMemo(() => {
    const mda = safeNum(mdaAlt);
    const tdz = safeNum(touchdownElev);
    const alt = safeNum(altimeter) ?? 29.92;
    const spd = safeNum(approachSpd);
    const rwy = safeNum(rwyLength);
    if (mda === null || tdz === null) return null;
    const hat = mda - tdz;
    const pa = pressureAltitude(mda, alt);
    const visualRange = hat > 0 && spd !== null ? Math.round((spd / 3600) * 100 * 5280 / 6076.12 * 10) / 10 : null;
    const ldaNeeded = rwy !== null ? rwy : null;
    return { hat, pa, visualRange };
  }, [mdaAlt, touchdownElev, altimeter, approachSpd, rwyLength]);

  const isaRows = useMemo(() => {
    const alts = [-1000, 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 12000, 14000, 16000, 18000, 20000, 25000, 30000, 35000, 40000, 45000];
    return alts.map(isaTableRow);
  }, []);

  const pnrResult = useMemo(() => {
    const tf = safeNum(pnrTotalFuel);
    const rv = safeNum(pnrReserve) ?? 0;
    const go = safeNum(pnrGsOut);
    const gr = safeNum(pnrGsReturn);
    const ff = safeNum(pnrFlow);
    if (tf === null || go === null || gr === null || ff === null || go <= 0 || gr <= 0) return null;
    return calcPNR(tf, rv, go, gr, ff);
  }, [pnrTotalFuel, pnrReserve, pnrGsOut, pnrGsReturn, pnrFlow]);

  const etpResult = useMemo(() => {
    const d  = safeNum(etpDist);
    const go = safeNum(etpGsOut);
    const gr = safeNum(etpGsReturn);
    if (d === null || go === null || gr === null || d <= 0 || go <= 0 || gr <= 0) return null;
    return calcETP(d, go, gr);
  }, [etpDist, etpGsOut, etpGsReturn]);

  const sections: { id: Section; label: string }[] = [
    { id: "isa",       label: "ISA Atmosphere" },
    { id: "vdp",       label: "VDP" },
    { id: "intercept", label: "Intercept" },
    { id: "mda",       label: "MDA/HAT" },
    { id: "pnr",       label: "PNR" },
    { id: "etp",       label: "ETP/CP" },
  ];

  return (
    <div className="p-5">
      <div className="flex gap-2 flex-wrap mb-6">
        {sections.map((s) => (
          <button
            key={s.id}
            data-testid={`more-section-${s.id}`}
            onClick={() => setSection(s.id)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              section === s.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── ISA Standard Atmosphere Table ── */}
      {section === "isa" && (
        <div>
          <p className="text-xs text-muted-foreground mb-3">ICAO International Standard Atmosphere — standard values at each altitude.</p>
          <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="bg-muted/60 border-b border-border">
                  <th className="px-3 py-2 text-left text-muted-foreground font-semibold uppercase tracking-wide">Alt (ft)</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-semibold uppercase tracking-wide">Temp °C</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-semibold uppercase tracking-wide">Temp °F</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-semibold uppercase tracking-wide">Press hPa</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-semibold uppercase tracking-wide">Press inHg</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-semibold uppercase tracking-wide">Density σ</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-semibold uppercase tracking-wide">SoS (kt)</th>
                </tr>
              </thead>
              <tbody>
                {isaRows.map((row) => (
                  <tr key={row.altFt} data-testid={`isa-row-${row.altFt}`} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-1.5 text-foreground font-bold">{row.altFt.toLocaleString()}</td>
                    <td className={`px-3 py-1.5 text-right ${row.tempC < 0 ? "text-accent" : "text-foreground"}`}>{row.tempC}</td>
                    <td className="px-3 py-1.5 text-right text-muted-foreground">{row.tempF}</td>
                    <td className="px-3 py-1.5 text-right text-foreground">{row.pressHpa}</td>
                    <td className="px-3 py-1.5 text-right text-muted-foreground">{row.pressInhg}</td>
                    <td className="px-3 py-1.5 text-right text-primary">{row.sigma}</td>
                    <td className="px-3 py-1.5 text-right text-accent">{row.speedOfSound}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── VDP ── */}
      {section === "vdp" && (
        <div>
          <p className="text-xs text-muted-foreground mb-4">
            <strong className="text-foreground">Visual Descent Point (VDP)</strong> — the point on a non-precision approach from which a normal descent from MDA to touchdown can be made. VDP distance = HAT / tan(angle).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="hat-vdp">HAT <span className="text-xs text-muted-foreground">(Height Above Touchdown)</span></Label>
              <div className="relative">
                <Input id="hat-vdp" data-testid="input-hat" placeholder="feet" value={hat} onChange={(e) => setHat(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">ft</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="glide-vdp">Glidepath Angle</Label>
              <div className="relative">
                <Input id="glide-vdp" data-testid="input-glide-vdp" placeholder="3.0" value={glideAngle} onChange={(e) => setGlideAngle(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">°</span>
              </div>
              <div className="flex gap-1">
                {["2.5", "3.0", "3.5"].map((a) => (
                  <button key={a} onClick={() => setGlideAngle(a)} className={`text-xs px-2 py-0.5 rounded border font-mono ${glideAngle === a ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{a}°</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="map-dist">MAP Distance <span className="text-xs text-muted-foreground">from threshold (opt)</span></Label>
              <div className="relative">
                <Input id="map-dist" data-testid="input-map-dist" placeholder="nm" value={mapDist} onChange={(e) => setMapDist(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">nm</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <ReadoutValue data-testid="result-vdp-dist" label="VDP from Threshold" value={vdpResult ? vdpResult.dist.toFixed(2) : "—"} unit="nm" tooltip="Distance from runway threshold at which to begin descent from MDA" />
            {vdpResult?.mapOffset !== null && vdpResult?.mapOffset !== undefined && (
              <ReadoutValue data-testid="result-map-offset" label="VDP before MAP" value={Math.abs(vdpResult.mapOffset).toFixed(2)} unit="nm" accent={vdpResult.mapOffset < 0 ? "destructive" : "accent"} tooltip="How far before the MAP the VDP occurs. Negative = VDP is past the MAP (cannot execute)" />
            )}
          </div>
        </div>
      )}

      {/* ── Course Intercept ── */}
      {section === "intercept" && (
        <div>
          <p className="text-xs text-muted-foreground mb-4">
            Compute the heading to fly to intercept a desired course at a given angle.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="curr-hdg-ic">Current Heading</Label>
              <div className="relative">
                <Input id="curr-hdg-ic" data-testid="input-curr-hdg" placeholder="0–360" value={currHdg} onChange={(e) => setCurrHdg(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">°</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="des-course-ic">Desired Course</Label>
              <div className="relative">
                <Input id="des-course-ic" data-testid="input-des-course" placeholder="0–360" value={desCourse} onChange={(e) => setDesCourse(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">°</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="intercept-ang">Intercept Angle</Label>
              <div className="relative">
                <Input id="intercept-ang" data-testid="input-intercept-angle" placeholder="30" value={interceptAngle} onChange={(e) => setInterceptAngle(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">°</span>
              </div>
              <div className="flex gap-1">
                {["20", "30", "45", "60"].map((a) => (
                  <button key={a} onClick={() => setInterceptAngle(a)} className={`text-xs px-2 py-0.5 rounded border font-mono ${interceptAngle === a ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{a}°</button>
                ))}
              </div>
            </div>
          </div>
          <div className="max-w-xs">
            <ReadoutValue data-testid="result-intercept-hdg" label="Intercept Heading" value={interceptResult ? interceptResult.hdg.toFixed(1) : "—"} unit="°" tooltip="Fly this heading to intercept the desired course at the entered angle" />
          </div>
        </div>
      )}

      {/* ── MDA / HAT ── */}
      {section === "mda" && (
        <div>
          <p className="text-xs text-muted-foreground mb-4">
            Compute HAT, pressure altitude at MDA, and approximate visual range needed.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="mda-alt">MDA / DA</Label>
              <div className="relative">
                <Input id="mda-alt" data-testid="input-mda" placeholder="ft MSL" value={mdaAlt} onChange={(e) => setMdaAlt(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">ft</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tdz-elev">TDZ Elevation</Label>
              <div className="relative">
                <Input id="tdz-elev" data-testid="input-tdz" placeholder="ft MSL" value={touchdownElev} onChange={(e) => setTouchdownElev(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">ft</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alt-mda">Altimeter Setting</Label>
              <div className="relative">
                <Input id="alt-mda" data-testid="input-alt-mda" placeholder="29.92" value={altimeter} onChange={(e) => setAltimeter(e.target.value)} className="pr-14" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">inHg</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apch-spd">Approach Speed <span className="text-xs text-muted-foreground">opt</span></Label>
              <div className="relative">
                <Input id="apch-spd" data-testid="input-apch-spd" placeholder="knots" value={approachSpd} onChange={(e) => setApproachSpd(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">kt</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ReadoutValue data-testid="result-hat" label="HAT" value={mdaResult ? mdaResult.hat.toLocaleString() : "—"} unit="ft" tooltip="Height Above Touchdown Zone elevation" />
            <ReadoutValue data-testid="result-mda-pa" label="Pressure Alt at MDA" value={mdaResult ? Math.round(mdaResult.pa).toLocaleString() : "—"} unit="ft" accent="muted" tooltip="Pressure altitude of the MDA — used for performance calculations" />
            {mdaResult?.visualRange !== null && mdaResult?.visualRange !== undefined && (
              <ReadoutValue data-testid="result-visual-range" label="~100-ft Segment" value={mdaResult.visualRange.toFixed(1)} unit="nm" accent="accent" tooltip="Approximate distance travelled in 100 ft of altitude at approach speed" />
            )}
          </div>
        </div>
      )}

      {/* ── PNR (Point of No Return) ── */}
      {section === "pnr" && (
        <div>
          <p className="text-xs text-muted-foreground mb-4">
            <strong className="text-foreground">Point of No Return (PNR)</strong> — the furthest point along a route from which you can still return to the departure point with your fuel reserve intact. Enter outbound/return ground speeds (accounting for wind) and fuel data.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="pnr-total">Total Usable Fuel</Label>
              <div className="relative">
                <Input id="pnr-total" data-testid="input-pnr-total" placeholder="US gal" value={pnrTotalFuel} onChange={(e) => setPnrTotalFuel(e.target.value)} className="pr-12" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">gal</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pnr-reserve">Reserve Fuel</Label>
              <div className="relative">
                <Input id="pnr-reserve" data-testid="input-pnr-reserve" placeholder="gal (0 if none)" value={pnrReserve} onChange={(e) => setPnrReserve(e.target.value)} className="pr-12" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">gal</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pnr-flow">Fuel Flow</Label>
              <div className="relative">
                <Input id="pnr-flow" data-testid="input-pnr-flow" placeholder="gal/hr" value={pnrFlow} onChange={(e) => setPnrFlow(e.target.value)} className="pr-14" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">gph</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pnr-gs-out">GS Outbound <span className="text-xs text-muted-foreground">(with wind)</span></Label>
              <div className="relative">
                <Input id="pnr-gs-out" data-testid="input-pnr-gs-out" placeholder="knots" value={pnrGsOut} onChange={(e) => setPnrGsOut(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">kt</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pnr-gs-ret">GS Return <span className="text-xs text-muted-foreground">(into wind)</span></Label>
              <div className="relative">
                <Input id="pnr-gs-ret" data-testid="input-pnr-gs-ret" placeholder="knots" value={pnrGsReturn} onChange={(e) => setPnrGsReturn(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">kt</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ReadoutValue data-testid="result-pnr-dist" label="PNR Distance" value={pnrResult ? pnrResult.pnrDistNm.toLocaleString() : "—"} unit="nm" accent="primary" tooltip="Distance from departure to Point of No Return" />
            <ReadoutValue data-testid="result-pnr-time" label="Time to PNR" value={pnrResult ? pnrResult.pnrTimeMin.toLocaleString() : "—"} unit="min" accent="accent" tooltip="Flight time from departure to the Point of No Return" />
            <ReadoutValue data-testid="result-pnr-fuel" label="Fuel at PNR" value={pnrResult ? pnrResult.fuelToReturn.toLocaleString() : "—"} unit="gal" accent="muted" tooltip="Fuel required to return from the PNR (equals reserve + return fuel)" />
          </div>
        </div>
      )}

      {/* ── ETP (Equal Time Point / Critical Point) ── */}
      {section === "etp" && (
        <div>
          <p className="text-xs text-muted-foreground mb-4">
            <strong className="text-foreground">Equal Time Point (ETP) / Critical Point</strong> — the point along a route where it takes the same time to continue to the destination as to return to the departure airport. Useful for go/no-go decisions mid-route. Enter total route distance and ground speeds in each direction.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="etp-dist">Total Route Distance</Label>
              <div className="relative">
                <Input id="etp-dist" data-testid="input-etp-dist" placeholder="nm" value={etpDist} onChange={(e) => setEtpDist(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">nm</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="etp-gs-out">GS to Destination</Label>
              <div className="relative">
                <Input id="etp-gs-out" data-testid="input-etp-gs-out" placeholder="knots" value={etpGsOut} onChange={(e) => setEtpGsOut(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">kt</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="etp-gs-ret">GS to Departure</Label>
              <div className="relative">
                <Input id="etp-gs-ret" data-testid="input-etp-gs-ret" placeholder="knots" value={etpGsReturn} onChange={(e) => setEtpGsReturn(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">kt</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <ReadoutValue data-testid="result-etp-dist" label="ETP Distance" value={etpResult ? etpResult.etpDistNm.toLocaleString() : "—"} unit="nm" accent="primary" tooltip="Distance from departure to the Equal Time Point" />
            <ReadoutValue data-testid="result-etp-time" label="Time to ETP" value={etpResult ? etpResult.etpTimeMin.toLocaleString() : "—"} unit="min" accent="accent" tooltip="Flight time to reach the Equal Time Point from departure" />
          </div>
          {etpResult && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50 text-xs text-muted-foreground">
              <p>Past the ETP ({etpResult.etpDistNm} nm), it is faster to <strong className="text-foreground">continue to destination</strong>.</p>
              <p>Before the ETP, it is faster to <strong className="text-foreground">return to departure</strong>.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
