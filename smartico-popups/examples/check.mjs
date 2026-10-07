import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const root = path.dirname(fileURLToPath(import.meta.url));
const enginePath = process.argv[2];
if (!enginePath) {
  console.error('Usage: node smartico-popups/examples/check.mjs /absolute/path/to/trusted/tmpl.min.js');
  process.exit(2);
}
const read = name => readFile(path.join(root, name), 'utf8');
const config = JSON.parse(await read('configuration.json'));
const body = await read('body.html');
const engine = await readFile(enginePath, 'utf8');
const optional = new Set();
const fields = new Map();
const allNames = new Set();
for (const group of config) {
  assert(!/[\u0400-\u04ff]/u.test(group.label), 'Internal group labels use Latin');
  for (const option of group.options) {
    assert(!allNames.has(option.name), `Duplicate name ${option.name}`);
    assert(/^[a-z][a-z0-9_]*$/u.test(option.name));
    assert(!/[\u0400-\u04ff]/u.test(option.label));
    allNames.add(option.name);
    if (option.optional === true) {
      optional.add(option.name);
      assert.equal(option.optional_default, false, 'This example defaults optional controls to off');
    }
    for (const field of option.fields) {
      assert(!allNames.has(field.name), `Duplicate name ${field.name}`);
      assert(/^[a-z][a-z0-9_]*$/u.test(field.name));
      assert(!/[\u0400-\u04ff]/u.test(field.label));
      allNames.add(field.name);
      fields.set(field.name, field);
    }
  }
}
const referenced = new Set([...body.matchAll(/\bp\.([a-z][a-z0-9_]*)/gu)].map(match => match[1]));
for (const name of referenced) assert(fields.has(name) || optional.has(name), `Undefined Body param ${name}`);
for (const name of [...fields.keys(), ...optional]) assert(referenced.has(name), `Unused configured param ${name}`);
assert(!/data:[^\s"']*base64,/iu.test(body), 'Use hosted image/font resources');
assert(!/<\/script\s*>/iu.test(body), 'Body must not prematurely close an outer template script');
assert(!/\{%|%\}/u.test(body.replace(/\{%[\s\S]*?%\}/gu, '')), 'Unexpected literal template delimiter');

function validate(values) {
  for (const [key, value] of Object.entries(values)) {
    if (optional.has(key)) {
      assert(value && !Array.isArray(value) && typeof value === 'object');
      assert.equal(typeof value.checked, 'boolean', `${key}.checked must be boolean`);
    } else {
      assert(fields.has(key), `Unknown custom value ${key}`);
      assert.equal(typeof value, 'string', `${key} must match the text/url/image input contract`);
    }
  }
  assert(['uk', 'en'].includes(values.locale));
  assert(['information', 'choice', 'notice'].includes(values.visual_state));
  assert(['contained', 'fullscreen'].includes(values.layout));
  assert(values.title?.trim(), 'Production-like fixtures must have explicit copy');
  for (const prefix of ['primary', 'secondary', 'close']) {
    const flag = values[`${prefix}_button`]?.checked === true;
    const action = values[`${prefix}_action`];
    if (!flag) continue;
    assert(typeof action === 'string' && action.trim(), `Enabled ${prefix} requires an action`);
    assert(values[prefix === 'close' ? 'close_label' : `${prefix}_text`]?.trim(), 'Enabled control requires accessible copy');
    if (['dp:ok', 'dp:cancel', 'dp:close'].includes(action)) continue;
    assert(action.startsWith('dp:go&url='), 'Example supports only its agreed controls and navigation');
    const destination = new URL(action.slice('dp:go&url='.length));
    assert.equal(destination.protocol, 'https:');
    assert.equal(destination.username + destination.password, '', 'Credentials are not permitted in navigation URLs');
    assert.equal(destination.origin, 'https://product.example.test');
    assert.equal(destination.pathname, '/event_action/bonuses', 'Only the confirmed example event_action route is allowed');
    assert.equal(destination.search + destination.hash, '', 'The example route has no agreed query/hash');
    assert.equal(action.slice('dp:go&url='.length), destination.href, 'Use a canonical approved URL without path aliases');
  }
  if (values.icon?.checked === true) {
    const resource = new URL(values.icon_url);
    assert.equal(resource.protocol, 'https:');
    assert.equal(resource.username + resource.password, '', 'Credentials are not permitted in asset URLs');
    assert.equal(resource.origin, 'https://cdn.example.test', 'Replace with your approved resource origin before release');
  }
}

let idLookups = 0;
const context = vm.createContext({document: {getElementById(id) {
  assert.equal(id, '_template');
  idLookups++;
  return {innerHTML: body};
}}});
vm.runInContext(engine, context, {filename: path.basename(enginePath)});
assert.equal(typeof context.tmpl, 'function', 'Expected Smartico-compatible tmpl runtime');
const render = values => context.tmpl('_template', values);
// A foreign VM SyntaxError belongs to another realm: compare its name rather than instanceof.
assert.throws(() => context.tmpl('<style>.art{height:100%}</style>', {}), error => error.name === 'SyntaxError');
assert.doesNotThrow(() => context.tmpl('<style>.art { height:100%; }</style>', {}));

const fixtureNames = (await readdir(root)).filter(name => /^values\..+\.json$/u.test(name)).sort();
assert.equal(fixtureNames.length, 3);
const fixtures = [];
const decode = value => value.replace(/&amp;/gu, '&').replace(/&quot;/gu, '"').replace(/&#39;/gu, "'");
function hrefs(html) {
  return [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/gu)].map(match => decode(match[1]));
}
let matrixCount = 0;
for (const name of fixtureNames) {
  const values = JSON.parse(await read(name));
  validate(values);
  fixtures.push(values);
  const html = render(values);
  assert(html.includes('<section class="spp'), 'Visible content root exists');
  assert(html.includes(values.title));
  assert(!/\{%|%\}/u.test(html), 'No unrendered delimiters');
  const expectedActions = ['close', 'primary', 'secondary']
    .filter(prefix => values[`${prefix}_button`]?.checked === true)
    .map(prefix => values[`${prefix}_action`]);
  assert.deepEqual(hrefs(html), expectedActions);
  assert.equal((html.match(/data-ao-hide-popup="true"/gu) || []).length, expectedActions.length);
  for (const locale of ['uk', 'en']) for (const layout of ['contained', 'fullscreen']) for (let mask = 0; mask < 8; mask++) {
    const test = {...values, locale, layout,
      primary_text: 'Primary', primary_action: 'dp:ok', primary_button: {checked: !!(mask & 1)},
      secondary_text: 'Secondary', secondary_action: 'dp:cancel', secondary_button: {checked: !!(mask & 2)},
      close_label: 'Close', close_action: 'dp:close', close_button: {checked: !!(mask & 4)}};
    validate(test);
    const output = render(test);
    const count = Number(!!(mask & 1)) + Number(!!(mask & 2));
    assert.equal(output.includes('class="spp__actions"'), count > 0, 'No empty actions container');
    if (count) assert(output.includes(`data-count="${count}"`));
    assert.equal(output.includes('class="spp__close"'), !!(mask & 4));
    assert.equal(hrefs(output).length, count + Number(!!(mask & 4)));
    assert(output.includes(`lang="${locale}"`) && output.includes(`data-layout="${layout}"`));
    matrixCount++;
  }
}

const sample = fixtures.find(values => values.visual_state === 'choice');
assert.throws(() => validate({...sample, primary_button: {checked: 'false'}}), /boolean/u);
assert.throws(() => validate({...sample, primary_action: 'javascript:alert(1)'}));
assert.throws(() => validate({...sample, primary_action: 'dp:go&url=https://product.example.test/bonuses'}));
assert.throws(() => validate({...sample, primary_action: 'dp:go&url=https://product.example.test/event_action/unknown-operation'}));
assert.throws(() => validate({...sample, primary_action: 'dp:go&url=https://example-user:example-pass@product.example.test/event_action/bonuses'}));
assert.throws(() => validate({...sample, primary_action: 'dp:go&url=https://product.example.test/event_action/bonuses?unapproved=1'}));
assert.throws(() => validate({...sample, primary_action: 'dp:go&url=https://product.example.test/event_action/temp/../bonuses'}));
assert.throws(() => validate({...sample, icon_url: 'https://example-user:example-pass@cdn.example.test/promos/shared/icon.a1b2.webp'}));
assert.throws(() => validate({...sample, title: ''}), /explicit copy/u);
assert.throws(() => validate({...sample, unexpected_field: 'value'}), /Unknown/u);
for (const flag of [undefined, {checked: false}, {checked: 'true'}]) {
  const html = render({...sample, primary_button: flag, secondary_button: {checked: false}});
  assert(!html.includes('class="spp__actions"'), 'Missing/false/string flags must not enable a control');
}
assert(!render({...sample, primary_action: '', secondary_button: {checked: false}}).includes('class="spp__actions"'));
const minimal = render({});
assert(minimal.includes('Інформація') && !minimal.includes('class="spp__actions"'));
assert(!render({description: '', icon: {checked: true}, icon_url: 'data:image/png;base64,AA=='}).includes('<img'));
const untrusted = '<img src=x onerror=alert(1)></script><script>alert(1)</script>';
const escaped = render({...sample, title: untrusted, description: untrusted, close_label: 'Close "now"'});
assert(escaped.includes('&lt;img') && escaped.includes('&lt;/script&gt;'));
assert(!escaped.includes('<script>') && !escaped.includes('<img src=x'));
assert(escaped.includes('aria-label="Close &quot;now&quot;"'));
assert(render({...sample, entrance_ms: '9999'}).includes('spp-enter 280ms'));
assert(!render({...sample, icon: {checked: false}}).includes('class="spp__icon"'));
assert(body.includes('@media (prefers-reduced-motion: reduce)'));
assert(body.includes('.spp__actions[data-count="2"]'));
assert.equal(idLookups, 1, 'Actual template-ID load path used; later renders use engine cache');
const sha = source => createHash('sha256').update(source).digest('hex');
console.log(JSON.stringify({
  result: 'PASS', fixtures: fixtureNames.length, stateLocaleLayoutButtonMatrix: matrixCount,
  engineSha256: sha(engine), bodySha256: sha(body), bodyBytes: Buffer.byteLength(body),
  checked: 'Configuration parity/types; actual tmpl template-ID; literal delimiter regression; optional flags; 0/1/2+X; escaping; supported example routes; neutral minimal params',
  pending: 'Actual BO schema/save/delivery, network/assets, focus/sizing, SDK actions/grants, real Web/iOS/Android visual and interaction QA'
}, null, 2));
