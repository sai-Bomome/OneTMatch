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
