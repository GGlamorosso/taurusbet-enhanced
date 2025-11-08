# Configuration Firebase pour TaurusBet

## 🚨 Problème actuel
Les formulaires ne fonctionnent pas en local car Firebase Firestore et Storage ont des **règles de sécurité par défaut** qui bloquent l'accès non authentifié.

## ✅ Solution temporaire (Développement)
Le code détecte automatiquement si vous êtes en local (`localhost`) et utilise un endpoint de test (`httpbin.org`) au lieu de Firebase.

## 🔧 Configuration requise pour la production

### 1. Règles Firestore
Dans la console Firebase > Firestore Database > Règles, remplacez par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Autoriser l'écriture publique pour les tickets et applications VIP
    match /tickets/{document} {
      allow create: if true;
      allow read: if false; // Pas de lecture publique
    }
    
    match /vip_applications/{document} {
      allow create: if true;
      allow read: if false; // Pas de lecture publique
    }
    
    // Bloquer tout le reste
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 2. Règles Storage
Dans la console Firebase > Storage > Règles, remplacez par :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Autoriser l'upload d'images dans le dossier ticket_images
    match /ticket_images/{allPaths=**} {
      allow create: if request.resource.size < 5 * 1024 * 1024 // Max 5MB
                   && request.resource.contentType.matches('image/.*');
      allow read: if true; // Permettre la lecture des images
    }
    
    // Bloquer tout le reste
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### 3. Domaines autorisés
Dans la console Firebase > Authentication > Settings > Authorized domains, ajoutez :
- Votre domaine de production (ex: `taurusbet.com`)
- `localhost` pour les tests locaux

### 4. Configuration CORS (si nécessaire)
Si vous avez des erreurs CORS, configurez les domaines autorisés dans Firebase Hosting ou ajoutez les headers appropriés.

## 🧪 Test en local
1. Les formulaires utilisent automatiquement `httpbin.org` en local
2. Vous verrez "(Mode développement)" dans les messages de succès
3. Les données ne sont PAS sauvegardées dans Firebase en local

## 🚀 Déploiement en production
1. Configurez les règles Firebase ci-dessus
2. Déployez votre site sur un domaine HTTPS
3. Les formulaires utiliseront automatiquement Firebase
4. Vérifiez dans la console Firebase que les données arrivent

## 📊 Structure des données

### Collection `tickets`
```javascript
{
  pseudo: "nom_utilisateur",
  comment: "commentaire optionnel", 
  imageUrl: "https://firebase.storage.../image.jpg",
  createdAt: timestamp,
  type: "ticket_submission"
}
```

### Collection `vip_applications`
```javascript
{
  ticketType: "low|mid|high",
  email: "user@email.com",
  anciennete: "1-3 ans", // si pas high
  frequence: "quotidien", // si pas high  
  why: "motivation", // si pas high
  createdAt: timestamp,
  type: "vip_application"
}
```

## 🔍 Débogage
- Ouvrez la console navigateur (F12)
- Les erreurs Firebase détaillées s'affichent avec les codes d'erreur
- Messages spécifiques pour les erreurs de permissions

## ⚠️ Sécurité
- Les règles permettent uniquement l'écriture (pas la lecture publique)
- Les images sont limitées à 5MB et aux formats image uniquement
- Aucune authentification requise pour simplifier l'UX
