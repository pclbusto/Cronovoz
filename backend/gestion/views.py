from rest_framework import viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Paciente, Evolucion
from .serializers import PacienteSerializer, EvolucionSerializer

class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'apellido', 'dni']

class EvolucionViewSet(viewsets.ModelViewSet):
    queryset = Evolucion.objects.all()
    serializer_class = EvolucionSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser] # Para soportar subida de archivos
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['fecha_registro']

    def get_queryset(self):
        """
        Opcionalmente filtra por paciente si se pasa el parámetro `paciente_id` en la URL.
        """
        queryset = super().get_queryset()
        paciente_id = self.request.query_params.get('paciente_id')
        if paciente_id:
            queryset = queryset.filter(paciente_id=paciente_id)
        return queryset
