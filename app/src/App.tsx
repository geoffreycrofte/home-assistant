import { useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import type { Connection } from "home-assistant-js-websocket";
import { logout, restoreConnection } from "./ha";
import { Login } from "./Login";
import { Shell } from "./Shell";
import { Background } from "./components/Background";

export default function App() {
  const [conn, setConn] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    restoreConnection()
      .then(setConn)
      .catch(() => setError("Impossible de se reconnecter à Home Assistant. Vérifie l'adresse ou reconnecte-toi."))
      .finally(() => setLoading(false));
  }, []);

  return (
    // Les animations respectent le réglage « réduire les animations » du système.
    <MotionConfig reducedMotion="user">
      <Background />
      {loading ? (
        <p className="splash">Connexion…</p>
      ) : conn ? (
        <Shell
          conn={conn}
          onLogout={() => {
            logout(conn);
            setConn(null);
          }}
        />
      ) : (
        <Login onConnected={setConn} initialError={error} />
      )}
    </MotionConfig>
  );
}
