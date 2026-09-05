# Berry Co. Mobile Testing App

This build is intentionally local-first for APK testing. Products, cart state, wishlist state, orders, and the demo account are stored in browser/WebView localStorage. No Supabase client is required yet.

When the backend is ready, replace the local product initialization and product mutation functions in `src/context/StoreContext.tsx` with a Supabase repository. Keep the `Product` type and context methods as the UI contract so the screens do not need to change.

The catalog starts empty and displays reserved product slots for the future web inventory sync. The home carousel uses the local JPG files in `public/carousel/`: `Pukimon TCG.jpg`, `Magic.jpg`, `One Piece.jpg`, `Fig.jpg`, `Card Acc.jpg`, and `Promos.jpg`.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Build an Android APK

**Prerequisites:** Android Studio, Android SDK, and a Java 17 JDK.

Capacitor wraps the built Vite app in a native Android project. From this directory:

1. Sync the web app into Android:
   `npm run mobile:sync`
2. Open the Android project in Android Studio:
   `npm run android:open`
3. In Android Studio, select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

The debug APK is created at `android/app/build/outputs/apk/debug/app-debug.apk`.

For a command-line debug APK, run:

`npm run android:build`
