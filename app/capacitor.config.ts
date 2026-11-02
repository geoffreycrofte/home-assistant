import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Identifiant unique de l'app sur les stores. À changer avant la première publication,
  // il ne peut plus être modifié ensuite.
  appId: "com.geoffreycrofte.maison",
  appName: "Maison",
  webDir: "dist",
  server: {
    // Android sert l'app en http://localhost : la connexion WebSocket en ws://
    // vers Home Assistant sur le réseau local (http://IP:8123) n'est alors pas
    // bloquée comme « contenu mixte ». Avec une adresse HTTPS (Tailscale),
    // ce réglage n'est plus nécessaire.
    androidScheme: "http",
    cleartext: true,
  },
  android: {
    // Le fond de la WebView reprend la couleur de fond du thème au démarrage.
    backgroundColor: "#391E34",
  },
  ios: {
    backgroundColor: "#391E34",
    contentInset: "never",
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true,
    },
  },
};

export default config;
