---
name: smartico-client-actions
description: "Налаштувати named Smartico Client Action та його sender/BO trigger для промо, з payload, caps і авторитетним state source. Використовувати коли Journey запускається дією; не змішувати з product event_action або popup engagement click."
---

# Smartico Client Actions

Читати [Client Action runbook](../../docs/05c-smartico-client-actions.md). Entry flow → [Journey](../../docs/05b-smartico-journey-runbook.md), transport → [event actions](../../docs/03-event-actions.md), App → [native](../../docs/07-native-webview.md).

## Виконання

1. Визначити business intent, exact Latin action name/case, payload schema, sender owner й state provider. Не створювати mission лише тому, що вона була в попередній акції.
2. В selected ENV/Label/Brand перевірити existing registered action та dependencies. Через BO Tools/Properties зареєструвати потрібне значення або погоджено test discovery; не sends Production action для autocomplete.
3. Обрати один transport: owned web SDK `_smartico.action`, host `event_action/smartico` за registry, existing native service або server-to-server. Приклади — тільки за підтриманим contract; keys не зберігати в landing.
4. Exact event/name/payload conditions у Journey/task. Не змішувати engagement `cid:104` із named Client Action; native `dp:action` не вважається автоматично installed sender.
5. Server eligibility/entry caps/idempotency, calendar timezone й авторитетний remaining/pending/reset state. LocalStorage/click time не замінює це. Payload UUID має сенс тільки якщо receiver deduplicates.
6. Unknown timeout → reconciliation, не blind replay. Guest/unverified → стандартна auth/verif modal без entry event. Logout/user change відкидає stale results.
7. QA single/double/mixed/replayed click, wrong payload/case, midnight, App/Web parity; analytics відокремлено від business trigger.

## Результат

Action inventory й exact name, sender/transport, payload/filter contract, state source, caps, Journey/task IDs, verified end-to-end evidence, blockers. Не заявляти grant або доступність спроби за фактом виклику `.action()`. [Analytics](../../docs/12-analytics.md), [QA](../../docs/13-qa.md).
