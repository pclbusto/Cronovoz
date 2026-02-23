from rest_framework import serializers
from .models import TreatmentPlan, Appointment, Session
from patients.serializers import PatientSerializer

class TreatmentPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentPlan
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class AppointmentSerializer(serializers.ModelSerializer):
    # En lectura, retornamos un breve resumen del paciente para el Calendario
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"

class SessionSerializer(serializers.ModelSerializer):
    # To view evaluations tied to this session
    evaluations_count = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def get_evaluations_count(self, obj):
        return obj.evaluations.count()
