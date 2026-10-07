# Відео, анімація та WebGL з контрольованими fallback

Медіа має покращувати композицію без залежності продуктової функції від GPU, autoplay або конкретного браузера. Статичний контент, кнопки, mission state і navigation працюють навіть тоді, коли анімація повністю недоступна.

Пов'язані документи: [асети](08-figma-and-assets.md), [адаптивна верстка](09-responsive-ui.md), [performance](11-performance.md), [native WebView](07-native-webview.md), [QA](13-qa.md). Приклади нижче — схеми компонентів, які потрібно адаптувати до чинного host contract; вони не є SDK для копіювання без перевірки.

## 1. Обирати найдешевше достатнє рішення

| Рішення | Коли підходить | Що рахувати | Fallback |
|---|---|---|---|
| CSS transform/opacity | Pulse, легкий hover scale, float, crossfade | Layers, repaint, CSS bytes, infinite duration | Static state, reduced motion |
| Коротке MP4/WebM | Складний рух персонажа/світла без обов'язкової alpha | Bytes, codec/decode, audio, poster, framing | Artwork poster + ручний Play |
| Animated image | Простий короткий alpha loop з малою пам'яттю | Frames, decoded memory, підтримка, контроль pause | Окремий static frame |
| Frame sequence / atlas | Потрібні alpha і точний frame control | Сума файлів, requests, memory, texture sizes | Перший/погоджений static кадр |
| Canvas/WebGL shader | Procedural smoke/particles, raster має шви або надмірну вагу | GPU time, pixels, FPS, shader complexity, lifecycle | Static SVG/raster/CSS |

Three.js потрібний, якщо реально потрібна сцена/камери/геометрія/матеріали з його можливостями. Для одного fullscreen quad і невеликого smoke shader достатньо native WebGL. Менший JS не гарантує менше GPU-навантаження: shader може бути дорожчим за картинку.

Для slot записати коротке рішення:

```text
Purpose: декоративний рух диму після hero
CSS candidate: не дає потрібної турбулентності, bytes ___
Raster candidate: ___ bytes, edge/crop issue ___
Shader candidate: ___ JS gzip, ___ pixels, ___ draw FPS, GPU ___ ms
Chosen: ___; fallback: ___; reduced motion: ___; tested devices: ___
```

Заповнити фактичні значення; порожні поля не вважаються виміром.

## 2. Hero video: доставка

Зберігати original video master окремо. Delivery кодек і розмір обирати за фактично підтриманими iOS/Android/WebView; часто H.264 MP4 + AAC для звуку є базовим варіантом, а WebM — додатковим після перевірки. Встановити `yuv420p` для широкої сумісності звичайного відео. Video з alpha потребує окремого codec/platform contract; чорний фон у MP4 не є прозорістю.

Приклад відтворюваного encoding, не універсальний quality preset:

```sh
ffmpeg -i source/hero-master.mp4 -c:v libx264 -preset slow -crf 21 \
  -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart assets/hero.mp4
```

Перевірити dimensions, duration, frame count/FPS, loop seam, звук, повний decode без помилок. Якщо source 24 FPS і його достатньо, не робити 60 FPS заради цифри. `faststart` переносить MP4 metadata вперед; delivery server також має віддавати правильний MIME, range requests і кешування. Poster + video рахуються разом, навіть якщо кожен окремо малий. [FFmpeg MOV/MP4 muxer](https://ffmpeg.org/ffmpeg-formats.html#MOV_002fMPEG_002d4_002fISOMBFF-muxers).

Не crop-ити відео, якщо це відріже ключового персонажа або змінить затверджену композицію. `cover`/`contain`, desktop/mobile media ratios і fading edges визначити з дизайном. Desktop poster і mobile poster можуть бути різними Figma assets.

## 3. Autoplay і звук

```html
<div class="hero-media">
  <picture id="hero-poster">…</picture>
  <video id="hero-video" muted playsinline webkit-playsinline loop
         preload="metadata" aria-hidden="true">
    <source src="./assets/hero.mp4" type="video/mp4">
  </video>
  <button type="button" id="hero-play">Відтворити відео</button>
  <button type="button" id="hero-sound" aria-pressed="false">Увімкнути звук</button>
</div>
```

Приклад не містить `autoplay` навмисно: якщо потрібно не завантажувати/не запускати video при reduced motion або ощадному режимі, policy потрібно визначити до підключення source/play. Якщо `autoplay` уже в HTML, ранній запуск може статися до JS. Встановити `.muted=true` також у контролері, не покладатися на зміну лише атрибута.

Muted inline playback може бути дозволений, але `play()` усе одно може бути відхилений policy або налаштуваннями host. Обробити promise і показати manual Play без нескінченного retry. Звук вмикати тільки з прямої дії користувача; UI label/`aria-pressed` синхронізувати з фактичним `video.muted` і результатом play, не лише з наміром натиснути кнопку. [WebKit video policies](https://webkit.org/blog/6784/new-video-policies-for-ios/), [MDN play()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play).

У Swift/WKWebView App-команда має підтвердити inline media configuration і user-action policy. У React Native перевірити саме встановлену версію `react-native-webview`, `mediaPlaybackRequiresUserAction` та, для iOS shell, `allowsInlineMediaPlayback`; WebView props не замінюють HTML `playsinline`. На Android оцінити hardware layer і фактичний system WebView, без глобального вимкнення GPU заради одного дефекту. [React Native WebView Reference](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md), [WKWebView documentation](https://developer.apple.com/documentation/webkit/wkwebview).

## 4. Poster не має лишатися поверх уже працюючого відео

`loadedmetadata` підтверджує metadata, не видимий кадр. `canplay` не означає, що autoplay уже почався. Покладатися лише на `window.onload` або лише на майбутній `playing` — баг: cached video може вже грати до реєстрації listener, тому постер не зникне.

Порядок:

1. Зареєструвати `playing`, `error`, `emptied`, `volumechange` і lifecycle listeners.
2. Після init відразу синхронізувати вже наявний стан відео.
3. При `playing`/успішному play перевірити first frame; якщо доступний `requestVideoFrameCallback`, він дає точніше підтвердження кадру, переданого на композицію.
4. Fallback: `readyState >= HAVE_CURRENT_DATA`, `!paused`, `!ended`, без error; використовувати разом із playing/initial sync.
5. Лише тоді сховати poster і manual Play.
6. При error/emptied/заміні source повернути poster; при background pause не накривати вже показаний кадр без причини.

Схема, що враховує cached playback і stale callback:

```js
let sourceGeneration = 0;

function revealFrame() {
  if (video.error || video.paused || video.ended || video.readyState < 2) return;
  poster.hidden = true;
  playButton.hidden = true;
}

function syncFrame() {
  if (video.error || video.paused || video.ended || video.readyState < 2) return;
  const generation = sourceGeneration;
  if (typeof video.requestVideoFrameCallback === 'function') {
    video.requestVideoFrameCallback(() => {
      if (generation === sourceGeneration) revealFrame();
    });
  } else revealFrame();
}

video.addEventListener('playing', syncFrame);
video.addEventListener('emptied', () => { sourceGeneration++; poster.hidden = false; });
video.addEventListener('error', () => { sourceGeneration++; poster.hidden = false; });
syncFrame(); // Потрібно навіть якщо playing вже відбувся до init.
```

У повному компоненті обмежити один pending frame callback, cancel при source change/dispose, синхронізувати play/sound/error controls. При rejected play показувати poster/manual Play, якщо кадр ще не показано. [MDN requestVideoFrameCallback](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback).

QA обов'язково має cold load, warm cache reload, повільну мережу, blocked autoplay, reduced motion, App foreground/background та source error. Перевірка одного першого відкриття не ловить cached poster race.

## 5. Універсальний lifecycle

Компонент рухається лише коли всі потрібні умови true:

```text
document visible
AND host screen active
AND section sufficiently visible
AND motion allowed by user preference
AND renderer/media healthy
AND no explicit user pause
```

`document.visibilitychange` зупиняє роботу в прихованій вкладці; App може мати іншу модель lifecycle. Native host передає погоджений active/inactive сигнал через існуючий адаптер, якщо web visibility сама цього не відображає. Не вигадувати назву bridge-повідомлення. [MDN visibilitychange](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event).

IO перевірити в реальному iframe, який скролить parent. Observer на всю дуже довгу smoke container може лишатися видимим майже всю сторінку; це не дає section-level економії. Для складних сцен оцінювати активний slice/host viewport contract, без untrusted читання cross-origin parent DOM. [Responsive UI](09-responsive-ui.md) пояснює lazy/IO границі.

На `pagehide` зупинити RAF/video/pollers. Для bfcache `pageshow` відновити стан і заново прочитати актуальний час/visibility. Не знищити controller без можливості відновлення, якщо page persisted. Cleanup від'єднує observers/listeners, cancels frame callbacks, видаляє непотрібні WebGL programs/buffers/textures; кілька повторних заходів не створюють кілька loops. Animated `<img>` не має універсального pause API: для статичного режиму використовувати окремий static source, а не припускати, що CSS `display:none` обов'язково зупинить decode.

## 6. Дим: дизайн до шейдера

Спочатку зафіксувати appearance contract:

- Base background збігається з host/landing theme, явно заданий.
- Дим слабший за контент: видно фактуру, але title/CTA не втрачають contrast.
- Сірий та синюватий шари мають конкретні зони й співвідношення з Figma, а не uniform gray fog.
- Density, drift speed, blur/detail, fade top/bottom і width мають reference screenshots.
- Дим належить конкретній content-wrapper після hero, щоб не потрапляти під відео.
- Немає жорстких прямокутних країв на orientation, ширині та dynamic content height.

Кількість smoke octaves/layers не замінює художню перевірку. Часто достатньо кількох low-frequency layers і невеликого detail; не підвищувати opacity всієї сцени лише щоб «було видно анімацію». Рух має бути з кількома відмінними швидкостями/напрямами, а не очевидне плавання одного bitmap.

## 7. Dark base і WebView compositing

Observed failure mode: анімація в App працює, але замість чорного тла видно сіро-синю opaque площу/смуги. Не припускати автоматично, що shader не запустився. Спочатку розділити:

1. Base html/body/content-wrapper background.
2. Canvas context alpha/premultiplied alpha, CSS opacity і blend mode.
3. Shader RGB та output alpha.
4. Mask/fade/fallback DOM.
5. Native WebView background/layering.

Для диму на однотонному темному background надійний кандидат — композитувати колір усередині shader та виводити alpha 1:

```glsl
vec3 base = vec3(5.0, 5.0, 8.0) / 255.0; // Приклад, взяти theme token.
vec3 smokeColor = mix(graySmoke, blueSmoke, blueRegion);
float density = clamp(smokeMask * smokeDensity, 0.0, 1.0);
gl_FragColor = vec4(mix(base, smokeColor, density), 1.0);
```

Такий підхід підходить тільки для однорідного backdrop. Якщо потрібно бачити довільний арт під smoke, потрібна коректна прозора композиція та її native QA; не замінювати artwork темним прямокутником.

На html/body і wrapper лишається той самий opaque background незалежно від renderer. Host native view також має погоджений колір, особливо при loading/scroll overscroll. Не покладатися на те, що веббраузер і WKWebView підкладуть однаковий колір під transparent content.

`getContext('webgl', {alpha:false})` може бути перевіреним варіантом у конкретному кейсі, але не універсально швидким: MDN описує можливу вартість емуляції opaque backbuffer. Порівняти з alpha-enabled context і alpha=1 output на цільових GPU. Параметри context не перемикаються повторним `getContext` на тому самому canvas; потрібні окремі test fixtures/instances. [WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices), [getContextAttributes](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getContextAttributes).

## 8. Fallback tiers і capability detection

Сторінка відразу має добрий static fallback. WebGL — enhancement після підтвердженого success, а не причини для порожнього екрана.

| Tier | Умова | Результат |
|---|---|---|
| WebGL | Context created, shader compiled, program linked, перший draw успішний | Procedural motion або static shader frame при reduced motion |
| SVG/raster | Context/shader/runtime unavailable | Перевірена легка static smoke texture; optional CSS drift за policy |
| CSS | SVG/filter/file failed або занадто дорогий | Static gray/blue gradients на theme background |
| Base only | Навіть fallback заважає читабельності/performance | Однорідний theme background, увесь продукт доступний |

CSS fallback може бути в DOM до JS. `data-renderer="webgl"` ставити лише після першого успішного draw; до цього не приховувати fallback. На shader compile/link перевірити status і контрольовано перейти у fallback. Розробницькі logs не виводити користувачу і не включати tokens.

Не робити UA/version sniffing як доказ WebGL support. `getContext` може повернути null на браузері, який номінально підтримує API; GPU blocklist, memory та native settings змінюють результат. Feature-test `ResizeObserver`, IO, media-query listener, frame callback і precision; unsupported observer не має ламати всю сторінку.

`webglcontextlost`: cancel RAF, зняти renderer flag, показати fallback. `preventDefault()` потрібний, якщо планується restoration; він сам не відновлює program/buffer/uniforms. При restored або один раз rebuild усі resources, або лишити fallback до наступного входу. Не нескінченно retry compile. `WEBGL_lose_context` можна використати у QA для simulated loss; real device loss тест окремий. [WEBGL_lose_context](https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context).

## 9. Межі GPU-навантаження

Рекомендовані стартові налаштування для легкої декоративної сцени, які треба виміряти й адаптувати:

- Mobile draw FPS приблизно 10–16; desktop 16–24, якщо візуально достатньо.
- Обмеження canvas pixels, наприклад 150–250 тис. mobile, 250–500 тис. desktop; це не фінальний бюджет для всіх сторінок.
- Внутрішня resolution може бути нижчою за CSS box: smoke low-frequency, не текст. Не множити її сліпо на DPR3.
- Один quad, небагато noise octaves, без depth/stencil/MSAA, якщо не потрібні.
- Shader/texture allocations — на init/resize, не кожен frame.
- Delta time capped після background, щоб повернення не стрибало.
- Resize агрегований; RAF loop один, зупиняється offscreen/hidden/paused.

Схема bounding внутрішнього canvas:

```js
const pixelBudget = isCompact ? 180_000 : 320_000; // Стартове значення.
const scale = Math.min(1, Math.sqrt(pixelBudget / (cssWidth * cssHeight)));
canvas.width = Math.max(1, Math.floor(cssWidth * scale));
canvas.height = Math.max(1, Math.floor(cssHeight * scale));
```

Не потрібно перетворювати ці прикладні цифри у mandatory global policy. Великі довгі containers можуть дати погану quality через надто малу вертикальну resolution; вирішувати локальними сценами або viewport-aware field, а не безмежним pixelBudget.

Profiler на середньому/слабкому mobile, кілька хвилин активності, frame duration, dropped frames, GPU/CPU, нагрів, battery/decode symptoms і input response визначають прийнятність. Якщо профіль поганий, спершу зменшити pixels/complexity/FPS, потім лишити static fallback. «Шейдер займає 6 KB» не доводить дешеву анімацію.

## 10. Motion accessibility і приймання

Reduced-motion міняє renderer policy, не тільки прибирає одну CSS animation. Static first frame/poster, manual Play, зупинений carousel і pulse мають працювати як повна сторінка. Для тривалого автоматичного руху з суттєвим visual content надати явний pause/stop за [WCAG Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

Матриця приймання: web Chrome/Safari/Firefox за контрактом, реальний Swift WKWebView, реальний Android RN WebView; кожен cold/warm, portrait/landscape, reduced motion, background/foreground, slow network, autoplay reject, file error, shader compile failure, context loss. В proof вказати device/OS/App build/WebView, renderer tier, dimensions, FPS і фактично перевірений scope. Chrome з mobile viewport не записувати як iOS pass.
