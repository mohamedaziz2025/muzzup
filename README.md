# Muzzap

Marketplace SaaS de cession de business en ligne 100% halal. Monorepo Turborepo/pnpm couvrant
les Phases 0 à 7 du plan produit.

## Structure

```
apps/
  api/      Express 5 + TypeScript strict — API REST /api/v1, MongoDB/Mongoose, Socket.io, BullMQ
  web/      Next.js 15 (App Router) — design system "Midnight Trust", i18n FR/EN/AR
packages/
  shared/   Schémas Zod + types partagés front/back (source de vérité)
docker/
  mongo/    Script d'initialisation du replica set MongoDB
```

## Démarrage

```bash
pnpm install
docker compose up -d          # MongoDB (replica set) + Redis
cp apps/api/.env.example apps/api/.env   # générer des secrets JWT/TOTP aléatoires
pnpm --filter @muzzap/api seed # comptes + annonces + checklist + prestataire de démo
pnpm dev                       # apps/api (port 4000) et apps/web (port 3000)
```

Design system : http://localhost:3000/design-system · Storybook : `pnpm --filter @muzzap/web storybook`

## Comptes de démonstration (après `pnpm seed`)

Mot de passe commun : `Muzzap2026!Demo`

| Email | Rôle |
| --- | --- |
| admin@muzzap.fr | admin — back-office `/admin` |
| auditeur@muzzap.fr | halal_auditor — espace `/auditeur` |
| vendeur@muzzap.fr | subscriber + capacité seller |
| acheteur@muzzap.fr | subscriber + capacité buyer |
| prestataire@muzzap.fr | subscriber + capacité provider |

## Ce qui est livré, phase par phase

**Phase 0 — Fondations** : monorepo TS strict, API Express 5 en couches (routes → controllers →
services → repositories), Zod partout, erreurs centralisées, logs Pino, rate limiting Redis,
helmet/CORS, sanitisation NoSQL. Auth complète (argon2id, JWT access 15 min + refresh rotatif,
2FA TOTP, RBAC rôles + capacités). Design system "Midnight Trust" (tokens, composants, badge
"Sharia Vérifié", Storybook). i18n FR/EN/AR, Docker Compose, CI GitHub Actions.

**Phase 1 — Marketplace + Membre** : recherche/filtres d'annonces (index texte + composés),
freemium (P&L flouté hors abonnement), formulaire vendeur multi-étapes avec checklist Sharia
déclarative, abonnement Stripe (checkout, webhook, portail client), tableau de bord membre,
notifications in-app + Socket.io.

**Phase 2 — Audit halal** : checklists paramétrables par l'admin, file d'audit avec position/délai
estimé pour le vendeur, workflow auditeur (prise en charge, checklist, rapport, points de
vigilance), badge "Sharia Vérifié" apposé après validation, historique des versions de fiche,
data room (documents, watermark flag, journal d'accès — gating NDA branché en Phase 3).

**Phase 3 — Chat sécurisé** : conversations Socket.io temps réel, révélation d'identité en 3
phases par proposition/acceptation mutuelle, détection de coordonnées par regex (emails,
téléphones, liens, tentatives d'épellation), NDA (interface `ESignProvider`, flux de demande/
signature dev), signalement journalisé.

**Phase 4 — Pipeline de transaction** : paliers de sérieux acheteur (déclaratif / justificatif de
fonds >30K€ validé par un admin / KYC renforcé via `KycProvider`), pipeline LOI → Due diligence →
Signature → Transfert → Validation finale (chaque étape validée par l'équipe Muzzap), gel du
pipeline et litiges avec résolution admin.

**Phase 5 — Prestataires** : fiches (spécialités, tarifs, portfolio), avis post-mission avec
notation, recherche par mots-clés, mise en avant sponsorisée (Stripe one-shot), contact via le
chat anonyme réutilisé.

**Phase 6 — Intelligence artificielle** (`LlmProvider` sur Claude, `claude-opus-4-8`) : Outil A
(estimation rapide publique par multiples admin-configurables, sans appel IA), Outil B (évaluation
approfondie par IA avec justification, réservée aux vendeurs abonnés), pré-analyse de cohérence
déclenchée à la soumission d'une annonce et affichée à l'auditeur. Chaque sortie IA est stockée
dans `AiAnalysis` avec un verdict humain à renseigner — l'IA prépare, l'humain valide.

**Phase 7 — Back-office & durcissement** : dashboard admin (`/admin` — MRR, abonnés actifs,
annonces par statut, transactions par étape, taux de conversion), gestion utilisateurs
(recherche, suspension motivée, réactivation, impersonation journalisée), export CSV RGPD/compta,
sitemap.xml + robots.txt.

## Comptes/rôles → routes clés

| Espace | Route | Rôle requis |
| --- | --- | --- |
| Recherche d'annonces | `/annonces` | public |
| Dépôt d'annonce | `/vendre` | capacité seller |
| Messagerie | `/messages` | connecté |
| Suivi de transaction | `/transactions` | connecté |
| Annuaire prestataires | `/prestataires` | public (contact = connecté) |
| Espace auditeur | `/auditeur` | halal_auditor |
| Back-office | `/admin` | admin |

## Notes d'architecture

- Interfaces fournisseurs abstraites, non branchées à un vrai vendeur externe :
  `PaymentEscrowProvider` (Lemonway/MangoPay — hors périmètre, aucun mouvement de fonds
  automatisé), `EmailProvider` (Brevo — implémentation console en attendant), `ESignProvider`
  (Yousign), `KycProvider` (SumSub), `StorageProvider` (S3).
- `packages/shared` est la source de vérité des schémas Zod, réutilisés côté API (validation) et
  côté web (typage des formulaires/réponses).
- Toute sortie IA est journalisée (`AiAnalysis`) avec un champ `humanVerdict` nullable — jamais de
  décision automatisée de bout en bout sur l'audit, la valorisation ou le litige.

## Ce qui reste hors périmètre (volontairement)

Escrow régulé réellement implémenté, watermarking PDF effectif (le flag existe, le worker BullMQ
de génération n'est pas implémenté), suggestion contextuelle de prestataires pendant le parcours
d'achat, recommandation de deals par profil investisseur, anti-contournement du chat assisté par
LLM (la détection actuelle est regex), tests E2E Playwright, schema.org sur les pages d'annonces,
apps mobiles natives, CGU/contrats juridiques — comme spécifié dans le brief d'origine.

## Vérification

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Les 4 commandes passent sur les 3 packages (`@muzzap/api`, `@muzzap/web`, `@muzzap/shared`) :
19 tests unitaires (auth, listings, deal pipeline, détection de coordonnées), 59 routes web
générées avec succès.
