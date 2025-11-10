from rest_framework import serializers


class QuickStatisticsSerializer(serializers.Serializer):
    total_cases = serializers.IntegerField()
    total_deaths = serializers.IntegerField()
    total_severe_cases = serializers.IntegerField()
    total_lab_confirmed_cases = serializers.IntegerField()
    weekly_cases = serializers.IntegerField() or None
    weekly_deaths = serializers.IntegerField() or None
    weekly_severe_cases = serializers.IntegerField() or None
    weekly_lab_confirmed_cases = serializers.IntegerField() or None


class LocationStatSerializer(serializers.Serializer):
    location = serializers.CharField()
    case_count = serializers.IntegerField()
    death_count = serializers.IntegerField()


class DateStatSerializer(serializers.Serializer):
    label = serializers.CharField()
    case_count = serializers.IntegerField()
    death_count = serializers.IntegerField()
    outbreak_threshold = serializers.IntegerField()
