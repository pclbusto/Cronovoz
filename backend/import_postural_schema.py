import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from evaluations.models import TestTemplate

raw_schema = """
{
  "title": "Registro Postural y Extraoral",
  "type": "object",
  "properties": {
    "posicion_cabeza": {
      "type": "array",
      "title": "Posición de Cabeza",
      "items": {
        "type": "string",
        "enum": [
          "Adecuada",
          "Rotada Derecha",
          "Rotada Izquierda",
          "Inclinada Derecha",
          "Inclinada Izquierda",
          "Antepulsión",
          "Retropulsión",
          "Flexión",
          "Extensión"
        ]
      },
      "uniqueItems": true
    },
    "posicion_hombros": {
      "type": "array",
      "title": "Posición de Hombros",
      "items": {
        "type": "string",
        "enum": [
          "Adecuada",
          "Elevación Derecha",
          "Elevación Izquierda",
          "Antepulsión Derecha",
          "Antepulsión Izquierda",
          "Retropulsión Derecha",
          "Retropulsión Izquierda"
        ]
      },
      "uniqueItems": true
    },
    "curvatura_columna": {
      "type": "string",
      "title": "Curvatura de la Columna",
      "enum": [
        "Normal",
        "Xifótica",
        "Lordótica"
      ]
    },
    "patron_facial_vertical": {
      "type": "string",
      "title": "Patrón Facial Vertical",
      "enum": [
        "Mesofacial",
        "Braquifacial",
        "Dolicofacial"
      ]
    },
    "medidas_tercios": {
      "type": "object",
      "title": "Medidas de Tercios",
      "properties": {
        "superior": {
          "type": "string",
          "title": "Superior"
        },
        "medio": {
          "type": "string",
          "title": "Medio"
        },
        "inferior": {
          "type": "string",
          "title": "Inferior"
        }
      }
    },
    "patron_facial_sagital": {
      "type": "string",
      "title": "Patrón Facial Sagital",
      "enum": [
        "Recto",
        "Cóncavo",
        "Convexo"
      ]
    },
    "narinas": {
      "type": "string",
      "title": "Narinas",
      "enum": [
        "Adecuadas",
        "Asimétricas",
        "Estrechas"
      ]
    },
    "angulo_nasolabial": {
      "type": "string",
      "title": "Ángulo Nasolabial",
      "enum": [
        "90°",
        "Mayor a 90°",
        "Menor a 90°"
      ]
    },
    "competencia_labial": {
      "type": "string",
      "title": "Competencia Labial",
      "enum": [
        "Competente",
        "Incompetente",
        "Mixta"
      ]
    },
    "labio_superior": {
      "type": "object",
      "title": "Labio Superior",
      "properties": {
        "aspecto": {
          "type": "string",
          "title": "Aspecto"
        },
        "tono": {
          "type": "string",
          "title": "Tono"
        },
        "movilidad": {
          "type": "string",
          "title": "Movilidad"
        }
      }
    },
    "labio_inferior": {
      "type": "object",
      "title": "Labio Inferior",
      "properties": {
        "aspecto": {
          "type": "string",
          "title": "Aspecto"
        },
        "tono": {
          "type": "string",
          "title": "Tono"
        },
        "movilidad": {
          "type": "string",
          "title": "Movilidad"
        }
      }
    },
    "musculo_mentoniano": {
      "type": "string",
      "title": "Músculo Mentoniano",
      "enum": [
        "Normofunción",
        "Hiperfunción",
        "Hipofunción"
      ]
    },
    "postura_mandibular": {
      "type": "array",
      "title": "Postura Mandibular",
      "items": {
        "type": "string",
        "enum": [
          "Descendida",
          "Elevada",
          "Desviada Derecha",
          "Desviada Izquierda"
        ]
      },
      "uniqueItems": true
    },
    "atm_caracteristicas": {
      "type": "array",
      "title": "ATM Características",
      "items": {
        "type": "string",
        "enum": [
          "Dolor",
          "Chasquidos",
          "Bloqueo de apertura máx."
        ]
      },
      "uniqueItems": true
    }
  }
}
"""

try:
    schema = json.loads(raw_schema)
    TestTemplate.objects.get_or_create(
        name="Registro Postural y Extraoral",
        defaults={
            "description": "Evaluación fonoaudiológica de postura y estructuras extraorales.",
            "schema": schema
        }
    )
    print("SUCCESS: JSON is valid and was saved to the database.")
except json.JSONDecodeError as e:
    print(f"ERROR: Invalid JSON structure: {e}")
except Exception as e:
    print(f"ERROR: {e}")

