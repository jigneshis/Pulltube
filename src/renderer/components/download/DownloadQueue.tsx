import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, List } from 'lucide-react';
import { DownloadItem } from './DownloadItem';
import { Button } from '../ui/Button';
import { DownloadTask } from '../../../shared/types'; // Assuming this exists

interface DownloadQueueProps {
  tasks: DownloadTask[];
  onPauseResume?: (id: string) => void;
  onCancel?: (id: string) => void;
  onOpenFile?: (id: string) => void;
  onOpenFolder?: (id: string) => void;
  onClearCompleted?: () => void;
}

export const DownloadQueue: React.FC<DownloadQueueProps> = ({
  tasks,
  onPauseResume,
  onCancel,
  onOpenFile,
  onOpenFolder,
  onClearCompleted
}) => {
  const hasCompleted = tasks.some(t => t.status === 'done' || t.status === 'error' || t.status === 'cancelled');

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Download Queue</h2>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/70 ml-2">
            {tasks.length}
          </span>
        </div>
        
        {hasCompleted && (
          <Button variant="ghost" size="sm" onClick={onClearCompleted} leftIcon={<Trash2 className="w-4 h-4" />}>
            Clear Finished
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/40 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm border-dashed">
          <List className="w-12 h-12 mb-4 opacity-20" />
          <p>No downloads in queue</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-4">
          <AnimatePresence initial={false}>
            {tasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                layout
              >
                <DownloadItem
                  task={task}
                  onPauseResume={onPauseResume}
                  onCancel={onCancel}
                  onOpenFile={onOpenFile}
                  onOpenFolder={onOpenFolder}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
