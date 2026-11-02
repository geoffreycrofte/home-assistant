import { useEffect, useState } from "react";
import type { Connection } from "home-assistant-js-websocket";
import { logout, restoreConnection } from "./ha";
import { Login } from "./Login";
import { Home } from "./Home";

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

  if (loading) return <p className="splash">Connexion…</p>;

  if (!conn) return <Login onConnected={setConn} initialError={error} />;

  return (
    <Home
      conn={conn}
      onLogout={() => {
        logout(conn);
        setConn(null);
      }}
    />
  );
}
