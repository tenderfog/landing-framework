# Smartico blueprint — mission або Client Action

Business facts, approved dates/timezone, rewards і prerequisites: посилання на [project brief](project-brief.md), revision ___. Тут фіксуються їхній **фактичний CRM mapping/readback** та відмінності QA/Prod, без незалежної копії бізнес-правил. Technical transports/schemas посилаються на [integration contract](integration-contract.md).

## Entity map

| Entity | Internal Latin name | ENV/label/brand | ID/key | Current status | Source/owner |
|---|---|---|---|---|---|
| Mission (якщо обрано цей mode) | | | | | |
| Mission task | | | | | |
| Client Action (якщо обрано цей mode) | | | | | |
| Journey | | | | | |
| Template | | | | | |
| Creative variants | | | | | |
| Bonus/reward resources | | | | | |
| Audience/segment | | | | | |
| Prerequisite automation rule / source event | | | | | |
| Public marker/property / server-side eligibility condition | | | | | |
| Informational Journey/action, якщо потрібні окремо | | | | | |

Описи українською, display content — approved locale. Зафіксувати existing entity reuse або new entity creation, щоб не створювати duplicates.

## Trigger

Mode: ___. Exact event/type/entityId або Client Action name/case: ___. Event sender: ___. Supported transport/payload schema: ___. Trigger audience/eligibility: ___. Re-entry/caps/one-per-cycle enforcement: ___. State read API/fields та current-cycle reset policy: ___.

Grant-day basis (attempt cycle або фактичний local issue day): ___. Per-attempt idempotency: ___. Якщо потрібний окремий daily grant cap, його atomic server owner/mechanism: ___. Pending через midnight та failed/retried grant policy: ___.

## Branch contract

Prerequisite definition (one event/sum, minimum, currency, approved status, window/timezone, lifetime/revoke): ___. Irreversible consumption point: ___. UI preflight/server recheck: ___. Realtime cutover/historical backfill scope: ___. State projection/freshness semantics: ___.

Popup authoring mode/current capability source: ___. Active Body/design revision + defaults/creative overrides: ___. Communication global delays/CAPs/queue/retention/suppression: ___. Per-activity exceptions and shared-label impact: ___. Pending/delivery failure/retry policy: ___. These are separate from bonus caps and attempt limits.

```text
Trigger -> Eligibility/caps -> Result branch -> Creative -> response/control
        -> optional second branch -> grant or no reward -> confirmed post-grant navigation -> end
```

Для кожного вузла: label/ID, condition, success/failure/timeout route, owner, доказ. Шанси, суми та кількість раундів беруться з product mechanics; приклад не додає їх автоматично.

| UI дія | Exact dp або Client Action | Який pending context потрібен | Grant/branch | Navigation after confirmed grant | Passive close semantics |
|---|---|---|---|---|---|
| claim | | | | | |
| risk/continue | | | | | |
| close X | | | | | |
| external/bonuses CTA | | | | | |

## Schedule та QA

Start/exclusiveend/timezone: ___. Backend reset time+timezone і DST plan: ___. QA temporaryfirstreset: ___. Restoration evidence: ___. Firstpreview/enginechecks: ___. Saved/reopened BO values: ___. Actualmission/clientactiontrigger evidence: ___. Actual popup/grant/failure/doubleclick/reset/device cases: ___.

Handbook описує setup, але не дозволяє grant/publish/reward action без чинної авторизації задачі та applicable tool policy. Кнопка click у UI — не доказ нарахування. [Runbooks](../docs/05-smartico-missions-journeys.md).
