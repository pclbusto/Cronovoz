@echo off
setlocal

:: Obtener el directorio donde se encuentra este script
set "SCRIPT_DIR=%~dp0"

:: Navegar al directorio de la aplicación de escritorio
cd /d "%SCRIPT_DIR%desktop_app"

:: Ejecutar la aplicación usando el entorno virtual
:: Se asume que el venv está formateado para Windows (Scripts\python.exe)
if exist "%SCRIPT_DIR%.venv\Scripts\python.exe" (
    "%SCRIPT_DIR%.venv\Scripts\python.exe" main.py
) else (
    :: Fallback por si acaso se creó estilo linux o diferente
    echo No se encontro .venv\Scripts\python.exe, probando ruta alternativa...
    "%SCRIPT_DIR%.venv\bin\python" main.py
)

pause
