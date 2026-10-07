---
name: smartico-missions
description: "Налаштувати або перевірити Smartico Mission для промо: opt-in, tasks, eligibility, availability та календарний reset. Використовувати для mission-backed механік; для Journey лише за Client Action обрати smartico-client-actions."
---

# Smartico Missions

Portable skill цього playbook; глобальна установка не потрібна. Читати [overview](../../docs/05-smartico-missions-journeys.md) і [BO mission runbook](../../docs/05a-smartico-mission-runbook.md). Для bridge/identity також [iframe contract](../../docs/02-iframe-and-contracts.md); для App [native contract](../../docs/07-native-webview.md).

## Виконання

1. Визначити конкретну потребу: нова mission, аудит або правка існуючої. Перевірити selected ENV/Label/Brand, target objects та authorization scope. Не міняти unrelated flows.
2. Знайти існуючі mission/tasks й прочитати їх before-state. Встановити source of truth механіки: opt-in/completion, reward owner, segment, dates, IANA timezone, recurrence.
3. У BO створити/редагувати відповідний тип; internal names Latin, службові descriptions українською, public fields за локалізацією. Не вибирати demo Locked mission як default для daily reset.
4. Вказати точний task event/filter. Якщо Journey видає prize, прибрати неузгоджену додаткову mission/task reward. Не дублювати opt-in named completion event.
5. Налаштувати backend schedule, включно з first QA run та DST. Перевірити next runs після save/reopen. Timer UI не виправляє rolling server recurrence.
6. Записати IDs/status/config і передати mission ID provider config правильного середовища. Перевірити loading/missing/locked/used/error та stale identity, не opt-in «за замовчуванням».
7. Activate/test тільки в межах authorized target/scope; якщо activation уже прямо дозволена користувачем, не просити повторного дозволу. Реальні grant/financial QA clicks мають окрему явну процедуру й account.

## Результат

Saved/reopened values, mission/task inventory, timezone/next-runs evidence, source/schema of UI state, reward/eligibility ownership, перевірене read/opt-in окремо, unresolved items. Не вважати BO Preview доказом actual native/Web результату. [QA](../../docs/13-qa.md).
