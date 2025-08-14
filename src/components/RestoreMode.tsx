import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { 
  History, 
  RotateCcw, 
  Download, 
  Upload, 
  Save,
  AlertTriangle,
  Check,
  Clock
} from 'lucide-react';

interface StateSnapshot {
  id: string;
  timestamp: string;
  description: string;
  data: any;
  changes: string[];
}

const RestoreMode: React.FC = () => {
  const { state, setState } = useApp();
  const [snapshots, setSnapshots] = useState<StateSnapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);
  const [showConfirmRestore, setShowConfirmRestore] = useState<string | null>(null);

  // Load snapshots from localStorage on component mount
  useEffect(() => {
    const savedSnapshots = localStorage.getItem('studypartner-snapshots');
    if (savedSnapshots) {
      try {
        setSnapshots(JSON.parse(savedSnapshots));
      } catch (error) {
        console.error('Failed to load snapshots:', error);
      }
    }
  }, []);

  // Save snapshots to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('studypartner-snapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  const createSnapshot = (description: string) => {
    const snapshot: StateSnapshot = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      description: description || 'Manual snapshot',
      data: JSON.parse(JSON.stringify(state)), // Deep clone
      changes: getRecentChanges()
    };

    setSnapshots(prev => [snapshot, ...prev].slice(0, 10)); // Keep only last 10 snapshots
  };

  const getRecentChanges = (): string[] => {
    const changes: string[] = [];
    
    if (state.tasks.length > 0) {
      changes.push(`${state.tasks.length} tasks`);
    }
    if (state.achievements.length > 0) {
      changes.push(`${state.achievements.length} achievements`);
    }
    if (state.questions.length > 0) {
      changes.push(`${state.questions.length} study questions`);
    }
    if (state.moodEntries.length > 0) {
      changes.push(`${state.moodEntries.length} mood entries`);
    }
    if (state.importantDates.length > 0) {
      changes.push(`${state.importantDates.length} important dates`);
    }
    
    return changes.length > 0 ? changes : ['No data'];
  };

  const restoreSnapshot = (snapshotId: string) => {
    const snapshot = snapshots.find(s => s.id === snapshotId);
    if (snapshot) {
      setState(snapshot.data);
      setShowConfirmRestore(null);
      alert('State restored successfully!');
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studypartner-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          setState(importedData);
          createSnapshot(`Imported from ${file.name}`);
          alert('Data imported successfully!');
        } catch (error) {
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Restore Mode</h1>
          <p className="text-slate-300">
            View your app history and restore previous states or create backups.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              const description = prompt('Enter a description for this snapshot:');
              if (description !== null) {
                createSnapshot(description || 'Manual snapshot');
              }
            }}
            className="btn"
          >
            <Save size={18} />
            Create Snapshot
          </button>
          <button
            onClick={exportData}
            className="btn btn-secondary"
          >
            <Download size={18} />
            Export Data
          </button>
          <label className="btn btn-secondary cursor-pointer">
            <Upload size={18} />
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Current State Info */}
      <div className="card bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Current State
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{state.tasks.length}</div>
            <div className="text-sm text-slate-400">Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{state.achievements.length}</div>
            <div className="text-sm text-slate-400">Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{state.questions.length}</div>
            <div className="text-sm text-slate-400">Study Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{state.moodEntries.length}</div>
            <div className="text-sm text-slate-400">Mood Entries</div>
          </div>
        </div>
      </div>

      {/* Snapshots History */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          History Snapshots
        </h2>

        {snapshots.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No snapshots yet</p>
            <p className="text-slate-500 text-sm">
              Create snapshots to save your progress and restore later if needed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  selectedSnapshot === snapshot.id
                    ? 'border-blue-500/50 bg-blue-900/20'
                    : 'border-white/10 bg-slate-800/40 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{snapshot.description}</h3>
                    <p className="text-sm text-slate-400 mb-2">
                      {format(new Date(snapshot.timestamp), 'MMM do, yyyy - h:mm a')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {snapshot.changes.map((change, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-slate-700/60 text-slate-300 text-xs rounded-full"
                        >
                          {change}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowConfirmRestore(snapshot.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <RotateCcw size={14} />
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmRestore && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              </div>
              
              <h3 className="text-xl font-semibold text-white">Confirm Restore</h3>
              
              <p className="text-slate-300">
                Are you sure you want to restore to this snapshot? This will replace your current data.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => restoreSnapshot(showConfirmRestore)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Check size={16} />
                  Yes, Restore
                </button>
                <button
                  onClick={() => setShowConfirmRestore(null)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestoreMode;