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

  /* =======================================================================
     SÉLECTEUR DE THÈMES
     Chaque thème redéfinit la peau ET le contenu de l'aperçu, pour que le
     client voie tout de suite à quoi ressemblerait un site dans ce style.
     ===================================================================== */
  var THEMES = {
    eclat: {
      nom: 'Éclat',
      legende: 'pour une entreprise qui veut avoir l\'air établie et raffinée.',
      lien: 'demos/maison-cavelier/index.html',
      css: {
        '--ta-fond': '#12100D', '--ta-fond2': '#191510', '--ta-txt': '#F5EFE3', '--ta-txt2': '#A89880',
        '--ta-acc': '#C9A227', '--ta-acc-txt': '#12100D', '--ta-bord': 'rgba(201,162,39,.24)',
        '--ta-rayon': '2px', '--ta-titre': "'Playfair Display', serif", '--ta-corps': "'Inter', sans-serif",
        '--ta-casse': 'none', '--ta-espace': '.02em'
      },
      txt: {
        logo: 'Maison Cavelier', cta: 'Réserver', eyebrow: 'Depuis 1998',
        titre: 'La table du Vieux-Port',
        texte: 'Une cuisine française franche, des produits d\'ici, et une salle où l\'on reste plus longtemps que prévu.',
        cta2: 'Voir le menu',
        c1t: 'Table d\'hôte', c1s: 'Quatre services, changés chaque semaine selon l\'arrivage.',
        c2t: 'Cave à vin',    c2s: 'Plus de 120 importations privées choisies à la main.',
        c3t: 'Privatisation',  c3s: 'La mezzanine accueille jusqu\'à 40 personnes.',
        pied: '© Maison Cavelier — Vieux-Montréal'
      }
    },
    clarte: {
      nom: 'Clarté',
      legende: 'pour rassurer : tout est net, lisible, et rien ne distrait du bouton d\'appel.',
      lien: 'demos/clinique-aubery/index.html',
      css: {
        '--ta-fond': '#FFFFFF', '--ta-fond2': '#F1F6FC', '--ta-txt': '#0E2233', '--ta-txt2': '#5A7186',
        '--ta-acc': '#1B74C4', '--ta-acc-txt': '#FFFFFF', '--ta-bord': '#E2EBF3',
        '--ta-rayon': '10px', '--ta-titre': "'Sora', sans-serif", '--ta-corps': "'Inter', sans-serif",
        '--ta-casse': 'none', '--ta-espace': '-.02em'
      },
      txt: {
        logo: 'Clinique Aubéry', cta: 'Rendez-vous', eyebrow: 'Dentisterie familiale',
        titre: 'Des sourires en confiance.',
        texte: 'Une équipe qui prend le temps d\'expliquer, des soins sans jugement, et des urgences reçues le jour même.',
        cta2: 'Prendre rendez-vous',
        c1t: 'Examen complet', c1s: 'Radiographies numériques et plan de traitement clair, chiffré à l\'avance.',
        c2t: 'Urgences', c2s: 'Une rage de dents ? Appelez avant 10 h, vous passez aujourd\'hui.',
        c3t: 'Assurances', c3s: 'Réclamation transmise pour vous, directement à votre assureur.',
        pied: '© Clinique Aubéry — Laval'
      }
    },
    terra: {
      nom: 'Terra',
      legende: 'chaleureux et naturel : on a envie de faire confiance à la personne derrière.',
      lien: 'demos/verdal-paysagement/index.html',
      css: {
        '--ta-fond': '#FBF8F1', '--ta-fond2': '#F1EDE1', '--ta-txt': '#1F2A20', '--ta-txt2': '#5C6B58',
        '--ta-acc': '#2F6B43', '--ta-acc-txt': '#FBF8F1', '--ta-bord': '#E3DCCB',
        '--ta-rayon': '4px', '--ta-titre': "'DM Serif Display', serif", '--ta-corps': "'Inter', sans-serif",
        '--ta-casse': 'none', '--ta-espace': '0'
      },
      txt: {
        logo: 'Verdal Paysagement', cta: 'Soumission', eyebrow: 'Aménagement paysager',
        titre: 'Une cour qui vous ressemble.',
        texte: 'Pavé, plantation, muret, éclairage : on dessine, on construit, et on revient vérifier au printemps suivant.',
        cta2: 'Demander une soumission',
        c1t: 'Pavé et muret', c1s: 'Terrasses, allées et murets de soutènement garantis 10 ans.',
        c2t: 'Plantation', c2s: 'Des végétaux choisis pour survivre à nos hivers, pas pour la photo.',
        c3t: 'Entretien saisonnier', c3s: 'Ouverture au printemps, fermeture à l\'automne, sans y penser.',
        pied: '© Verdal Paysagement — Rive-Sud'
      }
    },
    volt: {
      nom: 'Volt',
      legende: 'franc et direct : le prix est affiché, le numéro est gros, on ne tourne pas autour du pot.',
      lien: 'demos/garage-metrik/index.html',
      css: {
        '--ta-fond': '#101215', '--ta-fond2': '#14171B', '--ta-txt': '#F2F4F7', '--ta-txt2': '#99A2AE',
        '--ta-acc': '#FF6A1A', '--ta-acc-txt': '#101215', '--ta-bord': '#2A303A',
        '--ta-rayon': '2px', '--ta-titre': "'Oswald', sans-serif", '--ta-corps': "'Inter', sans-serif",
        '--ta-casse': 'uppercase', '--ta-espace': '.04em'
      },
      txt: {
        logo: 'Garage Métrik', cta: 'Rendez-vous', eyebrow: 'Mécanique générale · Anjou',
        titre: 'On répare. On explique.',
        texte: 'Estimation écrite avant de toucher à quoi que ce soit. Aucune réparation surprise sur votre facture.',
        cta2: 'Voir nos prix',
        c1t: 'Changement d\'huile', c1s: 'Dès 69 $, en 30 minutes, sans rendez-vous du lundi au vendredi.',
        c2t: 'Freins', c2s: 'Inspection gratuite, prix affiché par modèle, pièces garanties 2 ans.',
        c3t: 'Pré-achat', c3s: 'Vous achetez un usagé ? 89 $ et vous saurez tout avant de signer.',
        pied: '© Garage Métrik — Anjou, Montréal'
      }
    },
    nuance: {
      nom: 'Nuance',
      legende: 'doux et soigné : le visiteur se sent déjà détendu avant même d\'avoir réservé.',
      lien: 'demos/studio-halona/index.html',
      css: {
        '--ta-fond': '#FDF9F7', '--ta-fond2': '#F6EDE9', '--ta-txt': '#2A2124', '--ta-txt2': '#7A6A6E',
        '--ta-acc': '#B4787A', '--ta-acc-txt': '#FFFFFF', '--ta-bord': '#EDDDD8',
        '--ta-rayon': '99px', '--ta-titre': "'Cormorant Garamond', serif", '--ta-corps': "'Inter', sans-serif",
        '--ta-casse': 'none', '--ta-espace': '.04em'
      },
      txt: {
        logo: 'Studio Halona', cta: 'Réserver', eyebrow: 'Soins · Coiffure · Ongles',
        titre: 'Prenez une heure pour vous.',
        texte: 'Un petit salon de quartier où l\'on vous appelle par votre prénom et où personne ne vous presse.',
        cta2: 'Voir les soins',
        c1t: 'Coiffure', c1s: 'Coupe, couleur et balayage, avec consultation avant chaque rendez-vous.',
        c2t: 'Soins du visage', c2s: 'Nettoyage profond, hydratation, microdermabrasion.',
        c3t: 'Forfait détente', c3s: 'Trois soins enchaînés, deux heures, café et silence inclus.',
        pied: '© Studio Halona — Brossard'
      }
    }
  };

  var apercu   = $('#apercu-theme');
  var legende  = $('#theme-legende');
  var lienDemo = $('#theme-lien');
  var boutonsTheme = $$('.theme-choix');

  function appliquerTheme(cle) {
    var t = THEMES[cle];
    if (!t || !apercu) { return; }

    Object.keys(t.css).forEach(function (v) { apercu.style.setProperty(v, t.css[v]); });
    apercu.setAttribute('data-theme', cle);

    Object.keys(t.txt).forEach(function (champ) {
      var el = apercu.querySelector('[data-champ="' + champ + '"]');
      if (el) { el.textContent = t.txt[champ]; }
    });
    // Le second bouton d'appel du héros reprend son propre libellé
    var cta2 = apercu.querySelector('[data-champ="cta2"]');
    if (cta2) { cta2.textContent = t.txt.cta2; }

    if (legende)  { legende.innerHTML = '<strong>' + t.nom + '</strong> — ' + t.legende; }
    if (lienDemo) { lienDemo.setAttribute('href', t.lien); }

    boutonsTheme.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-theme') === cle ? 'true' : 'false');
    });
  }

  boutonsTheme.forEach(function (b) {
    b.addEventListener('click', function () { appliquerTheme(b.getAttribute('data-theme')); });
  });
  appliquerTheme('eclat');

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

      if (!nom || !entreprise || !courriel) {
        montrer('Il me manque votre nom, celui de votre entreprise et votre courriel pour pouvoir vous répondre.', false);
        return;
      }
      if (courriel.indexOf('@') < 1 || courriel.indexOf('.') < 0) {
        montrer('L\'adresse courriel semble incomplète — pouvez-vous la vérifier ?', false);
        return;
      }

      var sujet = 'Demande de démo — ' + entreprise;
      var corps =
        'Nom : ' + nom + '\n' +
        'Entreprise : ' + entreprise + '\n' +
        'Courriel : ' + courriel + '\n' +
        'Téléphone : ' + (tel || '—') + '\n' +
        'Domaine : ' + secteur + '\n' +
        'Forfait envisagé : ' + forfait + '\n\n' +
        'Message :\n' + (message || '(aucun message)') + '\n\n' +
        '— Envoyé depuis vaelordesign.ca';

      window.location.href = 'mailto:charlesmartel2506@gmail.com'
        + '?subject=' + encodeURIComponent(sujet)
        + '&body='    + encodeURIComponent(corps);

      montrer('Votre logiciel de courriel s\'ouvre avec le message déjà écrit — il ne reste qu\'à appuyer sur « Envoyer ». S\'il ne s\'ouvre pas, écrivez-moi directement à charlesmartel2506@gmail.com.', true);
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
