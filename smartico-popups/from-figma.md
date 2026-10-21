# Smartico popup за готовим дизайном Figma

Область цього runbook — **legacy Configuration/Body**, якщо саме цей mode підтверджено. Для нового popup спершу перевірити [Vibe/legacy routing](README.md); design/action/QA principles нижче лишаються корисними в обох modes, але output/engine відрізняються.

Цей runbook перетворює погоджений Figma-дизайн на **template у Smartico та creatives на його основі**. Результат — Configuration JSON, Body HTML/CSS, локалізовані значення creatives, delivery assets і QA evidence. Локальна сторінка потрібна для preview і перевірки compiler; вона не стає окремою frontend-модалкою, яка підміняє CRM flow.

Перед реалізацією прочитати [спільний implementation contract](implementation-contract.md), [технічний runbook шаблонів](../docs/06-smartico-popup-templates.md), [native wrapper](../docs/07-native-webview.md), [Figma/assets](../docs/08-figma-and-assets.md). Тут описано послідовність роботи з дизайном; спільні правила не перевизначаються. Для початку скопіювати [popup brief](templates/popup-brief.md); повний узгоджений [Configuration/Body/values комплект і runnable checker](examples/README.md) доповнює структурний фрагмент нижче.

## 1. Зафіксувати дизайн і межі роботи

Потрібні exact file key/node IDs, version або дата capture, scope, desktop/mobile frames і всі popup variants. Відкрита загальна Figma page не достатня. Знайти конкретний state і перевірити назву frame: draft і approved можуть стояти поруч.

До коду створити mapping sheet:

| Що у Figma | Що записати | Артефакт |
|---|---|---|
| Кожний popup variant | Node, visual state, desktop/mobile, locale, approved status | Design source register |
| Heading/description | Exact copy, punctuation, line breaks, дозволені змінні | Copy matrix |
| Кнопки та хрестик | Text, appearance, enabled/hidden, intent, Journey action | CTA matrix |
| Layout | Content width, gaps, type scale, safe zones, низька висота | Responsive specification |
| Artwork/background | Source layer/fill, alpha, crop, display size | [Asset register](../templates/asset-register.md) |
| Hover/loading/motion | Тривалість, allowed states, reduced-motion вигляд | Motion brief |

Назви файлів, parameter keys, template/creative names — латиницею. Видимий текст — мовою creative; службовий опис BO не підміняє description гравця.

**Checkpoint:** є точні джерела та повний перелік variants. Якщо відсутні tablet/landscape, hover/focus, довга локаль або 0/1/2 кнопки, явно сформувати їхню поведінку в specification та звірити з owner. Не оголошувати вигаданий стан копією Figma.

## 2. Звірити copy та action contract

Production copy береться **дослівно з актуального погодженого дизайну**, крім окремо погоджених змін owner. Не скорочувати description, не міняти reward amount і не «покращувати» CTA під час верстки. Якщо product/legal змінили механіку або дату, спочатку узгодити affected copy/арт, а потім експортувати.

Для кожного control заповнити:

```text
Figma node → exact label → visual skin → business intent
→ Smartico href/control → exact Journey connector → grant/navigation consequence
```

Приклад різниці: «Забрати» і хрестик можуть давати однакову винагороду, але мати різну навігацію після grant. Це бізнес-контракт, який не можна вивести з картинки хрестика. Escape/backdrop/native Back теж не стають claim автоматично. Рішення й exact connector беруться з [Journey runbook](../docs/05b-smartico-journey-runbook.md).

Для навігаційної CTA використовувати підтриманий `dp:go&url=<product>/event_action/...`; для CRM control зберігати погоджений `dp:*`. Перехід до бонусів не замінює нарахування. Повний registry та transport — у [event actions](../docs/03-event-actions.md).

**Checkpoint:** кожний видимий control має один підтверджений наслідок, а missing action не підмінено порожнім URL чи випадковим deep link. Неверефіковані/guest стани додавати до popup лише якщо його business flow справді вимагає їх; landing eligibility і delivered popup state — різні рівні.

## 3. Вибрати anatomy і параметри шаблону

Спочатку подивитися наявні Smartico templates. Якщо compatible anatomy вже існує, виправити або використати його; не створювати новий ID заради кожного reward amount. Якщо variant має принципово іншу структуру, окремий template може бути виправданий.

Типова reusable anatomy:

```text
Backdrop / optional background artwork
  Content panel
    Optional decoration
    Optional icon
    Live heading
    Live description
    Optional primary + optional secondary action
    Explicit close control
```

Розділити три шари:

- **Configuration:** назви BO-полів, field types, дозволені optional groups та defaults.
- **Body:** DOM, scoped responsive CSS, engine interpolation, layout за actual button count.
- **Creative values:** конкретний visual state, locale, exact copy, art URLs, checked flags і погоджені actions.

`visual_state`, `locale`, `primary_text` тощо — **поля вашого шаблону**, а не автоматичні reserved Smartico fields. Вони існують лише після визначення в Configuration та заповнення values. Variant у Figma не є backend outcome generator; Journey обирає resource.

Визначити missing-param policy: необов'язковий decoration може зникнути; відсутній обов'язковий title/action — помилка export/QA. Не default-ити невідомий результат у виграш. Default language/visual state не має містити прихованої механіки.

## 4. Експортувати artwork і зробити розтяжні skins

Звичайні heading, description й labels — живий HTML-текст. Невеликий UI icon — оригінальний SVG, якщо він vector. Складний 3D artwork — оптимізований raster із source provenance та потрібною alpha. Для декоративного растрового напису потрібен семантичний текст/alt і достатній original master, а не лише збільшений export.

Для кожного artwork перевірити:

1. Що це правильний layer/fill, без чужої підкладки або дублювання тексту.
2. Реальний display size на desktop/mobile і DPR2/3.
3. Alpha на темному, світлому й реальному popup background.
4. Mobile crop та safe area; decoration не обрізає icon/close.
5. Source → compressed delivery, encoder options, bytes та stable HTTPS URL.

Повний asset pipeline — у [08](../docs/08-figma-and-assets.md); не вшивати великі art/font base64 у dynamic Body.

Коли дизайн має декоративну кнопку з ornament:

- Left/right caps лишаються пропорційними.
- Тільки middle stretch/repeat, або використовується перевірений SVG/CSS skin.
- Ornament — окремий шар, не частина тексту і не hit area.
- Label — HTML; довгий label може збільшувати висоту.
- Desktop/mobile використовують той самий action, а не дві накладені клікабельні копії.

Проміжні ширини не повинні розтягувати емблему чи текст. 3-/9-slice обирати після preview реального artwork; якщо button має значущий вертикальний detail, проста горизонтальна нарізка може не підходити.

## 5. Приклад Figma → Configuration → Body → creative

Нижче **навчальний приклад умовного дизайну**, а не копірайт затвердженої акції або BO import. Умовний frame містить icon, title «Винагорода готова», description «Обери наступну дію», дві кнопки «Забрати» / «Продовжити» і хрестик. Призначення controls і exact connectors має бути підтверджене Journey перед production. `dp:close` наведений у [офіційному custom-popup прикладі](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/pop-up); будь-який claim потребує окремої механіки.

| Figma slot | Custom Configuration field | Body | Creative value |
|---|---|---|---|
| Variant | `visual_state` | Whitelisted `data-state` | `offer`, `result` або `info` |
| Locale | `locale` | Validated `lang` | `uk` / `en` за supported mapping |
| Title text | `title` | `h2` escaped text | Exact title з потрібного node |
| Description | `description` | `p`, `white-space:pre-line` | Exact description, включно з `\n` |
| Icon | `icon_url`, `icon_alt` | `img` | Approved URL та localized alt |
| Primary CTA | Optional `primary_button`, `primary_text`, `primary_action` | Anchor зі стандартним hook | `checked`, label, exact `dp:*` |
| Secondary CTA | Optional `secondary_button`, `secondary_text`, `secondary_action` | Другий anchor | `checked`, label, exact `dp:*` |
| Close | `close_label`, `close_action` | Explicit close anchor | Accessible label та agreed control |

Configuration фрагмент визначає саме використані нижче fields:

```json
[
  {
    "label": "Content",
    "options": [
      {
        "name": "content",
        "label": "Content",
        "fields": [
          {"name":"visual_state","type":"text","label":"Visual state","value":"info"},
          {"name":"locale","type":"text","label":"Locale","value":"uk"},
          {"name":"title","type":"text","label":"Title","value":""},
          {"name":"description","type":"text","label":"Description","value":""},
          {"name":"icon_url","type":"image","label":"Icon","value":""},
          {"name":"icon_alt","type":"text","label":"Icon alt","value":""}
        ]
      }
    ]
  },
  {
    "label": "Actions",
    "options": [
      {
        "name": "primary_button",
        "label": "Primary action",
        "optional": true,
        "optional_default": true,
        "fields": [
          {"name":"primary_text","type":"text","label":"Text","value":""},
          {"name":"primary_action","type":"url","label":"Smartico action","value":""}
        ]
      },
      {
        "name": "secondary_button",
        "label": "Secondary action",
        "optional": true,
        "optional_default": false,
        "fields": [
          {"name":"secondary_text","type":"text","label":"Text","value":""},
          {"name":"secondary_action","type":"url","label":"Smartico action","value":""}
        ]
      },
      {
        "name": "close_control",
        "label": "Close control",
        "fields": [
          {"name":"close_label","type":"text","label":"Accessible label","value":""},
          {"name":"close_action","type":"url","label":"Smartico action","value":""}
        ]
      }
    ]
  }
]
```

Body — структурний skeleton. Він демонструє binding та 0/1/2 layout, а не готовий дизайн кнопок, fullscreen wrapper override або complete validation:

```html
{% var state = /^(offer|result|info)$/.test(o.visual_state) ? o.visual_state : 'info';
   var locale = o.locale === 'en' ? 'en' : 'uk';
   var primary = !!(o.primary_button && o.primary_button.checked === true && o.primary_text && o.primary_action);
   var secondary = !!(o.secondary_button && o.secondary_button.checked === true && o.secondary_text && o.secondary_action);
   var count = (primary ? 1 : 0) + (secondary ? 1 : 0); %}
<style>
  .promo-creative { width: 100%; padding: 24px 16px; text-align: center; }
  .promo-creative__content { max-width: 640px; margin: auto; }
  .promo-creative__icon { width: 160px; max-width: 100%; height: auto; }
  .promo-creative__description { white-space: pre-line; }
  .promo-creative__actions { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .promo-creative__actions--single { max-width: 320px; margin-inline: auto; }
  .promo-creative__action { min-height: 44px; padding: 12px 20px; }
  @media (min-width: 640px) {
    .promo-creative__actions--double { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
</style>
<section class="promo-creative" data-state="{%=state%}" lang="{%=locale%}" aria-labelledby="promo-creative-title">
  <div class="promo-creative__content">
    {% if (o.icon_url) { %}
      <img class="promo-creative__icon" src="{%=o.icon_url%}" alt="{%=o.icon_alt || ''%}">
    {% } %}
    <h2 id="promo-creative-title">{%=o.title%}</h2>
    <p class="promo-creative__description">{%=o.description%}</p>
    {% if (count > 0) { %}
      <div class="promo-creative__actions promo-creative__actions--{%=count === 2 ? 'double' : 'single'%}">
        {% if (primary) { %}
          <a class="promo-creative__action" href="{%=o.primary_action%}" data-ao-hide-popup="true">{%=o.primary_text%}</a>
        {% } %}
        {% if (secondary) { %}
          <a class="promo-creative__action" href="{%=o.secondary_action%}" data-ao-hide-popup="true">{%=o.secondary_text%}</a>
        {% } %}
      </div>
    {% } %}
    {% if (o.close_action && o.close_label) { %}
      <a class="promo-creative__close" href="{%=o.close_action%}" data-ao-hide-popup="true" aria-label="{%=o.close_label%}">×</a>
    {% } %}
  </div>
</section>
```

Поля з URI перед render/export перевіряються за allowed scheme/origin/action contract. Escaped interpolation не є URL allowlist. `checked=true` без label/action не повинно мовчки пройти acceptance: skeleton не рендерить порожній link, а preflight має повідомити про missing value. Optional flag у цьому прикладі потребує explicit boolean; фактичну BO serialization перевірити.

Навчальні values для першого українського creative:

```json
{
  "visual_state": "offer",
  "locale": "uk",
  "title": "Винагорода готова",
  "description": "Обери наступну дію",
  "icon_url": "https://cdn.example.test/promos/shared/reward.a1b2.webp",
  "icon_alt": "",
  "primary_button": {"checked": true},
  "primary_text": "Забрати",
  "primary_action": "dp:ok",
  "secondary_button": {"checked": true},
  "secondary_text": "Продовжити",
  "secondary_action": "dp:cancel",
  "close_label": "Закрити",
  "close_action": "dp:close"
}
```

Це values, не готовий REST/API payload для створення creative. Вносити їх через підтримані поля поточного BO. Для англійського creative взяти exact англійський copy з approved source, а не автоматичний переклад на етапі release. Налаштування locale/resource fallback перевірити в чинному Smartico flow; власне поле `locale` змінює HTML presentation, але саме по собі не змушує Journey вибрати ресурс іншою мовою.

## 6. Доверстати всі розміри й кількості кнопок

Тільки desktop/mobile Figma не покривають проміжні розміри. Зібрати власну responsive matrix: вузький mobile, широкий mobile/DPR3, tablet, breakpoint−1/±0/+1, desktop, low-height landscape і native safe areas. Фактичні supported minima — з [integration contract](../templates/integration-contract.md).

| Випадок | Очікуваний layout | Що не допускається |
|---|---|---|
| 2 кнопки desktop | Дві колонки, відповідні skins | Стиснутий/обрізаний label, різні hit areas без дизайну |
| 2 кнопки mobile | Одна під одною, порядок за дизайном | Накладання ornament, незмінна desktop ширина |
| 1 primary або 1 secondary | Одна centered/full-width за specification | Порожня друга колонка |
| 0 CTA | Actions container відсутній | Порожній gap, застряглий недоступний popup |
| Long translation | Normal text wrapping/height growth | Bitmap label або невидиме ellipsis |
| Low viewport height | Досяжний close/CTA, дозволений content scroll | Центрування, що обрізає верх/низ назавжди |

Для 0 CTA має бути підтверджений спосіб завершення: explicit close, outer dismissal або agreed expiry. Відсутність усіх controls не приймається лише тому, що screenshot відповідає Figma. Focus management, outer modal behavior і fullscreen залежать від host; деталі [06](../docs/06-smartico-popup-templates.md) та [07](../docs/07-native-webview.md).

Застосовувати scoped CSS. Fullscreen перевіряти від outer iframe/native view до content root; child `position:fixed` не обійде обмежений host. Дим/background не повинен знижувати contrast. Анімація — короткий entrance/невеликий decorative motion з reduced-motion; WebGL додавати лише за окремим обґрунтуванням, не автоматично для кожного creative. [Media/GPU guide](../docs/10-media-animation-webgl.md).

## 7. Fidelity, compiler та performance QA

Зробити дві незалежні перевірки:

1. **Fidelity:** Figma й rendered creative у тому самому state/locale/viewport поруч; typography, exact copy, spacing, sizes, artwork, alpha, button skins, close position, intermediate adaptive.
2. **Runtime:** actual template compiler + entry path, optional/missing fields, 0/1/2 buttons, href/control, loader/errors за contract, asset/font load, no empty root.

Browser screenshot із ручною підстановкою values не доводить, що Smartico engine скомпілює Body. Виконати compiler regression та delimiter-safe checks з [06](../docs/06-smartico-popup-templates.md) **після** кінцевої мініфікації/експорту. Не локально виправляти один preview і залишати BO на старому template.

Перевірити bytes окремо: Body/config, external critical artwork/fonts, декодована пам'ять і рух. Cold/warm CDN, slow network, missing icon/font, reduced-motion, long copy. Вагові цілі задаються проєктом за [performance guide](../docs/11-performance.md); не переносити довільну максимальну вагу з іншого popup.

Звіт містить source node/version, params fixture, viewport/device/locale/state, screenshot, compiler result, фактичні bytes і залишкові обмеження. Chrome emulation — web evidence, не real Swift/RN pass.

## 8. Передати результат у Smartico й звірити delivery

Перед delivery готовий пакет має містити:

```text
configuration.json          # Схема BO-полів
body.html                   # Actual Smartico template source
creative-values.<locale>.json # Локальні value presets, не API import
assets-manifest.json        # Source/delivery URLs, bytes, version/hash
design-mapping.md           # Node → field → slot → action
qa-report.md                # Compiler, fidelity, Web/App scope
```

Відтворювану generator/export структуру можна обрати іншу, але final Body має бути один для compatible variants. За наявної авторизації зберегти Configuration/Body у погодженому template, створити або оновити resource values кожного state/locale, прив'язати exact resources у відповідні Journey activities. Сам runbook не дає нового дозволу змінювати live BO.

Після save/reopen/download порівняти exported Body і saved Body/hash. Перевірити, що Journey посилається саме на потрібні template/creative IDs. Далі BO Preview, real Web Send Preview, реальний Swift/RN wrapper; класифікувати results окремо. Actions перевіряються за погодженим тестовим сценарієм із reports/connector/grant/navigation, а не тільки наявністю красивої модалки.

**Готовність:** artwork і copy збігаються з approved Figma, всі заявлені states/locales/адаптиви відпрацьовані, actual compiler успішний, data/action contract підтверджений, final template справді збережений у Smartico, доставка має явні Web/App докази або конкретний remaining test. Сторінка локального preview сама по собі не закриває задачу.
