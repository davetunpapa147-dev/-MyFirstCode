function qs(name){
  return new URLSearchParams(location.search).get(name);
}

async function fetchMovie(id){
  const r = await fetch('/api/movie/'+id); return await r.json();
}

async function fetchReviews(id){
  const r = await fetch('/api/reviews/'+id); const j = await r.json(); return j.reviews||[];
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
  const reviews = await fetchReviews(id);
  const ra = document.getElementById('reviewsArea');
  ra.innerHTML = `<h3>Reviews</h3>` + reviews.map(r=>`<div class="card"><strong>${r.username}</strong> • ⭐ ${r.rating}<div>${r.text}</div></div>`).join('');

  document.getElementById('addWatch').addEventListener('click', async ()=>{
    const token = localStorage.getItem('token');
    if(!token) return alert('Login to add to watchlist');
    await fetch('/api/watchlist', { method:'POST', headers:{'content-type':'application/json','authorization':'Bearer '+token}, body: JSON.stringify({ movie: { id: m.id, title: m.title, poster_path: m.poster_path } }) });
    alert('Added to watchlist');
  });
}

init();
