#!/usr/bin/env pwsh

Push-Location './_utils'
& npm install
Pop-Location

Push-Location './assets'
& npm install
Pop-Location
