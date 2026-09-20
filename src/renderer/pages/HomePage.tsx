import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/ipc';
import { VideoInfo, FormatInfo, DownloadOptions as DLOpts, PlaylistInfo, PlaylistItem } from '../../shared/types';
import { formatUserFacingError, ParsedUserError } from '../lib/error-formatter';
import { UrlInput } from '../components/download/UrlInput';
import { VideoPreview } from '../components/download/VideoPreview';
import { FormatSelector } from '../components/download/FormatSelector';
import { DownloadOptions } from '../components/download/DownloadOptions';
import { PlaylistChoiceModal } from '../components/download/PlaylistChoiceModal';
import { PlaylistView } from '../components/download/PlaylistView';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { Download } from 'lucide-react';
import { SupportedPlatforms } from '../components/download/SupportedPlatforms';

export default function HomePage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ParsedUserError | null>(null);
  
  // Single video state
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [formats, setFormats] = useState<FormatInfo[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<string>('best');

  // Playlist state
  const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfo | null>(null);
  const [choiceModalOpen, setChoiceModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState('');

  const [options, setOptions] = useState<DLOpts>({
    url: '',
    quality: 'best',
    outputFormat: 'mp4',
    mode: 'video',
    outputDir: '',
    filenameTemplate: '',
    embedSubtitles: false,
    subtitleLangs: [],
    subtitleFormat: 'srt',
    embedThumbnail: true,
    embedMetadata: true,
    splitChapters: false,
    extractAudio: false,
    customArgs: '',
  });

  const { toast } = useToast();

  const isPurePlaylist = (u: string) => {
    return (
      (/[?&]list=[a-zA-Z0-9_-]+/i.test(u) && !/[?&]v=[a-zA-Z0-9_-]+/i.test(u)) ||
      /youtube\.com\/playlist\?/i.test(u) ||
      /soundcloud\.com\/[^/]+\/sets\//i.test(u) ||
      /open\.spotify\.com\/(playlist|album)\//i.test(u) ||
      /spotify:(playlist|album):/i.test(u)
    );
  };

  const isMixedPlaylist = (u: string) => {
    return /[?&]v=[a-zA-Z0-9_-]+/i.test(u) && /[?&]list=[a-zA-Z0-9_-]+/i.test(u);
  };

  const fetchSingleVideo = async (targetUrl: string) => {
    setLoading(true);
    setError(null);
    setPlaylistInfo(null);
    try {
      const info = await api.fetchVideoInfo(targetUrl);
      setVideoInfo(info);
      setFormats(Array.isArray(info.formats) ? info.formats : []);
      setSelectedQuality('best');
      const isAudioByDefault =
        targetUrl.includes('spotify.com') ||
        targetUrl.includes('soundcloud.com') ||
        targetUrl.includes('bandcamp.com');
      const defaultMode = isAudioByDefault ? 'audio' : 'video';
      const defaultFormat = isAudioByDefault ? 'mp3' : 'mp4';
      setOptions((prev) => ({
        ...prev,
        url: info.url || targetUrl,
        mode: defaultMode,
        outputFormat: defaultFormat,
        extractAudio: isAudioByDefault,
        audioFormat: isAudioByDefault ? 'mp3' : undefined,
      }));
    } catch (err: any) {
      console.error('Fetch video error:', err);
      const userErr = formatUserFacingError(err);
      setError(userErr);
      toast({ type: 'error', title: userErr.title, message: userErr.explanation });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylist = async (targetUrl: string) => {
    setLoading(true);
    setError(null);
    setVideoInfo(null);
    try {
      const pInfo = await api.fetchPlaylistInfo(targetUrl);
      if (!pInfo.items || pInfo.items.length === 0) {
        throw new Error('No items found in this playlist.');
      }
      setPlaylistInfo(pInfo);
      toast({
        type: 'success',
        title: 'Playlist loaded',
        message: `Found ${pInfo.itemCount} items in "${pInfo.title}"`,
      });
    } catch (err: any) {
      console.error('Fetch playlist error:', err);
      const userErr = formatUserFacingError(err);
      setError(userErr);
      toast({ type: 'error', title: userErr.title, message: userErr.explanation });
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (submitUrl: string) => {
    if (!submitUrl) return;
    setError(null);

    // If it's a mixed link (has both single video & playlist)
    if (isMixedPlaylist(submitUrl)) {
      setPendingUrl(submitUrl);
      setChoiceModalOpen(true);
      return;
    }

    // Pure playlist link
    if (isPurePlaylist(submitUrl)) {
      await fetchPlaylist(submitUrl);
      return;
    }

    // Regular single video
    await fetchSingleVideo(submitUrl);
  };

  const handleDownload = async () => {
    if (!videoInfo) return;
    try {
      const chosenQuality = selectedQuality || 'best';
      const chosenFormat = options.outputFormat || (options.mode === 'audio' ? 'mp3' : 'mp4');
      const downloadTargetUrl = videoInfo.url || options.url;

      const finalOptions: DLOpts = {
        ...options,
        url: downloadTargetUrl,
        formatId: undefined,
        quality: chosenQuality,
        outputFormat: chosenFormat,
        extractAudio: options.mode === 'audio',
        audioFormat: options.mode === 'audio' ? chosenFormat : undefined,
        audioQuality:
          options.mode === 'audio' ? (chosenQuality === '320k' ? '0' : chosenQuality) : undefined,
      };

      await api.startDownload({
        options: finalOptions,
        title: videoInfo.title || 'Untitled Video',
        thumbnail: videoInfo.thumbnail || '',
        url: downloadTargetUrl,
      });

      toast({ type: 'success', title: 'Download started' });

      // Reset form
      setVideoInfo(null);
      setUrl('');

      // Auto-navigate to downloads page to monitor real-time progress
      navigate('/downloads');
    } catch (err: any) {
      console.error('Download start error:', err);
      toast({ type: 'error', title: 'Failed to start download', message: err.message });
    }
  };

  const handleStartBatchDownload = async (
    selectedItems: PlaylistItem[],
    config: {
      mode: 'video' | 'audio';
      format: string;
      quality: string;
      folderName: string;
    }
  ) => {
    try {
      const sanitizedFolder =
        config.folderName.replace(/[\\/:*?"<>|]/g, '_').trim() || 'Playlist';

      for (const item of selectedItems) {
        const itemOptions: DLOpts = {
          ...options,
          url: item.url,
          mode: config.mode,
          outputFormat: config.format,
          quality: config.quality,
          outputDir: sanitizedFolder,
          filenameTemplate: `${String(item.index).padStart(2, '0')} - %(title)s.%(ext)s`,
          extractAudio: config.mode === 'audio',
          audioFormat: config.mode === 'audio' ? config.format : undefined,
          audioQuality:
            config.mode === 'audio' ? (config.quality === '320' ? '0' : config.quality) : undefined,
        };

        await api.startDownload({
          options: itemOptions,
          title: item.title,
          thumbnail: item.thumbnail,
          url: item.url,
        });
      }

      toast({
        type: 'success',
        title: 'Batch download started',
        message: `Queued ${selectedItems.length} items into /${sanitizedFolder}/`,
      });

      setPlaylistInfo(null);
      setUrl('');
      navigate('/downloads');
    } catch (err: any) {
      console.error('Batch download error:', err);
      toast({ type: 'error', title: 'Failed to start batch download', message: err.message });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.18, ease: 'easeOut' }} 
      className="max-w-4xl mx-auto py-8 flex flex-col gap-8 h-full"
    >
      {/* Choice Modal for Mixed URLs */}
      <PlaylistChoiceModal
        isOpen={choiceModalOpen}
        onClose={() => setChoiceModalOpen(false)}
        onSelectSingle={() => {
          const cleanUrl = pendingUrl
            .replace(/([?&])list=[^&]+(&|$)/i, '$1')
            .replace(/[?&]$/, '');
          fetchSingleVideo(cleanUrl);
        }}
        onSelectPlaylist={() => {
          fetchPlaylist(pendingUrl);
        }}
      />

      {/* When Playlist is loaded, show dedicated full playlist review page */}
      {playlistInfo ? (
        <PlaylistView
          playlist={playlistInfo}
          onBack={() => setPlaylistInfo(null)}
          onStartBatchDownload={handleStartBatchDownload}
        />
      ) : (
        <>
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-white">
              Download Media
            </h1>
            <p className="text-white/50 text-sm">
              Paste a URL from YouTube, Playlists, Twitter, or 1000+ supported platforms.
            </p>
          </div>

          <div className="flex-shrink-0">
            <UrlInput
              onFetch={handleUrlSubmit}
              isLoading={loading}
              error={error}
              onClearError={() => setError(null)}
            />
          </div>

          <AnimatePresence mode="wait">
            {videoInfo ? (
              <motion.div
                key="video-preview-pane"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col gap-6 overflow-y-auto pb-8"
              >
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06, duration: 0.3 }}
                >
                  <VideoPreview info={videoInfo} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <FormatSelector
                    formats={formats}
                    mode={options.mode || 'video'}
                    onModeChange={(mode) => {
                      setSelectedQuality('best');
                      setOptions((prev) => ({
                        ...prev,
                        mode,
                        outputFormat: mode === 'audio' ? 'mp3' : 'mp4',
                        extractAudio: mode === 'audio',
                        audioFormat: mode === 'audio' ? 'mp3' : undefined,
                      }));
                    }}
                    selectedFormatId={
                      options.outputFormat || (options.mode === 'audio' ? 'mp3' : 'mp4')
                    }
                    onFormatSelect={(formatId) =>
                      setOptions((prev) => ({ ...prev, outputFormat: formatId }))
                    }
                    selectedQualityId={selectedQuality}
                    onQualitySelect={setSelectedQuality}
                  />
                  <DownloadOptions
                    options={options}
                    onChange={(newOpts) => setOptions((prev) => ({ ...prev, ...newOpts }))}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.3 }}
                  className="flex justify-end mt-4"
                >
                  <Button
                    size="lg"
                    variant="primary"
                    icon={Download}
                    onClick={handleDownload}
                    className="w-full md:w-auto shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                  >
                    Start Download
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="supported-platforms-pane"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex-1 overflow-y-auto"
              >
                <SupportedPlatforms onSelectUrl={(sampleUrl) => handleUrlSubmit(sampleUrl)} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
