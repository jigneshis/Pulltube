import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowRight, CheckCircle2, Sparkles, Copy, Play } from 'lucide-react';
import { SupportedSitesModal } from './SupportedSitesModal';

interface SupportedPlatformsProps {
  onSelectUrl?: (url: string) => void;
}

interface Platform {
  id: string;
  name: string;
  tagline: string;
  features: string;
  sampleUrl: string;
  glowColor: string;
  badge?: string;
  svg: React.ReactNode;
}

export const SupportedPlatforms: React.FC<SupportedPlatformsProps> = ({ onSelectUrl }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  const platforms: Platform[] = [
    {
      id: 'youtube',
      name: 'YouTube',
      tagline: 'Videos, Shorts, Playlists',
      features: 'Full 8K / 4K / 1080p video, 60fps, audio-only extraction, chapters & subtitles.',
      sampleUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      glowColor: '#FF0000',
      badge: 'Up to 8K',
      svg: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#FF0000]">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      id: 'instagram',
      name: 'Instagram',
      tagline: 'Reels, Posts, Stories',
      features: 'High resolution reels, carousel media, posts, stories, and original audio extraction.',
      sampleUrl: 'https://www.instagram.com/p/C-example/',
      glowColor: '#E4405F',
      badge: 'Reels & Audio',
      svg: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
          <defs>
            <linearGradient id="ig-grad-main" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fdf497"/>
              <stop offset="25%" stopColor="#fd5949"/>
              <stop offset="60%" stopColor="#d6249f"/>
              <stop offset="100%" stopColor="#285AEB"/>
            </linearGradient>
          </defs>
          <path fill="url(#ig-grad-main)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      id: 'spotify',
      name: 'Spotify',
      tagline: 'Track & Album Matching',
      features: 'Resolves Spotify metadata & album art, matching high-quality audio streams automatically.',
      sampleUrl: 'https://open.spotify.com/track/3azJifCSqg9fRij2yKIbWz',
      glowColor: '#1DB954',
      badge: 'Music Match',
      svg: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#1DB954]">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.496 17.306c-.215.353-.675.467-1.028.252-2.825-1.727-6.381-2.118-10.57-1.16-.402.092-.803-.16-.895-.562-.092-.403.16-.803.562-.895 4.587-1.047 8.52-.598 11.679 1.337.353.215.467.675.252 1.028zm1.468-3.262c-.27.44-.848.58-1.288.31-3.235-1.988-8.167-2.564-11.994-1.401-.497.151-1.026-.134-1.177-.63-.15-.497.134-1.026.63-1.178 4.376-1.328 9.814-.686 13.52 1.593.44.27.58.848.31 1.288zm.126-3.41c-3.88-2.304-10.279-2.516-13.987-1.389-.594.18-1.226-.156-1.407-.75-.18-.595.156-1.227.75-1.407 4.26-1.294 11.332-1.045 15.792 1.603.535.318.71 1.01.393 1.545-.318.536-1.01.71-1.545.393z"/>
        </svg>
      )
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      tagline: 'HD Videos, No Watermark',
      features: 'Lossless video quality, audio isolation, profile clips, and trending sounds.',
      sampleUrl: 'https://www.tiktok.com/@tiktok/video/7106594312292453678',
      glowColor: '#00F2FE',
      badge: 'Clean Video',
      svg: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      )
    },
    {
      id: 'facebook',
      name: 'Facebook',
      tagline: 'Watch, Reels, Posts',
      features: 'Public Facebook videos, Watch episodes, high-resolution reels, and live stream archives.',
      sampleUrl: 'https://www.facebook.com/watch/',
      glowColor: '#1877F2',
      badge: '1080p HD',
      svg: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#1877F2]">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      tagline: 'Video Tweets & Broadcasts',
      features: 'Download HD video tweets, spaces recordings, GIF conversions, and thread media.',
      sampleUrl: 'https://twitter.com/NASA/status/1789762122847',
      glowColor: '#A0A0A0',
      badge: 'Fast Extract',
      svg: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      id: 'reddit',
      name: 'Reddit',
      tagline: 'v.redd.it & Community Clips',
      features: 'Merges Reddit video with clean synchronized audio without watermarks.',
      sampleUrl: 'https://www.reddit.com/r/videos/',
      glowColor: '#FF4500',
      badge: 'Audio Merged',
      svg: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#FF4500]">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      )
    },
    {
      id: 'twitch',
      name: 'Twitch',
      tagline: 'Clips & Full VODs',
      features: 'Capture live highlights, 1080p60 stream replays, and broadcaster audio.',
      sampleUrl: 'https://www.twitch.tv/videos/',
      glowColor: '#9146FF',
      badge: 'VODs & Clips',
      svg: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#9146FF]">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
        </svg>
      )
    },
    {
      id: 'soundcloud',
      name: 'SoundCloud',
      tagline: 'HQ Tracks & DJ Sets',
      features: 'Direct lossless stream downloads, complete artist sets, and MP3/FLAC encoding.',
      sampleUrl: 'https://soundcloud.com/discover',
      glowColor: '#FF5500',
      badge: 'Lossless Audio',
      svg: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#FF5500]">
          <path d="M1.175 12.225c-.051 0-.094.045-.101.1l-.28 3.447.28 3.407a.1.1 0 0 0 .101.091c.057 0 .102-.041.107-.091l.342-3.407-.342-3.447a.097.097 0 0 0-.107-.1zm1.229-.98c-.067 0-.12.053-.127.124l-.32 4.414.32 4.354a.125.125 0 0 0 .127.114.123.123 0 0 0 .126-.114l.394-4.354-.394-4.414a.125.125 0 0 0-.126-.124zm1.311-.849c-.08 0-.146.066-.153.151l-.327 5.25.327 5.163a.152.152 0 0 0 .153.14.152.152 0 0 0 .153-.14l.43-5.163-.43-5.25a.15.15 0 0 0-.153-.151zm1.353-.306c-.097 0-.173.08-.182.179l-.314 5.568.314 5.437a.18.18 0 0 0 .182.169c.1 0 .178-.077.185-.169l.45-5.437-.45-5.568a.179.179 0 0 0-.185-.179zm1.393-.193c-.11 0-.2.09-.209.204l-.307 5.76.307 5.578a.206.206 0 0 0 .209.193.204.204 0 0 0 .207-.193l.477-5.578-.477-5.76a.202.202 0 0 0-.207-.204zm1.425.405c-.126 0-.226.104-.233.232l-.28 5.347.28 5.474a.23.23 0 0 0 .233.22c.125 0 .227-.099.234-.22l.509-5.474-.509-5.347a.231.231 0 0 0-.234-.232zm1.439-1.258c-.139 0-.253.117-.26.26l-.261 6.592.261 5.378a.258.258 0 0 0 .26.246.257.257 0 0 0 .259-.246l.542-5.378-.542-6.592a.257.257 0 0 0-.259-.26zm1.455-1.127c-.156 0-.28.129-.288.288l-.234 7.72.234 5.275a.286.286 0 0 0 .288.273c.156 0 .282-.122.289-.273l.57-5.275-.57-7.72a.284.284 0 0 0-.289-.288zm1.488-.344c-.171 0-.309.143-.317.318l-.208 8.05.208 5.176a.315.315 0 0 0 .317.302c.17 0 .31-.133.318-.302l.605-5.176-.605-8.05a.314.314 0 0 0-.318-.318zm4.498-2.07c-.438 0-.853.093-1.232.259a4.85 4.85 0 0 0-.348-.962 4.417 4.417 0 0 0-4.04-2.613c-.347 0-.68.04-1.002.115-.224.053-.306.183-.314.373l-.159 11.23.159 5.076c.01.19.108.329.314.364.312.054.635.084.965.084h5.657a4.912 4.912 0 0 0 4.91-4.91c0-2.715-2.202-4.916-4.91-4.916z"/>
        </svg>
      )
    },
    {
      id: 'vimeo',
      name: 'Vimeo',
      tagline: 'High Bitrate & 4K',
      features: 'Uncompressed audio, original quality 4K and 1080p, showcase extractions.',
      sampleUrl: 'https://vimeo.com/76979871',
      glowColor: '#1AB7EA',
      badge: 'Original 4K',
      svg: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#1AB7EA]">
          <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128 1.564-1.399 2.736-2.143 3.515-2.235 1.848-.188 2.983.924 3.41 3.337.457 2.584.773 4.19.951 4.821.533 2.454 1.119 3.682 1.761 3.682.494 0 1.223-.787 2.186-2.358.96-1.57 1.484-2.77 1.57-3.601.157-1.344-.383-2.019-1.62-2.019-.589 0-1.206.136-1.85.408 1.213-3.978 3.525-5.91 6.938-5.794 2.525.087 3.716 1.717 3.57 4.892z"/>
        </svg>
      )
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      tagline: 'Idea Pins & Videos',
      features: 'High quality video pins, animated stories, and tutorial downloads.',
      sampleUrl: 'https://pinterest.com/pin/',
      glowColor: '#BD081C',
      badge: 'Video Pins',
      svg: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#BD081C]">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
        </svg>
      )
    },
    {
      id: 'bilibili',
      name: 'Bilibili',
      tagline: '1080p+ & Subtitles',
      features: 'Full high-definition videos, Danmaku bullet comment subtitles, and audio streams.',
      sampleUrl: 'https://www.bilibili.com/video/',
      glowColor: '#00A1D6',
      badge: 'Danmaku Subs',
      svg: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#00A1D6]">
          <path d="M17.813 4.653h.854c1.51 0 2.769.833 3.42 2.052.545 1.02.665 2.22.339 3.393-.191.687-.514 1.32-.952 1.867.014.225.02.453.02.684 0 5.213-4.226 9.444-9.439 9.444-5.214 0-9.44-4.231-9.44-9.444 0-.231.006-.459.02-.684a5.14 5.14 0 0 1-.952-1.867c-.326-1.173-.206-2.373.339-3.393.651-1.219 1.91-2.052 3.42-2.052h.854l-1.579-2.735a1.005 1.005 0 0 1 .368-1.374 1.005 1.005 0 0 1 1.374.368L8.683 4.653h6.634l2.203-3.693a1.005 1.005 0 0 1 1.374-.368 1.005 1.005 0 0 1 .368 1.374l-1.449 2.687zM7.333 13.067a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zm9.334 0a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z"/>
        </svg>
      )
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 py-4">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Supported on 1,000+ Platforms
            </h3>
            <p className="text-xs text-white/50">
              Paste any public link. Official extractors handle video, audio, and metadata.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/40 text-xs font-medium text-white/70 hover:text-violet-300 transition-all self-start sm:self-auto"
        >
          <Globe className="w-3.5 h-3.5 text-violet-400" />
          <span>Browse All 1,000+ Sites</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {platforms.map((p) => {
          const isSelected = selectedPlatform?.id === p.id;
          return (
            <motion.div
              key={p.id}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlatform(isSelected ? null : p)}
              className={`relative cursor-pointer p-3.5 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center group ${
                isSelected 
                  ? 'bg-white/10 border-violet-500/60 shadow-lg shadow-violet-500/20' 
                  : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5 hover:border-white/20'
              }`}
            >
              {/* Ambient Glow */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-300 blur-xl pointer-events-none"
                style={{ backgroundColor: p.glowColor }}
              />

              {/* Logo */}
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110">
                {p.svg}
              </div>

              {/* Name */}
              <div className="flex items-center gap-1 font-semibold text-xs text-white group-hover:text-white transition-colors">
                <span>{p.name}</span>
              </div>

              {/* Feature Pill */}
              <span className="text-[10px] text-white/40 group-hover:text-white/70 mt-0.5 truncate max-w-full">
                {p.badge || p.tagline}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Platform Quick-Action Banner */}
      <AnimatePresence>
        {selectedPlatform && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/15 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center p-2 flex-shrink-0"
                  style={{ backgroundColor: `${selectedPlatform.glowColor}25`, border: `1px solid ${selectedPlatform.glowColor}40` }}
                >
                  {selectedPlatform.svg}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{selectedPlatform.name}</h4>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                    {selectedPlatform.features}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                {onSelectUrl && (
                  <button
                    onClick={() => {
                      onSelectUrl(selectedPlatform.sampleUrl);
                      setSelectedPlatform(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Try Sample</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedPlatform(null)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for 1,000+ sites */}
      <SupportedSitesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectSample={onSelectUrl}
      />
    </div>
  );
};
