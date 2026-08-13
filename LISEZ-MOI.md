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

## 3. Le logo — « Prisme » (choisi le 13 août 2026)

Deux plans pliés qui forment un **V massif**, l'arête centrale captant la lumière comme une
feuille de papier pliée. Plein, assuré, sans contour fin qui disparaît en petit.
Le dégradé turquoise → bleu → violet est la signature de la marque.

**Les fichiers, et quand utiliser lequel :**

| Fichier | Quand |
|---|---|
| `images/logo.svg` | Marque + texte, **fond clair** — facture, papier en-tête, document |
| `images/logo-blanc.svg` | Marque + texte, **fond sombre** |
| `images/logo-marque.svg` | Le symbole seul — photo de profil, réseaux sociaux, tampon |
| `images/favicon.svg` | L'icône d'onglet, posée sur sa tuile foncée pour rester visible |

Les deux propositions écartées restent dans le dossier (`logo-b-aval.svg`, `logo-c-sceau.svg`),
et `logos.html` garde la comparaison des trois, au cas où.

> **Si un fournisseur refuse le format SVG** et demande un PNG : ouvre le `.svg` dans un
> navigateur, agrandis la fenêtre au maximum et fais une capture — ou demande-le-moi, je te le
> génère à la taille voulue.

**Codes de couleur de la marque** (pour cartes d'affaires, factures, réseaux sociaux) :

| Usage | Code |
|---|---|
| Turquoise (branche gauche) | `#12D8C5` → `#2E8FE0` |
| Violet (branche droite) | `#A184FF` → `#5B63EE` |
| Fond sombre | `#07070E` |
| Texte clair | `#F4F3FF` |
| Dégradé complet du site | `#12D8C5` → `#4FA6FF` → `#7C5CFF` |

> Note : dans `logo.svg` et `logo-blanc.svg`, le texte « VAELOR / DESIGN » utilise la police
> **Sora**. Un imprimeur qui ne l'a pas verra une police de remplacement — dis-le-moi et je te
> fournis une version où le texte est converti en tracés, qui s'affiche partout à l'identique.

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

## 6. ✅ Vérification : tout ce qui est promis est-il réellement faisable ?

J'ai repassé chaque promesse du site et je l'ai confrontée à ce que WordPress + Elementor
gratuit permettent vraiment.

| Promesse sur le site | Faisable ? | Comment, concrètement |
|---|---|---|
| Site modifiable par le client au clic | Oui | Elementor gratuit |
| Textes rédigés, images libres de droits | Oui | Unsplash / Pexels, usage commercial |
| Affichage impeccable sur téléphone | Oui | Vérifié à la largeur exacte des appareils |
| Formulaire de contact | Oui | WPForms Lite ou Fluent Forms, gratuits |
| **Demande** de rendez-vous par formulaire | Oui | Inclus dans tous les forfaits |
| **Calendrier** de réservation en ligne | Oui, avec limite | Module gratuit = souvent 1 service et 1 employé. Au-delà : version payante ~100-200 $/an, versée à l'éditeur du module. **C'est écrit sur le site.** |
| Brancher un outil déjà utilisé (Clic Santé, Calendly, Square) | Oui | Lien ou intégration |
| Site bilingue FR/EN | Oui | Extension gratuite, je rédige la version anglaise |
| Blogue ou actualités | Oui | Natif dans WordPress |
| Menu, grille de prix, catalogue | Oui | Elementor |
| Contenu répétitif géré par le client | Oui | Extension sur mesure — déjà fait pour un autre client |
| Galerie photos, témoignages | Oui | Elementor |
| Référencement local | Oui | Titres, descriptions, données structurées, Search Console, fiche Google |
| Adresses courriel professionnelles | Oui | Incluses chez la plupart des hébergeurs |
| Formation vidéo du client | Oui | Enregistrement d'écran sur son propre site |
| Le site appartient au client | Oui | Domaine et hébergement à son nom, fichiers exportables |
| Première place sur Google | **Non** | Non promis — c'est écrit dans « ce que je ne fais pas » |

**Ce que j'ai corrigé pour que le site ne promette rien de trop :**

- « Réservation en ligne » distingue maintenant le *formulaire de demande* (inclus partout) du
  *vrai calendrier* (possible, avec ses limites en version gratuite). Une question entière de
  la FAQ y est consacrée.
- « 8 clients sur 10 arrivent par téléphone » : **statistique retirée**. Je ne peux pas la
  sourcer, donc elle n'a rien à faire sur ton site. Remplacée par « la plupart de vos visiteurs
  seront sur un téléphone », qui est vrai et défendable.
- Les adresses courriel pro sont présentées comme « si votre hébergeur les inclut », parce que
  c'est le cas de la plupart mais pas de tous.

### Les frais récurrents, et à qui ils vont

Le site l'affiche maintenant dans un tableau, et la FAQ le répète :

| Ce que c'est | Combien | À qui |
|---|---|---|
| Nom de domaine | 20 à 30 $ par année | Registraire — Namecheap, GoDaddy, Cira |
| Hébergement, WordPress inclus | 10 à 20 $ par mois | Hébergeur — Hostinger, WHC, SiteGround |
| WordPress + Elementor | 0 $ | Personne : logiciels libres |
| Certificat de sécurité | 0 $ | Compris dans l'hébergement |
| **Vaelor Design, après la mise en ligne** | **0 $** | **Rien ne t'est versé** |

Mise en garde écrite sur le site : si un client tient à **WordPress.com** plutôt qu'à un
hébergeur classique, il lui faut le forfait **Business (~40 $ par mois)** — le seul de leurs
forfaits qui autorise Elementor. Deux à trois fois le prix pour le même résultat.

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
| **Cinq styles visuels bien distincts** | « Je ne sais pas expliquer ce que je veux » — il pointe la démo qui lui plaît |
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
- [x] ~~Choisir ton logo~~ — **fait : option A, « Prisme »**, en place partout.
- [ ] **Prix actuels : 900 / 1 300 / 1 700 $.** Garde la structure à trois paliers — trois
      forfaits vendent mieux qu'un prix « sur demande ».

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
