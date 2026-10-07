# Навчальний комплект Smartico Popup

Повний узгоджений приклад для вивчення Configuration → Body → creative values. Файли віддаються у відповідні поля **Smartico template та creatives**; це не незалежна модалка лендингу і не новий native bridge.

| Файл | Призначення |
|---|---|
| [configuration.json](configuration.json) | BO-поля, optional blocks, defaults |
| [body.html](body.html) | Smartico `tmpl` Body, responsive CSS, action hooks |
| [values.choice.uk.json](values.choice.uk.json) | Дві кнопки + X + icon, fullscreen-вміст |
| [values.information.en.json](values.information.en.json) | Одна кнопка продуктової навігації, англійський copy |
| [values.notice.uk.json](values.notice.uk.json) | Повідомлення без primary/secondary, із явним X |
| [check.mjs](check.mjs) | Перевірка даних і фактичного compiler; не SDK simulator |
| [compiler-report.json](compiler-report.json) | Збережений local fixture report 05.10.2026, із engine/Body hash та межами перевірки |

Це CSS/system-font skin без графічного брендингу. Для [Figma-сценарію](../from-figma.md) заміни skin/resources і точний copy за nodes. Для [проєктування за брифом](../from-brief.md) спочатку визначи структуру й поведінку. `information`, `choice`, `notice`, `layout` та всі field names — custom поля цього прикладу.

## Підготовка до BO

1. Заміни `cdn.example.test` ресурсним origin і `product.example.test` продуктовим origin. Вони навмисно не працюють як production assets/routes. Зміни origins і exact route/query allowlist у `check.mjs` відповідно до підтвердженого контракту; у прикладі дозволений лише `/event_action/bonuses` без query/hash. Asset URL і navigation route — різні списки; credentials у них заборонені.
2. Встанови approved copy, locales, icon sizes/alt, типові довгі labels та visual states. Generic fallback «Інформація» потрібний для безпечного рендеру minimal params; release fixture вимагає explicit title.
3. Підтвердь exact engagement actions у Journey. `dp:ok`/`dp:cancel` тут — навчальні controls, їхній business effect не закодований. X використовує `dp:close`, як у [офіційному custom-popup прикладі](https://help.smartico.ai/welcome/products/crm-automation/communication-channels/pop-up); він не claim-ить винагороду. Actual host/connector behavior перевіряється у вашій інтеграції. CTA `dp:go` використовує `event_action/bonuses`; маршрут і native dispatcher перевіряються для вашого продукту.
4. Перевір фактичний serialized params із BO. Приклад очікує string text/image/url fields і optional objects `{ "checked": true/false }`. Відсутній optional block вимкнений; `checked:false` не замінюється default. Типи й shape адаптуються до вашого підтвердженого payload.
5. Перевір outer host. `layout=fullscreen` заповнює доступний view; не змінює SDK/native frame bounds. Focus trapping, restore focus, backdrop/Escape/Back належать узгодженому host. `role=dialog` сам цього не забезпечує; `aria-modal` додавай лише після підтвердження modal behavior.

Приклад не встановлює глобальні styles, не викликає SDK вручну і не генерує win/grant. Живий label і href escaped, але escaping не дозволяє довільні URL schemes. Approved values проходять action/asset validation до BO. Raw Smartico fields від редактора теж мають відповідати цьому контракту.

Нуль основних кнопок не означає відсутність шляху виходу: `notice` має X. Matrix compiler також тестує без X, але такий production state потребує перевіреного host dismiss/automatic next-step, щоб не замкнути користувача. Popup title IDs припускають один активний creative у document; інший host layout потребує namespace.

## Actual compiler check без npm-залежностей

У repository конкретної акції збережи **довірений runtime engine** із [Smartico runtime](https://libs.smartico.ai/jsi/js/tmpl.min.js), зафіксуй URL, дату і hash. За відмінного доставленого wrapper використовуй саме його перевірену версію. Скрипт виконує цей JS локально; довільний файл із неперевіреного джерела не підходить.

Приклад завантаження у fixture folder конкретного repo:

```sh
mkdir -p fixtures/smartico-runtime
curl --fail --location https://libs.smartico.ai/jsi/js/tmpl.min.js --output fixtures/smartico-runtime/tmpl.min.js
shasum -a 256 fixtures/smartico-runtime/tmpl.min.js
node smartico-popups/examples/check.mjs "$PWD/fixtures/smartico-runtime/tmpl.min.js"
```

Остання команда запускається з root цього playbook. Engine окремо завантажується тільки для development; не додається другим SDK до popup. Для offline перевірки передай absolute path уже збереженого trusted engine. Файли прикладу не змінюються скриптом.

Checker читає Body через `tmpl('_template', params)`, 3 creative fixtures, 96 state/locale/layout/button/X combinations, malformed flags, minimal params, safe interpolation й `%}` regression. Він перевіряє Configuration-key parity та приклад allowlisted routing. Report містить engine/Body SHA-256 і bytes. Minify/export змінив Body — повтори перевірку кінцевого файла; DOM preview із ручною підстановкою не замінює compiler.

## Межі перевірки та завершення

Node VM з маленьким `document.getElementById` fixture перевіряє compilation/markup, без layout і network. Він не доводить focus, CORS/CSP, click handling SDK, grant, iframe bounds або роботу native bridge. Навіть compiler PASS із deprecated engine не гарантує відповідність нинішній доставці; engine/hash треба звірити.

Завантажити Configuration і Body у цільовий Smartico template, створити creatives, зіставити кожне поле values, re-open saved source, звірити hash, прив'язати actual creatives до Journey та пройти [delivery/QA contract](../implementation-contract.md). Якщо BO не підтримує JSON import values, заповнити поля вручну з цього реєстру й порівняти delivered params.

Типовий release запис: «compiler PASS, engine/hash …; Web Stage/build … PASS; iOS/build … pending; Android/build … PASS». Назви Smartico/SDK у цьому developer README допустимі, у production player copy — ні. Навчальний copy `values.choice.uk.json` замінюється до публікації.
