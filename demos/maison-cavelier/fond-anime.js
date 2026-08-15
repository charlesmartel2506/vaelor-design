/*! Vaelor Design · fond-anime.js · v1.0 (14 août 2026)
 * -----------------------------------------------------------------------------
 * Fond animé en <canvas>, JAVASCRIPT VANILLE, ZÉRO dépendance, ZÉRO CDN.
 * Conçu pour être collé tel quel dans un widget « HTML » d'Elementor GRATUIT.
 *
 * UTILISATION
 *   1. Poser un élément vide dans la section à animer :
 *        <div data-vfond='{"motif":"poussiere","couleur":"#C9A227"}'></div>
 *      Le script crée un <canvas> qui remplit LE PARENT POSITIONNÉ le plus proche
 *      (une section Elementor est `position:relative` par défaut : rien à régler).
 *   2. Charger ce fichier, ou coller son contenu dans un <script> avant </body>.
 *
 * OPTIONS (toutes facultatives)
 *   motif     "poussiere" | "constellation" | "vagues" | "aurore" | "grille"
 *   couleur   couleur principale        (#RRGGBB)      défaut #FFFFFF
 *   couleur2  couleur secondaire        (#RRGGBB)      défaut = couleur
 *   densite   0.4 … 2                   défaut 1
 *   vitesse   0.3 … 2                   défaut 1
 *   opacite   0 … 1  (opacité du calque) défaut .55
 *   souris    true|false — parallaxe à la souris (grand écran seulement)  défaut true
 *   dessous   true|false — place le canvas SOUS le contenu (z-index 0)    défaut true
 *
 * GARDES (ne jamais les retirer)
 *   · prefers-reduced-motion: reduce  -> aucun canvas créé, la section garde son fond.
 *   · Pas de canvas 2D -> rien n'est créé, aucune erreur.
 *   · Hors écran (IntersectionObserver) ou onglet caché -> boucle arrêtée.
 *   · Téléphone -> densité divisée par ~2, parallaxe souris coupée.
 *   · Le canvas est en pointer-events:none et aria-hidden : jamais dans le chemin
 *     du clic ni dans celui d'un lecteur d'écran.
 * -----------------------------------------------------------------------------
 */
(function () {
  'use strict';

  if (!window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }

  var PETIT = window.matchMedia('(max-width: 860px)').matches;
  var FIN   = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function lireCouleur(h, a) {
    h = (h || '#FFFFFF').replace('#', '');
    if (h.length === 3) { h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; }
    var n = parseInt(h, 16);
    if (isNaN(n)) { n = 0xFFFFFF; }
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  // Lecture TOLÉRANTE des options : `.6` au lieu de `0.6`, guillemets simples,
  // virgule en trop — trois fautes de frappe qui, en JSON strict, feraient retomber
  // toute la section sur le motif par défaut sans le moindre message. Mesuré.
  function options(el) {
    var brut = el.getAttribute('data-vfond') || '{}', o = {};
    try { o = JSON.parse(brut); } catch (e) {
      try {
        o = JSON.parse(brut
          .replace(/'/g, '"')                 // guillemets simples
          .replace(/([:,\[]\s*)\.(\d)/g, '$10.$2') // .6  ->  0.6
          .replace(/,(\s*[}\]])/g, '$1'));    // virgule finale
      } catch (e2) { o = {}; }
    }
    return {
      motif:    o.motif || 'poussiere',
      c1:       o.couleur || '#FFFFFF',
      c2:       o.couleur2 || o.couleur || '#FFFFFF',
      densite:  typeof o.densite === 'number' ? o.densite : 1,
      vitesse:  typeof o.vitesse === 'number' ? o.vitesse : 1,
      opacite:  typeof o.opacite === 'number' ? o.opacite : 0.55,
      souris:   o.souris !== false,
      dessous:  o.dessous !== false,
      cible:    o.cible || ''
    };
  }

  function demarrer(hote) {
    var op = options(hote);
    // Dans Elementor, un widget « HTML » est enfermé dans .elementor-widget-container :
    // le parent direct fait quelques dizaines de pixels. `cible` permet de remonter
    // jusqu'à la vraie section, par exemple {"cible":".elementor-top-section"}.
    var cible = op.cible ? (hote.closest ? hote.closest(op.cible) : null) : null;
    if (!cible) { cible = hote.parentElement; }
    if (!cible) { return; }

    // Le parent doit pouvoir porter un enfant en position absolue.
    var pos = window.getComputedStyle(cible).position;
    if (pos === 'static') { cible.style.position = 'relative'; }

    var cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;' +
                       'pointer-events:none;opacity:' + op.opacite + ';' +
                       'z-index:' + (op.dessous ? '0' : '3');
    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) { return; }
    hote.style.display = 'none';
    cible.insertBefore(cv, cible.firstChild);

    var L = 0, H = 0, dpr = 1, parts = [], t = 0, boucle = null, visible = false;
    var sx = 0, sy = 0, cx = 0, cy = 0; // souris cible / courante

    function nombre() {
      var base = { poussiere: 90, constellation: 78, vagues: 0, aurore: 5, grille: 0 }[op.motif] || 80;
      var n = base * op.densite * (PETIT ? 0.45 : 1);
      // Plafond dur : la boucle des liens est en O(n²).
      return Math.max(0, Math.min(Math.round(n * (L * H) / (1440 * 800)), op.motif === 'constellation' ? 110 : 220));
    }

    function semer() {
      parts = [];
      var n = nombre();
      for (var i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * L,
          y: Math.random() * H,
          r: op.motif === 'aurore' ? (0.18 + Math.random() * 0.22) * Math.max(L, H)
                                   : 0.6 + Math.random() * (op.motif === 'constellation' ? 1.6 : 2.2),
          vx: (Math.random() - 0.5) * 0.22 * op.vitesse,
          vy: (op.motif === 'poussiere' ? -0.12 - Math.random() * 0.28 : (Math.random() - 0.5) * 0.22) * op.vitesse,
          a: 0.25 + Math.random() * 0.75,
          p: Math.random() * Math.PI * 2,
          d: Math.random() < 0.5
        });
      }
    }

    function mesurer() {
      var r = cible.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      L = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      cv.width = Math.round(L * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      semer();
    }

    /* ---------------- les cinq motifs ---------------- */

    function poussiere() {
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx + Math.sin(t * 0.0009 + p.p) * 0.16;
        p.y += p.vy;
        if (p.y < -12) { p.y = H + 10; p.x = Math.random() * L; }
        if (p.x < -12) { p.x = L + 10; } else if (p.x > L + 12) { p.x = -10; }
        var sc = 0.62 + 0.38 * Math.sin(t * 0.0016 + p.p);
        ctx.beginPath();
        ctx.arc(p.x + cx * (p.r * 5), p.y + cy * (p.r * 5), p.r, 0, 6.2832);
        ctx.fillStyle = lireCouleur(p.d ? op.c1 : op.c2, (p.a * sc).toFixed(3));
        ctx.fill();
      }
    }

    function constellation() {
      var i, j, p, q, dx, dy, d2, lim = (PETIT ? 108 : 138), lim2 = lim * lim;
      ctx.lineWidth = 1;
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > L) { p.vx *= -1; }
        if (p.y < 0 || p.y > H) { p.vy *= -1; }
      }
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        for (j = i + 1; j < parts.length; j++) {
          q = parts[j];
          dx = p.x - q.x; dy = p.y - q.y; d2 = dx * dx + dy * dy;
          if (d2 > lim2) { continue; }
          ctx.beginPath();
          ctx.moveTo(p.x + cx * 14, p.y + cy * 14);
          ctx.lineTo(q.x + cx * 14, q.y + cy * 14);
          ctx.strokeStyle = lireCouleur(op.c2, (0.5 * (1 - d2 / lim2)).toFixed(3));
          ctx.stroke();
        }
      }
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        ctx.beginPath();
        ctx.arc(p.x + cx * 22, p.y + cy * 22, p.r, 0, 6.2832);
        ctx.fillStyle = lireCouleur(op.c1, p.a.toFixed(3));
        ctx.fill();
      }
    }

    function vagues() {
      var couches = [
        { amp: 0.055, per: 0.0042, v: 0.00030, y: 0.72, a: 0.30, c: op.c2 },
        { amp: 0.042, per: 0.0060, v: 0.00046, y: 0.80, a: 0.36, c: op.c1 },
        { amp: 0.030, per: 0.0088, v: 0.00068, y: 0.88, a: 0.44, c: op.c1 }
      ];
      for (var k = 0; k < couches.length; k++) {
        var c = couches[k], A = c.amp * H, base = c.y * H;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (var x = 0; x <= L; x += 8) {
          ctx.lineTo(x, base + Math.sin(x * c.per + t * c.v * op.vitesse) * A
                          + Math.sin(x * c.per * 0.5 + t * c.v * 1.7 * op.vitesse) * A * 0.4
                          + cy * 12);
        }
        ctx.lineTo(L, H);
        ctx.closePath();
        ctx.fillStyle = lireCouleur(c.c, c.a);
        ctx.fill();
      }
    }

    function aurore() {
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var x = p.x + Math.sin(t * 0.00022 * op.vitesse + p.p) * L * 0.22 + cx * 34;
        var y = p.y + Math.cos(t * 0.00017 * op.vitesse + p.p * 1.3) * H * 0.20 + cy * 34;
        var g = ctx.createRadialGradient(x, y, 0, x, y, p.r);
        g.addColorStop(0, lireCouleur(p.d ? op.c1 : op.c2, (0.42 * p.a).toFixed(3)));
        g.addColorStop(1, lireCouleur(p.d ? op.c1 : op.c2, '0'));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, 6.2832);
        ctx.fill();
      }
    }

    function grille() {
      var pas = PETIT ? 46 : 62, dec = (t * 0.018 * op.vitesse) % pas, y, x, prof;
      ctx.lineWidth = 1;
      for (y = H * 0.34; y <= H + pas; y += pas) {
        prof = (y - H * 0.34) / (H * 0.66 + pas);
        ctx.beginPath();
        ctx.moveTo(0, y + dec); ctx.lineTo(L, y + dec);
        ctx.strokeStyle = lireCouleur(op.c1, (0.06 + 0.30 * prof).toFixed(3));
        ctx.stroke();
      }
      var fx = L / 2 + cx * 40;
      for (x = -L; x <= L * 2; x += pas * 1.6) {
        ctx.beginPath();
        ctx.moveTo(fx + (x - fx) * 0.16, H * 0.34);
        ctx.lineTo(x, H);
        ctx.strokeStyle = lireCouleur(op.c2, '0.16');
        ctx.stroke();
      }
    }

    var motifs = { poussiere: poussiere, constellation: constellation, vagues: vagues, aurore: aurore, grille: grille };
    var dessiner = motifs[op.motif] || poussiere;

    function image(ts) {
      boucle = requestAnimationFrame(image);
      t = ts || 0;
      cx += (sx - cx) * 0.055;
      cy += (sy - cy) * 0.055;
      ctx.clearRect(0, 0, L, H);
      dessiner();
    }

    function jouer() { if (!boucle) { boucle = requestAnimationFrame(image); } }
    function pause() { if (boucle) { cancelAnimationFrame(boucle); boucle = null; } }

    mesurer();

    var minuteur = null;
    window.addEventListener('resize', function () {
      clearTimeout(minuteur);
      minuteur = setTimeout(mesurer, 180);
    }, { passive: true });

    if (op.souris && FIN && !PETIT) {
      cible.addEventListener('mousemove', function (e) {
        var r = cible.getBoundingClientRect();
        sx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        sy = ((e.clientY - r.top) / r.height - 0.5) * 2;
      }, { passive: true });
      cible.addEventListener('mouseleave', function () { sx = 0; sy = 0; }, { passive: true });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !document.hidden) { jouer(); } else { pause(); }
      }, { rootMargin: '120px' }).observe(cible);
    } else { visible = true; jouer(); }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { pause(); } else if (visible) { jouer(); }
    });
  }

  function tout() {
    var l = document.querySelectorAll('[data-vfond]');
    for (var i = 0; i < l.length; i++) { demarrer(l[i]); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tout);
  } else { tout(); }
})();
