/* =========================================================================
   VAELOR DESIGN — moteur « Constellation » (refonte du 14 août 2026)

   L'idée : un champ de particules 3D (Three.js, WebGL) vit derrière tout le
   site. Au chargement, les particules s'assemblent en logo Vaelor ; à chaque
   section, elles se réorganisent : fenêtre de navigateur (la promesse),
   nuage (les clients qui cherchent), grille de panneaux (les exemples),
   spirale (la méthode), vague (le comparatif), trois colonnes (les tarifs),
   orbe (le contact). GSAP + ScrollTrigger orchestrent le reste : cartes
   distribuées, chronologie tracée, éventail des tarifs, inclinaisons.

   Robustesse, dans l'ordre :
   1. Mouvement réduit demandé → on ne fait RIEN : le site statique est complet.
   2. GSAP ne charge pas (CDN bloqué) → idem, rien n'est jamais caché d'avance.
   3. Three.js ne charge pas ou pas de WebGL → les animations DOM restent,
      seule la scène de particules est absente.
   Bibliothèques épinglées : gsap@3.12.5, three@0.160.0 (jsdelivr).
   ========================================================================= */
(function () {
  'use strict';

  var doc = document.documentElement;

  /* ---------- 0. Palier ---------- */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }

  var lite = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 981;

  var URL_GSAP  = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';
  var URL_ST    = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js';
  var URL_THREE = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

  function chargerScript(src) {
    return new Promise(function (resoudre, rejeter) {
      var s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = resoudre; s.onerror = function () { rejeter(new Error('échec ' + src)); };
      document.head.appendChild(s);
    });
  }
  function avecDelai(promesse, ms) {
    return Promise.race([promesse, new Promise(function (_, rej) {
      setTimeout(function () { rej(new Error('délai dépassé')); }, ms);
    })]);
  }

  /* Petit utilitaire : retirer un élément du système .apparait (géré par
     script.js) quand GSAP prend le relais, pour éviter deux animations qui
     se battent sur la même propriété transform. */
  function prendre(el, transitionConservee) {
    if (!el) { return; }
    el.classList.remove('apparait');
    el.classList.add('vu');
    el.style.transition = transitionConservee || 'none';
  }

  /* =======================================================================
     1. ANIMATIONS DOM (GSAP seulement)
     ===================================================================== */
  function animationsDom() {
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    var ST = window.ScrollTrigger;

    /* --- Sortie de scène du héros : le contenu plonge en défilant --- */
    try {
      gsap.to('.heros__contenu', {
        yPercent: -14, autoAlpha: 0, ease: 'none',
        scrollTrigger: { trigger: '.heros', start: 'top top', end: 'bottom 40%', scrub: true }
      });
    } catch (e) { /* isolé */ }

    /* --- Chronologie : la ligne se dessine, les points s'allument --- */
    try {
      var chrono = document.querySelector('.chrono');
      if (chrono) {
        gsap.to(chrono, {
          '--trace': 1, ease: 'none',
          scrollTrigger: { trigger: chrono, start: 'top 75%', end: 'bottom 60%', scrub: 0.4 }
        });
        document.querySelectorAll('.etape').forEach(function (el) {
          ST.create({
            trigger: el, start: 'top 64%',
            onEnter: function () { el.classList.add('allume'); },
            onLeaveBack: function () { el.classList.remove('allume'); }
          });
        });
      }
    } catch (e) { /* isolé */ }

    /* --- Tableaux et boîte contact : montée au défilement.
           La bascule en perspective (rotationX) est réservée au grand écran :
           sur téléphone, la projection élargit la boîte au-delà du viewport
           et crée un défilement horizontal (mesuré : 27 px). --- */
    var mm = gsap.matchMedia();
    function panneauxMontent(avecRotation) {
      var panneaux = Array.prototype.slice.call(document.querySelectorAll('.tableau-enveloppe'));
      var boiteContact = document.querySelector('.contact__boite');
      if (boiteContact) { panneaux.push(boiteContact); }
      panneaux.forEach(function (el) {
        prendre(el);
        var depuis = { y: 70, autoAlpha: 0, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 94%', end: 'top 58%', scrub: 0.4 } };
        if (avecRotation) {
          gsap.set(el.parentNode, { perspective: 1000 });
          depuis.rotationX = 9;
          depuis.transformOrigin = 'center top';
        }
        gsap.from(el, depuis);
      });
    }
    mm.add('(max-width: 980px), (pointer: coarse)', function () {
      try { panneauxMontent(false); } catch (e) { /* isolé */ }
      return function () {};
    });

    /* --- Ce qui suit demande un grand écran et une vraie souris --- */
    mm.add('(min-width: 981px) and (pointer: fine)', function () {

      try { panneauxMontent(true); } catch (e) { /* isolé */ }

      /* Les 4 étapes du risque : distribuées comme un jeu de cartes,
         pendant que la section reste épinglée à l'écran. */
      var cartesRisque = gsap.utils.toArray('.etape-risque');
      if (cartesRisque.length) {
        var tl = gsap.timeline({
          scrollTrigger: {
            trigger: '#risque', start: 'top top', end: '+=120%',
            pin: true, scrub: 0.6, anticipatePin: 1
          }
        });
        tl.from(cartesRisque, {
          y: 150, z: -420, rotationX: 40, autoAlpha: 0,
          stagger: 0.24, ease: 'none'
        }).to({}, { duration: 0.3 }); /* petit temps mort pour tenir la fin */
      }

      /* Les 3 forfaits : se déploient en éventail depuis une pile centrale */
      var forfaits = gsap.utils.toArray('.grille-tarifs .tarif');
      if (forfaits.length === 3) {
        forfaits.forEach(function (el) {
          prendre(el, 'border-color .3s ease, box-shadow .4s ease');
        });
        var declFan = { trigger: '.grille-tarifs', start: 'top 92%', end: 'top 40%', scrub: 0.5 };
        gsap.from(forfaits[0], { x: '72%',  rotationY: 16,  z: -160, autoAlpha: 0, ease: 'none', scrollTrigger: declFan });
        gsap.from(forfaits[2], { x: '-72%', rotationY: -16, z: -160, autoAlpha: 0, ease: 'none',
          scrollTrigger: { trigger: '.grille-tarifs', start: 'top 92%', end: 'top 40%', scrub: 0.5 } });
        gsap.from(forfaits[1], { y: 80, z: -60, autoAlpha: 0, ease: 'none',
          scrollTrigger: { trigger: '.grille-tarifs', start: 'top 92%', end: 'top 44%', scrub: 0.5 } });
      }

      /* Cartes d'exemples : inclinaison 3D qui suit la souris */
      gsap.utils.toArray('.projet').forEach(function (el) {
        el.style.transition = 'border-color .3s ease, box-shadow .45s cubic-bezier(.16,1,.3,1)';
        gsap.set(el, { transformPerspective: 900 });
        var rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3' });
        var ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3' });
        el.addEventListener('pointermove', function (e) {
          var r = el.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          ry(px * 7); rx(-py * 7);
        });
        el.addEventListener('pointerleave', function () { rx(0); ry(0); });
      });

      /* Boutons magnétiques : le CTA principal est attiré par le curseur */
      ['.heros__actions .btn--plein', '.entete__cta'].forEach(function (sel) {
        var el = document.querySelector(sel);
        if (!el) { return; }
        el.style.transition = 'box-shadow .34s cubic-bezier(.16,1,.3,1), background .25s ease';
        var qx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
        var qy = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
        el.addEventListener('pointermove', function (e) {
          var r = el.getBoundingClientRect();
          qx((e.clientX - (r.left + r.width / 2)) * 0.3);
          qy((e.clientY - (r.top + r.height / 2)) * 0.3);
        });
        el.addEventListener('pointerleave', function () { qx(0); qy(0); });
      });

      /* Projecteur des cartes « pourquoi » : le halo suit le curseur */
      gsap.utils.toArray('.carte').forEach(function (el) {
        el.addEventListener('pointermove', function (e) {
          var r = el.getBoundingClientRect();
          el.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
          el.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        });
      });

      return function () {}; /* nettoyage géré par matchMedia */
    });
  }

  /* =======================================================================
     2. SCÈNE DE PARTICULES (Three.js)
     ===================================================================== */
  function scene3d(THREE) {
    var N = lite ? 1600 : 3800;

    var canevas = document.createElement('canvas');
    canevas.className = 'scene3d';
    canevas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canevas, document.body.firstChild);
    var voile = document.createElement('div');
    voile.className = 'scene3d-voile';
    voile.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(voile, canevas.nextSibling);

    var rendu = new THREE.WebGLRenderer({ canvas: canevas, alpha: true, antialias: false, powerPreference: 'high-performance' });
    rendu.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2));
    rendu.setSize(window.innerWidth, window.innerHeight);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 300);
    camera.position.set(0, 0, 46);

    var groupe = new THREE.Group();
    scene.add(groupe);

    /* ---------- Générateurs de formations ---------- */
    var alea = Math.random;

    function formeLogo() {
      /* Le prisme Vaelor : les deux plans du V, pliés en vrai volume.
         Coordonnées reprises du SVG (viewBox 64), pli de ±26°. */
      var t = new Float32Array(N * 3), s = 0.62, pli = 0.45;
      var A = [[5, 9], [21, 9], [32, 57], [32, 35]];   /* coins : haut-g, haut-d, bas-g, bas-d */
      var B = [[59, 9], [43, 9], [32, 57], [32, 35]];
      for (var i = 0; i < N; i++) {
        var Q = (i % 2 === 0) ? A : B;
        var u = alea(), v = alea();
        var hx = Q[0][0] + (Q[1][0] - Q[0][0]) * u, hy = Q[0][1] + (Q[1][1] - Q[0][1]) * u;
        var bx = Q[2][0] + (Q[3][0] - Q[2][0]) * u, by = Q[2][1] + (Q[3][1] - Q[2][1]) * u;
        var x2 = hx + (bx - hx) * v, y2 = hy + (by - hy) * v;
        var dx = (x2 - 32) * s;
        t[i * 3]     = dx * Math.cos(pli);
        t[i * 3 + 1] = (33 - y2) * s;
        t[i * 3 + 2] = -Math.abs(dx) * Math.sin(pli) + (alea() - 0.5) * 0.9;
      }
      return t;
    }

    function segments(liste) {
      /* Répartit N points le long d'une liste de segments [x1,y1,x2,y2],
         proportionnellement à leur longueur. Petit bruit en z. */
      var t = new Float32Array(N * 3), total = 0, longueurs = [], k;
      for (k = 0; k < liste.length; k++) {
        var sg = liste[k];
        var L = Math.hypot(sg[2] - sg[0], sg[3] - sg[1]);
        longueurs.push(L); total += L;
      }
      for (var i = 0; i < N; i++) {
        var cible = alea() * total, acc = 0;
        for (k = 0; k < liste.length && acc + longueurs[k] < cible; k++) { acc += longueurs[k]; }
        if (k >= liste.length) { k = liste.length - 1; }
        var g = liste[k], u = longueurs[k] ? (cible - acc) / longueurs[k] : 0;
        t[i * 3]     = g[0] + (g[2] - g[0]) * u + (alea() - 0.5) * 0.3;
        t[i * 3 + 1] = g[1] + (g[3] - g[1]) * u + (alea() - 0.5) * 0.3;
        t[i * 3 + 2] = (alea() - 0.5) * 1.2;
      }
      return t;
    }

    function rectangle(cx, cy, w, h) {
      var g = cx - w / 2, d = cx + w / 2, ht = cy + h / 2, b = cy - h / 2;
      return [[g, ht, d, ht], [d, ht, d, b], [d, b, g, b], [g, b, g, ht]];
    }

    function formeFenetre() {
      /* Une fenêtre de navigateur : cadre, barre d'adresse, contenu. */
      var L = [];
      L = L.concat(rectangle(0, 0, 44, 30));                 /* cadre */
      L.push([-22, 10, 22, 10]);                             /* barre */
      L.push([-20, 12.5, -18.6, 12.5], [-17.4, 12.5, -16, 12.5], [-14.8, 12.5, -13.4, 12.5]); /* pastilles */
      L.push([-10, 12.5, 12, 12.5]);                         /* adresse */
      L.push([-18, 5, 6, 5], [-18, 1.5, -4, 1.5]);           /* titres */
      L = L.concat(rectangle(-14, -3.5, 8, 3));              /* bouton */
      L = L.concat(rectangle(-13, -10.5, 12, 7));            /* trois cartes */
      L = L.concat(rectangle(0, -10.5, 12, 7));
      L = L.concat(rectangle(13, -10.5, 12, 7));
      return segments(L);
    }

    function formeGrille() {
      /* Cinq panneaux : les cinq sites d'exemple. */
      var t = new Float32Array(N * 3);
      var slots = [[-14, 9, 0], [14, 9, 0], [-14, -9, 0], [14, -9, 0], [0, 0, 5]];
      for (var i = 0; i < N; i++) {
        var sl = slots[i % 5], w = 15, h = 10.5;
        var x, y;
        if (alea() < 0.72) { /* contour */
          var p = alea() * 2 * (w + h);
          if (p < w)                { x = -w / 2 + p;         y =  h / 2; }
          else if (p < w + h)       { x =  w / 2;             y =  h / 2 - (p - w); }
          else if (p < 2 * w + h)   { x =  w / 2 - (p - w - h); y = -h / 2; }
          else                      { x = -w / 2;             y = -h / 2 + (p - 2 * w - h); }
        } else { x = (alea() - 0.5) * w; y = (alea() - 0.5) * h; }
        t[i * 3]     = sl[0] + x + (alea() - 0.5) * 0.3;
        t[i * 3 + 1] = sl[1] + y + (alea() - 0.5) * 0.3;
        t[i * 3 + 2] = sl[2] + (alea() - 0.5) * 1.4;
      }
      return t;
    }

    function formeSpirale() {
      /* Double hélice : le chemin, étape par étape. */
      var t = new Float32Array(N * 3);
      for (var i = 0; i < N; i++) {
        var u = i / N, brin = (i % 2) * Math.PI;
        var a = u * Math.PI * 4 + brin, r = 12.5 + (alea() - 0.5) * 1.4;
        t[i * 3]     = Math.cos(a) * r;
        t[i * 3 + 1] = (u - 0.5) * 34;
        t[i * 3 + 2] = Math.sin(a) * r;
      }
      return t;
    }

    function formeVague() {
      /* Nappe calme et ordonnée : le moment de comparer posément. */
      var t = new Float32Array(N * 3);
      for (var i = 0; i < N; i++) {
        var x = (alea() - 0.5) * 52, z = (alea() - 0.5) * 26;
        t[i * 3]     = x;
        t[i * 3 + 1] = -6 + Math.sin(x * 0.28) * 2.2 + Math.cos(z * 0.4) * 1.8;
        t[i * 3 + 2] = z;
      }
      return t;
    }

    function formeColonnes() {
      /* Trois colonnes : les trois forfaits, la vedette au centre, devant. */
      var t = new Float32Array(N * 3);
      var cols = [[-14.5, 19, 0], [0, 26, 4], [14.5, 19, 0]];
      for (var i = 0; i < N; i++) {
        var c = cols[i % 3], w = 11, h = c[1];
        var x, y;
        if (alea() < 0.7) {
          var p = alea() * 2 * (w + h);
          if (p < w)              { x = -w / 2 + p;           y =  h / 2; }
          else if (p < w + h)     { x =  w / 2;               y =  h / 2 - (p - w); }
          else if (p < 2 * w + h) { x =  w / 2 - (p - w - h); y = -h / 2; }
          else                    { x = -w / 2;               y = -h / 2 + (p - 2 * w - h); }
        } else { x = (alea() - 0.5) * w; y = (alea() - 0.5) * h; }
        t[i * 3]     = c[0] + x + (alea() - 0.5) * 0.3;
        t[i * 3 + 1] = y - (26 - h) / 2 + 3;
        t[i * 3 + 2] = c[2] + (alea() - 0.5) * 1.2;
      }
      return t;
    }

    function formeNuage() {
      /* Dispersion libre : les visiteurs, quelque part, qui cherchent. */
      var t = new Float32Array(N * 3);
      for (var i = 0; i < N; i++) {
        var g = function () { return (alea() + alea() + alea() - 1.5) * 13; };
        t[i * 3] = g() * 1.6; t[i * 3 + 1] = g(); t[i * 3 + 2] = g();
      }
      return t;
    }

    function formeOrbe() {
      /* Tout converge : une sphère dense, un anneau qui l'entoure. */
      var t = new Float32Array(N * 3);
      for (var i = 0; i < N; i++) {
        if (i % 5 === 0) { /* anneau incliné */
          var a = alea() * Math.PI * 2, r2 = 13 + (alea() - 0.5) * 0.8;
          var x = Math.cos(a) * r2, z = Math.sin(a) * r2;
          t[i * 3] = x; t[i * 3 + 1] = z * 0.35; t[i * 3 + 2] = z * 0.8;
        } else {
          var vx = alea() * 2 - 1, vy = alea() * 2 - 1, vz = alea() * 2 - 1;
          var n = Math.hypot(vx, vy, vz) || 1, r = 8 * Math.cbrt(alea());
          t[i * 3] = vx / n * r; t[i * 3 + 1] = vy / n * r; t[i * 3 + 2] = vz / n * r;
        }
      }
      return t;
    }

    var formes = {
      logo: formeLogo(), fenetre: formeFenetre(), nuage: formeNuage(),
      grille: formeGrille(), spirale: formeSpirale(), vague: formeVague(),
      colonnes: formeColonnes(), orbe: formeOrbe()
    };

    /* ---------- Points, couleurs, matière ---------- */
    var base = new Float32Array(N * 3);   /* position logique */
    var src  = new Float32Array(N * 3);   /* départ du morphing */
    var dst  = formes.logo;               /* arrivée du morphing */
    var affiche = new Float32Array(N * 3);/* base + respiration, envoyé au GPU */
    var graine = new Float32Array(N);
    var i;
    for (i = 0; i < N; i++) { graine[i] = alea(); }
    /* départ : grand nuage dispersé, le logo s'assemble dès la 1re seconde */
    for (i = 0; i < N * 3; i++) { base[i] = (alea() - 0.5) * 90; src[i] = base[i]; }

    var couleurs = new Float32Array(N * 3);
    var teintes = [[0.07, 0.85, 0.77], [0.31, 0.65, 1.0], [0.49, 0.36, 1.0]]; /* teal, bleu, violet */
    for (i = 0; i < N; i++) {
      var c = teintes[i % 3 === 0 ? 0 : (i % 3 === 1 ? 1 : 2)];
      var v = 0.75 + alea() * 0.45;
      couleurs[i * 3] = Math.min(c[0] * v, 1);
      couleurs[i * 3 + 1] = Math.min(c[1] * v, 1);
      couleurs[i * 3 + 2] = Math.min(c[2] * v, 1);
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(affiche, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(couleurs, 3));

    var cnv = document.createElement('canvas');
    cnv.width = cnv.height = 64;
    var ctx = cnv.getContext('2d');
    var grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,.55)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 64, 64);
    var lueur = new THREE.CanvasTexture(cnv);

    var matiere = new THREE.PointsMaterial({
      size: lite ? 0.4 : 0.32, map: lueur, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, vertexColors: true, sizeAttenuation: true
    });
    var tailleBase = matiere.size;
    groupe.add(new THREE.Points(geo, matiere));

    /* ---------- Morphing ---------- */
    var horloge = { debut: -1, duree: 1.7, etalement: 0.6 };
    var formeActuelle = '';
    function va(nom) {
      if (nom === formeActuelle || !formes[nom]) { return; }
      formeActuelle = nom;
      src.set(base);
      dst = formes[nom];
      horloge.debut = performance.now() / 1000;
    }

    /* ---------- Position et échelle selon l'écran ---------- */
    function cadrer() {
      var grand = window.innerWidth >= 981;
      groupe.position.x = grand ? 12 : 0;
      groupe.scale.setScalar(grand ? 1 : 0.55);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      rendu.setSize(window.innerWidth, window.innerHeight);
    }
    cadrer();
    window.addEventListener('resize', cadrer);

    /* ---------- Souris (parallaxe caméra, ordinateur seulement) ---------- */
    var visee = { x: 0, y: 0 };
    if (!lite) {
      window.addEventListener('pointermove', function (e) {
        visee.x = e.clientX / window.innerWidth - 0.5;
        visee.y = e.clientY / window.innerHeight - 0.5;
      }, { passive: true });
    }

    /* ---------- Vitesse de défilement → énergie des particules ---------- */
    var dernierY = window.scrollY, energie = 0;

    /* ---------- Progression globale → légère bascule ---------- */
    function progression() {
      var h = doc.scrollHeight - window.innerHeight;
      return h > 0 ? window.scrollY / h : 0;
    }

    /* ---------- Boucle ---------- */
    var easeOutCubic = function (k) { return 1 - Math.pow(1 - k, 3); };
    var precedent = performance.now() / 1000;

    function image() {
      var t = performance.now() / 1000;
      var dt = Math.min(t - precedent, 0.05);
      precedent = t;

      /* énergie liée à la vitesse de défilement, avec retombée douce */
      var vy = Math.abs(window.scrollY - dernierY) / Math.max(dt, 0.001);
      dernierY = window.scrollY;
      energie += (Math.min(vy / 2600, 1) - energie) * Math.min(dt * 4, 1);
      matiere.size = tailleBase * (1 + energie * 0.7);

      /* morphing étalé : chaque particule part avec son petit retard */
      if (horloge.debut >= 0) {
        var fini = true;
        for (var i = 0; i < N; i++) {
          var k = (t - horloge.debut - graine[i] * horloge.etalement) / horloge.duree;
          if (k < 1) { fini = false; }
          k = k < 0 ? 0 : (k > 1 ? 1 : k);
          var e = easeOutCubic(k), j = i * 3;
          base[j]     = src[j]     + (dst[j]     - src[j])     * e;
          base[j + 1] = src[j + 1] + (dst[j + 1] - src[j + 1]) * e;
          base[j + 2] = src[j + 2] + (dst[j + 2] - src[j + 2]) * e;
        }
        if (fini) { horloge.debut = -1; }
      }

      /* respiration : un léger flottement perpétuel, amplifié par l'énergie */
      var amp = 0.2 + energie * 1.1;
      for (var p = 0; p < N; p++) {
        var g = graine[p], j2 = p * 3;
        var w = t * (0.5 + g) + g * 40;
        affiche[j2]     = base[j2]     + Math.sin(w) * amp;
        affiche[j2 + 1] = base[j2 + 1] + Math.cos(w * 0.9) * amp;
        affiche[j2 + 2] = base[j2 + 2] + Math.sin(w * 1.1 + 2) * amp;
      }
      geo.attributes.position.needsUpdate = true;

      /* mouvement d'ensemble : lente rotation + parallaxe + progression */
      var prog = progression();
      groupe.rotation.y = Math.sin(t * 0.05) * 0.16 + visee.x * 0.3;
      groupe.rotation.x = prog * 0.14 - visee.y * 0.12;
      camera.position.x = visee.x * 3;
      camera.position.y = -visee.y * 2;
      camera.position.z = 46 + prog * 6;
      camera.lookAt(groupe.position.x, 0, 0);

      rendu.render(scene, camera);
    }
    rendu.setAnimationLoop(image);
    document.addEventListener('visibilitychange', function () {
      rendu.setAnimationLoop(document.hidden ? null : image);
      if (!document.hidden) { precedent = performance.now() / 1000; dernierY = window.scrollY; }
    });

    /* ---------- Formations pilotées par les sections ---------- */
    var serres = document.querySelectorAll('.section--serre');
    var zones = [
      ['.heros', 'logo'], ['#risque', 'fenetre'],
      [serres[0] || null, 'nuage'], ['#exemples', 'grille'],
      ['#approche', 'spirale'], ['#comparatif', 'vague'],
      ['#tarifs', 'colonnes'], ['#questions', 'nuage'], ['#contact', 'orbe']
    ];
    zones.forEach(function (z) {
      var el = typeof z[0] === 'string' ? document.querySelector(z[0]) : z[0];
      if (!el) { return; }
      window.ScrollTrigger.create({
        trigger: el, start: 'top 55%', end: 'bottom 55%',
        onEnter: function () { va(z[1]); },
        onEnterBack: function () { va(z[1]); }
      });
    });
    va('logo'); /* assemblage inaugural */
  }

  /* =======================================================================
     3. DÉMARRAGE
     ===================================================================== */
  avecDelai(chargerScript(URL_GSAP).then(function () { return chargerScript(URL_ST); }), 8000)
    .then(function () {
      try { animationsDom(); } catch (e) { /* le site statique reste complet */ }
      doc.classList.add('fx3');
      /* La scène 3D est un bonus par-dessus les animations DOM. */
      return avecDelai(import(URL_THREE), 10000).then(function (THREE) {
        try { scene3d(THREE); } catch (e) {
          var c = document.querySelector('.scene3d');
          if (c && c.parentNode) { c.parentNode.removeChild(c); }
        }
      });
    })
    .catch(function () { /* CDN inaccessible : rien à défaire, rien n'était caché */ });

})();
