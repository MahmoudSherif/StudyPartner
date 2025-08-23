# MotivaMate - Production Ready Study Companion

A mobile-first PWA for students to track study sessions, manage tasks, and achieve goals with Firebase authentication and cloud synchronization.

## 🚀 Production Features

- **Firebase Authentication**: Secure email/password and Google OAuth
- **Cloud Data Sync**: Real-time synchronization with Firestore
- **PWA Support**: Installable web app with offline capabilities
- **Mobile Optimized**: Touch-friendly interface with haptic feedback
- **Achievement System**: Gamified progress tracking
- **Cross-Device Sync**: Access your data from any device

## 🛠️ Production Setup

### Prerequisites
- Node.js 18+ and npm
- Firebase project (see [Production Setup Guide](./PRODUCTION_SETUP.md))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd motivamate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Create Firestore database
   - Copy `.env.example` to `.env` and fill in your Firebase configuration

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Environment Variables

Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📱 Key Features

### Authentication
- Secure user registration and login
- Google OAuth integration
- Session persistence
- Password validation

### Study Management
- Focus session tracking with timer
- Subject organization
- Progress analytics
- Achievement system

### Task Management
- Daily task creation and completion
- Challenge system for group competition
- Progress tracking and milestones
- Celebration animations

### Data Synchronization
- Real-time sync with Firestore
- Offline support with local storage
- Cross-device data consistency
- Automatic backup and recovery

## 🏗️ Architecture

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui component library
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **PWA**: Service worker for offline support
- **State Management**: React hooks with Firebase integration

## 🔒 Security

- Firebase security rules for data protection
- Environment variable protection
- Input validation and sanitization
- HTTPS enforcement
- Cross-site scripting prevention

## 📊 Monitoring

- Firebase Analytics integration
- Error tracking and reporting
- Performance monitoring
- User engagement metrics

## 🚀 Deployment

### Recommended Platforms
- **Vercel**: Automatic deployments with environment variables
- **Netlify**: Static site hosting with form handling
- **Firebase Hosting**: Native integration with Firebase services

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

## 📝 Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/     # React components
├── contexts/       # React contexts (Auth, etc.)
├── hooks/          # Custom hooks
├── lib/            # Utilities and configurations
├── assets/         # Static assets
└── App.tsx         # Main application component
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary. All rights reserved.

## 📞 Support

For setup assistance or questions:
- Check the [Production Setup Guide](./PRODUCTION_SETUP.md)
- Review Firebase documentation
- Check browser console for errors

---

**Note**: This is a production-ready application. Ensure you have proper Firebase configuration before deployment.