@ECHO OFF
IF "%1" == "/L" (
@ECHO ember server --environment=development-loc
ember server --environment=development-loc
) ELSE (
@ECHO ember server
ember server
)