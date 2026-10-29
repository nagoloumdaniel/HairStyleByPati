# Politique de sécurité

## Signaler une vulnérabilité

Ne créez **pas** d'issue publique contenant des détails exploitables.

1. **Signalement privé (recommandé)** : onglet **Security → Report a vulnerability** du dépôt GitHub.
2. Si cette option n'est pas disponible, ouvrez une issue **non sensible** demandant un canal de contact privé, sans détail technique ni donnée personnelle ; le mainteneur répondra pour organiser l'échange.

Merci d'inclure les étapes de reproduction et l'impact estimé.
Réponse visée : accusé de réception sous 72 h, correctif ou plan sous 14 jours.

## Périmètre

Application web (Next.js), API et back-office. Hors périmètre : déni de service,
ingénierie sociale, tests sur la base de production.

Mesures en place : voir [docs/security.md](docs/security.md).
