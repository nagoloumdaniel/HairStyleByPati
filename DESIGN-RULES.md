# DESIGN-RULES — consignes design permanentes (HairStyleByPati)

> Claude : relire CE fichier à CHAQUE message avant toute modification d'UI. Toute nouvelle consigne design de l'utilisateur s'ajoute ici (section « Consignes par interface »), jamais seulement dans la conversation.

## Typographie (impératif)

- Titres : **Playfair Display** (400–900, normal + italique) via `font-heading`.
- Texte : **Lato** (100, 300, 400, 700, 900, normal + italique) via `font-sans`.
- Aucune autre police. Manrope supprimée. Chargement uniquement par `next/font` dans `src/app/layout.tsx`.

## Couleurs (impératif — aucune autre couleur de marque)

| Rôle                   | Light   | Dark    |
| ---------------------- | ------- | ------- |
| Fond (`page`)          | #FFFCF0 | #17150B |
| Surface (`card`)       | #FFFFFF | #23200F |
| Texte (`fg`)           | #28230C | #FFF8D8 |
| Primaire (`accent`)    | #8A6400 | #FFD84D |
| Accent (`accent-soft`) | #FFF1B8 | #41350E |

- Texte sur Primaire : `text-accent-fg` (blanc en light, #17150B en dark). Jamais de hex en dur : utiliser les tokens de `src/app/globals.css`.
- Nuances : échelle `primary-50…900`. Dégradé : `.bg-gradient-primary`, `.bg-gradient-soft`, `.text-gradient-primary`.
- Sur panneaux toujours sombres (footer, sidebar) : `text-bright` (#FFD84D), pas `text-accent`.
- États alert/success restent fonctionnels (hors marque).

## Effets

- Verre : `.glass` / `.glass-strong` (blur + bordure translucide). Navbar : `.nav-floating` flottante (pilule, web + mobile), contenu décalé par un espaceur.
- Respecter `prefers-reduced-motion`, focus visible, contraste WCAG AA, états loading/erreur/vide, responsive.

## Consignes par interface

(à compléter au fil des instructions de l'utilisateur)

- Global : navbar flottante verre. Page 404 : `src/app/not-found.tsx` (dégradé + verre).
