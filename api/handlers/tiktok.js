'use strict';

const axios = require('axios');

async function getTikTokInfo(url) {
  // Normalize URL
  const cleanUrl = url.split('?')[0];

  // Use tikwm.com API (public, no-watermark)
  const apiRes = await axios.post('https://www.tikwm.com/api/', {
    url: cleanUrl,
    count: 12,
    cursor: 0,
    web: 1,
    hd: 1
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0'
    },
    timeout: 10000
  });

  const d = apiRes.data;
  if (!d || d.code !== 0) throw new Error('Failed to fetch TikTok data');

  const v = d.data;
  return {
    id: v.id,
    title: v.title || '',
    author: {
      id: v.author?.id,
      username: v.author?.unique_id,
      nickname: v.author?.nickname,
      avatar: v.author?.avatar
    },
    thumbnail: v.cover,
    duration: v.duration,
    statistics: {
      plays: v.play_count,
      likes: v.digg_count,
      comments: v.comment_count,
      shares: v.share_count
    },
    music: {
      title: v.music_info?.title,
      author: v.music_info?.author,
      url: v.music_info?.play
    },
    download: {
      no_watermark: `https://www.tikwm.com/video/media/wmplay/${v.id}.mp4`,
      watermark: v.wmplay,
      hd: v.hdplay || `https://www.tikwm.com/video/media/play/${v.id}.mp4`,
      audio: v.music
    },
    formats: [
      { quality: 'HD', format: 'mp4', label: 'HD Video (No Watermark)', url: `https://www.tikwm.com/video/media/play/${v.id}.mp4` },
      { quality: 'SD', format: 'mp4', label: 'SD Video (Watermark)', url: v.wmplay },
      { quality: 'audio', format: 'mp3', label: 'Audio Only (MP3)', url: v.music }
    ]
  };
}

const download = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, error: 'URL parameter is required' });

  try {
    const info = await getTikTokInfo(url);
    return res.json({ success: true, platform: 'tiktok', data: info });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { download };
