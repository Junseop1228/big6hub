// news.js — renders the team's news tab (#news-list) on team.html.
// `slug` comes from utils.js, `apiFetch` from api.js (both loaded earlier).

// format an RSS pubDate into a short readable date, e.g. "3 Jun 2026"
function formatNewsDate(pubDate) {
  if (!pubDate) return '';
  const d = new Date(pubDate);
  if (isNaN(d.getTime())) return pubDate; // fall back to raw string
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function loadNews() {
  const list = document.getElementById('news-list');
  if (!list) return; // news tab not on this page

  try {
    // find this team's id from the slug (same approach as team.js)
    const teams = await apiFetch('/api/teams');
    const team = teams.find(t => t.slug === slug);
    if (!team) return;

    const news = await apiFetch('/api/news?team_id=' + team.id);

    if (!news || news.length === 0) {
      list.textContent = 'No news available.';
      return;
    }

    list.innerHTML = '';
    news.forEach(article => {
      // each item is a link that opens the original article in a new tab
      const item = document.createElement('a');
      item.className = 'news-item';
      item.href = article.url || '#';
      item.target = '_blank';
      item.rel = 'noopener noreferrer';

      const date = document.createElement('div');
      date.className = 'news-date';
      date.textContent = formatNewsDate(article.published_at);

      const title = document.createElement('div');
      title.className = 'news-title';
      title.textContent = article.title;            // textContent = XSS-safe

      const desc = document.createElement('div');
      desc.className = 'news-desc';
      desc.textContent = article.description || '';

      item.appendChild(date);
      item.appendChild(title);
      item.appendChild(desc);
      list.appendChild(item);
    });
  } catch (err) {
    console.error('Failed to load news:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', loadNews);
