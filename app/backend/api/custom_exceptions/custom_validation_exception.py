from rest_framework.exceptions import APIException


class CustomValidationException(APIException):
    status_code = 400
    default_detail = "A validation error occurred."
    default_code = "validation_error"

    def __init__(self, detail, status_code=None):
        if status_code is not None:
            self.status_code = status_code
        self.detail = {
            "success": False,
            "message": detail,
        }
