const express = require('express');
const { loadCitiesGeoJson } = require('./mapdata.js');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.post('/api/world', (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

app.get('/api/citiesData', async (req, res) => {
    const citiesDataGeoJson = loadCitiesGeoJson();
    citiesDataGeoJson.then((citiesData) => res.send(citiesData));
  });


app.listen(port, () => console.log(`Listening on port ${port}`));
