param(
    [ValidateSet("test", "package", "run", "stub")][string]$Task = "test",
    [switch]$Offline
)
$ErrorActionPreference = "Stop"
if (-not $env:JAVA_HOME) {
    $jdk = Get-ChildItem -LiteralPath "$env:ProgramFiles\Java" -Directory -Filter "jdk-21*" -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending | Select-Object -First 1
    if (-not $jdk) { throw "Install JDK 21 and set JAVA_HOME." }
    $env:JAVA_HOME = $jdk.FullName
}
if ($Task -eq "stub") {
    & (Join-Path $env:JAVA_HOME "bin\java.exe") (Join-Path $PSScriptRoot "src/test/java/co/edu/corhuila/synkro/workflow/fixture/ProductsStub.java")
    exit $LASTEXITCODE
}
if ($Task -eq "run") {
    $jar = Join-Path $PSScriptRoot "target\synkro-workflow-0.1.0-workshop.jar"
    if (-not (Test-Path -LiteralPath $jar)) { throw "Run .\run.ps1 package first." }
    & (Join-Path $env:JAVA_HOME "bin\java.exe") -jar $jar
    exit $LASTEXITCODE
}
$maven = Get-Command mvn.cmd -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1
if (-not $maven) {
    $cache = Join-Path $env:USERPROFILE ".m2\wrapper\dists"
    $maven = Get-ChildItem -LiteralPath $cache -Recurse -Filter "mvn.cmd" -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty FullName -First 1
}
if (-not $maven) { throw "Install Maven 3.9+ or populate the Maven wrapper cache." }
$arguments = @("-f", (Join-Path $PSScriptRoot "pom.xml"))
if ($Offline) { $arguments += "-o" }
& $maven @arguments $Task
exit $LASTEXITCODE