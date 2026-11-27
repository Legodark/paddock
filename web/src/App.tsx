import { useEffect, useRef, useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import { getCatalog, predictVehicle } from './api';
import type { Catalog, Estimate, FormErrors, VehicleForm } from './types';
import { EMPTY_FORM, EXAMPLE_FORM, makePredictionRequest, validateVehicle, vehicleLabel } from './vehicle';
import VehicleEditor from './VehicleEditor';
import EstimateCard from './EstimateCard';
import Comparables from './Comparables';
import Icon from './Icon';
import CatalogChat from './CatalogChat';
import deloreanImage from './assets/delorean.webp?no-inline';

const NAV_SECTIONS = [['estimador', 'Estimar'], ['consultar', 'Consultar'], ['proyecto', 'Proyecto']] as const;
function sectionFromHash() {
  return NAV_SECTIONS.find(([id]) => window.location.hash === `#${id}`)?.[0] ?? 'estimador';
}

export default function App() {
  const [activeSection, setActiveSection] = useState(sectionFromHash);
  const [chatOpenRequest, setChatOpenRequest] = useState(0);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [form, setForm] = useState<VehicleForm>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<FormErrors>({});
  const [pending, setPending] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [notice, setNotice] = useState('');
  const [estimateNumber, setEstimateNumber] = useState(0);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorBox = useRef<HTMLDivElement>(null);
  const activePrediction = useRef<AbortController | null>(null);

  function openChatFromNavigation(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (window.location.hash !== '#consultar') window.history.pushState(null, '', '#consultar');
    setActiveSection('consultar');
    setChatOpenRequest(value => value + 1);
  }

  useEffect(() => {
    const syncSection = () => setActiveSection(sectionFromHash());
    window.addEventListener('hashchange', syncSection);
    return () => window.removeEventListener('hashchange', syncSection);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setCatalogError(null);
    getCatalog(controller.signal).then(setCatalog).catch(error => {
      if (!controller.signal.aborted) setCatalogError(error instanceof Error ? error.message : 'No se pudo cargar el catálogo.');
    });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => () => activePrediction.current?.abort(), []);
  useEffect(() => {
    if (!estimate) return;
    resultHeading.current?.focus({ preventScroll: true });
    resultHeading.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: window.matchMedia('(max-width: 900px)').matches ? 'start' : 'nearest',
    });
  }, [estimate]);
  useEffect(() => { if (predictionError) errorBox.current?.focus(); }, [predictionError]);

  const dirty = estimate !== null && (Object.keys(form) as (keyof VehicleForm)[]).some(key => form[key] !== estimate.form[key]);

  function change(field: keyof VehicleForm, value: string) {
    setForm(current => field === 'brand_id' ? { ...current, brand_id: value, model_id: '' } : { ...current, [field]: value });
    setErrors(current => ({ ...current, [field]: undefined, ...(field === 'brand_id' ? { model_id: undefined } : {}) }));
    setPredictionError(null);
    setNotice('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!catalog || activePrediction.current) return;
    const validation = validateVehicle(form, catalog);
    setErrors(validation);
    setPredictionError(null);
    if (Object.keys(validation).length) {
      const first = (Object.keys(EMPTY_FORM) as (keyof VehicleForm)[]).find(key => validation[key]);
      const id = first === 'gearbox_id' ? `vehicle-gearbox_id-${Object.keys(catalog.gearboxes)[0]}` : `vehicle-${first}`;
      document.getElementById(id)?.focus();
      return;
    }
    const controller = new AbortController();
    activePrediction.current = controller;
    setPending(true);
    try {
      const prediction = await predictVehicle(makePredictionRequest(form, catalog), controller.signal);
      setEstimate({ prediction, form: { ...form }, vehicle: vehicleLabel(form, catalog), brand: catalog.brands[form.brand_id] });
      setEstimateNumber(current => current + 1);
      setNotice('Estimación calculada. Los resultados corresponden al modelo histórico del TFM.');
    } catch (error) {
      if (!controller.signal.aborted) setPredictionError(error instanceof Error ? error.message : 'No hemos podido calcular la estimación.');
    } finally {
      if (activePrediction.current === controller) activePrediction.current = null;
      if (!controller.signal.aborted) setPending(false);
    }
  }

  function fillExample() {
    if (!catalog?.models[EXAMPLE_FORM.model_id]) return;
    setForm({ ...EXAMPLE_FORM }); setErrors({}); setPredictionError(null);
    setNotice('Ejemplo cargado: Citroën C3 aircross de 2022. Puedes editarlo antes de estimar.');
  }
  function reset() {
    setForm({ ...EMPTY_FORM }); setErrors({}); setPredictionError(null); setEstimate(null);
    setNotice('Formulario restablecido.');
  }

  return <>
    <a className="skip-link" href="#estimador">Saltar al estimador</a>
    <header className="site-header"><div className="header-inner">
      <a className="wordmark" href="#inicio" aria-label="Paddock, inicio">
        <span className="brand-lockup" aria-hidden="true">
          <span className="brand-name">PADDOCK<span className="brand-trail"><span className="brand-bolt" /></span></span>
          <span className="brand-car">
            <img src={deloreanImage} width="180" height="61" alt="" />
          </span>
        </span>
      </a>
      <nav aria-label="Navegación principal">{NAV_SECTIONS.map(([id, label]) => <a key={id} href={`#${id}`} onClick={id === 'consultar' ? openChatFromNavigation : undefined} className={activeSection === id ? 'nav-active' : undefined} aria-current={activeSection === id ? 'location' : undefined}>{label}</a>)}<a className="repo-link" href="https://github.com/Legodark/paddock" target="_blank" rel="noopener noreferrer"><Icon name="github" /><span>GitHub</span><span className="sr-only"> (abre otra pestaña)</span></a></nav>
    </div></header>
    <main id="inicio" className="page-shell">
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy"><span className="project-label"><span className="status-dot" />TFM DE IA Y BIG DATA</span><h1 id="page-title">El valor está en<br />los <em>detalles.</em></h1><p>Explora el valor histórico de un coche y compáralo con el catálogo original del mercado español.</p></div>
        <div className="historical-note">
          <strong><span className="theme-emoji" aria-hidden="true">🕰️</span><span>Una mirada a</span>{' '}<time className="historical-year" dateTime="2023">2023</time></strong>
          <p>Esta demo conserva el modelo y los datos del TFM. Sus estimaciones no representan precios actuales.</p>
          <a href="#proyecto">Conoce el contexto<Icon name="arrow" /></a>
        </div>
      </section>
      <div className="dataset-strip"><span><Icon name="database" /><strong>179.502</strong> registros históricos</span><span><span className="country-dot" />Mercado español</span><span><Icon name="clock" />Modelo original conservado</span></div>
      <div className="estimator-layout">
        <section id="estimador" className="form-card" aria-labelledby="form-heading" tabIndex={-1}>
          <div className="card-heading"><span className="step-badge">01</span><div><h2 id="form-heading">Cuéntanos sobre tu coche</h2><p>Los detalles de siempre. Una nueva perspectiva.</p></div><Icon name="sliders" /></div>
          {catalog ? <VehicleEditor catalog={catalog} values={form} errors={errors} pending={pending} hasEstimate={estimate !== null} onChange={change} onSubmit={submit} onExample={fillExample} onReset={reset} />
            : catalogError ? <div className="catalog-state catalog-state--error" role="alert"><Icon name="info" /><h3>No hemos podido cargar el catálogo</h3><p>{catalogError}</p><button type="button" className="secondary-button" onClick={() => setAttempt(current => current + 1)}>Volver a cargar el catálogo<Icon name="reset" /></button></div>
              : <div className="catalog-state" role="status"><span className="spinner" /><h3>Preparando el catálogo</h3><p>Estamos cargando las marcas y modelos del proyecto original.</p><div className="skeleton-grid" aria-hidden="true"><span /><span /><span /><span /></div></div>}
          {predictionError && <div className="request-error" role="alert" ref={errorBox} tabIndex={-1}><Icon name="info" /><div><strong>No hemos podido calcular la estimación</strong><p>{predictionError}</p></div></div>}
        </section>
        <EstimateCard ref={resultHeading} estimate={estimate} dirty={dirty} pending={pending} />
      </div>
      <p className="sr-only" role="status" aria-live="polite">{notice}</p>
      {estimate && <Comparables key={estimateNumber} estimate={estimate} />}
      <CatalogChat openRequest={chatOpenRequest} />
      <section id="proyecto" className="about-section" aria-labelledby="about-heading">
        <div>
          <span className="eyebrow"><span className="theme-emoji" aria-hidden="true">⚡</span>DE VUELTA A LA CARRETERA</span>
          <h2 id="about-heading">Un proyecto académico.<br />Una historia que continúa.</h2>
        </div>
        <div className="about-copy">
          <p>Paddock nació como TFM de <strong>Juan Cerezo Serrano</strong> y <strong>Oscar Pörtner Ostos</strong>, en el Máster de IA y Big Data de Málaga Tech Park.</p>
          <p>Esta versión recupera el modelo original y el catálogo publicado en 2023. El dataset permanece congelado: una demostración del proyecto, no un servicio de tasación actual.</p>
          <p>El DeLorean del logo y las <strong>88&nbsp;mph</strong> son nuestro guiño a <cite>Regreso al futuro</cite>.</p>
          <a className="text-button" href="https://github.com/Legodark/paddock" target="_blank" rel="noopener noreferrer">Explorar el proyecto original<Icon name="arrow" /><span className="sr-only"> (abre otra pestaña)</span></a>
        </div>
      </section>
    </main>
    <footer className="site-footer"><div className="page-shell"><span className="footer-brand">PADDOCK<span>.</span></span><p>Datos históricos. Curiosidad intacta.</p><span>TFM · Proyecto original de 2023</span></div></footer>
  </>;
}
