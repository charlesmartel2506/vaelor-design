# Vaelor Design — site de l'agence + 5 sites démo

Tout est autonome : aucune image externe, aucune bibliothèque à télécharger.
Les sites fonctionnent hors ligne, sur GitHub Pages, ou sur n'importe quel hébergement.

---

## 1. Voir le site tout de suite

Double-clique sur `index.html`. C'est tout.

Pour une prévisualisation propre (recommandé, ça évite certaines restrictions du navigateur
sur les fichiers locaux) :

```bash
npx -y http-server vaelor-design -p 8500 -c-1
```

Puis ouvre `http://localhost:8500`.

---

## 2. Ce qu'il y a dans le dossier

```
vaelor-design/
  index.html                  ← le site de Vaelor Design
  css/styles.css              ← toute la mise en forme
  js/script.js                ← thèmes, filtres, menu, formulaire
  images/
    logo.svg                  ← logo complet (marque + texte), fond clair
    logo-blanc.svg            ← même logo, pour fond sombre
    logo-marque.svg           ← l'icône seule (carré, réseaux sociaux, favicon)
    favicon.svg               ← icône d'onglet
  demos/
    maison-cavelier/index.html      ← Restaurant · thème Éclat
    clinique-aubery/index.html      ← Clinique dentaire · thème Clarté
    verdal-paysagement/index.html   ← Paysagiste · thème Terra
    garage-metrik/index.html        ← Garage · thème Volt
    studio-halona/index.html        ← Salon de beauté · thème Nuance
```

**Chaque démo est un seul fichier HTML autonome.** Tu peux en envoyer une par courriel,
la déposer sur un hébergement, ou la copier ailleurs : elle fonctionnera seule.

---

## 3. Le logo

Le symbole représente les deux choses à la fois :

- **le cadre arrondi** = un écran, une fenêtre de navigateur → ce que tu vends ;
- **le « V » qui sort du cadre par le coin, avec une pointe de flèche** = Vaelor, et la
  croissance de l'entreprise du client.

Le dégradé turquoise → bleu → violet est la signature visuelle de la marque.

**Codes de couleur à réutiliser partout (cartes d'affaires, factures, réseaux sociaux) :**

| Usage | Code |
|---|---|
| Turquoise | `#12D8C5` |
| Bleu | `#4FA6FF` |
| Violet | `#7C5CFF` |
| Fond sombre | `#07070E` |
| Texte clair | `#F4F3FF` |

> Note : dans les fichiers `.svg`, le texte « VAELOR / DESIGN » utilise la police Sora.
> Si tu as besoin d'un logo en image fixe (PNG) pour un fournisseur qui n'accepte pas le SVG,
> ouvre le `.svg` dans un navigateur, agrandis la fenêtre, et fais une capture — ou demande-moi
> de le générer.

---

## 4. Faire fonctionner le formulaire de contact pour vrai

Actuellement, le formulaire **ouvre le logiciel de courriel du visiteur** avec le message déjà
rédigé. Ça marche, mais le visiteur doit encore appuyer sur « Envoyer », et certains n'ont pas
de logiciel de courriel configuré.

**Pour recevoir les demandes directement dans ta boîte de réception** (gratuit, 50 messages/mois) :

1. Crée un compte sur [formspree.io](https://formspree.io) avec `charlesmartel2506@gmail.com`.
2. Crée un formulaire — tu obtiens une adresse du genre `https://formspree.io/f/xabcdefg`.
3. Dans `index.html`, remplace la ligne :
   ```html
   <form class="form" id="form-contact" novalidate>
   ```
   par :
   ```html
   <form class="form" id="form-contact" action="https://formspree.io/f/TON-CODE" method="POST">
   ```
4. Dans `js/script.js`, supprime le bloc `form.addEventListener('submit', …)` — sinon il
   intercepte l'envoi.

---

## 5. Mettre le site en ligne (gratuit)

1. Crée un dépôt GitHub, par exemple `vaelor-design`.
2. Dépose-y le contenu de ce dossier.
3. Dans le dépôt : **Settings → Pages → Source : branche `main`, dossier `/ (root)`**.
4. Deux à cinq minutes plus tard, le site est à
   `https://TON-NOM.github.io/vaelor-design/`.

Quand tu achèteras `vaelordesign.ca` (environ 20 $ par année), tu pourras le brancher dessus
depuis la même page de réglages.

⚠️ **GitHub Pages met 2 à 5 minutes à republier après un envoi.** Vérifie que la page répond
avant d'envoyer le lien à un client.

---

## 6. Les cinq thèmes

Le sélecteur de la section « Thèmes » change **en direct** les couleurs, les polices et les
arrondis d'un mini-site d'exemple. C'est l'outil de vente le plus efficace de la page : au lieu
de demander au client de décrire ce qu'il veut, tu lui fais cliquer.

| Thème | Ambiance | Pour qui |
|---|---|---|
| **Éclat** | Sombre + doré, typographie classique | Restaurants, avocats, bijoutiers |
| **Clarté** | Blanc + bleu, très lisible | Cliniques, comptables, professionnels |
| **Terra** | Crème + vert forêt, chaleureux | Paysagistes, spas, produits naturels |
| **Volt** | Anthracite + orange, franc | Garages, construction, gyms |
| **Nuance** | Sable + rosé, tout en douceur | Salons, fleuristes, boutiques |

Chaque thème renvoie vers la démo complète construite avec ce style — le client voit d'abord
un aperçu, puis un vrai site fini.

**Ajouter un sixième thème** : dans `js/script.js`, copie un bloc de l'objet `THEMES`, change
les valeurs, puis ajoute un bouton `<button class="theme-choix" data-theme="ton-nom">` dans
`index.html`. Rien d'autre à toucher.

---

## 7. Ce que j'ai mis dans le site pour faire décrocher le téléphone

Ce ne sont pas des sections décoratives — chacune répond à une objection précise qu'un
propriétaire de PME se pose avant d'écrire à un inconnu.

| Section | L'objection qu'elle désamorce |
|---|---|
| **« Vous ne signez rien, vous ne payez rien »** | « Et si je paie et que je n'aime pas ? » — c'est ton argument le plus fort, il est en tête de page |
| **Bandeau « 0 $ d'avance »** dans le héros | Visible avant même de défiler |
| **Cinq sites cliquables** | « Il dit qu'il sait faire, mais est-ce que c'est beau ? » |
| **Mention que les entreprises sont fictives** | Ne jamais laisser croire à une clientèle que tu n'as pas encore : la confiance se casse une seule fois |
| **Sélecteur de thèmes** | « Je ne sais pas expliquer ce que je veux » |
| **Notre approche, en 6 étapes chiffrées** | « Combien de temps ? Qu'est-ce qu'on attend de moi ? » |
| **Comparatif à 3 colonnes** | « Je pourrais le faire moi-même sur Wix » — et tu y admets quand tu n'es PAS le bon choix, ce qui rend le reste crédible |
| **Tarifs affichés** | Le silence sur les prix fait fuir plus de clients qu'un prix élevé |
| **« Ce que vous payez en plus, et à qui »** | Le domaine et l'hébergement annoncés d'avance, jamais après |
| **« Ce que je ne fais pas »** | Un vendeur qui dit non à quelque chose devient crédible sur tout le reste |
| **10 questions fréquentes** | Répond à « où est le piège ? », « suis-je pris avec vous ? », « et si je suis nul en informatique ? » |
| **Trois façons de te joindre** | Certains écrivent, d'autres appellent, d'autres textent |

---

## 8. Ce qu'il te reste à faire

- [ ] **Témoignages** — la seule chose qui manque, et elle est normale : tu n'as pas encore de
      clients terminés. Dès le premier, demande deux phrases et une permission écrite, et
      ajoute une section « Ce qu'on dit de moi ». Elle vaudra plus que tout le reste de la page.
- [ ] **Acheter `vaelordesign.ca`** (Namecheap, Google Domains, GoDaddy — environ 20 $/an).
- [ ] **Créer une adresse professionnelle** du genre `bonjour@vaelordesign.ca`.
      Une adresse Gmail dans le pied de page d'une agence web, ça détonne un peu.
- [ ] **Brancher Formspree** (§4).
- [ ] **Créer une fiche Google d'entreprise** — c'est gratuit et c'est par là que passeront
      la moitié de tes appels.
- [ ] **Vérifier tes prix.** J'ai fixé 1 000 / 1 400 / 1 700 $ selon ce que tu m'as dit.
      Ce sont trois paliers clairs : ajuste les montants si ta réalité change, mais garde
      la structure — trois forfaits vendent mieux qu'un prix « sur demande ».

---

## 9. Notes techniques (pour moi, plus tard)

- **Aucune image bitmap.** Tout le visuel est en SVG écrit à la main ou en dégradés CSS.
  Conséquence : les sites se chargent instantanément et ne peuvent jamais afficher une image
  cassée. Quand un vrai client fournit ses photos, elles remplacent les blocs SVG.
- **Piège corrigé pendant la construction** : `.btn { white-space: nowrap }` sur un bouton
  pleine largeur au libellé long forçait la page à 452 px de large sur un téléphone de 393 px.
  Corrigé par `.form .btn, .tarif .btn { white-space: normal }` + une règle générale
  sous 430 px. Vérifié sur les six pages : `scrollWidth === clientWidth === 393`.
- **Animation d'apparition sûre par défaut** : le masquage n'est appliqué que si le JavaScript
  a posé `.js-anim` sur `<html>`, et un filet de sécurité le retire si `IntersectionObserver`
  ne révèle rien en 2,5 s. Un script bloqué ne peut donc jamais donner une page vide.
- **Toutes les entreprises des démos sont fictives**, avec des numéros en `555` et des adresses
  inventées. C'est dit explicitement sur le site principal et dans un bandeau au bas de chaque
  démo.
