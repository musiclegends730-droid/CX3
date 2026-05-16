import { useState, useMemo } from "react";
import { ReadoutValue } from "@/components/ui/ReadoutValue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  trueAirspeed,
  calibratedAirspeed,
  equivalentAirspeed,
  tasFromMach,
  casFromMach,
  easFromMach,
  speedOfSound,
  machNumber,
  isaDeviation,
  fToC,
  pressureAltitude,
  STD_PRESSURE_INHG,
} from "@/lib/aviation-calc";

type Mode = "cas-to-tas" | "tas-to-cas" | "mach-to-all";

function safeNum(v: string): number | null {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function InlineUnit({ u }: { u: string }) {
  return <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">{u}</span>;
}

export function TrueAirspeed() {
  const [mode, setMode] = useState<Mode>("cas-to-tas");
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");

  // CAS → TAS inputs
  const [cas, setCas] = useState("");
  const [pressureAlt, setPressureAlt] = useState("");
  const [oat, setOat] = useState("");

  // TAS → CAS inputs
  const [tas2, setTas2] = useState("");
  const [pa2, setPa2] = useState("");
  const [oat2, setOat2] = useState("");

  // Mach inputs
  const [mach, setMach] = useState("");
  const [pa3, setPa3] = useState("");
  const [oat3, setOat3] = useState("");

  const oatC = (raw: string) => {
    const n = safeNum(raw);
    if (n === null) return null;
    return tempUnit === "F" ? fToC(n) : n;
  };

  const r1 = useMemo(() => {
    const c = safeNum(cas); const pa = safeNum(pressureAlt); const t = oatC(oat);
    if (c === null || pa === null || t === null) return null;
    const tas = trueAirspeed(c, pa, t);
    const eas = equivalentAirspeed(tas, pa);
    const mach = machNumber(tas, t);
    const isaDev = isaDeviation(pa, t);
    const sos = speedOfSound(t);
    return { tas, eas, mach, isaDev, sos, oatC: t };
  }, [cas, pressureAlt, oat, tempUnit]);

  const r2 = useMemo(() => {
    const t = safeNum(tas2); const pa = safeNum(pa2); const temp = oatC(oat2);
    if (t === null || pa === null || temp === null) return null;
    const cas = calibratedAirspeed(t, pa, temp);
    const eas = equivalentAirspeed(t, pa);
    const mach = machNumber(t, temp);
    const isaDev = isaDeviation(pa, temp);
    const sos = speedOfSound(temp);
    return { cas, eas, mach, isaDev, sos, oatC: temp };
  }, [tas2, pa2, oat2, tempUnit]);

  const r3 = useMemo(() => {
    const m = safeNum(mach); const pa = safeNum(pa3); const temp = oatC(oat3);
    if (m === null || pa === null || temp === null) return null;
    const tas = tasFromMach(m, temp);
    const cas = casFromMach(m, pa, temp);
    const eas = easFromMach(m, pa, temp);
    const isaDev = isaDeviation(pa, temp);
    const sos = speedOfSound(temp);
    return { tas, cas, eas, isaDev, sos, oatC: temp };
  }, [mach, pa3, oat3, tempUnit]);

  const modes: { id: Mode; label: string }[] = [
    { id: "cas-to-tas", label: "CAS → TAS" },
    { id: "tas-to-cas", label: "TAS → CAS" },
    { id: "mach-to-all", label: "Mach → TAS/CAS" },
  ];

  const TempToggle = ({ valKey, setVal }: { valKey: string; setVal: (v: string) => void }) => (
    <button
      data-testid="toggle-temp-unit"
      onClick={() => setTempUnit((u) => (u === "C" ? "F" : "C"))}
      className="px-3 py-2 rounded-lg border border-border text-sm font-mono font-bold text-primary hover:bg-muted transition-colors min-w-[50px]"
    >
      °{tempUnit}
    </button>
  );

  const isaColor = (dev: number | null | undefined): "accent" | "destructive" | "muted" =>
    dev == null ? "muted" : dev > 0 ? "destructive" : dev < 0 ? "accent" : "muted";

  return (
    <div className="p-5">
      {/* Mode picker */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {modes.map((m) => (
          <button
            key={m.id}
            data-testid={`mode-${m.id}`}
            onClick={() => setMode(m.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              mode === m.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {m.label}
          </button>
        ))}
        <button
          data-testid="toggle-temp-unit-global"
          onClick={() => setTempUnit((u) => (u === "C" ? "F" : "C"))}
          className="ml-auto px-3 py-2 rounded-lg border border-border text-sm font-mono font-bold text-primary hover:bg-muted transition-colors"
        >
          OAT: °{tempUnit}
        </button>
      </div>

      {/* ── CAS → TAS ── */}
      {mode === "cas-to-tas" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="cas-input">CAS / IAS</Label>
              <div className="relative"><Input id="cas-input" data-testid="input-cas" placeholder="knots" value={cas} onChange={(e) => setCas(e.target.value)} className="pr-10" /><InlineUnit u="kt" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pa-input">Pressure Altitude</Label>
              <div className="relative"><Input id="pa-input" data-testid="input-pressure-alt" placeholder="feet" value={pressureAlt} onChange={(e) => setPressureAlt(e.target.value)} className="pr-10" /><InlineUnit u="ft" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oat-input">OAT</Label>
              <div className="relative"><Input id="oat-input" data-testid="input-oat" placeholder={`°${tempUnit}`} value={oat} onChange={(e) => setOat(e.target.value)} className="pr-10" /><InlineUnit u={`°${tempUnit}`} /></div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <ReadoutValue data-testid="result-tas" label="TAS" value={r1 ? r1.tas.toFixed(1) : "—"} unit="kt" tooltip="True Airspeed — corrected for density" />
            <ReadoutValue data-testid="result-eas" label="EAS" value={r1 ? r1.eas.toFixed(1) : "—"} unit="kt" accent="muted" tooltip="Equivalent Airspeed — TAS corrected for pressure ratio (compressibility)" />
            <ReadoutValue data-testid="result-mach" label="Mach" value={r1 ? r1.mach.toFixed(3) : "—"} unit="M" accent="accent" tooltip="Mach number — TAS / speed of sound at OAT" />
            <ReadoutValue data-testid="result-sos" label="Speed of Sound" value={r1 ? r1.sos.toFixed(0) : "—"} unit="kt" accent="muted" tooltip="Local speed of sound at OAT" />
            <ReadoutValue data-testid="result-isa-dev" label="ISA Dev" value={r1 ? (r1.isaDev > 0 ? "+" : "") + r1.isaDev.toFixed(1) : "—"} unit="°C" accent={isaColor(r1?.isaDev)} tooltip="Deviation from ISA standard temperature at pressure altitude" />
            <ReadoutValue data-testid="result-oat-c" label="OAT" value={r1 ? r1.oatC.toFixed(1) : "—"} unit="°C" accent="muted" tooltip="Outside air temperature in Celsius" />
          </div>
        </>
      )}

      {/* ── TAS → CAS ── */}
      {mode === "tas-to-cas" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="tas2-input">TAS</Label>
              <div className="relative"><Input id="tas2-input" data-testid="input-tas2" placeholder="knots" value={tas2} onChange={(e) => setTas2(e.target.value)} className="pr-10" /><InlineUnit u="kt" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pa2-input">Pressure Altitude</Label>
              <div className="relative"><Input id="pa2-input" data-testid="input-pa2" placeholder="feet" value={pa2} onChange={(e) => setPa2(e.target.value)} className="pr-10" /><InlineUnit u="ft" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oat2-input">OAT</Label>
              <div className="relative"><Input id="oat2-input" data-testid="input-oat2" placeholder={`°${tempUnit}`} value={oat2} onChange={(e) => setOat2(e.target.value)} className="pr-10" /><InlineUnit u={`°${tempUnit}`} /></div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <ReadoutValue data-testid="result-cas" label="CAS / IAS" value={r2 ? r2.cas.toFixed(1) : "—"} unit="kt" tooltip="Calibrated Airspeed to set on the airspeed indicator" />
            <ReadoutValue data-testid="result-eas2" label="EAS" value={r2 ? r2.eas.toFixed(1) : "—"} unit="kt" accent="muted" tooltip="Equivalent Airspeed" />
            <ReadoutValue data-testid="result-mach2" label="Mach" value={r2 ? r2.mach.toFixed(3) : "—"} unit="M" accent="accent" tooltip="Mach number" />
            <ReadoutValue data-testid="result-sos2" label="Speed of Sound" value={r2 ? r2.sos.toFixed(0) : "—"} unit="kt" accent="muted" tooltip="Local speed of sound" />
            <ReadoutValue data-testid="result-isa2" label="ISA Dev" value={r2 ? (r2.isaDev > 0 ? "+" : "") + r2.isaDev.toFixed(1) : "—"} unit="°C" accent={isaColor(r2?.isaDev)} tooltip="ISA temperature deviation" />
            <ReadoutValue data-testid="result-oat2-c" label="OAT" value={r2 ? r2.oatC.toFixed(1) : "—"} unit="°C" accent="muted" tooltip="Outside air temperature in Celsius" />
          </div>
        </>
      )}

      {/* ── Mach → TAS/CAS ── */}
      {mode === "mach-to-all" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="mach-input">Mach Number</Label>
              <div className="relative"><Input id="mach-input" data-testid="input-mach" placeholder="e.g. 0.82" value={mach} onChange={(e) => setMach(e.target.value)} className="pr-10" /><InlineUnit u="M" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pa3-input">Pressure Altitude</Label>
              <div className="relative"><Input id="pa3-input" data-testid="input-pa3" placeholder="feet" value={pa3} onChange={(e) => setPa3(e.target.value)} className="pr-10" /><InlineUnit u="ft" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oat3-input">OAT</Label>
              <div className="relative"><Input id="oat3-input" data-testid="input-oat3" placeholder={`°${tempUnit}`} value={oat3} onChange={(e) => setOat3(e.target.value)} className="pr-10" /><InlineUnit u={`°${tempUnit}`} /></div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <ReadoutValue data-testid="result-tas3" label="TAS" value={r3 ? r3.tas.toFixed(1) : "—"} unit="kt" tooltip="True Airspeed from Mach" />
            <ReadoutValue data-testid="result-cas3" label="CAS / IAS" value={r3 ? r3.cas.toFixed(1) : "—"} unit="kt" accent="accent" tooltip="Calibrated Airspeed from Mach" />
            <ReadoutValue data-testid="result-eas3" label="EAS" value={r3 ? r3.eas.toFixed(1) : "—"} unit="kt" accent="muted" tooltip="Equivalent Airspeed from Mach" />
            <ReadoutValue data-testid="result-sos3" label="Speed of Sound" value={r3 ? r3.sos.toFixed(0) : "—"} unit="kt" accent="muted" tooltip="Local speed of sound at OAT" />
            <ReadoutValue data-testid="result-isa3" label="ISA Dev" value={r3 ? (r3.isaDev > 0 ? "+" : "") + r3.isaDev.toFixed(1) : "—"} unit="°C" accent={isaColor(r3?.isaDev)} tooltip="ISA temperature deviation" />
            <ReadoutValue data-testid="result-oat3-c" label="OAT" value={r3 ? r3.oatC.toFixed(1) : "—"} unit="°C" accent="muted" tooltip="OAT in Celsius" />
          </div>
        </>
      )}

      <div className="mt-5 p-3 bg-muted/30 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground font-mono">
          ISA = 15°C − PA×0.001981 &nbsp;|&nbsp; a = 38.97√T_K kt &nbsp;|&nbsp; EAS = TAS×√(P/P₀) &nbsp;|&nbsp; Density ratio = (P/P₀)/(T/T₀)
        </p>
      </div>
    </div>
  );
}
