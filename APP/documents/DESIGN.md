# PullTube — Design System & UI Specifications

| Document Version | Status   | Design Lead           | Date       | Target Release |
| :--------------- | :------- | :-------------------- | :--------- | :------------- |
| 1.0.0            | Approved | PullTube UI/UX Studio | 2026-09-19 | PullTube v1.0  |

---

## 1. Design Philosophy: Dark Modern Glassmorphism

PullTube's aesthetic combines the depth of high-contrast dark space backgrounds with the tactile elegance of frosted glass layers and vivid violet/purple luminous accents. The UI is designed to feel like a modern, lightweight native desktop companion that prioritizes clarity, smooth transitions, and tactile feedback.

### Key Pillars
- **Translucent Depth**: Layered planes using calibrated alpha-transparencies (`white/5`, `white/10`, `white/20`) and high-radius backdrop blurs (`backdrop-blur-xl`).
- **Luminous Violet Accents**: Gradients shifting from Electric Violet (`#8B5CF6`) to Deep Indigo (`#7C3AED`), used purposefully to guide attention and indicate active state.
- **Whisper Borders**: Subtle 1px translucent borders (`border-white/10`) to separate overlapping planes without heavy dropshadows.
- **Physical Fluidity**: Physics-based motion powered by `framer-motion` springs, avoiding robotic linear transitions.

---

## 2. Color Palette & Token System

```
  DEEP BACKGROUNDS                 VIOLET ACCENTS                  SURFACE OVERLAYS
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│ Canvas Base:  #0F0F14  │      │ Violet 500:   #8B5CF6  │      │ Ultra Low:   white/5   │
│ Sidebar Base: #1A1A2E  │      │ Violet 600:   #7C3AED  │      │ Medium Glass:white/10  │
│ Surface Elev: #16162A  │      │ Violet 700:   #6D28D9  │      │ High Glass:  white/20  │
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘
```

### 2.1 Color Tokens Table

| Token Name | Hex / RGBA Value | Tailwind Class Equivalent | Purpose & Application |
| :--- | :--- | :--- | :--- |
| `bg-canvas` | `#0F0F14` | `bg-[#0F0F14]` | Root window application background |
| `bg-sidebar` | `#1A1A2E` | `bg-[#1A1A2E]` | Persistent left navigation sidebar base |
| `bg-surface-elevated` | `#16162A` | `bg-[#16162A]` | Elevated modal drawers and flyout panels |
| `accent-primary` | `#8B5CF6` | `bg-violet-500` | Primary interactive elements, active tab glow |
| `accent-hover` | `#7C3AED` | `bg-violet-600` | Hover states on primary buttons |
| `accent-active` | `#6D28D9` | `bg-violet-700` | Pressed states, active toggles |
| `accent-gradient` | `linear-gradient(135deg, #8B5CF6, #EC4899)` | `from-violet-500 to-pink-500` | Hero download buttons and active progress bar fills |
| `glass-subtle` | `rgba(255, 255, 255, 0.05)` | `bg-white/5` | Default card background, table rows |
| `glass-medium` | `rgba(255, 255, 255, 0.10)` | `bg-white/10` | Hovered card state, dropdown menu items |
| `glass-prominent`| `rgba(255, 255, 255, 0.20)` | `bg-white/20` | Active selection pill, selected tag chip |
| `border-glass` | `rgba(255, 255, 255, 0.10)` | `border-white/10` | Universal 1px frosted glass divider |
| `border-glass-hover` | `rgba(255, 255, 255, 0.20)` | `hover:border-white/20` | Interactive card and button focus borders |

### 2.2 Semantic Status Palette

| State | Hex Code | Tailwind Token | Context of Use |
| :--- | :--- | :--- | :--- |
| **Success** | `#10B981` | `emerald-500` | Download completed, yt-dlp up-to-date, verify checkmarks |
| **Downloading** | `#0EA5E9` | `sky-500` | Active downloading speed indicators, network pulse |
| **Processing** | `#F59E0B` | `amber-500` | FFmpeg audio conversion, remuxing, chapter slicing |
| **Error** | `#F43F5E` | `rose-500` | Network failed, URL unreachable, disk space full |
| **Paused** | `#94A3B8` | `slate-400` | Queued items, paused tasks |

---

## 3. Typography Hierarchy

PullTube specifies **Inter** as the primary system font family, falling back to modern system sans-serif fonts (`system-ui`, `-apple-system`, `Segoe UI`, `Roboto`).

```
Font Family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
```

### 3.1 Type Scale

| Style / Token | Size | Line Height | Weight | Letter Spacing | Usage Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Header** | `30px` (1.875rem) | `36px` | Bold (700) | `-0.025em` | Main View Headings ("Downloads", "Settings") |
| **Section Title** | `20px` (1.25rem) | `28px` | SemiBold (600) | `-0.015em` | Card Titles, Modal Headers, Video Title |
| **Subheading** | `16px` (1.0rem) | `24px` | Medium (500) | `0em` | Option Group Labels, Navigation Items |
| **Body (Default)** | `14px` (0.875rem) | `20px` | Regular (400) | `0em` | Form labels, description text, queue stats |
| **Caption / Meta** | `12px` (0.75rem) | `16px` | Medium (500) | `+0.01em` | Time stamps, resolution tags, speed badges |
| **Mono Code** | `12px` (0.75rem) | `16px` | Regular (400) | `0em` | File paths, proxy strings, yt-dlp version numbers |

---

## 4. Glassmorphism Design Specifications

To ensure uniform aesthetic across all dialogs and cards, use the standardized glass utility classes:

```
┌───────────────────────────────────────────────────────────┐
│                    GLASSMORPHIC CONTAINER                 │
│                                                           │
│   CSS Definition:                                         │
│   • backdrop-filter: blur(24px);                          │
│   • background-color: rgba(255, 255, 255, 0.05);          │
│   • border: 1px solid rgba(255, 255, 255, 0.10);         │
│   • box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);         │
│                                                           │
│   Tailwind Composition:                                   │
│   className="backdrop-blur-xl bg-white/5                  │
│              border border-white/10 rounded-2xl           │
│              shadow-2xl shadow-black/40"                  │
└───────────────────────────────────────────────────────────┘
```

### 4.1 Blur Scale Matrix
- `backdrop-blur-sm` (4px): Subtle dropdown menus and tooltip bubbles.
- `backdrop-blur-md` (12px): Sticky table headers and navigation top bar.
- `backdrop-blur-xl` (24px): Primary video cards, sidebar panels, and center modal overlays.

---

## 5. UI Component Specifications

### 5.1 Buttons
- **Primary Action (Download / Start)**:
  - Gradient background: `bg-gradient-to-r from-violet-600 to-violet-500`
  - Shadow: `shadow-lg shadow-violet-500/25`
  - Hover: `hover:from-violet-500 hover:to-violet-400 hover:shadow-violet-500/40`
  - Pressed: `active:scale-[0.98]`
  - Corner radius: `rounded-xl` (12px)
  - Padding: `px-5 py-2.5`
- **Secondary Glass Button**:
  - Background: `bg-white/10 hover:bg-white/15 border border-white/10`
  - Text: `text-white font-medium`
- **Ghost / Icon Button**:
  - Background: `bg-transparent hover:bg-white/10 rounded-lg p-2 text-slate-400 hover:text-white`
- **Danger Button (Cancel / Delete)**:
  - Background: `bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400`

### 5.2 Input Elements
- **URL Input Bar**:
  - Height: `52px` (large ergonomic target).
  - Background: `bg-white/5 focus-within:bg-white/10 border border-white/10 focus-within:border-violet-500/50`.
  - Leading Icon: `lucide-react Link2` in `text-slate-400`.
  - Trailing Actions: "Paste" badge button (`bg-violet-500/20 text-violet-300`).
- **Select Dropdown / Format Picker**:
  - Container: Frosted glass box with chevron down icon.
  - Options Menu: Floating popover with `backdrop-blur-2xl bg-[#1A1A2E]/90 border border-white/15 rounded-xl shadow-2xl`.

### 5.3 Video Analysis Preview Card
- **Layout**: Horizontal card with 16:9 thumbnail on left (with rounded corners) and metadata/options on right.
- **Thumbnail Overlay**: Shows total duration badge (`03:45`) in bottom-right corner (`bg-black/75 px-1.5 py-0.5 text-xs rounded`).
- **Title**: 2-line clamped title in `text-white font-semibold text-lg`.
- **Badges**: Uploader pill, resolution tag (e.g. `1080p60 HDR`), audio bitrate pill.

### 5.4 Download Queue Item Card
- **Grid Layout**:
  - Column 1: Small thumbnail (64x36px) + Title & Uploader.
  - Column 2: Format pill (`MP4 1080p` or `MP3 320k`).
  - Column 3: Live speed (`12.4 MB/s`) and remaining time (`ETA 00:32`).
  - Column 4: Animated progress bar with percentage (`65%`).
  - Column 5: Action buttons (`Pause/Resume`, `Cancel`, `Open Folder`).

### 5.5 Animated Progress Bars
- **Track**: `h-2 bg-white/10 rounded-full overflow-hidden`.
- **Fill Bar**: `h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full`.
- **Smooth Animation**: Width driven by Framer Motion:
  ```tsx
  <motion.div
    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
    initial={{ width: 0 }}
    animate={{ width: `${progress}%` }}
    transition={{ ease: "easeOut", duration: 0.25 }}
  />
  ```

### 5.6 Toggle Switches
- **Track (Inactive)**: `w-11 h-6 bg-white/10 rounded-full p-1 transition-colors`.
- **Track (Active)**: `w-11 h-6 bg-violet-600 rounded-full p-1 transition-colors`.
- **Thumb**: `w-4 h-4 bg-white rounded-full shadow-md transform transition-transform` (`translate-x-0` vs `translate-x-5`).

---

## 6. Layout Grid & Spacing System

PullTube utilizes an **8px grid increment system** (Tailwind default scale: `p-2` = 8px, `p-4` = 16px, `p-6` = 24px).

```
┌─────────┬──────────────────────────────────────────────────────────────────────────┐
│         │ Top Window Titlebar & Drag Region (h-10 / 40px)                          │
│ Sidebar ├──────────────────────────────────────────────────────────────────────────┤
│ (240px) │                                                                          │
│         │ Main Content Workspace (Padding: p-8 / 32px)                             │
│ Fixed   │ Max-width: 1200px centered fluid container                               │
│ Left    │                                                                          │
│         │                                                                          │
│         │                                                                          │
└─────────┴──────────────────────────────────────────────────────────────────────────┘
```

- **Sidebar Width**: `240px` expanded (default desktop).
- **Header Titlebar**: `40px` height with `-webkit-app-region: drag` for native window dragging, housing window minimize/maximize/close icons.
- **Main View Padding**: `p-8` (32px) on desktop displays; `p-5` (20px) on compact windows.

---

## 7. Motion & Animation Standards

PullTube mandates physics-based transitions using **Framer Motion** for visual continuity.

### 7.1 Motion Spring Presets
```typescript
export const MOTION_SPRINGS = {
  // Snappy response for buttons and tab switches
  snappy: { type: "spring", stiffness: 400, damping: 30 },
  // Gentle response for modal overlays and expandable cards
  gentle: { type: "spring", stiffness: 260, damping: 20 },
  // Smooth continuous transition for progress meters
  progress: { ease: "easeOut", duration: 0.2 },
};
```

### 7.2 Page Transitions
When switching tabs (Home -> Downloads -> History -> Settings):
```typescript
export const pageVariants = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -12, filter: "blur(4px)", transition: { duration: 0.15 } }
};
```

---

## 8. Iconography (Lucide React)

All UI icons are sourced from `lucide-react`. To maintain visual harmony:
- Default icon stroke width: `1.75` (delivers refined crispness on retina/high-DPI panels).
- Sizes:
  - Small / Inline: `16px` (`w-4 h-4`)
  - Medium / Buttons & Navigation: `20px` (`w-5 h-5`)
  - Display / Hero States: `32px` (`w-8 h-8`)

### Key Icon Mappings
- **Navigation**: `Home` (Home), `DownloadCloud` (Downloads), `Clock` (History), `Settings` (Settings).
- **Media Controls**: `Play`, `Pause`, `RotateCcw` (Retry), `Trash2` (Delete), `FolderOpen` (Reveal in Explorer).
- **Features / Toggles**: `Subtitles` (Subtitles), `Image` (Thumbnail), `Tag` (Metadata), `Scissors` (Trimming), `Layers` (Chapters), `Music` (Audio Extract).

---

## 9. Theme Token Mapping (Dark & Light Glass)

While Dark Mode is the primary default, PullTube supports a "Light Glass" mode for high-ambient-light environments.

| Semantic Token | Dark Mode Token (Default) | Light Glass Mode Token |
| :--- | :--- | :--- |
| `background.canvas` | `#0F0F14` | `#F1F5F9` (Slate 100) |
| `background.sidebar` | `#1A1A2E` | `#E2E8F0` (Slate 200) |
| `surface.card` | `rgba(255, 255, 255, 0.05)` | `rgba(255, 255, 255, 0.70)` |
| `surface.card.hover` | `rgba(255, 255, 255, 0.10)` | `rgba(255, 255, 255, 0.90)` |
| `border.subtle` | `rgba(255, 255, 255, 0.10)` | `rgba(0, 0, 0, 0.08)` |
| `text.primary` | `#F8FAFC` (Slate 50) | `#0F172A` (Slate 900) |
| `text.secondary` | `#94A3B8` (Slate 400) | `#475569` (Slate 600) |
| `text.muted` | `#64748B` (Slate 500) | `#94A3B8` (Slate 400) |
| `accent.brand` | `#8B5CF6` (Violet 500) | `#7C3AED` (Violet 600) |
| `accent.glow` | `rgba(139, 92, 246, 0.25)` | `rgba(124, 58, 237, 0.20)` |
