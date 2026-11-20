# Snow Cloud Chek
Développeurs : Yurei Jianyu x Seen Angel.
## Déploiement Cloudflare Pages
- Racine du projet Cloudflare Pages : `snow` (dossier contenant `functions/`).
- Dossier de sortie / Build output directory : `inconnuboy`.
- Commande de build : aucune.
- `functions/api/turnstile/verify.js` valide le jeton CAPTCHA auprès de Cloudflare Siteverify.
- Dans Cloudflare Pages > Settings > Variables and Secrets, ajouter `TURNSTILE_SECRET` comme **secret** (ne jamais le mettre dans le code).
- Dans `inconnuboy/turnstile-config.js`, remplacer `REMPLACER_PAR_LA_SITE_KEY_CLOUDFLARE` par la **Site Key publique** du widget.
- Créer le widget dans Cloudflare Turnstile en mode **Managed**, avec le domaine du site autorisé et une apparence visible.
- CAPTCHA uniquement sur la connexion par e-mail/mot de passe et avant le lancement d'une connexion OAuth. Inscription et récupération du mot de passe inchangées.
- La connexion est bloquée si Siteverify ne confirme pas un jeton valide avec l'action `login`.
- Anciennes variables API : `BANCHECK_API_URL`, `BANCHECK_TIMEOUT_MS`, `BANCHECK_CORS_ORIGIN`. Vérifier séparément la compatibilité des anciennes routes `api/` avec Pages.
## Supabase
Exécuter `supabase/schema.sql` puis `supabase/schema_part2.sql` (stickers, stockage, correction RLS) puis `schema_part3.sql` (FAQ, journal, retraits sécurisés). Activer Google, GitHub, Microsoft (Azure) et Email dans Authentication > Providers. Admin = `yureijianyu@gmail.com` (e-mail confirmé), appliqué par RLS.
## APK
`npm install && npx cap add android && npx cap sync android` puis Android Studio. Mettre l'URL Vercel dans `inconnuboy/api-config.js`.
## État des fonctionnalités
| Fonction | Développée | Connectée | Testée | Opérationnelle |
|---|---|---|---|---|
| Check-Ban (API Inconnu, 3 statuts + erreur) | oui | oui (proxy) | tests unitaires | à valider en ligne |
| Personnalisation : polices, tailles, graisse, espacement, messages, aperçu, enregistrer/annuler/réinitialiser | oui | localStorage | syntaxe vérifiée | à valider |
| Check-Ban : pays + indicatif, recherche et filtres d’historique | oui | oui | syntaxe vérifiée | à valider |
| Canaux développeur | oui | liens directs | non | à valider |
| PWA (manifest, SW, icônes) | oui | oui | manifest validé | à valider sur Android |
| Schéma Supabase (RLS, trigger inscription, récompenses, retraits) | oui | non | non | non |
| Auth Supabase (Google/GitHub/Microsoft/e-mail), communauté + MP temps réel, gains/retraits, compte, notifications, admin | oui | non (clés à saisir) | syntaxe vérifiée | non |
| Communauté : groupes, images, stickers (+ perso), réactions, réponses, édition, blocage, signalement | oui | non (Supabase à configurer, exécuter schema_part2.sql) | syntaxe vérifiée | non |
| Refonte 2 : shell clair type Mistral/Cloudflare/Cerebras (barre haute, tiroir par rubriques, auth à 3 tuiles, docs 3 langues avec recherche) | oui | oui | syntaxe vérifiée, rendu non vu | à valider |
| Admin : utilisateurs, rôles, badges, suspension, retraits (remboursement si refusé), récompenses, signalements, canaux, FAQ, annonces, journal | oui | non (Supabase à configurer, schema_part3.sql) | syntaxe vérifiée | non |
| Traduction intégrale de tous les écrans, gestion admin des traductions, pages légales détaillées | à faire | | | |
