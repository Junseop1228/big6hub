// auth.js — login / register form handlers
// Loaded only on auth.html

// ── Tab switching ─────────────────────────────────────────────────────────────

document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('form-' + tab.dataset.tab).classList.add('active');
    clearAlert();
  });
});

// ── Alert helpers ─────────────────────────────────────────────────────────────

function showAlert(msg, isError = true) {
  const el = document.getElementById('alert');
  if (!el) return;
  el.textContent = msg;
  el.className = 'alert ' + (isError ? 'alert-error' : 'alert-success');
  el.style.display = 'block';
}

function clearAlert() {
  const el = document.getElementById('alert');
  if (!el) return;
  el.textContent = '';
  el.style.display = 'none';
}

// ── Login ─────────────────────────────────────────────────────────────────────

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showAlert('Please fill in all fields.');
    return;
  }

  try {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    sessionSave(data.token, data.user);
    window.location.href = 'index.html';

  } catch (err) {
    showAlert(err.message || 'Login failed. Please try again.');
  }
});

// ── Register ──────────────────────────────────────────────────────────────────

document.getElementById('form-register').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();

  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;

  if (!email || !password || !confirm) {
    showAlert('Please fill in all fields.');
    return;
  }

  if (password !== confirm) {
    showAlert('Passwords do not match.');
    return;
  }

  if (password.length < 8) {
    showAlert('Password must be at least 8 characters.');
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
    showAlert(err.message || 'Sign up failed. Please try again.');
  }
});
