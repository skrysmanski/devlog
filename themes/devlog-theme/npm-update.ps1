#!/usr/bin/env pwsh

Push-Location './_utils'
& npm update --save
Pop-Location

Push-Location './assets'
& npm update --save
Pop-Location
