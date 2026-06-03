'use strict';

const axios = require('axios');

/**
 * YouTube search using YouTube's suggest + oEmbed approach
 */
async function searchYouTube(query, limit = 10) {
  // Use YouTube's internal API (innertube)
  const res = await axios.post(
    'https://www.youtube.com/youtubei/v1/search?prettyPrint=false',
    {
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20240101.00.00'
        }
      },
      query
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000
    }
  );

  const items = [];
  try {
    const contents = res.data?.contents?.twoColumnSearchResultsRenderer
      ?.primaryContents?.sectionListRenderer?.contents?.[0]
      ?.itemSectionRenderer?.contents || [];

    for (const item of contents) {
      if (item.videoRenderer) {
        const v = item.videoRenderer;
        items.push({
          id: v.videoId,
          title: v.title?.runs?.[0]?.text || '',
          author: v.ownerText?.runs?.[0]?.text || '',
          thumbnail: `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`,
          duration: v.lengthText?.simpleText || '',
          views: v.viewCountText?.simpleText || '',
          published: v.publishedTimeText?.simpleText || '',
          url: `https://www.youtube.com/watch?v=${v.videoId}`
        });
        if (items.length >= limit) break;
      }
    }
  } catch (e) {
    // Fallback: return empty
  }

  return items;
}

/**
 * Web search using DuckDuckGo
 */
async function searchWeb(query, limit = 10) {
  const res = await axios.get('https://api.duckduckgo.com/', {
    params: {
      q: query,
      format: 'json',
      no_html: 1,
      skip_disambig: 1
    },
    headers: { 'User-Agent': 'AllDownAPI/1.0' },
    timeout: 8000
  });

  const results = [];

  // Main result
  if (res.data.AbstractText) {
    results.push({
      title: res.data.Heading,
      description: res.data.AbstractText,
      url: res.data.AbstractURL,
      source: res.data.AbstractSource,
      image: res.data.Image || null,
      type: 'abstract'
    });
  }

  // Related topics
  for (const t of (res.data.RelatedTopics || [])) {
    if (t.FirstURL && t.Text) {
      results.push({
        title: t.Text.split(' - ')[0] || t.Text.substring(0, 60),
        description: t.Text,
        url: t.FirstURL,
        image: t.Icon?.URL || null,
        type: 'related'
      });
      if (results.length >= limit) break;
    }
  }

  return results;
}

const youtube = async (req, res) => {
  const { q, query, limit = 10 } = req.query;
  const searchQuery = q || query;
  if (!searchQuery) return res.status(400).json({ success: false, error: 'Query parameter q is required' });

  try {
    const results = await searchYouTube(searchQuery, parseInt(limit));
    return res.json({
      success: true,
      platform: 'youtube',
      query: searchQuery,
      count: results.length,
      results
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const web = async (req, res) => {
  const { q, query, limit = 10 } = req.query;
  const searchQuery = q || query;
  if (!searchQuery) return res.status(400).json({ success: false, error: 'Query parameter q is required' });

  try {
    const results = await searchWeb(searchQuery, parseInt(limit));
    return res.json({
      success: true,
      platform: 'web',
      query: searchQuery,
      count: results.length,
      results
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const all = async (req, res) => {
  const { q, query, type = 'youtube', limit = 10 } = req.query;
  const searchQuery = q || query;
  if (!searchQuery) return res.status(400).json({ success: false, error: 'Query parameter q is required' });

  try {
    let results = [];
    let platform = type;

    switch (type.toLowerCase()) {
      case 'youtube':
        results = await searchYouTube(searchQuery, parseInt(limit));
        break;
      case 'web':
      case 'duckduckgo':
        results = await searchWeb(searchQuery, parseInt(limit));
        platform = 'web';
        break;
      default:
        results = await searchYouTube(searchQuery, parseInt(limit));
        platform = 'youtube';
    }

    return res.json({
      success: true,
      platform,
      query: searchQuery,
      count: results.length,
      results
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { youtube, web, all };
