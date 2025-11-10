from rest_framework import serializers
from case.models import (
    Case,
    Patient,
)
from datetime import date


class BasePatientCaseSerializer(serializers.ModelSerializer):
    def validate_date(self, value, error_message):
        if value:
            if not isinstance(value, date):
                try:
                    date.fromisoformat(str(value))
                except ValueError:
                    raise serializers.ValidationError(
                        "Invalid date format",
                    )
            if value > date.today():
                raise serializers.ValidationError(
                    error_message,
                )
        return value

    def validate_choice(self, value, choices, field_name):
        if value not in choices:
            raise serializers.ValidationError(
                f"Invalid {field_name} value. Valid values are: {', '.join(choices)}",
            )
        return value


class PatientSerializer(BasePatientCaseSerializer):
    class Meta:
        model = Patient
        fields = "__all__"

        extra_kwargs = {
            "last_name": {
                "error_messages": {
                    "required": "Last name is required",
                    "blank": "Last name must not be blank",
                    "null": "Last name must not be null",
                    "max_length": "Last name must not exceed 50 characters",
                }
            },
            "first_name": {
                "error_messages": {
                    "required": "First name is required",
                    "blank": "First name must not be blank",
                    "null": "First name must not be null",
                    "max_length": "First name must not exceed 100 characters",
                }
            },
            "sex": {
                "error_messages": {
                    "required": "Sex is required",
                    "blank": "Sex must not be blank",
                    "null": "Sex must not be null",
                    "max_length": "Sex must not exceed 1 characters",
                }
            },
            "addr_barangay": {
                "error_messages": {
                    "required": "Barangay is required",
                    "blank": "Barangay must not be blank",
                    "null": "Barangay must not be null",
                    "max_length": "Barangay must not exceed 100 characters",
                }
            },
            "addr_city": {
                "error_messages": {
                    "required": "City is required",
                    "blank": "City must not be blank",
                    "null": "City must not be null",
                    "max_length": "City must not exceed 100 characters",
                }
            },
            "addr_province": {
                "error_messages": {
                    "required": "Province is required",
                    "blank": "Province must not be blank",
                    "null": "Province must not be null",
                    "max_length": "Province must not exceed 100 characters",
                }
            },
            "addr_region": {
                "error_messages": {
                    "required": "Region is required",
                    "blank": "Region must not be blank",
                    "null": "Region must not be null",
                    "max_length": "Region must not exceed 100 characters",
                }
            },
            "civil_status": {
                "error_messages": {
                    "required": "Civil Status is required",
                    "blank": "Civil Status must not be blank",
                    "null": "Civil Status must not be null",
                    "max_length": "Civil Status must not exceed 100 characters",
                }
            },
        }

    def validate_date_of_birth(self, value):
        return self.validate_date(
            value,
            "Date of birth must not be a future date",
        )

    def validate_sex(self, value):
        return self.validate_choice(
            value,
            [item[0] for item in Patient._meta.get_field("sex").choices],
            "Sex",
        )

    def validate_civil_status(self, value):
        return self.validate_choice(
            value,
            [item[0] for item in Patient._meta.get_field("civil_status").choices],
            "Civil status",
        )


class CaseSerializer(BasePatientCaseSerializer):
    patient = PatientSerializer()

    class Meta:
        model = Case
        fields = "__all__"
        unique_together = (
            "date_con",
            "patient",
        )

        extra_kwargs = {
            "date_con": {
                "error_messages": {
                    "required": "Date of consultation is required",
                    "blank": "Date of consultation must not be blank",
                    "null": "Date of consultation must not be null",
                }
            },
            "clncl_class": {
                "error_messages": {
                    "required": "Clinical classification is required",
                    "blank": "Clinical classification must not be blank",
                    "null": "Clinical classification must not be null",
                    "max_length": "Clinical classification must not exceed 1 character",
                }
            },
            "ns1_result": {
                "error_messages": {
                    "required": "NS1 result is required",
                    "blank": "NS1 result must not be blank",
                    "null": "NS1 result must not be null",
                    "max_length": "NS1 result must not exceed 2 characters",
                }
            },
            "igg_elisa": {
                "error_messages": {
                    "required": "IgG ELISA result is required",
                    "blank": "IgG ELISA result must not be blank",
                    "null": "IgG ELISA result must not be null",
                    "max_length": "IgG ELISA result must not exceed 2 characters",
                }
            },
            "igm_elisa": {
                "error_messages": {
                    "required": "IgM ELISA result is required",
                    "blank": "IgM ELISA result must not be blank",
                    "null": "IgM ELISA result must not be null",
                    "max_length": "IgM ELISA result must not exceed 2 characters",
                }
            },
            "pcr": {
                "error_messages": {
                    "required": "PCR result is required",
                    "blank": "PCR result must not be blank",
                    "null": "PCR result must not be null",
                    "max_length": "PCR result must not exceed 2 characters",
                }
            },
            "case_class": {
                "error_messages": {
                    "required": "Case classification is required",
                    "blank": "Case classification must not be blank",
                    "null": "Case classification must not be null",
                    "max_length": "Case classification must not exceed 1 character",
                }
            },
            "outcome": {
                "error_messages": {
                    "required": "Outcome is required",
                    "blank": "Outcome must not be blank",
                    "null": "Outcome must not be null",
                    "max_length": "Outcome must not exceed 1 character",
                }
            },
        }

    def validate_date_con(self, value):
        return self.validate_date(
            value,
            "Date of consultation must not be a future date",
        )

    def validate_date_onset(self, value):
        return self.validate_date(
            value,
            "Date of onset must not be a future date",
        )

    def validate_date_ns1(self, value):
        return self.validate_date(
            value,
            "NS1 date must not be a future date",
        )

    def validate_date_igg_elisa(self, value):
        return self.validate_date(
            value,
            "IgG ELISA date must not be a future date",
        )

    def validate_date_igm_elisa(self, value):
        return self.validate_date(
            value,
            "IgM ELISA date must not be a future date",
        )

    def validate_date_pcr(self, value):
        return self.validate_date(
            value,
            "PCR date must not be a future date",
        )

    def validate_date_death(self, value):
        return self.validate_date(
            value,
            "Date of death must not be a future date",
        )

    def validate_clncl_class(self, value):
        return self.validate_choice(
            value,
            [item[0] for item in Case._meta.get_field("clncl_class").choices],
            "Clinical classification",
        )

    def validate_ns1_result(self, value):
        return self.validate_choice(
            value,
            [item[0] for item in Case._meta.get_field("ns1_result").choices],
            "NS1 result",
        )

    def validate_igg_elisa(self, value):
        return self.validate_choice(
            value,
            [item[0] for item in Case._meta.get_field("igg_elisa").choices],
            "IgG ELISA result",
        )

    def validate_igm_elisa(self, value):
        return self.validate_choice(
            value,
            [item[0] for item in Case._meta.get_field("igm_elisa").choices],
            "IgM ELISA result",
        )

    def validate_pcr(self, value):
        return self.validate_choice(
            value,
            [item[0] for item in Case._meta.get_field("pcr").choices],
            "PCR result",
        )

    def validate_case_class(self, value):
        return self.validate_choice(
            value,
            [item[0] for item in Case._meta.get_field("case_class").choices],
            "Case classification",
        )

    def validate_outcome(self, value):
        return self.validate_choice(
            value,
            [item[0] for item in Case._meta.get_field("outcome").choices],
            "Outcome",
        )

    def validate(self, data):
        # NS1 Result Validation
        if data.get("ns1_result") != "PR" and data.get("date_ns1") is None:
            raise Exception(
                "NS1 date must not be empty",
            )
        if data.get("ns1_result") == "PR" and data.get("date_ns1") is not None:
            raise Exception(
                "NS1 date must be null",
            )

        # IgG ELISA Validation
        if data.get("igg_elisa") != "PR" and data.get("date_igg_elisa") is None:
            raise Exception(
                "IgG ELISA date must not be empty",
            )
        if data.get("igg_elisa") == "PR" and data.get("date_igg_elisa") is not None:
            raise Exception(
                "IgG ELISA date must be null",
            )

        # IgM ELISA Validation
        if data.get("igm_elisa") != "PR" and data.get("date_igm_elisa") is None:
            raise Exception(
                "IgM ELISA date must not be empty",
            )
        if data.get("igm_elisa") == "PR" and data.get("date_igm_elisa") is not None:
            raise Exception(
                "IgM ELISA date must be null",
            )

        # Death Validation
        if data.get("outcome") == "D" and data.get("date_death") is None:
            raise Exception(
                "Death date must not be empty",
            )
        if data.get("outcome") == "A" and data.get("date_death") is not None:
            raise Exception(
                "Death date must be null",
            )

        return data

    def create(self, validated_data):
        # Extract the patient data from the nested data
        patient_data = validated_data.pop("patient")

        # Find or create the patient
        patient, _ = Patient.objects.update_or_create(
            first_name=patient_data["first_name"],
            last_name=patient_data["last_name"],
            middle_name=patient_data.get("middle_name", ""),
            suffix=patient_data.get("suffix", ""),
            date_of_birth=patient_data["date_of_birth"],
            sex=patient_data["sex"],
            defaults=patient_data,
        )

        # Check if a case with the same patient and date_onset already exists
        date_con = validated_data["date_con"]
        if Case.all_objects.filter(
            patient=patient,
            date_con=date_con,
        ).exists():
            raise Exception(
                "Case with the same patient and date of consultation already exists",
            )

        # Check if a case with the same patient that is already dead
        if Case.all_objects.filter(
            patient=patient,
            outcome="D",
        ).exists():
            raise Exception(
                "Patient is already dead",
            )

        # Create and return the new case linked to the patient
        return Case.objects.create(
            patient=patient,
            **validated_data,
        )
