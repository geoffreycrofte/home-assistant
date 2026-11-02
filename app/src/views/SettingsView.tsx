import { motion } from "motion/react";
import { IconCheck, IconDeviceDesktop, IconLogout, IconMoon, IconSun } from "@tabler/icons-react";
import { type ColorMode, THEMES } from "../theme/themes";
import { useTheme } from "../theme/ThemeProvider";

const MODES: { id: ColorMode; label: string; Icon: typeof IconSun }[] = [
  { id: "system", label: "Système", Icon: IconDeviceDesktop },
  { id: "light", label: "Clair", Icon: IconSun },
  { id: "dark", label: "Sombre", Icon: IconMoon },
];

interface Props {
  userName: string | null;
  onLogout: () => void;
}

export function SettingsView({ userName, onLogout }: Props) {
  const { theme, mode, resolvedMode, setTheme, setMode } = useTheme();

  return (
    <>
      <header className="hero">
        <h1>Réglages</h1>
      </header>

      <div className="panel">
        <fieldset className="field">
          <legend>Apparence</legend>
          <div className="segmented">
            {MODES.map(({ id, label, Icon }) => (
              <label key={id} className={mode === id ? "is-selected" : ""}>
                <input type="radio" name="mode" value={id} checked={mode === id} onChange={() => setMode(id)} />
                {mode === id && (
                  <motion.span
                    layoutId="mode-indicator"
                    className="segmented__indicator"
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                  />
                )}
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Thème</legend>
          <div className="theme-list">
            {THEMES.map((t) => (
              <label key={t.id} className={theme === t.id ? "is-selected" : ""}>
                <input
                  type="radio"
                  name="theme"
                  value={t.id}
                  checked={theme === t.id}
                  onChange={() => setTheme(t.id)}
                />
                {/* L'aperçu porte son propre data-theme : il affiche les couleurs du thème. */}
                <span className="theme-swatch" data-theme={t.id} data-mode={resolvedMode} aria-hidden="true">
                  <span className="theme-swatch__a" />
                  <span className="theme-swatch__b" />
                </span>
                <span className="theme-list__label">{t.label}</span>
                {theme === t.id && <IconCheck size={20} aria-hidden="true" />}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="panel">
        {userName && <p className="muted">Connecté en tant que {userName}</p>}
        <button className="button button--quiet" onClick={onLogout}>
          <IconLogout size={20} aria-hidden="true" />
          Se déconnecter
        </button>
      </div>
    </>
  );
}
