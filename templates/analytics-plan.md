# План аналітики — <campaign-key>

**Статус:** `<proposal | approved contract | implemented Stage | verified Prod>`

## Collection mode — вибрати до решти таблиць

`DOM hooks/GTM | programmatic events | native collector`: ___. Чинний source/version/owner: ___.

У DOM-only mode передати exact `data-gtm-id` inventory, placement/trigger, collector для кожного document/iframe, dynamic-node/visibility rules, consent/dedupe і actual receiver QA. Не реалізовувати власний send/dataLayer producer й не додавати auth/state/timing params з програмних прикладів без contract. Усі payload/retry/destination sections нижче заповнюються лише якщо вони належать обраному mode. [Вибір контракту](../docs/12-analytics.md).

Не позначати implemented до реальної доставки подій. Не додавати новий message type до canonical iframe bridge без host contract. Emitted names використовують надану конвенцію аналітика `ga_{module/modal}_{action}_{element/result}`; generic internal intent не є другою analytics event.

Це product/adapter names. Firebase Swift/Android резервують `ga_` для SDK event names: destination mapping погоджується окремо; без нього не forward напряму в native `logEvent`.

## Мета й власники

- Бізнес-питання / primary metric: `<values>`
- Numerator / denominator / attribution window: `<values>`
- Landing / Host Web / Native / Smartico / Analytics owners: `<names>`
- Destination conversion source: `<backend/host, not click inference>`
- `page_view`/native screen owner: `<host>`

## Канали й приватність

| Surface | Supported channel / version | Consent owner | Contract/evidence | Статус |
| --- | --- | --- | --- | --- |
| Web full-page | `<adapter>` | `<host>` | `<link>` | TODO |
| Cross-origin iframe | `<approved adapter or unavailable>` | `<host>` | `<link>` | TODO |
| Swift WKWebView | `<actual handler/schema or unavailable>` | `<App>` | `<link>` | TODO |
| RN Android WebView | `<actual handler/schema or unavailable>` | `<App>` | `<link>` | TODO |

- Allowed common parameters: `<campaign_id, landing_version, surface, locale, theme, has_auth, ...>`
- Forbidden: token/JWT, user ID, email/phone, raw profile/socket/exception, secret URL/query.
- Consent unknown/off: `<drop/no collection policy>`
- Queue: `<disabled or max/TTL/retry/overflow/clear lifecycle>`
- `event_id` / view scope / receiver dedupe: `<values>`
- Retention / destination analytics property owner: `<values>`
- Platform split: однакові event names; `host_platform` + `surface` + `device_category`, без `_web/_app` suffix.
- Source платформних даних / native dimensions / custom dimensions registration: `<trusted owner/schema>`.

## Події

- Стабільний module/screen key: `<snake_case Latin, no user/mission IDs>`
- Надані show patterns: `ga_{screen}_popup_show`, `ga_{screen}_modal_show`.
- Click patterns: `ga_{screen}_click_btn_{name}`, `ga_{screen}_click_btn_close`, `ga_{screen}_click_input_email`.
- Result patterns: `ga_{screen}_{action}_error`, `ga_{screen}_{action}_successful`.
- Validation: `ga_{screen}_{field}_status_` — incomplete pattern надано з trailing underscore. Уточнити suffix чи payload у аналітика; не вигадувати.
- Цілісні event names до 40 символів для GA4; погодити скорочення, якщо module key довгий.

| Event | Exact trigger | Params allow-list | Owner / channel | Deduplication | QA evidence |
| --- | --- | --- | --- | --- | --- |
| `<approved whole-screen-show name>` | `<actual visible render; name уточнити>` | `<params>` | `<owner>` | `<once/view>` | TODO |
| `ga_promo_reward_modal_show` | `<actual rendered visible modal>` | `<modal_state/creative_version>` | `<popup owner>` | `<one/show>` | TODO |
| `ga_promo_demo_click_btn_attempt_left` | `<logical left-choice activation>` | `<cta_id/action_kind/state>` | `<landing adapter>` | `<one/click>` | TODO |
| `ga_promo_reward_click_btn_claim` | `<claim click, not grant>` | `<modal_state/cta_id>` | `<popup owner>` | `<one/click>` | TODO |
| `ga_promo_demo_activation_successful` | `<accepted opt-in ack>` | `<mission_key/safe result_code>` | `<mission adapter>` | `<one/request>` | TODO |
| `ga_promo_demo_activation_error` | `<categorized activation failure>` | `<safe error_code>` | `<mission adapter>` | `<rate limit>` | TODO |
| `ga_promo_reward_grant_successful` | `<authoritative issued reward>` | `<safe reward_key>` | `<server>` | `<server idempotency>` | TODO |

Це generic examples, а не затверджений campaign dictionary. Не дублювати існуючу product taxonomy. Request/click/impression не дорівнюють reward issued. Потрібні video/FAQ/impressions додаються після погодження exact names.

## Destination mapping

| Product event (`ga_*`) | Destination/platform | Exact SDK event name | Params conversion/schema | Mapping owner/status | Receiver evidence |
|---|---|---|---|---|---|
| `ga_promo_reward_modal_show` | Swift Firebase | `<approved name without reserved prefix>` | `<String/Int/Double>` | `<owner/pending>` | TODO |
| `ga_promo_reward_modal_show` | Android Firebase | `<approved name without reserved prefix>` | `<approved Bundle types>` | `<owner/pending>` | TODO |
| `ga_promo_reward_modal_show` | Web GTM/GA4 | `<confirmed container mapping>` | `<schema>` | `<owner/pending>` | TODO |

## CTA mapping

| CTA ID | Location / locale label | Business intent | Event action | Arrival owner/marker | Tracking event |
| --- | --- | --- | --- | --- | --- |
| `<hero_primary>` | `<hero/label>` | `<auth/verification/participation>` | `<route>` | `<host marker>` | `<event>` |

## Приклад payload

```json
{
  "event": "ga_promo_demo_click_btn_attempt_left",
  "event_id": "opaque-random-id",
  "campaign_id": "sample_campaign",
  "landing_version": "1.0.0",
  "surface": "web_iframe",
  "host_platform": "web",
  "device_category": "desktop",
  "locale": "uk",
  "has_auth": true,
  "ui_state": "available",
  "cta_id": "attempt_left",
  "action_kind": "mission_opt_in"
}
```

## Приймання

- [ ] Exact `ga_*` dictionary, params, denominator і owner погоджені.
- [ ] Names вкладаються у GA4 limit; incomplete validation status / whole-screen pattern уточнені за потреби.
- [ ] Supported channel доведений на кожному потрібному surface.
- [ ] Product → destination event names/types погоджені; Firebase reserved prefixes не передаються напряму.
- [ ] Ті самі events у Web desktop/mobile та App iOS/Android діляться правильними параметрами; mobile browser не класифікується як App.
- [ ] Consent on/off/unknown і no PII/token перевірені.
- [ ] Delivery/dedupe/retry/foreground/navigation перевірені у receiver.
- [ ] Один owner `page_view`, Smartico reports не дублюються.
- [ ] Analytics failure не блокує user action.
- [ ] Нереалізовані capabilities явно `NOT_TESTED`, без вигаданого PASS.

Детальний контракт — [analytics guide](../docs/12-analytics.md).
