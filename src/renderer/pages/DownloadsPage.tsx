import React from 'react';
import { useDownloadStore } from '../stores/useDownloadStore';
import { DownloadItem } from '../components/download/DownloadItem';
import { Button } from '../components/ui/Button';
import { Trash2, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

import { api } from '../lib/ipc';

export default function DownloadsPage() {
  const { activeTasks, clearCompleted, cancelTask, pauseTask, resumeTask, fetchActiveTasks, removeTask } = useDownloadStore();

  React.useEffect(() => {
    fetchActiveTasks();
  }, [fetchActiveTasks]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.18, ease: 'easeOut' }} 
      className="py-8 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-white">
            Active Downloads
          </h1>
          <p className="text-white/50 text-sm mt-1">Manage your current and pending transfers</p>
        </div>
        
        {activeTasks.some(t => t.status === 'done' || t.status === 'error' || t.status === 'cancelled') && (
          <Button variant="ghost" icon={Trash2} onClick={clearCompleted}>
            Clear Completed
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
              <Inbox size={48} className="text-white/20" />
            </div>
            <p className="text-lg">No active downloads</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <DownloadItem
                  task={task}
                  onCancel={() => {
                    if (task.status === 'done' || task.status === 'cancelled') {
                      removeTask(task.id);
                    } else {
                      cancelTask(task.id);
                    }
                  }}
                  onPauseResume={() => {
                    if (task.status === 'paused') resumeTask(task.id);
                    else pauseTask(task.id);
                  }}
                  onOpenFile={() => task.outputPath && api.openFile(task.outputPath)}
                  onOpenFolder={() => task.outputPath && api.openFolder(task.outputPath)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
