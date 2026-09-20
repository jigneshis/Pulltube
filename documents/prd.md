# PullTube — Product Requirements Document (PRD)

| Document Version | Status   | Author                | Date       | Target Release |
| :--------------- | :------- | :-------------------- | :--------- | :------------- |
| 1.0.0            | Approved | PullTube Product Team | 2026-09-19 | PullTube v1.0  |

---

## 1. Executive Summary

**PullTube** is a desktop media extraction and download manager designed for Windows 10 and 11. Built on Electron, React 18, Tailwind CSS 3, and TypeScript, PullTube provides a glassmorphic user interface on top of the media retrieval engine **yt-dlp** and conversion pipeline **FFmpeg**.

PullTube solves the friction and security concerns associated with ad-infested web downloaders and intimidating command-line tools. By offering format/quality selection, granular post-processing options (such as lossless trimming, chapter-splitting, subtitle embedding, and metadata tagging), and parallel queue management, PullTube aims to be the primary desktop video and audio acquisition utility for Windows power users, creators, and everyday consumers.

---

## 2. Product Vision & Goals

### 2.1 Vision Statement
To provide Windows users with a fast, private, and customizable desktop media downloader that brings CLI media extraction capabilities into an intuitive UI.

### 2.2 Core Product Objectives
- **Simplicity without Compromise**: Offer 1-click simple downloads for casual users while surfacing advanced options (trimming, chapters, audio extraction, proxy routing) for advanced workflows.
- **Universal Site Compatibility**: Leverage `yt-dlp` to guarantee support for over 1,000 video, audio, and streaming hosting providers.
- **Visual Polish**: Deliver a glassmorphic dark-mode desktop interface with violet/purple accents, fluid motion, and responsive layout.
- **Reliability & Autonomy**: Bundle production-grade binaries (yt-dlp and FFmpeg) directly into the installer, paired with an in-app updater for yt-dlp to stay ahead of upstream site breakages.
- **Privacy First**: Zero analytics tracking, no telemetry of downloaded URLs, and direct peer-to-content network calls without intermediary scraping proxies.

---

## 3. Target Audience & User Personas

```
                     ┌──────────────────────────────────────────────┐
                     │            PullTube Target Market            │
                     └──────────────────────┬───────────────────────┘
                                            │
         ┌──────────────────────────────────┼──────────────────────────────────┐
         │                                  │                                  │
         ▼                                  ▼                                  ▼
┌──────────────────┐               ┌──────────────────┐               ┌──────────────────┐
│   Casual User    │               │    Power User    │               │ Content Creator  │
│  "Marcus Chen"   │               │   "Elena Rost"   │               │   "David Vance"  │
│ Offline playback │               │ Archiving, proxy │               │ B-roll, trimming │
└──────────────────┘               └──────────────────┘               └──────────────────┘
```

### 3.1 Persona 1: Casual Consumer — "Marcus Chen"
- **Background**: 24-year-old student and daily commuter.
- **Needs**: Save educational lectures, music mixes, and documentary videos to watch offline on flights or train rides without internet access.
- **Pain Points**: Web-based "YouTube to MP3" converters are plagued by malware redirects, fake download buttons, slow speeds, and low audio bitrates.
- **How PullTube Wins**: Paste link -> click download -> get clean 1080p MP4 or 320kbps MP3 in seconds with no ads or deceptive UI.

### 3.2 Persona 2: Digital Archivist & Power User — "Elena Rostova"
- **Background**: 34-year-old software engineer and media enthusiast.
- **Needs**: Archive entire playlists or conference keynotes in original resolution (4K/8K 60fps VP9/AV1), retain complete metadata (chapters, descriptions, thumbnails), and route traffic through a SOCKS5 proxy.
- **Pain Points**: Running raw `yt-dlp` terminal commands with 15 flags is tedious to repeat, difficult to monitor during multi-gigabyte queues, and awkward to cancel or pause.
- **How PullTube Wins**: Full format inspection, custom quality pickers, parallel queue visibility with exact ETA/speed readouts, proxy settings, and zero terminal friction.

### 3.3 Persona 3: Content Creator & Video Editor — "David Vance"
- **Background**: 29-year-old freelance video editor and motion graphics designer.
- **Needs**: Pull reference footage, sound effects, interview snippets, and creative commons B-roll directly into high-fidelity editing formats (WAV, FLAC, ProRes/MKV).
- **Pain Points**: Downloading an entire 2-hour podcast just to extract a 15-second audio quote or video clip wastes bandwidth and disk space.
- **How PullTube Wins**: Built-in time-range trimming (`-ss` and `-to`) to download only the necessary clip, chapter separation to export timestamps as individual files, and automatic thumbnail/subtitles embedding.

---

## 4. Detailed Feature Specifications

```
                                  PULLTUBE FEATURE ECOSYSTEM
  ┌───────────────────────┬───────────────────────┬───────────────────────┬───────────────────────┐
  │     Media Parser      │    Queue & Engine     │   Format & Process    │  Settings & Platform  │
  ├───────────────────────┼───────────────────────┼───────────────────────┼───────────────────────┤
  │ • URL Auto-Detection  │ • Concurrent Queuing  │ • 144p to 8K Selector │ • Configurable Paths  │
  │ • Metadata Inspection │ • Pause / Resume      │ • Lossless Conversion │ • SOCKS5/HTTP Proxy   │
  │ • 1000+ Site Support  │ • Speed & ETA Meter   │ • Clip Range Trimmer  │ • In-App yt-dlp Update│
  │ • Thumbnail & Title   │ • Retry Mechanics     │ • Chapter Splitting   │ • Windows Tray / Min  │
  │ • Duration & Author   │ • Complete History    │ • Subtitle Embedder   │ • Push Notifications  │
  └───────────────────────┴───────────────────────┴───────────────────────┴───────────────────────┘
```

### 4.1 URL Parsing & Analysis (Home Screen)
- **User Story**: *As a user, I want to paste a URL from YouTube, Vimeo, Twitter/X, TikTok, Twitch, or SoundCloud and instantly see video details so I can choose how to download it.*
- **Functional Requirements**:
  1. Auto-focusing URL input bar with "Paste from Clipboard" 1-click action button.
  2. Immediate asynchronous metadata inspection using `yt-dlp --dump-single-json --flat-playlist`.
  3. Interactive Card displaying: Video thumbnail, Title, Author/Channel name, Duration (HH:MM:SS), Upload date, and View count.
  4. Instant validation: display informative error message if URL is unsupported, private, copyright-blocked, or unreachable.
- **Acceptance Criteria**:
  - URL analysis completes in under 2.5 seconds on standard broadband connections.
  - Video preview card renders fluidly with Framer Motion slide-in animation.

### 4.2 Format & Quality Selection
- **User Story**: *As a user, I want to download either video with audio or extract audio only, choosing from standard containers and resolutions.*
- **Supported Video Formats**:
  - MP4 (H.264 / AAC or H.265 / AAC — maximum hardware compatibility).
  - MKV (Matroska — preserves high dynamic range, multiple audio tracks, soft subtitles).
  - WebM (VP9 / AV1 / Opus — native web container).
  - AVI (Audio Video Interleave — legacy compatibility).
- **Supported Video Qualities**:
  - `Best Available`, `8K (4320p)`, `4K (2160p)`, `1440p (2K)`, `1080p (Full HD)`, `720p (HD)`, `480p`, `360p`, `240p`, `144p`.
  - Frame rate indicators (e.g., `1080p60`, `4K60 HDR`).
- **Supported Audio Extraction Formats**:
  - Lossy: MP3 (up to 320 kbps CBR/VBR), AAC (256 kbps), OGG (Vorbis 320 kbps).
  - Lossless / Studio: FLAC (lossless compression), WAV (uncompressed PCM), ALAC (Apple Lossless).
- **Acceptance Criteria**:
  - Switching between "Video" and "Audio" modes dynamically transforms the quality dropdown to bitrate or sampling rate options.
  - Only streams physically available for the target video are selectable (disabled options greyed out with tooltip).

### 4.3 Advanced Processing Toggles
- **User Story**: *As a power user, I want granular toggles for metadata, trimming, subtitles, and chapter handling so I get production-ready media without manual post-processing.*
- **Feature Breakdown**:
  1. **Subtitle Extraction**:
     - Toggle: On / Off.
     - Mode: Embed into container (soft subtitles in MKV/MP4) or save as external `.srt` / `.vtt`.
     - Language selection: Auto-generated vs. Creator-uploaded (English, Spanish, French, German, Japanese, and Auto-Detect).
  2. **Thumbnail Extraction & Embedding**:
     - Embed thumbnail as cover art (ID3 tag for MP3, MP4 cover art atom).
     - Save separate full-resolution thumbnail image (`.jpg` / `.webp` / `.png`).
  3. **Metadata Embedding**:
     - Write title, artist, album, upload date, description, and comment tags directly into the media file headers via FFmpeg.
  4. **Time Range Trimming (Lossless Cut)**:
     - Checkbox: "Trim Clip".
     - Precise time inputs: `Start Time (HH:MM:SS)` and `End Time (HH:MM:SS)`.
     - Validates that `End Time > Start Time` and does not exceed media duration.
  5. **Chapter Splitting**:
     - Checkbox: "Split into Chapters".
     - Parses video chapter timestamps and outputs discrete sequentially numbered files (e.g., `01 - Introduction.mp4`, `02 - Keynote.mp4`).

### 4.4 Queue & Concurrency Management
- **User Story**: *As a user downloading multiple files, I want to queue downloads, configure concurrent transfers, and pause/resume jobs.*
- **Functional Requirements**:
  1. Real-time queue table displaying: Media title, thumbnail thumbnail snippet, format badge, file size (downloaded / total), transfer speed (e.g., `14.2 MB/s`), remaining time (ETA), and status badge (`Queued`, `Downloading`, `Converting`, `Completed`, `Paused`, `Error`).
  2. Progress bars powered by continuous stdout parsing of yt-dlp with smooth interpolation.
  3. Job controls per item: Pause, Resume, Cancel, Retry, Open Containing Folder, Play File.
  4. Global actions: "Pause All", "Resume All", "Clear Completed".
  5. Concurrency controller: User-configurable concurrent download limit (1 to 5 concurrent streams) to prevent ISP bandwidth saturation or CPU bottlenecking.
- **Acceptance Criteria**:
  - Queue updates without UI stutter or memory leaks even when tracking 20+ active downloads.
  - Cancelling an in-progress download cleans up partial `.part` and temporary files from the disk.

### 4.5 History Management
- **User Story**: *As a user, I want a permanent log of my completed downloads to quickly reopen files, see file sizes, or re-download lost items.*
- **Functional Requirements**:
  1. Persistent download history stored locally in `history.json` via `electron-store`.
  2. Displays completion date, original URL, output file path, resolution, audio bitrate, and file size.
  3. Actions: "Open File" (default OS handler), "Show in File Explorer", "Copy Original URL", "Remove from History", "Delete File from Disk".
  4. Search bar to filter historical records by title, channel, or format.
  5. "Clear History" button with confirmation modal.

### 4.6 Settings & Customization
- **User Story**: *As a user, I want to customize application directories, network settings, and tray behaviors.*
- **Configuration Fields**:
  - **Download Directory**: Default Windows `Downloads/PullTube` with native folder picker dialog.
  - **Max Concurrent Downloads**: Slider from 1 to 5 (default: 3).
  - **Network Proxy**: Toggle HTTP/HTTPS/SOCKS5 proxy support with input: `protocol://host:port` and optional authentication credentials.
  - **yt-dlp Engine Status**: Current installed version, "Check for Updates" button, and automatic background check on startup.
  - **Application Theme**: Default "Dark Violet" with toggle for "Light Glass" mode.
  - **System Tray Behavior**: "Close to Tray", "Minimize to Tray", and tray icon right-click context menu (Pause All, Resume All, Open PullTube, Quit).
  - **Desktop Notifications**: Windows 10/11 native toast notifications on download completion or critical error.

---

## 5. Non-Functional Requirements (NFR)

### 5.1 Performance
- **Startup Time**: Cold launch to interactive state in under 1.8 seconds.
- **Memory Footprint**: Under 150 MB RAM while idling in the background; under 320 MB RAM during active multi-stream downloading and FFmpeg transcoding.
- **CPU Overhead**: Renderer UI consumes less than 4% CPU during high-speed 100 MB/s network throughput.

### 5.2 Usability & Accessibility
- **Design Language**: Custom Glassmorphism featuring translucent backgrounds, subtle gradient borders, and violet-500 accent colors.
- **Keyboard Navigation**: Full Tab-index support across URL inputs, modal dialogs, and primary buttons.
- **Responsive Layout**: Fluid window resizing with a minimum supported resolution of 960x600 px up to 4K monitors with multi-DPI scaling.

### 5.3 Reliability & Resilience
- **Process Isolation**: yt-dlp and FFmpeg execute inside isolated worker child processes. If a single download fails or crashes, the main application and adjacent downloads remain unaffected.
- **Network Resilience**: Automatic exponential backoff retry (up to 3 attempts) for intermittent network packet loss or socket resets.
- **Disk Space Pre-flight**: Optional validation that the target drive contains sufficient free space before initiating multi-gigabyte transfers.

### 5.4 Platform & OS Compatibility
- **Target OS**: Windows 10 (64-bit, version 1909+) and Windows 11.
- **Packaging**: Portable single executable and standard NSIS Windows Installer with Start Menu and Desktop shortcuts.

---

## 6. Success Metrics (KPIs)

| Metric Category             | Key Performance Indicator                 | Target Baseline | Success Benchmark |
| :-------------------------- | :---------------------------------------- | :-------------- | :---------------- |
| **Download Reliability**    | Successful Download Completion Rate       | > 90%           | **> 98.5%**       |
| **Engine Longevity**        | yt-dlp Out-of-Date Incident Resolution    | < 48 hours      | **< 12 hours**    |
| **Application Stability**   | Crash-Free Sessions (Sentry / App Logs)   | > 95%           | **> 99.8%**       |
| **Analysis Performance**    | URL Metadata Resolution Time (avg)        | < 4.0 seconds   | **< 2.0 seconds** |
| **User Flow Efficiency**    | Paste-to-Download Execution Clicks        | 4 clicks        | **2 clicks**      |
