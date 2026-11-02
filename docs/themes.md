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
| `--color-blob-1`, `--color-blob-2`, `--color-blob-3` | Les trois bulles floues du fond |
| `--color-surface` | Fond « verre dépoli » des cartes et panneaux (peut être translucide) |
| `--color-surface-solid` | Fond opaque : fiche d'un appareil, champs de saisie |
| `--color-surface-sunken` | Zones en creux : piste du cadran, boutons secondaires, sélecteurs |
| `--color-text` | Texte principal |
| `--color-text-muted` | Texte secondaire, icônes au repos |
| `--color-border` | Bordures légères |
| `--color-accent` | Couleur principale : bouton « Éteindre les lumières », cadran, sélection |
| `--color-on-accent` | Texte et icônes posés sur `--color-accent` |
| `--color-active-surface` | Fond d'une carte d'appareil **allumé** (reste sobre : la couleur vient de l'icône) |
| `--color-active-border` | Bordure d'une carte allumée |
| `--color-active-wash` | Voile coloré translucide autour de l'icône d'une carte allumée |
| `--color-on-active` | Texte sur `--color-active-surface` |
| `--color-on-active-muted` | Texte secondaire sur `--color-active-surface` (« Allumé », watts) |
| `--color-active-icon-bg` | Pastille de l'icône allumée, centre du cadran allumé, pastille du compteur |
| `--color-active-icon` | Icône posée sur `--color-active-icon-bg` |
| `--color-glow` | Lueur autour de la pastille et du bouton central du cadran |
| `--color-toggle-track`, `--color-toggle-track-on`, `--color-toggle-knob` | Interrupteurs des cartes |
| `--color-island` | Fond de l'île de navigation flottante, des pastilles et sélections actives |
| `--color-on-island` | Icônes et texte sur `--color-island` |
| `--color-island-active`, `--color-on-island-active` | Rond de l'onglet actif dans l'île |
| `--color-success` | État positif |
| `--color-danger` | Erreurs |
| `--color-focus` | Contour de focus clavier |
| `--shadow-float` | Ombre des éléments flottants |

Variables optionnelles (valeurs par défaut dans `themes/index.css`) :
`--font-family`, `--radius-card`, `--radius-control`, `--radius-island`.

Contrastes à respecter (WCAG AA) : 4,5:1 pour les textes sur leur fond
(`--color-text` et `--color-text-muted` sur `--color-bg` et
`--color-surface-solid`, `--color-on-active` et `--color-on-active-muted` sur
`--color-active-surface`, `--color-active-icon` sur `--color-active-icon-bg`, `--color-on-accent` sur `--color-accent`,
`--color-on-island` sur `--color-island`) ; 3:1 pour les icônes,
`--color-toggle-track` sur la carte et le focus.

## Thèmes existants

- **Soda Pop** (par défaut) : la palette « pink strawberry edition ». Prune
  `#391E34`, jaune soda `#FFF838` réservé à la pastille des appareils allumés
  (la carte reste blanche, ou prune claire en sombre), fuchsia `#B51C87`
  (rose `#ED8CD0` en sombre) pour les actions. Police Bricolage Grotesque.
- **Ambre** : le thème d'origine, gris et ambre.

## Ajouter un thème

1. Copier `app/src/theme/themes/soda-pop.css` en `app/src/theme/themes/<id>.css`
   et remplacer `soda-pop` par `<id>` dans les sélecteurs, puis les valeurs.
2. Ajouter `@import "./<id>.css";` dans `app/src/theme/themes/index.css`.
3. Ajouter `{ id: "<id>", label: "Nom affiché" }` dans `THEMES`
   (`app/src/theme/themes.ts`) et l'id dans la liste du script de
   `app/index.html` (application du thème avant le premier rendu).
