# Обов’язковий технічний стек: Vue 3 + Nuxt 4

Вимога власника продукту від **07.10.2026**: промо-лендінги за цим playbook реалізуються на **Vue 3 та Nuxt 4**. Це стандарт реалізації, а не один із варіантів. Nuxt 3, окремий React/Vite application або самостійний HTML/JS лендінг не є альтернативним стеком для нової акції.

Вимога описує вебконтент продуктового лендінгу. Swift `WKWebView` та React Native Android залишаються його нативними hosts. Smartico popup має власний vendor runtime: Vibe Studio для нових popup за актуальними docs або Configuration JSON + Body HTML/CSS для підтримуваних legacy templates; їх не замінюємо Nuxt-сторінками. Віджети всередині наявного frontend використовують його contract/stack; окремий entry погоджується за [surface workflow](19-surfaces-and-workflows.md). Старі case studies і framework-independent helpers — джерела досвіду та логіки, не стартовий application іншого стеку. Зміна документації сама по собі не мігрує вже опубліковані акції.

## 1. Склад і правила вибору залежностей

| Шар | Стандарт |
| --- | --- |
| UI | Vue 3 Single-File Components, Composition API, `<script setup lang="ts">` |
| Application та збірка | Nuxt **4.x**, його штатний build pipeline; без другого application bundler |
| Типи | TypeScript: props, campaign config, normalized states, підтверджені adapter contracts |
| Стилі | CSS: design tokens, responsive layout, scoped component styles; глобальні background/reset/font rules централізовано |
| Стан | Vue `ref` / `computed`, composables; Nuxt `useState` для безпечного серіалізованого стану, коли він справді спільний |
| Content | Campaign config та locale dictionaries, відділені від компонентів і transport |
| Інтеграції | Канонічний iframe bridge та підтверджений Web/native adapter; зміна framework не змінює протокол |
| Delivery | Статична генерація Nuxt для корпоративного landing hosting; серверне deployment лише за окремо підтвердженої інфраструктури |

Composition API зі SFC підтримує типізовані props/events. [Vue: script setup](https://vuejs.org/api/sfc-script-setup.html).

Pinia, i18n module, UI kit, carousel library та Three.js не є обов’язковими залежностями. Додавати їх лише під конкретну потребу з оцінкою bytes, lifecycle й підтримки WebView. Простий словник локалізації або один carousel не виправдовують великий додатковий runtime. Vue/Nuxt уже обов’язкові; оптимізуємо їх використання, а не замінюємо стек.

Версії Nuxt 4, Vue 3, TypeScript, Node та package manager фіксуємо у manifest/lockfile, CI image і [brief](../templates/project-brief.md). Обираємо сумісні підтримувані версії на момент старту, перевіряємо фактичний lockfile; не використовуємо `latest` у відтворюваній CI-збірці. Оновлення major — окрема зміна стандарту, не автоматичний upgrade під час campaign fix.

## 2. Структура проєкту

Nuxt 4 використовує `app/` для application code, `public/` — для ресурсів із контрольованими іменами. [Nuxt 4 directory structure](https://nuxt.com/docs/4.x/directory-structure).

```text
campaign-key/
  app/
    app.vue
    assets/css/main.css
    components/
      HeroSection.vue
      ParticipationSection.vue
      GamesCarousel.vue
      FaqAccordion.vue
      SmokeBackground.client.vue
    composables/
      useParticipation.ts
      useCampaignLocale.ts
    services/
      host-adapter.client.ts
      analytics-adapter.client.ts
    plugins/
      host.client.ts
    config/campaign.ts
    locales/uk.json
    types/contracts.ts
  public/
    media/
    bridge/
  docs/
  nuxt.config.ts
  package.json
  package-lock.json
```

Це приклад відповідальностей, не вимога створити кожний файл до появи відповідного блоку. Одна сторінка може жити в `app.vue`; `app/pages/` додаємо, якщо потрібні внутрішні маршрути. Продуктові переходи до реєстрації, верифікації, гри, категорії чи бонусів виконуються через [event actions](03-event-actions.md), а не внутрішній Nuxt router. Компоненти віддають intent; adapter виконує підтверджений transport.

У `public/bridge/` кладемо тільки погоджений canonical файл із зафіксованим checksum. `.client.ts` для service — домовленість назви; файл у `services/` сам не стає Nuxt plugin і не auto-registers. Його явно підключає client plugin. [Nuxt client plugins](https://nuxt.com/docs/4.x/directory-structure/app/plugins).

## 3. Статична генерація та campaign subpath

За замовчуванням генеруємо початковий HTML із публічним content, hero poster та безпечним participation loading state. `ssr: true` разом із `nuxt generate` означає prerender під час збірки; це **не** вимога запускати Node-сервер на hosting. Generated артефакт — `.output/public/`. `ssr: false` лишається Nuxt client rendering і потребує обґрунтування втрати початкового content та окремої перевірки loading shell. [Nuxt 4 deployment](https://nuxt.com/docs/4.x/getting-started/deployment).

Приклад `nuxt.config.ts` для конкретного build path:

```ts
export default defineNuxtConfig({
  ssr: true,
  app: {
    baseURL: '/campaign-key/',
    head: { htmlAttrs: { lang: 'uk' } },
  },
  css: ['~/assets/css/main.css'],
})
```

`campaign-key` замінюється підтвердженим шляхом акції. `app.baseURL` / `NUXT_APP_BASE_URL` та шлях deployment узгоджуються до build. [Nuxt configuration](https://nuxt.com/docs/4.x/api/nuxt-config#baseurl).

Public media URL також отримує campaign prefix: не припускати, що довільний рядок `/media/poster.webp` Nuxt перепише за нас. Імпортовані `app/assets` проходять build pipeline; `public` має власну naming/cache policy. Перевіряти URL ресурсів у generated HTML і фактичному Network на subpath.

Фрагмент scripts для npm-проєкту:

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "typecheck": "nuxt typecheck",
    "generate": "nuxt generate"
  }
}
```

Для `typecheck` проєкт має містити сумісні TypeScript та `vue-tsc` у dev dependencies. [Nuxt TypeScript](https://nuxt.com/docs/4.x/guide/concepts/typescript). У CI: встановлення за lockfile → typecheck → meaningful checks → `npm run generate` → перевірка generated artifact. Інший package manager допускається за чинним repo contract із його frozen lockfile режимом.

Repo generator повинен отримати саме generated output. `build: static` допустимий лише коли pipeline вже згенерував Nuxt artifact окремим кроком; він не означає відмову від Nuxt. Перевірити фактичне розташування entry HTML, `_nuxt` та media у output і mapping на public URL, щоб не подвоїти campaign directory. Не копіювати `.nuxt`, `node_modules` або server output у static hosting. Деталі — [release](14-release-and-cache.md).

Static hosting не виконує `server/api` після deploy та не підхоплює нові environment values як живий Node process. User auth/profile/mission data отримуємо під час роботи клієнта через чинний контракт. Публічна build config не містить tokens, profile data чи секретів. Для різних Stage/Prod values зафіксувати спосіб підготовки artifact або погоджений public config endpoint.

## 4. Client lifecycle, hydration та WebView

- Build-time HTML і перший client render мають однаковий безпечний стан. User-dependent участь залишається `loading/unknown` до валідних auth, verification та mission даних. `unknown` не прирівнюємо до guest або available.
- `window`, `document`, native handlers, SDK, socket та GPU context використовуються тільки на клієнті. Browser-only модуль, який звертається до DOM під час import, підключаємо через client plugin або відкладений import у client lifecycle.
- Host adapter створюється один раз на application; не ініціалізуємо канонічний bridge чи Smartico SDK у кожній кнопці, block mount або locale switch. У App не запускаємо другий socket поруч із чинною native інтеграцією.
- Composable керує нормалізованими user states і freshness. Компоненти не читають довільні profile поля й не дублюють opt-in logic. Logout/account switch скидає стан та інвалідує late responses.
- Таймери, observers, media listeners та RAF створюються після mount; очищаються під час dispose/unmount. Visibility/background і offscreen policy працюють також у реальному WKWebView та Android WebView.
- WebGL використовує client component або `<ClientOnly>` із видимим static/CSS fallback. Чорний/brand background і габарити декору існують у початковому HTML, до shader ready. Не обгортати весь landing у client-only заради одного ефекту.
- Tokens та raw bridge/SDK objects тримаємо тільки у погодженому client service. Не кладемо їх у SSR payload, Nuxt `useState`, public config, localStorage або analytics. Об’єкти canvas/video/renderer також не є серіалізованим content state.

Nuxt підтримує client-only components та plugins, але це механізм виконання, а не доказ native сумісності. [Client components](https://nuxt.com/docs/4.x/directory-structure/app/components). Перевірка платформ — [Native WebView](07-native-webview.md); motion/fallback — [media та WebGL](10-media-animation-webgl.md).

## 5. Що перевірити перед delivery

1. Manifest і lockfile справді містять **Nuxt 4 + Vue 3**; build відтворюється у pinned CI environment.
2. Немає hydration mismatch, SSR/build-time звернення до `window` або user data у prerendered HTML/payload.
3. Initial loading не блимає доступними кнопками; відкладений bridge не залишає нескінченний skeleton без контрольованого retry.
4. Generated output працює на canonical campaign subpath: HTML, `_nuxt`, fonts, images, video та bridge; refresh і direct entry не дають 404.
5. Пораховані всі initial та deferred chunks, включно з Vue/Nuxt runtime. JS/CSS/media budgets підтверджені вимірюванням, а не назвою framework.
6. Web iframe, реальний Swift WKWebView та React Native Android перевірені окремо: lifecycle, height, event actions, locale, mission states, popup delivery, media/GPU fallback.

Результати записуються у [QA](13-qa.md), [integration contract](../templates/integration-contract.md) та [release record](../templates/release-record.md). Приклади конфігурації вище — документація стандарту; вони не є вже зібраним starter або доказом міграції чинного лендінгу.
