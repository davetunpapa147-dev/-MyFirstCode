const TMDB_KEY = window.TMDB_API_KEY || 'REPLACE_WITH_YOUR_TMDB_API_KEY';
const API_BASE = 'https://api.themoviedb.org/3';
const state = { page:1, query:'', genre:'', user: JSON.parse(localStorage.getItem('cine_user')||'null') };

function el(id){return document.getElementById(id)}

async function fetchTrending(){
  const r = await fetch(`${API_BASE}/trending/movie/week?api_key=${TMDB_KEY}`);
  const j = await r.json();
  return j.results || [];
}

function renderCarousel(items){
  const c = el('trendingCarousel'); c.innerHTML='';
  items.slice(0,10).forEach(it=>{
    const card = document.createElement('a');
    card.className='card';
    card.href = `/movie.html?id=${it.id}`;
    card.innerHTML = `<img class="poster" src="https://image.tmdb.org/t/p/w500${it.poster_path}" alt="${it.title}"><div style="padding:10px"><div class="title">${it.title}</div><div class="meta">${it.release_date||''}</div></div>`;
    c.appendChild(card);
  });
}

async function searchMovies(){
  const q = state.query;
  let url;
  if(q){
    url = `${API_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&page=${state.page}`;
  }else{
    url = `${API_BASE}/discover/movie?api_key=${TMDB_KEY}&page=${state.page}` + (state.genre?`&with_genres=${state.genre}`:'');
  }
  const r = await fetch(url);
  const j = await r.json();
  renderResults(j.results || []);
}

function renderResults(list){
  const out = el('results'); out.innerHTML='';
  list.forEach(m=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `
      <a href="/movie.html?id=${m.id}"><img class="poster" src="https://image.tmdb.org/t/p/w500${m.poster_path}" alt="${m.title}"></a>
      <div class="title">${m.title}</div>
      <div class="meta">${m.release_date||''} • ⭐ ${m.vote_average||'-'}</div>
      <div style="margin-top:8px"><button class="btn" data-id="${m.id}">Add to Watchlist</button></div>
    `;
    out.appendChild(card);
  });
}

function bindUI(){
  el('searchBtn').addEventListener('click', ()=>{ state.query = el('searchInput').value; state.page=1; searchMovies(); });
  el('searchInput').addEventListener('keyup', (e)=>{ if(e.key==='Enter'){ state.query = el('searchInput').value; state.page=1; searchMovies(); } });
  document.addEventListener('click', async (e)=>{
    if(e.target.matches('.btn')){
      const id = e.target.getAttribute('data-id');
      if(!state.user){ openAuth(); return; }
      // fetch movie details to store
      const r = await fetch(`${API_BASE}/movie/${id}?api_key=${TMDB_KEY}`); const m = await r.json();
      addToWatchlist(state.user.username, { id: m.id, title: m.title, poster_path: m.poster_path });
      alert('Added to watchlist');
    }
  });

  el('toggleDark').addEventListener('click', ()=>{ document.body.classList.toggle('dark'); });
  el('authBtn').addEventListener('click', openAuth);
  el('authClose').addEventListener('click', ()=>el('authModal').classList.add('hidden'));
  el('authSwitch').addEventListener('click', ()=>{
    const t = el('authTitle'); t.textContent = t.textContent==='Login'?'Register':'Login';
  });
  el('authSubmit').addEventListener('click', submitAuth);
}

async function submitAuth(){
  const title = el('authTitle').textContent.toLowerCase();
  const username = el('username').value; // password ignored in static mode
  if(!username) return alert('Provide a username');
  // Simple client-side auth: store username in localStorage
  const user = { username };
  state.user = user; localStorage.setItem('cine_user', JSON.stringify(user));
  el('authModal').classList.add('hidden');
  alert('Signed in as '+username);
}

function openAuth(){ el('authModal').classList.remove('hidden'); el('authTitle').textContent='Login'; }

function addToWatchlist(username, movie){
  const key = `watchlist_${username}`;
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  if(!list.find(m=>String(m.id)===String(movie.id))){ list.push(movie); localStorage.setItem(key, JSON.stringify(list)); }
}

function getGenres(){
  return fetch(`${API_BASE}/genre/movie/list?api_key=${TMDB_KEY}`).then(r=>r.json()).then(j=>j.genres||[]);
}

async function populateGenres(){
  const genres = await getGenres();
  const sel = el('genreFilter');
  genres.forEach(g=>{ const o=document.createElement('option'); o.value=g.id; o.textContent=g.name; sel.appendChild(o); });
  sel.addEventListener('change', ()=>{ state.genre = sel.value; searchMovies(); });
}

async function init(){
  bindUI();
  const trending = await fetchTrending(); renderCarousel(trending);
  populateGenres();
  searchMovies();
}

init();
