import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowLeft, BadgeCheck, Building2, CalendarDays, Check, ChevronRight, LogOut, Moon, Plus, Printer, QrCode, Search, ShieldCheck, Sun, Trash2, UserRound, X } from 'lucide-react';
import './style.css';
import './memberExtras.css';
import { buildCardDocument } from './memberCard.js';
import { NETWORK_ERROR, userMessage } from './apiErrors.js';
import { askConfirm } from './confirmDialog.js';
import { CardAssetsModal } from './CardAssetsModal.jsx';
import { auth, firebaseConfig } from './firebase.js';
import { initializeApp, deleteApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const emptyMember = { first_name: '', last_name: '', membership_number: '', company: '', role: '', address: '', commune: '', phone: '', email: '', joined_on: '', expires_on: '', active: true };

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
      {member && <><p className="verify-note">Cette carte est associée au membre suivant :</p><div className="verify-person">{member.photo_data ? <img className="verify-photo" src={member.photo_data} alt={`Photo de ${member.first_name} ${member.last_name}`}/> : <div className="avatar"><UserRound size={22}/></div>}<div><strong>{member.first_name} {member.last_name}</strong><span>{member.company}</span></div></div><div className="verify-details">{member.role && <div><span>Fonction</span><b>{member.role}</b></div>}{member.commune && <div><span>Département / Commune</span><b>{member.commune}</b></div>}{member.address && <div><span>Adresse</span><b>{member.address}</b></div>}<div><span>Numéro membre</span><b>{member.membership_number}</b></div><div><span>Statut</span><b className={valid ? 'status-text' : 'status-text expired'}>{valid ? 'Membre actif' : 'Non actif'}</b></div>{member.phone && <div><span>Téléphone</span><b><a href={`tel:${member.phone}`}>{member.phone}</a></b></div>}{member.email && <div><span>E-mail</span><b><a href={`mailto:${member.email}`}>{member.email}</a></b></div>}{member.joined_on && <div><span>Membre depuis le</span><b>{formatDate(member.joined_on)}</b></div>}<div><span>Validité</span><b>{member.expires_on ? `Jusqu'au ${formatDate(member.expires_on)}` : "Sans date d'expiration"}</b></div></div><p className="small-disclaimer">Vérification délivrée par l'APEC-LIT</p></>}
      {error && <p className="verify-note">Ce QR code ne correspond à aucun membre enregistré.</p>}
    </section><footer className="site-footer">APEC-LIT <span>•</span> Portail de vérification</footer>
  </main>;
}

function Admin({ theme, toggleTheme }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginNotice, setLoginNotice] = useState('');
  const [members, setMembers] = useState([]);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Tous');
  const [editing, setEditing] = useState(null);
  const [showAssets, setShowAssets] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => onAuthStateChanged(auth, currentUser => { setUser(currentUser); setAuthReady(true); }), []);
  async function request(path, options = {}) {
    const idToken = await user.getIdToken();
    let response;
    try { response = await fetch(`${API}${path}`, { ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${idToken}`, ...options.headers } }); }
    catch (err) { console.error('API injoignable', path, err); throw new Error(NETWORK_ERROR); }
    if (response.status === 401) { await signOut(auth); throw new Error('Session expirée. Reconnectez-vous.'); }
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error('Erreur API', response.status, path, Array.isArray(data.detail) ? data.detail.map(({ loc, msg }) => ({ loc, msg })) : data.detail);
      throw new Error(userMessage(response.status, data.detail));
    }
    return response.status === 204 ? null : response.json();
  }
  async function refresh() { try { setMembers(await request('/api/members')); } catch (e) { setNotice(e.message); } }
  useEffect(() => { if (user) refresh(); }, [user]);

  async function signIn(e) {
    e.preventDefault(); setLoginError(''); setLoginNotice('');
    try { await signInWithEmailAndPassword(auth, login.email.trim(), login.password); }
    catch (err) { setLoginError(err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' ? 'Adresse e-mail ou mot de passe incorrect.' : 'Connexion impossible. Verifiez vos informations et reessayez.'); }
  }
  async function signInWithGoogle() {
    setLoginError(''); setLoginNotice('');
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (err) { setLoginError(err.code === 'auth/popup-closed-by-user' ? 'Connexion Google annulee.' : 'Connexion Google impossible. Reessayez.'); }
  }
  async function resetPassword() {
    setLoginError(''); setLoginNotice('');
    if (!login.email.trim()) { setLoginError('Saisissez votre adresse e-mail pour recevoir le lien de reinitialisation.'); return; }
    if (!await askConfirm({ title: 'Réinitialiser le mot de passe ?', message: `Un lien de réinitialisation sera envoyé à ${login.email.trim()}.`, confirmLabel: 'Envoyer le lien' })) return;
    try { await sendPasswordResetEmail(auth, login.email.trim()); setLoginNotice("Si cette adresse est enregistree, un lien de reinitialisation vient d'etre envoye."); }
    catch { setLoginError("Impossible d'envoyer le lien. Verifiez l'adresse saisie puis reessayez."); }
  }
  async function updatePlatformUser(userId, active) {
    await request(`/api/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify({ active }) });
    setNotice(active ? 'Acces utilisateur reactive.' : 'Acces utilisateur desactive.');
  }
  async function addPlatformUser(form) {
    if (!await askConfirm({ title: 'Autoriser cet utilisateur ?', message: `${form.email} pourra accéder à l'espace de gestion.${form.auth_method === 'password' ? ' Un e-mail lui sera envoyé pour choisir son mot de passe.' : ''}`, confirmLabel: 'Autoriser' })) return;
    const created = await request('/api/admin/users', { method: 'POST', body: JSON.stringify(form) });
    let message = form.auth_method === 'google'
      ? `${created.email} est autorise a se connecter avec Google.`
      : `Le compte de ${created.email} est cree.`;
    if (form.auth_method === 'password') {
      let inviteApp;
      let inviteAuth;
      try {
        inviteApp = initializeApp(firebaseConfig, `apec-invite-${crypto.randomUUID()}`);
        inviteAuth = getAuth(inviteApp);
        inviteAuth.languageCode = 'fr';
        const temporaryPassword = `${crypto.randomUUID()}A9!x`;
        const { user: invitedUser } = await createUserWithEmailAndPassword(inviteAuth, created.email, temporaryPassword);
        if (form.display_name.trim()) await updateProfile(invitedUser, { displayName: form.display_name.trim() });
      } catch (err) {
        await request(`/api/admin/users/${created.id}`, { method: 'PUT', body: JSON.stringify({ active: false }) }).catch(() => {});
        const detail = err.code === 'auth/email-already-in-use'
          ? 'Cette adresse a deja un compte Firebase. Choisissez Google ou utilisez une autre adresse.'
          : 'Le compte Firebase n’a pas pu etre cree. Verifiez que E-mail/Mot de passe est actif.';
        throw new Error(detail);
      }
      try {
        await sendPasswordResetEmail(inviteAuth, created.email, { url: window.location.origin });
        message += ' Un e-mail de réinitialisation lui a été envoyé : il permet de définir son premier mot de passe (vérifier aussi les spams).';
      } catch {
        message += ' Le lien n’a pas pu etre envoye; cette personne pourra utiliser Mot de passe oublie.';
      } finally {
        await signOut(inviteAuth).catch(() => {});
        await deleteApp(inviteApp).catch(() => {});
      }
    }
    setShowUserModal(false);
    setNotice(message);
  }
  async function saveMember(form) {
    const payload = { ...form, joined_on: form.joined_on || null, expires_on: form.expires_on || null };
    const item = editing?.id ? editing : null; // une nouvelle fiche n'a pas encore d'identifiant
    const name = `${form.first_name} ${form.last_name}`;
    if (!await askConfirm(item
      ? { title: 'Enregistrer les modifications ?', message: `La fiche de ${name} sera mise à jour.${form.expires_on ? '' : ' La carte n’aura pas de date d’expiration.'}`, confirmLabel: 'Enregistrer' }
      : { title: 'Ajouter ce membre ?', message: `${name} (${form.membership_number}) sera ajouté à l'annuaire.${form.expires_on ? '' : ' La carte n’aura pas de date d’expiration.'}`, confirmLabel: 'Ajouter' })) return;
    await request(item ? `/api/members/${item.id}` : '/api/members', { method: item ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    setEditing(null); setNotice(item ? 'Les informations du membre ont été mises à jour.' : 'Le membre a été ajouté.'); await refresh();
  }
  async function editMember(member) {
    const form = { ...member };
    if (member.has_photo) {
      try {
        const response = await fetch(`${API}/api/members/${member.id}/photo`, { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        if (response.ok) form.photo_data = await blobAsDataUrl(await response.blob());
      } catch { /* Preserve the stored photo if its preview cannot be loaded. */ }
    }
    setEditing(form);
  }
  async function removeMember(member) {
    if (!await askConfirm({ title: 'Supprimer ce membre ?', message: `La fiche de ${member.first_name} ${member.last_name} sera définitivement supprimée et sa carte ne pourra plus être vérifiée.`, confirmLabel: 'Supprimer', danger: true })) return;
    try { await request(`/api/members/${member.id}`, { method: 'DELETE' }); setNotice('La fiche a été supprimée.'); await refresh(); } catch (e) { setNotice(e.message); }
  }
  async function printCard(member) {
    try {
      const idToken = await user.getIdToken();
      const r = await fetch(`${API}/api/qr/${encodeURIComponent(member.qr_token)}.png`, { headers: { Authorization: `Bearer ${idToken}` } });
      if (!r.ok) throw new Error('Le QR code n’a pas pu être créé.');
      const qr = URL.createObjectURL(await r.blob());
      let photo = null;
      if (member.has_photo) {
        const photoResponse = await fetch(`${API}/api/members/${member.id}/photo`, { headers: { Authorization: `Bearer ${idToken}` } });
        if (photoResponse.ok) photo = URL.createObjectURL(await photoResponse.blob());
      }
      const assets = await request('/api/card-assets').catch(() => ({}));
      const popup = window.open('', '_blank', 'width=900,height=620');
      if (!popup) { URL.revokeObjectURL(qr); if (photo) URL.revokeObjectURL(photo); throw new Error('Autorisez les fenêtres contextuelles pour imprimer la carte.'); }
      popup.document.write(buildCardDocument(member, qr, photo, `${window.location.origin}/logo-apec.png`, assets));
      popup.document.close();
      setTimeout(() => { URL.revokeObjectURL(qr); if (photo) URL.revokeObjectURL(photo); }, 60000);
    } catch (e) { setNotice(e.message); }
  }

  const filtered = members.filter(m => `${m.first_name} ${m.last_name} ${m.company} ${m.membership_number}`.toLowerCase().includes(query.toLowerCase())).filter(m => filter === 'Tous' || (filter === 'Actifs' ? m.active && (!m.expires_on || m.expires_on >= today()) : !m.active || (m.expires_on && m.expires_on < today())));
  if (!authReady) return <main className="auth-loading">Chargement de la session...</main>;
  if (!user) return <main className="login-layout"><div className="login-art"><div className="art-glow"/><div className="brand-lock"><img className="brand-logo" src="/logo-apec.png" alt="Logo APEC-LIT"/><div><b>APEC-LIT</b><small>Association des promoteurs d'eau conditionnee</small></div></div><div className="art-copy"><p className="eyebrow">ESPACE ASSOCIATION</p><h1>Les adhesions,<br/>en toute clarte.</h1><p>Gerez les membres et verifiez leurs cartes depuis un espace unique.</p></div><div className="art-bottom">PLATEFORME DE GESTION DES MEMBRES <span>-</span> BENIN</div></div><section className="login-panel"><ThemeToggle theme={theme} toggleTheme={toggleTheme} className="login-theme-toggle"/><div className="login-box"><Brand className="mobile-brand" subtitle="Portail adherents"/><div className="eyebrow">BON RETOUR</div><h2>Connexion</h2><p className="muted">Connectez-vous a l'espace de gestion de l'association.</p><button className="button outline full google-button" type="button" onClick={signInWithGoogle}><GoogleMark/> Continuer avec Google</button><div className="login-divider"><span>ou avec votre e-mail</span></div><form onSubmit={signIn} className="login-form"><label>Adresse e-mail<input type="email" autoComplete="username" value={login.email} onChange={e=>setLogin({...login,email:e.target.value})} required placeholder="nom@association.bj"/></label><label>Mot de passe<input type="password" autoComplete="current-password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})} required placeholder="Votre mot de passe"/></label>{loginError && <div className="form-error">{loginError}</div>}{loginNotice && <div className="form-success">{loginNotice}</div>}<button className="button primary full">Acceder a mon espace <ChevronRight size={16}/></button></form><button className="forgot-password" type="button" onClick={resetPassword}>Mot de passe oublie ?</button><div className="secure-note"><ShieldCheck size={15}/> Acces reserve aux responsables de l'association</div></div><footer className="login-footer">APEC-LIT - Portail des adhesions</footer></section></main>;

  const activeCount = members.filter(m => m.active && (!m.expires_on || m.expires_on >= today())).length;
  const inactiveCount = members.length - activeCount;
  return <div className="app-shell"><aside className="sidebar"><div className="brand-lock"><img className="brand-logo" src="/logo-apec.png" alt="Logo APEC-LIT"/><div><b>APEC-LIT</b><small>Portail adhérents</small></div></div><div className="nav-caption">GESTION</div><div className="nav-item selected"><UserRound size={17}/> Membres <span className="nav-count">{members.length}</span></div><div className="sidebar-bottom"><div className="user-mini"><div className="user-avatar">{(user.email || 'A').slice(0,1).toUpperCase()}</div><div><b>{user.email}</b><small>Administrateur</small></div><button className="icon-button logout" title="Déconnexion" onClick={async()=>{if(!await askConfirm({title:'Se déconnecter ?',message:'Vous devrez vous reconnecter pour accéder à l’espace de gestion.',confirmLabel:'Se déconnecter'}))return;await signOut(auth);setMembers([]);}}><LogOut size={17}/></button></div><div className="sidebar-foot">Association des promoteurs<br/>d'eau conditionnée du Bénin</div></div></aside>
    <main className="main-area"><header className="topbar"><div className="breadcrumb">Espace association <ChevronRight size={14}/> <b>Membres</b></div><div className="topbar-actions"><ThemeToggle theme={theme} toggleTheme={toggleTheme}/><div className="secure-pill"><span/> Espace sécurisé</div></div></header><section className="content"><div className="page-heading"><div><div className="eyebrow">VOTRE ASSOCIATION</div><h1>Gestion des membres</h1><p>Gérez les adhésions et éditez les cartes de membre.</p></div><div className="heading-actions"><button className="button outline" onClick={()=>setShowAssets(true)}><ShieldCheck size={16}/> Cachet et signature</button><button className="button outline" onClick={()=>setShowUserModal(true)}><UserRound size={16}/> Ajouter un utilisateur</button><button className="button primary" onClick={()=>setEditing({ ...emptyMember })}><Plus size={17}/> Ajouter un membre</button></div></div>
      <div className="stats-grid"><Stat icon={<UserRound/>} label="Total des membres" value={members.length} tone="mint"/><Stat icon={<Activity/>} label="Adhésions actives" value={activeCount} tone="green"/><Stat icon={<CalendarDays/>} label="À renouveler" value={inactiveCount} tone="amber"/></div>
      <section className="members-panel"><div className="panel-head"><div><h2>Annuaire des membres</h2><p>Retrouvez les informations et cartes de vos adhérents.</p></div><div className="table-tools"><div className="search-wrap"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher un membre…"/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>Tous</option><option>Actifs</option><option>À renouveler</option></select></div></div>{notice && <div className="notice" onClick={()=>setNotice('')}>{notice}<button><X size={14}/></button></div>}
        <div className="table-wrap"><table><thead><tr><th>MEMBRE</th><th>ENTREPRISE</th><th>N° ADHÉRENT</th><th>STATUT</th><th>VALIDITÉ</th><th></th></tr></thead><tbody>{filtered.length === 0 ? <tr><td className="empty-state" colSpan="6">{members.length ? 'Aucun résultat pour cette recherche.' : 'Aucun membre pour le moment. Ajoutez votre premier adhérent.'}</td></tr> : filtered.map(m => { const valid = m.active && (!m.expires_on || m.expires_on >= today()); return <tr key={m.id}><td><div className="member-cell"><div className="member-avatar">{m.first_name[0]}{m.last_name[0]}</div><div><b>{m.first_name} {m.last_name}</b><small>{m.email || m.phone || '—'}</small></div></div></td><td>{m.company}</td><td className="mono">{m.membership_number}</td><td><span className={`badge ${valid ? 'badge-active' : 'badge-off'}`}><i/>{valid ? 'Actif' : 'À renouveler'}</span></td><td className="date-cell">{m.expires_on ? formatDate(m.expires_on) : 'Sans expiration'}</td><td><div className="row-actions"><button className="button outline small" onClick={()=>printCard(m)}><Printer size={14}/> Carte</button><button className="icon-button" title="Modifier" onClick={()=>editMember(m)}><ChevronRight size={17}/></button><button className="icon-button danger" title="Supprimer" onClick={()=>removeMember(m)}><Trash2 size={15}/></button></div></td></tr>})}</tbody></table></div><div className="table-foot">{filtered.length} membre{filtered.length>1?'s':''} affiché{filtered.length>1?'s':''}<span><ShieldCheck size={14}/> La gestion des membres est réservée à l'espace sécurisé.</span></div></section><div className="content-foot">APEC-LIT <span>·</span> Gestion des adhésions</div></section></main>{showAssets && <CardAssetsModal close={()=>setShowAssets(false)} load={()=>request('/api/card-assets')} save={async changes=>{await request('/api/card-assets',{method:'PUT',body:JSON.stringify(changes)});setNotice('Cachet et signature enregistrés.')}}/>} {editing && <MemberModal member={editing} close={()=>setEditing(null)} save={saveMember}/>} {showUserModal && <PlatformUserModal close={()=>setShowUserModal(false)} save={addPlatformUser} loadUsers={()=>request('/api/admin/users')} updateUser={updatePlatformUser}/>}</div>;
}

function GoogleMark() { return <svg className="google-mark" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z"/><path fill="#3474a8" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4.1 2-6.8 2-5.2 0-9.6-3.5-11.2-8.2H5.9v5.2A20 20 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.8 27.8a12 12 0 0 1 0-7.6V15H5.9a20 20 0 0 0 0 18Z"/><path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 6 29.5 4 24 4A20 20 0 0 0 5.9 15l6.9 5.2c1.6-4.7 6-8.1 11.2-8.1Z"/></svg> }
function Stat({icon,label,value,tone}) { return <div className="stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><div><span>{label}</span><b>{value}</b></div><span className="stat-trend"><Check size={13}/></span></div> }
function PlatformUserModal({ close, save, loadUsers, updateUser }) {
  const [form, setForm] = useState({ display_name: '', email: '', auth_method: 'google' });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { loadUsers().then(setUsers).catch(err => setError(err.message)); }, []);
  async function submit(e) {
    e.preventDefault(); setSaving(true); setError('');
    try { await save({ ...form, email: form.email.trim().toLowerCase() }); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  async function toggleUser(item) {
    const who = item.email;
    if (!await askConfirm(item.active
      ? { title: 'Désactiver cet accès ?', message: `${who} ne pourra plus gérer les membres.`, confirmLabel: 'Désactiver', danger: true }
      : { title: 'Réactiver cet accès ?', message: `${who} pourra de nouveau accéder à l'espace de gestion.`, confirmLabel: 'Réactiver' })) return;
    setError('');
    try {
      await updateUser(item.id, !item.active);
      setUsers(current => current.map(user => user.id === item.id ? { ...user, active: !item.active } : user));
    } catch (err) { setError(err.message); }
  }
  async function requestClose() {
    if (saving) return;
    if ((form.display_name.trim() || form.email.trim()) && !await askConfirm({ title: 'Quitter sans enregistrer ?', message: 'Les informations saisies seront perdues.', confirmLabel: 'Quitter', cancelLabel: 'Continuer la saisie', danger: true })) return;
    close();
  }
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&requestClose()}><section className="member-modal platform-user-modal"><div className="modal-heading"><div><span className="eyebrow">ACCES AU PORTAIL</span><h2>Utilisateurs</h2><p>Ajoutez ou desactivez les acces des responsables.</p></div><button className="icon-button" onClick={requestClose}><X/></button></div><div className="platform-user-list">{users.length === 0 ? <p className="muted user-list-empty">Aucun autre utilisateur pour le moment.</p> : users.map(item => <div className="platform-user-row" key={item.id}><div><b>{item.display_name || item.email}</b><small>{item.email} - {item.auth_method === 'google' ? 'Google' : 'E-mail et mot de passe'}</small></div><button type="button" className={`button small ${item.active ? 'outline' : 'primary'}`} onClick={()=>toggleUser(item)}>{item.active ? 'Desactiver' : 'Reactiver'}</button></div>)}</div><form onSubmit={submit}><div className="eyebrow user-form-label">NOUVEL ACCES</div><div className="form-grid"><label>Nom complet<input value={form.display_name} onChange={e=>setForm({...form,display_name:e.target.value})} placeholder="Nom du responsable"/></label><label>Adresse e-mail<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required placeholder="responsable@association.bj"/></label><label>Methode de connexion<select value={form.auth_method} onChange={e=>setForm({...form,auth_method:e.target.value})}><option value="google">Compte Google</option><option value="password">E-mail et mot de passe</option></select></label></div><div className="user-access-help">{form.auth_method === 'google' ? "Aucun mot de passe a definir. L'utilisateur choisira Continuer avec Google avec cette adresse." : "Un compte sera créé. Cette personne recevra un e-mail intitulé « réinitialisation du mot de passe » : c'est normal, il lui permet de choisir son premier mot de passe."}</div>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="button outline" onClick={requestClose}>Fermer</button><button className="button primary" disabled={saving}>{saving ? 'Creation...' : "Autoriser l'utilisateur"}</button></div></form></section></div>;
}

function MemberModal({member,close,save}) {
  const [form,setForm] = useState({...emptyMember,...member}); const [error,setError] = useState(''); const [saving,setSaving] = useState(false);
  const [initialForm] = useState(() => JSON.stringify(form));
  // Une fiche existante sans date de fin est deja une carte sans expiration.
  const [noExpiry, setNoExpiry] = useState(() => Boolean(member.id && !member.expires_on));
  const [previousExpiry, setPreviousExpiry] = useState('');
  function toggleNoExpiry(checked) {
    if (checked) setPreviousExpiry(form.expires_on || '');
    setForm({ ...form, expires_on: checked ? '' : previousExpiry });
    setNoExpiry(checked);
  }
  async function submit(e){e.preventDefault();setSaving(true);setError('');try{await save(form)}catch(err){setError(err.message)}finally{setSaving(false)}}
  const change=(key,value)=>setForm({...form,[key]:value});
  async function pickPhoto(file){setError('');try{change('photo_data',await compressPortrait(file))}catch(e){setError(e.message)}}
  async function requestClose() {
    if (saving) return;
    if (JSON.stringify(form) !== initialForm && !await askConfirm({ title: 'Quitter sans enregistrer ?', message: 'Les informations saisies seront perdues.', confirmLabel: 'Quitter', cancelLabel: 'Continuer la saisie', danger: true })) return;
    close();
  }
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&requestClose()}><section className="member-modal"><div className="modal-heading"><div><span className="eyebrow">FICHE ADHÉRENT</span><h2>{member.id?'Modifier le membre':'Nouvel adhérent'}</h2><p>La photo et les coordonnées sont visibles en scannant la carte.</p></div><button className="icon-button" onClick={requestClose}><X/></button></div><form onSubmit={submit}><div className="photo-upload-row"><div className="photo-preview">{form.photo_data ? <img src={form.photo_data} alt="Portrait du membre"/> : <UserRound size={25}/>}</div><div className="photo-copy"><b>Portrait sur la carte</b><small>Photo facultative · JPG, PNG ou WebP</small><label className="photo-pick">Choisir une photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>e.target.files?.[0]&&pickPhoto(e.target.files[0])}/></label></div>{form.photo_data && <button type="button" className="icon-button danger" title="Retirer la photo" onClick={async()=>{if(await askConfirm({title:'Retirer la photo ?',message:'Le retrait sera appliqué à l’enregistrement de la fiche.',confirmLabel:'Retirer',danger:true}))change('photo_data',null)}}><Trash2 size={16}/></button>}</div><div className="form-grid"><label>Prénom<input value={form.first_name} onChange={e=>change('first_name',e.target.value)} required/></label><label>Nom<input value={form.last_name} onChange={e=>change('last_name',e.target.value)} required/></label><label>Entreprise / marque<input value={form.company} onChange={e=>change('company',e.target.value)} required/></label><label>Fonction<input value={form.role||''} onChange={e=>change('role',e.target.value)} maxLength={80} placeholder="Ex. : Coordinateur"/></label><label>Département / Commune<input value={form.commune||''} onChange={e=>change('commune',e.target.value)} maxLength={120} placeholder="Ex. : LITTORAL / AKPAKPA"/></label><label>Adresse <span className="optional">(visible au scan)</span><input value={form.address||''} onChange={e=>change('address',e.target.value)} maxLength={180} placeholder="Quartier, ville"/></label><label>Numéro d'adhérent<input value={form.membership_number} onChange={e=>change('membership_number',e.target.value)} required placeholder="APEC-LIT001"/></label><label>Téléphone <span className="optional">(visible au scan)</span><input value={form.phone} onChange={e=>change('phone',e.target.value)} type="tel"/></label><label>Email <span className="optional">(visible au scan)</span><input value={form.email} onChange={e=>change('email',e.target.value)} type="email"/></label><label>Date d'adhésion<input type="date" value={form.joined_on||''} onChange={e=>change('joined_on',e.target.value)}/></label><div className="expiry-field"><label>Fin de validité<input type="date" value={form.expires_on||''} onChange={e=>change('expires_on',e.target.value)} required={!noExpiry} disabled={noExpiry}/></label><label className="checkbox-line"><input type="checkbox" checked={noExpiry} onChange={e=>toggleNoExpiry(e.target.checked)}/> Carte sans date d'expiration</label></div></div><label className="checkbox-line"><input type="checkbox" checked={form.active} onChange={e=>change('active',e.target.checked)}/> Adhésion active</label>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="button outline" onClick={requestClose}>Annuler</button><button className="button primary" disabled={saving}>{saving?'Enregistrement…':<><Check size={16}/> Enregistrer</>}</button></div></form></section></div>
}
function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function formatDate(date){return new Date(`${date}T00:00:00`).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})}
function escapeHtml(value){return String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function blobAsDataUrl(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)})}
function compressPortrait(file){return new Promise((resolve,reject)=>{if(file.size>8*1024*1024){reject(new Error('La photo ne doit pas dépasser 8 Mo.'));return}const image=new Image();const source=URL.createObjectURL(file);image.onload=()=>{const side=Math.min(image.width,image.height);const left=(image.width-side)/2;const top=(image.height-side)/2;const canvas=document.createElement('canvas');canvas.width=480;canvas.height=480;canvas.getContext('2d').drawImage(image,left,top,side,side,0,0,480,480);URL.revokeObjectURL(source);resolve(canvas.toDataURL('image/jpeg',0.78))};image.onerror=()=>{URL.revokeObjectURL(source);reject(new Error('Impossible de lire cette image.'))};image.src=source})}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
