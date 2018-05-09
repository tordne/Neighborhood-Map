import $ from 'jquery';
import {locNeighborhood, getBoundsNeigh, getStreetLevelCrime} from './police';

'use strict';


/* ==== Global Variables ==== */

var map;
var areaPolygon;
var forcesList = ko.observableArray([]);
var currentCenter = ko.observable();


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

var Force = function(data) {
  this.id = ko.observable(data.id);
  this.name = ko.observable(data.name);
};


/* ==== Model currentNeighborhood ==== */

var currentNeighborhood = function(data) {
  this.force = ko.observable(data.force);
  this.neighborhood = ko.observable(data.neighborhood);
};


/* ==== Function Ajax call getForces ==== */

function getForces() {
  // Send an ajax request to retrieve all the forces
  $.ajax({
    url: "https://data.police.uk/api/forces"
  })
    .done(function(data) {
      data.forEach(function(forceItem) {
        forcesList.push( new Force(forceItem));
      });
    });
}





/* ==== ViewModel ==== */

var ViewModel = function() {
  var self = this;

  // Hide the sidebar upon loading of the page
  self.showSidebar = ko.observable(false);
  self.bounds = [];
  self.boundsString = "";

  // Upon clicking the menu button hide or show the sidebar
  self.toggleSidebar = function() {
    self.showSidebar(!self.showSidebar());
  };

  // Retrieve the lat lng coordinates of the map.
  var currentCenter = map.getCenter();
//  console.log(currentCenter);

  locNeighborhood(currentCenter.lat(), currentCenter.lng()).then(
    (data) => {
      getBoundsNeigh(data.neighbourhood, data.force).then(
        (data) => {
            self.bounds = [];
            self.boundsString = "";
            for( var i = 0; i < data.length; i++ ) {
              self.bounds.push({
                lat: +data[i].latitude,
                lng: +data[i].longitude
              });
            }

            areaPolygon = new google.maps.Polygon({
              paths: self.bounds,
              strokeColor: '#FF0000',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#FF0000',
              fillOpacity: 0.35
            });

            areaPolygon.setMap(map);
          }
        );
        getStreetLevelCrime(currentCenter.lat(), currentCenter.lng());
      }
    );

  //console.log(this.curNeigh);
  //getBoundsNeigh(self.curNeigh.neighborhood, self.curNeigh.force);


  map.addListener('dragend', function() {
    var currentCenter = map.getCenter();
    locNeighborhood(currentCenter.lat(), currentCenter.lng());
  });

 };


/* ==== Initialize Google Maps ==== */

window.initApp = function() {
  initMap();

  // Initialize the ModelView and bind it to the View.
  ko.applyBindings(new ViewModel());
};