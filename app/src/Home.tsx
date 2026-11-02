import type { Connection } from "home-assistant-js-websocket";
import { useHome } from "./useHome";
import { DeviceCard } from "./DeviceCard";

interface Props {
  conn: Connection;
  onLogout: () => void;
}

export function Home({ conn, onLogout }: Props) {
  const { rooms, status } = useHome(conn);

  return (
    <>
      <header className="topbar">
        <h1>Maison</h1>
        <span className={`status status--${status}`}>
          {status === "connected" ? "Connecté" : "Reconnexion…"}
        </span>
        <button className="ghost" onClick={onLogout}>
          Déconnexion
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
    </>
  );
}
