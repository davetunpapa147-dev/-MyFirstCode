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

Next steps (optional):
- Replace the simple JSON persistence with a real database (SQLite, Postgres).
- Add password reset, email verification, or OAuth providers.
- Harden security (rate limiting, input validation, CORS restrictions).
