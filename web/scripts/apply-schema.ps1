# Apply schema.sql to Supabase via Management API
param(
  [string]$ProjectRef = "yyufaaxmpoppnmcbypvf",
  [string]$Token = $env:SUPABASE_ACCESS_TOKEN
)

if (-not $Token) {
  Write-Error "SUPABASE_ACCESS_TOKEN required"
  exit 1
}

$schemaPath = Join-Path $PSScriptRoot "..\supabase\schema.sql"
$sql = Get-Content $schemaPath -Raw

$body = @{ query = $sql } | ConvertTo-Json -Compress
$bodyFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($bodyFile, $body, [System.Text.UTF8Encoding]::new($false))

try {
  $response = curl.exe -s -X POST "https://api.supabase.com/v1/projects/$ProjectRef/database/query" `
    -H "Authorization: Bearer $Token" `
    -H "Content-Type: application/json" `
    --data-binary "@$bodyFile"
  Write-Output $response
} finally {
  Remove-Item $bodyFile -Force -ErrorAction SilentlyContinue
}
