# Повторювані механіки промо та умови безпечного reuse

Це узагальнення design/debugging досвіду, а не готова механіка наступної акції. Параметри, rewards, ймовірності, критерії та строки завжди беруться з її правил. Для Smartico fields/API звернутися до [актуальної KB](../smartico-knowledge/README.md); для багів — до [каталогу інцидентів](22-incidents-and-popup-cleanup.md).

## 1. Вибрати pattern за наслідком дії

| Потреба | Рекомендована структура | Критична умова |
|---|---|---|
| Лише запросити до акції | Stateless teaser → supported product navigation | Немає opt-in/grant на render чи navigation |
| Показати передумову, яка ще не виконана | Read eligibility → local info або окремий informational CRM flow | Не витрачає участь, не має reward activities |
| Одна спроба за календарний цикл | Mission-backed entry або підтверджений server cap | Fresh current-cycle state + server enforcement |
| Серверний вибір/кілька раундів | Один core Journey з взаємовиключними branches | Outcome/server state не генерує UI |
| Choice у popup | Exact engagement controls → відповідний branch | Збереження pending context і close-original semantics |
| Інший placement тієї самої участі | Shared state contract + existing adapter | Два UI не дають два дозволи; server concurrency guard |
| Повторний запуск за named action без mission | Client Action → Journey + authoritative state provider | Сам факт `.action()` не дає ACK/attempt state |

Не обов'язково будувати всі patterns. Мінімальний обраний flow має повний бізнес-наслідок і recovery, а зайві модулі не створюються про запас.

## 2. Prerequisite перед irreversible entry

Спочатку визначити, **яка операція витрачає спробу**: mission opt-in/completion, прийнятий Client Action, створений server attempt або інший факт. Якщо missing prerequisite не має витрачати шанс, його UI preflight відбувається до цієї операції.

```text
trusted identity
 → fresh verification/prerequisite state
 → unknown/error: loading або recoverable read error
 → prerequisite false: пояснення + supported next step, без участі
 → prerequisite true: одна entry operation
 → server повторно перевіряє умови/caps
 → result/choice/grant або пояснений відмовлений стан
```

Preflight не є атомарною гарантією: між read і entry право може змінитися. Сервер визначає admission і policy для rejected/uncertain operation. Не обіцяти повернення вже витраченої recurring-спроби лише тому, що informational popup закрито.

### Формалізувати бізнес-умову

«Мінімальний депозит» може означати один qualifying event або суму кількох. До реалізації зафіксувати: minimum, currency/units, approved status, event time range, timezone, inclusive/exclusive boundaries, одноразовість на campaign чи на день, історичні події, reversals/refunds, expiry та source owner. Counter за весь час не замінює event у campaign window. Закриття каси не доводить approved deposit.

### Інформаційний flow

Проста підказка може бути локальною modal без CRM. Якщо потрібні CRM content/delivery/segmentation, окремий короткий Client Action Journey має власний lifecycle, re-entry та dedup. У ньому немає core mission opt-in, random split, grant або запису використаної спроби.

Це сумісно з одним core reward Journey: різні наслідки рознесені, а послідовні результати **однієї** спроби лишаються разом. Не розділяти reward/loss на незалежні конкурентні кампанії заради зручної верстки.

## 3. Eligibility projection і freshness

Для derived eligibility скласти mapping: source event → producer → matching rule → server condition → public projection → UI reader → lifetime/revoke policy. Формалізація qualifying event належить campaign brief, CRM mapping — blueprint, transport/schema — integration contract.

Повний snapshot, partial patch, cache й subscription semantics описані в [State KB](../smartico-knowledge/02-missions-and-state.md). Для затримки пройти [investigation chain](../smartico-knowledge/05-investigation-and-analytics.md), не пропонувати новий депозит лише через старий UI. У pattern важливі два UX рішення: revalidation не перебудовує кнопку посеред gesture, а повернення з каси запускає read, не replay entry. [State UI](04-state-and-time.md), [bug evidence](22-incidents-and-popup-cleanup.md).

## 4. Realtime, backfill і environment isolation

Нова realtime rule і обробка історичних подій — окремі задачі. Перед historical backfill визначити window/cutover, точну аудиторію, очікувану кількість, read-only preview, зміни user state, downstream наслідки та authorization scope. Назва QA не означає, що там немає реальних/дзеркальних профілів.

External user IDs можуть збігатися між Stage/Production. Ізоляція перевіряється через ENV/Label/Brand, source event routing, marker namespace, mission/action/Journey map, origins і rewards. Clone config не повинен переносити production user-state mutations.

Для зміни future-only policy іноді достатньо нового versioned marker namespace/cutover. Це не універсальне правило naming. Масове очищення попередніх markers може пошкодити інші сценарії; спочатку перевірити dependency/ownership. Backfill не вважається автоматично дозволеним самим формулюванням «врахувати депозит за період».

## 5. Які обмеження потрібні pattern

Для обраного flow окремо заповнити local pending policy, Journey re-entry, mission/attempt cap, communication policy і reward idempotency/business cap. Вони не замінюють одне одного; точні відмінності, marker races та `smartico_bonus_id` — у [Journey KB](../smartico-knowledge/03-journeys-and-rewards.md).

Composition check: pending до півночі → claim після reset → новий entry. Визначити, чи cap рахується за cycle спроби або фактичним днем видачі, що робити з pending/failed і який server механізм забезпечує атомарність. Відповідь записується в blueprint; браузерний guard цього не гарантує.

## 6. Informational popup без накопичення запитів

Для підказки без reward потрібні один sender, finite pending/expiry і явний момент завершення request. Розглядати Once during open journey та завершення на SDK-reported Impression/Failed можна лише після перевірки actual activity contract. Impression не доводить visible content або user close; якщо flow завершився до закриття popup, повторний entry знову можливий.

Queue/login delays/CAPs/suppression та candidate pattern обмеження описані в [Popup KB](../smartico-knowledge/04-popups-and-routing.md), фактичне збереження й неповний end-to-end proof — у [incident catalog](22-incidents-and-popup-cleanup.md). Не переносити цей lifecycle на reward Journey або додавати permanent latch без supported recovery.

Acceptance цього recipe: клік → каса → повернення → повторні кліки → foreground/wait → фактична кількість popup/entries. Saved BO settings не замінюють цей тест.

## 7. Повторне QA без зміни механіки

Спочатку визначити, що саме заважає повтору: marker, mission/cycle, open Journey, pending engagement чи вже виданий bonus. Це незалежні lifecycle — [State KB/reset](../smartico-knowledge/02-missions-and-state.md#reset-для-повторного-qa).

Для recipe використати dedicated test role або підтриманий reset потрібного scope. Додатковий recurring run для всіх може дати extra attempt, а не очистити один account. Якщо cadence змінювали, разом відновити server schedule, open-Journey bounds і UI deadline та зберегти readback. Мінімальний інтервал підтверджується фактичним Save/validation, не довільним countdown.

## 8. Display metadata не дорівнює бізнес-доступності

Mission може бути прихована з vendor catalog/custom section й усе ще використовуватися за API за явно підтриманим contract. Hidden placement metadata, locked eligibility та ended schedule — різні факти. Перевірити, хто читає custom-section/Additional fields; не оголошувати product-specific значення reserved vendor прапорцем.

Display name/copy не є stable entity key. Section associations, games/rewards і filters зв'язуються через підтверджені IDs/keys. Public-facing name не містить службового QA/internal тексту лише для зручності команди.

## 9. Перед перенесенням pattern у наступне промо

- Перевірити **актуальний source**: legacy prototypes, старі setup notes і deployed application можуть співіснувати. Знайти manifest/build entry, generated artifact, served revision і чинний CRM object; не копіювати перший знайдений `app.js`.
- Зіставити product capability profile; не переносити branded origins, action names, tenant entities, rewards або current SDK assumptions.
- Зафіксувати prerequisites/consumption point/state ownership; одна user action не створює два business triggers.
- Зіставити graph semantic roles і фактичні target entities. Зміна Body не виправляє wrong connector, а новий Journey не оновлює landing config.
- Пройти failure/concurrency/reset/account-switch сценарії й зберегти окремі Web/App докази. Не називати reproduction механізму підтвердженням початкового production root cause.

Шаблони: [brief](../templates/project-brief.md), [Smartico blueprint](../templates/smartico-blueprint.md), [state matrix](../templates/state-matrix.md), [investigation](../templates/investigation-record.md).

## 10. Довгий інтерактивний landing зі сценами

Pattern доречний, коли досвід складається з послідовності керованих сцен, а не звичайного довгого document scroll. Він не зобов'язує робити сценовою кожну наступну акцію. Окремо визначити, чи проходження є лише презентацією, чи передумовою винагороди. В останньому випадку server admission не може покладатися тільки на client step index, scroll або декоративний фінал.

| Рішення до коду | Що зафіксувати | Чому це прискорює реалізацію |
|---|---|---|
| Цільова тривалість | Активний/пасивний час, типова частота intentional input, кількість змістовних кроків | Не підмінюємо потрібний traversal time довгою анімацією кожного кроку |
| Модель навігації | Active step, accepted gesture, direction/reverse/cancel, start/end boundaries | Одна логіка для wheel/trackpad/touch/keyboard замість набору debounce patches |
| Візуальний прогрес | Step→content mapping, reveal і transition timing | Presentation не вирішує, чи прийнятий input або чи витрачена спроба |
| Resource model | Bounded active DOM/scenes, image/sprite/context reuse, preload radius | Велика кількість кроків не створює стільки ж canvas/video/SDK instances |
| Повернення до звичайної сторінки | Природний FAQ/conditions scroll і напрям повернення | Scene controller не захоплює всі input поза своєю областю |
| Зміна auth/business state | Same-user refresh, error, eligibility change, identity switch | Зміна CTA не перебудовує весь досвід і не втрачає позицію |

Розділити clocks: **input acceptance**, **transition**, **reveal/decorative animation**, **sound** і **business request**. Один intentional gesture дає один погоджений крок; trackpad inertia не перетворюється на серію нових намірів. Водночас blanket тривалий debounce не повинен робити наступний intentional gesture «непрацюючим». Політику довести на реальних input devices, включно з reverse, cancel і швидким новим жестом.

Active state має stable content keys і межі. Тимчасова API-помилка або короткий loading не скорочує scene list так, що current index автоматично перескакує на початок. Зберігати підтверджену geometry/позицію same-user, показувати status/error і блокувати лише ризикові business actions. Logout/інший account скидає user-dependent state за окремою явною policy.

Controls мають одного positioning owner у межах scene container, з урахуванням actual host header/viewport contract. Перехід у FAQ/умови віддає natural scroll правильному owner; після повернення не лишаються old observers, overflow locks або невидимі hit overlays. Локальна info modal зберігає scene progress і правильно відновлює focus.

Для QA окремо перевірити mouse wheel, inertial trackpad, touch і keyboard; перший input після iframe focus; hidden/foreground; slow assets; reduced motion; low-height viewport; long locale; error→retry; popup/cashier return; final scene→FAQ→back. DOM markers сцен з'являються за agreed visibility, а preview/jump і client index не оголошуються підтвердженою участю чи grant.
