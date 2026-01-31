#!/bin/bash

# Obtener el directorio donde se encuentra este script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Navegar al directorio de la aplicación de escritorio
cd "$SCRIPT_DIR/desktop_app"

# Forzar renderizado por software para evitar pantalla gris/negra en algunos sistemas Linux
export LIBGL_ALWAYS_SOFTWARE=1
# Forzar backend X11 por si hay conflictos con Wayland
export GDK_BACKEND=x11

# Ejecutar la aplicación usando el entorno virtual
"$SCRIPT_DIR/.venv/bin/python" main.py
