# Smartico: каталог первинних джерел та статус перевірки

Дата огляду — **21.10.2026**. Статус **прочитано** означає, що відповідний зміст був отриманий і звірений під час цього оновлення; це не тест у tenant. **Маршрут** означає посилання для наступного investigation, без твердження, що зміст уже перевірений. Недоступну сторінку не використовуємо як самостійний доказ актуальної поведінки.

Help Center змінюється без pinned revision у URL. Для implementation/reconfiguration повторно відкривай потрібну сторінку й записуй дату та фактичний tenant/runtime. Офіційні приклади не встановлюють ваш brand mapping, event registry або scope авторизації.

## Зафіксовані GitHub snapshots

Поточний branch head перевірено через GitHub API:

- `smarticoai/public-api`: [`81f2790f02424f01dadcbe979288f096cdc5d542`](https://github.com/smarticoai/public-api/tree/81f2790f02424f01dadcbe979288f096cdc5d542), commit message `0.0.440`, 21.10.2026. Це revision документації/source, а не доказ версії SDK у вашому host.
- `smarticoai/JavaScript-Templates`: [`2272bed00e4e0f536ff6958e58def31882207d98`](https://github.com/smarticoai/JavaScript-Templates/tree/2272bed00e4e0f536ff6958e58def31882207d98), commit `3.20.0`. Deployable `tmpl.min.js` у vendor CDN потрібно звіряти окремо: head GitHub не є його автоматичним checksum.

| Джерело | Що перевірено | Де використовується |
|---|---|---|
| [Public API entrypoint](https://github.com/smarticoai/public-api) | Поділ API domains, user-scoped usage, links до types/UI guides | [Модель](01-model-and-integration.md) |
| [Core `_smartico` methods](https://github.com/smarticoai/public-api/blob/81f2790f02424f01dadcbe979288f096cdc5d542/docs/SmarticoObject.md) | Setup/identity, public props, actions, suspend/resume; pinned файл прочитано | [01](01-model-and-integration.md), [04](04-popups-and-routing.md) |
| [Callbacks](https://github.com/smarticoai/public-api/blob/81f2790f02424f01dadcbe979288f096cdc5d542/docs/Callbacks.md) | Initial/partial props, handler lifecycle, identify error, late subscribers | [01](01-model-and-integration.md) |
| [WSAPIMissions](https://github.com/smarticoai/public-api/blob/81f2790f02424f01dadcbe979288f096cdc5d542/docs/api/classes/WSAPIMissions.md) | Full-array update, один callback, cache, visibility, mutation refresh | [02](02-missions-and-state.md) |
| [TMissionOrBadge](https://github.com/smarticoai/public-api/blob/81f2790f02424f01dadcbe979288f096cdc5d542/docs/api/interfaces/TMissionOrBadge.md) | Fields та type-specific completion/time distinctions | [02](02-missions-and-state.md); exact shape звіряти з runtime |
| [Mission UI guide](https://github.com/smarticoai/public-api/blob/main/docs/ui/missions/UIGuide_getMissions.md) | Status bucketing та відмінність timers від completion | Маршрут для складнішого mission UI; current `main` змінюється |
| [Native protocol](https://github.com/smarticoai/public-api/blob/81f2790f02424f01dadcbe979288f096cdc5d542/docs/native/PROTOCOL.md) | Connection/API/tracking sections; pinned файл отримано | [01](01-model-and-integration.md), [native runbook](../docs/07-native-webview.md) |
| [Template engine README](https://github.com/smarticoai/JavaScript-Templates/blob/2272bed00e4e0f536ff6958e58def31882207d98/README.md) | Template parsing, interpolation/evaluation, actual compiler reference | [04](04-popups-and-routing.md), [compiler fixture](../smartico-popups/examples/README.md) |

## Прочитані Help Center джерела

В усіх рядках нижче — **прочитано 21.10.2026**. Зазначено тільки теми, перевірені для цього пакета; це не твердження про перевірку кожного речення або запуск кожної можливості.

| Джерело | Перевірені теми | Застосування / межа |
|---|---|---|
| [Документаційний index](https://help.smartico.ai/welcome/llms.txt) | Розташування modules та granular pages | Навігація; index не підтверджує правила модуля |
| [Front-end integration](https://help.smartico.ai/welcome/technical-guides/front-end-integration) | SDK setup, environment keys, identity/locale | Web integration; iframe/native contract окремо |
| [Extended integration](https://help.smartico.ai/welcome/technical-guides/front-end-integration/extended-integration) | Переходи до events, profile, callbacks, secure setup | Каталог integration capabilities |
| [Native clients guide](https://help.smartico.ai/welcome/technical-guides/front-end-integration/ios-android-clients-integration-guide) | Engagement bridge, dummy/product links, wrapper lifecycle | Реальна підтримка залежить від installed app service |
| [Multi-brands support](https://help.smartico.ai/welcome/products/tools-and-guides/multi-brands-support) | Label/brand structure, identity, content/bonus mapping | Не переносити keys та audience між продуктами |
| [User markers](https://help.smartico.ai/welcome/products/tools-and-guides/user-markers-tags) | User/external/JS markers, frontend visibility | UI projection не дорівнює protected entitlement |
| [Label tags](https://help.smartico.ai/welcome/products/tools-and-guides/label-tags) | Content substitution та відмінність від user state tags | Dynamic function приклади не копіюються без review |
| [Custom fields/attributes](https://help.smartico.ai/welcome/products/tools-and-guides/custom-fields-attributes) | Entity custom metadata та custom UI | Не автоматично profile property/eligibility rule |
| [User profile properties](https://help.smartico.ai/welcome/technical-guides/data-integration/user-profile-properties) | Каталог властивостей, internal/product ownership | Custom поля залежать від конкретної інтеграції |
| [Query Builder](https://help.smartico.ai/welcome/products/crm-automation/segmentation/query-builder) | Event/user-state/historical context та date operators | Exact operator/time boundary перевіряти в задачі |
| [Common Cases Segments](https://help.smartico.ai/welcome/products/crm-automation/segmentation/common-cases-segments) | Rebuild, live preview проти saved targeting list, locked cohort | Не atomic guard для конкурентної видачі |
| [Client action event](https://help.smartico.ai/welcome/products/tools-and-guides/client-action-event) | Named event, payload, REST route | Browser event не є trusted reward authorization |
| [Mission setup](https://help.smartico.ai/welcome/products/gamification-basics/missions/how-to-set-up-a-mission) | Типи tasks, opt-in, status transitions | Не трактувати Archive як reversible pause |
| [Recurring Missions](https://help.smartico.ai/welcome/products/gamification-basics/missions/recurring-missions) | Розклад, перший run, reset та повторний opt-in | Не автоматично rolling cooldown |
| [Recurring upon Completion](https://help.smartico.ai/welcome/products/gamification-basics/missions/recurring-upon-completion-missions) | Інший recurrence/opt-in/completion model | Не застосовувати calendar recurring rules навмання |
| [Automation Rules](https://help.smartico.ai/welcome/products/crm-automation/automation-rules) | Realtime/scheduled та прості actions | Не припускати historical replay після створення |
| [Campaigns](https://help.smartico.ai/welcome/products/crm-automation/create-journey-flow) | Entry settings, period/duration, per-user entries capability | Label flags та enabled limits звіряти |
| [Event Driven Journey](https://help.smartico.ai/welcome/products/crm-automation/event-driven-journey) | Entry modes, control groups, trigger/segment evaluation | Re-entry не дорівнює grant cap |
| [Activities of Flows](https://help.smartico.ai/welcome/products/crm-automation/activities-of-flows) | Activity taxonomy, active flow autosave, available channels | Read-only research не включає пробні зміни canvas |
| [Check User Profile](https://help.smartico.ai/welcome/products/crm-automation/activities-of-flows/activity-check-user-profile) | Current property check | Не є Wait for Event |
| [Wait for Event](https://help.smartico.ai/welcome/products/crm-automation/activities-of-flows/activity-wait-for-event) | Event wait та timeout | Перевіряти подію/filters/deadline |
| [Activity: Limit](https://help.smartico.ai/welcome/products/crm-automation/activities-of-flows/activity-limit) | Global throughput limit | Не per-player bonus cap |
| [Popups](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/pop-up) | Vibe/legacy status, frontend queue, server timeout distinction, display controls | Зміна default authoring не мігрує чинні templates |
| [Content Variations](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/content-variations) | Conditions, active/default fallback, variation editing | Preview контекст має відповідати recipient |
| [Deep-links](https://help.smartico.ai/welcome/products/tools-and-guides/deep-links) | Smartico navigation, named actions, product-specific links | Потрібен brand/platform route registry |
| [FAQ CRM Automation](https://help.smartico.ai/welcome/products/tools-and-guides/faqs/faq-crm-automation) | Dynamic link match, execution history, active flow change | Advice застосовувати до конкретного симптома |
| [Bonuses](https://help.smartico.ai/welcome/products/general-concepts/bonuses) | Platform-managed bonus details, UTC caps | Не переносити daily timezone місії на bonus caps |
| [Bonus API integration](https://help.smartico.ai/welcome/technical-guides/bonus-api-integration) | Grant lifecycle, claim vs automatic, issuance idempotency | Cross-entry business cap потрібний окремо |
| [Campaigns Dashboard](https://help.smartico.ai/welcome/products/bi-and-reporting/campaigns-dashboard) | Види звітів та різні participant/financial зрізи | Читати legend конкретної вкладки |
| [DWH CRM views](https://help.smartico.ai/welcome/technical-guides/smartico-data-warehouse/smartico-dwh-crm-views) | `j_communication`, `dm_engagement_fail_reason`, `j_bonuses`; повторно прочитано при incident review | Correlation attempts/status/issuances; доступ до документації не означає доступ до tenant DWH |
| [Attribution value](https://help.smartico.ai/welcome/products/general-concepts/attribution-value) | Touchpoint model та lifecycle/window | Attribution не доводить incrementality |
| [Bonus Cost](https://help.smartico.ai/welcome/products/bi-and-reporting/bonus-cost) | Configured cost, overrides, included fulfillment states | Cost 0 потребує перевірки конфігурації |
| [Vibe Widgets](https://help.smartico.ai/welcome/products/vibe-studio/widgets) | Vendor embed, existing SDK, logged-in use | Власний promo widget може мати інший guest contract |
| [MCP Server](https://help.smartico.ai/welcome/technical-guides/mcp-server) | Label-scoped entity/data tooling concept | У цьому дослідженні tenant connection не перевірено |
| [Segment & Objective Explorer](https://help.smartico.ai/welcome/products/tools-and-guides/segment-and-objective-explorer) | Маршрут від business goal до model/segment ideas | Planning aid не замінює затверджені audience rules |

## Джерела з обмеженою повторною перевіркою

| Джерело | Статус | Як використовувати |
|---|---|---|
| [Update property, Mark user and JS markers](https://help.smartico.ai/welcome/products/crm-automation/activities-of-flows/activity-update-property-mark-user-and-js-markers) | Live fetch 21.10.2026 неуспішний; збережений офіційний Markdown snapshot з попереднього project QA повторно прочитано | Історичне джерело `Then` persistence semantics; перед зміною live flow перевірити actual behavior/docs. Private snapshot не копіюється до публічного пакета |
| [Callbacks and pausing messages](https://help.smartico.ai/welcome/technical-guides/front-end-integration/extended-integration/callbacks-and-pausing-messages) | Є в official index; direct fetch неуспішний | Поточні твердження звірені через pinned SDK object/callback docs; цей URL — маршрут для наступного читання |
| [Communication caps](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/communication-caps) | Є в official index; direct fetch неуспішний | Конкретні caps/reasons брати з tenant snapshot; не приписувати неперевірені global defaults |

Недоступність інструменту не означає, що сторінку видалено або capability відсутня. Для unsupported твердження залишається Unknown до нового primary/tenant proof.

## Маршрути для майбутніх задач

Нижче **лише навігаційні посилання**, знайдені в офіційному index. Їхній детальний зміст у цій редакції не перевірявся; відкрий перед відповіддю на відповідну задачу.

| Майбутня задача | Первинні джерела |
|---|---|
| Нова mission model | [Missions](https://help.smartico.ai/welcome/products/gamification-basics/missions), [Locked](https://help.smartico.ai/welcome/products/gamification-basics/missions/locked-missions), [Featured manually](https://help.smartico.ai/welcome/products/gamification-basics/missions/featured-manually), [Dynamic missions](https://help.smartico.ai/welcome/products/gamification-basics/missions/dynamic-missions) |
| Історичні сегменти | [User state segments](https://help.smartico.ai/welcome/products/crm-automation/segmentation/user-state-segments), [Behavioral segments](https://help.smartico.ai/welcome/products/crm-automation/segmentation/behavioral-segments), [Imported segments](https://help.smartico.ai/welcome/products/crm-automation/segmentation/imported-segments) |
| Винагорода за формулою | [Dynamic Rewards](https://help.smartico.ai/welcome/products/general-concepts/dynamic-rewards) |
| Вбудована гра/visitor | [Mini-games](https://help.smartico.ai/welcome/products/mini-games), [Game setup](https://help.smartico.ai/welcome/products/mini-games/game-template-setup), [Mini-games on landing pages](https://help.smartico.ai/welcome/products/mini-games/mini-games-on-the-landing-pages), [Visitor mode](https://help.smartico.ai/welcome/technical-guides/front-end-integration/visitor-mode) |
| Інші gamification modules | [Tournaments](https://help.smartico.ai/welcome/products/gamification-basics/tournaments), [Raffles](https://help.smartico.ai/welcome/products/gamification-basics/raffles), [Jackpots](https://help.smartico.ai/welcome/products/gamification-basics/jackpots), [Store](https://help.smartico.ai/welcome/products/gamification-basics/marketplace) |
| Новий vendor authoring | [Vibe Studio](https://help.smartico.ai/welcome/products/vibe-studio), [Vibe Landing pages](https://help.smartico.ai/welcome/products/vibe-studio/landing-pages), [Vibe Promotions](https://help.smartico.ai/welcome/products/vibe-studio/promotions), [Vibe analytics](https://help.smartico.ai/welcome/products/vibe-studio/pages-and-widgets-analytics) |
| Новий communication channel | [Communication channels](https://help.smartico.ai/welcome/products/crm-automation/communication-channels), [Inbox](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/inbox), [Push](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/how-to-create-a-push-resource), [Forms](https://help.smartico.ai/welcome/products/crm-automation/forms) |
| Native SDK/demo | [React Native demo](https://github.com/smarticoai/react-native-demo), [official bridge runtime](https://libs.smartico.ai/smartico_native_bridge.js) — availability у вашому App перевіряється окремо |
| Доступ та identity | [Secure identification](https://help.smartico.ai/welcome/technical-guides/front-end-integration/extended-integration/secure-identification-and-special-setups), [BO permissions](https://help.smartico.ai/welcome/products/tools-and-guides/back-office-permissions-home-label-and-sso) |
| Структурований Smartico research | [MCP connection](https://help.smartico.ai/welcome/technical-guides/mcp-server/mcp-connection-and-security), [entity types](https://help.smartico.ai/welcome/technical-guides/mcp-server/mcp-tools-and-entity-types), [user operations](https://help.smartico.ai/welcome/technical-guides/mcp-server/mcp-operations-on-the-users), [data analysis](https://help.smartico.ai/welcome/technical-guides/mcp-server/mcp-for-data-analysis) |
| Складні звіти | [Data Studio FAQ](https://help.smartico.ai/welcome/products/tools-and-guides/faqs/faq-data-studio-and-reports), [DWH](https://help.smartico.ai/welcome/technical-guides/smartico-data-warehouse), [Missions Dashboard](https://help.smartico.ai/welcome/products/bi-and-reporting/missions-dashboard) |

## Як підтримувати каталог

Для нового висновку додай exact URL/revision, дату, прочитану тему, evidence status, scope та місце використання. Vendor docs, historic project observation і локальний mock мають різну силу доказу. Після виправлення багу збережи regression та межу підтриманих платформ. Якщо docs суперечать tenant/runtime, зафіксуй обидва джерела, відтворення й рішення відповідального owner; не обирай мовчки зручнішу версію.
