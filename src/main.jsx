import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowLeft, BadgeCheck, Building2, CalendarDays, Check, ChevronRight, LogOut, Moon, Plus, Printer, QrCode, Search, ShieldCheck, Sun, Trash2, UserRound, X } from 'lucide-react';
import './style.css';
import './memberExtras.css';
import { buildCardDocument } from './memberCard.js';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const emptyMember = { first_name: '', last_name: '', membership_number: '', company: '', phone: '', email: '', joined_on: '', expires_on: '', active: true };

function App() {
  const token = window.location.pathname.match(/^\/verify\/([^/]+)\/?$/)?.[1];
  const [theme, setTheme] = useState(() => {
    const saved = window.localStorage.getItem('apec-theme');
    return saved || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('apec-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(current => current === 'dark' ? 'light' : 'dark');
  if (token) return <Verification token={decodeURIComponent(token)} theme={theme} toggleTheme={toggleTheme} />;
  return <Admin theme={theme} toggleTheme={toggleTheme} />;
}

function Brand({ subtitle, className = '' }) {
  return <div className={`brand-lock ${className}`}>
    <img className="brand-logo" src="/logo-apec.png" alt="Logo APEC-LIT" />
    <div><b>APEC-LIT</b><small>{subtitle}</small></div>
  </div>;
}

function ThemeToggle({ theme, toggleTheme, className = '' }) {
  const dark = theme === 'dark';
  return <button type="button" className={`theme-toggle ${className}`} onClick={toggleTheme} aria-label={dark ? 'Activer le mode clair' : 'Activer le mode sombre'} title={dark ? 'Mode clair' : 'Mode sombre'}>
    {dark ? <Sun size={16} /> : <Moon size={16} />}<span>{dark ? 'Mode clair' : 'Mode sombre'}</span>
  </button>;
}

function Verification({ token, theme, toggleTheme }) {
  const [member, setMember] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch(`${API}/api/verify/${encodeURIComponent(token)}`).then(async r => {
      if (!r.ok) throw new Error();
      setMember(await r.json());
    }).catch(() => setError(true));
  }, [token]);
  const valid = member?.active;
  return <main className="verify-shell">
    <div className="verify-top"><Brand className="verify-brand" subtitle="Association des promoteurs d'eau conditionnée"/><ThemeToggle theme={theme} toggleTheme={toggleTheme}/></div>
    <section className="verify-card">
      <div className={`verify-icon ${error ? 'invalid' : member ? valid ? 'valid' : 'invalid' : ''}`}>{error ? <X/> : member ? valid ? <BadgeCheck/> : <X/> : <span className="loader"/>}</div>
      <p className="eyebrow">VÉRIFICATION DE CARTE</p>
      <h1>{error ? 'Carte introuvable' : !member ? 'Vérification en cours…' : valid ? 'Adhésion confirmée' : 'Adhésion expirée'}</h1>
      {member && <><p className="verify-note">Cette carte est associée au membre suivant :</p><div className="verify-person"><div className="avatar"><UserRound size={22}/></div><div><strong>{member.first_name} {member.last_name}</strong><span>{member.company}</span></div></div><div className="verify-details"><div><span>Numéro membre</span><b>{member.membership_number}</b></div><div><span>Statut</span><b className={valid ? 'status-text' : 'status-text expired'}>{valid ? 'Membre actif' : 'Non actif'}</b></div>{member.expires_on && <div><span>Valable jusqu'au</span><b>{formatDate(member.expires_on)}</b></div>}</div><p className="small-disclaimer">Vérification délivrée par l'APEC Bénin</p></>}
      {error && <p className="verify-note">Ce QR code ne correspond à aucun membre enregistré.</p>}
    </section><footer className="site-footer">APEC Bénin <span>•</span> Portail de vérification</footer>
  </main>;
}

function Admin({ theme, toggleTheme }) {
  const [credentials, setCredentials] = useState(null);
  const [login, setLogin] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [members, setMembers] = useState([]);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Tous');
  const [editing, setEditing] = useState(null);

  const auth = useMemo(() => credentials ? `Basic ${btoa(unescape(encodeURIComponent(`${credentials.username}:${credentials.password}`)))}` : '', [credentials]);
  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, { ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), Authorization: auth, ...options.headers } });
    if (response.status === 401) { setCredentials(null); throw new Error('Identifiants invalides ou session expirée.'); }
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.detail || 'Une erreur est survenue.'); }
    return response.status === 204 ? null : response.json();
  }
  async function refresh() { try { setMembers(await request('/api/members')); } catch (e) { setNotice(e.message); } }
  useEffect(() => { if (credentials) refresh(); }, [credentials]);

  async function signIn(e) {
    e.preventDefault(); setLoginError('');
    const candidate = { ...login };
    try {
      const r = await fetch(`${API}/api/members`, { headers: { Authorization: `Basic ${btoa(unescape(encodeURIComponent(`${candidate.username}:${candidate.password}`)))}` } });
      if (!r.ok) throw new Error(r.status === 401 ? 'Identifiants incorrects.' : 'Impossible de joindre le serveur.');
      setMembers(await r.json()); setCredentials(candidate);
    } catch (err) { setLoginError(err.message); }
  }
  async function saveMember(form) {
    const payload = { ...form, joined_on: form.joined_on || null, expires_on: form.expires_on || null };
    const item = editing;
    await request(item ? `/api/members/${item.id}` : '/api/members', { method: item ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    setEditing(null); setNotice(item ? 'Les informations du membre ont été mises à jour.' : 'Le membre a été ajouté.'); await refresh();
  }
  async function editMember(member) {
    const form = { ...member };
    if (member.has_photo) {
      try {
        const response = await fetch(`${API}/api/members/${member.id}/photo`, { headers: { Authorization: auth } });
        if (response.ok) form.photo_data = await blobAsDataUrl(await response.blob());
      } catch { /* Preserve the stored photo if its preview cannot be loaded. */ }
    }
    setEditing(form);
  }
  async function removeMember(member) {
    if (!window.confirm(`Supprimer la fiche de ${member.first_name} ${member.last_name} ?`)) return;
    try { await request(`/api/members/${member.id}`, { method: 'DELETE' }); setNotice('La fiche a été supprimée.'); await refresh(); } catch (e) { setNotice(e.message); }
  }
  async function printCard(member) {
    try {
      const r = await fetch(`${API}/api/qr/${encodeURIComponent(member.qr_token)}.png`, { headers: { Authorization: auth } });
      if (!r.ok) throw new Error('Le QR code n’a pas pu être créé.');
      const qr = URL.createObjectURL(await r.blob());
      let photo = null;
      if (member.has_photo) {
        const photoResponse = await fetch(`${API}/api/members/${member.id}/photo`, { headers: { Authorization: auth } });
        if (photoResponse.ok) photo = URL.createObjectURL(await photoResponse.blob());
      }
      const popup = window.open('', '_blank', 'width=900,height=620');
      if (!popup) { URL.revokeObjectURL(qr); if (photo) URL.revokeObjectURL(photo); throw new Error('Autorisez les fenêtres contextuelles pour imprimer la carte.'); }
      popup.document.write(buildCardDocument(member, qr, photo, `${window.location.origin}/logo-apec.png`));
      popup.document.close();
      setTimeout(() => { URL.revokeObjectURL(qr); if (photo) URL.revokeObjectURL(photo); }, 60000);
    } catch (e) { setNotice(e.message); }
  }

  const filtered = members.filter(m => `${m.first_name} ${m.last_name} ${m.company} ${m.membership_number}`.toLowerCase().includes(query.toLowerCase())).filter(m => filter === 'Tous' || (filter === 'Actifs' ? m.active && (!m.expires_on || m.expires_on >= today()) : !m.active || (m.expires_on && m.expires_on < today())));
  if (!credentials) return <main className="login-layout"><div className="login-art"><div className="art-glow"/><div className="brand-lock"><img className="brand-logo" src="/logo-apec.png" alt="Logo APEC-LIT"/><div><b>APEC BÉNIN</b><small>Association des promoteurs d'eau conditionnée</small></div></div><div className="art-copy"><p className="eyebrow">ESPACE ASSOCIATION</p><h1>Les adhésions,<br/>en toute clarté.</h1><p>Gérez les membres et vérifiez leurs cartes depuis un espace unique.</p></div><div className="art-bottom">PLATEFORME DE GESTION DES MEMBRES <span>·</span> BÉNIN</div></div><section className="login-panel"><ThemeToggle theme={theme} toggleTheme={toggleTheme} className="login-theme-toggle"/><div className="login-box"><Brand className="mobile-brand" subtitle="Portail adhérents"/><div className="eyebrow">BON RETOUR</div><h2>Connexion</h2><p className="muted">Connectez-vous à l'espace de gestion de l'association.</p><form onSubmit={signIn} className="login-form"><label>Nom d'utilisateur<input autoComplete="username" value={login.username} onChange={e=>setLogin({...login,username:e.target.value})} required placeholder="Votre identifiant"/></label><label>Mot de passe<input type="password" autoComplete="current-password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})} required placeholder="Votre mot de passe"/></label>{loginError && <div className="form-error">{loginError}</div>}<button className="button primary full">Accéder à mon espace <ChevronRight size={16}/></button></form><div className="secure-note"><ShieldCheck size={15}/> Accès réservé aux responsables de l'association</div></div><footer className="login-footer">APEC Bénin · Portail des adhésions</footer></section></main>;

  const activeCount = members.filter(m => m.active && (!m.expires_on || m.expires_on >= today())).length;
  const inactiveCount = members.length - activeCount;
  return <div className="app-shell"><aside className="sidebar"><div className="brand-lock"><img className="brand-logo" src="/logo-apec.png" alt="Logo APEC-LIT"/><div><b>APEC BÉNIN</b><small>Portail adhérents</small></div></div><div className="nav-caption">GESTION</div><div className="nav-item selected"><UserRound size={17}/> Membres <span className="nav-count">{members.length}</span></div><div className="sidebar-bottom"><div className="user-mini"><div className="user-avatar">{credentials.username.slice(0,1).toUpperCase()}</div><div><b>{credentials.username}</b><small>Administrateur</small></div><button className="icon-button logout" title="Déconnexion" onClick={()=>{setCredentials(null);setMembers([]);}}><LogOut size={17}/></button></div><div className="sidebar-foot">Association des promoteurs<br/>d'eau conditionnée du Bénin</div></div></aside>
    <main className="main-area"><header className="topbar"><div className="breadcrumb">Espace association <ChevronRight size={14}/> <b>Membres</b></div><div className="topbar-actions"><ThemeToggle theme={theme} toggleTheme={toggleTheme}/><div className="secure-pill"><span/> Espace sécurisé</div></div></header><section className="content"><div className="page-heading"><div><div className="eyebrow">VOTRE ASSOCIATION</div><h1>Gestion des membres</h1><p>Gérez les adhésions et éditez les cartes de membre.</p></div><button className="button primary" onClick={()=>setEditing({ ...emptyMember })}><Plus size={17}/> Ajouter un membre</button></div>
      <div className="stats-grid"><Stat icon={<UserRound/>} label="Total des membres" value={members.length} tone="mint"/><Stat icon={<Activity/>} label="Adhésions actives" value={activeCount} tone="green"/><Stat icon={<CalendarDays/>} label="À renouveler" value={inactiveCount} tone="amber"/></div>
      <section className="members-panel"><div className="panel-head"><div><h2>Annuaire des membres</h2><p>Retrouvez les informations et cartes de vos adhérents.</p></div><div className="table-tools"><div className="search-wrap"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher un membre…"/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>Tous</option><option>Actifs</option><option>À renouveler</option></select></div></div>{notice && <div className="notice" onClick={()=>setNotice('')}>{notice}<button><X size={14}/></button></div>}
        <div className="table-wrap"><table><thead><tr><th>MEMBRE</th><th>ENTREPRISE</th><th>N° ADHÉRENT</th><th>STATUT</th><th>VALIDITÉ</th><th></th></tr></thead><tbody>{filtered.length === 0 ? <tr><td className="empty-state" colSpan="6">{members.length ? 'Aucun résultat pour cette recherche.' : 'Aucun membre pour le moment. Ajoutez votre premier adhérent.'}</td></tr> : filtered.map(m => { const valid = m.active && (!m.expires_on || m.expires_on >= today()); return <tr key={m.id}><td><div className="member-cell"><div className="member-avatar">{m.first_name[0]}{m.last_name[0]}</div><div><b>{m.first_name} {m.last_name}</b><small>{m.email || m.phone || '—'}</small></div></div></td><td>{m.company}</td><td className="mono">{m.membership_number}</td><td><span className={`badge ${valid ? 'badge-active' : 'badge-off'}`}><i/>{valid ? 'Actif' : 'À renouveler'}</span></td><td className="date-cell">{m.expires_on ? formatDate(m.expires_on) : 'Sans échéance'}</td><td><div className="row-actions"><button className="button outline small" onClick={()=>printCard(m)}><Printer size={14}/> Carte</button><button className="icon-button" title="Modifier" onClick={()=>editMember(m)}><ChevronRight size={17}/></button><button className="icon-button danger" title="Supprimer" onClick={()=>removeMember(m)}><Trash2 size={15}/></button></div></td></tr>})}</tbody></table></div><div className="table-foot">{filtered.length} membre{filtered.length>1?'s':''} affiché{filtered.length>1?'s':''}<span><ShieldCheck size={14}/> Les informations privées restent dans l'espace sécurisé.</span></div></section><div className="content-foot">APEC Bénin <span>·</span> Gestion des adhésions</div></section></main>{editing && <MemberModal member={editing} close={()=>setEditing(null)} save={saveMember}/>}</div>;
}

function Stat({icon,label,value,tone}) { return <div className="stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><div><span>{label}</span><b>{value}</b></div><span className="stat-trend"><Check size={13}/></span></div> }
function MemberModal({member,close,save}) {
  const [form,setForm] = useState({...emptyMember,...member}); const [error,setError] = useState(''); const [saving,setSaving] = useState(false);
  async function submit(e){e.preventDefault();setSaving(true);setError('');try{await save(form)}catch(err){setError(err.message)}finally{setSaving(false)}}
  const change=(key,value)=>setForm({...form,[key]:value});
  async function pickPhoto(file){setError('');try{change('photo_data',await compressPortrait(file))}catch(e){setError(e.message)}}
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&close()}><section className="member-modal"><div className="modal-heading"><div><span className="eyebrow">FICHE ADHÉRENT</span><h2>{member.id?'Modifier le membre':'Nouvel adhérent'}</h2><p>Les coordonnées restent confidentielles.</p></div><button className="icon-button" onClick={close}><X/></button></div><form onSubmit={submit}><div className="photo-upload-row"><div className="photo-preview">{form.photo_data ? <img src={form.photo_data} alt="Portrait du membre"/> : <UserRound size={25}/>}</div><div className="photo-copy"><b>Portrait sur la carte</b><small>Photo facultative · JPG, PNG ou WebP</small><label className="photo-pick">Choisir une photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>e.target.files?.[0]&&pickPhoto(e.target.files[0])}/></label></div>{form.photo_data && <button type="button" className="icon-button danger" title="Retirer la photo" onClick={()=>change('photo_data',null)}><Trash2 size={16}/></button>}</div><div className="form-grid"><label>Prénom<input value={form.first_name} onChange={e=>change('first_name',e.target.value)} required/></label><label>Nom<input value={form.last_name} onChange={e=>change('last_name',e.target.value)} required/></label><label>Entreprise / marque<input value={form.company} onChange={e=>change('company',e.target.value)} required/></label><label>Numéro d'adhérent<input value={form.membership_number} onChange={e=>change('membership_number',e.target.value)} required placeholder="APEC-2026-001"/></label><label>Téléphone <span className="optional">(privé)</span><input value={form.phone} onChange={e=>change('phone',e.target.value)} type="tel"/></label><label>Email <span className="optional">(privé)</span><input value={form.email} onChange={e=>change('email',e.target.value)} type="email"/></label><label>Date d'adhésion<input type="date" value={form.joined_on||''} onChange={e=>change('joined_on',e.target.value)}/></label><label>Fin de validité<input type="date" value={form.expires_on||''} onChange={e=>change('expires_on',e.target.value)}/></label></div><label className="checkbox-line"><input type="checkbox" checked={form.active} onChange={e=>change('active',e.target.checked)}/> Adhésion active</label>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="button outline" onClick={close}>Annuler</button><button className="button primary" disabled={saving}>{saving?'Enregistrement…':<><Check size={16}/> Enregistrer</>}</button></div></form></section></div>
}
function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function formatDate(date){return new Date(`${date}T00:00:00`).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})}
function escapeHtml(value){return String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function blobAsDataUrl(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)})}
function compressPortrait(file){return new Promise((resolve,reject)=>{if(file.size>8*1024*1024){reject(new Error('La photo ne doit pas dépasser 8 Mo.'));return}const image=new Image();const source=URL.createObjectURL(file);image.onload=()=>{const side=Math.min(image.width,image.height);const left=(image.width-side)/2;const top=(image.height-side)/2;const canvas=document.createElement('canvas');canvas.width=480;canvas.height=480;canvas.getContext('2d').drawImage(image,left,top,side,side,0,0,480,480);URL.revokeObjectURL(source);resolve(canvas.toDataURL('image/jpeg',0.78))};image.onerror=()=>{URL.revokeObjectURL(source);reject(new Error('Impossible de lire cette image.'))};image.src=source})}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
