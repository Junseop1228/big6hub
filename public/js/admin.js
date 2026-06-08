sessionRequireAdmin();

document.querySelectorAll('.tab-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(link.dataset.tab).classList.add('active');
  });
});

document.getElementById('btn-add-player').addEventListener('click', () => {
  document.getElementById('form-player').style.display = 'block';
});
document.getElementById('btn-cancel-player').addEventListener('click', () => {
  document.getElementById('form-player').style.display = 'none';
});

document.getElementById('btn-add-season').addEventListener('click', () => {
  document.getElementById('form-season').style.display = 'block';
});
document.getElementById('btn-cancel-season').addEventListener('click', () => {
  document.getElementById('form-season').style.display = 'none';
});