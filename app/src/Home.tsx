import { useState } from "react";
import type { Connection } from "home-assistant-js-websocket";
import { IconSettings, IconWifi, IconWifiOff } from "@tabler/icons-react";
import { useHome } from "./useHome";
import { DeviceCard } from "./DeviceCard";
import { Settings } from "./Settings";

interface Props {
  conn: Connection;
  onLogout: () => void;
}

export function Home({ conn, onLogout }: Props) {
  const { rooms, status } = useHome(conn);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const connected = status === "connected";

  return (
    <>
      <header className="topbar">
        <h1>Maison</h1>
        <span className={`status status--${status}`} role="status">
          {connected ? <IconWifi size={18} aria-hidden="true" /> : <IconWifiOff size={18} aria-hidden="true" />}
          {connected ? "Connecté" : "Reconnexion…"}
        </span>
        <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="Réglages">
          <IconSettings aria-hidden="true" />
        </button>
      </header>

      <main className="rooms">
        {rooms === null && <p className="muted">Chargement des appareils…</p>}
        {rooms?.length === 0 && (
          <p className="muted">
            Aucune lampe ni prise trouvée. Ajoute tes appareils dans Home Assistant (LocalTuya, TP-Link) puis reviens ici.
          </p>
        )}
        {rooms?.map((room) => (
          <section key={room.id} className="room">
            <h2>{room.name}</h2>
            <div className="grid">
              {room.devices.map((d) => (
                <DeviceCard key={d.entity.entity_id} conn={conn} device={d} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} onLogout={onLogout} />
    </>
  );
}
