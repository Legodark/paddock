import { useState } from 'react';
import type { Comparable, Estimate } from './types';
import { euro, integer } from './vehicle';
import Icon from './Icon';

function ComparableGroup({ rows, higher }: { rows: Comparable[]; higher: boolean }) {
  return <section className="comparable-group" aria-labelledby={higher ? 'higher-heading' : 'lower-heading'}>
    <div className="comparable-group-heading"><h3 id={higher ? 'higher-heading' : 'lower-heading'}><span className={`price-direction ${higher ? 'price-direction--high' : ''}`}><Icon name="arrow" /></span>{higher ? 'Por encima de la estimación' : 'Por debajo de la estimación'}</h3><span className="count-pill">{rows.length}</span></div>
    {rows.length ? <ul className="comparable-list">{rows.map((row, index) => <li key={`${row.modelo}-${row.año}-${row.kilometros}-${row.precio}-${index}`}>
      <div className="comparable-name"><Icon name="car" /><span>{row.modelo}</span></div>
      <div className="comparable-specs"><span><span className="sr-only">Año </span>{row.año}</span><span>{integer(row.kilometros)} km</span><strong>{euro(row.precio)}</strong></div>
    </li>)}</ul> : <div className="empty-comparables"><Icon name="database" /><p>No hay registros en este tramo de precio.</p><span>La estimación del modelo sigue disponible.</span></div>}
  </section>;
}

export default function Comparables({ estimate }: { estimate: Estimate }) {
  const [filter, setFilter] = useState<'all' | 'lower' | 'higher'>('all');
  const lower = estimate.prediction['coches-baratos'];
  const higher = estimate.prediction['coches-caros'];
  return <section className="comparables-section" aria-labelledby="comparables-heading">
    <div className="section-heading"><div><span className="eyebrow">EL CONTEXTO IMPORTA</span><h2 id="comparables-heading">Pon la cifra en perspectiva.</h2><p>Registros del mismo modelo, hasta 5.000 € por encima o por debajo de la estimación.</p></div><span className="records-badge"><Icon name="database" />{lower.length + higher.length} registros</span></div>
    <div className="comparison-toolbar"><p>{estimate.vehicle} <span>· Resultado para los datos enviados</span></p><div className="filter-buttons" role="group" aria-label="Mostrar comparables">
      <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>Todos</button>
      <button type="button" aria-pressed={filter === 'lower'} onClick={() => setFilter('lower')}>Precio menor</button>
      <button type="button" aria-pressed={filter === 'higher'} onClick={() => setFilter('higher')}>Precio mayor</button>
    </div></div>
    <div className={`comparables-grid ${filter !== 'all' ? 'comparables-grid--single' : ''}`}>
      {filter !== 'higher' && <ComparableGroup rows={lower} higher={false} />}
      {filter !== 'lower' && <ComparableGroup rows={higher} higher />}
    </div>
    <p className="comparison-note">Son registros del dataset del TFM, no anuncios disponibles para comprar hoy.</p>
  </section>;
}
