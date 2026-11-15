import type { CarFilters, NumericCarField, SearchCatalog } from './types';
import { displayBrand, integer } from './vehicle';

type Alias = { id: string; alias: string };
type Hit = Alias & { start: number; end: number };
export interface Interpretation {
  filters: CarFilters;
  chips: string[];
  issues: string[];
}

// A bounded, deterministic port of the Dart rules, not a generative language model.
export const normalize = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  .replace(/(?<=\p{L})[-‐‑–](?=\p{L})/gu, ' ').replace(/\s+/g, ' ').trim();
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const phrase = (alias: string) => new RegExp(`(?<![\\p{L}\\p{N}])${escape(alias)}(?![\\p{L}\\p{N}])`, 'gu');
const erase = (text: string, start: number, end: number) => text.slice(0, start) + ' '.repeat(end - start) + text.slice(end);
const unique = (values: string[]) => [...new Set(values)];

function aliasesForBrand(id: string, label: string): Alias[] {
  const names = [normalize(label)];
  if (names[0] === 'mercedes benz') names.push('mercedes');
  if (names[0] === 'land rover') names.push('landrover');
  return names.map(alias => ({ id, alias }));
}

export function classifierText(message: string, catalog: SearchCatalog): string {
  const replacements = Object.entries(catalog.brands).flatMap(([id, label]) => {
    const aliases = aliasesForBrand(id, label).map(item => item.alias);
    return unique([label.toLowerCase(), displayBrand(label).toLowerCase(), ...aliases, label.toLowerCase().replaceAll('-', ' ')]);
  });
  replacements.push('automóviles', 'automoviles', 'automóvil', 'automovil', 'vehículos', 'vehiculos',
    'vehículo', 'vehiculo', 'coches', 'carros', 'carro', 'autos', 'auto');
  let text = message.toLowerCase();
  for (const alias of unique(replacements).sort((a, b) => b.length - a.length)) text = text.replace(phrase(alias), 'coche');
  return text;
}

export const SEARCH_LIMITS: Record<NumericCarField, [number, number]> = {
  year: [1993, 2023], horses: [0, 887], km: [0, 2890000], price: [0, 10000000], engine: [0, 8300], marches: [0, 10],
};
const numberPattern = '[+-]?\\d(?:[\\d.,]*\\d)?(?:[ \\u00a0]\\d{3})*';
const unitPattern = 'kilometros?|kms?|caballos?|cv|euros?|€|de cilindrada|cilindrada|cm³|cm3|cc|marchas?';
const comparatorPattern = 'como maximo|como minimo|a partir de|mas de|menos de|mayor(?:es)? (?:que|a)|menor(?:es)? (?:que|a)|superior(?:es)? a|inferior(?:es)? a|posterior(?:es)? (?:al|a)|anterior(?:es)? (?:al|a)|despues (?:del|de)|antes (?:del|de)|hasta|desde|exactamente|igual(?:es)? a';
const boundary = '(?![\\p{L}\\p{N}])';
const startBoundary = '(?<![\\p{L}\\p{N}.,+\\-])';
const fieldLabels: Record<NumericCarField, string> = { year: 'Año', km: 'Kilómetros', horses: 'Potencia', price: 'Precio', engine: 'Cilindrada', marches: 'Marchas' };
const units: Record<NumericCarField, string> = { year: '', km: ' km', horses: ' CV', price: ' €', engine: ' cm³', marches: '' };

function unitField(unit: string): NumericCarField {
  if (/^(?:km|kilometro)/.test(unit)) return 'km';
  if (/^(?:cv|caballo)/.test(unit)) return 'horses';
  if (/^(?:euro|€)/.test(unit)) return 'price';
  if (unit.startsWith('marcha')) return 'marches';
  return 'engine';
}
function relation(comparator: string | undefined): 'equal' | 'min' | 'max' | 'gt' | 'lt' {
  if (!comparator || /^(?:exactamente|igual)/.test(comparator)) return 'equal';
  if (/^(?:hasta|como maximo)/.test(comparator)) return 'max';
  if (/^(?:desde|como minimo|a partir)/.test(comparator)) return 'min';
  return /^(?:menos|menor|inferior|antes|anterior)/.test(comparator) ? 'lt' : 'gt';
}

export function filterChips(filters: CarFilters, catalog: SearchCatalog): string[] {
  const chips: string[] = [];
  if (filters.brand_id) chips.push(displayBrand(catalog.brands[filters.brand_id]));
  if (filters.model_id) chips.push(catalog.models[filters.model_id].label);
  if (filters.fuel_id) chips.push(catalog.fuels[filters.fuel_id]);
  if (filters.gearbox_id) chips.push(catalog.gearboxes[filters.gearbox_id]);
  if (filters.location) chips.push(filters.location);
  for (const field of Object.keys(SEARCH_LIMITS) as NumericCarField[]) {
    const low = filters[`${field}_min`];
    const high = filters[`${field}_max`];
    const format = (value: number) => integer(value) + units[field];
    if (low !== undefined && low === high) { chips.push(`${fieldLabels[field]}: ${format(low)}`); continue; }
    for (const [suffix, label] of [['min', 'desde'], ['max', 'hasta'], ['gt', 'más de'], ['lt', 'menos de']] as const) {
      const value = filters[`${field}_${suffix}`];
      if (value !== undefined) chips.push(`${fieldLabels[field]}: ${label} ${format(value)}`);
    }
  }
  return chips;
}

export function interpretMessage(message: string, catalog: SearchCatalog): Interpretation {
  const filters: CarFilters = {};
  const issues: string[] = [];
  if (!message.trim() || message.length > 2000) return { filters, chips: [], issues: ['Escribe una consulta de entre 1 y 2.000 caracteres.'] };
  let remaining = normalize(message);
  if (/\b(?:no|sin|excepto|salvo|ni)\b/.test(remaining)) issues.push('No interpreto exclusiones. Indica las características que sí quieres buscar.');

  function take(aliases: Alias[]): Hit[] {
    const hits: Hit[] = [];
    for (const item of [...aliases].sort((a, b) => b.alias.length - a.alias.length)) {
      for (const match of [...remaining.matchAll(phrase(item.alias))]) {
        const start = match.index;
        hits.push({ ...item, start, end: start + match[0].length });
        remaining = erase(remaining, start, start + match[0].length);
      }
    }
    return hits;
  }
  function select(key: 'brand_id' | 'model_id' | 'fuel_id' | 'gearbox_id' | 'location', values: string[], label: string) {
    const ids = unique(values);
    if (ids.length > 1) issues.push(`Indica ${label}; he reconocido varias opciones.`);
    else if (ids.length === 1) filters[key] = ids[0];
  }

  const brands = Object.entries(catalog.brands).flatMap(([id, label]) => aliasesForBrand(id, label));
  const fullModels = Object.entries(catalog.models).flatMap(([id, model]) => {
    const brand = normalize(catalog.brands[model.brand_id]);
    const label = normalize(model.label);
    const suffix = label.startsWith(brand + ' ') ? label.slice(brand.length + 1) : label;
    return aliasesForBrand(model.brand_id, catalog.brands[model.brand_id]).map(item => ({ id, alias: `${item.alias} ${suffix}` }));
  });
  const modelHits = take(fullModels);
  const brandHits = take(brands);
  const parents = unique([...brandHits.map(hit => hit.id), ...modelHits.map(hit => catalog.models[hit.id].brand_id)]);
  if (parents.length === 1) {
    const brand = normalize(catalog.brands[parents[0]]);
    const matchedModels = new Set(modelHits.map(hit => hit.id));
    const shortModels = Object.entries(catalog.models).filter(([id, model]) => model.brand_id === parents[0] && !matchedModels.has(id))
      .flatMap(([id, model]) => {
        const full = normalize(model.label);
        const short = full.startsWith(brand + ' ') ? full.slice(brand.length + 1) : full;
        // A bare number can be a price/year; numeric model names require an explicit prefix.
        return [{ id, alias: `modelo ${short}` }, ...(/^[\d\s.]+$/.test(short) ? [] : [{ id, alias: short }])];
      });
    modelHits.push(...take(shortModels));
  }
  select('brand_id', parents, 'una sola marca');
  select('model_id', modelHits.map(hit => hit.id), 'un solo modelo');

  const fuelNames: Record<string, string[]> = {
    '0': ['corriente electrica', 'electrico', 'electrica', 'electricos', 'electricas'],
    '1': ['diesel', 'gasoleo'], '2': ['diesel y corriente electrica', 'diesel hibrido', 'hibrido diesel'],
    '3': ['gasolina'], '4': ['gasolina super'],
    '5': ['gasolina y corriente electrica', 'gasolina hibrido', 'hibrido de gasolina', 'hibrido gasolina'],
    '6': ['gasolina/gas', 'gasolina gas', 'glp'], '7': ['mixto gasolina/etanol', 'gasolina etanol'],
  };
  select('fuel_id', take(Object.entries(fuelNames).filter(([id]) => Object.hasOwn(catalog.fuels, id))
    .flatMap(([id, names]) => names.map(alias => ({ id, alias })))).map(hit => hit.id), 'un solo combustible');
  select('gearbox_id', take([{ id: '0', alias: 'automatico' }, { id: '0', alias: 'automatica' }, { id: '0', alias: 'automaticos' },
    { id: '0', alias: 'automaticas' }, { id: '1', alias: 'manual' }, { id: '1', alias: 'manuales' }]).map(hit => hit.id), 'un solo cambio');
  const locationNames = catalog.locations.flatMap(label => {
    const aliases = [normalize(label)];
    if (label === 'La Coruña') aliases.push('a coruna', 'coruna');
    if (label === 'Sta. C. de Tenerife') aliases.push('santa cruz de tenerife', 'tenerife');
    return aliases.map(alias => ({ id: label, alias }));
  });
  select('location', take(locationNames).map(hit => hit.id), 'una sola provincia');

  function numeric(field: NumericCarField, source: string, comparator: ReturnType<typeof relation>) {
    const clean = source.trim();
    if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+|\d{1,3}(?: \d{3})+)$/.test(clean)) {
      issues.push(`${fieldLabels[field]}: usa números enteros; puedes separar miles con puntos o espacios.`); return;
    }
    const value = Number(clean.replace(/[. ]/g, ''));
    const [low, high] = SEARCH_LIMITS[field];
    if (!Number.isSafeInteger(value) || value < low || value > high) {
      issues.push(`${fieldLabels[field]}: el catálogo admite valores entre ${integer(low)} y ${integer(high)}.`); return;
    }
    for (const suffix of comparator === 'equal' ? ['min', 'max'] as const : [comparator]) {
      const key = `${field}_${suffix}` as const;
      if (filters[key] !== undefined && filters[key] !== value) issues.push(`${fieldLabels[field]}: indica un único límite de cada tipo.`);
      else filters[key] = value;
    }
  }
  function consume(pattern: RegExp, handle: (match: RegExpMatchArray) => void) {
    for (const match of [...remaining.matchAll(pattern)]) {
      handle(match);
      remaining = erase(remaining, match.index!, match.index! + match[0].length);
    }
  }
  consume(new RegExp(`\\bentre\\s+(${numberPattern})\\s+y\\s+(${numberPattern})\\s*(${unitPattern})${boundary}`, 'gu'), match => {
    const field = unitField(match[3]); numeric(field, match[1], 'min'); numeric(field, match[2], 'max');
  });
  consume(new RegExp(`${startBoundary}(?:(${comparatorPattern})\\s+)?(${numberPattern})\\s*(${unitPattern})${boundary}`, 'gu'), match => {
    numeric(unitField(match[3]), match[2], relation(match[1]));
  });
  consume(new RegExp(`\\bentre\\s+(?:los\\s+anos?\\s+)?(${numberPattern})\\s+y\\s+(${numberPattern})(?:\\s+anos?)?${boundary}`, 'gu'), match => {
    numeric('year', match[1], 'min'); numeric('year', match[2], 'max');
  });
  consume(new RegExp(`\\b(?:(${comparatorPattern})\\s+)?(?:del\\s+ano|del|ano)\\s+(${numberPattern})${boundary}`, 'gu'), match => {
    numeric('year', match[2], relation(match[1]));
  });
  consume(new RegExp(`\\b(antes del|antes de|despues del|despues de|anterior(?:es)? al|anterior(?:es)? a|posterior(?:es)? al|posterior(?:es)? a|desde|hasta)\\s+(?:el\\s+)?(?:ano\\s+)?(${numberPattern})${boundary}`, 'gu'), match => {
    numeric('year', match[2], relation(match[1]));
  });

  for (const field of Object.keys(SEARCH_LIMITS) as NumericCarField[]) {
    const lower = [filters[`${field}_min`], filters[`${field}_gt`]].filter((n): n is number => n !== undefined);
    const upper = [filters[`${field}_max`], filters[`${field}_lt`]].filter((n): n is number => n !== undefined);
    if (!lower.length || !upper.length) continue;
    const low = Math.max(...lower), high = Math.min(...upper);
    if (low > high || (low === high && (filters[`${field}_gt`] === low || filters[`${field}_lt`] === high))) {
      issues.push(`${fieldLabels[field]}: los límites se contradicen.`);
    }
  }
  if (/\bhibrid[oa]s?\b/.test(remaining)) issues.push('Para híbridos, especifica «híbrido de gasolina» o «híbrido diésel».');
  const allowed = new Set(('cual cuales cuanto cuantos cuanta cuantas cuesta cuestan vale valen valor donde tenga tengan tener a al quiero busco buscar buscame busca necesito deseo ensename muestrame mostrar muestra ver dame dime tienes teneis tienen hay existe existen alguno alguna algunos algunas un una unos unas el la los las de del en con por para que se sean sea es son y coches coche vehiculo vehiculos auto autos carro carros automovil automoviles me puedes puede podria podrias favor gracias hola buenos buenas dias tardes noches estoy buscando marca modelo combustible cambio caja cambios precio precios potencia cilindrada kilometraje provincia catalogo originales historicos disponibles disponible listado lista consultar consulta recomienda recomiendas recomendar opciones opcion baratos barato baratas barata').split(' '));
  const unknown = unique((remaining.match(/[\p{L}\p{N}]+/gu) ?? []).filter(word => !allowed.has(word)));
  if (unknown.length) issues.push(`No he interpretado «${unknown.slice(0, 8).join(' ')}». Reformula la consulta usando los filtros del ejemplo.`);
  // Never run a partially understood query, even if some filters are valid.
  return { filters, chips: filterChips(filters, catalog), issues: unique(issues) };
}
