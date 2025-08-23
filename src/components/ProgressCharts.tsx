import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts'
import { StudySession, Subject } from '@/lib/types'
import { getWeeklyData, getMonthlyData, getDailyData, getSubjectWeeklyData, getSubjectMonthlyData, getSubjectComparison } from '@/lib/chartUtils'
import { Calendar, ArrowUp, Clock, BookOpen } from '@phosphor-icons/react'
import { useState, useMemo, useEffect } from 'react'

interface ProgressChartsProps {
  sessions: StudySession[]
  subjects: Subject[]
}

// Error boundary wrapper for subject charts
function SubjectChartsWrapper({ children, currentSubject }: { children: React.ReactNode, currentSubject: Subject | null }) {
  if (!currentSubject) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <BookOpen size={48} className="text-white/50 mb-4" />
          <h3 className="font-medium mb-2 text-white">Subject Not Found</h3>
          <p className="text-sm text-white/70 text-center">
            Please select a valid subject to view charts
          </p>
        </CardContent>
      </Card>
    )
  }
  
  try {
    return <>{children}</>
  } catch (error) {
    // Error handling for production
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <BookOpen size={48} className="text-white/50 mb-4" />
          <h3 className="font-medium mb-2 text-white">Error Loading Charts</h3>
          <p className="text-sm text-white/70 text-center">
            There was an issue loading the charts for this subject
          </p>
        </CardContent>
      </Card>
    )
  }
}

export function ProgressCharts({ sessions, subjects }: ProgressChartsProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  
  // Reset selected subject if subjects array structure changes
  useEffect(() => {
    if (!subjects || !Array.isArray(subjects)) {
      setSelectedSubject('')
      return
    }
    
    // If we have subjects but no valid selection, pick the first one
    if (subjects.length > 0 && (!selectedSubject || !subjects.find(s => s?.id === selectedSubject))) {
      const firstValidSubject = subjects.find(s => s && s.id && s.name)
      if (firstValidSubject) {
        setSelectedSubject(firstValidSubject.id)
      }
    }
    
    // If no subjects, clear selection
    if (subjects.length === 0) {
      setSelectedSubject('')
    }
  }, [subjects])
  
  // Safely calculate chart data with error handling
  const weeklyData = useMemo(() => {
    try {
      if (!sessions || !Array.isArray(sessions)) return []
      return getWeeklyData(sessions)
    } catch (error) {
      // Error handling for production
      return []
    }
  }, [sessions])
  
  const monthlyData = useMemo(() => {
    try {
      if (!sessions || !Array.isArray(sessions)) return []
      return getMonthlyData(sessions)
    } catch (error) {
      // Error handling for production
      return []
    }
  }, [sessions])
  
  const dailyData = useMemo(() => {
    try {
      if (!sessions || !Array.isArray(sessions) || !subjects || !Array.isArray(subjects)) return []
      return getDailyData(sessions, subjects)
    } catch (error) {
      // Error handling for production
      return []
    }
  }, [sessions, subjects])
  
  const subjectWeeklyData = useMemo(() => {
    try {
      if (!subjects || !Array.isArray(subjects) || subjects.length === 0) return {}
      if (!sessions || !Array.isArray(sessions)) return {}
      
      // Filter out invalid subjects
      const validSubjects = subjects.filter(s => s && s.id && s.name)
      if (validSubjects.length === 0) return {}
      
      return getSubjectWeeklyData(sessions, validSubjects)
    } catch (error) {
      // Error handling for production
      return {}
    }
  }, [sessions, subjects])
  
  const subjectMonthlyData = useMemo(() => {
    try {
      if (!subjects || !Array.isArray(subjects) || subjects.length === 0) return {}
      if (!sessions || !Array.isArray(sessions)) return {}
      
      // Filter out invalid subjects
      const validSubjects = subjects.filter(s => s && s.id && s.name)
      if (validSubjects.length === 0) return {}
      
      return getSubjectMonthlyData(sessions, validSubjects)
    } catch (error) {
      // Error handling for production
      return {}
    }
  }, [sessions, subjects])
  
  const subjectComparison = useMemo(() => {
    try {
      if (!subjects || !Array.isArray(subjects) || subjects.length === 0) return []
      if (!sessions || !Array.isArray(sessions)) return []
      
      // Filter out invalid subjects
      const validSubjects = subjects.filter(s => s && s.id && s.name)
      if (validSubjects.length === 0) return []
      
      return getSubjectComparison(sessions, validSubjects)
    } catch (error) {
      // Error handling for production
      return []
    }
  }, [sessions, subjects])

  // Get current subject data safely
  const currentSubjectId = useMemo(() => {
    try {
      if (!subjects || !Array.isArray(subjects) || subjects.length === 0) return ''
      if (selectedSubject && subjects.find(s => s && s.id === selectedSubject)) {
        return selectedSubject
      }
      return subjects[0]?.id || ''
    } catch (error) {
      // Error handling for production
      return subjects?.[0]?.id || ''
    }
  }, [selectedSubject, subjects])
  
  const currentSubject = useMemo(() => {
    try {
      if (!subjects || !Array.isArray(subjects) || !currentSubjectId) return null
      return subjects.find(s => s && s.id === currentSubjectId) || null
    } catch (error) {
      // Error handling for production
      return null
    }
  }, [subjects, currentSubjectId])

  return (
    <div className="space-y-4">
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
          <TabsTrigger value="weekly" className="text-xs text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
            <Calendar size={16} className="mr-1" />
            Weekly
          </TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
            <ArrowUp size={16} className="mr-1" />
            Monthly
          </TabsTrigger>
          <TabsTrigger value="daily" className="text-xs text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
            <Clock size={16} className="mr-1" />
            Daily
          </TabsTrigger>
          <TabsTrigger value="subjects" className="text-xs text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
            <BookOpen size={16} className="mr-1" />
            Subjects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">Weekly Study Time</CardTitle>
              <p className="text-sm text-white/70">
                Your study patterns over the last 4 weeks
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <XAxis 
                      dataKey="week" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="minutes" 
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">Weekly Sessions</CardTitle>
              <p className="text-sm text-white/70">
                Number of study sessions per week
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis 
                      dataKey="week" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }}
                    />
                    <Bar 
                      dataKey="sessions" 
                      fill="hsl(var(--accent))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">Monthly Trends</CardTitle>
              <p className="text-sm text-white/70">
                Your study progress over the last 6 months
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="minutes" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sessions" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-xs text-white/70">Study Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                  <span className="text-xs text-white/70">Sessions</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">Daily Activity</CardTitle>
              <p className="text-sm text-white/70">
                Your study time for the last 7 days
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }}
                    />
                    <Bar 
                      dataKey="minutes" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {dailyData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white">Study Consistency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {dailyData.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-white/70 mb-1">
                        {day.day}
                      </div>
                      <div 
                        className={`h-8 rounded-md flex items-center justify-center text-xs font-medium ${
                          day.minutes > 0 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-white/10 text-white/50'
                        }`}
                      >
                        {day.minutes > 0 ? `${day.minutes}m` : '0'}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <div className="text-sm text-white/70">
                    {dailyData.filter(d => d.minutes > 0).length} days active this week
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4" key={`subjects-tab-${currentSubjectId || 'none'}`}>
          {!subjects || subjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <BookOpen size={48} className="text-white/50 mb-4" />
                <h3 className="font-medium mb-2 text-white">No Subjects Yet</h3>
                <p className="text-sm text-white/70 text-center">
                  Add subjects to view individual topic performance
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Subject Selector */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-white">Individual Topic Analysis</CardTitle>
                  <p className="text-sm text-white/70">
                    Track progress for specific subjects
                  </p>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={currentSubjectId || ''} 
                    onValueChange={(value) => {
                      try {
                        // Ensure the selected subject actually exists before setting it
                        if (!value || !subjects || !Array.isArray(subjects)) {
                          console.warn('Invalid value or subjects array:', value, subjects)
                          return
                        }
                        
                        const selectedSubjectExists = subjects.find(s => s && s.id === value)
                        if (selectedSubjectExists) {
                          setSelectedSubject(value)
                        } else {
                          console.warn('Selected subject does not exist:', value)
                          // Fallback to first subject if selection is invalid
                          if (subjects && subjects.length > 0 && subjects[0]?.id) {
                            setSelectedSubject(subjects[0].id)
                          } else {
                            setSelectedSubject('')
                          }
                        }
                      } catch (error) {
                        // Error handling for production
                        // Reset to first subject if there's an error
                        if (subjects && Array.isArray(subjects) && subjects.length > 0 && subjects[0]?.id) {
                          setSelectedSubject(subjects[0].id)
                        } else {
                          setSelectedSubject('')
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20">
                      {subjects && Array.isArray(subjects) && subjects.map(subject => {
                        // Safety check for subject object
                        if (!subject || !subject.id || !subject.name) {
                          console.warn('Invalid subject object:', subject)
                          return null
                        }
                        
                        return (
                          <SelectItem key={subject.id} value={subject.id} className="text-white hover:bg-white/10">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: subject.color || '#6366f1' }}
                              ></div>
                              {subject.name}
                            </div>
                          </SelectItem>
                        )
                      }).filter(Boolean)}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Subject Weekly Progress */}
              <SubjectChartsWrapper currentSubject={currentSubject}>
                {currentSubject && currentSubjectId && 
                 subjectWeeklyData && 
                 typeof subjectWeeklyData === 'object' && 
                 subjectWeeklyData[currentSubjectId] && 
                 Array.isArray(subjectWeeklyData[currentSubjectId]) && 
                 subjectWeeklyData[currentSubjectId].length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-white">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: currentSubject.color || '#6366f1' }}
                        ></div>
                        {currentSubject.name} - Weekly Progress
                      </CardTitle>
                      <p className="text-sm text-white/70">
                        Study time over the last 4 weeks
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={subjectWeeklyData[currentSubjectId] || []}>
                            <XAxis 
                              dataKey="week" 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }}
                            />
                            <YAxis 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }}
                            />
                            {currentSubject && (
                              <Area 
                                type="monotone" 
                                dataKey="minutes" 
                                stroke={currentSubject.color || '#6366f1'}
                                fill={currentSubject.color || '#6366f1'}
                                fillOpacity={0.15}
                                strokeWidth={2}
                              />
                            )}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </SubjectChartsWrapper>

              {/* Subject Monthly Trends */}
              <SubjectChartsWrapper currentSubject={currentSubject}>
                {currentSubject && currentSubjectId && 
                 subjectMonthlyData && 
                 typeof subjectMonthlyData === 'object' && 
                 subjectMonthlyData[currentSubjectId] && 
                 Array.isArray(subjectMonthlyData[currentSubjectId]) && 
                 subjectMonthlyData[currentSubjectId].length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-white">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: currentSubject.color || '#6366f1' }}
                      ></div>
                      {currentSubject.name} - Monthly Trends
                    </CardTitle>
                    <p className="text-sm text-white/70">
                      Long-term progress over 6 months
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={subjectMonthlyData[currentSubjectId] || []}>
                          <XAxis 
                            dataKey="month" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }}
                          />
                          {currentSubject && (
                            <Line 
                              type="monotone" 
                              dataKey="minutes" 
                              stroke={currentSubject.color || '#6366f1'}
                              strokeWidth={3}
                              dot={{ fill: currentSubject.color || '#6366f1', strokeWidth: 2, r: 4 }}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Subject Comparison */}
              {Array.isArray(subjectComparison) && subjectComparison.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white">Subject Comparison</CardTitle>
                    <p className="text-sm text-white/70">
                      This week vs last week performance
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectComparison} layout="horizontal">
                          <XAxis 
                            type="number"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }}
                          />
                          <YAxis 
                            type="category"
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }}
                            width={80}
                          />
                          <Bar 
                            dataKey="thisWeek" 
                            fill="hsl(var(--primary))"
                            radius={[0, 4, 4, 0]}
                            name="This Week"
                          />
                          <Bar 
                            dataKey="lastWeek" 
                            fill="hsl(var(--muted))"
                            radius={[0, 4, 4, 0]}
                            name="Last Week"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="text-xs text-white/70">This Week</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-muted"></div>
                        <span className="text-xs text-white/70">Last Week</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Subject Performance Insights */}
              {currentSubject && currentSubject.id && currentSubject.name && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white">Performance Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Total Study Time</span>
                        <span className="font-medium text-white">{currentSubject.totalTime || 0} minutes</span>
                      </div>
                      
                      {subjectWeeklyData && 
                       typeof subjectWeeklyData === 'object' && 
                       subjectWeeklyData[currentSubjectId] && 
                       Array.isArray(subjectWeeklyData[currentSubjectId]) && 
                       subjectWeeklyData[currentSubjectId].length > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/70">This Week</span>
                          <span className="font-medium text-white">
                            {subjectWeeklyData[currentSubjectId][subjectWeeklyData[currentSubjectId].length - 1]?.minutes || 0} minutes
                          </span>
                        </div>
                      )}
                      
                      {subjectWeeklyData && 
                       typeof subjectWeeklyData === 'object' && 
                       subjectWeeklyData[currentSubjectId] && 
                       Array.isArray(subjectWeeklyData[currentSubjectId]) && 
                       subjectWeeklyData[currentSubjectId].length > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/70">Weekly Average</span>
                          <span className="font-medium text-white">
                            {Math.round(
                              subjectWeeklyData[currentSubjectId].reduce((sum, week) => sum + (week?.minutes || 0), 0) / subjectWeeklyData[currentSubjectId].length
                            )} minutes
                          </span>
                        </div>
                      )}
                      
                      <div className="pt-2 border-t border-white/20">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/70">Target Progress</span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-white">
                              {Math.round(((currentSubject.totalTime || 0) / ((currentSubject.goal || 1) * 60)) * 100)}%
                            </div>
                            <div className="text-xs text-white/50">
                              of {currentSubject.goal || 0}h goal
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 w-full bg-white/10 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(100, ((currentSubject.totalTime || 0) / ((currentSubject.goal || 1) * 60)) * 100)}%`,
                              backgroundColor: currentSubject.color || '#6366f1'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              </SubjectChartsWrapper>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}