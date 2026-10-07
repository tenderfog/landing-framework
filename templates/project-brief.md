# Project brief — заповнити для конкретної акції

Для нової campaign landing обов'язковий [stack Vue 3 + Nuxt 4](../docs/00-technical-stack.md): Vue SFC, Composition API, `<script setup lang="ts">`. Static generated deployment — default; SSR потребує погодженого hosting contract. Поля версій/build нижче заповнюються фактичними значеннями проєкту.

| Поле | Значення |
|---|---|
| Campaign slug / public path | |
| Product / brand / country | |
| Product owner / CRM / frontend / native / QA / release | |
| Product request / approved rules / version | |
| Figma file + nodes desktop/mobile/states/locales | |
| Scope секцій та excluded work | |
| Web host / iOS build / Android RN build | |
| Repo / branch / methodology version | |
| Exact Vue 3 / Nuxt 4 / TypeScript versions | |
| Node.js / package manager + exact versions | |
| Lockfile path / checksum або source commit | |
| Vue SFC / Composition API / script setup TypeScript — evidence | |
| Rendering/deployment: static generated / погоджений SSR + contract | |
| Exact install/build command / working directory | |
| Фактичний build output directory / CI artifact mapping | |
| Campaign subpath / configured Nuxt base path / asset base URLs | |
| Performance budgets включно з Vue/Nuxt runtime / measurement plan | |
| Locales / default / locale source / optional i18n module + version | |
| Start / exclusive end / IANA timezone | |
| QA range та відмінності від production | |
| Eligibility / verification truth owner | |
| Trigger: mission або Client Action | |
| Повторна участь / reset / per-user caps | |
| Result/grant owner / rewards IDs | |
| Analytics status: planned/approved/live | |
| Stage/Production authorized scope із сесії | |

Описати одну user story для guest, unverified, eligible/available, exhausted, error та ended. Вказати, що показує UI та який server факт дозволяє participation. Перелік невідомих: питання → owner → потрібний доказ → незалежна робота, яка може тривати.

Не вставляти credentials або raw profile. Суміжні артефакти: [integration](integration-contract.md), [states](state-matrix.md), [assets](asset-register.md), [analytics](analytics-plan.md), [release](release-record.md).
