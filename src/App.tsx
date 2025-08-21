import { useState } from 'react'

function App() {
  const [currentTab, setCurrentTab] = useState('timer')

  const tabs = [
    { id: 'timer', label: 'Timer', icon: '⏱️' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`
        }} />
      </div>

      <div className="relative z-10 container max-w-md mx-auto p-4 pb-28">
        {/* Header */}
        <header className="text-center py-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
            MotivaMate
          </h1>
          <p className="text-white/80 text-sm drop-shadow">
            Your Mobile Study Companion
          </p>
        </header>

        {/* Main Content */}
        <div className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-6">
          {currentTab === 'timer' && <TimerTab />}
          {currentTab === 'tasks' && <TasksTab />}
          {currentTab === 'stats' && <StatsTab />}
          {currentTab === 'profile' && <ProfileTab />}
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/20 p-2">
            <div className="grid grid-cols-4 gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-200 ${
                    currentTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  <span className="text-xl mb-1">{tab.icon}</span>
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}

function TimerTab() {
  const [minutes, setMinutes] = useState(25)
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60)

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold text-white mb-6">Focus Timer</h2>
      
      <div className="mb-8">
        <div className="text-6xl font-mono text-white mb-4">
          {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
          {(timeLeft % 60).toString().padStart(2, '0')}
        </div>
        <div className="w-32 h-32 mx-auto border-4 border-white/20 rounded-full flex items-center justify-center">
          <div className="text-white/60 text-sm">
            {isRunning ? 'Running' : 'Ready'}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Reset
          </button>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setMinutes(Math.max(1, minutes - 5))}
            className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-lg"
          >
            -
          </button>
          <span className="text-white font-medium">{minutes} min</span>
          <button
            onClick={() => setMinutes(minutes + 5)}
            className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-lg"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

function TasksTab() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Read Chapter 5', completed: false },
    { id: 2, title: 'Complete Math Homework', completed: true },
    { id: 3, title: 'Review Notes', completed: false }
  ])

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6 text-center">Today's Tasks</h2>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg"
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                task.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-white/40 hover:border-white/60'
              }`}
            >
              {task.completed && <span className="text-white text-sm">✓</span>}
            </button>
            <span
              className={`flex-1 ${
                task.completed
                  ? 'text-white/60 line-through'
                  : 'text-white'
              }`}
            >
              {task.title}
            </span>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-medium transition-colors">
        Add New Task
      </button>
    </div>
  )
}

function StatsTab() {
  const stats = {
    totalStudyTime: 240,
    sessionsToday: 3,
    currentStreak: 7,
    completedTasks: 12
  }

  const statCards = [
    { label: 'Study Time', value: `${stats.totalStudyTime}m`, icon: '⏱️' },
    { label: 'Sessions Today', value: stats.sessionsToday, icon: '🎯' },
    { label: 'Day Streak', value: stats.currentStreak, icon: '🔥' },
    { label: 'Tasks Done', value: stats.completedTasks, icon: '✅' }
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6 text-center">Your Progress</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-white/60 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white/10 rounded-lg p-4">
        <h3 className="text-white font-medium mb-3">Weekly Progress</h3>
        <div className="flex justify-between items-end h-20">
          {[20, 45, 30, 60, 25, 40, 35].map((height, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className="bg-blue-500 rounded-t w-6"
                style={{ height: `${height}%` }}
              />
              <span className="text-white/60 text-xs mt-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProfileTab() {
  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold text-white mb-6">Profile</h2>
      
      <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
        <span className="text-white text-2xl font-bold">U</span>
      </div>
      
      <h3 className="text-white font-semibold text-lg mb-2">Study Buddy</h3>
      <p className="text-white/60 text-sm mb-6">Level 5 Scholar</p>
      
      <div className="space-y-4">
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-white">Achievements</span>
            <span className="text-white/60">12/25</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '48%' }} />
          </div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-white">Study Goal</span>
            <span className="text-white/60">180/300 min</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }} />
          </div>
        </div>
      </div>

      <button className="w-full mt-6 bg-red-600/80 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors">
        Sign Out
      </button>
    </div>
  )
}

export default App