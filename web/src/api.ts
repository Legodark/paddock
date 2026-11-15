import { CATALOG_VERSION } from './types';
import type { CarFilters, Catalog, Comparable, HistoricalCar, Prediction, PredictionRequest, SearchCatalog } from './types';

export class ApiError extends Error {}
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 200;
const invalidResponse = () => new ApiError('La respuesta del servicio no es válida. Vuelve a intentarlo.');

function labels(value: unknown): value is Record<string, string> {
  return record(value) && Object.keys(value).length > 0 && Object.entries(value).every(([key, label]) => /^\d+$/.test(key) && text(label));
}

export function parseCatalog(value: unknown): Catalog {
  if (!record(value) || value.catalog_version !== CATALOG_VERSION || value.historical !== true ||
      !labels(value.brands) || !labels(value.fuels) || !labels(value.gearboxes) || !record(value.models) ||
      Object.keys(value.models).length === 0) throw invalidResponse();
  const brands = value.brands;
  if (!Object.entries(value.models).every(([key, model]) => /^\d+$/.test(key) && record(model) &&
      text(model.label) && typeof model.brand_id === 'string' && Object.hasOwn(brands, model.brand_id))) throw invalidResponse();
  return value as unknown as Catalog;
}

function comparable(value: unknown): value is Comparable {
  return record(value) && text(value.modelo) && finite(value.año) && Number.isInteger(value.año) &&
    finite(value.kilometros) && value.kilometros >= 0 && finite(value.precio) && value.precio > 0;
}

export function parsePrediction(value: unknown): Prediction {
  if (!record(value) || value.catalog_version !== CATALOG_VERSION || value.historical !== true ||
      !finite(value.prediccion) || value.prediccion <= 0 || !finite(value['precio-minimo']) ||
      !finite(value['precio-maximo']) || value['precio-minimo'] <= 0 || value['precio-minimo'] > value.prediccion ||
      value['precio-maximo'] < value.prediccion) throw invalidResponse();
  for (const key of ['coches-baratos', 'coches-caros']) {
    const rows = value[key];
    if (!Array.isArray(rows) || rows.length > 5 || !rows.every(comparable)) throw invalidResponse();
  }
  return value as unknown as Prediction;
}

async function jsonRequest(path: string, options: RequestInit = {}, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 20000);
  try {
    const response = await fetch(`/api/v1/${path}`, { ...options, signal: controller.signal, credentials: 'same-origin' });
    if (!response.ok) {
      if (response.status === 400) throw new ApiError('Revisa los datos de la solicitud y vuelve a intentarlo.');
      if (response.status === 429) throw new ApiError('Hay muchas solicitudes. Espera un momento y vuelve a intentarlo.');
      throw new ApiError('El servicio no está disponible en este momento. Puedes volver a intentarlo sin perder los datos.');
    }
    return await response.json();
  } catch (error) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    if (timedOut) throw new ApiError('La solicitud está tardando más de lo habitual. Vuelve a intentarlo.');
    if (error instanceof ApiError) throw error;
    if (error instanceof SyntaxError) throw invalidResponse();
    throw new ApiError('No hemos podido conectar con el servicio. Comprueba tu conexión y vuelve a intentarlo.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

export async function getCatalog(signal?: AbortSignal) {
  return parseCatalog(await jsonRequest('catalog', {}, signal));
}
export async function predictVehicle(data: PredictionRequest, signal?: AbortSignal) {
  return parsePrediction(await jsonRequest('predict', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  }, signal));
}

export function parseSearchCatalog(value: unknown): SearchCatalog {
  const catalog = parseCatalog(value);
  if (!record(value) || !Array.isArray(value.locations) || value.locations.length === 0 ||
      value.locations.length > 100 || !value.locations.every(text)) throw invalidResponse();
  return { ...catalog, locations: value.locations };
}

export function parseClassification(value: unknown): 0 | 1 {
  if (!record(value) || value.historical !== true || (value.contexto !== 0 && value.contexto !== 1)) throw invalidResponse();
  return value.contexto;
}

export function parseCars(value: unknown): HistoricalCar[] {
  if (!record(value) || value.historical !== true || !Array.isArray(value.car_data) || value.car_data.length > 10) throw invalidResponse();
  for (const row of value.car_data) {
    if (!record(row) || !['location', 'brand', 'model', 'fuel', 'gearbox'].every(key => text(row[key])) ||
        !['year', 'horses', 'km', 'price', 'engine', 'marches'].every(key => finite(row[key]) && row[key] >= 0) ||
        !Number.isInteger(row.year) || !Number.isInteger(row.marches) || (row.price as number) <= 0) throw invalidResponse();
  }
  return value.car_data as HistoricalCar[];
}

export async function getSearchCatalog(signal?: AbortSignal) {
  return parseSearchCatalog(await jsonRequest('search-catalog', {}, signal));
}
export async function classifyMessage(message: string, signal?: AbortSignal) {
  return parseClassification(await jsonRequest('message', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }),
  }, signal));
}
export async function searchCars(filters: CarFilters, signal?: AbortSignal) {
  const parameters = new URLSearchParams({ limit: '10' });
  for (const [key, value] of Object.entries(filters)) parameters.set(key, String(value));
  return parseCars(await jsonRequest(`cars?${parameters}`, {}, signal));
}
