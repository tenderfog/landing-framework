import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createActionNavigator} from './event-actions.mjs';
import {selectUiState, nextLocalMidnight, remainingSeconds, formatCountdown} from './state-time.mjs';

const delivered = [], navigated = [];
const registry = new Set(['event_action/auth', 'event_action/verif', 'event_action/game_modal/example-game', 'event_action/section/slots?subsection=for-bonuses']);
const nav = createActionNavigator({
  productOrigin: 'https://stage.example.test', isAllowedAction: action => registry.has(action),
  dispatchToHost: action => delivered.push(action), navigateStandalone: href => navigated.push(href)
});
assert.equal(nav.href('event_action/section/slots?subsection=for-bonuses'), 'https://stage.example.test/event_action/section/slots?subsection=for-bonuses');
nav.navigate('event_action/verif', {embedded: true, connected: true});
assert.deepEqual(delivered, ['event_action/verif']);
assert.deepEqual(navigated, []); // No second navigation after host delivery.
nav.navigate('event_action/game_modal/example-game', {embedded: false, connected: false});
assert.equal(navigated[0], 'https://stage.example.test/event_action/game_modal/example-game');
assert.throws(() => nav.navigate('event_action/auth', {embedded: true, connected: false}), /Disconnected/);
assert.throws(() => nav.navigate('event_action/auth', {embedded: true, connected: 'false'}), /Disconnected/);
assert.throws(() => nav.navigate('event_action/auth', {}), /explicit/);
assert.throws(() => nav.href('https://unapproved.example/'), /Unsupported/);
assert.throws(() => nav.href('event_action/not-in-registry'), /Unsupported/);
const patternNav = createActionNavigator({productOrigin: 'https://stage.example.test', isAllowedAction: action => /^event_action\/game_modal\/.+$/u.test(action)});
for (const action of ['event_action/game_modal/../cashier', 'event_action/game_modal/%2e%2e/cashier', String.raw`event_action/game_modal/..\cashier`]) {
  assert.throws(() => patternNav.href(action), /normalization/);
}
assert.throws(() => createActionNavigator({productOrigin: 'https://user:password@example.test', isAllowedAction: () => true}), /reviewed/);

const active = {campaign: 'active'};
const authenticated = {...active, auth: 'authenticated'};
assert.equal(selectUiState({...active, auth: 'guest'}), 'guest');
assert.equal(selectUiState({...active, auth: 'unknown', eligibility: 'verified', attempt: 'available'}), 'loading');
assert.equal(selectUiState({...authenticated, eligibility: 'unverified', attempt: 'available'}), 'verification');
assert.equal(selectUiState({...authenticated, eligibility: 'unknown', attempt: 'available'}), 'loading');
assert.equal(selectUiState({...authenticated, eligibility: 'error', attempt: 'available'}), 'error');
assert.equal(selectUiState({...authenticated, eligibility: 'verified', attempt: 'available'}), 'available');
assert.equal(selectUiState({...authenticated, eligibility: 'verified', attempt: 'consumed'}), 'cooldown');
assert.equal(selectUiState({...authenticated, eligibility: 'verified', attempt: 'uncertain'}), 'syncing');
assert.equal(selectUiState({...authenticated, eligibility: 'verified', attempt: 'available', pending: true}), 'pending');
assert.equal(selectUiState({...authenticated, campaign: 'ended', eligibility: 'verified', attempt: 'available'}), 'ended');

const midnight = iso => nextLocalMidnight(Date.parse(iso), 'Europe/Kyiv');
assert.throws(() => nextLocalMidnight(Date.now()), /timezone/);
assert.equal(new Date(midnight('2026-10-02T16:15:00Z')).toISOString(), '2026-10-02T21:00:00.000Z');
assert.equal(new Date(midnight('2026-10-02T21:10:00Z')).toISOString(), '2026-10-03T21:00:00.000Z');
const autumnBefore = midnight('2026-10-24T12:00:00Z');
const autumnAfter = midnight('2026-10-25T12:00:00Z');
assert.equal((autumnAfter - autumnBefore) / 3600000, 25);
assert.equal(new Date(autumnAfter).toISOString(), '2026-10-25T22:00:00.000Z');
const springBefore = midnight('2026-03-28T12:00:00Z');
const springAfter = midnight('2026-03-29T12:00:00Z');
assert.equal((springAfter - springBefore) / 3600000, 23);
const consumedDeadline = midnight('2026-10-02T16:15:00Z');
assert.equal(remainingSeconds(consumedDeadline, Date.parse('2026-10-02T21:10:00Z')), 0);
// A zero display timer never alters authoritative consumed state.
assert.equal(selectUiState({...authenticated, eligibility: 'verified', attempt: 'consumed'}), 'cooldown');
assert.equal(remainingSeconds(null, Date.now()), null);
assert.equal(formatCountdown(90000), '25:00:00');

const config = JSON.parse(await readFile(new URL('./campaign.config.json', import.meta.url), 'utf8'));
const locales = JSON.parse(await readFile(new URL('./locales.json', import.meta.url), 'utf8'));
assert.equal(config.exampleOnly, true);
assert.equal(config.participation.mode, 'mission');
assert.equal(config.participation.autoRetryActivation, false);
assert.equal(config.analytics.forwardingEnabled, false);
assert.equal(config.rules.enabled, false);
assert.deepEqual(Object.keys(locales.uk).sort(), Object.keys(locales.en).sort());
console.log('PASS: event-action routing, state gating, shared deadlines, Kyiv DST and example config');
