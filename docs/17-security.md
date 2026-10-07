# Trust boundaries і конфіденційність

## Мінімальні практичні правила

- Landing не читає cross-origin parent store/cookie/SDK. Native token передається лише trusted approved handler в allowed WebView origin; iframe token — canonical parent message.
- Auth flag/query, JWT decode і client verification UI не є server authorization. Backend/Journey enforce eligibility/caps/grant.
- Credentials/tokens/private keys/user hash не записуються у source, docs, screenshot/log/analytics, query або storage. Public label/brand keys мають бути підтверджені як public, не сплутані з server API keys.
- Profile read повертає нормалізований status; raw profile не потрібен UI. Logout/token refresh abort/identity generation захищають від stale response.
- Origins/endpoints беруться з reviewed environment config, не з query `apiBase` чи довільного message. Не пересилати bearer на URL із params creative.
- Navigation/external-URL actions перевіряються host dispatcher. Scheme/origin allowlist, bounded payload, коректне декодування один раз. `javascript:`, невідомі commands і unsupported action не стають `window.open` fallback.

## API/CORS

Перевірити реальний preflight для landing origin, потрібних method/headers і credentials. Credentialed CORS не допускає wildcard як продуктове рішення. `cache:no-store` не замінює серверну політику для персональних відповідей. `redirect:error` може бути доречним для pinned auth endpoints; не перенести token на redirect іншого origin. TLS warnings не обходити.

AbortController timeout та late-response identity check потрібні разом: abort не гарантує, що callback старого запиту ніколи не виконається. [API reference](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).

## Content і assets

Parameters creative та locale text — потенційний input. Text interpolation має відповідати escaping actual template engine; dynamic HTML вимагає strict approved source/sanitization. Asset params допускають HTTPS reviewed origins, не arbitrary data/executableURL. Base64 не приховує секрет і не покращує memory budget.

Підтверджені image/video/font URLs можуть потребувати різних CORS/CSP правил. CSP frame-ancestors/sandbox/autoplay за product requirements; не знімати sandbox чи security checks навмання заради відтворення. Шейдер compile/status не повинен показувати весь minifiedsource як usererror.

## Smartico/native

Не створювати другий websocket із секретами у landing тільки тому, що native SDK не доступний. Socket session належить App integration; JSON command schemas — із офіційного pinned protocol. Native handlers перевіряють message source, scheme/origin і allowed command, очищуються при teardown, не відкривають загальний JS-to-native RPC.

Не давати frontend права grant reward напряму. `dp:*` управляють already pending engagement за contract; глобальні Client Actions user-triggerable і потребують guarded backend context/caps. Passive close/unload не вважати claim, якщо не існує явного підтвердженого правила.

## Документація і QA evidence

Публічний reusable playbook містить умовні IDs/domains і не містить приватних фото/відео/даних профілю. Внутрішні source links, реальні entity IDs, середовища та операційні дані конкретної кампанії зберігати у приватному project kit; у публічних прикладах замінювати їх умовними значеннями або описом ролі. Скриншоти QA зберігати у designated приватному місці й редагувати PII до поширення. Не включати credentials із переписки в retrospective.

Деталі transport — [02](02-iframe-and-contracts.md), event actions — [03](03-event-actions.md), privacy analytics — [12](12-analytics.md). Це цільовий набір trust checks, а не вимога виконувати сторонній security audit для кожної CSS правки.
