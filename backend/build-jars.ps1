$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "==> Installing common-kafka-events"
Push-Location common-kafka-events
mvn -q -DskipTests install
Pop-Location

$services = @(
  "discovery-service",
  "config-service",
  "auth-service",
  "user-service",
  "task-service",
  "analytics-service",
  "optimization-service",
  "notification-service",
  "gateway-service"
)

foreach ($service in $services) {
  Write-Host "==> Packaging $service"
  Push-Location $service
  mvn -q -DskipTests package
  Pop-Location
}

Write-Host "All jars built. Next: docker compose up -d --build"
