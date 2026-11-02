import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { callService, type Connection } from "home-assistant-js-websocket";
import { IconWifiOff } from "@tabler/icons-react";
import { type Device, useHome } from "./useHome";
import { Island, type View } from "./components/Island";
import { DeviceSheet } from "./components/DeviceSheet";
import { HomeView } from "./views/HomeView";
import { EnergyView } from "./views/EnergyView";
import { SettingsView } from "./views/SettingsView";

interface Props {
  conn: Connection;
  onLogout: () => void;
}

export function Shell({ conn, onLogout }: Props) {
  const { rooms, status, userName, setPower, lightOn } = useHome(conn);
  const [view, setView] = useState<View>("home");
  const [openId, setOpenId] = useState<string | null>(null);

  const devices = rooms?.flatMap((r) => r.devices) ?? [];
  const openDevice = devices.find((d) => d.id === openId) ?? null;
  const lightsOn = devices.filter((d) => d.domain === "light" && d.isOn);

  const open = useCallback((d: Device) => setOpenId(d.id), []);
  const close = useCallback(() => setOpenId(null), []);

  function allLightsOff() {
    for (const d of lightsOn) setPower(d, false);
    if (lightsOn.length) callService(conn, "light", "turn_off", { entity_id: lightsOn.map((d) => d.id) });
  }

  return (
    <>
      <div className="shell" inert={openDevice !== null}>
        <AnimatePresence>
          {status === "reconnecting" && (
            <motion.p
              className="offline-pill"
              role="status"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
            >
              <IconWifiOff size={18} aria-hidden="true" />
              Connexion perdue, reconnexion…
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={view}
            className="view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {view === "home" && <HomeView rooms={rooms} userName={userName} onToggle={setPower} onOpen={open} />}
            {view === "energy" && <EnergyView rooms={rooms} onOpen={open} />}
            {view === "settings" && <SettingsView userName={userName} onLogout={onLogout} />}
          </motion.main>
        </AnimatePresence>

        <Island view={view} onChange={setView} lightsOn={lightsOn.length} onAllOff={allLightsOff} />
      </div>

      <DeviceSheet device={openDevice} onClose={close} onPower={setPower} onLight={lightOn} />
    </>
  );
}
