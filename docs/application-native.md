# Application native (Capacitor)

La PWA est empaquetée en application Android et iOS avec
[Capacitor](https://capacitorjs.com) 8. Le code est le même : Capacitor
affiche l'app dans une WebView native et donne accès à quelques fonctions du
téléphone (vibrations, barre d'état).

```
app/
├── capacitor.config.ts   # identifiant, nom, réglages natifs
├── assets/               # sources des icônes et écrans de démarrage
├── android/              # projet Android Studio (généré, versionné)
└── ios/                  # projet Xcode (généré, versionné)
```

## Prérequis

| Plateforme | Outils |
|---|---|
| Android | [Android Studio](https://developer.android.com/studio) (inclut le SDK et Java 21) |
| iOS | Un Mac avec une version récente de Xcode (voir les [prérequis Capacitor](https://capacitorjs.com/docs/getting-started/environment-setup)) et un compte Apple (gratuit pour tester sur ton iPhone) |

Les dépendances iOS passent par Swift Package Manager : pas besoin de CocoaPods.

## Construire et lancer

Depuis `app/` :

```bash
npm install
npm run cap:android   # build web + synchronisation + ouvre Android Studio
npm run cap:ios       # build web + synchronisation + ouvre Xcode (sur Mac)
```

Puis, dans Android Studio ou Xcode, choisis ton téléphone (branché en USB, ou
un émulateur) et clique sur ▶︎.

Après chaque modification du code web : `npm run cap:sync`
(build + copie dans les projets natifs).

APK de test sans Android Studio (SDK installé, `ANDROID_HOME` défini) :

```bash
npm run cap:sync
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

## Se connecter depuis l'app

Dans l'app native, la connexion se fait avec un **jeton longue durée** : la
page de connexion de Home Assistant ouvrirait le navigateur et ne reviendrait
pas dans l'app.

1. Dans Home Assistant : clique sur ton profil (en bas à gauche) → onglet
   **Sécurité** → **Jetons d'accès longue durée** → **Créer un jeton**,
   nomme-le « Maison (téléphone) ».
2. Dans l'app : saisis l'adresse (`http://IP_DU_NAS:8123`) et colle le jeton.

Pour révoquer l'accès d'un téléphone perdu, supprime son jeton dans
Home Assistant.

## Réseau local et HTTPS

Home Assistant sur le NAS est en `http://` : les deux systèmes bloquent
normalement ce trafic non chiffré. L'app l'autorise **uniquement pour ce
besoin** :

- **Android** : l'app est servie en `http://localhost`
  (`server.androidScheme` dans `capacitor.config.ts`) et
  `android:usesCleartextTraffic="true"` est activé dans
  `android/app/src/main/AndroidManifest.xml`.
- **iOS** : `NSAllowsLocalNetworking` dans `ios/App/App/Info.plist` autorise
  le `http://` vers les adresses du réseau local seulement. Au premier
  lancement, iOS demande l'autorisation d'accéder au réseau local : accepte.

Avec Tailscale (adresse `https://…ts.net`), tout passe en HTTPS et l'app
fonctionne aussi hors de chez toi. Tu pourras alors retirer
`androidScheme: "http"` et `usesCleartextTraffic`.

## Fonctions natives

- **Vibrations** légères quand on allume ou éteint un appareil, plus marquées
  pour « Éteindre les lumières » (`@capacitor/haptics`).
- **Barre d'état** (heure, batterie) accordée au mode clair ou sombre
  (`@capacitor/status-bar`). L'app passe sous la barre d'état et utilise les
  marges de sécurité de l'écran (encoche, barre de geste).
- Le service worker de la PWA est désactivé dans l'app native (inutile).

## Icônes et écran de démarrage

Les sources sont dans `app/assets/` (icône 1024 px, premier plan et fond pour
les icônes adaptatives Android, écrans de démarrage clair et sombre). Après
les avoir modifiées :

```bash
npm run cap:assets
```

## Avant de publier sur les stores

- Remplace `appId` (`com.geoffreycrofte.maison`) dans `capacitor.config.ts`
  par l'identifiant définitif : il ne peut plus changer après la première
  publication. Pense à le changer aussi dans les projets natifs
  (`android/app/build.gradle` → `applicationId`, et le Bundle Identifier dans
  Xcode), ou régénère `android/` et `ios/`.
- Android : crée une clé de signature (Android Studio → *Build → Generate
  Signed App Bundle*). Garde-la précieusement.
- iOS : choisis ton équipe dans Xcode (*Signing & Capabilities*).
- Pour un usage perso, pas besoin des stores : installe l'APK directement sur
  Android, ou lance l'app depuis Xcode sur ton iPhone (à refaire tous les 7
  jours avec un compte Apple gratuit, ou tous les ans avec le programme
  développeur payant).
