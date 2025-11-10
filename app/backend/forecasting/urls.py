from django.urls import path
from .views import (
    LstmTrainingView,
    LstmPredictionView,
)

urlpatterns = [
    path("train/", LstmTrainingView.as_view(), name="lstm-train"),
    path("predict/", LstmPredictionView.as_view(), name="lstm-predict"),
]
