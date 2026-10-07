# Release record — <campaign-key> / <version>

## Scope та авторизація

- Target: `<Stage | Production>`
- Погоджений scope, джерело дозволу/owner/date: `<reference>`
- Repo / landing dir / public path / build / dist: `<values>`
- Source branch / target branch / MR: `<values>`
- Зміна поведінки: `<короткий before/after>`
- Native code/template/mission changes у scope: `<yes/no + details>`
- Nuxt delivery: `<static generated | погоджений SSR + hosting contract>`

## Exact версії

| Артефакт | Ідентифікатор / evidence |
| --- | --- |
| Source commit | `<SHA>` |
| Vue 3 / Nuxt 4 / TypeScript actual versions | `<exact versions>` |
| Node.js / package manager actual versions | `<exact versions>` |
| Lockfile path / checksum / source commit | `<values>` |
| Exact install/build command / working directory | `<values>` |
| Actual build output directory / CI artifact mapping | `<values>` |
| Campaign subpath / configured Nuxt base path / asset base URLs | `<values>` |
| Merge/release commit | `<SHA>` |
| Parent pipeline | `<URL/ID>` |
| Child pipeline, якщо є | `<URL/ID>` |
| Deploy job + terminal result | `<URL/ID + succeeded/failed>` |
| Serving marker / asset versions | `<values>` |
| Canonical bridge version/checksum | `<values>` |
| Smartico template/creative publish | `<IDs/version/actual-body verification or not changed>` |
| Mission/Journey/bonus config version | `<mapping/record or not changed>` |

## Перевірка

- Local build/validators/meaningful tests: `<commands + results>`
- Generated/SSR output + hydration/loading state: `<exact build/evidence/status>`
- Vue/Nuxt runtime та initial chunks у JS budget: `<target/actual/conditions>`
- Stage Web QA: `<exact build, owner, evidence, status>`
- Actual iOS QA: `<device/build/evidence/status>`
- Actual Android QA: `<device/build/evidence/status>`
- Analytics: `<delivery confirmed | not implemented | contract pending>`
- Canonical URL/query/redirect: `<evidence>`
- Direct campaign subpath + iframe entry + asset/chunk URLs: `<evidence>`
- HTML cache headers / asset cache / CDN: `<evidence>`
- Product iframe actual served build: `<evidence>`
- Primary action/mission/popup smoke: `<evidence>`
- Secrets/PII review: `<result, no payloads attached>`

## Відновлення та залишкові ризики

- Last-known-good landing build: `<version/SHA>`
- Last-known-good Smartico config: `<version/reference>`
- Rollback operator/procedure: `<values>`
- FAIL/BLOCKED/NOT_TESTED: `<specific items>`
- Approved waivers: `<owner/scope/date, if any>`
- Final status: `<deployed-and-smoked | deployed-awaiting-QA | blocked | rolled-back>`

Stage deploy не є Production approval. Merged MR не є deploy. Template source commit не є Smartico publication. Посилання: [обов'язковий stack](../docs/00-technical-stack.md), [release guide](../docs/14-release-and-cache.md).
