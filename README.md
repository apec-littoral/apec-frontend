# APEC Bénin — Portail des membres

Interface web React pour administrer les adhérents et afficher la page ouverte au scan d'une carte.

## Démarrage local

```powershell
npm.cmd install
npm.cmd run dev
```

Par défaut, le portail contacte l'API à `http://localhost:8000`. Pour une autre adresse, créer un fichier `.env.local` contenant :

```text
VITE_API_URL=https://adresse-de-votre-api
```

## Impression et QR code

Depuis l'annuaire, le bouton **Carte** ouvre les deux faces de la carte au format bancaire, avec impression recto-verso ou enregistrement PDF. La carte reprend les tons bleus et verts, les vagues et le cadre QR du modèle fourni. Ajoutez une photo carrée facultative dans la fiche membre ; elle est compressée et conservée dans PostgreSQL, sans être renvoyée à la page publique. Sans portrait, les initiales du membre apparaissent sur la carte.

Le QR code pointe vers la page publique de vérification. Les données visibles publiquement sont limitées au nom, à l'entreprise, au numéro d'adhérent, au statut et à la date de validité.

Pour déployer en statique sur Render, `render.yaml` configure le build Vite et le repli des URL `/verify/...` vers `index.html`. Renseigner `VITE_API_URL` avec l'URL du service API avant le build.
