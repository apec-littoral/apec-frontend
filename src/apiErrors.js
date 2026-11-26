// Messages affiches aux utilisateurs : aucun detail technique ne doit apparaitre ici.

const FIELD_LABELS = {
  first_name: 'Prénom',
  last_name: 'Nom',
  company: 'Entreprise / marque',
  role: 'Fonction',
  address: 'Adresse',
  membership_number: "Numéro d'adhérent",
  phone: 'Téléphone',
  email: 'Adresse e-mail',
  photo_data: 'Photo',
  joined_on: "Date d'adhésion",
  expires_on: 'Fin de validité',
  display_name: 'Nom complet',
};

// Seuls les messages connus de l'API sont repris.
const KNOWN_MESSAGES = {
  "Ce numéro d'adhérent existe déjà.": "Ce numéro d'adhérent existe déjà.",
  'La photo doit être envoyée au format JPEG.': 'La photo doit être envoyée au format JPEG.',
  'This email already has platform access.': 'Cette adresse a déjà accès au portail.',
};

export const NETWORK_ERROR = 'Connexion au serveur impossible. Vérifiez votre connexion Internet puis réessayez.';

export function userMessage(status, detail) {
  if (Object.hasOwn(KNOWN_MESSAGES, detail)) return KNOWN_MESSAGES[detail];
  if (status === 422 && Array.isArray(detail)) {
    const labels = [...new Set(detail.map(item => FIELD_LABELS[item.loc?.[1]]).filter(Boolean))];
    if (labels.length) return `Veuillez vérifier : ${labels.join(', ')}.`;
  }
  if (status === 403) return "Votre compte n'est pas autorisé à effectuer cette action.";
  if (status === 404) return 'Élément introuvable. Actualisez la page puis réessayez.';
  if (status >= 500) return 'Le service est momentanément indisponible. Réessayez dans quelques instants.';
  return "L'opération n'a pas abouti. Réessayez ou contactez l'administrateur.";
}
