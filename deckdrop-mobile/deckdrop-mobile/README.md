<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7aa32a5c-6698-4dc0-b509-8c144d2109a5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
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
