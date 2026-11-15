import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { classifyMessage, getSearchCatalog, searchCars } from './api';
import { classifierText, interpretMessage } from './chat-interpreter';
import type { Interpretation } from './chat-interpreter';
import type { HistoricalCar, SearchCatalog } from './types';
import { euro, integer } from './vehicle';
import Icon from './Icon';
import './chat.css';

interface Exchange { id: number; question: string; answer: string }
interface Outcome {
  interpretation: Interpretation;
  answer: string;
  cars?: HistoricalCar[];
  confirmation?: 'classifier' | 'unfiltered';
}
const examples = [
  'Busco coches Citroën de menos de 20.000 euros en Málaga',
  'Quiero coches diésel con menos de 50.000 km y más de 100 CV',
  'Muéstrame Seat León del año 2019',
];

function SearchResults({ cars }: { cars: HistoricalCar[] }) {
  if (!cars.length) return <div className="chat-empty"><Icon name="database" /><p>No hay registros que cumplan todos estos filtros.</p><span>Prueba con un presupuesto mayor o menos restricciones.</span></div>;
  return <ul className="chat-car-list" aria-label="Coches del catálogo histórico">{cars.map((car, index) =>
    <li key={`${car.model}-${car.price}-${car.km}-${index}`}>
      <div className="chat-car-heading"><Icon name="car" /><h4>{car.model}</h4><strong>{euro(car.price)}</strong></div>
      <p className="chat-car-location">{car.location} · {car.fuel} · {car.gearbox}</p>
      <dl>
        <div><dt>Año</dt><dd>{car.year}</dd></div>
        <div><dt>Kilómetros</dt><dd>{integer(car.km)} km</dd></div>
        <div><dt>Potencia</dt><dd>{integer(car.horses)} CV</dd></div>
        <div><dt>Cilindrada</dt><dd>{integer(car.engine)} cm³</dd></div>
        <div><dt>Marchas</dt><dd>{car.marches}</dd></div>
      </dl>
    </li>)}</ul>;
}

export default function CatalogChat() {
  const [catalog, setCatalog] = useState<SearchCatalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Exchange[]>([]);
  const [phase, setPhase] = useState<'classify' | 'search' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [status, setStatus] = useState('');
  const input = useRef<HTMLTextAreaElement>(null);
  const outcomeHeading = useRef<HTMLHeadingElement>(null);
  const active = useRef<AbortController | null>(null);
  const exchangeSequence = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    setCatalogError(null);
    getSearchCatalog(controller.signal).then(setCatalog).catch(error => {
      if (!controller.signal.aborted) setCatalogError(error instanceof Error ? error.message : 'No se pudo cargar el catálogo de consulta.');
    });
    return () => controller.abort();
  }, [catalogAttempt]);
  useEffect(() => () => active.current?.abort(), []);
  useEffect(() => {
    if (!outcome || phase) return;
    outcomeHeading.current?.focus({ preventScroll: true });
    outcomeHeading.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
  }, [outcome, phase]);

  function append(question: string, answer: string) {
    const id = exchangeSequence.current++;
    setHistory(current => [...current, { id, question, answer }].slice(-6));
  }
  function cancel() {
    active.current?.abort(); active.current = null; setPhase(null);
    setStatus('Consulta cancelada. Puedes editarla y volver a buscar.');
  }
  function clear() {
    active.current?.abort(); active.current = null;
    setPhase(null); setMessage(''); setHistory([]); setOutcome(null); setError(null);
    setStatus('Conversación eliminada de esta página.'); input.current?.focus();
  }
  function fillExample(value: string) {
    setMessage(value); setError(null); setOutcome(null); setStatus('Ejemplo cargado. Puedes editarlo antes de consultar.');
    input.current?.focus();
  }
  function editLast() {
    const last = history.at(-1);
    if (!last) return;
    setMessage(last.question); setOutcome(null); setError(null);
    requestAnimationFrame(() => { input.current?.focus(); input.current?.scrollIntoView({ block: 'nearest' }); });
  }

  async function run(confirmed = false) {
    if (!catalog || active.current) return;
    const question = message.trim();
    if (!question || question.length > 2000) {
      setError('Escribe una consulta de entre 1 y 2.000 caracteres.'); input.current?.focus(); return;
    }
    // Parse again after edits; confirmation never reuses a previous hidden filter set.
    const interpretation = interpretMessage(question, catalog);
    const hasFilters = Object.keys(interpretation.filters).length > 0;
    const prepared = classifierText(question, catalog);
    if (!confirmed && prepared.length > 2000) {
      setError('Acorta la consulta: su versión normalizada supera el límite del clasificador.'); input.current?.focus(); return;
    }
    const controller = new AbortController(); active.current = controller;
    setPhase('classify'); setError(null); setOutcome(null); setStatus('');
    try {
      const context = confirmed ? 1 : await classifyMessage(prepared, controller.signal);
      if (controller.signal.aborted) return;
      if (context === 0 && !hasFilters) {
        const answer = 'Soy el asistente del TFM y solo consulto el catálogo histórico de coches. Prueba con una marca, una provincia o un límite de precio.';
        append(question, answer); setOutcome({ interpretation: { filters: {}, chips: [], issues: [] }, answer }); return;
      }
      if (interpretation.issues.length) {
        const answer = 'Necesito que revises la consulta: hay condiciones que no puedo interpretar con seguridad. No he realizado ninguna búsqueda.';
        append(question, answer); setOutcome({ interpretation, answer }); return;
      }
      if (!confirmed && (context === 0 || !hasFilters)) {
        const answer = context === 0
          ? 'El clasificador original no ha reconocido esta petición como una consulta de coches. He identificado estos filtros: puedes revisarlos y confirmar la búsqueda.'
          : 'No has indicado filtros. Puedes añadirlos o confirmar que quieres ver hasta diez registros del catálogo, ordenados por precio.';
        append(question, answer); setOutcome({ interpretation, answer, confirmation: context === 0 ? 'classifier' : 'unfiltered' }); return;
      }
      setPhase('search');
      const cars = await searchCars(interpretation.filters, controller.signal);
      if (controller.signal.aborted) return;
      const answer = cars.length
        ? `He encontrado ${cars.length} registros para estos filtros. Muestro hasta diez, ordenados por precio; los datos son históricos.`
        : 'No hay registros que cumplan todos estos filtros. Puedes reformular la consulta.';
      append(question, answer); setOutcome({ interpretation, answer, cars }); setMessage('');
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(error instanceof Error ? error.message : 'No se pudo completar la consulta.');
        input.current?.focus();
      }
    } finally {
      if (active.current === controller) { active.current = null; setPhase(null); }
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void run(); }

  const queryForm = <form className="chat-form" onSubmit={submit} aria-label="Consulta del catálogo" aria-busy={phase !== null} noValidate>
    <label htmlFor="chat-message">Tu consulta sobre coches</label>
    <textarea id="chat-message" ref={input} value={message} maxLength={2000} rows={3} readOnly={phase !== null} disabled={!catalog} aria-invalid={error ? 'true' : undefined} aria-describedby={`chat-help${error ? ' chat-error' : ''}`} onChange={event => { setMessage(event.target.value); setError(null); setOutcome(null); }} placeholder="Por ejemplo: Citroën de menos de 20.000 euros en Málaga" />
    <div className="chat-input-help"><p id="chat-help">Hasta 2.000 caracteres. La conversación se conserva solo en esta página; no envíes datos personales.</p><span aria-hidden="true">{message.length}/2000</span></div>
    {error && <p id="chat-error" className="chat-error" role="alert">No se pudo completar la consulta. {error}</p>}
    <div className="chat-actions"><button type="submit" className="primary-button" disabled={!catalog || phase !== null}>{phase === 'classify' ? 'Interpretando consulta…' : phase === 'search' ? 'Buscando en el catálogo…' : 'Buscar en el catálogo'}{phase ? <span className="spinner" aria-hidden="true" /> : <Icon name="arrow" />}</button>
      {phase && <button type="button" className="text-button" onClick={cancel}>Cancelar consulta</button>}
      <button type="button" className="text-button" onClick={clear}><Icon name="reset" />Limpiar conversación</button></div>
  </form>;

  return <section id="consultar" className="chat-section" aria-labelledby="chat-heading">
    <div className="section-heading"><div><span className="eyebrow">EL ASISTENTE DEL TFM</span><h2 id="chat-heading">Busca en el catálogo original.</h2><p>Describe un coche y consulta el catálogo original. Cada mensaje inicia una búsqueda nueva.</p></div><span className="records-badge"><Icon name="database" />Catálogo de 2023</span></div>
    <div className="chat-panel">
      <div className="chat-intro"><span className="chat-avatar" aria-hidden="true">E</span><div><strong>Eistein</strong><p>Uso el clasificador original y reglas de búsqueda. Puedes indicar marca, modelo, provincia, combustible, cambio, año, precio, km, CV, cilindrada y marchas.</p></div></div>
      <div className="chat-examples" aria-label="Ejemplos de consulta">{examples.map(example => <button key={example} type="button" disabled={!catalog || phase !== null} onClick={() => fillExample(example)}>{example}<Icon name="arrow" /></button>)}</div>
      {catalogError ? <div className="chat-catalog-error" role="alert"><p>No hemos podido cargar el catálogo de consulta. {catalogError}</p><button type="button" className="secondary-button" onClick={() => setCatalogAttempt(value => value + 1)}>Reintentar catálogo de consulta</button></div>
        : !catalog && <p role="status" className="chat-loading">Preparando las marcas, modelos y provincias…</p>}
      {queryForm}
      {history.length > 0 && <div className="chat-history" role="log" aria-label="Conversación con Eistein" aria-live="polite" aria-relevant="additions"><ol>{history.map((exchange, index) => <li key={exchange.id}><p className="chat-question"><span>Tú</span>{exchange.question}</p>{(!outcome || index !== history.length - 1) && <p className="chat-answer"><span>Eistein</span>{exchange.answer}</p>}</li>)}</ol></div>}
      {outcome && <div className="chat-outcome" aria-labelledby="chat-outcome-heading">
        <div className="chat-outcome-heading-row"><h3 id="chat-outcome-heading" ref={outcomeHeading} tabIndex={-1}>{outcome.cars !== undefined ? 'Resultados del catálogo' : 'Respuesta de Eistein'}</h3><button type="button" className="text-button" onClick={editLast}>Editar consulta<Icon name="reset" /></button></div>
        <p className="chat-outcome-answer">{outcome.answer}</p>
        {outcome.interpretation.chips.length > 0 && <ul className="chat-filter-chips" aria-label="Filtros interpretados">{outcome.interpretation.chips.map(chip => <li key={chip}>{chip}</li>)}</ul>}
        {outcome.interpretation.issues.length > 0 && <ul className="chat-issues">{outcome.interpretation.issues.map(issue => <li key={issue}>{issue}</li>)}</ul>}
        {outcome.confirmation && <button type="button" className="secondary-button" disabled={phase !== null} onClick={() => void run(true)}>{outcome.confirmation === 'classifier' ? 'Buscar con estos filtros' : 'Ver diez registros del catálogo'}</button>}
        {outcome.cars !== undefined && <><p className="chat-result-count">{outcome.cars.length} registros · Hasta 10, ordenados por precio</p><SearchResults cars={outcome.cars} /><p className="comparison-note">Son datos del TFM, no anuncios disponibles ni precios actuales.</p></>}
      </div>}
      <p className="sr-only" role="status">{status}</p>
    </div>
  </section>;
}
