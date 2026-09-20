import { spawn } from 'child_process';
import { getYtdlpPath } from './binary-manager';
import { VideoInfo, PlaylistInfo, PlaylistItem } from '../shared/types';

export interface SpotifyTrackData {
  id: string;
  title: string;
  artist: string;
  album?: string;
  durationMs: number;
  durationSec: number;
  thumbnail: string;
  releaseDate?: string;
  spotifyUrl: string;
}

export class SpotifyResolver {
  /**
   * Determine if a URL is a Spotify track, playlist, or album
   */
  static isSpotifyUrl(url: string): boolean {
    return /open\.spotify\.com\/(track|playlist|album)\/|spotify:(track|playlist|album):/i.test(url);
  }

  static isSpotifyPlaylistOrAlbum(url: string): boolean {
    return /open\.spotify\.com\/(playlist|album)\/|spotify:(playlist|album):/i.test(url);
  }

  /**
   * Extract type ('track' | 'playlist' | 'album') and ID from Spotify URL
   */
  static parseSpotifyUrl(url: string): { type: 'track' | 'playlist' | 'album'; id: string } | null {
    const match = url.match(/(?:open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|playlist|album)\/|spotify:(track|playlist|album):)([a-zA-Z0-9]+)/i);
    if (!match) return null;
    return {
      type: (match[1] || match[2]).toLowerCase() as 'track' | 'playlist' | 'album',
      id: match[3],
    };
  }

  /**
   * Format seconds into mm:ss or hh:mm:ss
   */
  static formatDuration(sec: number): string {
    if (!sec || isNaN(sec)) return '--:--';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h}:${remM.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  /**
   * Fetch high-resolution track metadata from Spotify embed endpoint
   */
  static async getTrackData(url: string): Promise<SpotifyTrackData | null> {
    const parsed = this.parseSpotifyUrl(url);
    if (!parsed || parsed.type !== 'track') return null;

    try {
      const embedUrl = `https://open.spotify.com/embed/track/${parsed.id}`;
      const res = await fetch(embedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (res.ok) {
        const html = await res.text();
        const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
        if (nextMatch) {
          const parsedJson = JSON.parse(nextMatch[1]);
          const entity = parsedJson?.props?.pageProps?.state?.data?.entity;
          if (entity) {
            const title = entity.title || entity.name || 'Spotify Track';
            const artists = Array.isArray(entity.artists)
              ? entity.artists.map((a: any) => a.name).filter(Boolean).join(', ')
              : 'Various Artists';
            const durationMs = typeof entity.duration === 'number' ? entity.duration : 0;
            const durationSec = Math.round(durationMs / 1000);

            // Extract best quality cover art (prefer 640x640)
            let thumbnail = '';
            if (Array.isArray(entity.visualIdentity?.image) && entity.visualIdentity.image.length > 0) {
              const bestImg = entity.visualIdentity.image.find((i: any) => i.maxWidth === 640) || entity.visualIdentity.image[0];
              thumbnail = bestImg.url || '';
            }
            if (thumbnail.includes('ab67616d00001e02')) {
              thumbnail = thumbnail.replace('ab67616d00001e02', 'ab67616d0000b273');
            }

            return {
              id: parsed.id,
              title,
              artist: artists,
              album: entity.album?.name,
              durationMs,
              durationSec,
              thumbnail,
              releaseDate: entity.releaseDate?.isoString,
              spotifyUrl: url,
            };
          }
        }
      }
    } catch (e) {
      console.warn('Spotify embed metadata fetch failed, trying oEmbed fallback:', e);
    }

    // Fallback to oEmbed if embed page fails
    try {
      const oembedRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
      if (oembedRes.ok) {
        const odata: any = await oembedRes.json();
        let thumb = odata.thumbnail_url || '';
        if (thumb.includes('ab67616d00001e02')) {
          thumb = thumb.replace('ab67616d00001e02', 'ab67616d0000b273');
        }
        return {
          id: parsed.id,
          title: odata.title || 'Spotify Track',
          artist: '',
          durationMs: 0,
          durationSec: 0,
          thumbnail: thumb,
          spotifyUrl: url,
        };
      }
    } catch (e) {
      console.error('Spotify oEmbed fallback error:', e);
    }

    return null;
  }

  /**
   * Search YouTube for candidates using yt-dlp flat-playlist dump
   */
  private static searchCandidates(query: string): Promise<any[]> {
    return new Promise((resolve) => {
      const proc = spawn(getYtdlpPath(), [
        '--no-warnings',
        '--dump-json',
        '--flat-playlist',
        '--js-runtimes',
        'node',
        `ytsearch8:${query}`,
      ]);

      let stdout = '';
      proc.stdout.on('data', (d) => (stdout += d.toString()));
      proc.on('close', () => {
        const lines = stdout.trim().split('\n').filter(Boolean);
        const results = lines
          .map((l) => {
            try {
              return JSON.parse(l);
            } catch {
              return null;
            }
          })
          .filter(Boolean);
        resolve(results);
      });
      proc.on('error', () => resolve([]));
    });
  }

  /**
   * Score candidates to find the exact studio digital master matching Spotify duration
   */
  private static scoreCandidate(
    candidate: any,
    expectedArtist: string,
    expectedTitle: string,
    expectedDurationSec: number
  ): number {
    let score = 0;
    const title = (candidate.title || '').toLowerCase();
    const channel = (candidate.channel || candidate.uploader || '').toLowerCase();
    const duration = typeof candidate.duration === 'number' ? candidate.duration : 0;

    // 1. Duration matching (most critical factor for audio fidelity)
    if (expectedDurationSec > 0 && duration > 0) {
      const diff = Math.abs(duration - expectedDurationSec);
      if (diff <= 2) {
        score += 55; // Exact duration match (±2s)
      } else if (diff <= 5) {
        score += 30; // Close duration (±5s)
      } else if (diff <= 10) {
        score += 10;
      } else {
        score -= 40; // Significant mismatch (likely a music video with intro/outro skits or extended edit)
      }
    }

    // 2. YouTube Music / Record Label "Topic" channel bonus (pure studio master)
    if (channel.includes('topic') || title.includes('provided to youtube')) {
      score += 40;
    }

    // 3. Official Audio bonus
    if (title.includes('official audio') || title.includes('audio')) {
      score += 25;
    }

    // 4. Penalize Live, Remix, Slowed, Reverb, Cover, Karaoke UNLESS present in the original track title
    const cleanExpected = `${expectedTitle} ${expectedArtist}`.toLowerCase();
    const penaltyKeywords = [
      'live',
      'remix',
      'slowed',
      'reverb',
      'speed up',
      'sped up',
      'cover',
      'karaoke',
      'instrumental',
      'bass boosted',
      '8d audio',
    ];

    for (const kw of penaltyKeywords) {
      if (!cleanExpected.includes(kw) && title.includes(kw)) {
        score -= 50;
      }
    }

    // 5. Penalize official music videos if duration does not closely match (often contain dialogue or skits)
    if (title.includes('official music video') || title.includes('official video')) {
      if (expectedDurationSec > 0 && Math.abs(duration - expectedDurationSec) > 3) {
        score -= 35;
      }
    }

    return score;
  }

  /**
   * Find the highest-fidelity studio master stream on YouTube for a Spotify track
   */
  static async findBestStudioMatch(track: SpotifyTrackData): Promise<string> {
    const primaryQuery = track.artist ? `${track.artist} - ${track.title}` : track.title;
    let candidates = await this.searchCandidates(primaryQuery);

    // If no candidates or low confidence, attempt secondary query with "Topic" or "Official Audio"
    if (candidates.length < 2 && track.artist) {
      const secondaryCandidates = await this.searchCandidates(`${track.artist} ${track.title} Topic`);
      candidates = candidates.concat(secondaryCandidates);
    }

    if (candidates.length === 0) {
      // Fallback to basic search
      return `ytsearch1:${primaryQuery} audio`;
    }

    // Score all candidates
    const scored = candidates.map((c) => ({
      candidate: c,
      score: this.scoreCandidate(c, track.artist, track.title, track.durationSec),
    }));

    scored.sort((a, b) => b.score - a.score);
    const winner = scored[0].candidate;

    const winnerUrl = winner.url || (winner.id ? `https://www.youtube.com/watch?v=${winner.id}` : null);
    if (winnerUrl) {
      return winnerUrl.startsWith('http') ? winnerUrl : `https://www.youtube.com/watch?v=${winnerUrl}`;
    }

    return `ytsearch1:${primaryQuery} audio`;
  }

  /**
   * Resolve a Spotify track URL into a complete VideoInfo object with studio master audio
   */
  static async resolveTrack(url: string, fetchRawVideoInfo: (target: string) => Promise<VideoInfo>): Promise<VideoInfo> {
    const trackData = await this.getTrackData(url);
    if (!trackData) {
      // If metadata couldn't be extracted, pass search query to yt-dlp
      return fetchRawVideoInfo(`ytsearch1:${url}`);
    }

    const matchedUrl = await this.findBestStudioMatch(trackData);
    const ytInfo = await fetchRawVideoInfo(matchedUrl);

    // Present pristine Spotify metadata & HD album cover in UI
    const displayTitle = trackData.artist ? `${trackData.artist} - ${trackData.title}` : trackData.title;
    const duration = trackData.durationSec || ytInfo.duration;

    return {
      ...ytInfo,
      title: `${displayTitle} (Spotify Studio Master)`,
      thumbnail: trackData.thumbnail || ytInfo.thumbnail,
      channel: trackData.artist ? `${trackData.artist} • Spotify High Fidelity` : 'Spotify / YouTube Music',
      duration,
      durationString: this.formatDuration(duration),
      url: ytInfo.webpage_url || ytInfo.url || matchedUrl,
      webpage_url: ytInfo.webpage_url || ytInfo.url || matchedUrl,
    };
  }

  /**
   * Resolve a Spotify playlist or album into a PlaylistInfo object
   */
  static async resolveCollection(url: string): Promise<PlaylistInfo> {
    const parsed = this.parseSpotifyUrl(url);
    if (!parsed || (parsed.type !== 'playlist' && parsed.type !== 'album')) {
      throw new Error('Invalid Spotify playlist or album URL.');
    }

    const embedUrl = `https://open.spotify.com/embed/${parsed.type}/${parsed.id}`;
    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to load Spotify ${parsed.type} (HTTP ${res.status}).`);
    }

    const html = await res.text();
    const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (!nextMatch) {
      throw new Error(`Could not parse Spotify ${parsed.type} details.`);
    }

    const parsedJson = JSON.parse(nextMatch[1]);
    const entity = parsedJson?.props?.pageProps?.state?.data?.entity;
    if (!entity) {
      throw new Error(`Spotify ${parsed.type} entity not found.`);
    }

    const collectionTitle = entity.title || entity.name || `Spotify ${parsed.type === 'album' ? 'Album' : 'Playlist'}`;
    const rawTracks: any[] = Array.isArray(entity.trackList) ? entity.trackList : [];

    let collectionThumb = '';
    if (Array.isArray(entity.visualIdentity?.image) && entity.visualIdentity.image.length > 0) {
      const bestImg = entity.visualIdentity.image.find((i: any) => i.maxWidth === 640) || entity.visualIdentity.image[0];
      collectionThumb = bestImg.url || '';
    }
    if (collectionThumb.includes('ab67616d00001e02')) {
      collectionThumb = collectionThumb.replace('ab67616d00001e02', 'ab67616d0000b273');
    }

    const items: PlaylistItem[] = rawTracks.map((t: any, idx: number) => {
      const trackId = t.uri ? t.uri.replace('spotify:track:', '') : String(idx + 1);
      const trackUrl = `https://open.spotify.com/track/${trackId}`;
      const durationMs = typeof t.duration === 'number' ? t.duration : 0;
      const durationSec = Math.round(durationMs / 1000);
      const artistName = t.subtitle || '';
      const trackTitle = t.title || `Track ${idx + 1}`;
      const fullTitle = artistName ? `${artistName} - ${trackTitle}` : trackTitle;

      return {
        id: trackId,
        title: fullTitle,
        url: trackUrl,
        thumbnail: collectionThumb,
        duration: durationSec,
        durationString: this.formatDuration(durationSec),
        channel: artistName || collectionTitle,
        index: idx + 1,
      };
    });

    return {
      id: parsed.id,
      title: collectionTitle,
      description: `Spotify ${parsed.type.toUpperCase()} • ${items.length} tracks`,
      channel: 'Spotify High-Fidelity',
      thumbnail: collectionThumb,
      itemCount: items.length,
      items,
      url,
    };
  }
}
