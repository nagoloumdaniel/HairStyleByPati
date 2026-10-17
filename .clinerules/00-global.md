# Règles Cline, HairStyleByPati (Next.js 15 / React 19 / Tailwind v4 / Prisma / PostgreSQL)

Langue: répondre en français. Ne jamais utiliser le tiret cadratin "—", utiliser virgule, deux-points ou tiret simple.

1. Analyse: lire code et contraintes avant toute modification. Explorer `src/`, `prisma/`, `docs/`.
2. Planification: tâches complexes = plan étapes + critères d'acceptation avant code.
3. Implémentation: TypeScript strict, composants modulaires, réutiliser existant, pas de doublon.
4. Vérification: preuve avant affirmation. Commandes: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. Ne jamais déclarer succès sans sortie observée.
5. Sécurité: pas de secret en clair, valider entrées (zod), auth côté serveur, `.env.*` jamais commité sauf `.env.example`.
6. Git: branche active `phase/2-design-system`, commits atomiques, ne jamais écraser travail existant.
7. Skills projet: `.cline/skills/<nom>/SKILL.md` (30 skills migrés depuis Claude). Lire le SKILL.md pertinent avant tâche concernée. Correspondance `superpowers:<x>` = `.cline/skills/<x>/`.
8. UI: design system existant, responsive mobile/tablette/desktop, a11y, pas d'animations excessives.
