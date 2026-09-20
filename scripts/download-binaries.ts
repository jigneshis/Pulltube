/**
 * PullTube — Binary Download Script
 * Downloads the latest yt-dlp and FFmpeg binaries for bundling.
 * Run with: npx ts-node scripts/download-binaries.ts
 */

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { createUnzip } from 'zlib';

const BIN_DIR = path.resolve(__dirname, '..', 'resources', 'bin');

const YTDLP_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
const FFMPEG_URL = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip';

/** Follow redirects and download a file */
function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const request = (reqUrl: string) => {
      const protocol = reqUrl.startsWith('https') ? https : http;
      protocol.get(reqUrl, { headers: { 'User-Agent': 'PullTube/1.0' } }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            request(redirectUrl);
            return;
          }
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${reqUrl}: HTTP ${response.statusCode}`));
          return;
        }

        const totalSize = parseInt(response.headers['content-length'] || '0', 10);
        let downloaded = 0;

        response.on('data', (chunk: Buffer) => {
          downloaded += chunk.length;
          if (totalSize > 0) {
            const percent = ((downloaded / totalSize) * 100).toFixed(1);
            process.stdout.write(`\r  Downloading: ${percent}% (${(downloaded / 1024 / 1024).toFixed(1)} MB)`);
          }
        });

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log('\n  ✓ Download complete');
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    };

    request(url);
  });
}

async function main() {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   PullTube — Binary Download Script   ║');
  console.log('╚═══════════════════════════════════════╝\n');

  // Ensure bin directory exists
  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
    console.log(`Created directory: ${BIN_DIR}\n`);
  }

  // Download yt-dlp
  const ytdlpPath = path.join(BIN_DIR, 'yt-dlp.exe');
  if (fs.existsSync(ytdlpPath)) {
    console.log('⏭  yt-dlp.exe already exists, skipping...');
  } else {
    console.log('📥 Downloading yt-dlp.exe...');
    await downloadFile(YTDLP_URL, ytdlpPath);
  }

  // For FFmpeg, we provide instructions since it's a large archive
  const ffmpegPath = path.join(BIN_DIR, 'ffmpeg.exe');
  const ffprobePath = path.join(BIN_DIR, 'ffprobe.exe');

  if (fs.existsSync(ffmpegPath) && fs.existsSync(ffprobePath)) {
    console.log('⏭  ffmpeg.exe and ffprobe.exe already exist, skipping...');
  } else {
    console.log('\n📋 FFmpeg Setup Instructions:');
    console.log('   FFmpeg is too large to auto-download (~80MB zip).');
    console.log('   Please download manually:');
    console.log(`   1. Visit: https://www.gyan.dev/ffmpeg/builds/`);
    console.log(`   2. Download "ffmpeg-release-essentials.zip"`);
    console.log(`   3. Extract ffmpeg.exe and ffprobe.exe to:`);
    console.log(`      ${BIN_DIR}`);
    console.log('');
    console.log('   Or use winget:');
    console.log('   > winget install Gyan.FFmpeg');
    console.log(`   Then copy ffmpeg.exe and ffprobe.exe to: ${BIN_DIR}`);
  }

  console.log('\n✅ Binary setup complete!');
  console.log(`   Binaries location: ${BIN_DIR}`);
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
