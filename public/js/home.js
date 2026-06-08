const TEAM_COLORS = {
  arsenal:   '#CE3023',
  chelsea:   '#2D468F',
  liverpool: '#AD2C35',
  mancity:   '#A5C0E3',
  manutd:    '#BC2B22',
  tottenham: '#192148',
};

async function loadTeams() {
  const teams = await apiFetch('/api/teams');
  const grid = document.getElementById('teams-grid');

  grid.innerHTML = teams.map(t => `
    <a href="team.html?slug=${t.slug}" class="team-card">
      <div class="team-card-img" style="background:${TEAM_COLORS[t.slug] || '#333'};"></div>
      <div class="team-card-body"><div class="name">${t.name}</div></div>
    </a>
  `).join('');
}

loadTeams();