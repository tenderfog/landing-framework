# 03. Journeys, повторний вхід і винагороди

## Спочатку спроєктуй серверний flow

Опис механіки має відповідати на питання: яка подія запускає участь, коли вона вважається використаною, який результат зберігається, чи можна відновити незавершений вибір і хто видає бонус. Від цього залежить кількість Journeys. Один flow спрощує простежуваність; окремий інформаційний flow доречний, коли prerequisite ще не виконана й показ підказки не повинен споживати спробу. Не запускай mission opt-in «щоб просто відкрити депозитний popup».

Automation rule підходить для простого event → condition → action; Journey — коли потрібні очікування, вибір, комунікації й кілька кроків. Це рішення за поведінкою, а не вимога вмістити кожну акцію в одну схему. [Automation Rules](https://help.smartico.ai/welcome/products/crm-automation/automation-rules).

## Entry mode не є business cap

| Mode | Задокументована поведінка | Питання для вашої механіки |
|---|---|---|
| Once during open journey | Повторний вхід після завершення/зупинки/timeout поточного | Коли саме flow закривається? Чи не зависає pending? |
| Once in a lifetime | Один вхід користувача загалом | Чи має механіка повторюватись наступного дня? |
| Every time conditions are met | Можливі паралельні instances | Як захищені concurrent grant і повторна подія? |
| Stop and Start | Новий trigger завершує старий instance і запускає новий | Чи не втратиться незавершений вибір/видача? |

[Event Driven Journey](https://help.smartico.ai/welcome/products/crm-automation/event-driven-journey) визначає ці modes. Окремий per-user entries limit може залежати від label setting і використовувати calendar або rolling time. Activity period обмежує entry; explicit stop date та max duration мають інші наслідки. Не виводь «один раз на день» лише з Once during open journey. [Campaigns](https://help.smartico.ai/welcome/products/crm-automation/create-journey-flow).

Зупинка Journey не є транзакційним cancel зовнішнього Bonus API. Якщо request уже пішов у платформу, він може завершитись після нового entry. Тому reopen policy і retry policy проєктуються разом із reconciliation bonus status.

## Blueprint кожного кроку

| Поле | Що зафіксувати |
|---|---|
| Entry | Exact event/action, mission type/ID у приватному kit, payload filters |
| Audience | Brand, ENV, тестові обмеження, eligibility, excluded users |
| Branch | Умова, priority, else/default, ймовірність за наявності |
| Communication | Resource/variation, timeout, caps, delivery policy |
| Click | Exact rendered action та matched connector, close/Back semantics |
| Wait | Event, condition, deadline, success та timeout paths |
| Grant | Template mapping, amount/currency, owner, success/pending/failure |
| Completion | Що спожито, що записано, коли дозволений re-entry |

`Check User Profile` перевіряє поточні profile values; `Wait for Event` очікує нову подію з timeout. Не використовуй перше як нескінченне очікування другого. [Check User Profile](https://help.smartico.ai/welcome/products/crm-automation/activities-of-flows/activity-check-user-profile), [Wait for Event](https://help.smartico.ai/welcome/products/crm-automation/activities-of-flows/activity-wait-for-event).

Кожен outcome має завершений шлях: eligible/ineligible, win/loss, claim/risk, close, delivery failure, timeout, grant failure. Blank connector — не узгоджена бізнес-поведінка. Для branch probability перевіряй очікувану модель і достатність вибірки; невелике відхилення live-counts від пропорції саме по собі не доводить збій.

## Дії з markers не є atomic lock

Збережений офіційний матеріал `Activity: Update property, Mark user and JS markers`, повторно прочитаний під час цього оновлення, описує `Then` після Mark/UnMark/Set JS/Remove JS **до** збереження markers; після Update property — після запису. Live-сторінку 21.10.2026 прочитати інструментом не вдалося, тому цей факт має статус **перевірений історичний snapshot**, а не повторно підтверджена live behavior. [Джерело та статус](SOURCES.md#джерела-з-обмеженою-повторною-перевіркою).

Наслідок для дизайну: ланцюжок «прочитати marker → додати marker → Give Bonus» не доводить атомарність при двох instances. Короткий Delay може допомогти наступному кроку побачити запис, але не створює lock і не гарантує захисту від конкуренції. Потрібні server cap/унікальність участі та idempotent grant у підтриманому контракті. Не підміняй їх UI cooldown або claim marker.

Нова real-time rule не повинна мовчки трактуватись як historical backfill. Якщо право залежить від транзакцій до її активації, визнач окрему approved стратегію історичної перевірки та ідемпотентного застосування; спочатку read-only звір кількість і крайні кейси.

## Чотири різні підтвердження винагороди

1. Користувач обрав «забрати» — підтверджений click/action.
2. Flow дійшов до Give Bonus — підтверджений routing.
3. Partner Bonus API підтвердив видачу — підтверджений integration result.
4. Бонус доступний/активований/використаний у продукті — окремий product state.

Офіційний [Bonus API integration](https://help.smartico.ai/welcome/technical-guides/bonus-api-integration) розрізняє автоматичну видачу та claimable voucher; lifecycle включає New, Coupon Issued, Redeemed, Redeem Failed, Expired. `Redeemed` означає успішний partner API result у цьому контракті. Це не доказ використання гравцем і не універсальна назва всіх BO branch outcomes.

Документація вимагає idempotency за **`smartico_bonus_id`**: повтор того самого request не має повторно видати бонус. Але два окремі entries можуть створити два різні issuance IDs. Тому API retry idempotency не забезпечує «одна винагорода за campaign/cycle». Останнє — окремий business invariant з визначеним server owner.

## Ліміти перевіряються незалежно

- Entry cap: скільки участей/instances дозволено.
- Mission/task rule: коли прогрес та completion зараховуються.
- Communication caps: чи дозволено показати комунікацію.
- Bonus caps: чи дозволено видати винагороду.
- Product constraints: KYC, active bonus, withdrawal та інші правила саме платформи.

Приклад різних календарів: [Bonuses](https://help.smartico.ai/welcome/products/general-concepts/bonuses) описує daily limits у UTC. Це не автоматично календар daily mission у продуктовій timezone. Не обходь cap вимкненням усіх обмежень, якщо задача стосується лише інформаційної модалки.

Activity **Limit** у flow має глобальний ліміт проходжень, а не per-user cap. Його не можна використовувати як доказ «один бонус одному гравцю». [Activity: Limit](https://help.smartico.ai/welcome/products/crm-automation/activities-of-flows/activity-limit). Так само membership у періодично rebuild segment не є atomic admission lock.

Ручна компенсаційна видача може не виконати marker/update крок оригінального Journey. Спочатку підтвердь фактичний grant і ledger, потім синхронізуй потрібний UI/CRM projection у межах погодженого recovery. Відсутність marker не доводить, що бонус не видавався; не використовуй її як єдину підставу повторного grant.

## Перевірка після налаштування

Збережений flow перечитується з BO; звіряються triggers, links, resource variations, grant mapping та termination paths. Flow builder може автоматично зберігати зміни активної кампанії: read-only investigation не включає drag/drop, перепідключення connectors або пробне редагування. [Activities of Flows](https://help.smartico.ai/welcome/products/crm-automation/activities-of-flows).

Один позитивний тест у двох вкладках не доводить відсутність race: popup міг дублюватись одним engagement в обох tabs, а не двома незалежними entries. Потрібні correlation IDs, фактична кількість entries/issuances і контрольований concurrent сценарій. Після timeout спочатку reconcile стан; повторна відправка не є безпечною лише тому, що UI не дочекався відповіді.
