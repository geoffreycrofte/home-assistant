# Installer Home Assistant sur un Synology DS223

Ce guide installe Home Assistant en conteneur Docker sur le NAS, puis y ajoute
les lampes HEMA / Tuya et les prises Tapo P110, et enfin la PWA « Kitten's Nest ».

> Le DS223 n'a pas de Virtual Machine Manager : on utilise donc
> **Home Assistant Container** (pas de « add-ons », ce qui ne gêne pas ici).
> Avec 2 Go de RAM, Home Assistant tient sans problème pour quelques appareils.

## 0. Prérequis

- DSM 7.2 ou plus récent.
- **Container Manager** installé depuis le Centre de paquets.
  S'il n'apparaît pas dans le Centre de paquets, ce modèle/firmware ne le
  supporte pas : il faudra passer par le Mac ou un Raspberry Pi.
- Une **adresse IP fixe pour le NAS**. Dans la Fritzbox :
  *Réseau domestique → Réseau → (le NAS) → Toujours attribuer la même adresse IPv4*.
  Fais de même pour chaque lampe et prise (indispensable pour LocalTuya).

## 1. Créer les dossiers

Dans **File Station**, dans le dossier partagé `docker` (créé par Container
Manager), crée :

```
docker/
└── homeassistant/
    └── config/
```

## 2. Lancer Home Assistant

1. Ouvre **Container Manager → Projet → Créer**.
2. Nom du projet : `homeassistant`.
3. Chemin : `/docker/homeassistant`.
4. Source : *Créer docker-compose.yml*, puis colle le contenu de
   [`server/docker-compose.yml`](../server/docker-compose.yml).
   Ajuste `TZ` si besoin (`Europe/Paris`, `Europe/Amsterdam`, `Europe/Berlin`…).
5. Valide : l'image se télécharge (quelques minutes), puis le conteneur démarre.

Le premier démarrage prend 2 à 5 minutes. Ouvre ensuite
`http://IP_DU_NAS:8123` dans un navigateur et crée ton compte administrateur.

> `network_mode: host` est obligatoire : sans lui, Home Assistant ne voit pas
> les appareils du réseau local.
> Si le pare-feu DSM est activé, autorise le port **8123**
> (*Panneau de configuration → Sécurité → Pare-feu*).

## 3. Ajouter les prises Tapo P110

1. Dans l'app Tapo, vérifie que les prises sont à jour et connectées.
2. Home Assistant : *Paramètres → Appareils et services → Ajouter une
   intégration → TP-Link Smart Home*.
3. Saisis l'IP de la prise, puis **ton e-mail et mot de passe Tapo**
   (le pilotage reste local, ils servent à l'authentification de la prise).
4. Chaque prise apparaît avec un interrupteur et un capteur de puissance (W) :
   la PWA affiche automatiquement la consommation sur la carte de la prise.

## 4. Ajouter les lampes HEMA / Tuya

Deux options :

### Option A — simple : intégration Tuya officielle (cloud)

*Ajouter une intégration → Tuya*, puis scanne le QR code avec l'app
**Smart Life** ou **Tuya Smart**. Si tes lampes sont dans l'app HEMA,
ajoute-les d'abord dans Smart Life (la plupart des appareils HEMA sont des
appareils Tuya). Inconvénient : passe par les serveurs Tuya (un peu plus lent,
dépend d'Internet).

### Option B — recommandée : LocalTuya (100 % local)

1. **Installer HACS** (le « magasin » d'intégrations communautaires).
   Dans Container Manager → Conteneur → `homeassistant` → *Action → Ouvrir le
   terminal* → *Créer → bash*, puis :

   ```bash
   wget -O - https://get.hacs.xyz | bash -
   ```

   Redémarre le conteneur, puis ajoute l'intégration **HACS** dans
   Home Assistant et suis l'activation avec ton compte GitHub.
2. Dans HACS, cherche et installe **LocalTuya** (ou **Tuya Local**), puis
   redémarre Home Assistant.
3. Récupère la **local key** de chaque lampe : crée un projet sur
   [platform.tuya.com](https://platform.tuya.com) (Cloud → Development),
   lie ton compte Smart Life via QR code, et lis les clés dans la liste des
   appareils. L'intégration LocalTuya peut aussi les récupérer seule si tu lui
   donnes les identifiants du projet cloud.
4. Ajoute l'intégration LocalTuya et laisse-la découvrir les lampes.

> Si tu ré-appaires une lampe dans l'app, sa local key change : il faudra la
> mettre à jour dans LocalTuya.

## 5. Organiser par pièces

*Paramètres → Pièces, étiquettes et zones* (« Areas » en anglais) : crée tes pièces (Salon, Chambre…)
et assigne chaque appareil. La PWA regroupe automatiquement les appareils par
pièce.

## 6. Installer la PWA « Kitten's Nest »

La façon la plus simple est de laisser Home Assistant servir l'app lui-même
(même adresse, donc aucune configuration CORS) :

1. Sur ton ordinateur, dans le dossier `app/` :

   ```bash
   npm install
   VITE_BASE=/local/kittens-nest/ npm run build
   ```

2. Dans File Station, crée `docker/homeassistant/config/www/kittens-nest/` et copies-y
   **le contenu** du dossier `app/dist/`.
3. Si le dossier `www` n'existait pas, redémarre le conteneur Home Assistant.
4. Ouvre `http://IP_DU_NAS:8123/local/kittens-nest/` et connecte-toi avec ton compte
   Home Assistant.

> Les fichiers de `www` sont publics (mais ne contiennent aucun secret) :
> l'accès aux appareils demande toujours la connexion Home Assistant.

### Installer l'app sur l'écran d'accueil (HTTPS)

Les navigateurs n'autorisent l'installation d'une PWA (et son fonctionnement
hors ligne) qu'en **HTTPS**. Sur `http://IP_DU_NAS:8123`, l'app fonctionne
dans le navigateur mais ne s'installe pas. Pour avoir HTTPS, le plus simple :

- **Tailscale** (recommandé, gratuit) : installe le paquet Tailscale sur le
  NAS et l'app Tailscale sur ton téléphone, active *HTTPS Certificates* dans la
  console Tailscale, puis expose Home Assistant avec `tailscale serve`.
  Tu obtiens une adresse `https://nas.xxxx.ts.net` qui fonctionne aussi
  **depuis l'extérieur**, sans ouvrir de port sur la Fritzbox.
- Ou le **proxy inversé de DSM** + un certificat Let's Encrypt sur un nom de
  domaine (par ex. DDNS Synology). Plus d'étapes et expose le NAS sur Internet.

## 7. Tester sans appareil (facultatif)

Ajoute `demo:` dans `configuration.yaml` et redémarre : Home Assistant crée
des lampes et interrupteurs fictifs. Pratique pour tester la PWA.
Retire la ligne ensuite.

## Dépannage

| Problème | Piste |
|---|---|
| La PWA affiche « Connexion impossible » | Vérifie l'adresse (avec `http://` et `:8123`). Si la PWA est servie depuis une autre adresse que Home Assistant, ajoute cette adresse dans `cors_allowed_origins` (voir [`server/configuration.yaml`](../server/configuration.yaml)). |
| Une prise Tapo « Indisponible » | IP changée (fixe-la dans la Fritzbox) ou firmware mis à jour : supprime et ré-ajoute l'appareil. |
| Une lampe Tuya ne répond plus | Local key changée après un ré-appairage, ou mauvaise version de protocole (essaie 3.3, 3.4, 3.5 dans LocalTuya). |
| Le NAS rame | Regarde la RAM dans le Moniteur de ressources ; arrête les paquets inutilisés. |
