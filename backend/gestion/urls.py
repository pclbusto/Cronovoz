from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PacienteViewSet, EvolucionViewSet

router = DefaultRouter()
router.register(r'pacientes', PacienteViewSet)
router.register(r'evoluciones', EvolucionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
