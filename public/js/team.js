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

// ── Load team data ────────────────────────────────────────────────────────────

async function loadTeam() {
  try {
    const teams = await apiFetch('/api/teams');
    const team  = teams.find(t => t.slug === slug);
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

  // current season box (most recent)
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

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', loadTeam);
