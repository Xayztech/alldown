'use strict';

// ── Sidebar ────────────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebarClose = document.getElementById('sidebarClose');

function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburgerBtn.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

// Close sidebar on nav link click (mobile)
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth < 900) closeSidebar();
  });
});

// ── Platform chips → paste demo URLs ──────────────────────
const demoUrls = {
  youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  tiktok: 'https://www.tiktok.com/@username/video/1234567890',
  instagram: 'https://www.instagram.com/reel/ABC123/',
  twitter: 'https://twitter.com/user/status/1234567890',
  facebook: 'https://www.facebook.com/watch?v=1234567890',
  scribd: 'https://www.scribd.com/document/123456789/Document-Title'
};

const urlInput = document.getElementById('urlInput');

document.querySelectorAll('.plat-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const p = chip.dataset.p;
    if (demoUrls[p]) {
      urlInput.value = demoUrls[p];
      urlInput.focus();
    }
  });
});

document.querySelectorAll('[data-platform]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const p = link.dataset.platform;
    if (demoUrls[p]) {
      urlInput.value = demoUrls[p];
      document.getElementById('downloader').scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ── Downloader ─────────────────────────────────────────────
const downloadBtn = document.getElementById('downloadBtn');
const resultBox = document.getElementById('resultBox');
const formatSelect = document.getElementById('formatSelect');
const qualitySelect = document.getElementById('qualitySelect');

downloadBtn.addEventListener('click', handleDownload);
urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleDownload(); });

async function handleDownload() {
  const url = urlInput.value.trim();
  if (!url) { urlInput.focus(); return; }

  const format = formatSelect.value;
  const quality = qualitySelect.value;

  resultBox.style.display = 'block';
  resultBox.innerHTML = `<div class="loading-dots"><span></span><span></span><span></span></div>`;
  downloadBtn.disabled = true;

  try {
    const params = new URLSearchParams({ url, format, quality });
    const res = await fetch(`/api/dl?${params}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.error || 'Unknown error');

    renderResult(data);
  } catch (err) {
    resultBox.innerHTML = `<div class="error-msg">❌ ${err.message}</div>`;
  } finally {
    downloadBtn.disabled = false;
  }
}

function renderResult(data) {
  const d = data.data;
  const platform = data.platform;

  let thumb = d.thumbnail || d.cover || '';
  let title = d.title || d.id || 'Media';
  let author = d.author?.nickname || d.author?.username || d.author || '';

  let formatsHtml = '';
  if (d.formats && d.formats.length) {
    formatsHtml = `<div class="formats-list">
      ${d.formats.map((f, i) => `
        <a class="fmt-btn ${i === 0 ? 'primary' : ''}" 
           href="${f.url || '#'}" 
           ${f.url && f.url !== '#' ? 'target="_blank" rel="noopener"' : ''}
           title="${f.label}">
          ${f.format.toUpperCase()} ${f.quality !== 'best' ? f.quality : ''} ${f.size ? '· '+f.size : ''}
        </a>
      `).join('')}
    </div>`;
  } else if (d.download) {
    const links = Object.entries(d.download).filter(([k,v]) => v && k !== 'note');
    formatsHtml = `<div class="formats-list">
      ${links.map(([k,v]) => `
        <a class="fmt-btn primary" href="${v}" target="_blank" rel="noopener">
          ⬇ ${k.replace(/_/g,' ').toUpperCase()}
        </a>
      `).join('')}
    </div>`;
  }

  const jsonPretty = JSON.stringify(data, null, 2);

  resultBox.innerHTML = `
    <div class="result-header">
      ${thumb ? `<img class="result-thumb" src="${thumb}" alt="${title}" onerror="this.style.display='none'"/>` : ''}
      <div class="result-meta">
        <span class="platform-tag">${platform.toUpperCase()}</span>
        <h3>${escHtml(title)}</h3>
        ${author ? `<p>by ${escHtml(typeof author === 'string' ? author : '')}</p>` : ''}
      </div>
    </div>
    ${formatsHtml}
    <details style="margin-top:16px">
      <summary style="cursor:pointer;color:var(--text2);font-size:13px;">📋 Raw JSON response</summary>
      <pre class="result-json">${escHtml(jsonPretty)}</pre>
    </details>
  `;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Search ─────────────────────────────────────────────────
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchLimit = document.getElementById('searchLimit');
let currentSearchType = 'youtube';

document.querySelectorAll('.stab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentSearchType = tab.dataset.type;
  });
});

searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSearch(); });

async function handleSearch() {
  const q = searchInput.value.trim();
  if (!q) { searchInput.focus(); return; }

  searchResults.innerHTML = `<div class="loading-dots"><span></span><span></span><span></span></div>`;
  searchBtn.disabled = true;

  try {
    const limit = parseInt(searchLimit.value) || 10;
    const params = new URLSearchParams({ q, type: currentSearchType, limit });
    const res = await fetch(`/api/search?${params}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.error || 'Search failed');

    renderSearchResults(data);
  } catch (err) {
    searchResults.innerHTML = `<div class="error-msg">❌ ${err.message}</div>`;
  } finally {
    searchBtn.disabled = false;
  }
}

function renderSearchResults(data) {
  if (!data.results || data.results.length === 0) {
    searchResults.innerHTML = `<div style="color:var(--text2);padding:20px 0">No results found.</div>`;
    return;
  }

  searchResults.innerHTML = data.results.map(r => {
    if (data.platform === 'youtube') {
      return `
        <a class="search-card" href="${r.url}" target="_blank" rel="noopener">
          <img class="search-card-thumb" src="${r.thumbnail}" alt="${escHtml(r.title)}" loading="lazy" onerror="this.style.display='none'"/>
          <div class="search-card-info">
            <h4>${escHtml(r.title)}</h4>
            <p>${escHtml(r.author)}</p>
            <div class="search-card-meta">
              ${r.duration ? `<span class="smeta">⏱ ${r.duration}</span>` : ''}
              ${r.views ? `<span class="smeta">👁 ${r.views}</span>` : ''}
              ${r.published ? `<span class="smeta">📅 ${r.published}</span>` : ''}
            </div>
          </div>
        </a>
      `;
    } else {
      return `
        <a class="search-card" href="${r.url || '#'}" target="_blank" rel="noopener">
          <div class="search-card-info">
            <h4>${escHtml(r.title || 'Result')}</h4>
            <p>${escHtml(r.description || '')}</p>
            ${r.source ? `<div class="search-card-meta"><span class="smeta">🌐 ${escHtml(r.source)}</span></div>` : ''}
          </div>
        </a>
      `;
    }
  }).join('');
}

// ── Code Snippets ──────────────────────────────────────────
const snippets = {
  curl: `# ── Download YouTube video ──────────────────────────────
curl "https://xayz-downloader.vercel.app/api/dl/youtube?url=https://youtu.be/VIDEO_ID&format=mp4&quality=720p"

# ── Auto-detect platform ─────────────────────────────────
curl "https://xayz-downloader.vercel.app/api/dl?url=https://www.tiktok.com/@user/video/ID"

# ── Search YouTube ───────────────────────────────────────
curl "https://xayz-downloader.vercel.app/api/search/youtube?q=lofi+music&limit=10"

# ── Get YouTube formats ──────────────────────────────────
curl "https://xayz-downloader.vercel.app/api/dl/youtube/formats?url=https://youtu.be/VIDEO_ID"`,

  js: `// ── Download YouTube video ──────────────────────────────
const BASE = 'https://xayz-downloader.vercel.app';

async function downloadYouTube(url, format = 'mp4', quality = '720p') {
  const res = await fetch(\`\${BASE}/api/dl/youtube?url=\${encodeURIComponent(url)}&format=\${format}&quality=\${quality}\`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

// ── Search YouTube ───────────────────────────────────────
async function searchYouTube(query, limit = 10) {
  const res = await fetch(\`\${BASE}/api/search/youtube?q=\${encodeURIComponent(query)}&limit=\${limit}\`);
  return res.json();
}

// ── Auto-detect platform ─────────────────────────────────
async function downloadAny(url) {
  const res = await fetch(\`\${BASE}/api/dl?url=\${encodeURIComponent(url)}\`);
  return res.json();
}

// Usage
const result = await downloadYouTube('https://youtu.be/dQw4w9WgXcQ');
console.log(result.data.title, result.data.formats);`,

  python: `import requests

BASE = 'https://xayz-downloader.vercel.app'

# ── Download YouTube video ──────────────────────────────
def download_youtube(url, format='mp4', quality='720p'):
    res = requests.get(f'{BASE}/api/dl/youtube', params={
        'url': url, 'format': format, 'quality': quality
    })
    return res.json()

# ── Search YouTube ───────────────────────────────────────
def search_youtube(query, limit=10):
    res = requests.get(f'{BASE}/api/search/youtube', params={
        'q': query, 'limit': limit
    })
    return res.json()

# ── Auto-detect any platform ─────────────────────────────
def download_any(url):
    res = requests.get(f'{BASE}/api/dl', params={'url': url})
    return res.json()

# Usage
result = download_youtube('https://youtu.be/dQw4w9WgXcQ', quality='1080p')
print(result['data']['title'])
for fmt in result['data']['formats']:
    print(f"  {fmt['label']} - {fmt['format']}")`,

  php: `<?php
$BASE = 'https://xayz-downloader.vercel.app';

// ── Download YouTube video ──────────────────────────────
function downloadYouTube($url, $format = 'mp4', $quality = '720p') {
    global $BASE;
    $params = http_build_query(['url'=>$url,'format'=>$format,'quality'=>$quality]);
    $res = file_get_contents("$BASE/api/dl/youtube?$params");
    return json_decode($res, true);
}

// ── Search YouTube ───────────────────────────────────────
function searchYouTube($query, $limit = 10) {
    global $BASE;
    $params = http_build_query(['q'=>$query,'limit'=>$limit]);
    $res = file_get_contents("$BASE/api/search/youtube?$params");
    return json_decode($res, true);
}

// ── Auto-detect platform ─────────────────────────────────
function downloadAny($url) {
    global $BASE;
    $params = http_build_query(['url'=>$url]);
    $res = file_get_contents("$BASE/api/dl?$params");
    return json_decode($res, true);
}

// Usage
$result = downloadYouTube('https://youtu.be/dQw4w9WgXcQ', 'mp4', '720p');
echo $result['data']['title'];
?>`
};

const codeContent = document.getElementById('codeContent');

function renderCode(lang) {
  codeContent.textContent = snippets[lang] || snippets.curl;
}

document.querySelectorAll('.ctab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ctab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderCode(tab.dataset.lang);
  });
});

// Initialize
renderCode('curl');

// ── Copy Code ──────────────────────────────────────────────
function copyCode() {
  const code = codeContent.textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  });
}
window.copyCode = copyCode;
