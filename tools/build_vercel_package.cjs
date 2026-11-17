// Local packaging with the pinned official builder; no account API or deploy.
const fs = require('node:fs/promises');
const path = require('node:path');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '..');
const scratch = path.resolve(root, '..', '.paddock');
const tooling = process.env.PADDOCK_VERCEL_TOOLING || path.join(scratch, 'vercel-tooling');
const load = createRequire(path.join(tooling, 'package.json'));
const runtime = load('@vercel/python');
const { glob } = load('@vercel/build-utils');

async function main() {
  const source = path.resolve(process.argv[2] || path.join(scratch, 'vercel-package'));
  const workPath = path.resolve(process.argv[3] || path.join(scratch, 'vercel-build'));
  const materialized = workPath + '-function';
  for (const target of [workPath, materialized]) {
    try { await fs.stat(target); throw new Error('Choose a new build path: ' + target); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  await fs.mkdir(workPath, { recursive: true });
  const config = JSON.parse(await fs.readFile(path.join(source, 'vercel.json'), 'utf8'));
  const files = await glob('**', source);
  Object.assign(files, await glob('.python-version', source));
  if (!files['assets/price.bin'] || !files['.python-version']) throw new Error('Incomplete deployment source');
  const started = Date.now();
  const result = await runtime.build({
    files, entrypoint: 'api/index.py', workPath, repoRootPath: workPath,
    config, meta: { isDev: false },
  });
  const lambda = result.result?.output || result.output;
  if (!lambda || !lambda.files || !lambda.runtime) throw new Error('Unexpected official builder output');
  await fs.mkdir(materialized);
  let total = 0;
  const inventory = [];
  for (const [name, file] of Object.entries(lambda.files)) {
    const target = path.resolve(materialized, name);
    if (!target.startsWith(materialized + path.sep)) throw new Error('Unsafe output path');
    await fs.mkdir(path.dirname(target), { recursive: true });
    let bytes;
    if (file.fsPath) {
      await fs.copyFile(file.fsPath, target);
      bytes = (await fs.stat(target)).size;
    } else if (typeof file.data === 'string' || Buffer.isBuffer(file.data)) {
      const data = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, 'utf8');
      await fs.writeFile(target, data);
      bytes = data.length;
    } else throw new Error('Unsupported official builder file type: ' + file.type);
    total += bytes;
    inventory.push({ name, bytes });
  }
  for (const required of ['assets/price.bin', 'assets/cars.sqlite3', 'api/index.py']) {
    if (!inventory.some(item => item.name === required)) throw new Error('Builder omitted required file: ' + required);
  }
  const report = {
    official_builder: '@vercel/python@' + load('@vercel/python/package.json').version,
    runtime: lambda.runtime, handler: lambda.handler,
    uncompressed_bytes: total, uncompressed_mib: total / 1048576,
    file_count: inventory.length, elapsed_seconds: (Date.now() - started) / 1000,
    materialized_function: materialized,
    forbidden_ml_packages: inventory.filter(item => /(?:^|\/)(?:numpy|scipy|sklearn|joblib|pymongo)(?:\/|\.)/.test(item.name)).map(item => item.name),
    scope: 'Local official runtime builder only; no Vercel project/account/deployment or billing verification.',
  };
  if (report.forbidden_ml_packages.length) throw new Error('Unexpected ML dependency in deployment');
  await fs.writeFile(path.join(workPath, 'paddock-bundle-report.json'), JSON.stringify(report, null, 2) + '\n');
  await fs.writeFile(path.join(workPath, 'paddock-bundle-inventory.json'), JSON.stringify(inventory, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
