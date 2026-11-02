import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { IconBolt, IconChevronDown, IconFlame, IconSnowflake, IconSunLow } from "@tabler/icons-react";
import { brightnessPct, type Device, lightFeatures } from "../useHome";
import { formatWatts } from "../format";
import { Dial } from "./Dial";

interface Props {
  device: Device | null;
  onClose: () => void;
  onPower: (device: Device, on: boolean) => void;
  onLight: (device: Device, data: Record<string, unknown>) => void;
}

/** Couleurs proposées pour les lampes RGB (couleurs de lumière, indépendantes du thème). */
const COLORS = [
  { name: "Fraise", rgb: [255, 70, 140] },
  { name: "Soda", rgb: [255, 236, 60] },
  { name: "Lavande", rgb: [170, 130, 255] },
  { name: "Lagon", rgb: [60, 200, 240] },
  { name: "Mandarine", rgb: [255, 140, 40] },
  { name: "Menthe", rgb: [90, 230, 160] },
] as const;

export function DeviceSheet({ device, onClose, onPower, onLight }: Props) {
  return (
    <AnimatePresence>
      {device && <Sheet key={device.id} device={device} onClose={onClose} onPower={onPower} onLight={onLight} />}
    </AnimatePresence>
  );
}

function Sheet({ device, onClose, onPower, onLight }: Props & { device: Device }) {
  const drag = useDragControls();
  const closeRef = useRef<HTMLButtonElement>(null);
  const features = lightFeatures(device);
  const kelvin = device.entity.attributes.color_temp_kelvin as number | undefined;
  const colorMode = device.entity.attributes.color_mode as string | undefined;
  const [chosenColor, setChosenColor] = useState<string | null>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  const clampK = (k: number) => Math.min(features.maxKelvin, Math.max(features.minKelvin, k));
  const presets = [
    { id: "warm", label: "Chaude", Icon: IconFlame, kelvin: clampK(2700) },
    { id: "neutral", label: "Neutre", Icon: IconSunLow, kelvin: clampK(4000) },
    { id: "cool", label: "Froide", Icon: IconSnowflake, kelvin: clampK(6500) },
  ];
  const activePreset =
    device.isOn && colorMode === "color_temp" && kelvin
      ? presets.reduce((best, p) => (Math.abs(p.kelvin - kelvin) < Math.abs(best.kelvin - kelvin) ? p : best)).id
      : null;

  return (
    <>
      <motion.div
        className="sheet-scrim"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
        drag="y"
        dragControls={drag}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 110 || info.velocity.y > 600) onClose();
        }}
      >
        <header className="sheet__header" onPointerDown={(e) => drag.start(e)}>
          <span className="sheet__handle" aria-hidden="true" />
          <div>
            <h2 id="sheet-title">{device.name}</h2>
            <p className="muted">{device.roomName}</p>
          </div>
          <button ref={closeRef} className="round-button" onClick={onClose} aria-label="Fermer">
            <IconChevronDown aria-hidden="true" />
          </button>
        </header>

        <Dial
          value={brightnessPct(device) || 100}
          on={device.isOn}
          dimmable={features.dimmable}
          disabled={!device.available}
          label={device.name}
          onPowerToggle={() => onPower(device, !device.isOn)}
          onCommit={(v) => onLight(device, { brightness_pct: v })}
        />

        {device.power !== null && (
          <div className="sheet__block sheet__power">
            <IconBolt aria-hidden="true" />
            <div>
              <p className="sheet__label">Consommation actuelle</p>
              <p className="sheet__value">{formatWatts(device.power)}</p>
            </div>
          </div>
        )}

        {features.colorTemp && (
          <fieldset className="sheet__block">
            <legend className="sheet__label">Ambiance</legend>
            <div className="tiles">
              {presets.map(({ id, label, Icon, kelvin: k }) => (
                <button
                  key={id}
                  className={`tile ${activePreset === id ? "is-selected" : ""}`}
                  aria-pressed={activePreset === id}
                  disabled={!device.available}
                  onClick={() => {
                    setChosenColor(null);
                    onLight(device, { color_temp_kelvin: k });
                  }}
                >
                  <Icon aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {features.color && (
          <fieldset className="sheet__block">
            <legend className="sheet__label">Couleur</legend>
            <div className="swatches">
              {COLORS.map((c) => (
                <motion.button
                  key={c.name}
                  className={`swatch ${chosenColor === c.name ? "is-selected" : ""}`}
                  style={{ background: `rgb(${c.rgb.join(" ")})` }}
                  aria-label={c.name}
                  aria-pressed={chosenColor === c.name}
                  disabled={!device.available}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => {
                    setChosenColor(c.name);
                    onLight(device, { rgb_color: c.rgb });
                  }}
                />
              ))}
            </div>
          </fieldset>
        )}
      </motion.section>
    </>
  );
}
