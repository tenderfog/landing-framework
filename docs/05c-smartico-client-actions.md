# Smartico Client Actions: entry без обов'язкової mission

Використовувати, коли Journey запускається продуктовою дією: CTA, opt-in до іншої механіки, підтверджений backend event або визначений етап funnel. Mission не потрібна, якщо бізнесу не потрібні її lifecycle/progress/state. Порівняння — у [Smartico overview](05-smartico-missions-journeys.md).

## 1. Зафіксувати action contract

У [Smartico blueprint](../templates/smartico-blueprint.md) записати business intent, exact case-sensitive action name, єдиного sender owner, підтриманий payload, authoritative state source і entry/grant policy. Product navigation, named Client Action, popup engagement і analytics мають різні ролі — [event actions](03-event-actions.md), [модель Smartico](../smartico-knowledge/01-model-and-integration.md).

Назва Latin, стабільна й окрема від інших кампаній, без PII/секретів. Визначити, чи choice змінює business event або лише анімацію. `schema_version`, `choice`, `request_id` передавати тільки за підтриманого sender/receiver contract; UUID сам не забезпечує idempotency. Entry cap, issuance replay protection та grant-day cap задаються окремо за [reward model](../smartico-knowledge/03-journeys-and-rewards.md).

## 2. Зареєструвати в BO

У потрібному ENV/Label/Brand відкрити **Tools → Properties**, знайти property **Client action** і додати точне значення через доступну BO дію. Або зробити погоджений тестовий event і дочекатися його discovery. Офіційна документація описує discovery до 30 хвилин та ручну реєстрацію. Не надсилати Production trigger лише для того, щоб він з'явився у dropdown. [Client action event](https://help.smartico.ai/welcome/products/tools-and-guides/client-action-event).

Перевірити наявне значення перед створенням. Не перейменовувати action, що вже використовується чужими flows. Записати список залежних tasks/Journeys, description українською і власника контракту.

## 3. Вибрати один sender

### Web, коли SDK належить цій поверхні

Після підтвердженої identity використовувати документований frontend метод:

```js
// ПРИКЛАД. Назва та payload погоджуються для нового campaign.
_smartico.action('campaign_summer_entry', {
  campaign_key: 'campaign_summer',
  choice: 'left',
  schema_version: 1
});
```

Це відправлення event, **не Promise про grant**. Не показувати confirmed success лише тому, що функція не кинула помилку. Generic callback/ACK для цього прикладу не вигадувати.

### Iframe, коли sender належить host

До вибору route перевірити modal/scroll lifecycle: navigation-oriented `openSmartico` wrapper у дослідженій інтеграції лишав body scroll lock для plain Client Action. [Причина й виправлення](22-incidents-and-popup-cleanup.md) не є дозволом створити другий SDK або читати cross-origin parent. Коли існує approved action-only provider, використати його; інакше missing capability передати host owner.

У [публічному pinned product registry](https://github.com/onlineTeran/landing_doc/blob/14f93e5c1f16ff349a52f10ec1c5bd1c2db47030/assets/EVENT-ACTIONS.md) є продуктова Smartico дія. Це приклад для host, який окремо підтвердив підтримку цього route та його downstream semantics:

```js
// ПРИКЛАД для підтвердженого registry; не універсальна browser API.
IframeBridge.sendMessage(
  'event_action',
  'event_action/smartico/dp:action&action=campaign_summer_entry'
);
```

Тут host виконує downstream Smartico deep link. Це **умовна можливість підтвердженого route**, не рекомендований default для будь-якого Client Action. Не додавати поряд `_smartico.action(...)`: це два events. Payload support через цей рядковий маршрут перевіряється окремо; не додавати довільні JSON/query поля й не припускати, що вони дійдуть незмінними. [Event actions](03-event-actions.md), [incident catalog](22-incidents-and-popup-cleanup.md).

### Native App

Host adapter використовує поточний identified Smartico service або офіційний native SDK, якщо саме він встановлений. Landing не бере socket handle, hash/private key та не дублює web SDK «на всяк випадок». Назви RPC визначаються [native contract](07-native-webview.md), не вигадуються за UA.

### Server-to-server

Для backend-triggered action використовувати офіційний REST contract, доступний уповноваженій integration команді в BO. REST secret keys не входять у JS landing. Не копіювати REST `client_action` payload key у socket packet без підтвердження: схеми transports можуть відрізнятися. [Офіційний Client Action guide](https://help.smartico.ai/welcome/products/tools-and-guides/client-action-event).

## 4. Налаштувати Journey

У Real-time Journey вибрати актуальний event **Core: client action** та exact action value. Якщо передані attributes мають бізнес-сенс, додати підтверджені payload conditions у Query Builder. Entry/eligibility/caps/dates/grants налаштувати за [Journey runbook](05b-smartico-journey-runbook.md).

Для Client Action без mission потрібен окремий authoritative attempts/pending/next-reset state provider. Sender не замінює server eligibility/caps; payload не встановлює reward amount, verified status чи winner. [State model](../smartico-knowledge/02-missions-and-state.md).

## 5. Особлива пастка `dp:action` у popup

Офіційний [Native Integration Guide](https://help.smartico.ai/welcome/technical-guides/front-end-integration/ios-android-clients-integration-guide#3.4.-execute_deep_link-web-to-native-bcid-4) відносить dummy popup controls до marketing flow. Водночас [Smartico deep links](https://help.smartico.ai/welcome/products/tools-and-guides/deep-links) описує named `dp:action&action=...` як Client Action у web.

Тому перед налаштуванням хрестика/кнопки потрібно вибрати один із контрактів:

1. **Engagement-click contract:** Journey виходить із цієї popup activity за exact action URL у `cid:104`. Native зберігає click report; додатковий named event не потрібний.
2. **Named-event contract:** Journey/task очікує окремий Client Action. Native handler має підтверджену реалізацію відправлення named event через existing service. Перевірити, що wrapper/host не надсилає його вдруге.

Перевірений код [native bridge](https://libs.smartico.ai/smartico_native_bridge.js) має різні managed/native paths: managed Client Action handler і native `bcid:4` forwarding не можна вважати одним sender. Поточний App router потрібно перевірити за кодом або sanitized real-device trace. Не «виправляти» кожен dummy `dp:ok/cancel/close/action` автоматичним client_action event.

## 6. Перевірити sender → trigger → result

- Один eligible click: один sender event із правильним case/payload, одна очікувана entry; негативний case/payload не запускає flow.
- Guest/unverified не sends participation; підтриманий transport не залишає scroll-lock і працює в потрібній App build.
- Rapid/mixed clicks, independent sessions, reconnect, uncertain response й midnight перевіряються за [caps/reward contract](../smartico-knowledge/03-journeys-and-rewards.md) та [QA](13-qa.md); після timeout спочатку state reconciliation.

Результат: action inventory/name, sender/schema/version, exact BO filter, state/caps owner, correlated entry/result evidence, Web/App limits. Analytics перевіряється окремо за [collection contract](12-analytics.md); сам виклик `.action()` не доводить grant.
