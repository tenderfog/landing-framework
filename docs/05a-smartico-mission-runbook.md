# Налаштування Mission у Smartico BO

Процедура створення, зміни й аудиту mission-backed промо. Вибір механіки, типів recurrence, API/cache та reset пояснено в [missions/state KB](../smartico-knowledge/02-missions-and-state.md); тут фіксуємо дії й результат у BO. Меню/поля перевіряти у фактичному tenant, а activation виконувати в scope поточної задачі.

## Вхідні дані

Заповнений [Smartico blueprint](../templates/smartico-blueprint.md): ENV/Label/Brand, campaign key, visibility/audience, prerequisites, opt-in/task criterion, reward owner, start/exclusive end, timezone, recurrence, локалі та QA policy. Відсутній reward ID не замінювати випадковим Production bonus; дозволений QA placeholder не сертифікує production terms.

## 1. Знайти чинний об'єкт або створити Draft

1. Зафіксувати selected ENV/Label/Brand і доступи. У **Gamification → Missions** знайти campaign key/internal name й прочитати наявну mission/task та зв'язки перед edit.
2. Якщо потрібний новий об'єкт — **Create**, початковий status Draft. Записати ID, task IDs, status і source/readback без персональних даних. [Mission setup](https://help.smartico.ai/welcome/products/gamification-basics/missions/how-to-set-up-a-mission).
3. При clone звірити dates, audience, tasks, rewards і public texts. При правці чинного flow не створювати паралельну mission.

## 2. Тип, content, visibility та eligibility

Обрати тип за [таблицею mission models](../smartico-knowledge/02-missions-and-state.md#типи-місій-та-видимість). Назва demo не встановлює lifecycle. Заповнити internal name Latin, службовий description українською, player-facing content — за locale. Якщо Name публічне, не використовувати його як службовий QA key.

Увімкнути explicit opt-in, коли entry потребує активного вибору. Звірити visibility mission/task і server eligibility з approved business rule. Приховування з каталогу не означає locked або завершений стан. Для QA записати відмінну політику окремо; не оголошувати all users без перевірки actual label/audience.

Якщо missing prerequisite не має витрачати спробу, її preflight/інформаційний flow відбувається **до opt-in**. Server recheck лишається; [pattern](21-promo-patterns.md#2-prerequisite-перед-irreversible-entry).

## 3. Task і trigger chain

У **Add Task** визначити type, exact event/conditions, progress increment, count/sum/unique attribute, frequency/weight, points і task reward. Для entry-only mission із Journey-owned reward нульові points/task reward — допустиме рішення за spec, а не автоматичний default.

Якщо task завершують opt-in цієї mission, знайти actual event і exact mission ID. Якщо слухають Client Action — зареєстроване case-sensitive name/payload filters за [05c](05c-smartico-client-actions.md). Не додавати frontend complete action, коли opt-in уже достатній, і не дублювати ту саму винагороду в mission та Journey.

Записати й перевірити trace:

```text
User intent → sender/operation → observed event → task filter → completion → Journey entry
```

Якщо exact event невідомий, лишити Draft і знайти його в BO/current contract або sanitized QA trace; guessed event name не є реалізацією.

## 4. Backend schedule і readback

1. Ввести start/end у фактичній timezone BO; для «до N включно» у spec зберегти наступну локальну північ як exclusive end і перевірити semantics поля.
2. Налаштувати recurrence; time-to-complete не підміняє reset. Якщо BO має лише UTC/fixed offset, підготувати runs для всього campaign window із DST.
3. Відкрити **See next runs** або еквівалент: записати first availability, звичайний reset, runs до/після DST та фінальний run.
4. Save → re-open → звірити значення зі spec. Після зміни active schedule перевірити actual user cycle на boundary: countdown не доводить backend reset.

Active recurring mission може чекати першого scheduled run. Для QA дозволений окремий first run/cadence з before/after і фактичним відновленням schedule; мінімальний інтервал перевірити Save/validation, не вигадувати. Індивідуальний reset і додатковий run усій аудиторії мають різні наслідки — [reset policy](../smartico-knowledge/02-missions-and-state.md#reset-для-повторного-qa).

## 5. Activation та наскрізна перевірка

- Draft перечитано; dates, audience, rewards, task filters і first availability звірено.
- Mission ID потрапив у config потрібного ENV; [Journey](05b-smartico-journey-runbook.md) має exact trigger і готові assets.
- Відомі attempt-consumption point, grant owner, missing/hidden/error policy та дозволений QA/activation scope.
- Прочитано actual status-transition warning: Archive не використовується як тимчасова пауза без підтвердженої можливості відновлення.

Спочатку read-only перевірити actual identity, mission list/exact ID, lifecycle flags і timer. Потім погоджений QA opt-in: response → task/completion → Journey → popup/action → grant. Read-only read або BO Preview не сертифікує решту.

Виконати affected [state/reset/account-switch QA](13-qa.md), зафіксувати actual Web/App evidence. Результат: inventory ID/tasks/status, saved values/next runs, timezone table, diff before/after, докази read/opt-in/runtime й відкриті залежності.
