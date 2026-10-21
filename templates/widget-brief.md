# Widget brief — <widget-key>

Використати разом із [widget workflow](../docs/19-surfaces-and-workflows.md), [product profile](product-profile.md), [integration contract](integration-contract.md) і [state matrix](state-matrix.md). Це brief продуктового widget; для Smartico module додати його actual vendor contract.

| Поле | Рішення / джерело |
|---|---|
| Product / campaign / widget key / owner | |
| Роль: teaser / status / direct participation / continuation | |
| Host route / CMS slot / inline or floating | |
| Component or iframe / stack / entry artifact | |
| Container width range / min-max height / aspect policy | |
| Scroll/height/visibility owner | |
| Z-index / collisions / safe-area / host overlays | |
| Mount/unmount / SPA navigation / multiple instances | |
| Guest/auth prerequisites and source of truth | |
| Shared state provider / freshness / refresh triggers | |
| Campaign schedule / display schedule / timezone | |
| Dismiss behavior / storage scope / TTL, if required | |
| Main CTA intent / supported transport / fallback | |
| Server caps/dedupe with landing and other instances | |
| Popup owner / delivery state / cashbox return handling | |
| Copy/art per locale/state / full rules destination | |
| Responsive / text scaling / keyboard / reduced motion | |
| Initial bytes / CPU/GPU / offscreen policy | |
| Analytics placement / actual visibility / event owner | |
| Stage/Prod config mapping and supported App builds | |

## States та acceptance

Для stateless teaser заповнити лише застосовні schedule/navigation/fallback states. SDK/profile/mission і повний business-state provider не потрібні без залежності від user state.

| State | Authoritative input/freshness | Compact content + CTA | Recovery / test evidence |
|---|---|---|---|
| Guest | | | |
| Loading/unknown | | | |
| Prerequisite missing | | | |
| Available | | | |
| Pending/uncertain | | | |
| Consumed/reset waiting | | | |
| Error/stale | | | |
| Not started/ended/hidden | | | |

## Інтеграційний smoke

- [ ] Real CMS slot і narrow/wide контейнер, long locale, text scaling.
- [ ] One/multiple instances, повторний mount/unmount, SPA navigation без leaked handlers.
- [ ] Guest/login/logout/account switch і late responses.
- [ ] Concurrent widget/landing entry: server limits лишаються правильними.
- [ ] Cashier/popup/host overlays, background/resume, no queued repeat requests.
- [ ] Offscreen/hidden/reduced motion, actual visibility analytics.
- [ ] Actual Web/iOS/Android evidence або explicit NOT_TESTED/unsupported.

Готовність: reviewable visual + source/config + filled contracts + affected QA + serving revision. Prototype/mock не підтверджує CRM integration.
