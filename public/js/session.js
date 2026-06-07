// session.js — JWT token storage and nav state management
// Loaded on every page. Manages login/logout and updates the global nav.

const TOKEN_KEY = 'big6hub_token';
const USER_KEY  = 'big6hub_user';

// ── Token helpers ────────────────────────────────────────────────────────────

function sessionGetToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function sessionGetUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

function sessionSave(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function sessionClear() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function sessionIsLoggedIn() {
  return !!sessionGetToken();
}

function sessionIsAdmin() {
  const user = sessionGetUser();
  return user && user.role === 'admin';
}

// ── Nav rendering ────────────────────────────────────────────────────────────

/**
 * Updates the .auth section of .global-nav based on login state.
 *
 * Logged-out  →  Log in | Sign up
 * Logged-in   →  My Favorites | (Admin) | Log out
 */
function sessionRenderNav() {
  const auth = document.querySelector('.auth');
  if (!auth) return;

  if (!sessionIsLoggedIn()) {
    auth.innerHTML = `
      <a href="auth.html" class="btn-login">Log in</a>
      <a href="auth.html" class="btn-signup">Sign up</a>
    `;
    return;
  }

  const user = sessionGetUser();
  const name = (user && user.email) ? user.email.split('@')[0] : 'Me';

  let adminLink = '';
  if (sessionIsAdmin()) {
    adminLink = `<a href="admin.html" class="btn-login">Admin</a>`;
  }

  auth.innerHTML = `
    <a href="favorites.html" class="btn-login">My Favorites</a>
    ${adminLink}
    <button class="btn-signup" id="btn-logout">Log out</button>
  `;

  document.getElementById('btn-logout').addEventListener('click', () => {
    sessionClear();
    window.location.href = 'index.html';
  });
}

// ── Auto-guard for protected pages ───────────────────────────────────────────

/**
 * Call at the top of any page that requires login.
 * Redirects to auth.html if no token is found.
 */
function sessionRequireLogin() {
  if (!sessionIsLoggedIn()) {
    window.location.href = 'auth.html';
  }
}

/**
 * Call at the top of any page that requires admin role.
 * Redirects to auth.html if not admin.
 */
function sessionRequireAdmin() {
  if (!sessionIsAdmin()) {
    window.location.href = 'auth.html';
  }
}

// ── Run on every page load ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', sessionRenderNav);
