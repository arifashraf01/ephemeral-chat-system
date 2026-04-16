$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) { return }
        $parts = $line.Split('=', 2)
        if ($parts.Length -eq 2) {
            [System.Environment]::SetEnvironmentVariable($parts[0], $parts[1], "Process")
        }
    }
}

Set-Location $PSScriptRoot
.\mvnw.cmd spring-boot:run
