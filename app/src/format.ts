export function formatWatts(w: number): string {
  return `${w.toLocaleString("fr-FR", { maximumFractionDigits: w < 10 ? 1 : 0 })} W`;
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  return h >= 5 && h < 18 ? "Bonjour" : "Bonsoir";
}
