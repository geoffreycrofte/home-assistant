import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { IconPower } from "@tabler/icons-react";

interface Props {
  /** Luminosité 0–100 (0 = éteint). */
  value: number;
  on: boolean;
  dimmable: boolean;
  disabled?: boolean;
  label: string;
  onPowerToggle: () => void;
  /** Valeur finale choisie (fin du glissé, ou pause au clavier). */
  onCommit: (value: number) => void;
}

const SIZE = 280;
const C = SIZE / 2;
const R = 100;
const START = 135; // degrés, 0 = droite, sens horaire
const SWEEP = 270;
const TICKS = 46;

function polar(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) };
}

function arcPath(r: number) {
  const a = polar(r, START);
  const b = polar(r, START + SWEEP);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 1 1 ${b.x} ${b.y}`;
}

const clamp = (v: number) => Math.min(100, Math.max(1, Math.round(v)));

/** Cadran circulaire : bouton marche/arrêt au centre, luminosité sur l'anneau. */
export function Dial({ value, on, dimmable, disabled, label, onPowerToggle, onCommit }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const keyTimer = useRef<number | undefined>(undefined);
  const shown = dragValue ?? (on ? value : 0);
  const knob = polar(R, START + (SWEEP * Math.max(shown, 1)) / 100);

  useEffect(() => () => window.clearTimeout(keyTimer.current), []);

  function valueFromPointer(e: PointerEvent) {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * SIZE - C;
    const y = ((e.clientY - rect.top) / rect.height) * SIZE - C;
    let deg = (Math.atan2(y, x) * 180) / Math.PI;
    let rel = (deg - START + 720) % 360;
    // Dans l'ouverture du bas : on colle à l'extrémité la plus proche.
    if (rel > SWEEP) rel = rel > SWEEP + (360 - SWEEP) / 2 ? 0 : SWEEP;
    deg = rel;
    return clamp((deg / SWEEP) * 100);
  }

  const interactive = dimmable && !disabled;

  function onPointerDown(e: PointerEvent<SVGSVGElement>) {
    if (!interactive) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragValue(valueFromPointer(e));
  }
  function onPointerMove(e: PointerEvent<SVGSVGElement>) {
    if (dragValue !== null) setDragValue(valueFromPointer(e));
  }
  function onPointerUp() {
    if (dragValue === null) return;
    onCommit(dragValue);
    // On garde la valeur affichée jusqu'à ce que Home Assistant la confirme.
    window.setTimeout(() => setDragValue(null), 1200);
  }

  function onKeyDown(e: KeyboardEvent<SVGSVGElement>) {
    if (!interactive) return;
    const steps: Record<string, number> = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5, PageUp: 20, PageDown: -20 };
    let next: number | null = null;
    if (e.key in steps) next = clamp((dragValue ?? (on ? value : 0)) + steps[e.key]);
    if (e.key === "Home") next = 1;
    if (e.key === "End") next = 100;
    if (next === null) return;
    e.preventDefault();
    setDragValue(next);
    window.clearTimeout(keyTimer.current);
    keyTimer.current = window.setTimeout(() => {
      onCommit(next);
      window.setTimeout(() => setDragValue(null), 1200);
    }, 350);
  }

  const dragging = dragValue !== null;

  return (
    <div className={`dial ${on ? "dial--on" : ""}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="dial__ring"
        role={interactive ? "slider" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? `Luminosité de ${label}` : undefined}
        aria-valuemin={interactive ? 1 : undefined}
        aria-valuemax={interactive ? 100 : undefined}
        aria-valuenow={interactive ? shown : undefined}
        aria-valuetext={interactive ? `${shown} %` : undefined}
        aria-hidden={interactive ? undefined : true}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        {Array.from({ length: TICKS }, (_, i) => {
          const t = i / (TICKS - 1);
          const deg = START + SWEEP * t;
          const a = polar(124, deg);
          const b = polar(i % 5 === 0 ? 134 : 130, deg);
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className={`dial__tick ${t * 100 <= shown && shown > 0 ? "is-lit" : ""}`}
            />
          );
        })}
        <path d={arcPath(R)} className="dial__track" />
        <motion.path
          d={arcPath(R)}
          className="dial__progress"
          initial={false}
          animate={{ pathLength: shown / 100, opacity: shown > 0 ? 1 : 0 }}
          transition={dragging ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 22 }}
        />
        {interactive && (
          <motion.circle
            r={13}
            className="dial__knob"
            initial={false}
            animate={{ cx: knob.x, cy: knob.y, opacity: on || dragging ? 1 : 0 }}
            transition={dragging ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 22 }}
          />
        )}
      </svg>

      <motion.button
        className="dial__power"
        onClick={onPowerToggle}
        disabled={disabled}
        aria-pressed={on}
        aria-label={on ? `Éteindre ${label}` : `Allumer ${label}`}
        whileTap={{ scale: 0.9 }}
        animate={{ scale: on ? 1 : 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 14 }}
      >
        <IconPower size={36} stroke={2} aria-hidden="true" />
        <span>{disabled ? "Hors ligne" : on ? (dimmable ? `${shown} %` : "Allumé") : "Éteint"}</span>
      </motion.button>
    </div>
  );
}
