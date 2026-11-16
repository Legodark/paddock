export const CATALOG_VERSION = 'tfm-original-csv-v1';

export interface Catalog {
  catalog_version: string;
  brands: Record<string, string>;
  models: Record<string, { label: string; brand_id: string }>;
  fuels: Record<string, string>;
  gearboxes: Record<string, string>;
  historical: true;
}

export interface SearchCatalog extends Catalog {
  locations: string[];
}

export type NumericCarField = 'year' | 'horses' | 'km' | 'price' | 'engine' | 'marches';
export type CarFilters = Partial<Record<'brand_id' | 'model_id' | 'fuel_id' | 'gearbox_id' | 'location', string> &
  Record<`${NumericCarField}_${'min' | 'max' | 'gt' | 'lt'}`, number>>;

export interface HistoricalCar {
  location: string;
  brand: string;
  model: string;
  fuel: string;
  gearbox: string;
  year: number;
  horses: number;
  km: number;
  price: number;
  engine: number;
  marches: number;
}

export interface VehicleForm {
  brand_id: string;
  model_id: string;
  year: string;
  km: string;
  horses: string;
  displ_engine: string;
  marches: string;
  fuel_id: string;
  gearbox_id: string;
}

export type FormErrors = Partial<Record<keyof VehicleForm, string>>;

export interface PredictionRequest {
  catalog_version: string;
  year: number;
  horses: number;
  km: number;
  displ_engine: number;
  marches: number;
  brand_id: string;
  model_id: string;
  fuel_id: string;
  gearbox_id: string;
}

export interface Comparable {
  modelo: string;
  año: number;
  kilometros: number;
  precio: number;
}

export interface Prediction {
  catalog_version: string;
  prediccion: number;
  'precio-minimo': number;
  'precio-maximo': number;
  'coches-baratos': Comparable[];
  'coches-caros': Comparable[];
  historical: true;
}

export interface Estimate {
  prediction: Prediction;
  form: VehicleForm;
  vehicle: string;
  brand: string;
}
