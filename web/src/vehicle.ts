import type { Catalog, FormErrors, PredictionRequest, VehicleForm } from './types';

export const EMPTY_FORM: VehicleForm = {
  brand_id: '', model_id: '', year: '', km: '', horses: '',
  displ_engine: '', marches: '', fuel_id: '', gearbox_id: '',
};

export const EXAMPLE_FORM: VehicleForm = {
  brand_id: '10', model_id: '118', year: '2022', km: '7119', horses: '110',
  displ_engine: '1199', marches: '6', fuel_id: '3', gearbox_id: '1',
};

export const NUMERIC_FIELDS = {
  year: { label: 'Año', min: 1993, max: 2023, placeholder: '2019', unit: '' },
  km: { label: 'Kilómetros', min: 0, max: 499999, placeholder: '75000', unit: 'km' },
  horses: { label: 'Potencia', min: 1, max: 887, placeholder: '110', unit: 'CV' },
  displ_engine: { label: 'Cilindrada', min: 0, max: 8300, placeholder: '1598', unit: 'cm³' },
  marches: { label: 'Marchas', min: 0, max: 10, placeholder: '6', unit: '' },
} as const;

export function validateVehicle(form: VehicleForm, catalog: Catalog): FormErrors {
  const errors: FormErrors = {};
  if (!Object.hasOwn(catalog.brands, form.brand_id)) errors.brand_id = 'Selecciona una marca.';
  const model = Object.hasOwn(catalog.models, form.model_id) ? catalog.models[form.model_id] : undefined;
  if (!model || model.brand_id !== form.brand_id) errors.model_id = 'Selecciona un modelo de esta marca.';
  if (!Object.hasOwn(catalog.fuels, form.fuel_id)) errors.fuel_id = 'Selecciona un combustible.';
  if (!Object.hasOwn(catalog.gearboxes, form.gearbox_id)) errors.gearbox_id = 'Selecciona un cambio.';
  for (const [key, definition] of Object.entries(NUMERIC_FIELDS)) {
    const field = key as keyof typeof NUMERIC_FIELDS;
    const value = form[field].trim();
    if (!value) errors[field] = 'Completa este campo.';
    else if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) errors[field] = 'Introduce un número entero, sin separadores.';
    else if (Number(value) < definition.min || Number(value) > definition.max) {
      errors[field] = `Introduce un valor entre ${definition.min.toLocaleString('es-ES')} y ${definition.max.toLocaleString('es-ES')}.`;
    }
  }
  return errors;
}

export function makePredictionRequest(form: VehicleForm, catalog: Catalog): PredictionRequest {
  if (Object.keys(validateVehicle(form, catalog)).length) throw new Error('Invalid vehicle form');
  return {
    catalog_version: catalog.catalog_version,
    brand_id: form.brand_id, model_id: form.model_id,
    fuel_id: form.fuel_id, gearbox_id: form.gearbox_id,
    year: Number(form.year), km: Number(form.km), horses: Number(form.horses),
    displ_engine: Number(form.displ_engine), marches: Number(form.marches),
  };
}

const brandNames: Record<string, string> = {
  Bmw: 'BMW', Mg: 'MG', Ds: 'DS', Dfsk: 'DFSK', Swm: 'SWM', Levc: 'LEVC',
  Citroen: 'Citroën', 'Alfa romeo': 'Alfa Romeo', 'Land-rover': 'Land Rover', 'Mercedes-benz': 'Mercedes-Benz',
};
export const displayBrand = (brand: string) => brandNames[brand] ?? brand;
export function shortModel(label: string, brand: string) {
  return label.startsWith(brand + ' ') ? label.slice(brand.length + 1) : label;
}
export function vehicleLabel(form: VehicleForm, catalog: Catalog) {
  const brand = catalog.brands[form.brand_id];
  return `${displayBrand(brand)} ${shortModel(catalog.models[form.model_id].label, brand)}`;
}
export const euro = (value: number) => new Intl.NumberFormat('es-ES', {
  style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
}).format(value);
export const integer = (value: number) => new Intl.NumberFormat('es-ES').format(value);
