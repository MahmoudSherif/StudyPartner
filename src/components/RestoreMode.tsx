import React, { useState } from 'react';
import { Download, Upload, RotateCcw, AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const RestoreMode: React.FC = () => {
  const { state, dispatch } = useApp();
  const { currentUser } = useAuth();
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importData, setImportData] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const exportData = () => {
    try {
      // Create a comprehensive backup of user data
      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        user: currentUser?.email || 'anonymous',
        data: {
          tasks: state.tasks,
          achievements: state.achievements,
          streak: state.streak,
          importantDates: state.importantDates,
          questions: state.questions,
          moodEntries: state.moodEntries,
          dailyProgress: state.dailyProgress,
          userStats: state.userStats,
          settings: state.settings,
          coins: state.coins
        }
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `studypartner-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Data exported successfully! Check your downloads folder.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    }
  };

  const importDataFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  const validateAndImportData = () => {
    try {
      const backupData = JSON.parse(importData);
      
      // Validate backup structure
      if (!backupData.version || !backupData.data) {
        throw new Error('Invalid backup file format');
      }

      setIsLoading(true);
      
      // Import data with validation
      setTimeout(() => {
        try {
          if (backupData.data.tasks) {
            dispatch({ type: 'SET_TASKS', payload: backupData.data.tasks });
          }
          if (backupData.data.achievements) {
            dispatch({ type: 'SET_ACHIEVEMENTS', payload: backupData.data.achievements });
          }
          if (backupData.data.streak) {
            dispatch({ type: 'SET_STREAK', payload: backupData.data.streak });
          }
          if (backupData.data.importantDates) {
            dispatch({ type: 'SET_IMPORTANTDATES', payload: backupData.data.importantDates });
          }
          if (backupData.data.questions) {
            dispatch({ type: 'SET_QUESTIONS', payload: backupData.data.questions });
          }
          if (backupData.data.moodEntries) {
            dispatch({ type: 'SET_MOODENTRIES', payload: backupData.data.moodEntries });
          }
          if (backupData.data.dailyProgress) {
            dispatch({ type: 'SET_DAILYPROGRESS', payload: backupData.data.dailyProgress });
          }
          if (backupData.data.userStats) {
            dispatch({ type: 'UPDATE_USER_STATS', payload: backupData.data.userStats });
          }
          if (backupData.data.settings) {
            dispatch({ type: 'UPDATE_SETTINGS', payload: backupData.data.settings });
          }

          setMessage({ 
            type: 'success', 
            text: `Data restored successfully from backup created on ${new Date(backupData.timestamp).toLocaleString()}` 
          });
          setImportData('');
          setShowConfirmRestore(false);
        } catch (error) {
          setMessage({ type: 'error', text: 'Failed to restore data. The backup file may be corrupted.' });
        } finally {
          setIsLoading(false);
        }
      }, 1000);
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Invalid JSON format. Please check your backup file.' });
      setIsLoading(false);
    }
  };

  const resetAllData = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      dispatch({ type: 'RESET_STATE' });
      setMessage({ type: 'info', text: 'All data has been reset to default values.' });
      setShowConfirmReset(false);
      setIsLoading(false);
    }, 1000);
  };

  const clearMessage = () => setMessage(null);

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            🔄 Restore Mode
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Backup, restore, or reset your StudyPartner data. Keep your progress safe and secure.
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
            message.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
            'bg-blue-500/20 border-blue-500/30 text-blue-400'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
             message.type === 'error' ? <AlertTriangle className="w-5 h-5" /> :
             <Info className="w-5 h-5" />}
            <span>{message.text}</span>
            <button onClick={clearMessage} className="ml-auto text-gray-400 hover:text-white">
              ×
            </button>
          </div>
        )}

        {/* Data Overview */}
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">📊 Your Current Data</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{state.tasks.length}</div>
              <div className="text-sm text-gray-400">Tasks</div>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{state.achievements.length}</div>
              <div className="text-sm text-gray-400">Achievements</div>
            </div>
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{state.streak.current}</div>
              <div className="text-sm text-gray-400">Current Streak</div>
            </div>
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">{state.questions.length}</div>
              <div className="text-sm text-gray-400">Knowledge Items</div>
            </div>
            <div className="bg-pink-500/20 border border-pink-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-pink-400">{state.moodEntries.length}</div>
              <div className="text-sm text-gray-400">Mood Entries</div>
            </div>
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">{state.userStats.level.level}</div>
              <div className="text-sm text-gray-400">Level</div>
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Export Data */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-semibold">Export Data</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Download a complete backup of your StudyPartner data. This includes all your tasks, achievements, progress, and settings.
            </p>
            <button
              onClick={exportData}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Backup
            </button>
          </div>

          {/* Import Data */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-semibold">Import Data</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Restore your data from a previously exported backup file. This will replace your current data.
            </p>
            
            <div className="space-y-4">
              <input
                type="file"
                accept=".json"
                onChange={importDataFromFile}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
              
              {importData && (
                <button
                  onClick={() => setShowConfirmRestore(true)}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  Restore Data
                </button>
              )}
            </div>
          </div>

          {/* Reset Data */}
          <div className="card p-6 md:col-span-2 border-red-500/30">
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-semibold">Reset All Data</h3>
              <div className="bg-red-500/20 border border-red-500/30 rounded-full px-2 py-1 text-xs text-red-400">
                DANGER ZONE
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              This will permanently delete all your data and reset the app to its initial state. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowConfirmReset(true)}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
              Reset Everything
            </button>
          </div>
        </div>

        {/* Restore Confirmation Modal */}
        {showConfirmRestore && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="card p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                Confirm Data Restore
              </h2>
              <p className="text-gray-400 mb-6">
                This will replace all your current data with the backup data. Your current progress will be lost.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={validateAndImportData}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Restoring...' : 'Restore Data'}
                </button>
                <button
                  onClick={() => setShowConfirmRestore(false)}
                  disabled={isLoading}
                  className="flex-1 border border-white/20 hover:bg-white/10 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Confirmation Modal */}
        {showConfirmReset && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="card p-6 w-full max-w-md border-red-500/30">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                Confirm Reset
              </h2>
              <p className="text-gray-400 mb-6">
                Are you absolutely sure you want to delete all your data? This action is permanent and cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={resetAllData}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Resetting...' : 'Reset Everything'}
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  disabled={isLoading}
                  className="flex-1 border border-white/20 hover:bg-white/10 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestoreMode;