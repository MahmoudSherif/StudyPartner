// Firebase authentication test functions
import { auth, authFunctions, db, firestoreFunctions } from './firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

export interface AuthTestResult {
  success: boolean
  message: string
  details?: any
}

export interface FirebaseTestSuite {
  configTest: AuthTestResult
  authTest: AuthTestResult
  firestoreTest: AuthTestResult
  connectionTest: AuthTestResult
}

// Test Firebase configuration
export const testFirebaseConfig = async (): Promise<AuthTestResult> => {
  try {
    // Check if Firebase app is initialized
    if (!auth || !db) {
      return {
        success: false,
        message: 'Firebase not initialized properly'
      }
    }

    // Check if environment variables are loaded
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    }

    const missingVars = Object.entries(config).filter(([_, value]) => !value)
    
    if (missingVars.length > 0) {
      return {
        success: false,
        message: `Missing environment variables: ${missingVars.map(([key]) => key).join(', ')}`,
        details: config
      }
    }

    return {
      success: true,
      message: 'Firebase configuration loaded successfully',
      details: {
        projectId: config.projectId,
        authDomain: config.authDomain
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Configuration test failed: ${error.message}`,
      details: error
    }
  }
}

// Test Firebase Authentication connection
export const testAuthConnection = async (): Promise<AuthTestResult> => {
  try {
    // Test auth state listener
    return new Promise((resolve) => {
      const unsubscribe = authFunctions.onAuthStateChanged((user) => {
        unsubscribe()
        resolve({
          success: true,
          message: 'Authentication service connected successfully',
          details: {
            currentUser: user ? {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName
            } : null
          }
        })
      })
      
      // Timeout after 5 seconds
      setTimeout(() => {
        unsubscribe()
        resolve({
          success: false,
          message: 'Authentication connection timeout'
        })
      }, 5000)
    })
  } catch (error: any) {
    return {
      success: false,
      message: `Authentication test failed: ${error.message}`,
      details: error
    }
  }
}

// Test Firestore connection
export const testFirestoreConnection = async (): Promise<AuthTestResult> => {
  try {
    // Try to read from a test collection
    const testCollection = collection(db, 'test')
    await getDocs(testCollection)
    
    return {
      success: true,
      message: 'Firestore connection successful'
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Firestore connection failed: ${error.message}`,
      details: error
    }
  }
}

// Test StudyPartner database compatibility
export const testStudyPartnerData = async (): Promise<AuthTestResult> => {
  try {
    // Check if we can access typical StudyPartner collections
    const collections = ['users', 'subjects', 'sessions', 'achievements']
    const results: any[] = []
    
    for (const collectionName of collections) {
      try {
        const testCollection = collection(db, collectionName)
        const snapshot = await getDocs(testCollection)
        results.push({
          collection: collectionName,
          exists: true,
          documentCount: snapshot.size
        })
      } catch (error) {
        results.push({
          collection: collectionName,
          exists: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return {
      success: true,
      message: 'StudyPartner database structure check completed',
      details: results
    }
  } catch (error: any) {
    return {
      success: false,
      message: `StudyPartner data test failed: ${error.message}`,
      details: error
    }
  }
}

// Test user authentication with test credentials
export const testUserAuthentication = async (email: string, password: string): Promise<AuthTestResult> => {
  try {
    const result = await authFunctions.signIn(email, password)
    
    if (result.user) {
      // Test user profile access
      const profile = await firestoreFunctions.getUserProfile(result.user.uid)
      
      return {
        success: true,
        message: 'User authentication successful',
        details: {
          user: {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName
          },
          profile: profile.data
        }
      }
    } else {
      return {
        success: false,
        message: result.error || 'Authentication failed'
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: `User authentication test failed: ${error.message}`,
      details: error
    }
  }
}

// Run complete Firebase test suite
export const runFirebaseTestSuite = async (): Promise<FirebaseTestSuite> => {
  console.log('🧪 Starting Firebase Test Suite...')
  
  const configTest = await testFirebaseConfig()
  console.log('✓ Config Test:', configTest.success ? 'PASSED' : 'FAILED')
  
  const authTest = await testAuthConnection()
  console.log('✓ Auth Connection Test:', authTest.success ? 'PASSED' : 'FAILED')
  
  const firestoreTest = await testFirestoreConnection()
  console.log('✓ Firestore Connection Test:', firestoreTest.success ? 'PASSED' : 'FAILED')
  
  const connectionTest = await testStudyPartnerData()
  console.log('✓ StudyPartner Data Test:', connectionTest.success ? 'PASSED' : 'FAILED')
  
  return {
    configTest,
    authTest,
    firestoreTest,
    connectionTest
  }
}

// Export for console testing
export const firebaseTestUtils = {
  testConfig: testFirebaseConfig,
  testAuth: testAuthConnection,
  testFirestore: testFirestoreConnection,
  testStudyPartner: testStudyPartnerData,
  testUserAuth: testUserAuthentication,
  runFullSuite: runFirebaseTestSuite
}

// Make available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).firebaseTest = firebaseTestUtils
}