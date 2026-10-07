---
name: smartico-popup-templates
description: "Зібрати або виправити reusable Smartico Popup Configuration і Body за Figma або самостійним дизайном із брифу, з params, адаптивом, template-компіляцією й Web/native перевіркою. Використовувати для CRM creative, а не довільної модалки frontend."
---

# Smartico Popup Templates

Обрати маршрут із [окремого пакета](../../smartico-popups/README.md): готовий макет → [Figma runbook](../../smartico-popups/from-figma.md); бриф без макета → [самостійне проєктування](../../smartico-popups/from-brief.md). Спільні правила — [implementation contract](../../smartico-popups/implementation-contract.md) та [popup runbook](../../docs/06-smartico-popup-templates.md). Для actions потрібні [Journey contract](../../docs/05b-smartico-journey-runbook.md) і [Client Action nuance](../../docs/05c-smartico-client-actions.md); native runtime — [WebView](../../docs/07-native-webview.md).

## Виконання

1. Встановити target template/assets/ENV, дизайн-сценарій, copy та action matrix. За Figma зафіксувати exact nodes/variants; без макета підготувати конкретну visual spec і responsive proposal за brief. Existing template edit не замінювати окремим local template, що не використовується Journey.
2. Один structure template + variant assets/params, якщо anatomy сумісне. Параметризувати locale, texts, icon/assets, 0/1/2 buttons, actions, explicit close й animation flags.
3. Зібрати responsive HTML/CSS з live text та supported action hook. Не дублювати SDK click handler власним deep-link call; не видавати bonus у Body.
4. External HTTPS art/font URLs; zero large base64. Перевірити CSP/CORS/content types/cache й fallback. Fullscreen outer host bounds перевіряти окремо; child CSS не виходить з iframe/WKWebView.
5. Після export/minify тестувати actual `tmpl('_template', params)` engine. Literal `{%`/`%}` у CSS/HTML/JS і closing script raw-text collision не мають зламати compilation. Сам React/HTML preview не є цим тестом. [Повний приклад і checker](../../smartico-popups/examples/README.md) — база для власних fixtures, не production defaults.
6. Перевірити all variants/button flags/minimal params/long locales/escaping та actual root/assets. За потреби duplicate guard пропускає перший click незмінним.
7. Save у потрібний Smartico template, re-open/download і порівняти з local source. Всі assets використовують актуальний template. Native handshake success не доказ HTML render.
8. Web preview + actual iOS/RN Android render/actions; за відсутності device evidence явно залишити це pending, не заявляти cross-platform pass.

## Результат

Configuration, Body, params/asset manifest, byte/hash report, actual compiler tests, responsive screenshots, template/asset IDs і status, exact action table, unresolved native/CSP/outer-host checks. Public copy не містить Smartico/SDK/QA instructions. [QA](../../docs/13-qa.md).
