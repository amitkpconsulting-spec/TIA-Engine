import { ThemeConfig, ThemeColors } from '../types/theme';

/**
 * Predefined TweakCN and shadcn theme code registry
 */
export const PRESET_THEME_CODES: Record<string, Omit<ThemeConfig, 'id'> & { colors: ThemeColors }> = {
  // Official TweakCN Stella preset by Mathys Basson
  'cmm2mehjy000004ibgt6g0rbu': {
    name: 'Stella (TweakCN)',
    code: 'cmm2mehjy000004ibgt6g0rbu',
    sourceLabel: 'tweakcn.com',
    sourceUrl: 'https://tweakcn.com/themes/cmm2mehjy000004ibgt6g0rbu',
    description: 'A bold, flat, minimal, retro, warm shadcn/ui theme by Mathys Basson',
    isDark: true,
    accentColor: '#FFAA6B',
    bgPreviewColor: '#120E09',
    cardPreviewColor: '#1C160E',
    badgeText: 'TweakCN Stella',
    fontFamily: 'Montserrat, sans-serif',
    colors: {
      bg: 'hsl(35, 40%, 5%)',
      card: 'hsl(35, 40%, 8%)',
      surface: 'hsl(35, 40%, 8%)',
      elevated: 'hsl(35, 40%, 12%)',
      elevatedHover: 'hsl(35, 40%, 17%)',
      border: 'hsl(35, 30%, 20%)',
      borderSubtle: 'hsl(35, 30%, 15%)',
      text: 'hsl(35, 40%, 90%)',
      textStrong: 'hsl(35, 100%, 95%)',
      textMuted: 'hsl(35, 20%, 65%)',
      textSubtle: 'hsl(35, 15%, 50%)',
      accent: 'hsl(35, 100%, 71%)',
      accentHover: 'hsl(35, 100%, 78%)',
      accentText: '#000000',
      ring: 'hsl(35, 100%, 71%)',
      radius: '0.85rem',
      fontFamily: 'Montserrat, sans-serif',
    },
  },

  // Tokyo Night Cyberpunk
  'tokyo-night': {
    name: 'Tokyo Night',
    code: 'tokyo-night',
    sourceLabel: 'enkia.tokyo-night',
    description: 'A clean dark theme celebrating the vibrant neon lights of downtown Tokyo',
    isDark: true,
    accentColor: '#7AA2F7',
    bgPreviewColor: '#1A1B26',
    cardPreviewColor: '#24283B',
    badgeText: 'Tokyo Night',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    colors: {
      bg: '#1A1B26',
      card: '#24283B',
      surface: '#24283B',
      elevated: '#2F3549',
      elevatedHover: '#38415C',
      border: '#3B4261',
      borderSubtle: '#2E344A',
      text: '#C0CAF5',
      textStrong: '#FFFFFF',
      textMuted: '#9AA5CE',
      textSubtle: '#565F89',
      accent: '#7AA2F7',
      accentHover: '#89DDFF',
      accentText: '#000000',
      ring: '#7AA2F7',
      radius: '0.75rem',
    },
  },

  // Catppuccin Mocha
  'catppuccin-mocha': {
    name: 'Catppuccin Mocha',
    code: 'catppuccin-mocha',
    sourceLabel: 'catppuccin.com',
    description: 'Soothing pastel theme with warm crust tones and lavender highlights',
    isDark: true,
    accentColor: '#CBA6F7',
    bgPreviewColor: '#181825',
    cardPreviewColor: '#1E1E2E',
    badgeText: 'Catppuccin',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    colors: {
      bg: '#181825',
      card: '#1E1E2E',
      surface: '#1E1E2E',
      elevated: '#28283D',
      elevatedHover: '#313244',
      border: '#45475A',
      borderSubtle: '#313244',
      text: '#CDD6F4',
      textStrong: '#F5E0DC',
      textMuted: '#A6ADC8',
      textSubtle: '#6C7086',
      accent: '#CBA6F7',
      accentHover: '#F5C2E7',
      accentText: '#000000',
      ring: '#CBA6F7',
      radius: '0.85rem',
    },
  },

  // Dracula Official
  'dracula': {
    name: 'Dracula Vampire',
    code: 'dracula',
    sourceLabel: 'draculatheme.com',
    description: 'Classic dark gothic theme designed for screens with high contrast pink & purple',
    isDark: true,
    accentColor: '#FF79C6',
    bgPreviewColor: '#21222C',
    cardPreviewColor: '#282A36',
    badgeText: 'Dracula',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    colors: {
      bg: '#21222C',
      card: '#282A36',
      surface: '#282A36',
      elevated: '#343746',
      elevatedHover: '#44475A',
      border: '#6272A4',
      borderSubtle: '#44475A',
      text: '#F8F8F2',
      textStrong: '#FFFFFF',
      textMuted: '#BD93F9',
      textSubtle: '#6272A4',
      accent: '#FF79C6',
      accentHover: '#50FA7B',
      accentText: '#000000',
      ring: '#FF79C6',
      radius: '0.75rem',
    },
  },

  // Rosé Pine
  'rose-pine': {
    name: 'Rosé Pine',
    code: 'rose-pine',
    sourceLabel: 'rosepinetheme.com',
    description: 'All natural pine needles, warm foam and love in an eye-friendly dark palette',
    isDark: true,
    accentColor: '#EBBCBA',
    bgPreviewColor: '#191724',
    cardPreviewColor: '#1F1D2E',
    badgeText: 'Rosé Pine',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    colors: {
      bg: '#191724',
      card: '#1F1D2E',
      surface: '#1F1D2E',
      elevated: '#26233A',
      elevatedHover: '#312E46',
      border: '#403D52',
      borderSubtle: '#2A283E',
      text: '#E0DEF4',
      textStrong: '#F6C177',
      textMuted: '#908CAA',
      textSubtle: '#6E6A86',
      accent: '#EBBCBA',
      accentHover: '#31748F',
      accentText: '#000000',
      ring: '#EBBCBA',
      radius: '0.85rem',
    },
  },

  // Emerald Matrix
  'emerald-matrix': {
    name: 'Emerald Matrix',
    code: 'emerald-matrix',
    sourceLabel: 'Terminal Core',
    description: 'Cybersecurity terminal console with phosphorescent green telemetry',
    isDark: true,
    accentColor: '#10B981',
    bgPreviewColor: '#050D0A',
    cardPreviewColor: '#0B1A14',
    badgeText: 'Matrix Sec',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    colors: {
      bg: '#050D0A',
      card: '#0B1A14',
      surface: '#0B1A14',
      elevated: '#11261D',
      elevatedHover: '#173629',
      border: '#1B4735',
      borderSubtle: '#123326',
      text: '#D1FAE5',
      textStrong: '#ECFDF5',
      textMuted: '#6EE7B7',
      textSubtle: '#059669',
      accent: '#10B981',
      accentHover: '#34D399',
      accentText: '#000000',
      ring: '#10B981',
      radius: '0.75rem',
    },
  },

  // Amethyst Void
  'amethyst-void': {
    name: 'Amethyst Void',
    code: 'amethyst-void',
    sourceLabel: 'Neon Synth',
    description: 'Deep royal ultraviolet with vibrant electric neon orchid highlights',
    isDark: true,
    accentColor: '#C084FC',
    bgPreviewColor: '#0F0818',
    cardPreviewColor: '#170E24',
    badgeText: 'Amethyst',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    colors: {
      bg: '#0F0818',
      card: '#170E24',
      surface: '#170E24',
      elevated: '#231637',
      elevatedHover: '#301E4B',
      border: '#452B6B',
      borderSubtle: '#291840',
      text: '#F3E8FF',
      textStrong: '#FAF5FF',
      textMuted: '#D8B4FE',
      textSubtle: '#7E22CE',
      accent: '#C084FC',
      accentHover: '#E879F9',
      accentText: '#000000',
      ring: '#C084FC',
      radius: '0.85rem',
    },
  },

  // Nord Frost
  'nord-frost': {
    name: 'Nord Glacial',
    code: 'nord-frost',
    sourceLabel: 'nordtheme.com',
    description: 'An arctic, north-bluish clean palette created for peaceful clarity',
    isDark: true,
    accentColor: '#88C0D0',
    bgPreviewColor: '#242933',
    cardPreviewColor: '#2E3440',
    badgeText: 'Nord Frost',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    colors: {
      bg: '#242933',
      card: '#2E3440',
      surface: '#2E3440',
      elevated: '#3B4252',
      elevatedHover: '#434C5E',
      border: '#4C566A',
      borderSubtle: '#3B4252',
      text: '#ECEFF4',
      textStrong: '#FFFFFF',
      textMuted: '#D8DEE9',
      textSubtle: '#616E88',
      accent: '#88C0D0',
      accentHover: '#81A1C1',
      accentText: '#000000',
      ring: '#88C0D0',
      radius: '0.75rem',
    },
  },

  // Paper Minimal (Clean Warm Light)
  'paper-light': {
    name: 'Paper Minimal Light',
    code: 'paper-light',
    sourceLabel: 'Editorial',
    description: 'Minimal warm book paper with deep charcoal serif-inspired structure',
    isDark: false,
    accentColor: '#B45309',
    bgPreviewColor: '#F7F5EE',
    cardPreviewColor: '#FFFFFF',
    badgeText: 'Editorial Light',
    fontFamily: 'Montserrat, sans-serif',
    colors: {
      bg: '#F7F5EE',
      card: '#FFFFFF',
      surface: '#FFFFFF',
      elevated: '#EFECE3',
      elevatedHover: '#E4DFD3',
      border: '#D7D0C0',
      borderSubtle: '#E4DFD3',
      text: '#26221C',
      textStrong: '#120F0C',
      textMuted: '#5C5446',
      textSubtle: '#8C8270',
      accent: '#B45309',
      accentHover: '#92400E',
      accentText: '#FFFFFF',
      ring: '#B45309',
      radius: '0.85rem',
      fontFamily: 'Montserrat, sans-serif',
    },
  },
};

/**
 * Normalizes user input into a clean string (cleans URLs, quotes, whitespace)
 */
export function cleanThemeCodeInput(input: string): string {
  let cleaned = input.trim();
  // Strip wrap quotes
  cleaned = cleaned.replace(/^["']|["']$/g, '');
  // If it's a URL like https://tweakcn.com/themes/cmm2mehjy000004ibgt6g0rbu
  if (cleaned.includes('tweakcn.com/themes/')) {
    const parts = cleaned.split('/themes/');
    if (parts[1]) {
      cleaned = parts[1].split('?')[0].split('#')[0].trim();
    }
  }
  return cleaned;
}

/**
 * Parses CSS variable block or JSON snippet or Preset Code into a full ThemeConfig
 */
export function parseThemeCode(rawInput: string): { success: boolean; theme?: ThemeConfig; error?: string } {
  if (!rawInput || !rawInput.trim()) {
    return { success: false, error: 'Please enter a theme code, CSS variables, or preset identifier.' };
  }

  const clean = cleanThemeCodeInput(rawInput);
  const normalizedKey = clean.toLowerCase();

  // 1. Check Predefined Registry (exact or normalized)
  for (const [key, preset] of Object.entries(PRESET_THEME_CODES)) {
    if (key.toLowerCase() === normalizedKey || preset.name.toLowerCase() === normalizedKey) {
      const customId = `theme-${key}`;
      return {
        success: true,
        theme: {
          ...preset,
          id: customId,
          isCustom: true,
        },
      };
    }
  }

  // 2. Check JSON Theme Code
  if (rawInput.trim().startsWith('{') && rawInput.trim().endsWith('}')) {
    try {
      const parsed = JSON.parse(rawInput);
      const isDark = parsed.isDark ?? true;
      const bg = parsed.background || parsed.bg || (isDark ? '#0F0F12' : '#F8FAFC');
      const card = parsed.card || (isDark ? '#16161B' : '#FFFFFF');
      const border = parsed.border || (isDark ? '#2E2E3A' : '#E2E8F0');
      const text = parsed.text || parsed.foreground || (isDark ? '#E2E8F0' : '#1E293B');
      const accent = parsed.accent || parsed.primary || '#3B82F6';
      const name = parsed.name || `Custom Theme (${clean.slice(0, 8)})`;
      const id = `custom-${Date.now()}`;

      const theme: ThemeConfig = {
        id,
        code: clean.slice(0, 32),
        name,
        description: parsed.description || 'Imported via custom JSON theme configuration',
        isDark,
        accentColor: accent,
        bgPreviewColor: bg,
        cardPreviewColor: card,
        badgeText: 'Custom JSON',
        fontFamily: parsed.fontFamily || 'ui-sans-serif, system-ui, sans-serif',
        isCustom: true,
        colors: {
          bg,
          card,
          surface: card,
          elevated: isDark ? lightenDarkColor(card, 0.08) : darkenLightColor(card, 0.05),
          elevatedHover: isDark ? lightenDarkColor(card, 0.14) : darkenLightColor(card, 0.09),
          border,
          borderSubtle: border,
          text,
          textStrong: isDark ? '#FFFFFF' : '#0F172A',
          textMuted: isDark ? '#A1A1AA' : '#64748B',
          textSubtle: isDark ? '#71717A' : '#94A3B8',
          accent,
          accentHover: accent,
          accentText: isDark ? '#000000' : '#FFFFFF',
          ring: accent,
          radius: parsed.radius || '0.75rem',
        },
      };
      return { success: true, theme };
    } catch (e: any) {
      return { success: false, error: `Invalid JSON format: ${e.message}` };
    }
  }

  // 3. Check CSS Variables Format (e.g. pasted from tweakcn or shadcn)
  if (rawInput.includes('--') || rawInput.includes('background') || rawInput.includes('primary')) {
    const cssTheme = parseCssVariablesToTheme(rawInput);
    if (cssTheme) {
      return { success: true, theme: cssTheme };
    }
  }

  // 4. Hex Color or Keyword (e.g. "#FF5722" or "crimson")
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(clean)) {
    const hex = clean.length === 4 
      ? '#' + clean[1] + clean[1] + clean[2] + clean[2] + clean[3] + clean[3]
      : clean;
    const theme = generateThemeFromAccentColor(hex, `Theme (${hex})`);
    return { success: true, theme };
  }

  // 5. Custom Identifier / CUID / Share Code (e.g. cmm2... or user code)
  // Generate a handsome dark theme derived deterministically from the seed
  const derivedTheme = generateDeterministicThemeFromCode(clean);
  return { success: true, theme: derivedTheme };
}

/**
 * Extracts CSS variables from pasted styles (TweakCN / shadcn exported code)
 */
function parseCssVariablesToTheme(cssContent: string): ThemeConfig | null {
  const varMap: Record<string, string> = {};
  const regex = /--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = regex.exec(cssContent)) !== null) {
    varMap[match[1].trim()] = match[2].trim();
  }

  if (Object.keys(varMap).length === 0) return null;

  // Detect background and primary
  const rawBg = varMap['background'] || varMap['app-bg'] || '#0A0A0B';
  const rawCard = varMap['card'] || varMap['app-card'] || rawBg;
  const rawPrimary = varMap['primary'] || varMap['app-accent'] || '#3B82F6';
  const rawBorder = varMap['border'] || varMap['app-border'] || '#262626';
  const rawFg = varMap['foreground'] || varMap['app-text'] || '#E2E8F0';

  const bg = resolveCssColorValue(rawBg);
  const card = resolveCssColorValue(rawCard);
  const accent = resolveCssColorValue(rawPrimary);
  const border = resolveCssColorValue(rawBorder);
  const text = resolveCssColorValue(rawFg);

  // Guess if dark
  const isDark = !rawBg.includes('100%') && !rawBg.includes('255') && !bg.toLowerCase().startsWith('#f');

  const id = `custom-css-${Date.now()}`;
  return {
    id,
    code: 'custom-css',
    name: 'Custom CSS Theme',
    description: 'Loaded from pasted CSS variables (TweakCN / shadcn)',
    isDark,
    accentColor: accent,
    bgPreviewColor: bg,
    cardPreviewColor: card,
    badgeText: 'Custom CSS',
    fontFamily: varMap['font-sans'] || 'ui-sans-serif, system-ui, sans-serif',
    isCustom: true,
    colors: {
      bg,
      card,
      surface: card,
      elevated: isDark ? lightenDarkColor(card, 0.08) : darkenLightColor(card, 0.05),
      elevatedHover: isDark ? lightenDarkColor(card, 0.15) : darkenLightColor(card, 0.09),
      border,
      borderSubtle: border,
      text,
      textStrong: isDark ? '#FFFFFF' : '#0F172A',
      textMuted: isDark ? '#A1A1AA' : '#64748B',
      textSubtle: isDark ? '#71717A' : '#94A3B8',
      accent,
      accentHover: accent,
      accentText: isDark ? '#000000' : '#FFFFFF',
      ring: accent,
      radius: varMap['radius'] || '0.75rem',
    },
  };
}

/**
 * Resolves HSL space or simple hex string
 */
function resolveCssColorValue(val: string): string {
  if (val.startsWith('#') || val.startsWith('rgb') || val.startsWith('hsl')) {
    return val;
  }
  // If it's HSL channels like "240 5.9% 10%" or "35 100% 71%"
  if (/^[\d.]+\s+[\d.]+%?\s+[\d.]+%?$/.test(val)) {
    const parts = val.trim().split(/\s+/);
    return `hsl(${parts[0]}, ${parts[1].includes('%') ? parts[1] : parts[1] + '%'}, ${parts[2].includes('%') ? parts[2] : parts[2] + '%'})`;
  }
  return val;
}

/**
 * Generates an executive dark theme tailored to an accent color
 */
function generateThemeFromAccentColor(accentHex: string, name: string): ThemeConfig {
  const id = `accent-${Date.now()}`;
  return {
    id,
    code: accentHex,
    name,
    description: `Dynamic security dashboard palette focused on ${accentHex}`,
    isDark: true,
    accentColor: accentHex,
    bgPreviewColor: '#090A0D',
    cardPreviewColor: '#101217',
    badgeText: 'Accent Seed',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    isCustom: true,
    colors: {
      bg: '#090A0D',
      card: '#101217',
      surface: '#101217',
      elevated: '#171B24',
      elevatedHover: '#202532',
      border: '#293040',
      borderSubtle: '#1C212D',
      text: '#D8DEE9',
      textStrong: '#FFFFFF',
      textMuted: '#94A3B8',
      textSubtle: '#64748B',
      accent: accentHex,
      accentHover: accentHex,
      accentText: '#000000',
      ring: accentHex,
      radius: '0.75rem',
    },
  };
}

/**
 * Deterministically generates a theme from an arbitrary code seed
 */
function generateDeterministicThemeFromCode(code: string): ThemeConfig {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = (hash << 5) - hash + code.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  const accent = `hsl(${hue}, 85%, 65%)`;
  const id = `code-${cleanThemeCodeInput(code).slice(0, 16)}`;

  return {
    id,
    code,
    name: `Theme ${code.slice(0, 10)}...`,
    description: `Custom generated theme derived from theme code: ${code}`,
    isDark: true,
    accentColor: accent,
    bgPreviewColor: `hsl(${hue}, 25%, 5%)`,
    cardPreviewColor: `hsl(${hue}, 25%, 8%)`,
    badgeText: 'Code Generated',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    isCustom: true,
    colors: {
      bg: `hsl(${hue}, 25%, 5%)`,
      card: `hsl(${hue}, 25%, 8%)`,
      surface: `hsl(${hue}, 25%, 8%)`,
      elevated: `hsl(${hue}, 25%, 12%)`,
      elevatedHover: `hsl(${hue}, 25%, 17%)`,
      border: `hsl(${hue}, 20%, 22%)`,
      borderSubtle: `hsl(${hue}, 20%, 16%)`,
      text: `hsl(${hue}, 30%, 90%)`,
      textStrong: '#FFFFFF',
      textMuted: `hsl(${hue}, 20%, 65%)`,
      textSubtle: `hsl(${hue}, 15%, 50%)`,
      accent,
      accentHover: `hsl(${hue}, 90%, 75%)`,
      accentText: '#000000',
      ring: accent,
      radius: '0.85rem',
    },
  };
}

function lightenDarkColor(hexOrHsl: string, factor: number): string {
  if (hexOrHsl.startsWith('#') && hexOrHsl.length >= 7) {
    const num = parseInt(hexOrHsl.slice(1), 16);
    const r = Math.min(255, Math.floor(((num >> 16) & 255) + factor * 255));
    const g = Math.min(255, Math.floor(((num >> 8) & 255) + factor * 255));
    const b = Math.min(255, Math.floor((num & 255) + factor * 255));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  return hexOrHsl;
}

function darkenLightColor(hexOrHsl: string, factor: number): string {
  if (hexOrHsl.startsWith('#') && hexOrHsl.length >= 7) {
    const num = parseInt(hexOrHsl.slice(1), 16);
    const r = Math.max(0, Math.floor(((num >> 16) & 255) - factor * 255));
    const g = Math.max(0, Math.floor(((num >> 8) & 255) - factor * 255));
    const b = Math.max(0, Math.floor((num & 255) - factor * 255));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  return hexOrHsl;
}
