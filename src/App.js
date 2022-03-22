import React from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = 'pk.eyJ1IjoiY29ybWFjbWNhIiwiYSI6ImNsMHR2M3d0NTAwNzQzY21vMGlneGF3ZWEifQ.AGMAoX7Am6YDr6DgxIzGDg';





export default class App extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            lng: 31.4512,
            lat: 48.8842,
            zoom: 4.35
        };
        this.mapContainer = React.createRef();
        //this.navContainer = React.createRef();
    }

    componentDidMount() {
        const { lng, lat, zoom } = this.state;
        const map = new mapboxgl.Map({
            container: this.mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lng, lat],
            zoom: zoom
        });

       map.on('move',() => {
            this.setState({
                lng: map.getCenter().lng.toFixed(4),
                lat: map.getCenter().lat.toFixed(4),
                zoom: map.getZoom().toFixed(2)
            })
        })
        //const nav = new mapboxgl.NavigationControl();
        //map.addControl(nav);
    }

    render() {
        return (
            <div>
                <div ref = {this.mapContainer} className="map-container"/>
            </div>
        );
    }
}
