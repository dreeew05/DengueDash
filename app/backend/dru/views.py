from django.http import JsonResponse
from django.db import transaction
from django.db.models import Q
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework import permissions
from rest_framework.response import Response
from dru.serializers import (
    RegisterDRUSerializer,
    DRUListSerializer,
    DRUProfileSerializer,
    DRUTypeSerializer,
    RegionSerializer,
)
from dru.models import DRUType, DRU
from auth.permission import IsUserAdmin
from api.pagination import APIPagination
from user.models import BlacklistedUsers
from user.views import SoftDeleteRecordsUnderInterviewerView

User = get_user_model()


class RegisterDRUView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsUserAdmin)

    def __init__(self):
        self.ALLOWED_DRU_TYPES = [
            "National",
            "RESU",
            "PESU",
            "CESU",
        ]

    def post(self, request):
        current_user = request.user

        # Validation check
        validation_error = self._validate_dru_registration(current_user, request.data)
        if validation_error:
            return validation_error

        # Create DRU and associated user
        return self._create_dru_and_user(request)

    def _validate_dru_registration(self, user, request_data):
        """Validate DRU type and region based on the user's DRU type."""
        current_user_dru_type = str(user.dru.dru_type)
        request_user_dru_type = str(
            DRUType.objects.get(id=request_data.get("dru_type"))
        )
        request_user_region = request_data.get("region")

        # Validation for RESU
        if current_user_dru_type == "RESU":
            if request_user_dru_type not in ["PESU", "CESU"]:
                return JsonResponse(
                    {"success": False, "message": "Invalid DRU Type"},
                )
            if user.dru.region != request_user_region:
                return JsonResponse(
                    {"success": False, "message": "Invalid Region"},
                )

        # Validation for PESU and CESU
        elif current_user_dru_type in ["PESU", "CESU"]:
            if request_user_dru_type in self.ALLOWED_DRU_TYPES:
                return JsonResponse(
                    {"success": False, "message": "Invalid DRU Type"},
                )
            if current_user_dru_type == "CESU":
                if user.dru.addr_city != request_data.get("addr_city"):
                    return JsonResponse(
                        {"success": False, "message": "Invalid City"},
                    )
            elif current_user_dru_type == "PESU":
                if user.dru.addr_province != request_data.get("addr_province"):
                    return JsonResponse(
                        {"success": False, "message": "Invalid Province"},
                    )

        return None

    def _create_dru_and_user(self, request):
        """Create a new DRU and associated user."""
        serializer = RegisterDRUSerializer(
            data=request.data, context={"request": request}
        )
        if not serializer.is_valid():
            return JsonResponse(
                {"success": False, "message": serializer.errors},
            )

        try:
            with transaction.atomic():
                new_dru = serializer.save()
                User.objects.create_user(
                    email=new_dru.email,
                    password="testpassword",  # TODO: Generate a random password and email it
                    first_name=new_dru.dru_name,
                    middle_name="",
                    last_name="",
                    sex="N/A",
                    is_admin=True,
                    is_verified=True,
                    is_legacy=True,
                    dru=new_dru,
                )
        except Exception as e:
            return JsonResponse(
                {"success": False, "message": f"User creation failed: {str(e)}"},
            )

        return JsonResponse(
            {"success": True, "message": "DRU successfully registered"},
        )


class DRUHierarchyView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        regions = {}
        drus = DRU.objects.all()

        for dru in drus:
            BLACKLISTED_DRU_TYPES = [
                "National",
                "RESU",
                "PESU",
                "CESU",
            ]
            if dru.dru_type.dru_classification in BLACKLISTED_DRU_TYPES:
                continue

            region_name = dru.region
            su_name = dru.surveillance_unit

            if region_name not in regions:
                regions[region_name] = {}

            if su_name not in regions[region_name]:
                regions[region_name][su_name] = []

            regions[region_name][su_name].append(dru)

        output = [
            {
                "region_name": region,
                "surveillance_units": [
                    {
                        "su_name": su,
                        "drus": drus,
                    }
                    for su, drus in surveillance_units.items()
                ],
            }
            for region, surveillance_units in regions.items()
        ]

        serializer = RegionSerializer(output, many=True)
        return JsonResponse({"data": serializer.data})


class DRUTypeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, _):
        dru_types = DRUType.objects.exclude(
            Q(dru_classification="National")
            | Q(dru_classification="RESU")
            | Q(dru_classification="PESU")
            | Q(dru_classification="CESU")
        )
        serializer = DRUTypeSerializer(dru_types, many=True)
        return JsonResponse({"data": serializer.data})


class DRUListView(ListAPIView):
    permission_classes = (permissions.IsAuthenticated, IsUserAdmin)
    pagination_class = APIPagination

    serializer_class = DRUListSerializer

    def get_queryset(self):
        current_user = self.request.user
        dru_type = str(current_user.dru.dru_type)
        if dru_type == "RESU":
            return DRU.objects.filter(
                Q(dru_type__dru_classification="PESU")
                | Q(dru_type__dru_classification="CESU"),
                region=current_user.dru.region,
            )
        elif dru_type == "PESU" or dru_type == "CESU":
            return DRU.objects.filter(
                surveillance_unit=current_user.dru.surveillance_unit,
            ).exclude(
                Q(dru_type__dru_classification="PESU")
                | Q(dru_type__dru_classification="CESU")
            )
        # All regional DRUs
        elif dru_type == "National":
            return DRU.objects.filter(
                dru_type__dru_classification="RESU",
            )


class DRUProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsUserAdmin)

    def get(self, _, dru_id):
        dru = DRU.objects.filter(id=dru_id).first()

        if dru is None:
            return JsonResponse(
                {
                    "success": False,
                    "message": "DRU not found",
                },
            )

        serializer = DRUProfileSerializer(dru)
        return Response(serializer.data)


class DeleteDRUView(SoftDeleteRecordsUnderInterviewerView):
    permission_classes = (permissions.IsAuthenticated, IsUserAdmin)

    def soft_delete_all_associated_users_records(self, dru):
        """Soft delete all users and records associated with the DRU."""
        users = User.objects.filter(dru=dru)
        for user in users:

            # Revoke the token of each user
            revoke_response = self.revoke_tokens(user)
            if revoke_response:
                return revoke_response

            record_soft_delete = self.soft_delete_related_records(user)

            BlacklistedUsers.objects.get_or_create(
                email=user.email,
                dru=user.dru,
            )

            user.soft_delete()

            if record_soft_delete:
                return record_soft_delete

        return None

    def delete(self, request, dru_id):
        current_user = request.user

        is_superuser = current_user.is_superuser
        dru_to_delete = DRU.objects.filter(id=dru_id).first()

        if dru_to_delete is None:
            return JsonResponse(
                {
                    "success": False,
                    "message": "DRU not found",
                },
            )

        if not is_superuser:
            current_user_dru_type = str(current_user.dru.dru_type)
            request_dru_type = str(dru_to_delete.dru_type)
            ALLOWED_DRU_TYPES = ["RESU", "PESU", "CESU"]
            if current_user_dru_type not in ALLOWED_DRU_TYPES:
                return JsonResponse(
                    {
                        "success": False,
                        "message": "You are not authorized to perform this action",
                    },
                )

            # For Regional DRUs
            current_user_region = str(current_user.dru.region)
            request_region = str(dru_to_delete.region)
            # For PESU/CESU DRUs
            current_user_su = str(current_user.dru.surveillance_unit)
            request_su = str(dru_to_delete.surveillance_unit)

            if current_user_dru_type == "RESU":
                if (
                    request_dru_type != "PESU"
                    and request_dru_type != "CESU"
                    or current_user_region != request_region
                ):
                    return JsonResponse(
                        {
                            "success": False,
                            "message": "Invalid Action",
                        },
                    )
            elif current_user_dru_type == "PESU" or current_user_dru_type == "CESU":
                if (
                    request_dru_type in ALLOWED_DRU_TYPES
                    or current_user_su != request_su
                ):
                    return JsonResponse(
                        {
                            "success": False,
                            "message": "Invalid Action",
                        },
                    )

        with transaction.atomic():
            soft_delete_response = self.soft_delete_all_associated_users_records(
                dru_to_delete
            )

            if soft_delete_response:
                return soft_delete_response

            dru_to_delete.soft_delete()

            return JsonResponse(
                {
                    "success": True,
                    "message": "DRU deleted successfully",
                }
            )
