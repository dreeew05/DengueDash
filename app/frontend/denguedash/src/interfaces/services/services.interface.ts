interface SuccessResponse {
  success: string;
}

export interface BaseServiceResponse extends SuccessResponse {
  message: string;
}

export interface BaseErrorResponse extends SuccessResponse {
  message: string | { [key: string]: string[] };
}

export interface PatientErrorResponse {
  patient: string | { [key: string]: string[] };
}

export interface ReportFormResponse extends SuccessResponse {
  message: PatientErrorResponse;
}
