// Authentication is backed by Firebase Authentication (package:firebase_auth).
// Credentials are verified by Firebase's servers -- this class never decides on
// its own that a user is signed in. `isAuthenticated` is derived purely from the
// `FirebaseAuth.authStateChanges()` stream, and session persistence is handled
// by the Firebase SDK. Nothing about the session is stored on the client in
// SharedPreferences (a client-side boolean is trivially forged and is not a
// session).
//
// TODO(auth): This package does not yet contain Firebase platform configuration.
// `firebase_core` / `firebase_auth` are declared in pubspec.yaml, but there is no
// `firebase_options.dart`, no `android/app/google-services.json` and no
// `ios/Runner/GoogleService-Info.plist` in the repository (the `android/`
// directory is an incomplete scaffold and there is no `ios/` directory at all).
// Until that configuration is added, `Firebase.initializeApp()` fails, this
// provider reports `isConfigured == false`, and every sign-in/sign-up attempt is
// REJECTED with an explicit error. That is deliberate: failing closed is correct.
//
// To finish wiring this up, register Android/iOS apps under the existing
// "motivemate-6c846" Firebase project (the same project the web client in
// `src/lib/firebase.ts` uses), then from `flutter_app/` run:
//
//     flutterfire configure --project=motivemate-6c846
//
// and pass the generated options to `Firebase.initializeApp` in `main.dart`:
//
//     await Firebase.initializeApp(
//       options: DefaultFirebaseOptions.currentPlatform,
//     );
//
// Also enable the Email/Password sign-in provider in the Firebase console.
// No code in this file needs to change once that is done.

import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider extends ChangeNotifier {
  /// Shown whenever Firebase could not be initialised. Sign-in and sign-up are
  /// impossible in this state -- by design.
  static const String notConfiguredMessage =
      'Authentication is not configured for this app. No sign-in is possible '
      'until Firebase is set up. Please contact support.';

  /// Legacy SharedPreferences keys written by an earlier build that granted a
  /// session for any non-empty email/password. Nothing reads them any more, so
  /// they cannot grant access, but they are purged on startup so that no stale
  /// forged "session" survives an upgrade.
  static const List<String> _legacyAuthKeys = <String>[
    'isAuthenticated',
    'userEmail',
    'userName',
  ];

  /// Non-null only once Firebase has been successfully initialised.
  FirebaseAuth? _auth;
  StreamSubscription<User?>? _authStateSubscription;

  /// The single source of truth for the session. Only ever assigned from a
  /// server-verified Firebase user.
  User? _user;

  bool _isLoading = true;
  String? _errorMessage;

  /// True only when Firebase reports a signed-in user.
  bool get isAuthenticated => _user != null;

  String? get userEmail => _user?.email;

  String? get userName {
    final displayName = _user?.displayName;
    if (displayName != null && displayName.isNotEmpty) {
      return displayName;
    }
    final email = _user?.email;
    if (email != null && email.contains('@')) {
      return email.split('@').first;
    }
    return email;
  }

  bool get isLoading => _isLoading;

  /// Human-readable reason the last operation failed, or null.
  String? get errorMessage => _errorMessage;

  /// False when Firebase could not be initialised; authentication is
  /// unavailable and every credential attempt will be rejected.
  bool get isConfigured => _auth != null;

  AuthProvider() {
    _initialize();
  }

  Future<void> _initialize() async {
    // Yield first so notifyListeners() can never fire synchronously from the
    // constructor (i.e. during the build that created this provider).
    await Future<void>.delayed(Duration.zero);

    unawaited(_purgeLegacyAuthState());

    try {
      if (Firebase.apps.isEmpty) {
        await Firebase.initializeApp();
      }

      final auth = FirebaseAuth.instance;
      _auth = auth;

      // Firebase persists the session itself and emits the restored user (or
      // null) as the first event on this stream.
      _authStateSubscription = auth.authStateChanges().listen(
        (User? user) {
          _user = user;
          _isLoading = false;
          notifyListeners();
        },
        onError: (Object error) {
          debugPrint('Auth state stream error: $error');
          _user = null;
          _isLoading = false;
          _errorMessage = 'Could not verify your session. Please sign in again.';
          notifyListeners();
        },
      );
    } catch (e) {
      // Fail closed: no Firebase means no authentication, ever.
      debugPrint('Firebase initialisation failed, authentication disabled: $e');
      _auth = null;
      _user = null;
      _isLoading = false;
      _errorMessage = notConfiguredMessage;
      notifyListeners();
    }
  }

  /// Deletes only the auth keys written by the old insecure build. Study data
  /// owned by StudyProvider is left untouched.
  Future<void> _purgeLegacyAuthState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      for (final key in _legacyAuthKeys) {
        await prefs.remove(key);
      }
    } catch (e) {
      debugPrint('Could not purge legacy auth state: $e');
    }
  }

  Future<bool> signIn(String email, String password) async {
    final auth = _auth;
    if (auth == null) {
      _errorMessage = notConfiguredMessage;
      notifyListeners();
      return false;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final credential = await auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
      // Server-verified. authStateChanges() also delivers this; assigning here
      // avoids a race for callers that read isAuthenticated immediately.
      _user = credential.user ?? auth.currentUser;
      _isLoading = false;
      notifyListeners();
      return _user != null;
    } on FirebaseAuthException catch (e) {
      _failWith(_messageForAuthException(e));
      return false;
    } catch (e) {
      debugPrint('Error signing in: $e');
      _failWith('Could not sign in right now. Please try again.');
      return false;
    }
  }

  Future<bool> signUp(String email, String password, String name) async {
    final auth = _auth;
    if (auth == null) {
      _errorMessage = notConfiguredMessage;
      notifyListeners();
      return false;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final credential = await auth.createUserWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );

      final user = credential.user;
      final trimmedName = name.trim();
      if (user != null && trimmedName.isNotEmpty) {
        await user.updateDisplayName(trimmedName);
        await user.reload();
      }

      _user = auth.currentUser ?? user;
      _isLoading = false;
      notifyListeners();
      return _user != null;
    } on FirebaseAuthException catch (e) {
      _failWith(_messageForAuthException(e));
      return false;
    } catch (e) {
      debugPrint('Error signing up: $e');
      _failWith('Could not create your account right now. Please try again.');
      return false;
    }
  }

  Future<void> signOut() async {
    _errorMessage = null;

    try {
      await _auth?.signOut();
    } on FirebaseAuthException catch (e) {
      debugPrint('Error signing out: ${e.code}');
    } catch (e) {
      debugPrint('Error signing out: $e');
    }

    // Drop the session locally regardless of what the SDK reported.
    _user = null;
    _isLoading = false;
    notifyListeners();
  }

  void _failWith(String message) {
    _user = null;
    _isLoading = false;
    _errorMessage = message;
    notifyListeners();
  }

  String _messageForAuthException(FirebaseAuthException e) {
    debugPrint('FirebaseAuthException: ${e.code}');
    switch (e.code) {
      // Deliberately identical for all three so the response does not reveal
      // whether an account exists for the given address.
      case 'user-not-found':
      case 'wrong-password':
      case 'invalid-credential':
        return 'Incorrect email or password.';
      case 'invalid-email':
        return 'Please enter a valid email address.';
      case 'user-disabled':
        return 'This account has been disabled.';
      case 'email-already-in-use':
        return 'An account already exists for that email address.';
      case 'weak-password':
        return 'Please choose a stronger password.';
      case 'too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      case 'network-request-failed':
        return 'No network connection. Please check your connection and try again.';
      case 'operation-not-allowed':
      case 'configuration-not-found':
      case 'api-key-not-valid':
        return notConfiguredMessage;
      default:
        return 'Could not complete that request. Please try again.';
    }
  }

  @override
  void dispose() {
    _authStateSubscription?.cancel();
    super.dispose();
  }
}
