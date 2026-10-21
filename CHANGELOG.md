# Зміни framework

## 2.0.0 — 21.10.2026

Мета — швидше проєктувати й самостійно реалізовувати типово схожі промо для SlotCity, CatBet та нових продуктів; використовувати перевірений debugging досвід як метод дослідження майбутніх можливостей. Назва repo та старі doc paths збережені.

### Нові основні розділи

- [19 — Surfaces/workflows](docs/19-surfaces-and-workflows.md): landing, stateless/stateful widget, teaser, CRM popup та vendor widgets; shared state й окремі placement/lifecycle/QA.
- [20 — Profiles/investigation](docs/20-product-profiles-and-investigation.md): спільний framework → private product profile → campaign kit, config-only reuse проти нової capability, перший доведений розрив.
- [21 — Promo patterns](docs/21-promo-patterns.md): prerequisite до irreversible entry, source→projection→UI, information/core flows, backfill/ENV isolation, ліміти, pending/reset і active-source audit.
- [22 — Incidents/cleanup](docs/22-incidents-and-popup-cleanup.md): баги з причинами, actual fixes і proof limits; actual compiler/JSC, зайві залежності, duplicate handlers, native tap, queue/CAPs, scroll/focus, graph/cache/state й аналітика.
- [Smartico knowledge base](smartico-knowledge/README.md): модель/інтеграція, missions/state, Journey/rewards, popup/routing, investigation/analytics і джерела.
- Templates: [product profile](templates/product-profile.md), [widget brief](templates/widget-brief.md), [investigation record](templates/investigation-record.md); prerequisites/measurement/delivery додано до чинних templates.

### Виправлені припущення

| Попереднє узагальнення | Поточне правило |
|---|---|
| Усі нові Smartico popup завершуються Configuration/Body | Перевірити actual authoring: поточні docs рекомендують Vibe, legacy підтримується окремо |
| Кожна підказка має бути CRM popup | Локальна info modal без CRM engagement/grant може лишатися frontend |
| `ga_*` programmatic producer — preferred для всіх | Фінальний contract продукту визначає DOM/GTM або programmatic/native mode; без подвійного збору |
| Product Smartico route завжди придатний action sender | Перевірити navigation/scroll-lock side effects; use supported action-only sender коли доступний |
| Missing prerequisite можна перевірити після opt-in | До consumption point, якщо відмова не повинна витратити спробу; server recheck лишається |
| Marker write або один two-tab test доводить один grant | Atomic cap/issuance idempotency/concurrent proof — окремі речі |
| Saved settings або local compiler PASS закриває production bug | BO, browser, physical device й original incident cause мають окремі evidence levels |

### Консолідація перед публікацією

- Переписано наявні Smartico chapters разом із новою KB: concepts/API мають одного власника, BO runbooks містять процедури й посилання.
- Figma/brief popup workflows більше не містять дубльованих partial templates: технічний контракт у `06`, єдиний runnable приклад — у `smartico-popups/examples/`.
- Старий великий programmatic analytics proposal замінено одним mode-aware guide; analytics plan містить поля проєкту без другої копії tutorial/payload.
- `15` перетворено на symptom index, `22` зберігає детальні механізми інцидентів; дубльоване `case-studies/daily-promo.md` видалено й inbound links оновлено.
- Product brief посилається на єдині technical values в integration contract, а patterns — на canonical API/reset/cap guides. Maintenance визначає ownership для наступних змін.

### Межі оновлення

Новий framework не переписує опубліковані промо, не міняє live Smartico settings і не встановлює нові native handlers. Vue3/Nuxt4 лишається стандартом продуктового лендінгу. Tenant capabilities й private mappings підтверджуються перед reuse.

Походження та обмеження: [SOURCES](SOURCES.md). Local checks перевіряють пакет і приклади; actual Stage/device verification належить конкретній реалізації.

## 1.2.1 — baseline

Commit `3f2e7cdab14d678ddb9183426c8e0928b864066a`: landing stack, iframe/event actions, mission/Journey runbooks, legacy popup workflows, state/time, media, QA/release/security. Ці знання збережені й уточнені; вони не подаються як цілком нові відкриття версії 2.0.
