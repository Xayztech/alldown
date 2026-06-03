# ⬇ AllDown — Universal Downloader & Search API

A free, fast REST API to download media from YouTube, TikTok, Instagram, Twitter, Facebook, Scribd, and more. Built with Node.js v24 + Express, deployable to Vercel.

## Features

- **Universal downloader** — auto-detect platform from any URL
- **YouTube** — MP4 (144p–1080p), MP3, WebM, M4A
- **TikTok** — No-watermark HD download + audio
- **Instagram** — Reels, Posts, Stories
- **Twitter/X** — Video, GIF, Audio
- **Facebook** — HD + SD video
- **Scribd** — PDF, DOCX, TXT
- **YouTube Search** — Full video search via YouTube's API
- **Web Search** — DuckDuckGo powered web search
- **Rate limiting** — 60 req/min per IP
- **CORS enabled** — Use from any frontend

## Quick Start

```bash
git clone https://github.com/yourusername/alldown-api.git
cd alldown-api
npm install
npm start
```

Visit: `http://localhost:3000`

## API Reference

See full docs at `/docs/api` or below.

### Download Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dl?url=` | Auto-detect & download |
| GET | `/api/dl/youtube?url=&format=&quality=` | YouTube video/audio |
| GET | `/api/dl/youtube/formats?url=` | Get all formats |
| GET | `/api/dl/tiktok?url=` | TikTok no-watermark |
| GET | `/api/dl/instagram?url=` | Instagram media |
| GET | `/api/dl/twitter?url=` | Twitter/X video |
| GET | `/api/dl/facebook?url=` | Facebook video |
| GET | `/api/dl/scribd?url=` | Scribd documents |

### Search Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search/youtube?q=&limit=` | YouTube search |
| GET | `/api/search/web?q=&limit=` | DuckDuckGo web search |
| GET | `/api/search?q=&type=&limit=` | All-in-one search |

### Example

```bash
# Download YouTube as MP3
curl "https://your-app.vercel.app/api/dl/youtube?url=https://youtu.be/VIDEO_ID&format=mp3"

# Search YouTube
curl "https://your-app.vercel.app/api/search/youtube?q=lofi+music&limit=5"

# Auto-detect TikTok
curl "https://your-app.vercel.app/api/dl?url=https://www.tiktok.com/@user/video/ID"
```

## Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Or connect your GitHub repo at [vercel.com/new](https://vercel.com/new).

## Tech Stack

- **Runtime**: Node.js v24
- **Framework**: Express.js (CJS)
- **Deploy**: Vercel (Serverless)
- **Rate limiting**: express-rate-limit
- **HTTP**: axios + cheerio

## License

MIT
