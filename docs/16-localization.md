# Багатомовність і керування контентом

Campaign landing використовує обов'язкові **Vue 3 + Nuxt 4**, Vue SFC із Composition API та `<script setup lang="ts">`; [технічний стандарт](00-technical-stack.md) визначає build і deployment. Locale dictionaries можуть бути простими typed даними проєкту. Окремий i18n module обирати за потребами кампанії та його виміряною вартістю; він не є обов'язковим для single-locale або невеликої кількості словників.

## Джерела та конфіг

Locale у Web iframe береться з `IframeBridge.config.locale`. Native host має передати locale через свій підтверджений context contract; browser language не замінює product setting. Standalone preview може обирати locale з query та default кампанії. Використовувати BCP 47/ISO ключі (`uk`, `en`), а не довільне перейменування всіх мов на `ua`; `localization: ua` API header — окремий продуктовий mapping.

```json
{
  "supportedLocales": ["uk", "en"],
  "defaultLocale": "uk",
  "aliases": {"ua": "uk", "uk-UA": "uk"},
  "apiLocalization": {"uk": "ua", "en": "en"}
}
```

`aliases` застосовувати лише коли такі входи справді підтримані product contract. Невідома locale переходить у явно заданий default, без вигаданого перекладу. Перевіряти `document.documentElement.lang`, aria labels, alt, tooltips, статуси, errors і dynamic countdown text. HTML `lang` допомагає screen readers; [MDN reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/lang).

## Що виносимо з компонентів

У locale content: hero title/description, CTA labels, steps, FAQ, legal dates/claims, available/used/unverified/error copy, mute labels, carousel arrows та a11y descriptions. У actions config: supported event-action payload, fallback URL, analytics ID, Client Action name/schema. У campaign config: authoritative start/end/reset/IDs та feature flags. Не зберігати route тільки в одному перекладі кнопки.

Дозволені single-locale кампанії; не робити штучну другу мову. Multi-locale key parity перевіряється tooling. [examples/locales.json](../examples/locales.json) містить приклад guest/unverified/ready/cooldown/errors із placeholder `{time}`. Показувати значення через Vue text interpolation або безпечний formatter, не довільний `v-html`/`innerHTML` із JSON.

Якщо FAQ потребує посилання/виділення, використовувати структуровані paragraphs/runs/link IDs, або явно обмежений sanitized markup за contract. Навігаційний link у FAQ також event action; переклад не може додати raw external route.

## Copy provenance

Figma часто містить collapsed placeholder і expanded актуальні відповіді. Брати конкретний approved expanded state та його node ID. Зміна дат/суми/механіки owner переважає старий арт і відкриває affected copy update. Зберігати approved copy поруч із generated popup presets і regression check, не переписувати текст під час верстки.

Видимий user copy не має містити назви Smartico, SDK, websocket, label, debug codes чи QA reload instructions. Технічні назви допустимі в internal документації/BO names. Unverified status — продуктова вимога, а не технічна помилка; його copy окремий.

## Assets і довжина

Звичайний текст лишається HTML із font subset. Для декоративних заголовків, які неможливо відтворити, зберігати окремі locale variants mobile/desktop; потрібен semantic alt/heading. Не перекладати растровий текст CSS overlay поверх старої мови. Перевірити 2x/3x DPR без надмірного декодованого розміру.

Всі enabled locales QA: найдовша CTA, FAQ розгорнутий, вузький екран, large text/font loading, landscape. CSS використовує logical properties там, де підтриманий RTL потрібний конкретній кампанії; не додавати RTL як обіцянку без дизайну й тесту. Не обрізати текст fixed height/ellipsis для legal content.

## Дати й числа

Умови акції зберігати одним структурованим range із timezone та exclusive end. Locale formatter робить видимі дати; не дублювати `5.11` у десятках файлів. Якщо approved marketing sentence має точний текст, generated дата повинна відповідати йому і перевірятися.

Reset timer formatter показує hours/minutes/seconds відповідно до mechanics, включно з >24 годинами якщо календарний цикл може бути25h. Не локалізувати UTC schedule за browser timezone. Smartico locale/creative fallback/variant mapping також належить [popup contract](06-smartico-popup-templates.md).

## Nuxt generation, SSR і hydration

За замовчуванням landing має Nuxt static generated output під campaign subpath; SSR можливий лише за погодженого hosting contract. В обох режимах початкова згенерована/серверна розмітка та перший client render мають погоджений state/locale. Build не містить персонального auth/mission state; початкові activation controls показують loading.

Trusted embedded context застосувати в погодженому client lifecycle; `window`, bridge та native host context не читати під час server generation/render. Не відкривати CTA до валідних auth/eligibility/mission даних і не показувати interactive controls із непідтвердженою locale. QA перевіряє hydration, default/unknown locale, зміну context та відсутність wrong-language CTA у generated output і реальному iframe/WebView.

Smartico locale/creative variants налаштовуються у vendor Configuration/Body. Native Swift/RN host передає підтверджений locale context до Nuxt landing; окремий i18n module не додає нових bridge capabilities.
