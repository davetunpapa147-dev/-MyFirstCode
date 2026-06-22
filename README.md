# CineSearch — Movie Search App

This repository contains a complete, minimal cinema-style web app with:

- Search and discover movies (TMDB API proxy)
- Trending carousel
- Genre filtering and responsive UI
- Movie details pages with trailer embedding
- User authentication (register/login) using JWT
- Watchlist management and reviews (stored server-side in a simple JSON DB)
- Dark mode and smooth UI animations

Files added:

- `server.js` — Express backend and TMDB proxy
- `db.json` — simple file DB for users, reviews, watchlists
- `public/` — frontend static files (HTML/CSS/JS)
- `.env.example` — example env file for TMDB API key and JWT secret

Setup
------

1. Copy `.env.example` to `.env` and set `TMDB_API_KEY` and `JWT_SECRET`.
2. Install dependencies and start the server:

```bash
npm install
npm start
```

3. Open `http://localhost:3000` in your browser.

Notes
-----
- This project uses The Movie Database (TMDB) API. Get a free API key at https://www.themoviedb.org/ and put it in `.env`.
- The backend is a simple demo server and stores data in `db.json` — not suitable for production.
- If you want to run in development with auto-reload, use `nodemon`.

Static deployment (GitHub Pages)
--------------------------------

This project also supports a static-only deployment suitable for GitHub Pages. The frontend can run without the Express backend by using the TMDB API directly and storing user data in `localStorage`.

Steps to deploy to GitHub Pages (recommended):

1. Add a repository secret named `TMDB_API_KEY` with your TMDB API key (Repository → Settings → Secrets).
2. Push to the `main` branch. A GitHub Actions workflow will build and deploy the `public` folder to GitHub Pages automatically.

If you prefer to test locally without the backend, create `public/js/config.js` with:

```js
window.TMDB_API_KEY = 'your_tmdb_key_here'
```

Then open `public/index.html` in a browser (or run a static file server).

Next steps (optional):
- Replace the simple JSON persistence with a real database (SQLite, Postgres).
- Add password reset, email verification, or OAuth providers.
- Harden security (rate limiting, input validation, CORS restrictions).
