/* ==========
   Navigazione città
   ========== */

// Apri città dalla home
document.querySelectorAll('.city-card').forEach(card => {
  card.addEventListener('click', () => {
    const city = card.dataset.city;
    document.getElementById('home').hidden = true;

    const page = document.getElementById(`city-${city}`);
    page.hidden = false;

    resetTabs(page);
    loadFavorites(city); // ← carica preferiti salvati
  });
});

// Back to home
document.addEventListener('click', (e) => {
  if (!e.target.classList.contains('backToHome')) return;
  const page = e.target.closest('.city-wrap');
  page.hidden = true;
  document.getElementById('home').hidden = false;
});

/* ==========
   Tabs interne
   ========== */

document.addEventListener('click', (e) => {
  if (!e.target.classList.contains('city-tab')) return;

  const btn = e.target;
  const page = btn.closest('.city-wrap');
  const sectionKey = btn.dataset.section;
  const city = page.id.replace('city-', '');

  page.querySelectorAll('.city-section').forEach(sec => sec.hidden = true);

  const target = page.querySelector(`#${city}-${sectionKey}`);
  if (target) target.hidden = false;

  page.querySelectorAll('.city-tab').forEach(t => t.classList.toggle('active', t === btn));
});

function resetTabs(page) {
  const city = page.id.replace('city-', '');

  page.querySelectorAll('.city-section').forEach(sec => sec.hidden = true);

  const def = page.querySelector(`#${city}-attrazioni`);
  if (def) def.hidden = false;

  const btn = page.querySelector('.city-tab[data-section="attrazioni"]');
  page.querySelectorAll('.city-tab').forEach(b => b.classList.toggle('active', b === btn));
}

/* ==========
   Ricerca nei ristoranti
   ========== */

['shenzhen','canton','chongqing','chengdu'].forEach(city => {
  const input = document.getElementById(`search-${city}`);
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    const wrap = document.querySelector(`#${city}-ristoranti .restaurants`);
    if (!wrap) return;

    wrap.querySelectorAll('.card').forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(q) ? '' : 'none';
    });
  });
});

/* ==========
   Preferiti permanenti (localStorage)
   ========== */

/* Struttura storage:
   localStorage["favorites-cityname"] = JSON.stringify([
      { html: "<div class='card'>...</div>" },
      { html: "<div class='card'>...</div>" }
   ])
*/

function loadFavorites(city) {
  const key = `favorites-${city}`;
  const container = document.querySelector(`#city-${city} .favorites .list`);
  if (!container) return;

  container.innerHTML = '';

  const saved = JSON.parse(localStorage.getItem(key) || "[]");

  saved.forEach(item => {
    const temp = document.createElement('div');
    temp.innerHTML = item.html.trim();
    const card = temp.firstElementChild;

    // reinserisci lo stato preferito sulla card
    const favBtn = card.querySelector('.fav');
    if (favBtn) favBtn.classList.remove('off');

    container.appendChild(card);
  });
}

function saveFavorites(city) {
  const key = `favorites-${city}`;
  const container = document.querySelector(`#city-${city} .favorites .list`);
  if (!container) return;

  const data = [];
  container.querySelectorAll('.card').forEach(card => {
    data.push({ html: card.outerHTML });
  });

  localStorage.setItem(key, JSON.stringify(data));
}

// Aggiungi ai preferiti cliccando ★
document.addEventListener('click', (e) => {
  const fav = e.target.closest('.fav');
  if (!fav) return;

  const card = fav.closest('.card');
  const page = fav.closest('.city-wrap');
  if (!card || !page) return;

  const city = page.id.replace('city-', '');
  const list = page.querySelector('.favorites .list');

  if (fav.classList.contains('off')) {
    fav.classList.remove('off');

    const clone = card.cloneNode(true);
    clone.querySelector('.fav')?.classList.remove('off');
    clone.querySelector('.badges')?.remove(); // niente badge nei preferiti

    list.appendChild(clone);
    saveFavorites(city);
  } else {
    fav.classList.add('off');

    // rimuovi dalla lista preferiti
    [...list.querySelectorAll('.card')].forEach(c => {
      if (c.innerText.trim() === card.innerText.trim()) c.remove();
    });
    saveFavorites(city);
  }
});

// Svuota preferiti
['shenzhen','canton','chongqing','chengdu'].forEach(city => {
  const btn = document.getElementById(`clearFavs-${city}`);
  if (!btn) return;

  btn.addEventListener('click', () => {
    const container = document.querySelector(`#city-${city} .favorites .list`);
    if (container) {
      container.innerHTML = "";
      saveFavorites(city);
    }
  });
});

/* ==========
   Back to top
   ========== */
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) backToTop.classList.add('show');
    else backToTop.classList.remove('show');
  });

  backToTop.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
}

/* ==========
   PWA SW (registrazione)
   ========== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
