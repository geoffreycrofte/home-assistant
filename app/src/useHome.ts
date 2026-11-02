import { useEffect, useMemo, useState } from "react";
import {
  type Connection,
  type HassEntities,
  type HassEntity,
  subscribeEntities,
} from "home-assistant-js-websocket";

/** Domaines pilotables affichés dans l'app. */
const DOMAINS = ["light", "switch"] as const;

interface EntityRegistryEntry {
  entity_id: string;
  device_id: string | null;
  area_id: string | null;
  name: string | null;
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
  entity: HassEntity;
  name: string;
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

  useEffect(() => {
    const unsubscribe = subscribeEntities(conn, setEntities);
    const load = () => fetchRegistries(conn).then(setRegistries);
    const onReady = () => {
      setStatus("connected");
      load();
    };
    const onDisconnected = () => setStatus("reconnecting");

    load();
    conn.addEventListener("ready", onReady);
    conn.addEventListener("disconnected", onDisconnected);
    return () => {
      unsubscribe();
      conn.removeEventListener("ready", onReady);
      conn.removeEventListener("disconnected", onDisconnected);
    };
  }, [conn]);

  const rooms = useMemo(() => (entities ? buildRooms(entities, registries) : null), [entities, registries]);

  return { rooms, status };
}

function buildRooms(entities: HassEntities, registries: Registries | null): Room[] {
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
    const domain = entity.entity_id.split(".")[0];
    if (!(DOMAINS as readonly string[]).includes(domain)) continue;

    const reg = entityReg.get(entity.entity_id);
    // On masque les entités techniques (LED de statut, verrouillage enfant…).
    if (reg && (reg.disabled_by || reg.hidden_by || reg.entity_category)) continue;

    const device = reg?.device_id ? deviceReg.get(reg.device_id) : undefined;
    const areaId = reg?.area_id ?? device?.area_id ?? null;
    const roomId = areaId ?? "_none";
    const roomName = areaId ? (areaNames.get(areaId) ?? areaId) : "Sans pièce";

    if (!rooms.has(roomId)) rooms.set(roomId, { id: roomId, name: roomName, devices: [] });
    rooms.get(roomId)!.devices.push({
      entity,
      name: entity.attributes.friendly_name ?? device?.name_by_user ?? device?.name ?? entity.entity_id,
      power: reg?.device_id ? (powerByDevice.get(reg.device_id) ?? null) : null,
    });
  }

  const sorted = [...rooms.values()].sort((a, b) =>
    a.id === "_none" ? 1 : b.id === "_none" ? -1 : a.name.localeCompare(b.name, "fr"),
  );
  for (const room of sorted) room.devices.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return sorted;
}
