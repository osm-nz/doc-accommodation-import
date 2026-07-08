/* eslint-disable dot-notation */
import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import {
  type Config,
  type TagDiff,
  run,
  writeJsonL,
} from '@osm-conflation-engine/cli';
import type { Feature, Point } from 'geojson';
import {
  ALL_TAGS,
  DOC_SOURCE_FILE,
  type DocStandardisedRow,
} from './util/constants.js';
import { getHuts } from './download/huts.js';
import { getCampsites } from './download/campsites.js';
import { getLodges } from './download/lodges.js';

const config: Config = {
  $schema:
    'https://unpkg.com/@osm-conflation-engine/cli/dist/config.schema.json',
  metadata: {
    region: 'NZ',
    name: 'DOC Huts and Campsites',
    description:
      'Huts, Campsites, and Lodges from the Department of Conservation (DoC), NZ',
    git_repository: 'https://github.com/osm-nz/doc-accommodation-import',
    wiki_page: 'https://osm.wiki/DOC',
  },
  source_data: {
    type: 'file',
    file: DOC_SOURCE_FILE,
  },
  o_data: {
    source: {
      type: 'overpass',
      // overpass_query_file is not specified, so it'll default to downloading everything with ref:doc
      overpass_server_url:
        'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    },
    tags_to_keep: ['check_date', ...Object.keys(ALL_TAGS)],
  },
  merge: {
    osm_key: 'ref:doc',
    dataset_column: 'ref:doc',
  },
};

// first, download all the data
const docData: Feature<Point, DocStandardisedRow>[] = [
  ...(await getHuts()),
  ...(await getCampsites()),
  ...(await getLodges()),
];
await fs.mkdir(dirname(DOC_SOURCE_FILE), { recursive: true });
await writeJsonL(DOC_SOURCE_FILE, docData);

await run<Point, DocStandardisedRow>(
  config,
  {
    // this is not really used, it's a low-volume import; mappers
    // can manually fix each case
    getLocalKeyForOsm: (osm) => osm.tags?.['name'] || '',
    getLocalKeyForSource: (row) => row.properties['name'] || '',

    create({ source }) {
      return {
        selection: undefined, // ignore suggestions (it's a low-volume import; mappers can manually fix each case)
        diff: { tags: source.properties, geometry: source.geometry },
      };
    },

    mergeOneToOne({ osm, source }) {
      /** for these keys, we will never try to override the value in OSM */
      const KEYS_TO_RESPECT = new Set(['name']);

      const tagDiff: TagDiff = {};
      for (const [key, value] of Object.entries(source.properties)) {
        if (
          // if the OSM tag is missing
          !osm.tags?.[key] ||
          // or if the OSM value is wrong (skip KEYS_TO_RESPECT)
          (osm.tags?.[key] !== value && !KEYS_TO_RESPECT.has(key))
        ) {
          tagDiff[key] = value;
        }
      }

      // if the only thing wrong is the image, then don't bother
      // suggesting to update it.
      if (Object.keys(tagDiff).join('|') === 'image') {
        delete tagDiff['image'];
      }

      return { diff: { tags: tagDiff } };
    },
  },
  { use_cache: true },
);
