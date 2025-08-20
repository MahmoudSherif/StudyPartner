import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { User, Calendar, CheckSquare, Target, StickyNote, Trophy, Lightbulb } from 'lucide-react'

interface MobileAppProps {
  user: {
    uid: string
    email: string | null
    displayName: string | null
  }
  onSignOut: () => Promise<void>
}

export const MobileApp: React.FC<MobileAppProps> = ({ user, onSignOut }) => {
  const [currentTab, setCurrentTab] = React.useState('dashboard')

  return (
    <div className="min-h-screen relative">
      {/* Space Background */}
      <div className="space-background fixed inset-0 z-0" />
      
      <div className="relative z-10 container max-w-md lg:max-w-4xl xl:max-w-6xl mx-auto p-4 pb-28 no-select">
        <header className="text-center py-6">
          <h1 className="text-2xl lg:text-4xl font-bold text-white drop-shadow-lg">StudyPartner</h1>
          <p className="text-white/80 text-sm lg:text-base drop-shadow">Your mobile study companion</p>
          {user && (
            <div className="mt-2 text-xs lg:text-sm text-white/60">
              Connected as {user.displayName || user.email?.split('@')[0]}
            </div>
          )}
        </header>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <div className="sticky top-0 bg-black/20 backdrop-blur-md z-20 py-2 rounded-lg border border-white/10">
            <TabsList className="grid w-full grid-cols-7 bg-white/10 backdrop-blur-sm">
              <TabsTrigger 
                value="dashboard" 
                className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200"
              >
                <Target size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200"
              >
                <CheckSquare size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Tasks</span>
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200"
              >
                <Calendar size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Calendar</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notes" 
                className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200"
              >
                <StickyNote size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Notes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200"
              >
                <User size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Profile</span>
              </TabsTrigger>
              <TabsTrigger 
                value="achievements" 
                className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200"
              >
                <Trophy size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Awards</span>
              </TabsTrigger>
              <TabsTrigger 
                value="inspiration" 
                className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200"
              >
                <Lightbulb size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Inspire</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Dashboard</h2>
              <p className="text-white/80">Welcome to your study companion!</p>
              <p className="text-white/60 text-sm mt-2">
                This is the mobile-optimized interface integrated with your Firebase authentication.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Tasks</h2>
              <p className="text-white/80">Manage your tasks and stay productive.</p>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Calendar</h2>
              <p className="text-white/80">Keep track of important dates and deadlines.</p>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
              <p className="text-white/80">Store your thoughts and study notes.</p>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-white/80">Email: {user.email}</p>
                  <p className="text-white/80">Name: {user.displayName || 'Not set'}</p>
                  <p className="text-white/80">ID: {user.uid}</p>
                </div>
                <Button onClick={onSignOut} variant="destructive">
                  Sign Out
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Achievements</h2>
              <p className="text-white/80">Track your progress and earn rewards.</p>
            </div>
          </TabsContent>

          <TabsContent value="inspiration" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Inspiration</h2>
              <p className="text-white/80">Get motivated with quotes and tips.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}