# ROADMAP COMPLÈTE — Hairstyle by Patricia

**Source :** `Cahier de charge.md` v1.0 (18 sections, 1252 lignes)
**Méthode :** exécution de A à Z, mini-tâches ordonnées, chaque tâche affectée à 1 skill obligatoire.
**Catalogue skills :** `.claude/skills-catalog.md` (245 skills installés, extraits de `C:\Users\Landh\.claude\skills\`).

---

## RÈGLES D'EXÉCUTION (valables pour TOUTES les tâches)

1. **Skill `caveman` obligatoire sur 100 % des tâches** (niveau **full**) — économise les tokens sur chaque réponse d'exécution. Invoquer le skill avant de démarrer la tâche, persister jusqu'à la fin.
2. **Skill `verification-before-completion` obligatoire à la fin de chaque tâche** — ne jamais déclarer une tâche terminée sans exécuter la commande de vérification et montrer la sortie (build, test, lint, capture navigateur).
3. **Skill `test-driven-development`** sur toute tâche de logique métier (règles, moteurs, API) : test d'abord, implémentation ensuite.
4. **Workflow git :** une branche par phase (`phase/0-fondations`, etc.), commits atomiques, PR = phase. Skills `using-git-worktrees` (isolation), `finishing-a-development-branch` (merge), `changelog-generator` (versions).
5. **Stack imposée par le cahier des charges §14 :** Next.js (App Router) + TypeScript strict, Tailwind CSS + composants personnalisés (shadcn/ui via `pick-ui-library`), PostgreSQL, Prisma, stockage objet S3, e-mails Resend/Brevo.
6. **Avant chaque tâche :** charger le skill affecté en lisant `C:\Users\Landh\.claude\skills\<nom>\SKILL.md`, puis exécuter en mode caveman.
7. **Déblocage :** si un bug dépasse 3 tentatives → skill `systematic-debugging`. Refactors → `safe-refactor`. Travail parallélisable (pages indépendantes) → `dispatching-parallel-agents`.

### Légende des skills critiques
| Skill | Rôle |
|---|---|
| `caveman` | Réponses ultra-terse, tokens réduits, précision technique conservée |
| `writing-plans` / `executing-plans` | Planification puis exécution ordonnée |
| `test-driven-development` | Test rouge → vert → refactor |
| `webapp-testing` | Tests navigateur Playwright + captures |
| `security-audit` | Audit OWASP, RGPD, secrets, uploads |
| `frontend-design` / `web-design-guidelines` | UI élégante conforme guidelines + a11y |
| `verify-and-stop` | Preuve d'acceptation sans dérive de périmètre |

---

## PHASE 0 — PRÉPARATION & GOUVERNANCE

> Objectif : socle projet, décisions structurantes, zéro code fonctionnel.

- [x] **P0.1** Init repo Git, `.gitignore` Next.js, README initial, premier commit. — *skill : caveman + verification-before-completion*
- [x] **P0.2** Figer le cahier des charges : extraire la liste complète des critères d'acceptation §17 dans `docs/acceptation.md`. — *skill : writing-plans*
- [x] **P0.3** Rédiger `docs/plan-detaille.md` décomposant chaque fonctionnalité en modules (§14.2) avec interfaces et données. — *skill : writing-plans + executing-plans*
- [x] **P0.4** Décision stack précise : Next.js 15 / React 19 / Tailwind v4 / Prisma / PostgreSQL (Neon ou équivalent) / Resend / S3 (Cloudflare R2 ou équivalent). Documenter le « pourquoi » dans `docs/stack.md`. — *skill : lean-build + pick-ui-library*
- [x] **P0.5** Arborescence modulaire par domaine (catalogue, compatibilite, disponibilites, reservations, clients, demandes, messagerie, notifications, fichiers, auth, parametres, stats). — *skill : site-architecture*
- [x] **P0.6** Créer `.env.example` documenté (toutes variables : DB, S3, e-mail, secrets de signature). Aucun secret réel dans le repo. — *skill : caveman*
- [x] **P0.7** Branch strategy + conventions de commit (conventional commits). Hooks pre-commit : lint-staged + tsc --noEmit. — *skill : caveman-commit*
- [x] **P0.8** Isolation de l'espace de travail initial. — *skill : using-git-worktrees*
- [x] **P0.9** Validation cahier des charges §17 vs plan : checklist couverture 100 %. — *skill : verify-and-stop*

## PHASE 1 — FONDATIONS TECHNIQUES

> Objectif : app qui compile, DB modélisée, auth admin verrouillée.

- [x] **P1.1** Scaffold Next.js App Router + TypeScript strict + ESLint + Prettier. Build vert. — *skill : caveman + verification-before-completion*
- [x] **P1.2** Tailwind configuré avec les tokens du §2.2 : `#F4C542` (accent), `#191919` (texte), `#FFF8E9` (crème), `#76513D` (cacao), `#FFFFFF`, `#C94B4B` (alerte). Vérifier contraste texte/boutons jaunes. — *skill : frontend-design*
- [x] **P1.3** Polices Playfair Display (titres) + Manrope (textes/UI) chargées optimisément (next/font, poids limités). — *skill : frontend-design*
- [x] **P1.4** Schéma Prisma complet des entités §14.3 : User, Service, ServiceImage, Category, AvailabilityRule, BlockedPeriod, Customer, Appointment, CustomRequest, HairAssessment, Conversation, Message, Notification, AuditLog + tables règles compatibilité et options. Instantanés de prix/durée sur Appointment. — *skill : migration*
- [x] **P1.5** Stratégie dates (stockage UTC + heure de l'appareil connecté, aucun fuseau configurable). — *skill : test-driven-development*
- [x] **P1.6** Migrations + seed (catégories de base : Tresses, Vanilles, Locs, Départ de locs, Protectrices, Coupes + settings salon). — *skill : caveman*
- [x] **P1.7** Auth administrateur (Auth.js/NextAuth credentials, Argon2 ou bcrypt, session sécurisée). — *skill : security-audit*
- [x] **P1.8** Middleware + garde serveur sur toutes les routes `/dashboard/*` et server actions d'administration. Test : visiteur non authentifié redirigé. — *skill : security-audit + test-driven-development*
- [x] **P1.9** Schéma server actions / route handlers : validation Zod sur TOUTES les entrées, gestion centralisée des erreurs, typage strict. — *skill : react-best-practices*
- [x] **P1.10** Journalisation de base (AuditLog + logs serveur). — *skill : caveman*
- [x] **P1.11** CI : lint + typecheck + tests + build à chaque push. — *skill : verification-before-completion*

## PHASE 2 — DESIGN SYSTEM & IDENTITÉ VISUELLE

> Objectif : direction artistique élégante/chaleureuse (§2), composants réutilisables, mobile-first.

- [x] **P2.1** Moodboard et direction artistique validée (premium, féminin, chaleureux, photos mises en avant — pas un template générique). — *skill : brainstorming + design-taste-frontend*
- [x] **P2.2** Design tokens étendus : espacements, rayons (angles légèrement arrondis), ombres, échelle typo, états (chargement/succès/erreur/invalide). — *skill : frontend-design*
- [x] **P2.3** Bibliothèque composants de base : Button (primaire jaune doré avec contraste garanti), Input, Textarea, Select, Card, Badge (statuts), Modal, Tabs, Accordion. — *skill : pick-ui-library*
- [x] **P2.4** Composants feedback : toasts (statuts réservation, erreurs formulaires). — *skill : ask-sonner*
- [x] **P2.5** Layout public : header logo + navigation, footer coordonnées/réseaux, responsive mobile-first. — *skill : frontend-design*
- [x] **P2.6** Layout dashboard : sidebar navigation (§3.2), identité visuelle cohérente mais distincte du public. — *skill : frontend-design*
- [x] **P2.7** États transverses : squelettes de chargement, états vides, messages d'erreur compréhensibles, formulaires qui conservent la saisie après échec de validation. — *skill : web-design-guidelines*
- [x] **P2.8** Animations discrètes et fluides (apparitions sections, transitions pages). — *skill : animate*
- [x] **P2.9** Accessibilité fondation : navigation clavier, focus visibles, ARIA, contrastes AA, statuts texte + couleur. — *skill : web-design-guidelines*
- [x] **P2.10** Revue design du système complet avant assemblage. — *skill : high-end-visual-design + web-design-guidelines*

## PHASE 3 — SITE PUBLIC

> Objectif : vitrine qui convertit, conforme §4.

- [x] **P3.1** Page d'accueil : hero photo coiffure, accroche, 2 boutons (Réserver / Découvrir), coiffures populaires, prestations, étapes de réservation, présentation Patricia, témoignages, coordonnées. — *skill : frontend-design*
- [ ] **P3.2** Catalogue : cartes (photo, nom, prix/départ, description, durée, catégories, boutons Voir détails / Réserver), recherche + filtres par catégories dynamiques. — *skill : frontend-design + react-best-practices*
- [ ] **P3.3** Fiche détaillée : galerie multi-photos navigable sans quitter la page, prix/fourchette, durée, longueurs acceptées, compatibilités, restrictions, options, infos avant RDV. — *skill : frontend-design*
- [ ] **P3.4** Pagination / chargement progressif catalogue. — *skill : react-best-practices*
- [ ] **P3.5** Pages éditoriales : présentation salon, FAQ, informations pratiques, politique d'annulation. — *skill : frontend-design*
- [ ] **P3.6** Formulaire de contact : anti-spam (honeypot + rate limit), enregistrement Conversation côté serveur. — *skill : security-audit*
- [ ] **P3.7** Pages légales + politique de confidentialité RGPD (§15.3 : conservation, droits, contact, cookies). — *skill : security-audit*
- [ ] **P3.8** SEO technique : metadata, Open Graph, sitemap, robots.txt, données structurées LocalBusiness (coiffeur). — *skill : seo-audit*
- [ ] **P3.9** Tests navigateur des pages publiques sur mobile/tablette/desktop. — *skill : webapp-testing*

## PHASE 4 — BACK-OFFICE CATALOGUE

> Objectif : Patricia autonome sur 100 % du catalogue (§6.4, §12.2).

- [ ] **P4.1** Page catalogue dashboard : liste, statuts, recherche. — *skill : frontend-design*
- [ ] **P4.2** CRUD catégories (créer, modifier, désactiver, réordonner). — *skill : test-driven-development*
- [ ] **P4.3** CRUD coiffures : nom, description, catégorie, prix fixe / prix de départ / fourchette / « Prix à confirmer », durée, options payantes, statut actif/inactif. — *skill : test-driven-development*
- [ ] **P4.4** Upload photos : formats/taille limités côté serveur, MIME vérifié, noms de fichiers non prévisibles, stockage S3, URLs signées pour accès privé. — *skill : security-audit*
- [ ] **P4.5** Gestion galerie : réordonnancement, image principale, textes alternatifs. — *skill : frontend-design*
- [ ] **P4.6** Publication / dépublication / archivage (jamais de suppression d'une coiffure ayant des réservations historiques). — *skill : test-driven-development*
- [ ] **P4.7** Éditeur de règles de compatibilité par prestation (longueurs acceptées/non, locs requis, photo facultative/obligatoire, validation auto ou manuelle, messages par situation). — *skill : frontend-design*
- [ ] **P4.8** Éditeur de questions capillaires par prestation (conditionnelles, ordre, types de réponses). — *skill : frontend-design*
- [ ] **P4.9** Journalisation des actions catalogue dans l'historique. — *skill : caveman*
- [ ] **P4.10** Tests de non-régression catalogue + scénarios §17 Catalogue. — *skill : webapp-testing + verify-and-stop*

## PHASE 5 — MOTEUR DE COMPATIBILITÉ CAPILLAIRE

> Objectif : cœur intelligent du projet (§5), 100 % vérifié côté serveur.

- [ ] **P5.1** Modèle de données des règles : CompatibilityRule, QuestionDefinition, AssessmentStatus (reçue, en cours, infos demandées, acceptée, refusée, réservation en attente, confirmée). — *skill : writing-plans*
- [ ] **P5.2** Moteur d'évaluation pur et testable : entrée (réponses client + règles prestation) → compatible / incompatible / incertain + message configuré. — *skill : test-driven-development*
- [ ] **P5.3** Parcours questions conditionnelles côté client (aucun champ inutile affiché ; longueur, locs, état, type, repousse, coupe courte, infos complémentaires). — *skill : react-best-practices*
- [ ] **P5.4** Cas « Je ne suis pas sûr(e) » : proposition photo + commentaire, statut « En attente d'évaluation ». — *skill : frontend-design*
- [ ] **P5.5** Upload photo d'évaluation : stockage privé, jamais publié dans la galerie publique, accès restreint. — *skill : security-audit*
- [ ] **P5.6** Espace dashboard évaluations : file d'attente, visualisation photo, décisions (accepter, refuser, demander infos, proposer autre coiffure, autoriser sous conditions) + message client + historique. — *skill : frontend-design*
- [ ] **P5.7** Règle d'or : l'acceptation d'une évaluation ne crée JAMAIS de réservation sans re-vérification de disponibilité. — *skill : test-driven-development*
- [ ] **P5.8** Re-vérification des règles au moment final de la réservation (côté serveur, jamais seulement à l'affichage). — *skill : security-audit*
- [ ] **P5.9** Tests des scénarios §5.3 (tresses incompatibles cheveux courts), §5.4, §5.5. — *skill : verify-and-stop*

## PHASE 6 — RÉSERVATION, DISPONIBILITÉS, CALENDRIER

> Objectif : zéro double réservation (§7, §8, §9).

- [ ] **P6.1** Moteur de disponibilités : horaires configurés + durées prestations/options + pauses + fermetures + congés + indisponibilités exceptionnelles + créneaux spécifiques. — *skill : test-driven-development*
- [ ] **P6.2** Protection anti double-réservation : transaction DB + contrainte d'exclusivité sur créneau, vérification au moment de l'enregistrement définitif. Test concurrence : 2 clients, même créneau, 1 seule réussite. — *skill : test-driven-development + security-audit*
- [ ] **P6.3** Parcours de réservation 8 étapes (choix coiffure → infos capillaires → vérification → options → créneau → coordonnées → récapitulatif « Paiement sur place » → confirmation), chaque étape avec états d'attente/succès/erreur. — *skill : frontend-design*
- [ ] **P6.4** Validation manuelle : statut « En attente de confirmation », créneau réservé temporairement avec durée max configurable et libération automatique. — *skill : test-driven-development*
- [ ] **P6.5** Machine à statuts complète (en attente, confirmée, reprogrammée, annulée client, annulée admin, terminée, absent) avec transitions contrôlées côté serveur. — *skill : test-driven-development*
- [ ] **P6.6** Annulation par Patricia : motif, libération créneau, notification client, enregistrement historique. — *skill : frontend-design*
- [ ] **P6.7** Annulation par client via lien sécurisé signé à durée limitée ; conditions configurables (délai minimal, motif obligatoire, message hors délai). — *skill : security-audit*
- [ ] **P6.8** Reprogrammation atomique : ancien créneau libéré seulement si nouveau valide, aucun doublon ni perte en cas d'échec. — *skill : test-driven-development*
- [ ] **P6.9** Calendrier dashboard : vues jour/semaine/mois/liste, couleur par statut + libellé, fiche RDV cliquable (détails, statut, annuler, reprogrammer). — *skill : frontend-design*
- [ ] **P6.10** Gestion des disponibilités dashboard : horaires habituels, exceptions, blocages ; alerte si modification impacte des RDV confirmés (action explicite exigée). — *skill : frontend-design + test-driven-development*
- [ ] **P6.11** Instantanés tarif/durée figés sur chaque réservation (modification catalogue n'altère pas l'historique). — *skill : test-driven-development*
- [ ] **P6.12** Tests scénarios §17 Réservation + Annulation complets. — *skill : webapp-testing + verify-and-stop*

## PHASE 7 — NOTIFICATIONS & MESSAGERIE

> Objectif : fiables, idempotentes, découplées (§10).

- [ ] **P7.1** Service d'e-mail transactionnel (Resend/Brevo) avec abstraction fournisseur. — *skill : caveman*
- [ ] **P7.2** File d'attente d'envoi + reprise sur échec ; l'envoi e-mail ne bloque et ne conditionne jamais l'enregistrement d'une réservation. — *skill : test-driven-development*
- [ ] **P7.3** Modèles d'e-mail pour tous les événements §10.1 (réservation, attente, confirmation, évaluation, photo reçue, personnalisée, annulations, reprogrammation, infos, acceptation/refus, rappel), personnalisables. — *skill : caveman*
- [ ] **P7.4** Idempotence des notifications (jamais de doublon même si relance technique). — *skill : test-driven-development*
- [ ] **P7.5** Notifications Patricia : e-mail + notification dashboard avec lien direct vers la fiche concernée. — *skill : frontend-design*
- [ ] **P7.6** Messagerie dashboard : boîte de réception (contact, renseignements, commentaires RDV, personnalisées, compatibilité), statuts (nouveau, en cours, attente réponse, traité, archivé), réponse e-mail, notes internes invisibles côté client. — *skill : frontend-design + test-driven-development*
- [ ] **P7.7** Rappels automatiques H-24 (délai configurable), uniquement RDV valides, anti-doublon. — *skill : test-driven-development*
- [ ] **P7.8** Visibilité des échecs d'envoi dans le dashboard + journaux. — *skill : caveman*
- [ ] **P7.9** Tests scénarios §17 Messagerie et notifications. — *skill : verify-and-stop*

## PHASE 8 — DEMANDES PERSONNALISÉES & FONCTIONNALITÉS SUPPLÉMENTAIRES

> Objectif : §11 et §13.

- [ ] **P8.1** Formulaire demande de coiffure personnalisée (coordonnées, description, photos de référence, infos capillaires, date souhaitée, commentaire) avec accusé de réception client. — *skill : frontend-design*
- [ ] **P8.2** Traitement dashboard : accepter, refuser, demander précisions, proposer prestation existante, prix estimatif, proposer créneau + historique complet des décisions. — *skill : frontend-design + test-driven-development*
- [ ] **P8.3** Clients : fiche client avec historique réservations et coordonnées, accès restreint. — *skill : frontend-design*
- [ ] **P8.4** Paramètres du salon : identité, logo, e-mail, téléphone, adresse, horaires, règles annulation, délais réservation/rappel, modèles e-mail, confidentialité. — *skill : frontend-design*
- [ ] **P8.5** Tableau de bord principal : RDV du jour, prochains, en attente, nouvelles demandes, évaluations photo, messages non lus, annulations récentes, indisponibilités, indicateurs — actualisation post-action. — *skill : frontend-design*
- [ ] **P8.6** Statistiques : réservations, annulations, terminées, prestations populaires, taux de remplissage, demandes personnalisées, revenus estimés (définitions claires documentées). — *skill : analytics*
- [ ] **P8.7** Gestion des absences (no-show) + impact statistique sans bannissement automatique. — *skill : test-driven-development*
- [ ] **P8.8** Liste d'attente : alerte si créneau libéré, confirmation client obligatoire + re-vérification à la réservation. — *skill : writing-plans*
- [ ] **P8.9** Suggestions de coiffures compatibles (jamais contournement d'une restriction). — *skill : test-driven-development*
- [ ] **P8.10** Avis clients : e-mail post-RDV, modération, affichage uniquement avis vérifiés. — *skill : frontend-design*
- [ ] **P8.11** Galerie de réalisations publique (photo → catégorie/préstation, autorisations clients). — *skill : frontend-design*
- [ ] **P8.12** Promotions : offres temporaires, conditions, dates de validité. — *skill : frontend-design*

## PHASE 9 — SÉCURITÉ APPROFONDIE, RGPD, FIABILITÉ

> Objectif : §15 intégralement, avant mise en ligne. Non négociable.

- [ ] **P9.1** Audit sécurité complet du code (auth, sessions, autorisations sur CHAQUE opération sensible, validation serveur). — *skill : security-audit*
- [ ] **P9.2** Checklist OWASP : injection SQL (requêtes Prisma paramétrées), XSS (échappement, CSP), CSRF (tokens), upload malveillant (noms non prévisibles, MIME + contenu vérifié, isolation stockage), déni de service. — *skill : security-audit*
- [ ] **P9.3** Rate limiting sur formulaires publics, login, annulation par lien. Protection anti-abus récupération de compte. — *skill : security-audit*
- [ ] **P9.4** En-têtes sécurité : CSP, HSTS, X-Frame-Options, Referrer-Policy. Cookies httpOnly/secure/sameSite. — *skill : security-audit*
- [ ] **P9.5** Secrets : uniquement côté serveur, rotation documentée, aucun secret en clair ni dans le repo ni dans les logs. — *skill : security-audit*
- [ ] **P9.6** RGPD opérationnel : politique confidentialité publiée, durée de conservation paramétrable, procédure suppression/rectification, registre des traitements, minimisation des données capillaires, contrats prestataires (DPA). — *skill : security-audit*
- [ ] **P9.7** Politique de conservation/suppression des photos d'évaluation (délai paramétrable, purge automatique). — *skill : test-driven-development*
- [ ] **P9.8** Sauvegardes DB automatiques + procédure de restauration TESTÉE en réel. — *skill : caveman + verification-before-completion*
- [ ] **P9.9** Mise à jour + audit des dépendances (npm audit), verrouillage versions. — *skill : caveman*
- [ ] **P9.10** Surveillance erreurs applicatives + gestion dégradation mode (e-mails en échec visibles, jamais blocant les réservations). — *skill : caveman*
- [ ] **P9.11** Recette sécurité scénarios §17 (visiteur bloqué dashboard, client incapable de modifier RDV d'autrui, photo privée inaccessible, données validées, opérations sensibles contrôlées). — *skill : verify-and-stop + security-audit*

## PHASE 10 — PERFORMANCE, ACCESSIBILITÉ, SEO (EXIGENCES §16)

- [ ] **P10.1** Optimisation images : formats modernes, redimensionnement selon écran, lazy loading, images de repli pour lenteur réseau. — *skill : image*
- [ ] **P10.2** Performance : Lighthouse mobile ≥ 90 sur toutes les pages principales, requêtes DB minimales, cache des pages publiques. — *skill : caveman + verification-before-completion*
- [ ] **P10.3** Audit accessibilité complet : contrastes, libellés formulaires, clavier, textes alternatifs, erreurs compréhensibles, statuts texte. — *skill : web-design-guidelines*
- [ ] **P10.4** Audit SEO final : indexation, sitemap, metadata, contenu, LocalBusiness. — *skill : seo-audit*
- [ ] **P10.5** Parcours complet testé réellement sur Android, iPhone, tablette, ordinateur ; zéro défilement horizontal involontaire. — *skill : webapp-testing*

## PHASE 11 — TESTS, RECETTE, REVUE

> Objectif : §17 intégral, preuves à l'appui.

- [ ] **P11.1** Suite tests unitaires/métier : moteur compatibilité, moteur disponibilités, machine à statuts, idempotence notifications, protection conflits. — *skill : test-driven-development*
- [ ] **P11.2** Tests e2e Playwright : parcours complet visiteur (catalogue → compatibilité → réservation → e-mail), parcours admin complet (créer coiffure → règles → valider évaluation → gérer RDV), annulation client par lien. — *skill : webapp-testing*
- [ ] **P11.3** Recette manuelle scénarios §17 (catalogue, compatibilité, réservation, annulation, messagerie, sécurité, interface). — *skill : verify-and-stop*
- [ ] **P11.4** Revue de code de chaque phase (sécurité + qualité). — *skill : requesting-code-review + receiving-code-review*
- [ ] **P11.5** Correction des anomalies : debug discipliné, refactors sûrs, re-test après chaque fix. — *skill : systematic-debugging + safe-refactor*
- [ ] **P11.6** Portée MVP figée : les extras §13 non validés explicitement restent hors v1. — *skill : lean-build + unlazy*
- [ ] **P11.7** Revue finale « polish » : détails visuels, microcopies FR, cohérence. — *skill : impeccable*

## PHASE 12 — LANCEMENT & MAINTENANCE

- [ ] **P12.1** Environnements séparés dev/prod, variables distinctes. — *skill : caveman*
- [ ] **P12.2** CI/CD : build + tests verts → déploiement automatique production. — *skill : caveman + verification-before-completion*
- [ ] **P12.3** Monitoring erreurs production + alerting e-mail. — *skill : caveman*
- [ ] **P12.4** Documentation : README d'installation, guide d'administration pour Patricia, documentation variables d'environnement, runbook de restauration. — *skill : caveman*
- [ ] **P12.5** Changelog v1.0 + tag Git. — *skill : changelog-generator*
- [ ] **P12.6** Merge branche finale + nettoyage. — *skill : finishing-a-development-branch*
- [ ] **P12.7** Export PDF du cahier des charges + roadmap pour archivage client. — *skill : markdown-to-pdf*
- [ ] **P12.8** Passerelle maintenance : plan de mises à jour dépendances, sauvegardes vérifiées périodiquement, procédure d'ajout de fonctionnalité sans casser les modules. — *skill : caveman*

---

## ORDRE D'EXÉCUTION SYNTHÉTIQUE

`P0 → P1 → P2 → P3 → P4 → P5 → P6 → P7 → P8 → P9 → P10 → P11 → P12`

**Dépendances critiques :**
- P1.4 (schéma DB) bloque tout le reste.
- P4.7/P4.8 (règles configurables) bloque P5.
- P6.2 (anti double-réservation) bloque P6.3 (parcours public).
- P7.2 (file e-mail) avant tout scénario de notification.
- P9 n'est jamais reporté après le lancement : audit avant mise en ligne.

**Parallélisation possible** (skill `dispatching-parallel-agents`) :
- P3.5 pages éditoriales // P3.2 catalogue (après P2).
- P8.1 formulaire personnalisé // P8.4 paramètres (après P7).
- P10.2 performance // P10.4 SEO (après P9).

**Total : 13 phases, 122 mini-tâches, ~35 skills affectés, 0 tâche sans skill.**





