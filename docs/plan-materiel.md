# Plan matériel : où faire tourner Home Assistant

> État au 15 novembre 2026. **Aucune décision prise** : ce document résume
> les constats et les options étudiées, pour décider à tête reposée.

## Constat : le NAS actuel ne peut pas héberger Home Assistant

Le NAS est un **Synology DS220j** (et non un DS223 comme supposé au départ) :

- **512 Mo de RAM**, soudés, non extensibles.
- DSM en utilise déjà une bonne partie ; Home Assistant demande 300 à 600 Mo
  de plus. Le NAS manquerait de mémoire et ralentirait aussi pour le stockage.
- Container Manager est disponible, mais la mémoire est le facteur bloquant.

➡️ Le guide [`installation-synology.md`](installation-synology.md) reste
valable pour la partie Home Assistant (intégrations Tapo, Tuya, PWA), mais
**pas sur ce NAS**.

Ce qui ne change pas, quelle que soit la machine choisie : l'app Kitten's
Nest, LocalTuya, l'intégration TP-Link des prises P110, l'accès distant par
Tailscale.

## Disques actuels

- 2 × WD 2 To (affichés 1,8 To) en miroir, numéros de série `WD-WCC4M…`,
  firmware `80.00A80` : très probablement des **WD Red WD20EFRX**
  d'environ 2014–2016 (≈ 10 ans).
- **920 Go utilisés**, 920 Go libres.
- Trop vieux pour garder les données principales, mais utilisables comme
  **copie de sauvegarde** si leur état SMART est bon (test étendu dans DSM :
  secteurs réalloués et en attente à 0 ou presque).

## Options pour héberger Home Assistant

| Option | Coût | Notes |
|---|---|---|
| Mac qui traîne | 0 € | Home Assistant OS dans UTM / VirtualBox. Allumé en permanence, consomme plus. Bon pour tester. |
| Home Assistant Green | ~100–130 € | Boîtier officiel prêt à brancher, ~2 W. Le plus simple. |
| Raspberry Pi 5 (4 Go) + SSD | ~120–150 € | Même résultat, plus de bricolage. |
| **Nouveau NAS** | voir ci-dessous | Remplace le DS220j **et** héberge Home Assistant. Option privilégiée. |

## Nouveau NAS : choix du modèle

Préférence pour **UGREEN** (bonne réputation, meilleur rapport matériel/prix
que Synology en 2026). Budget : **~500 €, 700 € maximum**, disques compris.

| Modèle | Prix nu (approx.) | Verdict |
|---|---|---|
| **DXP2800** ⭐ | ~350–380 € (promo ~280 €) | Intel N100, 8 Go, 2 baies + 2 M.2 NVMe, 2,5 GbE. Home Assistant OS complet en machine virtuelle. **Modèle retenu.** |
| DXP2800 GT | ~80–120 € de plus | Ryzen R2514 + 10 GbE + RAM jusqu'à 64 Go. Inutile ici (réseau en 1–2,5 Gb/s) ; moins adapté à une future caméra (Frigate préfère l'Intel). |
| DH4300 Plus | ~340 € | ARM, 4 baies, économe, familial. **Pas de machines virtuelles**, pas de M.2, 8 Go soudés. Trop limité. |
| DXP4800 Plus | ~620–700 € | Excellent, mais hors budget une fois les disques ajoutés. |
| Synology DS225+ / DS425+ | ~380–430 € / ~640 € | DSM connu, mais processeur ancien, 2 Go de RAM à augmenter. |

**Pourquoi 2 baies suffisent :** le DS220j est recyclé en cible de
sauvegarde (le « glacier » en disques durs), il n'est pas nécessaire de
loger la sauvegarde dans le nouveau NAS.

## Stockage : l'obstacle du prix

Pénurie de mémoire flash en 2026 : les prix ont environ doublé.

- SSD 2 To : **~400 €** quelle que soit la marque (constaté).
- Disque dur NAS 4 To (WD Red Plus, IronWolf) : **~230–250 €**.
- Prévisions : encore en hausse ce trimestre, pas de baisse à attendre à
  court terme.

Le plan initial (2 SSD de 2 To en RAID 1) coûterait ~1 150 € avec le NAS :
**hors budget**. 1 To ne suffit pas pour 920 Go de données.

### Configurations envisagées

| Plan | Contenu | Total | Risque |
|---|---|---|---|
| A. Tout SSD | DXP2800 + 2 × SSD 2 To en RAID 1 | ~1 150 € | Faible — hors budget |
| B. SSD en deux temps | DXP2800 + 1 SSD 2 To, 2e SSD plus tard | ~750 € | Faible (sauvegarde nocturne sur le DS220j) — au-dessus du budget |
| **C. Disque dur + petit SSD** | DXP2800 + 1 disque NAS 4 To (baie) + 1 SSD NVMe 500 Go pour les apps et Home Assistant ; 2e disque 4 To plus tard pour le RAID 1 | ~650–700 € | Faible (sauvegarde nocturne sur le DS220j) — **dans le budget** |
| D. Rotation des vieux disques | DXP2800 seul ; un WD déplacé dans le nouveau NAS, l'autre reste dans le DS220j | ~350 € | **Élevé** : deux copies sur des disques de 10 ans, chacun seul. Seulement avec une sauvegarde cloud en plus. **Écarté.** |

Choix des SSD (quand ils seront achetés) : mémoire **TLC** (Samsung 990 EVO
Plus, WD Black SN7100, Lexar NM790 en NVMe ; Crucial MX500, WD Red SA500 en
SATA). Éviter la QLC et le Kingston NV3. La vitesse n'est pas un critère :
le réseau 2,5 Gb/s limite de toute façon.

À vérifier à la réception du DXP2800 :
- RAID 1 possible sur les deux emplacements M.2 (non confirmé).
- Transformation d'un volume simple en RAID 1 par ajout d'un disque
  (non confirmée ; sinon, restauration depuis la sauvegarde du DS220j).

## Migration des données (faisabilité)

Faisable, **par copie réseau** (les disques Synology ne sont pas lisibles
par UGOS Pro) :

1. Installer le DXP2800 et ses disques, recréer les dossiers partagés.
2. Copier depuis le DS220j (rsync ou montage réseau depuis UGOS Pro) :
   quelques heures à une nuit pour ~920 Go. Le DS220j reste intact.
3. Vérifier, repointer les appareils, garder le DS220j tel quel 1–2 semaines.
4. Réinitialiser le DS220j (WD en RAID 1) et en faire la **cible de
   sauvegarde nocturne**, si possible dans une autre pièce.

Les données propres aux applis Synology (albums et visages de Synology
Photos, versions de Synology Drive, archives Hyper Backup) ne migrent pas
telles quelles : seuls les fichiers sont copiés.

Avant la copie : test SMART étendu des deux WD.

## Prochaines étapes

- [ ] Décider : plan C (nouveau NAS), ou solution intermédiaire (Mac,
      Home Assistant Green) en attendant la baisse des prix.
- [ ] Surveiller le Black Friday (NAS, disque 4 To, SSD).
- [ ] Une fois le matériel choisi : guide d'installation dédié (Home
      Assistant OS en VM sur UGOS Pro, migration, sauvegarde vers le DS220j).
