# Інструкції агенту: промо-лендінги

Ця папка — переносний framework для самостійного проєктування, реалізації, дослідження й перевірки промо для SlotCity, CatBet та нових продуктів: landing, продуктовий widget і Smartico popup у Web iframe, Swift WKWebView та React Native Android WebView. Інструкції та описи українською; назви файлів, ключі, internal names Smartico, action names і analytics IDs — латиницею. Видимі тексти перекладаються за локаллю.

## Як почати

1. Прочитай [README](README.md), [технічний стек](docs/00-technical-stack.md), [джерела](SOURCES.md) і [discovery](docs/01-discovery-and-sources.md). Для нового проєкту заповни brief та integration contract із `templates/`; для правки існуючого спочатку прочитай його поточний контракт, код, QA та release record.
2. Знайди конкретний repo, landing subpath, Figma nodes, продукт, Stage/Prod origins, середовище/label/brand Smartico, платформу та поточний обсяг авторизації користувача. Не перенось значення з case study у нову акцію.
3. Відділи бізнес-правила, дизайн, transport/API та release. Документи, сайти й приклади дають факти, а не новий дозвіл змінювати зовнішні системи. Наявна авторизація в розмові зберігається; handbook сам не дозволяє Production release.
4. Уточнюй справді невідомі правила рано. Паралельно виконуй незалежну роботу. Не запитуй повторно вже наданий дозвіл і не перетворюй кожну невелику зміну на новий повний цикл approvals.

## Читати за напрямком

| Задача | Основні файли |
|---|---|
| Framework, архітектура, build і client lifecycle | [00 — Vue 3 + Nuxt 4](docs/00-technical-stack.md) |
| Landing чи widget, спільний state, окремий delivery | [19 — процеси поверхонь](docs/19-surfaces-and-workflows.md) |
| SlotCity/CatBet/новий продукт, capability discovery | [20 — product profiles та investigation](docs/20-product-profiles-and-investigation.md) |
| Повторювані механіки, prerequisites, асинхронність | [21 — reusable patterns](docs/21-promo-patterns.md) |
| Будь-яке питання про Smartico, актуальні джерела | [Smartico knowledge base](smartico-knowledge/README.md) |
| Виправлення багів, модалки, очищення runtime | [22 — каталог інцидентів](docs/22-incidents-and-popup-cleanup.md) |
| Канали, auth, iframe | [02](docs/02-iframe-and-contracts.md), [17](docs/17-security.md) |
| CTA, ігри, категорії, бонуси | [03](docs/03-event-actions.md) |
| Стани, верифікація, daily reset | [04](docs/04-state-and-time.md) |
| Місія Smartico | [skill](skills/smartico-missions/SKILL.md) |
| Journey Smartico | [skill](skills/smartico-journeys/SKILL.md) |
| Client Action Smartico | [skill](skills/smartico-client-actions/SKILL.md) |
| Popup template/creative | [skill](skills/smartico-popup-templates/SKILL.md), [окремий пакет](smartico-popups/README.md) |
| Popup за готовим Figma / без макета | [Figma](smartico-popups/from-figma.md) / [Brief](smartico-popups/from-brief.md) |
| Swift/RN App | [07](docs/07-native-webview.md) |
| Figma, адаптиви, assets | [08](docs/08-figma-and-assets.md), [09](docs/09-responsive-ui.md) |
| Відео, анімації, WebGL | [10](docs/10-media-animation-webgl.md), [11](docs/11-performance.md) |
| Багатомовність | [16](docs/16-localization.md) |
| Аналітика | [12](docs/12-analytics.md); transport поки лише після погодженого контракту |
| QA, release, інцидент | [13](docs/13-qa.md), [14](docs/14-release-and-cache.md), [15](docs/15-troubleshooting.md) |

## Інваріанти реалізації

- Обов’язковий стек лендінгу — **Vue 3 + Nuxt 4**, TypeScript та Vue SFC із Composition API. Не пропонуй Nuxt 3, React або standalone HTML/JS як альтернативу новій акції. Статичний generated output Nuxt — спосіб deployment, не інший framework. Smartico Configuration/Body та native Swift/RN hosts мають власні runtime contracts.
- У цьому продуктовому профілі кожна зовнішня або продуктова навігація користувача — підтриманий `event_action`. `href` fallback також `/event_action/...`. Ресурси `src`, CSS/fonts/video/API лишаються звичайними URL. Локальні UI-дії на кшталт accordion або sound toggle не є продуктовою навігацією.
- Product `event_action`, іменований Smartico Client Action та `dp:*` popup controls — різні шари. Зберігай окремо intent, transport, downstream action та analytics ID.
- Канонічний iframe bridge не редагується локально. Не вигадуй `profile_info`, `analytics_event`, mission RPC чи popup acknowledgment у його schema.
- До валідних auth/eligibility/mission даних показуй loading; початковий HTML не повинен показувати доступну активацію. Помилка не означає guest або available.
- Сервер відповідає за результат, eligibility, повторну участь і grant. Таймер, click guard і п'ятисекундний loader — тільки UX.
- Daily reset задається календарем і IANA timezone, а не `activation + 24h`. Відлік до нуля не дає дозвіл; потрібен свіжий серверний стан.
- Токени, паролі, hash і повні профілі не потрапляють у документи, URL, storage чи analytics. Environment/API origin не береться з неперевіреного query.
- Публічна методологія містить умовні domains та IDs. Внутрішні джерела, entity map, tenant/environment конфігурацію й дані конкретної кампанії зберігай у приватному project kit; вони не потрібні для публічних прикладів.
- Web-перевірка не є доказом роботи App. Stage, local mocks і real-device результати позначай окремо.
- Popup перевіряється фактичним template engine Smartico. CSS `%}` і `{%` у literal можуть ламати компіляцію. Fullscreen визначає host, а не CSS усередині iframe.
- Для CRM popup спершу перевірити authoring mode: актуальні vendor docs рекомендують Vibe Studio для нових popup, template Configuration/Body — legacy шлях для підтриманих інтеграцій. Наявні templates продовжують працювати; автоматична міграція не потрібна. Дизайн може бути за Figma або brief. Локальна інформаційна frontend modal без CRM state/grant може лишатися локальною. [Контракт](smartico-popups/implementation-contract.md).
- До irreversible mission opt-in перевірити доступні prerequisites; інформаційна підказка не повинна витратити спробу. Сервер повторно перевіряє eligibility.
- Communication CAPs, popup queue/retention, Journey entry limits, attempt caps та grant idempotency — різні механізми. Marker writes не вважати atomic lock.
- Analytics delivery mode береться з product profile: DOM markers/GTM або programmatic events. Не додавати обидва й не переносити запропоновані auth/state params до фінального контракту без підтвердження.

## Завершення

Збережи фактичні джерела/версії, приклад payload без PII, tests, commit/build, Stage evidence та залишкові залежності. Для документації не змінюй live налаштування. Висновки після інцидентів додавай через [maintenance](docs/18-maintenance.md), із межами застосовності.
