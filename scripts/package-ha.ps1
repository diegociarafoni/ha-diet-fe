param(
  [string]$DeployPath = ''
)

Write-Host "Packaging HA Diet frontend..."

# 1) Build
Write-Host "Running npm run build..."
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed. Aborting."; exit $LASTEXITCODE }

# 2) Create ZIP of dist
$dist = Join-Path -Path (Get-Location) -ChildPath 'dist/ha-diet-fe'
$zip = Join-Path -Path (Get-Location) -ChildPath 'dist/ha-diet-fe.zip'
if (Test-Path $zip) { Remove-Item $zip -Force }
Write-Host "Creating $zip..."
Compress-Archive -Path (Join-Path $dist '*') -DestinationPath $zip -Force

Write-Host "Packaged to $zip"

if ($DeployPath -ne '') {
  Write-Host "Copying files to $DeployPath ..."
  if (-not (Test-Path $DeployPath)) { New-Item -ItemType Directory -Path $DeployPath -Force | Out-Null }
  Copy-Item -Path (Join-Path $dist '*') -Destination $DeployPath -Recurse -Force
  Write-Host "Copied build files to $DeployPath"
}

Write-Host "Done."
