import { type FormEvent, useState } from "react";
import type { Connection } from "home-assistant-js-websocket";
import { loginWithOAuth, loginWithToken, savedHassUrl } from "./ha";
import { isNative } from "./native";

interface Props {
  onConnected: (conn: Connection) => void;
  initialError: string | null;
}

export function Login({ onConnected, initialError }: Props) {
  const [url, setUrl] = useState(savedHassUrl());
  const [token, setToken] = useState("");
  // Dans l'app native, la redirection OAuth sortirait de l'app : on passe par un jeton.
  const [useToken, setUseToken] = useState(isNative);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (useToken) onConnected(await loginWithToken(url, token));
      else await loginWithOAuth(url);
    } catch {
      setError(
        "Connexion impossible. Vérifie l'adresse, le jeton, et que cette app est autorisée dans cors_allowed_origins.",
      );
      setBusy(false);
    }
  }

  return (
    <main className="login">
      <h1>Maison</h1>
      <p className="muted">Connecte-toi à ton serveur Home Assistant.</p>
      <form className="panel" onSubmit={submit}>
        <label>
          Adresse de Home Assistant
          <input
            type="url"
            required
            placeholder="http://192.168.178.20:8123"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoComplete="url"
          />
        </label>

        {!isNative && (
          <label className="check">
            <input type="checkbox" checked={useToken} onChange={(e) => setUseToken(e.target.checked)} />
            Utiliser un jeton longue durée
          </label>
        )}

        {useToken && (
          <label>
            Jeton longue durée
            <input
              type="password"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="off"
            />
            <small className="muted">Profil Home Assistant → Sécurité → Jetons d'accès longue durée.</small>
          </label>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button className="button" type="submit" disabled={busy}>
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
