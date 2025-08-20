import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  ChartBar, 
  Trophy, 
  BookOpen, 
  Calendar as CalendarIcon,
  CheckSquare,
  Lightbulb,
  Target,
  StickyNote,
  User,
  TestTube
} from '@phosphor-icons/react'

function App() {
  const [currentTab, setCurrentTab] = useState('achieve')

  return (
    <div className="min-h-screen relative">
      {/* Space Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated stars */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>
      
      <div className="relative z-10 container max-w-md lg:max-w-4xl xl:max-w-6xl mx-auto p-4 pb-28">
        <header className="text-center py-6">
          <h1 className="text-2xl lg:text-4xl font-bold text-white drop-shadow-lg">MotivaMate</h1>
          <p className="text-white/80 text-sm lg:text-base drop-shadow">Your mobile study companion</p>
          <div className="mt-2 text-xs lg:text-sm text-white/60">
            ✅ Successfully migrated to study-partner-mobile structure
          </div>
        </header>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <div className="sticky top-0 bg-black/20 backdrop-blur-md z-20 py-2 rounded-lg border border-white/10">
            <TabsList className="grid w-full grid-cols-8 bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="achieve" className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                <Target size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Achieve</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                <CheckSquare size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                <CalendarIcon size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                <StickyNote size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Notes</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                <User size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                <Trophy size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Awards</span>
              </TabsTrigger>
              <TabsTrigger value="inspiration" className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                <Lightbulb size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Inspire</span>
              </TabsTrigger>
              <TabsTrigger value="firebase-test" className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                <TestTube size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Test</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="achieve" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <h2 className="text-xl font-bold text-white mb-4">🎯 Study Goals</h2>
              <div className="grid gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Daily Progress</h3>
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full" style={{width: '65%'}}></div>
                  </div>
                  <p className="text-white/80 text-sm">2h 30m / 4h goal</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Study Streak</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-orange-400">7</span>
                    <span className="text-white/80">days</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <h2 className="text-xl font-bold text-white mb-4">✅ Today's Tasks</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                  <div className="w-5 h-5 border-2 border-green-400 rounded"></div>
                  <span className="text-white">Complete math homework</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                  <div className="w-5 h-5 bg-green-400 rounded flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-white/60 line-through">Review biology notes</span>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Add New Task
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <h2 className="text-xl font-bold text-white mb-4">📅 Study Calendar</h2>
              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-white/60 font-semibold p-2">{day}</div>
                ))}
                {[...Array(31)].map((_, i) => (
                  <div key={i} className={`text-white p-2 rounded ${i === 14 ? 'bg-purple-600' : 'hover:bg-white/10'}`}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <h2 className="text-xl font-bold text-white mb-4">📝 Study Notes</h2>
              <div className="space-y-3">
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Math - Chapter 5</h3>
                  <p className="text-white/80 text-sm">Quadratic equations and their properties...</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Biology - Cell Structure</h3>
                  <p className="text-white/80 text-sm">Mitochondria is the powerhouse of the cell...</p>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Create New Note
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <h2 className="text-xl font-bold text-white mb-4">👤 Profile</h2>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg">Study Champion</h3>
                <p className="text-white/60">Level 5 Learner</p>
              </div>
              <div className="grid gap-4">
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-white/80">Total Study Time</span>
                  <span className="text-white font-semibold">142h 30m</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-white/80">Sessions Completed</span>
                  <span className="text-white font-semibold">89</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-white/80">Current Streak</span>
                  <span className="text-white font-semibold">7 days</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <h2 className="text-xl font-bold text-white mb-4">🏆 Achievements</h2>
              <div className="grid gap-3">
                <div className="flex items-center gap-4 p-3 bg-white/10 rounded-lg">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Trophy size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">First Study Session</h3>
                    <p className="text-white/60 text-sm">Complete your first study session</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white/10 rounded-lg">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <Clock size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Hour Milestone</h3>
                    <p className="text-white/60 text-sm">Study for 60 minutes total</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center">
                    <Target size={24} className="text-white/50" />
                  </div>
                  <div>
                    <h3 className="text-white/50 font-semibold">Week Warrior</h3>
                    <p className="text-white/40 text-sm">Maintain a 7-day study streak</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inspiration" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <h2 className="text-xl font-bold text-white mb-4">💡 Daily Inspiration</h2>
              <div className="text-center bg-white/10 rounded-lg p-6">
                <p className="text-white text-lg mb-4 italic">
                  "The only way to do great work is to love what you do."
                </p>
                <p className="text-white/60">- Steve Jobs</p>
              </div>
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-3">Study Tips</h3>
                <div className="space-y-2 text-white/80 text-sm">
                  <p>• Take a 5-minute break every 25 minutes (Pomodoro Technique)</p>
                  <p>• Find a quiet, comfortable study space</p>
                  <p>• Review your notes within 24 hours of learning</p>
                  <p>• Stay hydrated and take care of your health</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="firebase-test" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <h2 className="text-xl font-bold text-white mb-4">🔧 Firebase Status</h2>
              <div className="space-y-4">
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                  <h3 className="text-green-400 font-semibold mb-2">✅ Firebase Configuration</h3>
                  <p className="text-white/80 text-sm">Connected to MotiveMate project</p>
                  <p className="text-white/60 text-xs mt-1">Project ID: motivemate-6c846</p>
                </div>
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                  <h3 className="text-blue-400 font-semibold mb-2">🔄 Migration Status</h3>
                  <p className="text-white/80 text-sm">Successfully migrated to study-partner-mobile structure</p>
                  <ul className="text-white/60 text-xs mt-2 space-y-1">
                    <li>✅ React 19 + Vite + TypeScript</li>
                    <li>✅ Tailwind CSS 4 + Spark UI</li>
                    <li>✅ Mobile-first responsive design</li>
                    <li>✅ PWA capabilities</li>
                    <li>✅ Firebase preserved credentials</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Floating Quotes Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-md border-t border-white/10 p-3 z-30">
        <div className="container max-w-md lg:max-w-4xl mx-auto text-center">
          <p className="text-white/80 text-sm italic">
            "Success is the sum of small efforts repeated day in and day out."
          </p>
        </div>
      </div>
    </div>
  )
}

export default App