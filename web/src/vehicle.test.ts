import { describe, expect, it } from 'vitest';
import type { Catalog } from './types';
import { CATALOG_VERSION } from './types';
import { EMPTY_FORM, EXAMPLE_FORM, makePredictionRequest, validateVehicle, vehicleLabel } from './vehicle';

const catalog: Catalog = {
  catalog_version: CATALOG_VERSION, historical: true,
  brands: { '10': 'Citroen', '6': 'Bmw' },
  models: { '118': { label: 'Citroen C3 aircross', brand_id: '10' }, '50': { label: 'Bmw Serie 3', brand_id: '6' } },
  fuels: { '0': 'Corriente eléctrica', '3': 'Gasolina', '5': 'Gasolina y corriente eléctrica' },
  gearboxes: { '0': 'Automático', '1': 'Manual' },
};

describe('vehicle contract', () => {
  it('keeps canonical IDs and sends the real regression fixture as numbers', () => {
    expect(validateVehicle(EXAMPLE_FORM, catalog)).toEqual({});
    expect(makePredictionRequest(EXAMPLE_FORM, catalog)).toEqual({
      catalog_version: CATALOG_VERSION, year: 2022, km: 7119, horses: 110,
      displ_engine: 1199, marches: 6, brand_id: '10', model_id: '118', fuel_id: '3', gearbox_id: '1',
    });
    expect(vehicleLabel(EXAMPLE_FORM, catalog)).toBe('Citroën C3 aircross');
  });
  it('rejects missing, mismatched and inherited categories', () => {
    expect(Object.keys(validateVehicle(EMPTY_FORM, catalog))).toHaveLength(9);
    expect(validateVehicle({ ...EXAMPLE_FORM, brand_id: '6' }, catalog)).toHaveProperty('model_id');
    expect(validateVehicle({ ...EXAMPLE_FORM, fuel_id: '4' }, catalog)).toHaveProperty('fuel_id');
    expect(validateVehicle({ ...EXAMPLE_FORM, fuel_id: 'toString' }, catalog)).toHaveProperty('fuel_id');
  });
  it.each(['2026', '1992', '2022.5', '2e3', 'NaN', ''])('rejects unsupported year %s', year => {
    expect(validateVehicle({ ...EXAMPLE_FORM, year }, catalog)).toHaveProperty('year');
  });
  it('supports electric zero displacement/gears but rejects negative/excess mileage', () => {
    expect(validateVehicle({ ...EXAMPLE_FORM, fuel_id: '0', displ_engine: '0', marches: '0' }, catalog)).toEqual({});
    for (const km of ['-1', '500000', '75.000', '75000.5']) {
      expect(validateVehicle({ ...EXAMPLE_FORM, km }, catalog)).toHaveProperty('km');
    }
    expect(() => makePredictionRequest(EMPTY_FORM, catalog)).toThrow();
  });
});
