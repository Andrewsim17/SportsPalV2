# Build script for Android with JDK 17
Write-Host "Setting up environment for Android build with JDK 17..."

# Set JAVA_HOME to JDK 17
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Verify Java version
Write-Host "Using Java version:"
& java -version

# Stop any running Gradle daemons
Write-Host "Stopping Gradle daemons..."
& ./gradlew --stop

# Update Mapbox credentials in local.properties
$localPropsContent = @"
sdk.dir=C:\\Users\\User\\AppData\\Local\\Android\\Sdk
MAPBOX_DOWNLOADS_TOKEN=pk.eyJ1IjoiYW5kcmV3c2ltMTciLCJhIjoiY203enY5MXRqMG8yNjJucTE5MnZsd2Q0cCJ9.c4sXLHAOM2_qQm2b1sQr6A
"@

Set-Content -Path "local.properties" -Value $localPropsContent

# Update build.gradle to hardcode Mapbox token
$buildGradlePath = "build.gradle"
$buildGradleContent = Get-Content -Path $buildGradlePath -Raw
$updatedBuildGradle = $buildGradleContent -replace "password = project.properties\['MAPBOX_DOWNLOADS_TOKEN'\] \?: """"", "password = ""pk.eyJ1IjoiYW5kcmV3c2ltMTciLCJhIjoiY203enY5MXRqMG8yNjJucTE5MnZsd2Q0cCJ9.c4sXLHAOM2_qQm2b1sQr6A"""
Set-Content -Path $buildGradlePath -Value $updatedBuildGradle

# Clean the build
Write-Host "Cleaning the build..."
& "$env:JAVA_HOME\bin\java" "-Dorg.gradle.appname=gradlew" -classpath "./gradle/wrapper/gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain clean

# Build the debug APK
Write-Host "Building debug APK..."
& "$env:JAVA_HOME\bin\java" "-Dorg.gradle.appname=gradlew" -classpath "./gradle/wrapper/gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain assembleDebug

Write-Host "Build script completed." 