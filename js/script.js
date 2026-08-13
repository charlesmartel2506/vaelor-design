/* =========================================================================
   VAELOR DESIGN — comportements de la page
   Tout est encapsulé pour ne jamais entrer en conflit avec un autre script.
   ========================================================================= */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Année courante dans le pied de page ---------- */
  var annee = $('#annee');
  if (annee) { annee.textContent = new Date().getFullYear(); }

  /* ---------- En-tête qui se colle au défilement ---------- */
  var entete = $('#entete');
  var haut   = $('#haut');
  function auDefilement() {
    var y = window.scrollY || window.pageYOffset;
    if (entete) { entete.classList.toggle('collee', y > 24); }
    if (haut)   { haut.classList.toggle('visible', y > 700); }
  }
  window.addEventListener('scroll', auDefilement, { passive: true });
  auDefilement();

  if (haut) {
    haut.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Menu mobile ---------- */
  var burger = $('#burger');
  var nav    = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var ouvert = nav.classList.toggle('ouverte');
      burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      burger.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    // Refermer quand on clique un lien
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('ouverte');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
    // Refermer sur Échap
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('ouverte')) {
        nav.classList.remove('ouverte');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* ---------- Apparition progressive au défilement ----------
     Le masquage n'est activé que si IntersectionObserver existe vraiment.
     Filet de sécurité : au bout de 3 s, tout ce qui reste caché est révélé,
     pour qu'aucun visiteur ne tombe sur une page blanche. */
  var aRevele = $$('.apparait');
  if ('IntersectionObserver' in window && aRevele.length) {
    document.documentElement.classList.add('js-anim');
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('vu'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    aRevele.forEach(function (el) { obs.observe(el); });
    setTimeout(function () {
      // Si l'observateur n'a rien révélé du tout, c'est qu'il ne fonctionne pas
      // dans ce navigateur : on désactive l'animation plutôt que de tout cacher.
      if (!document.querySelector('.apparait.vu')) {
        document.documentElement.classList.remove('js-anim');
      }
    }, 2500);
  }

  /* ---------- Filtres des exemples ---------- */
  var filtres = $$('.filtre');
  var projets = $$('.projet');
  filtres.forEach(function (b) {
    b.addEventListener('click', function () {
      var cible = b.getAttribute('data-filtre');
      filtres.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      projets.forEach(function (p) {
        var garde = (cible === 'tous') || (p.getAttribute('data-secteur') === cible);
        p.classList.toggle('cache', !garde);
      });
    });
  });

  /* ---------- Les boutons des forfaits pré-remplissent le formulaire ---------- */
  $$('[data-forfait]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = $('#f-forfait');
      if (!sel) { return; }
      var cherche = a.getAttribute('data-forfait');
      $$('option', sel).forEach(function (o) {
        if (o.textContent.indexOf(cherche) === 0) { sel.value = o.value || o.textContent; }
      });
    });
  });

  /* =======================================================================
     FORMULAIRE DE CONTACT
     Version sans serveur : ouvre le logiciel de courriel avec tout le
     message déjà écrit. Pour recevoir les demandes directement dans la
     boîte de réception sans que le client ait à confirmer l'envoi, voir la
     note « Formspree » dans LISEZ-MOI.md.
     ===================================================================== */
  var form   = $('#form-contact');
  var retour = $('#form-retour');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var v = function (id) { var el = $(id); return el ? el.value.trim() : ''; };
      var nom        = v('#f-nom');
      var entreprise = v('#f-entreprise');
      var courriel   = v('#f-courriel');
      var tel        = v('#f-tel');
      var secteur    = v('#f-secteur');
      var forfait    = v('#f-forfait');
      var message    = v('#f-message');

      /* Les messages suivent la langue de la page (<html lang="…">), pour que
         le même fichier serve la version française et la version anglaise. */
      var en = (document.documentElement.lang || 'fr').slice(0, 2) === 'en';
      var t = en ? {
        manque  : 'I need your name, your business name and your email address to be able to reply.',
        courriel: 'That email address looks incomplete — could you check it?',
        sujet   : 'Demo request — ',
        lNom    : 'Name: ',      lEntreprise: 'Business: ',  lCourriel: 'Email: ',
        lTel    : 'Phone: ',     lSecteur   : 'Industry: ',  lForfait : 'Package of interest: ',
        lMessage: 'Message:\n',  aucun      : '(no message)',
        source  : '— Sent from vaelordesign.com',
        ok      : 'Your email app is opening with the message already written — all that is left is to press Send. If it does not open, write to me directly at charlesmartel2506@gmail.com.'
      } : {
        manque  : 'Il me manque votre nom, celui de votre entreprise et votre courriel pour pouvoir vous répondre.',
        courriel: 'L\'adresse courriel semble incomplète — pouvez-vous la vérifier ?',
        sujet   : 'Demande de démo — ',
        lNom    : 'Nom : ',      lEntreprise: 'Entreprise : ', lCourriel: 'Courriel : ',
        lTel    : 'Téléphone : ', lSecteur  : 'Domaine : ',    lForfait : 'Forfait envisagé : ',
        lMessage: 'Message :\n', aucun      : '(aucun message)',
        source  : '— Envoyé depuis vaelordesign.com',
        ok      : 'Votre logiciel de courriel s\'ouvre avec le message déjà écrit — il ne reste qu\'à appuyer sur « Envoyer ». S\'il ne s\'ouvre pas, écrivez-moi directement à charlesmartel2506@gmail.com.'
      };

      if (!nom || !entreprise || !courriel) {
        montrer(t.manque, false);
        return;
      }
      if (courriel.indexOf('@') < 1 || courriel.indexOf('.') < 0) {
        montrer(t.courriel, false);
        return;
      }

      var sujet = t.sujet + entreprise;
      var corps =
        t.lNom       + nom + '\n' +
        t.lEntreprise + entreprise + '\n' +
        t.lCourriel  + courriel + '\n' +
        t.lTel       + (tel || '—') + '\n' +
        t.lSecteur   + secteur + '\n' +
        t.lForfait   + forfait + '\n\n' +
        t.lMessage   + (message || t.aucun) + '\n\n' +
        t.source;

      window.location.href = 'mailto:charlesmartel2506@gmail.com'
        + '?subject=' + encodeURIComponent(sujet)
        + '&body='    + encodeURIComponent(corps);

      montrer(t.ok, true);
    });
  }

  function montrer(texte, ok) {
    if (!retour) { return; }
    retour.textContent = texte;
    retour.className = 'form__retour visible' + (ok ? ' ok' : '');
    if (!ok) {
      retour.style.background = 'rgba(240,162,107,.12)';
      retour.style.border = '1px solid rgba(240,162,107,.4)';
      retour.style.color = '#F5C79B';
    } else {
      retour.style.background = '';
      retour.style.border = '';
      retour.style.color = '';
    }
  }

})();
