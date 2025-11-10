declare module "phil-reg-prov-mun-brgy" {
  export interface Region {
    name: string;
    reg_code: string;
  }

  export interface Province {
    name: string;
    reg_code: string;
    prov_code: string;
  }

  export interface Municipality {
    name: string;
    prov_code: string;
    mun_code: string;
  }

  export interface Barangay {
    name: string;
    mun_code: string;
  }

  export const regions: Region[];
  export const provinces: Province[];
  export const city_mun: Municipality[];
  export const barangays: Barangay[];

  export function getProvincesByRegion(regionCode: string): Province[];
  export function getCityMunByProvince(provinceCode: string): Municipality[];
  export function getBarangayByMun(municipalityCode: string): Barangay[];
  export function sort(array: any[], sortOrder?: "A" | "Z"): any[];
}
