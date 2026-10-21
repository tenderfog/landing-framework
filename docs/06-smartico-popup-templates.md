# Smartico popup: reusable template та creatives

CRM popup створюється **в Smartico**, не як окрема модалка landing, яка симулює Journey. Станом на перевірку 21.10.2026 [офіційний guide](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/pop-up) рекомендує **Vibe Studio** для нових popup і позначає templates як legacy; наявні шаблонні popup продовжують працювати. Спочатку перевірити доступний mode в потрібному label. Нижче — докладний runbook **legacy Configuration/Body**, потрібний для підтримки, очищення й виправлення template-based інтеграцій. Це не універсальний default нового vendor authoring.

Для legacy результат для BO — Configuration JSON, Body HTML/CSS і params/asset values. JS додається лише за потреби та перевіреною підтримкою runtime. Для Vibe Studio зберігається actual popup design/resource і точні link→Flow exits; не переносити його branches механічно на старі `dp:ok/cancel` connectors. [Актуальна KB та джерела](../smartico-knowledge/README.md). Звичайна локальна інформаційна modal, яка не керує CRM engagement/grant, може лишатися у frontend — [розділення поверхонь](19-surfaces-and-workflows.md).

Історія багів, reconfiguration й безпечне видалення зайвого коду: [incident catalog](22-incidents-and-popup-cleanup.md). Перевіряємо actual published Body + Configuration defaults + creative overrides, а не лише локальний файл.

Спочатку встановити [action/branch contract](05b-smartico-journey-runbook.md). Рендерер не визначає виграш і не видає бонус. Native renderer доставляє той самий creative через [wrapper handshake](07-native-webview.md).

Окремі дизайн-процеси: [реалізація за готовою Figma](../smartico-popups/from-figma.md) і [самостійне проєктування з брифу](../smartico-popups/from-brief.md). Обидва використовують цей технічний runbook та [контракт передачі](../smartico-popups/implementation-contract.md). [Повний Configuration/Body/values приклад із actual compiler check](../smartico-popups/examples/README.md) доповнює фрагменти нижче.

## 1. Розділити template, asset і campaign

| Об'єкт | Містить | Не містить |
| --- | --- | --- |
| Template | Структуру, responsive CSS, поля configuration, безпечні defaults | Жорстко закодовану винагороду/eligibility |
| Popup asset / resource | Visual state, локалізований title/description, art URLs, texts/actions, flags | Окремий серверний generator виграшу |
| Journey | Entry, branch, exact clicks, grant/caps, expiry, next popup/navigation | Копію верстки для кожного outcome |

Один template можна використовувати для reward/loss/information/pending за сумісного anatomy. Параметризувати icon, heading, description, locale, 0/1/2 buttons, labels/actions, explicit close, background, animation. Інша структура може виправдано мати інший template; «один для всього» не є самоціллю.

У **Marketing → Templates → Popup** знайти сумісний існуючий template/офіційний example; у **Assets → Popup** створити потрібні resource variants. Назви розділів перевірити у поточному BO. Якщо задача — виправити чинний template, не створювати новий без потреби, бо Journey продовжить використовувати старий ID. [Smartico Popups](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/pop-up).

## 2. Configuration та Body

Configuration задає BO-поля, а шаблон читає params через `o`. `optional` керує видимістю; explicit checked=false відрізняється від відсутнього optional field. [Офіційний popup guide](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/pop-up) описує ці механізми.

Навчальний фрагмент конфігурації; не повний production template:

```json
[
  {
    "label": "Content",
    "options": [
      {
        "name": "title_block",
        "label": "Title",
        "fields": [{"name":"title","type":"text","label":"Text","value":""}]
      },
      {
        "name": "primary_button",
        "label": "Primary button",
        "optional": true,
        "optional_default": true,
        "fields": [
          {"name":"primary_text","type":"text","label":"Text","value":""},
          {"name":"primary_action","type":"url","label":"Smartico action","value":"dp:ok"}
        ]
      }
    ]
  }
]
```

```html
<!-- ПРИКЛАД: Configuration має визначати використані поля. -->
<style>
  .promo-popup { width: 100%; max-width: 40rem; }
  .promo-popup__actions { display: grid; gap: 12px; }
  @media (min-width: 640px) {
    .promo-popup__actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
</style>
<section class="promo-popup" role="dialog" aria-labelledby="promo-title">
  <h2 id="promo-title">{%=o.title%}</h2>
  {% if (o.primary_button && o.primary_button.checked) { %}
    <div class="promo-popup__actions">
      <a href="{%=o.primary_action%}" data-ao-hide-popup="true">
        {%=o.primary_text%}
      </a>
    </div>
  {% } %}
</section>
```

У прикладі одна кнопка; production grid потрібно налаштувати за фактичною кількістю buttons, щоб одна не займала піврядка. Текст і href використовують escaped interpolation `{%=...%}`. Raw interpolation `{%#...%}` не застосовувати до неперевіреного контенту. CSS numbers/colors/URLs потребують власних допустимих значень, HTML escaping не робить довільний CSS безпечним.

## 3. Обов'язково тестувати actual template compiler

Smartico використовує Blueimp engine; [Smartico fork](https://github.com/smarticoai/JavaScript-Templates) — primary reference. HTML preview після ручної підстановки даних не тестує цей engine.

У досвіді проєкту App-розробник повідомив про порожній creative root після успішного handshake та `tmpl()` SyntaxError. Окремий контрольований regression відтворив небезпеку literal minified CSS `height:100%}` із delimiter `%}`: compilation через `new Function` падала **до** `innerHTML`. Exact failing delivered template не отримано, тому цей тест доводить механізм помилки, а не незалежно встановлену причину конкретної доставки. Це regression для даного engine, не специфічна помилка Swift.

```html
<!-- НЕБЕЗПЕЧНИЙ literal для {% %} engine -->
<style>.art{height:100%}</style>

<!-- Delimiter-safe CSS -->
<style>.art { height: 100%; }</style>
```

Після остаточної мініфікації/експорту перевірити:

1. Compilation самим runtime engine або його перевіреною identical версією.
2. Browser entry path `tmpl('_template', params)` через actual template element, не тільки `tmpl(body, params)`.
3. Кожен visual state, minimal params, missing optional fields, 0/1/2 buttons, long text, custom icon/action й усі supported locales.
4. В literal CSS/HTML/JS немає випадкових `{%`/`%}`. Не робити глобальну replace, яка руйнує справжні template blocks.
5. Якщо Body потрапляє у `<script type="text/x-tmpl">`, буквальний closing `</script>` не має достроково завершити його raw-text element. Для custom JS застосувати перевірений serializer/template-safe assembly та перевірити кінцевий source.
6. Видимий root не порожній, titles/actions exact, assets loaded, немає runtime errors.

Завантажити saved Body із BO після publish й порівняти з локальним експортом, включно з hash/byte size. Якщо старий wrapper/engine відрізняється, відтворити саме його версію; local npm pass не перекреслює real-device failure.

## 4. Зовнішні assets замість base64

Статичні WebP/AVIF/PNG/SVG і WOFF2 віддавати перевіреними HTTPS URL через params/defaults. Не вшивати великі base64 картинки/шрифти у Body: вони збільшують template compilation input, не кешуються окремо та дублюються в creatives.

```json
{
  "locale": "uk",
  "visual_state": "reward",
  "title": "Твоя винагорода готова",
  "description": "Обери наступну дію",
  "icon_url": "https://cdn.example/promos/shared/reward.a1b2.webp",
  "font_url": "https://cdn.example/fonts/brand-cyrillic.c3d4.woff2",
  "primary_button": {"checked":true},
  "primary_text": "Забрати",
  "primary_action": "dp:ok"
}
```

Це приклад params shape, який має збігатися з вашим Configuration, не універсальні Smartico reserved fields.

Перевірити content types, allowlisted resource origins/CSP, font CORS, cached/uncached loading і URL stability протягом активної кампанії. Resource request — звичайний asset URL; правило `event_action` стосується **навігації**, не `img src`, font чи video.

Ресурси за hashed URL отримують довгий immutable cache, змінний Configuration/Body — правильний update policy. Не ламати старі campaigns видаленням shared asset. Розмір Body, external bytes, gzip та network load вимірювати окремо; gzip локального файлу не доказ transfer size SDK.

## 5. Дії та duplicate guard

Офіційний action hook для HTML buttons — `href` + `data-ao-hide-popup="true"`; Smartico обробляє click/close. Не виконувати той самий deep link додатковим `_smartico.dp()` listener. Preserve `dp:ok`, `dp:cancel`, `dp:action` і exact custom controls, які очікує Journey.

Локальний guard, якщо потрібний, пропускає **перший** click до Smartico незмінним і блокує наступні mixed/double clicks. Він не видає бонус і не підміняє socket report. Native Back/backdrop/Escape policy належить outer host; DOM listener не гарантує її. Close-and-claim працює тільки через explicit agreed action, не пасивне teardown.

У navigational CTA використовувати `dp:go&url=<product>/event_action/...` і підтриманий route registry. Native `bcid:4`/Journey `cid:105` мають пройти [спільний router](../examples/native-smartico-routing.md).

## 6. Адаптивна верстка й fullscreen

Живий текст, `minmax(0,1fr)`, перевірена максимальна ширина, safe areas, scrollable overflow для довгого контенту. Desktop 2 columns/mobile stack — contract конкретного дизайн-компонента; breakpoint обрати за доступною шириною, не лише за UA.

Для decorative buttons використовувати CSS skin або 3-/9-slice: fixed proportional end caps, stretchable middle, окремий ornament, живий текст. Не розтягувати bitmap із текстом/декором на будь-яку ширину. Single button — centered, no buttons — actions container absent. Long labels мають збільшувати висоту.

Fullscreen має три шари: SDK/native outer view → centering wrapper → creative. Якщо outer iframe/WKWebView обмежений, `100vw`, `position:fixed` та `z-index` child не вийдуть за нього. Outer host повинен віддати full viewport.

Відомі frame style params чи root override застосувати тільки після огляду **вашого** wrapper. У проєкті shrink-wrap/zoom внутрішнього `#__root_centered` виправляв scoped CSS; це не універсальний public API. Не глобально змінювати Smartico DOM і не покладатися лише на `:has()` без support matrix. `fitscale` може зменшувати текст/кнопки; для responsive fullscreen уникати подвійного scaling.

Складні WebGL ефекти не копіювати з landing у кожен popup автоматично. Коротка entrance `transform/opacity` часто достатня. Reduced motion, низька висота, tablet split view, portrait/landscape й long translations перевіряються за [QA](13-qa.md) і [localization](16-localization.md).

## 7. Доставка в BO й перевірка

- Save Configuration + Body у **той самий** approved template; re-open/download.
- Зберегти resource values кожного state й locale; public copy exact з approved design.
- BO Preview → реальна web Send Preview → actual Swift/RN wrapper; результати записувати окремо.
- Показати контент/root, images/fonts, 0/1/2 buttons, actual viewport, close semantics.
- Пройти action report → exact connector → confirmed grant/failure → route, а не лише screenshot.
- У release inventory записати template/asset IDs, version/hash, external origins, current runtime, unresolved support.

Не виводити гравцю назви Smartico, SDK, IDs, QA instructions або технічний timeout text. Службовий description у BO й player description — різні поля.
