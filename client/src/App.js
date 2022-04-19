import React, {useRef, useEffect } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import loadCitiesGeoJson from './wikiData.js';

mapboxgl.accessToken = 'pk.eyJ1IjoiY29ybWFjbWNhIiwiYSI6ImNsMHR2M3d0NTAwNzQzY21vMGlneGF3ZWEifQ.AGMAoX7Am6YDr6DgxIzGDg';

export default function App() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const lng = 31.39;
    const lat = 48.67;
    const zoom = 5.6;
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

            // Add filtered red layer for Russian controlled mark names: ["Location dot red.svg","Fighter-jet-red-icon.svg","Anchor pictogram red.svg","Icon NuclearPowerPlant-red.svg"]
            map.current.addLayer({
                'id': 'russianControlled',
                'source': 'wikiData',
                'type': 'circle',
                'paint': {
                    'circle-color': '#F7455D',
                    'circle-radius': 5,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff'//'#F7455D' //'#33C9EB'
                },
                'filter': ['in', ['get', 'mark'], ["literal",["Location dot red.svg","Fighter-jet-red-icon.svg","Anchor pictogram red.svg","Icon NuclearPowerPlant-red.svg"]]]
            });

            // Add filtered layer for Ukrainian controlled locations currently under active Russian pressure: ["80x80-red-blue-anim.gif","Map-arcNE-red.svg","Map-arcSE-red.svg","Map-circle-red.svg"]
            map.current.addLayer({
                'id': 'russianPressured',
                'source': 'wikiData',
                'type': 'circle',
                'paint': {
                    'circle-color': '#333EFF',//"#0057B8",//#33C9EB',
                    'circle-radius': 4,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#F7455D' //'#33C9EB'
                },
                'filter': ['in', ['get', 'mark'], ["literal",["80x80-red-blue-anim.gif","Map-arcNE-red.svg","Map-arcSE-red.svg","Map-circle-red.svg"]]]});
        })

    });
    return (
        <div>
            <div ref={mapContainer} className="map-container" />
            <div id="state-legend" className="legend">
                <div><span id="russian-control"></span>Russian occupied</div>
                <div><span id="russian-pressure"></span>Under Russian pressure</div>
            </div>
         </div>
      );
}
