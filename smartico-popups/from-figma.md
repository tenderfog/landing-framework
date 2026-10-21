# Smartico popup за готовим дизайном Figma

Цей процес перетворює погоджені Figma variants на дизайн-специфікацію й поля creative. Він не дублює [контракт передачі](implementation-contract.md) або [legacy runtime runbook](../docs/06-smartico-popup-templates.md). Спочатку обрати [Vibe/legacy authoring](../smartico-knowledge/04-popups-and-routing.md); дизайн-перевірки нижче спільні, технічний output залежить від mode. Скопіювати [popup brief](templates/popup-brief.md).

## 1. Зафіксувати exact source і variants

Потрібні file key/node IDs, version або capture date, scope, desktop/mobile frames, locales й approved status. Відкрита загальна Figma page не визначає потрібний state: draft і approved можуть стояти поруч.

| Що у Figma | Що перенести в mapping sheet |
|---|---|
| Кожний variant | Node, visual state, desktop/mobile, locale, approved status |
| Heading/description | Exact copy, punctuation, line breaks, дозволені змінні |
| Кнопки й X | Label, skin, enabled/hidden, intent і погоджений action |
| Layout | Content width, gaps, type scale, safe zones, правила low-height viewport |
| Artwork/background | Layer/fill, alpha, crop, display size; [asset register](../templates/asset-register.md) |
| Hover/loading/motion | Allowed states, duration і reduced-motion вигляд |

Якщо tablet/landscape, focus, довга locale або 0/1/2 buttons відсутні, описати рішення й джерело. Не оголошувати домислений variant копією Figma. Internal names/field keys — латиницею; player copy і службовий BO description — різні дані.

## 2. Звірити copy та controls

Видимий текст береться дослівно з актуального погодженого дизайну, крім підтверджених owner змін. Не скорочувати description, міняти reward amount або «покращувати» CTA під час верстки. При новій механіці/даті спочатку звірити affected copy й artwork.

```text
Figma node → exact label → visual skin → business intent
→ rendered Smartico control/link → matched Journey branch → consequence
```

Картинка X не визначає його бізнес-наслідок. Заповнити action matrix у brief за [Journey runbook](../docs/05b-smartico-journey-runbook.md), включно з passive dismissal. Landing eligibility states додаються в popup тільки якщо цього потребує його flow.

## 3. Зіставити anatomy з reusable resource

Перевірити наявний compatible template/design до створення нового ID. Інша сума, icon або title за однакової anatomy зазвичай є іншими values/variation; принципово інша структура може мати окремий resource/template.

| Figma slot | Приклад custom поля legacy template | Presentation |
|---|---|---|
| Variant / locale | `visual_state`, `locale` | Whitelisted state і validated `lang` |
| Title / description | `title`, `description` | Escaped live text; approved line breaks |
| Icon | `icon_url`, `icon_alt` | Reserved dimensions і localized alt |
| Primary / secondary | Optional group, text, action | Vendor link hook, layout за actual count |
| Close | Visibility, label, action | Explicit semantic control |

Це mapping-приклад, не reserved Smartico schema. У legacy поля визначаються в Configuration та заповнюються у resource values; у Vibe використовуються actual authoring controls. Поле `locale` в HTML саме не перемикає вибір resource у Journey. Повний renderable Configuration/Body/values міститься **лише в [runnable example](examples/README.md)**; не підтримувати поруч другу неповну кодову копію.

## 4. Експортувати artwork і розтяжні skins

Основний [Figma/asset pipeline](../docs/08-figma-and-assets.md) доповнюється popup-перевірками:

1. Правильний layer/fill без чужої підкладки чи дубльованого тексту.
2. Display size на desktop/mobile та потрібному DPR; не upscale низький master.
3. Alpha на темному, світлому й реальному popup background.
4. Mobile crop/safe zones: artwork не перекриває icon, X або CTA.
5. Source→delivery derivative, bytes, version і стабільний HTTPS URL.

Heading, description й labels — живий текст. Для погодженого декоративного растрового напису потрібні semantic fallback і достатній source master. UI vector зберігається SVG, складний artwork — оптимізованим raster із потрібною alpha.

Декоративна кнопка може мати proportional end caps, stretch/repeat middle та окремий ornament. Label залишається HTML і може збільшувати висоту. 3-/9-slice обирати після preview конкретного artwork: vertical detail може виключати просту горизонтальну нарізку. Desktop/mobile не створюють дві накладені клікабельні копії. Runtime layout/hit-area правила — у [06](../docs/06-smartico-popup-templates.md).

## 5. Доповнити адаптиви та перевірити fidelity

Порівнювати Figma й rendered creative в **однакових** state/locale/viewport. Перевірити typography, exact copy, spacing, icon scale, alpha, skins і close position. Додати вузький/широкий mobile, tablet, breakpoint−1/±0/+1, desktop, low-height landscape, safe areas і text scaling. Supported minima беруться з product contract, не з випадкового frame.

Expected layout для 0/1/2 actions, доступність виходу без CTA, довгих labels і reduced motion зафіксувати у [спільному acceptance contract](implementation-contract.md). Якщо screenshot правильний, але CTA недосяжна, fidelity не пройдено.

Візуальний результат записується як node/version → fixture values → viewport/state/locale → screenshot. Compiler, actual action delivery, grant і physical App evidence — окремі перевірки за контрактом; ручний HTML preview їх не замінює.

## Результат цього процесу

Передати mapping sheet, exact copy, asset exports, responsive decisions і fidelity evidence у [спільний комплект передачі](implementation-contract.md). Для legacy продовжити [технічним runbook](../docs/06-smartico-popup-templates.md); для Vibe — actual saved resource/link exits за обраним contract. Дизайн-процес не створює нового дозволу на live publish.
