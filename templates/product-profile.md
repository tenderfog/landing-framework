# Product profile — <product-key>

Приватний versioned документ. Почати з [профілів та investigation](../docs/20-product-profiles-and-investigation.md). Цей файл не заповнюється значеннями сусіднього бренду. Credentials/token/user profiles не зберігаються.

## Паспорт

| Поле | Значення / джерело / дата |
|---|---|
| Product / brand / country / owner | |
| Profile revision / framework commit / reviewed at | |
| Repository / current target branches / CI source | |
| Landing Vue/Nuxt versions / build/deployment contract | |
| Product frontend stack / CMS widget slots | |
| Design system / approved brand assets / locales | |
| Stage and Production host/API/landing origins | |
| Smartico ENV / Label / Brand entity map (private link) | |
| Swift / RN Android supported build range | |
| Default timezone and campaign override owner | |

## Capabilities

| Capability | Web | iOS | Android | Supported version / source / owner / review date |
|---|---|---|---|---|
| Trusted auth/context and logout/account switch | | | | |
| Profile/KYC/eligibility read and freshness | | | | |
| SDK/session owner, initialization readiness | | | | |
| Missions read/update/opt-in | | | | |
| Client Action sender/payload/case | | | | |
| Properties/labels/custom events source and units | | | | |
| Generic product event-action dispatcher | | | | |
| Popup presentation and dismissal/control | | | | |
| Popup delivery/close status available to UI | | | | |
| Cashier open/close/resume signal | | | | |
| Widget mount/unmount/height/visibility | | | | |
| Deep link routing from popup and Journey | | | | |
| Analytics/consent/destination mapping | | | | |

Значення: supported / unsupported / proposed / unknown із доказом. Назва бажаної capability не є її implementation API.

## Контракти та перевірки

- Canonical bridge version/hash/schema: ___. Origin/CORS/CSP owners: ___.
- Product action registry/version/parameters/fallbacks: ___.
- State schemas/units/subscriptions/unsubscribe/freshness: ___.
- SDK/native protocol version; no parallel session rule: ___.
- CRM authoring modes available (Vibe/legacy/other), delivery limits/suppression: ___.
- Source event → property/segment/mission mapping, responsible producer: ___.
- Reward provider/status/idempotency/bonus-cost data contract: ___.
- Actual real-host and device evidence/date: ___.
- Known gaps → owner → next check: ___.

Campaign IDs, reward mappings, production properties, audience, dates, recurrence й action names конкретної акції належать campaign kit. Профіль містить спосіб їх отримати й перевірити.
