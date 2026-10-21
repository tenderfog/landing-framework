# Лендінг, продуктовий віджет і CRM popup: окремі процеси

Цей framework призначений для повторного проєктування промо у SlotCity, CatBet та нових продуктах. Спочатку обираємо поверхню і її host, потім механіку й transport. Подібний вигляд двох блоків не означає однакових інтеграцій. Спільну участь описуємо один раз у state/CRM contract; кожна поверхня отримує власні layout, lifecycle, delivery та QA.

## 1. Що саме будуємо

| Поверхня | Призначення та результат роботи | Власник контейнера | Основний процес |
|---|---|---|---|
| Промо-лендінг | Окрема сторінка з умовами, сценами, участю, іграми, FAQ | Product iframe або native WebView | Landing workflow нижче, [Vue/Nuxt standard](00-technical-stack.md) |
| Продуктовий inline-віджет | Компактний блок на головній, у lobby чи іншій сторінці; контекстна наступна дія | Сторінка продукту/CMS slot, іноді iframe | Widget workflow нижче, [widget brief](../templates/widget-brief.md) |
| Floating teaser / launcher | Вхід у промо поверх host UI, з контрольованими місцем, dismiss і частотою | Host shell | Widget workflow плюс overlay/collision policy |
| Smartico popup | Повідомлення, результат або вибір, доставлений CRM | Smartico session і Web/native popup host | [Knowledge base](../smartico-knowledge/README.md), [popup routing](06-smartico-popup-templates.md) |
| Smartico Gamification / Vibe Studio Widget | Власний vendor module, не довільний продуктовий віджет | Підтверджена SDK/Vibe інтеграція | Актуальні vendor docs і capability profile; [каталог](../smartico-knowledge/SOURCES.md) |

Термін «віджет» уточнюємо до початку реалізації: teaser, інтерактивна участь, CRM overlay чи Smartico module. Обмеження документованого vendor module, наприклад його auth prerequisites, не поширюються автоматично на наш компактний блок для гостя.

Новий продуктовий landing зберігає стандарт Vue 3 + Nuxt 4. Компонент у вже наявному frontend продукту використовує його стек і контракти; не монтуємо другий Nuxt application у slot без потреби. Окремий iframe-віджет має власний entry/build і узгоджений delivery contract. Наявність у Smartico власного конструктора landings не змінює автоматично стандарт нашого продукту.

## 2. Що можна розділяти між поверхнями

| Спільний контракт | Що залишається окремим |
|---|---|
| Campaign key, schedule/timezone, eligibility, cycle, server limits | Entry URL/slot, host platform, viewport і scroll |
| Нормалізація participation state, freshness та account change | Presentation loading/error/compact copy |
| Бізнес-намір CTA, підтверджений action registry | Label/icon/position й analytics `placement` |
| Backend grant, Journey/action semantics | Popup delivery lifecycle і локальний pending guard |
| Content keys та правдивість умов | Кількість тексту, hierarchy, responsive artwork |
| Перевірені pure helpers/config | Host transport, subscriptions, mount/unmount |

Одна модель стану означає однакове трактування фактів. Це не дозвіл читати стан іншого iframe або вводити undocumented global store. Узгоджені snapshots можуть надходити з різних adapter implementations. Якщо landing і widget відкриті одночасно, серверні caps/idempotency мають витримувати їх одночасні кліки; локальний disabled button захищає лише свій instance.

## 3. Процес проєктування лендінгу

1. **Механіка і джерела.** Заповнити [brief](../templates/project-brief.md), [product profile](../templates/product-profile.md) та [integration contract](../templates/integration-contract.md). Підтвердити продукт, ENV, surfaces, start/exclusive end, timezone, eligibility, повторення, outcome/grant ownership. Нова механіка без затверджених правил залишається discovery, навіть якщо її вже можна намалювати.
2. **User journeys і states.** Описати guest, unknown, unverified, missing prerequisite, available, request pending, consumed, stale/error, not-started/ended. Для кожного: повідомлення, CTA, authoritative input і recovery. Усі entry points, включно з artwork і повторним CTA нижче, користуються тією самою моделлю.
3. **Вертикальна інтеграція.** До дорогої анімації пройти на тестовому контурі identity → fresh state → одна дія → server decision → popup/response → authoritative next state. Mock підтверджує лише UI. Відсутня capability стає окремим запитом до host/backend із fallback, а не удаваним API.
4. **Інформаційна архітектура.** Hero пояснює пропозицію і наступний крок; блок участі — поточну доступність; умови й FAQ — обмеження; ігри та bonus links — затверджені destinations. Декоративна сцена не є другим engine участі.
5. **Дизайн і реалізація.** Figma/brand tokens, desktop/mobile/intermediate states, найдовша locale, media budgets, motion/fallback, a11y. Content, adapter й presentation розділені за відповідальністю; не створювати окремі абстракції без реального другого споживача.
6. **Перевірка й delivery.** Local build/subpath → actual host → Web/App evidence → окреме збереження CRM → Stage smoke → дозволений release. [QA](13-qa.md), [release](14-release-and-cache.md).

Ready landing має reviewable artifact, зрозумілу поведінку всіх states, працюючі підтримані transitions і явні integration gaps. Гарний screenshot сам не доводить готовність участі.

## 4. Процес проєктування віджета

### 4.1. Вибрати одну основну роль

| Роль | Приклад наміру | Потрібні інтеграції |
|---|---|---|
| Інформаційний teaser | Пояснити пропозицію й відкрити landing | Content/schedule, supported navigation, impression/click |
| Контекстний статус | Показати next step або countdown | Trusted identity + authoritative state/freshness |
| Пряма участь | Зробити ту саму погоджену дію без заходу на landing | Повний participation contract, popup owner, caps, recovery |
| Продовження | Повернутися до вже початого стану | Підтверджене відновлення server context; не replay entry event |

Перехід у landing не зараховує участь. Пряма участь із widget не повинна створювати додатковий шанс чи інший grant flow. Якщо host підтримує лише navigation, достатній teaser із переходом; інший інтерактивний сценарій потребує capability work.

**Stateless teaser не потребує SDK, профілю, місії чи повної participation state matrix**, якщо його контент/CTA не залежать від них. Для нього достатні display schedule, navigation/loading-error asset fallback, placement/analytics і host lifecycle. Таблиця бізнес-станів нижче застосовується до stateful widget. Не підключати user data лише заради однакової архітектури з інтерактивним landing.

### 4.2. Описати placement contract

Заповнити [widget brief](../templates/widget-brief.md): CMS slot/host route, inline/floating, component/iframe, available width і height policy, mount conditions, insertion order, lifetime, display schedule, dismiss storage policy, localization, доступність й platform owner. Вказати, чи header/footer/cashier/consent/bottom navigation можуть перекривати widget, хто керує z-index/safe-area, і як поводитися при зміні ширини.

Розмір визначає **контейнер**, а не лише browser viewport. Desktop layout може опинитися у вузькій колонці. Перевіряти narrow slot, tablet, short landscape, text scaling і довгу locale. При iframe спершу встановити scroll/height owner: compact fixed-ratio block і long-scroll landing мають різні правила. `min-height:100vh` не є універсальним widget sizing.

Для iframe передбачити безпечну початкову висоту до вимірювання root, потім передавати підтриманим каналом числову фактичну висоту при grow **і shrink**, включно зі зміною breakpoint. Reserved dimensions зменшують стрибки. Окремо визначити background самого iframe canvas, widget і artwork, owner border-radius/clipping; прозорий art не виправляє непрозорий canvas або обрізаний shadow у host.

Клікабельна ціла card з одним navigation intent має semantic link і supported event-action fallback для modified click/standalone. Не вкладати кнопки в anchor й не відбирати keyboard interaction декоративним overlay. Якщо є кілька різних controls, у кожного власна semantic hit area та чітка дія.

### 4.3. Компактна state matrix

| Факт | Потрібна поведінка |
|---|---|
| Guest підтверджений host | Зрозуміла guest CTA за approved auth/navigation contract |
| Identity/eligibility/mission ще невідомі | Стабільний loading shell без удаваної доступності |
| Не виконано prerequisite | Одна зрозуміла наступна дія; не дублювати великий FAQ |
| Available | Узгоджений entry або перехід; одна дія на клік |
| Request pending / delivery невідома | Блокування дублів; підказка й bounded reread |
| Attempt consumed | Чесний статус/next reset; без активного participation pulse |
| Ended або placement unavailable | Approved ended/hidden/fallback policy; без порожнього провалу layout |
| Error або snapshot застарів | Recovery за контрактом; не прирівнювати до guest чи available |

Зменшення тексту не змінює механіку. Якщо точні умови не поміщаються, дати зрозумілий перехід до повних правил; не приховувати обмеження, без якого CTA вводить в оману.

### 4.4. Lifecycle і продуктивність

Host/CMS може багато разів вставляти блок під час SPA navigation. Потрібні idempotent mount, один handler/subscription на instance, cleanup на unmount, скидання user state при logout/account change. Повторне монтування не запускає participation, grant або новий глобальний SDK.

Не запускати окремий poller для кожного однакового widget. Reuse session/provider у межах підтриманого host contract; кеш містить identity/ENV/campaign/cycle/freshness, а stale responses від попереднього account не застосовуються. Background/resume, повернення з каси й відновлення мережі запускають дозволений refresh, не автоматичний opt-in.

Повторювані decorative loops зупиняються offscreen/hidden, мають reduced-motion variant. CTA й основний текст доступні до анімації. На головній widget не може забирати непропорційний JS/GPU/network budget у продукту; вимірюємо внесок блока в реальному host.

### 4.5. QA віджета

Перевірити реальний slot, не лише standalone preview: один і кілька instances; повторний mount/unmount; SPA route change; guest→login→logout→інший account; host overlays і повернення з каси; simultaneous landing/widget actions; slow state; expiry/reset; long locale; keyboard/focus; reduced motion; scroll/height; network/CPU у hidden/offscreen.

Impression означає agreed видимість у host. Render у прихованому CMS slot або viewport розтягнутого child iframe не доводить показ користувачу. Analytics додає `placement`/surface за [контрактом](12-analytics.md); click і server outcome залишаються різними подіями.

## 5. Готовність до повторного використання

Пакет нової акції містить один business/CRM contract, окремий brief кожної поверхні, підтверджений product profile, state/action matrices, configurable public content/assets, meaningful tests, release evidence й перелік Unknown. При перенесенні між брендами змінюються не лише логотип і кольори: перевіряються auth/profile schema, origins, SDK/session, action registry, rewards, timezone, локалі, native builds і CI.

Наступний крок: [профілі продуктів та investigate workflow](20-product-profiles-and-investigation.md), [Smartico knowledge base](../smartico-knowledge/README.md).
