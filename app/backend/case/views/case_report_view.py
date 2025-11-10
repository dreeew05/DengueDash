from datetime import timedelta
from rest_framework import permissions, status
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from case.models import Case
from case.serializers.case_report_serializers import (
    CaseReportSerializer,
    CaseViewSerializer,
    CaseUpdateSerializer,
)
from api.pagination import APIPagination
from django.db.models import Case as DBCase, Value, When
from django.http import JsonResponse


def fetch_cases_for_week(
    start_date,
    location_filter=None,
):
    end_date = start_date + timedelta(days=7)
    # Base queryset
    cases = Case.objects.filter(
        # clncl_class__in=["W", "S"],
        date_con__gte=start_date,
        date_con__lt=end_date,
    )

    # Apply location filter if provided
    if location_filter:
        cases = cases.filter(**location_filter)

    return cases.count()


def get_filter_criteria(user):
    interviewer_dru_type = str(user.dru.dru_type)
    if interviewer_dru_type == "National":
        return {}
    elif interviewer_dru_type == "RESU":
        return {"interviewer__dru__region": user.dru.region}
    elif interviewer_dru_type == "PESU" or interviewer_dru_type == "CESU":
        return {"interviewer__dru__surveillance_unit": user.dru.surveillance_unit}
    else:
        return {"interviewer__dru": user.dru}


class CaseReportView(ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CaseReportSerializer
    pagination_class = APIPagination

    def get_queryset(self):
        user = self.request.user

        # Generate filter criteria using the helper function
        filter_kwargs = get_filter_criteria(user)

        # Get search query from the request parameters
        search_query = self.request.query_params.get("search", None)

        # Base queryset
        queryset = Case.objects.filter(**filter_kwargs)

        # Annotate human-readable labels for clncl_class and case_class
        clncl_class_choices = dict(Case._meta.get_field("clncl_class").choices)
        case_class_choices = dict(Case._meta.get_field("case_class").choices)

        queryset = queryset.annotate(
            clncl_class_label=DBCase(
                *[
                    When(clncl_class=key, then=Value(label))
                    for key, label in clncl_class_choices.items()
                ]
            ),
            case_class_label=DBCase(
                *[
                    When(case_class=key, then=Value(label))
                    for key, label in case_class_choices.items()
                ]
            ),
        )

        # If a search query is provided, filter further
        if search_query:
            queryset = (
                # Patient details
                queryset.filter(patient__first_name__icontains=search_query)
                | queryset.filter(patient__last_name__icontains=search_query)
                | queryset.filter(patient__addr_barangay__icontains=search_query)
                | queryset.filter(patient__addr_city__icontains=search_query)
                # Case details
                | queryset.filter(date_con__icontains=search_query)
                # Case details using annotated labels
                | queryset.filter(clncl_class_label__icontains=search_query)
                | queryset.filter(case_class_label__icontains=search_query)
            )

        # Return the filtered queryset, ordered by date of consultation
        return queryset.order_by("-date_con")


class CaseDetailedView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, case_id):
        user = request.user
        filter_kwargs = get_filter_criteria(user)

        # Attempt to retrieve the case based on user credentials
        case = Case.objects.filter(
            case_id=case_id,
            **filter_kwargs,
        ).first()

        if case is None:
            return JsonResponse(
                {
                    "success": False,
                    "message": "You do not have the necessary permissions to access this case or the case does not exist.",
                }
            )

        # Serialize and return the case data
        serializer = CaseViewSerializer(case, context={"request": request})
        return Response(serializer.data)


class CaseDeleteView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request, case_id):
        user = request.user
        filter_kwargs = get_filter_criteria(user)

        try:
            case = Case.objects.get(
                case_id=case_id,
                **filter_kwargs,
            )
        except Case.DoesNotExist:
            return JsonResponse(
                {
                    "success": False,
                    "message": "You do not have the necessary permissions to access this case or the case does not exist.",
                }
            )
        except Exception as e:
            return JsonResponse(
                {
                    "success": False,
                    "message": f"An error occurred: {str(e)}",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Delete the case
        case.delete()
        return JsonResponse(
            {
                "success": True,
                "message": "Case deleted successfully.",
            }
        )


class CaseUpdateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def patch(self, request, case_id):
        user = request.user
        filter_kwargs = get_filter_criteria(user)

        try:
            case = Case.objects.get(
                case_id=case_id,
                **filter_kwargs,
            )
        except Case.DoesNotExist:
            return JsonResponse(
                {
                    "success": False,
                    "message": "You do not have the necessary permissions to access this case or the case does not exist.",
                }
            )
        except Exception as e:
            return JsonResponse(
                {
                    "success": False,
                    "message": f"An error occurred: {str(e)}",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Validate the request data
        serializer = CaseUpdateSerializer(
            case,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()

            return JsonResponse(
                {
                    "success": True,
                    "message": "Case updated successfully.",
                }
            )
        else:
            return JsonResponse(
                {
                    "success": False,
                    "message": "Invalid data provided. Please check your input.",
                },
            )
