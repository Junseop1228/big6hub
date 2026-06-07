document.querySelectorAll('.side-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.side-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.sec').forEach(s => s.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(link.dataset.sec).classList.add('active');
  });
});

const matchData = {
  pl:  [['—','—','— : —','—','w'],['—','—','— : —','—','l'],['—','—','— : —','—','d']],
  ucl: [['—','—','— : —','—','w']],
  fa:  [['—','—','— : —','—','w']],
  lc:  [['—','—','— : —','—','w']],
};

function renderMatches(comp) {
  const tbody = document.querySelector('#comp-pl tbody');
  tbody.innerHTML = matchData[comp].map(r =>
    `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td><span class="rb ${r[4]}">${r[4].toUpperCase()}</span></td></tr>`
  ).join('');
}

document.querySelectorAll('.match-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.match-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMatches(btn.dataset.comp);
  });
});

renderMatches('pl');