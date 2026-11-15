// Check Vercel's compiled routes, including its implicit query forwarding.
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const load = createRequire(path.join(__dirname, 'vercel-tooling/package.json'));
const { getTransformedRoutes } = load('@vercel/routing-utils');
const config = require('../deploy/vercel/vercel.json');

function check(configuration) {
  const result = getTransformedRoutes(configuration);
  assert.equal(result.error, null, 'Vercel route compilation failed');
  const functions = result.routes.filter(route => route.dest);
  assert.equal(functions.length, 1);
  const route = functions[0];
  assert.equal(route.dest, '/api/index.py', 'Rewrite injects route parameters into the strict API query');
  const matches = new RegExp(route.src);
  for (const url of ['/api', '/api/', '/api/index.py', '/api/v1/health', '/api/v1/cars', '/api/v1/search-catalog']) {
    assert.ok(matches.test(url), `API route omitted: ${url}`);
  }
  for (const url of ['/', '/assets/index.js', '/robots.txt', '/THIRD_PARTY_NOTICES.txt', '/apiculture']) {
    assert.ok(!matches.test(url), `Static route sent to Python: ${url}`);
  }
  return route;
}

const route = check(config);
// The original named capture compiles to ?path=$1 and breaks /cars, even
// when the client supplies no query. Verify that this regression is caught.
assert.throws(() => check({
  ...config,
  rewrites: [{ source: '/api/:path*', destination: '/api/index.py' }],
}), /injects route parameters/);

console.log(JSON.stringify({
  compiler: '@vercel/routing-utils@' + load('@vercel/routing-utils/package.json').version,
  valid: true,
  api_route: route,
  named_capture_regression_rejected: true,
  scope: 'Official route compilation and path coverage; provider execution is tested separately.',
}, null, 2));
