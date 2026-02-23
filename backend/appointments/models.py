from django.db import models
from django.conf import settings
from patients.models import Patient

class TreatmentPlan(models.Model):
    # Días de la semana
    DAYS_OF_WEEK = (
        ('0', 'Lunes'),
        ('1', 'Martes'),
        ('2', 'Miércoles'),
        ('3', 'Jueves'),
        ('4', 'Viernes'),
        ('5', 'Sábado'),
        ('6', 'Domingo'),
    )

    STATUS_CHOICES = (
        ('active', 'Activo'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
    )

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='treatment_plans')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='treatment_plans')
    start_date = models.DateField()
    duration_months = models.PositiveIntegerField(help_text="Duración en meses del tratamiento")
    sessions_per_week = models.PositiveIntegerField(help_text="Cantidad de sesiones por semana")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Plan: {self.patient} - {self.duration_months} meses ({self.status})"

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Programado'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
        ('rescheduled', 'Reprogramado'),
    )

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments')
    treatment_plan = models.ForeignKey(TreatmentPlan, on_delete=models.CASCADE, null=True, blank=True, related_name='appointments', help_text="Plan de recurrencia al que pertenece (si aplica)")
    
    date_time = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True, help_text="Notas o resumen de la sesión")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cita: {self.patient} el {self.date_time.strftime('%Y-%m-%d %H:%M')}"

class Session(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('realizada', 'Realizada'),
        ('ausente', 'Ausente'),
        ('cancelada', 'Cancelada'),
    )

    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='session')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    written_notes = models.TextField(blank=True, help_text="Observaciones clínicas de la sesión")
    voice_note = models.FileField(upload_to='voice_notes/%Y/%m/', null=True, blank=True, help_text="Grabación de voz de la sesión")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Sesión de {self.appointment.patient} ({self.get_status_display()})"
