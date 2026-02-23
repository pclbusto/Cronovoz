from django.contrib import admin
from .models import TestTemplate, Evaluation

@admin.register(TestTemplate)
class TestTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('patient', 'test_template', 'user', 'date')
    list_filter = ('test_template', 'date', 'user')
    search_fields = ('patient__first_name', 'patient__last_name', 'patient__dni')
