/*
 * ============================================================================
 * TAURUSBET FUNNEL - SCRIPT JAVASCRIPT PRINCIPAL
 * ============================================================================
 * Fonctionnalités :
 * - Compteur de places quotidien (reset à minuit heure de Paris)
 * - Menu mobile (toggle hamburger)
 * - Animations d'apparition au scroll (fade-in)
 * ============================================================================
 */

(function() {
  'use strict';


  /* ==========================================================================
     1. UTILITAIRES (Fonctions utilitaires réutilisables)
     ========================================================================== */

  /**
   * Obtient la date actuelle au format YYYY-MM-DD dans le fuseau horaire Europe/Paris
   * @returns {string} Date formatée (ex: "2025-01-15")
   */
  function getParisDate() {
    const now = new Date();
    const parisString = now.toLocaleString('en-US', { timeZone: 'Europe/Paris' });
    const parisDate = new Date(parisString);
    const year = parisDate.getFullYear();
    const month = String(parisDate.getMonth() + 1).padStart(2, '0');
    const day = String(parisDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Obtient la date et l'heure actuelle dans le fuseau horaire Europe/Paris
   * @returns {Date} Date et heure Paris
   */
  function getParisDateTime() {
    const now = new Date();
    const parisString = now.toLocaleString('en-US', { timeZone: 'Europe/Paris' });
    return new Date(parisString);
  }

  /**
   * Calcule le prochain dimanche à minuit (heure de Paris)
   * @returns {Date} Date du prochain dimanche à minuit
   */
  function getNextSunday() {
    const parisNow = getParisDateTime();
    const currentDay = parisNow.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
    
    // Si on est dimanche (0), on veut le dimanche suivant
    // Si on est lundi (1), on veut dans 6 jours
    // Si on est mardi (2), on veut dans 5 jours, etc.
    const daysUntilSunday = currentDay === 0 ? 7 : (7 - currentDay);
    
    const nextSunday = new Date(parisNow);
    nextSunday.setDate(parisNow.getDate() + daysUntilSunday);
    nextSunday.setHours(0, 0, 0, 0); // Minuit
    
    return nextSunday;
  }


  /* ==========================================================================
     2. COMPTEUR DE PLACES (Gestion des places VIP disponibles)
     ========================================================================== */

  /**
   * Met à jour le compteur de places restantes
   * - Réinitialise à minuit (heure de Paris) chaque jour
   * - Génère un nombre aléatoire entre 4 et 9 places
   * - Stocke les données dans le localStorage
   */
  function updateSeatsCounter() {
    const today = getParisDate();
    const savedDate = localStorage.getItem('tb_seats_date');
    let seats = parseInt(localStorage.getItem('tb_seats_left'), 10);
    
    // Réinitialiser si c'est un nouveau jour ou si aucune donnée n'existe
    if (!savedDate || savedDate !== today || isNaN(seats)) {
      // Générer un nombre aléatoire entre 4 et 9 (inclus)
      seats = Math.floor(Math.random() * 6) + 4;
      localStorage.setItem('tb_seats_left', seats);
      localStorage.setItem('tb_seats_date', today);
    }
    
    // Mettre à jour tous les éléments affichant le compteur
    const seatsElements = document.querySelectorAll('.seats-counter span');
    seatsElements.forEach(function(element) {
      element.textContent = seats;
    });
  }


  /* ==========================================================================
     3. COMPTEUR HEBDOMADAIRE (Compteur jusqu'au dimanche suivant)
     ========================================================================== */

  /**
   * Met à jour le compteur hebdomadaire qui se réinitialise chaque dimanche à minuit
   * Calcule et affiche le temps restant jusqu'au prochain dimanche
   */
  function updateWeeklyCountdown() {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    // Vérifier que tous les éléments existent
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
      return;
    }
    
    const parisNow = getParisDateTime();
    const nextSunday = getNextSunday();
    const timeRemaining = nextSunday.getTime() - parisNow.getTime();
    
    if (timeRemaining <= 0) {
      // Si le temps est écoulé, recalculer le prochain dimanche
      const newNextSunday = getNextSunday();
      const newTimeRemaining = newNextSunday.getTime() - parisNow.getTime();
      updateCountdownDisplay(newTimeRemaining, daysEl, hoursEl, minutesEl, secondsEl);
    } else {
      updateCountdownDisplay(timeRemaining, daysEl, hoursEl, minutesEl, secondsEl);
    }
  }

  /**
   * Met à jour l'affichage du compteur avec les valeurs calculées
   * @param {number} timeRemaining Temps restant en millisecondes
   * @param {Element} daysEl Élément DOM des jours
   * @param {Element} hoursEl Élément DOM des heures
   * @param {Element} minutesEl Élément DOM des minutes
   * @param {Element} secondsEl Élément DOM des secondes
   */
  function updateCountdownDisplay(timeRemaining, daysEl, hoursEl, minutesEl, secondsEl) {
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    // Ajouter une animation lors de la mise à jour des secondes
    if (secondsEl.textContent !== seconds.toString().padStart(2, '0')) {
      secondsEl.classList.add('updating');
      setTimeout(function() {
        secondsEl.classList.remove('updating');
      }, 300);
    }
    
    daysEl.textContent = days.toString();
    hoursEl.textContent = hours.toString().padStart(2, '0');
    minutesEl.textContent = minutes.toString().padStart(2, '0');
    secondsEl.textContent = seconds.toString().padStart(2, '0');
  }

  /**
   * Initialise le compteur hebdomadaire et lance la mise à jour régulière
   */
  function initWeeklyCountdown() {
    // Mettre à jour immédiatement
    updateWeeklyCountdown();
    
    // Mettre à jour toutes les secondes
    setInterval(updateWeeklyCountdown, 1000);
  }


  /* ==========================================================================
     4. ANIMATIONS (Animations au scroll)
     ========================================================================== */

  /**
   * Initialise les animations d'apparition au scroll (fade-in)
   * Utilise l'API Intersection Observer pour détecter quand les éléments
   * entrent dans le viewport
   */
  function initAnimations() {
    const elements = document.querySelectorAll('.fade-in');
    
    // Créer un observer pour détecter l'entrée dans le viewport
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          // Ajouter la classe 'visible' pour déclencher l'animation
          entry.target.classList.add('visible');
          // Arrêter d'observer cet élément une fois animé
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.2 // Déclencher quand 20% de l'élément est visible
    });
    
    // Observer tous les éléments avec la classe 'fade-in'
    elements.forEach(function(element) {
      observer.observe(element);
    });
  }


  /* ==========================================================================
     5. MENU MOBILE (Toggle du menu hamburger)
     ========================================================================== */

  /**
   * Initialise le toggle du menu mobile (hamburger)
   * Ajoute/retire la classe 'open' sur le menu au clic
   */
  function initMenuToggle() {
    const toggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('nav ul');
    
    if (toggle && navList) {
      toggle.addEventListener('click', function() {
        // Basculer la classe 'open' pour afficher/masquer le menu
        navList.classList.toggle('open');
        // Basculer la classe 'active' pour l'animation du hamburger
        toggle.classList.toggle('active');
      });
    }
  }

  /* ======================================================================
     6. MODALES ET FORMULAIRES (Déclaration et gestion des modales)
     ====================================================================== */

  /**
   * Ouvre une modale et gère le focus et la fermeture via ESC.
   * @param {HTMLElement} modal La modale à afficher
   */
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('show');
    // Empêche le scroll de l'arrière-plan
    document.body.style.overflow = 'hidden';
    // Focus sur le premier champ interactif
    const focusable = modal.querySelector('input, select, textarea, button');
    if (focusable) {
      focusable.focus();
    }
    // Fonction pour fermer sur ESC
    function escHandler(e) {
      if (e.key === 'Escape') {
        closeModal(modal);
      }
    }
    document.addEventListener('keydown', escHandler);
    modal._escHandler = escHandler;
  }

  /**
   * Ferme une modale et nettoie les écouteurs.
   * @param {HTMLElement} modal La modale à fermer
   */
  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
    if (modal._escHandler) {
      document.removeEventListener('keydown', modal._escHandler);
      delete modal._escHandler;
    }
  }

  /**
   * Initialisation de la modale de dépôt de ticket (index.html).
   * Permet d'envoyer un ticket du jour via Formspree.
   */
  function initTicketModal() {
    const openBtn = document.getElementById('openTicketModal');
    const modal = document.getElementById('ticketModal');
    if (!openBtn || !modal) return;
    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = modal.querySelector('.modal-close');
    const form = document.getElementById('ticketForm');
    const messageEl = document.getElementById('ticketFormMessage');

    // Fonction de fermeture commune
    function close() {
      closeModal(modal);
    }

    openBtn.addEventListener('click', function() {
      // Réinitialiser le formulaire et masquer le message
      if (form) form.reset();
      if (messageEl) messageEl.style.display = 'none';
      openModal(modal);
    });

    if (overlay) overlay.addEventListener('click', close);
    if (closeBtn) closeBtn.addEventListener('click', close);

    if (form) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!messageEl) return;
        
        // Vérifier que Firebase est initialisé
        if (!window.firebaseDb || !window.firebaseStorage) {
          messageEl.style.display = 'block';
          messageEl.textContent = 'Erreur : Firebase non initialisé. Veuillez recharger la page.';
          return;
        }

        messageEl.style.display = 'block';
        messageEl.textContent = 'Envoi en cours...';
        
        try {
          const pseudo = form.querySelector('[name="pseudo"]').value.trim();
          const comment = form.querySelector('[name="comment"]').value.trim();
          const imageFile = form.querySelector('[name="ticketImage"]').files[0];
          
          // Mode développement : utiliser le fallback
          if (window.appConfig.IS_DEVELOPMENT) {
            messageEl.textContent = 'Envoi en mode développement...';
            
            const formData = new FormData();
            formData.append('pseudo', pseudo);
            formData.append('comment', comment);
            formData.append('type', 'ticket_submission');
            if (imageFile) {
              formData.append('image', imageFile);
            }
            
            const response = await fetch(window.appConfig.FALLBACK_ENDPOINT, {
              method: 'POST',
              body: formData
            });
            
            if (response.ok) {
              messageEl.textContent = 'Merci pour votre ticket ! (Mode développement)';
              form.reset();
              setTimeout(close, 3000);
              return;
            } else {
              throw new Error('Erreur lors de l\'envoi vers le serveur de test');
            }
          }
          
          // Mode production : utiliser Firebase
          let imageUrl = '';
          
          // Upload de l'image si présente
          if (imageFile) {
            messageEl.textContent = 'Upload de l\'image...';
            const timestamp = Date.now();
            const fileName = `${timestamp}_${imageFile.name}`;
            const storageRef = window.firebaseStorageUtils.ref(
              window.firebaseStorage, 
              `${window.appConfig.STORAGE_FOLDER_TICKETS}/${fileName}`
            );
            
            const snapshot = await window.firebaseStorageUtils.uploadBytes(storageRef, imageFile);
            imageUrl = await window.firebaseStorageUtils.getDownloadURL(snapshot.ref);
          }
          
          // Sauvegarde dans Firestore
          messageEl.textContent = 'Sauvegarde des données...';
          const ticketData = {
            pseudo: pseudo,
            comment: comment,
            imageUrl: imageUrl,
            createdAt: window.firebaseFirestore.serverTimestamp(),
            type: 'ticket_submission'
          };
          
          await window.firebaseFirestore.addDoc(
            window.firebaseFirestore.collection(window.firebaseDb, window.appConfig.FIRESTORE_COLLECTION_TICKETS),
            ticketData
          );
          
          messageEl.textContent = 'Merci pour votre ticket !';
          form.reset();
          setTimeout(close, 3000);
          
        } catch (error) {
          console.error('Erreur lors de l\'envoi:', error);
          console.error('Code d\'erreur:', error.code);
          console.error('Détails:', error);
          
          let errorMessage = 'Erreur : ' + error.message;
          if (error.code === 'permission-denied') {
            errorMessage = 'Erreur : Permissions Firebase insuffisantes. Vérifiez les règles Firestore/Storage.';
          } else if (error.code === 'unauthenticated') {
            errorMessage = 'Erreur : Authentification requise. Configurez les règles Firebase pour autoriser l\'accès public.';
          }
          
          messageEl.textContent = errorMessage;
        }
      });
    }
  }

  /**
   * Initialisation des modales VIP pour les offres.
   * Adapte le formulaire selon le type de ticket (low, mid, high).
   */
  function initVipModals() {
    const offersSection = document.querySelector('.offers-section');
    const modal = document.getElementById('applicationModal');
    if (!offersSection || !modal) return;
    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = modal.querySelector('.modal-close');
    const form = document.getElementById('applicationForm');
    const messageEl = document.getElementById('appFormMessage');
    let currentType = '';

    // Ajuste l'affichage selon le type
    function openForType(type) {
      currentType = type;
      const header = modal.querySelector('h3');
      const submitBtn = modal.querySelector('.submit-application');
      const ancienneteGroup = document.getElementById('app-anciennete-group');
      const frequenceGroup = document.getElementById('app-frequence-group');
      const whyGroup = document.getElementById('app-why-group');
      const emailInput = modal.querySelector('#app-email');
      const emailGroup = emailInput ? emailInput.closest('.form-group') : null;
      if (form) form.reset();
      if (messageEl) messageEl.style.display = 'none';
      // Par défaut montrer tous les champs
      if (ancienneteGroup) ancienneteGroup.style.display = '';
      if (frequenceGroup) frequenceGroup.style.display = '';
      if (whyGroup) whyGroup.style.display = '';
      if (emailGroup) emailGroup.style.display = '';
      if (type === 'high') {
        header.textContent = 'Ticket Taurus +';
        submitBtn.textContent = 'Mon mail';
        if (ancienneteGroup) ancienneteGroup.style.display = 'none';
        if (frequenceGroup) frequenceGroup.style.display = 'none';
        if (whyGroup) whyGroup.style.display = 'none';
      } else if (type === 'mid') {
        header.textContent = 'Ticket Taurus';
        submitBtn.textContent = 'Contacte moi pour recevoir ton maillot et rejoindre le VIP';
      } else {
        header.textContent = 'Ticket Découverte';
        submitBtn.textContent = 'Envoyer et rejoindre';
      }
      openModal(modal);
    }

    // Écouter les boutons des cartes dans la section des offres
    const ctas = offersSection.querySelectorAll('.ticket .cta');
    ctas.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        // Priorité au data-ticket défini dans le markup
        const specified = btn.getAttribute('data-ticket');
        if (specified) {
          // Redirection spéciale pour le Mid Ticket vers la modale de contact
          if (specified === 'mid' && window.openMidContactModal) {
            window.openMidContactModal(btn);
            return;
          }
          openForType(specified);
          return;
        }
        const card = btn.closest('.ticket');
        if (card && card.classList.contains('ticket-decouverte')) {
          openForType('low');
        } else if (card && card.classList.contains('ticket-taurus')) {
          openForType('mid');
        } else if (card && card.classList.contains('ticket-taurus-plus')) {
          openForType('high');
        }
      });
    });

    // Écouter les boutons "Découvrir" des slides de services
    // Ces boutons doivent ouvrir la modale avec le type "low" par défaut
    const serviceBtns = document.querySelectorAll('.open-service-modal');
    serviceBtns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        openForType('low');
      });
    });

    // Fermeture
    if (overlay) overlay.addEventListener('click', function() {
      closeModal(modal);
    });
    if (closeBtn) closeBtn.addEventListener('click', function() {
      closeModal(modal);
    });

    // Soumission du formulaire
    if (form) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!messageEl) return;
        
        // Vérifier que Firebase est initialisé
        if (!window.firebaseDb) {
          messageEl.style.display = 'block';
          messageEl.textContent = 'Erreur : Firebase non initialisé. Veuillez recharger la page.';
          return;
        }

        messageEl.style.display = 'block';
        messageEl.textContent = 'Envoi en cours...';
        
        try {
          const email = form.querySelector('input[type="email"]').value.trim();
          const applicationData = { 
            ticketType: currentType, 
            email: email,
            type: 'vip_application'
          };
          
          if (currentType !== 'high') {
            applicationData.anciennete = form.querySelector('[name="anciennete"]').value;
            applicationData.frequence = form.querySelector('[name="frequence"]').value;
            applicationData.why = form.querySelector('[name="why"]').value.trim();
          }
          
          // Mode développement : utiliser le fallback
          if (window.appConfig.IS_DEVELOPMENT) {
            messageEl.textContent = 'Envoi en mode développement...';
            
            const response = await fetch(window.appConfig.FALLBACK_ENDPOINT, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(applicationData)
            });
            
            if (!response.ok) {
              throw new Error('Erreur lors de l\'envoi vers le serveur de test');
            }
          } else {
            // Mode production : utiliser Firebase
            applicationData.createdAt = window.firebaseFirestore.serverTimestamp();
            
            // Sauvegarde dans Firestore
            await window.firebaseFirestore.addDoc(
              window.firebaseFirestore.collection(window.firebaseDb, window.appConfig.FIRESTORE_COLLECTION_APPLICATIONS),
              applicationData
            );
          }
          
          // Messages de succès selon le type
          if (currentType === 'low') {
            messageEl.textContent = 'Inscription réussie ! Redirection...';
            setTimeout(function() {
              window.location.href = window.appConfig.TELEGRAM_JOIN_URL;
            }, 2000);
          } else if (currentType === 'mid') {
            messageEl.textContent = 'Merci ! Nous vous contacterons pour votre maillot et votre accès VIP.';
            setTimeout(function() {
              closeModal(modal);
            }, 3000);
          } else {
            messageEl.textContent = 'Merci ! Je te réponds dans les jours qui suivent.';
            setTimeout(function() {
              closeModal(modal);
            }, 3000);
          }
          
        } catch (error) {
          console.error('Erreur lors de l\'envoi:', error);
          console.error('Code d\'erreur:', error.code);
          console.error('Détails:', error);
          
          let errorMessage = 'Erreur : ' + error.message;
          if (error.code === 'permission-denied') {
            errorMessage = 'Erreur : Permissions Firebase insuffisantes. Vérifiez les règles Firestore/Storage.';
          } else if (error.code === 'unauthenticated') {
            errorMessage = 'Erreur : Authentification requise. Configurez les règles Firebase pour autoriser l\'accès public.';
          }
          
          messageEl.textContent = errorMessage;
        }
      });
    }
  }

  /**
   * Initialise le carrousel 3D sur la page VIP.
   */
  function initCarousel3D() {
    const carousel = document.querySelector('.carousel-3d');
    if (!carousel) return;

    const inner = carousel.querySelector('.carousel-inner');
    if (!inner) return;

    const items = inner.querySelectorAll('.carousel-item');
    const itemCount = items.length;
    if (itemCount === 0) return;

    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const angleStep = 360 / itemCount;
    const depth = 350;

    items.forEach(function(item, index) {
      const angle = index * angleStep;
      item.style.transform = 'rotateX(' + angle + 'deg) translateZ(' + depth + 'px)';
    });

    let currentIndex = 0;
    let rotation = 0;

    function updateRotation() {
      rotation = -currentIndex * angleStep;
      inner.style.transform = 'rotateX(' + rotation + 'deg)';
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % itemCount;
      updateRotation();
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + itemCount) % itemCount;
      updateRotation();
    }

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    let autoRotate = setInterval(nextSlide, 3500);

    carousel.addEventListener('mouseenter', function() {
      clearInterval(autoRotate);
    });

    carousel.addEventListener('mouseleave', function() {
      autoRotate = setInterval(nextSlide, 3500);
    });
  }

  /**
   * Initialise la modale Mid Ticket (contact sans formulaire)
   * Gère l'ouverture, fermeture, liens pré-remplis et tracking optionnel
   */
  function initMidContactModal() {
    const modal = document.getElementById('midContactModal');
    if (!modal) return;

    const overlay = modal.querySelector('[data-close="mid"]');
    const closeBtn = modal.querySelector('.modal-close');
    const telegramBtn = document.getElementById('btnMidTelegram');
    const whatsappBtn = document.getElementById('btnMidWhatsApp');
    let openerElement = null; // Pour retourner le focus après fermeture

    // Configuration des liens avec messages pré-remplis
    function setupContactLinks() {
      if (telegramBtn && window.TELEGRAM_CONTACT_URL && window.MID_PREFILL_MESSAGE) {
        // Telegram peut supporter le paramètre text dans certains cas
        const telegramUrl = window.TELEGRAM_CONTACT_URL + 
          (window.TELEGRAM_CONTACT_URL.includes('?') ? '&' : '?') + 
          'text=' + encodeURIComponent(window.MID_PREFILL_MESSAGE);
        telegramBtn.href = telegramUrl;
      }

      if (whatsappBtn && window.WHATSAPP_CONTACT_URL && window.MID_PREFILL_MESSAGE) {
        const whatsappUrl = window.WHATSAPP_CONTACT_URL + 
          (window.WHATSAPP_CONTACT_URL.includes('?') ? '&' : '?') + 
          'text=' + encodeURIComponent(window.MID_PREFILL_MESSAGE);
        whatsappBtn.href = whatsappUrl;
      }
    }

    // Tracking optionnel dans Firestore (non bloquant)
    async function trackIntent(platform) {
      try {
        if (!window.firebaseDb || !window.firebaseFirestore) return;
        
        const intentData = {
          platform: platform,
          page: window.location.pathname,
          createdAt: window.firebaseFirestore.serverTimestamp(),
          type: 'mid_contact_intent'
        };

        // Tentative d'enregistrement non bloquante
        await window.firebaseFirestore.addDoc(
          window.firebaseFirestore.collection(window.firebaseDb, 'mid_intents'),
          intentData
        );
      } catch (error) {
        // Échec silencieux du tracking, ne pas bloquer l'utilisateur
        console.warn('Tracking intent failed:', error);
      }
    }

    // Fermeture de la modale
    function closeMidModal() {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      
      // Retourner le focus à l'élément ouvreur
      if (openerElement && typeof openerElement.focus === 'function') {
        openerElement.focus();
      }
      
      // Nettoyer l'écouteur ESC
      if (modal._midEscHandler) {
        document.removeEventListener('keydown', modal._midEscHandler);
        delete modal._midEscHandler;
      }
    }

    // Ouverture de la modale
    function openMidModal(opener) {
      openerElement = opener;
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Focus sur le premier bouton d'action
      const firstFocusable = modal.querySelector('#btnMidTelegram, #btnMidWhatsApp, .modal-close');
      if (firstFocusable) {
        firstFocusable.focus();
      }

      // Gérer la fermeture via ESC
      function escHandler(e) {
        if (e.key === 'Escape') {
          closeMidModal();
        }
      }
      document.addEventListener('keydown', escHandler);
      modal._midEscHandler = escHandler;

      // Focus trap basique
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];

      modal.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
              lastFocusableElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastFocusableElement) {
              firstFocusableElement.focus();
              e.preventDefault();
            }
          }
        }
      });
    }

    // Configuration initiale des liens
    setupContactLinks();

    // Écouteurs pour fermeture
    if (overlay) {
      overlay.addEventListener('click', closeMidModal);
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', closeMidModal);
    }

    // Écouteurs pour les boutons de contact avec tracking
    if (telegramBtn) {
      telegramBtn.addEventListener('click', function() {
        trackIntent('telegram');
        // Le navigateur suivra le lien href automatiquement
      });
    }
    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', function() {
        trackIntent('whatsapp');
        // Le navigateur suivra le lien href automatiquement
      });
    }

    // Exposer la fonction d'ouverture pour utilisation dans initVipModals
    window.openMidContactModal = openMidModal;
  }


  /* ==========================================================================
     7. INITIALISATION (Point d'entrée principal)
     ========================================================================== */

  /**
   * Initialise toutes les fonctionnalités au chargement de la page
   */
  function init() {
    updateSeatsCounter();
    initWeeklyCountdown();
    initAnimations();
    initMenuToggle();
    initTicketModal();
    initVipModals();
    initCarousel3D();
    initMidContactModal();
  }

  // Attendre que le DOM soit complètement chargé avant d'initialiser
  document.addEventListener('DOMContentLoaded', init);

})();
