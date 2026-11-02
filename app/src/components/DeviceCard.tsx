import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconBolt } from "@tabler/icons-react";
import type { Device } from "../useHome";
import { DeviceIcon } from "./DeviceIcon";
import { Pop } from "./Pop";
import { Switch } from "./Switch";
import { formatWatts } from "../format";

interface Props {
  device: Device;
  onToggle: (device: Device, on: boolean) => void;
  onOpen: (device: Device) => void;
}

export function DeviceCard({ device, onToggle, onOpen }: Props) {
  const { isOn, available, name, power } = device;
  const [popKey, setPopKey] = useState(0);
  const wasOn = useRef(isOn);

  // Une gerbe de bulles à chaque allumage.
  useEffect(() => {
    if (isOn && !wasOn.current) setPopKey((k) => k + 1);
    wasOn.current = isOn;
  }, [isOn]);

  const stateLabel = !available ? "Hors ligne" : isOn ? "Allumé" : "Éteint";

  return (
    <motion.article
      layout
      className={`card ${isOn ? "card--on" : ""} ${available ? "" : "card--offline"}`}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <button className="card__open" onClick={() => onOpen(device)} aria-label={`${name}, ${stateLabel}. Ouvrir`}>
        <span className="card__state">{stateLabel}</span>
        <span className="card__icon">
          <motion.span
            key={popKey}
            initial={popKey ? { scale: 0.7, rotate: -12 } : false}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 12 }}
          >
            <DeviceIcon device={device} />
          </motion.span>
          <AnimatePresence>{popKey > 0 && <Pop key={popKey} />}</AnimatePresence>
        </span>
        <span className="card__name">{name}</span>
        {power !== null && isOn && (
          <span className="card__power">
            <IconBolt size={14} aria-hidden="true" />
            {formatWatts(power)}
          </span>
        )}
      </button>
      <div className="card__switch">
        <Switch
          checked={isOn}
          disabled={!available}
          label={`${isOn ? "Éteindre" : "Allumer"} ${name}`}
          onChange={(on) => onToggle(device, on)}
        />
      </div>
    </motion.article>
  );
}
