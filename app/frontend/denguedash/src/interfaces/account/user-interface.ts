import { PaginationInterface } from "../common/pagination-interface";

export interface UserBriefDetail {
  id: number;
  full_name: string;
  email: string;
  role: string;
  sex_display: string;
}

export interface UserListPagination extends PaginationInterface {
  results: UserBriefDetail[];
}

export interface UnverifiedUserBriefDetail {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
  sex_display: string;
}

export interface UnverifiedUserListPagination extends PaginationInterface {
  results: UnverifiedUserBriefDetail[];
}

export interface BlacklistedAccount {
  id: number;
  email: string;
  date_added: string;
}

export interface BlacklistedAccountListPagination extends PaginationInterface {
  results: BlacklistedAccount[];
}

export interface MyUserInterface {
  id: number;
  email: string;
  full_name: string;
  sex_display: string;
  role: string;
  dru: string;
  dru_type: string;
  id_card_image_url: string;
  profile_image_url: string;
}

export interface UserDetailInterface extends MyUserInterface {
  created_at: string | null;
  updated_at: string | null;
  last_login: string | null;
}

export interface UpdatePasswordInterface {
  old_password: string;
  new_password: string;
}
