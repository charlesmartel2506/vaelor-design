/* =========================================================================
   VAELOR DESIGN — expérience 3D pilotée par le défilement
   Moteur autonome : il pose la classe .fx sur <html> et écrit des variables
   CSS (--p par section, --glob, --vel, --exit, --mx/--my). Tout le rendu
   est déclaré dans styles.css sous « html.fx ». Si ce fichier plante ou ne
   se charge pas, le site s'affiche exactement comme avant.
   ========================================================================= */
(function () {
  'use strict';

  var docEl = document.documentElement;

  /* Trois paliers : off (mouvement réduit / vieux navigateur), lite
     (tactile ou petit écran), full (souris + grand écran). */
  if (!window.matchMedia || !('requestAnimationFrame' in window) || !('IntersectionObserver' in window)) { return; }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }

  var full = matchMedia('(pointer: fine)').matches && window.innerWidth >= 981;
  var lite = !full;
  var canvasOn = true;
  if (lite) {
    var hc = navigator.hardwareConcurrency || 8;
    var dm = navigator.deviceMemory || 8;
    if (hc <= 4 || dm <= 4) { canvasOn = false; }
  }

  var ok = false;
  try {
    docEl.classList.add('fx');
    if (lite) { docEl.classList.add('fx-lite'); }

    /* Filet de sécurité : si la première image n'a jamais été rendue au bout
       de 2,5 s, on retire tout — personne ne doit voir une page figée. */
    setTimeout(function () {
      if (!ok) { docEl.classList.remove('fx', 'fx-lite'); }
    }, 2500);

    /* ---------- Décor créé par JS (n'existe jamais si l'expérience est coupée) ---------- */
    var canvas = null, ctx = null;
    if (canvasOn) {
      canvas = document.createElement('canvas');
      canvas.id = 'fond-experience';
      canvas.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(canvas, document.body.firstChild);
      ctx = canvas.getContext('2d');
      if (!ctx) { canvasOn = false; canvas.parentNode.removeChild(canvas); canvas = null; }
    }

    var faisceau = document.createElement('div');
    faisceau.className = 'faisceau';
    faisceau.setAttribute('aria-hidden', 'true');
    var faisceauBarre = document.createElement('span');
    faisceau.appendChild(faisceauBarre);
    document.body.appendChild(faisceau);

    /* ---------- Scènes : chaque section reçoit --p (0 → 1 sur sa traversée) ---------- */
    var sceneEls = [].slice.call(document.querySelectorAll('main > section, main > .bandeau'));
    var scenes = sceneEls.map(function (el) {
      return { el: el, top: 0, h: 1, active: false, p: -9 };
    });

    var heros = document.querySelector('.heros');
    var visu = document.querySelector('.heros__visu');
    var exemples = document.getElementById('exemples');
    var contact = document.getElementById('contact');
    var projets = [].slice.call(document.querySelectorAll('.projet')).map(function (el) {
      return { el: el, cy: 0, d: -9 };
    });

    /* Décalages en cascade (--i) posés par JS pour ne pas alourdir le HTML */
    function poserIndices(sel) {
      [].slice.call(document.querySelectorAll(sel)).forEach(function (el, i) {
        el.style.setProperty('--i', i);
      });
    }
    poserIndices('.etapes-risque .etape-risque');
    poserIndices('.grille-tarifs .tarif');
    poserIndices('.chrono .etape');
    poserIndices('.faq .qr');

    /* ---------- Mesures (jamais dans la boucle chaude) ---------- */
    var vh = window.innerHeight, docH = 1;
    function mesurer() {
      vh = window.innerHeight;
      docH = Math.max(1, docEl.scrollHeight - vh);
      var y = window.scrollY || window.pageYOffset;
      scenes.forEach(function (s) {
        var r = s.el.getBoundingClientRect();
        s.top = r.top + y;
        s.h = Math.max(1, r.height);
      });
      projets.forEach(function (p) {
        var r = p.el.getBoundingClientRect();
        p.cy = r.top + y + r.height / 2;
      });
      if (canvasOn) { tailleCanvas(); }
    }

    /* Sections actives seulement : l'IntersectionObserver tient la liste */
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        for (var i = 0; i < scenes.length; i++) {
          if (scenes[i].el === e.target) { scenes[i].active = e.isIntersecting; break; }
        }
      });
    }, { rootMargin: '20% 0px 20% 0px' });
    sceneEls.forEach(function (el) { io.observe(el); });

    /* ---------- État du défilement ---------- */
    var y = window.scrollY || window.pageYOffset;
    var yPrec = y, velLisse = 0, derniereEcriture = {};
    var dernierScroll = Date.now();
    var besoin = true;      /* au moins une image à rendre */
    var enMarche = false;
    var cadre = 0;

    window.addEventListener('scroll', function () {
      y = window.scrollY || window.pageYOffset;
      dernierScroll = Date.now();
      reveiller();
    }, { passive: true });

    var minuterieRedim = null;
    window.addEventListener('resize', function () {
      clearTimeout(minuterieRedim);
      minuterieRedim = setTimeout(function () { mesurer(); reveiller(); }, 150);
    });

    /* ---------- Inclinaison de la fenêtre du héros (souris seulement) ---------- */
    var mxCible = 0, myCible = 0, mx = 0, my = 0;
    if (full && heros && visu) {
      heros.addEventListener('pointermove', function (e) {
        var r = visu.getBoundingClientRect();
        mxCible = Math.max(-1, Math.min(1, ((e.clientX - r.left) / Math.max(1, r.width) - 0.5) * 2));
        myCible = Math.max(-1, Math.min(1, ((e.clientY - r.top) / Math.max(1, r.height) - 0.5) * 2));
        reveiller();
      });
      heros.addEventListener('pointerleave', function () { mxCible = 0; myCible = 0; reveiller(); });
    }

    /* ---------- Reflet + inclinaison des cartes d'exemples au survol ---------- */
    if (full) {
      [].slice.call(document.querySelectorAll('.projet')).forEach(function (p) {
        p.addEventListener('pointermove', function (e) {
          var r = p.getBoundingClientRect();
          p.style.setProperty('--hx', (((e.clientX - r.left) / Math.max(1, r.width)) - 0.5).toFixed(3));
          p.style.setProperty('--hy', (((e.clientY - r.top) / Math.max(1, r.height)) - 0.5).toFixed(3));
        });
        p.addEventListener('pointerleave', function () {
          p.style.setProperty('--hx', '0');
          p.style.setProperty('--hy', '0');
        });
      });
    }

    /* ---------- Écriture d'une variable seulement quand elle change ---------- */
    function ecrire(el, cle, val, nom) {
      var id = nom + (el === docEl ? '' : '@');
      /* comparaison par élément : on garde la dernière valeur écrite */
      if (el.__fx === undefined) { el.__fx = {}; }
      if (Math.abs((el.__fx[cle] || 0) - val) < 0.002 && el.__fx[cle] !== undefined) { return; }
      el.__fx[cle] = val;
      el.style.setProperty(cle, val.toFixed(4));
      void id;
    }

    /* ---------- Canvas : poussières lumineuses sur 3 plans ---------- */
    var TEAL = [18, 216, 197], BLEU = [79, 166, 255], VIOLET = [124, 92, 255];
    var dpr = 1, larg = 0, hautC = 0, grains = [];

    function tailleCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
      larg = window.innerWidth; hautC = window.innerHeight;
      canvas.width = Math.round(larg * dpr);
      canvas.height = Math.round(hautC * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initGrains() {
      var n = lite ? 35 : 110;
      grains = [];
      for (var i = 0; i < n; i++) {
        var prof = i % 3 === 0 ? 0.25 : (i % 3 === 1 ? 0.55 : 1);
        grains.push({
          x: Math.random(), yr: Math.random(),
          prof: prof,
          taille: 0.8 + Math.random() * 1.6 * prof,
          vx: (Math.random() - 0.5) * 0.00012,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    function melange(a, b, t) {
      return [
        Math.round(a[0] + (b[0] - a[0]) * t),
        Math.round(a[1] + (b[1] - a[1]) * t),
        Math.round(a[2] + (b[2] - a[2]) * t)
      ];
    }
    function teinte(g) {
      return g < 0.5 ? melange(TEAL, BLEU, g * 2) : melange(BLEU, VIOLET, (g - 0.5) * 2);
    }

    function dessinerGrains(glob, temps, contactActif, contactCentre) {
      ctx.clearRect(0, 0, larg, hautC);
      var c = teinte(glob);
      for (var i = 0; i < grains.length; i++) {
        var g = grains[i];
        g.x += g.vx + Math.sin(temps * 0.0004 + g.phase) * 0.00005;
        if (g.x < -0.02) { g.x = 1.02; } else if (g.x > 1.02) { g.x = -0.02; }
        /* attraction très douce vers la boîte contact quand on y arrive */
        if (contactActif) { g.x += (contactCentre - g.x) * 0.0015 * g.prof; }
        var px = g.x * larg;
        var py = (g.yr * hautC - (y * g.prof * 0.14)) % hautC;
        if (py < 0) { py += hautC; }
        var alpha = 0.10 + 0.26 * g.prof;
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(px, py, g.taille, 0, 6.2832);
        ctx.fill();
      }
    }

    /* ---------- Boucle ---------- */
    function image(temps) {
      cadre++;
      var inactifDepuis = Date.now() - dernierScroll;
      var glob = Math.max(0, Math.min(1, y / docH));

      /* variables globales */
      ecrire(docEl, '--glob', glob, 'glob');
      var vel = y - yPrec; yPrec = y;
      velLisse += (vel - velLisse) * 0.12;
      ecrire(docEl, '--vel', Math.max(-1, Math.min(1, velLisse / 40)), 'vel');

      faisceauBarre.style.transform = 'scaleY(' + glob.toFixed(4) + ')';

      /* héros : sortie de scène + inclinaison souris */
      if (heros) {
        ecrire(heros, '--exit', Math.max(0, Math.min(1, y / (vh * 0.9))), 'exit');
      }
      if (full && visu) {
        mx += (mxCible - mx) * 0.08;
        my += (myCible - my) * 0.08;
        ecrire(visu, '--mx', mx, 'mx');
        ecrire(visu, '--my', my, 'my');
      }

      /* progression des sections visibles */
      var contactActif = false;
      for (var i = 0; i < scenes.length; i++) {
        var s = scenes[i];
        if (!s.active) { continue; }
        var p = (y + vh - s.top) / (vh + s.h);
        p = Math.max(0, Math.min(1, p));
        ecrire(s.el, '--p', p, 'p');
        if (s.el === contact && p > 0.05 && p < 0.98) { contactActif = true; }
      }

      /* éventail des cartes d'exemples (distance au centre de l'écran) */
      if (exemples) {
        var centre = y + vh / 2;
        for (var j = 0; j < projets.length; j++) {
          var pr = projets[j];
          var d = Math.max(-1, Math.min(1, (pr.cy - centre) / vh));
          ecrire(pr.el, '--d', d, 'd');
        }
      }

      /* canvas — cadence réduite quand le visiteur ne bouge plus */
      if (canvasOn && !document.hidden) {
        if (inactifDepuis < 2000 || cadre % 3 === 0) {
          dessinerGrains(glob, temps, contactActif, 0.5);
        }
      }

      ok = true;

      /* la boucle s'endort si plus rien ne bouge et que le canvas est coupé */
      var lerpsEnCours = full && (Math.abs(mxCible - mx) > 0.002 || Math.abs(myCible - my) > 0.002);
      if (!canvasOn && inactifDepuis > 3000 && !lerpsEnCours) {
        enMarche = false;
        return;
      }
      requestAnimationFrame(image);
    }

    function reveiller() {
      if (!enMarche) {
        enMarche = true;
        requestAnimationFrame(image);
      }
    }

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) { dernierScroll = Date.now(); reveiller(); }
    });

    /* ---------- Départ ---------- */
    mesurer();
    if (canvasOn) { initGrains(); }
    reveiller();
    /* Les polices chargées tardivement décalent les hauteurs : on remesure. */
    window.addEventListener('load', mesurer);

  } catch (err) {
    docEl.classList.remove('fx', 'fx-lite');
  }
})();
