from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django.http import JsonResponse
from django.db import transaction
from io import StringIO
from datetime import datetime
import csv
from case.serializers.case_create_serializer import (
    CaseSerializer,
)


class PatientCaseView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user_id = request.user.id

        # Insert interviewer id to the data
        request.data["interviewer"] = user_id

        serializer = CaseSerializer(
            data=request.data,
        )

        try:
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(
                    {
                        "success": True,
                        "message": "Case created successfully.",
                    }
                )

        except Exception as e:
            return JsonResponse(
                {
                    "success": False,
                    "message": str(e),
                },
            )

        # Still errors but not validation errors
        # Built-in error handling from the defined structure from the model
        return JsonResponse(
            {
                "success": False,
                "message": serializer.errors,
            },
        )


class PatientCaseBulkUploadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def __init__(self):
        super().__init__()
        self.interviewer_id = None
        self.csv_file = None
        self.valid_data = []

    def validate_csv_file(self):
        if not self.csv_file:
            return JsonResponse(
                {
                    "success": False,
                    "message": "No file uploaded.",
                }
            )
        if not self.csv_file.name.endswith(".csv"):
            return JsonResponse(
                {
                    "success": False,
                    "message": "File is not a CSV.",
                }
            )
        # todo: file size limit
        if self.csv_file.size > 1024 * 1024 * 20:
            return JsonResponse(
                {
                    "success": False,
                    "message": "File is too large.",
                }
            )

        return None

    def parse_csv(self):
        try:
            file_content = self.csv_file.read().decode("utf-8")
            file_io = StringIO(file_content)
            reader = csv.DictReader(file_io)

            expected_headers = {
                "First Name",
                "Last Name",
                "Date of Birth",
                "Sex",
                "Civil Status",
                "Region",
                "Province",
                "City",
                "Barangay",
                "Street",
                "House No.",
                "Date of First Vaccination",
                "Date of Last Vaccination",
                "Date of Consultation",
                "Is Admitted",
                "Date Onset of Illness",
                "Clinical Classification",
                "NS1",
                "Date done (NS1)",
                "IgG ELISA",
                "Date done (IgG ELISA)",
                "IgM ELISA",
                "Date done (IgM ELISA)",
                "PCR",
                "Date done (PCR)",
                "Case Classification",
                "Outcome",
                "Date of Death",
            }

            if not reader.fieldnames or not expected_headers.issubset(
                set(reader.fieldnames)
            ):
                missing_headers = expected_headers - (
                    set(reader.fieldnames) if reader.fieldnames else set()
                )

                return JsonResponse(
                    {
                        "success": False,
                        "message": (
                            f"Missing required CSV columns: {', '.join(missing_headers)}."
                            if missing_headers
                            else "CSV headers are missing or invalid."
                        ),
                    }
                )

            curr_row = 1  # 1 is Header
            for row in reader:
                curr_row += 1

                # Helper to get value or None if empty string, for optional fields
                def get_val(key, default=None):
                    val = row.get(key, "").strip()
                    return val if val else default

                # Helper to convert date string to date object
                def parse_date(date_str):
                    if date_str:
                        date_obj = datetime.strptime(date_str, "%Y/%m/%d")
                        formatted_date = date_obj.strftime("%Y-%m-%d")
                        return formatted_date
                    return None

                is_admitted_raw = get_val("Is Admitted", "false").lower()
                if is_admitted_raw in ["y", "yes"]:
                    is_admitted = True
                elif is_admitted_raw in ["n", "no"]:
                    is_admitted = False
                else:
                    return JsonResponse(
                        {
                            "success": False,
                            "message": f"Invalid value for 'Is Admitted' at row {curr_row}. Expected values are ('Y', 'N', 'Yes', 'No').",
                        },
                    )

                house_no_raw = get_val("House No.")
                addr_house_no = None
                if house_no_raw:
                    try:
                        addr_house_no = int(house_no_raw)
                    except ValueError:
                        return JsonResponse(
                            {
                                "success": False,
                                "message": f"Invalid numeric value for 'House No.' at row {curr_row}.",
                            },
                        )

                patient_data = {
                    "first_name": get_val("First Name"),
                    "middle_name": get_val("Middle Name", ""),
                    "last_name": get_val("Last Name"),
                    "suffix": get_val("Suffix", ""),
                    "sex": get_val("Sex"),
                    "civil_status": get_val("Civil Status"),
                    "date_of_birth": parse_date(
                        get_val("Date of Birth"),
                    ),
                    "addr_region": get_val("Region"),
                    "addr_province": get_val("Province"),
                    "addr_city": get_val("City"),
                    "addr_barangay": get_val("Barangay"),
                    "addr_street": get_val("Street", ""),
                    "addr_house_no": addr_house_no,
                    "date_first_vax": parse_date(
                        get_val("Date of First Vaccination"),
                    ),
                    "date_last_vax": parse_date(
                        get_val("Date of Last Vaccination"),
                    ),
                }

                case_data = {
                    "patient": patient_data,
                    "interviewer": self.interviewer_id,
                    "date_con": parse_date(
                        get_val("Date of Consultation"),
                    ),
                    "is_admt": is_admitted,
                    "date_onset": parse_date(
                        get_val("Date Onset of Illness"),
                    ),
                    "clncl_class": get_val("Clinical Classification"),
                    "ns1_result": get_val("NS1"),
                    "date_ns1": parse_date(
                        get_val("Date done (NS1)"),
                    ),
                    "igg_elisa": get_val("IgG ELISA"),
                    "date_igg_elisa": parse_date(
                        get_val("Date done (IgG ELISA)"),
                    ),
                    "igm_elisa": get_val("IgM ELISA"),
                    "date_igm_elisa": parse_date(
                        get_val("Date done (IgM ELISA)"),
                    ),
                    "pcr": get_val("PCR"),
                    "date_pcr": parse_date(
                        get_val("Date done (PCR)"),
                    ),
                    "case_class": get_val("Case Classification"),
                    "outcome": get_val("Outcome"),
                    "date_death": parse_date(
                        get_val("Date of Death"),
                    ),
                }

                # print(f"Row {curr_row}: {case_data}")

                # Validate the data
                serializer = CaseSerializer(data=case_data)
                if not serializer.is_valid():
                    error_messages = []
                    for field, errors in serializer.errors.items():
                        if field == "patient" and isinstance(
                            errors, dict
                        ):  # Nested patient errors
                            for p_field, p_errors in errors.items():
                                error_messages.append(
                                    f"Patient's {p_field}: {'; '.join(p_errors)}"
                                )
                        else:
                            error_messages.append(
                                f"{field.replace('_', ' ').title()}: {'; '.join(errors) if isinstance(errors, list) else errors}"
                            )
                    return JsonResponse(
                        {
                            "success": False,
                            "message": f"Validation error at CSV row {curr_row}: {'. '.join(error_messages)}",
                        },
                    )
                self.valid_data.append(case_data)

            # Check contents for empty data
            if not self.valid_data and curr_row > 1:
                return JsonResponse(
                    {
                        "success": False,
                        "message": "No valid data found in the CSV file.",
                    }
                )
            elif not self.valid_data and curr_row == 1 and reader.fieldnames:
                return JsonResponse(
                    {
                        "success": False,
                        "message": "CSV file is empty.",
                    }
                )
            elif not reader.fieldnames and not file_content.strip():
                return JsonResponse(
                    {
                        "success": False,
                        "message": "CSV file is empty.",
                    }
                )

        except UnicodeDecodeError:
            return JsonResponse(
                {
                    "success": False,
                    "message": "Error decoding the CSV file. Please ensure it is in UTF-8 format.",
                }
            )

        except csv.Error as e:
            return JsonResponse(
                {
                    "success": False,
                    "message": f"Error reading CSV file: {str(e)}. Please ensure it's a valid CSV format.",
                },
            )

        except Exception as e:
            return JsonResponse(
                {
                    "success": False,
                    "message": f"An unexpected error occurred: {str(e)} at row {curr_row}.",
                }
            )

        return None

    def save_data(self):
        try:
            with transaction.atomic():
                for curr_row, validated_entry in enumerate(self.valid_data):
                    serializer = CaseSerializer(data=validated_entry)
                    if serializer.is_valid():
                        serializer.save()
        except ValidationError as e:
            return JsonResponse(
                {
                    "success": False,
                    "message": f"Error saving data: {str(e)}",
                }
            )
        except Exception as e:
            return JsonResponse(
                {
                    "success": False,
                    "message": f"An unexpected error occurred: {str(e)} at row {curr_row + 2}.",  # +2 because of header row
                }
            )

        return None

    def post(self, request):
        self.interviewer_id = request.user.id
        self.csv_file = request.FILES.get("file")
        self.valid_data = []

        validated_response = self.validate_csv_file()
        if validated_response:
            return validated_response

        parse_response = self.parse_csv()
        if parse_response:
            return parse_response

        if not self.valid_data:
            return JsonResponse(
                {
                    "success": False,
                    "message": "No valid data found in the CSV file.",
                }
            )

        save_response = self.save_data()
        if save_response:
            return save_response

        return JsonResponse(
            {
                "success": True,
                "message": f"{len(self.valid_data)} cases created successfully.",
            }
        )
