import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clipboard, ArrowRight, Loader2, Link2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ErrorAlert } from '../ui/ErrorAlert';
import { ParsedUserError } from '../../lib/error-formatter';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

interface UrlInputProps {
  onFetch: (url: string) => void;
  isLoading: boolean;
  error?: string | ParsedUserError | null;
  onClearError?: () => void;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  onFetch,
  isLoading,
  error,
  onClearError,
}) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (url.trim()) {
      onFetch(url.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      onClearError?.();
      if (text.trim()) {
        onFetch(text.trim());
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (error) {
      onClearError?.();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="relative flex items-center group">
        {/* Animated Breathing Aura when analyzing */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 blur-md pointer-events-none"
          />
        )}
        <div className="absolute left-4 text-white/40 group-focus-within:text-violet-400 transition-colors z-10">
          <Link2 className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={url}
          onChange={handleChange}
          placeholder="Paste YouTube or any supported URL here..."
          className={cn(
            "relative z-10 w-full bg-[#161524]/80 backdrop-blur-2xl border border-white/10 rounded-2xl text-white placeholder-white/40 pl-12 pr-28 py-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-lg shadow-[0_8px_30px_rgba(0,0,0,0.5)]",
            isLoading && "border-violet-500/50",
            error && "border-red-500/40 focus:ring-red-500/30"
          )}
          disabled={isLoading}
        />
        <div className="absolute right-2 flex items-center gap-1">
          {!url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePaste}
              className="px-2"
              title="Paste from clipboard"
            >
              <Clipboard className="w-5 h-5 text-white/40 hover:text-white" />
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!url.trim() || isLoading}
            className="rounded-xl h-10 px-4"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
          </Button>
        </div>
      </form>

      {/* Modern Friendly Error Alert Card */}
      {error && (
        <ErrorAlert
          error={error}
          onRetry={() => {
            if (url.trim()) {
              onFetch(url.trim());
            }
          }}
          onDismiss={onClearError}
          isRetrying={isLoading}
        />
      )}
    </div>
  );
};
