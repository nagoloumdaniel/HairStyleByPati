---
paths:
  - 'src/app/api/**'
  - 'src/server/**'
  - 'src/lib/**'
  - 'prisma/**'
---

# Backend / API

- Valider entrées avec zod, erreurs typées, jamais confiance au seul frontend.
- Prisma via dépôts/services, requêtes minimales, anti double-réservation (transactions).
- Lire skills `test-driven-development` (logique métier), `security-audit` (routes sensibles).
- Secrets uniquement via variables d'environnement, documentés dans `.env.example` (valeurs fictives).
