# OpenStudy

A single-file flashcard app. Import a Quizlet export — HTML, ZIP, PDF, CSV/TSV, or JSON —
and study it locally with Flashcards, Learn, Write, Match, and Test modes.

Everything runs in the browser. Decks are stored in `localStorage`, so each person's
decks stay on their own machine and nothing is uploaded anywhere.

## Importing

| Source | Pictures | Notes |
|---|---|---|
| Saved HTML page + its image files | best | Select the HTML *and* the images together |
| ZIP of that HTML + images | best | Easiest way to keep them together |
| PDF (Quizlet "print") | good | Pictures are matched to cards by page layout |
| CSV / TSV / TXT | no | Plain term/definition pairs |
| JSON | yes | An OpenStudy deck exported from this app |

### If a PDF import puts a picture on the wrong card

PDF import reconstructs the card grid from a print layout, so an unusual set can
still fool it. Open **Edit cards** and use:

- **⬆ pic / ⬇ pic** on a single card — move just that picture
- **Shift all pictures up / down** — fix a systematic off-by-one across the deck

Both are lossless and reversible; nothing is discarded.

## Developing

There is no build step. `index.html` is the whole app — open it in a browser and
edit it directly.

Publishing an update is a normal push:

```bash
git add -A
git commit -m "Describe the change"
git push
```

GitHub Pages redeploys within a minute or so. Anyone using the site gets the new
version on their next reload; their saved decks are unaffected.

> Changing the `STORAGE` constant in `index.html` orphans everyone's saved decks,
> so leave it alone unless a deck format change makes that unavoidable.
