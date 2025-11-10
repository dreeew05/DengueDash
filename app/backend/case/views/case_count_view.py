from django.db.models import Count, Q
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.exceptions import ValidationError
from datetime import datetime, timedelta
from case.models import Case
from case.serializers.case_statistics_serializers import (
    QuickStatisticsSerializer,
    LocationStatSerializer,
    DateStatSerializer,
)


class QuickStatisticsView(APIView):
    # todo: filter by surveillance unit/municipality
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        current_year = datetime.now().year
        current_week = datetime.now().isocalendar()[1]
        if year := request.query_params.get("year"):
            total_cases = Case.objects.filter(date_con__year=year).count()
            total_deaths = Case.objects.filter(
                outcome="D",
                date_con__year=year,
            ).count()
            total_severe_cases = Case.objects.filter(
                clncl_class="S",
                date_con__year=year,
            ).count()
            total_lab_confirmed_cases = Case.objects.filter(
                Q(ns1_result="P") | Q(igg_elisa="P") | Q(igm_elisa="P"),
                date_con__year=year,
            ).count()

            if year == str(current_year):
                weekly_cases = Case.objects.filter(
                    date_con__year=current_year,
                    date_con__week=current_week,
                ).count()
                weekly_deaths = Case.objects.filter(
                    outcome="D",
                    date_con__year=current_year,
                    date_con__week=current_week,
                ).count()
                weekly_severe_cases = Case.objects.filter(
                    clncl_class="S",
                    date_con__year=current_year,
                    date_con__week=current_week,
                ).count()
                weekly_lab_confirmed_cases = Case.objects.filter(
                    Q(ns1_result="P") | Q(igg_elisa="P") | Q(igm_elisa="P"),
                    date_con__year=current_year,
                    date_con__week=current_week,
                ).count()
            else:
                weekly_cases = None
                weekly_deaths = None
                weekly_severe_cases = None
                weekly_lab_confirmed_cases = None

        else:
            total_cases = Case.objects.all().count()
            total_deaths = Case.objects.filter(outcome="D").count()
            total_severe_cases = Case.objects.filter(clncl_class="S").count()
            total_lab_confirmed_cases = Case.objects.filter(
                Q(ns1_result="P") | Q(igg_elisa="P") | Q(igm_elisa="P")
            ).count()

            weekly_cases = None
            weekly_deaths = None
            weekly_severe_cases = None
            weekly_lab_confirmed_cases = None

        data = {
            "total_cases": total_cases,
            "total_deaths": total_deaths,
            "total_severe_cases": total_severe_cases,
            "total_lab_confirmed_cases": total_lab_confirmed_cases,
            "weekly_cases": weekly_cases,
            "weekly_deaths": weekly_deaths,
            "weekly_severe_cases": weekly_severe_cases,
            "weekly_lab_confirmed_cases": weekly_lab_confirmed_cases,
        }

        serializer = QuickStatisticsSerializer(data, many=False)
        return Response(serializer.data)


class BaseDengueDateStatView(APIView):
    def __init__(self):
        self.group_by = None
        self.label = None
        self.LOCATION_MAPPING = {
            "region": "patient__addr_region",
            "province": "patient__addr_province",
            "city": "patient__addr_city",
            "barangay": "patient__addr_barangay",
        }

    def filter_by_date(self, request, cases):
        if year := request.query_params.get("year"):
            cases = cases.filter(date_con__year=year)
            self.group_by = "date_con__week"
            self.label = "week"
        elif recent_weeks := request.query_params.get("recent_weeks"):
            last_date_in_db = Case.objects.latest("date_con").date_con
            start_date = last_date_in_db - timedelta(weeks=int(recent_weeks))
            cases = cases.filter(date_con__gte=start_date)
            self.group_by = "date_con__week"
            self.label = "week"
        else:
            now = datetime.now()
            cases = cases.filter(date_con__year__lte=now.year)
            self.group_by = "date_con__year"
            self.label = "year"
        return cases

    def filter_by_location(self, request, cases):
        for param, db_field in self.LOCATION_MAPPING.items():
            if value := request.query_params.get(param):
                cases = cases.filter(**{db_field: value})
        return cases

    def get_data(self, request):
        cases = Case.objects.all()

        cases = self.filter_by_date(request, cases)
        cases = self.filter_by_location(request, cases)

        # Single query for both cases and deaths
        stats = (
            cases.values(self.group_by)
            .annotate(
                case_count=Count("case_id"),
                death_count=Count("case_id", filter=Q(outcome="D")),
            )
            .order_by(self.group_by)
        )

        return [
            {
                "label": (
                    f"{self.label.capitalize()} {item[self.group_by]}"
                    if self.label == "week"
                    else item[self.group_by]
                ),
                "case_count": item["case_count"],
                "death_count": item["death_count"],
                # todo: must not use hardcoded outbreak threshold
                # configure this on each location (city, province, region)
                # formula: mu + 2 * sigma
                # where mu is the mean and sigma is the standard deviation of the case counts
                "outbreak_threshold": 98,
            }
            for item in stats
        ]

    def get(self, request):
        data = self.get_data(request)
        if isinstance(data, JsonResponse):
            return data
        serializer = DateStatSerializer(data, many=True)
        return Response(serializer.data)


class DenguePublicDateStatView(BaseDengueDateStatView):
    permission_classes = (permissions.AllowAny,)


class DengueAuthenticatedDateStatView(BaseDengueDateStatView):
    permission_classes = (permissions.IsAuthenticated,)

    def filter_by_location(self, request, cases):
        # Override to filter by the authenticated user's location
        user = request.user
        dru_type = str(user.dru.dru_type)
        if dru_type == "RESU":
            cases = cases.filter(interviewer__dru__region=user.dru.region)
        elif dru_type == "PESU":
            cases = cases.filter(interviewer__dru__addr_province=user.dru.addr_province)
        elif dru_type == "CESU":
            cases = cases.filter(interviewer__dru__addr_city=user.dru.addr_city)
        return cases


class BaseLocationStatView(APIView):

    def filter_by_date(self, request, cases):
        if year := request.query_params.get("year"):
            cases = cases.filter(date_con__year=year)
        if month := request.query_params.get("month"):
            cases = cases.filter(date_con__month=month)
        if week := request.query_params.get("week"):
            cases = cases.filter(date_con__week=week)
        if date := request.query_params.get("date"):
            cases = cases.filter(date_con=date)
        return cases

    def filter_by_location(self, request, cases):
        """
        By default, apply location filters from the query parameters.
        This method will be overridden in the authenticated view.
        """
        location_params = ["region", "province", "city", "barangay"]
        has_location_filter = any(
            param in request.query_params for param in location_params
        )

        if not has_location_filter:
            raise ValidationError(
                "At least one location filter must be provided (region, province, city, or barangay)"
            )

        if region := request.query_params.get("region"):
            cases = cases.filter(patient__addr_region=region)
        if province := request.query_params.get("province"):
            cases = cases.filter(patient__addr_province=province)
        if city := request.query_params.get("city"):
            cases = cases.filter(patient__addr_city=city)
        if barangay := request.query_params.get("barangay"):
            cases = cases.filter(patient__addr_barangay=barangay)
        return cases

    def get_group_field(self, request):
        """
        Determines the grouping field based on a 'group_by' query parameter or the most granular provided filter.
        """
        group_by_param = request.query_params.get("group_by")
        mapping = {
            "barangay": "patient__addr_barangay",
            "municipality": "patient__addr_mun",
            "province": "patient__addr_province",
            "region": "patient__addr_region",
            "city": "patient__addr_city",
        }
        if group_by_param in mapping:
            return mapping[group_by_param]

        # If no explicit group_by is provided, use whichever location filter is present.
        if request.query_params.get("barangay"):
            return "patient__addr_barangay"
        elif request.query_params.get("city"):
            return "patient__addr_city"
        elif request.query_params.get("municipality"):
            return "patient__addr_mun"
        elif request.query_params.get("province"):
            return "patient__addr_province"
        elif request.query_params.get("region"):
            return "patient__addr_region"
        return "patient__addr_barangay"  # Default grouping

    def get_data(self, request):
        cases = Case.objects.all()
        cases = self.filter_by_date(request, cases)
        cases = self.filter_by_location(request, cases)
        group_field = self.get_group_field(request)

        # Aggregate case counts
        cases_per_location = (
            cases.values(group_field)
            .annotate(case_count=Count("case_id"))
            .order_by("-case_count")
        )
        # Aggregate death counts
        deaths_per_location = (
            cases.filter(outcome="D")
            .values(group_field)
            .annotate(death_count=Count("case_id"))
            .order_by("-death_count")
        )
        # Create lookup for death counts
        death_counts = {
            item[group_field]: item["death_count"] for item in deaths_per_location
        }
        # Combine into final data
        data = [
            {
                "location": item[group_field],
                "case_count": item["case_count"],
                "death_count": death_counts.get(item[group_field], 0),
            }
            for item in cases_per_location
        ]
        return data

    def get(self, request, *args, **kwargs):
        data = self.get_data(request)
        serializer = LocationStatSerializer(data, many=True)
        return Response(serializer.data)


class DenguePublicLocationStatView(BaseLocationStatView):
    permission_classes = (permissions.AllowAny,)


class DengueAuthenticatedLocationStatView(BaseLocationStatView):
    permission_classes = (permissions.IsAuthenticated,)

    def filter_by_location(self, request, cases):
        # Override to filter by the authenticated user's location
        user = request.user
        dru_type = str(user.dru.dru_type)
        if dru_type == "RESU":
            cases = cases.filter(interviewer__dru__region=user.dru.region)
        elif dru_type == "PESU":
            cases = cases.filter(interviewer__dru__addr_province=user.dru.addr_province)
        elif dru_type == "CESU":
            cases = cases.filter(interviewer__dru__addr_city=user.dru.addr_city)
        return cases
