# Question map readability — 2026-10-30 UTC

Implementation: `4bd0bd7` (package version `0.1.0`). Images show this implementation in a production Vite build, Chromium `156.0.8078.4` headless, existing light theme. No user progress or real exam material was used.

All contexts start with new localStorage containing synthetic DEMO questions. The three-question scenario starts unanswered, selects one correct and one incorrect answer through the existing UI, and leaves the third unanswered. Its screenshots show the second question active after navigating back from All questions; existing answer feedback and difficulty filters remain visible. Map detail images are crops of the real sidebar, not mockups.

| Coverage | Result |
| --- | --- |
| Desktop 1280×1000, keyboard Tab/Shift+Tab, Enter, Space | PASS |
| Phone 390×844, mobile context and touch | PASS |
| Correct ✓, incorrect ×, unanswered — and matching legend | PASS |
| Active outline/aria-current; correct/incorrect feedback and score | PASS |
| Difficulty filter, empty filter, Show all, map back to Practice | PASS |
| Reset answers restores all three unanswered symbols | PASS |
| 1001-question synthetic map, all 1001 visible symbols checked | PASS |
| Sampled indices 1,9,10,99,100,999,1000,1001: no number/symbol clipping | PASS |
| Page width 320,390,600,900,1280,1440 px | No horizontal document overflow |
| JavaScript page errors | None |
| App unit tests / production build / high-severity audit | 9 passed / PASS / no known vulnerabilities |

The glyph is 14 CSS px; numeric labels and glyphs stack vertically so multi-digit indices retain space in the existing grid. Glyphs are decorative to accessibility APIs because the preserved button aria-label already states the answer state. Active selection and keyboard focus retain independent outlines.

Actual computed colors against each button background gave the following contrast ratios (numeric labels and glyphs share the color):

| State | Color | CSS grayscale |
| --- | ---: | ---: |
| Correct | 6.18:1 | 6.48:1 |
| Incorrect (active in screenshots) | 5.51:1 | 6.63:1 |
| Unanswered | 7.59:1 | 7.63:1 |

Active outline contrast: 6.19:1 to its button background. The separate keyboard focus outline was also checked against its background (>=3:1). Legend symbols were checked against the white card (>=4.5:1 in color and grayscale).

Each color/gray pair uses the same state and viewport; grayscale is an actual browser render with `html { filter: grayscale(1) }`. This is a CSS simulation, not a physical monochrome display test or a complete WCAG certification. Existing light theme only; no new theme added.

## Images

- `desktop-color.png` / `desktop-gray.png`: full synthetic desktop scenario.
- `phone-color.png` / `phone-gray.png`: full synthetic phone scenario.
- `desktop-map-color.png` / `desktop-map-gray.png`: close view of desktop map and legend.
- `phone-map-color.png` / `phone-map-gray.png`: close view of phone map and legend.
- `desktop-large-map-color.png` / `desktop-large-map-gray.png`: bottom of 1001-question desktop map.
- `phone-large-map-color.png` / `phone-large-map-gray.png`: bottom of 1001-question phone map.

The partial row at the top of a large-map crop is the existing scrollable map viewport; sampled complete buttons including index1001 fit without clipping. Local built UI is verified here. Public Pages delivery and its fresh runtime verification are recorded separately in issue #30 for the final pushed SHA.
