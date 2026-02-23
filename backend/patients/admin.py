from django.contrib import admin
from .models import Patient

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'dni', 'user', 'created_at')
    search_fields = ('first_name', 'last_name', 'dni', 'email')
    list_filter = ('created_at', 'user')
