function qs(name){
  return new URLSearchParams(location.search).get(name);
}

const TMDB_KEY = window.TMDB_API_KEY || 'REPLACE_WITH_YOUR_TMDB_API_KEY';
const API_BASE = 'https://api.themoviedb.org/3';

async function fetchMovie(id){
  const r = await fetch(`${API_BASE}/movie/${id}?api_key=${TMDB_KEY}&append_to_response=videos,credits`);
  return await r.json();
}

function fetchLocalReviews(id){
  const all = JSON.parse(localStorage.getItem('cine_reviews')||'[]');
  return all.filter(r=>String(r.movieId)===String(id));
}

function saveLocalReview(review){
  const all = JSON.parse(localStorage.getItem('cine_reviews')||'[]');
  all.push(review); localStorage.setItem('cine_reviews', JSON.stringify(all));
}

function renderMovie(m){
  const el = document.getElementById('movieDetails');
  const video = (m.videos && m.videos.results.find(v=>v.site==='YouTube')) || null;
  el.innerHTML = `
    <div class="movie-hero">
      <img src="https://image.tmdb.org/t/p/w500${m.poster_path}" alt="${m.title}">
      <div class="movie-info">
        <h1>${m.title} <small class="meta">${m.release_date||''}</small></h1>
        <p class="meta">${m.tagline||''}</p>
        <p>${m.overview||''}</p>
        <div style="margin-top:10px"><button id="addWatch" class="btn">Add to Watchlist</button></div>
      </div>
    </div>
    ${video?`<div style="margin-top:18px"><iframe width="100%" height="480" src="https://www.youtube.com/embed/${video.key}" frameborder="0" allowfullscreen></iframe></div>`:''}
    <section id="reviewsArea"></section>
  `;
}

async function init(){
  const id = qs('id');
  if(!id) { document.body.innerHTML='Missing movie id'; return; }
  const m = await fetchMovie(id);
  renderMovie(m);
  const reviews = fetchLocalReviews(id);
  const ra = document.getElementById('reviewsArea');
  ra.innerHTML = `<h3>Reviews</h3>` + reviews.map(r=>`<div class="card"><strong>${r.username}</strong> • ⭐ ${r.rating}<div>${r.text}</div></div>`).join('');

  document.getElementById('addWatch').addEventListener('click', async ()=>{
    const user = JSON.parse(localStorage.getItem('cine_user')||'null');
    if(!user) return alert('Login to add to watchlist');
    const key = `watchlist_${user.username}`;
    const list = JSON.parse(localStorage.getItem(key)||'[]');
    if(!list.find(mm=>String(mm.id)===String(m.id))){ list.push({ id: m.id, title: m.title, poster_path: m.poster_path }); localStorage.setItem(key, JSON.stringify(list)); }
    alert('Added to watchlist');
  });
}

init();
