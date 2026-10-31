# Contribuer

Le code est **propriétaire** (voir [LICENSE](LICENSE)) et publié pour référence. Aucune contribution externe n'est attendue ; les propositions sont examinées au cas par cas par le mainteneur, qui reste libre de les refuser.

En proposant une modification, vous acceptez qu'elle soit intégrée sous la même licence propriétaire, sans droit de votre part sur le code résultant.

## Avant d'ouvrir une PR

1. Ouvrir d'abord une issue décrivant le besoin (sans donnée personnelle ni secret).
2. Brancher depuis `main` : `feat/<sujet>`, `fix/<sujet>`, `docs/<sujet>`. Jamais de commit direct sur `main`.
3. Messages en Conventional Commits (`feat(scope): ...`).
4. Lancer `npm run ci` (typecheck, format, lint, tests, build), serveur de développement arrêté.
5. Ne jamais committer de secret, de photo ou de donnée de cliente.

Vulnérabilités : ne pas ouvrir d'issue, voir [SECURITY.md](SECURITY.md).
