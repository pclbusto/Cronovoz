from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import TestTemplate, Evaluation
from .serializers import TestTemplateSerializer, EvaluationSerializer

class TestTemplateViewSet(viewsets.ModelViewSet):
    # Templates are created by admins via the Django Admin panel, a future management interface,
    # or by professionals to create or modify custom tests.
    queryset = TestTemplate.objects.all()
    serializer_class = TestTemplateSerializer
    permission_classes = [IsAuthenticated]

class EvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see evaluations they conducted
        return Evaluation.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        # Automatically assign the logged-in user to the evaluation
        serializer.save(user=self.request.user)
