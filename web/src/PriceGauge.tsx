import { assessPrice, GOOD_PRICE_LIMIT, HIGH_PRICE_LIMIT } from './price-assessment';
import type { PriceReference } from './price-assessment';

const bands = {
  good: { label: 'Buen precio', description: 'La estimación está en el tramo bajo de las referencias históricas.' },
  average: { label: 'Promedio', description: 'La estimación está en el tramo medio de las referencias históricas.' },
  expensive: { label: 'Caro', description: 'La estimación está en el tramo alto de las referencias históricas.' },
};

function point(position: number, radius: number) {
  return { x: 140 - radius * Math.cos(Math.PI * position), y: 132 - radius * Math.sin(Math.PI * position) };
}
function arc(start: number, end: number) {
  const a = point(start, 112), b = point(end, 112);
  return `M ${a.x} ${a.y} A 112 112 0 0 1 ${b.x} ${b.y}`;
}

export default function PriceGauge(reference: PriceReference) {
  const assessment = assessPrice(reference);
  const needle = assessment ? point(assessment.position, 86) : null;
  return <figure className={`price-gauge price-gauge--${assessment?.band ?? 'unknown'}`} aria-labelledby="price-gauge-heading" aria-describedby="price-gauge-summary">
    <figcaption id="price-gauge-heading">Posición del precio entre referencias de 2023</figcaption>
    <svg viewBox="0 0 280 156" width="280" height="156" aria-hidden="true" focusable="false">
      {assessment ? <>
        <path className="gauge-zone gauge-zone--good" d={arc(0, GOOD_PRICE_LIMIT)} />
        <path className="gauge-zone gauge-zone--average" d={arc(GOOD_PRICE_LIMIT, HIGH_PRICE_LIMIT)} />
        <path className="gauge-zone gauge-zone--expensive" d={arc(HIGH_PRICE_LIMIT, 1)} />
        {[GOOD_PRICE_LIMIT, HIGH_PRICE_LIMIT].map(cut => {
          const inside = point(cut, 102), outside = point(cut, 122);
          return <line key={cut} className="gauge-divider" x1={inside.x} y1={inside.y} x2={outside.x} y2={outside.y} />;
        })}
      </> : <path className="gauge-zone gauge-zone--unknown" d={arc(0, 1)} />}
      {needle && <g data-testid="price-gauge-needle">
        <line x1="140" y1="132" x2={needle.x} y2={needle.y} className="gauge-needle" />
        <circle cx="140" cy="132" r="7" className="gauge-pivot" />
      </g>}
    </svg>
    <p className="price-gauge-status" data-testid="price-gauge-status">{assessment ? bands[assessment.band].label : 'Sin referencias suficientes'}</p>
    <ul className="price-gauge-legend" aria-label="Zonas del indicador">{Object.entries(bands).map(([key, band]) => <li key={key}><span className={`gauge-dot gauge-dot--${key}`} aria-hidden="true" /><span>{band.label}</span></li>)}</ul>
    <p id="price-gauge-summary" className="price-gauge-summary">{assessment ? bands[assessment.band].description : 'No hay un intervalo de referencia completo para situar la estimación.'}</p>
    <details className="price-gauge-explanation"><summary>Cómo se interpreta</summary><p>Recupera el criterio orientativo del TFM: tramo bajo por debajo del 25 % del rango, tramo alto desde aproximadamente el 75,19 % y tramo medio entre ambos. Compara la estimación con registros del mismo modelo de 2023; no valora una oferta actual ni mide la precisión del modelo.</p></details>
  </figure>;
}
