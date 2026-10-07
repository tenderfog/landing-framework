# Figma, контент і підготовка асетів

Цей документ визначає, як перетворити погоджений дизайн на відтворюваний пакет ресурсів для веблендингу та WebView. Структура розвиває [Asset Pipeline](https://github.com/onlineTeran/landing_doc/blob/main/framework/ASSET-PIPELINE.md) і [Design Process](https://github.com/onlineTeran/landing_doc/blob/main/framework/DESIGN-PROCESS.md). Правила джерел і прав на ресурси не замінюються новим способом експорту.

Результат цього напрямку — реєстр джерел, повна таблиця дизайн-станів, локалізований контент, незмінні masters та оптимізовані delivery-файли. Порядок верстки описано в [09-responsive-ui.md](09-responsive-ui.md), медіа — в [10-media-animation-webgl.md](10-media-animation-webgl.md), вимірювання — в [11-performance.md](11-performance.md). Для проєкту заповнити [asset register](../templates/asset-register.md) і [state matrix](../templates/state-matrix.md), дотримуючись [source policy](01-discovery-and-sources.md).

## 1. Що отримати до верстки

Не починати з одного загального скріншота. Знайти й записати точні Figma file key, page, frame/node ID, variant та версію або дату перегляду. Якщо користувач уже відкрив Figma, перевірити саме потрібний node, а не найближчий схожий frame. Node `123-456` у URL і `123:456` у API — форми того самого ідентифікатора; зберегти обидві за потреби.

| Джерело | Що витягуємо | Де фіксуємо |
|---|---|---|
| Desktop frame | Ширина сцени й контенту, типографіка, композиція, положення CTA | Design source register |
| Mobile frame | Інша композиція, переноси, порядок блоків, mobile crop | Design source register |
| Tablet/landscape frame, якщо є | Самостійний layout, а не лише менший desktop | Responsive matrix |
| Component variants | Hover/focus/disabled/loading, звук on/off, кількість CTA | State matrix |
| Expanded FAQ | Повний актуальний текст відповідей і лінки | Content dictionary |
| Reward/modal states | Точний title, description, CTA, закриття, artwork | Modal content matrix |
| Frame sequence | Кількість, порядок, тривалість, alpha, loop seam | Motion brief |
| Live host page | Колір фону, header/footer, sticky UI, можливості маршрутизації | Host integration record |

Окремо позначати `approved`, `draft`, `reference`, `superseded`. Скріншот допомагає візуальній перевірці, але не доводить актуальність copy або механіки. Продуктова специфікація визначає правила; Figma визначає погоджений вигляд і текст після звірки джерел.

Приклад запису, який можна перенести до проєкту:

```yaml
source_id: design-mission-mobile
file_key: "<FIGMA_FILE_KEY>"
node_id: "<NODE_ID>"
variant: authenticated_available
frame_css_px: [375, 812]
version: "<FIGMA_VERSION_OR_CAPTURE_DATE>"
role: composition_and_copy
status: approved
capture: evidence/design/mission-mobile.png
```

Плейсхолдери в прикладах навмисні: жодні campaign/mission/user IDs не стають універсальними значеннями.

## 2. Повна таблиця станів

З дизайну витягти всі наявні стани. Додати продуктову поведінку, яку дизайн не показує: завантаження статусу, guest, unverified, eligibility unknown/error, available, pending activation, consumed/cooldown, campaign not started/ended, API unavailable. Відсутній frame — відкрите питання, а не дозвіл показувати випадкову кнопку.

Для кожного стану записати:

- Що видно в hero, основній механіці й popup.
- Точний copy, колір, disabled/enabled, loader і доступність hover/pulse.
- Дію кожної CTA та хрестика: navigation event action чи керування Journey.
- Чи лишаються видимими неактивні декоративні кнопки; у consumed-стані дизайн може вимагати сірі кнопки на місці.
- Обґрунтований fallback, якщо статус ще не відомий. Кнопка доступної спроби не має мигнути перед отриманням стану.

Не об'єднувати `unverified` і `consumed` лише через те, що активація недоступна: перший стан може вести у верифікацію, другий — показувати календарний reset. Не переписувати фактичний source copy заради коротшого рядка без погодження.

## 3. Текст і багатомовність

Звичайні заголовки, опис, FAQ, таймери й CTA зберігати текстом. Не запікати їх у загальну картинку секції. Кожній фразі дати стабільний ключ; усі видимі повідомлення, `aria-label`, alt, tooltip, error та звук on/off також локалізувати.

```json
{
  "hero.try": "Випробувати удачу",
  "eligibility.verify": "Верифікуватись",
  "attempt.next": "Нова спроба через {time}",
  "video.soundOn": "Увімкнути звук",
  "video.soundOff": "Вимкнути звук",
  "faq.title": "Питання та відповіді"
}
```

Показати в матриці locale fallback, доступні мови, джерело locale, формат дат/чисел і timezone механіки. Locale не змінює timezone reset автоматично. Якщо дизайном передбачено український календарний reset, англійський інтерфейс теж має відображати цей reset. Повний контракт — у [16-localization.md](16-localization.md), стан/час — у [04-state-and-time.md](04-state-and-time.md).

Декоративний напис з матеріалом/об'ємним артом може лишатися raster/SVG, якщо його не можна відтворити шрифтом. Тоді потрібні:

1. Окремий artwork для кожної підтримуваної мови.
2. Семантичний заголовок або повний alt, без подвійного озвучення того самого тексту.
3. Source з достатньою деталізацією для фактичного display size і DPR.
4. Ліміт CSS-ширини, за яким напис не розтягується понад перевірену якість.

Наприклад, якщо `h2` містить окремий прихований текст, декоративному `img` задати `alt=""`. Якщо тексту немає, `img alt` має передавати зміст. Не робити екранні читачі залежними від OCR.

## 4. Що експортувати й у якому форматі

| Тип | Рішення | Перевірка |
|---|---|---|
| Стрілка, close, простий UI icon | Оригінальний SVG; можна inline для `currentColor` | Розмір, viewBox, focus/hit area, dark/yellow контраст |
| Звичайна типографіка | HTML + ліцензований шрифт | Glyphs, line-height, локалі, font swap |
| Декоративний 3D заголовок | Raster master → WebP/AVIF за тестом; SVG лише якщо це справжня векторна графіка | Фактична роздільність, alpha, source limitation |
| Персонаж/бонусний арт | Transparent master → оптимізований delivery | Alpha, краї на темному/світлому фоні, optical size |
| Photo/background | Responsive raster | Mobile crop, відсутність видимого стику |
| Button frame з артом | CSS/SVG або stretchable middle + fixed caps | Текст не деформується, кінці не тягнуться |
| Hero poster | Artwork із погодженого Figma стану | Desktop/mobile framing і той самий slot як відео |

SVG з embedded raster або тисячами зайвих paths не стає легким лише через розширення. Не перетворювати 3D artwork у псевдовектор і не вважати upscale відновленням деталей.

Якщо вихідний image fill у Figma має 800×280 px, export frame at 2× може просто масштабувати той самий bitmap. Перед експортом перевірити оригінальний fill/master. Для напису шириною 400 CSS px на DPR3 потрібні приблизно 1200 source px, якщо очікується повна деталізація. Якщо їх немає, попросити більший master або обмежити display size; зафіксувати обмеження.

Figma API повертає node JSON і render URL; render може бути `null`, а URL не є вічним CDN-договором. Masters після дозволеного експорту зберігати у проєкті, не посилатися production-кодом на тимчасові export URL. Параметри export і node version фіксувати в реєстрі. [Figma Files endpoints](https://developers.figma.com/docs/rest-api/file-endpoints/).

## 5. Responsive artwork: resolution та art direction

`srcset` обирає різну роздільність того самого artwork; `<picture>` дозволяє іншу композицію. Ці задачі розділяти. `sizes` має відповідати реальній CSS-ширині, інакше браузер обере зайвий великий файл або недостатньо чіткий. [MDN: responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images).

```html
<picture>
  <source media="(max-width: 639px)"
          srcset="./assets/title-mobile-640.webp 640w,
                  ./assets/title-mobile-1280.webp 1280w"
          sizes="calc(100vw - 32px)">
  <img src="./assets/title-desktop-1200.webp"
       srcset="./assets/title-desktop-1200.webp 1200w,
               ./assets/title-desktop-2400.webp 2400w"
       sizes="(min-width: 1232px) 1200px, calc(100vw - 32px)"
       width="1200" height="300" alt="<LOCALIZED_DECORATIVE_TITLE>">
</picture>
```

Це схема, а не готові розміри для кожної акції. Якщо mobile і desktop мають інше співвідношення сторін, зарезервувати правильний aspect ratio для кожного breakpoint, а не лишати desktop-height і порожню площу. Не ставити `loading="lazy"` на LCP artwork. Для інших картинок задавати dimensions і, за доречністю, `loading="lazy" decoding="async"`.

## 6. Реєстр асетів і відтворюване стискання

Для кожного production-файлу потрібні:

| Поле | Приклад |
|---|---|
| ID / slot | `art-hero-poster` / `hero.media.poster` |
| Source | Figma file/node/version або supplied master |
| Права / status | Approved export, owner, дозволені модифікації |
| Master path + hash | `source/hero-poster.png`, SHA256 |
| Delivery path + hash | `assets/hero-poster-1200.<hash>.webp` |
| Master → output | Dimensions, crop, alpha, codec/quality/encoder version |
| CSS size / source size | Для mobile/tablet/desktop окремо |
| Bytes | Original, compressed, transfer encoding якщо є |
| Loading policy | Critical eager, nearby lazy, interaction-only |
| QA | Screenshots реального slot, defect/limitation, reviewer |

Команди зберігати разом з encoder version і параметрами. Приклади запускати лише на існуючих masters та встановлених інструментах:

```sh
cwebp -q 86 -m 6 source/hero-poster.png -o assets/hero-poster.webp
cwebp -lossless -m 6 source/decorative-title.png -o assets/decorative-title.webp
```

Quality 86 не є гарантовано правильним для іншого арту. Порівняти щонайменше дві ваги в реальному slot; lossless може бути виправданий для тонких контурів напису. Після оптимізації перевірити dimensions, alpha, візуальний diff/контактний лист і bytes. Не перезаписувати untouched master. У production bundle не включати Figma exports, великі PNG, старі версії й contact sheets, які не використовує сторінка.

## 7. Постер і кадри для анімації

Не завжди poster = перший кадр відео. Якщо Figma має погоджений статичний hero, взяти його, а не випадкову позу з відео. Звірити обидві композиції, щоб при переході до motion не було непередбаченого стрибка.

Для послідовності кадрів записати FPS, frame count, duration, порядок, loop seam, alpha та реальний compressed sum. Оцінка decoded RGBA memory:

```text
width × height × 4 × frames
```

Наприклад, 60 кадрів 512×512 — приблизно 60 MiB лише пікселів, без накладних витрат декодера й texture copies. Малий ZIP не скасовує витрати пам'яті. Atlas зменшує кількість requests, але може перевищити texture/bitmap ліміти пристрою. Відео часто краще для складної анімації без alpha; static кадр + CSS — для простого float/pulse. Остаточний вибір після порівняння в [media guide](10-media-animation-webgl.md).

## 8. Приймання перед implementation

- Повні source references, versions і scope; потрібні desktop/mobile та відомі проміжні стани.
- Copy виписаний з актуального expanded FAQ і всіх modal variants, а не з collapsed overview.
- Для кожної CTA визначено дія/стан; artwork не приховує неточну механіку.
- Прозорість перевірена на реальному тлі; немає прямокутних країв.
- Немає вигаданих векторів, перегенерованих логотипів або непомітної заміни original artwork.
- Mobile high-DPR текст не розмитий; обмеження masters записані.
- Master/delivery зв'язок, параметри стиснення, bytes і filenames відтворюються.
- Локалізовані artwork і шрифтові glyphs готові для всіх заявлених мов.
- Renderer/video мають статичний asset fallback; відсутність WebGL не прибирає контент.

Успішна перевірка дизайну — screenshot comparison у конкретних viewport/state/locale. Фраза «збігається з Figma» без цих умов не є доказом.
