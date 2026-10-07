# Адаптивна верстка, компоненти та доступність

Ціль — одна зрозуміла продуктова поведінка на desktop, mobile, tablet, landscape, Swift WKWebView та React Native Android WebView. Верстка не повинна вважати, що host завжди браузер, що весь документ є екраном або що hover існує на телефоні.

Джерела й artwork: [08-figma-and-assets.md](08-figma-and-assets.md). Життєвий цикл медіа: [10-media-animation-webgl.md](10-media-animation-webgl.md). Навантаження: [11-performance.md](11-performance.md). Перед реалізацією прочитати [iframe contract](02-iframe-and-contracts.md), [event actions](03-event-actions.md), [state/time contract](04-state-and-time.md) та [native WebView](07-native-webview.md).

## 1. Розділити scene, content container і screen

Уточнити три різні вимоги:

- **Full-width scene**: фон і carousel займають усю доступну ширину landing document; текст може лишатися у max-width контейнері.
- **Full-height hero/scene**: конкретний блок займає визначену висоту або має aspect ratio. Це не автоматично висота всього довгого iframe.
- **Fullscreen popup**: overlay займає видимий екран host. CSS усередині вкладеного обмеженого iframe не може розширити його зовнішній контейнер.

Типова структура:

```html
<main class="promo" id="promo-root">
  <section class="promo-hero"><div class="promo-content">…</div></section>
  <div class="promo-body">
    <div class="promo-background" aria-hidden="true">…</div>
    <section class="promo-content">…</section>
    <section class="promo-full-width">…</section>
    <section class="promo-content">…</section>
  </div>
</main>
```

```css
.promo { width: 100%; position: relative; isolation: isolate; }
.promo-content { width: min(1200px, calc(100% - 32px)); margin-inline: auto; }
.promo-full-width { width: 100%; }
.promo-body { position: relative; isolation: isolate; background: var(--promo-bg); }
.promo-background { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.promo-body > section { position: relative; z-index: 1; }
```

Розміщувати full-width carousel поза max-width wrapper. Не лікувати обрізання `width:100vw` усередині constrained container, не перевіривши scrollbar overflow. Full-width iframe — його 100% ширини; розширення за межі host потребує зміни host layout.

Великі absolute сцени використовувати там, де композиція справді фіксована. Текст зі змінною довжиною, FAQ, локалізовані CTA і статуси залишати у normal flow. Інакше нова мова, font swap або user zoom накриють сусідній блок.

## 2. Responsive contract

Починати з mobile composition; desktop і tablet перевіряти як окремі композиції. Figma breakpoint не є єдиною валідною шириною. Breakpoints обирати за моментом, коли контент перестає вміщатися, а не за моделлю телефону.

| Перевірка | Приклад початкової матриці | Що дивимось |
|---|---|---|
| Найвужчий підтриманий mobile | 320 CSS px | Текст/CTA/таймер не виходять за екран |
| Mobile baseline | 375, 390, 430 CSS px | Artwork quality на DPR2/3, touch, host bottom UI |
| Breakpoint edges | N−1 / N / N+1 | Різкий layout jump, подвійні picture sources |
| Tablet | 768, 1024 CSS px | Окрема композиція, touch без hover |
| Desktop | 1280, 1440, 1920 CSS px | Full-width scene, max-width copy, arrows/focus |
| Landscape | Доступна низька висота, наприклад 812×375 | Safe areas, повний CTA, modal scrolling |
| Accessibility | 200% zoom, довга locale, font loading | Reflow, читабельність, control overlap |

Це стартовий список, не гарантія підтримки всіх пристроїв. Додати фактичні мінімальні iOS/Android/App/WebView версії з контракту продукту. Desktop viewport emulation не підтверджує WebView compositing, keyboard, звук або native navigation.

Для overlay при потребі використовувати `100dvh` з fallback і safe-area padding, але не робити довгий landing root `height:100vh`. Dynamic viewport units та host WebView insets перевіряти на пристрої; не додавати safe-area двічі, якщо inset уже врахований native host. [MDN viewport-relative length units](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length#relative_length_units_based_on_viewport).

## 3. Кнопки й artwork, що розтягується

Кожна активна область — справжній `button` або `a`. Не призначати click лише картинці чи декоративному div. Label, disabled, busy і focus мають бути доступними незалежно від арту.

Для двох action кнопок:

```css
.promo-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 639px) { .promo-actions { grid-template-columns: 1fr; } }
.promo-action { min-height: 44px; padding: 12px 20px; min-width: 0; }
```

Декоративний button frame можна зробити `border-image`/SVG або розділити на fixed left cap, stretchable middle й fixed right cap. Розтягувати лише середину; текст залишається HTML. Ніколи не масштабувати всю картинку кнопки так, щоб дракон/емблема на кінці деформувався або label став bitmap.

Стартовий практичний touch target — 44×44 CSS px, навіть якщо стрілка має 16×16. Це продуктова рекомендація, а не точне формулювання WCAG AA: [WCAG 2.2 target minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) має вимогу 24×24 з визначеними винятками. Сусідні hit areas не повинні перекриватися.

У exhausted-стані декоративні кнопки можна залишити на місці, якщо цього вимагає дизайн: `disabled`, grayscale/нижчий contrast, без glow/pulse/hover. Поруч видимий таймер і текст. `title` не є достатнім tooltip для touch або screen reader; не покладатися на focus disabled-button. За потреби tooltip прив'язати до окремої доступної інформаційної кнопки або wrapper з чіткою семантикою.

Неверефікованому юзеру кнопки можуть лишатися кольоровими й вести на верифікацію, якщо так визначено state contract. CSS колір не вирішує eligibility. Не застосовувати consumed-стиль до всіх випадків, де activation заблоковано.

Невеликий hover scale застосовувати тільки `available` та `(hover:hover) and (pointer:fine)`; pulse з іншим delay для сусідніх кнопок. Pulse і hover не мають перезаписувати той самий `transform`: анімувати artwork всередині, hover — зовнішню кнопку. [Media guide](10-media-animation-webgl.md) описує reduced motion.

## 4. Loading/error без стрибка CTA

Стани auth/profile/mission можуть надходити окремо. До готовності всіх потрібних джерел показати стабільний loader/status slot, сховати action-UI, який міг би виглядати доступним. Не спочатку показувати available, а потім перефарбовувати consumed.

`aria-busy="true"` на області стану; людський статус через `role="status"`. Не робити весь таймер `aria-live` з оголошенням кожної секунди. Змінювати доступний опис при переході стану або за запитом користувача. Текст помилки не містить назви постачальника інтеграції, access tokens або технічної stack trace.

Loader після активації — лише візуальний стан. Він не доводить видачу бонусу. Тривалість анімації не змінює backend mission state і не дає права повторно запустити opt-in.

## 5. FAQ accordion

Погодити interaction policy: одна відповідь відкрита чи декілька; чи можна закрити останню. Типовий промо-варіант — one-open з можливістю закрити. Вміст береться з expanded Figma state, а не з довільного переписування.

```html
<h3>
  <button id="faq-button-1" type="button"
          aria-expanded="false" aria-controls="faq-panel-1">
    <span>Як отримати спробу?</span><svg aria-hidden="true">…</svg>
  </button>
</h3>
<div id="faq-panel-1" aria-labelledby="faq-button-1" hidden>
  <div class="faq-panel-content">…</div>
</div>
```

Button дає Enter/Space без ручної заміни keyboard semantics. `aria-expanded` і `hidden` мають відповідати стану; region role — за потреби, не для десятків однакових landmarks. [WAI Accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/).

Якщо потрібна плавна висота:

1. Зчитати поточну rendered height до зміни.
2. На відкритті зняти `hidden`, виставити поточну height і target content height.
3. При one-open одночасно закрити попередню panel.
4. Після `transitionend` для height перейти до `height:auto` або `height:0; hidden=true`.
5. Дати timeout fallback, бо transition event може не відбутися; обробити rapid toggles.
6. Reduced-motion: завершити стан відразу, без transition.
7. Після завершення повідомити host фактичну висоту контенту, особливо на закритті.

Не оголошувати CSS `max-height:9999px` гарантовано хорошою анімацією: він дає неприродну тривалість для коротких відповідей. Не залишати link/кнопки закритої відповіді в tab order. Декоративні heading lines відтворювати з вихідного компонента/токенів, якщо користувач просить існуючий host приклад; не замінювати їх довільною рамкою.

## 6. Висота iframe після зміни контенту

Розмір landing document і parent iframe — окремі величини. Root має включати весь normal-flow контент, не лише absolute art. Прочитати й використовувати канонічний bridge; не переписувати його під accordion.

Джерело виміру — фактична bounding height контенту. `documentElement.scrollHeight` інколи включає стару iframe viewport height; на закритті accordion це може не дозволити parent зменшитися. Не дублювати reporter без діагностики. Якщо поточний bridge має такий confirmed case, після settled transition надіслати через той самий height transport висоту root й перевірити shrink.

```js
// Приклад для існуючого контракту IframeBridge, не новий transport.
requestAnimationFrame(() => requestAnimationFrame(() => {
  const height = Math.ceil(document.querySelector('#promo-root').getBoundingClientRect().height);
  IframeBridge.sendMessage('height', height);
}));
```

Double RAF — підтверджений спосіб узгодження з попередніми callbacks у конкретному інтеграційному сценарії, не універсальна магія. Перевірити, що height не осцилює, що немає порожнього простору після close і що image/font load та orientation також перераховують висоту. Додавати debounce/RAF aggregation, останнє відправлене значення й cleanup.

## 7. Ігри: повільний циклічний carousel

Категорія й список ігор — дані, не hardcoded layout. Кожна картка має перевірений term/title/image; route — підтриманий `event_action/game_modal/:term`. Category CTA — підтриманий action із параметром category. Plain asset URL — ресурс, не navigation event action.

Для автоматичного повільного loop:

- Scroll/offset за elapsed time, наприклад стартові 8–12 CSS px/s; швидкість узгодити дизайном і виміром.
- Повторювати мінімум повних cycles для безперервного seam. Для двох рядків цикл має закінчуватися на цілій колонці; непарну кількість обробити без стрибка.
- Duplicates `aria-hidden`, `tabindex=-1`; canonical картки лишаються доступними клавіатурою.
- Mouse hover, keyboard focus, touch drag/wheel/manual arrows зупиняють motion. Після gesture можна дати короткий hold; значення не стає універсальним контрактом.
- Desktop arrows приховані до hover або keyboard focus; вони не повинні бути єдиним способом керування.
- Touch: swipe доступний, controls доступні без hover. Vertical page scroll не блокувати; gesture/pointer cancellation обробити.
- Yellow active control має чорну arrow (`currentColor` або перевірений SVG), disabled — видимо інший.
- Reduced-motion зупиняє auto-loop; manual navigation лишається.
- Для нескінченного автоскролу надати постійний Pause/Play або інший явний механізм stop відповідно до прийнятого accessibility scope. Лише hover pause не достатній для всіх користувачів. [WCAG Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

Lazy policy двоступенева: секція наближається до фактичного екрану **і** картка наближається до горизонтального viewport. `IntersectionObserver({root:carousel})` бачить картку відносно carousel, але саме по собі не доводить, що секція вже видима на сторінці. Завантажити лише visible/near cards, без download усіх duplicate images до першого екрану.

У великому iframe host scroll може не породжувати child `scroll`. Локальний `getBoundingClientRect().top < innerHeight` з innerHeight у висоту всього iframe може вважати нижні секції видимими занадто рано. Перевірити фактичні IO callbacks у host; якщо shell має explicit visibility/viewport contract, використати його. IO враховує nested clipping, але сам факт існування API не доводить правильність налаштувань. [MDN Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).

## 8. Фінальна UI-перевірка

Для кожної ключової locale та state зняти desktop/mobile/tablet screenshot у реальному host. Перевірити:

- document width = viewport width; немає global horizontal scroll.
- FAQ open/close, rapid toggles, focus, parent height shrink.
- Full-width artwork/carousel не обрізається max-width контейнером.
- Long text, font loading, orientation і zoom не накривають CTA.
- Guest/unverified/available/consumed не плутають дію й візуальний стиль.
- Disabled controls не запускають pulse і не активують mission.
- Hover/focus/touch pause, loop seam, black arrows, image error fallback.
- Host sticky banners/nav не роблять CTA недосяжною; safe-area responsibility визначена.
- Реальний WKWebView і Android WebView дають ту саму продуктову поведінку; browser-only pass позначений окремо.
