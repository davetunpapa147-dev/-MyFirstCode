const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_KEY = process.env.TMDB_API_KEY || 'REPLACE_WITH_YOUR_TMDB_KEY';
const JWT_SECRET = process.env.JWT_SECRET || 'replace_dev_secret';
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readDB(){
  try{
    const raw = fs.readFileSync(DB_PATH,'utf8');
    return JSON.parse(raw);
  }catch(e){
    return { users: [], reviews: [], watchlists: {} };
  }
}

function writeDB(db){
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// Simple auth middleware
function authMiddleware(req,res,next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ error: 'Missing auth' });
  const parts = auth.split(' ');
  if(parts.length !== 2) return res.status(401).json({ error: 'Invalid auth' });
  const token = parts[1];
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  }catch(e){
    res.status(401).json({ error: 'Invalid token' });
  }
}

// TMDB proxy endpoints
app.get('/api/trending', async (req,res)=>{
  try{
    const url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_KEY}`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  }catch(e){ res.status(500).json({ error: 'TMDB error' }); }
});

app.get('/api/search', async (req,res)=>{
  try{
    const q = encodeURIComponent(req.query.q || '');
    const page = req.query.page || 1;
    const genre = req.query.genre || '';
    let url;
    if(q){
      url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${q}&page=${page}`;
    }else{
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&page=${page}` + (genre?`&with_genres=${genre}`:'');
    }
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  }catch(e){ res.status(500).json({ error: 'TMDB error' }); }
});

app.get('/api/movie/:id', async (req,res)=>{
  try{
    const id = req.params.id;
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&append_to_response=videos,credits`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  }catch(e){ res.status(500).json({ error: 'TMDB error' }); }
});

// Auth endpoints
app.post('/api/auth/register', (req,res)=>{
  const { username, password } = req.body;
  if(!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const db = readDB();
  if(db.users.find(u=>u.username===username)) return res.status(400).json({ error: 'User exists' });
  const hashed = bcrypt.hashSync(password, 8);
  const user = { id: Date.now().toString(), username, password: hashed };
  db.users.push(user);
  writeDB(db);
  const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username } });
});

app.post('/api/auth/login', (req,res)=>{
  const { username, password } = req.body;
  if(!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const db = readDB();
  const user = db.users.find(u=>u.username===username);
  if(!user) return res.status(400).json({ error: 'Invalid credentials' });
  if(!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username } });
});

// Watchlist endpoints
app.get('/api/watchlist', authMiddleware, (req,res)=>{
  const db = readDB();
  const list = db.watchlists[req.user.id] || [];
  res.json({ list });
});

app.post('/api/watchlist', authMiddleware, (req,res)=>{
  const { movie } = req.body;
  if(!movie) return res.status(400).json({ error: 'Missing movie' });
  const db = readDB();
  db.watchlists[req.user.id] = db.watchlists[req.user.id] || [];
  if(!db.watchlists[req.user.id].find(m=>m.id===movie.id)) db.watchlists[req.user.id].push(movie);
  writeDB(db);
  res.json({ list: db.watchlists[req.user.id] });
});

app.delete('/api/watchlist/:id', authMiddleware, (req,res)=>{
  const id = req.params.id;
  const db = readDB();
  db.watchlists[req.user.id] = (db.watchlists[req.user.id]||[]).filter(m=>String(m.id)!==String(id));
  writeDB(db);
  res.json({ list: db.watchlists[req.user.id] });
});

// Reviews
app.post('/api/reviews', authMiddleware, (req,res)=>{
  const { movieId, rating, text } = req.body;
  if(!movieId) return res.status(400).json({ error: 'Missing movieId' });
  const db = readDB();
  const review = { id: Date.now().toString(), movieId, userId: req.user.id, username: req.user.username, rating: rating||0, text: text||'', createdAt: new Date().toISOString() };
  db.reviews.push(review);
  writeDB(db);
  res.json({ review });
});

app.get('/api/reviews/:movieId', (req,res)=>{
  const movieId = req.params.movieId;
  const db = readDB();
  const reviews = db.reviews.filter(r=>String(r.movieId)===String(movieId));
  res.json({ reviews });
});

// Fallback to index.html for SPA-like behavior
app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, ()=>{
  console.log(`Server running on http://localhost:${PORT}`);
});
