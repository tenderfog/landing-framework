# Smartico blueprint — mission або Client Action

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

Описи українською, display content — approved locale. Зафіксувати existing entity reuse або new entity creation, щоб не створювати duplicates.

## Trigger

Mode: ___. Exact event/type/entityId або Client Action name/case: ___. Event sender: ___. Supported transport/payload schema: ___. Trigger audience/eligibility: ___. Re-entry/caps/one-per-cycle enforcement: ___. State read API/fields та current-cycle reset policy: ___.

Grant-day basis (attempt cycle або фактичний local issue day): ___. Per-attempt idempotency: ___. Якщо потрібний окремий daily grant cap, його atomic server owner/mechanism: ___. Pending через midnight та failed/retried grant policy: ___.

## Branch contract

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
