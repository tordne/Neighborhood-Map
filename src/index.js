import $ from 'jquery';
import {locNeighborhood, getBoundsNeigh, getStreetLevelCrime} from './police';

'use strict';


/* ==== Global Variables ==== */

var map;


/* ==== Callback to Google Map API ==== */

function initMap() {
  var mapOptions = {
    center: {lat: 51.5006035, lng: -0.1416748},
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false
  };
  console.log("initMap executed");
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
}


/* ==== ViewModel ==== */

var ViewModel = function() {
  var self = this;

  // Array of all the years available
  self.allYears = ko.observableArray();
    // Array of all the years available
  self.allMonths = ko.observableArray();
  setDate();
  // Set the current year
  self.policeYear = ko.observable(self.currentYear);
  self.policeYear.subscribe(function(){
    clearNeighborhoods();
  }, this);
  // Set the current month
  self.policeMonth = ko.observable(self.currentMonth);
  self.policeMonth.subscribe(function(){
    clearNeighborhoods();
  }, this);


  // Set the currentCenter as an observable
  self.currentCenter = ko.observable();
  // Hide the sidebar upon loading of the page
  self.showSidebar = ko.observable(false);
  // Observable array with all the areas checked
  self.areas = ko.observableArray();
  // Obsevable current area index number
  self.currentAreaIndex = ko.observable();
  // Array with all the google area polygons
  self.areaBounds = [];
  // Array with all the areas crime data
  self.crimes = [];

  // Upon clicking the menu button hide or show the sidebar
  self.toggleSidebar = function() {
    self.showSidebar(!self.showSidebar());
  };

  function clearNeighborhoods() {
    console.log("clearNeighborhoods function called");
    // Clear the crimes and area arrays.
    self.crimes = [];
    self.areas.destroyAll();
    // Check if polygons were drawn and unset first and then empty the
    // array. If areas were defined, getPoliceData for the currentcenter
    if (typeof self.areaBounds !== 'undefined' && self.areaBounds.length > 0) {
      console.log("There were areas defined");
      for (var i = 0; i < self.areaBounds.length; i++) {
        self.areaBounds[i].setMap(null);
      }
      self.areaBounds = [];
      getPoliceData();
    } else {
      self.areaBounds = [];
    }
  }

  function setDate() {
    console.log("setDate executed");
    var d = new Date();
    self.currentYear = d.getUTCFullYear();
    self.currentMonth = d.getUTCMonth();

    if (self.currentMonth == 1) {
      self.currentYear -= 1;
      self.currentMonth = 12;
    } else if (self.currentMonth == 0) {
      self.currentYear -= 1;
      self.currentMonth = 11;
    } else {
      self.currentMonth -=1;
    }

    // Set a list of all the years available
    for (var i = 2015; i <= self.currentYear; i++) {
      self.allYears.push(i);
    }

    // Set a list of all the months available
    for (var i = 1; i <= 12; i++) {
      var month = ('0' + i).slice(-2);
      self.allMonths.push(month);
    }
  }


  function getPoliceData() {
    self.currentCenter = map.getCenter();
    locNeighborhood(self.currentCenter.lat(), self.currentCenter.lng()).then(
      (data) => {
        // Get the Neighborhood Boundaries at the hand of police data
        // draw the neighborhood on the map
        getBoundsNeigh(data.neighbourhood, data.force).then(
          (data) => {
            // convert the Neighborhood boundaries, so google can use it
            self.bounds = [];
            for( var i = 0; i < data.length; i++ ) {
              self.bounds.push({
                lat: +data[i].latitude,
                lng: +data[i].longitude
              });
            }

            // Get a random color
            var color = "#"+('00000'+(Math.random()*
              (1<<18)|0).toString(16)).slice(-6);

            // create a google polygon with the boundaries
            var areaPolygon = new google.maps.Polygon({
              paths: self.bounds,
              strokeColor: color,
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: color,
              fillOpacity: 0.45
            });

            // Add the Google polygon to the areaBounds array
            self.areaBounds.push(areaPolygon);

            // Draw the areaPolygon onto the map
            areaPolygon.setMap(map);

            // Add a listener to the areaPolygon
            areaPolygon.addListener('click', function(e) {
              // Iterate over the areaBounds and check if we clicked
              // on a known area
              for(var i = 0; i < self.areaBounds.length; i++) {
                if(google.maps.geometry.poly.containsLocation(
                  e.latLng,
                  self.areaBounds[i]
                )) {
                  console.log("area: " + i + " was clicked");
                  break;
                }
              }

              // Pan to the clicked neighborhood
              map.panTo(e.latLng);
            });
          }
        );

        // Add the neighborhood to the areas Observable array
        self.areas.push(data);

        // Get the crime statistics for the current Area
        getStreetLevelCrime(
          self.currentCenter.lat(),
          self.currentCenter.lng(),
          self.policeYear(),
          self.policeMonth()
          ).then(
          (data) => {
            console.log("getStreetLevelCrime called and crimes logged");
            self.crimes.push(data);
          }
        );
      }
    );
  }


  // When clicked on a list item moveTo this area
  this.moveTo = function(item, event) {
    // Get the context of the list item clicked
    var context = ko.contextFor(event.target);
    self.currentAreaIndex = context.$index();

    var area = self.areaBounds[self.currentAreaIndex];
    var bounds = new google.maps.LatLngBounds();

    //iterate over the paths
    area.latLngs.getArray().forEach(function(path){
      //iterate over the points in the path
      path.getArray().forEach(function(latLng){
        //extend the bounds
        bounds.extend(latLng);
      });
    });

    //now use the bounds
    map.fitBounds(bounds);
  };


  // Add listener to map to pan to single clicked area
  map.addListener('click', function(e) {
    map.panTo(e.latLng);
  });

  // Add listener to map to check if area is known neighborhood and get
  // the police data if necessary
  map.addListener('idle', function() {
    // set the contained var to false
    var contained = false;
    // Get the center of the map
    var newCenter = map.getCenter();

    // Iterate through the areaBounds array and check if we are inside
    // one of the neighborhoods.
    for(var i = 0; i < self.areaBounds.length; i++) {
      if(google.maps.geometry.poly.containsLocation(
        newCenter,
        self.areaBounds[i]
        )) {
          contained = true;
          break;
      }
    }
    // If we are not inside any of the neighborhoods, call the
    // getPoliceData, else reset the contained variable
    if (contained == false) {
      getPoliceData();
      console.log("getPoliceData was called in Idle listener");
    } else {
      contained = false;
      console.log("idle listener was called but no getPoliceData");
    }
  });
};


/* ==== Initialize Google Maps ==== */

window.initApp = function() {
  initMap();

  // Initialize the ModelView and bind it to the View.
  ko.applyBindings(new ViewModel());
};