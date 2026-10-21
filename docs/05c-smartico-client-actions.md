# Smartico Client Actions: entry без обов'язкової mission

Використовувати, коли Journey запускається продуктовою дією: CTA, opt-in до іншої механіки, підтверджений backend event або визначений етап funnel. Mission не потрібна, якщо бізнесу не потрібні її lifecycle/progress/state. Порівняння — у [Smartico overview](05-smartico-missions-journeys.md).

## Три різні дії

| Рівень | Приклад | Наслідок |
| --- | --- | --- |
| Product navigation | `event_action/verif` | Host відкриває верифікацію |
| Named Client Action | `campaign_summer_entry` | Smartico event може запустити Journey/прогресувати task |
| Popup engagement click | `action=dp:ok` у engagement report | Точний connector поточної activity |

Дія може проходити через кілька рівнів, але це не робить їх взаємозамінними. Окремо записувати `businessIntent`, `clientActionName`, `productTransport`, `engagementAction` й `analyticsEvent`. Не використовувати одне поле `actionId` для всіх значень.

## 1. Спроєктувати контракт

```yaml
# НАВЧАЛЬНИЙ schema; не BO import і не встановлений native API.
businessIntent: promo.enter
clientActionName: campaign_summer_entry
senderOwner: host
payload:
  campaign_key: campaign_summer
  choice: left
  schema_version: 1
entryLimit:
  policy: one-per-calendar-day
  timezone: Europe/Kyiv
stateOwner: campaign-backend
grantDayBasis: must-be-defined-by-business # attempt-cycle або фактичний local issue day
```

`schema_version`, `choice`, `request_id` тощо можна передавати лише якщо current sender/receiver їх підтримує й Journey/backend реально перевіряє. Наявність UUID у payload сама по собі не забезпечує idempotency.

Окремо задати entry cap на цикл, idempotent grant на attempt і, якщо потрібен, cap видачі за фактичний local day. Вони не взаємозамінні: учорашній pending popup і сьогоднішній entry можуть обидва завершитися сьогодні. `grantDayBasis`, pending/failed policy та atomic cap реалізує підтриманий server mechanism; [Journey runbook](05b-smartico-journey-runbook.md) містить boundary case.

Назву action зробити Latin, стабільною й відмінною від інших кампаній; case зберігати без автоматичного uppercase/lowercase. Вона не має містити email, user ID або секрет. Явно визначити, чи лівий/правий вибір лише анімаційний, чи змінює business event. Не заявляти різний шанс без server spec.

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

**Перевірити побічні ефекти transport.** У дослідженій інтеграції широкий product `openSmartico` route захоплював body scroll lock і очікував callback закриття gamification widget, якого plain Client Action popup не давав. Застосований action-only sender через вже погоджений identified SDK/provider усунув цей шлях блокування. Це не дозвіл додати другий SDK/session або звертатися до cross-origin parent. Коли host-owned route є єдиним supported sender, перевірити його modal/scroll lifecycle й передати missing capability host owner. Для звичайної навігації правило event_action лишається чинним.

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

Клік у landing доступний користувачу й може бути повторений або відтворений. Browser disabled/5s loader — лише UX guard. Для винагороди потрібні server eligibility, entry limits і grant idempotency. Не дозволяти довільному payload встановити reward amount, verified status або winner.

Якщо немає mission, треба окремо визначити, звідки UI знає про remaining attempts/pending/next reset. Потрібен backend/Smartico state snapshot або інший авторитетний контракт. Не замінювати його `localStorage['lastClick']`, «ховаємо кнопку на 24 години» чи analytics log.

## 5. Особлива пастка `dp:action` у popup

Офіційний [Native Integration Guide](https://help.smartico.ai/welcome/technical-guides/front-end-integration/ios-android-clients-integration-guide#3.4.-execute_deep_link-web-to-native-bcid-4) відносить dummy popup controls до marketing flow. Водночас [Smartico deep links](https://help.smartico.ai/welcome/products/tools-and-guides/deep-links) описує named `dp:action&action=...` як Client Action у web.

Тому перед налаштуванням хрестика/кнопки потрібно вибрати один із контрактів:

1. **Engagement-click contract:** Journey виходить із цієї popup activity за exact action URL у `cid:104`. Native зберігає click report; додатковий named event не потрібний.
2. **Named-event contract:** Journey/task очікує окремий Client Action. Native handler має підтверджену реалізацію відправлення named event через existing service. Перевірити, що wrapper/host не надсилає його вдруге.

Перевірений код [native bridge](https://libs.smartico.ai/smartico_native_bridge.js) має різні managed/native paths: managed Client Action handler і native `bcid:4` forwarding не можна вважати одним sender. Поточний App router потрібно перевірити за кодом або sanitized real-device trace. Не «виправляти» кожен dummy `dp:ok/cancel/close/action` автоматичним client_action event.

## 6. QA та спостережуваність

- Guest/unverified click переходить на стандартну modal дію та не sends entry action.
- Один eligible click дає один sender event, один Journey entry і максимум один grant за policy.
- Rapid double/mixed click, дві вкладки, reconnect і повтор відправлення не обходять backend cap.
- Case/payload mismatch не запускає flow; це перевірити на окремій QA конфігурації.
- Unknown timeout → reread authoritative state, без blind event retry.
- Logout/new identity відкидає stale requests/results.
- Календарний cap перевірити біля local midnight та DST, не лише через 24h.
- Analytics має окремо intent/sent/confirmed outcomes і спільний consent policy; [analytics](12-analytics.md).

Звіт містить ENV, action name, sender owner, payload schema, exact BO trigger/filter, state source, caps, action flow й конкретні докази. Відсутній state provider або native support позначити як блокер механіки, а не «готово після верстки».
