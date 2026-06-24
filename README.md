# RefDesk

A fast, local-first citation manager built for computer science researchers.

**Live demo:** [https://rukenzilan.github.io/scholar-sidekick-tool/](https://rukenzilan.github.io/scholar-sidekick-tool/)

---

## Features

- **Import by DOI** — Paste a DOI and fetch paper metadata automatically via [Crossref](https://www.crossref.org/).
- **BibTeX export** — Generate and download a `.bib` file for your library.
- **Tagging & search** — Organize papers with tags and search across titles, authors, venues, abstracts, and DOIs.
- **Local-first** — All data is stored in your browser; no account or backend required.
- **Privacy-focused** — Your reference library never leaves your device.

## How to use

1. Open the live demo.
2. Click **Add paper** and paste a DOI, or fill in the details manually.
3. Add tags to keep your library organized.
4. Search and filter when you need to find a paper.
5. Click **Export .bib** to download your bibliography.

## Tech stack

- [React](https://react.dev/) + [TanStack Start](https://tanstack.com/start)
- [Tailwind CSS](https://tailwindcss.com/)
- [Crossref REST API](https://api.crossref.org/)
- Deployed to [GitHub Pages](https://pages.github.com/)

## Data storage

RefDesk is a purely client-side static app. Your papers are saved in the browser's `localStorage`, which means:

- Each browser/device has its own independent library.
- Clearing browser data will remove your library.
- For shared or synced storage, a backend database would be needed.

## License

Open source. Feel free to fork, modify, and build on it.
