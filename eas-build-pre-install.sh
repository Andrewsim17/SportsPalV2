#!/bin/bash

# This script runs before dependencies are installed in the EAS Build environment

# Set environment variables to use relative paths
export EXPO_USE_COMMUNITY_AUTOLINKING=1
export GRADLE_OPTS="-Dorg.gradle.project.android.disableAutomaticComponentCreation=true"

# Log the environment
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Yarn version: $(yarn --version || echo 'not installed')"
echo "EXPO_USE_COMMUNITY_AUTOLINKING: $EXPO_USE_COMMUNITY_AUTOLINKING"

# Fix any path issues in autolinking files
if [ -d "android/build/generated/autolinking" ]; then
  echo "Fixing autolinking paths..."
  find android/build/generated/autolinking -type f -name "*.json" -exec sed -i 's|C:/Users/User/SportsPalV2/|./|g' {} \;
  find android/build/generated/autolinking -type f -name "*.java" -exec sed -i 's|C:/Users/User/SportsPalV2/|./|g' {} \;
  find android/build/generated/autolinking -type f -name "*.cmake" -exec sed -i 's|C:/Users/User/SportsPalV2/|./|g' {} \;
  echo "Path fixing completed."
fi

echo "Pre-install script completed." 