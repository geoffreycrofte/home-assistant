# Maison

PWA pour piloter les objets connectés de la maison (lampes HEMA / Tuya, prises
Tapo P110…), en s'appuyant sur **Home Assistant** qui tourne sur le NAS.
Packageable plus tard en application native avec Capacitor.

```
Téléphone (PWA, puis app Capacitor)
     │  WebSocket (maison : direct · extérieur : Tailscale)
     ▼
Synology DS223 → Container Manager → Home Assistant
     │  réseau local
     ▼
Lampes HEMA/Tuya (LocalTuya) · Prises Tapo P110 (TP-Link)
```

## Contenu

| Dossier | Rôle |
|---|---|
| [`server/`](server/) | `docker-compose.yml` et `configuration.yaml` pour Home Assistant sur le Synology |
| [`docs/installation-synology.md`](docs/installation-synology.md) | Guide pas à pas : NAS, Tapo, Tuya, installation de la PWA |
| [`app/`](app/) | La PWA (Vite + React + TypeScript + `vite-plugin-pwa` + `home-assistant-js-websocket`) |

## Fonctionnalités de la PWA (v0.1)

- Connexion à Home Assistant via sa page de connexion (OAuth), ou avec un
  jeton longue durée (utile pour la future app native).
- Lampes et prises regroupées par pièce, mises à jour en temps réel.
- Allumer / éteindre d'un tap, réglage de la luminosité pour les lampes
  compatibles.
- Consommation instantanée (W) affichée sur les prises qui la mesurent (P110).
- Reconnexion automatique, thème clair / sombre, installable sur l'écran
  d'accueil (en HTTPS).

## Développement

```bash
cd app
npm install
cp .env.example .env   # renseigne VITE_HA_URL avec l'adresse de ton Home Assistant
npm run dev            # http://localhost:5173
```

En développement, l'app tourne sur `localhost:5173` et appelle Home Assistant
sur une autre adresse : `http://localhost:5173` doit figurer dans
`http.cors_allowed_origins` (déjà présent dans `server/configuration.yaml`).

Build pour un déploiement servi par Home Assistant :

```bash
VITE_BASE=/local/maison/ npm run build   # puis copier dist/ dans config/www/maison/
```

## Étapes suivantes

- Packaging natif avec Capacitor (iOS / Android).
- Aspirateur Xiaomi, balance (Bluetooth), caméra.
