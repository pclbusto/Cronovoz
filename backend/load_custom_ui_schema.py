import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from evaluations.models import TestTemplate

ui_schema = {
    "posicion_cabeza": {
        "ui:widget": "checkboxes",
        "ui:options": { "inline": True },
        "ui:classNames": "fila-fono"
    },
    "posicion_hombros": {
        "ui:widget": "checkboxes",
        "ui:options": { "inline": True },
        "ui:classNames": "fila-fono"
    },
    "curvatura_columna": {
        "ui:widget": "radio",
        "ui:options": { "inline": True },
        "ui:classNames": "fila-fono"
    },
    "patron_facial_vertical": {
        "ui:widget": "radio",
        "ui:options": { "inline": True },
        "ui:classNames": "fila-fono"
    },
    "medidas_tercios": {
        "ui:classNames": "fila-fono",
        "superior": { "ui:classNames": "inline-field" },
        "medio": { "ui:classNames": "inline-field" },
        "inferior": { "ui:classNames": "inline-field" }
    },
    "patron_facial_sagital": {
        "ui:widget": "radio",
        "ui:options": { "inline": True },
        "ui:classNames": "fila-fono"
    },
    "narinas": {
        "ui:widget": "radio",
        "ui:options": { "inline": True },
        "ui:classNames": "fila-fono"
    },
    "angulo_nasolabial": {
        "ui:widget": "radio",
        "ui:options": { "inline": True },
        "ui:classNames": "fila-fono"
    },
    "competencia_labial": {
        "ui:widget": "radio",
        "ui:options": { "inline": True },
        "ui:classNames": "fila-fono"
    },
    "labio_superior": {
        "ui:classNames": "fila-fono"
    },
    "labio_inferior": {
        "ui:classNames": "fila-fono"
    },
    "musculo_mentoniano": {
        "ui:widget": "radio",
        "ui:options": { "inline": True },
        "ui:classNames": "fila-fono"
    },
    "postura_mandibular": {
        "ui:widget": "checkboxes",
        "ui:options": { "inline": True },
        "ui:classNames": "fila-fono"
    },
    "atm_caracteristicas": {
        "ui:widget": "checkboxes",
        "ui:options": { "inline": True },
        "ui:classNames": "fila-fono"
    }
}

try:
    template = TestTemplate.objects.get(name="Registro Postural y Extraoral")
    template.ui_schema = ui_schema
    template.save()
    print("SUCCESS: Full UI Schema applied successfully.")
except Exception as e:
    print(f"ERROR: {e}")
