# Asset register — конкретна акція

| ID/роль | Source Figma node/file + version | Locale/state/platform | Delivery URL/path | Dimensions/DPR | Format/alpha | Transfer bytes | Decoded memory estimate | Load priority/fallback | Command/license/evidence |
|---|---|---|---|---|---|---|---|---|---|
| hero poster | | | | | | | | eager/high + video fallback | |
| hero video | | | | | | | | muted playsinline + poster | |
| decorative heading | | | | | | | | locale/mobile variants | |
| character/sequence | | | | | | | | static first, deferred motion | |
| button skin | | | | | | | | stretchable body + edge art | |
| games cards | category/CMS feed | | | | | | | visible/nearby only | |
| smoke fallback | | | | | | | | after hero; CSS/static tier | |
| font subset | license/source | | | | | | | display strategy/CORS | |

Decoded raster rough estimate: width × height ×4 bytes, плюс copies/frames/GPU overhead. Small compressed sprite/video не доводить low memory. Зафіксувати measured initial/eager transfer, later requests, cold/warmcache та realdevice performance. [Assets](../docs/08-figma-and-assets.md), [performance](../docs/11-performance.md).
