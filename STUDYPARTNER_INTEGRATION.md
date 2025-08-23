# StudyPartner Integration Setup Guide

This guide explains how to connect MotivaMate with the StudyPartner repository for shared user accounts and data synchronization.

## Overview

The integration enables:
- **Shared User Accounts**: Users can sign in with the same credentials on both MotivaMate and StudyPartner
- **Data Synchronization**: Study sessions, tasks, achievements, and notes sync between both platforms
- **Cross-Platform Access**: Start studying on MotivaMate mobile app, continue on StudyPartner web platform
- **Offline Resilience**: Work offline on either platform and sync when reconnected

## Architecture

```
MotivaMate (Mobile/PWA) ←→ StudyPartner API ←→ StudyPartner (Web)
                      ↑
                 Shared Database
```

## Setup Requirements

### StudyPartner Backend API

The StudyPartner repository needs to implement these API endpoints:

#### Authentication Endpoints
```
POST /auth/register - Create new user account
POST /auth/login - Authenticate user
POST /auth/google - Google OAuth authentication
POST /auth/logout - Sign out user
POST /auth/refresh - Refresh authentication token
GET /auth/me - Get current user info
```

#### Data Sync Endpoints
```
POST /sync/upload - Upload data from client
GET /sync/download - Download data to client
GET /user/data - Get complete user dataset
POST /users/batch - Get multiple users by ID
GET /users/search - Find user by email
GET /health - API health check
```

### Required Database Schema

```sql
-- Users table
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  display_name VARCHAR,
  avatar_url VARCHAR,
  created_at TIMESTAMP,
  last_login_at TIMESTAMP
);

-- Study sessions
CREATE TABLE study_sessions (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  subject_id VARCHAR,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration INTEGER,
  completed BOOLEAN,
  created_at TIMESTAMP
);

-- Tasks
CREATE TABLE tasks (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  title VARCHAR NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR,
  due_date TIMESTAMP,
  created_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- And similar tables for subjects, achievements, challenges, etc.
```

### Environment Configuration

Create a `.env.local` file:

```env
# StudyPartner API Configuration
REACT_APP_STUDYPARTNER_API_URL=https://api.studypartner.app/v1
REACT_APP_STUDYPARTNER_API_KEY=your_api_key_here

# For local development
# REACT_APP_STUDYPARTNER_API_URL=http://localhost:3001/api/v1

# Optional: Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

# Feature flags
REACT_APP_ENABLE_STUDYPARTNER_SYNC=true
REACT_APP_ENABLE_OFFLINE_MODE=true
```

## Implementation Details

### Authentication Flow

1. **Account Creation**:
   - User creates account on either MotivaMate or StudyPartner
   - Account is stored in shared database
   - Both apps can authenticate with same credentials

2. **Cross-Platform Sign In**:
   - User enters email/password on either platform
   - API validates credentials against shared database
   - JWT token is issued for session management

3. **Automatic Account Linking**:
   - If user has local-only account, offer migration to StudyPartner
   - Merge local data with backend when linking accounts

### Data Synchronization

1. **Real-Time Sync**:
   - Changes are queued locally for upload
   - Periodic sync attempts (every 5 minutes)
   - Immediate sync on user actions when online

2. **Conflict Resolution**:
   - Server timestamp wins for conflicts
   - Merge strategies for different data types
   - User notification for significant conflicts

3. **Offline Support**:
   - Full app functionality without internet
   - Changes queued for later upload
   - Background sync when connection restored

### API Integration

The integration uses these key components:

- **`src/lib/api.ts`**: StudyPartner API client with error handling
- **`src/lib/sync.ts`**: Data synchronization service
- **`src/contexts/AuthContext.tsx`**: Enhanced auth with StudyPartner support
- **`src/components/SyncIndicator.tsx`**: Connection status display
- **`src/components/StudyPartnerIntegration.tsx`**: Sync management UI

## Testing the Integration

1. **Setup Development Environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your StudyPartner API URL
   ```

2. **Test Connection**:
   - Go to Profile → Sync tab in MotivaMate
   - Click "Test Connection"
   - Verify connection to StudyPartner API

3. **Test Account Creation**:
   - Create account on MotivaMate
   - Verify you can sign in with same credentials on StudyPartner
   - Check that user data appears in both platforms

4. **Test Data Sync**:
   - Create a study session on MotivaMate
   - Verify it appears on StudyPartner
   - Make changes on StudyPartner
   - Verify they sync back to MotivaMate

## Production Deployment

### Security Considerations

- Use HTTPS for all API communication
- Implement proper JWT token validation
- Set up CORS policies for cross-origin requests
- Use environment variables for sensitive configuration

### Performance Optimization

- Implement data pagination for large datasets
- Use incremental sync (only changed data)
- Add request/response compression
- Set up proper caching headers

### Monitoring & Analytics

- Track sync success/failure rates
- Monitor API response times
- Log authentication attempts
- Track cross-platform user activity

## Troubleshooting

### Common Issues

1. **Connection Failed**:
   - Verify API URL is correct
   - Check network connectivity
   - Confirm CORS settings

2. **Authentication Errors**:
   - Verify JWT token format
   - Check token expiration
   - Confirm user exists in database

3. **Sync Failures**:
   - Check data format compatibility
   - Verify required fields are present
   - Review server error logs

### Debug Mode

Enable debug mode in `.env.local`:
```env
REACT_APP_DEBUG_SYNC=true
```

This will:
- Log all API requests/responses
- Show detailed sync status
- Display error details in UI

## Future Enhancements

- Real-time collaboration features
- Shared study groups across platforms
- Advanced conflict resolution UI
- Data export/import functionality
- Analytics dashboard for study patterns