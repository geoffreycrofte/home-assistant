import { motion } from "motion/react";
import { IconPlug } from "@tabler/icons-react";
import type { Device, Room } from "../useHome";
import { formatWatts } from "../format";

interface Props {
  rooms: Room[] | null;
  onOpen: (device: Device) => void;
}

export function EnergyView({ rooms, onOpen }: Props) {
  const metered = (rooms?.flatMap((r) => r.devices) ?? [])
    .filter((d) => d.power !== null)
    .sort((a, b) => (b.power ?? 0) - (a.power ?? 0));
  const total = metered.reduce((sum, d) => sum + (d.power ?? 0), 0);
  const max = Math.max(1, ...metered.map((d) => d.power ?? 0));

  return (
    <>
      <header className="hero">
        <h1>Énergie</h1>
        <p className="hero__summary">
          {metered.length === 0
            ? "Aucune prise ne mesure sa consommation pour l'instant."
            : `Tes prises consomment ${formatWatts(total)} en ce moment.`}
        </p>
      </header>

      {metered.length > 0 && (
        <ul className="meter-list">
          {metered.map((d, i) => (
            <li key={d.id}>
              <button className="meter" onClick={() => onOpen(d)}>
                <span className="meter__icon">
                  <IconPlug size={22} aria-hidden="true" />
                </span>
                <span className="meter__body">
                  <span className="meter__row">
                    <span className="meter__name">{d.name}</span>
                    <span className="meter__value">{formatWatts(d.power ?? 0)}</span>
                  </span>
                  <span className="meter__bar" aria-hidden="true">
                    <motion.span
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: (d.power ?? 0) / max }}
                      transition={{ type: "spring", stiffness: 120, damping: 20, delay: i * 0.05 }}
                    />
                  </span>
                  <span className="meter__room">{d.roomName}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
