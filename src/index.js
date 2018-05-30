import $ from 'jquery';
import ViewModel from './view-model';
import './css/styles.css';


/* ==== Global Variables ==== */

window.map = "";
window.service = "";
window.infowindow = "";


/**
 * Callback to Google Map API
 *
 */
function initMap() {
  var mapOptions = {
    center: {
      lat: 51.5006035,
      lng: -0.1416748
    },
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
    clickableIcons: false
  };
  console.log("initMap executed");
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
}


/**
 * Initialize Google Maps through initMap().
 * Apply the KO binding for the viewModel.
 *
 */
window.initApp = function() {
  initMap();

  alert(
    'UK Police Database\n\n' +
    'When you "Click", "Pan" or "Zoom" and the map enters an unknown area, ' +
    ' it will automaticallly retrieve the police data.\n' +
    'You can use the search button to go to a specific area or postcode.\n' +
    'The filter will slim the dynamically created list down to the specific ' +
    'force requested e.g.: "metropolitan".\n\n' +
    'The policeman in the navigation menu will show you the nearest police ' +
    'stations.\n\n' +
    'Have fun!');

  // Initialize the ModelView and bind it to the View.
  ko.applyBindings(new ViewModel());
};