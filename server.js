const express = require('express');
const fetch = require('node-fetch');

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

async function fetchCitiesData() {
    try {
        const response = await fetch('https://en.wikipedia.org/w/index.php?title=Module:Russo-Ukrainian_War_detailed_map&action=raw');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const citiesData = await response.text();
        return citiesData;
        }
        catch(error) {
        console.log(error);
        }
}

app.get('/api/citiesData', async (req, res) => {
    const citiesDataPromise = fetchCitiesData();
    citiesDataPromise.then((citiesData) => res.send(citiesData));
  });


app.listen(port, () => console.log(`Listening on port ${port}`));
