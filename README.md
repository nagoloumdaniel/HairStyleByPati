# Hairstyle by Patricia

Application web de réservation en ligne pour un salon de coiffure spécialisé (tresses, vanilles, locs, départ de locs, protectrices, coupes). Site public vitrine + catalogue, moteur de compatibilité capillaire configurable, réservation en ligne, messagerie et back-office d'administration.

## Statut

Phase **3 — Site public** en cours : accueil (P3.1), catalogue avec recherche, filtres et pagination (P3.2/P3.4) et fiche détaillée avec galerie (P3.3) livrés. Restent les pages éditoriales, le formulaire de contact, les pages légales et le SEO de la phase.

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
npm run db:seed    # catégories de base + compte admin
npm run db:seed:demo  # catalogue de démonstration (développement uniquement)
```

`npm run db:seed:demo` ajoute 12 prestations d'exemple publiées pour vérifier le site public. Ne jamais l'exécuter sur la base de production : le catalogue réel est saisi par Patricia depuis le dashboard (Phase 4).

Les hooks `pre-commit` (lint-staged + `tsc --noEmit`) et `pre-push` (`npm run ci`) sont installés automatiquement par `npm install` (script `prepare` → husky). CI/CD : locale via `npm run ci`, déploiement Vercel au push sur `main`.

## Règles du projet

- Aucun secret réel dans le dépôt : seul `.env.example` est versionné.
- Validation serveur systématique (Zod) sur toutes les entrées.
- Règles de compatibilité vérifiées côté serveur uniquement.
- Instantanés de prix/durée sur chaque réservation.
- Dates stockées en UTC, affichées à l'heure de l'appareil connecté.
- Conventional Commits sur toutes les branches.
