import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  WifiOff,
  Lock,
  Clock,
  HelpCircle,
  RefreshCw,
  X,
  ChevronDown,
  Copy,
  Check,
  Globe,
} from 'lucide-react';
import { ParsedUserError, formatUserFacingError } from '../../lib/error-formatter';

interface ErrorAlertProps {
  error: string | Error | ParsedUserError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onRetry,
  onDismiss,
  isRetrying = false,
  className = '',
}) => {
  const [showTechnical, setShowTechnical] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!error) return null;

  const parsed: ParsedUserError =
    typeof error === 'object' && 'title' in error && 'explanation' in error
      ? (error as ParsedUserError)
      : formatUserFacingError(error);

  const getIcon = () => {
    switch (parsed.category) {
      case 'network':
        return <WifiOff className="w-5 h-5 text-red-400" />;
      case 'restricted':
        return <Lock className="w-5 h-5 text-amber-400" />;
      case 'ratelimit':
        return <Clock className="w-5 h-5 text-amber-400" />;
      case 'invalid':
        return <Globe className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const handleCopyDetails = async () => {
    if (parsed.rawDetails) {
      await navigator.clipboard.writeText(parsed.rawDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`w-full bg-red-500/[0.08] border border-red-500/25 rounded-2xl p-4.5 backdrop-blur-xl shadow-lg shadow-red-950/20 text-white ${className}`}
    >
      {/* Top Banner: Icon, Title, and Dismiss */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white/95 text-base leading-tight mb-1">
              {parsed.title}
            </h4>
            <p className="text-white/70 text-sm leading-relaxed">
              {parsed.explanation}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-colors shrink-0"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Smart Contextual Hint */}
      {parsed.hint && (
        <div className="mt-3.5 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-white/60">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="leading-snug">{parsed.hint}</span>
        </div>
      )}

      {/* Action Bar & Technical Toggle */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white text-xs font-semibold border border-red-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>
          )}

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium border border-white/5 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          )}
        </div>

        {/* Technical Details Accordion Button for Power Users */}
        {parsed.rawDetails && (
          <button
            type="button"
            onClick={() => setShowTechnical(!showTechnical)}
            className="inline-flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors py-1 cursor-pointer"
          >
            <span>{showTechnical ? 'Hide details' : 'Technical details'}</span>
            <motion.div animate={{ rotate: showTechnical ? 180 : 0 }}>
              <ChevronDown className="w-3 h-3" />
            </motion.div>
          </button>
        )}
      </div>

      {/* Technical Details Drawer */}
      <AnimatePresence>
        {showTechnical && parsed.rawDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-3 rounded-xl bg-black/50 border border-white/5 font-mono text-[11px] text-white/50 leading-relaxed break-all relative group">
              <button
                type="button"
                onClick={handleCopyDetails}
                className="absolute top-2 right-2 p-1 rounded-md bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                title="Copy technical log"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
              <div className="pr-7 max-h-36 overflow-y-auto whitespace-pre-wrap">
                {parsed.rawDetails}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
