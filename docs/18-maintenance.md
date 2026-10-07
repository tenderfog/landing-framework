# Як підтримувати інструкції та повторно використовувати досвід

## Версія й adoption

Зберігати пакет як reviewed Git tag/commit. Landing repo містить посилання/копію/submodule відповідно до CI доступу; під час кампанії не оновлювати methodology випадковим pull. `AGENTS.md` у landing root вказує entrypoint та project overrides. Portable skills читаються з пакета або встановлюються окремо за рішенням команди; їх наявність у Git не означає глобальне auto-discovery.

## Джерела змін

Новий реальний інцидент додається спочатку як case evidence: environment, build/version, platform/device, reproduction, observed symptom, exact cause confidence, fix, tests, scope. Після незалежної перевірки переносити правило у відповідний doc; не копіювати весь чат.

Не перетворювати випадкові dates/mission IDs/colors у global defaults. Наприклад «description16/24» — підтверджений дизайн одного template, а універсальний закон — tokens із approved Figma. `alpha:false` у smoke одного build не доводить найкращу performance кожного GPU.

## Зміна API/host

Для нового bridge message/native capability/Smartico schema потрібні owner, version, consumer, rollout, fallback та tests. Відредагувати sources, integration template, doc, examples і QA разом. Old snapshots лишаються історією, не інструкцією використати deprecated method.

Новий Client Action name сам по собі не вимагає нового App release, якщо transport та generic dispatcher уже підтримані. Новий тип native event action, RPC чи popup capability може вимагати App/host update. Фіксувати цю різницю, а не обіцяти «будь-яка акція автоматом».

## Review нового знання

1. Який конкретний вибір наступного агента змінює це правило?
2. Чи підтверджена його applicability для Web і/або App?
3. Чи є primary source або відтворюваний доказ?
4. Чи конфліктує воно зі чинним product contract?
5. Чи вистачить прикладу/optional recommendation замість MUST?
6. Чи не дублює воно інший doc і не приховує permission boundary?

## Перед upload до Git

Перевірити внутрішні links/examples/scripts, прибрати приватні artifacts/secrets/temp paths, звірити visibility repo, додати owner і reviewedversion. Публічна версія використовує умовні IDs та domains; приватні джерела й конкретна entity map лишаються в project kit з відповідним доступом. Не додавати productionassets тільки для прикраси документації. Публікацію у Git виконувати в межах запиту користувача за вказаним repo/visibility.
