import datetime
from dateutil.relativedelta import relativedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from .models import TreatmentPlan, Appointment, Session
from .serializers import TreatmentPlanSerializer, AppointmentSerializer, SessionSerializer
from patients.models import Patient

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # We only show appointments that belong to the logged-in user
        return Appointment.objects.filter(user=self.request.user).order_by('date_time')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get', 'post'])
    def session(self, request, pk=None):
        """
        Manages the session attached to an appointment. 
        GET: Returns the assigned session (or creates an empty one if not exists).
        POST/PUT/PATCH are done via SessionViewSet directly for standard CRUD.
        """
        appointment = self.get_object()
        session, created = Session.objects.get_or_create(appointment=appointment)
        return Response(SessionSerializer(session).data)

class TreatmentPlanViewSet(viewsets.ModelViewSet):
    serializer_class = TreatmentPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TreatmentPlan.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def generate_recurrence(self, request):
        """
        Calcula y crea los turnos automáticamente.
        Payload esperado:
        {
            "patient_id": 1,
            "start_date": "2026-03-01",
            "duration_months": 3,
            "time": "16:00:00",
            "duration_minutes": 60,
            "days_of_week": [1, 4]  # 1 = Martes, 4 = Viernes (0 es Lunes según date.weekday())
        }
        """
        user = request.user
        data = request.data

        try:
            patient = Patient.objects.get(id=data['patient_id'])
            start_date = datetime.datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            duration_months = int(data['duration_months'])
            time_obj = datetime.datetime.strptime(data['time'], '%H:%M:%S').time()
            duration_minutes = int(data.get('duration_minutes', 60))
            days_of_week = [int(d) for d in data['days_of_week']]
        except (KeyError, ValueError, Patient.DoesNotExist) as e:
            return Response({'error': str(e), 'message': 'Payload inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        end_date = start_date + relativedelta(months=duration_months)
        
        # Guardar el plan agrupador
        plan = TreatmentPlan.objects.create(
            user=user,
            patient=patient,
            start_date=start_date,
            duration_months=duration_months,
            sessions_per_week=len(days_of_week)
        )

        # Lógica inteligente de recurrencia
        current_date = start_date
        appointments_to_create = []

        while current_date < end_date:
            if current_date.weekday() in days_of_week:
                # Es un día seleccionado, armamos el datetime
                dt = datetime.datetime.combine(current_date, time_obj)
                
                # Ignorar posibles feriados (aquí se podría conectar a feriados_api)
                
                appointments_to_create.append(
                    Appointment(
                        patient=patient,
                        user=user,
                        treatment_plan=plan,
                        date_time=dt,
                        duration_minutes=duration_minutes,
                        status='scheduled'
                    )
                )
            current_date += datetime.timedelta(days=1)

        # Inserción masiva para optimizar la DB
        Appointment.objects.bulk_create(appointments_to_create)

        return Response({
            'message': f'Se generaron {len(appointments_to_create)} turnos exitosamente.',
            'plan_id': plan.id,
            'appointments_count': len(appointments_to_create)
        }, status=status.HTTP_201_CREATED)

class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser] # Soporte para envío de Audio Files

    def get_queryset(self):
        return Session.objects.filter(appointment__user=self.request.user)
