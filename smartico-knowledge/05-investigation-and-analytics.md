# 05. Investigation та правильне читання аналітики

## Метод: знайти перший розрив у ланцюжку

Не починай із випадкової зміни CRM settings. Зафіксуй очікувану поведінку, фактичну, product/ENV/brand, platform/build, test role, часовий інтервал і чинний config revision. Далі звіряй послідовність:

```text
product fact → Smartico event → rule/segment → projected state
→ client snapshot → UI decision → one sender
→ Journey entry/node → engagement/grant attempt → acknowledged result
```

Для кожного переходу потрібні timestamp, correlation key та sanitized evidence. Не копіюй credentials, user hash, raw profiles чи повні socket identify payload. У приватному investigation record достатньо ролі користувача, посилання на захищений trace та мінімальних полів, що доводять гіпотезу.

## Runbook: умова виконана, UI досі пропонує поповнити

1. Перевір approved transaction у продуктовому/CRM джерелі: amount, currency, status, event time.
2. Звір trigger event та rule/segment для правильного brand/ENV. Відрізни одиничний поріг від суми, поточний день від rolling period.
3. Перевір результат rule й server-side representation, якщо вона є. Label tag зі значенням контенту та JS marker у public props — різні об'єкти.
4. Перевір session identity, `getPublicProps` initial snapshot та наступні `props_change`. Відсутнє `core_public_tags` у partial update означає «поле не оновлювалось»; `[]` — отриманий порожній список; malformed тип — помилка контракту.
5. Звір UI mapping, freshness, logout guards і поточну mission/cycle. Не проси новий депозит, якщо первинний уже підтверджений.
6. Зістав час event → rule → marker → client → UI. Так відрізняється integration lag від загубленої підписки чи stale render.

Маршрути до фактів: [Query Builder](https://help.smartico.ai/welcome/products/crm-automation/segmentation/query-builder), [User markers](https://help.smartico.ai/welcome/products/tools-and-guides/user-markers-tags), [User profile properties](https://help.smartico.ai/welcome/technical-guides/data-integration/user-profile-properties).

## Runbook: повторна спроба не працює після очищення markers

Прочитай mission completion/opt-in поточного циклу, active Journey та history, entry caps, pending engagement і bonus state. Порівняй з описаною reset policy. Очищення одного projection не скидає решту систем. Не змінюй recurrence для всіх, щоб повторити один QA кейс. За відсутності підтвердженого user-scoped reset використовуй окрему тестову роль. [Місії та стан](02-missions-and-state.md#reset-для-повторного-qa).

## Runbook: popup пропускається, затримується або множиться

Відтворюй один click із зафіксованим часом; наступні clicks не додавай до з'ясування pending status. Перевір один sender, Journey entry mode, active instance, exact activity і delivery reason. Потім звір caps, delays, server retention, frontend queue, product suspension та renderer. Сценарій повернення з каси тестуй із focus/scroll cleanup і controlled rapid clicks. [Детальна карта](04-popups-and-routing.md).

Late failure може належати старій спробі, тоді як пізніший engagement уже показаний і clicked. Групуй за user/entry/engagement/activity/time, а не за рядком «Failed». Не підсумовуй retries як окремих втрачених гравців. Вимикання глобального queue або всіх caps не є діагностичним доказом причини.

## Runbook: бонус не видно або можливий дубль

Зістав click → connector → Give Bonus → issuance ID → external API result → product bonus state. Перевір mapping template/brand, eligibility, обмеження, pending/failed/redeemed status. Після timeout знайди фактичний result перед повторним grant. Для дубля порівняй IDs: один issuance retry чи два незалежних requests. Другий випадок потребує аналізу entry cap/concurrency, навіть за коректної API idempotency. [Journeys та винагороди](03-journeys-and-rewards.md).

## Live view, delivery log і Analytics відповідають на різні питання

| Рівень | Що можна стверджувати | Чого цього недостатньо довести |
|---|---|---|
| UI/DOM attribute | Елемент розмічено або натиснуто у тесті | Collector отримав production event |
| Journey node count | Flow пройшов node певну кількість разів | Стільки унікальних людей |
| Communication attempt | Була спроба доставки | Був impression або user loss |
| Impression/click | Зафіксовано engagement reporting | Partner bonus успішно виданий |
| Give Bonus branch | Досягнуто grant activity | Бонус доступний/використаний у продукті |
| Campaign conversion | Виконано налаштоване conversion rule | Саме promo спричинило цю дію |
| Attribution value | Модель розподілила credit | Доведено додатковий причинний дохід |

[Campaigns Dashboard](https://help.smartico.ai/welcome/products/bi-and-reporting/campaigns-dashboard) містить кілька різних зрізів учасників, communications і фінансових показників. Завжди читай legend конкретної вкладки. [Attribution value](https://help.smartico.ai/welcome/products/general-concepts/attribution-value) — окрема модель touchpoints і вікна; її суми не можна називати incremental revenue.

## Як знімати звіт

Перед числами зафіксуй:

- ENV/brand/campaign та список включених flows;
- extraction time, timezone, абсолютний start/end, чи поточний день включено;
- cumulative snapshot чи delta двох сумісних snapshots;
- одиницю: entries, users, attempts, impressions, clicks, grants;
- test users, control group, retries, pending branches та data freshness;
- conversion event/threshold/window, currency та model фінансового показника.

Кожний відсоток має явний знаменник: «risk серед тих, хто зробив вибір», «видані бонуси серед eligible entries» або «unique converted users серед unique participants». Різні знаменники не є взаємозамінними. Pending choices тримай окремо; їх не варто автоматично називати відмовою чи програшем.

Оголошена політика «один бонус користувачу» ще не перетворює суму Succeed nodes на unique recipients. Потрібні доведене enforcement або dedup за користувачем/видачею у ledger; окремо врахуй test accounts, compensation та retries. Також розрізняй campaign status Active, execution state і фактичну propagation збереженої зміни до runtime.

Якщо prerequisite deposit зроблено **до entry**, а conversion rule рахує deposit **після entry**, це різні події. Ні сума prerequisite deposits, ні conversion deposits самі не доводять приріст. Для оцінки ефекту потрібні коректний control/test design, зіставні вікна й перевірена методика. Налаштування control group описує [Event Driven Journey](https://help.smartico.ai/welcome/products/crm-automation/event-driven-journey); немає підстав оголошувати причинний ефект лише за красивою конверсією.

`Bonus Cost = 0` може означати відсутню або нульову cost configuration. Офіційний [Bonus Cost](https://help.smartico.ai/welcome/products/bi-and-reporting/bonus-cost) розрізняє configured cost/overrides та states, які входять у витрати. До перевірки не рахуй ROI, не називай акцію безкоштовною. Product bonus use та фактична фінансова собівартість можуть потребувати додаткового джерела.

## Як досліджувати нову можливість Smartico

1. Знайди розділ через [офіційний index](https://help.smartico.ai/welcome/llms.txt) та [наш каталог](SOURCES.md). Для module-specific правил відкрий окремий guide.
2. Перевір наявність capability у вашому tenant і role: доступ до меню, label flags, supported versions. Вендорська документація не доводить enabled feature.
3. Для frontend звір public API/type/source, для native — protocol і installed service, для server actions — приватний REST contract відповідального integration owner.
4. Спроєктуй мінімальний read-only або QA proof: потрібні дані, очікувані transitions, error case та критерій успіху.
5. Якщо потрібен Smartico support, підготуй конкретний запит: мета, scope, runtime, sanitized request/result, очікувана capability. Не передавай секрети у звичайний документ.

Публічна документація також описує [Smartico MCP Server](https://help.smartico.ai/welcome/technical-guides/mcp-server) для label-scoped entities, конфігурацій та data analysis. Це перспективний структурований маршрут investigation, коли він **реально підключений** і має потрібний доступ. Його наявність у docs не означає, що інструмент доступний у поточному чаті, або що будь-яка user operation/reset підтримується для вашого типу місії.
