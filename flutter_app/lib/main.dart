import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'screens/home_screen.dart';
import 'providers/study_provider.dart';
import 'providers/auth_provider.dart';
import 'constants/app_constants.dart';

void main() {
  runApp(const MotivaMateApp());
}

class MotivaMateApp extends StatelessWidget {
  const MotivaMateApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => StudyProvider()),
      ],
      child: MaterialApp(
        title: 'MotivaMate',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppConstants.primaryTeal,
            primary: AppConstants.primaryTeal,
            secondary: AppConstants.accentOrange,
            background: AppConstants.backgroundGray,
            surface: Colors.white,
            onPrimary: AppConstants.whiteText,
            onSecondary: AppConstants.whiteText,
            onBackground: AppConstants.darkText,
            onSurface: AppConstants.darkText,
          ),
          textTheme: GoogleFonts.interTextTheme(
            TextTheme(
              headlineLarge: GoogleFonts.inter(
                fontSize: AppConstants.fontSize24,
                fontWeight: FontWeight.bold,
                letterSpacing: -0.5,
                color: AppConstants.darkText,
              ),
              headlineMedium: GoogleFonts.inter(
                fontSize: AppConstants.fontSize20,
                fontWeight: FontWeight.w600,
                color: AppConstants.darkText,
              ),
              headlineSmall: GoogleFonts.inter(
                fontSize: AppConstants.fontSize18,
                fontWeight: FontWeight.w500,
                color: AppConstants.darkText,
              ),
              bodyLarge: GoogleFonts.inter(
                fontSize: AppConstants.fontSize16,
                fontWeight: FontWeight.normal,
                height: 1.5,
                color: AppConstants.darkText,
              ),
              bodyMedium: GoogleFonts.inter(
                fontSize: AppConstants.fontSize14,
                fontWeight: FontWeight.w500,
                letterSpacing: 0.5,
                color: AppConstants.darkText,
              ),
            ),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              foregroundColor: AppConstants.whiteText,
              backgroundColor: AppConstants.primaryTeal,
              minimumSize: const Size(double.infinity, AppConstants.minTouchTarget),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppConstants.spacing8),
              ),
              elevation: 0,
            ),
          ),
          cardTheme: CardTheme(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppConstants.spacing16),
              side: BorderSide(
                color: AppConstants.lightBlueGray.withOpacity(0.3),
                width: 1,
              ),
            ),
            color: Colors.white,
          ),
          appBarTheme: AppBarTheme(
            backgroundColor: Colors.transparent,
            elevation: 0,
            scrolledUnderElevation: 0,
            titleTextStyle: GoogleFonts.inter(
              fontSize: AppConstants.fontSize20,
              fontWeight: FontWeight.w600,
              color: AppConstants.darkText,
            ),
            iconTheme: const IconThemeData(
              color: AppConstants.darkText,
            ),
          ),
          bottomNavigationBarTheme: BottomNavigationBarThemeData(
            backgroundColor: Colors.white,
            selectedItemColor: AppConstants.primaryTeal,
            unselectedItemColor: AppConstants.darkText.withOpacity(0.6),
            type: BottomNavigationBarType.fixed,
            elevation: 8,
            selectedLabelStyle: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
            unselectedLabelStyle: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.normal,
            ),
          ),
        ),
        home: const HomeScreen(),
      ),
    );
  }
}