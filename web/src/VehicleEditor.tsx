import type { FormEvent } from 'react';
import type { Catalog, FormErrors, VehicleForm } from './types';
import { displayBrand, NUMERIC_FIELDS, shortModel } from './vehicle';
import Icon from './Icon';
import BrandLogo from './BrandLogo';

interface Props {
  catalog: Catalog;
  values: VehicleForm;
  errors: FormErrors;
  pending: boolean;
  hasEstimate: boolean;
  onChange: (field: keyof VehicleForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onExample: () => void;
  onReset: () => void;
}

export default function VehicleEditor({ catalog, values, errors, pending, hasEstimate, onChange, onSubmit, onExample, onReset }: Props) {
  const models = Object.entries(catalog.models).filter(([, model]) => model.brand_id === values.brand_id)
    .sort((a, b) => a[1].label.localeCompare(b[1].label, 'es'));
  const brands = Object.entries(catalog.brands).sort((a, b) => a[1].localeCompare(b[1], 'es'));

  function selection(field: 'brand_id' | 'model_id' | 'fuel_id', label: string, options: [string, string][], placeholder: string, className = '') {
    return <div className={`field field--half ${className}`}>
      <label htmlFor={`vehicle-${field}`}>{label}</label>
      <div className={`select-wrap${field === 'brand_id' ? ' select-wrap--brand' : ''}`}>
        {field === 'brand_id' && <BrandLogo brandId={values.brand_id} brandName={catalog.brands[values.brand_id]} />}
        <select id={`vehicle-${field}`} name={field} value={values[field]} required
          onChange={event => onChange(field, event.target.value)}
          disabled={field === 'model_id' && !values.brand_id}
          aria-invalid={Boolean(errors[field])}
          aria-describedby={errors[field] ? `error-${field}` : undefined}
          title={options.find(([id]) => id === values[field])?.[1]}>
          <option value="">{placeholder}</option>
          {options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}
        </select>
        <Icon name="chevron" />
      </div>
      {errors[field] && <span className="field-error" id={`error-${field}`}>{errors[field]}</span>}
    </div>;
  }

  return <form noValidate onSubmit={onSubmit} aria-busy={pending} aria-labelledby="form-heading">
    <fieldset className="editor-fields" disabled={pending}>
      <legend className="sr-only">Características del vehículo</legend>
      <div className="form-grid">
        {selection('brand_id', 'Marca', brands.map(([id, label]) => [id, displayBrand(label)]), 'Elige una marca', 'field--identity')}
        {selection('model_id', 'Modelo', models.map(([id, model]) => [id, shortModel(model.label, catalog.brands[values.brand_id] ?? '')]), values.brand_id ? 'Elige un modelo' : 'Primero, la marca', 'field--identity')}
        {(Object.keys(NUMERIC_FIELDS) as (keyof typeof NUMERIC_FIELDS)[]).map(field => {
          const definition = NUMERIC_FIELDS[field];
          return <div className={`field ${field === 'displ_engine' || field === 'marches' ? 'field--half' : 'field--third'}`} key={field}>
            <label htmlFor={`vehicle-${field}`}>{definition.label}</label>
            <div className="input-wrap">
              <input id={`vehicle-${field}`} name={field} type="number" inputMode="numeric" required
                min={definition.min} max={definition.max} step="1" placeholder={definition.placeholder}
                value={values[field]} onChange={event => onChange(field, event.target.value)}
                aria-invalid={Boolean(errors[field])}
                aria-describedby={errors[field] ? `error-${field}` : field === 'year' ? 'historical-year-help' : undefined} />
              {definition.unit && <span className="input-unit">{definition.unit}</span>}
            </div>
            {errors[field] && <span className="field-error" id={`error-${field}`}>{errors[field]}</span>}
          </div>;
        })}
        {selection('fuel_id', 'Combustible', Object.entries(catalog.fuels).map(([id, label]) => [id, label === 'Diesel' ? 'Diésel' : label]), 'Elige el combustible')}
        <fieldset className="field field--half gearbox" aria-describedby={errors.gearbox_id ? 'error-gearbox_id' : undefined}>
          <legend>Cambio</legend>
          <div className="gearbox-options">
            {Object.entries(catalog.gearboxes).map(([id, label]) => <label className={`gearbox-option ${values.gearbox_id === id ? 'is-selected' : ''}`} key={id}>
              <input id={`vehicle-gearbox_id-${id}`} type="radio" name="gearbox_id" value={id} checked={values.gearbox_id === id}
                onChange={() => onChange('gearbox_id', id)} required aria-invalid={Boolean(errors.gearbox_id)} />
              <span>{label}</span>
            </label>)}
          </div>
          {errors.gearbox_id && <span className="field-error" id="error-gearbox_id">{errors.gearbox_id}</span>}
        </fieldset>
      </div>
      <p className="field-note" id="historical-year-help"><Icon name="info" />Años de 1993 a 2023. En eléctricos, cilindrada y marchas pueden ser 0.</p>
      <button className="primary-button" type="submit" disabled={pending}>
        {pending ? <><span className="spinner" />Calculando estimación…</> : <>{hasEstimate ? 'Actualizar estimación' : 'Estimar valor histórico'}<Icon name="arrow" /></>}
      </button>
      <div className="form-actions">
        <button type="button" className="text-button" onClick={onExample}><Icon name="car" />Rellenar un ejemplo</button>
        <button type="button" className="text-button text-button--muted" onClick={onReset}><Icon name="reset" />Limpiar</button>
      </div>
    </fieldset>
  </form>;
}
