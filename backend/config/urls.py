"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter
from accounts.views import RegisterView
from patients.views import PatientViewSet
from evaluations.views import TestTemplateViewSet, EvaluationViewSet

router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'test-templates', TestTemplateViewSet, basename='testtemplate')
router.register(r'evaluations', EvaluationViewSet, basename='evaluation')

@api_view(['GET'])
def test_api(request):
    return Response({"message": "Hello from Django!"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/test/', test_api),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', obtain_auth_token, name='login'),
    path('api/', include(router.urls)),
]
