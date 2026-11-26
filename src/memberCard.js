function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function displayDate(value) {
  return value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Sans échéance';
}

export function buildCardDocument(member, qrUrl, photoUrl) {
  const valid = member.active && (!member.expires_on || member.expires_on >= new Date().toLocaleDateString('sv-SE', { timeZone: 'Africa/Porto-Novo' }));
  const initials = `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`;
  const portrait = photoUrl
    ? `<img class="portrait photo" src="${photoUrl}" alt="Portrait de ${escapeHtml(member.first_name)} ${escapeHtml(member.last_name)}">`
    : `<div class="portrait initials">${escapeHtml(initials)}</div>`;
  const contact = [
    member.phone && `<div class="contact"><span>☎</span>${escapeHtml(member.phone)}</div>`,
    member.email && `<div class="contact"><span>✉</span>${escapeHtml(member.email)}</div>`,
  ].filter(Boolean).join('') || '<div class="contact">Membre de l’association APEC</div>';

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Carte APEC — ${escapeHtml(member.first_name)} ${escapeHtml(member.last_name)}</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:28px;background:#eef3f6;color:#173c60;font-family:Arial,Helvetica,sans-serif}
.toolbar{max-width:1040px;margin:0 auto 18px;display:flex;align-items:center;justify-content:space-between;color:#617b91;font-size:13px}
.toolbar button{border:0;border-radius:9px;background:#176fb3;color:white;font-weight:700;padding:11px 16px;cursor:pointer}
.cards{max-width:1040px;margin:auto;display:grid;grid-template-columns:repeat(2,minmax(320px,1fr));gap:20px}
.card{position:relative;width:100%;aspect-ratio:1.586;border-radius:20px;overflow:hidden;background:#fff;box-shadow:0 14px 35px #173c6020;border:1px solid #d5e0e8}
.front{background:radial-gradient(ellipse at 88% 14%,#e9f3f9 0 16%,transparent 16.3%),linear-gradient(145deg,#fff 0 61%,#f6fbfd 61%)}
.front-top{height:23%;display:flex;align-items:center;padding:0 5%;gap:12px;position:relative;z-index:2}
.logo-mark{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(155deg,#e5f6ff,#c8edf9);border:2px solid #72bce3;color:#1685bb;font-size:24px}
.brand{font-size:20px;font-weight:900;letter-spacing:.04em;color:#1877b8}.brand small{display:block;font-size:9px;letter-spacing:.09em;color:#278b70;margin-top:3px}
.top-tag{margin-left:auto;padding:7px 12px;border-radius:18px;background:#e8f4fb;color:#2579ac;font-size:9px;font-weight:800;letter-spacing:.08em}
.identity{position:relative;z-index:2;display:flex;align-items:center;gap:18px;padding:2px 5% 0}
.portrait{width:28%;aspect-ratio:1.02;flex:none;border-radius:20px 20px 8px 20px;background:linear-gradient(145deg,#dcecf3,#eef5f5);border:2px solid #d5e5ec;display:grid;place-items:center;color:#3189b4;font-size:34px;font-weight:800;box-shadow:0 4px 14px #183e5518;object-fit:cover}
.member-role{color:#44816f;text-transform:uppercase;font-size:8px;letter-spacing:.13em;font-weight:800;margin-bottom:6px}
.name{font-size:clamp(18px,2.2vw,27px);line-height:1.02;font-weight:900;color:#183a5e;text-transform:uppercase;letter-spacing:.01em}
.company{margin-top:6px;font-size:clamp(10px,1.1vw,14px);font-weight:700;color:#3e7192}
.contact-box{position:absolute;z-index:2;left:38%;right:5%;bottom:19%;min-height:20%;padding:8px 12px;border-radius:12px;background:linear-gradient(105deg,#287fbd,#4b85c6);color:white;display:flex;flex-direction:column;justify-content:center;gap:5px;box-shadow:0 5px 13px #317eb32a}
.contact{display:flex;align-items:center;gap:8px;font-size:clamp(8px,.9vw,11px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.contact span{width:16px;height:16px;flex:none;border-radius:50%;background:#ffffff30;display:grid;place-items:center;font-size:9px}
.front-footer{position:absolute;z-index:2;left:5%;right:5%;bottom:4%;display:flex;align-items:end;justify-content:space-between}
.member-no small,.validity small{display:block;color:#66849a;font-size:7px;font-weight:800;letter-spacing:.13em;margin-bottom:4px}.member-no b,.validity b{font-size:11px;color:#214d71}.validity{text-align:right}.validity b{color:${valid ? '#25845f' : '#b55c4e'}}
.wave{position:absolute;left:-2%;right:-2%;height:19%;bottom:-1%;clip-path:polygon(0 45%,18% 20%,34% 38%,51% 20%,68% 43%,83% 14%,100% 35%,100% 100%,0 100%)}
.wave-blue{background:linear-gradient(90deg,#2298d2,#3283cb);opacity:.94}.wave-green{height:12%;background:#76bd4a;clip-path:polygon(0 78%,20% 52%,40% 69%,60% 44%,80% 65%,100% 42%,100% 100%,0 100%);opacity:.96}
.back{background:linear-gradient(135deg,#fafdff,#edf7fc)}.back:before{content:"";position:absolute;inset:0;border:12px solid #2586c1;opacity:.95;pointer-events:none}.back:after{content:"";position:absolute;inset:9px;border:2px solid #aad9ed;border-radius:14px;pointer-events:none}
.back-head{position:relative;z-index:1;text-align:center;padding:6% 5% 0}.back-title{font-size:clamp(12px,1.7vw,19px);font-weight:900;letter-spacing:.035em;color:#173e63;text-transform:uppercase;line-height:1.1}
.back-subtitle{font-size:clamp(9px,1.05vw,12px);font-weight:800;color:#2d86b6;margin-top:5px;letter-spacing:.025em}
.status-pill{position:absolute;right:9%;top:9%;padding:5px 9px;border-radius:18px;color:${valid ? '#28754f' : '#a7483f'};background:${valid ? '#e1f3e8' : '#fce9e7'};font-size:8px;font-weight:900;letter-spacing:.04em}
.back-body{position:relative;z-index:1;display:grid;grid-template-columns:1fr 42%;align-items:center;height:65%;padding:2% 8% 0;gap:10px}
.benefits{display:grid;grid-template-columns:1fr 1fr;gap:13px 8px}.benefit{display:flex;align-items:center;gap:7px;color:#315a76;font-size:clamp(7px,.9vw,10px);font-weight:700;line-height:1.1}
.benefit-icon{width:28px;height:28px;flex:none;border-radius:50%;background:#e2f2f9;border:1px solid #acd7ea;color:#2285b5;display:grid;place-items:center;font-size:13px}
.qr-panel{text-align:center}.qr-frame{width:min(100%,170px);aspect-ratio:1;background:#fff;border:2px solid #80bfdd;border-radius:9px;padding:6px;margin:auto;box-shadow:0 5px 14px #2b78941c}
.qr-frame img{width:100%;height:100%;object-fit:contain;image-rendering:pixelated}.qr-caption{font-size:8px;color:#52748b;letter-spacing:.07em;font-weight:900;margin-top:5px}
.back-foot{position:absolute;z-index:2;bottom:6%;left:18%;right:18%;border-radius:18px;background:#526579;color:#fff;text-align:center;padding:6px 10px;font-size:clamp(7px,.8vw,9px);font-weight:700;letter-spacing:.02em}
.back-brand{position:absolute;z-index:1;left:9%;bottom:7%;display:flex;align-items:center;gap:5px;color:#4f829d;font-weight:900;font-size:8px}.back-brand span{font-size:14px;color:#2188b8}
@media(max-width:740px){body{padding:16px}.toolbar{align-items:flex-start;gap:10px}.cards{grid-template-columns:1fr;max-width:560px}.toolbar span{font-size:11px}}
@media print{@page{size:85.6mm 54mm;margin:0}html,body{width:85.6mm;height:auto;padding:0!important;margin:0!important;background:#fff!important}.toolbar{display:none!important}.cards{display:block;width:85.6mm;margin:0}
.card{width:85.6mm;height:54mm;aspect-ratio:auto;margin:0;border:0;border-radius:3mm;box-shadow:none;break-after:page;page-break-after:always;-webkit-print-color-adjust:exact;print-color-adjust:exact}.card:last-child{break-after:auto;page-break-after:auto}
.front-top{gap:2mm}.logo-mark{width:8mm;height:8mm;font-size:14px}.brand{font-size:11pt}.brand small{font-size:5.5pt}.top-tag{font-size:5pt;padding:1.5mm 2.5mm}.identity{gap:3mm}.portrait{border-radius:4mm;font-size:18pt}
.member-role{font-size:5pt;margin-bottom:1mm}.name{font-size:15pt}.company{font-size:7.5pt;margin-top:1.5mm}.contact-box{padding:1.5mm 2mm;border-radius:2mm;gap:1mm}.contact{font-size:6pt;gap:1.5mm}.contact span{width:3.5mm;height:3.5mm;font-size:5pt}
.member-no small,.validity small{font-size:4.2pt;margin-bottom:1mm}.member-no b,.validity b{font-size:6.3pt}.back:before{border-width:2mm}.back:after{inset:1.5mm;border-radius:2mm}.back-head{padding-top:5mm}.back-title{font-size:10pt}.back-subtitle{font-size:6pt;margin-top:1mm}.status-pill{top:7mm;right:7mm;font-size:5pt;padding:1mm 2mm}
.back-body{height:34mm;padding:1mm 5mm 0;gap:1mm}.benefits{gap:2mm 1mm}.benefit{gap:1mm;font-size:5pt}.benefit-icon{width:6mm;height:6mm;font-size:8pt}.qr-frame{width:23mm;padding:1mm;border-radius:1.5mm}.qr-caption{font-size:4.5pt;margin-top:1mm}.back-foot{bottom:2.5mm;left:19%;right:19%;font-size:4.6pt;padding:1mm 2mm}.back-brand{left:7mm;bottom:2.7mm;font-size:4.5pt}.back-brand span{font-size:8pt}}
</style></head><body>
<header class="toolbar"><span>Carte APEC · Recto et verso · format bancaire</span><button onclick="window.print()">Imprimer / Enregistrer en PDF</button></header>
<main class="cards">
  <article class="card front"><div class="front-top"><span class="logo-mark">💧</span><div class="brand">APEC BÉNIN<small>EAU CONDITIONNÉE · ADHÉSION</small></div><span class="top-tag">MEMBRE OFFICIEL</span></div>
    <div class="identity">${portrait}<div><div class="member-role">Carte de membre</div><div class="name">${escapeHtml(member.first_name)} ${escapeHtml(member.last_name)}</div><div class="company">${escapeHtml(member.company)}</div></div></div>
    <div class="contact-box">${contact}</div><div class="front-footer"><div class="member-no"><small>NUMÉRO D’ADHÉRENT</small><b>${escapeHtml(member.membership_number)}</b></div><div class="validity"><small>VALIDITÉ JUSQU’AU</small><b>${displayDate(member.expires_on)}</b></div></div><div class="wave wave-blue"></div><div class="wave wave-green"></div>
  </article>
  <article class="card back"><div class="back-head"><div class="back-title">Scanner pour vérifier<br>l’adhésion de ce membre</div><div class="back-subtitle">Une carte. Une adhésion vérifiable.</div><span class="status-pill">${valid ? '✓ ACTIF' : '• À RENOUVELER'}</span></div>
    <div class="back-body"><div class="benefits"><div class="benefit"><span class="benefit-icon">♙</span><span>Membre<br>officiel APEC</span></div><div class="benefit"><span class="benefit-icon">💧</span><span>Engagé pour une eau<br>conditionnée de qualité</span></div><div class="benefit"><span class="benefit-icon">◎</span><span>Acteur du secteur<br>au Bénin</span></div><div class="benefit"><span class="benefit-icon">↔</span><span>Transparence<br>et confiance</span></div></div>
      <div class="qr-panel"><div class="qr-frame"><img src="${qrUrl}" alt="QR code de vérification de l’adhésion"></div><div class="qr-caption">SCANNER POUR VÉRIFIER</div></div></div>
    <div class="back-brand"><span>💧</span> APEC BÉNIN</div><div class="back-foot">Carte personnelle · La validité se vérifie en ligne après le scan</div>
  </article>
</main></body></html>`;
}
