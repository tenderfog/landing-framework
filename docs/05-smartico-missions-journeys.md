# Smartico: маршрут проєктування та налаштування

Це точка входу між landing/widget і CRM. Поняття та підтримані API описані в **knowledge base**, послідовність роботи в BO — у **runbooks**. Конкретні ENV, IDs, rewards, дати й поточні capabilities беруться з приватного product profile/campaign kit.

## Обрати потрібний документ

| Завдання | Основне джерело |
|---|---|
| Зрозуміти entities, markers, SDK/session та ownership | [KB 01 — модель й інтеграція](../smartico-knowledge/01-model-and-integration.md) |
| Вибрати Mission або Client Action; зрозуміти state, recurrence й reset | [KB 02 — missions/state](../smartico-knowledge/02-missions-and-state.md) |
| Спроєктувати entry/re-entry, grants, caps і failure policy | [KB 03 — Journeys/rewards](../smartico-knowledge/03-journeys-and-rewards.md) |
| Створити або змінити mission в BO | [05a — Mission runbook](05a-smartico-mission-runbook.md) |
| Зібрати граф Journey, connectors і grant/navigation | [05b — Journey runbook](05b-smartico-journey-runbook.md) |
| Зареєструвати action і підключити один supported sender | [05c — Client Action runbook](05c-smartico-client-actions.md) |
| Обрати popup authoring, доставку та routing | [KB 04 — popups](../smartico-knowledge/04-popups-and-routing.md), [legacy renderer](06-smartico-popup-templates.md) |
| Знайти причину збою / прочитати live-звіт | [KB 05 — investigation](../smartico-knowledge/05-investigation-and-analytics.md), [каталог багів](22-incidents-and-popup-cleanup.md) |
| Перевірити актуальність твердження | [Smartico sources](../smartico-knowledge/SOURCES.md) |

## Мінімальний наскрізний контракт

До верстки заповнити [Smartico blueprint](../templates/smartico-blueprint.md) та [integration contract](../templates/integration-contract.md):

1. Визначити surface, ENV/Label/Brand, identified session owner і підтриманий transport кожної платформи. Web success не доводить native support.
2. Вказати prerequisites і точку витрачання спроби. Інформаційна підказка не викликає irreversible entry, якщо за правилами не повинна витрачати шанс; server recheck лишається обов'язковим.
3. Обрати **один entry chain**: mission/task або Client Action, який може прогресувати task чи запускати Journey. Navigation й analytics не є додатковими participation triggers.
4. Призначити authoritative state/result/grant owner. Клієнт передає намір; local timer, loader, випадковий результат чи click guard не дають права на винагороду.
5. Зафіксувати action matrix, recurrence, ліміти, pending/failure/recovery та terminal paths. UI спирається на [стани й час](04-state-and-time.md), а не повторно визначає їх у кожному CRM flow.
6. Пройти vertical slice на погодженому QA контурі: identity → fresh state → accepted entry → Journey → popup/control → grant result → product route. Кожен етап має окремий доказ.

Host/iframe protocol — [02](02-iframe-and-contracts.md); product navigation — [03](03-event-actions.md); native session і routing — [07](07-native-webview.md). Повторювані рішення й межі reuse — [promo patterns](21-promo-patterns.md). Перевірки та rollout — [QA](13-qa.md), [release](14-release-and-cache.md); приватні дані — [security](17-security.md).
