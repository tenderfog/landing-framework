# Щоденна промоакція: узагальнений досвід інтеграції

Це **анонімізований приклад** embedded лендінгу з щоденною спробою та кількома popup outcomes. Він пояснює повторювані інтеграційні проблеми й не містить конфігурації готової кампанії. Ідентифікатори CRM, rewards, environment, дати та account-specific дані команда зберігає у приватному project kit; їх не можна брати з case study як defaults.

## Механіка прикладу

Користувач проходить auth та eligibility gate, активує місію або підтверджений Client Action і отримує outcome через один Journey. Варіанти popup використовують спільний шаблон із параметрами. Backend визначає доступність спроби та результат; frontend відображає актуальний стан і countdown до підтвердженого календарного reset.

Щоденний календарний reset відрізняється від recurrence через фіксовану тривалість після активації. Для часової зони із DST команда перевіряє серверний schedule на обидва боки переходу. Countdown на сторінці сам не створює серверну спробу.

## Межі доказів

У вихідному інтеграційному досвіді були спостереження Web-сценаріїв: auth modal, loading без flash controls, unverified CTA та verification navigation, consumed disabled controls, poster/video, FAQ і responsive layout. Ці спостереження використані для формування правил. Публічна редакція не переносить приватні build records і не сертифікує нову кампанію.

Браузерний прогін не доводить, що кожен сценарій пройдено у кожній Swift/RN build. Повідомлення App-розробника про успішний handshake та помилку template compiler є diagnostic evidence, але без actual delivered template не встановлює точну причину незалежно. Успішний fixture compile підтверджує лише компіляцію fixture; delivery, rendering та навігацію потрібно перевірити у реальній App build.

## Висновки за напрямками

| Спостереження / запит | Загальне правило | Документ |
|---|---|---|
| Модалки мають різні стани, але потрібен один reusable template | Template controls layout/params, creatives store variants; перевірити всі enabled/disabled combinations | [06](../docs/06-smartico-popup-templates.md) |
| Claim CTA і X у певному outcome мають однаковий grant intent | Close semantics — explicit business contract; окремі branch/navigation outcomes, passive close не означає claim автоматично | [05b](../docs/05b-smartico-journey-runbook.md) |
| Кнопки спалахують до mission read | Initial HTML приховує participation controls до trusted current state | [04](../docs/04-state-and-time.md) |
| Guest registration route відкриває page замість modal | Підтриманий modal flow використовує `event_action/auth`, а host обирає signup/login | [03](../docs/03-event-actions.md) |
| Consumed controls мають залишатися видимими, але сірими | State matrix містить consumed UI; без pulse/hover, countdown доступний touch/a11y | [09](../docs/09-responsive-ui.md) |
| Таймер після календарного reset знов показує майже повний цикл | Не derive deadline із reload time; read cycle/consumed timestamp, zero → refresh | [04](../docs/04-state-and-time.md) |
| Внутрішнє CRM debug-повідомлення потрапляє в user copy | Internal debugging окремо від локалізованої людської помилки | [16](../docs/16-localization.md) |
| Parent iframe обмежує popup розмір | CSS всередині не може вийти за browsing context; delivery/presentation належить host | [07](../docs/07-native-webview.md) |
| Native handshake успішний, root порожній | Handshake ≠ render. Test actual tmpl, wrapper/root, shader/assets/CSP окремо | [06](../docs/06-smartico-popup-templates.md) |
| Literal CSS `%}` може рвати tmpl compiler | Санітизувати literals до вставки delimiters, проганяти actual engine | [06](../docs/06-smartico-popup-templates.md) |
| Embedded base64 збільшує creative та compiler input | External HTTPS assets + params; byte size, transfers і CORS measured separately | [08](../docs/08-figma-and-assets.md) |
| Відео вже playing, poster ще над ним | Init read current ready/play state, events-first strategy, actual first-frame checks | [10](../docs/10-media-animation-webgl.md) |
| Растровий текст нечіткий на телефоні | Decorative mobile assets достатнього DPR, exact export, srcset; звичайний copy — HTML | [08](../docs/08-figma-and-assets.md) |
| Smoke texture обрізається; procedural layer надто dense | Design composition, баланс відтінків і scoped full-width layer після hero; measurable GPU cost та fallback | [10](../docs/10-media-animation-webgl.md) |
| Native smoke показується без темної основи | Opaque output/base color і context compositing; real-device QA, не тільки CSS body | [10](../docs/10-media-animation-webgl.md) |
| Carousel обрізано центральним container | Header container окремо від full-width viewport; touch/pause/lazy load | [09](../docs/09-responsive-ui.md) |
| FAQ height після collapse лишає порожнє місце | Root content settled height через existing message, без min-height feedback | [02](../docs/02-iframe-and-contracts.md) |
| Без trailing slash redirect втрачає auth/parentOrigin | Canonical URL і query preservation tested end-to-end | [14](../docs/14-release-and-cache.md) |
| Старий HTML після asset deploy | Exact build marker, HTML revalidation, hashed assets/CDN purge; не permanent cachebuster | [14](../docs/14-release-and-cache.md) |
| Links у popup не працюють як App screens | Native Smartico dp router → existing event_action dispatcher; supported contract once | [07](../docs/07-native-webview.md) |
| Verification не приходить як bridge profile message | Read-only API/CORS adapter згідно з контрактом; не вигадувати message | [04](../docs/04-state-and-time.md) |

## Що наступна команда має зробити з першого дня

Перед версткою зафіксувати surfaces, state/CTA matrix, exact trigger, host popup owner, deadlines, asset plan і viewport/scroll owner. Перевірити один наскрізний сценарій у тестовому середовищі рано, не чекати всіх декоративних секцій. Окремі Web/App QA та entity map залишаються у приватному project kit, а reusable knowledge переходить у playbook без account-specific даних.
