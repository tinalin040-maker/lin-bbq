// Netlify Function v1 — 最新消息 API
// 使用 GitHub Gist 儲存，不需要任何 npm 套件

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

async function readNews() {
  const res  = await fetch(GIST_API, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'lin-bbq' }
  });
  const json = await res.json();
  const raw  = json.files?.[GIST_FILE]?.content ?? '[]';
  return JSON.parse(raw);
}

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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors };
  }

  try {
    if (event.httpMethod === 'GET') {
      const list = await readNews();
      list.sort((a, b) => b.createdAt - a.createdAt);
      return { statusCode: 200, headers: cors, body: JSON.stringify(list) };
    }

    if (event.httpMethod === 'POST') {
      const { title, content, password } = JSON.parse(event.body || '{}');
      if (password !== ADMIN_PASSWORD)
        return { statusCode: 401, headers: cors, body: JSON.stringify({ error: '密碼錯誤' }) };
      if (!title || !content)
        return { statusCode: 400, headers: cors, body: JSON.stringify({ error: '請填寫標題與內容' }) };

      const list = await readNews();
      const item = { id: Date.now().toString(), title, content, createdAt: Date.now() };
      list.push(item);
      await writeNews(list);
      return { statusCode: 201, headers: cors, body: JSON.stringify({ id: item.id }) };
    }

    if (event.httpMethod === 'DELETE') {
      const { id, password } = JSON.parse(event.body || '{}');
      if (password !== ADMIN_PASSWORD)
        return { statusCode: 401, headers: cors, body: JSON.stringify({ error: '密碼錯誤' }) };

      const list = await readNews();
      await writeNews(list.filter(n => n.id !== id));
      return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error('news error:', err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};
