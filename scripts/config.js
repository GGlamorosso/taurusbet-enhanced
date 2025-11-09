// Configuration globale pour le site TaurusBet
// Les constantes sont exposées via l'objet global `appConfig` pour être
// accessibles dans les autres scripts sans système de module.

window.appConfig = {
  // Lien d'invitation Telegram pour rejoindre la communauté VIP
  TELEGRAM_JOIN_URL: 'https://t.me/+Ltq0JPVy73E0ZTU0',
  // Collections Firestore pour stocker les données
  FIRESTORE_COLLECTION_APPLICATIONS: 'vip_applications',
  FIRESTORE_COLLECTION_TICKETS: 'tickets',
  // Dossiers Firebase Storage pour les images
  STORAGE_FOLDER_TICKETS: 'ticket_images',
  // Endpoint de fallback pour les tests en local
  FALLBACK_ENDPOINT: 'https://httpbin.org/post',
  // Mode développement (détecte automatiquement localhost)
  IS_DEVELOPMENT: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
};

// Liens de contact directs (à personnaliser)
window.TELEGRAM_CONTACT_URL = 'https://t.me/TaurusBetTelegram'; // ex: https://t.me/taurusbet
window.WHATSAPP_CONTACT_URL = 'https://wa.me/0783798669';      // ex: https://wa.me/33612345678

// Message pré-rempli pour Telegram/WhatsApp
window.MID_PREFILL_MESSAGE = "Salut Taurus, je veux rejoindre le VIP via le Mid Ticket (Celsius / 40€ résiliable).";

window.firebaseConfig = {
  apiKey: 'AIzaSyA6NIx3PVeMNuiXqP8jM6456VRcK98JsLY',
  authDomain: 'taurus-38e2d.firebaseapp.com',
  projectId: 'taurus-38e2d',
  storageBucket: 'taurus-38e2d.firebasestorage.app',
  messagingSenderId: '580557946619',
  appId: '1:580557946619:web:bd987e068cc06d6014ba5e',
  measurementId: 'G-7HZSCYPE53'
};