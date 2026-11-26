import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { askConfirm } from './confirmDialog.js';

const ITEMS = [
  { key: 'stamp', label: "Cachet de l'association" },
  { key: 'signature', label: 'Signature du président' },
];

// Redimensionne l'image en PNG pour conserver le fond transparent.
function toPng(file) {
  return new Promise((resolve, reject) => {
    if (file.type !== 'image/png') { reject(new Error('Choisissez une image PNG à fond transparent.')); return; }
    const image = new Image();
    const source = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1, 600 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(source);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => { URL.revokeObjectURL(source); reject(new Error('Impossible de lire cette image.')); };
    image.src = source;
  });
}

export function CardAssetsModal({ close, load, save }) {
  const [saved, setSaved] = useState({});
  const [changes, setChanges] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { load().then(setSaved).catch(err => setError(err.message)); }, []);
  const dirty = Object.keys(changes).length > 0;

  async function pick(key, file) {
    setError('');
    try { const data = await toPng(file); setChanges(current => ({ ...current, [key]: data })); }
    catch (err) { setError(err.message); }
  }
  async function requestClose() {
    if (saving) return;
    if (dirty && !await askConfirm({ title: 'Quitter sans enregistrer ?', message: 'Les images choisies ne seront pas enregistrées.', confirmLabel: 'Quitter', cancelLabel: 'Continuer', danger: true })) return;
    close();
  }
  async function submit(event) {
    event.preventDefault();
    if (!await askConfirm({ title: 'Enregistrer pour les cartes ?', message: 'Ces images apparaîtront sur les prochaines cartes imprimées des membres actifs.', confirmLabel: 'Enregistrer' })) return;
    setSaving(true); setError('');
    try { await save(changes); close(); }
    catch (err) { setError(err.message); setSaving(false); }
  }

  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && requestClose()}>
    <section className="member-modal">
      <div className="modal-heading"><div><span className="eyebrow">CARTES DE MEMBRE</span><h2>Cachet et signature</h2><p>Images PNG à fond transparent. Elles ne sont accessibles qu'après connexion.</p></div><button type="button" className="icon-button" onClick={requestClose}><X /></button></div>
      <form onSubmit={submit}>
        {ITEMS.map(({ key, label }) => {
          const preview = changes[key] || saved[key];
          return <div className="photo-upload-row" key={key}>
            <div className="asset-preview">{preview ? <img src={preview} alt={label} /> : <small>Aucune image</small>}</div>
            <div className="photo-copy"><b>{label}</b><label className="photo-pick">Choisir une image<input type="file" accept="image/png" onChange={e => { if (e.target.files?.[0]) pick(key, e.target.files[0]); e.target.value = ''; }} /></label></div>
          </div>;
        })}
        {error && <div className="form-error">{error}</div>}
        <div className="modal-actions"><button type="button" className="button outline" onClick={requestClose}>Annuler</button><button className="button primary" disabled={saving || !dirty}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button></div>
      </form>
    </section>
  </div>;
}
