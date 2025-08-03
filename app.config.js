import 'dotenv/config';

export default {
  expo: {
    name: "City Crawler",
    slug: "city-crawler",
    version: "1.1.3",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "city-crawler",
    description: "Discover and explore cities through guided crawls and adventures",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      bundleIdentifier: "com.vamsikurakula.citycrawler",
      supportsTablet: true,
      buildNumber: "113",
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
            }
          }
        }
      }
    },
    android: {
      package: __DEV__ ? "com.vamsikurakula.citycrawler.dev" : "com.vamsikurakula.citycrawler",
      versionCode: 113,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION", "android.permission.INTERNET"],
      allowBackup: true,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "f0e3027e-7d53-46eb-83e7-7a51334fa601"
      },
      clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location."
        }
      ]
    ],
    owner: "vamsikurakula"
  }
}; 