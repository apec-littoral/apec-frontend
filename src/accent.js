// Couleur de l'interface, choisie par chaque personne et memorisee dans son navigateur.
export const DEFAULT_ACCENT = '#0b6fb8';
const STORAGE_KEY = 'apec-accent';

export const PRESETS = [
  { name: 'Bleu eau', color: DEFAULT_ACCENT },
  { name: 'Vert', color: '#087765' },
  { name: 'Rouge', color: '#b8222f' },
  { name: 'Noir', color: '#111111' },
  { name: 'Violet', color: '#6b3fb5' },
  { name: 'Orange', color: '#c2560c' },
  { name: 'Rose', color: '#b42a72' },
];

const isColor = value => /^#[0-9a-f]{6}$/i.test(value || '');

function toHsl(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const delta = max - min;
  if (!delta) return { h: 0, s: 0, l };
  const s = delta / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return { h: (h * 60 + 360) % 360, s: Math.min(s, 1), l };
}

function hslToHex({ h, s, l }) {
  const channel = n => {
    const k = (n + h / 30) % 12;
    const value = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255).toString(16).padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

export function contrastWithWhite(hex) {
  const [r, g, b] = [1, 3, 5].map(i => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 1.05 / (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05);
}

// Les boutons ont un texte blanc : une couleur trop claire est assombrie pour rester lisible.
export function buttonColor(hex) {
  const hsl = toHsl(hex);
  let color = hex.toLowerCase();
  while (contrastWithWhite(color) < 4.5 && hsl.l > 0) {
    hsl.l = Math.max(0, hsl.l - 0.02);
    color = hslToHex(hsl);
  }
  return color;
}

export function accentVariables(hex) {
  const color = isColor(hex) ? hex : DEFAULT_ACCENT;
  const { h, s } = toHsl(color);
  const button = buttonColor(color);
  const base = toHsl(button);
  // Au survol : plus fonce, ou plus clair si la couleur est deja presque noire.
  const hover = hslToHex({ ...base, l: base.l < 0.15 ? base.l + 0.1 : base.l - 0.06 });
  return {
    '--accent-h': String(Math.round(h)),
    // 1 correspond a la saturation d'origine ; 0 donne une interface grise ou noire.
    '--accent-s': String(Math.min(1, s / 0.89).toFixed(3)),
    '--accent-button': button,
    '--accent-hover': hover,
  };
}

export function applyAccent(hex) {
  Object.entries(accentVariables(hex)).forEach(([name, value]) => document.documentElement.style.setProperty(name, value));
}

export function loadAccent() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isColor(saved) ? saved : DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}

export function saveAccent(hex) {
  applyAccent(hex);
  try { window.localStorage.setItem(STORAGE_KEY, hex); } catch { /* La couleur reste appliquee jusqu'au rechargement. */ }
}
