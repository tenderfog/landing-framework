# Investigation record — <symptom-key>

Приватний запис без credentials/PII/raw profile. [Workflow](../docs/20-product-profiles-and-investigation.md).

| Контекст | Значення |
|---|---|
| Питання / expected vs actual | |
| Product / ENV / Label / Brand | |
| Surface / host build / source and served revision | |
| CRM config version / test-account role | |
| First known bad / last known good / capture time + timezone | |
| Authorized scope / read-only or test mutation | |

## Evidence chain

| Boundary | Expected fact | Observed fact + timestamp/version | Source (private) | Confirmed/contradicted/not observed/N/A |
|---|---|---|---|---|
| Product source event | | | | |
| Smartico received event | | | | |
| Property/segment/mission projection | | | | |
| Client fresh snapshot/identity | | | | |
| Accepted action/opt-in | | | | |
| Journey entry/branch/reentry state | | | | |
| Popup queue/delivery/render/control | | | | |
| Grant transaction/status | | | | |
| Navigation/analytics | | | | |

## Гіпотези й мінімальні перевірки

| Hypothesis | Predicted observation | Read-only check | Actual result / eliminated? |
|---|---|---|---|
| | | | |

First proven break: ___. Cause confidence: confirmed / likely / unknown. Залишкові альтернативи: ___.

## Fix та висновок

- Changed layer / reviewable diff / config before→after: ___.
- Test reset scope; mission/marker/Journey/grant differences: ___.
- Rollback/restoration, якщо виконана test mutation: ___.
- Symptom verification + affected regression evidence: ___.
- Actual device/env not checked: ___.
- Reusable lesson / applicability / source / next review date: ___.
- Framework/profile/kit files to update: ___.
