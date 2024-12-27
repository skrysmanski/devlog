---
title: PowerShell Basics and Snippets
date: 2020-01-18
topics:
- powershell
---

## Specifying Value for Switch Parameter

```powershell
.\script.ps1 -SwitchParam:$false
```

## Required Parameters

```powershell
param(
    [Parameter(Mandatory=$True)]
    [string] $ProjectName
)
```

## Basic Objects

```powershell
$list = @(
    'item1'
    'item2'
)
```

```powershell
$obj = @{
    Property1 = 'one'
    Property2 = 'two'
    Property3 = 'three'
}
```

### 1-Element List

```powershell
$list = @(, $onlyItem)
```

## String Interpolation

```powershell
$x = "Some $my_var here" # simple
$y = "The length is: $($my_str.Length)" # expression
$z = "Variable with non-standard characters: ${env:PROGRAM_FILES(x86)}" # special
```

## Variables with Non-Standard Characters

```powershell
${,,,} = 5 # Variable named ,,,
```

## Multi-line Strings

```powershell
$str1 = @"
This string
is multi-line.
"@

$str2 = @'
This string
is multi-line.
'@
```

## Number + KB, MB, GB, TB or PB

Powershell understands standard notation for kilobytes, megabytes, gigabytes, terabytes and even petabytes.

```powershell
1KB, 1MB, 1GB, 1TB, 1PB
```

## Require Running Elevated

```powershell
#Requires -RunAsAdministrator
```

## Change Working Directory

```powershell
try {
    Push-Location
    Set-Location $newDir
}
finally {
    Pop-Location
}
```

## File Reading and Writing

```powershell
# Reading
$contents = Get-Content $sourceFile -Encoding 'utf8'
```

```powershell
# Writing
# WARN: BOM with PowerShell 5; no BOM with PowerShell Core
$someString | Out-File $destFile -Encoding 'utf8' -NoNewLine
```

## Not

You can use `-Not` or simply `!`.

```powershell
if (!$a) {
    Write-Host '$a is null'
}
```

## Block Comment

```powershell
<#This is
a commented
block#>
```

## Static Method of .NET Type

```powershell
[string]::IsNullOrWhiteSpace($someString)
```

## Create .NET Type

```powershell
[System.Drawing.SolidBrush]::new($theColor)
```

## Module Loading

**Note:** When using modules, you should also use `Unload-Modules.ps1` from this repository.

```powershell
Import-Module "$PSScriptRoot/MyModule.psm1" -DisableNameChecking
```

## Read Registry Value

```powershell
Get-ItemPropertyValue 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion' 'ProgramFilesDir'
```

## Approved Verbs

<https://docs.microsoft.com/en-us/powershell/developer/cmdlet/approved-verbs-for-windows-powershell-commands>

## PowerShell Version

```powershell
$PSVersionTable.PSVersion
```
