'use strict';

const axios = require('axios');

async function getInstagramInfo(url) {
  // Use SaveInsta style scraping via public API
  const apiUrl = `https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index?url=${encodeURIComponent(url)}`;
  
  // Fallback: use indown.net approach
  const res = await axios.get(`https://api.indown.io/download?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 10000
  }).catch(() => null);

  if (res && res.data) {
    return {
      url,
      platform: 'instagram',
      download: res.data,
      note: 'Use the provided download links'
    };
  }

  // Return structured info with download hint
  return {
    url,
    platform: 'instagram',
    message: 'Instagram requires authentication. Use the web interface at alldown or try the /api/dl?url= endpoint for auto-detection.',
    download: {
      reels: url.includes('/reel/') ? url.replace('www.instagram.com', 'ddinstagram.com') : null,
      post: url.replace('www.instagram.com', 'ddinstagram.com')
    },
    formats: [
      { quality: 'HD', format: 'mp4', label: 'HD Video' },
      { quality: 'SD', format: 'mp4', label: 'SD Video' },
      { quality: 'original', format: 'jpg', label: 'Photo/Image' }
    ]
  };
}

const download = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, error: 'URL parameter is required' });

  try {
    const info = await getInstagramInfo(url);
    return res.json({ success: true, platform: 'instagram', data: info });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { download };
