import { useEffect, useRef } from "react";
import { IconCheck, IconDeviceDesktop, IconLogout, IconMoon, IconSun, IconX } from "@tabler/icons-react";
import { type ColorMode, THEMES } from "./theme/themes";
import { useTheme } from "./theme/ThemeProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const MODES: { id: ColorMode; label: string; Icon: typeof IconSun }[] = [
  { id: "system", label: "Système", Icon: IconDeviceDesktop },
  { id: "light", label: "Clair", Icon: IconSun },
  { id: "dark", label: "Sombre", Icon: IconMoon },
];

export function Settings({ open, onClose, onLogout }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const { theme, mode, resolvedMode, setTheme, setMode } = useTheme();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby="settings-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="sheet__header">
        <h2 id="settings-title">Réglages</h2>
        <button className="icon-button" onClick={onClose} aria-label="Fermer">
          <IconX aria-hidden="true" />
        </button>
      </div>

      <fieldset className="field">
        <legend>Apparence</legend>
        <div className="segmented">
          {MODES.map(({ id, label, Icon }) => (
            <label key={id} className={mode === id ? "is-selected" : ""}>
              <input type="radio" name="mode" value={id} checked={mode === id} onChange={() => setMode(id)} />
              <Icon size={18} aria-hidden="true" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend>Thème</legend>
        <div className="theme-list">
          {THEMES.map((t) => (
            <label key={t.id} className={theme === t.id ? "is-selected" : ""}>
              <input type="radio" name="theme" value={t.id} checked={theme === t.id} onChange={() => setTheme(t.id)} />
              <span className="theme-swatch" data-theme={t.id} data-mode={resolvedMode} aria-hidden="true">
                <span />
              </span>
              <span className="theme-list__label">{t.label}</span>
              {theme === t.id && <IconCheck size={18} aria-hidden="true" />}
            </label>
          ))}
        </div>
      </fieldset>

      <button className="ghost danger" onClick={onLogout}>
        <IconLogout size={18} aria-hidden="true" />
        Se déconnecter
      </button>
    </dialog>
  );
}
