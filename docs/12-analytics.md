# Аналітика промо-лендінгу

**Статус цього розділу:** контракт і рекомендована модель для майбутнього впровадження. Наявність документа, локального `track()` або тестового логу не означає, що аналітика вже реалізована чи доставляється у продуктову систему.

Аналітика відповідає на бізнес-питання, а не повторює кожну анімацію. До реалізації погодьте події, власників, канал, consent, знаменники метрик і спосіб перевірки. Використовуйте [шаблон плану](../templates/analytics-plan.md).

## 1. Що вимірюємо

Базова воронка:

```text
показ лендингу
  → показ механіки / CTA
  → клік
  → дозволена активація місії або перехід
  → результат Journey / продукту
```

Клік на «Зареєструватись» не є реєстрацією. Клік на «Верифікуватись» не є завершеною верифікацією. Opt-in, impression модалки, закриття модалки та фактичне нарахування бонусу — різні факти. Лендінг не повинен оголошувати останній факт, якщо його не підтверджує погоджений серверний контракт.

| Питання | Метрика | Власник істини |
| --- | --- | --- |
| Чи користувач побачив пропозицію? | Показ лендингу / змістовної секції | Погоджений клієнтський вимірювач видимості |
| Яка CTA ефективніша? | CTR за `cta_id` і розташуванням | Лендінг + аналітичний контейнер host |
| Скільки людей почали участь? | Підтверджені opt-in / доступні учасники | Smartico / backend, не лише click |
| Чи відкрився потрібний екран? | Arrival marker після event action | Host Web / App |
| Чи видано винагороду? | Підтверджена серверна видача | Journey / bonus backend |
| Чи заважає техніка? | Частка інтеграційних/медіапомилок, затримки | Sanitized telemetry з визначеним owner |

Для кожної метрики запишіть numerator, denominator, attribution window і джерело даних. Наприклад, CTR активної участі слід рахувати серед користувачів із доступною спробою, а не змішувати з гостями та користувачами в cooldown.

## 2. Навігація та tracking — окремі контракти

`event_action` — продуктова дія, яка відкриває екран або модалку. Вона не стає аналітичною подією лише через назву «event». Smartico Client Action також має окрему бізнес-семантику. Деталі — у [маршрутах](03-event-actions.md) та [Smartico](05-smartico-missions-journeys.md).

```text
CTA click
 ├─ navigation adapter → event_action/verif → екран верифікації
 └─ analytics adapter → ga_promo_demo_click_btn_verification → погоджений measurement channel
```

Відмова tracking не блокує дію користувача. Analytics не запускає додатковий opt-in, Journey чи нарахування.

Не використовуйте `event_action` як універсальний контейнер довільного JSON для аналітики. Канонічний iframe bridge не розширюється локально: `analytics_event` дозволений лише після реалізації та версіонування такого типу **на обох сторонах** host-контракту. Див. [iframe contract](02-iframe-and-contracts.md).

У старому `landing_doc/GA-ANALYTICS-SPEC.md` є sketch із `sendMessage('analytics_event', ...)`. Це приклад для погодження каналу, а не готовий production-виклик. Новіший рамковий документ і iframe runbook вимагають залишати forwarding вимкненим до погодження host. Не переносіть цей sketch у код без перевірки чинного контракту.

## 3. Один власник для кожного факту

| Факт | Default owner | Правило |
| --- | --- | --- |
| `page_view` / native screen view продукту | Host | Лендінг не запускає другу копію |
| Показ лендингу | Лендінг або host, один обраний owner | Не дублювати на `loaded`, hydration і повторному init |
| Клік CTA | Лендінг | Один logical click, один `cta_id` |
| Відкриття registration/game/bonus screen | Host | Arrival підтверджує відкриття, click — лише намір |
| Mission opt-in result | Погоджений Smartico/backend adapter | Клієнтські коди не називаються винагородою |
| Popup impression/click Smartico | Smartico штатний transport | Не дублювати його вручну |
| Видача бонусу | Bonus/Journey backend | UI не вигадує фінансового результату |

Якщо taxonomy продукту вже існує, використовуйте її. Користувач надав конвенцію продуктового аналітика `ga_*`; саме вона є пріоритетною для emitted events у цьому пакеті. Не надсилайте одночасно старі `landing_view`/`promo_landing_view` та новий GA event «про всяк випадок». Внутрішні business intents на кшталт `cta_click` можуть лишатися у коді adapter, але mapping має віддавати **одне** погоджене ім'я.

## 4. Конвенція аналітика та словник кампанії

Загальна надана схема: `ga_{module/modal}_{action}_{element/result}`. Імена module/screen/campaign slug — стабільні, латиницею в `snake_case`; display title, locale, account ID чи timestamp не підставляються в ім'я події.

### Надані патерни

| Тип | Патерн аналітика | Приклад |
| --- | --- | --- |
| Показ popup | `ga_{screen}_popup_show` | `ga_deposit_popup_show` |
| Показ modal | `ga_{screen}_modal_show` | `ga_oneclick_modal_show` |
| Клік кнопки | `ga_{screen}_click_btn_{name}` | `ga_promo_demo_click_btn_attempt_left` |
| Закриття | `ga_{screen}_click_btn_close` | `ga_promo_reward_click_btn_close` |
| Взаємодія з input | `ga_{screen}_click_input_email` | `ga_registration_click_input_email` |
| Помилка action | `ga_{screen}_{action}_error` | `ga_promo_demo_activation_error` |
| Успіх action | `ga_{screen}_{action}_successful` | `ga_promo_demo_activation_successful` |
| Validation status | `ga_{screen}_{field}_status_` | Це **незавершений патерн** із trailing underscore |

Останній validation pattern збережений точно як надано. Перед реалізацією потрібно уточнити в аналітика, чи статус дописується suffix, чи передається параметром, і який allow-list значень. **Не** виправляти underscore мовчки, не дописувати `_valid/_invalid` від себе й не вважати incomplete pattern фінальним event name.

### Приклад mapping для універсальної демо-акції

Ці campaign-specific names є **прикладами за конвенцією**, а не вже затвердженим словником нової кампанії чи фактом delivery у GA4/Firebase.

| Emitted event / candidate | Точний тригер | Params | Власник / частота |
| --- | --- | --- | --- |
| `ga_promo_demo_click_btn_attempt_left` | Реальний click/keyboard activation лівої choice | `cta_id`, `location`, `ui_state` | Лендінг; один logical click |
| `ga_promo_demo_click_btn_attempt_right` | Реальний click правої choice | Ті самі | Лендінг; один logical click |
| `ga_promo_reward_modal_show` | Reward modal фактично відрендерилась і показана | `modal_state`, `creative_version` | Один обраний popup owner, не лише landing click |
| `ga_promo_reward_click_btn_claim` | Click claim control | `modal_state`, `cta_id` | Popup owner; це намір, не видача |
| `ga_promo_reward_click_btn_close` | Click close control | `modal_state`, `cta_id` | Popup owner; не дублювати claim click навіть якщо бізнес-результат однаковий |
| `ga_promo_demo_activation_successful` | Поточний request має authoritative accepted opt-in acknowledgement | `mission_key`, safe `result_code` | Погоджений mission adapter; один request |
| `ga_promo_demo_activation_error` | Поточна activation відхилена/завершилась категоризованою помилкою | `mission_key`, safe `error_code` | Погоджений mission adapter; не кожний retry tick |
| `ga_promo_reward_grant_successful` | Backend підтвердив фактичну одноразову видачу | `reward_key`, safe result | **Серверний owner**, не лендінг і не popup impression |

Для landing/section/CTA impression, video, FAQ та integration errors зробіть власну таблицю exact names за конвенцією й погодьте її з аналітиком. Показ whole screen не називайте `modal_show`; якщо pattern для нього не наданий, уточніть його замість вигаданої normalization.

Timeout/невідомий результат не є `activation_successful`. Відповідь «already opted in» також не доводить нову успішну активацію: її mapping погоджується окремо. `modal_show` означає фактично показаний контент, а не лише READY/handshake або натиснуту activation button.

Зберігайте стабільний module key між версіями; параметри `campaign_id`, `landing_version`, `modal_state` дозволяють порівнювати релізи без імен із номерами mission/user. Один modal module може мати кілька state values; не надсилайте другу копію show через landing adapter, якщо popup owner уже її надсилає.

Для GA4 довжина event name — не більше **40 символів**. Перевіряйте згенерований словник до release; довгий module slug скорочуйте лише за погодженим mapping, не silent truncate і не автоматичним rename у runtime. Джерело: [Google Analytics collection limits](https://support.google.com/analytics/answer/9267744).

### Product event name і destination SDK name

Надану схему `ga_*` зберігаємо як продуктовий словник/adapter event. Це не гарантує, що таке ім'я можна напряму передати кожному SDK. **Firebase Analytics Swift та Android резервують префікси `ga_`, `google_`, `firebase_` для event names.** Потрібен окремий погоджений mapping `product_event → destination_event` на боці measurement adapter/GTM/native integration. Приклад пропозиції: `ga_promo_reward_modal_show → promo_reward_modal_show`; це не автоматичне перейменування і не вже затверджений словник. Product name лишається стабільним, до SDK іде рівно одна валідна назва. Для Web GA4/GTM та інших destinations перевірити власні обмеження й фактичний container mapping, не узагальнювати App обмеження навмання.

Джерела: [Swift Analytics.logEvent](https://firebase.google.com/docs/reference/swift/firebaseanalytics/api/reference/Classes/Analytics), [Android FirebaseAnalytics.logEvent](https://firebase.google.com/docs/reference/android/com/google/firebase/analytics/FirebaseAnalytics). Native parameter types також відрізняються: Bool/JSON envelope з прикладу adapter потрібно перетворити в погоджені String/Int/Double або Android Bundle types. Не передавати весь event object у SDK як довільний JSON.

Необов'язкові події додавайте лише за аналітичним питанням. Не створюйте `ga_smoke_*`, frame/tick spam: рендер шейдера, кожна секунда countdown, кадр персонажа, lazy-load кожної копії каруселі та кожна повторна profile response не є корисною базовою аналітикою.

### Одна подія, окремі зрізи Web і App

Побажання користувача: однакова логічна подія на всіх платформах із розділенням у звітах. **Не створювати** окремі names `_web`, `_ios`, `_android` або `_mobile` для того самого факту. Назва й trigger semantics лишаються однаковими; platform/device визначаються параметрами.

| Параметр | Узгоджуваний allow-list | Джерело |
|---|---|---|
| `host_platform` | `web`, `ios`, `android`, `unknown` | Trusted host/native integration context; не лише user agent |
| `surface` | `web_iframe`, `web_full_page`, `ios_webview`, `android_webview`, `standalone`, `unknown` | Підтверджений integration mode/platform |
| `device_category` | `desktop`, `mobile`, `tablet`, `unknown` | Погоджена product/analytics classification; не ширина iframe і не просто touch |

Приклад одного продуктового event:

| Event | host_platform | surface | device_category |
|---|---|---|---|
| `ga_promo_demo_click_btn_attempt_left` | `web` | `web_iframe` | `desktop` |
| `ga_promo_demo_click_btn_attempt_left` | `web` | `web_iframe` | `mobile` |
| `ga_promo_demo_click_btn_attempt_left` | `ios` | `ios_webview` | `mobile` |
| `ga_promo_demo_click_btn_attempt_left` | `android` | `android_webview` | `mobile` |

Це контракт параметрів для погодження реалізації, не нові поля чинного iframe bridge. За відсутності trusted platform data використовувати `unknown`, не називати mobile Safari App і не визначати platform за розміром CSS viewport. Звичайний Web iframe може працювати і на desktop, і на mobile, і на tablet. Analytics provider може вже мати автоматичні platform/device dimensions; owner фіксує, які є native dimensions, а які custom, щоб вони не конфліктували.

Якщо Web SDK використаний усередині App WebView, автоматична platform measurement-системи може описувати саме web stream. Для відділення реального App container потрібен `host_platform/surface` або вже погоджений еквівалент. Для Firebase native streams platform може визначатися штатно, але named source event та destination mapping лишаються узгодженими. Не запускати Web і native analytics одночасно для того самого факту.

У handoff зазначити: назву кожної report dimension, source, custom definition/registration за потреби, mapping і приклади реальних payload для Web desktop, Web mobile, iOS та Android. Звіт фільтрує один event за platform/surface/device; conversions і funnel не роздвоюються різними event names. Destination names також бажано уніфікувати через погоджений mapping, коли команда хоче спільні звіти між streams.

## 5. Параметри та приватність

Рекомендований allow-list:

```json
{
  "event": "ga_promo_demo_click_btn_attempt_left",
  "event_id": "opaque-random-event-id",
  "view_id": "opaque-in-memory-view-id",
  "campaign_id": "sample_campaign",
  "landing_version": "1.0.0",
  "surface": "ios_webview",
  "host_platform": "ios",
  "device_category": "mobile",
  "locale": "uk",
  "theme": "dark",
  "has_auth": true,
  "ui_state": "available",
  "cta_id": "attempt_left",
  "location": "participation",
  "action_kind": "mission_opt_in"
}
```

`event_id` / `view_id` у цьому прикладі — випадкові технічні ідентифікатори, не account ID і не fingerprint. Зберігайте лише на погоджену тривалість перегляду в пам'яті. Подія з таким `event_id` не означає автоматичну дедуплікацію в кожній analytics-системі: receiver має реалізувати погоджене правило.

Не передавати token, JWT, user ID, email, телефон, персональні profile поля, KYC-документи, raw socket event, повний URL із query або exception, у якому вони можуть бути. Використовуйте категоризований `error_code` і stable action ID замість raw stack/payload. Smartico public mission ID не є user ID, але для аналітики зручніший стабільний `mission_key`, який не змінюється між QA та Prod.

Consent належить продукту. Стан `unknown` не означає `granted`. Не створюйте свій банер consent у кожному лендінгу і не запускайте другий analytics SDK в iframe/WebView без погодження. У правилах параметрів дотримуйтеся чинної [специфікації GA4](https://developers.google.com/analytics/devguides/collection/ga4/reference/events), якщо саме GA4 є погодженим destination.

## 6. Адаптер за можливостями середовища

| Середовище | Можливий канал | Потрібне підтвердження |
| --- | --- | --- |
| Same-origin full-page | Host `dataLayer` / analytics function | Реальний owner і consent контейнера |
| Cross-origin iframe | Версіонований host adapter | Підтримка host, origin rules, schema, ACK/retry policy |
| Swift WKWebView | App measurement adapter | Реальна назва message handler та дозволена schema |
| React Native / Android WebView | App measurement adapter | Реальна схема native WebView message і lifecycle |
| Standalone preview | Вимкнено або локальний тестовий sink | Чітке відокремлення від продуктових даних |

Не читати `window.parent.dataLayer` або private store cross-origin host. Не вигадувати назви Swift handlers, RN `postMessage` schema чи capability response. За відсутності підтриманого каналу tracking має бути `unavailable`, а продуктова дія — працювати.

Приклад межі адаптера, **не реалізація нового bridge**:

```ts
type ApprovedAnalyticsAdapter = {
  isSupported(): boolean;
  hasConsent(): boolean;
  send(event: SafePromoEvent): void;
};

function track(event: SafePromoEvent, adapter: ApprovedAnalyticsAdapter | null) {
  if (!adapter?.isSupported() || !adapter.hasConsent()) return;
  try { adapter.send(event); }
  catch { /* tracking failure must not block navigation or opt-in */ }
}
```

Сам адаптер постачається погодженою інтеграцією. Компоненти не вгадують, який глобальний SDK знайдеться, і не надсилають у два канали одночасно.

## 7. Черга, дедуплікація та lifecycle

За замовчуванням не накопичуйте події до невідомого/відсутнього consent. Якщо узгоджений transport потребує retry, визначте малу in-memory queue із TTL, лімітом, backoff і політикою overflow. Наприклад, `max=50`, `TTL=60s` — лише стартова пропозиція для погодження; це не універсальні продуктові значення.

- Queue містить лише allow-listed дані і не переживає logout/зміну account/закриття screen.
- Retry повторює той самий `event_id`, а не створює нову подію.
- Receiver підтверджує delivery або має чітку at-most-once/best-effort policy. Без ACK не заявляти гарантовану доставку.
- Періодичні mission/profile refresh не повторюють impression та не вигадують нові conversion events.
- Hidden/background view не створює section impressions.
- Navigation не чекає безмежно analytics ACK. Правило flush before navigation має мати короткий погоджений budget.

## 8. Видимість у iframe та WebView

`scroll_depth` усередині iframe не можна рахувати з `window.scrollY`, коли скролить parent. Geometry секції всередині великого child document сама по собі не доводить, що її видно користувачу. Перевірте IntersectionObserver у фактичному embed з ancestor clipping; якщо цього недостатньо для погодженої метрики, потрібен host-owned вимірювач або approved viewport contract.

Перехід End, hash, Back/restore чи програмне прокручування до нижнього блока може одразу показати final section. Final visibility не є доказом послідовного прочитання. Якщо механіка потребує checkpoint order/dwell, вимоги задаються окремо, а право на винагороду залишається серверним.

У WebView screen може бути прикритий нативним екраном без очікуваної browser visibility події. App adapter має підтверджувати foreground/visible state, якщо це необхідно для вимірювання. Див. [native WebView](07-native-webview.md).

## 9. QA і handoff

До ввімкнення production tracking передайте аналітикам заповнений план: exact `ga_*` names, параметри, triggers, owners, consent, channel/version, дедуплікацію та payload кожної події. Звірте `cta_id` з конфігом дій автоматично або diff-review. Validation suffix/payload і whole-screen show pattern мають бути уточнені, якщо вони потрібні scope кампанії.

Для кожного destination також потрібні exact SDK names/types і mapping із product convention; у native DebugView перевірити, що `ga_*` не передається напряму в Firebase reserved prefix і подія не відкинута.

Зіставити один і той самий event між Web desktop/mobile та App iOS/Android: names/triggers однакові, trusted platform/surface/device params правильні, report dimensions реально доступні. Mobile Web не потрапляє в App segment, невідома capability не вгадується.

Перевірте delivery у реальному host, а не лише `console.log`: approved DebugView/network/native inspector. Потрібні consent-on/off/unknown, double-click, foreground, navigation, retries і logout. Перевірте відсутність дубля `page_view`, зайвих Smartico impressions і персональних даних.

Для роботи, де аналітика ще не ввімкнена, QA result має прямо казати **«канал не реалізований, telemetry не перевірена»**. Локальний тестовий sink — observability для розробки, не доказ продуктивної аналітики.

## Джерела та споріднені документи

- База методології: [landing_doc](https://github.com/onlineTeran/landing_doc/), зокрема `GA-ANALYTICS-SPEC.md`, `framework/ANALYTICS.md` і `IFRAME-LANDING-RUNBOOK.md`; версію бази фіксуйте в provenance пакета.
- Надана користувачем конвенція продуктового аналітика `ga_{module/modal}_{action}_{element/result}` — preferred naming contract; campaign dictionary і incomplete validation pattern потребують окремого погодження.
- [Google Analytics event reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events) і [collection limits](https://support.google.com/analytics/answer/9267744) — platform schema/limits, не підтвердження нашого measurement channel.
- [QA](13-qa.md), [приватність](17-security.md), [шаблон плану](../templates/analytics-plan.md).
