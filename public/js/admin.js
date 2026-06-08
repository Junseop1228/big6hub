// admin.js — Admin CRUD console
// Loaded only on admin.html

sessionRequireAdmin();

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
  div.textContent = str || '';
  return div.innerHTML;
}

function showError(msg) {
  alert('Error: ' + msg);
}

const TEAM_NAMES = {
  57: 'Arsenal', 61: 'Chelsea', 64: 'Liverpool',
  65: 'Manchester City', 66: 'Manchester United', 73: 'Tottenham',
};

// ── TEAMS ─────────────────────────────────────────────────────────────────────

let teamsData = [];
let editingTeamId = null;

async function loadTeams() {
  try {
    teamsData = await apiFetch('/api/teams');
    renderTeams();
  } catch (err) {
    showError(err.message);
  }
}

function renderTeams() {
  const tbody = document.getElementById('teams-tbody');
  if (!teamsData.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">No teams found.</td></tr>';
    return;
  }
  tbody.innerHTML = teamsData.map(t => `
    <tr>
      <td>${escapeHtml(t.name)}</td>
      <td>${escapeHtml(t.stadium)}</td>
      <td>${escapeHtml(t.city)}</td>
      <td>${escapeHtml(t.manager)}</td>
      <td>
        <button class="admin-btn-edit" data-action="edit-team" data-id="${t.id}">Edit</button>
      </td>
    </tr>
  `).join('');
}

// event delegation — teams table
document.getElementById('teams-tbody').addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  if (btn.dataset.action === 'edit-team') startEditTeam(Number(btn.dataset.id));
});

function startEditTeam(id) {
  const team = teamsData.find(t => t.id === id);
  if (!team) return;
  editingTeamId = id;
  document.getElementById('team-stadium').value  = team.stadium || '';
  document.getElementById('team-city').value     = team.city    || '';
  document.getElementById('team-manager').value  = team.manager || '';
  document.getElementById('form-team-title').textContent = 'Edit: ' + team.name;
  document.getElementById('form-team').style.display = 'block';
  document.getElementById('form-team').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.getElementById('btn-cancel-team').addEventListener('click', () => {
  document.getElementById('form-team').style.display = 'none';
  editingTeamId = null;
});

document.getElementById('btn-save-team').addEventListener('click', async () => {
  if (!editingTeamId) return;
  try {
    await apiFetch('/api/teams/' + editingTeamId, {
      method: 'PUT',
      body: JSON.stringify({
        stadium: document.getElementById('team-stadium').value.trim(),
        city:    document.getElementById('team-city').value.trim(),
        manager: document.getElementById('team-manager').value.trim(),
      }),
    });
    document.getElementById('form-team').style.display = 'none';
    editingTeamId = null;
    await loadTeams();
  } catch (err) {
    showError(err.message);
  }
});

// ── PLAYERS ───────────────────────────────────────────────────────────────────

let playersData = [];
let editingPlayerId = null;

async function loadPlayers() {
  try {
    playersData = await apiFetch('/api/players');
    renderPlayers();
  } catch (err) {
    showError(err.message);
  }
}

function renderPlayers() {
  const tbody = document.getElementById('players-tbody');
  if (!playersData.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">No players found.</td></tr>';
    return;
  }
  tbody.innerHTML = playersData.map(p => `
    <tr>
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.position)}</td>
      <td>${escapeHtml(TEAM_NAMES[p.team_id] || String(p.team_id))}</td>
      <td>${p.is_legend ? 'Yes' : 'No'}</td>
      <td>
        <button class="admin-btn-edit"   data-action="edit-player"   data-id="${p.id}">Edit</button>
        <button class="admin-btn-delete" data-action="delete-player" data-id="${p.id}">Delete</button>
      </td>
    </tr>
  `).join('');
}

// event delegation — players table
document.getElementById('players-tbody').addEventListener('click', async e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.action === 'edit-player')   startEditPlayer(id);
  if (btn.dataset.action === 'delete-player') await deletePlayer(id);
});

document.getElementById('btn-add-player').addEventListener('click', () => {
  editingPlayerId = null;
  document.getElementById('player-name').value     = '';
  document.getElementById('player-position').value = '';
  document.getElementById('player-team').value     = '';
  document.getElementById('player-legend').value   = '0';
  document.getElementById('form-player-title').textContent = 'Add Player';
  document.getElementById('form-player').style.display = 'block';
});

document.getElementById('btn-cancel-player').addEventListener('click', () => {
  document.getElementById('form-player').style.display = 'none';
  editingPlayerId = null;
});

function startEditPlayer(id) {
  const player = playersData.find(p => p.id === id);
  if (!player) return;
  editingPlayerId = id;
  document.getElementById('player-name').value     = player.name     || '';
  document.getElementById('player-position').value = player.position || '';
  document.getElementById('player-team').value     = player.team_id  || '';
  document.getElementById('player-legend').value   = player.is_legend ? '1' : '0';
  document.getElementById('form-player-title').textContent = 'Edit Player';
  document.getElementById('form-player').style.display = 'block';
}

document.getElementById('btn-save-player').addEventListener('click', async () => {
  const name      = document.getElementById('player-name').value.trim();
  const position  = document.getElementById('player-position').value.trim();
  const team_id   = Number(document.getElementById('player-team').value);
  const is_legend = Number(document.getElementById('player-legend').value);

  if (!name || !position || !team_id) {
    showError('Name, position, and team are required.');
    return;
  }
  try {
    if (editingPlayerId) {
      await apiFetch('/api/players/' + editingPlayerId, {
        method: 'PUT',
        body: JSON.stringify({ name, position, team_id, is_legend }),
      });
    } else {
      await apiFetch('/api/players', {
        method: 'POST',
        body: JSON.stringify({ name, position, team_id, is_legend }),
      });
    }
    document.getElementById('form-player').style.display = 'none';
    editingPlayerId = null;
    await loadPlayers();
  } catch (err) {
    showError(err.message);
  }
});

async function deletePlayer(id) {
  if (!confirm('Delete this player?')) return;
  try {
    await apiFetch('/api/players/' + id, { method: 'DELETE' });
    await loadPlayers();
  } catch (err) {
    showError(err.message);
  }
}

// ── SEASONS ───────────────────────────────────────────────────────────────────

let seasonsData = [];
let editingSeasonId = null;

async function loadSeasons() {
  try {
    seasonsData = await apiFetch('/api/seasons');
    renderSeasons();
  } catch (err) {
    showError(err.message);
  }
}

function renderSeasons() {
  const tbody = document.getElementById('seasons-tbody');
  if (!seasonsData.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="admin-empty">No seasons found.</td></tr>';
    return;
  }
  tbody.innerHTML = seasonsData.map(s => `
    <tr>
      <td>${escapeHtml(s.season)}</td>
      <td>${escapeHtml(TEAM_NAMES[s.team_id] || String(s.team_id))}</td>
      <td>${s.wins           ?? '—'}</td>
      <td>${s.draws          ?? '—'}</td>
      <td>${s.losses         ?? '—'}</td>
      <td>${s.final_position ?? '—'}</td>
      <td>
        <button class="admin-btn-edit"   data-action="edit-season"   data-id="${s.id}">Edit</button>
        <button class="admin-btn-delete" data-action="delete-season" data-id="${s.id}">Delete</button>
      </td>
    </tr>
  `).join('');
}

// event delegation — seasons table
document.getElementById('seasons-tbody').addEventListener('click', async e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.action === 'edit-season')   startEditSeason(id);
  if (btn.dataset.action === 'delete-season') await deleteSeason(id);
});

document.getElementById('btn-add-season').addEventListener('click', () => {
  editingSeasonId = null;
  document.getElementById('season-name').value     = '';
  document.getElementById('season-team').value     = '';
  document.getElementById('season-wins').value     = '';
  document.getElementById('season-draws').value    = '';
  document.getElementById('season-losses').value   = '';
  document.getElementById('season-position').value = '';
  document.getElementById('form-season-title').textContent = 'Add Season';
  document.getElementById('form-season').style.display = 'block';
});

document.getElementById('btn-cancel-season').addEventListener('click', () => {
  document.getElementById('form-season').style.display = 'none';
  editingSeasonId = null;
});

function startEditSeason(id) {
  const season = seasonsData.find(s => s.id === id);
  if (!season) return;
  editingSeasonId = id;
  document.getElementById('season-name').value     = season.season         || '';
  document.getElementById('season-team').value     = season.team_id        || '';
  document.getElementById('season-wins').value     = season.wins           ?? '';
  document.getElementById('season-draws').value    = season.draws          ?? '';
  document.getElementById('season-losses').value   = season.losses         ?? '';
  document.getElementById('season-position').value = season.final_position ?? '';
  document.getElementById('form-season-title').textContent = 'Edit Season';
  document.getElementById('form-season').style.display = 'block';
}

document.getElementById('btn-save-season').addEventListener('click', async () => {
  const season         = document.getElementById('season-name').value.trim();
  const team_id        = Number(document.getElementById('season-team').value);
  const wins           = Number(document.getElementById('season-wins').value)     || 0;
  const draws          = Number(document.getElementById('season-draws').value)    || 0;
  const losses         = Number(document.getElementById('season-losses').value)   || 0;
  const final_position = Number(document.getElementById('season-position').value) || null;

  if (!season || !team_id) {
    showError('Season name and team are required.');
    return;
  }
  try {
    if (editingSeasonId) {
      await apiFetch('/api/seasons/' + editingSeasonId, {
        method: 'PUT',
        body: JSON.stringify({ season, team_id, wins, draws, losses, final_position }),
      });
    } else {
      await apiFetch('/api/seasons', {
        method: 'POST',
        body: JSON.stringify({ season, team_id, wins, draws, losses, final_position }),
      });
    }
    document.getElementById('form-season').style.display = 'none';
    editingSeasonId = null;
    await loadSeasons();
  } catch (err) {
    showError(err.message);
  }
});

async function deleteSeason(id) {
  if (!confirm('Delete this season?')) return;
  try {
    await apiFetch('/api/seasons/' + id, { method: 'DELETE' });
    await loadSeasons();
  } catch (err) {
    showError(err.message);
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadTeams();
  loadPlayers();
  loadSeasons();
});
