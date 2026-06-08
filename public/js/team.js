document.querySelectorAll('a[href^="season.html"]').forEach(a => {
  a.href = 'season.html?slug=' + slug;
});
document.querySelectorAll('a[href^="player.html"]').forEach(a => {
  a.href = 'player.html?slug=' + slug;
});
document.querySelectorAll('.tab-link').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(link.dataset.tab).classList.add('active');
  });
});