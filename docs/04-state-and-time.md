# Стани користувача, верифікація та календар повторної участі

## Registration і authentication — різні речі

Лендінг зазвичай знає trusted auth context, а не факт існування акаунта для анонімного відвідувача. Зареєстрований, але неавторизований користувач і новий відвідувач — обидва `guest` для eligibility/API. Не шукати акаунт за email і не читати cross-origin cookies. Product auth dispatcher обирає registration/login відповідно до свого flow.

## Базова матриця UI

Наведена матриця — reusable default для промо з eligibility та одноразовою спробою на цикл. Вигляд/color/copy звірити з дизайном акції. Mission і Client Action mode мають різні state sources, але ту саму чесну UX логіку.

| Дані/стан | Верхня CTA | Основні action controls | Підказка/таймер | Що виконуємо |
|---|---|---|---|---|
| Campaign config ще не готовий | приховано/disabled | приховано | skeleton/loading | тільки read/config |
| Новий незареєстрований guest | «Зареєструватись» або approved guest copy | клікабельні, якщо дизайн так задає | без mission cooldown | `event_action/auth`, не opt-in |
| Зареєстрований, але неавторизований | той самий guest flow; host може вибрати login | без доступу до participation API | без вигаданого статусу | auth modal через host |
| `hasAuth=true`, токен ще не надійшов | приховано | приховано, навіть до JS | loader «Завантажуємо стан…» | чекати trusted token; timeout → error |
| Авторизований, verification ще unknown/loading | приховано | приховано | loader | read profile/eligibility contract |
| Авторизований, явно unverified | «Верифікуватись» | можуть бути кольорові/клікабельні за дизайном | «Для участі пройди верифікацію.» | будь-який participation click → `event_action/verif`, без activation |
| Авторизований verified, mission/state ще unknown | приховано | приховано | loader | read current lifecycle |
| Verified, eligible, attempt available | approved CTA у кольорі активного стану за дизайном | активні; hover/pulse за motion rules | текст механіки | один mission opt-in АБО один Client Action |
| Activation pending, до UX timeout | disabled | тільки обраний control у центрі, повтор заблоковано | loader до configured duration | чекати/оновлювати read state |
| Activation uncertain після timeout | disabled | repeated activation заблоковано | «Перевіряємо стан спроби…», retry read | read/reconcile; не повторювати grant-команду автоматично |
| Attempt consumed, deadline відомий і майбутній | approved cooldown label | повернути на місця, disabled, gray, без pulse/hover | один синхронний countdown; tooltip/focus description | refresh біля reset/foreground |
| Таймер досяг нуля, сервер ще старий | disabled | без нового доступу | «Перевіряємо нову спробу…» | bounded refresh/backoff |
| Profile/SDK/API error | recoverable CTA лише retry read | participation disabled/hidden за дизайном | людське повідомлення без назви CRM/vendor | повторний read, не guest |
| Campaign ще не почалася | approved informational CTA | unavailable | дата початку | не activation |
| Campaign завершилася | ended state | unavailable | approved end copy, без fake tomorrow | не activation |
| User excluded/ineligible поза verification | approved reason/action | unavailable | тільки дозволений product copy | дія за business contract |

Неверифікований стан не тотожний disabled exhausted: перший дозволяє перехід на верифікацію, другий не запускає нічого. Tooltips не повинні бути єдиним способом побачити причину: countdown доступний на touch і для screen reader. Native disabled button не має focus; помістити пояснення поруч/на focusable wrapper, не знімати disabled тільки для tooltip.

## Дані верифікації

До реалізації отримати від product owner/frontend:

1. Endpoint або versioned host/native message із даними; auth mechanism, schema, CORS, timeout, localization.
2. Точну умову `verified`, інші eligibility критерії та authoritative server enforcement.
3. Як оновлювати після верифікації: foreground, token refresh, supported event, bounded poll.
4. Чи цей API приймає App token і чи доступний із WebView origin.

Не додавати `profile_info` у canonical bridge самостійно. Якщо host передає тільки token, можливий read-only product API з погодженим CORS. Записувати нормалізований статус, не зберігати повний profile.

Побудувати versioned verification adapter за затвердженими вимогами конкретного продукту. Він читає лише погоджені поля й нормалізує їх у `verified`, `unverified`, `unknown` або `error`; компоненти UI не знають raw API schema. Перевірка документів, контактів, обов’язкових лімітів та інших умов визначається приватним business/API контрактом і може відрізнятися між країнами та версіями. Не встановлювати універсальну KYC формулу й не підміняти одне поле іншим лише через схожу назву. У приватній integration-картці зафіксувати mapping, units/types, значення missing/error та авторитетне джерело кожної вимоги.

Boolean schema перевіряти строго: `true/false` або документовані `1/0`. String `"false"` не є truthy verified. Missing/null/error лишається unknown/error; не default verified. Frontend CTA gating не замінює backend/Journey eligibility.

## Auth lifecycle та гонки

- `auth=false` або trusted `token=null` → guest; non-null malformed token → error, а не guest.
- Не визначати успішний Smartico identify тільки за старим global boolean. Прив'язувати read до поточного session generation та identity.
- JWT decode може дати технічний ID лише коли його schema підтверджена; він не перевіряє підпис і не доводить eligibility. Краще product-issued context у підтриманому контракті.
- Новий user/logout: abort запити, очистити profile/mission/pending/selected/subscriptions/cache за scope, increment generation. Старі відповіді ігноруються.
- Новий token того самого user: оновити read credential, перечитати eligibility; не скинути click guard pending і не видати нову спробу.
- При periodic refresh не робити flash: валідний unverified/consumed UI може залишатися під час read. Після помилки eligibility fail closed за контрактом.
- Не прив'язувати verification refresh до видимості персонажа; його секція може бути поза viewport після закриття host modal.

## Mission state і Client Action state

Для місії нормалізувати фактичний current-cycle record: active dates, lock, requires opt-in, opted-in/completed та інші документовані fields. Не переносити всі raw flags у UI. Історичний `completed_today` із невідомою timezone не є current-cycle eligibility; майбутня recurrence date сама по собі не доводить, що свіжий цикл уже використано. Schema/units підтверджуються для вашої SDK/API версії.

Для Client Action немає автоматичного аналога mission availability. Потрібен product/Smartico read contract для current-cycle participation, eligibility, deadline та caps. Click у браузері/localStorage не є джерелом правди між devices. Без read contract можна доставити event, але не обіцяти точний cooldown чи повторну участь.

UI reducer може отримувати нормалізовані `auth`, `eligibility`, `attempt`, `campaign`, `pending`. Приклад pure helper — [state-time.mjs](../examples/state-time.mjs); production adapters отримують raw API із підтвердженої schema. Timeout не є сигналом «програш» або «показано popup».

## Calendar reset, не rolling 24 години

Розділити три параметри:

- **Campaign range:** останній дозволений локальний день включно = exclusive boundary на початку наступного локального дня. Конкретні дати беруться із затвердженої специфікації акції.
- **Reset policy:** календарна північ `Europe/Kyiv`, rolling interval, weekly або інший schedule.
- **Deadline source:** authoritative наступний reset сервера; або підтверджений календарний schedule + timestamp фактичного participation, якщо API не дає next-reset.

Неприпустимо при reload робити `now + 24h` або `nextMidnight(now)` для старого використаного record: так відлік відсунеться ще на день. Якщо цикл consumed, дедлайн прив'язаний до authoritative cycle/participation timestamp. Коли він у минулому — синхронізація, не нові 23 години.

Після дедлайну відновити CTA лише після свіжого available record. Врахувати TTL SDK/cache та backend processing; використовувати bounded retries із backoff, onUpdate/foreground, без нескінченного поллінгу кожну секунду. Верхній і нижній таймер читають одну модель дедлайну та одну clock function.

`Europe/Kyiv` використовувати як IANA timezone; ISO timestamps з explicit offset або epoch із підтвердженими units. Для сервера з лише UTC schedule перевірити DST: у Kyiv північ відповідає 21:00 UTC за літнього часу і 22:00 UTC за зимового. Під час зміни годинника календарний цикл може бути 23 або 25 годин. Виправлення frontend таймера не виправляє backend recurrence.

У QA перевіряти activation до midnight, доступ після midnight, неактивований новий день, reload/foreground, інший device/account та обидва DST переходи. Для clock skew потрібен server time/offset із погодженого read contract; browser clock не є authority для grant.

Практичні приклади: [config](../examples/campaign.config.json), [helper tests](../examples/check.mjs), [state template](../templates/state-matrix.md), [mission setup](05a-smartico-mission-runbook.md). [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) — primary API reference для timeZone/formatToParts.
