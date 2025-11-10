import { axiosClient } from "./auth.service";

const OPERATION = "GET";
const DEFAULT_DATA = null;
const DEFAULT_PARAMS = {};

type FetchLocationStatsParams = {
  year?: number;
  month?: number;
  week?: number;
  date?: string;
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  group_by?: string;
};

type FetchDateStatParams = {
  year?: number | null;
  recent_weeks?: number;
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
};

// Requests that do not need authentication
const getQuickStat = async (year: number | null = null) => {
  return axiosClient(
    "cases/stat/",
    OPERATION,
    DEFAULT_DATA,
    year ? { year } : {},
    false
  );
};

const getDenguePublicLocationStats = async (
  params: FetchLocationStatsParams
) => {
  return axiosClient(
    "cases/stat/public/location",
    OPERATION,
    DEFAULT_DATA,
    params,
    false
  );
};

const getDenguePublicByDateStats = async (params: FetchDateStatParams) => {
  return axiosClient(
    "cases/stat/public/date/",
    OPERATION,
    DEFAULT_DATA,
    params,
    false
  );
};

const getDRUHierarchy = async () => {
  return axiosClient(
    "dru/hierarchy",
    OPERATION,
    DEFAULT_DATA,
    DEFAULT_PARAMS,
    false
  );
};

// Requests that must need authentication
const getMyProfile = async () => {
  return axiosClient("user/me/", OPERATION, DEFAULT_DATA, DEFAULT_PARAMS);
};

const getDengueAuthByDateStats = async (params: FetchDateStatParams) => {
  return axiosClient("cases/stat/auth/date/", OPERATION, DEFAULT_DATA, params);
};

const getDengueAuthLocationStats = async (params: Record<string, any>) => {
  return axiosClient(
    "cases/stat/auth/location",
    OPERATION,
    DEFAULT_DATA,
    params
  );
};

const getDengueReports = async (
  page: number,
  itemsPerPage: number = 8,
  search: string = ""
) => {
  return axiosClient("cases/reports/", OPERATION, DEFAULT_DATA, {
    page,
    itemsPerPage,
    search,
  });
};

const getCaseViewDetails = async (caseId: number) => {
  return axiosClient(
    `cases/reports/${caseId}/`,
    OPERATION,
    DEFAULT_DATA,
    DEFAULT_PARAMS
  );
};

const getWeatherData = async (params: Record<string, any>) => {
  return axiosClient("weather/get/", OPERATION, DEFAULT_DATA, params);
};

// ADMIN
const getUsersList = async (page: number, itemsPerPage: number = 8) => {
  return axiosClient("user/list/", OPERATION, DEFAULT_DATA, {
    page,
    itemsPerPage,
  });
};

const getUsersUnverifiedList = async (
  page: number,
  itemsPerPage: number = 8
) => {
  return axiosClient("user/list/unverified/", OPERATION, DEFAULT_DATA, {
    page,
    itemsPerPage,
  });
};

const getBlacklistedAccounts = async (
  page: number,
  itemsPerPage: number = 8
) => {
  return axiosClient("user/list/blacklisted/", OPERATION, DEFAULT_DATA, {
    page,
    itemsPerPage,
  });
};

const getUserDetails = async (userId: number) => {
  return axiosClient(`user/${userId}`, OPERATION, DEFAULT_DATA, DEFAULT_PARAMS);
};

const getUnverifiedUserDetails = async (userId: number) => {
  return axiosClient(
    `user/unverified/${userId}/`,
    OPERATION,
    DEFAULT_DATA,
    DEFAULT_PARAMS
  );
};

const getDRUList = async (page: number, itemsPerPage: number = 8) => {
  return axiosClient("dru/list/", OPERATION, DEFAULT_DATA, {
    page,
    itemsPerPage,
  });
};

const getDRUProfile = async (druId: number) => {
  return axiosClient(`dru/${druId}/`, OPERATION, DEFAULT_DATA, DEFAULT_PARAMS);
};

const getDRUTypes = async () => {
  return axiosClient("dru/types/", OPERATION, DEFAULT_DATA, DEFAULT_PARAMS);
};

// ALL
const getMyUserDetails = async () => {
  return axiosClient("user/me/", OPERATION, DEFAULT_DATA, DEFAULT_PARAMS);
};

const fetchService = {
  getQuickStat,
  getDenguePublicLocationStats,
  getDengueAuthLocationStats,
  getDenguePublicByDateStats,
  getDengueAuthByDateStats,
  getDengueReports,
  getCaseViewDetails,
  getDRUHierarchy,
  getMyProfile,
  getUsersList,
  getUsersUnverifiedList,
  getBlacklistedAccounts,
  getMyUserDetails,
  getUserDetails,
  getUnverifiedUserDetails,
  getDRUList,
  getDRUProfile,
  getDRUTypes,
  getWeatherData,
};

export default fetchService;
