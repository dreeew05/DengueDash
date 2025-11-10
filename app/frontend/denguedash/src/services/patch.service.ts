import { CaseUpdateForm } from "@/components/dengue-reports/UpdateCaseDialog";
import { axiosClient } from "./auth.service";
import { UpdatePasswordInterface } from "@/interfaces/account/user-interface";

const OPERATION = "PATCH";
const DEFAULT_DATA = null;
const DEFAULT_PARAMS = {};

const approveUserVerification = async (userId: number) => {
  return axiosClient(
    `user/verify/${userId}/`,
    OPERATION,
    DEFAULT_DATA,
    DEFAULT_PARAMS
  );
};

const toggleUserRole = async (userId: number) => {
  return axiosClient(
    `user/toggle-role/${userId}/`,
    OPERATION,
    DEFAULT_DATA,
    DEFAULT_PARAMS
  );
};

const updateCaseStatus = async (caseId: number, formData: CaseUpdateForm) => {
  return axiosClient(
    `cases/update/${caseId}/`,
    OPERATION,
    formData,
    DEFAULT_PARAMS
  );
};

const updatePassword = async (formData: UpdatePasswordInterface) => {
  return axiosClient(
    "user/me/update/password/",
    OPERATION,
    formData,
    DEFAULT_PARAMS
  );
};

const patchService = {
  approveUserVerification,
  toggleUserRole,
  updateCaseStatus,
  updatePassword,
};

export default patchService;
