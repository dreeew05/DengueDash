export interface SignUpUserInterface {
  password_confirm: string;
  dru: number;
  first_name: string;
  last_name: string;
  middle_name?: string | undefined;
  password: string;
  region: string;
  sex: string;
  surveillance_unit: string;
}
