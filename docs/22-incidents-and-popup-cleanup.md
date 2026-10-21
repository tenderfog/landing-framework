# Інциденти, переналаштування й очищення Smartico popup

Цей посібник узагальнює досвід кількох реалізацій: що перевіряти, коли промо або popup працює нестабільно, як виправляти причину та як прибирати зайвий код без втрати потрібної поведінки. Приклади не задають дати, ідентифікатори, розміри нагород або налаштування наступної акції.

Для нового popup спочатку перевірити актуальний authoring mode: [офіційна документація](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/pop-up) рекомендує Vibe Studio, а наявні Configuration/Body templates залишаються окремим legacy сценарієм. Правила про `tmpl`, delimiters і template compiler нижче стосуються саме підтримуваного template runtime. Оновлення framework не вимагає міграції чинної кампанії.

Пов'язані матеріали: [пошук причини за симптомом](15-troubleshooting.md), [popup runbook](06-smartico-popup-templates.md), [Smartico knowledge base](../smartico-knowledge/README.md), [профіль продукту й investigation](20-product-profiles-and-investigation.md), [запис дослідження](../templates/investigation-record.md).

## 1. Як читати каталог

Це місце для **механізмів реальних інцидентів, фактичних змін та меж їхнього підтвердження**. Перший розрив у flow шукаємо за [investigation workflow](20-product-profiles-and-investigation.md); початкові симптоми зведено в [індекс](15-troubleshooting.md). Не потрібно перечитувати весь каталог для кожного бага.

У кожному випадку розділяємо: відтворений механізм, перечитану BO-конфігурацію, перевірений browser/device scenario та повідомлений симптом. Відсутність exact failing payload може лишити причину початкової доставки невстановленою навіть за успішної регресії. Рівні доказу та звіт PASS/FAIL/NOT_TESTED визначені в [QA](13-qa.md).

## 2. Popup: рендер, template runtime і зайві залежності

### 2.1. Підкладка є, контенту немає

У досвіді інтеграцій траплялися два **різні** механізми template failure.

| Механізм | Що відтворено | Виправлення | Чого це не доводить |
|---|---|---|---|
| Literal CSS випадково містить `%}` | Фрагмент на кшталт `height:100%}` порушував компіляцію фактичним template engine до присвоєння `innerHTML` | Delimiter-safe literal CSS; compiler check після остаточної мініфікації | Не встановлює причину конкретної старої App-доставки, якщо її exact Body не отримано |
| Великий початковий template code block у JavaScriptCore | На перевіреному Body і pinned vendor compiler JavaScriptCore залишав закривальний token у згенерованому JS; V8 цей Body компілював | Мінімальне розділення великого блоку на суміжні template blocks; порівняння згенерованого HTML у двох engine families | Не доводить відсутності інших фізичних iOS проблем після compilation |

Для другого випадку контрольований кандидат додавав лише п'ять символів — межу `%}{%` і переведення рядка перед конкретним фрагментом побудови script. Шість payload cases у JavaScriptCore дали результат, байт у байт однаковий із V8. Це **регресійний приклад**, а не правило вставляти таку межу в кожний popup чи обмежувати всі blocks вигаданим maximum size.

Для розрізнення цих механізмів потрібні exact delivered Body/params, wrapper і compiler revision; поточний BO export може вже відрізнятися. Порівнювати V8 та JavaScriptCore треба на однаковій vendor DOM assembly, а не на ручній підстановці рядків. Виконання actual compiler й перевірка збереженого артефакту — [runtime runbook](06-smartico-popup-templates.md).

Якщо старий failing Body відсутній, висновок обмежений: «Механізм відтворено й кандидат перевірено; причина початкового доставленого popup окремо не доведена».

### 2.2. Fixture приховує помилку замість її відтворення

Власний renderer із підстановкою params може пройти тест, хоча штатний wrapper падає. Для досліджених дефектів важливо було зберегти template element, `window.onload`, actual `tmpl` і штатне підключення action handlers. Підміна одного з цих етапів прибирає саме умову failure.

Fixture не має product CSP, identified session, Journey, bonus endpoint і native presentation. Logger deep links доводить тільки намір відправлення. Observer, доданий після load, може пропустити ранню помилку; її читають у DevTools потрібного frame. Відсутність застарілого `script.readyState` сама не доводить load failure. Для нового fixture використовувати [runnable compiler example](../smartico-popups/examples/README.md), явно записуючи його межі.

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

Виявлені під час очищення небезпеки literal delimiters, вкладеного closing script tag, escaping та outer frame sizing мають одну технічну інструкцію в [legacy runtime runbook](06-smartico-popup-templates.md). Їх перевіряємо на кінцевому exported Body; не підтримуємо другу копію compiler checklist тут.

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

При review шукати конкуруючі `href`/vendor hook і `_smartico.dp()`, подвійний click/touch sender, capture listener перед vendor delegation, повторне підключення після render та teardown, який чекає закриття іншого типу вікна. Видалення зайвого handler не скасовує server safeguards.

### 3.3. Діагностика може змінити поведінку

При intermittent touch failure тимчасово збирали category counters `touchstart/touchend/click`, hit target, наявність helper і errors. Один фізичний сценарій після додавання passive listeners пройшов. Це не доводить, що passive listener «виправляє Safari».

Diagnostic handler не надсилає бізнес-дію й не змінює functional listeners. Після прибирання counters/UI журналу повторюється **clean release variant** на тому самому пристрої, із збереженням позитивних і негативних результатів. Без цього статус лишається «потребує фізичного повтору».

### 3.4. X, passive close і grant

Баг виник, коли loss state успадковував claim/navigation values. У Body й saved params зробили видимі дії close-only, додали X, а в кожному Journey occurrence — exact close connector до Stop. Claim/Risk виграшних states лишилися окремими. Змінити лише Body було недостатньо: старий creative override та graph продовжували задавати іншу поведінку.

Однакова винагорода на Claim і explicit X не вимагала третього бонусу: різні connectors посилалися на ту саму перевірену bonus entity. Семантика X/backdrop/Escape/Back/reload визначається [action matrix](05b-smartico-journey-runbook.md); teardown не перетворюється на claim автоматично.

**Старі engagements:** відкритий до оновлення popup може ще надіслати попередню tracked URL. Safe legacy connector, який лише завершує старий контекст без grant/navigation, може тимчасово лишатися потрібним. Видалення потребує retirement/drain policy: «старий» не означає «зайвий».

## 4. Доставка: затримки, CAPs, черги й повторний вхід

### 4.1. Клік доходить до Journey, popup запізнюється або відхиляється

У production інцидентах окремо знайшли великі label-level паузи після login/між popup і відмови `User/Global CAPs → Cannibalisation`. Це були різні причини delivery, а не доказ невиконаного депозиту чи financial cap. Правки обмежували timing і конкретним communication exception для user-requested prompt; bonus caps не обходили.

Визначення queue, retention, suppression, communication caps і entry modes зібрані в [popup KB](../smartico-knowledge/04-popups-and-routing.md). Для інциденту зберігаємо actual reason і scope налаштування: зміна label-wide timing впливає також на інші кампанії. Observed значення пауз або exception не стають defaults нової акції.

### 4.2. Після повернення з каси приходить кілька popup

Типова послідовність: показ призупинений → користувач кілька разів просить prompt → requests накопичилися → після resume приходять послідовно.

Для одного інформаційного flow застосували `Once during open journey`, завершення за `Impression` або `Failed`, зі збереженим maximum duration. Save/reload підтвердив конфігурацію. Повний повтор «каса → повернення → кілька кліків» після цього **не був незалежно доведений**.

Узагальнене правило: gate pending request має відповідати реальному delivery lifecycle. Не звільняти його лише тому, що popup activity створено. Передбачити Failed/expiry, щоб невдала доставка не блокувала користувача назавжди.

Межа такого рішення: після Impression Journey уже може завершитися, хоча popup ще відкритий. Тому це захист від кількох **queued** requests до показу, а не доказ «максимум один visible overlay». Для останнього потрібен supported host/current-engagement contract.

У реконструкції старих інцидентів не підміняти факти здогадом: в ранньому поясненні exit припускали як Then, але final saved artifact показав старий Any click. Майбутнє правило має спиратися на прочитану конфігурацію.

### 4.3. Once-open і Stop-and-Start вирішують різні проблеми

У повторних тестах Once-open не допускав retry з іншої поверхні, поки старий instance очікував. Перехід на Stop-and-Start звільняв новий entry, але не доводив cancel уже відправленого external bonus request. Тест із двома вкладками міг синхронізувати **один** popup/session; один grant у ньому не підтверджував race-free роботу двох незалежних пристроїв.

Тому збережений re-entry mode і прийнятий практичний two-tab smoke не перетворені в гарантію «один бонус на user/cycle». Marker persistence, entry cap та issuance-id idempotency мають різні межі; їхній канонічний контракт і статус історичного primary source — у [Journey/rewards KB](../smartico-knowledge/03-journeys-and-rewards.md).

## 5. Стан, eligibility й відновлення спроби

### 5.1. Prompt витратив спробу до перевірки передумови

Причина: recurring mission opt-in/completion відбувся раніше, ніж перевірка qualifying deposit. Закриття інформаційного popup не повертало mission state.

Флоу змінили так, щоб missing prerequisite показувала підказку без opt-in; лише відома доступність вела в основну operation входу з повторною server перевіркою. Інформаційний Client Action Journey мав окремий lifecycle без reward. Локальний help/FAQ лишався frontend, якщо не потребував CRM delivery.

Схема й discovery-поля для наступної реалізації — [prerequisite pattern](21-promo-patterns.md). Frontend preflight покращує UX, але не є атомарною server admission.

### 5.2. Депозит є, а CTA ще просить поповнити

У перевіреному профілі approved deposit і потрібний production marker вже існували, поки landing ще показував стару CTA. Користувач підтвердив, що доступність оновилась пізніше. Це вказувало на затримку projection/client refresh, а не на необхідність повторного депозиту.

Порівнювали exact identity/ENV, час approved event, rule activation/filter, тип marker, current props, subscription та served UI revision. Initial `getPublicProps()` і `props_change` мали різні ролі; partial event без `core_public_tags` не мав стирати відомий стан, а malformed value не можна було прирівняти до відсутньої умови.

Merge/freshness правила живуть у [state KB](../smartico-knowledge/02-missions-and-state.md). Для цього інциденту не встановлено універсального SLA projection; ручне додавання marker приховало б початкову затримку.

### 5.3. Видалення marker не скинуло місію

У тестовому профілі після видалення eligibility markers recurring mission лишалася completed. Нова спроба не з'явилася: marker removal не торкається mission progress і не скасовує open Journey або виданий bonus.

Observed reset activity підтримувала Featured Manually, а не обрану recurring mission. Це не доказ універсальної відсутності per-user recurring reset; потрібний підтверджений tenant/type mechanism. Додатковий recurring run міг відкрити ще одну участь **всій** аудиторії, тому його не видали за reset одного account.

Для прискореного QA runs ближче години в одному label були відхилені. Це observed validation, не global Smartico minimum. Перелік незалежних reset states і погодження server schedule/Journey bound/UI deadline — [reset pattern](21-promo-patterns.md).

### 5.4. Eligibility drift між UI і CRM

В одному інциденті frontend враховував manual verification, а CRM filter — ні. Journey не допускав користувача на будь-якому пристрої. Початковий mobile симптом не робив причину Safari-specific.

Зберігати одну business-condition mapping: approved правило → frontend provider → CRM/server condition → public projection → QA. Список verification markers одного бренду не стає universal KYC rule.

Окремий backfill інцидент показав, що включена historical processing може масово торкнутися неузгодженої QA-аудиторії; зовнішні user IDs при цьому можуть збігатися з Production. Realtime cutover і historical replay треба відрізняти до запуску. Поля qualifying event, backfill scope та environment isolation — [promo patterns](21-promo-patterns.md).

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

Після успішного CI траплялося поєднання старого HTML із новим JS/config, тому перевіряли **served** URLs/hash/DOM, а не тільки source commit. Окремо вже відкритий popup лишався зі старим кодом після BO save. Виправлення publication/cache належить [release runbook](14-release-and-cache.md).

Інший схожий симптом мав інший шар: product page редиректила **до появи iframe**, або document request стояв Stalled із нульовим Body. Тут landing JS ще не виконувався; оголошувати акцію завершеною або міняти template не було підстав.

### 7.2. Stage залежності в production

Аудит включає Body, Configuration defaults, saved creative overrides, fonts, images, navigation, mission/task/bonus references, public/server markers, Client Actions, origins і actual build profile.

Стабільні Smartico CDN URLs в одному перевіреному сценарії повторно використовувалися між labels. Це не універсальна гарантія довічного доступу: перевірити ownership, lifetime, CSP/CORS і provenance. Gallery може групувати за Keywords замість фізичних folders; орієнтуватися на actual BO.

State-safe defaults не мають приховано блокувати правильний environment override. Наприклад, hardcoded production cashier у deposit fallback зламає QA навіть після зміни одного видимого URL. Routing environment і content-state defaults зберігати окремо.

### 7.3. Перенесення Journey — перевірка semantics graph

У copied flow знаходили broad mission trigger без exact ID, bypass eligibility, два `dp:ok` виходи для claim і risk, grant на Impression/Then, втрачений другий split та назви гілок, що не відповідали downstream role.

Також archive/copy/relink могли зачепити descendants або parent connections, а editor autosave — зберегти випадково змінений connector. Перед наступними діями оглядали affected subtree/history й відновлювали точний попередній edge; нова картинка або правильний resource ID graph не виправляли.

Procedure source→target mapping, node readback і activation ведеться в одному [Journey runbook](05b-smartico-journey-runbook.md). У regression після migration обов'язково включити згадані дефекти: exact mission filter, eligibility bypass, mutually exclusive actions, grant trigger, second split і reachable terminals.

Графічні класи з попередніх інтеграцій — poster над already-playing video, WebGL без темної основи в WKWebView, fallback без successful draw — мають окремі перевірки й fixes у [media/WebGL](10-media-animation-webgl.md). Їх не дублюємо як другий tutorial тут; жодний local shader pass не замінює actual GPU/device proof.

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

Окремий баг виникав через порядок handlers: accepted click синхронно змінював UI і прибирав marker до delegated collector. В одному supported guard marker зберігали до кінця поточного event; в іншому cleanup timer заважав retry й був прибраний. Потрібний **actual collector-order test**, а не універсальний timer patch.

Collection modes, cross-origin collector ownership і destination mapping — [analytics guide](12-analytics.md). Випадки помилкового трактування entries/users, late Failed після успіху, prerequisites/conversions, cost0 та невідповідності Flow/journal зібрано в [reporting KB](../smartico-knowledge/05-investigation-and-analytics.md). Це один словник метрик, а не окремий у кожному incident doc.

## 9. Безпечна редукція наявного popup

Це порядок **видалення коду й залежностей**, не друга інструкція створення popup. Setup/deliverables визначає [implementation contract](../smartico-popups/implementation-contract.md), compiler — [runtime runbook](06-smartico-popup-templates.md), affected proof — [QA](13-qa.md).

| Крок | Що зробити до переходу далі |
|---|---|
| 1. Підтвердити active source | Manifest/build entry → generated artifact → served revision → saved BO Body/config/params. Prototype поруч із `app/` не стає runtime source. Зберегти known-good/rollback artifact |
| 2. Назвати owners | По одному owner SDK/session, business sender, input, render/motion, positioning/scroll, state і analytics. Перевірити callers, imports/exports, generated output та fixtures перед видаленням |
| 3. Довести зайвість | Кандидати: base64 зі стабільною зовнішньою заміною; непотрібна script serialization; відкинутий analytics producer; duplicate senders/latches; obsolete observers; Stage/Figma fallback chains; недосяжні branches без consumers |
| 4. Зберегти сумісність | Зміна проходить source/generator → Body → defaults → saved values → assets → усі activity occurrences → branch mapping. Open engagements можуть потребувати тимчасового safe legacy connector із drain policy |
| 5. Прогнати affected regression | Actual engine/DOM assembly; states/locales/minimal/escaped params; 0/1/2 controls; first/mixed clicks; blocked resources; clean release без diagnostic observer. Grant/concurrency підтверджуються окремим server proof |
| 6. Звірити доставку й вимір | Re-open/download/hash, свіжа Web delivery, потрібний physical-device test. Окремо Body/gzip, external selected bytes і decoded memory: менший Body не обов'язково означає менший homepage cost |
| 7. Записати результат | Що вилучено і чому; що збережено за contract; cause confidence; before/after regression; BO/served revision; Web/iOS/Android proof та remaining gaps у [investigation record](../templates/investigation-record.md) |

Local preview, fixtures, rollback record і safe compatibility connector не є runtime bloat автоматично. Canonical bridge/vendor wrapper, validation та server caps не видаляються як «зайвий код». Після заміни positioning або sender перевірити, що старі observers/locks/handlers також прибрано, але чужі host subscriptions не очищуються.

«Налаштування збережено», «engine пройшов» і «гравець отримав бонус» — різні результати. Позитивний candidate із diagnostic listener не закриває дефект clean release.

Підтверджені механізми стають regression rules; невстановлені причини лишаються investigation recipes. Актуальні первинні джерела та їхній статус — [Smartico catalog](../smartico-knowledge/SOURCES.md); приватні докази інцидентів залишаються у project kit.
