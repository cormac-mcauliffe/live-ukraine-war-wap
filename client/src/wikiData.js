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
        console.error(`Client failed to load Ukraine data from backend ${error}`)
    }
};

export default loadGeoJson;

