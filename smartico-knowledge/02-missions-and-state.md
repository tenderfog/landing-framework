# 02. Місії, eligibility та синхронізація стану

## Як вибрати механізм входу

| Потреба | Базовий варіант | Що ще довести |
|---|---|---|
| Явна участь, прогрес, календарні цикли | Mission/task, opt-in за механікою | Visibility, recurrence, completion event, claim/grant owner |
| Кнопка запускає flow без mission progress | Named Client Action → Journey | Авторитетний attempts/pending state та серверні caps |
| Підтверджений депозит/інша server activity | Product event → rule/Journey/task | Event type, amount/currency/status, trigger timing |
| Тільки навігація до правил або продуктового екрану | Підтриманий `event_action` | Route доступний у Web/App, коректне повернення |

Client Action — подія, а не збережений дозвіл чи completed mission. Payload можна перевіряти в Query Builder, але amount, winner і verified status не стають довіреними від того, що їх передав браузер. [Client action event](https://help.smartico.ai/welcome/products/tools-and-guides/client-action-event). Детальні конфігурації — [Mission runbook](../docs/05a-smartico-mission-runbook.md) та [Client Actions](../docs/05c-smartico-client-actions.md).

## Відділи prerequisite від спроби

Розклади правило «можна брати участь» на незалежні факти: campaign window, authenticated user, KYC, прийнятний депозит/інша умова, поточний cycle, невикористана спроба, відсутній незавершений entry. Для кожного вкажи source, owner, час перевірки і поведінку, якщо дані unknown.

Якщо умова — **одна транзакція від порогу**, не замінюй її сумою депозитів або balance. Якщо умова — **сума за період**, не порівнюй лише останню транзакцію. Event properties, current user state та історичні transactions мають різний контекст у [Query Builder](https://help.smartico.ai/welcome/products/crm-automation/segmentation/query-builder). Уточнюй валюту, approved status, межі вікна, timezone, «до/після» та включність границь.

Frontend може показувати CRM marker виконаної prerequisite; саме правило участі повторно контролює trusted server flow. Під час затримки між deposit approved → CRM update → client refresh показуй очікування оновлення і безпечне перечитування, а не вимагай повторний депозит.

Відділи **цільову когорту до акції** від **права після виконання умови**. Наприклад, аудиторія «давно не було депозиту» може перестати відповідати сегменту саме після необхідного депозиту. Якщо бізнес вимагає зберегти участь цієї когорти, потрібен явно обраний snapshot/locked audience або інший підтверджений cohort contract. У [Common Cases Segments](https://help.smartico.ai/welcome/products/crm-automation/segmentation/common-cases-segments) описані збережені списки та rebuild: live `Real-time Users` preview і `Segment Users` після rebuild не однакові. Такий segment корисний для targeting/reconciliation, але його refresh не є миттєвим atomic guard.

## Типи місій та видимість

| Бізнес-модель | Тип / відмінність |
|---|---|
| Нова спроба всім за календарним розкладом | Scheduled recurring mission |
| Новий цикл після completion | Recurring upon completion, не спільний midnight reset |
| Спершу unlock condition | Locked mission із перевіреною unlock task |
| Один раз за кампанію | Неповторювана mission з відповідними dates/caps |
| Призначення конкретним користувачам через flow | Featured/assigned, якщо відповідає business contract |

Segment може приховати mission; locked mission може бути видимою, але недоступною. Приховування task list/custom-section placement не змінює eligibility чи completion. Reward має одного owner: mission/task або Journey; дві видачі потребують окремої затвердженої механіки. Status transitions можуть бути незворотними — Archive не слід вважати паузою. [Mission setup](https://help.smartico.ai/welcome/products/gamification-basics/missions/how-to-set-up-a-mission), [Recurring upon Completion](https://help.smartico.ai/welcome/products/gamification-basics/missions/recurring-upon-completion-missions).

BO procedure, task filters, next-runs readback та activation QA — [Mission runbook](../docs/05a-smartico-mission-runbook.md). UI states і timer implementation — [стани й час](../docs/04-state-and-time.md).

## Calendar recurrence не дорівнює cooldown

[Recurring Missions](https://help.smartico.ai/welcome/products/gamification-basics/missions/recurring-missions) описує розклад циклів, reset усіх progress і повторний opt-in на наступному циклі. Новостворена active recurring mission може не бути видимою до першого запланованого reset. Availability end та time to complete — окремі обмеження.

Проєктний cycle contract має містити IANA timezone, authoritative next boundary, last consumed cycle та end boundary. Не припускай, що mission recurrence, task frequency, Journey entry cap і bonus daily cap використовують однаковий календар. Порівняй їх явно, особливо біля півночі та зміни часу. Таймер завершується → UI rereads state; він не видає новий дозвіл самостійно. [Стани й час](../docs/04-state-and-time.md).

`next_recurrence_date_ts` описане у перевіреній поточній API reference для відповідних mission types, але наявність та units треба підтвердити у підтриманому runtime. Не вимагай це поле від старого adapter або об'єкта, де воно не має сенсу після завершення кампанії.

## Mission state має власні cache та subscription rules

Client calls працюють через `_smartico.api`: `getMissions` для read та `requestMissionOptIn` для opt-in. Exact arguments/response й доступність перевіряються у підтриманому snapshot/runtime; wrapper не вигадує generic ACK або нову mission RPC для canonical bridge.

Перевірений SDK snapshot [`WSAPIMissions`](https://github.com/smarticoai/public-api/blob/81f2790f02424f01dadcbe979288f096cdc5d542/docs/api/classes/WSAPIMissions.md) документує:

- `getMissions` повертає видимі користувачу missions; відсутність у списку може бути наслідком visibility/status/перерви між циклами.
- `onUpdate` повертає **повний новий масив**, а не patch; оновлення замінює попередній mission snapshot.
- Для `getMissions` активний один callback: наступна підписка може замінити попередню.
- Cache має TTL 30 секунд у цьому snapshot; BO config edits самі не пушаться всім connected clients.
- Після opt-in/claim потрібен підтверджений refreshed state; optimistic completion не використовувати.

Це documented behavior конкретного snapshot, не hardcoded TTL для всіх майбутніх SDK. Практичний наслідок: landing і кілька widgets, що ділять SDK, мають координувати підписку через один state owner. Fan-out до UI належить вашому service; кожен компонент не повинен повторно захоплювати vendor callback. Не очищай session/cache всього host заради одного блоку.

Mission API list, public-properties patch і product KYC response мають різні merge semantics. Це потрібно явно записати в adapter, щоб повний mission array не змішувався зі старими items, а частковий profile patch не стирав актуальні поля.

## Reset для повторного QA

Не називай усі операції «скинути користувача». Окремо існують markers, mission opt-in/progress/completion, cycle schedule, Journey entry/history, pending engagement, bonus grant/history і product-side bonus state. Для тесту склади перелік саме тих обмежень, які заважають повторному проходженню.

Безпечний порядок: прочитати state → перевірити dedicated test account → використати інший тестовий профіль або штатний індивідуальний reset, якщо він підтверджений → перечитати результат. Видалення marker не скидає completion. Додатковий recurring run змінює цикл для всієї аудиторії і може відкрити нову спробу; це окрема зміна механіки, а не локальне очищення UI. Не компенсуй недоступний reset безконтрольним дублюванням production mission.

## Перевірки, які доводять готовність стану

Тестуй не лише successful opt-in: delayed identify, unknown KYC, prerequisite з затримкою, reused cycle, late response після logout, дві вкладки, SDK reconnect, повернення з каси, відсутню mission у відповіді, кінець кампанії та новий цикл. На кожному переході перевір UI, authoritative state і кількість server entries/grants. Local mock доводить rendering; він не доводить Smartico rule execution.
