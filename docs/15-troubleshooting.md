# Діагностика: індекс симптомів

Це короткий маршрут до відповідального розділу. Повний порядок пошуку першого розриву — [investigation workflow](20-product-profiles-and-investigation.md), запис фактів — [investigation record](../templates/investigation-record.md). Механізми реальних багів, зміни й proof limits зберігаються в [каталозі інцидентів](22-incidents-and-popup-cleanup.md).

Перед вибором fix підтвердити active source/served revision, surface/ENV, точний час, expected/actual і тестову роль. Спостереження збирати у відповідному frame/native layer без token, raw profile чи credentials. Схожий симптом не доводить однакову причину; наведені маршрути — наступна перевірка, а не готовий патч.

## Publication, iframe та layout

| Симптом | Перший доказ | Канонічний маршрут |
|---|---|---|
| Direct landing працює, promotion показує skeleton | Actual iframe src, redirect chain і збереження query | [Release/URL](14-release-and-cache.md), [iframe contract](02-iframe-and-contracts.md) |
| Після deploy старий UI або новий JS зі старим HTML | Served HTML/asset hashes, cache headers, actual DOM | [Publication/cache](14-release-and-cache.md) |
| Reload лишає footer або сторінка стрибає | Parent/child scroll і iframe/root bounds у фазах load | [Scroll incidents](22-incidents-and-popup-cleanup.md), [height owner](02-iframe-and-contracts.md) |
| FAQ collapse лишає порожнє місце | Content-root height, sent height і parent height після transition | [Iframe grow/shrink](02-iframe-and-contracts.md), [responsive UI](09-responsive-ui.md) |
| Controls не рухаються з видимим viewport або лишаються над FAQ | Actual scroll/positioning owner, host header та scene bounds | [Scene pattern](21-promo-patterns.md), [scroll incidents](22-incidents-and-popup-cleanup.md) |
| Game carousel/decor обрізані центральним контейнером | Overflow ancestors і окремі content/decor layers | [Responsive layout](09-responsive-ui.md) |
| Compact widget має зайву висоту або неправильний фон | Container width, initial/numeric height, clipping і iframe canvas | [Widget workflow](19-surfaces-and-workflows.md) |

## Identity, eligibility та цикл

| Симптом | Перший доказ | Канонічний маршрут |
|---|---|---|
| Active CTA спалахує до API read; timeout виглядає як guest | Initial HTML, readiness/identify outcome, normalized state | [State](04-state-and-time.md), [SDK lifecycle](../smartico-knowledge/01-model-and-integration.md) |
| Неверифікований проходить або manual-verified не допускається | Approved product rule проти UI і CRM predicates | [Eligibility mapping incident](22-incidents-and-popup-cleanup.md), [state contract](04-state-and-time.md) |
| Prompt витрачає спробу до виконання передумови | Exact irreversible operation і порядок prerequisite/opt-in | [Prerequisite pattern](21-promo-patterns.md) |
| Approved deposit є, CTA ще «поповнити» | Event/rule/marker/props/UI timestamps у правильній identity/ENV | [Projection investigation](../smartico-knowledge/05-investigation-and-analytics.md) |
| Logout/account switch повертає чужий старий state | Identity epoch і порядок late responses | [Auth races](04-state-and-time.md) |
| Same-user refresh/error скидає scene progress або перший клік | DOM target/scene geometry під час pointerdown→pointerup | [Focus/progress incidents](22-incidents-and-popup-cleanup.md) |
| Два countdown різні, reset дає ще 23h або змістився після DST | Shared deadline, consumed cycle, server schedule/timezone/cache | [Calendar/state](04-state-and-time.md), [mission KB](../smartico-knowledge/02-missions-and-state.md) |
| Marker прибрано, нової спроби немає | Mission completion/cycle, open Journey і bonus ledger окремо | [Reset boundaries](21-promo-patterns.md) |

## Popup, Journey, grant та routing

| Симптом | Перший доказ | Канонічний маршрут |
|---|---|---|
| Click є, Journey не входить | Exact action/mission filter, audience, dates та open instance | [Journey setup](05b-smartico-journey-runbook.md), [Client Action](05c-smartico-client-actions.md) |
| Journey увійшов, popup запізнюється/Failed | Attempt reason, global timing, CAPs, suspension, queue/retention | [Delivery KB](../smartico-knowledge/04-popups-and-routing.md) |
| Після каси приходить серія popup | Кількість sent requests/entries і lifecycle pending до resume | [Queue/re-entry incident](22-incidents-and-popup-cleanup.md) |
| Підкладка є, root порожній або SyntaxError | Exact delivered Body/params, wrapper/compiler і failing stage | [Compiler incidents](22-incidents-and-popup-cleanup.md), [legacy runtime](06-smartico-popup-templates.md) |
| Handshake/Impression є, контент невидимий | Nonempty root, styles/assets, actual geometry/visibility | [Render evidence](22-incidents-and-popup-cleanup.md), [native contract](07-native-webview.md) |
| Popup fullscreen у CSS, але маленький/обрізаний | Outer frame → wrapper → content bounds | [Popup runtime/layout](06-smartico-popup-templates.md), [native presentation](07-native-webview.md) |
| Кнопка працює лише в центрі або перший tap блокує retry | Hit target, vendor delegation, duplicate/capture handlers | [Interaction/guard incidents](22-incidents-and-popup-cleanup.md) |
| Нова Body показує старий URL/copy/action | Configuration defaults, saved creative overrides і відкрита стара доставка | [Cleanup/reconfiguration](22-incidents-and-popup-cleanup.md) |
| Claim є, бонусу немає або можливий дубль | Issuance/transaction history, status і separate entry IDs | [Grant investigation](../smartico-knowledge/05-investigation-and-analytics.md), [reward contract](../smartico-knowledge/03-journeys-and-rewards.md) |
| Popup закрито, parent scroll заблокований | Chosen sender та owner acquire/release lock | [Scroll-lock incident](22-incidents-and-popup-cleanup.md), [action-only sender](05c-smartico-client-actions.md) |
| Web route працює, App відкриває браузер/не той екран | Exact rendered deep link, dispatcher і popup/Journey sources | [Native routing](07-native-webview.md), [product actions](03-event-actions.md) |
| Гра/категорія/auth/PDF відкривається не так | Exact supported route/term/parameters, actual destination | [Action registry](03-event-actions.md) |

## Media та measurement

| Симптом | Перший доказ | Канонічний маршрут |
|---|---|---|
| Відео playing, poster зверху; або чорний кадр без poster | Current playback state, events, cached/blocked path | [Video/poster](10-media-animation-webgl.md) |
| Smoke має прямокутний фон, лише fallback або гріє GPU | Actual context/draw, compositing, buffer pixels і hidden work | [WebGL/fallback/budgets](10-media-animation-webgl.md) |
| Disabled button пульсує, carousel не зупиняється, FAQ обрізається | Actual state selectors, lifecycle/animation owner і settled geometry | [Responsive UI](09-responsive-ui.md) |
| DOM hook є, подій немає або подвійний send | Обраний collection mode, document/collector, receiver і order | [Analytics contract](12-analytics.md) |
| Failed/entries/grant counts не сходяться | Одиниця виміру, attempt IDs, dates, pending/retries та version | [Reporting interpretation](../smartico-knowledge/05-investigation-and-analytics.md) |

Після fix перевірити симптом і affected integration regressions на exact release variant; зберегти рівень доказу за [QA](13-qa.md) і serving/CRM revision за [release](14-release-and-cache.md). Новий висновок додати в одне канонічне місце за [maintenance](18-maintenance.md), не копіювати його в усі пов'язані документи.
