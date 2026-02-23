from django.db import models

class Paciente(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    dni = models.CharField(max_length=20, unique=True, help_text="Documento Nacional de Identidad")
    fecha_nacimiento = models.DateField()
    email = models.EmailField(blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    obra_social = models.CharField(max_length=100, blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.apellido}, {self.nombre} ({self.dni})"

    class Meta:
        ordering = ['apellido', 'nombre']

class Evolucion(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='evoluciones')
    fecha_registro = models.DateTimeField(auto_now_add=True)
    informe = models.TextField(help_text="Descripción de la sesión y evolución del paciente")
    audio = models.FileField(upload_to='audios_evoluciones/%Y/%m/%d/', blank=True, null=True, help_text="Grabación de la sesión")
    archivos_adjuntos = models.FileField(upload_to='adjuntos/%Y/%m/%d/', blank=True, null=True, help_text="Estudios u otros archivos")

    def __str__(self):
        return f"Evolución de {self.paciente} - {self.fecha_registro.strftime('%d/%m/%Y')}"

    class Meta:
        ordering = ['-fecha_registro']
