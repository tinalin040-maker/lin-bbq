// ============================================
// 林燒烤 News Admin System
// ============================================

const ADMIN_PASSWORD = '0986';
const STORAGE_KEY    = 'lin_bbq_news';

// ---------- Data Helpers ----------
function getNews() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function saveNews(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function isAdminLoggedIn() {
  return sessionStorage.getItem('lin_admin') === '1';
}

// ---------- Render News ----------
function renderNews() {
  const list      = getNews();
  const container = document.getElementById('newsList');
  const isAdmin   = isAdminLoggedIn();

  if (!container) return;

  if (isAdmin) {
    document.body.classList.add('admin-active');
  }

  if (list.length === 0) {
    container.innerHTML = '<p class="news-empty">目前暫無最新消息，敬請期待。</p>';
    return;
  }

  container.innerHTML = list
    .slice()
    .sort((a, b) => b.id - a.id)
    .map(item => `
      <div class="news-card" data-id="${item.id}">
        <div class="news-body">
          <div class="news-date">${formatDate(item.id)}</div>
          <h3>${escHtml(item.title)}</h3>
          <p>${escHtml(item.content)}</p>
        </div>
        <button class="news-delete-btn" onclick="deleteNews(${item.id})">刪除</button>
      </div>
    `).join('');
}

function formatDate(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()} / ${String(d.getMonth()+1).padStart(2,'0')} / ${String(d.getDate()).padStart(2,'0')}`;
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

// ---------- Delete ----------
window.deleteNews = function(id) {
  if (!isAdminLoggedIn()) return;
  if (!confirm('確定要刪除這則消息嗎？')) return;
  const updated = getNews().filter(n => n.id !== id);
  saveNews(updated);
  renderNews();
};

// ---------- Admin Login ----------
document.addEventListener('DOMContentLoaded', () => {

  renderNews();

  const loginForm   = document.getElementById('loginForm');
  const pwInput     = document.getElementById('pwInput');
  const loginError  = document.getElementById('loginError');
  const adminPanel  = document.getElementById('adminPanel');
  const loginBox    = document.getElementById('adminLoginBox');

  // If already logged in, show panel
  if (isAdminLoggedIn()) {
    showAdminPanel();
  }

  // Login
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pw = pwInput.value.trim();
      if (pw === ADMIN_PASSWORD) {
        sessionStorage.setItem('lin_admin', '1');
        loginError.style.display = 'none';
        showAdminPanel();
        renderNews();
      } else {
        loginError.style.display = 'block';
        pwInput.value = '';
        pwInput.focus();
      }
    });
  }

  // Add news form
  const addForm = document.getElementById('addNewsForm');
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!isAdminLoggedIn()) return;

      const titleInput   = document.getElementById('newsTitle');
      const contentInput = document.getElementById('newsContent');
      const title   = titleInput.value.trim();
      const content = contentInput.value.trim();

      if (!title || !content) return;

      const list = getNews();
      list.push({ id: Date.now(), title, content });
      saveNews(list);
      titleInput.value   = '';
      contentInput.value = '';
      renderNews();

      // Scroll to news list
      document.getElementById('newsList')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('lin_admin');
      document.body.classList.remove('admin-active');
      if (adminPanel)  adminPanel.classList.remove('active');
      if (loginBox)    loginBox.style.display = 'block';
      renderNews();
    });
  }

  function showAdminPanel() {
    if (loginBox)   loginBox.style.display = 'none';
    if (adminPanel) adminPanel.classList.add('active');
    document.body.classList.add('admin-active');
  }
});
