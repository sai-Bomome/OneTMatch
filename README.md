# OneT Match workbench

Standalone classic Onet animal-match mechanics with colored primitive shapes in place of animal art. Owned entirely by this folder; no Unity or Bouquet dependency.

## Run

Double-click `Start.cmd`, or run `python server.py` then open http://127.0.0.1:5188/. Python 3 and a modern browser are sufficient. Localhost-only by default. `npm test` (or `node --test tests/*.test.mjs`) runs the rule/generation checks; no npm install required.

## Rules and controls

Match identical shape-and-color types along an empty orthogonal path of at most two turns. A one-cell outside lane is allowed. Tiles stay in place after a match. Clear the board to win. This implements classic mechanics, not an exact reproduction of a particular appâ€™s artwork, progression or economy.

Build controls: deterministic seed, rows/columns (6â€“12), and 2–640 tile types. Each deal is constructed from a geometric removal certificate and replay-verified before publication. The recorded sequence is one solution, not a unique or minimum solution. Smaller type pools can create alternative pairings; player routes may get stuck. Hint reveals a legal pair; Shuffle rebuilds remaining occupied slots and preserves exact per-type counts with a new verified clearing sequence. Failed shuffle attempts leave the board intact. Undo restores the previous match or shuffle; Replay returns to the original deal. Solution step uses a surviving recorded move, falling back to an available legal pair after divergent play; it is not an exact solver for arbitrary player states.

Timer counts elapsed active play (pauses excluded); no countdown loss or score economy. All tools are unlimited for experimentation. Optional auto-shuffle is off by default. Display settings persist in browser local storage; JSON export is explicit. No accounts, analytics, third-party assets, dependencies or network services.

## Files

- `shapes.mjs`: 40 clean SVG silhouettes redrawn from the supplied references, in sheet order. Matching uses the type ID; Each shape has 16 color variants, producing 640 distinct shape/color identities. Both must match.
- `engine.mjs`: deterministic RNG, path finding, move enumeration, board construction, certificate replay.
- `app.mjs`: composition, session state/history, persistent grid UI, tools, preferences and export.
- `session.mjs`: immutable match transaction, bounded endgame selection and keyboard navigation.
- `presentation.mjs`: cancellable waits/animations and optional bounded synthesized audio.
- `index.html`, `style.css`: authored responsive lavender UI, primitives and connection overlay.
- `server.py`, `Start.ps1`, `Start.cmd`: local static hosting.
- `tests/engine.test.mjs`: path and generation regressions.

Classic rule references: https://kawu.com/onet/rules and https://apps.apple.com/us/app/onet-connect-animal-amazing/id1229494015 . No external art/code copied.

The type count selects a pool of shape/color combinations, not a guarantee every type appears in a deal. A board can display at most one distinct type per pair; e.g. an 8×6 deal has only 24 pairs. The mapping covers every shape/color combination exactly once.

## Mistake limit and spread deals
Wrong-move limit defaults to 5 (configurable 1-20 for the next deal). A mismatched pair or blocked/over-two-turn attempt uses one try. Selecting or deselecting one tile does not. Reaching the limit stops play and offers a retry. Undo and shuffle do not refund mistakes; replay starts a fresh attempt.

Spread-pair generation prefers geometrically separated partners over eight-neighbor touching partners whenever a legal route exists, then chooses types to minimize eight-neighbor same-type/same-shape contacts. Adjacent partners remain a fallback when needed. Every deal retains a verified solution; this reduces easy nearby pairs without claiming a calibrated difficulty rating.

Tiles with no exposed orthogonal edge are shaded. Board boundaries count as open edges; diagonal vacancies do not. Exposure updates after matches, shuffle and undo. Shading is visual only and does not disable valid adjacent-pair matches.

## Game feel and feedback

See [GAME_FEEL.md](GAME_FEEL.md) for the feedback ownership, tuning values, and acceptance checks.

Matches commit immediately to rules state. A separate cancellable visual sequence preserves the outgoing tiles and connection until their animation completes. During that sequence you can select the next tile; it keeps a dashed selection outline, and its partner can be selected after the current connection settles. Undo, Pause, Replay and New board safely interrupt presentation. Selection, disabled state, focus and hints update without replacing the grid buttons.

Arrow keys navigate occupied tiles without wrapping rows; Home/End move to the first/last occupied tile. Enter/Space selects, Escape clears selection. Tile labels include color and shape. Enclosed tiles remain shaded but are readable and selectable: adjacent matching tiles may still connect even without an open edge.

Newly exposed icons use a restrained 360-degree flip (360 ms, reduced to 288 ms when more than three are exposed together). Initial exposure, shuffle and undo establish a baseline. Invalid pairs mark both endpoints with solid or dashed outlines to distinguish mismatches from blocked routes and emphasize the remaining-tries counter.

Draw, then shrink uses one solid violet connection; the first tile fades as shrinking starts, then the second fades on arrival. Two-pass overlay uses a muted first trace and brighter second trace, with optional reverse direction. Paths and their solid circular heads begin/end at tile edges and stay behind tiles. The 130 ms removal timing is shared by CSS and the sequence; the first removal overlaps shrinking.

Path speed (0.25x-3x), head size (50%-250%), constant-speed mode, both path styles, and all reveal directions remain available. Spawn styles are Pop wave, Soft drop, Flip reveal and Off. Reveals use 360 ms motion plus up to 320 ms stagger; shuffle uses 260 ms plus 180 ms. First-time visitors see the rules before the board reveal starts.

Sound cues are optional and off by default, with a saved volume control. The browser synthesizes short selection, match, denial and completion cues after an interaction unlocks audio; no external assets/packages are required. Silence or unavailable audio never affects the rules. Reduced-motion preferences suppress travel, tossing, glints and feedback delays.

The final three or fewer pairs clear automatically when legal routes exist. The tiny endgame search prefers a complete clearing continuation when available. Selecting another tile interrupts the automatic handoff; blocked pairs remain for player action. Completion uses a short local accent, summary, and immediately usable Next board control. Pause/result covers animate in and out.

## Add your own icons

Drop transparent PNG, SVG or WebP files into `icons/<Pack name>/`. See `icons/README.md`. Click **Refresh icon folders**, select the icon set, then generate a new deal. Icons are tinted using the existing palette so color variants remain distinguishable. The current deal keeps its icon set until you generate another. The type cap adjusts to the pack's unique shape/color combinations (up to 640).

For static hosting, run `npm run icons` (or `python tools/icon_catalog.py`) and commit the generated catalog with the images. Local hosting discovers packs on refresh. No image upload service is needed; files live in the repository.

Default settings: seed 1083, 8x8, 30 colored primitive types, 5 wrong moves, advance seed on. Pop wave with center-to-edges reveal, draw-then-shrink path, 2.5x speed, 90% head size, constant speed on, Evening Garden. Type numbers, reverse overlay, auto-shuffle and sound off. Existing saved browser preferences take precedence.

First-time visitors see a rules dialog with 0/1/2-turn examples. Dismissal is remembered locally; How to play reopens it. The play timer stops while the dialog is open, while paused, and after finishing. Backgrounding active play pauses the board.

Newly free tiles retain the enclosed gray background while their icon rotates 360 degrees, shrinks to 50% and grows back to full size. Only after the icon settles does the background transition to its free appearance. Timing remains `FEEDBACK.flipMs`; reduced motion settles immediately.
