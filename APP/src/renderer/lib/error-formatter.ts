/**
 * PullTube — User-Facing Error Sanitizer
 * Strips technical IPC/Node.js/yt-dlp traces and translates errors into
 * clean, plain-English explanations with actionable recovery hints.
 */

export interface ParsedUserError {
  title: string;
  explanation: string;
  hint?: string;
  rawDetails?: string;
  category: 'unavailable' | 'network' | 'restricted' | 'invalid' | 'ratelimit' | 'generic';
}

export function formatUserFacingError(error: unknown): ParsedUserError {
  let raw = '';
  if (typeof error === 'string') {
    raw = error;
  } else if (error instanceof Error) {
    raw = error.message || String(error);
  } else if (error && typeof error === 'object' && 'message' in error) {
    raw = String((error as any).message);
  } else {
    raw = String(error || 'Unknown error');
  }

  // 1. Clean out technical Node/Electron IPC wrappers
  let cleaned = raw
    // Remove Electron IPC invoke wrappers
    .replace(/^Error:\s*Error invoking remote method '[^']+':\s*/gi, '')
    .replace(/^Error invoking remote method '[^']+':\s*/gi, '')
    .replace(/^Error:\s*Error:\s*/gi, '')
    .replace(/^Error:\s*/gi, '')
    // Remove yt-dlp technical prefixes
    .replace(/^ERROR:\s*(\[[^\]]+\]\s*)?/gi, '')
    // Remove Node stack traces
    .replace(/\s+at\s+.+$/gms, '')
    .trim();

  // 2. Classify error and return human-friendly user copy
  const lower = (cleaned + ' ' + raw).toLowerCase();

  // Category: Private, Removed, or Unavailable Video
  if (
    lower.includes('private video') ||
    lower.includes('video unavailable') ||
    lower.includes('has been removed') ||
    lower.includes('this video is not available') ||
    lower.includes('http error 404') ||
    lower.includes('not found')
  ) {
    return {
      title: 'Video Unavailable or Private',
      explanation: 'This video cannot be accessed. It might have been deleted, set to private, or requires permission from the creator.',
      hint: 'Verify whether the link opens in your web browser without logging in.',
      category: 'unavailable',
      rawDetails: cleaned || raw,
    };
  }

  // Category: Age-Restricted
  if (
    lower.includes('confirm your age') ||
    lower.includes('age-restricted') ||
    lower.includes('sign in to confirm') ||
    lower.includes('inappropriate for some users')
  ) {
    return {
      title: 'Age-Restricted Video',
      explanation: 'This content requires age verification and cannot be downloaded without an authenticated account.',
      hint: 'The platform restricts direct access to age-gated media.',
      category: 'restricted',
      rawDetails: cleaned || raw,
    };
  }

  // Category: Geo-blocked / Region Restricted
  if (
    lower.includes('geo-restricted') ||
    lower.includes('not available in your region') ||
    lower.includes('not available in your country') ||
    lower.includes('blocked in your country') ||
    lower.includes('http error 403')
  ) {
    return {
      title: 'Region Restricted Content',
      explanation: 'The creator or platform has restricted this video in your geographical location.',
      hint: 'Try configuring a proxy or connecting through a VPN in Settings.',
      category: 'restricted',
      rawDetails: cleaned || raw,
    };
  }

  // Category: Network / Connection Issues
  if (
    lower.includes('enotfound') ||
    lower.includes('econnrefused') ||
    lower.includes('econnreset') ||
    lower.includes('etimedout') ||
    lower.includes('network') ||
    lower.includes('certificate_verify_failed') ||
    lower.includes('unable to connect') ||
    lower.includes('offline')
  ) {
    return {
      title: 'Network Connection Issue',
      explanation: 'Could not reach the server. Please check your internet connection and try again.',
      hint: 'Ensure your Wi-Fi or Ethernet is active, or check if a VPN/firewall is blocking downloads.',
      category: 'network',
      rawDetails: cleaned || raw,
    };
  }

  // Category: Rate Limited (HTTP 429)
  if (
    lower.includes('http error 429') ||
    lower.includes('too many requests') ||
    lower.includes('rate limit')
  ) {
    return {
      title: 'Too Many Requests',
      explanation: 'The platform is temporarily rate-limiting requests to protect its servers.',
      hint: 'Wait 30–60 seconds before trying again.',
      category: 'ratelimit',
      rawDetails: cleaned || raw,
    };
  }

  // Category: Live Stream in Progress
  if (
    lower.includes('live event will begin') ||
    lower.includes('is a live stream') ||
    lower.includes('live stream recording')
  ) {
    return {
      title: 'Live Stream In Progress',
      explanation: 'This video is currently broadcasting live. PullTube can only download streams after they have finished.',
      hint: 'Please wait until the live broadcast concludes.',
      category: 'unavailable',
      rawDetails: cleaned || raw,
    };
  }

  // Category: Invalid or Unsupported Link
  if (
    lower.includes('is not a valid url') ||
    lower.includes('unsupported url') ||
    lower.includes('unable to extract') ||
    lower.includes('no video formats found')
  ) {
    return {
      title: 'Invalid or Unsupported Link',
      explanation: 'PullTube could not recognize this URL or extract media from it.',
      hint: 'Make sure the link begins with https:// and points to a video or audio track.',
      category: 'invalid',
      rawDetails: cleaned || raw,
    };
  }

  // Clean fallback: remove any leftover technical jargon
  const simpleMessage = cleaned.length > 0 && cleaned.length < 150
    ? cleaned
    : 'Something went wrong while retrieving media information.';

  return {
    title: 'Unable to Load Link',
    explanation: simpleMessage,
    hint: 'Double-check the link in your browser and try again.',
    category: 'generic',
    rawDetails: cleaned || raw,
  };
}
