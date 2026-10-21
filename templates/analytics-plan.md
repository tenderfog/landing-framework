# План аналітики — <campaign-key>

Заповнюється за [analytics guide](../docs/12-analytics.md). Тут лише рішення конкретного проєкту; naming, privacy та delivery rules не копіюються вдруге. Залишити секції обраного mode, решту позначити N/A.

## Паспорт і мета

| Поле | Рішення / source / owner |
|---|---|
| Status: proposal / approved / Stage verified / Prod verified | |
| Mode: DOM hooks-GTM / programmatic / native collector | |
| Чинний product contract/version | |
| Business question / primary metric | |
| Numerator / denominator / unit / attribution window | |
| Host / landing / popup / analytics owners | |
| Один page-view owner і authoritative conversion source | |

## Collection coverage

| Surface/document | Actual collector/channel/version | Consent owner | Status / receiver evidence |
|---|---|---|---|
| Product + landing iframe | | | |
| Widget slot/entry | | | |
| Smartico popup document | | | |
| Swift / RN Android | | | |

## Exact inventory

| DOM ID або product event | Placement + exact trigger | Owner | Visibility/dedupe rule | Destination / QA evidence |
|---|---|---|---|---|
| <approved CTA ID/name> | <click/keyboard, enabled control> | | | |
| <approved segment ID/name> | <actual visible geometry + agreed threshold> | | | |
| <accepted operation/result, if supported> | <authoritative source> | | | |

У DOM-only mode тут hooks, не другий JS producer. Fields/auth/state/timings не додаються без contract. Dynamic nodes/remount, accepted click marker lifetime та collection усередині cross-origin popup/landing мають explicit owner.

## Destination та report mapping

| Source ID/event/dimension | Destination/platform | Exact SDK name/type або report dimension | Mapping owner / evidence |
|---|---|---|---|
| | | | |

Платформні зрізи беруться з trusted host/collector; перевірити Web desktop/mobile проти actual iOS/Android. Для native SDK не forward reserved product prefixes напряму. Exact names/types і custom dimension registration фіксуються тут.

## Consent, payload і lifecycle

- Allowed fields, types та source: ___. Forbidden-data check evidence: ___.
- Consent on/off/unknown policy / owner: ___.
- Report retention, destination property/stream: ___.
- Retry queue: N/A або owner/max/TTL/backoff/overflow: ___.
- Dedupe key/view scope, receiver policy й cleanup on logout/dispose: ___.
- Navigation/foreground/visibility flush constraints: ___.
- CTA business transport / arrival marker: link на [integration contract](integration-contract.md), без дублювання його action table.

Payload example додається лише для programmatic/native mode з **фактичного sanitized approved schema**, не з універсального JSON із непогодженими params.

## Приймання

- [ ] Обраний mode має exact inventory і real receiver evidence на потрібних surfaces.
- [ ] DOM mode без competing send/dataLayer producer; dynamic-node/click/visibility rules перевірені.
- [ ] Destination mapping валідний; platform/report dimensions доступні.
- [ ] Consent on/off/unknown, privacy, remount/retry/navigation і dedupe перевірені.
- [ ] Один owner кожного факту; click/show не оголошено grant.
- [ ] Немає дубля page_view чи ручної копії штатного Smartico reporting.
- [ ] NOT_TESTED/unsupported має owner і next action; analytics failure не блокує продуктову дію.
