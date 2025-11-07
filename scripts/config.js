// Configuration globale pour le site TaurusBet
// Les constantes sont exposées via l'objet global `appConfig` pour être
// accessibles dans les autres scripts sans système de module.

window.appConfig = {
  // Lien d'invitation Telegram pour rejoindre la communauté VIP
  TELEGRAM_JOIN_URL: 'https://t.me/+Ltq0JPVy73E0ZTU0',
  // Endpoint Formspree pour les candidatures aux tickets VIP
  FORMSPREE_ENDPOINT_APPLICATION: 'https://formspree.io/f/xxxx',
  // Endpoint Formspree pour la soumission des tickets gagnants et du ticket du jour
  FORMSPREE_ENDPOINT_TICKET: 'https://formspree.io/f/yyyy',
  // Clé publique Uploadcare pour permettre l'upload d'images côté client
  UPLOADCARE_PUBLIC_KEY: 'demopublickey'
};