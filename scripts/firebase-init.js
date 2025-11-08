const firebaseCdnBase = 'https://www.gstatic.com/firebasejs/12.5.0';

async function loadFirebase() {
  if (!window.firebaseConfig) {
    console.warn('[Firebase] Configuration absente. Veuillez verifier window.firebaseConfig.');
    return;
  }

  try {
    const { initializeApp } = await import(`${firebaseCdnBase}/firebase-app.js`);
    const app = initializeApp(window.firebaseConfig);
    window.firebaseApp = app;

    // Charger Firestore
    try {
      const { getFirestore, collection, addDoc, serverTimestamp } = await import(`${firebaseCdnBase}/firebase-firestore.js`);
      const db = getFirestore(app);
      window.firebaseDb = db;
      window.firebaseFirestore = { collection, addDoc, serverTimestamp };
      console.info('[Firebase] Firestore initialise avec succes.');
    } catch (firestoreError) {
      console.warn('[Firebase] Echec du chargement de Firestore.', firestoreError);
    }

    // Charger Storage
    try {
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import(`${firebaseCdnBase}/firebase-storage.js`);
      const storage = getStorage(app);
      window.firebaseStorage = storage;
      window.firebaseStorageUtils = { ref, uploadBytes, getDownloadURL };
      console.info('[Firebase] Storage initialise avec succes.');
    } catch (storageError) {
      console.warn('[Firebase] Echec du chargement de Storage.', storageError);
    }

    // Charger Analytics (optionnel)
    try {
      const analyticsModule = await import(`${firebaseCdnBase}/firebase-analytics.js`);
      if (analyticsModule && typeof analyticsModule.isSupported === 'function') {
        const supported = await analyticsModule.isSupported();
        if (supported) {
          window.firebaseAnalytics = analyticsModule.getAnalytics(app);
        } else {
          console.info('[Firebase] Analytics non pris en charge sur cet environnement.');
        }
      }
    } catch (analyticsError) {
      console.warn('[Firebase] Echec du chargement d\'Analytics.', analyticsError);
    }

  } catch (initError) {
    console.error('[Firebase] Impossible d\'initialiser Firebase.', initError);
  }
}

loadFirebase();