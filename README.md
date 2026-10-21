# Promo Framework: landings, widgets та Smartico

Framework для самостійного проєктування, реалізації й дослідження наступних промо для **SlotCity, CatBet та нових продуктів**. Охоплює лендінги, компактні продуктові віджети, Smartico missions/Journeys/popups і Web/App інтеграцію. Редакція документації **2.0.0 від 21.10.2026** розширює baseline 1.2.1 узагальненими висновками з повної історії двох реалізацій, особливо з виправлень багів, і актуальними первинними джерелами. [Що змінилося](CHANGELOG.md).

Приклади не містять внутрішніх службових посилань, реальних ID кампаній або конфігурації конкретного середовища. Власні специфікації, entity map та приватні джерела зберігайте в project kit із відповідним доступом.

**Обов’язковий стек продуктового лендінгу — Vue 3 + Nuxt 4.** Структура, TypeScript, статична генерація, campaign subpath та client lifecycle описані в [технічному стандарті](docs/00-technical-stack.md). Віджет у наявному frontend використовує його contract/stack; Swift/RN залишаються native hosts. Smartico popup має власний vendor runtime: поточні docs рекомендують Vibe Studio для нових popup, legacy Configuration/Body збережено для підтриманих інтеграцій. Наявність framework не є готовою native-бібліотекою чи дозволом на production release.

## Початок роботи

Для агента точка входу — [AGENTS.md](AGENTS.md). Для команди — [технічний стек](docs/00-technical-stack.md), [discovery](docs/01-discovery-and-sources.md), [integration contract](templates/integration-contract.md) та [state matrix](templates/state-matrix.md). Копіюй шаблони у repository конкретної акції; заповнюй значення з її джерел. Приклади використовують `example.test`, умовні ID та конфігурацію без секретів.

| Мета | Почати тут | Мінімальний результат |
|---|---|---|
| Спроєктувати нове схоже промо | [Patterns](docs/21-promo-patterns.md) → [surface workflow](docs/19-surfaces-and-workflows.md) | Обраний flow, prerequisites/consumption point, state/CTA/CRM matrices |
| Зробити landing | [Landing workflow](docs/19-surfaces-and-workflows.md) → [brief](templates/project-brief.md) | Підтверджений adapter і вертикальний сценарій до visual polish |
| Додати widget на головну | [Widget workflow](docs/19-surfaces-and-workflows.md) → [widget brief](templates/widget-brief.md) | Teaser/stateful роль, slot/lifecycle, sizing/navigation; без зайвого SDK для stateless teaser |
| Налаштувати або дослідити Smartico | [Knowledge base](smartico-knowledge/README.md) → [джерела](smartico-knowledge/SOURCES.md) | Перевірена capability і конкретний setup/check plan |
| Виправити popup/інший баг | [Incident catalog](docs/22-incidents-and-popup-cleanup.md) → [investigation record](templates/investigation-record.md) | Перший доведений розрив, мінімальний fix і affected regression |
| Перенести на інший продукт | [Product profiles](docs/20-product-profiles-and-investigation.md) → [profile template](templates/product-profile.md) | Capabilities/environment map, що підтверджені саме там |

Для нового чату достатньо дати посилання на repo/потрібний commit, попросити прочитати AGENTS і відповідний entrypoint, додати продукт, мету/симптом та доступний project kit. [Приклад запиту і протокол відповіді](smartico-knowledge/README.md). Агент має прочитати джерела; посилання на framework не створює постійну пам'ять або доступ до приватного BO.

Папку можна покласти в окремий Git repo або у `methodology/` наявного repo. У root `AGENTS.md` landing repo достатньо додати посилання на цей entrypoint та проєктні виключення. Не підміняй чинний bridge новим кодом із прикладу. Пінуй версію методології на commit/tag, коли її справді додадуть у Git.

## Де шукати правило без читання дублів

| Потрібна інформація | Канонічне місце |
|---|---|
| Поняття Smartico, API/update semantics і verified sources | [Knowledge base](smartico-knowledge/README.md) |
| Покрокове налаштування BO | [Mission](docs/05a-smartico-mission-runbook.md), [Journey](docs/05b-smartico-journey-runbook.md), [Client Action](docs/05c-smartico-client-actions.md) |
| Legacy popup runtime/compiler | [Технічний runbook](docs/06-smartico-popup-templates.md); дизайн — окремо [Figma/brief](smartico-popups/README.md) |
| Відома причина багу, фактичний fix і межі доказів | [Incident catalog](docs/22-incidents-and-popup-cleanup.md); швидкий вхід — [symptom index](docs/15-troubleshooting.md) |
| Рішення й значення нової акції | [Templates](templates/project-brief.md), які посилаються на guides без їх копіювання |
| Реалізація, яку можна запустити | [Examples](examples/README.md), [popup compiler example](smartico-popups/examples/README.md) |

Одне правило доповнюється в канонічному розділі; суміжні документи дають короткий контекст і посилання. [Порядок підтримки](docs/18-maintenance.md).

## Карта документації

| Напрямок | Документ |
|---|---|
| Обов’язкові Vue 3 + Nuxt 4, структура, build, lifecycle | [00 — Технічний стек](docs/00-technical-stack.md) |
| Що запитати, де шукати, який документ є джерелом правди | [01 — Discovery](docs/01-discovery-and-sources.md) |
| Parent/child, канонічний bridge, auth, height | [02 — Iframe та контракти](docs/02-iframe-and-contracts.md) |
| Event actions і CTA routing | [03 — Навігація](docs/03-event-actions.md) |
| User states, верифікація, повторна участь, часові зони | [04 — Стани й час](docs/04-state-and-time.md) |
| Вибір mission / Client Action / Journey | [05 — Smartico architecture](docs/05-smartico-missions-journeys.md) |
| Налаштування місії в Back Office | [05a — Mission runbook](docs/05a-smartico-mission-runbook.md) |
| Налаштування User Journey в Back Office | [05b — Journey runbook](docs/05b-smartico-journey-runbook.md) |
| Запуск Journey через Client Action | [05c — Client Actions](docs/05c-smartico-client-actions.md) |
| Один template, різні creatives, кнопки, native rendering | [06 — Popup](docs/06-smartico-popup-templates.md) |
| Модалки за Figma або самостійно за брифом; повний template приклад | [Окремий пакет Smartico Popups](smartico-popups/README.md) |
| Swift / React Native Android / sockets / універсальний adapter | [07 — Native WebView](docs/07-native-webview.md) |
| Figma, copy, export, asset register | [08 — Дизайн та ресурси](docs/08-figma-and-assets.md) |
| Верстка, accordion, carousel, touch/a11y | [09 — Responsive UI](docs/09-responsive-ui.md) |
| Відео, sprite, звук, smoke, WebGL та fallback | [10 — Media та motion](docs/10-media-animation-webgl.md) |
| Швидкість, bytes, decoded memory, lifecycle | [11 — Performance](docs/11-performance.md) |
| Події, consent, transport та майбутня аналітика | [12 — Analytics](docs/12-analytics.md) |
| Local / Web Stage / реальні App | [13 — QA](docs/13-qa.md) |
| GitLab, CI, Stage, cache, rollback | [14 — Release](docs/14-release-and-cache.md) |
| Симптом → шар → доказ → виправлення | [15 — Troubleshooting](docs/15-troubleshooting.md) |
| Мови, locale mapping, локалізовані assets | [16 — Localization](docs/16-localization.md) |
| Trust boundaries, tokens, URLs, privacy | [17 — Security](docs/17-security.md) |
| Оновлення методології та реєстр знань | [18 — Maintenance](docs/18-maintenance.md) |
| Розділення landing/widget/popup, окремі workflows і QA | [19 — Surfaces](docs/19-surfaces-and-workflows.md) |
| Продукти, capabilities, пошук першого розриву | [20 — Profiles та investigation](docs/20-product-profiles-and-investigation.md) |
| Типові механіки, prerequisites, marker projection, caps/reset | [21 — Promo patterns](docs/21-promo-patterns.md) |
| Виправлення багів, reconfiguration, очищення modal runtime | [22 — Incidents та popup cleanup](docs/22-incidents-and-popup-cleanup.md) |
| Smartico: модель, state, Journey/bonus, popup, investigation, sources | [Smartico knowledge base](smartico-knowledge/README.md) |

## Окремі навички Smartico

Переносні `SKILL.md`, які агент може читати напряму; глобально вони не встановлені:

- [smartico-missions](skills/smartico-missions/SKILL.md) — recurring/opt-in, task, availability, reset.
- [smartico-journeys](skills/smartico-journeys/SKILL.md) — triggers, branches, creatives, grants, re-entry.
- [smartico-client-actions](skills/smartico-client-actions/SKILL.md) — інший спосіб запуску, контракт події та caps.
- [smartico-popup-templates](skills/smartico-popup-templates/SKILL.md) — два сценарії дизайну, configuration/body, engine, buttons, native.

## Окрема документація модалок

[Smartico Popups](smartico-popups/README.md) зберігає два детальні legacy процеси: [реалізація за Figma](smartico-popups/from-figma.md) і [самостійне проєктування за брифом](smartico-popups/from-brief.md). Спільний [implementation contract](smartico-popups/implementation-contract.md) визначає параметри, поведінку кнопок/хрестика, assets, Web/App QA та збереження у BO. Є [popup brief](smartico-popups/templates/popup-brief.md) і [повний runnable Configuration/Body/values приклад](smartico-popups/examples/README.md). Для нового popup спочатку обрати Vibe/legacy mode через [KB](smartico-knowledge/04-popups-and-routing.md); для існуючого багу — [каталог виправлень і cleanup](docs/22-incidents-and-popup-cleanup.md).

## Шаблони та приклади

- [Brief](templates/project-brief.md), [integration](templates/integration-contract.md), [states](templates/state-matrix.md), [assets](templates/asset-register.md), [Smartico blueprint](templates/smartico-blueprint.md).
- [QA Web](templates/qa-web.md), [QA App](templates/qa-app.md), [release record](templates/release-record.md), [analytics plan](templates/analytics-plan.md).
- [Product profile](templates/product-profile.md), [widget brief](templates/widget-brief.md), [investigation record](templates/investigation-record.md).
- [Campaign config](examples/campaign.config.json), [локалі](examples/locales.json), [navigation helper](examples/event-actions.mjs), [state/time helpers](examples/state-time.mjs), [пояснення runnable прикладів](examples/README.md).
- [Native Smartico routing](examples/native-smartico-routing.md) — pseudocode, не готовий App patch.
- [Promo patterns](docs/21-promo-patterns.md) і [каталог інцидентів](docs/22-incidents-and-popup-cleanup.md) містять узагальнений практичний досвід.

## Перевірка пакета

```sh
node scripts/check-docs.mjs
node examples/check.mjs
# Окремо, із довіреним збереженим Smartico engine:
node smartico-popups/examples/check.mjs /absolute/path/to/tmpl.min.js
```

Перший скрипт перевіряє внутрішні посилання, JSON і portable skill metadata. Другий перевіряє поведінку прикладів: event-action navigation, безпечні стани, календарну північ і DST. Третій запускає popup Body фактичним template compiler; engine/source/hash підготовка описана в [прикладі](smartico-popups/examples/README.md). Локальні checks не замінюють Stage чи device QA.

## Межі та походження

[SOURCES.md](SOURCES.md) містить pinned основу, походження узагальнень і виправлені суперечності; [Smartico catalog](smartico-knowledge/SOURCES.md) — прочитані primary docs, версії, майбутні research routes й недоступні джерела. Кожен бренд підтверджує власний action registry, measurement mode і native capabilities. Historical observations, local checks, saved BO settings і physical device evidence позначаються окремо. Відсутність App source не маскується готовим псевдопатчем.
