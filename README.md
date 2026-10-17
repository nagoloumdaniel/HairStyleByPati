# Hairstyle by Patricia

Application web de réservation en ligne pour un salon de coiffure spécialisé (tresses, vanilles, locs, départ de locs, protectrices, coupes). Site public vitrine + catalogue, moteur de compatibilité capillaire configurable, réservation en ligne, messagerie et back-office d'administration.

## Statut

Phase **0 — Préparation & governance** en cours. Aucune fonctionnalité applicative livrée pour l'instant (le scaffold Next.js arrive en Phase 1).

## Stack (figée — voir [docs/stack.md](docs/stack.md))

| Couche | Choix |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript strict |
| UI | **Tailwind CSS v4** + composants personnalisés (shadcn/ui) |
| Base de données | PostgreSQL (Neon) + Prisma |
| E-mails | Resend |
| Fichiers | Cloudflare R2 (API S3) |
| Auth | Auth.js (NextAuth) credentials + Argon2 |
| Hébergement | Vercel |

## Documentation

| Document | Contenu |
|---|---|
| [Cahier de charge.md](<Cahier de charge.md>) | Spécification client v1.0 (20 sections) |
| [ROADMAP.md](ROADMAP.md) | 13 phases, 122 mini-tâches |
| [docs/acceptation.md](docs/acceptation.md) | Critères d'acceptation §17 + couverture |
| [docs/plan-detaille.md](docs/plan-detaille.md) | Décomposition par module (§14.2) |
| [docs/stack.md](docs/stack.md) | Choix techniques et justification |
| [docs/architecture.md](docs/architecture.md) | Arborescence par domaine + plan de pages |
| [docs/git.md](docs/git.md) | Branches, conventions de commit, hooks |
| [.env.example](.env.example) | Variables d'environnement documentées |

## Développement

```bash
npm install
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (Phase 1)
npm run dev         # serveur de développement (Phase 1)
```

Les hooks `pre-commit` (lint-staged + `tsc --noEmit`) sont installés automatiquement par `npm install` (script `prepare` → husky).

## Règles du projet

- Aucun secret réel dans le dépôt : seul `.env.example` est versionné.
- Validation serveur systématique (Zod) sur toutes les entrées.
- Règles de compatibilité vérifiées côté serveur uniquement.
- Instantanés de prix/durée sur chaque réservation.
- Fuseau horaire du salon explicite (`SALON_TIMEZONE`), stockage UTC.
- Conventional Commits sur toutes les branches.
