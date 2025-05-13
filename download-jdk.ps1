$DownloadPath = "$env:USERPROFILE\Downloads"
$JDKUrl = "https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.zip"
$JDKZip = "$DownloadPath\openjdk-17.zip"
$JDKExtractPath = "$env:USERPROFILE\jdk-17"

# Create the JDK directory if it doesn't exist
if (!(Test-Path -Path $JDKExtractPath)) {
    New-Item -ItemType Directory -Path $JDKExtractPath -Force
}

# Download the JDK if not already downloaded
if (!(Test-Path -Path $JDKZip)) {
    Write-Host "Downloading OpenJDK 17..."
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $JDKUrl -OutFile $JDKZip
}

# Extract the JDK
Write-Host "Extracting OpenJDK 17..."
Expand-Archive -Path $JDKZip -DestinationPath $env:USERPROFILE -Force

# Set environment variables
[Environment]::SetEnvironmentVariable("JAVA_HOME", "$JDKExtractPath", "User")
[Environment]::SetEnvironmentVariable("Path", "$env:Path;$JDKExtractPath\bin", "User")

# Update local.properties
$localPropsPath = ".\android\local.properties"
$localPropsContent = Get-Content $localPropsPath -Raw
$localPropsContent = $localPropsContent -replace "C:\\Program Files\\Java\\jdk-17", "$JDKExtractPath"
$localPropsContent | Set-Content $localPropsPath

Write-Host "OpenJDK 17 has been installed and configured."
Write-Host "Please restart your terminal for the environment variables to take effect." 