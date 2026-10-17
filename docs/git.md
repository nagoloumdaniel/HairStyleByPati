# Git, branches et conventions — P0.7

## Branches

| Branche           | Rôle                                                                  |
| ----------------- | --------------------------------------------------------------------- |
| `main`            | état stable, toujours vert ; merge final de chaque phase              |
| `phase/<n>-<nom>` | une branche par phase (`phase/0-fondations`, `phase/1-fondations`, …) |
| `fix/<sujet>`     | correctif ponctuel hors phase                                         |

Workflow : travailler sur `phase/*` → commits atomiques → vérification → merge dans `main` → **push `main`** (règle projet) → suppression de la branche.
PR = phase (revue de code P11.4).

## Conventional Commits

```
<type>(<scope>) : <imperatif, ≤ 72 car.>

corps optionnel : le POURQUOI, wrap 72 car., puces `-`
```

Types : `feat` `fix` `refactor` `perf` `docs` `test` `chore` `build` `ci` `style` `revert`.

Scopes projet : `catalogue` `compatibilite` `disponibilites` `reservations` `clients` `demandes` `messagerie` `notifications` `fichiers` `auth` `parametres` `stats` `ui` `db` `ci` `env` `stack` `plan` `architecture` `acceptance` `git`.

Exemples :

```
feat(reservations): add slot exclusivity transaction
docs(stack): fix technical stack decisions
ci: add lint typecheck and build workflow
```

Pas d'emoji, pas d'attribution IA, pas de « now/currently » dans le corps.

## Hooks pre-commit (installés par `npm install`)

1. `lint-staged` → Prettier sur les fichiers stagés.
2. `tsc --noEmit` → typecheck strict complet.

Le commit est rejeté si l'un échoue. Contournement d'urgence uniquement : `git commit --no-verify` (à justifier).

## Règles de push

- Toujours pusher `main` après une tâche/phase vérifiée.
- Jamais de secret dans un commit (`.env` ignoré, seul `.env.example` est versionné).
- Ne pas forcer (`--force`) sur `main`.
- Respecter le quota GitHub : workflows CI regroupés, pas de runs redondants.

## Vérification obligatoire avant chaque commit (skill `verification-before-completion`)

```bash
npm run typecheck     # doit sortir sans erreur
npm run format:check  # formatage propre
git status --short    # rien d'oublié, rien d'indésiré
```

Preuve = sortie affichée, jamais « ça devrait passer ».
