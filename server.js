const express = require('express');
const { loadCitiesGeoJson } = require('./mapdata.js');
const { DataCache } = require('./datacache.js');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Iniate the self-resetting cache to be the latest Ukraine data fetched from Wikipedia
// and parsed to GeoJSON
const citiesDataGeoJson = new DataCache(loadCitiesGeoJson, 5);

// performance measurement variables
let t0, t1;

// Pull latest version of Ukraine data from the cache and send to client
app.get('/api/citiesData', async (req, res) => {
  t0 = performance.now();
  citiesDataGeoJson.getData()
    .then(
      (citiesData) => { 
        res.send(citiesData);
        t1 = performance.now();
        console.log(`Time taken for BE to send wikiData to FE: ${t1 - t0} milliseconds.`); 
      }
    );
  }
);

app.listen(port, () => console.log(`Listening on port ${port}`));
