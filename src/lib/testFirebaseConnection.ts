// Simple Firebase connection test
import { auth, db, isFirebaseAvailable } from './firebase'

export const testFirebaseConnection = async () => {
  console.log('🔥 Testing Firebase Connection...')
  
  // Test 1: Check if Firebase is available
  console.log('✓ Firebase Available:', isFirebaseAvailable)
  
  // Test 2: Check auth and db objects
  console.log('✓ Auth Object:', !!auth)
  console.log('✓ Database Object:', !!db)
  
  // Test 3: Check configuration
  if (isFirebaseAvailable && auth) {
    console.log('✓ Auth Domain:', auth.config?.authDomain)
    console.log('✓ Project ID:', auth.config?.projectId)
    
    // Test 4: Try to get current user (should be null initially)
    const currentUser = auth.currentUser
    console.log('✓ Current User:', currentUser ? currentUser.email : 'No user signed in')
    
    return {
      success: true,
      message: 'Firebase connection successful',
      details: {
        authDomain: auth.config?.authDomain,
        projectId: auth.config?.projectId,
        hasCurrentUser: !!currentUser
      }
    }
  } else {
    return {
      success: false,
      message: 'Firebase not properly initialized',
      details: { isFirebaseAvailable, hasAuth: !!auth, hasDb: !!db }
    }
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testFirebaseConnection = testFirebaseConnection
  // Run the test automatically
  testFirebaseConnection().then(result => {
    console.log('🔥 Firebase Test Result:', result)
  })
}
