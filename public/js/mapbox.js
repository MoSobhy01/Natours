/* eslint-disable */
import mapboxgl from 'mapbox-gl';

export const displayMap = (locations) => {
  mapboxgl.accessToken = 'pk.eyJ1IjoibW8tc29iaHkiLCJhIjoiY2xuYm84Ymx0MGFyazJvbHFtdWtlMTZoZCJ9.VELZ-NumNIUA2zK1pZ6vaQ';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mo-sobhy/clnbpg6rl03l001pje8o38bwc',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map);

    new mapboxgl.Popup({
      offset: 30
    }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);



    bounds.extend(loc.coordinates);
  });
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 100,
      right: 100,
      left: 100
    }
  });
}
