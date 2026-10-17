---
paths:
  - '**/*.test.*'
  - '**/*.spec.*'
  - '**/__tests__/**'
  - 'vitest.config.*'
  - 'playwright*'
---

# Tests

- Nommage: "should [comportement] when [condition]". Mocker externes, pas internes.
- Logique métier: TDD rouge-vert-refactor (skill `test-driven-development`).
- E2E navigateur: skill `webapp-testing` (Playwright).
- Avant tout claim "terminé": skill `verification-before-completion` (preuves fraîches).
