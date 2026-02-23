# Cronovoz 🎙️📅

**Tu consultorio, sincronizado.**

Cronovoz es una plataforma integral de gestión para fonoaudiología diseñada a medida. Fusiona la gestión de turnos de Google Calendar con un sistema robusto de historias clínicas multimedia. Permite gestionar pacientes, redactar evoluciones y, crucialmente, **grabar y archivar audios** de las sesiones para monitorear el progreso vocal, todo sincronizado entre una aplicación de escritorio potente y un acceso web móvil.

---

## 🚀 Características Principales

* **Integración Bidireccional con Google Calendar:**
    * Visualización de agenda diaria sincronizada.
    * Vinculación automática de turnos con fichas de pacientes.
* **Gestión de Historia Clínica (Evoluciones):**
    * Registro de notas por sesión.
    * **Grabación de Audio:** Captura de ejercicios fonéticos directamente desde la App.
    * Historial cronológico de avances.
* **Arquitectura Híbrida (Escritorio + Web):**
    * **Escritorio (PC):** App nativa rápida para el trabajo intensivo (Flet).
    * **Móvil (Web):** Interfaz responsive para consultas rápidas desde el celular (Django).
* **Gestión de Pacientes:** Base de datos completa con datos personales, obra social y contactos.
* **Sistema de Actualización Automática:** El cliente de escritorio detecta mejoras en el repositorio y se actualiza solo.

---

## 🛠️ Arquitectura Técnica

El sistema utiliza una arquitectura **Cliente-Servidor centralizada** alojada en la nube para garantizar la persistencia de datos y el acceso desde múltiples dispositivos.

### 1. El Núcleo (Backend & Web) ☁️
* **Hosting:** PythonAnywhere (Producción).
* **Framework:** Django + Django REST Framework (DRF).
* **Base de Datos:** SQLite (Persistente en servidor).
* **Función:**
    * Expone una API REST para la aplicación de escritorio.
    * Sirve la interfaz web HTML/Bootstrap para el móvil.
    * Almacena los archivos de audio y la base de datos `db.sqlite3`.

### 2. El Cliente de Escritorio (Desktop App) 💻
* **Tecnología:** Python + Flet (Framework de UI).
* **Función:**
    * Interfaz rica para Windows.
    * Grabación de audio usando librerías nativas (`sounddevice`).
    * Comunicación con el Backend vía `requests` (API REST).

---

## 📂 Estructura del Proyecto

```text
cronovoz/
│
├── backend/                 # Proyecto Django (Nube)
│   ├── manage.py
│   ├── config/              # Configuración (settings.py, urls.py)
│   ├── gestion/             # App principal (Modelos, Vistas, Serializers)
│   └── db.sqlite3           # Base de datos (La Verdad Absoluta)
│
├── desktop_app/             # Cliente Flet (Escritorio)
│   ├── main.py              # Punto de entrada de la GUI
│   ├── updater.py           # Lógica de auto-update desde GitHub
│   └── assets/              # Iconos y recursos
│
├── requirements.txt         # Dependencias globales
└── README.md                # Este archivo
