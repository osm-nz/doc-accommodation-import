import assert from 'node:assert';
import type { Feature, FeatureCollection, Point } from 'geojson';
import type { Campsite } from '../util/types.def.js';
import { type DocStandardisedRow, FACILITIES_MAP } from '../util/constants.js';

/** campsites are easy, thanks arcgis */
export async function getCampsites() {
  console.info('fetching campsites...');
  const campsites = await fetch(
    'https://opendata.arcgis.com/api/v3/datasets/c417dcd7c9fb47b489df1f9f0a673190_0/downloads/data?format=geojson&spatialRefId=4326',
  ).then((r) => r.json() as Promise<FeatureCollection<Point, Campsite>>);

  const standardised: Feature<Point, DocStandardisedRow>[] = [];
  for (const campsite of campsites.features) {
    const C = campsite.properties;
    const facilities = C.facilities?.split(',').map((row) => row.trim()) || [];

    assert.ok(campsite.geometry.type === 'Point');

    const row: DocStandardisedRow = {
      // these tags are on every feature
      operator: 'Department of Conservation',
      'operator:wikidata': 'Q1191417',
      tourism: 'camp_site',

      name: C.name.trim(),
      'ref:doc': `${C.assetId}`,

      website: C.staticLink.replace('.aspx', '').replace('www.', ''),
      image: C.introductionThumbnail.startsWith(
        'https://www.doc.govt.nz/thumbs',
      )
        ? C.introductionThumbnail
        : undefined,
      reservation: (<const>{ Yes: 'required', No: 'no' })[C.bookable],
      backcountry: C.campsiteCategory === 'Backcountry' ? 'yes' : undefined,

      'capacity:tents': `${C.numberOfUnpoweredSites}`,
      'capacity:caravans': `${C.numberOfPoweredSites}`,

      dog: C.dogsAllowed.startsWith('No dogs')
        ? 'no'
        : C.dogsAllowed.startsWith('Dogs on a leash only')
          ? 'leashed'
          : C.dogsAllowed.startsWith(
                'Dogs allowed. Keep dog under control at all times.',
              )
            ? 'unleashed'
            : C.dogsAllowed.startsWith('Dogs with a DOC permit')
              ? 'permit'
              : undefined,

      // these might be overriden, if not we add these default values
      toilets: 'no',
    };
    for (const fac of facilities) {
      if (fac in FACILITIES_MAP) {
        Object.assign(row, FACILITIES_MAP[fac as never]);
      } else {
        console.warn('!\t', fac);
      }
    }
    standardised.push({ ...campsite, properties: row });
  }

  return standardised;
}
