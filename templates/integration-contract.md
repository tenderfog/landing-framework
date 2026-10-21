# Integration contract — конкретний проєкт

Surface/scope: ___. Успадкований [product profile](product-profile.md), revision/date: ___. Заповнювати лише використані capabilities, campaign-specific відмінності й evidence; незмінні profile values давати посиланням, не другою копією. Для stateless-widget-only або popup-only scope landing build/SDK/mission sections без фактичної залежності позначити N/A.

## Landing stack та delivery

Обов'язковий [Vue 3 + Nuxt 4](../docs/00-technical-stack.md), Vue SFC із Composition API та `<script setup lang="ts">`. Swift/RN — native hosts; Smartico popup — окремий vendor runtime/authoring contract. Їхні контракти не замінюють landing stack.

| Поле | Фактичне значення / evidence |
|---|---|
| Exact Vue 3 / Nuxt 4 / TypeScript versions | |
| Node.js / package manager + exact versions | |
| Lockfile path / checksum або source commit | |
| Static generated default / погоджений SSR | |
| SSR server runtime/hosting owner і погодження, якщо застосовується | |
| Exact install/build command / working directory | |
| Фактичний output directory / CI artifact → public deployment mapping | |
| Campaign subpath / configured Nuxt base path / asset base URLs | |
| Direct entry / iframe src / chunk URLs / redirects під subpath — evidence | |
| Початковий generated state/locale / trusted context client lifecycle | |
| Runtime + hydration + initial chunks budget / actual measurement | |

## Environment matrix

| Platform/env | Landing URL/origin | Host origin/build | API origin | Smartico ENV/label/brand | Evidence/version |
|---|---|---|---|---|---|
| Local | | | | | |
| Web Stage | | | | | |
| Swift WKWebView | | | | | |
| RN Android WebView | | | | | |
| Production | | | | | |

## Власники та capabilities

| Capability | Web | Swift | RN Android | Owner/schema/version |
|---|---|---|---|---|
| Auth/token/context | | | | |
| Locale/theme | | | | |
| Prerequisite source → CRM projection → public state/freshness | | | | |
| Trusted host platform/surface/device для analytics | | | | |
| Verification/eligibility read | | | | |
| Mission list/read/updates/opt-in | | | | |
| Client Action delivery | | | | |
| Current-cycle read/caps у Client Action mode | | | | |
| Product event actions | | | | |
| Smartico popup presentation/controls | | | | |
| Popup suspension/queue/caps/delivery timeout + acknowledgment boundaries | | | | |
| dp:go → event_action routing | | | | |
| Analytics + consent | | | | |
| Host viewport/visibility | | | | |
| Widget slot/mount/unmount/height/placement ownership | | | | |

У клітинці ставити supported із доказом, unsupported, proposed або unknown. Proposed API не можна викликати як реалізований.

## Bridge та lifecycle

Canonical bridge version/hash: ___. Scroll owner: ___. Height root/settled update: ___. URL trailing slash/redirect behavior: ___. Auth/token source та null/error handling: ___. Identity/token refresh/logout: ___. Timeout/retry/backoff: ___. CSP/CORS/asset/font/autoplay constraints: ___. Cleanup observers/subscriptions/socket ownership: ___.

## CTA matrix

| Intent / analytics ID | Видимий label по locale/state | productAction | fallback action URL | downstream Smartico command/action | success/error truth |
|---|---|---|---|---|---|
| | | | | | |

## Business/CRM references

Approved business rules, dates/timezone/prerequisite: [project brief](project-brief.md), revision ___. CRM entity map, triggers/branches, re-entry/caps, grants і delivery policy: [Smartico blueprint](smartico-blueprint.md), revision ___. UI normalization/CTA states: [state matrix](state-matrix.md), revision ___. Не переписувати значення цих документів у ще одну конфігураційну таблицю.

Boundary evidence, яке належить саме інтеграції: exact read fields/units/freshness ___. Source event → public/server projection mapping ___. Consumption/preflight transport ___. Action-only sender та перевірені navigation/scroll-lock side effects ___. Popup authoring/runtime version і доступні delivery/close signals ___.

## Acceptance

Payload приклади без token/PII. Обмеження конкретної App build. [QA Web](qa-web.md) та [QA App](qa-app.md) із окремими evidence levels. Аналітика включена лише після підтвердження transport/consent. [Деталі контракту](../docs/02-iframe-and-contracts.md).
