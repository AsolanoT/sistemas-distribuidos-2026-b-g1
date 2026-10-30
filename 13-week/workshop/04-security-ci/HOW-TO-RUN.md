# Security checks - synkro-auth-api

## Story and acceptance criterion

- Story: HU-AUTH-17.
- Issue: https://github.com/code-corhuila/synkro-docs/issues/280
- STRIDE analysis: https://github.com/code-corhuila/synkro-docs/pull/277
- Criterion: the Auth authorization part of AC2.
- Endpoint: POST /api/v1/auth/register.

The test submits a valid RS256-signed SALESPERSON JWT while requesting
creation of an ADMIN. It expects 403 FORBIDDEN and verifies that Auth
does not call its lookup or persistence ports.

## What the test uses

The controller, security configuration, RS256 verifier, error handling
and registration use case come from synkro-auth-api.

Persistence and other unused collaborators are test doubles.
Keys, credentials and identifiers are generated for the test.

This is a MockMvc test of the Auth module. It does not start NGINX,
open an HTTP port or use PostgreSQL. It does not complete the full
Gateway/database acceptance criterion or the entire story.

## Requirements

- Java 21. The verified run used Java 21.0.12.
- Maven. The verified run used Maven 3.9.16.
- A separate local copy of the Auth source and its Maven dependencies.
- actionlint 1.7.12 and Gitleaks 8.30.1 for the additional local checks.

The commands below reuse the temporary verification copy already
created on this PC. They require no Git commands. On another machine,
set the variables to the corresponding local paths.

## Run locally from CMD

Use Windows Command Prompt (CMD). Run the following blocks in the same
terminal so the variables remain available.

### Configure this terminal

These settings apply only to the current terminal:

```bat
set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.12"
set "PATH=C:\Users\ASUS\.m2\wrapper\dists\apache-maven-3.9.16\56ba1f9f\bin;%JAVA_HOME%\bin;%PATH%"

set "CP4_WORKSHOP=C:\Users\ASUS\Desktop\EIGHTH SEMESTER 2026\02 SISTEMAS DISTRIBUIDOS\sistemas-distribuidos-2026-b-g1\13-week\workshop\04-security-ci"
set "CP4_REVIEW=C:\Users\ASUS\.codex\.chatgpt-projects\g-p-6aba90944db48191bf804d7733b52f76\tmp\cp4-review-20261030-1a7357619f024c629cfec3f265d595f6"
set "CP4_TOOLS=%CP4_REVIEW%\tools"

java -version
call mvn -version
```

CP4_REVIEW is the separate Auth copy, not the course fork or the team's
working checkout. Its root contains pom.xml and the Auth modules.

### Copy the current workshop test

```bat
copy /Y "%CP4_WORKSHOP%\SynkroAuthRegisterAuthorizationTest.java" "%CP4_REVIEW%\auth-app\src\test\java\co\edu\corhuila\synkro\auth\app\SynkroAuthRegisterAuthorizationTest.java"
```

### Execute the negative test

```bat
cd /d "%CP4_REVIEW%"
call mvn -o -B -ntp -pl auth-app -am "-Dtest=SynkroAuthRegisterAuthorizationTest" "-Dsurefire.failIfNoSpecifiedTests=false" clean test
```

The -o option reproduces the verified offline run using the dependencies
already cached on this PC. If Maven reports a missing dependency, remove
-o and rerun with internet access.

The CP8 verification used this Maven CMD entry point with the test
selection and build goals shown above. Its real output is recorded below.

The failIfNoSpecifiedTests setting lets prerequisite modules build
without containing this app test. It does not prove that the selected
test executed. Confirm both BUILD SUCCESS and the app report:

```bat
type "%CP4_REVIEW%\auth-app\target\surefire-reports\co.edu.corhuila.synkro.auth.app.SynkroAuthRegisterAuthorizationTest.txt"
```

The report must show one test, zero failures, zero errors and zero skipped
tests. A build with no executed test does not satisfy this check.

### Validate the workflow

```bat
"%CP4_TOOLS%\actionlint\actionlint.exe" -shellcheck= -pyflakes= "%CP4_WORKSHOP%\security.yml"
echo actionlint exit code: %ERRORLEVEL%
```

A successful actionlint run prints no diagnostics and returns 0.
The optional external ShellCheck and Pyflakes integrations are disabled;
this result covers actionlint's own workflow checks.

### Scan the workshop files for secrets

```bat
"%CP4_TOOLS%\gitleaks\gitleaks.exe" dir "%CP4_WORKSHOP%" --redact --no-banner --report-format json --report-path "%CP4_REVIEW%\gitleaks-report.json"
echo Gitleaks exit code: %ERRORLEVEL%
```

This command scans the workshop files only. It does not scan repository
history. The workflow proposal uses Gitleaks git mode for that separate
check when adopted by the team.

## Workflow proposal

security.yml remains in the workshop folder and is not automatically
executed by GitHub Actions from this location.

The workflow assumes it is adopted in synkro-auth-api:
1. Place the test in the auth-app test package shown above.
2. Place security.yml in .github/workflows/.
3. Review and run it through the team's normal PR process.

No adoption in the team's repository was performed during verification.

The dependency gate audits the actual Auth Maven reactor.
It uses NVD and a CVSS threshold of 7. NVD_API_KEY is optional and
must be supplied through repository secrets if configured.
The additional OSS Index analyzer is disabled.

A vulnerability finding or scanner failure must fail the gate;
it must not be reported as a clean scan.

## CP8 execution evidence

### Negative authorization test

- Date: 2026-10-30.
- Start time: 15:35:46, America/Bogota (UTC-05:00).
- Completion time: 15:36:34, America/Bogota (UTC-05:00).
- Java: 21.0.12.
- Maven: 3.9.16.
- Spring Boot: 3.5.0.
- Maven exit code: 0.
- Source: a separate copy of the existing local Auth source snapshot.
  All 98 selected POM and main-source/resource files matched the local
  Auth export before execution. The build compiled Auth's real modules.
- Git commit SHA: not recorded for this source export; no Git commands
  were executed during verification.
- The executed Java file matched the workshop file exactly.

The source-file manifest was recorded locally as relative paths and
SHA-256 values. Its SHA-256 identifies the inspected source snapshot:

```text
A2733F67C0D9C285EA346DDA3D2526A0215AD0DD8FACE74C4ECB5458AE50EA3E
```

SHA-256 of the Java test that was executed:

```text
AEEE4FEF55D1CC357DE46B89A719B6FCB470C64C36EF1094C1144A1BBD051A29
```

The following lines are excerpts from the actual console output:

```text
[INFO] Running co.edu.corhuila.synkro.auth.app.SynkroAuthRegisterAuthorizationTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 16.29 s -- in co.edu.corhuila.synkro.auth.app.SynkroAuthRegisterAuthorizationTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] synkro-auth-api .................................... SUCCESS [  0.392 s]
[INFO] auth-core .......................................... SUCCESS [  6.676 s]
[INFO] auth-adapters ...................................... SUCCESS [  3.366 s]
[INFO] auth-app ........................................... SUCCESS [ 34.236 s]
[INFO] BUILD SUCCESS
[INFO] Total time:  45.118 s
[INFO] Finished at: 2026-10-30T15:36:34-05:00
```

The successful assertions confirm a 403 FORBIDDEN response for the valid
SALESPERSON token and no calls to the lookup/persistence collaborators.
Gateway and PostgreSQL were not started.

The generated Surefire XML was checked separately: tests=1, failures=0,
errors=0 and skipped=0. Its executed test case was
`synkroAuthApi_postApiV1AuthRegister_salespersonGets403WithoutPersistence`.
This evidence satisfies CP8's module-run option and covers part of
HU-AUTH-17 AC2. AC5 still requires the integrated environment, and the
INVENTORY, SERVICE and replay cases remain outside this single test.

### Historical CP4 secret scan

Gitleaks 8.30.1 scanned the three workshop files during the original
CP4 verification at 13:45 on 2026-10-30 and returned exit code 0:

```text
1:45PM INF scanned ~12091 bytes (12.09 KB) in 22.9ms
1:45PM INF no leaks found
```

This historical result applies to the files inspected at that time.
Gitleaks was not rerun for CP8. Rerun it after editing the files;
repository history was not scanned.

### Checks still pending

- Full OWASP dependency vulnerability audit. The Maven plugin artifact
  13.0.0 was confirmed available, but no complete audit was executed.
- Actual GitHub Actions execution after adoption in the Auth repository.
- Gateway-to-Auth and PostgreSQL integration tests for the full story.
- Recording the source commit for a new run from a versioned checkout.

These pending checks must not be described as passed.

## CP8 YAML validation

The current security.yml was checked with actionlint 1.7.12 on
2026-10-30 at 15:36:14, America/Bogota. The command is in the local
instructions above. It returned exit code 0 and printed no diagnostics.
The captured validation result was:

```json
{"ExitCode":0,"Diagnostics":"","Validated":"2026-10-30T15:36:14-05:00"}
```

SHA-256 of the validated security.yml:

```text
BF4FF721FF778FD99C3383CFA7C6EF0D58564CD86FB8B0B2A34795593D8EEBB5
```

Actionlint's own syntax, structure and workflow checks passed.
External ShellCheck and Pyflakes integrations were disabled for this
run with -shellcheck= and -pyflakes=.

A valid YAML file and a successful module test do not demonstrate that
all three jobs have passed in GitHub Actions.

