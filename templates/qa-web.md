# QA Web — <campaign-key> / <build-version>

**Мета:** перевірити продуктову поведінку промо у реальному Web/iframe. Local mocks і App evidence записуються окремо.

## Дані

- Product Stage URL: `<url>`
- Landing canonical URL: `<url-ending-with-slash>`
- Commit / serving build marker: `<sha/version>`
- Figma nodes / copy version / locales: `<references>`
- Mission / task / Journey / creative / bonus mapping: `<QA identifiers>`
- QA-період: `<from–to>`; campaign period: `<from–to inclusive>`
- Timezone / reset: `<IANA timezone + calendar-or-rolling rule>`
- Fixture aliases / secure location: `<guest, unverified, available, consumed>`
- Зміни та ризики: `<scope>`
- Аналітика: `<implemented-and-channel | contract-pending>`

## Механіка для QA

`<Один короткий абзац: що запускає участь, які branches, що роблять claim/risk/close, коли доступна наступна спроба. Окремо зазначити відмінність test bonus від production.>`

## Сценарії

| ID | Перевірка | Очікуваний результат | Статус / evidence |
| --- | --- | --- | --- |
| W01 | Гість: усі participation CTA | Approved auth/registration **modal** event action, без opt-in | TODO |
| W02 | Auth/profile/missions loading | Loader без спалаху active controls; finite error/retry | TODO |
| W03 | Unverified | Verification CTA/action; participation controls не opt-in | TODO |
| W04 | Verified available / double-click / дві choices | Approved available style, один opt-in і shared guard | TODO |
| W05 | Усі Journey branches і popup states | Actual template render/copy/actions; close semantics; server issue once | TODO |
| W06 | Consumed / reload / foreground / reset | Approved disabled UI, shared timer, calendar timezone, renewal server-authoritative | TODO |
| W07 | Logout/account switch/late response/API failure | Чужий старий стан не повертається; unknown не verified | TODO |
| W08 | Game/category/bonus/rules actions | Correct host destination; всі navigation links через event actions | TODO |
| W09 | Responsive / keyboard / locales / FAQ | No overflow; focus/ARIA; grow і shrink iframe; approved copy | TODO |
| W10 | Video cold/warm cache, blocked autoplay, audio | Poster до actual playback і зникає; honest manual fallback | TODO |
| W11 | Carousel/lazy images/motion/WebGL | Pause interaction/background; near-view load; reduced motion; fallback failures | TODO |
| W12 | Analytics, якщо впроваджено | Exact `ga_*` dictionary/CTA IDs, approved delivery/consent/dedupe, no token/PII; successful не вигаданий із click/show; інакше NOT_TESTED | TODO |
| W13 | Published build/cache/parent overlays | Marker збігається, canonical URL/query живі, CTA не перекриті | TODO |

Потрібна матриця browser/viewport: `<actual audience +320px smoke, desktop, landscape, iOS Safari, Android Chrome>`. Перевірка у resize desktop не є actual mobile device evidence.

## Результат

- Evidence level: `<unit/harness/Product Stage browser/actual mobile browser>`
- Пройдено: `<IDs>`; FAIL/BLOCKED/NOT_TESTED: `<IDs + причини>`
- Screenshots/recordings/sanitized logs: `<links>`
- Вихід: `<APPROVED | BLOCKED>` — owner/date/exact build
- Residual risks: `<list>`

Credentials, token, raw profile та персональні ID не додаються. Повний протокол — [QA guide](../docs/13-qa.md); App має [окрему задачу](qa-app.md).
