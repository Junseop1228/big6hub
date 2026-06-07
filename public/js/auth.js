const tab = new URLSearchParams(window.location.search).get('tab');
if (tab === 'register') document.querySelector('[data-tab="register"]').click();

document.querySelectorAll('.auth-tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('form-' + t.dataset.tab).classList.add('active');
    document.getElementById('alert').className = 'alert';
  });
});