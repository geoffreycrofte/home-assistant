import {
  type Auth,
  type AuthData,
  type Connection,
  createConnection,
  createLongLivedTokenAuth,
  ERR_HASS_HOST_REQUIRED,
  getAuth,
} from "home-assistant-js-websocket";

const STORAGE = {
  mode: "maison.authMode",
  oauth: "maison.oauthTokens",
  token: "maison.longLivedToken",
  url: "maison.hassUrl",
} as const;

type AuthMode = "oauth" | "token";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* stockage indisponible (navigation privée) : on continue sans */
  }
}

export function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export function savedHassUrl(): string {
  return read(STORAGE.url) ?? import.meta.env.VITE_HA_URL ?? "";
}

function isOAuthCallback(): boolean {
  return new URLSearchParams(location.search).has("auth_callback");
}

function oauthAuth(hassUrl?: string): Promise<Auth> {
  return getAuth({
    hassUrl,
    saveTokens: (data: AuthData | null) => write(STORAGE.oauth, data ? JSON.stringify(data) : null),
    loadTokens: async () => {
      const raw = read(STORAGE.oauth);
      return raw ? (JSON.parse(raw) as AuthData) : null;
    },
  });
}

/**
 * Restaure une session existante (ou termine un retour OAuth).
 * Renvoie null si l'utilisateur doit se connecter.
 */
export async function restoreConnection(): Promise<Connection | null> {
  const mode = read(STORAGE.mode) as AuthMode | null;

  if (isOAuthCallback() || mode === "oauth") {
    try {
      const auth = await oauthAuth();
      if (isOAuthCallback()) history.replaceState(null, "", location.pathname);
      write(STORAGE.mode, "oauth");
      write(STORAGE.url, auth.data.hassUrl);
      return await createConnection({ auth });
    } catch (err) {
      if (err === ERR_HASS_HOST_REQUIRED) return null;
      throw err;
    }
  }

  if (mode === "token") {
    const url = read(STORAGE.url);
    const token = read(STORAGE.token);
    if (url && token) {
      return createConnection({ auth: createLongLivedTokenAuth(url, token) });
    }
  }

  return null;
}

/** Redirige vers la page de connexion de Home Assistant (OAuth). */
export async function loginWithOAuth(hassUrl: string): Promise<void> {
  const url = normalizeUrl(hassUrl);
  write(STORAGE.mode, "oauth");
  write(STORAGE.url, url);
  write(STORAGE.oauth, null);
  // getAuth redirige le navigateur : la promesse ne se résout pas.
  await oauthAuth(url);
}

/** Connexion avec un jeton longue durée (pratique pour l'app native Capacitor). */
export async function loginWithToken(hassUrl: string, token: string): Promise<Connection> {
  const url = normalizeUrl(hassUrl);
  const conn = await createConnection({ auth: createLongLivedTokenAuth(url, token.trim()) });
  write(STORAGE.mode, "token");
  write(STORAGE.url, url);
  write(STORAGE.token, token.trim());
  return conn;
}

export function logout(conn: Connection | null): void {
  conn?.close();
  write(STORAGE.mode, null);
  write(STORAGE.oauth, null);
  write(STORAGE.token, null);
}
