from rest_framework import serializers
from .models import DRU, DRUType


class DRUTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = DRUType
        fields = [
            "id",
            "dru_classification",
        ]


class DRUSerializer(serializers.ModelSerializer):
    class Meta:
        model = DRU
        fields = ["id", "dru_name"]


class SUSerializer(serializers.Serializer):
    su_name = serializers.CharField()
    drus = DRUSerializer(many=True)


class RegionSerializer(serializers.Serializer):
    region_name = serializers.CharField()
    surveillance_units = SUSerializer(many=True)


class DRUListSerializer(serializers.ModelSerializer):
    class Meta:
        model = DRU
        fields = [
            "id",
            "dru_name",
            "email",
        ]


class RegisterDRUSerializer(serializers.ModelSerializer):
    dru_type = serializers.PrimaryKeyRelatedField(
        queryset=DRUType.objects.all(),
        required=True,
    )

    class Meta:
        model = DRU
        fields = [
            "region",
            "surveillance_unit",
            "dru_name",
            "addr_street",
            "addr_barangay",
            "addr_city",
            "addr_province",
            "email",
            "contact_number",
            "dru_type",
        ]

    def validate(self, data):
        # Todo: Validate contact number

        dru_name = data.get("dru_name")
        surveillance_unit = data.get("surveillance_unit")
        if DRU.objects.filter(
            surveillance_unit=surveillance_unit,
            dru_name=dru_name,
        ).exists():
            raise serializers.ValidationError({"dru_name": "DRU already exists"})

        return data

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["region"] = request.user.dru.region
        validated_data["surveillance_unit"] = request.user.dru.surveillance_unit

        dru = DRU.objects.create(**validated_data)
        return dru


class DRUProfileSerializer(serializers.ModelSerializer):
    dru_type = serializers.StringRelatedField()
    full_address = serializers.SerializerMethodField()

    created_at = serializers.DateTimeField(format="%Y-%m-%d-%H-%M-%S")
    updated_at = serializers.DateTimeField(format="%Y-%m-%d-%H-%M-%S")

    def get_full_address(self, obj):
        return f"{obj.addr_street}, {obj.addr_barangay}, {obj.addr_city}, {obj.addr_province}".strip()

    class Meta:
        model = DRU
        fields = [
            "id",
            "region",
            "surveillance_unit",
            "dru_name",
            "full_address",
            "email",
            "contact_number",
            "dru_type",
            "created_at",
            "updated_at",
        ]
