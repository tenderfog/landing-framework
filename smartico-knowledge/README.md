# Smartico: база знань для проєктування та дослідження

Цей розділ потрібний, щоб спроєктувати наступну механіку, знайти підтриманий спосіб налаштування й локалізувати збій. Він доповнює [операційні runbooks](../docs/05-smartico-missions-journeys.md), а не підміняє контракт конкретного продукту. Застосовується до SlotCity, CatBet і наступних продуктів через їхній власний environment/brand profile. Реальні ключі, URL Back Office, ID користувачів та entity map залишаються у приватному project kit.

Перевірка публічних джерел: **21.10.2026**. Важлива зміна: поточна документація Smartico рекомендує **Vibe Studio** для нових popup; старі template popups продовжують працювати. Досвід Configuration/Body збережено як окремий підтримуваний сценарій, без автоматичної міграції чинних акцій. [Джерело та межі](04-popups-and-routing.md).

## Що читати

| Питання | Розділ | Практичний результат |
|---|---|---|
| Де закінчується продукт і починається Smartico? | [01 — Модель та інтеграція](01-model-and-integration.md) | Карта entities, ownership, SDK/iframe/native capabilities |
| Mission чи Client Action? Як читати eligibility й наступний цикл? | [02 — Місії та стан](02-missions-and-state.md) | Авторитетний state contract, вибір механіки, reset policy |
| Як побудувати Journey, уникнути повторної видачі й перевірити бонус? | [03 — Journeys та винагороди](03-journeys-and-rewards.md) | Flow blueprint, entry/re-entry, grant та failure paths |
| Як зробити popup і провести його кнопки до потрібної дії? | [04 — Popups та routing](04-popups-and-routing.md) | Authoring path, click contract, queue та native delivery |
| Чому не працює? Що означають live-цифри? | [05 — Investigation та аналітика](05-investigation-and-analytics.md) | Послідовність перевірок, словник доказів та KPI |
| На які docs спиратися і що залишилося неперевіреним? | [Каталог джерел](SOURCES.md) | Прямі посилання, перевірені теми, версії, обмеження |

## Протокол відповіді для наступного агента

1. Класифікуй запит: **нова механіка / налаштування / код / дослідження збою / аналітика**. Встанови surface: landing, product widget, Smartico widget, popup чи native host.
2. Прочитай цей entrypoint, відповідний розділ і поточний integration contract проєкту. Знайди продукт, ENV, label/brand, session owner, entities та build. Якщо їх немає, продовжуй незалежну підготовку й уточнюй тільки дані, від яких залежить рішення.
3. Відкрий релевантні первинні джерела з каталогу. Для exact API method/field, BO capability, status чи нового модуля звір актуальну документацію з фактичною версією runtime. Посилання саме по собі не доводить прочитання.
4. Відокрем **Contract** проєкту, **Documented** можливість вендора, **Observed** результат конкретної перевірки, **Proposed** рішення та **Unknown**. `Documented` уточнює походження твердження; це не автоматичний статус контракту вашого tenant. Загальний evidence vocabulary — у [discovery](../docs/01-discovery-and-sources.md).
5. Дай пряму відповідь: що відомо; що треба налаштувати; у якому шарі; чим перевірити успіх. Для невідомого вкажи конкретний наступний read/check, а не вигаданий endpoint, schema, RPC чи «магічний» event.
6. Для реалізації зафіксуй мінімальний наскрізний сценарій, state/CTA matrix, тестові ролі й criterion of done. Для investigation спочатку доведи найраніший розрив у ланцюжку, потім запропонуй зміну.
7. Зберігай новий перевірений висновок через [maintenance](../docs/18-maintenance.md): джерело, дата, версія, межа застосування, regression. Не перетворюй тимчасовий workaround однієї кампанії на глобальний стандарт.

У наступному чаті посилання на repo дає доступ до знань лише після його прочитання доступними інструментами. Цей пакет не гарантує пам'ять попередньої розмови, доступ до приватного BO чи наявність конкретного Smartico connector.

## Формат корисного запиту

```text
Прочитай landing-framework/AGENTS.md та smartico-knowledge/README.md.
Продукт: <brand>; ENV: <stage|prod>; поверхня: <landing|widget|popup|native>.
Мета або симптом: <очікувана та фактична поведінка>.
Джерела: <brief / design / project kit / code / BO entity links>.
Результат: <blueprint / implementation / read-only investigation / report>.
Врахуй поточний scope авторизації з цього чату.
```

## Межа охоплення

Докладно описано інтегровані промо з missions, Client Actions, Journeys, markers, popups і бонусами. Tournaments, jackpots, raffles, store, dynamic rewards, visitor acquisition та Vibe authoring мають власні правила: використовуй [маршрути до офіційних docs](SOURCES.md), а не екстраполюй daily promo на будь-яку функцію Smartico.
