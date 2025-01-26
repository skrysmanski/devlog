#!/usr/bin/env pwsh

Push-Location './_utils'
& node beautify.js '../../../public'
Pop-Location
