import { forwardRef } from 'react';
import type { Estimate } from './types';
import { euro, integer } from './vehicle';
import Icon from './Icon';

function CarDrawing() {
  return <svg className="car-drawing" viewBox="0 0 360 170" fill="none" aria-hidden="true" focusable="false">
    <path className="drawing-grid" d="M0 140h360M25 115h310M55 90h250M90 65h180M120 40h120M75 160l55-125M145 160l12-125M215 160 203 35M285 160 230 35" />
    <ellipse cx="181" cy="137" rx="147" ry="10" fill="currentColor" opacity=".06" />
    <path d="m43 111 7-24 63-11 38-33h81l44 38 40 15 6 29h-28m-47 0H123m-47 0H43v-14Z" stroke="currentColor" strokeWidth="2" />
    <path d="m129 76 29-26h68l30 28-127-2ZM188 50v27M58 92l28 3-4 12H48M296 96l-5 12h27M139 88h16M209 89h16M123 125l12-27h99l13 27" stroke="currentColor" opacity=".6" strokeWidth="1.5" />
    <circle cx="100" cy="123" r="24" fill="var(--surface)" stroke="currentColor" strokeWidth="2" />
    <circle cx="100" cy="123" r="12" stroke="currentColor" opacity=".5" />
    <circle cx="270" cy="123" r="24" fill="var(--surface)" stroke="currentColor" strokeWidth="2" />
    <circle cx="270" cy="123" r="12" stroke="currentColor" opacity=".5" />
  </svg>;
}

const EstimateCard = forwardRef<HTMLHeadingElement, { estimate: Estimate | null; dirty: boolean; pending: boolean }>(
  function EstimateCard({ estimate, dirty, pending }, ref) {
    if (!estimate) return <aside className="estimate-card estimate-card--empty" aria-labelledby="empty-estimate-heading">
      <span className="eyebrow"><span className="status-dot" />TU ESTIMACIÓN</span>
      <CarDrawing />
      <h2 id="empty-estimate-heading">Los detalles marcan<br />la diferencia.</h2>
      <p>Completa las características del coche. Aquí encontrarás su estimación y los precios de referencia del catálogo original.</p>
      <ul className="estimate-benefits">
        <li><Icon name="check" />Una estimación orientativa</li>
        <li><Icon name="check" />Comparables del mismo modelo</li>
        <li><Icon name="check" />El contexto del proyecto original</li>
      </ul>
      <div className="estimate-footnote"><Icon name="clock" /><span>Una mirada al mercado de 2023.</span></div>
    </aside>;

    const prediction = estimate.prediction;
    const hasLow = prediction['coches-baratos'].length > 0;
    const hasHigh = prediction['coches-caros'].length > 0;
    const low = prediction['precio-minimo'];
    const high = prediction['precio-maximo'];
    const position = high > low ? Math.max(5, Math.min(95, (prediction.prediccion - low) / (high - low) * 100)) : 50;
    return <aside className={`estimate-card ${dirty ? 'estimate-card--dirty' : ''}`} aria-labelledby="estimate-heading" aria-busy={pending}>
      <div className="estimate-topline"><span className="eyebrow"><span className="status-dot" />RESULTADO HISTÓRICO</span><span className="model-pill">TFM · 2023</span></div>
      <h2 id="estimate-heading" ref={ref} tabIndex={-1}>Estimación orientativa</h2>
      <p className="estimate-vehicle">{estimate.vehicle}</p>
      <div className="vehicle-tags"><span>{estimate.form.year}</span><span>{integer(Number(estimate.form.km))} km</span><span>{estimate.form.horses} CV</span></div>
      <p className="estimated-value" data-testid="estimated-price">{euro(prediction.prediccion)}</p>
      <p className="rounding-note">Cifra redondeada al euro · Modelo original del TFM</p>
      {dirty && <p className="stale-notice" role="status"><Icon name="info" />Has cambiado los datos. Actualiza la estimación para ver el nuevo resultado.</p>}
      <div className="reference-range">
        <div className="reference-range-label">Referencias del catálogo<Icon name="sliders" /></div>
        {(hasLow || hasHigh) && <div className="range-track" aria-hidden="true"><span className="range-point" style={{ left: `${position}%` }} /></div>}
        <div className="reference-values">
          <div><span>Referencia inferior</span><strong>{hasLow ? euro(low) : 'Sin referencias'}</strong></div>
          <div><span>Referencia superior</span><strong>{hasHigh ? euro(high) : 'Sin referencias'}</strong></div>
        </div>
        <p>Precios del catálogo histórico, no un intervalo de confianza.</p>
      </div>
      <div className="estimate-footnote"><Icon name="info" /><span>Este modelo no refleja los precios actuales del mercado.</span></div>
    </aside>;
  },
);
export default EstimateCard;
