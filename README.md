This repo contains the code used to import DOC huts & campsites into OpenStreetMap.

It uses the [osm-conflation-engine](https://github.com/osm-nz/osm-conflation-engine), which means that the conflation process runs automatically each month.
You can see the results [👉on the website👈](https://osm-nz.github.io/osm-conflation-engine/#/project/ref:doc)

To run this script:

1. Create a file called `.env` which should contain `API_V1_KEY=XXXXXX`, where `XXXXXX` is the v1 token (which is quite hard to obtain nowadays).
2. Run `npm start`.
