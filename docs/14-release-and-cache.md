# Git, публікація, кеш і доказ релізу

Реліз складається з перевіреної зміни, реальної deploy job і smoke опублікованого URL. Push, merged MR або зелений build окремо не означають, що користувачі отримали новий лендінг.

## 1. Спочатку підтвердити target repo

Базовий `landing_doc/CORPORATE-GIT-RUNBOOK.md` описує процес конкретного продукту. Для нового лендінгу фактичний target визначається його project brief та чинним delivery contract. Не копіюйте repo, гілку, job name чи public domain з попереднього проєкту без перевірки.

Перед зміною зафіксуйте:

| Поле | Source of truth |
| --- | --- |
| Git remote / project | `git remote`, target GitLab project |
| Source/base/target branch | Поточна branch policy та actual remote refs |
| Landing directory і public path | Repo config, наприклад `landings.json` |
| Vue/Nuxt versions, build та `dist` | Nuxt 4 + Vue 3 у manifest/lockfile; exact generate command, actual `.output/public` layout та CI mapping |
| CI generator/shared includes | `.gitlab-ci.yml`, generator, pinned shared library |
| Stage/Prod jobs і operator | Реальний pipeline, права та погоджений release scope |
| Domain/CMS placement | Actual product promotion config |
| Existing work | Git status/diff, інші authors/landings |

Перевірте доступ/VPN/Git identity до delivery deadline. User SSH key і deploy key — різні механізми; не створюйте нові ключі чи не змінюйте корпоративну auth схему без потреби.

## 2. Права та авторизація

Ця методологія не надає дозволу на push, merge, publish Smartico чи deployment. Scope визначається прямим запитом користувача, наявними session approvals і корпоративними правами.

- Вже погоджений Stage deploy у цій самій задачі не потребує повторного питання на кожний routine fix, якщо scope збережено.
- Stage authorization не означає Production authorization.
- Product/QA/Release рішення не можна підписувати за власника.
- Якщо потрібна нова дія або target, спершу підготуйте конкретний reviewable результат і поясніть відсутню авторизацію.
- Не обходьте protected branches, CI failures, review requirements або permission errors.

Handbook не є приводом додавати зайві ручні approval етапи, яких немає в чинному процесі. Водночас бажання «швидко показати на мітингу» не підміняє критичну перевірку auth, винагород і опублікованого build.

## 3. Ізоляція лендінгу і build

Лендінг збирається на **Vue 3 + Nuxt 4** за [технічним стандартом](00-technical-stack.md). Приклад manifest для repo, у якому build command виконується з landing directory, а `dist` задається від repository root:

```json
{
  "sample-promo": {
    "enabled": true,
    "path": "/sample-promo",
    "dist": "sample-promo/.output/public",
    "build": "npm ci && npm run typecheck && npm run generate"
  }
}
```

Schema та path semantics цього manifest — приклад: звірити actual generator до використання. `dist` вказує на generated output, а `build` — команду, яку чинний CI справді підтримує. Якщо встановлення/typecheck/generate уже окремі CI jobs, не дублювати їх у manifest; `build: static` тоді лише споживає готовий Nuxt artifact. Nuxt 4 та Vue 3 залишаються обов’язковим source stack.

`package.json`/lockfile, `app.baseURL`, actual generated entry/assets і deploy mapping мають збігатися. Перевіряти final artifact та URL на subpath; не припускати, що dev root, Nuxt server build або копіювання source folder замінюють static generation. Static hosting не виконує Nuxt server API і не змінює build-time public config через runtime environment.

Root public `path` у `landings.json` може бути **без** trailing slash за вимогами validator; canonical browser directory URL часто має **зі** slash. Це різні поля, не взаємозамінні правила.

## 4. Локальна перевірка перед MR

1. Переглянути `git status` і diff; не перезаписувати чужу незавершену роботу.
2. Оновитися від actual target branch за командною policy, вирішити конфлікти з урахуванням інших landings.
3. Виконати відтворюваний Nuxt typecheck/generate за lockfile; для pipeline, який споживає готовий static artifact, підтвердити попередню generate job та її SHA.
4. Перевірити manifest, actual output, subpath links, bridge checksum і meaningful regression tests.
5. Відкрити production preview на actual subpath, а не лише dev server root.
6. Оновити brief/contract/state/copy/QA/release record відповідно до зміни.
7. Перевірити staged files: без credentials, token logs, unused/raw assets, `node_modules`, випадкових build outputs чи приватних screenshots.

Приклад із методологією у `methodology/`:

```sh
node methodology/scripts/validate-landings-config.mjs . --landing sample-promo
# configured build виконується окремо з sample-promo/
node methodology/scripts/validate-landings-config.mjs . --landing sample-promo --require-dist
node methodology/scripts/validate-iframe-build.mjs . sample-promo
git diff --check
```

Ці structural validators не замінюють product Stage/API/native QA. Якщо вихідний package має власний `check.mjs` або tests, вони додаються за scope зміни.

## 5. MR і Stage pipeline

MR title/description мають описувати фінальну проблему та resulting behavior, точні validation і ризики. Не залишайте в описі початковий scope, якщо implementation змінився.

Типовий flow:

```text
source branch
 → MR / потрібний review
 → merge у Stage target
 → validation/security/build
 → generated child pipeline, якщо такий є
 → Stage deploy job
 → terminal success
 → served build / Stage smoke
```

Фактичний flow може відрізнятися: відкрийте `.gitlab-ci` і реальний pipeline. Не вгадуйте потрібну manual job із назви попередньої акції. Child pipeline може бути окремим від parent pipeline; deployment evidence містить обидва ID, якщо потрібно.

Job status `pending/running` не є успішним деплоєм. `Job succeeded` доводить завершення CI-кроку, після чого треба перевірити опубліковану сторінку й версію. Невдала job не «доробляється» локальним копіюванням на сторонній хост без погодження.

## 6. Canonical URL і збереження integration query

Перевірте direct URL та URL у CMS `iframe src`, включно з canonical trailing slash:

```text
https://landings.stage.example.com/sample-promo/
```

Directory redirect без slash може неправильно загубити query в конкретній інфраструктурі. Перевірте весь redirect chain та збереження `auth`, `locale`, `theme`, `parentOrigin`. Сам token **ніколи** не додається в URL.

Якщо query загубилося, виправте canonical embed URL або redirect config. Не компенсуйте це вигаданою guest/auth логікою в app-коді. При виправленні не змінюйте public URL без необхідності; stable URL важливий для вже підключених промо і native screens.

## 7. Кешування: окремо HTML і assets

| Ресурс | Рекомендований підхід | Що перевіряємо |
| --- | --- | --- |
| `index.html` | Revalidation policy, наприклад `Cache-Control: no-cache` | Реальні response headers та повторне мережеве завантаження |
| JS/CSS/media/font | Content hash або однозначна asset version | HTML посилається на нові URLs; старі лишаються доступні під час rollout |
| CMS embed URL | Стабільний canonical URL | Query не губиться, користувач не змушений редагувати URL |
| CDN | Scoped purge/revalidation за repo infrastructure | Edge повертає поточний HTML/assets |
| Service worker, якщо є | Version/update strategy host | Контрольована активація нової версії без змішаних bundles |
| WebView cache | App-owned policy/lifecycle | Actual App fetches correct served build |

`no-cache` дозволяє storage, але вимагає revalidation перед reuse; це не тотожне `no-store`. Нові server headers не стирають вже збережену стару відповідь у browser cache до її наступного network fetch. Семантика cache directives визначена у [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2).

Додайте public build marker або manifest із версією без секретів. На Stage після deploy звіряйте marker, asset references/hash, headers і фактичний iframe DOM. Date query на JS/CSS — допустимий простий варіант для static repo; content hashes краще захищають від випадкового reuse.

Не пропонуйте користувачу щоразу `?v=...` у CMS як основний release process. Це діагностичний/тимчасовий інструмент, якщо необхідність підтверджена. Основний fix — на стороні publication/cache/asset versions. Не змінюйте global CDN policy інших кампаній заради одного landing.

## 8. Stage smoke: direct URL та actual host

Перевірте:

- serving version відповідає released SHA/build;
- direct landing і product promotion відкриваються без missing assets;
- guest/auth/unverified/available/consumed states відповідно до scope;
- event actions доходять до потрібного host screen;
- mission read і popup rendering працюють у призначеному середовищі;
- height grow/shrink і host overlays;
- media/WebGL fallbacks, responsive UI, no console/runtime errors;
- змінена analytics, якщо канал уже реалізований;
- actual iOS/Android evidence окремо, якщо native scope входить до release.

Якщо native device ще не перевірено, запишіть `NOT_TESTED`, навіть коли Web успішний. Не називайте це підтвердженим паритетом.

## 9. Smartico publish — окремий реліз

Зміна файлів у landing repo не змінює creative body чи Journey у Smartico. Release record має містити template/creative/mission/Journey version та реальні publish steps, якщо вони входять у scope.

Після публікації template:

1. Отримати actual published body/config і звірити з reviewable source.
2. Прогнати actual engine compile/render matrix.
3. Перевірити assets/font URLs із реального popup origin.
4. Перевірити branch actions та close semantics.
5. Перевірити actual Web/App rendering; handshake/impression не замінює render evidence.

Нова frontend date чи countdown не змінює backend recurrence. Новий asset URL не гарантує, що creative/config уже використовує його.

## 10. Production, rollback і закриття

Production target, topology і operator визначаються чинним процесом. Потрібні Stage QA exact build, явний дозволений scope та права. Не виводьте Prod approval із попереднього Stage deploy або зі слова «завантажимо в Git».

Перед Prod зафіксуйте last-known-good build, rollback owner, спосіб відновлення landing **і** Smartico config. Після deploy повторіть public URL/version/primary journey/cache smoke. На Critical/Blocker уповноважений owner обирає rollback/hotfix; рішення та repeat evidence фіксуються.

Для видалення landing у сховищах з `enabled`/remove job зазвичай спочатку disable зі збереженням config, потім removal job і cache verification, лише потім видалення source окремою зміною. Спочатку перевірте actual generator contract.

Заповніть [release record](../templates/release-record.md): source commit, merge commit, pipeline/job, serving marker, QA results, Smartico publish, невирішені native/analytics питання. «Задеплоєно» у фінальній відповіді має спиратися на ці факти.

## Джерела

[landing_doc](https://github.com/onlineTeran/landing_doc/) — `CORPORATE-GIT-RUNBOOK.md`, `IFRAME-LANDING-RUNBOOK.md`, `framework/QA-RELEASE.md`. Чинний target repo та його CI мають пріоритет для операційних деталей. Приклади cache policy узагальнюють підтверджені Stage інциденти, а не гарантують однакову інфраструктуру всіх продуктів.
