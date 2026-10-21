# Діагностика: симптом → шар → доказ → виправлення

Спочатку визначте шар, який зламався. Не змінюйте backend recurrence, native socket або весь дизайн лише тому, що UI показав помилку.

Поглиблені випадки з наступних інтеграцій: [incident catalog і modal cleanup](22-incidents-and-popup-cleanup.md). Перед копіюванням старого workaround перевірити [active source/product profile](20-product-profiles-and-investigation.md) та [поточну Smartico KB](../smartico-knowledge/README.md).

Позначення: **інцидент** — причина підтверджена в нашій співпраці; **сценарій перевірки** — можливий випадок, який потрібно довести у новому проєкті. Підтверджений інцидент не означає, що кожний схожий симптом має ту саму причину.

## 1. Безпечний діагностичний пакет

Для багу потрібні exact build/asset marker, host/landing URL без secrets, surface, browser або App build/OS/device/WebView version, locale, fixture alias, час кампанії + UTC, expected/actual, sanitized evidence та preconditions.

Не логувати token, raw profile, email, user ID, socket auth payload чи URL з credentials. У Web перевіряйте відповідний frame context; в App — відповідний native/WebView layer. Використовуйте обмежені DOM/network observations, а не private host store або cross-origin SDK introspection.

Карта шарів:

```text
publication/cache
 → HTML/assets/render
 → host iframe/WebView contract
 → product auth/profile
 → Smartico identity/API
 → mission/Journey
 → popup template/native bridge
 → product event-action router
```

## 2. Host, URL, кеш та layout

| Симптом | Шар і статус | Що зібрати | Виправлення після підтвердження |
| --- | --- | --- | --- |
| Promotion показує skeleton, direct landing працює | URL/redirect; **інцидент** | Actual iframe `src`, redirect chain, query до/після | Canonical directory URL зі slash або правильний redirect, який зберігає auth/locale/theme/parentOrigin |
| Після deploy лишився старий UI | Cache; **інцидент** | HTML marker, script URLs, response headers, actual iframe DOM, job SHA | HTML revalidation + versioned assets + scoped CDN invalidation; не вимагати постійного ручного CMS cachebuster |
| Новий JS падає зі старим HTML | Mixed versions; **сценарій перевірки** | DOM IDs, served HTML/scripts, lifecycle | Узгоджений cache rollout; мінімальна потрібна backward compatibility, не безмежний legacy framework |
| Після згортання FAQ велика порожня область | Height/root; **інцидент** | Actual root height, child viewport height, sent height, parent iframe height після transition | Вимірювати content root і надсилати settled shrink через existing height contract; не змінювати canonical bridge |
| Ігри/дим обрізані «по контейнеру» | Layout; **інцидент** | Width/overflow ancestors, root/content/decor layers | Full-width decorative/carousel layer поза max-width content container; текст лишається у читабельній ширині |
| Sticky/sound button не рухається з видимим viewport | Scroll ownership; **сценарій перевірки** | Хто реально скролить, iframe height, host overlays | Host-owned control, approved viewport contract або scene-local positioning; standalone fixed не доводить embed behavior |
| Fullscreen popup все одно маленький | Parent/native container; **інцидент** | Dimensions popup frame та ancestors, presentation config | Виправити outer container/presentation через підтриманий Smartico/host механізм; child `100vw` не виходить за iframe |

Після cache fix перевіряйте старий canonical URL знову. Серверний header сам не видаляє стару свіжу відповідь у браузері до network request. Водночас hard reload одного тестера не доводить здорової політики кешу для всіх users.

## 3. Авторизація та eligibility

| Симптом | Шар і статус | Доказ | Виправлення |
| --- | --- | --- | --- |
| Спочатку активні кнопки, потім cooldown | Initial render; **інцидент** | Перший HTML/paint, повільний SDK/API | Loading state існує вже в HTML; не показувати activation controls до authoritative status |
| Auth=true, але mission API не готовий | Identity/bootstrap; **сценарій перевірки** | Token admission, origin, SDK online/identify, schema/error categories | Дотримати init order; query не замінює trusted identity; timeout і людський error state |
| Get missions timeout виглядає як гість | Whitelist/SDK; **сценарій перевірки** | Landing origin у label whitelist, identify outcome | Виправити whitelist/config; не переключати на guest лише через authenticated API failure |
| Неверифікований може активувати місію | Profile gate; **інцидент** | Actual product rule, normalized verification, opt-in calls | Read-only product profile/limits за чинним контрактом; verification action замість opt-in; backend eligibility окремо |
| Email підтверджено → UI вважає verified | Rule inference; **сценарій перевірки** | Host rule/source, required docs/contact/limits | Не вгадувати eligibility з одного поля; використовувати approved normalized rule |
| Logout/account switch повертає стан старого user | Async race; **сценарій перевірки** | Request generation/identity, response ordering | Abort + generation/identity guard; старі відповіді відкинути, state очистити |
| Error state висить безмежним spinner | State machine; **інцидент** | Timeout/schema/SDK path, rendered status | Скінченний loading budget, retry й fail-closed; не відкривати participation через помилку |

Verification rules можуть різнитися між продуктами. Не копіюйте приватні endpoint/schema/hash assumptions із кампанії без [discovery](01-discovery-and-sources.md). App token може мати іншу сумісність API: real native read потрібен окремо.

## 4. Countdown і місія

| Симптом | Шар і статус | Доказ | Виправлення |
| --- | --- | --- | --- |
| Верхній/нижній час різний | Два UI deadlines; **інцидент** | Deadline/tick source, timezone, foreground timestamp | Один normalized deadline/tick для всіх countdown |
| Нова спроба через 24 години після activation | Backend recurrence або UI; **інцидент** | Actual mission recurrence settings + server-cycle timestamp | Узгодити daily calendar reset, не rolling24h; UI календарна північ не виправляє backend config |
| Після півночі reload знову показує 23h | Stale consumed response; **інцидент** | Серверний cycle timestamp, API cache TTL, попередній deadline | Утримувати завершений deadline поточного cycle, refresh/backoff; не будувати новий deadline від часу відповіді |
| Timer zero, кнопка ще недоступна | Server authority; **сценарій перевірки** | Місія до/після reset, configured timezone, stale API cache | Loading/rechecking state; доступ повертається лише authoritative renewal |
| Користувач хотів спробу о 00:10, з'явилась вдень | Client/backend separation; **інцидент** | Exact timestamp, UI status, API state, reset rule | Визначити, чи rolling backend, чи stale client/API; виправляти доведений шар, а не косметичний timer |
| Після DST reset став о 01:00 | Fixed UTC config; **сценарій перевірки** | UTC daily reset і timezone на обидва DST sides | Native timezone support або погоджене operational UTC adjustment; календарні тести 23/25h |

Не розблоковуйте frontend за нулем timer і не викликайте mission API повторно на кожному tick. Час кампанії має бути IANA timezone, а не вічний UTC offset. Див. [стани/час](04-state-and-time.md) та [mission runbook](05a-smartico-mission-runbook.md).

## 5. Popup: відрізнити delivery від rendering

Порядок перевірки:

1. Чи Journey вибрав правильну branch і creative?
2. Чи socket/Web SDK отримав popup engagement?
3. Чи завантажено actual popup URL і passed handshake?
4. Чи template **скомпілювався**, root містить DOM і стилі доступні?
5. Чи art/font завантажилися з popup origin?
6. Чи click/close потрапили у правильні handlers і business branch?

| Симптом | Шар і статус | Доказ | Виправлення |
| --- | --- | --- | --- |
| Чорна модалка, але native handshake/impression пройшли | Template; **інцидент** | `tmpl()` exception, порожній root, generated JS | Розірвати literal `%}`/`{%` collisions у CSS/markup; actual-engine compile matrix перед publish |
| Static preview добрий, Smartico порожній | Engine/data; **сценарій перевірки** | Actual published template + actual params + engine | Перевірити actual template compiler, не окремий HTML mock |
| Template великий, compile і load повільні | Embedded assets; **інцидент** | Body bytes/gzip, base64 assets/fonts | Винести assets у HTTPS URLs/config params; versioned files, asset/font CORS/CSP QA |
| Impression є, але контент невидимий | Render; **інцидент** | Root visibility/content, template exception, CSS/asset failures | Handshake PASS лишити як окремий факт; render FAIL виправити в creative layer |
| Claim через close не працює або дублюється | Button/Journey semantics; **сценарій перевірки** | `dp:ok`/`dp:cancel` callbacks і server issue count | Exact approved close mapping, server idempotency, не навігація замість claim |
| Journey popup з'явився всередині landing iframe | SDK ownership; **сценарій перевірки** | Який SDK session/контейнер показав popup | Погоджене parent/native ownership і підтримана suppression/routing; не cross-origin parent access |

Те, що розробник App підтвердив native handshake, не означає потреби переписати його. У підтвердженому інциденті fix був у Smartico template. Але після fix усе одно потрібен actual App render regression.

## 6. Event actions та native routing

| Симптом | Шар і статус | Доказ | Виправлення |
| --- | --- | --- | --- |
| Гість потрапляє на registration page замість modal | Wrong action; **інцидент** | Product action registry і actual destination | Використати modal auth event action, не прямий route |
| Bonus CTA працює у Web, у App відкриває браузер/нічого | Native router; **сценарій перевірки** | Nested `dp:go` URL, event-action dispatcher, actual native branch | Універсальний Smartico deep-link adapter передає approved `/event_action/...` у App dispatcher |
| Popup bonus button працює, Journey navigation ні | Різні sources; **сценарій перевірки** | Popup `bcid:4` та socket `cid:105` paths | Обробити обидва шляхи однаковим роутером без duplicate navigation |
| Гра/категорія відкривається не та | Action config; **сценарій перевірки** | Exact term/subsection і product registry | Central action config + correct term; не з display title й не guessedslug |
| PDF не відкривається у WebView | Handler/support; **сценарій перевірки** | Approved rules URL, event-action encoding, native PDF/external policy | Погоджений rules action і viewer; не обхід довільним window.open |

Не замінюйте `dp:ok` / `dp:cancel` через проблему native navigation. Не вигадуйте undocumented route. App router change не можна виправити лише лендінгом, якщо підтриманого handler справді немає. Потрібен [native contract](07-native-webview.md).

## 7. Відео, smoke та мобільний performance

| Симптом | Шар і статус | Доказ | Виправлення |
| --- | --- | --- | --- |
| Відео грає, poster поверх | Cached media lifecycle; **інцидент** | Actual readyState/paused/ended після listeners/play | Sync existing playback state, не чекати лише future `playing`; paused/error лишає poster |
| Poster зник завчасно, чорний hero | Readiness; **сценарій перевірки** | Load/play/error events, rendered frame | Прибирати після ready playback, restore на error/emptied; manual start при blocked autoplay |
| Smoke у Swift сірий/синій прямокутник без чорного фону | GPU compositing; **інцидент з native повідомлення** | Actual WKWebView capture, canvas context options/output alpha | Для відповідної dark scene preblend RGB з brand background і opaque output; actual-device retest обов'язковий |
| Видно лише fallback, не WebGL | Capability/probe; **інцидент** | Context/shader/link/first draw status, script version | Safe render probe, ready лише після success; fallback не прибирати до успішного draw |
| Вимкнули WebGL — і зник фон/контент | Fallback layering; **сценарій перевірки** | Canvas/fallback layering, error route | CSS/static base завжди існує; SVG/static проміжний fallback; business UI незалежний |
| Shader легкий по bytes, телефон гріється | GPU budget; **сценарій перевірки** | Frame time, buffer pixels, FPS, hidden/offscreen work | Cap pixels/FPS, не множити buffer безмежно на DPR, stop lifecycle, simplify shader |
| Smoke лізе під hero/video | Scene boundary; **інцидент** | Container geometry/z-index | Separate scene-local smoke layer після Hero, не global overlay всієї page |
| Мобільний декоративний title нечіткий | Export/DPR; **інцидент** | Original dimensions, CSS size, DPR, compression | Правильний export/variant з Figma; не upscale low-res asset; lossless лише за реальним visual benefit |

Opaque smoke fix доречний для scene, яка за дизайном має непрозорий background. Це не універсальна вимога зробити кожний WebGL canvas непрозорим. Для transparent compositing іншого дизайну потрібно окреме рішення і device evidence.

## 8. Карусель, анімації та FAQ

| Симптом | Доказ | Мінімальне виправлення |
| --- | --- | --- |
| Усі game covers вантажаться на старті | Network waterfall, initial DOM `src`, cloned cards | Visibility/near-view loading, preload лише потрібного, one asset policy для copies |
| Карусель не зупиняється при focus/touch | Input/lifecycle handlers | Pause hover/focus/gesture/hidden/offscreen; reduced motion stop |
| Стрілка біла на жовтому hover | Actual icon fill/currentColor | State token foreground чорний; touch controls доступні без hover |
| Доступна кнопка перестала пульсувати після hover | Competing transform/animation | Окремі wrappers і один owner властивості; не shorthand animation override |
| Disabled choice досі масштабується/пульсує | Actual classes/CSS state | Disabled selector відсікає hover і loop; don't hide approved controls випадково |
| FAQ content обрізаний після font/locale change | Content scrollHeight/rootheight | Recalculate target height, settled reporting; keyboard/ARIA і один-open rule за spec |

## 9. Після виправлення

Зафіксуйте root cause, source diff, affected scenarios, actual test level, release marker і residual risks. Повторюйте лише affected checks плюс потрібний integration smoke; не витрачайте час на безкінечний повний rerun без нових змін.

Якщо той самий workaround з'явився у двох кампаніях, винесіть його у версіонований спільний adapter із контрактом/тестами. Не форкайте canonical bridge тихо в кожному landing.

Споріднені документи: [QA](13-qa.md), [release/cache](14-release-and-cache.md), [state/time](04-state-and-time.md), [media/WebGL](10-media-animation-webgl.md), [security](17-security.md).
