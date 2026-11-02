/** Fond décoratif : trois « bulles » floues aux couleurs du thème. */
export function Background() {
  return (
    <div className="backdrop" aria-hidden="true">
      <span className="backdrop__blob backdrop__blob--1" />
      <span className="backdrop__blob backdrop__blob--2" />
      <span className="backdrop__blob backdrop__blob--3" />
    </div>
  );
}
