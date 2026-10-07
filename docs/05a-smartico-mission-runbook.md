# Налаштування Mission у Smartico BO

Використовувати для створення, зміни або аудиту mission-backed промо. Спершу прочитати [межі інтеграції](05-smartico-missions-journeys.md). Налаштування в BO не дає дозволу на Production activation: дія має відповідати scope поточного запиту.

UI Smartico може змінюватися між labels/версіями. Шляхи нижче — орієнтири для пошуку; назви полів перевіряти у відкритому BO. Не вигадувати неіснуючий selector/API для масового редагування.

## Вхідні дані

Потрібні: campaign key, ENV/Label/Brand, local start і exclusive end, IANA timezone, segment/eligibility owner, тип повторення, opt-in, критерій completion, reward owner, mission visibility, вимоги мов. Відсутній bonus ID не замінюється випадковим Production bonus. QA placeholder можна вибрати лише в погодженому QA середовищі й записати, що він не сертифікує суму/гру/FS.

Приклад конфігурації — **навчальний, без реальних ID**:

```yaml
campaignKey: campaign_summer
environment: stage
mission:
  id: null # заповнити після save у правильному label
  internalName: SC Summer QA Daily Entry
  descriptionUk: Щоденний вступ до тестової акції
  type: scheduled-recurring
  requiresOptIn: true
  recurrence:
    timezone: Europe/Kyiv
    localTime: '00:00'
    period: calendar-day
  rewardOwner: journey
  completion: verified-mission-opt-in-event
```

Це власний config schema, не JSON імпорту Smartico. `completion` означає вибраний бізнес-контракт; точну подію в Query Builder треба знайти й перевірити.

## 1. Перевірити оточення та наявні об'єкти

1. У відкритому BO зафіксувати selected environment, Label і Brand. Перевірити URL/назву середовища та доступні permissions.
2. У **Gamification → Missions** пошукати campaign key/internal name. Прочитати наявну mission і зв'язки; не створювати дубль, якщо задача — виправити існуючу.
3. Записати mission ID, status, tasks IDs, recurrence і segment. Зберегти screenshot або export без персональних даних.
4. При clone перевірити скопійовані dates, сегменти, reward activities й public texts. Clone має бути адаптований до нового campaign, а не мати приховану стару нагороду.

Офіційна точка створення — **Gamification → Missions → Create**; новий об'єкт починається Draft. Види й основні поля описано в [How to set up a Mission](https://help.smartico.ai/welcome/products/gamification-basics/missions/how-to-set-up-a-mission).

## 2. Вибрати тип за бізнес-правилом

| Механіка | Тип / рішення |
| --- | --- |
| Нова спроба всім за щоденним розкладом | Scheduled recurring mission |
| Нова спроба одразу після completion | Recurring upon completion; це не midnight reset |
| Спочатку виконати unlock condition | Locked mission + перевірена unlock task |
| Один раз за campaign | Неповторювана mission з відповідними dates/caps |
| Видати конкретним користувачам через flow | Featured/assigned механіка, якщо вона відповідає spec |

`Locked + Opt In DEMO` не універсальна starting point. Назва демонстраційної місії не встановлює потрібний recurring lifecycle. [Recurring upon Completion](https://help.smartico.ai/welcome/products/gamification-basics/missions/recurring-upon-completion-missions) описує іншу поведінку, ніж календарна recurrence.

## 3. Налаштувати поля, visibility та eligibility

Заповнити internal name латиницею, службовий description українською. Public title/description/reward/CTA локалізувати за approved content. Якщо є лише одне поле Name і воно показується гравцю, не плутати його з internal name.

Увімкнути explicit opt-in, коли entry потребує активного вибору. Перевірити видимість mission/task у gamification widget: приховування task list не змінює eligibility чи completion.

Не змішувати segment і unlock. Segment може повністю приховати mission; locked mission може бути видимою, але недоступною. Segment має залишатися коректним після виконання умови, інакше вже завершена mission може зникнути до claim. [Missions](https://help.smartico.ai/welcome/products/gamification-basics/missions).

Для Production обмеження KYC/deposit/country тощо потрібні server-side, навіть якщо лендінг уже веде на верифікацію. Для QA записати окрему дозволену eligibility політику. Не заявляти «all users» без перевірки scope label та trigger.

## 4. Створити task і не подвоїти reward

У **Add Task** визначити task type, action event, progress increment, кількість completions, points та task reward. Для entry-only місії, де винагороду видає Journey, points/task reward зазвичай нульові; інша політика має бути явно затверджена.

Якщо task повинна completion на opt-in цієї mission, знайти доступний event і вказати точний mission ID. Якщо task слухає Client Action, вказати точне action name/payload filters за [Client Action runbook](05c-smartico-client-actions.md).

Не додавати водночас mission reward і Journey Bonus для однієї винагороди випадково. Не надсилати frontend «complete» action поряд із native mission opt-in, якщо один event уже достатній для task/entry. Потрібна одна доведена trigger chain.

Записати:

```text
User intent → sender/operation → observed event → task filter → completion → Journey entry
```

Якщо назва події невідома, завершити підготовку Draft і знайти її через BO/current integration owner або sanitized QA trace. Не підміняти її guessed event name.

## 5. Налаштувати час у backend

1. Ввести campaign availability start/end у фактичній timezone BO. Для дат «до N включно» зберігати наступну локальну північ як exclusive end у spec й перевірити UI semantics.
2. В recurring schedule вибрати календарний інтервал і reset. Не використовувати time-to-complete як заміну reset.
3. Якщо business timezone IANA, а BO має тільки UTC або fixed offset, скласти UTC runs для всього періоду; перевірити DST. Фіксований «00:00 user timezone» теж не тотожний 00:00 Kyiv для всіх гравців.
4. Відкрити **See next runs** або еквівалент. Записати щонайменше першу QA доступність, звичайний наступний reset, run до й після DST, фінальний run.
5. Зберегти й повторно відкрити mission: visible values мають збігатися з spec.

Активована recurring mission може чекати першого scheduled reset, перш ніж стати доступною. Для тесту сьогодні можна використати дозволений QA first run у найближчий час, після тесту відновивши погоджений schedule. Це контрольована QA зміна з записом before/after; не рухати Production reset усім користувачам без task scope. [Recurring Missions](https://help.smartico.ai/welcome/products/gamification-basics/missions/recurring-missions).

Зміна schedule вже активної mission може не мігрувати миттєво існуючий user cycle. Перевірити реальний QA user після boundary; frontend countdown не доводить reset на сервері.

## 6. Перед activation

- Draft saved/reopened; усі дати, segment, rewards, task filters перевірено.
- Mission ID передано landing config правильного середовища.
- Journey Draft має точний trigger і готові popup assets; [Journey runbook](05b-smartico-journey-runbook.md).
- Визначено first availability, recurrence, entry cap, grant owner та поведінку hidden/missing mission.
- Зафіксовані target/scope activation й план QA; реальний opt-in може запустити grant.

Зміна status Active може мати обмеження подальшого повернення до Draft/відновлення Archived. Перед натисканням прочитати актуальне BO попередження; не архівувати об'єкт як «нешкідливе скасування». Activate тільки потрібні об'єкти в погодженому середовищі.

## 7. Після activation: перевірити ланцюг

Спершу read-only: actual host iframe/native identity, mission list, exact ID, locked/opt-in/completed flags, timer. Потім узгоджений QA-player opt-in: response → task/completion → Journey entry → popup render → action → grant. Read-only read не сертифікує решту.

Повторити на іншому користувачі, reload/reconnect, двох вкладках, logout/login, reset boundary. Нова спроба має залежати від server state, а не збереженого локального «used today». [QA](13-qa.md).

## Артефакт результату

Віддати mission inventory із ID/tasks/status, screenshots saved values/next runs, timezone table, записом changes, доказом read/opt-in окремо та невирішеними питаннями. Не залишати «готово», якщо перевірено тільки BO Preview.
