from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from weather.models import Weather
from weather.serializer import WeatherSerializer
from django.db.models import Q


class WeatherView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = WeatherSerializer

    def filter_by_date(self, request, data):
        if request.query_params.get("year") and request.query_params.get("week"):

            return data.filter(
                Q(
                    start_day__year=request.query_params.get("year"),
                    start_day__week=request.query_params.get("week"),
                ),
            )
        return data

    def filter_by_location(self, request, data):
        user = request.user
        dru_type = str(user.dru.dru_type)
        if dru_type == "RESU":
            return data.filter(location=user.dru.region)
        elif dru_type == "PESU":
            return data.filter(location=user.dru.addr_province)
        elif dru_type != "National":
            return data.filter(location=user.dru.addr_city)

    def get(self, request):
        weather = Weather.objects.all()
        weather = self.filter_by_date(request, weather)
        weather = self.filter_by_location(request, weather)
        serializer = WeatherSerializer(weather, many=True)
        return Response(serializer.data)
