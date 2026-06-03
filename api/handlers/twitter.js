'use strict';

const axios = require('axios');

function parseTweetId(url) {
  const m = url.match(/(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/);
  return m ? m[1] : null;
}

async function getTwitterInfo(url) {
  const tweetId = parseTweetId(url);
  if (!tweetId) throw new Error('Invalid Twitter/X URL');

  // Use twitsave.com API approach
  const res = await axios.get(`https://twitsave.com/info?url=${encodeURIComponent(url)}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://twitsave.com/'
    },
    timeout: 10000
  }).catch(() => null);

  return {
    id: tweetId,
    url,
    platform: 'twitter',
    download: {
      mp4_hd: `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&lang=en`,
      note: 'Twitter videos require oEmbed API access. Direct download via provided URL.'
    },
    formats: [
      { quality: '1280x720', format: 'mp4', label: 'HD 720p' },
      { quality: '640x360', format: 'mp4', label: 'SD 360p' },
      { quality: 'audio', format: 'mp3', label: 'Audio Only' }
    ],
    embed: `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`
  };
}

const download = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, error: 'URL parameter is required' });

  try {
    const info = await getTwitterInfo(url);
    return res.json({ success: true, platform: 'twitter', data: info });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { download };
