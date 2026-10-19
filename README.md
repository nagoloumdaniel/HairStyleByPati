# Hairstyle by Patricia

Application web de réservation en ligne pour un salon de coiffure spécialisé (tresses, vanilles, locs, départ de locs, protectrices, coupes). Site public vitrine + catalogue, moteur de compatibilité capillaire configurable, réservation en ligne, messagerie et back-office d'administration.

## Statut

Phase **6, réservation, disponibilités et calendrier**, terminée le 19/10/2026 : parcours public de réservation en 8 étapes, moteur de disponibilités (horaires, exceptions, pauses, blocages, marges, délais), verrou PostgreSQL anti double réservation, validation manuelle avec libération automatique, annulation client par lien sécurisé, annulation admin, reprogrammation atomique, calendrier jour/semaine/mois/liste et gestion des disponibilités avec alertes de conflit. Le garde de compatibilité de la phase 5 est rejoué avant chaque enregistrement. Vérifiée par 157 tests Vitest et 8 parcours Playwright.

Le thème **clair / sombre** est disponible sur toutes les interfaces via l'icône du header. La préférence système est détectée au chargement, le choix est mémorisé dans le navigateur et appliqué avant le premier rendu pour éviter tout flash. Vérifié par 4 parcours Playwright desktop et mobile.

Prochaine étape : phase **7, notifications et messagerie**. Les notifications de réservation sont déjà mises en file d'attente de façon idempotente. Le seed crée des disponibilités par défaut du lundi au samedi, 9h-18h.

## Stack (figée — voir [docs/stack.md](docs/stack.md))

| Couche          | Choix                                                      |
| --------------- | ---------------------------------------------------------- |
| Framework       | Next.js 15 (App Router) + React 19 + TypeScript strict     |
| UI              | **Tailwind CSS v4** + composants personnalisés (shadcn/ui) |
| Base de données | PostgreSQL (Neon) + Prisma                                 |
| E-mails         | Resend                                                     |
| Fichiers        | Cloudflare R2 (API S3)                                     |
| Auth            | Auth.js (NextAuth) credentials + Argon2                    |
| Hébergement     | Vercel                                                     |

## Documentation

| Document                                       | Contenu                                  |
| ---------------------------------------------- | ---------------------------------------- |
| [Cahier de charge.md](<Cahier de charge.md>)   | Spécification client v1.0 (20 sections)  |
| [ROADMAP.md](ROADMAP.md)                       | 13 phases, 122 mini-tâches               |
| [docs/acceptation.md](docs/acceptation.md)     | Critères d'acceptation §17 + couverture  |
| [docs/plan-detaille.md](docs/plan-detaille.md) | Décomposition par module (§14.2)         |
| [docs/stack.md](docs/stack.md)                 | Choix techniques et justification        |
| [docs/architecture.md](docs/architecture.md)   | Arborescence par domaine + plan de pages |
| [docs/git.md](docs/git.md)                     | Branches, conventions de commit, hooks   |
| [.env.example](.env.example)                   | Variables d'environnement documentées    |

## Développement

```bash
npm install
npm run dev        # serveur de développement
npm run ci         # CI locale : typecheck + format + lint + tests + build
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
npm run format     # Prettier
npm run clean      # supprime le cache .next
npm run db:seed    # catégories de base + compte admin
npm run db:seed:demo  # catalogue de démonstration (développement uniquement)
npx playwright test tests/e2e/dashboard.spec.ts --project=desktop  # back-office (E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD requis)
npx playwright test tests/e2e/compatibilite.spec.ts --project=desktop  # compatibilité, photos privées et décisions
npx playwright test tests/e2e/reservations.spec.ts --project=desktop --workers=1  # réservation, annulation, calendrier
```

`npm run db:seed:demo` ajoute 12 prestations d'exemple publiées pour vérifier le site public. Ne jamais l'exécuter sur la base de production : le catalogue réel est saisi par Patricia depuis le dashboard (Phase 4).

Les hooks `pre-commit` (lint-staged + `tsc --noEmit`) et `pre-push` (`npm run ci`) sont installés automatiquement par `npm install` (script `prepare` → husky). CI/CD : locale via `npm run ci`, déploiement Vercel au push sur `main`.

### Cache `.next` : erreurs `Cannot find module './500.js'`

`next dev` et `next build` partagent le dossier `.next`. Lancer un build
(ou un `git push`, car le hook `pre-push` exécute `npm run ci`) pendant que
le serveur de développement tourne corrompt ce cache.

Procédure :

```bash
# 1. arrêter le serveur de développement (Ctrl+C)
npm run clean   # 2. supprimer le cache .next
npm run dev     # 3. relancer
```

Règle : lancer `npm run ci` / `npm run build` / `git push` serveur de
développement arrêté.

## Règles du projet

- Aucun secret réel dans le dépôt : seul `.env.example` est versionné.
- Validation serveur systématique (Zod) sur toutes les entrées.
- Règles de compatibilité vérifiées côté serveur uniquement.
- Instantanés de prix/durée sur chaque réservation.
- Dates stockées en UTC, affichées à l'heure de l'appareil connecté.
- Conventional Commits sur toutes les branches.
