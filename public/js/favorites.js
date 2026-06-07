// favorites.js — favorites list rendering and heart toggle
// Loaded on favorites.html and injected into team.html / player.html

// ── Favorites page ────────────────────────────────────────────────────────────

async function loadFavorites() {
  const teamsGrid   = document.getElementById('fav-teams-grid');
  const playersGrid = document.getElementById('fav-players-grid');
  const emptyMsg    = document.getElementById('fav-empty');

  if (!teamsGrid || !playersGrid) return;

  try {
    const data = await apiFetch('/api/favorites');
    const teams   = data.filter(f => f.kind === 'team');
    const players = data.filter(f => f.kind === 'player');

    if (teams.length === 0 && players.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    // render team favorites
    teamsGrid.innerHTML = teams.map(f => `
      <a href="team.html?slug=${f.slug}" class="team-card">
        <div class="team-card-img" style="background:${f.color || '#333'};"></div>
        <div class="team-card-body"><div class="name">${escapeHtml(f.name)}</div></div>
      </a>
    `).join('');

    // render player favorites
    playersGrid.innerHTML = players.map(f => `
      <a href="player.html?id=${f.target_id}" class="player-card">
        <div class="player-card-body">
          <div class="player-name">${escapeHtml(f.name)}</div>
          <div class="player-meta">${escapeHtml(f.position || '')} · ${escapeHtml(f.team_name || '')}</div>
        </div>
      </a>
    `).join('');

  } catch (err) {
    console.error('Failed to load favorites:', err.message);
  }
}

// ── Heart toggle (team.html / player.html) ────────────────────────────────────

/**
 * Initialises the favourite heart button on a detail page.
 * @param {'team'|'player'} kind
 * @param {number} targetId
 */
async function initFavButton(kind, targetId) {
  const btn = document.getElementById('btn-fav');
  if (!btn) return;

  // only enable if logged in
  if (!sessionIsLoggedIn()) {
    btn.title = 'Log in to save favourites';
    return;
  }

  btn.style.cursor = 'pointer';

  // check current state
  let isFav = false;
  let favId  = null;

  try {
    const data = await apiFetch('/api/favorites');
    const match = data.find(f => f.kind === kind && f.target_id === targetId);
    if (match) { isFav = true; favId = match.id; }
  } catch {
    // silently ignore — button stays in default state
  }

  renderFavBtn(btn, isFav);

  btn.addEventListener('click', async () => {
    try {
      if (isFav) {
        await apiFetch(`/api/favorites/${favId}`, { method: 'DELETE' });
        isFav = false;
        favId = null;
      } else {
        const res = await apiFetch('/api/favorites', {
          method: 'POST',
          body: JSON.stringify({ kind, target_id: targetId }),
        });
        isFav = true;
        favId = res.id;
      }
      renderFavBtn(btn, isFav);
    } catch (err) {
      console.error('Favourite toggle failed:', err.message);
    }
  });
}

function renderFavBtn(btn, isFav) {
  btn.textContent = isFav ? '♥ Saved' : '♡ Save';
  btn.style.color      = isFav ? '#e11d48' : '#767676';
  btn.style.borderColor = isFav ? '#e11d48' : '#ddd';
}

// ── XSS helper ────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
