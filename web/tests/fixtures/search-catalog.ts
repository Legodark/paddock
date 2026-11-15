import { readFileSync } from 'node:fs';
import type { SearchCatalog } from '../../src/types';
import { CATALOG_VERSION } from '../../src/types';

const contract = JSON.parse(readFileSync(new URL('../../../experiments/model-contract/feature-contract.json', import.meta.url), 'utf8')) as {
  categories: Record<'brands' | 'models' | 'fuels' | 'gearboxes', Record<string, string>>;
  model_brand_ids: Record<string, string>;
};
export const searchCatalog: SearchCatalog = {
  catalog_version: CATALOG_VERSION, historical: true,
  brands: contract.categories.brands, fuels: contract.categories.fuels, gearboxes: contract.categories.gearboxes,
  models: Object.fromEntries(Object.entries(contract.categories.models).map(([id, label]) => [id, { label, brand_id: contract.model_brand_ids[id] }])),
  locations: ['Madrid', 'Málaga', 'León', 'La Coruña', 'Álava', 'Sta. C. de Tenerife', 'Barcelona', 'Valencia'],
};
