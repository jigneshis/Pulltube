# PullTube — Contributor Guidelines

Thank you for your interest in contributing to **PullTube**! PullTube is built to bring powerful media extraction into a clean, modern, and privacy-conscious desktop experience.

To maintain code quality, security, and developer ergonomics, please review and adhere to these guidelines.

---

## 1. Code of Conduct

All contributors and maintainers are expected to uphold a welcoming, respectful, and inclusive community. Harassment, discrimination, or abusive language will not be tolerated. Treat all team members with dignity and constructive feedback.

---

## 2. Development Environment Setup

### 2.1 Prerequisites
Ensure your local development environment meets these baseline specifications:
- **Operating System**: Windows 10/11 (64-bit).
- **Node.js**: `v18.18.0` or higher (LTS `v20.x` recommended).
- **Package Manager**: `npm` (v9+) or `pnpm` (v8+).
- **Git**: `2.30.0+`.
- **Python**: `3.9+` (required for certain native Node-gyp bindings if building custom packages).
- **Visual Studio Build Tools**: "Desktop development with C++" workload installed (if native modules require recompilation).

### 2.2 Local Repository Setup
1. Fork the repository on GitHub and clone your fork:
   ```bash
   git clone https://github.com/<your-username>/pulltube.git
   cd pulltube
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify local binaries:
   PullTube expects static binaries in the `./bin/` directory for local development:
   - `bin/yt-dlp.exe`
   - `bin/ffmpeg.exe`
   - `bin/ffprobe.exe`

   You can download the latest official binaries manually or run the setup helper script:
   ```bash
   npm run setup:binaries
   ```

### 2.3 Running the Development Server
PullTube uses Vite for instant HMR in the renderer and concurrently runs the Electron main process:
```bash
# Launch both Renderer (Vite) and Electron Main Process in watch mode
npm run dev
```

Individual development targets:
```bash
# Run only Vite dev server (browser preview)
npm run dev:renderer

# Build and watch Electron main process
npm run dev:main
```

---

## 3. Architecture & Project Conventions

### 3.1 Strict Process Separation
- **Never invoke Node.js native APIs inside `src/renderer/`**.
- All communication between Renderer and Main must pass through typed IPC channels defined in `src/shared/types/ipc.ts` and exposed securely via `src/preload/index.ts`.
- Renderer state is managed exclusively through **Zustand stores** (`src/renderer/stores/`).

### 3.2 TypeScript Standards
- Enable strict mode (`"strict": true` in `tsconfig.json`).
- Explicitly type all function signatures, component props, and API returns.
- **Do not use `any`**. Use `unknown` with type guards or create explicit interfaces.
- Export JSDoc comments on all utility functions, services, and reusable components.

### 3.3 UI & Styling Standards
- Follow the design tokens defined in [DESIGN.md](file:///c:/Users/jigne/Projects/Yt%20downloader/documents/DESIGN.md).
- Use **Tailwind CSS 3** utility classes. Glassmorphism containers should strictly use the calibrated tokens:
  ```tsx
  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl"
  ```
- Use **Framer Motion** for animations rather than standard CSS transitions to maintain consistent spring physics.
- Use **Lucide React** for all application icons with standard `1.75` stroke width.

---

## 4. Git & Commit Guidelines

We enforce the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### 4.1 Commit Format
```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

### 4.2 Allowed Types
- `feat`: A new user-facing feature or enhancement.
- `fix`: A bug fix.
- `docs`: Documentation updates or additions.
- `style`: Changes that do not affect code logic (formatting, spacing).
- `refactor`: Code refactoring without behavioral alterations.
- `perf`: Performance optimizations.
- `test`: Adding or correcting tests.
- `chore`: Build scripts, dependencies, or tooling updates.

### 4.3 Examples
- `feat(queue): add parallel download concurrency slider in settings`
- `fix(ytdlp): handle carriage return in stdout progress parser`
- `docs(design): update glassmorphic color tokens table`

---

## 5. Pull Request (PR) Process

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feat/playlist-selection
   ```
2. **Implement and Test**:
   - Verify code compiles without warnings:
     ```bash
     npm run typecheck
     npm run lint
     ```
   - Verify packaging succeeds locally:
     ```bash
     npm run build
     ```
3. **Commit Your Changes** following Conventional Commits.
4. **Push to Your Fork**:
   ```bash
   git push origin feat/playlist-selection
   ```
5. **Open a Pull Request** against the `main` branch.
6. Complete the PR template checklist (see below).

---

## 6. Issue Templates

### 6.1 Bug Report Template
```markdown
---
name: Bug report
about: Create a report to help us improve PullTube
title: '[BUG] '
labels: bug
---

**Describe the Bug**
A clear and concise description of what the bug is.

**Steps to Reproduce**
1. Paste URL: '...'
2. Select Format: '...'
3. Click 'Download'
4. See error: '...'

**Expected Behavior**
A clear description of what you expected to happen.

**Media URL (if applicable)**
URL causing the issue (public domain or test video):

**Desktop Environment**
 - OS: Windows 10 / Windows 11 (build version)
 - PullTube Version: [e.g. 1.0.0]
 - Installed yt-dlp Version: [e.g. 2024.08.06]

**Application Logs / Console Output**
```
Paste any relevant logs from AppData/Roaming/PullTube/logs or DevTools console
```
```

### 6.2 Feature Request Template
```markdown
---
name: Feature request
about: Suggest an idea or capability for PullTube
title: '[FEAT] '
labels: enhancement
---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the Solution You'd Like**
A clear and concise description of what you want to happen.

**Describe Alternatives You've Considered**
A clear and concise description of any alternative solutions or features you've considered.

**Target User Persona**
- [ ] Casual Consumer
- [ ] Power User / Archivist
- [ ] Content Creator / Video Editor

**Additional Context**
Add any other context, mockups, or screenshots about the feature request here.
```
