# Приклад: Smartico deep link → native event-action dispatcher

**Псевдокод і навчальний contract, не production-ready Swift/RN патч.** Використати для обговорення з App-командою, адаптувати до existing router/session/queue. Реальні callback names, environment origins й action registry взяти з коду продукту. [Native context](../docs/07-native-webview.md), [Client Action nuance](../docs/05c-smartico-client-actions.md).

## Configuration

```text
Popup navigation href:
dp:go&url=https://product.example/event_action/bonuses

Journey navigation після confirmed grant:
dp:go&url=https://product.example/event_action/bonuses

Popup decision hrefs:
dp:ok
dp:cancel
dp:action&action=campaign_summer_close_claim_base
```

`product.example` — placeholder. Остання дія може бути exact engagement click, а не named Client Action; caller contract має це встановити. Bonus grant лишається Journey/backend; router не нараховує винагороду.

## Два джерела, один handler

| Джерело | Поле deep link |
| --- | --- |
| Popup web-to-native `bcid:4` | Верхньорівневе `dp` |
| Journey WebSocket `cid:105` | `payload.dp` |

Джерела підтверджено [BCID4 guide](https://help.smartico.ai/welcome/technical-guides/front-end-integration/ios-android-clients-integration-guide#3.4.-execute_deep_link-web-to-native-bcid-4) та [CID105 protocol](https://github.com/smarticoai/public-api/blob/main/docs/native/PROTOCOL.md#client_execute_deeplink_event). Це не дві команди на одну navigation: кожен ingress викликає router один раз; click/impression reports виконують тільки tracking.

```text
onTrustedPopupMessage(body, currentPopup):
  validate wrapper identity, current session, message schema
  if bcid == 6:
    forward all socket fields except bcid through existing service
    return                     # tracking не викликає navigation
  if bcid == 4:
    routeSmartico(body.dp, context=currentPopup)
    return
  delegate remaining BCIDs to existing popup lifecycle

onIdentifiedSocketEvent(body, currentSession):
  if cid == 105:
    preserve existing engagement tracking/ack policy
    routeSmartico(body.payload.dp, context=currentSession)
  else:
    delegate to existing socket handlers

routeSmartico(value, context):
  command = existing verified Smartico parser(value)
  if command is invalid:
    report controlled unsupported/invalid result
    return

  if command.action == go:
    destination = parse HTTPS URL from command.params.url
    if destination origin is allowed product origin for current build:
      if destination path is a supported /event_action/ route:
        existingProductDispatcher(destination path + query)
        return
    existingApprovedURLHandler(destination)
    return

  if command is dummy popup control:
    keep existing control behavior and engagement report
    return

  if command is named Client Action and context contract supports it:
    existingNamedActionSender(command.name, validated allowed payload)
    return                     # лише один sender; не grant

  existingSmarticoCommandHandler(command)
```

Перевірка origin має порівнювати parsed scheme/host/port, не `url.includes('product.example')`. Unsupported product route не виконується як довільний URL «для fallback» без approved policy. Наявний dispatcher сам визначає login/eligibility й screen/modal.

`dp:go` query не є звичайним `?query`: використати parser Smartico або перевірений parser із його syntax. Nested URL зі своїми `&`/query кодується за контрактом. Декодувати один раз; `URLComponents.queryItems` уже повертає decoded value. HTML `&amp;` — escaping markup, DOM `href` має реальне значення.

## Ілюстрація reply contract для landing

```json
{
  "replyTo": "request-correlation-id",
  "identityEpoch": "current-epoch",
  "ok": false,
  "error": {"code":"unsupported-action"}
}
```

Це **пропозиція** bridge reply, не BCID і не Smartico event. Вона допомагає landing не показувати успіх для невідомого маршруту. `ok:true` navigation reply також не доводить bonus grant.

## Acceptance прикладу

1. Popup navigation відкриває native Bonuses один раз; не Safari/plain web route.
2. Journey post-grant `cid:105` відкриває той самий screen; failure/pending grant не запускає навігацію.
3. `dp:ok/cancel` і explicit close зберігають reports/exact connector semantics.
4. Replay того самого доставленого engagement не дублює screen/grant; новий engagement із тим самим asset ID обробляється штатно.
5. Другий approved route (наприклад game modal) працює через existing registry без campaign-ID switch.
6. Locale/query parameters не губляться; malicious origin, unknown action, stale identity дають керований результат.
7. Actual iOS/RN Android session перевірена: protocol inspection окремо не сертифікує App implementation.

Mapping прямої вебадреси на екран в одному продуктовому профілі не доводить підтримку `/event_action/bonuses` в іншому. Не переносити routes між продуктами без перевірки; configuration current build і supported dispatcher — джерело правди.
