import { join } from 'node:path';

export const OUTPUT_FOLDER = join(import.meta.dirname, '../../out');
export const TEMP_FOLDER = join(import.meta.dirname, '../../tmp');
export const DOC_SOURCE_FILE = join(TEMP_FOLDER, 'doc.geo.jsonl');

export const ALL_TAGS = (<const>{
  operator: ['Department of Conservation'],
  'operator:wikidata': ['Q1191417'],
  tourism: ['wilderness_hut', 'camp_site'],
  name: '',
  'ref:doc': '',
  website: '',
  image: '',
  reservation: ['required', 'no'],
  backcountry: ['yes'],
  'capacity:tents': '',
  'capacity:caravans': '',
  dog: ['no', 'leashed', 'unleashed', 'permit'],
  toilets: ['yes', 'no'],
  'toilets:disposal': ['flush', 'pitlatrine'],
  drinking_water: ['yes', 'untreated', 'no'],
  fireplace: ['yes', 'no'],
  mattress: ['yes', 'no'],
  kitchen: ['yes'],
  sanitary_dump_station: ['yes'],
  bbq: ['yes'],
  lit: ['yes'],
  shelter: ['yes'],
  wheelchair: ['yes', 'limited'],
  power_supply: ['yes'],
  shower: ['hot', 'cold'],
  openfire: ['yes'],
  group_only: ['yes'],
  // TODO: taginfo file
}) satisfies Record<string, string[] | ''>;

/**
 * this is a bit of magic which converts {@link ALL_TAGS} into a
 * type-defintion.
 */
export type DocStandardisedRow = {
  -readonly [P in keyof typeof ALL_TAGS]?: (typeof ALL_TAGS)[P] extends ''
    ? string
    : (typeof ALL_TAGS)[P][number];
};

/** map of the OSM tags to add for each DOC facility */
export const FACILITIES_MAP = (<const>{
  //
  // huts and campsites
  //
  'Toilets - non-flush': { toilets: 'yes', 'toilets:disposal': 'pitlatrine' },
  'Toilets - flush': { toilets: 'yes', 'toilets:disposal': 'flush' },

  'Water from tap - not treated': { drinking_water: 'untreated' },
  'Water from tap - treated': { drinking_water: 'yes' },

  'boil before use': {}, // duplicates 'Water from tap - not treated'
  'suitable for drinking': {}, // duplicates 'Water from tap - treated'

  'Water supply': {}, // we ignore this one, since it will always be accompanied by a more specific water attribute.
  'Water from stream': {}, // TODO: maybe add { note: "water available from stream" },

  //
  // huts only
  //
  Heating: { fireplace: 'yes' },
  Mattresses: { mattress: 'yes' },
  Cooking: { kitchen: 'yes' },
  Lighting: { lit: 'yes' },

  //
  // campsites only
  //
  Toilets: { toilets: 'yes' },

  'Wheelchair accessible': { wheelchair: 'yes' },
  'Wheelchair accessible with assistance': { wheelchair: 'limited' },

  'Non-powered/tent sites': {}, // default/implied, so no tags to add.
  'Powered sites': { power_supply: 'yes' },

  'Cookers/electric stove': { kitchen: 'yes' },
  'Dump station': { sanitary_dump_station: 'yes' },

  // These only occur once and are mapped as separate OSM features
  'Boat launching': {},
  Jetty: {},
  W: {}, // typo in DOC data
  Shop: {},
  Phone: {},

  BBQ: { bbq: 'yes' },
  'Shelter for cooking': { shelter: 'yes' },
  'Shower - hot': { shower: 'hot' },
  'Shower - cold': { shower: 'cold' },
  'Campfires permitted (except in fire bans)': { openfire: 'yes' },
  'Fire pit/place for campfires (except in fire bans)': { openfire: 'yes' },
}) satisfies Record<string, DocStandardisedRow>;
