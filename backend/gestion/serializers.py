from rest_framework import serializers
from .models import Paciente, Evolucion

class EvolucionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evolucion
        fields = '__all__'
        read_only_fields = ['fecha_registro']

class PacienteSerializer(serializers.ModelSerializer):
    # Incluimos las evoluciones más recientes como solo lectura si se desea, 
    # o simplemente mantenemos el listado limpio.
    
    class Meta:
        model = Paciente
        fields = '__all__'
        read_only_fields = ['fecha_creacion']
