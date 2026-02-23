# Arcade Atlas (2D Games)

A curated, static HTML/CSS experience for a 2D games showcase. This repo is organized as a small site with a landing page, authentication templates, a catalog page, and a game detail template. Individual game prototypes live under `apps/`.

## Quick start

Open `index.html` in a browser.

If your browser blocks local file routing, serve the folder with any static server, for example:

```powershell
# from the repo root
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Project layout

- `index.html` - Main landing page.
- `styles/` - Shared and page-level styles (`index.css`, `game.css`, `login.css`, `register.css`).
- `templates/` - Secondary pages:
  - `home.html` - Library/collection page.
  - `game.html` - Game detail template.
  - `login.html`, `register.html` - Auth flows.
- `apps/` - Individual game prototypes and layouts.
- `scripts/` - Client-side scripts (auth/utility).
- `docs/`, `data/`, `tests/` - Supporting assets and references.

## Apps included

- 2048 Board Style
- Connect Four
- Dominoes
- Dots & Boxes
- Ludo King
- Memory Match
- Minesweeper
- Shizuku
- Snake & Ladder
- Sudoku
- Tic-Tac-Toe
- Word Search

## Notes

- This is a static project; there is no build step.
- All pages are currently wired with relative links for local or static hosting.
