'use strict';

const axios = require('axios');
const cheerio = require('cheerio');

function parseScribdId(url) {
  const m = url.match(/scribd\.com\/(?:doc|document|presentation)\/(\d+)/);
  return m ? m[1] : null;
}

async function getScribdInfo(url) {
  const docId = parseScribdId(url);
  if (!docId) throw new Error('Invalid Scribd URL');

  // Fetch page for metadata
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml'
    },
    timeout: 10000
  }).catch(() => ({ data: '' }));

  const $ = cheerio.load(res.data);

  const title = $('meta[property="og:title"]').attr('content')
    || $('title').text().trim()
    || `Scribd Document ${docId}`;
  const description = $('meta[property="og:description"]').attr('content') || '';
  const thumbnail = $('meta[property="og:image"]').attr('content') || '';
  const author = $('meta[name="author"]').attr('content') || '';

  return {
    id: docId,
    title,
    description,
    thumbnail,
    author,
    url,
    platform: 'scribd',
    formats: [
      { format: 'pdf', label: 'PDF Document', quality: 'original' },
      { format: 'txt', label: 'Plain Text', quality: 'text' },
      { format: 'docx', label: 'Word Document', quality: 'original' }
    ],
    download: {
      // Scribd downloader services
      pdf: `https://scribd.vdownloader.io/?url=${encodeURIComponent(url)}`,
      alternative: `https://www.scribd-downloader.com/?url=${encodeURIComponent(url)}`
    },
    note: 'Scribd documents require download via third-party service due to DRM.'
  };
}

const download = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, error: 'URL parameter is required' });

  try {
    const info = await getScribdInfo(url);
    return res.json({ success: true, platform: 'scribd', data: info });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { download };
