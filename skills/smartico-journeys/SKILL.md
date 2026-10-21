---
name: smartico-journeys
description: "Спроєктувати, налаштувати або перевірити Smartico User Journey для промо з Mission або Client Action trigger, popup choices, bonus grants, caps і навігацією. Не підміняти flow локальною симуляцією landing."
---

# Smartico Journeys

Читати [Journey BO runbook](../../docs/05b-smartico-journey-runbook.md) та [overview](../../docs/05-smartico-missions-journeys.md). Mission trigger → [mission runbook](../../docs/05a-smartico-mission-runbook.md); named action → [Client Action runbook](../../docs/05c-smartico-client-actions.md). Popup resources → [template runbook](../../docs/06-smartico-popup-templates.md).

## Виконання

1. Перевірити ENV/Label/Brand та task scope. Знайти existing flow, зберегти before-state й IDs; не створювати duplicate Journey, якщо треба його виправити.
2. Оформити action/grant matrix до edit: точний entry, eligibility, repeat policy, branches, explicit X/claim/risk/passive close, failures/expiry, navigation.
3. Вибрати Mission або Client Action entry за actual contract, відфільтрувати exact mission/task/name. Не надсилати два triggers для одного intent «для надійності».
4. Налаштувати Draft flow з actual popup resources обраного [Vibe/legacy mode](../../smartico-knowledge/04-popups-and-routing.md). Версії/ймовірності/re-entry modes/caps беруться зі spec; не переносити параметри іншої акції або Stop-and-Start як універсальне правило.
5. Click connectors exact; взаємовиключні choices закривають original engagement. Server caps/idempotency обов'язкові для grant; local disabled не замінює їх.
6. Вибрати certified bonus IDs. Claim/X одного reward не потребують різних bonus entities. Навігація лише після supported confirmed-grant output; failure/pending не успіх.
7. Усі navigation targets — supported event actions; preserve `dp:ok/cancel/action` controls. [Native router](../../examples/native-smartico-routing.md) має бути підтверджений для App.
8. Save/reopen, validate each node/connector/settings, publish у дозволеному scope, перевірити runtime propagation і Campaign/Execution Status окремо.

## Результат

Journey/node inventory, exact trigger, matrix/caps, end/explicit stop semantics, assets/bonuses, saved screenshots/values, QA chain evidence й blockers. [QA](../../docs/13-qa.md), [release](../../docs/14-release-and-cache.md). Поточний user scope має пріоритет над наведеними прикладами; skill не дає самостійного права на Production publication.
