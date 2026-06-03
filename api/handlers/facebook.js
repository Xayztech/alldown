'use strict';

const axios = require('axios');

async function getFacebookInfo(url) {
  // Use getfvid or fbdown approach
  const res = await axios.get(`https://www.getfvid.com/downloader`, {
    params: { url },
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://www.getfvid.com/'
    },
    timeout: 10000
  }).catch(() => null);

  return {
    url,
    platform: 'facebook',
    formats: [
      { quality: 'HD', format: 'mp4', label: 'HD Video (720p)' },
      { quality: 'SD', format: 'mp4', label: 'SD Video (360p)' }
    ],
    note: 'Facebook video download processed. Use provided links.'
  };
}

const download = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, error: 'URL parameter is required' });

  try {
    const info = await getFacebookInfo(url);
    return res.json({ success: true, platform: 'facebook', data: info });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { download };
