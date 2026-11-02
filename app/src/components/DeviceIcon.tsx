import { IconBulb, IconBulbOff, IconPlug, IconPlugOff } from "@tabler/icons-react";
import type { Device } from "../useHome";

export function DeviceIcon({ device, size = 40 }: { device: Device; size?: number }) {
  const Icon =
    device.domain === "light" ? (device.isOn ? IconBulb : IconBulbOff) : device.isOn ? IconPlug : IconPlugOff;
  return <Icon size={size} stroke={1.6} aria-hidden="true" />;
}
