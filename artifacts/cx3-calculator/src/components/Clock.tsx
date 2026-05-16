import { useState, useEffect, useRef, useCallback } from "react";

const TIMEZONES = [
  { label: "UTC", tz: "UTC" },
  { label: "New York (EST/EDT)", tz: "America/New_York" },
  { label: "Chicago (CST/CDT)", tz: "America/Chicago" },
  { label: "Denver (MST/MDT)", tz: "America/Denver" },
  { label: "Los Angeles (PST/PDT)", tz: "America/Los_Angeles" },
  { label: "Anchorage (AKST)", tz: "America/Anchorage" },
  { label: "Honolulu (HST)", tz: "Pacific/Honolulu" },
  { label: "London (GMT/BST)", tz: "Europe/London" },
  { label: "Paris (CET/CEST)", tz: "Europe/Paris" },
  { label: "Dubai (GST)", tz: "Asia/Dubai" },
  { label: "Mumbai (IST)", tz: "Asia/Kolkata" },
  { label: "Singapore (SGT)", tz: "Asia/Singapore" },
  { label: "Tokyo (JST)", tz: "Asia/Tokyo" },
  { label: "Sydney (AEST/AEDT)", tz: "Australia/Sydney" },
  { label: "Auckland (NZST/NZDT)", tz: "Pacific/Auckland" },
  { label: "São Paulo (BRT)", tz: "America/Sao_Paulo" },
  { label: "Johannesburg (SAST)", tz: "Africa/Johannesburg" },
  { label: "Moscow (MSK)", tz: "Europe/Moscow" },
  { label: "Beijing (CST)", tz: "Asia/Shanghai" },
  { label: "Seoul (KST)", tz: "Asia/Seoul" },
  { label: "Karachi (PKT)", tz: "Asia/Karachi" },
  { label: "Bangkok (ICT)", tz: "Asia/Bangkok" },
  { label: "Cairo (EET)", tz: "Africa/Cairo" },
  { label: "Nairobi (EAT)", tz: "Africa/Nairobi" },
  { label: "Reykjavik (GMT)", tz: "Atlantic/Reykjavik" },
];

export interface ClockTheme {
  id: string;
  name: string;
  face: string;
  faceStroke: string;
  hourHand: string;
  minuteHand: string;
  secondHand: string;
  tick: string;
  number: string;
  center: string;
  digitBg: string;
  digitText: string;
  digitAccent: string;
  digitLabel: string;
}

export const CLOCK_THEMES: ClockTheme[] = [
  {
    id: "classic", name: "Classic Black",
    face: "#1a1a1a", faceStroke: "#444", hourHand: "#f0f0f0", minuteHand: "#e0e0e0",
    secondHand: "#F59E0B", tick: "#888", number: "#e0e0e0", center: "#F59E0B",
    digitBg: "#111", digitText: "#f0f0f0", digitAccent: "#F59E0B", digitLabel: "#888",
  },
  {
    id: "aviation-blue", name: "Aviation Blue",
    face: "#0a1628", faceStroke: "#1e4080", hourHand: "#7eb8f7", minuteHand: "#a8d4ff",
    secondHand: "#00d4ff", tick: "#2a5090", number: "#7eb8f7", center: "#00d4ff",
    digitBg: "#061020", digitText: "#a8d4ff", digitAccent: "#00d4ff", digitLabel: "#2a5090",
  },
  {
    id: "military-green", name: "Military Green",
    face: "#0a150a", faceStroke: "#2a4a2a", hourHand: "#7db87d", minuteHand: "#a0d0a0",
    secondHand: "#39ff14", tick: "#2a4a2a", number: "#7db87d", center: "#39ff14",
    digitBg: "#060e06", digitText: "#a0d0a0", digitAccent: "#39ff14", digitLabel: "#2a4a2a",
  },
  {
    id: "cockpit-amber", name: "Cockpit Amber",
    face: "#150a00", faceStroke: "#4a2800", hourHand: "#f0a830", minuteHand: "#f5c060",
    secondHand: "#ffd700", tick: "#4a2800", number: "#f0a830", center: "#ffd700",
    digitBg: "#0e0700", digitText: "#f5c060", digitAccent: "#ffd700", digitLabel: "#4a2800",
  },
  {
    id: "night-red", name: "Night Vision Red",
    face: "#150000", faceStroke: "#4a0000", hourHand: "#ff6666", minuteHand: "#ff9999",
    secondHand: "#ff3333", tick: "#4a0000", number: "#ff6666", center: "#ff3333",
    digitBg: "#0e0000", digitText: "#ff9999", digitAccent: "#ff3333", digitLabel: "#4a0000",
  },
  {
    id: "arctic-white", name: "Arctic White",
    face: "#f8fafc", faceStroke: "#cbd5e1", hourHand: "#1e293b", minuteHand: "#334155",
    secondHand: "#2563eb", tick: "#94a3b8", number: "#334155", center: "#2563eb",
    digitBg: "#f0f4f8", digitText: "#1e293b", digitAccent: "#2563eb", digitLabel: "#94a3b8",
  },
  {
    id: "purple-aurora", name: "Aurora Purple",
    face: "#08001a", faceStroke: "#3a1060", hourHand: "#c084fc", minuteHand: "#d8b4fe",
    secondHand: "#00ffff", tick: "#3a1060", number: "#c084fc", center: "#00ffff",
    digitBg: "#050010", digitText: "#d8b4fe", digitAccent: "#00ffff", digitLabel: "#3a1060",
  },
  {
    id: "gold-bronze", name: "Gold & Bronze",
    face: "#0d0800", faceStroke: "#5c3a00", hourHand: "#c8960c", minuteHand: "#e0b030",
    secondHand: "#ff8c00", tick: "#5c3a00", number: "#c8960c", center: "#ff8c00",
    digitBg: "#080500", digitText: "#e0b030", digitAccent: "#ff8c00", digitLabel: "#5c3a00",
  },
  {
    id: "matrix-green", name: "Matrix",
    face: "#000800", faceStroke: "#004000", hourHand: "#00ff41", minuteHand: "#39ff14",
    secondHand: "#80ff80", tick: "#004000", number: "#00ff41", center: "#80ff80",
    digitBg: "#000400", digitText: "#00ff41", digitAccent: "#80ff80", digitLabel: "#004000",
  },
  {
    id: "ice-blue", name: "Ice Blue",
    face: "#00101a", faceStroke: "#004060", hourHand: "#80d8ff", minuteHand: "#b0e8ff",
    secondHand: "#00e5ff", tick: "#004060", number: "#80d8ff", center: "#00e5ff",
    digitBg: "#000c14", digitText: "#b0e8ff", digitAccent: "#00e5ff", digitLabel: "#004060",
  },
];

function getTimeInTz(tz: string): { h: number; m: number; s: number; ms: number; dateStr: string; timeStr: string; tzAbbr: string } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    year: "numeric", month: "short", day: "2-digit",
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  const h = parseInt(get("hour")) % 24;
  const m = parseInt(get("minute"));
  const s = parseInt(get("second"));

  const dateStr = `${get("day")} ${get("month")} ${get("year")}`;
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  const timeStr = `${hh}:${mm}:${ss}`;

  let tzAbbr = tz;
  try {
    const abbr = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" }).formatToParts(now).find(p => p.type === "timeZoneName")?.value ?? tz;
    tzAbbr = abbr;
  } catch {}

  return { h, m, s, ms: now.getMilliseconds(), dateStr, timeStr, tzAbbr };
}

interface AnalogClockProps {
  theme: ClockTheme;
  h: number; m: number; s: number; ms: number;
}

function AnalogClock({ theme: t, h, m, s, ms }: AnalogClockProps) {
  const size = 220;
  const cx = size / 2;
  const r = size / 2 - 8;

  const secAngle = (s + ms / 1000) * 6 - 90;
  const minAngle = (m + s / 60) * 6 - 90;
  const hourAngle = ((h % 12) + m / 60) * 30 - 90;

  const hand = (angle: number, length: number, width: number, color: string, tail = 0) => {
    const rad = (angle * Math.PI) / 180;
    const x2 = cx + length * Math.cos(rad);
    const y2 = cx + length * Math.sin(rad);
    const tx = cx - tail * Math.cos(rad);
    const ty = cx - tail * Math.sin(rad);
    return <line x1={tx} y1={ty} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Face */}
      <circle cx={cx} cy={cx} r={r} fill={t.face} stroke={t.faceStroke} strokeWidth={2} />

      {/* Ticks */}
      {Array.from({ length: 60 }, (_, i) => {
        const angle = (i * 6 * Math.PI) / 180;
        const isMajor = i % 5 === 0;
        const innerR = isMajor ? r - 12 : r - 7;
        const x1 = cx + (r - 3) * Math.cos(angle);
        const y1 = cx + (r - 3) * Math.sin(angle);
        const x2 = cx + innerR * Math.cos(angle);
        const y2 = cx + innerR * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isMajor ? t.number : t.tick} strokeWidth={isMajor ? 2 : 1} />;
      })}

      {/* Hour numbers */}
      {Array.from({ length: 12 }, (_, i) => {
        const num = i === 0 ? 12 : i;
        const angle = ((i * 30 - 90) * Math.PI) / 180;
        const nr = r - 24;
        const x = cx + nr * Math.cos(angle);
        const y = cx + nr * Math.sin(angle) + 1;
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={t.number} fontSize={num === 12 || num === 6 ? "12" : "10"} fontFamily="monospace" fontWeight="bold">
            {num}
          </text>
        );
      })}

      {/* Hands */}
      {hand(hourAngle, r * 0.5, 5, t.hourHand, 8)}
      {hand(minAngle, r * 0.72, 3.5, t.minuteHand, 10)}
      {hand(secAngle, r * 0.82, 1.5, t.secondHand, 14)}

      {/* Center dot */}
      <circle cx={cx} cy={cx} r={5} fill={t.center} />
      <circle cx={cx} cy={cx} r={2} fill={t.face} />
    </svg>
  );
}

export function Clock() {
  const [mode, setMode] = useState<"digital" | "analog">("digital");
  const [tzIndex, setTzIndex] = useState(0);
  const [themeIndex, setThemeIndex] = useState(0);
  const [time, setTime] = useState(() => getTimeInTz(TIMEZONES[0].tz));
  const [showTzPicker, setShowTzPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    const tz = TIMEZONES[tzIndex].tz;
    const update = () => setTime(getTimeInTz(tz));
    update();
    const id = setInterval(update, 100);
    return () => clearInterval(id);
  }, [tzIndex]);

  const theme = CLOCK_THEMES[themeIndex];
  const tz = TIMEZONES[tzIndex];

  return (
    <div className="flex flex-col items-center" style={{ fontFamily: "monospace" }}>
      {/* Mode toggle */}
      <div className="flex gap-1 mb-3 bg-muted rounded-lg p-1">
        {(["digital", "analog"] as const).map((m) => (
          <button
            key={m}
            data-testid={`clock-mode-${m}`}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors capitalize ${
              mode === m ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Clock face */}
      {mode === "digital" ? (
        <div className="rounded-xl p-4 text-center w-[220px]" style={{ background: theme.digitBg, border: `1px solid ${theme.digitAccent}33` }}>
          <div className="text-4xl font-black tracking-widest" style={{ color: theme.digitText }}>{time.timeStr}</div>
          <div className="text-xs mt-1 font-semibold" style={{ color: theme.digitAccent }}>{time.tzAbbr}</div>
          <div className="text-xs mt-1 opacity-70" style={{ color: theme.digitLabel }}>{time.dateStr}</div>
        </div>
      ) : (
        <div className="rounded-xl p-2" style={{ background: theme.face }}>
          <AnalogClock theme={theme} h={time.h} m={time.m} s={time.s} ms={time.ms} />
          <div className="text-center text-xs mt-1 font-semibold" style={{ color: theme.secondHand }}>{time.tzAbbr}</div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2 mt-3">
        <div className="relative">
          <button
            data-testid="clock-tz-picker"
            onClick={() => { setShowTzPicker(!showTzPicker); setShowThemePicker(false); }}
            className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            {tz.label.split(" ")[0]}
          </button>
          {showTzPicker && (
            <div className="absolute top-full mt-1 right-0 bg-popover border border-border rounded-xl shadow-xl z-50 w-64 max-h-52 overflow-y-auto">
              {TIMEZONES.map((t, i) => (
                <button
                  key={t.tz}
                  data-testid={`clock-tz-${i}`}
                  onClick={() => { setTzIndex(i); setShowTzPicker(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors ${i === tzIndex ? "text-primary font-bold" : "text-foreground"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button
            data-testid="clock-theme-picker"
            onClick={() => { setShowThemePicker(!showThemePicker); setShowTzPicker(false); }}
            className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            {theme.name}
          </button>
          {showThemePicker && (
            <div className="absolute top-full mt-1 right-0 bg-popover border border-border rounded-xl shadow-xl z-50 w-48 max-h-52 overflow-y-auto">
              {CLOCK_THEMES.map((ct, i) => (
                <button
                  key={ct.id}
                  data-testid={`clock-theme-${ct.id}`}
                  onClick={() => { setThemeIndex(i); setShowThemePicker(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors ${i === themeIndex ? "text-primary font-bold" : "text-foreground"}`}
                >
                  <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ background: ct.secondHand }} />
                  {ct.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
