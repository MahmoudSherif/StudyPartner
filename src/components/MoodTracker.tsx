import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { 
  Plus, 
  
  Activity
} from 'lucide-react';

const MoodTracker: React.FC = () => {
  const { state, addMoodEntry } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMood, setNewMood] = useState({
    mood: 4 as const,
    notes: '',
    activities: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMoodEntry({
      date: new Date().toISOString().split('T')[0],
      mood: newMood.mood,
      notes: newMood.notes.trim(),
      activities: newMood.activities.split(',').map(activity => activity.trim()).filter(activity => activity)
    });
    setNewMood({ mood: 4, notes: '', activities: '' });
    setShowAddForm(false);
  };

  const getMoodEmoji = (mood: number) => {
    switch (mood) {
      case 1: return '😢';
      case 2: return '😕';
      case 3: return '😐';
      case 4: return '🙂';
      case 5: return '😄';
      default: return '🙂';
    }
  };

  const getMoodText = (mood: number) => {
    switch (mood) {
      case 1: return 'Very Bad';
      case 2: return 'Bad';
      case 3: return 'Okay';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return 'Good';
    }
  };

  const getMoodColor = (mood: number) => {
    switch (mood) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-green-100 text-green-800';
      case 5: return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const recentMoods = state.moodEntries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  const averageMood = state.moodEntries.length > 0 
    ? state.moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / state.moodEntries.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Mood Tracker</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn"
        >
          <Plus size={18} />
          Track Today's Mood
        </button>
      </div>

      {/* Mood Stats */}
      <div className="grid grid-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl mb-2">
            {getMoodEmoji(Math.round(averageMood))}
          </div>
          <div className="text-lg font-semibold text-gray-800 mb-1">
            {averageMood > 0 ? averageMood.toFixed(1) : 'N/A'}
          </div>
          <p className="text-sm text-gray-600">Average Mood</p>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {state.moodEntries.length}
          </div>
          <p className="text-sm text-gray-600">Days Tracked</p>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {state.moodEntries.filter(entry => entry.mood >= 4).length}
          </div>
          <p className="text-sm text-gray-600">Good Days</p>
        </div>
      </div>

      {/* Add Mood Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Track Today's Mood</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How are you feeling today?
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setNewMood({ ...newMood, mood: mood as any })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      newMood.mood === mood
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{getMoodEmoji(mood)}</div>
                    <div className="text-xs font-medium">{getMoodText(mood)}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activities Today (comma-separated)
              </label>
              <input
                type="text"
                value={newMood.activities}
                onChange={(e) => setNewMood({ ...newMood, activities: e.target.value })}
                placeholder="e.g., studying, exercise, socializing, reading"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={newMood.notes}
                onChange={(e) => setNewMood({ ...newMood, notes: e.target.value })}
                placeholder="How was your day? Any specific thoughts or feelings?"
                className="textarea"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn">
                Save Mood Entry
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Mood Entries */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Mood Entries</h2>
        {recentMoods.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No mood entries yet. Start tracking your mood to see patterns!
          </p>
        ) : (
          <div className="space-y-4">
            {recentMoods.map((entry) => (
              <div key={entry.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${getMoodColor(entry.mood)}`}>
                    <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{getMoodText(entry.mood)}</h3>
                      <span className="text-sm text-gray-500">
                        {format(new Date(entry.date), 'MMM do, yyyy')}
                      </span>
                    </div>
                    
                    {entry.activities.length > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <Activity size={14} className="text-gray-400" />
                        <div className="flex gap-1">
                          {entry.activities.map((activity, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {activity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {entry.notes && (
                      <p className="text-sm text-gray-600">{entry.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mood Insights */}
      {state.moodEntries.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Mood Insights</h2>
          <div className="grid grid-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Mood Distribution</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((mood) => {
                  const count = state.moodEntries.filter(entry => entry.mood === mood).length;
                  const percentage = (count / state.moodEntries.length) * 100;
                  return (
                    <div key={mood} className="flex items-center gap-2">
                      <span className="text-sm">{getMoodEmoji(mood)}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Most Common Activities</h3>
              <div className="space-y-2">
                {(() => {
                  const activityCounts: { [key: string]: number } = {};
                  state.moodEntries.forEach(entry => {
                    entry.activities.forEach(activity => {
                      activityCounts[activity] = (activityCounts[activity] || 0) + 1;
                    });
                  });
                  
                  const sortedActivities = Object.entries(activityCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5);
                  
                  return sortedActivities.map(([activity, count]) => (
                    <div key={activity} className="flex justify-between items-center">
                      <span className="text-sm">{activity}</span>
                      <span className="text-sm text-gray-600">{count} times</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodTracker; 