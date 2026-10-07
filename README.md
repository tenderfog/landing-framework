# Promo Landing Playbook

Практичні інструкції для промо-лендінгів, які живуть на окремому домені й відкриваються у продуктовому iframe або App WebView. Пакет підготовлено 05.10.2026 на основі `landing_doc`, практичного досвіду та перевірених технічних джерел; стандарт стеку оновлено 07.10.2026. Це публічна версія `1.2.1` документації, а не дозвіл на реліз чи готова універсальна native-бібліотека.

Приклади не містять внутрішніх службових посилань, реальних ID кампаній або конфігурації конкретного середовища. Власні специфікації, entity map та приватні джерела зберігайте в project kit із відповідним доступом.

**Обов’язковий стек лендінгу — Vue 3 + Nuxt 4.** Структура, TypeScript, статична генерація, campaign subpath та client lifecycle описані в [технічному стандарті](docs/00-technical-stack.md). Swift/RN залишаються native hosts; Smartico popup працює у своєму template engine.

## Початок роботи

Для агента точка входу — [AGENTS.md](AGENTS.md). Для команди — [технічний стек](docs/00-technical-stack.md), [discovery](docs/01-discovery-and-sources.md), [integration contract](templates/integration-contract.md) та [state matrix](templates/state-matrix.md). Копіюй шаблони у repository конкретної акції; заповнюй значення з її джерел. Приклади використовують `example.test`, умовні ID та конфігурацію без секретів.

Папку можна покласти в окремий Git repo або у `methodology/` наявного repo. У root `AGENTS.md` landing repo достатньо додати посилання на цей entrypoint та проєктні виключення. Не підміняй чинний bridge новим кодом із прикладу. Пінуй версію методології на commit/tag, коли її справді додадуть у Git.

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

## Окремі навички Smartico

Переносні `SKILL.md`, які агент може читати напряму; глобально вони не встановлені:

- [smartico-missions](skills/smartico-missions/SKILL.md) — recurring/opt-in, task, availability, reset.
- [smartico-journeys](skills/smartico-journeys/SKILL.md) — triggers, branches, creatives, grants, re-entry.
- [smartico-client-actions](skills/smartico-client-actions/SKILL.md) — інший спосіб запуску, контракт події та caps.
- [smartico-popup-templates](skills/smartico-popup-templates/SKILL.md) — два сценарії дизайну, configuration/body, engine, buttons, native.

## Окрема документація модалок

[Smartico Popups](smartico-popups/README.md) містить два детальні процеси: [реалізація за Figma](smartico-popups/from-figma.md) і [самостійне проєктування за брифом](smartico-popups/from-brief.md). Спільний [implementation contract](smartico-popups/implementation-contract.md) визначає параметри, поведінку кнопок/хрестика, assets, Web/App QA та збереження у BO. Є [popup brief](smartico-popups/templates/popup-brief.md) і [повний runnable Configuration/Body/values приклад](smartico-popups/examples/README.md).

## Шаблони та приклади

- [Brief](templates/project-brief.md), [integration](templates/integration-contract.md), [states](templates/state-matrix.md), [assets](templates/asset-register.md), [Smartico blueprint](templates/smartico-blueprint.md).
- [QA Web](templates/qa-web.md), [QA App](templates/qa-app.md), [release record](templates/release-record.md), [analytics plan](templates/analytics-plan.md).
- [Campaign config](examples/campaign.config.json), [локалі](examples/locales.json), [navigation helper](examples/event-actions.mjs), [state/time helpers](examples/state-time.mjs), [пояснення runnable прикладів](examples/README.md).
- [Native Smartico routing](examples/native-smartico-routing.md) — pseudocode, не готовий App patch.
- [Анонімізований приклад щоденної промо](case-studies/daily-promo.md) — практичні спостереження, а не defaults наступної кампанії.

## Перевірка пакета

```sh
node scripts/check-docs.mjs
node examples/check.mjs
# Окремо, із довіреним збереженим Smartico engine:
node smartico-popups/examples/check.mjs /absolute/path/to/tmpl.min.js
```

Перший скрипт перевіряє внутрішні посилання, JSON і portable skill metadata. Другий перевіряє поведінку прикладів: event-action navigation, безпечні стани, календарну північ і DST. Третій запускає popup Body фактичним template compiler; engine/source/hash підготовка описана в [прикладі](smartico-popups/examples/README.md). Локальні checks не замінюють Stage чи device QA.

## Межі та походження

[SOURCES.md](SOURCES.md) містить pinned основу, доступні первинні джерела й виправлені суперечності старих прикладів. Для цього продуктового профілю закріплено правило всіх navigation links через event actions; кожен бренд підтверджує власний action registry. Аналітичний transport та додаткові native capabilities позначені як пропозиції до погодження. Відсутність App source не маскується готовим псевдопатчем.
