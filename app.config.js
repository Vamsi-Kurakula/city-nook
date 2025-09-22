import 'dotenv/config';

export default {
  expo: {
    name: "Crawls",
    slug: "city-crawler",
                version: "1.3.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark", // Force dark mode
    newArchEnabled: true,
    scheme: "crawls",
    description: "Discover and explore cities through guided crawls and adventures",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#1a1a2e"
    },
    // Development splash screen (for bundling)
    developmentClient: {
      splashScreen: {
        image: "./assets/splash-icon.png",
        backgroundColor: "#1a1a2e"
      }
    },
    // OAuth redirect and development settings
    extra: {
      eas: {
        projectId: "f0e3027e-7d53-46eb-83e7-7a51334fa601"
      },
      // Force dark theme during development
      developmentSplash: {
        backgroundColor: "#1a1a2e"
      }
    },
    ios: {
      bundleIdentifier: "com.vamsikurakula.citycrawler",
      supportsTablet: true,
                    buildNumber: "130",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "This app uses location to show your position on the crawl map.",
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSExceptionDomains: {
            "supabase.co": {
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSExceptionMinimumTLSVersion: "1.2"
            },
            "clerk.com": {
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSExceptionMinimumTLSVersion: "1.2"
            },
            "supabase.storage": {
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSExceptionMinimumTLSVersion: "1.2"
            },
            "*.supabase.co": {
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSExceptionMinimumTLSVersion: "1.2"
            },
            "*.supabase.storage": {
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSExceptionMinimumTLSVersion: "1.2"
            }
          }
        }
      }
    },
    android: {
      package: "com.vamsikurakula.citycrawler",
                  versionCode: 130,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1a1a2e"
      },
      edgeToEdgeEnabled: true,
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION", "android.permission.INTERNET"],
      allowBackup: true,
      networkSecurityConfig: "./android/app/src/main/res/xml/network_security_config.xml",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location."
        }
      ],
      "expo-secure-store"
    ],
    owner: "vamsikurakula"
  }
}; 