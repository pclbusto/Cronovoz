from django.db import models
from django.conf import settings
from patients.models import Patient

class TestTemplate(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    schema = models.JSONField(help_text="JSON Schema defining the UI form")
    ui_schema = models.JSONField(default=dict, blank=True, help_text="UI Schema defining form layout and widgets")
    
    def __str__(self):
        return self.name

class Evaluation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='evaluations')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='evaluations')
    test_template = models.ForeignKey(TestTemplate, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    results = models.JSONField(help_text="JSON containing the test results matching the schema")

    def __str__(self):
        return f"{self.test_template.name} for {self.patient.last_name} on {self.date.strftime('%Y-%m-%d')}"
