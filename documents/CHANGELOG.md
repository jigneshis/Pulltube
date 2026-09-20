# Changelog

All notable changes to the **PullTube** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-09-19

### Initial Production Release

PullTube 1.0.0 marks the initial public release of the desktop media extraction and acquisition suite for Windows 10 and 11.

---

### Added

#### Media Extraction Engine
- Full integration with **yt-dlp** supporting over 1,000 video, audio, and social media platforms (YouTube, Vimeo, Twitch, TikTok, Twitter/X, SoundCloud, Bandcamp, Facebook, Reddit, and more).
- Rapid asynchronous metadata inspector (`yt-dlp --dump-single-json`) providing video title, author, duration, view counts, and available stream resolutions without initiating stream downloads.
- Automatic binary resolution and persistent writable installation directory in `%APPDATA%/PullTube/bin/` allowing in-place `yt-dlp` updates.
- In-app **Engine Updater** checking GitHub API for the latest yt-dlp binary with one-click background updating.

#### Format & Quality Selection
- **Video Containers**: MP4 (H.264 / AAC), MKV (Matroska multi-track), WebM (VP9 / Opus), and AVI.
- **Resolution Control**: Automatic best quality stream selection with manual overrides from **144p up to 8K (4320p)**, including 60fps high frame rate indicators.
- **Audio Extraction Mode**: Dedicated audio-only mode supporting MP3 (up to 320 kbps CBR/VBR), FLAC (lossless), WAV (uncompressed PCM), AAC, OGG, and ALAC.

#### Advanced Post-Processing Toggles
- **Lossless Clip Trimming**: Custom start time (`-ss`) and end time (`-to`) inputs with validation to download specific snippets without saving the entire source video.
- **Subtitle Extraction & Embedding**: Toggle to embed soft subtitles directly into MP4/MKV containers or write external `.srt` / `.vtt` sidecar files with multi-language detection.
- **Thumbnail Artwork Embedding**: Embeds video thumbnail directly into audio ID3 tags and MP4 atom artwork, with option to save standalone high-resolution images.
- **Metadata Tagging**: Automatically embeds title, artist, album, upload timestamp, and description tags into media headers.
- **Chapter Splitting**: Splits long videos into sequentially numbered individual files based on timestamp marks.

#### Queue & Concurrency Engine
- **Parallel Download Scheduler**: Configurable concurrency pool supporting 1 to 5 simultaneous active downloads.
- **Real-Time Progress Metrics**: Robust stdout stream parser calculating percentage, instantaneous download speed (MB/s), downloaded/total file size, and dynamic ETA.
- **Queue Controls**: Pause, Resume, Cancel, and Retry actions for each queued item, alongside global "Pause All", "Resume All", and "Clear Completed" controls.
- **Automatic Cleanup**: Removes intermediate `.part` and temporary post-processing files when downloads are cancelled or encounter unrecoverable errors.

#### Glassmorphic User Interface
- **Dark Mode Default**: Glassmorphic aesthetic utilizing deep dark canvas (`#0F0F14`), elevated panels (`#16162A`), frosted glass cards (`backdrop-blur-xl bg-white/5`), and luminous violet accents (`#8B5CF6`).
- **Sidebar Navigation**: Fluid sidebar routing across **Home**, **Downloads**, **History**, and **Settings**.
- **Framer Motion Animations**: Physics-based spring animations for page transitions, interactive cards, status badges, and progress bar fills.
- **Lucide React Icons**: Consistent 1.75 stroke-width vector iconography.
- **Light Glass Mode**: Toggleable light glass theme for brighter ambient lighting conditions.

#### History & Local Persistence
- **Persistent History Log**: Stores download records in atomic JSON storage (`electron-store`) with thumbnail cache, file paths, format specs, and timestamps.
- **Quick File Actions**: 1-click "Open File" in default system media player, "Show in Explorer", and "Copy Original URL".
- **History Management**: Per-item deletion and "Clear All History" with safety confirmations.

#### Platform & System Integration
- **Windows System Tray**: Native tray icon with context menu options (Open PullTube, Pause All, Resume All, Quit).
- **Background Minimization**: Options to "Minimize to Tray" or "Close to Tray" for uninterrupted background downloads.
- **Native Windows Notifications**: Desktop toast alerts triggered upon download completion or engine errors.
- **Network Proxy Support**: Configurable HTTP/HTTPS and SOCKS5 proxy support with optional authentication.
- **Frameless Window**: Custom draggable titlebar with smooth minimize, maximize/restore, and close buttons.
- **Installer & Packaging**: Standard per-user NSIS Windows Installer (`PullTube-Setup-1.0.0.exe`) with desktop and Start Menu shortcuts, bundling static builds of `yt-dlp` and `FFmpeg 6.1`.

---

### Security
- Enabled strict **Chromium Context Isolation** (`contextIsolation: true`) and disabled Node.js integration in the renderer process.
- Implemented **Content Security Policy (CSP)** restricting scripts, styles, and network calls.
- Command-line arguments sanitized and passed as explicit array arguments to `child_process.spawn` to prevent command injection vulnerabilities.

---

[1.0.0]: https://github.com/pulltube/pulltube/releases/tag/v1.0.0
