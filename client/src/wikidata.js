// To load GeoJSON data from the backend
async function loadGeoJson() {
    try {
        const response = await fetch('/api/citiesData');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        return await response.json();
    }
    catch(error) {
        console.error(`Client failed to load Ukraine data from backend ${error}`)
    }
};

export default loadGeoJson;

