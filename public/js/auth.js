// auth.js — login / signup form handlers
// Loaded only on auth.html

// ── Tab switching ─────────────────────────────────────────────────────────────

const tabLinks  = document.querySelectorAll('.auth-tab-link');
const tabPanels = document.querySelectorAll('.auth-tab-panel');

tabLinks.forEach(link => {
  link.addEventListener('click', () => {
    tabLinks.forEach(l  => l.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(link.dataset.tab).classList.add('active');
    clearErrors();
  });
});

// ── Error helpers ─────────────────────────────────────────────────────────────

function showError(elId, msg) {
  const el = document.getElementById(elId);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function clearErrors() {
  document.querySelectorAll('.auth-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}

// ── Login ─────────────────────────────────────────────────────────────────────

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      showError('login-error', 'Please fill in all fields.');
      return;
    }

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      sessionSave(data.token, data.user);

      // redirect: admin → admin.html, user → index.html
      window.location.href = sessionIsAdmin() ? 'admin.html' : 'index.html';

    } catch (err) {
      showError('login-error', err.message || 'Login failed. Please try again.');
    }
  });
}

// ── Sign up ───────────────────────────────────────────────────────────────────

const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm  = document.getElementById('signup-confirm').value;

    if (!email || !password || !confirm) {
      showError('signup-error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirm) {
      showError('signup-error', 'Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      showError('signup-error', 'Password must be at least 8 characters.');
      return;
    }

    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // auto-login after successful registration
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      sessionSave(data.token, data.user);
      window.location.href = 'index.html';

    } catch (err) {
      showError('signup-error', err.message || 'Sign up failed. Please try again.');
    }
  });
}
