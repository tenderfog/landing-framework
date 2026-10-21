# Smartico popup з брифу без готового макета

Цей процес потрібний, коли є механіка, бренд і контент, але немає погодженого Figma-компонента. Його результат — конкретна visual spec і responsive proposal. Технічні deliverables та acceptance визначає [спільний контракт](implementation-contract.md); [Vibe/legacy mode](../smartico-knowledge/04-popups-and-routing.md) обирається до реалізації. Configuration/Body — output лише підтвердженого legacy шляху.

## 1. Заповнити brief із наявних джерел

Взяти business rules, copy/actions і бренд із campaign spec, Smartico blueprint та approved brand kit. Не вигадувати нову механіку для зручного дизайну. [Popup brief](templates/popup-brief.md) уже містить state/action/entity/host поля — заповнювати його, а не підтримувати другу таблицю в окремому документі.

Критичні невідомі: призначення popup, source outcome, grant/close semantics, legal qualifiers, exact destinations, outer host і locale. Уточнювати їх рано; brand inventory, anatomy й asset/viewport plan можна виконувати паралельно. Поточний authorized scope не потребує нових approvals на кожну CSS-правку.

## 2. Встановити hierarchy та зміст станів

Спочатку визначити головне питання користувача й наступну дію: інформація, результат, choice, confirmation чи navigation. Для кожного погодженого state записати title/description/qualifier, icon/decor, priority CTA та close behavior у brief. Не додавати win/loss або guest states до flow, де їх немає.

На короткому екрані має бути зрозуміло:

- що сталося або що пропонується;
- яка умова/обмеження впливає на рішення;
- що зробить головна й другорядна дія;
- як завершити взаємодію.

X-as-claim є бізнес-рішенням, яке впливає на action matrix, не просто іншим icon. [Journey runbook](../docs/05b-smartico-journey-runbook.md) визначає exact connector; frontend не створює outcome чи bonus grant.

## 3. Запропонувати візуальний напрям

Почати з existing brand components і сумісного Smartico design/template. Не створювати нову design system заради одного popup. Зазвичай достатньо одного рекомендованого напряму; альтернативу додати, якщо є реальний trade-off.

| Напрям | Доречний для | Вартість реалізації |
|---|---|---|
| Стримана card з живим текстом | Умови, confirmation, довгі локалі | CSS + маленька іконка |
| Fullscreen scene | Важливий результат/брендовий artwork | Scene layer і перевірений outer host |
| Art + decorative stretchable buttons | Виразний campaign style | Sliced skin + live labels, додатковий layout QA |

Показати desktop і вузький mobile варіант із реальним найдовшим текстом. Пояснити reading order, focus, CTA priority, close, responsive constraints і motion budget через конкретний preview. Local prototype допомагає оцінити дизайн; не підміняє delivered CRM resource.

Якщо нового art немає, використати погоджений brand asset або достатній CSS/SVG shape. Нову ілюстрацію/генерацію обґрунтувати потребою та правами на source; не приховувати прогалину чужим artwork. Реєстр — [assets](../templates/asset-register.md).

## 4. Записати відтворювану visual spec

Типова anatomy, яку можна спростити за призначенням:

```text
Overlay / background
  Content region
    Explicit close, якщо передбачений
    Icon / illustration
    Heading
    Description / qualifier
    Actions: 0 / 1 / 2
```

Зафіксувати palette, type sizes/weights/line heights, content width, spacing scale, button min-height, safe-area inset, decor placement, overflow й transition rules. Числа походять із бренду та композиції; приклад `content width min(100% - 32px, 560px)`, spacing `8/12/16/24px`, action min-height `44px` — лише starting proposal для preview, не загальні tokens.

Окремі рішення дизайнера:

| Випадок | Що визначити |
|---|---|
| 0 actions | Погоджений спосіб виходу; відсутній порожній footer |
| 1 action | Centered/full-width без пустого другого column |
| 2 actions | Priority, order, desktop/mobile layout без зміни semantics |
| Long locale / text scaling | Wrapping/height growth, доступний scroll і controls |
| Decorative skin | Caps/middle/ornament окремо від live label |
| Accessibility | Contrast/focus, heading relationship, accessible X і alt policy |
| Motion | Короткий ефект, static/reduced-motion variant, без блокування controls |

Focus trapping/restore, Escape й native Back задаються outer host contract; `role="dialog"` їх не реалізує. Responsive/skin implementation — у [legacy runtime](../docs/06-smartico-popup-templates.md), загальні [a11y/layout](../docs/09-responsive-ui.md), [motion](../docs/10-media-animation-webgl.md) і [localization](../docs/16-localization.md) правила не дублюються тут.

## 5. Прийняти дизайн і передати в реалізацію

До коду перевірити narrow/intermediate/desktop, short landscape, tablet/split view, найдовшу locale, text scaling і native safe areas. Для inputs додати keyboard overlay. Fullscreen preview погоджується з actual outer bounds; великий child `z-index` не розширить iframe.

Вибір дизайну зафіксувати коротко: spec, desktop/mobile preview, state/copy/action matrix і пояснення суттєвих рішень. Нові structural fields обмежити тим, що справді редагуватиме marketer; не робити кожний CSS pixel параметром BO.

Після цього пройти [спільний implementation/acceptance contract](implementation-contract.md). Для legacy взяти **один [runnable Configuration/Body/values example](examples/README.md)**; окремі неповні JSON/HTML snippets у дизайн-процесі не підтримуються. Його `information` fixture ілюструє navigation без grant, але не задає механіку майбутнього промо.

Результат цього процесу — agreed visual direction і spec. Готовність production popup визначається saved resource, actual runtime/delivery/actions і потрібним Web/App evidence за контрактом.
