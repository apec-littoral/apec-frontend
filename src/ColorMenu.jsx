import React, { useEffect, useRef, useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { DEFAULT_ACCENT, PRESETS, loadAccent, saveAccent } from './accent.js';
import './colorMenu.css';

export function ColorMenu() {
  const [open, setOpen] = useState(false);
  const [accent, setAccent] = useState(loadAccent);
  const root = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const outside = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);

  const choose = color => { setAccent(color); saveAccent(color); };

  return <div className="color-menu" ref={root}>
    <button type="button" className="theme-toggle" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label="Changer la couleur de l'interface" title="Couleur"><Palette size={16} /><span>Couleur</span></button>
    {open && <div className="color-panel" role="dialog" aria-label="Couleur de l'interface">
      <b>Couleur de l'interface</b>
      <div className="color-swatches">
        {PRESETS.map(preset => <button type="button" key={preset.color} className="color-swatch" onClick={() => choose(preset.color)} aria-pressed={accent === preset.color}>
          <i style={{ background: preset.color }}>{accent === preset.color && <Check size={13} />}</i><small>{preset.name}</small>
        </button>)}
      </div>
      <label className="color-custom">Ma couleur<input type="color" value={accent} onChange={event => choose(event.target.value)} /></label>
      <button type="button" className="color-reset" onClick={() => choose(DEFAULT_ACCENT)}>Revenir au bleu</button>
      <p>Ce choix est gardé sur cet appareil uniquement.</p>
    </div>}
  </div>;
}
