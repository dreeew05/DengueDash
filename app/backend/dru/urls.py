from django.urls import path
from .views import (
    RegisterDRUView,
    DRUHierarchyView,
    DRUListView,
    DRUProfileView,
    DRUTypeView,
    DeleteDRUView,
)

urlpatterns = [
    path("types/", DRUTypeView.as_view(), name="dru-types"),
    path("hierarchy/", DRUHierarchyView.as_view(), name="dru-hierarchy"),
    path("list/", DRUListView.as_view(), name="dru-list"),
    path("<int:dru_id>/", DRUProfileView.as_view(), name="dru-profile"),
    path("register/", RegisterDRUView.as_view(), name="dru-register"),
    path("delete/<int:dru_id>/", DeleteDRUView.as_view(), name="dru-delete"),
]
