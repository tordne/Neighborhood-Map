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

  // Initialize the ModelView and bind it to the View.
  ko.applyBindings(new ViewModel());
};