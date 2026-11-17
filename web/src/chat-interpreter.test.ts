import { describe, expect, it } from 'vitest';
import { classifierText, interpretMessage, normalize } from './chat-interpreter';
import { searchCatalog as catalog } from '../tests/fixtures/search-catalog';
import type { CarFilters } from './types';

const brand = (name: string) => Object.entries(catalog.brands).find(([, label]) => normalize(label) === normalize(name))![0];
const model = (name: string) => Object.entries(catalog.models).find(([, value]) => normalize(value.label) === normalize(name))![0];

describe('historical chatbot contract', () => {
  const cases: [string, CarFilters][] = [
    ['Busco coches Citroën de menos de 20.000 euros en Málaga', { brand_id: '10', price_lt: 20000, location: 'Málaga' }],
    ['Quiero coches diésel con menos de 50.000 km y más de 100 CV', { fuel_id: '1', km_lt: 50000, horses_gt: 100 }],
    ['Muéstrame Seat León del año 2019', { brand_id: brand('Seat'), model_id: model('Seat León'), year_min: 2019, year_max: 2019 }],
    ['Citroen C3 aircross con 7.119 km', { brand_id: '10', model_id: '118', km_min: 7119, km_max: 7119 }],
    ['Citroen C3', { brand_id: '10', model_id: '117' }],
    ['Seat León en León', { brand_id: brand('Seat'), model_id: model('Seat León'), location: 'León' }],
    ['Mercedes Clase A automático hasta 20.000 €', { brand_id: brand('Mercedes-benz'), model_id: model('Mercedes-benz Clase a'), gearbox_id: '0', price_max: 20000 }],
    ['Audi A3 con cambio manual entre 2015 y 2020', { brand_id: brand('Audi'), model_id: model('Audi A3'), gearbox_id: '1', year_min: 2015, year_max: 2020 }],
    ['BMW Serie 3 en Madrid de más de 150 caballos', { brand_id: brand('Bmw'), model_id: '63', location: 'Madrid', horses_gt: 150 }],
    ['coches entre 10.000 y 20.000 euros con 6 marchas', { price_min: 10000, price_max: 20000, marches_min: 6, marches_max: 6 }],
    ['coches con 50 000 kilómetros y 2.000 cc', { km_min: 50000, km_max: 50000, engine_min: 2000, engine_max: 2000 }],
    ['coches posteriores al año 2018', { year_gt: 2018 }],
    ['coches antes de 2018', { year_lt: 2018 }],
    ['coches anteriores al año 2018', { year_lt: 2018 }],
    ['coches después del año 2018', { year_gt: 2018 }],
    ['coches desde 2018 hasta 2023', { year_min: 2018, year_max: 2023 }],
    ['coches de precio inferior a 20000 euros', { price_lt: 20000 }],
    ['coches de potencia mayor que 100 CV', { horses_gt: 100 }],
    ['coches de cilindrada superior a 1500 cc', { engine_gt: 1500 }],
    ['coches con más de 5 marchas', { marches_gt: 5 }],
    ['coches híbrido de gasolina', { fuel_id: '5' }],
    ['coches híbrido diésel', { fuel_id: '2' }],
    ['coches de gasolina Super', { fuel_id: '4' }],
    ['coches de gasolina/gas en Álava', { fuel_id: '6', location: 'Álava' }],
    ['vehículos eléctricos de Tenerife', { fuel_id: '0', location: 'Sta. C. de Tenerife' }],
    ['coches de A Coruña', { location: 'La Coruña' }],
    ['coches del 2019, con 0 km', { year_min: 2019, year_max: 2019, km_min: 0, km_max: 0 }],
    ['¿Cuál es el precio de un coche con 200 caballos?', { horses_min: 200, horses_max: 200 }],
    ['¿Cuánto cuesta un coche del año 2019?', { year_min: 2019, year_max: 2019 }],
    ['Quiero un coche que tenga más de 300 caballos, ¿cuál me recomiendas?', { horses_gt: 300 }],
  ];
  it.each(cases)('interprets %s without dropping constraints', (message, expected) => {
    const result = interpretMessage(message, catalog);
    expect(result.issues).toEqual([]);
    expect(result.filters).toEqual(expected);
  });
  it('translates brand and vehicle aliases for the frozen classifier using whole words', () => {
    expect(classifierText('Muéstrame vehículos Citroën automáticos', catalog)).toBe('muéstrame coche coche automáticos');
    expect(classifierText('Ford y Oxford, auto y automático', catalog)).toBe('coche y oxford, coche y automático');
    expect(classifierText('Mercedes-Benz y Land Rover', catalog)).toBe('coche y coche');
  });
  it('never matches brands or models inside larger words', () => {
    expect(interpretMessage('Miniaturas en Oxford', catalog).filters).toEqual({});
    expect(interpretMessage('Audi A30', catalog).filters.model_id).toBeUndefined();
    expect(interpretMessage('Audi A30', catalog).issues.length).toBeGreaterThan(0);
  });
  it.each([
    'Audi y BMW de menos de 20000 euros', 'Seat León y Seat Ibiza',
    'coches gasolina o diésel', 'coches de Madrid y Málaga', 'coches híbridos',
    'coches con menos de 20000 euros y más de 25000 euros',
    'coches desde 10000 euros con menos de 10000 euros',
    'coches con menos de 10.000 euros y menos de 20.000 euros',
    'coches de menos de 20.000 euros rojos', 'coches sin diésel',
    'coches con 12.34 euros', 'coches con 20,000 euros', 'coches con -100 km',
    'coches del año 2026', 'coches con 1e5 km', 'coches con 99999999999999999999999 km',
    'coches entre 20000 y 10000 euros', 'coches con menos de 20000 dólares',
    'coches por 20000 euros cerca de Granada', 'coches con 5 puertas',
  ])('requests clarification rather than running a partial query: %s', message => {
    expect(interpretMessage(message, catalog).issues.length).toBeGreaterThan(0);
  });
  it('retains human-readable strict bounds and canonical zero IDs in the review', () => {
    const result = interpretMessage('coches eléctricos automáticos con menos de 50000 km', catalog);
    expect(result.issues).toEqual([]);
    expect(result.chips).toContain('Corriente eléctrica');
    expect(result.chips).toContain('Automático');
    expect(result.chips.some(chip => chip.includes('menos de'))).toBe(true);
  });
  it.each(['', ' ', 'x'.repeat(2001)])('bounds the input before interpretation', message => {
    expect(interpretMessage(message, catalog).issues).toEqual(['Escribe una consulta de entre 1 y 2.000 caracteres.']);
  });
});
