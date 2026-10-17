# Migration Claude Code vers Cline, HairStyleByPati (17/10/2026)

## A. Inventaire initial
- Agent cible: Cline (saoudrizwan.claude-dev) v4.1.25, VS Code Windows. Langue FR.
- Source Claude: `C:\Users\Landh\.claude\skills\` = 252 skills. `settings.json` (hooks rtk, plugin mobbin). `.claude.json` = config projets, `mcpServers: {}` partout (aucun MCP configuré).
- Projet: Next.js 15 / React 19 / Tailwind v4 / Prisma / PostgreSQL. CI `.github/workflows/ci.yml` (typecheck, prettier, lint, vitest, build). Roadmap 13 phases, 122 tâches, skill `caveman` + `verification-before-completion` obligatoires.
- Originaux: jamais modifiés, uniquement copiés.

## B. Skills migrés (30, projet `.cline/skills/`)
Tous compatibles (frontmatter `name` + `description` OK, format identique Claude/Cline).
Correspondance `superpowers:<x>` citée par roadmap/CLAUDE = dossier local `<x>`.

| Origine | Destination | Statut |
|---|---|---|
| caveman | .cline/skills/caveman | compatible, copie intégrale |
| caveman-commit | .cline/skills/caveman-commit | compatible |
| verification-before-completion | .cline/skills/verification-before-completion | compatible |
| verify-and-stop | .cline/skills/verify-and-stop | compatible |
| writing-plans | .cline/skills/writing-plans | compatible, noter: chemin plans `docs/superpowers/plans/` à adapter vers `docs/plans/` |
| executing-plans | .cline/skills/executing-plans | compatible |
| test-driven-development | .cline/skills/test-driven-development | compatible |
| systematic-debugging | .cline/skills/systematic-debugging | compatible |
| investigate-first | .cline/skills/investigate-first | compatible |
| safe-refactor | .cline/skills/safe-refactor | compatible |
| webapp-testing | .cline/skills/webapp-testing | adaptable, requiert Playwright (non installé, voir §G) |
| security-audit | .cline/skills/security-audit | compatible |
| frontend-design | .cline/skills/frontend-design | compatible |
| web-design-guidelines | .cline/skills/web-design-guidelines | compatible |
| vercel-react-best-practices (dossier origine `react-best-practices`) | .cline/skills/vercel-react-best-practices | compatible, RENOMMÉ pour aligner `name:` du frontmatter |
| site-architecture | .cline/skills/site-architecture | compatible |
| pick-ui-library | .cline/skills/pick-ui-library | compatible |
| lean-build | .cline/skills/lean-build | compatible |
| unlazy | .cline/skills/unlazy | compatible |
| brand-guidelines | .cline/skills/brand-guidelines | compatible (Anthropic brand, usage éditorial uniquement) |
| using-git-worktrees | .cline/skills/using-git-worktrees | compatible |
| finishing-a-development-branch | .cline/skills/finishing-a-development-branch | compatible |
| changelog-generator | .cline/skills/changelog-generator | compatible |
| dispatching-parallel-agents | .cline/skills/dispatching-parallel-agents | adaptable, Cline = 1 agent + editation background, pas de sous-agents parallèles natifs |
| subagent-driven-development | .cline/skills/subagent-driven-development | adaptable, même limite (exécuter séquentiel) |
| using-superpowers | .cline/skills/using-superpowers | adaptable, préfixe `superpowers:` sans effet sous Cline |
| mcp-builder | .cline/skills/mcp-builder | compatible (création serveurs MCP Python/TS) |
| requesting-code-review | .cline/skills/requesting-code-review | compatible |
| receiving-code-review | .cline/skills/receiving-code-review | compatible |
| seo-audit | .cline/skills/seo-audit | compatible |

222 skills restants (trading, video/remotion, marketing, mobile, swift...): hors périmètre salon, non copiés, restent disponibles en source. Inventaire complet: `.claude/skills-catalog.md`.

## C. Instructions adaptées
- `.clinerules/00-global.md`: méthode analyse/plan/vérif/sécu/git, langue FR, interdiction tiret cadratin.
- `.clinerules/10-frontend.md` (paths `src/components/**`, `src/app/**`...).
- `.clinerules/20-backend.md` (paths `src/app/api/**`, `prisma/**`...).
- `.clinerules/30-testing.md` (paths tests...).
- Hiérarchie: global > conditionnel > skill > consigne ponctuelle. Pas de conflit détecté.

## D. MCP
- Source: aucun serveur (`mcpServers: {}` global + projets, `cline_mcp_settings.json` = `{}`).
- Donc rien à migrer. Skill `mcp-builder` disponible pour créations futures.
- Activation MCP Cline: demander intervention (dépendances + secrets).

## E. Tests
Voir validation ci-dessous (typecheck/lint/test/build réellement exécutés).

## F. Sécurité et sauvegardes
- Aucun secret affiché ni copié. `.env.example` valeurs fictives uniquement.
- Originaux intacts (copie seule). Restauration: supprimer `.cline/skills/`, `.clinerules/`, `docs/migration/`.

## G. Actions manuelles restantes
1. Cline > panneau Rules/Skills > vérifier 30 skills détectés + activer `Enable Skills` si toggle présent.
2. Si E2E voulu: `npm i -D @playwright/test` + `npx playwright install` (skill `webapp-testing`).
3. MCP futurs: me fournir commande + variables, je prépare config sans secrets en clair.

## H. Limitations
- Pas d'équivalence parfaite Claude Code: hooks `rtk`, slash-commands `/caveman`, worktrees auto et fan-out parallèle restent manuels/séquentiels sous Cline.
- 222 skills non migrés (hors sujet), archivés en source.

## I. Recommandations (impact / coût / difficulté)
1. Activer skills + rules panel (fort/faible/facile).
2. Playwright E2E parcours visiteur/admin (fort/moyen/moyen).
3. Skill complémentaire `revue-code` locale si besoin (moyen/faible/facile).
