# Les outils d'animation de Vaelor Design

Trois fichiers, tous en JavaScript vanille, **sans aucune dépendance et sans CDN**.
C'est la condition pour qu'ils fonctionnent dans un widget « HTML » d'**Elementor gratuit**,
chez le client, sans plugin payant.

| Fichier | Ce que c'est |
|---|---|
| `fond-anime.js` | Le moteur de fond animé en `<canvas>` — cinq motifs |
| `kit-niveau-3.html` | Le bloc `<style>` + `<script>` des autres effets (parallaxe, volets, barre de lecture…) |
| `banc-fond-anime.html` | Le banc d'essai des cinq motifs, à ouvrir pour choisir |
| `apercu-widget-elementor.html` | Le même moteur, dans une section Elementor **simulée** — sert à prouver que ça marche avant de livrer |

---

## 1. Le fond animé

Poser un élément vide dans la section à animer :

```html
<div data-vfond='{"motif":"poussiere","couleur":"#C9A227","opacite":0.55}'></div>
<script src="fond-anime.js"></script>
```

Le script crée un `<canvas>` qui remplit **le parent positionné** de cet élément.

### Les cinq motifs

| Motif | Pour qui | Effet |
|---|---|---|
| `poussiere` | restaurants, boulangeries, bijouteries, spas | Poussière lumineuse qui monte |
| `constellation` | quincailleries, techno, services professionnels | Points reliés par des traits |
| `vagues` | paysagement, piscines, bord de l'eau | Vagues superposées en bas |
| `aurore` | cliniques, salons, esthétique | Nappes de couleur qui respirent |
| `grille` | garages, construction, transport | Perspective au sol qui défile |

### Toutes les options

| Clé | Défaut | À quoi ça sert |
|---|---|---|
| `motif` | `poussiere` | Voir le tableau ci-dessus |
| `couleur` / `couleur2` | blanc | Les deux couleurs, tirées de la palette du client |
| `densite` | `1` | De 0.4 à 2 |
| `vitesse` | `1` | De 0.3 à 2 |
| `opacite` | `0.55` | Opacité du calque entier |
| `souris` | `true` | Parallaxe à la souris (grand écran seulement) |
| `dessous` | `true` | `false` = le canvas passe AU-DESSUS de la photo de fond |
| `cible` | — | **Pour Elementor** : sélecteur d'un ancêtre à remplir, ex. `".elementor-top-section"` |

### Dans Elementor

Un widget « HTML » est enfermé dans `.elementor-widget-container`, une boîte de quelques
dizaines de pixels. **Sans `cible`, le fond animé remplirait cette petite boîte**, pas la
section. Toujours écrire :

```html
<div data-vfond='{"motif":"aurore","couleur":"#b9805f","cible":".elementor-top-section"}'></div>
```

Et comme un widget HTML ne peut pas charger un `<script src>` local, **on recopie tout le
moteur** dans un `<script>` du même widget (c'est ce que fait `build.js` de FiliDerma).

---

## 2. Les gardes — ne jamais les retirer

1. **`prefers-reduced-motion: reduce` → aucun canvas n'est créé.** La section garde son fond
   normal. Vérifié : 0 canvas, 5 sections intactes.
2. **Pas de canvas 2D disponible → rien ne se passe**, aucune erreur.
3. **Hors écran ou onglet caché → la boucle s'arrête.** Pas de batterie gaspillée.
4. **Téléphone → densité divisée par deux**, parallaxe souris coupée.
5. Le canvas est `pointer-events:none` et `aria-hidden` : jamais dans le chemin d'un clic
   ni dans celui d'un lecteur d'écran.

---

## 3. Pièges déjà payés (14 août 2026)

| Piège | Ce qui se passe |
|---|---|
| `"opacite":.6` au lieu de `0.6` | Ce n'est **pas** du JSON valide → toute la section retombait sur le motif par défaut, **sans le moindre message**. Le lecteur d'options est maintenant tolérant (`.6`, guillemets simples, virgule en trop) |
| Injecter du JS avec `String.replace()` | `$$` dans la chaîne de remplacement veut dire « un `$` littéral » : mon `$$ = querySelectorAll` arrivait dans la page en `$ = ...`, et la parallaxe plantait. **Toujours passer une FONCTION** : `s.replace(a, () => b)` |
| Ancrer un remplacement sur un nom de classe seul | `sais__px` existait aussi dans la feuille de style : la photo est partie **dans l'en-tête** du site. Ancrer sur le balisage réel (`<svg viewBox="…">`), jamais sur un mot qui traîne aussi dans le CSS |
| Voile de héros trop faible | Un titre blanc sur une photo claire devient illisible. Sur un héros à texte **centré**, utiliser une **vignette** (sombre au centre, claire sur les bords) plutôt qu'un dégradé de côté |
| `dessous:false` dans une section | Le canvas passe en `z-index:3` — il faut vérifier que le contenu est au-dessus (`z-index:4`), sinon la nappe voile le texte |
| Coller le moteur dans un `<script>` d'une page | Un analyseur HTML ferme un `<script>` au **premier `</`** qu'il rencontre, même dans un commentaire JavaScript. `build.js` neutralise donc tous les `</` avant d'inliner |
| Capture d'écran « page entière » pour vérifier | Elle **ne déclenche pas** les apparitions au défilement : la page semble vide alors qu'elle est parfaite. Vérifier section par section, en défilant vraiment |

---

## 4. Les photos

`vaelor-prospection/outils/photos.sh` cherche et télécharge des photos **Pexels**
(licence gratuite, usage commercial, aucune attribution obligatoire), sans clé API.

```bash
./photos.sh chercher "french bistro interior warm" landscape
./photos.sh prendre 30786095 heros.jpg 1700
```

Méthode qui marche bien : télécharger une dizaine de vignettes, les regarder **côte à côte**
sur une planche-contact, choisir, puis retélécharger le choix en grand.

**Compression** — indispensable, les photos brutes sont énormes :

```bash
npx -y sharp-cli -i photo.jpg -o photo.jpg resize 1600 --withoutEnlargement -f jpeg -q 72 --mozjpeg
```

Sur FiliDerma, les images pesaient **9,3 Mo** au total. Après ce passage : **1,2 Mo**, sans
différence visible à l'écran.
