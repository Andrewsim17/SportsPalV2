# SportsPal Android Build Guide

This document provides instructions for building the SportsPal Android app with the solutions to previously encountered issues.

## Prerequisites

1. **JDK 17** - Make sure you have JDK 17 installed:
   - Eclipse Adoptium/Temurin JDK 17.0.15 is recommended
   - Located at: `C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot`

2. **Android SDK** - Make sure you have Android SDK installed

3. **Mapbox Secret Token** - A valid Mapbox secret token with the following permissions:
   - `DOWNLOADS:READ`
   - `DOWNLOADS:WRITE`

## Building the App

### Option 1: Using the build17.bat Script

The simplest way to build the app is to use the provided batch script:

```bash
cd android
.\build17.bat
```

This script will:
1. Set JAVA_HOME to JDK 17
2. Set the appropriate PATH
3. Run `gradlew clean assembleDebug`

### Option 2: Manual Build with JDK 17

If you prefer to set up the environment manually:

1. Set JAVA_HOME environment variable:
   ```powershell
   $env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot"
   ```

2. Navigate to the Android directory and run the build:
   ```powershell
   cd android
   .\gradlew clean assembleDebug
   ```

## Troubleshooting

### JDK Version Issues

If you encounter errors related to "Unsupported class file major version 68", it means you're using a newer JDK that's incompatible with the project. Make sure to use JDK 17.

### Mapbox Authentication Issues

If you encounter 403 Forbidden errors when downloading Mapbox SDK components:

1. Make sure your Mapbox token is correctly set in:
   - `android/build.gradle` (in the maven repository configuration)
   - `android/local.properties` (as MAPBOX_DOWNLOADS_TOKEN)

2. Verify that your token has the correct permissions:
   - It must be a **secret token** (not a public token)
   - It must have `DOWNLOADS:READ` and `DOWNLOADS:WRITE` permissions

3. To test your token, you can run:
   ```
   Invoke-WebRequest -Uri "https://api.mapbox.com/downloads/v2/releases/maven/com/mapbox/maps/android/10.18.4/android-10.18.4.pom" -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"}
   ```

## Build Output

After a successful build, you'll find the APK at:
`android/app/build/outputs/apk/debug/app-debug.apk` 