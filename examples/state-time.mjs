// Pure UI example: raw API normalization belongs to the project adapter.
export function selectUiState({campaign = 'unknown', auth = 'unknown', eligibility = 'unknown', attempt = 'unknown', pending = false}) {
  if (campaign === 'ended' || campaign === 'not-started') return campaign;
  if (campaign !== 'active') return 'loading';
  if (auth === 'guest') return 'guest';
  if (auth === 'error') return 'error';
  if (auth !== 'authenticated') return 'loading';
  if (pending) return 'pending';
  if (eligibility === 'unverified') return 'verification';
  if (eligibility === 'error') return 'error';
  if (eligibility !== 'verified') return 'loading';
  if (attempt === 'available') return 'available';
  if (attempt === 'consumed') return 'cooldown';
  if (attempt === 'uncertain') return 'syncing';
  if (attempt === 'unavailable') return 'unavailable';
  if (attempt === 'error') return 'error';
  return 'loading';
}

export function remainingSeconds(deadlineMs, nowMs) {
  if (!Number.isFinite(deadlineMs) || !Number.isFinite(nowMs)) return null;
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}

export function formatCountdown(seconds) {
  if (!Number.isInteger(seconds) || seconds < 0) throw new Error('Expected nonnegative integer seconds');
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map(value => String(value).padStart(2, '0')).join(':');
}

// For zones/dates with an existing, unambiguous local midnight. Europe/Kyiv is tested below.
// This is not a general civil-time disambiguation library for skipped midnight dates.
export function nextLocalMidnight(timestampMs, zone) {
  if (!Number.isFinite(timestampMs)) throw new Error('Expected epoch milliseconds');
  if (typeof zone !== 'string' || !zone.trim()) throw new Error('An explicit timezone is required');
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone, year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23'
  });
  const parts = value => Object.fromEntries(formatter.formatToParts(value)
    .filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
  const current = parts(timestampMs);
  const targetDate = new Date(Date.UTC(current.year, current.month - 1, current.day + 1));
  const target = targetDate.getTime();
  let utc = target;
  for (let i = 0; i < 4; i++) {
    const p = parts(utc);
    const correction = target - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    utc += correction;
    if (correction === 0) break;
  }
  const result = parts(utc);
  if (result.hour !== 0 || result.minute !== 0 || result.second !== 0 ||
      result.year !== targetDate.getUTCFullYear() || result.month !== targetDate.getUTCMonth() + 1 ||
      result.day !== targetDate.getUTCDate() || utc <= timestampMs) {
    throw new Error('Local midnight requires an authoritative deadline or a timezone disambiguation library');
  }
  return utc;
}
