document.querySelectorAll('.tab-link').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(link.dataset.tab).classList.add('active');
  });
});

const TEAM_COLORS = {
  arsenal:   '#CE3023',
  chelsea:   '#2D468F',
  liverpool: '#AD2C35',
  mancity:   '#A5C0E3',
  manutd:    '#BC2B22',
  tottenham: '#192148',
};

const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');
const color = TEAM_COLORS[slug] || '#333333';

document.documentElement.style.setProperty('--team-color', color);