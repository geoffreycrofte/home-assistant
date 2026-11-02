import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type Connection,
  type HassEntities,
  type HassEntity,
  callService,
  getUser,
  subscribeEntities,
} from "home-assistant-js-websocket";

/** Domaines pilotables affichés dans l'app. */
const DOMAINS = ["light", "switch"] as const;

/** Durée max d'un état « optimiste » si Home Assistant ne confirme pas. */
const OPTIMISTIC_TIMEOUT = 5000;

interface EntityRegistryEntry {
  entity_id: string;
  device_id: string | null;
  area_id: string | null;
  disabled_by: string | null;
  hidden_by: string | null;
  entity_category: string | null;
}

interface DeviceRegistryEntry {
  id: string;
  area_id: string | null;
  name: string | null;
  name_by_user: string | null;
}

interface AreaRegistryEntry {
  area_id: string;
  name: string;
}

interface Registries {
  entities: EntityRegistryEntry[];
  devices: DeviceRegistryEntry[];
  areas: AreaRegistryEntry[];
}

export interface Device {
  id: string;
  domain: "light" | "switch";
  entity: HassEntity;
  name: string;
  roomId: string;
  roomName: string;
  /** État affiché : celui de Home Assistant, ou l'état demandé en attendant sa confirmation. */
  isOn: boolean;
  available: boolean;
  /** Consommation instantanée en watts (prises Tapo P110 par ex.). */
  power: number | null;
}

export interface Room {
  id: string;
  name: string;
  devices: Device[];
}

export type ConnectionState = "connected" | "reconnecting";

async function fetchRegistries(conn: Connection): Promise<Registries | null> {
  try {
    const [entities, devices, areas] = await Promise.all([
      conn.sendMessagePromise<EntityRegistryEntry[]>({ type: "config/entity_registry/list" }),
      conn.sendMessagePromise<DeviceRegistryEntry[]>({ type: "config/device_registry/list" }),
      conn.sendMessagePromise<AreaRegistryEntry[]>({ type: "config/area_registry/list" }),
    ]);
    return { entities, devices, areas };
  } catch {
    // Les registres demandent un compte administrateur : sans eux,
    // on affiche simplement tout dans une seule liste.
    return null;
  }
}

export function useHome(conn: Connection) {
  const [entities, setEntities] = useState<HassEntities | null>(null);
  const [registries, setRegistries] = useState<Registries | null>(null);
  const [status, setStatus] = useState<ConnectionState>("connected");
  const [userName, setUserName] = useState<string | null>(null);
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
  const timers = useRef(new Map<string, number>());

  useEffect(() => {
    const unsubscribe = subscribeEntities(conn, setEntities);
    const load = () => fetchRegistries(conn).then(setRegistries);
    const onReady = () => {
      setStatus("connected");
      load();
    };
    const onDisconnected = () => setStatus("reconnecting");

    load();
    getUser(conn)
      .then((u) => setUserName(u.name))
      .catch(() => setUserName(null));
    conn.addEventListener("ready", onReady);
    conn.addEventListener("disconnected", onDisconnected);
    return () => {
      unsubscribe();
      conn.removeEventListener("ready", onReady);
      conn.removeEventListener("disconnected", onDisconnected);
    };
  }, [conn]);

  const clearOptimistic = useCallback((id: string) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setOptimistic((o) => {
      if (!(id in o)) return o;
      const next = { ...o };
      delete next[id];
      return next;
    });
  }, []);

  // Dès que Home Assistant confirme l'état demandé, on lâche l'état optimiste.
  useEffect(() => {
    if (!entities) return;
    for (const [id, wanted] of Object.entries(optimistic)) {
      if ((entities[id]?.state === "on") === wanted) clearOptimistic(id);
    }
  }, [entities, optimistic, clearOptimistic]);

  const setPower = useCallback(
    async (device: Device, on: boolean) => {
      window.clearTimeout(timers.current.get(device.id));
      setOptimistic((o) => ({ ...o, [device.id]: on }));
      timers.current.set(
        device.id,
        window.setTimeout(() => clearOptimistic(device.id), OPTIMISTIC_TIMEOUT),
      );
      try {
        await callService(conn, device.domain, on ? "turn_on" : "turn_off", { entity_id: device.id });
      } catch {
        clearOptimistic(device.id);
      }
    },
    [conn, clearOptimistic],
  );

  const lightOn = useCallback(
    (device: Device, data: Record<string, unknown>) => {
      if (!device.isOn) setOptimistic((o) => ({ ...o, [device.id]: true }));
      return callService(conn, "light", "turn_on", { entity_id: device.id, ...data });
    },
    [conn],
  );

  const rooms = useMemo(
    () => (entities ? buildRooms(entities, registries, optimistic) : null),
    [entities, registries, optimistic],
  );

  return { rooms, status, userName, setPower, lightOn };
}

function buildRooms(
  entities: HassEntities,
  registries: Registries | null,
  optimistic: Record<string, boolean>,
): Room[] {
  const entityReg = new Map(registries?.entities.map((e) => [e.entity_id, e]));
  const deviceReg = new Map(registries?.devices.map((d) => [d.id, d]));
  const areaNames = new Map(registries?.areas.map((a) => [a.area_id, a.name]));

  // Capteurs de puissance indexés par appareil physique.
  const powerByDevice = new Map<string, number>();
  for (const e of Object.values(entities)) {
    if (!e.entity_id.startsWith("sensor.") || e.attributes.device_class !== "power") continue;
    const deviceId = entityReg.get(e.entity_id)?.device_id;
    const value = Number.parseFloat(e.state);
    if (deviceId && Number.isFinite(value)) powerByDevice.set(deviceId, value);
  }

  const rooms = new Map<string, Room>();
  for (const entity of Object.values(entities)) {
    const domain = entity.entity_id.split(".")[0] as Device["domain"];
    if (!(DOMAINS as readonly string[]).includes(domain)) continue;

    const reg = entityReg.get(entity.entity_id);
    // On masque les entités techniques (LED de statut, verrouillage enfant…).
    if (reg && (reg.disabled_by || reg.hidden_by || reg.entity_category)) continue;

    const device = reg?.device_id ? deviceReg.get(reg.device_id) : undefined;
    const areaId = reg?.area_id ?? device?.area_id ?? null;
    const roomId = areaId ?? "_none";
    const roomName = areaId ? (areaNames.get(areaId) ?? areaId) : "Sans pièce";
    const available = entity.state !== "unavailable" && entity.state !== "unknown";

    if (!rooms.has(roomId)) rooms.set(roomId, { id: roomId, name: roomName, devices: [] });
    rooms.get(roomId)!.devices.push({
      id: entity.entity_id,
      domain,
      entity,
      name: entity.attributes.friendly_name ?? device?.name_by_user ?? device?.name ?? entity.entity_id,
      roomId,
      roomName,
      isOn: optimistic[entity.entity_id] ?? entity.state === "on",
      available,
      power: reg?.device_id ? (powerByDevice.get(reg.device_id) ?? null) : null,
    });
  }

  const sorted = [...rooms.values()].sort((a, b) =>
    a.id === "_none" ? 1 : b.id === "_none" ? -1 : a.name.localeCompare(b.name, "fr"),
  );
  for (const room of sorted) room.devices.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return sorted;
}

/** Capacités d'une lampe, déduites de ses modes de couleur. */
export function lightFeatures(device: Device) {
  const modes: string[] = device.entity.attributes.supported_color_modes ?? [];
  const colorModes = ["hs", "xy", "rgb", "rgbw", "rgbww"];
  return {
    dimmable: device.domain === "light" && modes.some((m) => m !== "onoff"),
    colorTemp: modes.includes("color_temp"),
    color: modes.some((m) => colorModes.includes(m)),
    minKelvin: (device.entity.attributes.min_color_temp_kelvin as number | undefined) ?? 2700,
    maxKelvin: (device.entity.attributes.max_color_temp_kelvin as number | undefined) ?? 6500,
  };
}

export function brightnessPct(device: Device): number {
  const b = device.entity.attributes.brightness as number | undefined;
  return b ? Math.max(1, Math.round(b / 2.55)) : 0;
}
