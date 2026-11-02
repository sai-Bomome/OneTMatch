$ErrorActionPreference='Stop'
$workbenchRoot=$PSScriptRoot
& python (Join-Path $workbenchRoot 'tools/icon_catalog.py')
$workbenchUrl='http://127.0.0.1:5188/'
try {$null=Invoke-WebRequest -Uri $workbenchUrl -UseBasicParsing -TimeoutSec 2; Start-Process $workbenchUrl; exit} catch {}
Start-Process python -ArgumentList @('server.py','--port','5188') -WorkingDirectory $workbenchRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $workbenchRoot 'server.log') -RedirectStandardError (Join-Path $workbenchRoot 'server-error.log')
for($attempt=0;$attempt -lt 40;$attempt++) {try {$null=Invoke-WebRequest -Uri $workbenchUrl -UseBasicParsing -TimeoutSec 1; Start-Process $workbenchUrl; exit} catch {Start-Sleep -Milliseconds 250}}
throw 'OneT Match server did not start. See server-error.log.'
