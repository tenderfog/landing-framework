# State matrix — конкретна акція

| State | Authoritative inputs | CTA label/color/enabled | Participation click action | Animation/media | Timer/status | Read refresh / QA evidence |
|---|---|---|---|---|---|---|
| guest new visitor | trusted guest | | auth modal, no activation | | | |
| registered but logged out | trusted guest | | host chooses login/registration | | | |
| awaiting token | hasAuth, token unknown | hidden | none | | loading | |
| verification loading | identity valid, eligibility unknown | hidden | none | | loading | |
| unverified | confirmed profile predicate false | Верифікуватись | verif action, no activation | | | |
| verified/state loading | eligibility true, attempt unknown | hidden | none | | loading | |
| prerequisite pending/unknown | identity valid, qualifying source/projection not fresh | locked | read refresh, no attempt consumption | | updating | |
| prerequisite missing | confirmed condition false | next step | info/local or CRM prompt, no mission opt-in | | | |
| available | fresh authoritative state | | one opt-in OR Client Action | | | |
| pending | activation in-flight | locked | no duplicate | | visual loader duration | |
| uncertain | timeout/no current truth | locked | retry read only | | syncing | |
| consumed | used current cycle | gray disabled | none | no pulse/hover | shared countdown | |
| reset reached | old consumed deadline expired | locked | none until fresh available | | refreshing | |
| eligibility error | read/schema/network error | disabled | retry read | | human error | |
| integration error | SDK/transport error | disabled | retry read/setup | | human error | |
| not started | server/config schedule | unavailable | | | | |
| ended | exclusive end reached | unavailable | | | | |

Додаткові промо states: balance/deposit condition, country restriction, grant failed, user has active bonus — лише якщо вони існують у product contract. Назва Smartico/SDK не з'являється в user copy. Головний і сценовий UI використовують одну state model. [Пояснення](../docs/04-state-and-time.md).
