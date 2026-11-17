/** Run the original Archify gates in a browser-capable runner; no installation or deployment. */
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync, appendFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(readFileSync(path.join(root, 'ci/archify-candidates.json'), 'utf8'));
const toolRoot = process.env.PADDOCK_ARCHIFY_ROOT;
if (!toolRoot) throw new Error('Set PADDOCK_ARCHIFY_ROOT to the reviewed Archify checkout.');
const toolCommit = execFileSync('git', ['-C', toolRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (toolCommit !== manifest.tool_commit) throw new Error('Unexpected Archify revision.');
if (process.env.ARCHIFY_CHROME_NO_SANDBOX === '1') throw new Error('The browser sandbox must remain enabled.');
let browser = process.env.ARCHIFY_CHROME;
for (const name of ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser']) {
  if (browser) break;
  const found = spawnSync('which', [name], { encoding: 'utf8' });
  if (found.status === 0) browser = found.stdout.trim();
}
if (!browser) throw new Error('A sandbox-capable Chrome/Chromium is required.');
const browserVersion = execFileSync(browser, ['--version'], { encoding: 'utf8' }).trim();
const hash = name => createHash('sha256').update(readFileSync(name)).digest('hex');
let passed = true;
const results = [];
for (const diagram of manifest.candidates) {
  if (hash(diagram.candidate) !== diagram.candidate_sha256 || hash(diagram.artifact) !== diagram.artifact_sha256) {
    throw new Error('Frozen candidate or HTML checksum mismatch: ' + diagram.type);
  }
  const evidence = path.join(process.env.RUNNER_TEMP ?? '/tmp', 'paddock-archify-review', diagram.type);
  mkdirSync(evidence, { recursive: true });
  const run = spawnSync(process.execPath, [path.join(toolRoot, 'archify/bin/archify.mjs'), 'finalize', diagram.type,
    diagram.candidate, diagram.artifact, '--quality', 'showcase', '--out-dir', evidence, '--json'], {
    cwd: root, env: { ...process.env, ARCHIFY_CHROME: browser }, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024,
  });
  let summary;
  try { summary = JSON.parse(run.stdout); }
  catch { throw new Error('Archify did not produce a JSON summary: ' + run.stderr); }
  const unchanged = hash(diagram.candidate) === diagram.candidate_sha256 && hash(diagram.artifact) === diagram.artifact_sha256;
  const valid = run.status === 0 && summary.status === 'pass' && unchanged &&
    ['validate', 'deliver', 'check', 'browser-check'].every(gate => summary.gates?.[gate] === 'pass');
  const result = { type: diagram.type, toolCommit, browserVersion, sandboxRequested: true, exitCode: run.status,
    unchanged, passed: valid, summary };
  // Original compact Archify receipt, retrievable via the authenticated Actions logs; no artifact storage or credentials.
  console.log('PADDOCK_ARCHIFY_RESULT ' + JSON.stringify(result));
  if (process.env.GITHUB_ACTIONS === 'true') {
    const detail = JSON.stringify(result).replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
    console.log(`::${valid ? 'notice' : 'error'} title=Paddock Archify ${diagram.type}::${detail}`);
  }
  if (!valid) {
    console.log(run.stderr);
    passed = false;
  }
  results.push(result);
}
const markdown = ['## Frozen Archify diagrams', '', '| Diagram | Gates | Original bytes |', '| --- | --- | --- |',
  ...results.map(r => `| ${r.type} | ${r.passed ? 'PASS' : 'FAIL'} | ${r.unchanged ? 'Preserved' : 'Changed'} |`),
  '', 'Browser: ' + browserVersion, '', 'Automated gates only. Perceptual review is recorded separately. No deployment or paid artifact storage.', ''].join('\n');
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(markdown);
if (!passed) process.exitCode = 1;
