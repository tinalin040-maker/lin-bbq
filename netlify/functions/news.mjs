// Netlify Function v2 — 最新消息 API
// v2 格式可讓 Netlify 自動注入 Blobs 所需憑證

import { getStore } from '@netlify/blobs';

const ADMIN_PASSWORD = '0986';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default async (request) => {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const store = getStore({
    name: 'lin-bbq-news',
    consistency: 'strong',
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_TOKEN,
  });

  try {
    // GET — 讀取所有消息
    if (request.method === 'GET') {
      const { blobs } = await store.list();
      const news = await Promise.all(
        blobs.map(async ({ key }) => {
          const item = await store.get(key, { type: 'json' });
          return { id: key, ...item };
        })
      );
      news.sort((a, b) => b.createdAt - a.createdAt);
      return new Response(JSON.stringify(news), { status: 200, headers: corsHeaders });
    }

    // POST — 新增消息
    if (request.method === 'POST') {
      const { title, content, password } = await request.json();
      if (password !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: '密碼錯誤' }), { status: 401, headers: corsHeaders });
      }
      if (!title || !content) {
        return new Response(JSON.stringify({ error: '請填寫標題與內容' }), { status: 400, headers: corsHeaders });
      }
      const id = Date.now().toString();
      await store.setJSON(id, { title, content, createdAt: Date.now() });
      return new Response(JSON.stringify({ id }), { status: 201, headers: corsHeaders });
    }

    // DELETE — 刪除消息
    if (request.method === 'DELETE') {
      const { id, password } = await request.json();
      if (password !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: '密碼錯誤' }), { status: 401, headers: corsHeaders });
      }
      await store.delete(id);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });

  } catch (err) {
    console.error('news function error:', err);
    return new Response(JSON.stringify({ error: '伺服器錯誤：' + err.message }), { status: 500, headers: corsHeaders });
  }
};

export const config = {
  path: '/.netlify/functions/news',
};
