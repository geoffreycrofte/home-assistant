import { useEffect, useState } from "react";
import { type Connection, callService } from "home-assistant-js-websocket";
import { IconBolt, IconBulb, IconBulbOff, IconPlug, IconPlugOff } from "@tabler/icons-react";
import type { Device } from "./useHome";

interface Props {
  conn: Connection;
  device: Device;
}

const SUPPORTS_BRIGHTNESS = ["brightness", "color_temp", "hs", "xy", "rgb", "rgbw", "rgbww", "white"];

export function DeviceCard({ conn, device }: Props) {
  const { entity, name, power } = device;
  const [domain] = entity.entity_id.split(".");
  const isOn = entity.state === "on";
  const unavailable = entity.state === "unavailable" || entity.state === "unknown";
  const [pending, setPending] = useState(false);

  const colorModes: string[] = entity.attributes.supported_color_modes ?? [];
  const dimmable = domain === "light" && colorModes.some((m) => SUPPORTS_BRIGHTNESS.includes(m));
  const brightnessPct = Math.round(((entity.attributes.brightness as number | undefined) ?? 0) / 2.55);
  const [brightness, setBrightness] = useState(brightnessPct);

  useEffect(() => setBrightness(brightnessPct), [brightnessPct]);
  // Le nouvel état arrive par l'abonnement : on lève l'indicateur à ce moment-là.
  useEffect(() => setPending(false), [entity.state]);

  const Icon = domain === "light" ? (isOn ? IconBulb : IconBulbOff) : isOn ? IconPlug : IconPlugOff;

  async function toggle() {
    setPending(true);
    try {
      await callService(conn, domain, "toggle", { entity_id: entity.entity_id });
      // Filet de sécurité si l'appareil ne répond pas et que l'état ne change jamais.
      setTimeout(() => setPending(false), 5000);
    } catch {
      setPending(false);
    }
  }

  function commitBrightness(value: number) {
    callService(conn, "light", "turn_on", { entity_id: entity.entity_id, brightness_pct: value });
  }

  return (
    <article className={`card ${isOn ? "card--on" : ""} ${unavailable ? "card--off-line" : ""}`}>
      <button
        className="card__toggle"
        onClick={toggle}
        disabled={unavailable || pending}
        aria-pressed={isOn}
        aria-label={`${name} : ${isOn ? "allumé" : "éteint"}`}
      >
        <Icon className="card__icon" size={28} stroke={1.75} aria-hidden="true" />
        <span className="card__name">{name}</span>
        <span className="card__state">
          {unavailable ? "Indisponible" : isOn ? "Allumé" : "Éteint"}
          {power !== null && (
            <span className="card__power">
              <IconBolt size={14} aria-hidden="true" />
              {power.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} W
            </span>
          )}
        </span>
      </button>

      {dimmable && isOn && (
        <input
          className="card__slider"
          type="range"
          min={1}
          max={100}
          value={brightness}
          aria-label={`Luminosité de ${name}`}
          onChange={(e) => setBrightness(Number(e.target.value))}
          onPointerUp={(e) => commitBrightness(Number((e.target as HTMLInputElement).value))}
          onKeyUp={(e) => commitBrightness(Number((e.target as HTMLInputElement).value))}
        />
      )}
    </article>
  );
}
