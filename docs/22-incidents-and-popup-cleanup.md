# Інциденти, переналаштування й очищення Smartico popup

Цей посібник узагальнює досвід кількох реалізацій: що перевіряти, коли промо або popup працює нестабільно, як виправляти причину та як прибирати зайвий код без втрати потрібної поведінки. Приклади не задають дати, ідентифікатори, розміри нагород або налаштування наступної акції.

Для нового popup спочатку перевірити актуальний authoring mode: [офіційна документація](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/pop-up) рекомендує Vibe Studio, а наявні Configuration/Body templates залишаються окремим legacy сценарієм. Правила про `tmpl`, delimiters і template compiler нижче стосуються саме підтримуваного template runtime. Оновлення framework не вимагає міграції чинної кампанії.

Пов'язані матеріали: [пошук причини за симптомом](15-troubleshooting.md), [popup runbook](06-smartico-popup-templates.md), [Smartico knowledge base](../smartico-knowledge/README.md), [профіль продукту й investigation](20-product-profiles-and-investigation.md), [запис дослідження](../templates/investigation-record.md).

## 1. Спочатку знайти етап, на якому зупинився сценарій

Одна видима проблема може мати кілька незалежних причин. «Чорний popup», «не працює кнопка» і «немає бонусу» недостатні для вибору виправлення.

```text
Намір користувача
 → підтриманий sender
 → подія отримана / mission opt-in прийнятий
 → Journey admission
 → потрібна activity
 → communication admission
 → delivery / queue
 → wrapper і compiler
 → DOM та ресурси
 → фактична видимість
 → взаємодія
 → engagement click / named action
 → потрібний connector
 → бонусний запит / відповідь
 → стан нагороди в продукті
 → навігація
 → оновлена проєкція стану в UI
```

Це діагностична модель, не універсальний список Smartico event names. Конкретні acknowledgment, поля й доступні журнали беруться з чинного integration contract.

Для кожного переходу записати: що очікуємо побачити, де це перевіряється, хто володіє етапом, фактичний час і версію. Не переносити токени, user hash, cookies або повні профілі до журналу. Один успішний етап не підтверджує наступний: impression не доводить читабельний DOM, клік не доводить grant, позитивна API-відповідь не завжди доводить появу бонусу в потрібному продуктовому стані.

### Ступені впевненості

| Позначка | Достатній доказ | Межа |
|---|---|---|
| Відтворено | Контрольований сценарій відтворює симптом і різницю до/після | Поширюється на перевірені source/runtime/params |
| Збережено | Фактичні BO значення перечитані після save/reload | Не доводить runtime delivery або результат користувача |
| Перевірено в браузері | Фактичний iframe/context, loaded build і сценарій перевірено | Не замінює фізичний Safari чи native WebView |
| Повідомлено | Є звіт користувача, QA або розробника | Без потрібного trace причина може лишатися гіпотезою |
| Потребує перевірки | Є кандидат зміни або неповний proof | Не називаємо інцидент закритим |

Позитивний compiler test та негативний фізичний тест можуть бути одночасно правильними: вони перевіряють різні етапи.

## 2. Popup: рендер, template runtime і зайві залежності

### 2.1. Підкладка є, контенту немає

У досвіді інтеграцій траплялися два **різні** механізми template failure.

| Механізм | Що відтворено | Виправлення | Чого це не доводить |
|---|---|---|---|
| Literal CSS випадково містить `%}` | Фрагмент на кшталт `height:100%}` порушував компіляцію фактичним template engine до присвоєння `innerHTML` | Delimiter-safe literal CSS; compiler check після остаточної мініфікації | Не встановлює причину конкретної старої App-доставки, якщо її exact Body не отримано |
| Великий початковий template code block у JavaScriptCore | На перевіреному Body і pinned vendor compiler JavaScriptCore залишав закривальний token у згенерованому JS; V8 цей Body компілював | Мінімальне розділення великого блоку на суміжні template blocks; порівняння згенерованого HTML у двох engine families | Не доводить відсутності інших фізичних iOS проблем після compilation |

Для другого випадку контрольований кандидат додавав лише п'ять символів — межу `%}{%` і переведення рядка перед конкретним фрагментом побудови script. Шість payload cases у JavaScriptCore дали результат, байт у байт однаковий із V8. Це **регресійний приклад**, а не правило вставляти таку межу в кожний popup чи обмежувати всі blocks вигаданим maximum size.

Порядок дослідження:

1. Знайти **точний доставлений** Body та params, wrapper і compiler version; відокремити їх від локального source і поточного BO export.
2. У контексті самого popup перевірити наявність root, його дочірніх елементів, `tmpl`, vendor action handlers, runtime errors і фактичних script URLs.
3. Запустити той самий compiler шляхом `tmpl('_template', params)`, з реальною template DOM assembly. Ручна підстановка рядків не перевіряє цей шлях.
4. Розділити compile failure, DOM fill, CSS geometry, невидимість через opacity/overlay, asset/CSP/font errors. Не починати зі зміни socket або native renderer, якщо handshake уже підтверджено.
5. Порівняти підтримувані engine families. Desktop Chrome pass недостатній для JavaScriptCore; локальний JavaScriptCore pass недостатній для фізичної інтеграції з її CSP і lifecycle.
6. Після виправлення отримати збережений BO Body і **свіжу доставку**. Старий відкритий popup може продовжувати виконувати попередній код.

Якщо exact старий failing Body відсутній, чесний висновок: «Механізм відтворено й кандидат перевірено; причина початкового доставленого popup окремо не доведена».

### 2.2. Fixture має зберігати поведінку SDK

Корисний local fixture відтворює фактичну vendor assembly: wrapper, template element, `window.onload`, compiler і штатне підключення action handlers. Snapshot має checksum/версію; повний SDK не потрібно довільно запускати поза його інтеграцією.

Не підміняти vendor `tmpl`, onload або action attachment власним «простішим» renderer, щоб отримати зелений тест. Такий тест може втратити саме помилку продуктового сценарію.

Fixture окремо документує відсутні складові: product CSP, identified session, parent SDK, Journey, grant endpoint, native presentation. Локальний logger deep links підтверджує тільки намір відправлення. Спостерігач, підключений після load, може пропустити ранню помилку; її додатково читають у DevTools потрібного frame. Відсутність застарілого `script.readyState` сама по собі не є помилкою завантаження.

### 2.3. Body завеликий і залежить від непотрібного JS

У знеособлених реалізаціях виміряно:

| До зміни | Після зміни | Що прибрали | Що лишилося окремо перевіряти |
|---|---|---|---|
| Body 367 333 bytes | 15 748 bytes; пізніше приблизно 17,4 KB після додавання станів і HTML markers | Embedded base64 arts/fonts, перенесені в зовнішні ресурси | Обсяг зовнішніх ресурсів, CORS, cache, compilation і реальна доставка |
| Body 65 921 bytes | 24 787 bytes | Base64 fonts, template-time JS assembly через `function.toString()`, старі Stage/Figma/landing fallback chains | Фізична нестабільність Safari не доведена вирішеною самим зменшенням Body |
| Програмний analytics producer у popup | 0 bytes producer після переходу на затверджені DOM markers | Непотрібні factory/bootstrap/callback paths для відкинутого способу збору | Реальний collector і destination receipt лишилися окремою інтеграцією |

Ці числа пояснюють ефект конкретних змін; вони не є universal performance budget. Малий HTML може завантажувати великі картинки, а невеликий стиснений sprite — займати значну decoded memory.

Очищення має залишати core content видимим без декоративної анімації та, де це передбачено, без custom fonts/scripts. Штатний action hook не повинен залежати від завершення ефекту. Потрібні fallback перевірки з blocked font, помилкою custom JS, slow/failed image і вимкненою анімацією.

Брендований SVG heading допустимий для точно затвердженого короткого арту, якщо є доступний HTML fallback і зміна тексту не лишає старе зображення. Це не універсальна заміна живих локалізованих текстів, descriptions або CTA.

### 2.4. Вкладений script і delimiters

У деяких legacy wrappers Body знаходиться всередині `<script type="text/x-tmpl">`. Буквальний closing script tag у source може достроково завершити цей зовнішній raw-text element **до** виконання template engine. Застосовувати лише перевірене template-safe складання; у контрольованому прикладі closing tag генерувався expression після compilation.

Перевіряти source і rendered output окремо:

- у literal CSS/HTML/JS немає випадкових `{% / %}`;
- escaping не руйнує справжні template expressions;
- outer template element не закривається завчасно;
- rendered output має потрібну кількість scripts;
- тексти з HTML, quotes і closing-script-послідовностями безпечно екрануються;
- виправлення не змінює approved content/actions.

Глобальна replace по готовому Body без розбору literal та template blocks може зруйнувати робочі expressions. Патчувати місце генерації, потім перевіряти кінцевий артефакт.

### 2.5. Fullscreen і обрізання

Симптом «popup маленький» може походити від outer iframe/WebView, centered wrapper, fit-scale або самого creative. Scoped CSS одного template може виправити observed wrapper shrink-wrap/zoom, але `100vw` і великий `z-index` не розширять його outer host.

Перевіряти три рівні: outer bounds → wrapper geometry → content. Не змінювати глобальні site body styles через creative. Довгий контент, short landscape, safe areas, keyboard і text scaling потребують доступного scroll; один screenshot стандартного телефону цього не підтверджує.

## 3. Кнопки, хрестик і штатні обробники

### 3.1. Видима кнопка натискається лише в невеликій ділянці

У складних CTA проблему створювали декоративні зображення, transforms, animation layers і нестача семантичної hit area.

| Перевірка | Безпечна зміна | Доказ |
|---|---|---|
| `elementFromPoint` на видимому краї, тексті, центрі й під час анімації | Весь видимий CTA — підтриманий vendor link/button; decorative descendants не перехоплюють pointer events | Реальні click/tap у різних точках, keyboard activation і correct action report |
| Callback є локально, але Smartico Click не з'являється | Перевірити vendor handler, supported attributes та event propagation | Sender/engagement trace, а не лише console log власного handler |
| X/backdrop працює, primary не працює | Досліджувати відмінний action path primary | Не списувати одразу на bonus або navigation, якщо primary click не дійшов |

Точний element/hook береться з чинного authoring/runtime contract. Не замінювати підтриманий vendor button універсальним самописним div із click+touch listeners.

### 3.2. Перший tap блокує всі наступні

Тут досвід різних реалізацій **не можна** звести до правила «завжди додавай permanent click guard».

- У одному template невеликий guard пропускав перший click до штатного Smartico delegation, блокуючи повторні mixed clicks.
- В іншому custom click latch спрацьовував **до прийняття vendor handler**, використовував `stopImmediatePropagation` і залишав усі controls заблокованими, хоча Smartico Click не отримав. Власний click interception і timer cleanup прибрали, зберігши native button contract та keyboard behavior.
- Локальні Chrome/Safari fixtures після зміни працювали; фізичний Safari згодом ще повідомляв про failure. Отже, власний блокуючий код виправили, але весь фізичний дефект не був незалежно закритий.

Вибір guard policy залежить від supported acknowledgment і business contract. Якщо підтвердження прийняття немає, permanent local lock може забрати можливість повторити дію. Разом з тим blind retry може повторити grant. Потрібні state reconciliation, supported retry behavior і **серверна** idempotency/cap; сам JS latch її не створює.

Під час review шукати:

1. Два senders: vendor `href`/hook і паралельний `onclick _smartico.dp()`.
2. Дублювання click та touch як двох бізнес-дій.
3. Capture listeners, що блокують **перший** accepted event.
4. Dead branches, timers і observers від попереднього способу взаємодії.
5. Handler, який після нового render підключається вдруге.
6. Закриття overlay або зняття scroll-lock, що очікує інший тип вікна.

Не видаляти validation або server safeguards заради простішого click handler.

### 3.3. Діагностика може змінити поведінку

При intermittent touch failure тимчасово збирали category counters `touchstart/touchend/click`, hit target, наявність helper і errors. Один фізичний сценарій після додавання passive listeners пройшов. Це не доводить, що passive listener «виправляє Safari».

Потрібно:

- інструментувати один етап, без PII й секретів;
- не відправляти другий action із diagnostic handler;
- відокремити functional listeners від UI журналу;
- після видалення діагностики перевірити **саме release variant**;
- зберегти результат і негативних, і позитивних повторів.

Якщо діагностика зникла, а clean candidate на тому самому пристрої не перевірений, статус лишається «потребує фізичного повтору».

### 3.4. X, passive close і grant

X не має універсальної семантики. Для одного state він може означати explicit close-and-claim, для іншого — лише close. Backdrop, Escape, native Back, swipe dismissal, reload і teardown — окремі випадки; їх не можна мовчки прирівнювати до явного X.

При зміні close behavior перевірити всю dependency chain:

```text
Бізнес-рішення
 → visible controls / accessible labels
 → template defaults
 → saved creative params
 → exact tracked action
 → кожна popup activity occurrence
 → matching connector + close-original policy
 → grant / no grant
 → navigation / no navigation
 → analytics identity
```

Показовий виправлений випадок: loss state успадковував claim/navigation values. У Body і saved params зробили обидві видимі дії close-only, додали X, а в кожному відповідному Journey occurrence — exact close connector до Stop. Claim/Risk виграшних states лишилися окремими.

Однакова номінальна винагорода на Claim і explicit X не вимагає окремого нового бонусу для X. Різні connectors можуть посилатися на ту саму перевірену bonus entity.

**Старі engagements:** після зміни template старий відкритий popup може ще надіслати попередню tracked URL. Безпечний legacy connector, який лише завершує старий контекст без grant/navigation, може тимчасово залишатися потрібним. Його видалення потребує зрозумілої retirement/drain policy; «старий» не означає «можна видалити зараз».

## 4. Доставка: затримки, CAPs, черги й повторний вхід

### 4.1. Клік доходить до Journey, popup запізнюється або відхиляється

Перевіряти механізми незалежно:

| Механізм | Що контролює | Чого не доводить зміна |
|---|---|---|
| Delay after online/login | Frontend delivery timing для label | Швидкість конкретного bonus backend |
| Pause before next popup | Інтервал презентації/черги | Порядок grant або його одноразовість |
| Communication User/Global CAPs, category/cannibalisation | Допуск комунікації | Виконання deposit eligibility або bonus cap |
| Popup delivery timeout | Зберігання/очікування доставки за vendor contract | Не є автоматично delay перед показом |
| Popup suspension / URL exclusions | Хто й де може показати popup | Сам факт Journey entry |
| Journey entry mode / maximum duration | Відкриті instances і повторний вступ | Atomic reward cap |
| Bonus/backend limits | Фактичне нарахування | Гарантію, що popup уже показано |

У production інцидентах окремо знаходили великі label-level паузи й `User/Global CAPs → Cannibalisation`. Правки робили на різних рівнях: timing, вузький communication exception для user-requested prompt, без обходу bonus caps.

Не переносити observed значення пауз до всіх майбутніх акцій. Label-level зміна впливає на інші кампанії; per-activity exception не є дозволом вимкнути всі communication caps. Спочатку інвентаризувати scope й журнал причини відмови.

### 4.2. Після повернення з каси приходить кілька popup

Типова послідовність: показ призупинений → користувач кілька разів просить prompt → requests накопичилися → після resume приходять послідовно.

Для одного інформаційного flow застосували `Once during open journey`, завершення за `Impression` або `Failed`, зі збереженим maximum duration. Save/reload підтвердив конфігурацію. Повний повтор «каса → повернення → кілька кліків» після цього **не був незалежно доведений**.

Узагальнене правило: gate pending request має відповідати реальному delivery lifecycle. Не звільняти його лише тому, що popup activity створено. Передбачити Failed/expiry, щоб невдала доставка не блокувала користувача назавжди.

Межа такого рішення: після Impression Journey уже може завершитися, хоча popup ще відкритий. Тому це захист від кількох **queued** requests до показу, а не доказ «максимум один visible overlay». Для останнього потрібен supported host/current-engagement contract.

У реконструкції старих інцидентів не підміняти факти здогадом: в ранньому поясненні exit припускали як Then, але final saved artifact показав старий Any click. Майбутнє правило має спиратися на прочитану конфігурацію.

### 4.3. Once-open і Stop-and-Start вирішують різні проблеми

`Once during open journey` може блокувати cross-device retry, поки старий popup/instance очікує завершення. `Stop and Start` дозволяє новий entry, але припиняє попередній flow; уже відправлений зовнішній bonus request при цьому може ще завершитися.

Не використовувати re-entry mode як заміну atomic per-user/campaign/cycle cap. Marker перед grant і marker після grant теж не створюють transactional exclusion.

За збереженим primary contract окремої інтеграції Mark/Unmark та JS marker activity могли переходити по Then **до persistence**, а Update property — після збереження. Навіть підтверджений write не означає compare-and-set. Актуальні semantics перевірити для своєї activity/version.

Так само issuance-id idempotency захищає replay **однієї** видачі; два незалежні entries можуть створити два issuance IDs. Дві вкладки часто синхронізують один popup/session і не є повноцінним тестом двох незалежних пристроїв із затриманою зовнішньою відповіддю.

Детальніше: [Journey та rewards](../smartico-knowledge/03-journeys-and-rewards.md).

## 5. Стан, eligibility й відновлення спроби

### 5.1. Prompt витратив спробу до перевірки передумови

Причина: recurring mission opt-in/completion відбувся раніше, ніж перевірка qualifying deposit. Закриття інформаційного popup не повертало mission state.

Виправлений design pattern:

```text
Identity / verification / prerequisite snapshot
 → unknown/error: без витрачання спроби
 → умову не виконано: інформаційна підказка без opt-in
 → умову виконано: одна operation входу
 → серверна повторна eligibility перевірка
 → основна механіка
```

Окремий Client Action Journey для підказки доречний, якщо потрібна CRM delivery. Локальний help/FAQ component також може бути правильним, якщо це суто інформаційний UI. Не створювати кілька Journey лише через різну візуальну модалку.

Frontend preflight допомагає UX, але не вирішує race між read і action. Authoritative admission лишається на сервері.

### 5.2. Депозит є, а CTA ще просить поповнити

Eligibility pipeline може мати кілька асинхронних етапів: approved product event → Smartico event → rule → server/public marker → public props → UI. Баланс або повернення з каси не замінюють qualifying event.

Порядок перевірки: exact identity/env → approved event і його час → rule filter/activation → потрібний тип marker → current props → subscription/refresh → UI generation/build.

Public JS marker і server Label Tag — різні представлення. В одному підтримуваному web SDK використовували initial `getPublicProps()` та `props_change`:

| Відповідь | Коректна інтерпретація |
|---|---|
| Partial event без `core_public_tags` | Не змінювати відомий стан за відсутнім полем |
| Initial snapshot ще без потрібних даних | Unknown/loading з bounded wait |
| Коректний порожній масив | Відома відсутність marker |
| Некоректний тип або items | Controlled error |
| Потрібний exact marker | Умова UX виконана; server gate все одно потрібний |

На logout/account switch subscriptions очищуються, late responses відкидаються. Не вручну додавати marker і не просити повторний депозит, якщо qualifying event уже підтверджений. Projection latency треба виміряти, а не вигадувати SLA.

### 5.3. Видалення marker не скинуло місію

Mission completion, recurrence cycle, eligibility markers, open Journey instance й bonus ledger — окремі state machines.

Observed Journey reset action підтримувала Featured Manually, а не обрану recurring mission. Це не доказ, що жодний tenant/API ніколи не підтримує per-user recurring reset. Для рекомендації потрібен точний підтриманий механізм.

Додатковий recurring run може почати новий цикл для **всієї** аудиторії й відкрити зайву участь. Не подавати його як нешкідливий reset одного QA account. Альтернативи: інший тестовий користувач, виділений QA цикл або підтверджений per-user mechanism.

Для короткого QA repeat також перевіряти mission schedule, open Journey завершення та UI deadline разом. В одному label runs ближче години були відхилені; це observed capability, не універсальний Smartico minimum.

### 5.4. Eligibility drift між UI і CRM

В одному інциденті frontend враховував manual verification, а CRM filter — ні. Journey не допускав користувача на будь-якому пристрої. Початковий mobile симптом не робив причину Safari-specific.

Зберігати одну business-condition mapping: approved правило → frontend provider → CRM/server condition → public projection → QA. Список verification markers одного бренду не стає universal KYC rule.

Для monetary prerequisites описати один event чи cumulative sum, threshold/currency/status, event window, retention marker і reversal policy. Historical backfill та realtime rule — різні операції. Не запускати масову історичну обробку лише тому, що rule починає слухати нові events; QA/prod можуть містити однакові зовнішні user IDs.

## 6. Scroll, перший клік, iframe і збереження прогресу

| Симптом | Встановлена причина / статус | Виконана або доречна зміна | Що перевіряти |
|---|---|---|---|
| Перша навігація не спрацьовує | Відтворено: iframe focus запускав profile/mission refresh і замінював target до pointerup | Видалено focus-triggered refresh; лишено supported resume/visibility refresh без руйнування відомого layout | Перший pointer/keyboard click, refresh response під час жесту, реальні App taps |
| Після prompt close лишається `overflow:hidden` | Confirmed lock leftover; data Client Action проходив host helper, який чекав close іншого gamification window | Named action перенесено на підтриманий action-only sender існуючої identified integration | Open→close→scroll→repeat→reload, а також інші host overlays |
| Після reload біля FAQ лишається footer | Відтворено: iframe спочатку стискався, потім виростав; parent scroll anchoring зберігав footer; child scroll був0 | Потрібний узгоджений host-container height/restoration fix; у дослідженому випадку лише diagnosis, без доведеного fix | Parent/child scroll positions, root/iframe bounds у фазах load, fonts/FAQ/history |
| Тимчасовий profile error скидає довгий досвід на початок | Scene list перебудовувався в короткий error state і clamped active index | Зберегти підтверджену геометрію й позицію same-user; заблокувати reward actions; identity change скидає окремо | Error→retry→success, logout/new user, progress і CTA correctness |
| Controls скачуть під header / лишаються біля FAQ | Кілька owners позиціонування, observers/offset patches, плутанина viewport і scene | Один scene-local positioning model; прибрати obsolete observers/helpers після заміни | Host header, short height, info open/close, natural-flow FAQ exit |
| Один trackpad gesture пропускає кілька кроків | Inertia events сприймалися як нові gestures | Узгоджена gesture session policy, reverse/cancel behavior, accepted input незалежно від motion | Mouse wheel, trackpad, touch, keyboard окремо; не blanket debounce |
| Персонаж/анімація блокує клік або міняє тривалість кроку | Input clock залежав від декоративної анімації | Відокремити приймання input, transition, reveal і sound | Один accepted gesture→один step; новий intentional gesture, reverse і cancel |

Action-only transport не є дозволом створити новий SDK/socket у child або читати cross-origin parent internals. [Client Action runbook](05c-smartico-client-actions.md) і product profile визначають supported provider. Product navigation продовжує використовувати свій `event_action`.

Не лікувати parent scroll-lock глобальним `body.style.overflow='auto'` із creative: це може зняти lock іншого відкритого вікна й не виправити lifecycle owner.

## 7. Cache, графіка й перенесення конфігурації

### 7.1. Успішний CI, але користувач бачить старий UI

Перевіряти не лише Git commit: loaded iframe URL, served HTML, script/config versions, CDN headers, source hash і фактичний DOM. Старий HTML із новим JS може створити окрему runtime помилку. Уже відкритий popup не оновлюється лише через save Body.

Постійне рішення — узгоджена HTML revalidation, версійовані assets і rollout policy. Cachebuster допомагає діагностиці, але не має вимагати від користувача щоразу міняти CMS URL. Точні правила — у [release/cache](14-release-and-cache.md).

В іншому класі випадків сторінка редиректила **до появи iframe**, або document request стояв Stalled із нульовим Body. Це ще не landing JS/template failure; потрібна перевірка host route/network, а не оголошення «акція завершена».

### 7.2. Stage залежності в production

Аудит включає Body, Configuration defaults, saved creative overrides, fonts, images, navigation, mission/task/bonus references, public/server markers, Client Actions, origins і actual build profile.

Стабільні Smartico CDN URLs в одному перевіреному сценарії повторно використовувалися між labels. Це не універсальна гарантія довічного доступу: перевірити ownership, lifetime, CSP/CORS і provenance. Gallery може групувати за Keywords замість фізичних folders; орієнтуватися на actual BO.

State-safe defaults не мають приховано блокувати правильний environment override. Наприклад, hardcoded production cashier у deposit fallback зламає QA навіть після зміни одного видимого URL. Routing environment і content-state defaults зберігати окремо.

### 7.3. Перенесення Journey — перевірка semantics graph

У copied flow знаходили broad mission trigger без exact ID, bypass eligibility, два `dp:ok` виходи для claim і risk, grant на Impression/Then, втрачений другий split та назви гілок, що не відповідали downstream role.

Для кожної activity потрібні: фактична роль, source→target entity map, trigger/connector, terminal routes, side effects, grant owner, exact action і readback. Нова картинка або правильний popup ID не виправляє graph.

Відокремити:

1. Перенесено source/template/creative.
2. Збережено й перечитано BO config.
3. Зв'язано всі occurrences.
4. Перевірено graph і дати.
5. Активовано потрібні об'єкти.
6. Працює runtime на правильному build/profile.

Archive/copy/relink можуть торкатися descendants або parent connections. Оглянути affected subtree перед зміною. Якщо editor autosave змінив connector не так, як планувалося, зупинити подальше редагування, перевірити history і відновити точний попередній стан за поточним scope. Не накладати ще один «виправний» edge без розуміння графа.

### 7.4. Графічні дефекти й lifecycle

Чорна/прозора база WebGL у WKWebView, видимий лише fallback або постер поверх відео мають різні причини. Перевіряти actual loaded build і canvas, initial opaque background, first successful draw, context loss/fallback, cached video already-playing state та poster ownership.

Заміна картинки shader-ом не доводить менше навантаження. Зберігати reduced motion, offscreen/background pause, cleanup і actual GPU/device proof. [Media/WebGL](10-media-animation-webgl.md) містить технічні checks.

## 8. Видача бонусів і аналітика: типові помилкові висновки

### Бонусний результат

| Симптом | Що перевірити до повторного grant |
|---|---|
| Claim є, route до бонусів не відкривається | Actual bonus request/status/effective dates; route може правильно чекати confirmed success |
| QA resource Active, але grant fail | Effective period самого bonus/template/external campaign, currency/game/caps; activity status не доводить valid resource |
| Smartico показує API success, продукт не має Available bonus | Значення acknowledgement за integration contract; exact issuance/transaction, available/activated/used/expired states |
| UI не має received marker після manual support grant | Manual action могла обійти Journey marker activity; marker absence не є доказом відсутності grant |
| Response невідомий / New/pending | Existing request history і server retry/idempotency; не відправляти другий бонус навмання |

Розрізняти external platform campaign ID, Smartico bonus template ID, per-user issuance ID і backend transaction ID. Clone template не створює відсутню gaming-platform campaign. Перевірений QA placeholder із іншою фактичною кількістю FS тестує routing, але не production reward equivalence.

### Аналітичний результат

Коли затверджений контракт змінився з programmatic events на HTML `data-gtm-id`, старі producer/factory paths прибрали. Не лишати їх «про всяк випадок»: це створює competing ownership, зайві залежності й ризик подвійного send.

DOM ID — hook для collector, а не вже отримана GA/Firebase подія. Cross-origin product GTM не бачить child DOM автоматично; popup iframe і native WebView мають власний collection context. Firebase restrictions стосуються destination event names; HTML ID не потрібно мовчки перейменовувати без mapping.

При accepted click synchronous UI update може прибрати ID до delegated collector. В одному підтримуваному guard його зберігали до кінця поточного event; в іншому cleanup timer заважав retry й був прибраний. Тестувати **actual collector order**, не копіювати timer як обов'язковий рецепт.

Для звітів:

- Flow entries/transitions не дорівнюють унікальним людям або фактичним grants.
- Historical Failed може передувати пізнішому успіху, а запис надійти пізніше; failure total не дорівнює остаточно втраченим користувачам.
- Date range, timezone, completed-days window, filters і denominator кожного % мають бути явні.
- Qualifying deposit до входу й conversion deposit після входу — різні події.
- Control group off не доводить incremental uplift; Bonus Cost0 може означати відсутність cost integration.
- Невідповідність aggregate та журналу зберігати як unresolved reconciliation, не підганяти narrative під бажаний висновок.

Повний contract: [analytics](12-analytics.md), [investigation/analytics knowledge](../smartico-knowledge/05-investigation-and-analytics.md).

## 9. Порядок безпечного очищення й переналаштування

Це послідовність для affected code та знайденої проблеми. Вона не вимагає переписати всі modal templates.

### Крок 1. Зафіксувати джерела й поведінку

Знайти active source/build, existing BO entities, published Body/config/params, wrapper/runtime та usage list. Старий prototype може лежати поруч із новим Nuxt application; факт існування файлу не робить його production source.

Зберегти мінімальний rollback artifact, known-good state і невирішені runtime gaps. Описати functional invariants: visible states, first click, close/claim/risk, keyboard/touch, fallback, localization, resource origins, server grant/caps і navigation.

### Крок 2. Знайти owners і залежності

| Відповідальність | Один явний owner | Що перевірити при видаленні |
|---|---|---|
| SDK/session | Підтримана identified integration | Чи не створено дублюючий socket/SDK |
| Business action | Vendor hook або погоджений sender | Чи не лишиться другий send на touch/click/href |
| UI input | Один interaction controller | Keyboard, hit area, retries і gestures |
| Render/motion | Creative/component lifecycle | Core content без декоративного JS |
| Position/scroll | Узгоджений host або scene owner | Чи лишилися старі observers/locks |
| State | Authoritative provider + current generation | Error/unknown, identity switch, stale response |
| Analytics | Один затверджений collector mode | Немає competing producer і втрати first click |

Перевірити callers, generated output, params і tests перед видаленням. Не прибирати canonical bridge/vendor wrapper або server validation як «зайвий код».

### Крок 3. Прибрати підтверджену зайву складність

Кандидати, якщо їхня зайвість підтверджена:

- великі embedded resources, які мають стабільне зовнішнє джерело;
- script assembly через serialization, якщо той самий результат дає просте перевірене складання;
- старий analytics producer після вибору DOM mode;
- дубльовані senders, click/touch latches і callbacks, яких більше не використовує contract;
- obsolete positioning/resize observers після зміни моделі;
- Stage/Figma/landing fallback URLs у release assets;
- недосяжні branches і старі imports/exports без consumers.

Local preview, test fixtures і historical compatibility connector не є runtime bloat автоматично. Потрібно довести, що вони завантажуються або виконуються зайво. Виносити історичні записи із current instructions, не знищуючи доказів.

### Крок 4. Узгодити все, що переживає зміну коду

Виправити source/generator → Body → Configuration defaults → saved creative values → assets → усі activity occurrences → action/branch mapping → analytics hooks → QA/release record.

Нова Body версія не стирає старі creative params. Новий URL asset не змінює вже відкритий popup. Заміна дати в landing не змінює mission/Journey schedules. Profile/ENV routing перевірити в кожному шарі.

### Крок 5. Перевірити регресії, які реально можуть зламатися

Для legacy templates:

1. Actual pinned compiler і DOM assembly; потрібні V8/JavaScriptCore перевірки.
2. States, missing/null/escaped/long payloads, explicit optional=false, 0/1/2 controls, stale saved values і locales.
3. Low height/landscape/safe areas/text zoom; all visible CTA hit areas.
4. First accepted click, повторні/mixed clicks, keyboard, supported native Back/passive dismiss.
5. Blocked/slow fonts/images/custom scripts, reduced motion, repeated fresh/cached show.
6. Відсутність зайвого send/producer і правильний collector order.
7. Grant/failure/pending/navigation через authoritative backend; дві вкладки й independent devices за risk scope.

Не робити один native happy path заміною compiler regression або навпаки.

### Крок 6. Зберегти й перевірити фактичну доставку

Save → re-open/download → source/hash comparison → preview → fresh Web delivery → supported physical platforms. Перевірити status і execution окремо; cached old engagement, label delays, caps, queue, scroll та routing також входять у відповідний smoke.

Вимірювання записати окремо: Body bytes/gzip, custom JS, external selected transfer, decoded media memory, compile/render time. Число тестів саме по собі не є доказом повного UX.

### Крок 7. Закрити результат із межами доказів

Підсумковий запис:

```text
Симптом і точна версія:
Причина / ступінь впевненості:
Мінімальна фактична зміна:
Що прибрано і чому це зайве:
Що збережено за контрактом:
BO readback / served build:
Регресія до/після:
Web / iOS / Android evidence:
Невирішені питання та спосіб наступної перевірки:
```

«Налаштування збережено», «локальний engine пройшов», «фізичний користувач отримав бонус» — різні результати. Не об'єднувати їх словом «усе виправлено».

## 10. Як використовувати каталог у наступній задачі

Для питання про баг агент спочатку вибирає етап із розділу1, знаходить відповідний incident pattern, читає product profile/current contract і отримує потрібний proof. Потім пропонує конкретну найменшу зміну з перевіркою її consumers.

Підтверджені механізми стають правилами; невстановлені причини — investigation recipes. Не переносити до нової кампанії старий parser workaround, click latch, CAP exception, delayed retry або brand marker лише тому, що колись він був частиною виправлення.

Інші первинні матеріали: [Smartico public API](https://github.com/smarticoai/public-api), [native protocol](https://github.com/smarticoai/public-api/blob/main/docs/native/PROTOCOL.md), [template engine](https://github.com/smarticoai/JavaScript-Templates), [Bonus API](https://help.smartico.ai/welcome/technical-guides/bonus-api-integration). Актуальність і межі доступності джерел фіксуються у [реєстрі knowledge base](../smartico-knowledge/README.md); приватні докази інцидентів лишаються у project kit.

