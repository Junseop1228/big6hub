// team.js — team detail page API integration
// Loaded only on team.html

// slug is declared in utils.js

// ── Tab switching ─────────────────────────────────────────────────────────────

document.querySelectorAll('.tab-link').forEach(link => {
  link.addEventListener('click', (e) => {
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

// ── External links per club ───────────────────────────────────────────────────

const TEAM_LINKS = {
  arsenal: {
    website: 'https://www.arsenal.com',
    instagram: 'https://www.instagram.com/arsenal',
    store: 'https://arsenaldirect.arsenal.com',
  },
  chelsea: {
    website: 'https://www.chelseafc.com',
    instagram: 'https://www.instagram.com/chelseafc',
    store: 'https://www.chelseamegastore.com',
  },
  liverpool: {
    website: 'https://www.liverpoolfc.com',
    instagram: 'https://www.instagram.com/liverpoolfc',
    store: 'https://store.liverpoolfc.com',
  },
  mancity: {
    website: 'https://www.mancity.com',
    instagram: 'https://www.instagram.com/mancity',
    store: 'https://shop.mancity.com',
  },
  manutd: {
    website: 'https://www.manutd.com',
    instagram: 'https://www.instagram.com/manutd',
    store: 'https://store.manutd.com',
  },
  tottenham: {
    website: 'https://www.tottenhamhotspur.com',
    instagram: 'https://www.instagram.com/spursofficial',
    store: 'https://www.tottenhamhotspur.com/shop',
  },
};

// ── Load team data ────────────────────────────────────────────────────────────

async function loadTeam() {
  try {
    const teams = await apiFetch('/api/teams');
    const teamBasic = teams.find(t => t.slug === slug);
    if (!teamBasic) return;

    const team = await apiFetch('/api/teams/' + teamBasic.id);
    if (!team) return;

    document.title = team.name + ' — Big6Hub';
    document.querySelector('.team-header h1').textContent = team.name;

    document.querySelectorAll('a[href^="season.html"]').forEach(a => {
      a.href = 'season.html?slug=' + slug;
    });

    const [players, seasons] = await Promise.all([
      apiFetch('/api/players?team_id=' + team.id),
      apiFetch('/api/seasons?team_id=' + team.id),
    ]);

    renderSquad(players);
    renderPlayersTab(players);
    renderSeasons(seasons);
    renderInfo(team);
    renderTrophies(team.trophies || []);
    renderLinks(slug);

  } catch (err) {
    console.error('Failed to load team:', err.message);
  }
}

// ── Render current squad (home tab) ──────────────────────────────────────────

function renderSquad(players) {
  const tbody = document.querySelector('#home .main-squad .tbl tbody');
  if (!tbody) return;

  const squad = players.slice(0, 8);
  tbody.innerHTML = squad.length > 0 ? squad.map(p => `
    <tr>
      <td><a href="player.html?id=${p.id}&slug=${slug}">${escapeHtml(p.name)}</a></td>
      <td>${escapeHtml(p.position)}</td>
      <td>${p.goals ?? '—'}</td>
      <td>${p.assists ?? '—'}</td>
    </tr>
  `).join('') : '<tr><td colspan="4">No squad data.</td></tr>';
}

// ── Render players tab ────────────────────────────────────────────────────────

function renderPlayersTab(players) {
  const tbody = document.querySelector('#players .tbl tbody');
  if (!tbody) return;

  tbody.innerHTML = players.length > 0 ? players.map(p => `
    <tr>
      <td>
        <a href="player.html?id=${p.id}&slug=${slug}">${escapeHtml(p.name)}</a>
        ${p.is_legend ? '<span class="badge-legend">Legend</span>' : ''}
      </td>
      <td>${escapeHtml(p.position)}</td>
      <td>${p.goals ?? '—'}</td>
      <td>${p.assists ?? '—'}</td>
    </tr>
  `).join('') : '<tr><td colspan="4">No player data.</td></tr>';
}

// ── Render seasons tab ────────────────────────────────────────────────────────

function renderSeasons(seasons) {
  const tbody = document.querySelector('#seasons .tbl tbody');
  if (!tbody) return;

  if (!seasons || seasons.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No season data available.</td></tr>';
    return;
  }

  tbody.innerHTML = seasons.map(s => `
    <tr>
      <td><a href="season.html?id=${s.id}&slug=${slug}">${escapeHtml(s.season)}</a></td>
      <td>${s.wins ?? '—'}</td>
      <td>${s.draws ?? '—'}</td>
      <td>${s.losses ?? '—'}</td>
      <td>${s.final_position ?? '—'}</td>
    </tr>
  `).join('');

  const current = seasons[0];
  if (current) {
    const rows = document.querySelectorAll('#home .season-status .season-row');
    if (rows[0]) rows[0].querySelector('strong').textContent = current.final_position ? current.final_position + 'th' : '—';
    if (rows[1]) rows[1].querySelector('strong').textContent =
      `${current.wins ?? '—'} / ${current.draws ?? '—'} / ${current.losses ?? '—'}`;
  }
}

// ── Render information tab ────────────────────────────────────────────────────

function renderInfo(team) {
  const rows = document.querySelectorAll('#information .tbl tbody tr');
  if (rows[0]) rows[0].cells[1].textContent = team.city    || '—';
  if (rows[1]) rows[1].cells[1].textContent = team.stadium || '—';
  if (rows[2]) {
    rows[2].cells[1].textContent = team.manager || '—';
    const label = rows[2].querySelector('.info-label');
    if (label) label.textContent = 'Manager';
  }

  const infoText = document.querySelector('#information .info-text');
  if (infoText) infoText.textContent = team.name + ' is one of the Premier League Big 6 clubs, based in ' + (team.city || 'England') + '.';
}

// ── Render trophies tab ───────────────────────────────────────────────────────

function renderTrophies(trophies) {
  const counts = { League: 0, 'FA Cup': 0, 'League Cup': 0, UCL: 0, Europa: 0 };
  trophies.forEach(t => {
    const c = t.competition || '';
    if (/premier league|first division/i.test(c))      counts['League']++;
    else if (/fa cup/i.test(c))                        counts['FA Cup']++;
    else if (/league cup|carabao|efl/i.test(c))        counts['League Cup']++;
    else if (/champions league|european cup/i.test(c)) counts['UCL']++;
    else if (/europa/i.test(c))                        counts['Europa']++;
  });

  const pills = document.querySelectorAll('#trophies .stat-pill .val');
  const order = ['League', 'FA Cup', 'League Cup', 'UCL', 'Europa'];
  order.forEach((key, i) => {
    if (pills[i]) pills[i].textContent = counts[key] || '0';
  });

  const tbody = document.querySelector('#trophies .tbl tbody');
  if (!tbody) return;

  tbody.innerHTML = trophies.length > 0
    ? trophies.map(t => `
        <tr>
          <td>${escapeHtml(t.competition)}</td>
          <td>${escapeHtml(t.season)}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="2">No trophy data available.</td></tr>';
}

// ── Render external links ─────────────────────────────────────────────────────

function renderLinks(teamSlug) {
  const links = TEAM_LINKS[teamSlug];
  if (!links) return;

  const linkList = document.querySelector('.link-list');
  if (!linkList) return;

  linkList.innerHTML = `
    <a href="${links.website}"  class="link-item" target="_blank" rel="noopener">Official Website</a>
    <a href="${links.instagram}" class="link-item" target="_blank" rel="noopener">Instagram</a>
    <a href="${links.store}"    class="link-item" target="_blank" rel="noopener">Official Store</a>
  `;
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', loadTeam);
