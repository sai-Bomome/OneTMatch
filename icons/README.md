# Drop icon packs here

Create one folder per set, then drop `.svg`, `.png` or `.webp` files into it:

```
icons/
  Animals/
    01-cat.png
    02-dog.png
  Food/
    01-apple.svg
```

Use transparent backgrounds and a clear silhouette, ideally square with consistent padding. The game tints the alpha silhouette using its 16-color palette so the same icon can become distinct matching types. Colored pictures are treated as silhouettes too; an opaque background would appear as a square.

For local play, click **Refresh icon folders**, choose the pack under **Icon set**, then generate a new board. The current board keeps its current pack. PNG/SVG/WebP only; subfolders inside a pack are not scanned. Prefix filenames with numbers to keep a deliberate order. The Custom folder is an empty starter pack.

For GitHub/static hosting, run `python tools/icon_catalog.py` after adding files and commit `icons/catalog.json` with the images. The local server discovers folders live; static sites use the generated catalog. Each pack provides 16 color variants per icon, capped at 640 total types in the current game. Keep any icon files private until you intend to publish them with the site; use images you have rights to share.
