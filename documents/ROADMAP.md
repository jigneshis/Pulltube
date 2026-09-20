# PullTube — Product Roadmap & Evolution Plan

| Document Version | Status   | Owner                 | Last Updated |
| :--------------- | :------- | :-------------------- | :----------- |
| 1.0.0            | Active   | PullTube Architecture | 2026-09-19   |

---

## 1. Roadmap Overview & Milestones

The PullTube roadmap outlines the progressive evolution from a standalone single-video media extractor into a comprehensive desktop multimedia suite. Development cycles adhere to semantic versioning (`vMAJOR.MINOR.PATCH`).

```
  2026 Q3               2026 Q4               2027 Q1               2027 Q2               2027 Q3               2027 Q4
 ┌──────────┐          ┌──────────┐          ┌──────────┐          ┌──────────┐          ┌──────────┐          ┌──────────┐
 │  v1.0.0  │─────────►│  v1.1.0  │─────────►│  v1.2.0  │─────────►│  v2.0.0  │─────────►│  v2.5.0  │─────────►│  v3.0.0  │
 └──────────┘          └──────────┘          └──────────┘          └──────────┘          └──────────┘          └──────────┘
  Core Desktop          Playlists &           History &             Media Player          i18n & Spotify        Extensions &
  Engine Foundation     Batch Queuing         Data Insights         & Automation          Ecosystem             Mobile Bridge
```

---

## 2. Release Milestones Breakdown

### 2.1 Version 1.0.0 — Core Engine & Desktop Experience (Current Release)
- **Objective**: Establish a production-grade, glassmorphic desktop foundation with reliable extraction across 1000+ websites.
- **Core Deliverables**:
  - [x] **Universal Media Extraction**: `yt-dlp` integration supporting YouTube, Vimeo, TikTok, X/Twitter, Twitch, and 1000+ sites.
  - [x] **Format Versatility**: Video containers (MP4, MKV, WebM, AVI) and audio extraction (MP3, FLAC, WAV, AAC, OGG, ALAC).
  - [x] **Resolution Picker**: 144p through 8K 60fps with HDR indicators.
  - [x] **Advanced Post-Processing**: Lossless time-range trimming (`-ss` / `-to`), subtitle extraction, chapter splitting, and metadata/cover embedding.
  - [x] **Queue Management**: Parallel queue with configurable concurrency (1–5 simultaneous downloads).
  - [x] **Glassmorphism Dark Theme**: Custom Tailwind CSS theme with violet accents, Inter typography, and Framer Motion animations.
  - [x] **Platform Integrations**: Windows System Tray, minimize/close-to-tray, desktop notifications, and atomic `electron-store` persistence.
  - [x] **Self-Contained Deployment**: Bundled `yt-dlp` and `FFmpeg` with in-app updater for yt-dlp.

---

### 2.2 Version 1.1.0 — Playlists, Batch Processing & Automation (Target: Q4 2026)
- **Objective**: Accelerate bulk workflows for students, researchers, and content collectors.
- **Key Features**:
  - **Full Playlist Extraction**:
    - Detects YouTube/SoundCloud playlists and channel URLs.
    - Interactive selection modal allowing users to select individual videos, choose "Select All", or apply index ranges (e.g., `1-25`, `50-75`).
  - **Batch URL Importer**:
    - Dedicated text area to paste multiple URLs simultaneously.
    - Support for `.txt` and `.m3u8` file imports.
  - **Intelligent Clipboard Monitoring**:
    - Background listener that detects copied video URLs in Windows.
    - Displays a subtle floating overlay or prompt: *"Download detected link?"*
  - **Multi-Segment Accelerated Download**:
    - Optional integration with `aria2c` for high-speed multi-connection downloading on bandwidth-restricted CDNs.

---

### 2.3 Version 1.2.0 — History Analytics & Media Insights (Target: Q1 2027)
- **Objective**: Provide deep inspection, organization, and search capabilities for high-volume users.
- **Key Features**:
  - **Full-Text History Search**:
    - Real-time indexing across title, creator, URL, tags, and file paths.
    - Date-range and format filter pills (e.g., `Type: Audio Only`, `Date: Last 7 Days`).
  - **Download Statistics Dashboard**:
    - Visual metrics rendered via SVG charts: Total bandwidth consumed, average download speed, most frequented platforms, and format distribution pie charts.
  - **Library Export / Backup**:
    - Export history to JSON, CSV, or formatted Markdown.
    - Backup and restore user preferences and download history across devices.
  - **Missing File Audit**:
    - Detects if completed files have been moved or deleted from disk, providing an "Update Path" or "Re-download" action.

---

### 2.4 Version 2.0.0 — Native Media Player & Scheduled Downloads (Target: Q2 2027)
- **Objective**: Transform PullTube from a pure downloader into an end-to-end media playback and acquisition hub.
- **Key Features**:
  - **Built-in Glassmorphic Media Player**:
    - Native hardware-accelerated video/audio player inside the application.
    - Picture-in-Picture (PiP) support for background playback.
    - Playback speed controls (0.25x to 3.0x), audio equalizer, and subtitle styling.
  - **Drag-and-Drop Ingestion**:
    - Drag URLs directly from web browsers into the PullTube window.
  - **Scheduled & Off-Peak Downloads**:
    - Set specific schedules for large queues (e.g., *"Download after 2:00 AM"* during unmetered night bandwidth).
    - Bandwidth limiter slider to prevent network congestion during working hours.
  - **Automatic Folder Organization**:
    - Auto-route downloads into custom subfolders based on channel name, format, or date (`Downloads/PullTube/%(uploader)s/%(title)s.%(ext)s`).

---

### 2.5 Version 2.5.0 — Internationalization & Audio Ecosystem (Target: Q3 2027)
- **Objective**: Broaden global accessibility and deepen dedicated music and podcast capabilities.
- **Key Features**:
  - **Multi-Language Support (i18n)**:
    - Complete localization for 12 languages: English, Spanish, German, French, Portuguese, Japanese, Chinese (Simplified/Traditional), Russian, Hindi, Arabic, and Korean.
  - **Spotify & Audio Streaming Integration**:
    - Support for Spotify playlists, albums, and artists via `spotdl` engine integration.
    - Automatic fetching of high-fidelity cover art, synced lyrics (LRC files), and ID3v2 metadata.
  - **Podcast RSS Feed Parser**:
    - Subscribe to audio podcast feeds, auto-detect new episodes, and download with chapter bookmarks.

---

### 2.6 Version 3.0.0 — Web Extensions & Mobile Companion (Target: Q4 2027)
- **Objective**: Expand PullTube into a multi-device connected ecosystem.
- **Key Features**:
  - **PullTube Browser Extension (Chrome, Edge, Firefox)**:
    - 1-click "Download with PullTube" badge on YouTube, Twitter, Twitch, and Instagram.
    - Communicates directly with the desktop app via Native Messaging Host.
  - **Mobile Remote Companion (iOS / Android)**:
    - Lightweight local network (LAN) companion app connecting via WebSocket.
    - Push links from mobile phone to start downloading immediately on home Windows PC.
    - Monitor desktop queue status, progress, and storage usage remotely.

---

## 3. Technology Evolution & Maintenance

| Technology Pillar | Current (v1.0) | Planned Horizon (v2.0+) | Motivation |
| :--- | :--- | :--- | :--- |
| **Media Engine** | `yt-dlp` CLI wrapping | Hybrid `yt-dlp` + Native C++ Addon | Lower process spawn overhead, reduce latency |
| **Download Accelerator**| Standard yt-dlp multi-thread | Native `aria2c` multi-connection bridge | 300% speed improvement on single-stream throttled servers |
| **Persistence** | `electron-store` (JSON) | Embedded SQLite (`better-sqlite3`) | Instant search across 10,000+ history records |
| **UI Framework** | React 18 + Vite | React 19 + Tailwind CSS 4 | Performance improvements, smaller asset bundle sizes |
| **Distribution** | Windows NSIS (`.exe`) | Windows Store (MSIX) + Winget Package | Frictionless 1-click installs and automatic updates |
