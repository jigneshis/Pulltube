import React from 'react';
import { Modal } from './Modal';
import { Sparkles, Video, ShieldCheck, RefreshCw, Layers, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface WhatsNewModalProps {
  isOpen: boolean;
  version: string;
  onClose: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
  isOpen,
  version,
  onClose,
}) => {
  const highlights = [
    {
      icon: Video,
      color: 'text-violet-400 bg-violet-500/20 border-violet-500/30',
      title: 'True 4K & 8K Ultra-HD Downloads',
      description: 'Format engine overhauled to pull genuine 4K and 8K HDR 60fps streams with uncompromised bitrate and audio fidelity.',
    },
    {
      icon: ShieldCheck,
      color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
      title: 'Smart Duplicate Collision Detection',
      description: 'Never accidentally overwrite a file again. PullTube prompts you before download so you can Overwrite, Auto-Rename, or Cancel.',
    },
    {
      icon: RefreshCw,
      color: 'text-sky-400 bg-sky-500/20 border-sky-500/30',
      title: 'Background Auto-Updater Worker',
      description: 'Seamlessly checks GitHub Releases for new updates and links directly with our standalone native updater.',
    },
    {
      icon: Layers,
      color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
      title: 'Cleaner, Distraction-Free UI',
      description: 'Streamlined home page layout, eliminated unnecessary sample banners, and polished typography and animations.',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome to PullTube">
      <div className="flex flex-col gap-5 py-1">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                What's New in PullTube
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold">
                  v{version}
                </span>
              </h3>
              <p className="text-xs text-white/50">
                Freshly updated with speed, stability, and format enhancements.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all flex items-start gap-3.5"
              >
                <div className={`p-2 rounded-lg border flex-shrink-0 mt-0.5 ${h.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white tracking-wide">
                    {h.title}
                  </div>
                  <div className="text-xs text-white/60 mt-1 leading-relaxed">
                    {h.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-white/10">
          <Button
            variant="primary"
            size="md"
            icon={ArrowRight}
            onClick={onClose}
            className="w-full sm:w-auto shadow-lg shadow-violet-500/25"
          >
            Awesome, Let's Go!
          </Button>
        </div>
      </div>
    </Modal>
  );
};
