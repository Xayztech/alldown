'use strict';

const youtubeHandler = require('./youtube');
const tiktokHandler = require('./tiktok');
const instagramHandler = require('./instagram');
const twitterHandler = require('./twitter');
const facebookHandler = require('./facebook');
const scribdHandler = require('./scribd');

/**
 * Detect platform from URL and route to appropriate handler
 */
function detectPlatform(url) {
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('tiktok.com') || u.includes('vm.tiktok.com')) return 'tiktok';
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter';
  if (u.includes('facebook.com') || u.includes('fb.com') || u.includes('fb.watch')) return 'facebook';
  if (u.includes('scribd.com')) return 'scribd';
  if (u.includes('vimeo.com')) return 'vimeo';
  if (u.includes('dailymotion.com')) return 'dailymotion';
  if (u.includes('twitch.tv')) return 'twitch';
  if (u.includes('reddit.com')) return 'reddit';
  if (u.includes('pinterest.com') || u.includes('pin.it')) return 'pinterest';
  if (u.includes('linkedin.com')) return 'linkedin';
  if (u.includes('snapchat.com')) return 'snapchat';
  if (u.includes('soundcloud.com')) return 'soundcloud';
  if (u.includes('spotify.com')) return 'spotify';
  return 'unknown';
}

const detect = async (req, res, next) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, error: 'URL parameter is required' });

  const platform = detectPlatform(url);

  // Route to specific handler
  switch (platform) {
    case 'youtube':
      return youtubeHandler.download(req, res, next);
    case 'tiktok':
      return tiktokHandler.download(req, res, next);
    case 'instagram':
      return instagramHandler.download(req, res, next);
    case 'twitter':
      return twitterHandler.download(req, res, next);
    case 'facebook':
      return facebookHandler.download(req, res, next);
    case 'scribd':
      return scribdHandler.download(req, res, next);
    default:
      return res.status(422).json({
        success: false,
        error: `Platform "${platform}" is not yet supported.`,
        detected: platform,
        url,
        supported: ['youtube', 'tiktok', 'instagram', 'twitter', 'facebook', 'scribd'],
        suggestion: 'Try specifying the platform directly: /api/dl/youtube, /api/dl/tiktok, etc.'
      });
  }
};

module.exports = { detect, detectPlatform };
