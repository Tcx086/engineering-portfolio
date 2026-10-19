param([Parameter(Mandatory=$true)][string]$ConfigPath)
$ErrorActionPreference = 'Stop'
$resolvedConfig = (Resolve-Path -LiteralPath $ConfigPath).Path
$repository = Split-Path -Parent $PSScriptRoot
$publisher = Join-Path $PSScriptRoot 'exporter.mjs'
$node = (Get-Command node -ErrorAction Stop).Source
$name = 'TomChen-Portfolio-Telemetry'
if (Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue) { throw 'Publisher task already exists; inspect it before updating.' }
$action = New-ScheduledTaskAction -Execute $node -Argument ('"' + $publisher + '" --once --config "' + $resolvedConfig + '"') -WorkingDirectory $repository
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1)
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Seconds 20) -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $name -Action $action -Trigger $trigger -Settings $settings -Principal $principal | Select-Object TaskName,State
