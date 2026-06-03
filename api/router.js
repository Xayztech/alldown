'use strict';

const express = require('express');
const router = express.Router();

const youtubeHandler = require('./handlers/youtube');
const tiktokHandler = require('./handlers/tiktok');
const instagramHandler = require('./handlers/instagram');
const twitterHandler = require('./handlers/twitter');
const scribdHandler = require('./handlers/scribd');
const facebookHandler = require('./handlers/facebook');
const searchHandler = require('./handlers/search');
const universalHandler = require('./handlers/universal');

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AllDown API v1.0',
    version: '1.0.0',
    endpoints: {
      downloader: {
        youtube: 'GET /api/dl/youtube?url=',
        tiktok: 'GET /api/dl/tiktok?url=',
        instagram: 'GET /api/dl/instagram?url=',
        twitter: 'GET /api/dl/twitter?url=',
        facebook: 'GET /api/dl/facebook?url=',
        scribd: 'GET /api/dl/scribd?url=',
        universal: 'GET /api/dl?url='
      },
      search: {
        youtube: 'GET /api/search/youtube?q=&limit=',
        web: 'GET /api/search/web?q=&limit=',
        all: 'GET /api/search?q=&type='
      }
    },
    docs: '/docs/api',
    rateLimit: '60 requests/minute'
  });
});

// ─── Downloader Routes ────────────────────────────────────────────────────────
router.get('/dl', universalHandler.detect);
router.get('/dl/youtube', youtubeHandler.download);
router.get('/dl/youtube/formats', youtubeHandler.formats);
router.get('/dl/tiktok', tiktokHandler.download);
router.get('/dl/instagram', instagramHandler.download);
router.get('/dl/twitter', twitterHandler.download);
router.get('/dl/facebook', facebookHandler.download);
router.get('/dl/scribd', scribdHandler.download);

// ─── Search Routes ────────────────────────────────────────────────────────────
router.get('/search', searchHandler.all);
router.get('/search/youtube', searchHandler.youtube);
router.get('/search/web', searchHandler.web);

// ─── POST variants ────────────────────────────────────────────────────────────
router.post('/dl', (req, res, next) => {
  req.query.url = req.body.url;
  universalHandler.detect(req, res, next);
});

router.post('/search', (req, res, next) => {
  req.query.q = req.body.q;
  req.query.type = req.body.type;
  searchHandler.all(req, res, next);
});

module.exports = router;
