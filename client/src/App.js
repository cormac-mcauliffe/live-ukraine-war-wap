import React, {useRef, useEffect } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import loadGeoJson from './wikiData.js';

mapboxgl.accessToken = 'pk.eyJ1IjoiY29ybWFjbWNhIiwiYSI6ImNsMHR2M3d0NTAwNzQzY21vMGlneGF3ZWEifQ.AGMAoX7Am6YDr6DgxIzGDg';

export default function App() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const lng = 31.39;
    const lat = 48.67;
    const zoom = 5.6;

    useEffect(() => {
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lng, lat],
            zoom: zoom
        });
        // Add zoom navigation bar
        map.current.addControl(new mapboxgl.NavigationControl({
            showCompass: false
        }));

        // Once the map has loaded, import the Ukraine wiki map data as GeoJSON string and apply filtered data layers to the map; 

        // Variables for storing the wiki data
        //let citiesGeoJson;
        let citiesObj;
        
        map.current.on('load', () => {
            // Place all asyn data loading and display logic inside an async IIFE - Immediately Invoked Function Expression
            // This allows us to only start adding the data to the map until after the promise returned by the imported (and async) function loadCitiesGeoJson has been resolved to the GeoJSON string.
            (async () => { 
                citiesObj = await loadGeoJson();
                // parse the JSON to deliver value a GeoJSON obj
                // citiesObj = await JSON.parse(citiesGeoJson);
                // If we did not use await above then this would log a promise rather than the GeoJSON object.
                console.log(citiesObj);
                // add the geoJSON as a data source to the map
                map.current.addSource('wikiData', {
                    type: 'geojson',
                    data: citiesObj,
                });

                // Add filtered red layer for Russian controlled mark names: ["Location dot red.svg","Fighter-jet-red-icon.svg","Anchor pictogram red.svg","Icon NuclearPowerPlant-red.svg"]
                map.current.addLayer({
                    'id': 'russianControlled',
                    'source': 'wikiData',
                    'type': 'circle',
                    'paint': {
                        'circle-color': '#F7455D',
                        'circle-radius': 5,
                        'circle-stroke-width': 1,
                        'circle-stroke-color': '#ffffff'
                    },
                    'filter': ['in', ['get', 'mark'], ["literal",["Location dot red.svg","Fighter-jet-red-icon.svg","Anchor pictogram red.svg","Icon NuclearPowerPlant-red.svg"]]]
                });

                // Add filtered layer for Ukrainian controlled locations currently under active Russian pressure: ["80x80-red-blue-anim.gif","Map-arcNE-red.svg","Map-arcSE-red.svg","Map-circle-red.svg"]
                map.current.addLayer({
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
                        ['in', ['get', 'mark'], ["literal",["80x80-red-blue-anim.gif","Map-arcNE-red.svg","Map-arcSE-red.svg","Map-circle-red.svg"]]],
                        // "Azovstall Metallurgical Combine" needs explicit treatment due to the unique way it appears in the wikipedia data
                        ['all',
                            ['in', ['get', 'label'], ["literal",["Azovstal Metallurgical Combine"]]],
                            ['in', ['get', 'mark'], ["literal",["Icon NuclearPowerPlant-blue.svg"]]]
                        ]
                    ]
                });
            })();
        });
    });
    return (
        <div>
            <div ref={mapContainer} className="map-container" />
            <div id="state-legend" className="legend">
                <div><span id="russian-control"></span>Russian occupied</div>
                <div><span id="russian-pressure"></span>Under Russian pressure</div>
                <p id="wiki-source">Live Russo-Ukrainian war data <br></br> pulled from <a href="https://en.wikipedia.org/wiki/Module:Russo-Ukrainian_War_detailed_map" target="_blank" rel="noopener noreferrer">Wikipedia</a></p>
            </div>
         </div>
      );
}
