# Legacy Smartico popup: Configuration, Body та actual runtime

Це канонічний технічний runbook **підтриманих legacy templates**. Спочатку обрати [Vibe/legacy authoring](../smartico-knowledge/04-popups-and-routing.md); legacy compiler не перевіряє Vibe output. Дизайн робиться [за Figma](../smartico-popups/from-figma.md) або [за brief](../smartico-popups/from-brief.md), deliverables і acceptance визначає [спільний контракт](../smartico-popups/implementation-contract.md). Реальні parser/click/override баги й cleanup зібрані в [каталозі інцидентів](22-incidents-and-popup-cleanup.md).

## 1. Template, resource і параметри

Template містить DOM/CSS та схему полів, resource/creative — content values і actions; Journey визначає source outcome, branch і grant. Одна compatible anatomy може обслуговувати кілька states/locales. Інша сума/title/icon не вимагає нового template, принципово інша структура може вимагати його.

У поточному BO знайти existing template та всі bound resources/variations. Орієнтири legacy UI — Marketing → Templates → Popup і Assets → Popup; точні меню перевірити у вашому label. Для виправлення чинного popup змінювати actual entity: новий непідключений ID не виправить його delivery.

| Шар | Контракт |
|---|---|
| Configuration | Унікальні field names/types, optional groups, editor defaults |
| Body | Читає params через `o`, задає scoped layout, escaped text і vendor hooks |
| Resource values | Exact copy/art/actions/flags для погоджених state/locale |
| Variation selection | Conditions, active/default fallback за [content variation contract](../smartico-knowledge/04-popups-and-routing.md) |

`visual_state`, `locale`, `icon_url`, `primary_text` тощо — custom поля прикладу, не reserved API. Всі використані поля повинні існувати в Configuration; видалення поля потребує inventory старих overrides і consumers.

### Optional, missing values та precedence

- `checked:false` вимикає блок; рядок `"false"` не boolean. Не використовувати loose truthiness для flags.
- `optional_default` задає default редактора BO; реальну serialization params перевірити окремим sanitized fixture.
- Effective creative values можуть перекривати Configuration defaults. Спочатку перевіряти їх, а не лише локальний Body.
- Missing optional decoration може зникнути; missing required copy/action — pre-release error, а не default виграш.
- У runnable example лише `{ "checked": true }` вмикає optional group; missing group вимкнений, blank description приховує paragraph, blank action приховує button. Required title перевіряється до release, навіть якщо runtime має neutral fallback.
- Старі param shapes підтримуються тільки за явним compatibility contract.

**Один канонічний кодовий комплект:** [Configuration + Body + values + checker](../smartico-popups/examples/README.md). Він замінює неповні snippets у дизайн-runbooks. Values JSON є реєстром полів, не гарантованим REST/BO import.

## 2. Escaping і actual template compiler

Primary reference — [Smartico fork Blueimp engine](https://github.com/smarticoai/JavaScript-Templates). Перевірка ручного HTML з підставленими values не перевіряє vendor assembly.

Текст і href інтерполюються escaped `{%=...%}`; raw `{%#...%}` не застосовується до неперевіреного контенту. HTML escaping не є allowlist для URL scheme/origin, CSS values або dynamic HTML. До export перевірити actions та resource URLs за contract; дані не можуть містити tokens/secrets.

Після **кінцевої** мініфікації/export:

1. Зафіксувати trusted delivered compiler URL/version/hash і wrapper. GitHub head не гарантує CDN bytes; для старого wrapper відтворити саме його перевірену версію.
2. Викликати `tmpl('_template', params)` через actual template element/DOM assembly, не лише `tmpl(body, params)`.
3. Перевірити всі states/locales, minimal/missing/null/escaped/long values, 0/1/2 actions і explicit optional=false.
4. У literal CSS/HTML/JS не допустити випадкових `{%` / `%}`. Приклад небезпеки — minified `height:100%}`; safe literal `height: 100%; }`. Не робити глобальну replace, що руйнує справжні template blocks.
5. Якщо Body вкладено у `<script type="text/x-tmpl">`, literal closing script tag не має завершити outer raw-text element до compilation. Custom JS потребує перевіреної template-safe assembly; перевіряти source і rendered output окремо.
6. Підтвердити nonempty root, exact texts/actions і відсутність compile/runtime errors. Для affected JavaScriptCore issue додати перевірку відповідної engine family за [incident recipe](22-incidents-and-popup-cleanup.md).

Два відтворені parser механізми, original-delivery proof limits та мінімальні патчі описані тільки в [каталозі інцидентів](22-incidents-and-popup-cleanup.md). Local engine PASS не перекреслює фізичний failure.

## 3. Assets та budget

Art/fonts віддавати перевіреними зовнішніми HTTPS URL через values/defaults; великі embedded base64 збільшують compilation input, дублюються в creatives й не кешуються окремо. Зберігати dimensions, source/derivative і locale у [asset register](../templates/asset-register.md).

Перевірити content type, origin allowlist/CSP, font CORS, cold/warm loading і URL lifetime. Навігаційне правило event_action не застосовується до `img src`, fonts/video/API resource requests. Hashed assets можуть мати довгий immutable cache; змінні Body/config мають власний update policy. Shared assets не видаляти без inventory активних consumers.

Вимірювати окремо Body/config bytes і gzip, external critical transfer, decoded media memory та runtime/GPU work. Локальний gzip не доводить фактичний SDK transfer size. Розмір або бюджет старої модалки не є default наступної.

## 4. Vendor hooks і один sender

Для підтриманого legacy HTML hook використати `href` + `data-ao-hide-popup="true"`; зберегти exact `dp:*`, які очікує Journey. Не виконувати ту саму дію паралельним `_smartico.dp()` listener або парою touch/click senders. Engagement click, named Client Action й product navigation розрізняються в [routing KB](../smartico-knowledge/04-popups-and-routing.md).

Guard допускається лише за перевіреної propagation/recovery policy: перший click доходить до штатного handler; повторні mixed clicks не запускають другу операцію. Permanent latch до vendor acceptance може позбавити користувача retry. Guard не забезпечує server cap/idempotency й не підміняє socket report; правильна policy та conflicting incidents — у [22](22-incidents-and-popup-cleanup.md).

Весь видимий CTA — semantic hit target; decorative descendants не перехоплюють pointer events. Native Back/backdrop/Escape та focus/scroll cleanup належать outer host. Explicit close-and-claim виконується лише через погоджений control, а не passive teardown. Для навігації використати supported `dp:go`→event_action route і [native dispatcher](07-native-webview.md); новий analytics producer у Body не додається без чинного [collection contract](12-analytics.md).

## 5. Responsive content та outer bounds

- Живі labels, `minmax(0, 1fr)`, content width із spec, safe areas і scrollable overflow для довгого/низького viewport.
- Grid залежить від actual count: 0 прибирає actions container, 1 має завершений рядок, 2 — погоджені columns/stack. Breakpoint визначає content width, не UA.
- Decorative skin: пропорційні caps, stretch/repeat middle, окремий ornament і live label. Довгий текст збільшує висоту; bitmap із текстом не розтягується.
- Fullscreen перевіряється outer SDK/native view → wrapper → creative. Child `100vw`, `position:fixed` і z-index не розширюють outer frame.
- Scoped overrides конкретного wrapper допускаються після огляду. Відомий root `#__root_centered`, shrink-wrap/zoom чи `fitscale` — implementation detail, не універсальний public API; не переносити global DOM hacks і не вимагати `:has()` без support matrix.
- Ніякого подвійного scaling, що зменшує текст/targets. Motion не блокує зміст/controls; reduced motion і static fallback обов'язково перевірити. WebGL не копіюється з landing автоматично.

Загальні [responsive/a11y](09-responsive-ui.md), [media/performance](10-media-animation-webgl.md) та [localization](16-localization.md) правила застосовуються без повторної копії в кожному дизайн-процесі.

## 6. Save/readback/delivery

Передача та єдина acceptance matrix — [implementation contract](../smartico-popups/implementation-contract.md). Для legacy save Configuration+Body в потрібний template, values у всі потрібні resources/variations; re-open/download і звірити bytes/hash/effective params. BO Preview, fresh Web Send Preview й actual Swift/RN delivery мають окремі результати.

Старий відкритий popup може виконувати старий код. Нова локальна Body не змінює saved defaults/overrides або вже доставлений engagement. Звіряти template/resource links кожної activity; compiler/visible DOM, click/connector, grant/failure і route доводяться окремо.
