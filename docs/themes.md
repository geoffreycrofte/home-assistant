# Thèmes

L'app gère **plusieurs thèmes**, chacun en version **claire et sombre**.
L'utilisateur choisit le thème et le mode (Système / Clair / Sombre) dans
**Réglages** ; le choix est mémorisé sur l'appareil.

## Fonctionnement

- `<html>` porte deux attributs : `data-theme="<id>"` et
  `data-mode="light" | "dark"` (le mode « Système » est résolu en clair ou
  sombre par `src/theme/ThemeProvider.tsx`).
- Chaque thème est un fichier CSS dans `app/src/theme/themes/` qui définit des
  **variables** pour `[data-theme="<id>"]` (clair) et
  `[data-theme="<id>"][data-mode="dark"]` (sombre).
- Les composants n'utilisent **que** ces variables, jamais de couleur en dur.
- Les sélecteurs portent sur `[data-theme]` et non `:root` : n'importe quel
  élément peut afficher un autre thème (c'est ce qu'utilise l'aperçu dans les
  Réglages).

## Variables à définir pour chaque thème

| Variable | Rôle |
|---|---|
| `--color-bg` | Fond de l'app (et couleur de la barre du navigateur) |
| `--color-surface` | Fond des cartes, champs, panneau des réglages |
| `--color-text` | Texte principal |
| `--color-text-muted` | Texte secondaire, icônes au repos |
| `--color-border` | Bordures des cartes et champs |
| `--color-accent` | Couleur principale : boutons, curseurs, sélection |
| `--color-on-accent` | Texte posé sur `--color-accent` (boutons) |
| `--color-active-surface` | Fond d'une carte d'appareil **allumé** |
| `--color-active-border` | Bordure d'une carte d'appareil allumé |
| `--color-active-icon` | Icône d'un appareil allumé |
| `--color-success` | État « Connecté » |
| `--color-danger` | Erreurs, « Reconnexion… », déconnexion |
| `--color-focus` | Contour de focus clavier |

Variables optionnelles (valeurs par défaut dans `themes/index.css`) :
`--font-family`, `--radius-card`, `--radius-control`.

Contrastes à respecter (WCAG AA) : 4,5:1 pour `--color-text` et
`--color-text-muted` sur `--color-bg`, `--color-surface` et
`--color-active-surface` ; 4,5:1 pour `--color-on-accent` sur
`--color-accent` ; 3:1 pour les icônes, bordures actives et le focus.

## Ajouter un thème

1. Copier `app/src/theme/themes/default.css` en `app/src/theme/themes/<id>.css`
   et remplacer `default` par `<id>` dans les sélecteurs, puis les valeurs.
2. Ajouter `@import "./<id>.css";` dans `app/src/theme/themes/index.css`.
3. Ajouter `{ id: "<id>", label: "Nom affiché" }` dans `THEMES`
   (`app/src/theme/themes.ts`).
