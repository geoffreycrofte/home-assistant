/**
 * Registre des thèmes.
 *
 * Pour ajouter un thème :
 *  1. Créer `themes/<id>.css` en copiant `themes/default.css`
 *     (mêmes variables, valeurs claires et sombres).
 *  2. L'importer dans `themes/index.css`.
 *  3. L'ajouter dans la liste THEMES ci-dessous.
 *
 * La liste des variables est documentée dans `docs/themes.md`.
 */
export const THEMES = [{ id: "default", label: "Ambre" }] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

/** "system" suit le réglage clair/sombre de l'appareil. */
export type ColorMode = "system" | "light" | "dark";

export const DEFAULT_THEME: ThemeId = "default";
export const DEFAULT_MODE: ColorMode = "system";

export const STORAGE_KEYS = {
  theme: "maison.theme",
  mode: "maison.colorMode",
} as const;

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((t) => t.id === value);
}

export function isColorMode(value: unknown): value is ColorMode {
  return value === "system" || value === "light" || value === "dark";
}
