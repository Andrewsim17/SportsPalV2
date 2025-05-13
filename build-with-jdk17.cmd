@echo off
echo Setting up environment for Android build with JDK 17...

REM Set JAVA_HOME to JDK 17
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

REM Verify Java version
echo Using Java version:
java -version

REM Update local.properties
echo Updating local.properties...
echo sdk.dir=C:\\Users\\User\\AppData\\Local\\Android\\Sdk > local.properties
echo MAPBOX_DOWNLOADS_TOKEN=pk.eyJ1IjoiYW5kcmV3c2ltMTciLCJhIjoiY203enY5MXRqMG8yNjJucTE5MnZsd2Q0cCJ9.c4sXLHAOM2_qQm2b1sQr6A >> local.properties

REM Update build.gradle for Mapbox token
echo Please make sure your build.gradle has the correct Mapbox token!

REM Clean the build
echo Cleaning the build...
call %JAVA_HOME%\bin\java -Dorg.gradle.appname=gradlew -classpath "./gradle/wrapper/gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain clean

REM Build the debug APK
echo Building debug APK...
call %JAVA_HOME%\bin\java -Dorg.gradle.appname=gradlew -classpath "./gradle/wrapper/gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain assembleDebug

echo Build script completed. 