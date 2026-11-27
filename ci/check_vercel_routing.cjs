// Validate the official routes/schema and their boundary before filesystem lookup.
// This does not execute Vercel's production router or the application.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const load = createRequire(path.join(__dirname, 'vercel-tooling/package.json'));
const { getTransformedRoutes, routesSchema } = load('@vercel/routing-utils');
const Ajv = load('ajv');
const config = require('../deploy/vercel/vercel.json');
const inventory = require('../docs/evidence/preview/candidate-artifacts-20261116.json');
const validateRoutes = new Ajv({ allErrors: true }).compile(routesSchema);
const apiPaths = ['health', 'catalog', 'search-catalog', 'predict', 'message', 'cars']
  .map(name => '/api/v1/' + name);
const apiDestination = '/api/index.py';
const commonHeaders = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};
const expectedDocumentPolicy = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "style-src-attr 'unsafe-inline'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].sort();
const forbiddenPaths = [
  '/api', '/api/', '/api/index.py', '/api/index', '/api/v1/unknown',
  '/api/v1/health/', '/api//v1/health', '/api/v1/%68ealth',
  '/%61pi/v1/health', '/%61pi/index.py', '/%2561pi/index.py',
  '/API/v1/health', '/Api/v1/health', '/api/V1/health', '/api/v1/HEALTH',
  '/assets/../api/index.py', '/assets/%2e%2e/api/index.py',
  '/assets/..%2fapi%2findex.py', '/assets\\..\\api/index.py',
  '/assets/../../api/index.py', '/assets/%252e%252e/api/index.py',
  '/api\\index.py', '/assets/../assets/../api/index.py',
  '/assets/cars.sqlite3', '/assets/price.bin', '/assets/manifest.json',
  '/paddock_service/app.py', '/assets', '/brand-logos',
  '/.env', '/.git/config', '/requirements.txt', '/vercel.json',
  '/public/index.html', '/does-not-exist', '/apiculture',
];

function publicPaths() {
  const recorded = inventory.entries.filter(item => item.path.startsWith('public/'))
    .map(item => '/' + item.path.slice('public/'.length));
  const directory = process.env.PADDOCK_ROUTING_PUBLIC_DIR;
  if (!directory) return { paths: recorded, source: 'versioned-public-inventory' };
  assert.ok(path.isAbsolute(directory), 'Prepared public directory must be absolute');
  const actual = [];
  function visit(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const name = path.join(current, entry.name);
      assert.ok(!entry.isSymbolicLink(), 'Prepared public directory contains a symlink');
      if (entry.isDirectory()) visit(name);
      else if (entry.isFile()) actual.push('/' + path.relative(directory, name).split(path.sep).join('/'));
      else assert.fail('Prepared public directory contains an unsupported entry');
    }
  }
  visit(directory);
  assert.ok(actual.length > 0, 'Prepared public directory is empty');
  return { paths: actual.sort(), source: 'prepared-public-directory' };
}

// Raw routes have historically been matched case-insensitively. Using /i here
// requires the API's scoped (?-i:...) boundary to work on pinned Node 24 as well.
function tracePath(routes, pathname) {
  const headers = {};
  const headerRules = [];
  for (const route of routes) {
    if (!new RegExp(route.src, 'i').test(pathname)) continue;
    if (route.headers) {
      Object.assign(headers, Object.fromEntries(Object.entries(route.headers)
        .map(([key, value]) => [key.toLowerCase(), value])));
      headerRules.push(route.headers);
    }
    if (!route.continue) return { route, headers, headerRules };
  }
  assert.fail('Path has no terminal route: ' + pathname);
}

function staticDestination(route, pathname) {
  return pathname.replace(new RegExp(route.src, 'i'), route.dest);
}

const files = publicPaths();
function check(configuration) {
  assert.ok(!configuration.headers && !configuration.rewrites && !configuration.redirects,
    'Raw route policy must not mix high-level routing properties');
  assert.ok(validateRoutes(configuration.routes), 'Official route schema rejected: ' + JSON.stringify(validateRoutes.errors));
  const result = getTransformedRoutes(configuration);
  assert.equal(result.error, null, 'Vercel route compilation failed');
  const routes = result.routes;
  assert.ok(routes.every(route => !route.handle), 'Implicit filesystem lookup is forbidden');
  const functionRoutes = routes.filter(route => route.dest && route.dest.startsWith('/api/'));
  assert.equal(functionRoutes.length, 1, 'Exactly one explicit Python destination is permitted');
  const api = functionRoutes[0];
  assert.equal(api.dest, apiDestination, 'Rewrite injects route parameters into the strict API query');
  assert.ok(!api.methods, 'Routing must preserve Flask HEAD/OPTIONS and method validation');
  const fallback = routes.at(-1);
  assert.equal(fallback.src, '^/.*$', 'Terminal reject must cover every unmatched pathname');
  assert.equal(fallback.status, 404, 'Unknown paths must terminate with 404');
  assert.ok(!fallback.dest && !fallback.continue, 'Terminal reject must not resolve a file or function');

  for (const pathname of apiPaths) {
    assert.equal(tracePath(routes, pathname).route, api, 'Canonical API path omitted: ' + pathname);
  }
  // Queries are separate from the pathname; a percent sign in a legitimate
  // province query must not be treated as a percent-encoded path alias.
  for (const input of ['/api/v1/cars?location=M%C3%A1laga&limit=3',
    '/api/v1/cars?model_id=118&price_gt=1900', '/api/v1/catalog?x=%25']) {
    const url = new URL(input, 'https://paddock.invalid');
    assert.equal(tracePath(routes, url.pathname).route, api, 'Canonical query routed away from API');
    assert.equal(api.dest.includes('?'), false, 'Query injection in API destination');
    assert.ok(url.search.length > 0);
  }

  for (const input of forbiddenPaths) {
    // Check both a raw pathname and WHATWG-normalized form; production
    // normalization still needs the provider smoke and is not simulated here.
    const normalized = new URL(input, 'https://paddock.invalid').pathname;
    for (const pathname of new Set([input, normalized])) {
      const match = tracePath(routes, pathname);
      assert.notEqual(match.route.dest, apiDestination, 'Non-canonical pathname sent to Python: ' + input);
      // A public-looking filename can target a static-only namespace. No
      // function exists there; it must never be rewritten to the API.
      if (['/assets/cars.sqlite3', '/assets/price.bin', '/assets/manifest.json'].includes(pathname)) {
        assert.equal(staticDestination(match.route, pathname), pathname, 'Private-looking path crossed the static namespace');
      } else assert.equal(match.route.status, 404, 'Non-canonical pathname must terminate before lookup: ' + input);
    }
  }

  for (const pathname of ['/', ...files.paths]) {
    const match = tracePath(routes, pathname);
    assert.ok(match.route.dest && match.route.dest !== apiDestination, 'Static route sent to Python: ' + pathname);
    const target = staticDestination(match.route, pathname);
    assert.equal(target, pathname === '/' ? '/index.html' : pathname, 'Static destination changed: ' + pathname);
    assert.ok(!target.startsWith('/api/'), 'Static destination resolved into Python');
    for (const [key, value] of Object.entries(commonHeaders)) assert.equal(match.headers[key], value);
  }

  for (const pathname of ['/', '/index.html']) {
    const match = tracePath(routes, pathname);
    const htmlHeaders = Object.fromEntries(Object.entries(match.headerRules.at(-1))
      .map(([key, value]) => [key.toLowerCase(), value]));
    // Preserve the provider-regression guard: HTML-specific rules must carry
    // the common headers too, even when a previous continue rule has them.
    for (const [key, value] of Object.entries({ ...commonHeaders, 'cache-control': 'no-cache' })) {
      assert.equal(htmlHeaders[key], value, 'Root security header missing: ' + key);
    }
    const policy = match.headers['content-security-policy'] ?? '';
    const directives = policy.split(';').map(directive => directive.trim().replace(/\s+/g, ' ')).filter(Boolean).sort();
    assert.deepEqual(directives, expectedDocumentPolicy, 'Unexpected document content security policy: ' + pathname);
  }
  return api;
}

const api = check(config);
function mutate(operation) { const copy = structuredClone(config); operation(copy); return copy; }
assert.throws(() => check(mutate(copy => {
  copy.routes.find(route => route.dest === apiDestination).dest += '?path=$1';
})), /injects route parameters/);
assert.throws(() => check(mutate(copy => {
  copy.routes.find(route => route.dest === apiDestination).src = '^/api(/.*)?$';
})), /Non-canonical pathname sent to Python/);
assert.throws(() => check(mutate(copy => {
  const route = copy.routes.find(item => item.dest === apiDestination);
  route.src = '^/api/v1/(?:health|catalog|search-catalog|predict|message|cars)$';
})), /Non-canonical pathname sent to Python/);
assert.throws(() => check(mutate(copy => copy.routes.unshift({ handle: 'filesystem' }))), /Implicit filesystem/);
assert.throws(() => check(mutate(copy => {
  const htmlRule = copy.routes.find(route => new RegExp(route.src, 'i').test('/') && route.headers?.['Content-Security-Policy']);
  delete htmlRule.headers['X-Content-Type-Options'];
})), /Root security header missing/);
assert.throws(() => check(mutate(copy => {
  const htmlRule = copy.routes.find(route => new RegExp(route.src, 'i').test('/') && route.headers?.['Content-Security-Policy']);
  htmlRule.headers['Content-Security-Policy'] = htmlRule.headers['Content-Security-Policy']
    .replace("img-src 'self'", "img-src 'self' https://assets.example.invalid");
})), /Unexpected document content security policy/);

console.log(JSON.stringify({
  compiler: '@vercel/routing-utils@' + load('@vercel/routing-utils/package.json').version,
  valid: true,
  api_route: api,
  canonical_api_paths: apiPaths.length,
  public_paths_checked: files.paths.length,
  public_inventory_source: files.source,
  no_implicit_filesystem: true,
  named_capture_regression_rejected: true,
  wildcard_regression_rejected: true,
  case_insensitive_api_regression_rejected: true,
  filesystem_regression_rejected: true,
  root_security_header_regression_rejected: true,
  extra_csp_origin_regression_rejected: true,
  scope: 'Official schema/route compilation and path boundary; no provider execution, rate-limit enforcement or application calls.',
}, null, 2));
