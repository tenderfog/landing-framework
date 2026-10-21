# Спільний контракт реалізації Smartico popup

Це єдина специфікація комплекту передачі й acceptance після [Figma-процесу](from-figma.md) або [проєктування з brief](from-brief.md). Authoring mode і delivery/routing concepts визначає [popup KB](../smartico-knowledge/04-popups-and-routing.md); Configuration/Body mechanics — [legacy runbook](../docs/06-smartico-popup-templates.md). Рендерер не визначає outcome, grant чи caps.

## 1. Заповнений паспорт

Використати **один [popup brief](templates/popup-brief.md)** у campaign kit. Він містить джерела, ENV/label/brand, mode/runtime, entities, surfaces/builds, exact states/copy/actions, outer bounds, locales, params/assets і open dependencies. Не переносити entity IDs, dates або rewards іншої акції.

Action matrix із brief має покривати всі видимі controls і passive close paths. Вона зв'язує rendered action → connector/route → business effect → required confirmation; не виводити semantics із назви `dp:ok/cancel` чи картинки X. Деталі серверного flow — [Journey runbook](../docs/05b-smartico-journey-runbook.md).

## 2. Комплект передачі за authoring mode

| Артефакт | Legacy template | Vibe / інший підтверджений vendor mode |
|---|---|---|
| Saved resource inventory | Actual template, resources/variations і Journey bindings | Actual saved design/resource, variations і Flow link exits |
| Render source | `configuration.json` + final `body.html` | Supported saved authoring output/version; legacy export не вигадується |
| Content/flags | Values per state/locale з типами й precedence | Actual variation/content/link settings відповідного mode |
| Common design evidence | Figma mapping або visual spec, approved exact copy, responsive previews | Те саме за доступними authoring controls |
| Asset register | HTTPS sources, dimensions, bytes, cache/CORS/provenance/locales | Те саме, з actual hosted output |
| Functional evidence | Action matrix, compiler report, real delivery/interaction | Action matrix, actual saved preview/runtime і delivery/interaction |
| Release record | Source/Body/runtime hashes, target inventory, Web/App results, remaining gaps | Saved version/resource inventory, Web/App results, remaining gaps |

Values JSON може бути реєстром для ручного введення: import support перевіряється у вашому BO. Поля прикладу не оголошуються reserved vendor API. Тільки потрібні marketer content/variants робляться редагованими; не потрібно параметризувати кожний CSS pixel.

## 3. Єдина acceptance matrix

| Перевірка | Мінімальний доказ / owner |
|---|---|
| Source і content | Approved nodes/spec + exact state/locale copy, punctuation, qualifiers; player text без internal/QA instructions |
| Effective data | Body/design ↔ fields/defaults ↔ saved values узгоджені; unique keys, required copy/actions, strict flags і відомий fallback |
| Legacy compiler | Actual trusted engine/hash і template-ID path; states/locales/minimal/escaped/missing/false/0/1/2-button matrix за [06](../docs/06-smartico-popup-templates.md) |
| Vibe runtime | Actual supported saved output/preview й link exits; legacy compiler PASS до нього не застосовується |
| Layout/accessibility | Narrow/intermediate/desktop, low height, safe-area, long locale, 200% text zoom, keyboard/focus/contrast; controls досяжні |
| 0/1/2 actions | Немає порожнього grid/gap; single action має завершений рядок; без CTA є approved exit/dismiss policy |
| Assets/fallbacks | Visible nonempty content при cold/warm load, slow/failed image/font і custom-JS failure; actual bytes/CSP/CORS |
| Interaction | Перший click/tap по всій видимій hit area доходить один раз; mixed clicks, X і passive close за matrix; clean release variant без diagnostic dependency |
| Flow/bonus/routing | Actual action report → matched branch → authoritative grant/pending/failure → required destination; не screenshot або click inference |
| Native | Exact Swift WKWebView / RN Android build: handshake + visible content + action handling + Back/close/focus/scroll lifecycle |
| Save та fresh delivery | Re-open/readback source/version/effective values; correct resource bound to activity; fresh delivered payload відповідає release |

Global delivery settings, queue/caps та повторне відкриття перевіряються за [popup KB](../smartico-knowledge/04-popups-and-routing.md). Діагностичні engine fixtures не тестують network, vendor click hooks, grants, focus management або hardware performance. Зберігати PASS/FAIL/NOT_TESTED окремо за рівнями [QA](../docs/13-qa.md).

## 4. Зміни та compatibility

| Зміна | Що перечитати й перевірити |
|---|---|
| Copy/icon-only | Effective values відповідних variations, assets/locales й affected visual states |
| Structure/schema/defaults | Body/design, Configuration і **всі** bound resources; старі overrides/minimal params/cached engagements |
| Action/close behavior | Action matrix, exact Journey connectors, pending context, grant/routing та passive close |
| Locale | Exact approved copy, resource selection/fallback, fonts/art й long-text QA |
| Shared asset/template removal | Повний usage inventory і active-consumer lifetime; не видаляти лише через відсутність локального посилання |

Cleanup/reconfiguration виконується за [єдиним runbook у каталозі інцидентів](../docs/22-incidents-and-popup-cleanup.md), без другої паралельної інструкції тут. Source change, BO save, Journey binding і runtime delivery — окремі результати. Publish виконується лише в чинному authorized scope; цей контракт сам не дає дозволу на live зміни.
