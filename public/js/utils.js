const TEAM_COLORS = {
  arsenal:   '#CE3023',
  chelsea:   '#2D468F',
  liverpool: '#AD2C35',
  mancity:   '#A5C0E3',
  manutd:    '#BC2B22',
  tottenham: '#192148',
};

const slug = new URLSearchParams(window.location.search).get('slug');
document.documentElement.style.setProperty('--team-color', TEAM_COLORS[slug] || '#333333');

const backLink = document.querySelector('.back-link');
if (backLink && slug) backLink.href = backLink.href.split('?')[0] + '?slug=' + slug;