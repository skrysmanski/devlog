---
title: PowerShell Application Frame
oldContentWarning: false
topics:
- powershell
---

```powershell
#!/usr/bin/env pwsh

# This file contains a basic structure for a PowerShell application.

param(
    [Parameter(Mandatory=$True)]
    [string]
    $MandatoryParam,

    [string]
    $OptionalParam = '',

    [switch]
    $SwitchParam
)

# Stop on every error
$script:ErrorActionPreference = 'Stop'

try {
    #
    # Application code here
    #
}
catch {
    function LogError([string] $exception) {
        Write-Host -ForegroundColor Red $exception
    }

    # Type of $_: System.Management.Automation.ErrorRecord

    # NOTE: According to https://docs.microsoft.com/en-us/powershell/scripting/developer/cmdlet/windows-powershell-error-records
    #   we should always use '$_.ErrorDetails.Message' instead of '$_.Exception.Message' for displaying the message.
    #   In fact, there are cases where '$_.ErrorDetails.Message' actually contains more/better information than '$_.Exception.Message'.
    if ($_.ErrorDetails -And $_.ErrorDetails.Message) {
        $unhandledExceptionMessage = $_.ErrorDetails.Message
    }
    elseif ($_.Exception -And $_.Exception.Message) {
        $unhandledExceptionMessage = $_.Exception.Message
    }
    else {
        $unhandledExceptionMessage = 'Could not determine error message from ErrorRecord'
    }

    # IMPORTANT: We compare type names(!) here - not actual types. This is important because - for example -
    #   the type 'Microsoft.PowerShell.Commands.WriteErrorException' is not always available (most likely
    #   when Write-Error has never been called).
    if ($_.Exception.GetType().FullName -eq 'Microsoft.PowerShell.Commands.WriteErrorException') {
        # Print error messages (without stacktrace)
        LogError $unhandledExceptionMessage
    }
    else {
        # Print proper exception message (including stack trace)
        # NOTE: We can't create a catch block for "RuntimeException" as every exception
        #   seems to be interpreted as RuntimeException.
        if ($_.Exception.GetType().FullName -eq 'System.Management.Automation.RuntimeException') {
            LogError "$unhandledExceptionMessage$([Environment]::NewLine)$($_.ScriptStackTrace)"
        }
        else {
            LogError "$($_.Exception.GetType().Name): $unhandledExceptionMessage$([Environment]::NewLine)$($_.ScriptStackTrace)"
        }
    }

    exit 1
}
```
