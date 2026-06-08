// favorites.js — favorites page logic
// Loaded only on favorites.html

// ── Route guard ───────────────────────────────────────────────────────────────

sessionRequireLogin();

// ── Scroll buttons (from Seongbin) ────────────────────────────────────────────

document.querySelectorAll('.fav-scroll-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const scroll = btn.closest('.fav-scroll-wrap').querySelector('.fav-players-scroll');
    scroll.scrollLeft += btn.classList.contains('left') ? -150 : 150;
  });
});

// ── Remove button — API integration ──────────────────────────────────────────

document.addEventListener('click', async e => {
  if (!e.target.classList.contains('fav-remove-btn')) return;
  e.preventDefault();
  e.stopPropagation();

  const card  = e.target.closest('[data-fav-id]');
  const favId = card && card.dataset.favId;
  if (!favId) return;

  try {
    await apiFetch(`/api/favorites/${favId}`, { method: 'DELETE' });
    card.remove();
  } catch (err) {
    console.error('Failed to remove favorite:', err.message);
  }
});

// ── Load favorites from API ───────────────────────────────────────────────────

async function loadFavorites() {
  try {
    const favorites = await apiFetch('/api/favorites');

    const favTeams   = favorites.filter(f => f.kind === 'team');
    const favPlayers = favorites.filter(f => f.kind === 'player');

    // group players by team_id
    const playersByTeam = {};
    favPlayers.forEach(p => {
      if (!playersByTeam[p.team_id]) playersByTeam[p.team_id] = [];
      playersByTeam[p.team_id].push(p);
    });

    // update each hardcoded team card
    document.querySelectorAll('.fav-team-card').forEach(card => {
      const slug    = card.querySelector('a.fav-logo-col')?.href.match(/slug=(\w+)/)?.[1];
      const favTeam = favTeams.find(t => t.slug === slug);
      const scroll  = card.querySelector('.fav-players-scroll');
      if (!scroll) return;

      // mark team card with fav id for delete button
      if (favTeam) {
        card.querySelector('.fav-team-header').dataset.favId = favTeam.id;
        card.querySelector('.fav-team-header').classList.add('is-fav');

        // render favorited players for this team
        const players = playersByTeam[favTeam.target_id] || [];
        if (players.length > 0) {
          scroll.innerHTML = players.map(p => `
            <div class="fav-player-card" data-fav-id="${p.id}">
              <span class="fav-player-name">${escapeHtml(p.name)}</span>
              <button class="fav-remove-btn" title="Remove">×</button>
            </div>
          `).join('');
        }
      }
    });

  } catch (err) {
    console.error('Failed to load favorites:', err.message);
  }
}

// ── XSS helper ────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', loadFavorites);
