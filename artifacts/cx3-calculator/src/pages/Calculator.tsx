import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WindTriangle } from "@/components/WindTriangle";
import { TrueAirspeed } from "@/components/TrueAirspeed";
import { AltitudeCalc } from "@/components/AltitudeCalc";
import { TimeSpeedDistance } from "@/components/TimeSpeedDistance";
import { FuelCalc } from "@/components/FuelCalc";
import { WindComponents } from "@/components/WindComponents";
import { WeightBalance } from "@/components/WeightBalance";
import { Conversions } from "@/components/Conversions";
import { Corrections } from "@/components/Corrections";
import { Performance } from "@/components/Performance";
import { MoreCX3 } from "@/components/MoreCX3";
import { Clock } from "@/components/Clock";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { THEMES } from "@/lib/themes";
import {
  Wind, Navigation, ArrowUpRight,
  Timer, Fuel, Plane, Scale, Repeat, Compass,
  Activity, MoreHorizontal, Clock as ClockIcon,
  Palette, Shield, LogOut, ChevronDown, Search,
  Smartphone, Tablet, Monitor, X
} from "lucide-react";

// ─── Device Presets ──────────────────────────────────────────────────────────
interface DevicePreset {
  id: string;
  label: string;
  category: "phone" | "tablet" | "desktop";
  width: number | null;
  height: number | null;
  os: string;
}

const DEVICES: DevicePreset[] = [
  { id: "desktop",     label: "Desktop",            category: "desktop", os: "",        width: null, height: null },
  // Android Phones
  { id: "pixel-7",     label: "Android (Pixel 7)",  category: "phone",   os: "android", width: 412,  height: 915  },
  { id: "samsung-s23", label: "Samsung Galaxy S23",  category: "phone",   os: "android", width: 360,  height: 780  },
  { id: "samsung-a54", label: "Samsung Galaxy A54",  category: "phone",   os: "android", width: 393,  height: 851  },
  { id: "pixel-7-pro", label: "Android (Pixel 7 Pro)",category:"phone",   os: "android", width: 480,  height: 1040 },
  // iPhones
  { id: "iphone-se",   label: "iPhone SE (3rd gen)", category: "phone",   os: "ios",     width: 375,  height: 667  },
  { id: "iphone-14",   label: "iPhone 14",           category: "phone",   os: "ios",     width: 390,  height: 844  },
  { id: "iphone-14pm", label: "iPhone 14 Pro Max",   category: "phone",   os: "ios",     width: 430,  height: 932  },
  { id: "iphone-15",   label: "iPhone 15 Pro",       category: "phone",   os: "ios",     width: 393,  height: 852  },
  // Android Tablets
  { id: "pixel-tab",   label: "Android Tablet",      category: "tablet",  os: "android", width: 834,  height: 1194 },
  { id: "samsung-tab", label: "Samsung Galaxy Tab",   category: "tablet",  os: "android", width: 800,  height: 1280 },
  // iPads
  { id: "ipad",        label: "iPad (10th gen)",      category: "tablet",  os: "ios",     width: 820,  height: 1180 },
  { id: "ipad-air",    label: "iPad Air",             category: "tablet",  os: "ios",     width: 820,  height: 1180 },
  { id: "ipad-pro-11", label: "iPad Pro 11\"",        category: "tablet",  os: "ios",     width: 834,  height: 1194 },
  { id: "ipad-pro-13", label: "iPad Pro 13\"",        category: "tablet",  os: "ios",     width: 1024, height: 1366 },
];

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { value: "wind",       label: "Wind Triangle",                short: "Wind",    icon: <Navigation className="w-3.5 h-3.5" /> },
  { value: "tas",        label: "Airspeed (TAS/CAS/EAS/Mach)",  short: "Airspd",  icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
  { value: "alt",        label: "Altitude (PA/DA/TA)",          short: "Altitude", icon: <Plane className="w-3.5 h-3.5" /> },
  { value: "tsd",        label: "Time / Speed / Distance",       short: "T/S/D",   icon: <Timer className="w-3.5 h-3.5" /> },
  { value: "fuel",       label: "Fuel Planning & Weight",        short: "Fuel",    icon: <Fuel className="w-3.5 h-3.5" /> },
  { value: "components", label: "Crosswind Components",          short: "X-Wind",  icon: <Wind className="w-3.5 h-3.5" /> },
  { value: "perf",       label: "Performance (Stall/Climb/Glide)",short: "Perf",  icon: <Activity className="w-3.5 h-3.5" /> },
  { value: "wb",         label: "Weight & Balance",              short: "Wt&Bal",  icon: <Scale className="w-3.5 h-3.5" /> },
  { value: "conv",       label: "Unit Conversions",              short: "Convert", icon: <Repeat className="w-3.5 h-3.5" /> },
  { value: "corr",       label: "Heading & Corrections",         short: "Correct", icon: <Compass className="w-3.5 h-3.5" /> },
  { value: "more",       label: "More (VDP/ISA/Intercept/PNR)",  short: "More",    icon: <MoreHorizontal className="w-3.5 h-3.5" /> },
];

function DeviceIcon({ category, os, size = 16 }: { category: string; os: string; size?: number }) {
  if (category === "desktop") return <Monitor style={{ width: size, height: size }} />;
  if (category === "tablet")  return <Tablet  style={{ width: size, height: size }} />;
  return <Smartphone style={{ width: size, height: size }} />;
}

export default function Calculator() {
  const { user, logout } = useAuth();
  const { currentTheme, setTheme, themes } = useTheme();
  const [activeTab, setActiveTab]         = useState("wind");
  const [showClock, setShowClock]         = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu]   = useState(false);
  const [showFnDropdown, setShowFnDropdown] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [fnSearch, setFnSearch]           = useState("");
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(DEVICES[0]);

  const filteredTabs = TABS.filter(
    (t) =>
      !fnSearch ||
      t.label.toLowerCase().includes(fnSearch.toLowerCase()) ||
      t.short.toLowerCase().includes(fnSearch.toLowerCase())
  );

  const activeTabMeta = TABS.find((t) => t.value === activeTab);
  const isDeviceMode  = selectedDevice.category !== "desktop";
  const deviceWidth   = selectedDevice.width  ?? undefined;
  const deviceHeight  = selectedDevice.height ?? undefined;

  const deviceGroups = [
    { label: "Android Phones",  devices: DEVICES.filter(d => d.category === "phone"  && d.os === "android") },
    { label: "iPhones",         devices: DEVICES.filter(d => d.category === "phone"  && d.os === "ios") },
    { label: "Android Tablets", devices: DEVICES.filter(d => d.category === "tablet" && d.os === "android") },
    { label: "iPads",           devices: DEVICES.filter(d => d.category === "tablet" && d.os === "ios") },
  ];

  // ── The actual calculator UI (reused in both desktop and device modes) ──
  const calculatorContent = (
    <div className={isDeviceMode ? "p-3" : "max-w-5xl mx-auto p-3 sm:p-5 lg:p-8"}>

      {/* ── Header ── */}
      <header className="mb-4">
        <div className="flex items-center gap-2 flex-wrap">

          {/* Logo */}
          <div className="flex items-center gap-2 mr-auto min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-mono font-black text-sm shadow-lg shrink-0">
              CX3
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-foreground leading-tight truncate">CX-3 Flight Computer</h1>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest hidden sm:block">Aviation Calculation Engine</p>
            </div>
          </div>

          {/* Clock toggle */}
          <button
            data-testid="toggle-clock"
            onClick={() => setShowClock(!showClock)}
            title="Toggle clock"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs transition-colors shrink-0 ${
              showClock ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <ClockIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">Clock</span>
          </button>

          {/* Device picker */}
          <div className="relative shrink-0">
            <button
              data-testid="toggle-device-menu"
              onClick={() => { setShowDeviceMenu(!showDeviceMenu); setShowThemeMenu(false); setShowUserMenu(false); }}
              title="Device preview"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                isDeviceMode
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <DeviceIcon category={selectedDevice.category} os={selectedDevice.os} size={14} />
              <span className="hidden sm:inline font-semibold truncate max-w-[70px]">
                {isDeviceMode ? selectedDevice.label : "Device"}
              </span>
            </button>
            {showDeviceMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowDeviceMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-xl shadow-2xl z-40 w-60 max-h-96 overflow-y-auto">
                  {/* Desktop option */}
                  <button
                    data-testid="device-desktop"
                    onClick={() => { setSelectedDevice(DEVICES[0]); setShowDeviceMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm border-b border-border transition-colors ${
                      selectedDevice.id === "desktop" ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Monitor className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left">Desktop (default)</span>
                  </button>
                  {deviceGroups.map((group) => (
                    <div key={group.label}>
                      <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/40 border-b border-border">
                        {group.label}
                      </p>
                      {group.devices.map((d) => (
                        <button
                          key={d.id}
                          data-testid={`device-${d.id}`}
                          onClick={() => { setSelectedDevice(d); setShowDeviceMenu(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors ${
                            selectedDevice.id === d.id ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                          }`}
                        >
                          <DeviceIcon category={d.category} os={d.os} size={14} />
                          <span className="flex-1 text-left text-xs">{d.label}</span>
                          <span className="text-[10px] font-mono text-muted-foreground shrink-0">{d.width}×{d.height}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Theme picker */}
          <div className="relative shrink-0">
            <button
              data-testid="toggle-theme-menu"
              onClick={() => { setShowThemeMenu(!showThemeMenu); setShowUserMenu(false); setShowDeviceMenu(false); }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs shrink-0"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-semibold">{currentTheme.name}</span>
            </button>
            {showThemeMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowThemeMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-xl shadow-2xl z-40 w-56 max-h-72 overflow-y-auto">
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">App Theme</p>
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      data-testid={`theme-pick-${t.id}`}
                      onClick={() => { setTheme(t.id); setShowThemeMenu(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors ${t.id === currentTheme.id ? "text-primary font-semibold" : "text-foreground"}`}
                    >
                      <div className="flex gap-1 shrink-0">
                        {t.preview.map((c, i) => <span key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
                      </div>
                      {t.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative shrink-0">
            <button
              data-testid="toggle-user-menu"
              onClick={() => { setShowUserMenu(!showUserMenu); setShowThemeMenu(false); setShowDeviceMenu(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs"
            >
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-[10px] text-primary font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <span className="hidden sm:inline font-semibold max-w-[70px] truncate">{user?.name}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-xl shadow-2xl z-40 w-48">
                  <div className="px-3 py-2.5 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{user?.email}</p>
                  </div>
                  {user?.role === "admin" && (
                    <a
                      href="/admin"
                      data-testid="link-admin"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors w-full"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Shield className="w-4 h-4 text-primary" /> Admin Panel
                    </a>
                  )}
                  <button
                    data-testid="btn-logout"
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-muted transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Clock widget */}
        {showClock && (
          <div className="mt-3 p-3 bg-card border border-border rounded-xl flex justify-center">
            <Clock />
          </div>
        )}
      </header>

      {/* ── Function Selector Dropdown ── */}
      <div className="mb-3 relative">
        <button
          data-testid="fn-dropdown-toggle"
          onClick={() => setShowFnDropdown(!showFnDropdown)}
          className="flex items-center gap-2 w-full sm:w-auto px-3 py-2 bg-card border border-border rounded-xl text-sm hover:border-primary/50 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-foreground font-semibold flex-1 text-left text-xs truncate">{activeTabMeta?.label ?? "Select Function"}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />
        </button>
        {showFnDropdown && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => { setShowFnDropdown(false); setFnSearch(""); }} />
            <div className="absolute left-0 top-full mt-1 bg-popover border border-border rounded-xl shadow-2xl z-40 w-72">
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    data-testid="fn-search"
                    autoFocus
                    placeholder="Search functions…"
                    value={fnSearch}
                    onChange={(e) => setFnSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {filteredTabs.map((t) => (
                  <button
                    key={t.value}
                    data-testid={`fn-pick-${t.value}`}
                    onClick={() => { setActiveTab(t.value); setShowFnDropdown(false); setFnSearch(""); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted transition-colors ${t.value === activeTab ? "text-primary font-semibold bg-primary/5" : "text-foreground"}`}
                  >
                    <span className="text-muted-foreground">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
                {filteredTabs.length === 0 && (
                  <p className="px-3 py-4 text-xs text-muted-foreground text-center">No function matched "{fnSearch}"</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Calculator Tabs ── */}
      <main>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-1 scrollbar-none border-b border-border mb-3">
            <TabsList className="w-max inline-flex bg-transparent p-0 justify-start gap-0 h-auto rounded-none border-none">
              {TABS.map((t) => (
                <TabTrigger key={t.value} value={t.value} icon={t.icon} label={t.short} />
              ))}
            </TabsList>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden">
            <TabsContent value="wind"       className="m-0 focus-visible:outline-none"><WindTriangle /></TabsContent>
            <TabsContent value="tas"        className="m-0 focus-visible:outline-none"><TrueAirspeed /></TabsContent>
            <TabsContent value="alt"        className="m-0 focus-visible:outline-none"><AltitudeCalc /></TabsContent>
            <TabsContent value="tsd"        className="m-0 focus-visible:outline-none"><TimeSpeedDistance /></TabsContent>
            <TabsContent value="fuel"       className="m-0 focus-visible:outline-none"><FuelCalc /></TabsContent>
            <TabsContent value="components" className="m-0 focus-visible:outline-none"><WindComponents /></TabsContent>
            <TabsContent value="perf"       className="m-0 focus-visible:outline-none"><Performance /></TabsContent>
            <TabsContent value="wb"         className="m-0 focus-visible:outline-none"><WeightBalance /></TabsContent>
            <TabsContent value="conv"       className="m-0 focus-visible:outline-none"><Conversions /></TabsContent>
            <TabsContent value="corr"       className="m-0 focus-visible:outline-none"><Corrections /></TabsContent>
            <TabsContent value="more"       className="m-0 focus-visible:outline-none"><MoreCX3 /></TabsContent>
          </div>
        </Tabs>
      </main>

      <footer className="mt-4 text-center">
        <p className="text-[10px] text-muted-foreground font-mono">
          CX-3 Flight Computer &nbsp;·&nbsp; All calculations per FAA/ASA/ICAO standards &nbsp;·&nbsp; Not for navigation
        </p>
      </footer>
    </div>
  );

  // ── Desktop layout ──────────────────────────────────────────────────────────
  if (!isDeviceMode) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground font-sans">
        {calculatorContent}
      </div>
    );
  }

  // ── Device Preview layout ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-zinc-950 text-foreground font-sans flex flex-col items-center">

      {/* Device info banner */}
      <div className="w-full flex items-center justify-center gap-3 py-2 px-4 bg-zinc-900 border-b border-zinc-700 shrink-0">
        <DeviceIcon category={selectedDevice.category} os={selectedDevice.os} size={14} />
        <span className="text-xs font-semibold text-zinc-100">{selectedDevice.label}</span>
        <span className="text-[10px] font-mono text-zinc-400">{selectedDevice.width} × {selectedDevice.height} px</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
          selectedDevice.os === "android" ? "bg-green-900/60 text-green-300" : "bg-zinc-700/60 text-zinc-300"
        }`}>
          {selectedDevice.os === "android" ? "Android" : "iOS"}
        </span>
        <div className="flex-1" />
        <button
          data-testid="exit-device-preview"
          onClick={() => setSelectedDevice(DEVICES[0])}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-semibold transition-colors"
        >
          <X className="w-3 h-3" /> Exit Preview
        </button>
      </div>

      {/* Stage area */}
      <div className="flex-1 w-full flex items-start justify-center py-6 overflow-auto">
        <div
          className="relative flex flex-col shrink-0"
          style={{ width: deviceWidth }}
        >
          {/* Device chrome top bar */}
          <div
            className="rounded-t-[28px] px-4 pt-3 pb-1.5 flex items-center justify-between bg-zinc-800 border border-zinc-600 border-b-0"
            style={{ width: deviceWidth }}
          >
            <span className="text-[10px] font-mono text-zinc-300 font-semibold">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <div className="flex items-center gap-1">
              {/* Signal bars */}
              <span className="text-zinc-300 text-[10px]">▂▄▆</span>
              {selectedDevice.os !== "android" && (
                <span className="text-zinc-300 text-[10px] ml-1">WiFi</span>
              )}
              {/* Battery */}
              <span className="text-zinc-300 text-[10px] ml-1 border border-zinc-500 rounded-sm px-1">78%</span>
            </div>
          </div>

          {/* Device screen */}
          <div
            className="bg-background border border-zinc-600 border-t-0 overflow-y-auto overflow-x-hidden rounded-b-[28px]"
            style={{
              width: deviceWidth,
              height: deviceHeight ? Math.min(deviceHeight, window.innerHeight - 160) : undefined,
            }}
          >
            <div className="bg-background text-foreground">
              {calculatorContent}
            </div>
          </div>

          {/* Device home indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-zinc-500 opacity-60" />
        </div>
      </div>
    </div>
  );
}

function TabTrigger({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className="data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none border-b-2 border-b-transparent px-2.5 py-2 h-9 flex items-center gap-1 hover:bg-muted/40 transition-colors text-muted-foreground data-[state=active]:text-primary shrink-0"
    >
      {icon}
      <span className="font-semibold text-[11px]">{label}</span>
    </TabsTrigger>
  );
}
