import { motion } from "motion/react";
import {
  IconBolt,
  IconBoltFilled,
  IconHome,
  IconHomeFilled,
  IconPower,
  IconSettings,
  IconSettingsFilled,
} from "@tabler/icons-react";

export type View = "home" | "energy" | "settings";

const ITEMS = [
  { id: "home", label: "Maison", Icon: IconHome, IconActive: IconHomeFilled },
  { id: "energy", label: "Énergie", Icon: IconBolt, IconActive: IconBoltFilled },
  { id: "settings", label: "Réglages", Icon: IconSettings, IconActive: IconSettingsFilled },
] as const;

interface Props {
  view: View;
  onChange: (view: View) => void;
  lightsOn: number;
  onAllOff: () => void;
}

/** Navigation flottante + bouton rapide « Éteindre les lumières ». */
export function Island({ view, onChange, lightsOn, onAllOff }: Props) {
  return (
    <div className="island-dock">
      <nav className="island" aria-label="Navigation principale">
        {ITEMS.map(({ id, label, Icon, IconActive }) => {
          const active = view === id;
          return (
            <button
              key={id}
              className={`island__item ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              onClick={() => onChange(id)}
            >
              {active && (
                <motion.span
                  layoutId="island-indicator"
                  className="island__indicator"
                  transition={{ type: "spring", stiffness: 500, damping: 34 }}
                />
              )}
              <span className="island__icon">
                {active ? <IconActive size={22} aria-hidden="true" /> : <Icon size={22} aria-hidden="true" />}
              </span>
            </button>
          );
        })}
      </nav>

      <motion.button
        className="island-action"
        onClick={onAllOff}
        disabled={lightsOn === 0}
        aria-label={lightsOn ? `Éteindre les ${lightsOn} lumières allumées` : "Aucune lumière allumée"}
        whileTap={{ scale: 0.88, rotate: -20 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        <IconPower size={26} aria-hidden="true" />
        <AnimatedCount value={lightsOn} />
      </motion.button>
    </div>
  );
}

function AnimatedCount({ value }: { value: number }) {
  if (!value) return null;
  return (
    <motion.span
      key={value}
      className="island-action__badge"
      initial={{ scale: 0.4 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 600, damping: 15 }}
      aria-hidden="true"
    >
      {value}
    </motion.span>
  );
}
