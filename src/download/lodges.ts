import type { Feature, Point } from 'geojson';
import type {
  LodgeBasic,
  LodgeDetail,
  LodgeGeoJson,
} from '../util/types.def.js';
import type { DocStandardisedRow } from '../util/constants.js';
import { nztmToWgs } from '../util/nztmToWgs.js';

const { API_V1_KEY } = process.env;
if (!API_V1_KEY) throw new ReferenceError('No API_V1_KEY environment variable');

/** lodges are not available from GIS nor from the v2 API. */
export async function getLodges() {
  console.info('fetching lodges...');
  const lodgeList = await fetch('https://api.doc.govt.nz/v1/dto/lodges', {
    headers: { 'x-api-key': API_V1_KEY },
  }).then((r) => r.json() as Promise<LodgeGeoJson>);

  const lodges: { detail: Partial<LodgeDetail>; basic: LodgeBasic }[] = [];
  for (const [i, basic] of lodgeList.features.entries()) {
    const assetId = basic.attributes.EQUIPMENT;
    console.info(
      `\tfetching lodge ${i + 1}/${lodgeList.features.length} (${assetId})...`,
    );

    const detail = await fetch(
      `https://api.doc.govt.nz/v1/dto/lodges/${assetId}/detail`,
      { headers: { 'x-api-key': API_V1_KEY } },
    ).then((r) => r.json() as Promise<LodgeDetail>);

    lodges.push({ detail, basic });
  }
  console.info('lodges done.');

  const standardised: Feature<Point, DocStandardisedRow>[] = [];
  for (const lodge of lodges) {
    const id = lodge.basic.attributes.EQUIPMENT;
    standardised.push({
      type: 'Feature',
      id,
      geometry: {
        type: 'Point',
        coordinates: nztmToWgs(lodge.basic.geometry.x, lodge.basic.geometry.y),
      },
      properties: {
        // these tags are on every feature
        operator: 'Department of Conservation',
        'operator:wikidata': 'Q1191417',
        tourism: 'wilderness_hut',

        name: (
          lodge.detail.name || lodge.basic.attributes.TechObjectName
        ).trim(),
        'ref:doc': `${id}`,
        website: lodge.detail.webPage?.replace('.aspx', '').replace('www.', ''),
        group_only:
          lodge.detail.occupancy?.length &&
          !lodge.detail.occupancy.includes('Shared')
            ? 'yes'
            : undefined,

        // this data is not available from the API v1, nor from API v2, nor from GIS
        // - bookable
        // - facilities
        // - numberOfBunks
        // - hutCategory
        // - introduction
      },
    });
  }
  return standardised;
}
