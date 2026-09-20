# 🎬 PullTube

A beautiful, glassmorphic Windows desktop application for downloading video and audio from **1000+ sites** using [yt-dlp](https://github.com/yt-dlp/yt-dlp).

![Electron](https://img.shields.io/badge/Electron-33-47848F?style=flat-square&logo=electron)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss)

## ✨ Features

- 🎨 **Glassmorphic Dark UI** — Frosted glass effects, purple/violet gradients, smooth animations
- 📥 **Universal Downloads** — YouTube, Instagram, TikTok, Twitter/X, Reddit, and 1000+ more sites
- 🎬 **Video Formats** — MP4 (H.264/H.265), WebM, MKV, AVI
- 🎵 **Audio Formats** — MP3, FLAC, WAV, AAC/M4A, OGG/Opus, ALAC
- 📊 **Quality Selection** — Pick exact resolution from 144p to 8K
- 📋 **Download Queue** — Parallel downloads with progress tracking
- 🔧 **Advanced Options** — Subtitles, thumbnails, metadata, video trimming, chapter splitting
- ⚙️ **Customizable** — Proxy support, custom yt-dlp args, filename templates
- 🔔 **System Tray** — Minimize to tray with desktop notifications
- 🔄 **Auto-Update** — Keeps yt-dlp engine up-to-date automatically

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/) 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pulltube.git
cd pulltube

# Install dependencies
npm install

# Download yt-dlp and FFmpeg binaries
npm run download-binaries

# Start in development mode
npm run dev
```

### Building for Production

```bash
# Build the app
npm run build

# Package as NSIS installer
npm run package
```

The installer will be created in the `release/` directory.

## 📁 Project Structure

```
src/
├── main/           # Electron main process
│   ├── main.ts             # App entry point
│   ├── ipc-handlers.ts     # IPC message handlers
│   ├── download-manager.ts # Download queue manager
│   ├── ytdlp-wrapper.ts    # yt-dlp CLI abstraction
│   ├── updater.ts           # yt-dlp auto-updater
│   ├── tray.ts             # System tray
│   └── store.ts            # Persistent storage
├── preload/        # Electron preload scripts
│   └── preload.ts          # Context bridge API
├── renderer/       # React frontend
│   ├── components/         # UI & download components
│   ├── pages/              # App pages
│   ├── stores/             # Zustand state stores
│   ├── lib/                # IPC bridge & utilities
│   ├── App.tsx             # Root component
│   └── globals.css         # Global styles
└── shared/         # Shared types & constants
    ├── types.ts
    └── constants.ts
```

## 📖 Documentation

- [Product Requirements](documents/prd.md)
- [Technical Requirements](documents/trd.md)
- [Design System](documents/DESIGN.md)
- [Architecture](documents/ARCHITECTURE.md)
- [Roadmap](documents/ROADMAP.md)
- [Contributing](documents/CONTRIBUTING.md)
- [Changelog](documents/CHANGELOG.md)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Electron 33 |
| Frontend | React 18 + TypeScript 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand 5 |
| Animations | Framer Motion 11 |
| Icons | Lucide React |
| Build | Vite 6 |
| Packaging | electron-builder (NSIS) |
| Download Engine | yt-dlp |
| Media Processing | FFmpeg |

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

**PullTube** — *Pull anything, anywhere.* 🚀
