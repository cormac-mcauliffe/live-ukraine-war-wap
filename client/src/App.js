import React, {useRef, useEffect } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import loadGeoJson from './wikidata.js';

// Handle production and local dev mode
if (process.env.NODE_ENV === 'production') {
    mapboxgl.accessToken = 'pk.eyJ1IjoiY29ybWFjbWNhIiwiYSI6ImNsM2J3b3JibTBqd3Yza25ybDl4dDM1b24ifQ.r2_dFFzUXqa3lo5jCZ2N0A';
} else {
    mapboxgl.accessToken = process.env.REACT_APP_LOCAL_DEV_ACCESS_TOKEN;
};

// Define filtered data layer objects (in correct Mapbox format) to be displayed on the map after both the map has loaded and the GeoJSON data has been attached to the map
// Add filtered red layer for Russian controlled mark names: ["Location dot red.svg","Fighter-jet-red-icon.svg","Anchor pictogram red.svg","Icon NuclearPowerPlant-red.svg","BSicon STR+r red.svg"]
const russianOccupied = {
    'id': 'russianControlled',
    'source': 'wikiData',
    'type': 'circle',
    'paint': {
        'circle-color': '#F7455D',
        'circle-radius': 5,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff'
    },
    'filter': ['in', ['get', 'mark'], ["literal",["Location dot red.svg","Fighter-jet-red-icon.svg","Anchor pictogram red.svg","Icon NuclearPowerPlant-red.svg","BSicon STR+r red.svg"]]]
};

// Add filtered layer for Ukrainian controlled locations currently under active Russian pressure: ["80x80-red-blue-anim.gif","Map-arcNE-red.svg","Map-arcSE-red.svg","Map-circle-red.svg","Map-arcNN-red.svg"]
const underRussianPressure = {
    'id': 'russianPressured',
    'source': 'wikiData',
    'type': 'circle',
    'paint': {
        'circle-color': '#333EFF',
        'circle-radius': 4,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#F7455D'
    },
    'filter': ['any',
        ['in', ['get', 'mark'], ["literal",["80x80-red-blue-anim.gif","Map-arcNE-red.svg","Map-arcSE-red.svg","Map-circle-red.svg","Map-arcNN-red.svg"]]],
        // "Azovstall Metallurgical Combine" needs explicit treatment due to the unique way it appears in the wikipedia data
        ['all',
            ['in', ['get', 'label'], ["literal",["Azovstal Metallurgical Combine"]]],
            ['in', ['get', 'mark'], ["literal",["Icon NuclearPowerPlant-blue.svg"]]]
        ]
    ]
}

// Export map-building function
export default function App() {
    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            bounds: [22, 43.8, 40.6, 52.5], // fit initial map load to cover bounding box of Ukraine
            minZoom: 3,
        });
        // Add zoom navigation bar
        map.current.addControl(new mapboxgl.NavigationControl({
            showCompass: false
        }));

        // Once the map has loaded, import the Ukraine wiki map data as GeoJSON string and apply filtered data layers to the map; 
        
        map.current.on('load', 
            // Place all async data loading and display logic inside an async function
            // This allows us to only start adding the data to the map until after the promise returned by the imported (and async) function loadCitiesGeoJson has been resolved to the GeoJSON string.
            async () => { 
                let citiesObj = await loadGeoJson();
                // add the geoJSON as a data source to the map
                map.current.addSource('wikiData', {
                    type: 'geojson',
                    data: citiesObj,
                });

                // Add filtered red layer for Russian controlled locations.
                map.current.addLayer(russianOccupied);

                // Add filtered layer for Ukrainian controlled locations currently under active Russian pressure.
                map.current.addLayer(underRussianPressure);
            }
        );
    });

    return (
        <div>
            <div ref={mapContainer} className="map-container" />
            <div id="status-legend" className="legend">
                <div><span id="russian-control"></span>Russian occupied</div>
                <div><span id="russian-pressure"></span>Under Russian pressure</div>
                <p id="wiki-source">Live Russo-Ukrainian war data <br></br> pulled from <a href="https://en.wikipedia.org/wiki/Module:Russo-Ukrainian_War_detailed_map" target="_blank" rel="noopener noreferrer">Wikipedia</a></p>
            </div>
         </div>
      );
}
