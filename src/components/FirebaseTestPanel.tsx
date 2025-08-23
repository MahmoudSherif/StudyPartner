import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  runFirebaseTestSuite, 
  testUserAuthentication, 
  type FirebaseTestSuite, 
  type AuthTestResult 
} from '@/lib/firebaseTest'
import { useAuth } from '@/contexts/AuthContext'
import { isFirebaseAvailable } from '@/lib/firebase'
import { 
  CheckCircle, 
  XCircle, 
  Play, 
  Warning, 
  Database, 
  Shield, 
  Globe, 
  User,
  DatabaseSlash
} from '@phosphor-icons/react'
import { toast } from 'sonner'

export const FirebaseTestPanel = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<FirebaseTestSuite | null>(null)
  const [userTestResult, setUserTestResult] = useState<AuthTestResult | null>(null)
  const [testCredentials, setTestCredentials] = useState({
    email: '',
    password: ''
  })

  const runTests = async () => {
    setLoading(true)
    try {
      const results = await runFirebaseTestSuite()
      setTestResults(results)
      
      const passedTests = Object.values(results).filter(test => test.success).length
      const totalTests = Object.values(results).length
      
      if (passedTests === totalTests) {
        toast.success(`All ${totalTests} tests passed! 🎉`)
      } else {
        toast.warning(`${passedTests}/${totalTests} tests passed`)
      }
    } catch (error) {
      toast.error('Test suite failed to run')
      console.error('Test suite error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testUserAuth = async () => {
    if (!testCredentials.email || !testCredentials.password) {
      toast.error('Please enter test credentials')
      return
    }

    setLoading(true)
    try {
      const result = await testUserAuthentication(testCredentials.email, testCredentials.password)
      setUserTestResult(result)
      
      if (result.success) {
        toast.success('User authentication test passed! 🎉')
      } else {
        toast.error('User authentication test failed')
      }
    } catch (error) {
      toast.error('Authentication test failed')
      console.error('Auth test error:', error)
    } finally {
      setLoading(false)
    }
  }

  const TestResultCard = ({ 
    title, 
    result, 
    icon: Icon 
  }: { 
    title: string
    result: AuthTestResult
    icon: React.ComponentType<any>
  }) => (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon size={20} className="text-white/70" />
            <CardTitle className="text-white text-sm">{title}</CardTitle>
          </div>
          <Badge variant={result.success ? "default" : "destructive"} className="text-xs">
            {result.success ? 'PASS' : 'FAIL'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-start gap-2 mb-2">
          {result.success ? (
            <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
          )}
          <p className="text-white/80 text-sm leading-relaxed">{result.message}</p>
        </div>
        {result.details && (
          <details className="mt-2">
            <summary className="text-white/60 text-xs cursor-pointer hover:text-white/80">
              View Details
            </summary>
            <div className="mt-2 text-xs text-white/60 bg-black/20 p-2 rounded border border-white/10 overflow-auto max-h-32">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database size={24} />
            Firebase Authentication Test
          </CardTitle>
          <CardDescription className="text-white/70">
            Test Firebase connection and StudyPartner integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Firebase Status Indicator */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              {isFirebaseAvailable ? (
                <Database size={20} className="text-green-400" />
              ) : (
                <DatabaseSlash size={20} className="text-yellow-400" />
              )}
              <div>
                <p className="text-sm font-medium text-white">
                  {isFirebaseAvailable ? 'Firebase Connected' : 'Firebase Offline Mode'}
                </p>
                <p className="text-xs text-white/60">
                  {isFirebaseAvailable 
                    ? 'All Firebase services are available' 
                    : 'Using local storage and mock authentication'
                  }
                </p>
              </div>
            </div>
            <Badge 
              variant={isFirebaseAvailable ? 'default' : 'secondary'}
              className={isFirebaseAvailable 
                ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
              }
            >
              {isFirebaseAvailable ? 'Online' : 'Offline'}
            </Badge>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button 
              onClick={runTests} 
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              <Play size={16} className="mr-2" />
              {loading ? 'Running Tests...' : 'Run Test Suite'}
            </Button>
            
            {user && (
              <Badge variant="outline" className="text-white border-white/20">
                <User size={14} className="mr-1" />
                Connected as {user.displayName || user.email?.split('@')[0]}
              </Badge>
            )}
          </div>

          {testResults && (
            <div className="space-y-4">
              <Separator className="bg-white/10" />
              <div className="grid gap-4">
                <TestResultCard 
                  title="Configuration Test"
                  result={testResults.configTest}
                  icon={Globe}
                />
                <TestResultCard 
                  title="Authentication Connection"
                  result={testResults.authTest}
                  icon={Shield}
                />
                <TestResultCard 
                  title="Firestore Connection"
                  result={testResults.firestoreTest}
                  icon={Database}
                />
                <TestResultCard 
                  title="StudyPartner Data Access"
                  result={testResults.connectionTest}
                  icon={User}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield size={24} />
            User Authentication Test
          </CardTitle>
          <CardDescription className="text-white/70">
            Test login with StudyPartner credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-email" className="text-white">Test Email</Label>
              <Input
                id="test-email"
                type="email"
                value={testCredentials.email}
                onChange={(e) => setTestCredentials({ ...testCredentials, email: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="Enter StudyPartner account email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-password" className="text-white">Test Password</Label>
              <Input
                id="test-password"
                type="password"
                value={testCredentials.password}
                onChange={(e) => setTestCredentials({ ...testCredentials, password: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="Enter password"
              />
            </div>
            <Button 
              onClick={testUserAuth} 
              disabled={loading || !testCredentials.email || !testCredentials.password}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Shield size={16} className="mr-2" />
              {loading ? 'Testing...' : 'Test Authentication'}
            </Button>
          </div>

          {userTestResult && (
            <div className="mt-4">
              <TestResultCard 
                title="User Authentication"
                result={userTestResult}
                icon={Shield}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Warning size={24} />
            Current Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Project ID:</span>
              <span className="text-white font-mono text-xs">{import.meta.env.VITE_FIREBASE_PROJECT_ID}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Auth Domain:</span>
              <span className="text-white font-mono text-xs">{import.meta.env.VITE_FIREBASE_AUTH_DOMAIN}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Environment:</span>
              <span className="text-white">{import.meta.env.VITE_ENVIRONMENT || 'development'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}