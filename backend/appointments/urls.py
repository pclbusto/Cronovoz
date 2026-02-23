from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet, TreatmentPlanViewSet, SessionViewSet

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'treatment-plans', TreatmentPlanViewSet, basename='treatmentplan')
router.register(r'sessions', SessionViewSet, basename='session')

urlpatterns = [
    path('', include(router.urls)),
]
