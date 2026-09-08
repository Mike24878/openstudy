# OpenStudy

A single-file flashcard app. Import a study set — Quizlet export, PowerPoint,
Word, PDF, CSV or JSON — and study it with flashcards, spaced review, learn,
write, match and test.

Everything runs in the browser. Decks are stored in IndexedDB on your own
machine and nothing is uploaded anywhere.

Live at **https://mike24878.github.io/openstudy/**

## Importing

| Source | Pictures | Notes |
|---|---|---|
| Saved Quizlet page (HTML) + its images | best | Select the HTML *and* the images together |
| ZIP of that HTML + images | best | Easiest way to keep them together |
| PowerPoint `.pptx` | yes | Each slide's title becomes the term, its content the definition |
| Word `.docx` | yes | A two-column table imports best; otherwise lines are read as pairs |
| PDF (Quizlet "print") | yes | Pictures are matched to cards by analysing the page layout |
| CSV / TSV / TXT | no | Proper RFC 4180 parsing, so commas inside definitions survive |
| JSON | yes | An OpenStudy deck exported from this app |

### If a PDF or Office import puts a picture on the wrong card

These formats are reconstructed from a print or slide layout, so an unusual
document can still fool the parser. Open **Edit cards** and use:

- **⬆ pic / ⬇ pic** on a single card — move just that picture
- **Shift all pictures up / down** — fix a systematic off-by-one across the deck

Both are lossless and reversible; nothing is discarded. If an import comes out
wrong, **Import look wrong?** produces a diagnostic worth sending.

## Studying

Scheduling uses **FSRS 4.5** with the published default weights. Rate a card
Again / Hard / Good / Easy and it comes back when you are about to forget it;
the buttons show the interval each choice would produce. **Review** drains the
cards that are due, and the tab badge shows how many are waiting.

## Decks and sharing

Every import is kept as its own deck — **Decks** switches, renames and deletes
them. **Share** packs a deck into a link: the cards travel gzipped inside the
URL fragment, so nothing is uploaded and no account is involved. Pictures are
too large for a link and are left out, so share the `.json` when they matter.

**Export** offers `.json` (keeps pictures and the review schedule) or `.tsv`
(plain term/definition, which Anki and Quizlet both read).

## Installing

The site is a PWA: on Chrome, Edge or Android it can be installed to the home
screen and studied offline. The service worker caches the app shell network
first for the page, cache first for everything else.

## Developing

`index.html` is the whole app — no build step, no dependencies to install.
Open it in a browser and edit it directly.

```bash
git add -A
git commit -m "Describe the change"
git push
```

GitHub Pages redeploys within a minute or so. Saved decks are unaffected.

Two supporting files:

- `make-artifact.js` derives `artifact.html` (the same app for a host that
  supplies its own `<head>`). Run it after editing if you publish that copy.
- `sw.js` caches the app shell. Bump `CACHE` inside it to retire an old shell.

> Changing the `STORAGE` or `DB_NAME` constants in `index.html` orphans
> everyone's saved decks, so leave them alone unless a format change makes that
> unavoidable.

### Not wired up

`REPORT_ENDPOINT` in `index.html` is empty. Paste a form endpoint (Formspree or
similar) there and the import report gains a **Send report** button that posts
the diagnostic together with the file that failed. Until then the report is
copied to the clipboard by hand.
