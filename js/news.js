// ============================================
// 林燒烤 News System — Netlify Functions API
// ============================================

const API = '/.netlify/functions/news';
const ADMIN_PASSWORD = '0986';

function isAdminLoggedIn() {
  return sessionStorage.getItem('lin_admin') === '1';
}

// ---------- 讀取並顯示消息 ----------
async function renderNews() {
  const container = document.getElementById('newsList');
  if (!container) return;

  if (isAdminLoggedIn()) document.body.classList.add('admin-active');

  container.innerHTML = '<p class="news-empty">載入中…</p>';

  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const news = await res.json();

    if (!Array.isArray(news) || news.length === 0) {
      container.innerHTML = '<p class="news-empty">目前暫無最新消息，敬請期待。</p>';
      return;
    }

    container.innerHTML = news.map(item => `
      <div class="news-card" data-id="${item.id}">
        <div class="news-body">
          <div class="news-date">${formatDate(item.createdAt)}</div>
          <h3>${escHtml(item.title)}</h3>
          <p>${escHtml(item.content)}</p>
        </div>
        <button class="news-delete-btn" onclick="deleteNews('${item.id}')">刪除</button>
      </div>
    `).join('');

  } catch (err) {
    console.error('讀取消息失敗', err);
    container.innerHTML = '<p class="news-empty">讀取失敗，請重新整理頁面。</p>';
  }
}

// ---------- 刪除消息 ----------
window.deleteNews = async function(id) {
  if (!isAdminLoggedIn()) return;
  if (!confirm('確定要刪除這則消息嗎？')) return;
  try {
    await fetch(API, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password: ADMIN_PASSWORD })
    });
    renderNews();
  } catch (err) {
    console.error('刪除失敗', err);
    alert('刪除失敗，請再試一次。');
  }
};

// ---------- 工具函式 ----------
function formatDate(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()} / ${String(d.getMonth()+1).padStart(2,'0')} / ${String(d.getDate()).padStart(2,'0')}`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

// ---------- 管理員登入 ----------
document.addEventListener('DOMContentLoaded', () => {

  renderNews();

  const loginForm  = document.getElementById('loginForm');
  const pwInput    = document.getElementById('pwInput');
  const loginError = document.getElementById('loginError');
  const adminPanel = document.getElementById('adminPanel');
  const loginBox   = document.getElementById('adminLoginBox');

  if (isAdminLoggedIn()) showAdminPanel();

  // 登入
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

  // 新增消息
  const addForm = document.getElementById('addNewsForm');
  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!isAdminLoggedIn()) return;

      const titleInput   = document.getElementById('newsTitle');
      const contentInput = document.getElementById('newsContent');
      const title   = titleInput.value.trim();
      const content = contentInput.value.trim();
      if (!title || !content) return;

      const submitBtn = addForm.querySelector('button[type="submit"]');
      submitBtn.disabled    = true;
      submitBtn.textContent = '發布中…';

      try {
        const res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, password: ADMIN_PASSWORD })
        });

        if (!res.ok) throw new Error(await res.text());

        titleInput.value   = '';
        contentInput.value = '';
        await renderNews();
        document.getElementById('newsList')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      } catch (err) {
        console.error('新增失敗', err);
        alert('發布失敗，請再試一次。');
      } finally {
        submitBtn.disabled    = false;
        submitBtn.textContent = '發布消息';
      }
    });
  }

  // 登出
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('lin_admin');
      document.body.classList.remove('admin-active');
      if (adminPanel) adminPanel.classList.remove('active');
      if (loginBox)   loginBox.style.display = 'block';
      renderNews();
    });
  }

  function showAdminPanel() {
    if (loginBox)   loginBox.style.display = 'none';
    if (adminPanel) adminPanel.classList.add('active');
    document.body.classList.add('admin-active');
  }
});
