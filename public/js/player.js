// player.js — player detail page API integration
// Loaded only on player.html

// slug is declared in utils.js
const params  = new URLSearchParams(window.location.search);
const playerId = params.get('id');

// ── Tab switching ─────────────────────────────────────────────────────────────

document.querySelectorAll('.tab-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(link.dataset.tab).classList.add('active');
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '—';
  return div.innerHTML;
}

// ── Load player data ──────────────────────────────────────────────────────────

async function loadPlayer() {
  if (!playerId) return;

  try {
    const player = await apiFetch('/api/players/' + playerId);
    if (!player) return;

    // get team info
    const teams = await apiFetch('/api/teams');
    const team  = teams.find(t => t.id === player.team_id);
    const teamName = team ? team.name : '—';
    const teamSlug = team ? team.slug : slug;

    // header
    document.querySelector('.team-header h1') && 
      (document.querySelector('.team-header h1').textContent = player.name);
    document.querySelector('h1').textContent = player.name;
    document.querySelector('.meta').textContent = (player.position || '—') + ' · ' + teamName;
    document.title = player.name + ' — Big6Hub';

    // back link
    const backLink = document.querySelector('.back-link');
    if (backLink) {
      backLink.href  = 'team.html?slug=' + teamSlug;
      backLink.textContent = '← ' + teamName;
    }

    // stat pills
    const pills = document.querySelectorAll('.stat-pill .val');
    if (pills[0]) pills[0].textContent = player.goals   ?? '0';
    if (pills[1]) pills[1].textContent = player.assists ?? '0';
    if (pills[2]) pills[2].textContent = '—';
    if (pills[3]) pills[3].textContent = player.is_legend ? 'Yes' : 'No';

    // profile tab
    const rows = document.querySelectorAll('#profile .tbl tbody tr');
    if (rows[0]) rows[0].cells[1].textContent = player.name     || '—';
    if (rows[1]) rows[1].cells[1].textContent = player.position || '—';
    if (rows[2]) {
      const a = rows[2].cells[1].querySelector('a');
      if (a) { a.href = 'team.html?slug=' + teamSlug; a.textContent = teamName; }
    }
    if (rows[3]) rows[3].cells[1].textContent = player.is_legend ? 'Yes' : 'No';

    // favorites button
    initFavButton(player, teamSlug);

  } catch (err) {
    console.error('Failed to load player:', err.message);
  }
}

// ── Favorites button ──────────────────────────────────────────────────────────

async function initFavButton(player, teamSlug) {
  const btn = document.querySelector('.btn-fav');
  if (!btn) return;

  if (!sessionIsLoggedIn()) {
    btn.textContent = '☆ Add to Favorites (login required)';
    btn.disabled = true;
    return;
  }

  btn.disabled = false;
  btn.style.cursor = 'pointer';

  // check if already favorited
  let isFav = false;
  let favId  = null;

  try {
    const favorites = await apiFetch('/api/favorites');
    const match = favorites.find(f => f.kind === 'player' && f.target_id === player.id);
    if (match) { isFav = true; favId = match.id; }
  } catch { /* ignore */ }

  renderFavBtn(btn, isFav);

  btn.addEventListener('click', async () => {
    try {
      if (isFav) {
        await apiFetch('/api/favorites/' + favId, { method: 'DELETE' });
        isFav = false;
        favId  = null;
      } else {
        const res = await apiFetch('/api/favorites', {
          method: 'POST',
          body: JSON.stringify({ kind: 'player', target_id: player.id }),
        });
        isFav = true;
        favId  = res.id || res.favorite?.id;
      }
      renderFavBtn(btn, isFav);
    } catch (err) {
      console.error('Favorite toggle failed:', err.message);
    }
  });
}

function renderFavBtn(btn, isFav) {
  btn.textContent   = isFav ? '★ Saved to Favorites' : '☆ Add to Favorites';
  btn.style.color   = isFav ? '#e11d48' : '';
  btn.style.borderColor = isFav ? '#e11d48' : '';
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', loadPlayer);
