// favorites.js — favorites page logic
// Loaded only on favorites.html

// ── Route guard ───────────────────────────────────────────────────────────────

sessionRequireLogin();

// ── Team ID map (slug → id) ───────────────────────────────────────────────────

const TEAM_ID_MAP = {
  arsenal:   359,
  chelsea:   363,
  liverpool: 364,
  mancity:   382,
  manutd:    360,
  tottenham: 367,
};

// ── Scroll buttons ────────────────────────────────────────────────────────────

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
    const [favorites, allTeams] = await Promise.all([
      apiFetch('/api/favorites'),
      apiFetch('/api/teams'),
    ]);

    const favPlayers = favorites.filter(f => f.kind === 'player');

    const playerDetails = await Promise.all(
      favPlayers.map(f =>
        apiFetch('/api/players/' + f.target_id)
          .then(p => ({ ...p, fav_id: f.id }))
          .catch(() => null)
      )
    );
    const validPlayers = playerDetails.filter(Boolean);

    const playersByTeamId = {};
    validPlayers.forEach(p => {
      if (!playersByTeamId[p.team_id]) playersByTeamId[p.team_id] = [];
      playersByTeamId[p.team_id].push(p);
    });

    document.querySelectorAll('.fav-team-card').forEach(card => {
      const logoLink = card.querySelector('.fav-logo-col');
      const slug = logoLink && logoLink.href.match(/slug=(\w+)/)?.[1];
      const teamId = slug && TEAM_ID_MAP[slug];
      const team = allTeams.find(t => t.id === teamId);
      if (!team) return;

      const logoImg = card.querySelector('.fav-logo-img');
      if (logoImg && team.logo_url) logoImg.src = team.logo_url;
      if (logoLink) logoLink.href = 'team.html?slug=' + team.slug;

      const scroll = card.querySelector('.fav-players-scroll');
      if (!scroll) return;

      const players = playersByTeamId[team.id] || [];
      if (players.length > 0) {
        scroll.innerHTML = players.map(p => `
          <div class="fav-player-card" data-fav-id="${p.fav_id}">
            <div class="fav-player-info">
              <a href="player.html?id=${p.id}&slug=${team.slug}" class="fav-player-name">${escapeHtml(p.name)}</a>
              <span class="fav-player-position">${escapeHtml(p.position)}</span>
            </div>
            <button class="fav-remove-btn" title="Remove">×</button>
          </div>
        `).join('');
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
