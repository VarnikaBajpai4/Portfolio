# Portfolio

Varnika Bajpai's profile site, built as a retro desktop you can explore: windows you can drag, a dock, a terminal, and three colour palettes. A regular scrolling version lives at `/standard/`.

## Commands

```bash
npm install        # install dependencies
npm run dev        # start the dev server
npm run check      # lint, type check and build
npm run e2e        # run the Playwright end-to-end tests
```

## Editing content

Everything the site says about me lives in `src/content.ts`. The desktop apps, the terminal and the Standard View all read from it, so one edit updates all three.

To add the resume download, put the PDF in `public/` and set `resumePdf` in `src/content.ts` to its file name.

## Adding an app

1. Write a component in `src/apps/`.
2. Add one entry to the `APPS` list in `src/apps/registry.ts` (title, icon, size, position, and whether it shows in the dock or on the desktop).
3. Add its id to `APP_IDS` in `src/wm/reducer.ts`.

## Project layout

| Path | What it holds |
|---|---|
| `src/content.ts` | All profile data |
| `src/wm/` | Window manager: state, drag, resize, focus |
| `src/apps/` | One component per app, plus the app registry |
| `src/shell/` | Menu bar, dock, desktop icons, intro, phone layout |
| `src/terminal/` | The terminal's command interpreter |
| `src/standard/` | The regular portfolio page |
| `src/icons/` | Pixel-art icons and the portrait |
| `e2e/` | End-to-end tests |

## Deployment

Pushing to `main` builds the site and deploys it to GitHub Pages through `.github/workflows/deploy.yml`. One-time setup: in the repository settings, open **Pages** and set **Source** to **GitHub Actions**.
