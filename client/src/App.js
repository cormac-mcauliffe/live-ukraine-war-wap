import React, {useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = 'pk.eyJ1IjoiY29ybWFjbWNhIiwiYSI6ImNsMHR2M3d0NTAwNzQzY21vMGlneGF3ZWEifQ.AGMAoX7Am6YDr6DgxIzGDg';


console.log('hello');

async function fetchServerHello() {
    try {
        // const response = await fetch('https://en.wikipedia.org/w/index.php?title=Module:Russo-Ukrainian_War_detailed_map&action=raw');//
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

async function fetchCitiesData() {
    try {
        // const response = await fetch('https://en.wikipedia.org/w/index.php?title=Module:Russo-Ukrainian_War_detailed_map&action=raw');//
        const response = await fetch('/api/citiesData');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const citiesData = await response.text();
        return citiesData;
    }
    catch(error) {
        console.error(`Could not get cities data ${error}`)
    }
}

const citiesDataPromise = fetchCitiesData();
citiesDataPromise.then((citiesData) => console.log(citiesData));


export default function App() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const nav = useRef(null);
    const [lng, setLng] = useState(31.39);
    const [lat, setLat] = useState(48.67);
    const [zoom, setZoom] = useState(4.41);

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
    });
    return (
        <div>
          <div ref={mapContainer} className="map-container" />
        </div>
      );
}