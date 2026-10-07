# Event actions: усі переходи через dispatcher продукту

## Три різні поняття

| Назва | Значення | Приклад |
|---|---|---|
| Product `event_action` | дозволений маршрут/дія, яку обробляє Web/App host | `event_action/verif` |
| Smartico Client Action | іменована бізнес-подія, яка може запускати Journey або прогрес місії | `PROMO_SUMMER_ENTRY` |
| Smartico `dp:*` | команда engagement/deep link у CRM контексті | `dp:ok`, `dp:cancel`, `dp:go&url=...` |

Analytics `cta_click` — четверте поняття: спостереження про дію, а не команда маршрутизації. Не використовувати analytics для запуску grant. `dp:action` має значення залежно від handler: engagement control не автоматично дорівнює іменованому Client Action; див. [Client Action runbook](05c-smartico-client-actions.md).

## Правило цього продуктового профілю

Кожен navigation link користувача, включно з games, category, bonuses, auth, verification, rules PDF та standalone/modified-click fallback, має використовувати підтверджений `event_action`. Це уточнення користувача перевизначає старі приклади `landing_doc`, де static external URL/fallback вели напряму на сторінку.

Звичайні URL потрібні для завантаження images/fonts/scripts/video/API: їх не перетворювати на event actions. Accordion, mute/unmute, carousel arrows, tooltip та scroll усередині child — UI controls, а не зовнішня навігація. Для скролу до host секції використовувати підтверджений `event_action/anchor/:id`.

## Підтверджений registry і перевірка актуальності

Таблиця нижче походить із [публічного pinned registry](https://github.com/onlineTeran/landing_doc/blob/14f93e5c1f16ff349a52f10ec1c5bd1c2db47030/assets/EVENT-ACTIONS.md). Вона описує конкретний продуктовий профіль, а не універсальний стандарт маршрутів. Перед використанням у своєму продукті, середовищі або App підтвердити route, параметри та dispatcher behavior. Наявність route в Web не доводить support у конкретній App build.

| Потреба | Action | Нюанс |
|---|---|---|
| Відкрити auth modal | `event_action/auth` | Новому гостю може показати реєстрацію, зі збереженим authBy — login. Це modal flow. |
| Окрема registration page | `event_action/registration` | Не підміняти нею auth modal, коли потрібна саме модалка. |
| Верифікація | `event_action/verif` | Підтвердити потрібний modal/screen flow у своєму host; Native екран перевіряється окремо. |
| Каса | `event_action/cashier` | Не проводить платіж сама по собі. |
| Деталі гри | `event_action/game_modal/:term` | `term` із CMS; не назва картинки й не display title. |
| Відкрити гру | `event_action/game/:term` | Інша поведінка, не підміняти game_modal. |
| Категорія | `event_action/section/slots?subsection=:term` | `/slots/for-bonuses` → `event_action/section/slots?subsection=for-bonuses`. |
| Бонуси | `event_action/bonuses` | Відкриває розділ, не claim/grant. |
| Доступні бонуси | `event_action/bonuses/available` | Використовувати лише коли потрібна саме ця вкладка. |
| Конкретне промо | `event_action/promotions/:term` | Slug із продуктового контенту. |
| Правила/зовнішній документ | `event_action/url/:id` | `:id` повний URL; encoding узгодити з dispatcher. До затвердженого PDF CTA disabled/hidden. |
| Smartico deep link через host | `event_action/smartico/:id` | `:id` = `dp:...`; exact parsing і named Client Action mapping перевірити. |

Вкладені URL мають різні encoding boundaries: route segment, query value, Smartico URL parameter. Не застосовувати `encodeURIComponent` до всього action навмання і не декодувати рекурсивно. Для `url/:id` та nested `dp` взяти робочий приклад/тест актуального host handler. Якщо contract невідомий, цей CTA не готовий до публікації.

## Два transport сценарії

### Landing у Web iframe

```js
IframeBridge.sendMessage('event_action', 'event_action/verif');
IframeBridge.sendMessage('event_action', 'event_action/game_modal/example-game');
IframeBridge.sendMessage('event_action', 'event_action/section/slots?subsection=for-bonuses');
```

Є один canonical bridge. Не викликати cross-origin `parent._smartico`, не відкривати raw product URL замість action, не дублювати `postMessage` та `location.href` на один клік.

Звичайний anchor містить action URL як fallback. Embedded plain primary click перехоплюється adapter; middle/modified click використовує той самий action URL. Bridge може мовчки no-op без parentOrigin: після send не робити автоматичний повторний fallback, бо без ack неможливо довести, що перший handler не спрацював.

```html
<a data-action="event_action/game_modal/example-game"
   href="https://stage.example.test/event_action/game_modal/example-game">Приклад гри</a>
```

Робочий мінімальний helper: [examples/event-actions.mjs](../examples/event-actions.mjs). Він не замінює allowlist/route registry. Якщо embedded канал не підтверджений, navigation adapter має повернути disconnected/error за project contract.

### Smartico popup або Journey

```text
dp:go&url=https://product.example.test/event_action/bonuses
```

Web host може обробити URL через свій dispatcher. Native host має отримати `dp` і передати `/event_action/...` у нативний dispatcher; не завантажувати звичайну вебсторінку і не відкривати Safari для вже підтриманого native action. Джерела: popup `bcid:4` та Journey socket `cid:105`; [деталі](07-native-webview.md) і [pseudocode](../examples/native-smartico-routing.md).

Винагорода контролюється окремо `dp:ok/cancel/action` за Journey contract. Навігація після «Забрати» відбувається після підтвердженого grant. Незалежна CTA перегляду бонусів або loss CTA може вести в розділ без grant, якщо так задає action matrix. Заміна «Забрати» на raw bonuses link може обійти CRM branch; це не допустиме скорочення.

## CTA config

Зберігати окремо поля:

```json
{
  "intent": "open_game_details",
  "analyticsId": "ga_promo_games_click_btn_card",
  "productAction": "event_action/game_modal/example-game",
  "fallbackHref": "https://stage.example.test/event_action/game_modal/example-game"
}
```

Для старту Journey через Client Action також потрібні `clientAction.name`, підтверджена payload schema, trigger entity, server caps та ack/state source. [Campaign example](../examples/campaign.config.json) демонструє розділення.

Джерело action registry: [pinned product table](https://github.com/onlineTeran/landing_doc/blob/14f93e5c1f16ff349a52f10ec1c5bd1c2db47030/assets/EVENT-ACTIONS.md). Це snapshot, не автоматичне підтвердження нових routes.
