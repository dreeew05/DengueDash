import { PaginationInterface } from "../common/pagination-interface";

export type LaboratoryResultDisplay =
  | "Pending Result"
  | "Positive"
  | "Negative"
  | "Equivocal";

export type CaseClassificationDisplay = "Suspected" | "Confirmed" | "Probable";

export type OutcomeDisplay = "Alive" | "Deceased";

export type CaseCanBeUpdatedFields = {
  ns1_result_display: LaboratoryResultDisplay;
  date_ns1: string | null;
  igg_elisa_display: LaboratoryResultDisplay;
  date_igg_elisa: string | null;
  igm_elisa_display: LaboratoryResultDisplay;
  date_igm_elisa: string | null;
  pcr_display: LaboratoryResultDisplay;
  date_pcr: string | null;
  outcome_display: OutcomeDisplay;
  date_death: string | null;
};

interface Person {
  full_name: string;
}
interface Patient extends Person {
  addr_barangay: string;
  addr_city: string;
}

export interface Case {
  case_id: number;
  date_con: string;
  clncl_class_display: string;
  case_class_display: CaseClassificationDisplay;
  patient: Patient;
}

export interface DengueReportPagination extends PaginationInterface {
  results: Case[];
}

export interface PatientView extends Person {
  full_address: string;
  date_of_birth: string;
  sex_display: string;
  civil_status_display: string;
  date_first_vax: string;
  date_last_vax: string;
}

interface Interviewer extends Person {
  full_name: string;
  dru: string;
}
export interface CaseView extends Omit<Case, "patient"> {
  is_admt: boolean;
  date_onset: string;
  ns1_result_display: LaboratoryResultDisplay;
  date_ns1: string | null;
  igg_elisa_display: LaboratoryResultDisplay;
  date_igg_elisa: string | null;
  igm_elisa_display: LaboratoryResultDisplay;
  date_igm_elisa: string | null;
  pcr_display: LaboratoryResultDisplay;
  date_pcr: string | null;
  outcome_display: OutcomeDisplay;
  date_death: string | null;
  patient: PatientView;
  interviewer: Interviewer;
  can_delete: boolean;
}
