import os
import django
import json
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from evaluations.models import TestTemplate

schema = {
  "title": "Cuestionario de Salud General (GHQ-12)",
  "type": "object",
  "required": ["sleep", "stress"],
  "properties": {
    "sleep": {
      "type": "string",
      "title": "¿Has perdido mucho sueño por tus preocupaciones?",
      "enum": ["No, en absoluto", "No más que de costumbre", "Un poco más que de costumbre", "Mucho más que de costumbre"]
    },
    "stress": {
      "type": "string",
      "title": "¿Te has sentido constantemente agobiado y en tensión?",
      "enum": ["No, en absoluto", "No más que de costumbre", "Un poco más que de costumbre", "Mucho más que de costumbre"]
    },
    "notes": {
      "type": "string",
      "title": "Observaciones adicionales",
      "maxLength": 500
    }
  }
}

TestTemplate.objects.get_or_create(
    name="GHQ-12 Screening",
    defaults={
        "description": "Cuestionario breve para evaluar bienestar psicológico.",
        "schema": schema
    }
)
print("Dummy test template created!")
