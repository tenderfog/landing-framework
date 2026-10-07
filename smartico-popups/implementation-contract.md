# Спільний контракт реалізації Smartico Popup

Цей документ застосовується після [Figma-сценарію](from-figma.md) або [самостійного проєктування](from-brief.md). Він фіксує, що саме зробити, перевірити й передати. Точні API, BO fields та syntax взяти з вашого runtime і [технічного runbook](../docs/06-smartico-popup-templates.md).

## 1. Паспорт компонента

Записати template ID, якщо він існує, середовище/label/brand, campaign owner, джерело copy, locales, compatible visual states, hosted asset origins і цільові Web/App builds. Не переносити ID, state names, суми бонусів або дати з іншої кампанії.

Визначити зовнішню форму: contained dialog або fullscreen. Для fullscreen власник outer SDK iframe/native WebView підтверджує viewport, safe areas, scrolling, scaling і close/back policy. `position:fixed` усередині Body не збільшить обмежений outer frame. [Native host](../docs/07-native-webview.md).

## 2. Перетворити дизайн на параметри

| Дані | Де визначаються | Як використовуються |
|---|---|---|
| Layout, spacing, typography, допустимі skins | Body + за потреби контрольовані Configuration fields | Стабільна структура; довільний CSS від редактора не потрібний |
| Locale, title, description, accessible labels | Configuration → значення creative | Escaped live text, перевірені переклади |
| Icon/decor/background URLs | Configuration → значення creative + asset register | External HTTPS ресурси, без великих base64 |
| Button visibility, label, action; explicit X | Configuration → значення creative | Optional flag та підтриманий href hook |
| Outcome, bonus amount, cycle, grant, caps | Journey / підтримана серверна механіка | Body лише показує надане значення; не генерує результат |
| Entrance/motion flag | Configuration або зафіксоване рішення компонента | Reduced motion і дешевий static fallback |

Зберігай ключі однаковими у Configuration, Body, values та tests. Кожне використане поле має бути описане; невикористані поля прибирай. Окремо документуй reserved runtime fields і власні custom names, якщо вони є. Не називай custom `layout` чи `icon_url` універсальними системними полями Smartico.

### Optional і defaults

Визначити precedence для кожного поля, а не покладатися на JavaScript truthiness. `checked:false` завжди вимикає блок; рядки `"false"` і `"true"` не є boolean. `optional_default` задає UI default у BO; реально отриманий payload перевіряється окремо. Точний payload optional block з вашого BO зафіксувати в sanitized fixture.

У [навчальному прикладі](examples/README.md): missing optional block вимкнений, лише `{ "checked": true }` увімкнений; missing/blank title отримує нейтральний locale fallback; blank description приховує абзац; blank action приховує кнопку навіть з enabled flag. Для production creative обов'язковий copy не повинен мовчки замінюватися fallback — це перевіряє pre-release validation. Legacy params підтримувати тільки за явним compatibility contract.

## 3. Таблиця actions до верстки

| Елемент | Потрібно записати |
|---|---|
| Primary / secondary | Видимість у state, текст, exact `dp:*`, connector і наступна серверна/навігаційна дія |
| X | Звичайний dismiss чи explicit business action; доступний label повинен описувати наслідок |
| Backdrop / Escape / native Back | Хто обробляє, можна чи ні закривати, чи викликається engagement event |
| CTA до бонусів / гри / категорії | Підтриманий `dp:go` → продуктовий `event_action`, Web та native route coverage |

`dp:ok`, `dp:cancel` та custom engagement controls мають ту поведінку, яку налаштували Journey/handler. Самі назви не означають «нарахувати» або «програти». Якщо X і «Забрати» мають однаковий результат, налаштувати explicit accepted click branches до одного grant; не видавати бонус у Body і не вважати пасивне teardown підтвердженням натискання. Локальний first-click guard не забезпечує server idempotency.

Показ, click, grant success і destination navigation — різні події. Не позначати click як successful bonus; не створювати новий analytics transport у Body. Naming, platform/device params, consent і Firebase mapping — у [analytics contract](../docs/12-analytics.md).

## 4. Правила Body

- Живі текстові елементи, escaped interpolation, responsive grid за кількістю видимих buttons. Одна кнопка займає власний завершений рядок; нуль кнопок прибирає actions container.
- Декор не перекриває pointer targets. Складні skins — CSS або 3/9-slice з живим label; цілі bitmap buttons з текстом не розтягуються.
- Title/description не обрізаються при довгому перекладі, 200% text zoom або низькому landscape viewport. Dialog може scroll; controls доступні.
- Тільки scoped CSS; overrides внутрішніх SDK roots допустимі після перевірки конкретного wrapper. Не поширювати case-specific DOM hacks на всі попапи.
- Літеральні `%}` / `{%` після minify не конфліктують із delimiter. Actual `tmpl('_template', params)` перевіряється після фінального export; custom JS не закриває зовнішній raw-text script element.
- Ресурси зовнішні та кешовані, icon dimensions відомі. Motion не потрібний для змісту, пауза/cleanup відповідають lifecycle. WebGL додається лише за виправданого ефекту, з fallback і actual GPU/WebView evidence.

Деталі [responsive](../docs/09-responsive-ui.md), [media/motion](../docs/10-media-animation-webgl.md), [performance](../docs/11-performance.md), [security](../docs/17-security.md).

## 5. Матриця перевірки

| Перевірка | Мінімальний доказ |
|---|---|
| Configuration ↔ Body ↔ values | Повні ключі та strict типи, без дубльованих field names |
| Actual compiler | Engine source/hash, template-ID path, всі states/locales, minimal та missing optional params |
| Literal regression / escaping | Контрольований `%}` failure і safe CSS pass, HTML/script-like strings відображаються текстом |
| 0/1/2 buttons + X | Нуль, primary-only, secondary-only, дві; explicit false/missing; кожна close-комбінація |
| Assets | Видимий root без blank screen, uncached/cached loading, image/font failure, bytes/CSP/CORS |
| Desktop / mobile / low height | Дизайн, touch targets, no overflow, live labels, 200% zoom, reduced motion |
| Actions | Перший click доходить один раз, exact connector, серверний результат, route; mixed double clicks |
| Real native | WKWebView і RN Android build, handshake + visible rendered content + action handling + native Back |
| Save / delivery | Re-open saved Body, hash/bytes, creative використовує потрібний template, delivered payload відповідає values |

Fixture compiler check не тестує actual SDK hooks, grants, browser focus management, asset network, WebView sizing або hardware performance. У release record не об'єднувати ці результати в один «все працює». [QA](../docs/13-qa.md).

## 6. Передача та подальші зміни

Передати Configuration, Body, values per state/locale, asset register, action table, джерело дизайну, QA і delivery inventory. У BO зберегти потрібний template, створити/оновити creatives, перевірити їхні fields, підключити actual IDs до Journey. Publish/deploy виконати в межах авторизації поточної задачі; методологія сама не дозволяє live release.

Copy або icon-only update змінює values відповідного creative; structural update змінює Body й перевіряє всі creatives на цьому template. Новий action потребує перевірки Journey/host router. Новий locale потребує точного copy, fonts/assets і QA, навіть якщо template не змінився. Shared assets не видаляються, поки ними користуються активні campaigns. [Release record](../templates/release-record.md).
