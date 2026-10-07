# Swift та React Native Android: спільний WebView contract

Акційний лендінг має працювати у browser iframe, Swift `WKWebView` та React Native Android WebView. Одна campaign configuration не означає однаковий transport. Host один раз забезпечує auth/data/product actions/CRM delivery; кожна нова акція змінює content/config і CRM objects, а не App-код із її ID.

**Мітки доказів:** «підтверджений protocol» — підтримано наведеними primary docs/кодом wrapper; їх версію повторно звірити перед інтеграцією. «Пропонований contract» — власний interface, що потребує погодження й реалізації; «перевірено в App» — тільки фактичний device test. Підтверджений protocol не доводить, що всі capabilities встановлені у конкретній App-збірці.

Суміжні розділи: [iframe](02-iframe-and-contracts.md), [event actions](03-event-actions.md), [Smartico lifecycle](05-smartico-missions-journeys.md), [popup compiler](06-smartico-popup-templates.md), [routing example](../examples/native-smartico-routing.md), [QA](13-qa.md).

## 1. Власники та межі

| Компонент host | Відповідальність |
| --- | --- |
| Session/auth provider | Current identity, logout/login, token rotation, trusted API calls |
| Smartico service | Поточне identified з'єднання/SDK, missions, server events, reconnect |
| Popup service | Generic CRM engagements, wrapper lifecycle, queue, tracking |
| Product dispatcher | Supported event actions: auth, verification, games, bonuses, categories, зовнішні URL |
| Landing adapter | Версіонований дозволений доступ до даних/operations, replies, lifecycle |
| Analytics adapter | Власник відправлення, consent, dedup і approved schema |

Не hardcode-ити resource/mission/campaign IDs у Swift/RN. Не створювати socket на кожну WebView чи другий renderer на кожен outcome. Popup, gamification widget і promo WebView мають окремі lifecycle; global destroy одного не повинен закривати інші.

Обрати одну поточну integration model: existing native socket service, установлену офіційну бібліотеку або погоджений web SDK. Наявність нового official SDK не означає необхідність міграції. [Smartico native guide](https://help.smartico.ai/welcome/technical-guides/front-end-integration/ios-android-clients-integration-guide) посилається на [React Native demo](https://github.com/smarticoai/react-native-demo); конкретні версії/можливості перевіряються перед рішенням.

## 2. Landing bootstrap — пропонований contract

Це архітектурна пропозиція для спільної бібліотеки. Вона не існує автоматично в canonical `IframeBridge`, `SmarticoBridge` або кожному App. Назви operations/callbacks мають бути погоджені з командами; vendor bridge не змінюється непомітно.

```json
{
  "protocolVersion": 1,
  "hostType": "native",
  "identityEpoch": "opaque-session-revision",
  "locale": "uk",
  "theme": "dark",
  "capabilities": ["product.actions", "missions.read", "missions.optIn", "missions.updates"],
  "analyticsConsent": "unknown"
}
```

Рекомендовані правила контракту:

- Host визначає identity; payload landing не може обрати іншого user. Native service виконує авторизовані calls без передачі socket handle/private hash у сторінку.
- Request має correlation ID, operation, typed params, identity epoch. Response містить той самий ID/epoch, result або structured error.
- Mission snapshots містять revision/fetch time та нормалізовані flags; невідоме поле лишається невідомим. Native raw schema й web SDK schema різні.
- Updates мають unsubscribe й cleanup. Logout/epoch change скасовує pending requests, очищує data/selection і відкидає stale replies.
- Locale/theme/consent передаються при ready й на зміну; немає forced української поверх англійського host. Content/Smartico variants локалізуються окремо.
- Host явно повідомляє foreground/background/dispose. `document.visibilityState` лишається додатковим browser сигналом, не єдиним native lifecycle.
- Operation unsupported/disconnected/timeout/unauthorized відрізняються від бізнес-відмови. UI не вмикає entry оптимістично й не створює тихо другий JS SDK socket у native mode.

Виявляти native integration через підтверджений capability handshake, не `navigator.userAgent.includes('iPhone')`. Web без native advertisement використовує погоджений web provider. App без нового adapter потребує одного host update; сам deploy landing не встановлює невідомий bridge.

## 3. Missions через existing native service

Підтверджений [Smartico native protocol](https://github.com/smarticoai/public-api/blob/main/docs/native/PROTOCOL.md#missions):

| Operation | Request | Response / update |
| --- | --- | --- |
| Mission/badge list | `cid:502` | `cid:503`, `achievements` |
| Mission opt-in | `cid:525`, `achievementId` | `cid:526` |
| Achievements changed | Server `cid:504` | Перечитати list, не готовий snapshot |

Requests корелюються через `uuid`; використовують належні `ts` й current identity. Raw missions фільтруються за `ach_type_id:1`; поля `ach_id`, `isLocked`, `requiresOptin`, `isOptedIn` не є web `TMissionOrBadge`. [UserAchievement schema](https://github.com/smarticoai/public-api/blob/main/docs/api/interfaces/UserAchievement.md).

У публічній перевіреній schema не підтверджено універсальне поле `next_recurrence_date_ts`. Не робити його обов'язковим. Для countdown adapter віддає own `nextResetAt` лише коли має verified server data або затверджений календарний schedule; механіка [time/state](04-state-and-time.md) зберігається.

Native initialization/login packet schema не копіювати з цього playbook: App-команда використовує реальний account-specific protocol/current library. Endpoint, Label/Brand, hash validation, keepalive й reconnect задає integration owner. На reconnect reread; невідомий timeout opt-in не повторюється автоматично.

## 4. CRM popup handshake — підтверджений protocol

За [Native Integration Guide](https://help.smartico.ai/welcome/technical-guides/front-end-integration/ios-android-clients-integration-guide#110-client_engagement_event) popup service отримує server engagement, використовує `native_app_popup_url` з identify й повний event. Стислий flow:

| Напрямок | Message | Дія |
| --- | --- | --- |
| Socket → App | `cid:110`, popup `activityType:30` | Зберегти повний engagement |
| App → wrapper | Load server-issued popup URL | Hidden view; handlers установлені до load |
| Wrapper → App | `bcid:1 PAGE_READY` | Готовий приймати event |
| App → wrapper | Повний engagement + `bcid:3` | Без зайвого `payload` envelope |
| Wrapper → App | `bcid:5 READY_TO_BE_SHOWN` | Present popup view |
| Wrapper → App | `bcid:6 SEND_TO_SOCKET` | Forward reports через existing service |
| Wrapper → App | `bcid:4`, `dp` | Generic product/deep-link router |
| Wrapper → App | `bcid:2 CLOSE_ME` | Закрити view, не втратити reports |

Popup wrapper UA — `SMTO-WRAPPER`; це не UA звичайного promo landing. Wrapper URL не збирається вручну з asset/user ID: він має поточне server-issued environment/identity/hash. `didFinish`/`onLoadEnd` не замінює PAGE_READY.

Перевірений [код wrapper bridge](https://libs.smartico.ai/smartico_native_bridge.js) підтримує iOS `window.webkit.messageHandlers.SmarticoBridge`, Android-style `window.SmarticoBridge` та React Native `window.ReactNativeWebView.postMessage`. Це канали **Smartico wrapper**, не назви довільного нового promo RPC. Перевіряти code/library версію свого runtime.

`bcid:6` має `cid` та socket fields на верхньому рівні. Forward весь об'єкт без `bcid`, зберігши `uuid`, `ts`, `engagement_uid`, `activityType`, `action` та інші fields. Не пересилати лише `message.payload` і не генерувати другий tracking event. `cid:103/104/106` описують impression/action/failure. [Engagement tracking](https://github.com/smarticoai/public-api/blob/main/docs/native/PROTOCOL.md#engagement-tracking).

Reports мають пройти до disposal; черга й dedup залежать від engagement identity, не тільки asset ID. Правило повторного показу/acknowledgment визначає delivery contract. Нові template IDs не вимагають нового `switch` у native renderer.

## 5. Чорний екран не завжди transport

Handshake/impression не доводить, що content root має HTML. Послідовність діагностики:

1. Повний server event/params передано саме в wrapper.
2. Template engine скомпілював Body без exception; `tmpl('_template', params)` окремо пройшов.
3. Root містить visible content; external images/fonts доступні за CSP/CORS.
4. Native view має правильні bounds/opacity/z-order; creative не shrink-wrap/zoom.
5. Наступний click report/connector працює на current session.

Literal `%}` у minified CSS і вшиті assets — відомі пастки; [template runbook](06-smartico-popup-templates.md). Якщо existing handshake уже працює, не переписувати native integration через creative compilation error.

## 6. Navigation для bonus/game/category

Popup `bcid:4 dp` і Journey socket `cid:105 payload.dp` ведуть в один generic router. Для `dp:go` з підтриманим product `/event_action/...` route він викликає наявний native dispatcher, а не відкриває Safari/Chrome/plain webpage. [Повний приклад](../examples/native-smartico-routing.md).

Dummy controls `dp:ok/cancel/close` не замінюються navigation. `dp:action` потребує розрізнення exact popup-click та named Client Action за [contract](05c-smartico-client-actions.md). Не переносити routes між продуктовими профілями без перевірки й не обіцяти підтримку нового event action без dispatcher implementation.

## 7. Swift WKWebView checklist

- HTTPS landing URL зберігає query/auth/locale/theme contract; redirect не губить bootstrap params.
- Власник реєструє потрібний `WKScriptMessageHandler` до load, перевіряє trusted WebView/frame/origin й JSON schema; видаляє handler на teardown. [Apple API](https://developer.apple.com/documentation/webkit/wkscriptmessagehandler).
- UI/overlay transitions на main thread; bridge/service утримуються до завершення reports, без retain-cycle/leaked views.
- Native popup bounds — повний дозволений viewport з safe areas; promo page scroll, native header і system Back мають узгоджений пріоритет.
- Account switch та foreground роблять identity/data reconciliation, не застосовують stale snapshots.
- Сookies/credentials належать host/session contract. Не читати cross-origin cookie з landing і не додавати token до URL.
- Muted inline video, sound user gesture, poster before actual frame, background pause/resume перевірити на real device. Не вважати `load` доказом autoplay.
- Renderer/content-process failure → керована recovery; невідомі reward operations не повторюються blind.

## 8. React Native Android checklist

Використати фактичну версію `react-native-webview` із package lock. [Official Guide](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Guide.md) описує string `postMessage`/`onMessage` та відмінності injection на Android; це не гарантія раннього bootstrap всіх iframe.

- `onMessage` підключений до trusted page, JSON parsed/validated; wrapper і landing messages не змішуються в одному unrestricted handler.
- Bootstrap handshake idempotent: ready → context → acknowledgement. Не покладатися лише на ранню injection до content loaded.
- Initial custom headers не вважаються автоматично доступними в усіх подальших navigations; auth contract не зберігається тільки в `source.headers`.
- `onShouldStartLoadWithRequest`/routing policy не є єдиним механізмом event actions: message dispatcher — основний; browser fallback і unsupported routes явні.
- Android hardware Back закриває overlay/продуктовий modal за policy, а не випадково replays activation/navigation.
- WebView/System WebView version, hardware compositor, scroll, viewport, safe insets, rotation й text scaling перевірені на мінімальній підтриманій збірці.
- Process termination, network reconnect, unmount/reopen прибирають timers/subscriptions, зберігають server source of truth.
- Debugging, permissions, mixed-content/file access визначені App policy. Не включати широкі permissions тільки заради promo.

Props/availability перевіряти за [API Reference](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md), не за скопійованим прикладом з іншої версії.

## 9. Оpaque фон, WebGL і lifecycle

Темний opaque landing фон задається явно на `html/body`/scene та в native container за design contract. Не покладатися на default transparent WKWebView. Якщо scene має чорний фон, shader compositing може завершуватися в opaque canvas (`alpha:false`, final alpha 1) із тим самим background color. Це design-specific рішення; прозорий popup має інший compositing contract.

Підкладку й shader прив'язати до scene bounds, не закривати hero/video. CSS masks/blend/filter features мають перевірений fallback: unsupported/compile/link/context loss → styled image/CSS, без білого чи сірого rectangle. Fallback готовий ще до shader initialization.

Всі постійні animation loops — video, WebGL, carousel, frame sequence — зупиняються у background/out-of-view, на reduced motion та disposal. На Android/iOS native lifecycle може вимагати explicit host notification; не розраховувати, що `requestAnimationFrame`/timer сам вирішить усе. GPU/CPU/DPR budgets і device QA описуються у відповідних розділах playbook, а не обираються за desktop FPS.

## 10. Acceptance універсального adapter

Перевірити дві різні campaigns без App patch: різні mission IDs/assets/content; supported standard actions; одна identity/data provider; generic popup queue; report/route одноразові. Додати negative cases unsupported capability, stale epoch, timeout, lost/recovered WebGL, no consent, locale/theme update, logout/reconnect, second popup.

Новий **підтриманий** event action може використовуватися конфігурацією. Принципово нова operation/route/schema потребує версіонованого host розширення; «універсально» не означає виконувати довільний JS/URL/socket command.

У QA-звіті розділяти protocol/read-only source inspection, emulator/browser й real iOS/Android. Для нової campaign deployment потрібний повний chain intent → accepted → engagement rendered → action delivered → confirmed business outcome → native route, без секретів у logs.
