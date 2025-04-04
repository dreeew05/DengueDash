from django.urls import path
from .views import (
    AdminBrowseUserView,
    MyUserView,
    UsersListView,
    UsersUnverifiedListView,
    VerifiyUserView,
    DeleteUserView,
    ToggleUserRoleView,
    RegisterUserView,
)

urlpatterns = [
    path("me/", MyUserView.as_view(), name="user-me"),
    path("list/", UsersListView.as_view(), name="user-list"),
    path(
        "list/unverified/",
        UsersUnverifiedListView.as_view(),
        name="user-list-unverified",
    ),
    path("<int:user_id>/", AdminBrowseUserView.as_view(), name="user-detail"),
    path("verify/<int:user_id>/", VerifiyUserView.as_view(), name="user-verify"),
    path(
        "toggle-role/<int:user_id>/",
        ToggleUserRoleView.as_view(),
        name="user-toggle-role",
    ),
    path("register/", RegisterUserView.as_view(), name="user-register"),
    path("delete/<int:user_id>/", DeleteUserView.as_view(), name="user-delete"),
]
