param([int]$FrontendPort = 43127)

$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent $PSScriptRoot
$uiRoot = Join-Path $workspace 'gestao-acoes-ui'
$project = 'atlas-auth-e2e-' + ([guid]::NewGuid().ToString('N').Substring(0, 8))
$stub = $null

function Assert-NativeSuccess([string]$Operation) {
    if ($LASTEXITCODE -ne 0) {
        throw "$Operation failed with exit code $LASTEXITCODE"
    }
}

$env:DB_NAME = 'gestao_acoes'
$env:DB_USERNAME = 'gestao_acoes'
$env:DB_PASSWORD = [guid]::NewGuid().ToString('N')
$env:BRAPI_TOKEN = 'runtime-' + [guid]::NewGuid().ToString('N')
$env:TWELVEDATA_API_KEY = 'runtime-' + [guid]::NewGuid().ToString('N')
$env:ADMIN_INITIAL_USERNAME = 'atlas-e2e-' + [guid]::NewGuid().ToString('N').Substring(0, 8)
$env:ADMIN_INITIAL_PASSWORD = 'Atlas-E2E-' + [guid]::NewGuid().ToString('N') + '!'
$env:FRONTEND_PORT = [string]$FrontendPort
$env:INTEGRATIONS_BRAPI_URL = 'http://host.docker.internal:9090/brapi/api'
$env:INTEGRATIONS_TWELVEDATA_URL = 'http://host.docker.internal:9090/twelvedata'
$env:INTEGRATIONS_BRASILAPI_URL = 'http://host.docker.internal:9090/brasilapi/cnpj/v1'
$env:INTEGRATIONS_VIACEP_URL = 'http://host.docker.internal:9090/viacep'
$env:E2E_CONTAINERIZED = 'true'
$env:E2E_BASE_URL = "http://127.0.0.1:$FrontendPort"
$env:E2E_ADMIN_USERNAME = $env:ADMIN_INITIAL_USERNAME
$env:E2E_ADMIN_PASSWORD = $env:ADMIN_INITIAL_PASSWORD

try {
    docker compose -p $project config --quiet
    Assert-NativeSuccess 'docker compose config'
    $stub = Start-Process node -ArgumentList 'e2e/provider-stub.cjs' -WorkingDirectory $uiRoot -WindowStyle Hidden -PassThru
    docker compose -p $project up -d --build --wait
    Assert-NativeSuccess 'docker compose up'
    docker compose -p $project ps
    Assert-NativeSuccess 'docker compose ps'
    Push-Location $uiRoot
    try {
        npm.cmd run e2e
        Assert-NativeSuccess 'containerized Playwright E2E'
    } finally { Pop-Location }
} finally {
    if ($stub -and -not $stub.HasExited) { Stop-Process -Id $stub.Id }
    docker compose -p $project down --volumes --remove-orphans
    Remove-Item Env:E2E_ADMIN_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:ADMIN_INITIAL_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:DB_PASSWORD -ErrorAction SilentlyContinue
}
