// Netlify Function: 最新消息 API
// 使用 Netlify Blobs 儲存資料（雲端，所有電腦共用）

const { getStore } = require('@netlify/blobs');

const ADMIN_PASSWORD = '0986';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  const store = getStore({ name: 'lin-bbq-news', consistency: 'strong' });

  try {
    // GET — 讀取所有消息
    if (event.httpMethod === 'GET') {
      const { blobs } = await store.list();
      const news = await Promise.all(
        blobs.map(async ({ key }) => {
          const item = await store.get(key, { type: 'json' });
          return { id: key, ...item };
        })
      );
      news.sort((a, b) => b.createdAt - a.createdAt);
      return { statusCode: 200, headers, body: JSON.stringify(news) };
    }

    // POST — 新增消息
    if (event.httpMethod === 'POST') {
      const { title, content, password } = JSON.parse(event.body || '{}');
      if (password !== ADMIN_PASSWORD) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: '密碼錯誤' }) };
      }
      if (!title || !content) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: '請填寫標題與內容' }) };
      }
      const id = Date.now().toString();
      await store.setJSON(id, { title, content, createdAt: Date.now() });
      return { statusCode: 201, headers, body: JSON.stringify({ id }) };
    }

    // DELETE — 刪除消息
    if (event.httpMethod === 'DELETE') {
      const { id, password } = JSON.parse(event.body || '{}');
      if (password !== ADMIN_PASSWORD) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: '密碼錯誤' }) };
      }
      await store.delete(id);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error('news function error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: '伺服器錯誤，請稍後再試' }) };
  }
};
