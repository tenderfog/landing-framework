# Аналітика: collection contract та перевірка доставки

Це основний guide для клієнтської аналітики landing/widget/popup. Значення конкретної акції заповнюються у [плані аналітики](../templates/analytics-plan.md). Інтерпретація Live/Analytics/DWH Smartico — в [окремій KB](../smartico-knowledge/05-investigation-and-analytics.md); тут її не дублюємо.

## 1. Вибрати один спосіб збору

У досліджених інтеграціях фінальним контрактом стали **HTML `data-gtm-id` hooks та analyst-owned collector**. Ранній programmatic proposal не є другим обов'язковим producer. Для іншого продукту mode підтверджує його [product profile](../templates/product-profile.md).

| Mode | Що реалізує UI | Що підтверджує analytics/host owner |
|---|---|---|
| DOM hooks / GTM | Погоджені IDs на semantic controls і segments | Collector у потрібному document, click/visibility rules, consent, mapping, dedupe |
| Programmatic events | Один підтриманий sender з дозволеним payload | Receiver, channel/schema/version, destination delivery |
| Native collector | Погоджений host adapter або наявний native collector | Installed handler, SDK names/types, platform dimensions |

Один факт не збирається двома producers. Атрибут `data-gtm-id` сам нічого не відправляє; встановлений GTM не починає автоматично читати довільні hooks. Cross-origin parent не читає DOM landing/popup iframe. Для кожного document/surface потрібний власний supported collection contract.

У DOM-only mode не додавати власні `send`/`dataLayer` calls, auth/state/timing attributes або параметри з програмного прикладу. Якщо ці дані вже є в host collector, використовувати його schema. Analytics failure не блокує navigation/participation і не запускає додатковий opt-in або grant.

## 2. Визначити факти та owners

Базова воронка: фактична видимість → logical click → accepted action → server outcome. Залишити лише кроки, що відповідають бізнес-питанню.

| Факт | Джерело істини / owner | Межа трактування |
|---|---|---|
| Product page/screen view | Host, один owner | Не дублювати на loaded/hydration/remount |
| Видима секція/widget/CTA | Обраний host або child visibility collector | Render прихованого елемента не є impression |
| CTA click | Approved DOM collector або sender | Один logical click; це не arrival/реєстрація/депозит |
| Відкриття продуктового екрана | Host arrival marker | Сам event_action доводить лише намір |
| Opt-in accepted/rejected | Підтверджений mission/backend adapter | Timeout і already-opted-in не доводять новий accepted entry |
| Popup engagement reporting | Штатний Smartico transport | SDK Impression окремо не доводить видимий контент; не дублювати вручну |
| Фактична видача винагороди | Bonus/backend confirmation | Click, popup і grant node не замінюють authoritative result |

Для кожної метрики: numerator, denominator, одиниця, attribution window і source. Наприклад, CTR доступної участі й CTR тизера для всіх відвідувачів — різні метрики. Pending/error не зараховувати як success. Кожна секунда countdown, shader frame чи повторний profile read не потребує окремої події.

`event_action`, named Client Action і tracking мають різні контракти — [navigation](03-event-actions.md), [Smartico](05-smartico-missions-journeys.md). У canonical bridge немає `analytics_event`; transport не додається локальним викликом або довільним JSON у navigation route. Зміна schema потребує версіонованої реалізації на обох сторонах [bridge](02-iframe-and-contracts.md).

## 3. DOM hooks: сталість і видимість

- Узгодити exact IDs, placement і semantic trigger, включно з keyboard activation. Disabled/hidden control не є participation.
- Перевірити final DOM після async render. Collector обробляє нові segment nodes і повторне монтування без дубля impression.
- Не прибирати marker синхронно до delegated collector прийнятого click. Перевірити actual event order, не копіювати timer/latch із чужого template.
- Section show залежить від actual embed geometry. `window.scrollY` child не вимірює parent scroll; IntersectionObserver тестується у справжньому host. Якщо потрібен viewport contract, його підтверджує host.
- Для прихованих/native-covered views перевірити supported foreground/visibility signal. Browser visibility може не описувати native overlay.
- Final section, hash jump, Back/restore або QA preview не доводять послідовне проходження. Dwell/checkpoint requirements задаються явно; entitlement лишається серверним.
- Для widget фіксувати placement, mount lifetime і repeat-impression policy за [surface workflow](19-surfaces-and-workflows.md).

## 4. Naming і destination mapping

Використовувати чинну taxonomy продукту. Історична конвенція `ga_{module/modal}_{action}_{element/result}` може задавати IDs або product events; це не автоматичне ім'я для кожного SDK. Module key — стабільний Latin snake_case, без user IDs, timestamp чи locale.

| Приклад vocabulary | Тригер |
|---|---|
| `ga_{screen}_popup_show` / `modal_show` | Погоджений фактичний show, не click/handshake |
| `ga_{screen}_click_btn_{name}` / `click_btn_close` | Logical activation конкретного control |
| `ga_{screen}_{action}_error` / `_successful` | Категоризований authoritative action result |

Це examples, не затверджений словник кампанії. Для whole-screen show, inputs/validation, video та FAQ задати exact names тільки якщо вони потрібні; незавершені патерни не перетворювати на emitted names здогадкою. Не слати стару й нову taxonomy паралельно.

Для GA4 event name перевірити limit 40 символів; скорочення — explicit mapping, не runtime truncation. [Collection limits](https://support.google.com/analytics/answer/9267744).

Firebase Swift/Android резервують `ga_`, `google_`, `firebase_`. Product event або DOM ID не forward напряму в `logEvent`: потрібний approved `product → destination` mapping з валідними SDK names/types. HTML ID не перейменовується мовчки через restriction destination. Native parameters перетворюються в підтримані String/Int/Double або Bundle types; довільний JSON object не є SDK schema. [Swift](https://firebase.google.com/docs/reference/swift/firebaseanalytics/api/reference/Classes/Analytics), [Android](https://firebase.google.com/docs/reference/android/com/google/firebase/analytics/FirebaseAnalytics).

## 5. Platform dimensions і приватність

Один логічний факт має однакову семантику на Web/iOS/Android; не створювати suffix names `_web/_ios/_android` лише заради звітного зрізу. Використовувати наявні dimensions collector або погоджений mapping:

| Dimension | Приклад allow-list | Trusted source |
|---|---|---|
| host platform | web / ios / android / unknown | Host/native integration |
| surface | web_iframe / web_full_page / ios_webview / android_webview | Rendering container, не viewport width |
| placement | hero / participation / approved widget slot | Погоджене місце показу всередині surface |
| device category | desktop / mobile / tablet / unknown | Product/analytics classification |

Назви/значення — пропозиція schema до підтвердження, не нові bridge fields чи обов'язкові DOM attributes. Mobile Safari не є App. Web stream усередині WebView не завжди автоматично відрізняється від mobile Web. Перевірити actual report dimensions і custom registration, не запускати Web і native producers для того самого факту.

Consent належить продукту; unknown не означає granted. Не додавати другий consent banner або analytics SDK у child. Заборонені token/JWT, account ID, email/phone, raw profile/socket/stack і secret URL/query. Для помилок — sanitized category code. `campaign_key`, revision, locale, CTA/state тощо передаються лише за approved allow-list; public mission ID краще мапити на stable key. [GA4 schema](https://developers.google.com/analytics/devguides/collection/ga4/reference/events), [security](17-security.md).

Для programmatic retry, якщо він узагалі потрібний: мала in-memory queue з explicit max/TTL/backoff/overflow, той самий opaque event_id, receiver dedupe й очищення на account switch/dispose. Без ACK не обіцяти guaranteed delivery. Consent-off events не накопичувати без окремого contract; navigation не чекає безмежно flush. У DOM mode цю policy реалізує collector, а не кожний UI control.

## 6. Приймання

1. Заповнені mode, source/version, owners, exact inventory, consent і denominators у [плані](../templates/analytics-plan.md).
2. Для кожного surface доведений collector/channel; local console sink — лише development evidence.
3. Перевірені accepted click/keyboard, dynamic nodes, actual visibility, remount, hidden/foreground, navigation і lifecycle без duplicate producers.
4. У receiver/DebugView звірені destination names/types, Web/App dimensions, consent on/off/unknown і відсутність PII.
5. Confirmed action/grant походить від правильного owner. Smartico report semantics перевірені за [reporting KB](../smartico-knowledge/05-investigation-and-analytics.md), а не з клієнтського click.
6. Нереалізований канал має NOT_TESTED/unsupported із next action. Наявність документа, hook або SDK script не є фактом доставки.

Архівна основа vocabulary/bridge limitations: [pinned upstream](../SOURCES.md). Актуальний contract конкретного продукту має пріоритет над історичним proposal.
