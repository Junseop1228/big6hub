// season.js — season detail page API integration
// Loaded only on season.html

// slug is declared in utils.js
const seasonParams = new URLSearchParams(window.location.search);
const seasonId = seasonParams.get('id');

// ── Tab switching ─────────────────────────────────────────────────────────────

document.querySelectorAll('.side-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.side-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.sec').forEach(s => s.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(link.dataset.sec).classList.add('active');
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '—';
  return div.innerHTML;
}

// ── Load season data ──────────────────────────────────────────────────────────

async function loadSeason() {
  if (!seasonId) return;

  try {
    const [season, teams] = await Promise.all([
      apiFetch('/api/seasons/' + seasonId),
      apiFetch('/api/teams'),
    ]);

    const team = teams.find(t => t.id === season.team_id);
    const teamName = team ? team.name : '—';
    const teamSlug = team ? team.slug : (slug || '');

    // Update header
    document.querySelector('.team-header h1').textContent = season.season || 'Season';
    document.title = (season.season || 'Season') + ' — Big6Hub';

    // Back link
    const backLink = document.querySelector('.back-link');
    if (backLink) {
      backLink.href = 'team.html?slug=' + teamSlug;
      backLink.textContent = '← ' + teamName;
    }

    // Apply team color
    if (team && team.slug && typeof TEAM_COLORS !== 'undefined') {
      document.documentElement.style.setProperty('--team-color', TEAM_COLORS[team.slug] || '#333333');
    }

    renderSummary(season);

    // Load squad (players of this team)
    const players = await apiFetch('/api/players?team_id=' + season.team_id);
    renderSquad(players, teamSlug);

  } catch (err) {
    console.error('Failed to load season:', err.message);
  }
}

// ── Render summary tab ────────────────────────────────────────────────────────

function renderSummary(season) {
  const rows = document.querySelectorAll('#summary .tbl tbody tr');
  // Premier League row
  if (rows[0]) {
    rows[0].cells[1].textContent = season.wins    ?? '—';
    rows[0].cells[2].textContent = season.draws   ?? '—';
    rows[0].cells[3].textContent = season.losses  ?? '—';
    rows[0].cells[4].textContent = season.final_position ? season.final_position + 'th' : '—';
  }
  // Other competitions — no data in DB, show dashes
  for (let i = 1; i < rows.length; i++) {
    rows[i].cells[1].textContent = '—';
    rows[i].cells[2].textContent = '—';
    rows[i].cells[3].textContent = '—';
    rows[i].cells[4].textContent = '—';
  }
}

// ── Render squad tab ──────────────────────────────────────────────────────────

function renderSquad(players, teamSlug) {
  const tbody = document.querySelector('#squad .tbl tbody');
  if (!tbody) return;

  tbody.innerHTML = players.length > 0
    ? players.map((p, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><a href="player.html?id=${p.id}&slug=${teamSlug}">${escapeHtml(p.name)}</a></td>
          <td>${escapeHtml(p.position)}</td>
          <td>${p.goals ?? '—'}</td>
          <td>${p.assists ?? '—'}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="5">No squad data available.</td></tr>';
}

// ── Match Results — no match data in DB, keep static UI ──────────────────────

document.querySelectorAll('.match-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.match-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', loadSeason);
