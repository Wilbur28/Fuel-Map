mapboxgl.accessToken = 'pk.eyJ1Ijoid2lsYnVyMjgiLCJhIjoiY2tlYjV4aHdwMDVwaDJ4b2FhZHFyaGw4ciJ9.jm7Sgr3xocwXVx18R74tXQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11'
});

/*var popup = new mapboxgl.Popup({ closeOnClick: false })
    .setLngLat([-96, 37.8])
    .setHTML('<h1>Hello World!</h1>')
    .addTo(map);
*/

var popup = new mapboxgl.Popup({ offset: 25 }).setText(
    'Construction on the Washington Monument began in 1848.'
    );

// var marker = new mapboxgl.Marker()
//     .setLngLat([12.550343, 55.665957])
//     .setPopup(popup)
//     .addTo(map);

map.addControl(
    new MapboxDirections({
        accessToken: mapboxgl.accessToken
    }),
    'top-left'
);

map.addControl(
    new mapboxgl.GeolocateControl({
    positionOptions: {
    enableHighAccuracy: true
    },
    trackUserLocation: true
    })
);

geojson.features.forEach(function(marker) {

    // create a HTML element for each feature
    var el = document.createElement('div');
    el.className = 'marker';
  
    // make a marker for each feature and add to the map
    new mapboxgl.Marker(el)
      .setLngLat(marker.geometry.coordinates)
      .addTo(map);
});