import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const DebugPanel: React.FC = () => {
  const { state, isLoading, saveToFirebase, reloadFromFirebase } = useApp();
  const { currentUser } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-md border border-purple-500/50 rounded-lg p-4 text-white text-xs max-w-sm">
      <h3 className="font-bold mb-2">Debug Panel</h3>
      <div className="space-y-1">
        <div>User: {currentUser?.email || 'Not logged in'}</div>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Tasks: {state.tasks.length}</div>
        <div>Important Dates: {state.importantDates.length}</div>
        <div>Achievements: {state.achievements.length}</div>
        <div>Questions: {state.questions.length}</div>
        <div>Mood Entries: {state.moodEntries.length}</div>
      </div>
      <div className="mt-3 space-y-1">
        <button
          onClick={saveToFirebase}
          className="w-full px-2 py-1 bg-blue-500 hover:bg-blue-600 rounded text-xs"
        >
          Force Save
        </button>
        <button
          onClick={reloadFromFirebase}
          className="w-full px-2 py-1 bg-green-500 hover:bg-green-600 rounded text-xs"
        >
          Force Reload
        </button>
      </div>
    </div>
  );
};

export default DebugPanel; 