import { axiosClient } from "./auth.service";

const OPERATION = "DELETE";
const DEFAULT_DATA = null;
const DEFAULT_PARAMS = {};

const deleteCase = async (caseId: number) => {
  return axiosClient(
    `cases/delete/${caseId}/`,
    OPERATION,
    DEFAULT_DATA,
    DEFAULT_PARAMS
  );
};

const deleteUser = async (userId: number) => {
  return axiosClient(
    `user/delete/${userId}/`,
    OPERATION,
    DEFAULT_DATA,
    DEFAULT_PARAMS
  );
};

const deleteDRU = async (druId: number) => {
  return axiosClient(
    `dru/delete/${druId}/`,
    OPERATION,
    DEFAULT_DATA,
    DEFAULT_PARAMS
  );
};

const unbanUser = async (userId: number) => {
  return axiosClient(
    `user/unban/${userId}/`,
    OPERATION,
    DEFAULT_DATA,
    DEFAULT_PARAMS
  );
};

const deleteService = {
  deleteCase,
  deleteUser,
  deleteDRU,
  unbanUser,
};

export default deleteService;
