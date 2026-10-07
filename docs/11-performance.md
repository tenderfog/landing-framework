# Оптимізація, бюджети та вимірювання

Performance починається з кількості секцій, формату hero й інтеграції, а не з останнього проходу компресора. [Базовий framework](https://github.com/onlineTeran/landing_doc/blob/main/framework/PERFORMANCE-OPTIMIZATION.md) задає напрям; цей playbook розділяє стандартизовані показники, стартові інженерні бюджети й фактичні докази конкретного проєкту.

Пов'язані документи: [обов'язковий stack](00-technical-stack.md), [assets](08-figma-and-assets.md), [UI](09-responsive-ui.md), [media/GPU](10-media-animation-webgl.md), [analytics](12-analytics.md), [QA](13-qa.md), [release/cache](14-release-and-cache.md).

## 1. Що саме вимірюємо

| Шар | Основні виміри | Чому окремо |
|---|---|---|
| Standalone landing | Critical requests/bytes, LCP, CLS, interaction/long tasks | Діагностика власної реалізації |
| Landing в host iframe | Whole host experience + child timing/resources, parent height, page scroll | Header/app shell/SDK можуть домінувати |
| Swift WKWebView | First visual, interaction, video/GPU, memory, lifecycle | Desktop synthetic test не повторює native compositor |
| Android RN WebView | First visual, system WebView/device, decode/GPU, gestures | Версія RN і hardware/profile мають значення |
| Smartico creative | HTML/config transfer, external assets, template compile/render, popup first content | Creative може проходити інший delivery/runtime |

Не називати child-only score оцінкою всього promotion screen. Не порівнювати local dev server із production build. Зберегти build/commit, URL, дату, device, мережу, cache mode, auth/mission/locale state і test duration.

## 2. Розумні стартові бюджети

Core Web Vitals good thresholds — LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1, оцінюються на 75-му процентилі реальних відвідувань. Одиничний лабораторний запуск не є p75; ці критерії не гарантують, що native WebView видасть стандартний browser field dataset. [Google Web Vitals](https://web.dev/articles/vitals).

Byte targets нижче — **початкова пропозиція**, не універсальні обов'язкові межі й не результати заміру. Зафіксувати власні значення у brief з Product/Engineering; складний approved artwork може потребувати іншого бюджету.

| Ресурс/поведінка | Початковий орієнтир | Як підтвердити |
|---|---|---|
| JS початкового екрану, включно з Vue/Nuxt runtime | До ~180 KiB gzip як стартова пропозиція; уточнити для кампанії | Network + build output: runtime, hydration, application code та всі потрібні initial chunks |
| Critical CSS | 15–35 KiB gzip | Build + фактичний transfer |
| Critical fonts | До ~120 KiB | Лише потрібні locale/weights; cold cache |
| Mobile hero poster | ~150–300 KiB | Реальна quality на DPR2/3 |
| Transparent cutout | ~50–150 KiB у потрібному slot | Artifact/alpha QA, не лише bytes |
| Hero video | Project-specific | Poster + video total, decode, visual comparison |
| Перша поява carousel | Visible + 1–2 adjacent columns | Actual requested image URLs, не весь catalog |
| Offscreen animation | Не рендериться активно | Counters/profiler при parent scroll/app background |
| Decorative GPU scene | Measured pixel/FPS cap | Real mobile frame time, input, thermal symptoms |

Недосягнутий бюджет — причина адаптувати рішення або записати узгоджений tradeoff з фактичним виміром. Не оголошувати «оптимізовано» лише за відсотком зменшення master: 90% від 50 MiB лишає 5 MiB.

## 3. Обов'язковий stack і контроль runtime

Нові campaign landing реалізуються на **Vue 3 + Nuxt 4**: Vue SFC, Composition API, `<script setup lang="ts">`. За замовчуванням — static generated deployment під campaign subpath; SSR можливий лише за погодженого hosting contract із підтримкою server runtime. Static output лишається результатом Nuxt build і не означає окрему реалізацію на plain HTML/JS. Фактичні versions, lockfile, build command, output directory та base path записати у brief/contract за [технічним стандартом](00-technical-stack.md).

Framework runtime, hydration code й потрібні chunks входять у performance budget. Не підключати другий Vue/Nuxt bundle або окрему frontend app для тієї самої landing. Three.js та інші додаткові renderer/library не входять у stack за замовчуванням: їх потребу й вартість обґрунтувати виміром. Delivery містить лише потрібний runtime і ресурси.

Host libraries не завантажувати вдруге без потреби. Native socket/SDK не запускати заново в WebView паралельно чинній App integration без архітектурного рішення. Canonical iframe bridge не переписувати задля невеликої UI-правки.

Smartico Configuration/Body лишаються vendor templates зі своїм delivery/runtime; їх не перетворювати на другу Vue app. Swift WKWebView і RN Android WebView лишаються native hosts для Nuxt landing, із власною інтеграцією та вимірюванням.

Звичайні CTA, FAQ і critical copy не чекають декоративного renderer. Mission/profile loading може блокувати саме activation controls, але не заголовок/читабельність сторінки. Складний shader і нижні ігри не мають затримувати critical hero assets.

## 4. Network loading plan

Перед кодом записати порядок:

1. HTML, критичні стилі й достатній static hero/poster.
2. Critical locale/font subset; activation state adapter/read-only status fetch паралельно за contract.
3. Video source за media policy; декоративний renderer після готовності static content.
4. Нижні секції: картинки near viewport, game catalog data незалежно від first paint.
5. Лише interaction-required або майбутні category assets — після дії/наближення.

LCP image завантажувати eager; не ставити `loading="lazy"` на перший великий artwork. Width/height/aspect-ratio зменшують layout shift. `fetchpriority="high"` або preload давати лише реальному critical resource, не кожній картинці. Native browser lazy loading має власні distance heuristics; для багаторядного loop carousel додатково перевіряти потрібні images у фактичному host. [Browser-level lazy loading](https://web.dev/articles/browser-level-image-lazy-loading).

Не preload весь каталог, обидва desktop/mobile video й усі locales/fonts одночасно. `preload="metadata"` не є строгим byte cap: поведінку медіа браузер визначає сам. Якщо вимога — не завантажувати motion при reduced motion/Save-Data, не приєднувати source до video до вибору policy. Save-Data API недоступний усюди; відсутність сигналу не доводить необмежену мережу.

## 5. Картинки, шрифти та decode memory

Для кожного artwork — source/delivery register, dimensions, alpha, actual bytes і encoder options. Raster formats обирати виміром: WebP як поширений fallback, AVIF там, де зменшення ваги й decode/quality виправдані; SVG для справжнього vector. Не змушувати raster photo у SVG wrapper.

`srcset`/`sizes` та art-direction `<picture>` перевіряти з Network currentSrc, а не тільки візуально. Великий intrinsic size не завжди краще: mobile DPR3 картинка для маленького декоративного об'єкта може з'їсти більше пам'яті без видимого ефекту.

Усі fonts — потрібні сімейства/weights/glyph ranges; WOFF2, права й source записані. Subset мусить містити всі підтримані локалі, українські ґ/є/і/ї, валютні знаки та потрібну пунктуацію. `font-display:swap` потребує перевірки line breaks/CLS до й після font load; не гарантує нульовий shift.

Стиснені bytes ≠ decoded memory. Оцінювати images/atlases як pixels×4 плюс накладні витрати; frames, copies і GPU textures додаються. Карта ігор, продубльована DOM для loop, не повинна примусово декодувати всі картинки на init.

## 6. Animation/GPU budgets

Prefer transform/opacity для простого декоративного motion. Великий blur/filter, animated mask, transparent full-page layers, shadow repaint і `mix-blend-mode` вимірювати на mobile. `will-change` на всіх секціях може підвищити layer memory; застосовувати лише за доказом.

Video pause поза screen, shader cancel RAF при hidden/offscreen, carousel pause під час interaction. Не вимірювати лише FPS renderer: UI може лагати через main-thread layout while shader виглядає плавним. Дивитися responsiveness при tapping/scroll/FAQ, long tasks і native frame drops. Детальна policy/fallback у [10-media-animation-webgl.md](10-media-animation-webgl.md).

Для довгого iframe перевірити total CSS height та GPU canvas pixels. Renderer на весь документ має бути pixel-capped або поділений на локальні сцени. Не масштабувати canvas до full document × devicePixelRatio без ліміту. CSS fallback на слабкому GPU — допустимий результат, якщо visual hierarchy збережена.

## 7. Відтворюване вимірювання

Мінімальний lab plan:

- Production Nuxt generated output із тими самими campaign base path та asset/chunk URLs, що на Stage; для погодженого SSR — фактичний production server build.
- Cold cache та warm cache окремо; щонайменше декілька повторів, median/range.
- Mobile network/CPU profile з назвою preset або фактичним пристроєм; не змішувати throttle й справжню мережу без позначки.
- Guest, authenticated unknown/loading, available, consumed, unverified/error; повільні/відхилені API.
- Перша секція, scroll до carousel/FAQ, 2–3 хвилини motion, foreground/background.
- Reduced motion, media autoplay rejection, renderer fallback.
- Real iOS/Android App build із зафіксованим OS/system WebView/device; simulator окремий рядок.

Приклад звіту, числа заповнюються після тесту:

| Measure | Target | Actual | Conditions | Decision |
|---|---:|---:|---|---|
| Critical transferred assets | ___ KiB | ___ KiB | Cold / locale / mobile | Pass / tradeoff |
| Landing initial JS gzip, включно з Vue/Nuxt | ___ KiB | ___ KiB | Commit ___ / versions ___ / initial chunks ___ | ___ |
| LCP lab median/range | ___ ms | ___ ms | Device/network/runs ___ | ___ |
| Field LCP p75, якщо є | 2500 ms | ___ | Dataset/date/scope ___ | ___ |
| Layout shift | ≤0.1 | ___ | Hero font+video loading | ___ |
| Game images before section | ___ | ___ | Real parent-scroll embed | ___ |
| Smoke frame/input cost | ___ | ___ | App ___ / GPU mode ___ | ___ |
| Native repeated open memory | ___ | ___ | Cycles ___ | ___ |

Build report не містить tokens, customer profile payload або credentials. Performance telemetry прив'язувати до дозволеної analytics schema й consent, див. [12-analytics.md](12-analytics.md).

## 8. Delivery та кеш

Static generated production output — allow-list used HTML/CSS/JS/fonts/images/video/config із фактичного Nuxt output directory, а не копія всієї робочої папки. Перевірити asset/chunk paths під campaign subpath. Погоджений SSR доставляється за окремим server hosting contract. Не постачати original MP4/PNG, node_modules, screenshots, source dumps, access files, старі assets у static public delivery.

Stable entry URL важливий для промо CMS/App. HTML має revalidate відповідно до hosting contract; hashed/versioned assets можуть кешуватися довго. Новий asset filename/вміст version додається до нового HTML; Stage перевіряється через старий canonical URL, без постійної вимоги змінювати iframe query вручну. Cache error діагностувати headers/version/resource bytes, не лікувати тільки «ще раз Ctrl+F5». [Release/cache guide](14-release-and-cache.md).

Smartico creative не включає великі base64 art/font у dynamic template за замовчуванням. Це збільшує transferred HTML, compile string і дублює кешовані ресурси. External approved asset URLs + configurable params дозволяють reuse. Template engine має власні syntax delimiters; мінімізація CSS повинна лишатися сумісною з ним, див. [Smartico templates](06-smartico-popup-templates.md).

## 9. Умови приймання

- Немає unused masters/raw у delivery; кожен critical ресурс має обґрунтовану loading policy.
- Vue 3 + Nuxt 4 versions, lockfile, build/output/base path зафіксовані; runtime і потрібні chunks включені у measured JS budget.
- Реальні bytes, dimensions, cache headers, responsive currentSrc і MIME зафіксовані.
- Critical UI не чекає shader/нижнього catalog, activation UI чекає обов'язковий state.
- Desktop/mobile/tablet/landscape не дають overflow/layout collisions.
- Hero poster race перевірений cold і warm; звук, inline, fallback працюють.
- Carousel перед наближенням не вантажить увесь catalog; lazy працює при parent scroll.
- Motion/GPU зупиняється в неактивному screen; repeated navigation не множить loops/resources.
- WebView має actual-device evidence або явно позначений remaining test, а не успадкований Chrome pass.
- Звіт відрізняє lab/field/child/host/native; кожне твердження «швидко» має умови вимірювання.
