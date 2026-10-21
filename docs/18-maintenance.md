# Підтримка framework без дублювання

## Версія та adoption

Зберігати reviewed Git commit/tag. Project repo посилається на pinned framework і власні overrides у root `AGENTS.md`; не змінювати methodology випадковим pull під час кампанії. Portable skills читаються з пакета або встановлюються окремо — файл у Git не означає global auto-discovery.

## Одне канонічне місце для кожного виду знання

| Вид матеріалу | Власник змісту | Що лишається в суміжних файлах |
|---|---|---|
| Smartico concepts, API semantics, versioned facts | `smartico-knowledge/` + його [джерела](../smartico-knowledge/SOURCES.md) | Коротке правило й посилання на потрібний контракт |
| Процедурне Mission/Journey/Client Action налаштування | `docs/05a`, `05b`, `05c` | Не друга повна копія SDK/lifecycle tutorial |
| Legacy Configuration/Body, actual compiler/runtime | [06](06-smartico-popup-templates.md) | Дизайн-сценарії й KB посилаються на технічний контракт |
| Incident mechanism, actual fix, proof limits | [22](22-incidents-and-popup-cleanup.md) | [15](15-troubleshooting.md) містить лише symptom/evidence/route index |
| Project values та acceptance | `templates/` | Порожні поля/checklists із посиланням на guide, без копії guide |
| Виконуваний приклад | `examples/` або `smartico-popups/examples/` | Пояснення behavior/меж, без другої реалізації в prose |
| Брендова capability, ENV/entity map, campaign facts | Приватні product profile та campaign kit | У shared framework лише pattern і спосіб перевірки |

Navigation table, короткий safety invariant і згадка причини посилання — корисне повторення. Другий повний checklist, payload, словник метрик або інструкція з окремими defaults — кандидат на об'єднання.

## Новий досвід → правило

1. Зберегти приватний evidence record: environment/build/platform, reproduction, observed symptom, cause confidence, actual change, before/after tests та scope.
2. Перевірити primary source або відтворення й суперечності з чинним product contract. Підтверджена reproduction механізму не обов'язково встановлює причину original production delivery.
3. Знайти канонічний файл у таблиці. Спочатку виправити/доповнити наявний розділ; створювати новий лише для окремої відповідальності.
4. Перенести узагальнений вибір, applicability і regression. Випадкові dates, IDs, colors, parser workarounds і device settings не стають global defaults. Для нерозв'язаної причини зберігати investigation recipe, не MUST.
5. У суміжних docs залишити короткий route; синхронізувати тільки affected templates/examples/QA. Старе пояснення, яке суперечить новому, замінити, а не дописати поруч третю версію.

## Зміна API/host

Для нового message/schema/capability зафіксувати owner, version, consumers, rollout, fallback та tests; оновити sources, contract, implementation/example і QA разом. Historical snapshot лишається доказом минулої поведінки, не instruction використати deprecated method.

Новий Client Action name може використовувати чинний generic sender без App release; новий тип routing/RPC може вимагати host/native зміни. Перевіряти capability, не обіцяти автоматичну сумісність.

## Перед публікацією або видаленням

Звірити scope, repo visibility, internal links, JSON/examples і affected checks. Прибрати приватні artifacts/secrets/temp paths; production assets не додаються лише для прикраси docs. Для видаленого/об'єднаного файла знайти всі inbound links і оновити entrypoints/sources. Порожній compatibility stub потрібний тільки за реальних зовнішніх consumers; Git history зберігає попередню редакцію.

Перед вилученням runtime коду перевірити consumers і safety invariants за [cleanup runbook](22-incidents-and-popup-cleanup.md). Source/fixture/history самі по собі не є runtime bloat; видалення не повинно прибирати validation, error recovery або чинну backward compatibility.
