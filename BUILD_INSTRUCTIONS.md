# Building FlashMinds APK

The Android build process failed in this environment because the **Android SDK is not installed**. This is expected for standard web/agent sandboxes.

To build the APK for this project, you have two options:

## Option 1: Use EAS Build (Recommended for Expo)

This is the easiest way to build Expo apps without managing Android Studio/Java SDKs locally.

1.  **Install EAS CLI**:
    ```bash
    npm install -g eas-cli
    ```

2.  **Login to Expo**:
    ```bash
    eas login
    ```

3.  **Configure Build**:
    ```bash
    eas build:configure
    ```

4.  **Run Build (Android)**:
    ```bash
    eas build -p android --profile preview
    ```
    *   This will generate an APK that you can install on your device or emulator.

## Option 2: Build Locally (Requires Android Studio)

If you have Android Studio and the Android SDK installed on your machine:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Generate Native Code**:
    ```bash
    npx expo prebuild
    ```

3.  **Build via Gradle**:
    ```bash
    cd android
    ./gradlew assembleDebug
    ```

4.  **Locate APK**:
    The APK will be located at: `android/app/build/outputs/apk/debug/app-debug.apk`

## Note on PDF Support
The app uses the Gemini API for PDF processing. Ensure you put your API Key in the Settings screen after installing the app.
