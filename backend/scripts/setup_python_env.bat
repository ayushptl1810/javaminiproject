@echo off
REM Setup script for Python report generator environment (Windows)

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set VENV_DIR=%SCRIPT_DIR%venv
set PYTHON_CMD=python

echo Setting up Python environment for SubSentry report generator...
echo Script directory: %SCRIPT_DIR%

REM Check if python is available
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: python is not installed or not in PATH
    echo Please install Python 3.8+ and add it to PATH
    exit /b 1
)

REM Check Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo Found Python version: %PYTHON_VERSION%

REM Create virtual environment if it doesn't exist
if not exist "%VENV_DIR%" (
    echo Creating virtual environment...
    %PYTHON_CMD% -m venv "%VENV_DIR%"
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Error: Failed to create virtual environment
        exit /b 1
    )
    echo ✅ Virtual environment created at %VENV_DIR%
) else (
    echo Virtual environment already exists at %VENV_DIR%
)

REM Activate virtual environment
echo Activating virtual environment...
call "%VENV_DIR%\Scripts\activate.bat"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Failed to activate virtual environment
    exit /b 1
)

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip --quiet

REM Install dependencies
echo Installing Python dependencies...
if not exist "%SCRIPT_DIR%requirements.txt" (
    echo ❌ Error: requirements.txt not found at %SCRIPT_DIR%requirements.txt
    exit /b 1
)

pip install -r "%SCRIPT_DIR%requirements.txt"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Failed to install dependencies
    exit /b 1
)

REM Verify installation
echo Verifying installation...
python -c "import pandas, matplotlib, mysql.connector, reportlab; print('✅ All dependencies installed successfully')" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Some dependencies failed to install
    exit /b 1
)

echo.
echo ✅ Python environment setup complete!
echo.
echo Python interpreter location:
echo   %VENV_DIR%\Scripts\python.exe
echo.
echo The Java backend will auto-detect this venv Python.
echo No additional configuration needed if running from the backend directory.
echo.
echo To activate the venv manually:
echo   %VENV_DIR%\Scripts\activate.bat
echo.
echo To deactivate:
echo   deactivate

endlocal

