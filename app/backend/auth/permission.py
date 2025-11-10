from rest_framework import permissions


class IsUserAdmin(permissions.BasePermission):
    message = "You are not authorized to perform this action"

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_admin or request.user.is_superuser)
        )
