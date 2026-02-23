import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from evaluations.models import TestTemplate

# For arrays with string enums, "checkboxes" widget makes them multi-select boxes.
# For standard string enums, "radio" widget makes them radio buttons.
ui_schema = {
  "posicion_cabeza": {
    "ui:widget": "checkboxes"
  },
  "posicion_hombros": {
    "ui:widget": "checkboxes"
  },
  "postura_mandibular": {
    "ui:widget": "checkboxes"
  },
  "atm_caracteristicas": {
    "ui:widget": "checkboxes"
  }
}

try:
    template = TestTemplate.objects.get(name="Registro Postural y Extraoral")
    template.ui_schema = ui_schema
    template.save()
    print("SUCCESS: UI Schema added to the test template.")
except Exception as e:
    print(f"ERROR: {e}")
