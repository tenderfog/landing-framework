# Приклади: що можна запускати і що потрібно адаптувати

Нова campaign landing реалізується на [Vue 3 + Nuxt 4](../docs/00-technical-stack.md), Vue SFC із Composition API та `<script setup lang="ts">`. Plain `.mjs` файли нижче — framework-independent fixtures/helpers для імпорту в Nuxt landing та ізольованих перевірок; вони не є окремим standalone landing stack. Default delivery — Nuxt static generated output під campaign subpath; SSR лише за погодженого hosting contract.

`campaign.config.json` — структура проєктних даних, не BO import format. Значення `null` потребують реального підтвердження; `clientActionAlternative` ілюструє альтернативу, не команду запускати обидва сценарії. Дати2027/домениexample/суми та mechanics прикладів не є затвердженим промо.

`event-actions.mjs` — runnable pure helper: він перевіряє registry та створює правильний action href, викликає рівно один transport. Споживач підставляє canonical bridge або approved native adapter. `connected` має визначатися integration contract; не видавати `window.parent !== window` за доказ connected. Переданий transport не повертає acknowledgment.

```js
// Wiring sketch для client lifecycle Nuxt landing;
// registry/env/lifecycle задаються проєктом, browser globals недоступні при generation/SSR.
const navigator = createActionNavigator({
  productOrigin: reviewedConfig.productOrigin,
  isAllowedAction: action => approvedRegistry.has(action),
  dispatchToHost: action => IframeBridge.sendMessage('event_action', action),
  navigateStandalone: href => { window.location.href = href; }
});
// href anchor = navigator.href(action). У normal embedded click -> preventDefault + navigate.
// Modified/middle click використовує fallback event_action URL anchor.
```

`state-time.mjs` демонструє нормалізовану UX модель, sharedtimer та календарну північ. Він не викликає mission API, не перетворює deadline0 на available і не враховує всі можливі timezone midnight gaps: для таких зон потрібен authoritative deadline або civil-time library/disambiguation policy. Code не замінює Backend reset. Server timestamps мають explicit units/schema.

`locales.json` — приклад key parity та UI states українською/англійською; у production потрібне затвердження marketing/legal copy. Single-locale landing дозволена; окремий i18n module не є обов'язковим. [Native routing](native-smartico-routing.md) — pseudocode на основі Smartico protocol, не виконуваний Swift/RN patch. Swift/RN лишаються native hosts, а Smartico Configuration/Body — vendor templates зі своїм template engine.

```sh
node examples/check.mjs
```

Сценарії production activation/grant навмисно не виконуються прикладами. Для actual popup використовуйте [engine runbook](../docs/06-smartico-popup-templates.md), для activation — [mission](../docs/05a-smartico-mission-runbook.md) або [Client Action](../docs/05c-smartico-client-actions.md) із server guard.
