# QA App — <campaign-key> / <build-version>

**Мета:** підтвердити паритет із Web у реальному Swift WKWebView та React Native/Android WebView. Web success не означає App success.

## Дані

- Stage / canonical landing URL: `<urls>`
- Landing commit / served marker: `<sha/version>`
- iOS App build / OS / device: `<values>`
- Android App build / OS / device / WebView version: `<values>`
- Native integration/contract version: `<version/source>`
- Mission / Journey / creative / test bonus: `<QA identifiers>`
- Campaign timezone/reset / QA dates: `<values>`
- Fixtures: `<aliases + secure location, no passwords>`
- Нативні blockers / ще не підтримані capabilities: `<explicit list>`
- Аналітика: `<implemented native channel | not implemented>`

## Сценарії на обох ОС

| ID | Перевірка | Очікуваний результат | iOS / Android evidence |
| --- | --- | --- | --- |
| A01 | Guest/login/logout/account change/reopen | Правильний account; loading gate; stale responses не змінюють нового user | TODO / TODO |
| A02 | Verification/profile API із native session | Unverified actions відкривають native verification; opt-in не викликається; refresh після return | TODO / TODO |
| A03 | Available/consumed/pending/errors | Паритет agreed Web behavior; один request, disabled state, finite loader | TODO / TODO |
| A04 | Popup delivery і actual render | Native handshake **і** nonempty visible root; усі states/button combinations/locales | TODO / TODO |
| A05 | Claim/risk/close/result | Approved Journey semantics; test bonus issue once; Smartico reports не дублюються | TODO / TODO |
| A06 | Popup та Journey event-action navigation | Game/category/bonus/rules/auth routes відкривають правильний native screen; без Safari/непотрібного Web page | TODO / TODO |
| A07 | Midnight/DST/background/foreground/Back | Calendar reset timezone; refresh immediately; no rolling24h invention | TODO / TODO |
| A08 | Safe area/orientation/scroll/FAQ/host overlays | Читабельність, correct height/scroll owner; CTA доступні | TODO / TODO |
| A09 | Video cached/cold/autoplay/audio | Inline video, poster sync, user sound toggle, manual fallback | TODO / TODO |
| A10 | WebGL+fallback на actual GPU | Correct brand background, no seams/rectangles; failures keep readable content | TODO / TODO |
| A11 | Carousel/touch/lazy-load/reduced motion | Swipe/pause, bounded initial requests, no offscreen/background work | TODO / TODO |
| A12 | Analytics, якщо capability є | Обраний DOM/SDK/native contract з actual receiver; approved destination names/types без Firebase reserved prefixes; consent/dedupe; successful має authoritative source; інакше NOT_TESTED | TODO / TODO |
| A13 | Prerequisite/каса/повернення/повторні кліки | Missing prerequisite без consumption; delayed state reread; no popup burst; first tap і scroll після close | TODO / TODO |
| A14 | Clean popup release variant | Actual delivered Body/config; visible root і всі hit areas; no diagnostic observer dependency; passive close/X за contract | TODO / TODO |

**Popup діагностика:** engagement/socket event → popup URL → PAGE_READY → engagement → READY_TO_BE_SHOWN → impression → template compile/root/asset load. Завершений handshake не замінює render evidence.

**Navigation:** перевірити Smartico popup deep-link source і Journey socket deep-link source окремо; approved event-action dispatcher один. Не змінювати `dp:ok`/`dp:cancel` заради navigation.

## Результат

- iOS: `<PASS/FAIL/BLOCKED/NOT_TESTED + exact build/device>`
- Android: `<PASS/FAIL/BLOCKED/NOT_TESTED + exact build/device>`
- Докази: `<recordings/sanitized native+WebView logs>`
- Blockers / regression після fix: `<IDs>`
- QA owner/date: `<values>`

Не писати «App pass» на підставі browser preview, VM чи скриншота від іншого build. Повні критерії — [QA](../docs/13-qa.md) і [native WebView](../docs/07-native-webview.md).
