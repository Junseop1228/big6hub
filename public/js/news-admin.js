// news-admin.js — "Refresh News" button on the admin console (admin.html).
// Calls the admin-only POST /api/news/refresh; apiFetch attaches the JWT token.

const refreshNewsBtn = document.getElementById('btn-refresh-news');
if (refreshNewsBtn) {
  refreshNewsBtn.addEventListener('click', async () => {
    const status = document.getElementById('news-refresh-status');
    refreshNewsBtn.disabled = true;
    if (status) status.textContent = 'Refreshing…';
    try {
      const result = await apiFetch('/api/news/refresh', { method: 'POST' });
      if (status) status.textContent = `Done — ${result.stored} articles fetched.`;
    } catch (err) {
      if (status) status.textContent = 'Failed: ' + err.message;
    } finally {
      refreshNewsBtn.disabled = false;
    }
  });
}
