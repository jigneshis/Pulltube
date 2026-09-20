import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CheckCircle2, Globe, ExternalLink, Sparkles } from 'lucide-react';

interface SupportedSitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample?: (url: string) => void;
}

interface SiteItem {
  name: string;
  category: 'video' | 'social' | 'music' | 'stream' | 'news';
  domain: string;
  features: string;
  sampleUrl?: string;
  color: string;
}

const SUPPORTED_SITES: SiteItem[] = [
  { name: 'YouTube', category: 'video', domain: 'youtube.com', features: 'Up to 8K, Shorts, Audio, Playlists, Chapters, Subtitles', sampleUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', color: '#FF0000' },
  { name: 'Instagram', category: 'social', domain: 'instagram.com', features: 'Reels, Posts, Carousel, Stories, Audio', sampleUrl: 'https://www.instagram.com/reels/', color: '#E4405F' },
  { name: 'Spotify', category: 'music', domain: 'open.spotify.com', features: 'Track Matching, High-Quality Audio, Metadata & Cover Art', sampleUrl: 'https://open.spotify.com/track/3azJifCSqg9fRij2yKIbWz', color: '#1DB954' },
  { name: 'TikTok', category: 'social', domain: 'tiktok.com', features: 'HD Videos, No Watermark, Audio Only', sampleUrl: 'https://www.tiktok.com/@tiktok/video/7106594312292453678', color: '#00F2FE' },
  { name: 'Facebook', category: 'social', domain: 'facebook.com', features: 'Public Videos, Reels, Watch Videos', sampleUrl: 'https://www.facebook.com/watch/', color: '#1877F2' },
  { name: 'Twitter / X', category: 'social', domain: 'x.com', features: 'Video Tweets, Broadcasts, Clips', sampleUrl: 'https://twitter.com/NASA/status/1789762122847', color: '#FFFFFF' },
  { name: 'Reddit', category: 'social', domain: 'reddit.com', features: 'v.redd.it videos, Audio extraction, GIF conversions', sampleUrl: 'https://www.reddit.com/r/videos/', color: '#FF4500' },
  { name: 'Twitch', category: 'stream', domain: 'twitch.tv', features: 'VODs, Clips, Stream Highlights', sampleUrl: 'https://www.twitch.tv/videos/', color: '#9146FF' },
  { name: 'SoundCloud', category: 'music', domain: 'soundcloud.com', features: 'HQ Tracks, Playlists, Podcasts, FLAC/MP3', sampleUrl: 'https://soundcloud.com/discover', color: '#FF5500' },
  { name: 'Vimeo', category: 'video', domain: 'vimeo.com', features: '4K/1080p, Showcases, On-Demand Previews', sampleUrl: 'https://vimeo.com/76979871', color: '#1AB7EA' },
  { name: 'Pinterest', category: 'social', domain: 'pinterest.com', features: 'Pins, Idea Pins, Story Videos', sampleUrl: 'https://pinterest.com/pin/', color: '#BD081C' },
  { name: 'Bilibili', category: 'video', domain: 'bilibili.com', features: '1080p+, Danmaku subtitles, Audio', sampleUrl: 'https://www.bilibili.com/video/', color: '#00A1D6' },
  { name: 'Dailymotion', category: 'video', domain: 'dailymotion.com', features: 'Full HD, Playlists, Subtitles', sampleUrl: 'https://www.dailymotion.com/video/x7tgad0', color: '#0066DC' },
  { name: 'Bandcamp', category: 'music', domain: 'bandcamp.com', features: 'Lossless Audio, Albums, Tracks', sampleUrl: 'https://bandcamp.com/', color: '#629AA9' },
  { name: 'Mixcloud', category: 'music', domain: 'mixcloud.com', features: 'DJ Sets, Radio Shows, Tracklists', sampleUrl: 'https://www.mixcloud.com/', color: '#5000FF' },
  { name: 'Rumble', category: 'video', domain: 'rumble.com', features: 'HD Videos, Live Streams, Channels', sampleUrl: 'https://rumble.com/', color: '#85C742' },
  { name: 'Kick', category: 'stream', domain: 'kick.com', features: 'VODs, Clips, Livestreams', sampleUrl: 'https://kick.com/', color: '#53FC18' },
  { name: 'Streamable', category: 'video', domain: 'streamable.com', features: 'Fast Short Clips, 1080p', sampleUrl: 'https://streamable.com/', color: '#0F70F0' },
  { name: 'LinkedIn', category: 'social', domain: 'linkedin.com', features: 'Feed Videos, Presentations, Learning Clips', sampleUrl: 'https://linkedin.com/', color: '#0A66C2' },
  { name: 'Tumblr', category: 'social', domain: 'tumblr.com', features: 'Video Posts, Audio Reblogs', sampleUrl: 'https://tumblr.com/', color: '#35465C' },
  { name: 'Threads', category: 'social', domain: 'threads.net', features: 'Video Posts, Audio Clips', sampleUrl: 'https://threads.net/', color: '#FFFFFF' },
  { name: 'TED Talks', category: 'news', domain: 'ted.com', features: 'Subtitles in 40+ languages, 1080p Video', sampleUrl: 'https://www.ted.com/talks', color: '#E62B1E' },
  { name: 'BBC iPlayer & News', category: 'news', domain: 'bbc.com', features: 'Broadcasts, Clips, News Video', sampleUrl: 'https://www.bbc.com/news/videos', color: '#BB1919' },
  { name: 'ESPN', category: 'news', domain: 'espn.com', features: 'Highlights, Game Replays, Analysis', sampleUrl: 'https://espn.com/video', color: '#CC0000' },
  { name: 'Audiomack', category: 'music', domain: 'audiomack.com', features: 'Music Streams, Albums, Mixtapes', sampleUrl: 'https://audiomack.com/', color: '#FFA200' },
  { name: 'VK', category: 'social', domain: 'vk.com', features: 'Videos, Clips, Music', sampleUrl: 'https://vk.com/video', color: '#0077FF' },
  { name: 'Weibo', category: 'social', domain: 'weibo.com', features: 'Short videos, Live streams', sampleUrl: 'https://weibo.com/', color: '#E6162D' },
  { name: 'Coursera', category: 'video', domain: 'coursera.org', features: 'Course Lectures, Materials, Subtitles', sampleUrl: 'https://coursera.org/', color: '#0056D2' },
];

export const SupportedSitesModal: React.FC<SupportedSitesModalProps> = ({ isOpen, onClose, onSelectSample }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredSites = useMemo(() => {
    return SUPPORTED_SITES.filter(site => {
      const matchesSearch = site.name.toLowerCase().includes(search.toLowerCase()) ||
                            site.domain.toLowerCase().includes(search.toLowerCase()) ||
                            site.features.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || site.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl max-h-[85vh] bg-[#12121A]/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Supported Platforms
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                    1,000+ Sites
                  </span>
                </h2>
                <p className="text-white/50 text-xs mt-0.5">
                  Powered by yt-dlp universal extractor engine. Download video and audio effortlessly.
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-6 border-b border-white/5 flex flex-col gap-4 bg-white/[0.02]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search across 1,000+ sites (e.g. YouTube, Spotify, TikTok, Vimeo, BBC)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                autoFocus
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { id: 'all', label: 'All Sites' },
                { id: 'video', label: 'Video & Film' },
                { id: 'social', label: 'Social Media' },
                { id: 'music', label: 'Music & Audio' },
                { id: 'stream', label: 'Streams & Gaming' },
                { id: 'news', label: 'News & Education' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    selectedCategory === cat.id 
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30' 
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Site Cards Grid */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-3 custom-scrollbar">
            {filteredSites.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-white/40 flex flex-col items-center justify-center gap-2">
                <Globe className="w-8 h-8 opacity-30" />
                <p className="text-sm">No sites matching "{search}" in this category.</p>
                <p className="text-xs text-white/30">
                  Even if not listed above, any site supported by yt-dlp works seamlessly!
                </p>
              </div>
            ) : (
              filteredSites.map((site) => (
                <div
                  key={site.name}
                  className="group p-3.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 rounded-xl transition-all flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div 
                      className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: `${site.color}20`, color: site.color, border: `1px solid ${site.color}40` }}
                    >
                      {site.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-white truncate">{site.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-white/40 truncate">{site.domain}</p>
                      <p className="text-xs text-white/70 mt-1 line-clamp-2 leading-relaxed">
                        {site.features}
                      </p>
                    </div>
                  </div>

                  {site.sampleUrl && onSelectSample && (
                    <button
                      onClick={() => {
                        onSelectSample(site.sampleUrl!);
                        onClose();
                      }}
                      className="opacity-0 group-hover:opacity-100 flex-shrink-0 px-2 py-1 text-xs rounded-lg bg-violet-600/30 text-violet-300 hover:bg-violet-600 hover:text-white transition-all"
                      title="Load sample link into downloader"
                    >
                      Test
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Supports 1,200+ extractors continuously updated via yt-dlp
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
