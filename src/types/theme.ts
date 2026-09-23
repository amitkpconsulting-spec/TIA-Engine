export type ThemeId = string;

export interface ThemeColors {
  bg: string;
  card: string;
  surface: string;
  elevated: string;
  elevatedHover: string;
  border: string;
  borderSubtle?: string;
  text: string;
  textStrong: string;
  textMuted: string;
  textSubtle: string;
  accent: string;
  accentHover?: string;
  accentText?: string;
  ring?: string;
  radius?: string;
  fontFamily?: string;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  code?: string;
  sourceLabel?: string;
  sourceUrl?: string;
  description: string;
  isDark: boolean;
  accentColor: string;
  bgPreviewColor: string;
  cardPreviewColor: string;
  badgeText: string;
  fontFamily: string;
  isCustom?: boolean;
  colors?: ThemeColors;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'stella',
    name: 'Stella (TweakCN)',
    code: 'cmm2mehjy000004ibgt6g0rbu',
    sourceLabel: 'tweakcn.com',
    sourceUrl: 'https://tweakcn.com/themes/cmm2mehjy000004ibgt6g0rbu',
    description: 'A bold, flat, minimal, retro, warm shadcn/ui theme by Mathys Basson',
    isDark: true,
    accentColor: '#FFAA6B',
    bgPreviewColor: '#120E09',
    cardPreviewColor: '#1C1710',
    badgeText: 'TweakCN Source',
    fontFamily: 'Montserrat, sans-serif',
  },
  {
    id: 'stella-light',
    name: 'Stella Light (TweakCN)',
    code: 'cmm2mehjy000004ibgt6g0rbu',
    sourceLabel: 'tweakcn.com',
    sourceUrl: 'https://tweakcn.com/themes/cmm2mehjy000004ibgt6g0rbu',
    description: 'Clean retro minimalist warm light variant with flat amber accents',
    isDark: false,
    accentColor: '#FFAA6B',
    bgPreviewColor: '#FFFFFF',
    cardPreviewColor: '#FDFBF7',
    badgeText: 'TweakCN Light',
    fontFamily: 'Montserrat, sans-serif',
  },
  {
    id: 'cyber',
    name: 'Obsidian Cyber',
    code: 'obsidian-cyber',
    description: 'High-contrast cryptographic security console with cyan & emerald accents',
    isDark: true,
    accentColor: '#06B6D4',
    bgPreviewColor: '#0A0A0B',
    cardPreviewColor: '#0F0F10',
    badgeText: 'Obsidian Tech',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'midnight',
    name: 'Midnight Executive',
    code: 'midnight-executive',
    description: 'Deep royal sapphire & slate for enterprise board compliance reporting',
    isDark: true,
    accentColor: '#38BDF8',
    bgPreviewColor: '#090D16',
    cardPreviewColor: '#0F172A',
    badgeText: 'Executive Navy',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'light',
    name: 'Nordic Clean Light',
    code: 'nordic-clean',
    description: 'Crisp daylight interface with slate typography and high legibility',
    isDark: false,
    accentColor: '#2563EB',
    bgPreviewColor: '#F8FAFC',
    cardPreviewColor: '#FFFFFF',
    badgeText: 'Clean Daylight',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  },
];
