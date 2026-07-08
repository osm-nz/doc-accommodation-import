import assert from 'node:assert';
import type { Feature, FeatureCollection, Point } from 'geojson';
import type { Hut } from '../util/types.def.js';
import { type DocStandardisedRow, FACILITIES_MAP } from '../util/constants.js';

/** huts are easy, thanks arcgis */
export async function getHuts() {
  console.info('fetching huts...');
  const huts = await fetch(
    'https://opendata.arcgis.com/api/v3/datasets/7f7321caf77b4101b9573db4575dd794_0/downloads/data?format=geojson&spatialRefId=4326',
  ).then((r) => r.json() as Promise<FeatureCollection<Point, Hut>>);

  const standardised: Feature<Point, DocStandardisedRow>[] = [];
  for (const hut of huts.features) {
    const H = hut.properties;
    const facilities = H.facilities?.split(',').map((row) => row.trim()) || [];

    assert.ok(hut.geometry.type === 'Point');

    const row: DocStandardisedRow = {
      // these tags are on every feature
      operator: 'Department of Conservation',
      'operator:wikidata': 'Q1191417',
      tourism: 'wilderness_hut',

      name: H.name.trim(),
      'ref:doc': `${H.assetId}`,

      website: H.staticLink.replace('.aspx', '').replace('www.', ''),
      image: H.introductionThumbnail.startsWith(
        'https://www.doc.govt.nz/thumbs',
      )
        ? H.introductionThumbnail
        : undefined,
      reservation: (<const>{ Yes: 'required', No: 'no' })[H.bookable],

      // these might be overriden, if not we add these default values
      mattress: 'no',
      fireplace: 'no',
      toilets: 'no',
      drinking_water: 'no',

      // this data is only available from the API, not from GIS:
      // - numberOfBunks
      // - hutCategory
      // - introduction
    };
    for (const fac of facilities) {
      if (fac in FACILITIES_MAP) {
        Object.assign(row, FACILITIES_MAP[fac as never]);
      } else {
        console.warn('!\t', fac);
      }
    }
    standardised.push({ ...hut, properties: row });
  }

  return standardised;
}
