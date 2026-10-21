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

## Resource і variation — не delivery attempt

Template/design задає структуру; resource — content values; variation обирається за locale/brand/conditions; Journey задає поведінку. Перевір active status і default fallback: збережена Draft variation не означає, що саме вона доставляється гравцю. [Content Variations](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/content-variations).

Параметри, escaping, hooks, actual compiler й fullscreen mechanics мають одне джерело — [legacy runtime runbook](../docs/06-smartico-popup-templates.md). Історичні parser/click bugs не перетворюються на загальні властивості будь-якого popup; їхні докази й межі — у [каталозі інцидентів](../docs/22-incidents-and-popup-cleanup.md).

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

Pending/dedup policy повинна покривати реальне очікування delivery, finite expiry та recovery. Entry mode не замінює popup lifecycle. [Кандидат informational pattern](../docs/21-promo-patterns.md) і його [historical proof limits](../docs/22-incidents-and-popup-cleanup.md) описані окремо; saved settings не є end-to-end гарантією.

Impression — SDK/engagement report про показ, який окремо не доводить видимий непорожній контент або закриття. Якщо flow закрито на Impression, наступний entry може пройти, поки перша модалка ще на екрані. Для строгої вимоги «максимум одна відкрита/очікувана» потрібні підтримані lifecycle signals або серверна coordination policy. Не вигадуй acknowledgment у canonical bridge.

Global delays/caps стосуються інших комунікацій також. Зафіксуй причину затримки й застосуй найвужчу дозволену зміну конкретного activity/flow. Відоме `CANNIBALISATION` у delivery log класифікуй як причину конкретної спроби; воно не доводить фінансовий bonus cap чи втрату користувача.

## Native ownership і proof boundary

[Native integration guide](https://help.smartico.ai/welcome/technical-guides/front-end-integration/ios-android-clients-integration-guide) описує bridge та незалежні popup/gamification WebViews; фактичну реалізацію підтверджує installed host. Click reporting і product navigation — різні канали; їхні capabilities та обидва routing sources перевіряються за [native contract](../docs/07-native-webview.md).

Handshake/Impression без visible nonempty content не доводять render; browser preview не доводить Swift/RN behavior. Native Back/backdrop, focus/scroll cleanup і повернення з каси належать host lifecycle. First-click propagation, vendor hook та guard safety — у [06](../docs/06-smartico-popup-templates.md); конкретні tap/scroll failures — у [22](../docs/22-incidents-and-popup-cleanup.md).

## Переналаштування й cleanup

Єдина процедура inventory → dependency check → мінімальне видалення → schema/defaults/overrides sync → regression → save/readback → fresh delivery міститься в [incident/cleanup runbook](../docs/22-incidents-and-popup-cleanup.md). Для передачі користуйся [implementation contract](../smartico-popups/implementation-contract.md), для legacy regression — [runnable checker](../smartico-popups/examples/README.md). Скорочення bytes саме не доводить правильний branch/grant або роботу native controls.
