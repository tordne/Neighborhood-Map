
'use strict';


/* ==== Global Variables ==== */

var map;


/* ==== Callback to Google Map API ==== */

function initMap() {
  var mapOptions = {
    center: {lat: 51.4275898, lng: -0.308368},
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false
  };

  map = new google.maps.Map(document.getElementById('map'), mapOptions);
}


/* ==== Model Forces ==== */

var Forces = function(data) {
  this.id = ko.observable(data.id);
  this.name = ko.observable(data.name);
}


/* ==== ViewModel ==== */

 var ViewModel = function() {
  var self = this;

  var infowindow = new google.maps.InfoWindow({
    maxwidth: 250,
  });

 }


/* ==== Initialize Google Maps ==== */

window.initApp = function() {
  initMap();

  // Initialize the ModelView and bind it to the View.
  ko.applyBindings(new ViewModel());
}