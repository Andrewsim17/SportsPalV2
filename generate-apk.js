// Script to generate an APK locally
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting APK generation process...');

try {
  // Clean the project
  console.log('Cleaning project...');
  execSync('npx expo prebuild --clean', { stdio: 'inherit' });

  // Regenerate native code
  console.log('Regenerating native code...');
  execSync('npx expo prebuild -p android', { stdio: 'inherit' });

  // Navigate to android folder
  process.chdir('./android');

  // Build APK
  console.log('Building APK...');
  execSync('gradlew.bat assembleRelease', { stdio: 'inherit' });

  // Check if APK was created
  const apkPath = path.join(process.cwd(), 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
  
  if (fs.existsSync(apkPath)) {
    console.log(`\nAPK successfully generated at: ${apkPath}`);
  } else {
    console.error('APK not found at expected location');
  }
} catch (error) {
  console.error('Error generating APK:', error);
  process.exit(1);
} 