#!/usr/bin/env pwsh
param(
    [switch] $BindAll
)

if ($BindAll) {
    & hugo server --buildDrafts --renderToMemory --bind 0.0.0.0
}
else {
    & hugo server --buildDrafts --renderToMemory
}
