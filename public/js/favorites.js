document.querySelectorAll('.fav-scroll-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const scroll = btn.closest('.fav-scroll-wrap').querySelector('.fav-players-scroll');
    scroll.scrollLeft += btn.classList.contains('left') ? -150 : 150;
  });
});

document.addEventListener('click', e => {
  if (!e.target.classList.contains('fav-remove-btn')) return;
  e.preventDefault();
  e.stopPropagation();
  e.target.closest('.fav-player-card').remove();
});