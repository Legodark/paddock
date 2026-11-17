import { afterEach, describe, expect, it, vi } from 'vitest';
import { classifyMessage, getCatalog, parseCars, parseCatalog, parseClassification, parsePrediction, parseSearchCatalog, predictVehicle, searchCars } from './api';
import { CATALOG_VERSION } from './types';

const validCatalog = { catalog_version: CATALOG_VERSION, historical: true,
  brands: { '10': 'Citroen' }, models: { '118': { label: 'Citroen C3 aircross', brand_id: '10' } },
  fuels: { '3': 'Gasolina' }, gearboxes: { '1': 'Manual' } };
const validPrediction = { catalog_version: CATALOG_VERSION, historical: true, prediccion: 20155,
  'precio-minimo': 19000, 'precio-maximo': 22000, 'coches-baratos': [{ modelo: 'Citroen C3 aircross', año: 2022, kilometros: 12000, precio: 19000 }], 'coches-caros': [] };
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('API boundary', () => {
  it('accepts validated catalog and real/empty comparable results', () => {
    expect(parseCatalog(validCatalog)).toEqual(validCatalog);
    expect(parsePrediction(validPrediction)).toEqual(validPrediction);
    expect(parsePrediction({ ...validPrediction, 'coches-baratos': [] })['coches-baratos']).toEqual([]);
  });
  it('rejects incompatible catalogs and invalid parent brands', () => {
    expect(() => parseCatalog({ ...validCatalog, catalog_version: 'legacy' })).toThrow();
    expect(() => parseCatalog({ ...validCatalog, models: { '118': { label: 'C3', brand_id: 'unknown' } } })).toThrow();
  });
  it.each([0, -1, NaN, Infinity])('never treats invalid price %s as a successful estimate', prediccion => {
    expect(() => parsePrediction({ ...validPrediction, prediccion })).toThrow();
  });
  it('rejects inverted ranges, malformed comparables and missing fields', () => {
    expect(() => parsePrediction({ ...validPrediction, 'precio-minimo': 30000 })).toThrow();
    expect(() => parsePrediction({ ...validPrediction, 'coches-caros': [{ precio: 22000 }] })).toThrow();
    expect(() => parsePrediction({ error: 'unavailable' })).toThrow();
  });
  it('uses same-origin POST with explicit catalog version and no query parameters', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(validPrediction), { status: 200 }));
    vi.stubGlobal('fetch', fetch);
    const request = { catalog_version: CATALOG_VERSION, year: 2022, horses: 110, km: 7119, displ_engine: 1199, marches: 6, brand_id: '10', model_id: '118', fuel_id: '3', gearbox_id: '1' };
    await predictVehicle(request);
    expect(fetch.mock.calls[0][0]).toBe('/api/v1/predict');
    expect(fetch.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(request);
  });
  it('reports service errors instead of decoding a fake successful value', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })));
    await expect(getCatalog()).rejects.toThrow('no está disponible');
  });
  it('times out and cleans up pending requests', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));
    const result = expect(getCatalog()).rejects.toThrow('tardando');
    await vi.advanceTimersByTimeAsync(20000);
    await result;
  });
});

describe('chatbot API boundary', () => {
  const car = { location: 'Málaga', brand: 'Citroen', model: 'Citroen C3', fuel: 'Gasolina', gearbox: 'Manual', year: 2019, horses: 110, km: 50000, price: 15000, engine: 1199, marches: 6 };
  it('validates the search catalog and both frozen classifier labels', () => {
    expect(parseSearchCatalog({ ...validCatalog, locations: ['Málaga'] }).locations).toEqual(['Málaga']);
    expect(() => parseSearchCatalog({ ...validCatalog, locations: [] })).toThrow();
    expect(parseClassification({ contexto: 0, historical: true })).toBe(0);
    expect(parseClassification({ contexto: 1, historical: true })).toBe(1);
    for (const contexto of [true, '1', 2, null]) expect(() => parseClassification({ contexto, historical: true })).toThrow();
  });
  it('distinguishes real empty results from malformed or oversized responses', () => {
    expect(parseCars({ car_data: [], historical: true })).toEqual([]);
    expect(parseCars({ car_data: [car], historical: true })).toEqual([car]);
    for (const data of [{}, { car_data: [car] }, { historical: true, car_data: [{ ...car, price: '15000' }] },
      { historical: true, car_data: [{ ...car, km: -1 }] }, { historical: true, car_data: Array(11).fill(car) }]) {
      expect(() => parseCars(data)).toThrow();
    }
  });
  it('keeps message text in a POST body and encodes only structured query filters', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ contexto: 1, historical: true })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ historical: true, car_data: [car] })));
    vi.stubGlobal('fetch', fetch);
    await classifyMessage('Quiero coches de Málaga');
    await searchCars({ location: 'Málaga', price_lt: 20000, brand_id: '10' });
    expect(fetch.mock.calls[0][0]).toBe('/api/v1/message');
    expect(fetch.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ message: 'Quiero coches de Málaga' });
    const query = new URL(fetch.mock.calls[1][0], 'https://example.test');
    expect(Object.fromEntries(query.searchParams)).toEqual({ limit: '10', location: 'Málaga', price_lt: '20000', brand_id: '10' });
  });
  it('does not turn classifier/query failures into off-topic or empty results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })));
    await expect(classifyMessage('coches')).rejects.toThrow('no está disponible');
    await expect(searchCars({ brand_id: '10' })).rejects.toThrow('no está disponible');
  });
  it('handles an HTML 429 from the edge firewall as a retryable limit, not invalid JSON or empty data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(new Response('<html>Too Many Requests</html>', {
      status: 429, headers: { 'Content-Type': 'text/html' },
    }))));
    await expect(classifyMessage('coches')).rejects.toThrow('Hay muchas solicitudes');
    await expect(searchCars({ brand_id: '10' })).rejects.toThrow('Hay muchas solicitudes');
  });
});
