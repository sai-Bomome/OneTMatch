# OneT Match game-feel test

## Intent and boundaries

Gentle, tactile, readable connections with immediate command response. Preserve the fixed board, primitive silhouettes, both path animations, existing generator and all saved tuning. No camera movement, global flashes, new progression economy, external package, or change to classic route/mistake rules.

## Ownership and lifecycle

- `engine.mjs` owns route validity and deterministic board construction; it is unchanged.
- `session.mjs` applies an immutable match transaction, classifies denial, finds a safe tiny ending where possible and provides grid navigation.
- `app.mjs` owns the authoritative cells and history. It commits successful matches and counters before starting visuals. The retained `activeMatch` event supplies the two outgoing visual tiles. Input may select the next tile while visuals play, but additional matches serialize for path readability.
- `presentation.mjs` owns cancellation of waits and Web Animations. Cancelling presentation never changes a committed match. Undo restores a snapshot explicitly; restart creates a fresh session.
- `feedback.mjs` supplies procedural geometry, durations, keyframes and stagger. CSS handles static states and path rendering.
- Cancellation scopes and the session epoch prevent late completion from affecting a different board. Pause settles any committed match; Resume continues from that state. Resize settles a path whose geometry is no longer current.
- The rendered tile buttons persist across selection, hint, counter updates and ordinary matches. Only changed identities replace icon markup. Keyboard focus and pointer target positions remain stable.

## Feedback vocabulary

| Event | Primary response | Optional sound | Fallback |
|---|---|---|---|
| Select | Fixed outline, small child-visual emphasis, selection outline | Short tick | Static outline |
| Select during match | Dashed selection outline | Same selection tick | Static queued state |
| Match committed | Counters update; endpoints connect and dissolve | Two soft tones | State/counter update without travel |
| Identity mismatch | Both visual faces shake together and receive a solid local outline | Muted low cue | Explanation in live status |
| Blocked route | Both visual faces shake together and receive a dashed local outline | Muted low cue | Explanation in live status |
| Newly exposed | Small child-visual toss and flip | None | Readable exposure shade |
| Final pairs | Explicit finishing status, serial ordinary match visuals | Ordinary match cue | Immediate legal clears |
| Completed | Accurate summary, small icon arrival and two local glints | Quiet three-note resolution | Static summary and Next board |
| Pause/result panel | Fade with matching exit | None | Immediate swap |

No animation changes hit-target positions. Enclosure is a visual cue only, not a disabled rule state. Tile labels name color, shape and type; numbers remain an optional identity fallback.

## Tuning

User controls remain under Display & play. New Sound cues and Sound volume persist with the other preferences; sound defaults off, volume 25%.

`feedback.mjs` has base drawing/overlay/shrink durations 280/145/210 ms, rates 1050/1950/1425 px/s, overlay pause/hold 30/80 ms, removal 130 ms and exposure 360 ms. The path-speed multiplier scales drawing/overlay/shrink. Removal overlaps the start of shrinking and CSS receives the same removal duration.

`app.mjs` uses intro duration/stagger 360/320 ms and shuffle 260/180 ms. More than three simultaneous exposures shorten the flip duration to 80%. Cover entry/exit are 180/130 ms. Completion accent is local and nonblocking. Endgame handoff starts after 180 ms, then uses 90 ms between automatic matches; a player selection cancels the handoff.

The sound adapter caps four voices, throttles same-event cues within 75 ms, uses quiet sine tones and stops voices on cancellation. It unlocks after a user gesture and tolerates unsupported/suspended audio. Imported AudioClips were not altered or wired by this implementation.

## Validation on 2026-11-03

- `node --check app.mjs` and `node --check presentation.mjs` passed.
- `node --test tests/*.test.mjs`: 22 tests passed. Added checks for immediate immutable match resolution, duplicate-cell prevention, denial reasons, three-pair safe endings, keyboard neighbors, cancellation, unavailable animation APIs, reduced-motion waits, animation rejection, and accessible color identities.
- Browser: first-visit rules dismissal followed by board reveal; 8x8/30-type seed 1083 completed through the Solution tool and final three auto-clears, reaching 32/32 and a correct result summary.
- Browser: 0.25x trace visibly retained two outgoing tiles while counters already showed the clear; a different tile acquired the queued selection outline; a moving head was present.
- Browser: Undo and Pause during an animated match removed stale paths and outgoing visual tiles while preserving/restoring the appropriate committed state.
- Browser: mismatch marked both attempted tiles; five wrong moves opened Out of tries; Retry reset to 0 pairs and 5/5 tries.
- Browser: both path styles and sound toggle ran without console errors. Audio loudness/character has not been assessed by listening.
- Not yet measured: real phone touch accuracy, low-end frame times, ten-minute feedback fatigue, screen-reader usability and OS reduced-motion appearance. Reduced-motion control paths have unit coverage.

## Manual acceptance checklist

1. Make a match and immediately select another tile: the queued selection outline remains visible until the route settles; finish that next pair afterward.
2. Undo, Pause, Replay, or generate a different board during a slow path. No stale route, disappearing new tile, or duplicate match may remain.
3. Navigate with arrows, select with Enter/Space, clear with Escape. Selection/hints must not destroy focus.
4. Try a mismatch and a matching-but-blocked pair. Both endpoints and the live status should explain the reason; only one try is spent.
5. Compare both themes, all reveal directions, sound off/on, no paths, and OS reduced motion. Gameplay must remain understandable.
6. Finish a board, retry a lost board, and generate the next one. Compare counters and available tools with the actual state.

Invalid-pair vibration uses `INVALID_KEYS` and `FEEDBACK.invalidMs` (240 ms) in `feedback.mjs`. Both tile visual faces shake together; button hit targets stay planted. Reduced-motion mode retains the static outlines and status explanation. No state text badges are rendered on tiles.

Newly free tiles retain the enclosed gray background while their icon rotates 360 degrees, shrinks to 50% and grows back to full size. Only after the icon settles does the background transition to its free appearance. Timing remains `FEEDBACK.flipMs`; reduced motion settles immediately.

Exposure presentation holds newly exposed tiles in their prior gray state for the entire blocker-removal sequence, then hands directly to the gray-backed unlock animation. Immediate rules-state changes cannot briefly reveal the free background before animation.
