export interface ByDateInterface {
  label: string;
  case_count: number;
  death_count: number;
  outbreak_threshold: number;
}

export interface ByLocationInterface {
  location: string;
  case_count: number;
  death_count: number;
}

export interface CurrentCaseCount {
  total_cases: number;
  total_deaths: number;
  total_severe_cases: number;
  total_lab_confirmed_cases: number;
  weekly_cases: number | null;
  weekly_deaths: number | null;
  weekly_severe_cases: number | null;
  weekly_lab_confirmed_cases: number | null;
}
