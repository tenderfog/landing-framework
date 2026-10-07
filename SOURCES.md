# Джерела, версії та межі застосування

Це **публічна редакція 1.2.1** універсального playbook. Вона містить публічні технічні джерела, навчальні приклади та узагальнені висновки. Внутрішні специфікації, посилання на задачі й макети, ідентифікатори CRM та записи конкретних середовищ команда зберігає у приватному пакеті свого проєкту.

Обов’язковий стек лендінгів — **Vue 3 + Nuxt 4**. [Технічний стандарт](docs/00-technical-stack.md) описує framework, lifecycle та generated static output. Документація не мігрує чинні акції автоматично; exact dependency versions кожний проєкт фіксує своїм lockfile. API, host-контракти й UI Back Office потрібно повторно перевіряти для підтримуваних версій.

## Базова методологія

| Джерело | Зафіксована версія | Використано |
|---|---|---|
| [onlineTeran/landing_doc](https://github.com/onlineTeran/landing_doc/) | Public snapshot `14f93e5c1f16ff349a52f10ec1c5bd1c2db47030` | discovery, design/copy/assets, product event actions, iframe bridge, analytics ownership, release |
| Узагальнені інтеграційні висновки | [Анонімізований приклад щоденної акції](case-studies/daily-promo.md) | lifecycle, verification, календарний reset, cache, media та popup rendering |
| Узгоджена схема назв аналітичних подій | `ga_{модуль}_{дія}_{елемент/результат}` | naming convention; словник конкретної кампанії, transport і validation suffix потребують окремого погодження |

Пакет не копіює всю документацію upstream і не змінює вихідний repo. Він зберігає правила та приклади для embedded промо. У новій кампанії команда фіксує власну підтримувану версію bridge і звіряє її з host-контрактом; історичний snapshot не гарантує сумісності з майбутніми збірками.

## Primary technical references

- [Nuxt 4 deployment](https://nuxt.com/docs/4.x/getting-started/deployment), [directory structure](https://nuxt.com/docs/4.x/directory-structure), [configuration/baseURL](https://nuxt.com/docs/4.x/api/nuxt-config#baseurl), [client plugins](https://nuxt.com/docs/4.x/directory-structure/app/plugins), [client components](https://nuxt.com/docs/4.x/directory-structure/app/components), [Vue script setup](https://vuejs.org/api/sfc-script-setup.html). Framework mechanics підтверджуються офіційними джерелами; обов’язковість Vue/Nuxt є стандартом цього playbook.
- [Product event-action registry snapshot](https://github.com/onlineTeran/landing_doc/blob/14f93e5c1f16ff349a52f10ec1c5bd1c2db47030/assets/EVENT-ACTIONS.md).
- [Iframe contract snapshot](https://github.com/onlineTeran/landing_doc/blob/14f93e5c1f16ff349a52f10ec1c5bd1c2db47030/IFRAME-BRIDGE-INTEGRATION.md).
- [Smartico public API](https://github.com/smarticoai/public-api), [Client Action](https://help.smartico.ai/welcome/products/tools-and-guides/client-action-event), [deep links](https://help.smartico.ai/welcome/products/tools-and-guides/deep-links).
- [Smartico native integration guide](https://help.smartico.ai/welcome/technical-guides/front-end-integration/ios-android-clients-integration-guide), [native protocol](https://github.com/smarticoai/public-api/blob/main/docs/native/PROTOCOL.md).
- [Smartico template engine](https://github.com/smarticoai/JavaScript-Templates), [official native bridge script](https://libs.smartico.ai/smartico_native_bridge.js).
- [Smartico Popups](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/pop-up) та [deep links](https://help.smartico.ai/welcome/products/tools-and-guides/deep-links): Configuration/Body, optional objects, action hook, `dp:close` в official custom example, supported navigation. [Навчальний Body](smartico-popups/examples/body.html) перевіряється actual `tmpl('_template', params)` зі збереженим публічним runtime `https://libs.smartico.ai/jsi/js/tmpl.min.js`; це fixture compiler evidence, а не підтвердження delivery у Back Office або App.
- [MDN postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage), [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat), [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController), [HTML lang](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/lang).
- Visual/media/native-specific primary links містяться поруч із правилами в [08](docs/08-figma-and-assets.md), [09](docs/09-responsive-ui.md), [10](docs/10-media-animation-webgl.md), [11](docs/11-performance.md) та [07](docs/07-native-webview.md).

## Приватна provenance-картка кожного проєкту

Команда отримує затверджені матеріали від своїх відповідальних осіб і зберігає картку у доступному лише їй просторі. Публічний playbook не підміняє ці джерела.

| Потрібне джерело | Що зафіксувати приватно | Хто підтверджує |
|---|---|---|
| Product specification та правила акції | Approved revision, діапазон дат і timezone, eligibility, outcomes, бюджет і бонусні умови | Product / Legal / CRM |
| Figma та copy | Approved frames, desktop/mobile states, локалі, assets, доступність | Design / Content |
| Host iframe contract | Версія bridge, message schema, auth та profile ownership, allowed origins, scroll/height owner | Web team |
| Product event-action registry | Підтримані route keys та параметри для Web, Swift і React Native; version/build coverage | Platform owners |
| Native popup та routing integration | Підтриманий протокол, WebView lifecycle, deeplink dispatcher і QA evidence | App teams |
| CRM configuration | Mission або Client Action trigger, Journey branches, creative variants, календарний reset, privately stored entity map | CRM owner |
| Analytics contract | Product event vocabulary, destination mapping, platform dimensions, consent та delivery ownership | Analytics / Platform owners |
| Release та QA evidence | Repo/build revisions, environment, cache policy, device/build matrix, rollback і approval | Engineering / QA |

Для кожного запису додати owner, reviewed version, дату перевірки та статус `Contract`, `Observed`, `Example`, `Proposed` або `Unknown`. Не переносити внутрішні URLs, account identifiers, credentials чи raw profiles до публічної документації. Якщо затвердженого контракту немає, позначити це як невідоме, а не вигадувати API або route.

## Уточнення до старих прикладів

| Старий приклад або припущення | Актуальне правило пакета |
|---|---|
| Raw product/external fallback href | Для цього профілю всі navigation links — підтверджений event_action; media/API URLs звичайні. |
| `analytics_event` прямо у canonical bridge | Не існує в чинній schema; forwarding disabled до host/native контракту. |
| User change = завжди reload | Потрібен documented SDK/adapter lifecycle для поточної версії; не використовувати старий identify=true. Reload може бути fallback, не єдина архітектура. |
| Nuxt3, довільний framework або standalone HTML/JS як defaults | Обов’язкові Vue 3 + Nuxt 4; default delivery — generated static output. Corporate target та current CI беруться з repo, Vercel не є обов’язковим hosting. |
| Activation+24h / reload+nextmidnight | Authoritative current cycle + confirmed calendar reset; прострочений consumed record викликає refresh, не новий день. |
| `next_recurrence_date_ts` завжди є в public schema | Поле/units перевіряються в фактичній підтриманій API response; не використовувати як універсально гарантоване. |
| `dp:action` завжди Client Action | Engagement control та named Client Action залежать від handler і explicit contract. |
| `alpha:false` завжди швидше і гарантує WebView black background | Opaque output/dark base перевіряються на реальному GPU/WebView; режим context вимірюється, fallback обов'язковий. |
| Мобільний Chrome = App QA | Потрібні actual WKWebView та Android RN WebView builds. |
| Product `ga_*` name можна напряму віддати Firebase | Swift/Android Firebase резервують `ga_`; підтримати погоджений mapping product event → destination event у measurement adapter. |

## Evidence vocabulary

Contract / Observed / Example / Proposed / Unknown визначені в [discovery](docs/01-discovery-and-sources.md). Прийняття результату користувачем не замінює окремий device/build proof для кожного підтримуваного сценарію.
