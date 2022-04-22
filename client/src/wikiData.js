// Simple response test from server
async function fetchServerHello() {
    try {
        const response = await fetch('/api/hello');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const serverHello = await response.json();
        return serverHello;
    }
    catch(error) {
        console.error(`Could not get hello ${error}`)
    }
}

const serverHelloPromise = fetchServerHello();
serverHelloPromise.then((serverHello) => console.log(serverHello));

// To load GeoJSON data from backend
async function loadGeoJson() {
    try {
        const response = await fetch('/api/citiesData');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const citiesDataGeoJsonObj = await response.json();
        return citiesDataGeoJsonObj;
    }
    catch(error) {
        console.error(`Frontend failed to get cities data ${error}`)
    }
};

export default loadGeoJson;

