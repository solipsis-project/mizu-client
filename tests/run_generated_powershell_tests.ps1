$TestsDir = Join-Path $PSScriptRoot "generated"
Get-ChildItem -Path $TestsDir -Recurse -Include *.ps1 | Foreach-Object {
  & $_
  if ($LASTEXITCODE -gt 0) {
      exit $LASTEXITCODE
  }
}