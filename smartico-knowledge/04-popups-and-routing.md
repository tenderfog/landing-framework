# 04. Popups, кнопки, черги та native delivery

## Спочатку визнач authoring mode

**Documented, перевірено 21.10.2026:** Smartico переводить створення нових popups у Vibe Studio, продовжуючи підтримувати вже створені template popups. [Popups](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/pop-up).

| Сценарій | Процес | Результат |
|---|---|---|
| Новий popup у tenant із поточним Vibe workflow | Draft → Vibe design → Save → preview → flow binding | Збережений Smartico asset та перевірені click exits |
| Правка існуючого legacy template | Configuration/Body/values у тому самому approved entity | Сумісна версія template та resources |
| Новий custom template за підтвердженим legacy contract | Figma/brief → actual compiler → BO save/readback | Configuration JSON, Body HTML/CSS, params |
| Tenant ще не має нового workflow | Перевір доступність із CRM owner | Підтриманий там authoring contract |

Це оновлює вибір інструменту; воно не змінює механіку й не мігрує опубліковані assets. Vibe не звільняє від перевірки audience, кнопок, delivery, native renderer та grant. Обов'язковий Nuxt/Vue стек **продуктових лендінгів** не потрібно механічно переносити на vendor popup engine. Детальні legacy workflows — [Smartico Popups](../smartico-popups/README.md).

## Не змішуй три шари дії

| Шар | Приклад | Хто має його обробити |
|---|---|---|
| Product navigation | `/event_action/cashier` | Продуктовий Web/App router |
| Named Client Action | `campaign_key_entry` | Поточний Smartico sender → event trigger |
| Popup engagement action | `dp:ok`, `dp:cancel`, exact custom action | Smartico engagement report → Journey connector |

`dp:go&url=https://promo.example/event_action/cashier` поєднує Smartico transport і product route, але не є окремою видачею бонусу. `dp:action&action=…` має documented named-event поведінку у web, тоді як native dummy popup controls можуть використовуватись тільки для просування engagement flow. Перевір owner/handler конкретного каналу. [Deep-links](https://help.smartico.ai/welcome/products/tools-and-guides/deep-links), [Client Actions runbook](../docs/05c-smartico-client-actions.md).

Для кожної кнопки фіксуй rendered URL, click tracking, matched branch і navigation effect. Якщо URL змінюється через content tags, exact match може бути непридатний; documented `Click link contains…` застосовують за потреби, із досить конкретною ознакою та негативними тестами. Не розширюй усі фінансові branches до будь-якого click. [FAQ CRM Automation](https://help.smartico.ai/welcome/products/tools-and-guides/faqs/faq-crm-automation).

## Legacy renderer: що з досвіду переноситься

Template задає anatomy/fields; resource задає values; variation обирає контент за локаллю/brand/умовами; Journey задає поведінку. Перевір active status і default fallback варіантів: збережена Draft variation не означає, що саме вона доставляється гравцю. [Content Variations](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/content-variations).

Actual compiler, runtime params, downloaded saved Body і real wrapper важливіші за mock HTML. Для legacy engine з `{% %}` literal CSS `%}` може бути delimiter collision; перевір після minification. Цей regression доводить механізм, а не автоматично причину будь-якого порожнього popup. [Template engine](https://github.com/smarticoai/JavaScript-Templates), [компіляційний приклад](../smartico-popups/examples/README.md).

Reusable template параметризує content, artwork, 0/1/2 buttons, locale і close semantics. Assets мають окремі URL/cache; складний background не виправдовує великі embedded base64. Fullscreen потребує відповідного outer host viewport: child CSS не розширює обмежений iframe/WebView. [Popup technical runbook](../docs/06-smartico-popup-templates.md).

## «Натиснув, але popup не з'явився»: кілька різних очікувань

| Шар | Що може затримати | Чим перевірити |
|---|---|---|
| Client | Click guard, readiness, stale state, неправильний sender | Intent/sent trace, console, state timestamps |
| Journey | Entry mode, segment, active instance, wait, duration | User journey history та точний node |
| Communication | User/global caps, login delay, between-popup delay | Delivery reason, settings snapshot |
| Delivery retention | Очікування онлайн-з'єднання до timeout | Server attempt time і expiry |
| Frontend queue | Інший відкритий popup | Engagement sequence, close/impression events |
| Product suspension | Каса/KYC/критичний flow | Suspend/resume owner, host route |
| Renderer | Handshake, compiler, missing assets/params | Delivered payload metadata, wrapper errors |

Офіційна popup queue послідовно показує frontend popups; `Delivery timeout` утримує повідомлення на сервері до з'єднання. Це різні механізми. Налаштування single-tab та URL exclusions також перевіряються окремо. [Popup queue та display controls](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/pop-up#pop-up-queue-system).

У поточній [SDK object reference](https://github.com/smarticoai/public-api/blob/81f2790f02424f01dadcbe979288f096cdc5d542/docs/SmarticoObject.md) suspend/resume може відновити пропущений popup. Отже, «через деякий час з'явилось кілька модалок» потребує перевірки queue та повторних entries; збільшення loader саме по собі не вирішує причину.

## Проєктуй recovery, а не blind retry

Для інтерактивної підказки можна розглядати Once during open journey та завершення на фактичному Impression/Failed із finite duration. У проєктному досвіді така конфігурація була збережена й перечитана; повний повторний сценарій каси залишився без незалежного end-to-end доказу. Це **кандидатний pattern**, не готова універсальна гарантія.

Impression — SDK/engagement report про показ, який окремо не доводить видимий непорожній контент або закриття. Якщо flow закрито на Impression, наступний entry може пройти, поки перша модалка ще на екрані. Для строгої вимоги «максимум одна відкрита/очікувана» потрібні підтримані lifecycle signals або серверна coordination policy. Не вигадуй acknowledgment у canonical bridge.

Global delays/caps стосуються інших комунікацій також. Зафіксуй причину затримки й застосуй найвужчу дозволену зміну конкретного activity/flow. Відоме `CANNIBALISATION` у delivery log класифікуй як причину конкретної спроби; воно не доводить фінансовий bonus cap чи втрату користувача.

## Native: мінімальний доказ наскрізної роботи

Перевір окремо: отримання engagement → готовність wrapper → передача payload → rendered content → impression → click report → branch → product route → close cleanup. Handshake ready без content не доводить rendering. [Native integration guide](https://help.smartico.ai/welcome/technical-guides/front-end-integration/ios-android-clients-integration-guide) описує bridge та незалежні popup/gamification WebViews; ваш host має підтвердити фактичну реалізацію.

Кнопка/хрестик має пропустити перший click до штатного tracking. Не запускай той самий deep link додатково через listener. Native Back/backdrop/Escape, scroll lock і повернення з каси належать host lifecycle. Після закриття перевіряй scroll, focus і наступне відкриття на реальних Swift/RN builds. Browser preview — окремий рівень доказу.

Локальний click guard має узгоджуватись із vendor acceptance та recovery. Постійна latch після першого pointer event може заблокувати повторну спробу навіть тоді, коли штатний handler ще не прийняв click. Не застосовуй її як універсальний рецепт: preserve першої vendor дії, контрольований pending/unknown state, можливість відновлення і серверний захист перевіряються разом.

## Переналаштування, виправлення та очищення зайвого коду

Почни з **фактично доставленого** popup: локальний Body може відрізнятися від збереженого у BO, а resource values — перекривати defaults Configuration. Інвентаризація містить authoring mode, template/resource/variation, locales, saved Body/hash, Configuration, effective params, зовнішні assets, поточний wrapper/engine і всі Journey references. Збережи до змін відновлюваний snapshot у приватному kit.

1. Відтвори найменший failing state: конкретні params, width/height, locale, кнопки, крок flow. Класифікуй баг: дані/override, compiler, CSS/layout, delivery, click report, routing або host cleanup.
2. Простеж залежності поля чи handler: Configuration → Body → creative overrides → rendered DOM → branch. Шукати треба також інші resources/variations на тому самому template. Поле, не використане локальним preview, ще може використовувати чинна кампанія.
3. Прибирай підтверджено зайве: дубльовані listeners/senders, старі CSS variants, неіснуючі config fields, закоментовані експерименти, непотрібні SDK copies, assets без посилань. Зберігай потрібні action hooks, escaping, native lifecycle та fallback. Shared assets видаляй лише після inventory усіх споживачів.
4. Якщо змінюється schema, онови Body, Configuration, defaults і resource values разом. Не перевинайменовуй ID/field без перевірки старих overrides. Зміну в спільному template оцінюй як зміну для всіх bound resources.
5. Перевір саме final export actual compiler: 0/1/2 buttons, missing optional fields, long translations, усі visual states, compiler delimiters, runtime errors, HTTPS assets і resource sizes. Для Vibe перевір actual saved preview/output; legacy compiler pass не доводить Vibe compatibility.
6. Збережи, відкрий знову й порівняй effective values. Пройди реальну delivery → impression → click → branch → grant/navigation послідовність, закриття та повторне відкриття. Web і native QA фіксуй окремо; якщо native build недоступний, познач саме цю неперевірену частину.

Мінімальний результат cleanup — зрозумілий diff із причиною видалення та перевірками поведінки. Саме скорочення bytes або зникнення console error не доводить, що кнопка далі проходить Journey і не дублює дію. Існуючий [compiler check](../smartico-popups/examples/README.md) та [implementation contract](../smartico-popups/implementation-contract.md) використовуй повторно.
