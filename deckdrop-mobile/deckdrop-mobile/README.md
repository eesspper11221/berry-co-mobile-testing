# Berry Co. Mobile Store

Berry Co. is a local-first React mobile storefront for trading cards, figures, and collectibles. It showcases the customer shopping flow: browsing promotional drops, searching and filtering products, viewing product details, managing a cart and wishlist, signing in locally, and placing test orders.

The project uses a custom esbuild and Tailwind build script with a small Express static server.

## Run Locally

**Prerequisites:** Node.js 20 or newer


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

`npm run dev` builds the browser bundle with `scripts/build.mjs` and serves the generated `dist` directory at http://localhost:3000.

For a typecheck without starting the server:

`npm run lint`

## Build an Android APK

**Prerequisites:** Android Studio, Android SDK, and a Java 17 JDK.

Capacitor wraps the Node-built web app in a native Android project. From this directory:

1. Sync the web app into Android:
   `npm run mobile:sync`
2. Open the Android project in Android Studio:
   `npm run android:open`
3. In Android Studio, select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

The debug APK is created at `android/app/build/outputs/apk/debug/app-debug.apk`.

For a command-line debug APK, run:

`npm run android:build`
