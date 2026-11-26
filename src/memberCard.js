function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function displayDate(value) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR') : 'Sans échéance';
}

// Reduit la police des textes longs pour qu'ils restent dans la carte.
function fitSize(text, base, maxChars) {
  const length = String(text || '').length;
  return `${(length > maxChars ? Math.max(base * maxChars / length, base * 0.55) : base).toFixed(2)}pt`;
}

const icon = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const ICONS = {
  phone: icon('<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
  mail: icon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  pin: icon('<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11"/><circle cx="12" cy="10" r="2.500"/>'),
  company: icon('<path d="M4 21V5l8-2v18M12 9l8 2v10M3 21h18M8 8v.01M8 12v.01M8 16v.01M16 14v.01M16 17v.01"/>'),
  id: icon('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.7-1.500 5.300-1.500 6 0M15 10h3M15 14h3"/>'),
  shield: icon('<path d="M12 3 4 6v6c0 5 3.500 8 8 9 4.500-1 8-4 8-9V6z"/><path d="m8.500 12 2.500 2.500 4.500-5"/>'),
  team: icon('<circle cx="12" cy="8" r="3"/><circle cx="5" cy="10" r="2"/><circle cx="19" cy="10" r="2"/><path d="M7 19v-1a5 5 0 0 1 10 0v1M2 18v-1a3 3 0 0 1 4-3M22 18v-1a3 3 0 0 0-4-3"/>'),
  drop: icon('<path d="M12 3s-7 7.500-7 12a7 7 0 0 0 14 0c0-4.500-7-12-7-12"/><path d="M9 15a3 3 0 0 0 3 3"/>'),
  hands: icon('<path d="m2 8 4-2 5 2-3 4c1 1.500 3 1 4-1l3-1 5 5-3 3-2-1-2 2-2-1-2 1-5-5-2 1M22 8l-4-2-5 2"/>'),
};

export function buildCardDocument(member, qrUrl, photoUrl, logoUrl = '') {
  const valid = member.active && (!member.expires_on || member.expires_on >= new Date().toLocaleDateString('sv-SE', { timeZone: 'Africa/Porto-Novo' }));
  const initials = `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`;
  const fullName = `${escapeHtml(member.first_name)} ${escapeHtml(member.last_name)}`;
  const portrait = photoUrl
    ? `<img class="portrait" src="${photoUrl}" alt="Portrait de ${fullName}">`
    : `<div class="portrait initials">${escapeHtml(initials)}</div>`;
  const lines = [
    ['phone', member.phone],
    ['mail', member.email],
    ['pin', member.address],
    ['company', member.company],
    ['id', member.membership_number],
  ].filter(([, value]) => value)
    .map(([name, value]) => `<div class="line"><i>${ICONS[name]}</i><span style="font-size:${fitSize(value, 6, 32)}">${escapeHtml(value)}</span></div>`)
    .join('');
  const benefit = (name, text) => `<div class="benefit">${ICONS[name]}<span>${text}</span></div>`;
  const waves = '<svg class="waves" viewBox="0 0 856 130" preserveAspectRatio="none" aria-hidden="true"><path fill="#6db544" d="M0 20C150 100 330 106 520 88S760 46 856 -4V130H0Z"/><path fill="#fff" d="M0 38C150 118 340 112 530 86S770 36 856 6V112C700 135 520 128 340 128S90 110 0 66Z"/><path fill="#1c75bc" d="M0 46C150 125 340 120 530 94S770 44 856 14V130H0Z"/><path fill="#35a3dc" opacity=".75" d="M0 90C190 140 390 112 560 100S780 82 856 62V130H0Z"/></svg>';

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Carte APEC — ${fullName}</title>
<style>
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;padding:24px;background:#eef3f6;color:#17283f;font-family:Arial,Helvetica,sans-serif}
.toolbar{max-width:720px;margin:0 auto 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;color:#617b91;font-size:13px}
.toolbar button{border:0;border-radius:9px;background:#176fb3;color:#fff;font-weight:700;padding:11px 16px;cursor:pointer}
.cards{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}
/* La carte est dessinee en millimetres, puis agrandie a l'ecran. */
.card{position:relative;width:85.6mm;height:54mm;overflow:hidden;background:#fff;border-radius:3mm;box-shadow:0 2mm 5mm #173c6025;zoom:2}
.card>*{position:absolute}
.waves{left:0;bottom:0;width:100%;height:11mm}
.logo{left:3mm;top:1.5mm;width:13.500mm;height:13.500mm;object-fit:contain}
.title{left:18mm;right:3mm;top:2.2mm;text-align:center;line-height:1}
.title b{display:block;font-size:21pt;font-weight:900;color:#1763a6;letter-spacing:.01em}
.title strong{display:block;font-size:6.2pt;color:#1f8a62;margin-top:.8mm;text-transform:uppercase}
.title small{display:block;font-size:4.6pt;font-weight:700;color:#1763a6;margin-top:.8mm}
.zone{right:3.500mm;top:15mm;font-size:7pt;font-weight:900;color:#17283f;letter-spacing:.03em}
.watermark{right:-3mm;top:17mm;width:30mm;height:30mm;object-fit:contain;opacity:.08}
.portrait{left:3.500mm;top:17mm;width:22mm;height:27mm;object-fit:cover;border-radius:9mm;border:.5mm solid #d3e2ee;background:#e4eef5}
.initials{display:flex;align-items:center;justify-content:center;font-size:18pt;font-weight:800;color:#2b7bb0}
.flag{left:21.500mm;top:38.500mm;width:5mm;height:5mm;border-radius:50%;border:.4mm solid #fff;background:linear-gradient(90deg,#008751 0 40%,transparent 40%),linear-gradient(#fcd116 0 50%,#e8112d 50%);z-index:2}
.identity{left:28.500mm;top:15.500mm;width:40mm;height:12mm;line-height:1.08;white-space:nowrap}
.identity div{overflow:hidden;text-overflow:ellipsis}
.last-name{font-family:Georgia,'Times New Roman',serif;font-weight:700;text-transform:uppercase}
.role{font-weight:700;text-transform:uppercase;margin-top:.5mm}
.info{left:28.500mm;top:28mm;width:40.500mm;min-height:15mm;padding:1.2mm 1.5mm;border-radius:1.8mm;background:#3f73b8;color:#fff;display:flex;flex-direction:column;justify-content:center;gap:.55mm;z-index:2}
.line{display:flex;align-items:center;gap:1.2mm;height:2.5mm;white-space:nowrap}
.line i{flex:none;width:2.5mm;height:2.5mm;border-radius:50%;background:#7fc0ee;display:flex;align-items:center;justify-content:center}.line i svg{width:1.8mm;height:1.8mm}
.line span{overflow:hidden;text-overflow:ellipsis}
.stamp{right:2.500mm;top:25mm;width:13.500mm;height:13.500mm;border-radius:50%;border:.5mm double #c4343c;outline:.35mm dashed #c4343c;outline-offset:.35mm;color:#c4343c;display:flex;align-items:center;justify-content:center;transform:rotate(-16deg);font-weight:900;text-align:center;line-height:1.1}
.stamp span{font-size:5.300pt;border-block:.3mm solid #c4343c;padding:.5mm 0;width:100%;background:#fff}
.validity{right:3mm;bottom:1.500mm;text-align:center;color:#fff;line-height:1.1}
.validity small{display:block;font-size:6pt;font-weight:700;background:#14508a;border-radius:3mm;padding:.5mm 3mm}
.validity b{display:block;font-size:6.500pt;margin-top:.6mm}
.side{top:-4mm;bottom:-4mm;width:9mm;border-radius:50%;background:#1c75bc}.side.left{left:-6.500mm;box-shadow:1.200mm 0 0 #7cc4e8}.side.right{right:-6.500mm;box-shadow:-1.200mm 0 0 #7cc4e8}
.back-title{left:6mm;right:6mm;top:2.500mm;text-align:center;text-transform:uppercase;font-size:10pt;font-weight:900;line-height:1.12;color:#16335c}
.qr{left:26.300mm;top:12.200mm;width:33mm;height:33mm;background:#fff;border:.3mm solid #b9d3e6}
.qr img{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated}
/* Le logo central reste petit pour ne pas gener la lecture du code. */
.qr .qr-logo{inset:auto;left:41%;top:41%;width:18%;height:18%;object-fit:contain;background:#fff;border-radius:1mm;padding:.3mm;image-rendering:auto}
.benefits{top:14mm;height:31mm;width:17mm;display:flex;flex-direction:column;justify-content:space-around;align-items:center}.benefits.left{left:6mm}.benefits.right{right:6mm}
.benefit{text-align:center;color:#1763a6}.benefit svg{display:block;width:7.500mm;height:7.500mm;margin:0 auto .8mm}.benefit span{display:block;font-size:5.200pt;font-weight:700;line-height:1.15;color:#16335c}
.notice{left:8mm;right:8mm;bottom:1.500mm;padding:1mm 2mm;border-radius:3mm;background:#586373;color:#fff;text-align:center;font-size:5pt;font-weight:700;line-height:1.2;white-space:nowrap}
@media(max-width:700px){body{padding:12px}.card{zoom:1.05}}
@media print{@page{size:85.6mm 54mm;margin:0}html,body{width:85.6mm;padding:0!important;margin:0!important;background:#fff!important}.toolbar{display:none!important}.cards{display:block}.card{zoom:1;border-radius:0;box-shadow:none;break-after:page;page-break-after:always}.card:last-child{break-after:auto;page-break-after:auto}}
</style></head><body>
<header class="toolbar"><span>Carte APEC · Recto et verso · format bancaire${valid ? '' : ' · Adhésion non active'}</span><button onclick="window.print()">Imprimer / Enregistrer en PDF</button></header>
<main class="cards">
  <article class="card front">
    <img class="watermark" src="${logoUrl}" alt="">
    <img class="logo" src="${logoUrl}" alt="Logo APEC-LIT">
    <div class="title"><b>APEC BÉNIN</b><strong>Association des promoteurs d’eau conditionnée</strong><small>Ensemble pour une eau de qualité, accessible à tous</small></div>
    <div class="zone">LITTORAL</div>
    ${portrait}<span class="flag" title="Bénin"></span>
    <div class="identity"><div class="last-name" style="font-size:${fitSize(member.last_name, 13, 14)}">${escapeHtml(member.last_name)}</div><div style="font-size:${fitSize(member.first_name, 9, 24)}">${escapeHtml(member.first_name)}</div><div class="role" style="font-size:${fitSize(member.role || 'Membre', 6.5, 28)}">${escapeHtml(member.role || 'Membre')}</div></div>
    <div class="info">${lines}</div>
    ${valid ? '<div class="stamp"><span>CERTIFIÉ</span></div>' : ''}
    ${waves}
    <div class="validity"><small>Validité</small><b>${displayDate(member.expires_on)}</b></div>
  </article>
  <article class="card back">
    <span class="side left"></span><span class="side right"></span>
    <div class="back-title">Scanner pour vérifier<br>l’identité de ce membre</div>
    <div class="benefits left">${benefit('shield', 'Membre<br>officiel APEC')}${benefit('team', 'Engagé pour<br>une eau de qualité')}</div>
    <div class="qr"><img src="${qrUrl}" alt="QR code de vérification de l’adhésion"><img class="qr-logo" src="${logoUrl}" alt=""></div>
    <div class="benefits right">${benefit('drop', 'Eau propre,<br>santé pour tous')}${benefit('hands', 'Solidarité et<br>transparence')}</div>
    <div class="notice">Carte strictement personnelle. Toute reproduction est interdite.</div>
  </article>
</main></body></html>`;
}
