interface DRU {
  dru_name: string;
  id: number;
}

interface SurveillanceUnit {
  su_name: string;
  drus: DRU[];
}

interface Region {
  region_name: string;
  surveillance_units: SurveillanceUnit[];
}

export interface DRUHierarchy {
  data: Region[];
}
