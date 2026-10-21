# Smartico popups: дизайн, реалізація й передача

Точка входу для popup-задач. Спочатку визначити [authoring mode у KB](../smartico-knowledge/04-popups-and-routing.md): поточні vendor docs рекомендують Vibe для нових popup, а existing Configuration/Body templates мають окремий legacy contract. Доступність перевіряється в конкретному label; автоматична міграція не потрібна.

| Задача | Канонічний документ |
|---|---|
| Є approved Figma | [Figma → design mapping](from-figma.md) |
| Є business brief, але немає макета | [Visual spec із brief](from-brief.md) |
| Скопіювати поля конкретної задачі | [Popup brief](templates/popup-brief.md) |
| Що саме передати й чим довести готовність | [Implementation/acceptance contract](implementation-contract.md) |
| Legacy fields, Body, compiler, hooks, layout | [Технічний runbook](../docs/06-smartico-popup-templates.md) |
| Один повний executable legacy приклад | [Configuration/Body/values + checker](examples/README.md) |
| Delivery, queue, routing, native ownership | [Popup knowledge base](../smartico-knowledge/04-popups-and-routing.md) |
| Bugfix, reconfiguration, видалення зайвого коду | [Incident catalog і cleanup](../docs/22-incidents-and-popup-cleanup.md) |

Читати лише обраний дизайн-процес; спільні runtime правила та acceptance не копіюються в нього. Послідовність: **sources/brief → copy/actions → дизайн → mode-specific implementation → save/readback → real delivery/QA**. [Переносна навичка](../skills/smartico-popup-templates/SKILL.md) спеціалізується на legacy.

Для правки existing popup спочатку знайти actual template/resource/variation та Journey references. Зміна непідключеного локального файла не змінює доставлений popup. Local preview не замінює saved resource й actual Web/App evidence за контрактом.
