import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/ipc';
import { DownloadHistory } from '../../shared/types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, FolderOpen, Play, Trash2, Clock } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState<DownloadHistory[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const data = await api.getHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id: string) => {
    await api.deleteHistoryItem(id);
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all history?')) {
      await api.clearHistory();
      setHistory([]);
    }
  };

  const filteredHistory = history.filter(h => 
    h.title.toLowerCase().includes(search.toLowerCase())
  );

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
            History
          </h1>
          <p className="text-white/50 text-sm mt-1">{history.length} completed items</p>
        </div>
        
        {history.length > 0 && (
          <Button variant="danger" icon={Trash2} onClick={handleClearAll}>
            Clear All
          </Button>
        )}
      </div>

      <div className="mb-6">
        <Input 
          placeholder="Search history..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={18} />}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {loading ? (
          <div className="text-center text-white/50 py-10">Loading...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4">
            <Clock size={48} className="text-white/20" />
            <p className="text-lg">No download history yet</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <Card key={item.id} className="flex gap-4 p-4 hover:bg-white/5 transition-colors">
              <div className="w-32 h-20 bg-black/40 rounded-lg overflow-hidden shrink-0">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">No Thumb</div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-white truncate" title={item.title}>{item.title}</h3>
                  <p className="text-xs text-white/50 mt-1">
                    {new Date(item.downloadedAt).toLocaleString()} • {item.format}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    icon={Play} 
                    onClick={() => api.openFile(item.outputPath)}
                    title="Open file"
                  >
                    Open
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    icon={FolderOpen} 
                    onClick={() => api.openFolder(item.outputPath)}
                    title="Show in Folder"
                  >
                    Folder
                  </Button>
                </div>
              </div>
              <div className="shrink-0 flex items-start">
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );
}
