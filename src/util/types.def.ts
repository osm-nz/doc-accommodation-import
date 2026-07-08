export interface LodgeDetail {
  access: ('Vehicle' | 'Boat' | 'Foot')[];
  assetId: number;
  hasAlerts: boolean;
  introduction: string;
  introductionAbbreviated: string;
  introductionThumbnail: string;
  name: string;
  occupancy: ('Sole' | 'Shared')[];
  status: 'OPEN' | 'CLSD';
  webPage: `https://www.doc.govt.nz/link/${string}.aspx`;
}

export interface LodgeBasic {
  attributes: {
    EQUIPMENT: number;
    TechObjectName: string;
    SubObjectType: string;
    ObjectType: string;
    status: LodgeDetail['status'];
  };
  geometry: {
    /** NZTM */
    x: number;
    /** NZTM */
    y: number;
  };
}

export interface LodgeGeoJson {
  features: LodgeBasic[];
}

export interface Hut {
  /** @deprecated */ OBJECTID: number;
  name: string;
  /** @deprecated */ place: string;
  /** @deprecated */ region: string;
  status: 'OPEN' | 'CLSD';
  bookable: 'No' | 'Yes';
  facilities: string;
  /** @deprecated */ hasAlerts: string;
  introductionThumbnail: string;
  staticLink: `https://www.doc.govt.nz/link/${string}.aspx`;
  /** @deprecated */ locationString: string;
  /** @deprecated NZTM */ x: number;
  /** @deprecated NZTM */ y: number;
  assetId: number;
  /** @deprecated ISO Date */ dateLoadedToGIS: string;
  /** @deprecated */ GlobalID: string;
}

export interface Campsite extends Hut {
  introduction: string;
  campsiteCategory:
    'Backcountry' | 'Standard' | 'Great Walk' | 'Basic' | 'Scenic';
  numberOfPoweredSites: number;
  numberOfUnpoweredSites: number;
  /** @deprecated */ free: null;
  /** @deprecated */ activities: string | null;
  dogsAllowed:
    | `Dogs allowed. Keep dog under control at all times.${string}`
    | `Dogs on a leash only${string}`
    | `Dogs with a DOC permit${string}`
    | `No dogs${string}`
    | 'Not Applicable';
  /** @deprecated */ landscape: string;
  /** @deprecated */ access: string;
}
