# OneT Match workbench

Standalone classic Onet animal-match mechanics with colored primitive shapes in place of animal art. Owned entirely by this folder; no Unity or Bouquet dependency.

## Run

Double-click `Start.cmd`, or run `python server.py` then open http://127.0.0.1:5188/. Python 3 and a modern browser are sufficient. Localhost-only by default. `npm test` (or `node --test tests/*.test.mjs`) runs the rule/generation checks; no npm install required.

## Rules and controls

Match identical shape-and-color types along an empty orthogonal path of at most two turns. A one-cell outside lane is allowed. Tiles stay in place after a match. Clear the board to win. This implements classic mechanics, not an exact reproduction of a particular appâ€™s artwork, progression or economy.

Build controls: deterministic seed, rows/columns (6â€“12), and 2â€“16 tile types. Each deal is constructed from a geometric removal certificate and replay-verified before publication. The recorded sequence is one solution, not a unique or minimum solution. Smaller type pools can create alternative pairings; player routes may get stuck. Hint reveals a legal pair; Shuffle rebuilds remaining occupied slots and preserves exact per-type counts with a new verified clearing sequence. Failed shuffle attempts leave the board intact. Undo restores the previous match or shuffle; Replay returns to the original deal. Solution step uses a surviving recorded move, falling back to an available legal pair after divergent play; it is not an exact solver for arbitrary player states.

Timer counts elapsed active play (pauses excluded); no countdown loss or score economy. All tools are unlimited for experimentation. Optional auto-shuffle is off by default. Display settings persist in browser local storage; JSON export is explicit. No accounts, analytics, third-party assets, dependencies or network services.

## Files

- `shapes.mjs`: 40 clean SVG silhouettes redrawn from the supplied references, in sheet order. Matching uses the type ID; Each shape has 16 color variants, producing 640 distinct shape/color identities. Both must match.
- `engine.mjs`: deterministic RNG, path finding, move enumeration, board construction, certificate replay.
- `app.mjs`: session state, history, feedback, tools, preference storage and export.
- `index.html`, `style.css`: authored responsive lavender UI, primitives and connection overlay.
- `server.py`, `Start.ps1`, `Start.cmd`: local static hosting.
- `tests/engine.test.mjs`: path and generation regressions.

Classic rule references: https://kawu.com/onet/rules and https://apps.apple.com/us/app/onet-connect-animal-amazing/id1229494015 . No external art/code copied.

The type count selects a pool of shape/color combinations, not a guarantee every type appears in a deal. A board can display at most one distinct type per pair; e.g. an 8×6 deal has only 24 pairs. The mapping covers every shape/color combination exactly once.

## Mistake limit and spread deals
Wrong-move limit defaults to 5 (configurable 1-20 for the next deal). A mismatched pair or blocked/over-two-turn attempt uses one try. Selecting or deselecting one tile does not. Reaching the limit stops play and offers a retry. Undo and shuffle do not refund mistakes; replay starts a fresh attempt.

Spread-pair generation prefers geometrically separated partners over eight-neighbor touching partners whenever a legal route exists, then chooses types to minimize eight-neighbor same-type/same-shape contacts. Adjacent partners remain a fallback when needed. Every deal retains a verified solution; this reduces easy nearby pairs without claiming a calibrated difficulty rating.

Tiles with no exposed orthogonal edge are shaded. Board boundaries count as open edges; diagonal vacancies do not. Exposure updates after matches, shuffle and undo. Shading is visual only and does not disable valid adjacent-pair matches.

## Connection feedback
When an enclosed tile gains its first open orthogonal edge, its icon rises/scales up, rotates through 360 degrees, then settles (560 ms). Already-exposed tiles do not retrigger on selection or hint changes. Initial board exposure establishes a baseline rather than flipping all edge tiles. Borders count as open; diagonals do not.

Successful matches trace from the first selected tile to the second (340 ms), then a faster warm overlay follows the path (130 ms). **Reverse overlay trace** switches the second pass to second-to-first; the first trace always follows tap order. Removal follows both traces. Settings persist, and reduced-motion preferences suppress tossing and tracing motion. Timings/keyframes live in `feedback.mjs`; matching CSS trace durations correspond in `style.css`.

Connection traces render behind tile faces, so visible lines emerge at tile edges and do not cross the icons. Both trace passes share this layer.

Path visibility refinement: the first trace is muted lavender (420 ms); after a 50 ms beat, a wider bright-violet overlay traces in 220 ms and holds for 130 ms before tile removal. Disabled tile input no longer applies the generic button-opacity fade during matching; enclosed-tile shading is retained. Both passes remain behind tiles. Trace durations are supplied by `feedback.mjs` through SVG CSS variables.

Selection clears when clicking any non-tile area or control, selecting the same tile again, or attempting a mismatched/blocked pair. Outside clicks and deselection do not cost a wrong-move attempt. A second valid tile still completes a normal match.

## Add your own icons

Drop transparent PNG, SVG or WebP files into `icons/<Pack name>/`. See `icons/README.md`. Click **Refresh icon folders**, select the icon set, then generate a new deal. Icons are tinted using the existing palette so color variants remain distinguishable. The current deal keeps its icon set until you generate another. The type cap adjusts to the pack's unique shape/color combinations (up to 640).

For static hosting, run `npm run icons` (or `python tools/icon_catalog.py`) and commit the generated catalog with the images. Local hosting discovers packs on refresh. No image upload service is needed; files live in the repository.

Path animation selector: **Draw, then shrink** draws one solid line from the first tile edge to the second, removes the first tile, then erases the line from the first end toward the second before removing the second tile. **Two-pass overlay** retains the earlier animation and reverse-overlay toggle. Both use actual measured tile-face edge endpoints, including outside-board routes. State removal and exposure feedback commit together after the visual sequence, keeping undo and move checks atomic.

**Constant path speed** toggles between the original fixed durations (off, default) and actual rendered path-length timing (on). Speed mode uses 700 px/s for drawing, 1300 px/s for the overlay and 950 px/s for shrinking, including outside-board segments and excluding the clipped endpoint interiors. It applies to both animation alternatives, persists, and is latched per match. Tile fades and inter-pass pauses retain their own durations.

**Tile spawn animation** offers Pop wave, Soft drop, Flip reveal and Off. New boards/replays reveal tiles with a diagonal stagger; shuffles use a quicker version. Input stays locked until the reveal finishes. The setting persists and reduced-motion preferences show tiles immediately. Spawn keyframes/delays live in `feedback.mjs`.

Path speed tuning: fixed drawing/overlay/shrink durations are now 280/145/210 ms; constant-speed rates are 1050/1950/1425 px/s respectively (about 1.5 times faster). Overlay pause/hold are 30/80 ms.

Paths have a small bright circular head that travels along the connection. The shrink alternative starts a head at the first end when shrinking begins; the two-pass alternative gives the overlay its own head following the selected direction. Reduced-motion mode hides moving heads.

Path speed (0.25x-3x) and head size (50%-250%) sliders are in Display & play. Both are saved locally and apply to the next match. Speed affects drawing, overlay and shrinking in both timing modes.

Tile reveal direction controls the stagger separately from the spawn style: center/edges, inward/outward spirals, horizontal, vertical, and four diagonals. Saved locally; applies to new boards, replay and shuffle.

After a successful match leaves three or fewer pairs, remaining legal pairs auto-clear sequentially with the selected path animation. Blocked pairs remain; each automatic match can be undone.

Default settings: seed 1083, 8x8, 30 colored primitive types, 5 wrong moves, advance seed on. Pop wave with center-to-edges reveal, draw-then-shrink path, 2.5x speed, 90% head size, constant speed on, Evening Garden. Type numbers, reverse overlay, and auto-shuffle off. Existing saved browser preferences take precedence.

First-time visitors see a rules dialog with 0/1/2-turn connection examples. Dismissal is remembered locally; How to play reopens it. The play timer stops while the dialog is open.
