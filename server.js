const express = require('express');
const { loadCitiesGeoJson } = require('./mapdata.js');
const { DataCache } = require('./datacache.js');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Iniate the self-resetting cache to be the latest Ukraine data fetched from Wikipedia
// and parsed to GeoJSON
const citiesDataGeoJson = new DataCache(loadCitiesGeoJson, 5);

// performance measurement variables
let t0, t1;

// Api calls
// Pull latest version of Ukraine data from the cache and send to client
// Throw error if backend takes longer than 0.1 seconds to serve from the cache
app.get('/api/citiesData', async (req, res) => {
  try {
    t0 = performance.now();
    citiesDataGeoJson.getData()
      .then(
        (citiesData) => { 
          res.send(citiesData);
          t1 = performance.now();
          if ( t1 - t0 > 100 ) {
            throw new Error(`Perf issue: Backend took ${t1 - t0} milliseconds to serve from the cache`)
          }
        }
      );
    }
    catch (error) {
      console.error(error);
    }
  }
);

if (process.env.NODE_ENV === 'production') {
  // Serve any static files i.e. the React frontend
  app.use(express.static(path.join(__dirname, 'client/build')));

  // All other GET requests not handled above will return the React frontend
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
