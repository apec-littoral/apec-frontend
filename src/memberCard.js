function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

// Reduit la police des textes longs pour qu'ils restent dans la carte.
function fitSize(text, base, maxChars) {
  const length = String(text || '').length;
  return `${(length > maxChars ? Math.max(base * maxChars / length, base * 0.45) : base).toFixed(2)}pt`;
}

const icon = paths => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;

const ICONS = {
  pin: icon('<path fill="#fff" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7m0 9.500a2.500 2.500 0 1 1 0-5 2.500 2.500 0 0 1 0 5"/>'),
  home: icon('<path fill="#fff" d="M12 3 2 12h3v9h5v-6h4v6h5v-9h3z"/>'),
  phone: icon('<path fill="#fff" d="M6.600 10.800a15 15 0 0 0 6.600 6.600l2.200-2.200c.3-.3.700-.4 1-.2 1.200.4 2.400.6 3.600.6.600 0 1 .4 1 1V20c0 .600-.4 1-1 1A17 17 0 0 1 3 4c0-.600.4-1 1-1h3.500c.600 0 1 .4 1 1 0 1.200.2 2.500.6 3.600.1.3 0 .700-.2 1z"/>'),
  mail: icon('<path fill="#fff" d="M3 5h18v14H3z"/><path fill="none" stroke="#1450b4" stroke-width="2" d="m3 6 9 7 9-7"/>'),
};

const SPLASH = `<svg class="splash" viewBox="0 0 320 340" preserveAspectRatio="none" aria-hidden="true">
<defs><linearGradient id="water" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#bfe8fb" stop-opacity="0"/><stop offset=".55" stop-color="#86d0f5" stop-opacity=".55"/><stop offset="1" stop-color="#35a9ea" stop-opacity=".75"/></linearGradient></defs>
<path fill="url(#water)" d="M0 340C70 290 110 300 140 235c18-40-14-74 4-96 16-18 26 20 40 12 18-12-6-70 18-80 20-8 14 52 34 50 22-2 12-82 40-98 22-12 2 62 22 66 14 2 12-26 22-34v285Z"/>
<path fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8" d="M70 318c70-30 90-92 130-108s70 4 120-40M150 330c50-26 90-70 170-84M196 190c6-34 36-46 66-86"/>
<g fill="#5cc0f0" opacity=".75"><circle cx="118" cy="190" r="6"/><circle cx="166" cy="104" r="4"/><circle cx="214" cy="44" r="7"/><circle cx="252" cy="92" r="3"/><circle cx="292" cy="26" r="5"/><circle cx="98" cy="252" r="3"/><circle cx="140" cy="150" r="2.500"/></g></svg>`;

const DROP = '<svg class="drop" viewBox="0 0 40 60" aria-hidden="true"><path fill="#7fd0f7" stroke="#1d8fd8" stroke-width="2" d="M20 3C18 18 4 29 4 42a16 16 0 0 0 32 0C36 29 22 18 20 3Z"/><path fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" d="M11 42c0 6 3 9 7 10"/></svg>';

const SWOOSH = '<svg class="swoosh" viewBox="0 0 240 70" preserveAspectRatio="none" aria-hidden="true"><path fill="#1aa3e0" d="M0 0C30 40 110 62 240 66v4H0Z"/><path fill="#fff" d="M0 12C34 46 110 62 200 70H0Z"/><path fill="#0b3fa8" d="M0 20C34 50 100 64 170 70H0Z"/><path fill="#22b14c" d="M0 46c26 12 54 20 92 24H0Z"/></svg>';

const WAVES = `<svg class="waves" viewBox="0 0 856 120" preserveAspectRatio="none" aria-hidden="true">
<path fill="#1aa3e0" d="M0 18C120 4 260 46 430 72S720 66 856 4V120H0Z"/>
<path fill="#fff" d="M0 24C130 14 270 56 430 80S725 76 856 18V120H0Z"/>
<path fill="#0b3fa8" d="M0 30C130 22 270 66 430 88S725 86 856 30V120H0Z"/>
<path fill="#fff" d="M0 66C110 62 230 96 400 108S700 108 856 74V120H0Z"/>
<path fill="#1273c9" d="M0 72C110 70 230 104 400 116S700 116 856 84V120H0Z"/>
<path fill="#22b14c" d="M0 74C100 76 190 100 290 120H0Z"/></svg>`;

const line = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const solid = paths => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${paths}</svg>`;

const BACK_ICONS = {
  person: solid('<circle cx="12" cy="7" r="5"/><path d="M2 23c0-6 4-9 10-9s10 3 10 9z"/>'),
  badge: solid('<path d="M9 2h6v5H9z"/><path fill-rule="evenodd" d="M3 6h5v2.500h8V6h5v16H3zM8.500 11a2 2 0 1 0 .01 0M5.500 19h6c0-4.500-6-4.500-6 0M13.500 12h5v1.800h-5zm0 3.800h5v1.800h-5z"/>'),
  tie: solid('<path d="M8 2h8l-2 5 3 10-5 6-5-6 3-10z"/>'),
  card: solid('<path fill-rule="evenodd" d="M2 4h20v16H2zM8 7.500a2.300 2.300 0 1 0 .01 0M4.500 17h7c0-5.500-7-5.500-7 0M13.500 8.500h6v1.900h-6zm0 4.300h6v1.900h-6z"/>'),
  shield: solid('<path d="M12 1 3 4.500V12c0 6 4 9.500 9 11 5-1.500 9-5 9-11V4.500z"/><path fill="none" stroke="#fff" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round" d="m7.500 12 3.200 3.200 6-6.400"/>'),
  factory: solid('<path d="M2 22V10l6 4v-4l6 4V3h6l2 19zM6 17v2h2v-2zm5 0v2h2v-2zm5 0v2h2v-2z"/>'),
  calendar: solid('<path d="M3 5h3V2h3v3h6V2h3v3h3v4H3z"/><path fill-rule="evenodd" d="M3 10h18v12H3zm3 2.500v2.500h3v-2.500zm4.500 0v2.500h3v-2.500zm4.500 0v2.500h3v-2.500zM6 17v2.500h3V17zm4.500 0v2.500h3V17zm4.500 0v2.500h3V17z"/>'),
  expiry: line('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 2v5M16 2v5m-8 8.500 3 3 5-5"/>'),
  clock: line('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
  team: solid('<circle cx="12" cy="6" r="4"/><circle cx="4.500" cy="9" r="3"/><circle cx="19.500" cy="9" r="3"/><path d="M0 20c0-5 2-7 5-7 1 0 2 .3 2.500 1C6 16 5.500 18 5.500 20zM24 20c0-5-2-7-5-7-1 0-2 .3-2.500 1 1.500 2 2 4 2 6zM7 22c0-6 2-10 5-10s5 4 5 10z"/><path fill="#fff" d="M12 14.500c-1.500 2.200-2.300 3.400-2.300 4.600a2.300 2.300 0 0 0 4.600 0c0-1.200-.8-2.400-2.300-4.600"/>'),
  lock: line('<path d="M12 2 4 5v7c0 5 3.500 8.500 8 10 4.500-1.500 8-5 8-10V5z"/><rect x="8.500" y="11" width="7" height="5.500" rx="1"/><path d="M10 11V9a2 2 0 0 1 4 0v2"/>'),
};

const longDate = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

// Les jours restants sont figes au moment de l'impression : la date de calcul est donc indiquee.
const BACK_DECOR = `<svg class="decor" viewBox="0 0 856 540" preserveAspectRatio="none" aria-hidden="true">
<defs>
<linearGradient id="dBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2f8f"/><stop offset=".55" stop-color="#0b55c4"/><stop offset="1" stop-color="#0a3596"/></linearGradient>
<linearGradient id="dSky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8fdcfb"/><stop offset="1" stop-color="#118fe0"/></linearGradient>
<linearGradient id="dGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f7a2c"/><stop offset=".5" stop-color="#2fb344"/><stop offset="1" stop-color="#12862f"/></linearGradient>
<radialGradient id="dMist"><stop offset="0" stop-color="#9bdcfa" stop-opacity=".55"/><stop offset="1" stop-color="#9bdcfa" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="30" cy="250" rx="90" ry="190" fill="url(#dMist)"/><ellipse cx="835" cy="300" rx="80" ry="200" fill="url(#dMist)"/><ellipse cx="200" cy="30" rx="110" ry="60" fill="url(#dMist)" opacity=".6"/>
<path fill="url(#dBlue)" d="M752 0H856V480C851 420 852 340 853 250C854 140 826 56 752 0Z"/>
<path fill="url(#dGreen)" d="M748 4C830 54 856 140 854 252C853 320 849 372 840 408C843 360 843 305 843 250C842 142 815 62 748 4Z"/>
<path fill="none" stroke="url(#dSky)" stroke-width="3" d="M730 8C812 62 838 146 837 250C836 312 835 356 831 392"/>
<path fill="url(#dBlue)" d="M0 70C20 170 18 300 11 380L0 440Z"/>
<path fill="none" stroke="url(#dSky)" stroke-width="4" d="M24 24C8 90 25 190 24 270C23 330 17 380 10 420"/>
<path fill="url(#dSky)" d="M0 398C48 414 112 466 330 476H0Z"/>
<path fill="#fff" d="M0 413C56 428 128 470 296 476H0Z"/>
<path fill="url(#dBlue)" d="M0 422C66 436 136 472 268 476H0Z"/>
<path fill="#fff" d="M0 442C58 452 108 470 188 476H0Z"/>
<path fill="url(#dGreen)" d="M0 449C50 458 94 470 164 476H0Z"/>
<path fill="url(#dSky)" d="M856 436C851 456 838 470 818 476H856Z"/>
<path fill="#fff" d="M856 449C850 464 842 472 830 476H856Z"/>
<path fill="url(#dBlue)" d="M856 456C851 466 845 473 836 476H856Z"/>
</svg>`;

// Goutte brillante posee sur ses ondulations.
const BIG_DROP = `<svg class="b-drop" viewBox="0 0 100 112" aria-hidden="true">
<defs><radialGradient id="dDrop" cx=".38" cy=".68" r=".72"><stop offset="0" stop-color="#e4f8ff"/><stop offset=".35" stop-color="#6fd0fb"/><stop offset=".75" stop-color="#1597ea"/><stop offset="1" stop-color="#0753b8"/></radialGradient></defs>
<g fill="none" stroke="#2a9fe6"><ellipse cx="50" cy="97" rx="46" ry="11" stroke-width="1.500" opacity=".45"/><ellipse cx="50" cy="97" rx="31" ry="7" stroke-width="2" opacity=".7"/><ellipse cx="50" cy="96" rx="17" ry="3.500" stroke-width="2.500"/></g>
<path fill="url(#dDrop)" d="M50 2C46 28 22 47 22 67a28 28 0 0 0 56 0C78 47 54 28 50 2Z"/>
<path fill="none" stroke="#fff" stroke-width="5.500" stroke-linecap="round" d="M33 66c0 10 6 17 14 19"/><circle cx="37" cy="52" r="3.200" fill="#fff"/>
</svg>`;

// Trait courbe effile, comme sous les textes du modele.
const FLOURISH = (className) => `<svg class="flourish ${className}" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true"><path fill="#0b55c4" d="M2 17C52 3 140 1 198 11C140 6 58 8 2 17Z"/></svg>`;

const FEATURE_SHIELD = `<svg viewBox="0 0 64 72" aria-hidden="true"><defs><linearGradient id="dShield" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1473e6"/><stop offset="1" stop-color="#082c86"/></linearGradient></defs><path fill="url(#dShield)" d="M32 1 3 12v22c0 19 12 31 29 37 17-6 29-18 29-37V12Z"/><path fill="none" stroke="#fff" stroke-width="3" d="M32 8 10 16.500V34c0 14 9 24 22 29 13-5 22-15 22-29V16.500Z"/><path fill="none" stroke="#fff" stroke-width="7.500" stroke-linecap="round" stroke-linejoin="round" d="m20 35 9 9 16-18"/></svg>`;

export function remainingDays(expiresOn, today) {
  if (!expiresOn) return 'Illimité';
  const days = Math.round((Date.parse(`${expiresOn}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
  if (days < 0) return 'Aucun';
  return `${days} j (au ${today.split('-').reverse().join('/')})`;
}

// Signataire des cartes : a mettre a jour avec la signature si le president change.
const SIGNER = { name: 'Jonas M. AGBOTON', title: 'Président de l’APEC-LIT' };

export function buildCardDocument(member, qrUrl, photoUrl, logoUrl = '', assets = {}) {
  const valid = member.active && (!member.expires_on || member.expires_on >= new Date().toLocaleDateString('sv-SE', { timeZone: 'Africa/Porto-Novo' }));
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Africa/Porto-Novo' });
  const expired = Boolean(member.expires_on) && member.expires_on < today;
  const initials = `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`;
  const fullName = `${member.first_name} ${String(member.last_name || '').toLocaleUpperCase('fr-FR')}`;
  const role = member.role || 'Membre de l’APEC-LIT';
  const portrait = photoUrl
    ? `<img class="portrait" src="${photoUrl}" alt="Portrait de ${escapeHtml(fullName)}">`
    : `<div class="portrait initials">${escapeHtml(initials)}</div>`;
  // Le cachet et la signature ne sont apposes que sur une adhesion active.
  const mark = (data, className, label) => valid && data?.startsWith('data:image/png;base64,') ? `<img class="${className}" src="${escapeHtml(data)}" alt="${label}">` : '';
  const missingMarks = valid && !(assets.stamp && assets.signature);
  const rows = [
    ['pin', 'Département / Commune', member.commune || 'LITTORAL'],
    ['home', 'Adresse complète', member.address],
    ['phone', 'Téléphone', [member.phone, member.phone2].filter(Boolean).join(' / ')],
    ['mail', 'Email', member.email],
  ].filter(([, , value]) => value)
    .map(([name, label, value]) => `<div class="row"><i>${ICONS[name]}</i><div><small>${label}</small><span style="font-size:${fitSize(value, 5.6, 32)}">${escapeHtml(value)}</span></div></div>`)
    .join('');

  const table = [
    ['person', 'Nom et prénoms', escapeHtml(fullName), fullName],
    ['badge', 'Qualité', escapeHtml(member.quality || 'Membre'), member.quality || 'Membre'],
    ['tie', 'Fonction', escapeHtml(member.role || '—'), member.role || '—'],
    ['card', 'N° de membre', escapeHtml(member.membership_number), member.membership_number],
    ['shield', 'Statut', `<em class="state">${valid ? '✓' : '✕'}</em> ${valid ? 'ACTIF' : 'NON ACTIF'}`, 'NON ACTIF'],
    ['factory', 'Usine', escapeHtml(member.company), member.company],
    ['calendar', 'Date d’adhésion', longDate(member.joined_on) || '—', '', true],
    ['expiry', 'Date d’expiration', longDate(member.expires_on) || 'Illimitée', '', !member.expires_on],
    ['clock', 'Jours restants', remainingDays(member.expires_on, today), remainingDays(member.expires_on, today), !member.expires_on],
    ['calendar', 'Validité', !member.active ? 'Suspendue' : expired ? 'Expirée' : member.expires_on ? 'Limitée' : 'Illimitée', '', !member.expires_on],
  ].map(([name, label, html, text, plain], index) => {
    const dark = plain && index > 6;
    const long = String(text).length > (name === 'person' ? 16 : 22);
    return `<div class="tr"><i>${BACK_ICONS[name]}</i><b>${label}</b><span class="${dark ? 'dark' : ''}${long ? ' wrap' : ''}" style="font-size:${long ? fitSize(text, 4.200, 38) : '4.700pt'}">: ${html}</span></div>`;
  }).join('');

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Carte APEC-LIT — ${escapeHtml(fullName)}</title>
<style>
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;padding:24px;background:#eef3f6;color:#10151d;font-family:Arial,Helvetica,sans-serif}
.toolbar{max-width:720px;margin:0 auto 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;color:#617b91;font-size:13px}
.toolbar button{border:0;border-radius:9px;background:#176fb3;color:#fff;font-weight:700;padding:11px 16px;cursor:pointer}
.cards{display:flex;flex-direction:column;align-items:center;gap:7mm}
/* La carte est dessinee en millimetres, puis agrandie a l'ecran. */
.card{position:relative;width:85.6mm;height:54mm;overflow:hidden;background:#fff;border-radius:3mm;box-shadow:0 2mm 5mm #173c6025;zoom:2}
.card>*{position:absolute}
.splash{right:0;top:7mm;width:32mm;height:40mm}
.drop{left:64.500mm;top:5.500mm;width:5mm;height:7.500mm}
.logo{left:2mm;top:1.2mm;width:20mm;height:16.500mm;object-fit:contain}
.title{left:23mm;width:40mm;top:1mm;text-align:center;line-height:1;color:#0b3a9e}
.title b{display:block;font-size:21pt;font-weight:900;white-space:nowrap}.title b em{font-style:normal;color:#178a35}
.title strong{display:block;margin-top:.5mm;font-size:4.700pt;line-height:1.18;text-transform:uppercase;white-space:nowrap}
.title span{display:inline-block;margin-top:.4mm;padding:.55mm 2.500mm;border-radius:3mm;background:#0b3fa8;color:#fff;font-size:4.800pt;font-weight:700;white-space:nowrap}
.status{right:2mm;top:2mm;display:flex;align-items:center;gap:1mm;height:4.200mm;padding:0 2.200mm;border-radius:3mm;background:${valid ? '#178a35' : '#b3362f'};color:#fff;font-size:6pt;font-weight:900}
.status i{display:flex;align-items:center;justify-content:center;width:2.400mm;height:2.400mm;border-radius:.4mm;background:#fff;color:${valid ? '#178a35' : '#b3362f'};font-style:normal;font-size:5.500pt}
.portrait{left:2.200mm;top:18.800mm;width:19.500mm;height:24.500mm;object-fit:cover;border:.5mm solid #22a447;border-radius:2.500mm;background:#e8f1f7;z-index:2}
.initials{display:flex;align-items:center;justify-content:center;font-size:17pt;font-weight:800;color:#0b3a9e}
.name{left:23.500mm;top:19mm;width:37.500mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:900;line-height:4mm;height:4mm}
.name.long{top:19.200mm;height:4.400mm;white-space:normal;line-height:2.200mm;overflow-wrap:anywhere}.name.long+.role{top:23.700mm}
.role{left:23.500mm;top:23.200mm;width:37.500mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:900;text-transform:uppercase;color:#0b3a9e;line-height:3mm;height:3mm}
.rows{left:23.700mm;top:27mm;width:37.300mm}
.row{display:flex;gap:1.300mm;height:4.150mm;align-items:center}
.row i{flex:none;width:3.500mm;height:3.500mm;border-radius:.8mm;background:#1450b4;display:flex;align-items:center;justify-content:center}.row i svg{width:2.400mm;height:2.400mm}
.row div{min-width:0;line-height:1.08}
.row small{display:block;font-size:4.300pt;font-weight:700;color:#178a35}
.row span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.qr{left:62.200mm;top:20.500mm;width:21.500mm;height:21.500mm;border:.4mm solid #1450b4;border-radius:1.500mm;background:#fff;overflow:hidden;z-index:2}
.qr img{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated}
/* Le logo central reste petit pour ne pas gener la lecture du code. */
.qr .qr-logo{inset:auto;left:40.500%;top:40.500%;width:19%;height:19%;object-fit:contain;background:#fff;border-radius:50%;image-rendering:auto}
.waves{left:0;bottom:0;width:100%;height:12mm}
.number{right:1.800mm;bottom:5.500mm;max-width:30mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:.9mm 2.500mm;border:.3mm solid #7fd694;border-radius:3mm;background:#178a35;color:#fff;font-weight:900}
/* Verso : informations personnelles */
.back>.b-logo,.back>.b-assoc,.back>.b-name,.back>.table,.back>.feature{z-index:2}
.decor{left:0;top:0;width:100%;height:100%}
.frame{inset:0;border:.9mm solid #0a3a9e;border-radius:3mm;box-shadow:inset 0 0 0 .3mm #fff,inset 0 0 0 .55mm #35a8ee;z-index:6;pointer-events:none}
.b-logo{left:3.700mm;top:2.300mm;width:18.600mm;height:18.600mm;object-fit:contain;padding:.35mm;border:.3mm solid #1b8fe0;border-radius:50%;background:#fff;box-shadow:0 0 0 .35mm #fff,0 0 0 .55mm #9bd8f8}
.b-assoc{left:24mm;width:41mm;top:1.600mm;text-align:center;font-size:4.700pt;font-weight:900;line-height:1.18;color:#0b3a9e;text-transform:uppercase;white-space:nowrap}
.b-name{left:24mm;width:41mm;top:5.500mm;text-align:center;font-size:20pt;font-weight:900;line-height:1;color:#0b3a9e;white-space:nowrap}.b-name em{font-style:normal;color:#178a35}
.table{left:24.700mm;top:12.500mm;width:39.600mm}
.table h2{margin:0 0 .25mm;height:2.900mm;line-height:2.900mm;text-align:center;background:linear-gradient(90deg,#0a2f8f,#0b4ab8,#0a2f8f);border-radius:1.500mm;color:#fff;font-size:5.300pt}
.rows-box{border:.25mm solid #4c86d6;border-radius:1.500mm;overflow:hidden;background:#fff}.rows-box .tr:first-child{border-top:0}
.tr{display:grid;grid-template-columns:4mm 15.600mm minmax(0,1fr);align-items:center;height:3.060mm;border-top:.15mm solid #b8ccec}
.tr i{display:flex;justify-content:center;color:#0b3fa8}.tr i svg{width:2.350mm;height:2.350mm}
.tr b{font-size:4.400pt;text-transform:uppercase;white-space:nowrap}
.tr span{height:100%;display:flex;align-items:center;gap:.6mm;padding-left:.8mm;border-left:.15mm solid #b8ccec;font-weight:700;color:#137a2c;white-space:nowrap;overflow:hidden;line-height:1.05}
.tr span.dark{color:#10151d}.tr span.wrap{white-space:normal;overflow-wrap:anywhere}
.state{display:inline-flex;align-items:center;justify-content:center;width:2.200mm;height:2.200mm;border-radius:.4mm;background:${valid ? '#178a35' : '#b3362f'};color:#fff;font-style:normal;font-size:4.500pt}
.feature{left:2.800mm;width:21mm;display:flex;align-items:center;gap:1.200mm;color:#0b3a9e;font-size:5.200pt;font-weight:900;line-height:1.2;padding-bottom:1.500mm}
.feature svg{flex:none;width:6.500mm;height:6.500mm}.feature em{font-style:normal;color:#178a35}
.feature.one{top:23mm}.feature.two{top:33.200mm}
.flourish{height:1.100mm;z-index:2}.f-one{left:3.500mm;top:31.200mm;width:20mm}.f-two{left:3.500mm;top:40.200mm;width:20mm}.f-motto{left:65mm;top:19.100mm;width:18.200mm}
.b-drop{left:69.200mm;top:1.300mm;width:9.600mm;height:10.800mm;z-index:2}
.motto{left:64.700mm;width:18.800mm;top:12.600mm;text-align:center;color:#0b3a9e;font-size:5.200pt;font-weight:900;line-height:1.25;z-index:2}
/* Cachet et signature a la place des mentions retirees */
.stamp{left:66.900mm;top:20.700mm;width:13.600mm;height:13.600mm;object-fit:contain;z-index:3}
.signature{left:64.800mm;top:33.900mm;width:18mm;height:7.900mm;object-fit:contain;z-index:4;filter:brightness(.6) saturate(1.9) drop-shadow(0 0 .06mm #23358f)}
.signer{left:64.400mm;width:18.800mm;top:42.200mm;text-align:center;line-height:1.2;white-space:nowrap;z-index:5}.signer b{display:block;font-size:5.300pt;color:#10151d}.signer span{display:block;font-size:4.300pt;font-weight:700;color:#0b3a9e}
.swoosh{left:0;top:41mm;width:24mm;height:7mm}
.b-foot{left:0;right:0;bottom:0;height:6.600mm;background:linear-gradient(90deg,#082878,#0b3c9c,#082878);border-top:.35mm solid #35a8ee;display:flex;align-items:center;justify-content:center;gap:2mm;color:#fff;font-size:4.700pt;white-space:nowrap;z-index:2}
.b-foot svg{width:4.200mm;height:4.200mm}.b-foot u{width:5mm;height:.2mm;background:#9db8e8}
@media(max-width:700px){body{padding:12px}.card{zoom:1.05}}
@media print{@page{size:85.6mm 54mm;margin:0}html,body{width:85.6mm;padding:0!important;margin:0!important;background:#fff!important}.toolbar{display:none!important}.cards{display:block}.card{zoom:1;border-radius:0;box-shadow:none;break-after:page;page-break-after:always}.card:last-child{break-after:auto;page-break-after:auto}}
</style></head><body>
<header class="toolbar"><span>Carte APEC-LIT · recto et verso · format bancaire${valid ? '' : ' · Adhésion non active'}${missingMarks ? ' · ⚠ Cachet ou signature manquant' : ''}</span><button onclick="window.print()">Imprimer / Enregistrer en PDF</button></header>
<main class="cards">
  <article class="card front">
    ${SPLASH}${DROP}
    <img class="logo" src="${logoUrl}" alt="Logo APEC-LIT">
    <div class="title"><b>APEC-<em>LIT</em></b><strong>Association des promoteurs<br>d’eau conditionnée « Pure Water »<br>du Littoral</strong><span>CARTE DE MEMBRE OFFICIELLE</span></div>
    <div class="status"><i>${valid ? '✓' : '✕'}</i>${valid ? 'ACTIF' : 'NON ACTIF'}</div>
    ${portrait}
    <div class="name${fullName.length > 24 ? ' long' : ''}" style="font-size:${fullName.length > 24 ? fitSize(fullName, 6.4, 44) : fitSize(fullName, 11, 14)}">${escapeHtml(fullName)}</div>
    <div class="role" style="font-size:${fitSize(role, 7.4, 20)}">${escapeHtml(role)}</div>
    <div class="rows">${rows}</div>
    <div class="qr"><img src="${qrUrl}" alt="QR code de vérification de l’adhésion"><img class="qr-logo" src="${logoUrl}" alt=""></div>
    ${WAVES}
    <div class="number" style="font-size:${fitSize(member.membership_number, 7.5, 15)}">${escapeHtml(member.membership_number)}</div>
  </article>
  <article class="card back">
    ${BACK_DECOR}
    <img class="b-logo" src="${logoUrl}" alt="Logo APEC-LIT">
    <div class="b-assoc">Association des promoteurs d’eau<br>conditionnée « Pure Water » du Littoral</div>
    <div class="b-name">APEC-<em>LIT</em></div>
    <div class="table"><h2>INFORMATIONS PERSONNELLES</h2><div class="rows-box">${table}</div></div>
    <div class="feature one">${FEATURE_SHIELD}<div>Membre<br>officiel<br><em>APEC-LIT</em></div></div>
    <div class="feature two">${BACK_ICONS.team}<div>Engagé pour<br>une eau de qualité</div></div>
    ${BIG_DROP}${FLOURISH('f-one')}${FLOURISH('f-two')}${FLOURISH('f-motto')}
    <div class="motto">Eau potable -<br>Bien-être - Solidarité</div>
    ${mark(assets.stamp, 'stamp', 'Cachet de l’APEC-LIT')}${mark(assets.signature, 'signature', `Signature de ${SIGNER.name}`)}
    ${mark(assets.signature, 'signature', '') ? `<div class="signer"><b>${SIGNER.name}</b><span>${SIGNER.title}</span></div>` : ''}
    <div class="b-foot">${BACK_ICONS.lock}<u></u><span>Cette carte est strictement personnelle. Toute reproduction est interdite.</span><u></u>${BACK_ICONS.lock}</div>
    <span class="frame"></span>
  </article>
</main></body></html>`;
}
