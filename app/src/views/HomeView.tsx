import { useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import type { Device, Room } from "../useHome";
import { DeviceCard } from "../components/DeviceCard";
import { greeting } from "../format";

interface Props {
  rooms: Room[] | null;
  userName: string | null;
  onToggle: (device: Device, on: boolean) => void;
  onOpen: (device: Device) => void;
}

export function HomeView({ rooms, userName, onToggle, onOpen }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const all = rooms?.flatMap((r) => r.devices) ?? [];
  const lightsOn = all.filter((d) => d.domain === "light" && d.isOn).length;
  const visibleRooms = filter === "all" ? rooms : rooms?.filter((r) => r.id === filter);
  const firstName = userName?.split(" ")[0];

  return (
    <>
      <header className="hero">
        <h1>
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="hero__summary">
          {rooms === null
            ? "Chargement des appareils…"
            : lightsOn === 0
              ? "Toutes les lumières sont éteintes."
              : lightsOn === 1
                ? "1 lumière allumée."
                : `${lightsOn} lumières allumées.`}
        </p>
      </header>

      {rooms && rooms.length > 1 && (
        <LayoutGroup id="rooms">
          <div className="chips" role="group" aria-label="Filtrer par pièce">
            {[{ id: "all", name: "Toutes les pièces" }, ...rooms].map((r) => (
              <button
                key={r.id}
                className={`chip ${filter === r.id ? "is-active" : ""}`}
                aria-pressed={filter === r.id}
                onClick={() => setFilter(r.id)}
              >
                {filter === r.id && (
                  <motion.span
                    layoutId="chip-indicator"
                    className="chip__indicator"
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                  />
                )}
                <span className="chip__label">{r.name}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      )}

      {rooms?.length === 0 && (
        <p className="empty">
          Aucune lampe ni prise pour l'instant. Ajoute tes appareils dans Home Assistant (LocalTuya, TP-Link) : ils
          apparaîtront ici automatiquement.
        </p>
      )}

      {visibleRooms?.map((room) => (
        <section key={room.id} className="room" aria-labelledby={`room-${room.id}`}>
          {(filter === "all" && rooms!.length > 1) || room.id === "_none" ? (
            <h2 id={`room-${room.id}`}>{room.name}</h2>
          ) : (
            <h2 id={`room-${room.id}`} className="visually-hidden">
              {room.name}
            </h2>
          )}
          <div className="grid">
            {room.devices.map((d) => (
              <DeviceCard key={d.id} device={d} onToggle={onToggle} onOpen={onOpen} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
