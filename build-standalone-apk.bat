@echo off
echo Building standalone APK that doesn't require Expo...

:: Set Java environment
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

:: Set Android SDK environment
set ANDROID_HOME=C:\Users\User\AppData\Local\Android\Sdk
set PATH=%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools;%PATH%

:: Clean and rebuild the project
echo Cleaning and rebuilding the project...
call npx expo prebuild --clean -p android
if %ERRORLEVEL% NEQ 0 goto error

:: Copy local.properties file to android directory
echo Copying local.properties to android directory...
copy /Y local.properties android\local.properties

:: Set environment variable for Mapbox
set MAPBOX_DOWNLOADS_TOKEN=pk.eyJ1IjoiYW5kcmV3c2ltMTciLCJhIjoiY203enY5MXRqMG8yNjJucTE5MnZsd2Q0cCJ9.c4sXLHAOM2_qQm2b1sQr6A

:: Navigate to android folder and run release build
echo Building release APK...
cd android
call gradlew assembleRelease --no-daemon --info
if %ERRORLEVEL% NEQ 0 goto error

echo.
echo Build completed successfully!
echo.
echo Your standalone APK is located at:
echo %CD%\app\build\outputs\apk\release\app-release.apk
goto end

:error
echo.
echo Build failed with error code %ERRORLEVEL%
exit /b %ERRORLEVEL%

:end
cd .. 