# Реалізація модалок Smartico

Окремий пакет для створення **Smartico Popup Template**, його creatives та перевірки показу у Web, Swift WKWebView і React Native Android WebView. В обох сценаріях результат завантажується у Smartico. Самостійна реалізація означає проєктування за брифом без готового макета; вона також завершується Smartico template.

## Обрати сценарій

| Вхідні матеріали | Інструкція | Що має з'явитися перед версткою |
|---|---|---|
| Готові Figma nodes, desktop/mobile, visual states | [За дизайном Figma](from-figma.md) | Реєстр variants, точний copy, tokens, exports і таблиця actions |
| Бізнес-бриф, механіка й brand constraints без готового дизайну | [Самостійне проєктування](from-brief.md) | Структура, тексти, responsive visual proposal і таблиця actions |

Далі обидва сценарії використовують [контракт реалізації](implementation-contract.md), [технічний popup runbook](../docs/06-smartico-popup-templates.md) і [навичку агента](../skills/smartico-popup-templates/SKILL.md). Не потрібно читати обидва дизайн-сценарії для кожного завдання.

## Мінімальний комплект результату

1. `configuration.json` — поля BO, типи, defaults, optional blocks; internal labels і names латиницею.
2. `body.html` — HTML/CSS із синтаксисом фактичного `tmpl`, живими текстами й action hooks Smartico.
3. `values.<state>.<locale>.json` — повний набір значень кожного creative; ключі узгоджені з Configuration. Формат імпорту values перевірити у вашому BO, JSON може бути реєстром для ручного заповнення.
4. Реєстр ресурсів — HTTPS URL, dimensions, format, bytes, cache/CORS, locale та походження.
5. Таблиця поведінки — primary, secondary, X, backdrop, Escape і native Back; точний connector або навігація, без припущення про grant.
6. QA та delivery record — template/creative IDs після створення, version/hash, engine, responsive screenshots, actual Web/App результати й невирішені залежності.

Один template обслуговує кілька creatives за однакової структури. Journey обирає creative та визначає результат. Body відображає вже передані дані й передає натискання через підтриманий hook. [Місії та Journey](../docs/05-smartico-missions-journeys.md) налаштовуються окремо від верстки.

## Повний навчальний приклад

[Приклад Configuration + Body + values + compiler check](examples/README.md) можна використати як старт для нового template. Він демонструє optional icon, 0/1/2 кнопки, явний X, mobile stack, desktop columns, escaping і reduced motion. Його conditional blocks справді компілюються Smartico engine; виграш чи видачу бонуса приклад не реалізує. Умовні CDN/product origins замінюються підтвердженими ресурсами та routes до завантаження у BO.

Для нової модалки скопіюй [brief](templates/popup-brief.md) у її repo, заповни дизайн-сценарій і контракт. Local preview — розробницький fixture; перевірка завершується saved template у Smartico й доставленим creative на потрібних платформах.

## Послідовність роботи

`Джерела / бриф → copy та action matrix → дизайн → params і assets → Body → actual tmpl check → Smartico Template → Creatives → Journey binding → Web / App QA`

Якщо завдання — виправити існуючу модалку, спочатку встанови, який template ID реально використовують її creatives та Journey. Зміна іншого локального файла або нового не підключеного template не виправляє доставлений popup.
