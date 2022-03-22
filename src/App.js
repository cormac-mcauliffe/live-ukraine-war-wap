import React, {useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = 'pk.eyJ1IjoiY29ybWFjbWNhIiwiYSI6ImNsMHR2M3d0NTAwNzQzY21vMGlneGF3ZWEifQ.AGMAoX7Am6YDr6DgxIzGDg';





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
        //nav.current = new mapboxgl.NavigationControl();
        map.current.addControl(new mapboxgl.NavigationControl());
    });
    return (
        <div>
          <div ref={mapContainer} className="map-container" />
        </div>
      );
}
