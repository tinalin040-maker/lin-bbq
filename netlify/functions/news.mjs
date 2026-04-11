// Netlify Function — 最新消息 API
// 使用 GitHub Gist 儲存資料（公開可讀，寫入需 token）

const ADMIN_PASSWORD = '0986';
const GIST_ID        = process.env.GIST_ID;
const GITHUB_TOKEN   = process.env.GITHUB_TOKEN;
const GIST_FILE      = 'news-data.json';
const GIST_API       = `https://api.github.com/gists/${GIST_ID}`;

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
};

// --- 讀取 Gist 內容 ---
async function readNews() {
  const res  = await fetch(GIST_API, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'lin-bbq' }
  });
  const json = await res.json();
  const raw  = json.files?.[GIST_FILE]?.content ?? '[]';
  return JSON.parse(raw);
}

// --- 寫回 Gist ---
async function writeNews(list) {
  await fetch(GIST_API, {
    method:  'PATCH',
    headers: {
      Authorization:  `token ${GITHUB_TOKEN}`,
      'User-Agent':   'lin-bbq',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: { [GIST_FILE]: { content: JSON.stringify(list) } }
    }),
  });
}

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    // GET — 讀取所有消息
    if (request.method === 'GET') {
      const list = await readNews();
      list.sort((a, b) => b.createdAt - a.createdAt);
      return new Response(JSON.stringify(list), { status: 200, headers: cors });
    }

    // POST — 新增消息
    if (request.method === 'POST') {
      const { title, content, password } = await request.json();
      if (password !== ADMIN_PASSWORD)
        return new Response(JSON.stringify({ error: '密碼錯誤' }), { status: 401, headers: cors });
      if (!title || !content)
        return new Response(JSON.stringify({ error: '請填寫標題與內容' }), { status: 400, headers: cors });

      const list = await readNews();
      const item = { id: Date.now().toString(), title, content, createdAt: Date.now() };
      list.push(item);
      await writeNews(list);
      return new Response(JSON.stringify({ id: item.id }), { status: 201, headers: cors });
    }

    // DELETE — 刪除消息
    if (request.method === 'DELETE') {
      const { id, password } = await request.json();
      if (password !== ADMIN_PASSWORD)
        return new Response(JSON.stringify({ error: '密碼錯誤' }), { status: 401, headers: cors });

      const list = await readNews();
      await writeNews(list.filter(n => n.id !== id));
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors });

  } catch (err) {
    console.error('news error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors });
  }
};

export const config = { path: '/.netlify/functions/news' };
