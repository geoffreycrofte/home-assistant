import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { StatusBar, Style } from "@capacitor/status-bar";

/** Vrai dans l'app native (Android/iOS), faux dans le navigateur. */
export const isNative = Capacitor.isNativePlatform();

/** Petite vibration de confirmation (app native uniquement). */
export function tap(strength: "light" | "medium" = "light") {
  if (!isNative) return;
  Haptics.impact({ style: strength === "light" ? ImpactStyle.Light : ImpactStyle.Medium }).catch(() => {});
}

/** Accorde les icônes de la barre d'état (heure, batterie) au mode clair/sombre. */
export function syncStatusBar(mode: "light" | "dark") {
  if (!isNative) return;
  // Style.Dark = texte clair, pour un fond sombre.
  StatusBar.setStyle({ style: mode === "dark" ? Style.Dark : Style.Light }).catch(() => {});
}
