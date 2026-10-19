# Hairstyle by Patricia

Application web de réservation en ligne pour un salon de coiffure spécialisé (tresses, vanilles, locs, départ de locs, protectrices, coupes). Site public vitrine + catalogue, moteur de compatibilité capillaire configurable, réservation en ligne, messagerie et back-office d'administration.

## Statut

Phase **9, sécurité, RGPD et fiabilité**, terminée le 19/10/2026 : limitation des tentatives de connexion, cookie de session explicite, en-têtes de sécurité et CSP en production, protection des API admin, export et anonymisation RGPD, purge automatique des photos privées, sonde de santé, scripts de sauvegarde et de restauration testés. Vérifiée par 179 tests Vitest et 7 parcours Playwright de sécurité dédiés.

Le thème **clair / sombre** est disponible sur toutes les interfaces via l'icône du header. La préférence système est détectée au chargement, le choix est mémorisé dans le navigateur et appliqué avant le premier rendu pour éviter tout flash. Vérifié par 4 parcours Playwright desktop et mobile.

Prochaine étape : phase **10, performance, accessibilité et SEO**. Le seed crée des disponibilités par défaut du lundi au samedi, 9h-18h.

### Notifications en local

Avec `EMAIL_MODE="console"` dans `.env.local`, aucun e-mail réel n'est envoyé : les envois sont simulés et tracés. Les routes cron sont protégées par `CRON_SECRET` et définies dans `vercel.json` (`/api/cron/notifications` toutes les 10 minutes, `/api/cron/reminders` toutes les heures). Exemple local :

```bash
curl -H "Authorization: Bearer ${CRON_SECRET}" http://localhost:3000/api/cron/reminders
```

## Stack (figée — voir [docs/stack.md](docs/stack.md))

| Couche          | Choix                                                      |
| --------------- | ---------------------------------------------------------- |
| Framework       | Next.js 15 (App Router) + React 19 + TypeScript strict     |
| UI              | **Tailwind CSS v4** + composants personnalisés (shadcn/ui) |
| Base de données | PostgreSQL (Neon) + Prisma                                 |
| E-mails         | Resend                                                     |
| Fichiers        | Cloudflare R2 (API S3)                                     |
| Auth            | Auth.js (NextAuth) credentials + bcryptjs (coût 12)        |
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
| [docs/security.md](docs/security.md)           | Revue sécurité, risques, sauvegarde      |
| [docs/rgpd.md](docs/rgpd.md)                   | Registre, droits et procédures RGPD      |
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
npx playwright test tests/e2e/security.spec.ts --project=desktop --workers=1  # sécurité, en-têtes, RGPD, purge
node scripts/backup-db.mjs   # sauvegarde PostgreSQL dans backups/ (ignoré par Git)
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
