document.querySelectorAll('.side-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.side-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.sec').forEach(s => s.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(link.dataset.sec).classList.add('active');
  });
});

document.querySelectorAll('.match-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.match-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('[id^="comp-"]').forEach(t => t.style.display = 'none');
    btn.classList.add('active');
    document.getElementById('comp-' + btn.dataset.comp).style.display = 'table';
  });
});