import React, {useRef, useEffect } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import loadCitiesGeoJson from './wikiData.js';

mapboxgl.accessToken = 'pk.eyJ1IjoiY29ybWFjbWNhIiwiYSI6ImNsMHR2M3d0NTAwNzQzY21vMGlneGF3ZWEifQ.AGMAoX7Am6YDr6DgxIzGDg';

export default function App() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const lng = 31.39;
    const lat = 48.67;
    const zoom = 4.41;
    // let citiesGeoJson;
    // let citiesObj;

    useEffect(() => {
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lng, lat],
            zoom: zoom
        });
        
        map.current.addControl(new mapboxgl.NavigationControl({
            showCompass: false
        }));

        // Import the Ukraine wiki map data as GeoJSON string. Use an IIFE -- Immediately Invoked Function Expression as well as using async which allows us to pause the execution until the promise returned by the imported (and async) function loadCitiesGeoJson has been resolved to the GeoJSON string.
        let citiesGeoJson;
        let citiesObj;
        (async () => { 
            citiesGeoJson = await loadCitiesGeoJson();
            // parse the JSON to deliver value a GeoJSON obj
            citiesObj = JSON.parse(citiesGeoJson);
            // If we did not use await above then this would log a promise rather than the GeoJSON object.
            console.log(citiesObj);
        })();

        map.current.on('load', () => {

            map.current.addSource('wikiData', {
                type: 'geojson',
                data: citiesObj,
            });

            
            map.current.addLayer({
                'id': 'noStatus',
                'source': 'wikiData',
                'type': 'circle',
                'paint': {
                    'circle-color': '#4264fb',
                    'circle-radius': 4,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            });
            
        })

    });
    return (
        <div>
          <div ref={mapContainer} className="map-container" />
        </div>
      );
}
