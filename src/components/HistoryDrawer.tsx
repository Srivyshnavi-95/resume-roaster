import React from 'react';
import { X, Trash2, Clock, Flame, ArrowUpRight, FileText } from 'lucide-react';
import { ResumeHistoryItem } from '../types/roaster';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ResumeHistoryItem[];
  onSelectHistoryItem: (item: ResumeHistoryItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string, e: React.MouseEvent) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
  onDeleteItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative flex flex-col w-full max-w-md h-full bg-neutral-900 border-l border-neutral-800 shadow-2xl p-6">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-bold text-white">Roast History</h3>
            <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded font-mono">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-neutral-400 hover:text-rose-400 transition-colors"
                title="Clear all saved roasts"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 text-neutral-500 space-y-3">
              <Clock className="h-8 w-8 text-neutral-600" />
              <p className="text-sm">No roasts recorded yet.</p>
              <p className="text-xs text-neutral-600 max-w-xs">
                Your analyzed resumes will be stored locally in your browser for quick review.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectHistoryItem(item);
                    onClose();
                  }}
                  className="group relative rounded-2xl border border-neutral-800 bg-neutral-950 p-4 hover:border-orange-500/50 hover:bg-neutral-850/50 transition-all cursor-pointer shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                          {item.fileName || 'Pasted Resume'}
                        </span>
                        {item.targetRole && (
                          <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                            {item.targetRole}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>{dateStr}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-orange-400">
                          {item.overallScore}/100
                        </div>
                      </div>
                      <button
                        onClick={(e) => onDeleteItem(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-500 hover:text-rose-400 rounded-md transition-all"
                        title="Delete from history"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400 font-medium">{item.verdict}</span>
                    <span className="text-orange-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>View analysis</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
