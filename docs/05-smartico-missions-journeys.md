# Smartico: місії, стани та Journey

Цей розділ визначає межі між лендінгом, продуктовим host і Smartico. Він застосовується до промо з місією, named Client Action або обома механізмами. Конкретні ID, бонуси й дати належать конфігурації середовища, а не спільній бібліотеці.

Для сучасного API, різних типів markers, delivery limits і точного investigation почати з [Smartico knowledge base](../smartico-knowledge/README.md). Повторювані рішення з наступних інтеграцій — [promo patterns](21-promo-patterns.md); bugfix та modal cleanup — [incident catalog](22-incidents-and-popup-cleanup.md).

Суміжні розділи: [контракти iframe](02-iframe-and-contracts.md), [event actions](03-event-actions.md), [стани й час](04-state-and-time.md), [popup templates](06-smartico-popup-templates.md), [native WebView](07-native-webview.md).

## 1. Вибрати механіку перед версткою

| Потреба | Механізм | Джерело поточного стану |
| --- | --- | --- |
| Opt-in, прогрес, повторювані спроби, серверний reset | Mission | Smartico mission snapshot |
| Реакція на продуктову дію без mission UI | Client Action → Journey | Погоджений backend/Smartico state provider; сам клік стану не доводить |
| Mission із завданням, яке слухає named action | Client Action прогресує mission | Mission snapshot; одна погоджена дія, без дублюючого opt-in/completion |
| Вибір у CRM popup | Engagement action | Вихідний connector відповідної popup activity |
| Відкрити бонуси, гру, верифікацію | Product `event_action` | Підтриманий dispatcher продукту |

**Client Action, `event_action` і popup click — різні рівні.** Додавання analytics event або переходу не нараховує бонус і не підтверджує вступ у Journey. Вибір entry trigger описати через одну з явних механік у [mission runbook](05a-smartico-mission-runbook.md), [Journey runbook](05b-smartico-journey-runbook.md) або [Client Actions](05c-smartico-client-actions.md).

Лендінг повідомляє намір користувача, відображає підтверджені дані й керує очікуванням. Smartico/backend визначає eligibility, кількість спроб, результат, caps, grant та повторний вхід. Не переносити ці рішення в випадковий `Math.random()`, `localStorage` або клієнтський таймер.

Перед irreversible opt-in визначити prerequisites і точку витрачання спроби. Missing prerequisite, яка за правилами не має витрачати участь, веде в окрему інформаційну підказку без opt-in/grant. Сервер повторно перевіряє умови після preflight. Окремий informational Journey не суперечить одному core Journey для outcome branches однієї спроби.

## 2. Discovery: що і звідки беремо

| Дані | Власник / джерело | Що записати в інтеграційний контракт |
| --- | --- | --- |
| ENV, Label, Brand, дозволені origins | Smartico BO та інтеграційна команда | Окремо Stage/Production; вибране оточення перевірити перед змінами |
| Mission ID, task ID, Journey ID, assets | Збережені об'єкти BO | ID, назва, status, зв'язки; не ID з іншого label |
| Script URL, label/brand public keys | Конфігурація продукту або погоджена SDK-інтеграція | Хто володіє SDK; потрібні origin whitelist/auth hash |
| Native WebSocket endpoint/session | App-команда | Існуючий session service; лендінг не створює його сам |
| Поточна identity | Довірений host bridge / auth provider | Token чи opaque identity за контрактом, logout/user change |
| Eligibility, KYC, обов'язкові ліміти | Продуктовий profile/eligibility provider | Реальні поля, DTO, endpoint, CORS, owner, типи flags |
| Campaign timezone та розклад | Product + CRM | IANA timezone, recurrence, start/end, explicit stop, DST |
| Client Action | BO Properties + контракт host | Точне ім'я, payload, єдиний sender, trigger match |
| Grant confirmation | Bonus/backend integration | Успіх, failure, pending, idempotency, route після успіху |

Службові ідентифікатори й внутрішні назви використовувати латиницею. Українські службові описи допомагають команді; player-facing content має відповідати погодженій локалізації. Поле `Name` у BO інколи публічне: не показувати гравцю технічне `QA` лише тому, що його зручно використовувати як internal name.

Не копіювати live keys, user tokens, hashes або socket credentials у playbook чи приклади. Публічна конфігурація SDK не замінює авторизацію користувача. JWT payload можна декодувати лише як підказку identity згідно з перевіреним host contract; це не перевірка підпису і не доказ eligibility. [Безпека](17-security.md).

## 3. Один provider для UI, різні transports

Web може використовувати host-owned SDK або погоджений SDK у child iframe. Якщо і parent, і child мають SDK, призначити одного власника popup delivery та перевірити відсутність дублювання. Не додавати другий SDK тільки тому, що з child не видно `window.parent._smartico`.

На web API стає доступним після ініціалізації та ідентифікації. Перший `script.onload` не означає готовність mission API. Методи `getMissions`, `requestMissionOptIn` й callbacks перевірити в поточній SDK-версії. Публічна поверхня описана в [Smartico public API](https://github.com/smarticoai/public-api/blob/main/src/WSAPI/WSAPI.ts); назви mission полів — у [TMissionOrBadge](https://github.com/smarticoai/public-api/blob/main/docs/api/interfaces/TMissionOrBadge.md).

Не покладатися на старе узагальнення «зміна user ID потребує тільки reload». Поточна інтеграція може підтримувати `online`/`logout`/identify listeners. Використати підтверджений lifecycle конкретного SDK; якщо його немає — погодити перевідкриття сесії. Кеш попереднього користувача завжди очищується.

Native app зі своїм Smartico service має використовувати його через спільний adapter. Нова акція не повинна отримувати власний socket, renderer або `switch missionId` у Swift. [Native contract](07-native-webview.md) описує запропонований provider; він не є вже встановленим API кожного застосунку.

```ts
// ПРОПОЗИЦІЯ внутрішнього interface, не Smartico SDK API.
interface MissionProvider {
  list(): Promise<MissionSnapshot>;
  optIn(missionId: number): Promise<OptInResult>;
  subscribe(listener: (snapshot: MissionSnapshot) => void): () => void;
  dispose(): void;
}
```

Adapter має нормалізувати web/native схеми один раз. Не читати web `id` зі socket raw `ach_id` і не перетворювати відсутній `isLocked` у `false` за допомогою `Boolean(undefined)`. Не оголошувати guessed timestamp офіційним Smartico полем: `nextResetAt` може бути власним DTO лише з підтвердженого server field або погодженого календарного розкладу.

## 4. UI очікує фактичний стан

Рекомендована пріоритетність для промо з opt-in:

1. Guest → усі entry CTA відкривають погоджену auth modal дію.
2. Auth/identity або eligibility невідомі → loader, активаційні controls приховані.
3. Unverified/ineligible → пояснення й погоджена наступна дія; клік на entry art також веде туди, без opt-in.
4. Eligibility error → керована помилка/retry, активація недоступна.
5. Mission response ще немає → loader; не показувати available «за замовчуванням».
6. Available → активні кнопки, hover/focus і анімація за дизайном.
7. Request pending → один вибраний control, інші заблоковані, повторний sender не запускається.
8. Used/cooldown → controls у звичних місцях disabled, без pulse, зі зрозумілим текстом наступної спроби.
9. Timeout із невідомим результатом → reread, а не повторний opt-in автоматично.
10. Ended/hidden/locked → відповідний пояснений стан; відсутня місія не дорівнює available.

П'ятисекундний loader чи центрування вибраної кнопки — **UX budget**, не доказ відкриття popup, успішного результату або grant. Завершення цієї анімації не розблоковує спробу. Якщо delivery acknowledgment у контракту немає, це прямо записується в spec і QA.

Eligibility на frontend потрібна для правильної CTA. Серверне eligibility потрібне для фактичного обмеження. QA може мати окремо погоджений relaxed segment; це не правило Production. Не робити весь backend KYC gate із неавторитетного profile flag.

## 5. Календарний reset і таймер

«Щодня о 00:00 Europe/Kyiv» та «через 24 години після activation» — різні механіки. Recurrence місії й time-to-complete мають різні значення; друге може починатися від opt-in. Scheduled recurring mission має серверний reset для всіх користувачів за налаштованим розкладом. Першу доступність після activation також треба перевірити: вона може настати на наступному reset. [Recurring Missions](https://help.smartico.ai/welcome/products/gamification-basics/missions/recurring-missions).

Розклад задається в BO/backend. UI бере підтверджений next reset або обчислює дедлайн із **погодженого** IANA-календаря, якщо API не віддає його. Обидва таймери сторінки використовують один deadline/provider. На нулі UI запитує новий snapshot і показує коротке очікування; лише відповідь із реальною доступністю відкриває entry.

Для відомого used timestamp дедлайн прив'язувати до його календарного циклу. Якщо старий snapshot залишився після 00:00, не обчислювати «наступну північ» заново від поточного часу й не видавати нові 23 години блокування. Позначити stale/reset pending та reread. Повідомлення гравцю не має називати Smartico.

Europe/Kyiv змінює UTC offset. Для ілюстрації: локальні 00:00 можуть відповідати 21:00 UTC попередньої дати влітку та 22:00 UTC взимку. Фіксоване `UTC+3` не є IANA timezone. Якщо BO підтримує тільки UTC schedule, CRM owner готує правильні runs/періоди для всього campaign window, включно з DST; frontend косметика цього не виправить. [Час і стан](04-state-and-time.md).

## 6. Один Journey для послідовних станів

Reward, doubled reward і loss зазвичай є гілками одного Journey, а не незалежними кампаніями, які можуть увімкнутися одночасно. Візуальних assets може бути багато; шаблон один на сумісну структуру. Правило не забороняє окремі Journeys для різних бізнес-механік — рішення й взаємне виключення мають бути явні.

Для claim/risk/explicit close оформити action matrix. Навігація до бонусів дозволяється після підтвердженого grant, якщо це затверджена поведінка. X може означати close-and-claim **лише за явним контрактом**. Passive close, system Back, Escape, loss, reload і timeout не повинні випадково нараховувати бонус.

Повний BO-процес і приклад flow: [налаштування Journey](05b-smartico-journey-runbook.md). Повторний клік блокується локально для UX, а одноразовість grant забезпечують Journey/backend caps та idempotency.

## 7. Докази й troubleshooting

Для кожної інтеграції зберігати окремі факти: identity ready, mission read, opt-in accepted, Journey entry, popup rendered, click delivered, grant confirmed, native route opened. Один успішний крок не доводить решту.

| Симптом | Перші перевірки |
| --- | --- |
| SDK script є, місій немає | Identify completion, актуальний user, origin whitelist, label/brand, mission visibility, timeout |
| Loader не завершується | Bounded timeout; невалідний token/DTO; stale response guard; transport connected |
| Стани змінюються після показу available | Initial UI має починатися loading, а не available |
| Після півночі cooldown ще 23 години | BO recurrence, old cycle timestamp, обидва deadline, stale SDK cache; не просто timer CSS |
| Opt-in є, popup немає | Journey trigger/ID, entry cap, active dates/status, popup owner, native delivery logs |
| Чорний popup, handshake пройшов | Реальний `tmpl()` compilation, root content, asset/CSP errors; [template runbook](06-smartico-popup-templates.md) |
| Web працює, App не відкриває бонуси | BCID4/CID105 mapping у native dispatcher; [приклад routing](../examples/native-smartico-routing.md) |

Діагностика містить типи подій, sanitized error codes, revision/epoch і тривалості. Не друкувати bearer, user hash, повний profile, приватний socket payload або персональні дані. Службовий UI прибрати перед release. Acceptance: [QA](13-qa.md), [analytics](12-analytics.md), [release](14-release-and-cache.md).
