export interface ThemeVars {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  cardBorder: string;
  border: string;
  input: string;
  ring: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  popover: string;
  popoverForeground: string;
  popoverBorder: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarBorder: string;
  radius: string;
}

export interface AppTheme {
  id: string;
  name: string;
  description: string;
  preview: string[];
  vars: ThemeVars;
}

const base: Pick<ThemeVars, 'radius'> = { radius: '0.5rem' };

export const THEMES: AppTheme[] = [
  {
    id: 'dark-navy',
    name: 'Dark Navy',
    description: 'Classic avionics dark panel — the default',
    preview: ['#0d1117', '#F59E0B', '#22D3A2'],
    vars: {
      ...base,
      background: '220 20% 8%', foreground: '210 20% 92%',
      card: '220 18% 12%', cardForeground: '210 20% 92%', cardBorder: '220 15% 22%',
      border: '220 15% 22%', input: '220 15% 22%', ring: '38 95% 57%',
      primary: '38 95% 57%', primaryForeground: '220 20% 8%',
      secondary: '220 15% 18%', secondaryForeground: '210 15% 75%',
      muted: '220 15% 16%', mutedForeground: '210 15% 55%',
      accent: '160 84% 39%', accentForeground: '220 20% 8%',
      destructive: '0 72% 51%', destructiveForeground: '210 20% 92%',
      popover: '220 18% 12%', popoverForeground: '210 20% 92%', popoverBorder: '220 15% 22%',
      sidebar: '220 18% 12%', sidebarForeground: '210 20% 92%', sidebarBorder: '220 15% 22%',
    },
  },
  {
    id: 'carbon-black',
    name: 'Carbon Black',
    description: 'Pure black with electric blue accents',
    preview: ['#000000', '#3B82F6', '#10B981'],
    vars: {
      ...base,
      background: '0 0% 4%', foreground: '0 0% 95%',
      card: '0 0% 8%', cardForeground: '0 0% 95%', cardBorder: '0 0% 15%',
      border: '0 0% 15%', input: '0 0% 15%', ring: '217 91% 60%',
      primary: '217 91% 60%', primaryForeground: '0 0% 4%',
      secondary: '0 0% 12%', secondaryForeground: '0 0% 72%',
      muted: '0 0% 10%', mutedForeground: '0 0% 50%',
      accent: '160 84% 39%', accentForeground: '0 0% 4%',
      destructive: '0 72% 51%', destructiveForeground: '0 0% 95%',
      popover: '0 0% 8%', popoverForeground: '0 0% 95%', popoverBorder: '0 0% 15%',
      sidebar: '0 0% 8%', sidebarForeground: '0 0% 95%', sidebarBorder: '0 0% 15%',
    },
  },
  {
    id: 'night-red',
    name: 'Night Vision Red',
    description: 'Red-safe for dark-adapted night flying',
    preview: ['#0a0000', '#FF3333', '#CC0000'],
    vars: {
      ...base,
      background: '0 50% 4%', foreground: '0 80% 85%',
      card: '0 50% 7%', cardForeground: '0 80% 85%', cardBorder: '0 60% 18%',
      border: '0 60% 18%', input: '0 60% 18%', ring: '0 100% 55%',
      primary: '0 100% 55%', primaryForeground: '0 50% 4%',
      secondary: '0 40% 12%', secondaryForeground: '0 60% 65%',
      muted: '0 40% 10%', mutedForeground: '0 50% 45%',
      accent: '0 90% 42%', accentForeground: '0 50% 4%',
      destructive: '30 100% 55%', destructiveForeground: '0 50% 4%',
      popover: '0 50% 7%', popoverForeground: '0 80% 85%', popoverBorder: '0 60% 18%',
      sidebar: '0 50% 7%', sidebarForeground: '0 80% 85%', sidebarBorder: '0 60% 18%',
    },
  },
  {
    id: 'cockpit-amber',
    name: 'Cockpit Amber',
    description: 'Warm amber tones — classic cockpit atmosphere',
    preview: ['#1a1100', '#FFB300', '#F59E0B'],
    vars: {
      ...base,
      background: '30 60% 5%', foreground: '40 80% 88%',
      card: '30 55% 9%', cardForeground: '40 80% 88%', cardBorder: '30 50% 20%',
      border: '30 50% 20%', input: '30 50% 20%', ring: '38 100% 50%',
      primary: '38 100% 50%', primaryForeground: '30 60% 5%',
      secondary: '30 40% 14%', secondaryForeground: '40 60% 70%',
      muted: '30 40% 11%', mutedForeground: '40 40% 50%',
      accent: '45 100% 40%', accentForeground: '30 60% 5%',
      destructive: '0 72% 51%', destructiveForeground: '40 80% 88%',
      popover: '30 55% 9%', popoverForeground: '40 80% 88%', popoverBorder: '30 50% 20%',
      sidebar: '30 55% 9%', sidebarForeground: '40 80% 88%', sidebarBorder: '30 50% 20%',
    },
  },
  {
    id: 'military-olive',
    name: 'Military Olive',
    description: 'Olive drab — military tactical style',
    preview: ['#0a0f00', '#6B7C3A', '#A3B839'],
    vars: {
      ...base,
      background: '80 30% 5%', foreground: '80 25% 88%',
      card: '80 25% 9%', cardForeground: '80 25% 88%', cardBorder: '80 20% 18%',
      border: '80 20% 18%', input: '80 20% 18%', ring: '80 65% 45%',
      primary: '80 65% 45%', primaryForeground: '80 30% 5%',
      secondary: '80 20% 14%', secondaryForeground: '80 20% 65%',
      muted: '80 20% 11%', mutedForeground: '80 15% 48%',
      accent: '100 60% 38%', accentForeground: '80 30% 5%',
      destructive: '10 80% 48%', destructiveForeground: '80 25% 88%',
      popover: '80 25% 9%', popoverForeground: '80 25% 88%', popoverBorder: '80 20% 18%',
      sidebar: '80 25% 9%', sidebarForeground: '80 25% 88%', sidebarBorder: '80 20% 18%',
    },
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    description: 'Deep midnight with cyan accents',
    preview: ['#030712', '#0EA5E9', '#06B6D4'],
    vars: {
      ...base,
      background: '222 84% 5%', foreground: '210 40% 92%',
      card: '222 74% 9%', cardForeground: '210 40% 92%', cardBorder: '222 50% 18%',
      border: '222 50% 18%', input: '222 50% 18%', ring: '198 89% 48%',
      primary: '198 89% 48%', primaryForeground: '222 84% 5%',
      secondary: '222 50% 14%', secondaryForeground: '210 30% 70%',
      muted: '222 50% 11%', mutedForeground: '210 25% 50%',
      accent: '186 90% 40%', accentForeground: '222 84% 5%',
      destructive: '0 72% 51%', destructiveForeground: '210 40% 92%',
      popover: '222 74% 9%', popoverForeground: '210 40% 92%', popoverBorder: '222 50% 18%',
      sidebar: '222 74% 9%', sidebarForeground: '210 40% 92%', sidebarBorder: '222 50% 18%',
    },
  },
  {
    id: 'radar-green',
    name: 'Radar Green',
    description: 'Classic radar screen — phosphor green on black',
    preview: ['#000000', '#00FF41', '#39FF14'],
    vars: {
      ...base,
      background: '0 0% 2%', foreground: '130 100% 75%',
      card: '130 100% 4%', cardForeground: '130 100% 75%', cardBorder: '130 80% 15%',
      border: '130 80% 15%', input: '130 80% 15%', ring: '130 100% 50%',
      primary: '130 100% 50%', primaryForeground: '0 0% 2%',
      secondary: '130 60% 8%', secondaryForeground: '130 80% 55%',
      muted: '130 60% 6%', mutedForeground: '130 60% 38%',
      accent: '140 100% 45%', accentForeground: '0 0% 2%',
      destructive: '0 100% 55%', destructiveForeground: '130 100% 75%',
      popover: '130 100% 4%', popoverForeground: '130 100% 75%', popoverBorder: '130 80% 15%',
      sidebar: '130 100% 4%', sidebarForeground: '130 100% 75%', sidebarBorder: '130 80% 15%',
    },
  },
  {
    id: 'arctic-white',
    name: 'Arctic White',
    description: 'Clean light theme — day operation',
    preview: ['#F8FAFC', '#1E40AF', '#059669'],
    vars: {
      ...base,
      background: '210 40% 98%', foreground: '222 47% 11%',
      card: '0 0% 100%', cardForeground: '222 47% 11%', cardBorder: '214 32% 88%',
      border: '214 32% 88%', input: '214 32% 88%', ring: '221 83% 53%',
      primary: '221 83% 53%', primaryForeground: '210 40% 98%',
      secondary: '210 40% 93%', secondaryForeground: '222 47% 20%',
      muted: '210 40% 95%', mutedForeground: '215 16% 47%',
      accent: '160 84% 39%', accentForeground: '210 40% 98%',
      destructive: '0 72% 51%', destructiveForeground: '210 40% 98%',
      popover: '0 0% 100%', popoverForeground: '222 47% 11%', popoverBorder: '214 32% 88%',
      sidebar: '210 40% 93%', sidebarForeground: '222 47% 11%', sidebarBorder: '214 32% 88%',
    },
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm sunset — dark with vivid orange accents',
    preview: ['#0f0700', '#F97316', '#FB923C'],
    vars: {
      ...base,
      background: '20 60% 4%', foreground: '30 80% 90%',
      card: '20 55% 8%', cardForeground: '30 80% 90%', cardBorder: '20 50% 18%',
      border: '20 50% 18%', input: '20 50% 18%', ring: '25 95% 55%',
      primary: '25 95% 55%', primaryForeground: '20 60% 4%',
      secondary: '20 40% 13%', secondaryForeground: '30 60% 68%',
      muted: '20 40% 10%', mutedForeground: '30 40% 50%',
      accent: '35 100% 48%', accentForeground: '20 60% 4%',
      destructive: '0 80% 55%', destructiveForeground: '30 80% 90%',
      popover: '20 55% 8%', popoverForeground: '30 80% 90%', popoverBorder: '20 50% 18%',
      sidebar: '20 55% 8%', sidebarForeground: '30 80% 90%', sidebarBorder: '20 50% 18%',
    },
  },
  {
    id: 'aurora-purple',
    name: 'Aurora Purple',
    description: 'Deep purple with aurora accents',
    preview: ['#070012', '#A855F7', '#22D3EE'],
    vars: {
      ...base,
      background: '270 60% 4%', foreground: '270 30% 92%',
      card: '270 50% 8%', cardForeground: '270 30% 92%', cardBorder: '270 40% 18%',
      border: '270 40% 18%', input: '270 40% 18%', ring: '270 95% 65%',
      primary: '270 95% 65%', primaryForeground: '270 60% 4%',
      secondary: '270 35% 13%', secondaryForeground: '270 25% 70%',
      muted: '270 35% 10%', mutedForeground: '270 20% 50%',
      accent: '186 90% 48%', accentForeground: '270 60% 4%',
      destructive: '0 72% 51%', destructiveForeground: '270 30% 92%',
      popover: '270 50% 8%', popoverForeground: '270 30% 92%', popoverBorder: '270 40% 18%',
      sidebar: '270 50% 8%', sidebarForeground: '270 30% 92%', sidebarBorder: '270 40% 18%',
    },
  },
  {
    id: 'bronze-copper',
    name: 'Bronze Copper',
    description: 'Warm metallic — antique instrument style',
    preview: ['#0d0700', '#B45309', '#D97706'],
    vars: {
      ...base,
      background: '25 40% 5%', foreground: '35 50% 88%',
      card: '25 38% 9%', cardForeground: '35 50% 88%', cardBorder: '25 35% 20%',
      border: '25 35% 20%', input: '25 35% 20%', ring: '30 90% 48%',
      primary: '30 90% 48%', primaryForeground: '25 40% 5%',
      secondary: '25 30% 14%', secondaryForeground: '35 35% 65%',
      muted: '25 30% 11%', mutedForeground: '35 25% 48%',
      accent: '20 85% 42%', accentForeground: '25 40% 5%',
      destructive: '0 72% 51%', destructiveForeground: '35 50% 88%',
      popover: '25 38% 9%', popoverForeground: '35 50% 88%', popoverBorder: '25 35% 20%',
      sidebar: '25 38% 9%', sidebarForeground: '35 50% 88%', sidebarBorder: '25 35% 20%',
    },
  },
  {
    id: 'slate-modern',
    name: 'Slate Modern',
    description: 'Neutral slate with indigo — modern clean look',
    preview: ['#0f172a', '#6366F1', '#22D3EE'],
    vars: {
      ...base,
      background: '222 47% 6%', foreground: '210 40% 92%',
      card: '222 47% 10%', cardForeground: '210 40% 92%', cardBorder: '220 35% 20%',
      border: '220 35% 20%', input: '220 35% 20%', ring: '239 84% 67%',
      primary: '239 84% 67%', primaryForeground: '222 47% 6%',
      secondary: '220 35% 15%', secondaryForeground: '210 30% 70%',
      muted: '220 35% 12%', mutedForeground: '210 25% 50%',
      accent: '186 90% 48%', accentForeground: '222 47% 6%',
      destructive: '0 72% 51%', destructiveForeground: '210 40% 92%',
      popover: '222 47% 10%', popoverForeground: '210 40% 92%', popoverBorder: '220 35% 20%',
      sidebar: '222 47% 10%', sidebarForeground: '210 40% 92%', sidebarBorder: '220 35% 20%',
    },
  },
];

export const DEFAULT_THEME_ID = 'dark-navy';

export function applyTheme(theme: AppTheme) {
  const root = document.documentElement;
  const v = theme.vars;
  root.style.setProperty('--background', v.background);
  root.style.setProperty('--foreground', v.foreground);
  root.style.setProperty('--card', v.card);
  root.style.setProperty('--card-foreground', v.cardForeground);
  root.style.setProperty('--card-border', v.cardBorder);
  root.style.setProperty('--border', v.border);
  root.style.setProperty('--input', v.input);
  root.style.setProperty('--ring', v.ring);
  root.style.setProperty('--primary', v.primary);
  root.style.setProperty('--primary-foreground', v.primaryForeground);
  root.style.setProperty('--secondary', v.secondary);
  root.style.setProperty('--secondary-foreground', v.secondaryForeground);
  root.style.setProperty('--muted', v.muted);
  root.style.setProperty('--muted-foreground', v.mutedForeground);
  root.style.setProperty('--accent', v.accent);
  root.style.setProperty('--accent-foreground', v.accentForeground);
  root.style.setProperty('--destructive', v.destructive);
  root.style.setProperty('--destructive-foreground', v.destructiveForeground);
  root.style.setProperty('--popover', v.popover);
  root.style.setProperty('--popover-foreground', v.popoverForeground);
  root.style.setProperty('--popover-border', v.popoverBorder);
  root.style.setProperty('--sidebar', v.sidebar);
  root.style.setProperty('--sidebar-foreground', v.sidebarForeground);
  root.style.setProperty('--sidebar-border', v.sidebarBorder);
  root.style.setProperty('--sidebar-primary', v.primary);
  root.style.setProperty('--sidebar-primary-foreground', v.primaryForeground);
  root.style.setProperty('--sidebar-accent', v.secondary);
  root.style.setProperty('--sidebar-accent-foreground', v.secondaryForeground);
  root.style.setProperty('--sidebar-ring', v.ring);
  root.style.setProperty('--radius', v.radius);
}

export function getThemeById(id: string): AppTheme {
  return THEMES.find(t => t.id === id) ?? THEMES[0];
}
