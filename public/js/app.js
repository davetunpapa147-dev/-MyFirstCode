const API = '';
const state = { page:1, query:'', genre:'', token: localStorage.getItem('token') };

function el(id){return document.getElementById(id)}

async function fetchTrending(){
  const r = await fetch('/api/trending');
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
  const params = new URLSearchParams({ q, page: state.page, genre: state.genre });
  const r = await fetch('/api/search?'+params.toString());
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
      if(!state.token){ openAuth(); return; }
      // fetch movie details to store
      const r = await fetch(`/api/movie/${id}`); const m = await r.json();
      await fetch('/api/watchlist', { method:'POST', headers:{'content-type':'application/json','authorization':'Bearer '+state.token}, body: JSON.stringify({ movie: { id: m.id, title: m.title, poster_path: m.poster_path } }) });
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
  const username = el('username').value; const password = el('password').value;
  if(!username||!password) return alert('Provide credentials');
  const path = title==='login'?'/api/auth/login':'/api/auth/register';
  const r = await fetch(path, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ username, password }) });
  const j = await r.json();
  if(j.error) return alert(j.error);
  state.token = j.token; localStorage.setItem('token', j.token);
  el('authModal').classList.add('hidden');
  alert('Authenticated as '+j.user.username);
}

function openAuth(){ el('authModal').classList.remove('hidden'); el('authTitle').textContent='Login'; }

async function init(){
  bindUI();
  const trending = await fetchTrending(); renderCarousel(trending);
  searchMovies();
}

init();
