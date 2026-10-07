# Smartico popup з брифу без готового макета

Цей процес потрібний, коли є механіка акції, бренд і контент, але немає погодженого Figma-компонента. Ми самостійно проєктуємо вигляд, перевіряємо його на різних екранах і реалізуємо **Smartico Configuration + Body + creative values**. Локальний прототип допомагає прийняти рішення; він не стає окремою frontend-модалкою замість Smartico popup.

Технічна основа — [спільний implementation contract](implementation-contract.md) та [reusable templates](../docs/06-smartico-popup-templates.md). Для App потрібний [native WebView contract](../docs/07-native-webview.md), для подій — [analytics contract](../docs/12-analytics.md). Цей документ додає процес проєктування, а не дублює engine, socket чи grant implementation. Почни із [popup brief](templates/popup-brief.md); [повний Configuration/Body/values приклад і compiler checker](examples/README.md) використовуються після дизайн-рішення.

## 1. Зібрати короткий popup brief

Відкрити поточну campaign spec, Smartico blueprint і brand source. Взяти звідти факти; не створювати нову механіку заради зручного дизайну. Якщо проєкт уже має approved content/actions, вони зберігаються.

| Що визначити | Питання, яке має отримати відповідь |
| --- | --- |
| Призначення | Це інформація, результат, вибір, підтвердження чи наступна дія? |
| Доставка | Який Journey/event показує popup; Web, Swift, RN Android? |
| Стани | Які outcomes існують і хто їх визначає на сервері? |
| Контент | Exact title/description/labels для кожної locale; legal qualifiers; що можна скоротити? |
| Кнопки | 0, 1 чи 2; головна/другорядна; exact control або supported navigation? |
| Хрестик | Чи є X; passive close, explicit X і claim — що означає кожне? |
| Повторні дії | Що відбувається з double/mixed clicks, pending operation, reload і Back? |
| Геометрія | Fullscreen overlay чи card; потрібна max-width; довгий контент/scroll? |
| Бренд | Palette, typeface, tone, icon/art rules, existing button anatomy, дозволені ресурси? |
| Бюджет | Обсяг assets, підтримані пристрої, reduced motion, бажана анімація? |

Internal names, field keys й action identifiers — Latin; службові описи — українською. Public copy — погодженою мовою користувача. Не додавати в опис «QA», Smartico, reload instructions, ID або внутрішній timeout.

Критичні невідомі уточнювати: grant semantics, probability, X-as-claim, legal copy, routes. Незалежну роботу — brand inventory, anatomy, assets/viewport plan — виконувати паралельно. Для цього процесу не потрібно вигадувати додаткові approval gates на кожну дрібну CSS-зміну; використовувати поточний authorized scope.

## 2. Спершу зафіксувати стани й actions

Побудувати таблицю до візуального оформлення:

| State key | Підстава показу | Title / description | Icon / decor | Actions | X / passive close |
| --- | --- | --- | --- | --- | --- |
| `information` | Погоджений server event | Approved locale values | Основний art | 2 або 1 | Окремо визначено |
| `result` | Підтверджений outcome | Approved outcome copy | Variant art | За механікою | Не припускати claim |
| `notice` | Інформаційна зміна | Approved notice copy | Легка іконка | 0 або 1 | За accessibility/host contract |

Це схема, а не перелік обов'язкових states. Не додавати «виграв/програв» у промо, де їх немає. Візуальний state лише відображає отриманий результат; render не генерує його.

Для кожного видимого control записати exact action й бізнес-наслідок. `dp:ok`/`dp:cancel` можуть бути choice identifiers, `dp:action` — exact engagement click або окремий named event за contract. Навігація використовує supported `dp:go&url=<product>/event_action/...`. Не підміняти decisions URL-переходом і не надсилати другу дію «для страховки». [Journey/action contract](../docs/05b-smartico-journey-runbook.md).

Якщо X має нараховувати ту саму винагороду, що Claim, це explicit close-and-claim action за механікою. З цього не випливає grant при Escape, backdrop, system Back, swipe або закритті WebView. Ці випадки перевіряються окремо; markup сам не встановлює native dismissal policy.

## 3. Запропонувати легкий візуальний напрям

Почати з наявного brand kit і компонентів продукту. Не розробляти нову design system для одного popup. Якщо є схожий перевірений Smartico template, оцінити його anatomy, runtime і поля, перш ніж клонувати чи будувати новий.

Зазвичай достатньо одного рекомендованого напряму й альтернативи, коли є реальний вибір:

| Напрям | Для чого підходить | Вартість реалізації |
| --- | --- | --- |
| Стримана card з живим текстом | Умови, confirmation, довгі локалі | CSS + маленька іконка |
| Fullscreen scene з центрованим контентом | Важливий результат/брендовий art | Один scene layer, responsive content, outer host bounds |
| Art + stretchable decorative buttons | Акційний character/style | Art URL, sliced button skin, live labels; extra layout QA |

На review показати desktop і вузький mobile варіант з реальним найдовшим текстом. Описати: фокус уваги, порядок читання, кнопки, поведінку X, responsive constraints, animation budget. Показувати конкретні варіанти, не лише перелік adjectives.

Якщо нового art немає, використовувати погоджений бренд-ресурс або CSS/SVG shape, коли це достатньо. Нова ілюстрація/генерація — окрема обґрунтована потреба з перевіреним правом використання; її відсутність не приховувати чужим art без джерела. Source/derivative вести в [asset register](../templates/asset-register.md).

## 4. Визначити anatomy й layout rules

Записати коротку visual spec, яку може повторити інший розробник:

```text
Overlay / background
  └─ Content region, responsive max-width
       ├─ Explicit close, якщо є
       ├─ Icon / illustration із reserved dimensions
       ├─ Heading
       ├─ Description / approved qualifier
       └─ Actions: 0 / 1 / 2
```

У spec вказати palette, type sizes/weights/line heights, content width, spacing scale, button min-height, safe-area inset, decoration placement й overflow policy. Числа беруться з бренду та конкретної композиції. Нижче — **стартові навчальні значення**, які треба оцінити в preview, а не універсальні design tokens:

```text
Content width: min(100% - 32px, 560px)
Spacing steps: 8 / 12 / 16 / 24px
Heading: 24px / 30px, brand-approved weight
Description: 16px / 24px
Action min-height: 44px, grows with label
Desktop actions: 2 equal columns
Narrow actions: 1 column
```

Текст має бути живим. Decor/art не містить незмінного локалізованого CTA. Резервувати dimensions, зберігати пропорції іконки й не зменшувати весь creative через `fitscale` для розміщення довгого тексту.

### Дії 0 / 1 / 2

- **0 actions:** не створювати порожню footer/grid область. Якщо popup modal блокує сторінку, має існувати погоджений спосіб закриття/виходу; auto-dismiss не вигадувати.
- **1 action:** центрувати чи розтягувати за design, без порожнього другого column.
- **2 actions:** пріоритет читається через style, order і label; desktop columns/mobile stack без зміни business semantics.

Довгий label переноситься або збільшує висоту; не обрізати суттєвий текст ellipsis. Stretchable button skin розділяє caps/middle/ornament, а live text залишається окремим. Decorative SVG/WebP не є accessibility label.

### Accessibility

Зрозумілі heading/description relationship, readable contrast, видимий focus, доступне ім'я X та meaning без залежності лише від кольору. Decorative image `alt=""`, змістовна image має відповідний текст. Hover — додатковий стан; touch/keyboard працюють без нього. Focus trapping/restore, Escape і native Back належать підтвердженому outer popup contract; `role="dialog"` не реалізує їх автоматично.

Reduced motion зберігає всю інформацію й controls. Анімація не затримує можливість виконати погоджену дію і не simulates confirmed result. Детальна media policy — [анімація/WebGL](../docs/10-media-animation-webgl.md).

## 5. Побудувати всі потрібні адаптиви

Перевірити content-driven breakpoint: ширина labels, safe-area й available viewport важливіші за UA. Доповнити крайні desktop/mobile mockup проміжними ширинами, коротким landscape, tablet/split view і збільшеним текстом.

Full-width backdrop і обмежена ширина content — різні речі. Fullscreen можливий лише якщо SDK/native outer frame дає весь viewport; CSS у creative не виходить за iframe/WKWebView. Scope wrapper overrides та native bounds перевіряти за [template](../docs/06-smartico-popup-templates.md) і [native](../docs/07-native-webview.md) runbooks, не ставити глобальний `z-index` як «обхід».

Для довгого контенту передбачити scroll, щоб X/CTA не зникали за екраном. Перевірити loading fonts, larger locale, Dynamic Type/Android text scaling і keyboard overlay, якщо popup містить дозволені inputs. Значення `locale` й `theme` не вгадувати; підтримати погоджені variants/fallbacks. [Багатомовність](../docs/16-localization.md).

## 6. Перетворити дизайн у Smartico template

Результат — одна parameterized структура й creative values. Stable поля можуть охоплювати state/locale, title, description, icon URL/alt, primary/secondary text/action/enabled, close enabled/action/label, decoration/background URLs та animation flag. Імена/типи мають збігатися в Configuration, Body, presets і тестах.

Не робити кожен CSS pixel редагованим у BO: давайте marketer потрібні зміни контенту й затверджені variants, а layout invariants залишайте в template. Defaults зберігають читабельність для старих/minimal params, не invent reward amount чи eligibility.

Implementation й compilation — за [технічним popup runbook](../docs/06-smartico-popup-templates.md): actual `tmpl('_template', params)`, literal delimiter collisions, script embedding, escaping, external URL assets, click hooks/guards. Не копіювати графіку base64 в Body й не виводити ключі/token у params.

## 7. Навчальний приклад: інформація про доступну пропозицію

**Припущення прикладу задане в brief:** Journey вже має право показати інформаційний popup. Popup не видає бонус, не claim-ить його і не визначає доступність. Головна дія відкриває продуктову сторінку бонусів; друга й X тільки закривають. Реальний продукт має підтримувати цей event action. `dp:close` використано за [офіційним custom-popup прикладом](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/pop-up); actual delivery/connector і native handler перевіряються окремо.

```yaml
# ВЛАСНИЙ brief schema, не Smartico Configuration JSON.
templateName: Promo Offer Information
descriptionUk: Інформаційний popup із переходом у бонуси
anatomy: icon-title-description-actions
surfaces: [web, swift-webview, rn-android-webview]
actions:
  primary: navigate-to-bonuses
  secondary: explicit-close
  close: explicit-close
rewardOperation: none
```

Creative values для полів, які має визначати ваш Configuration:

```json
{
  "visual_state": "information",
  "locale": "uk",
  "title": "Переглянь доступні пропозиції",
  "description": "У розділі бонусів знайдеш актуальні умови та наступні кроки.",
  "icon_url": "https://cdn.example/promos/shared/gift.a1b2.webp",
  "primary_button": {"checked":true},
  "primary_text": "До бонусів",
  "primary_action": "dp:go&url=https://product.example/event_action/bonuses",
  "secondary_button": {"checked":true},
  "secondary_text": "Пізніше",
  "secondary_action": "dp:close",
  "close_button": {"checked":true},
  "close_label": "Закрити повідомлення",
  "close_action": "dp:close",
  "animation": {"checked":true}
}
```

Тут `product.example`/`cdn.example` — placeholders, не адреси deployment. `visual_state`, `locale` й button objects — власні поля цього навчального template, не Smartico reserved API. Для англійської creative values змінюються texts/locale, а структура й actions залишаються сумісними.

Одна кнопка — `secondary_button.checked=false`; без action buttons — обидва false, але approved close лишається доступним. Minimal values/flags перевірити engine-тестом. Інший state змінює approved copy/art, не додає нову frontend branch або server result.

Якщо business brief згодом змінить X на close-and-claim, це **зміна механіки**: оновлюються action matrix, Journey connector, exact action, labels й QA, а не лише картинка хрестика. [Smartico blueprint](../templates/smartico-blueprint.md).

## 8. Перевірити, показати й зберегти результат

Візуальне review має конкретний desktop/mobile preview, state/locale variants і коротку spec. Фіксувати суттєві рішення — hierarchy, copy, X/CTA behavior, surface bounds, resource budget — у versioned artifacts. Якщо рішення вже дозволене поточним user scope, продовжувати реалізацію; не створювати зайвий permission loop.

Перед BO save виконати actual compiler й responsive checks. Після save повторно відкрити/download Body і creative values, перевірити exact bytes/fields. BO Preview, real Web Send Preview й actual Swift/RN sessions — різні докази. Ready/impression без visible root не certifies render; дія навігації не certifies grant.

Перевірити всі buttons/X/passive dismissal, long locales, slow assets/fonts, cached load, background/resume, reduced motion, minimal params, unsupported router і double/mixed clicks. [QA](../docs/13-qa.md). Analytics intent/impression/confirmed outcome — окремий погоджений контракт, не вигадані transport calls у Body. [Аналітика](../docs/12-analytics.md).

Activation/publish виконується лише в дозволеному scope потрібного ENV/Label/Brand і target objects; документ сам не дає дозволу на live CRM зміни. Для цього навчального процесу зовнішні системи змінювати не потрібно.

## Комплект передачі

- Popup brief і action/state/copy matrix з джерелами/owner.
- Visual spec + desktop/mobile/long-locale previews.
- `configuration.json`, `body.html`, creative values для потрібних states/locales.
- Asset manifest із source/rights, dimensions, bytes, HTTPS URLs/cache/CORS requirements.
- Actual engine checks, QA evidence й перелік неперевірених surfaces.
- Target template/asset inventory після реального save, version/hash і release record.

Не залишати новій команді лише screenshot або frontend demo. Вона має отримати renderable Smartico artifacts, зрозумілий business contract і відтворювані перевірки.
