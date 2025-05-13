# Build script for Android with JDK 17
Write-Host "Setting up environment for Android build with JDK 17..."

# Set JAVA_HOME to JDK 17
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Verify Java version
Write-Host "Using Java version:"
java -version

# Stop any running Gradle daemons
Write-Host "Stopping Gradle daemons..."
./gradlew --stop

# Build the debug APK
Write-Host "Building debug APK..."
java -version
./gradlew --no-daemon clean assembleDebug

Write-Host "Build script completed."
