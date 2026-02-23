from rest_framework import serializers
from .models import TestTemplate, Evaluation
from patients.serializers import PatientSerializer

class TestTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestTemplate
        fields = '__all__'

class EvaluationSerializer(serializers.ModelSerializer):
    # We can include a nested patient serializer for read operations if needed, 
    # but for writes we usually just want the ID. Let's keep it simple for now.
    class Meta:
        model = Evaluation
        fields = '__all__'
        read_only_fields = ('user',)
