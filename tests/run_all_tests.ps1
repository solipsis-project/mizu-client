cross-env NODE_OPTIONS=--experimental-vm-modules jest
node dist/build_documentation_tests.js
powershell tests/run_generated_powershell_tests.ps1