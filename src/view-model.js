import {
  locNeighborhood,
  getBoundsNeigh,
  getStreetLevelCrime
} from './police';
import icon from './marker';


/* ==== ViewModel ==== */

export default function ViewModel() {
  var self = this;

  // Array of all the years available
  self.allYears = ko.observableArray();
  // Array of all the years available
  self.allMonths = ko.observableArray();
  setDate();
  // Set the current year
  self.policeYear = ko.observable(self.currentYear);
  self.policeYear.subscribe(function() {
    clearNeighborhoods();
  }, this);
  // Set the current month
  self.policeMonth = ko.observable(self.currentMonth);
  self.policeMonth.subscribe(function() {
    clearNeighborhoods();
  }, this);


  // Hide the sidebar upon loading of the page
  self.showSidebar = ko.observable(false);

  // Set the currentCenter as an observable
  self.currentCenter = {};
  // Obsevable current area index number
  self.currentAreaIndex = "";

  self.currentForce = ko.observable();
  self.currentNeighborhood = ko.observable();
  self.currentTotalCrimes = ko.observable();
  self.currentCrimeCategories = ko.observableArray([]);

  // Observable array with all the areas checked
  self.areas = ko.observableArray();
  // Array with all the google area polygons
  self.areaBounds = [];
  // Array with all the areas crime data
  self.crimes = [];
  // Array with all the google police stations set as markers
  self.markers = [];

  // Upon clicking the menu button hide or show the sidebar
  self.toggleSidebar = function() {
    self.showSidebar(!self.showSidebar());
  };


  // Autocomplete for the search box
  var autocomplete = new google.maps.places.Autocomplete(
    document.getElementById('search-text'));

  // Restrict the autocomplete to the UK
  autocomplete.setComponentRestrictions({
    'country': 'gb'
  });
  // Bias the boundaries within the map for the zoom to area text.
  autocomplete.bindTo('bounds', map);

  // Add eventListeners to the area search input
  self.areaToZoom = ko.observable("");

  self.zoomToArea = function() {
    if (self.areaToZoom() != "") {
      var geocoder = new google.maps.Geocoder();

      geocoder.geocode({
        address: self.areaToZoom(),
        componentRestrictions: {
          'country': 'gb'
        }
      }, function(result, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(result[0].geometry.location);
          map.setZoom(13);
          self.showSidebar(false);
        } else {
          window.alert("Could not find the location, " +
            "try a more specific area");
        }
      });
    }
  };


  // This function is called to show the local police stations
  function getPoliceStations() {
    console.log("Call the getPoliceStations Function");

    if (self.markers != null) {
      for (var i = 0; i < self.markers.length; i++) {
        self.markers[i].setMap(null);
      }
      self.markers = [];
    }

    // set the largeInfowindow
    var largeInfowindow = new google.maps.InfoWindow();

    // Set the bounds of the map
    var bounds = map.getBounds();

    // Get all the nearby police stations and give them markers.
    // When successfull iterate over the result and create the Markers
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
      bounds: bounds,
      type: ['police']
    }, function callback(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          var place = results[i];
          //console.log(place);
          createMarker(place);
        }
      }
    });

    // Take a place parameter and add marker onto location
    function createMarker(place) {
      // Get the marker location
      var placeLoc = place.geometry.location;

      // Create the marker
      var marker = new google.maps.Marker({
        map: map,
        position: placeLoc,
        animation: google.maps.Animation.DROP,
        icon: icon,
        optimized: false
      });

      // Push the marker to the markers array
      self.markers.push(marker);

      // Onclick event to open infowindow
      marker.addListener('click', function() {
        populateInfoWindow(this, largeInfowindow, place);
      });

      // On hover bounce the marker
      marker.addListener('mouseover', function() {
        this.setAnimation(google.maps.Animation.BOUNCE);
      });
      marker.addListener('mouseout', function() {
        this.setAnimation(null);
      });
    }

    function populateInfoWindow(marker, infowindow, place) {
      // Check if the infowindow is not already opened on this marker
      if (infowindow.marker != marker) {
        // Clear the infowindow
        infowindow.setContent('');
        infowindow.marker = marker;

        // Make sure the marker property is cleared if the infowindow
        // is closed.
        infowindow.addListener('closeclick', function() {
          infowindow.marker = null;
        });

        var request = {
          placeId: place.place_id
        };

        // Retrieve placedetails from google
        service.getDetails(request, function(details, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            var content = "";

            if (details.name != undefined) {
              content += '<h3>' + details.name + '</h3>';
            }

            if (details.opening_hours != undefined &&
              details.opening_hours.open_now != undefined) {
              if (details.opening_hours.open_now) {
                content += '<h3>Station is now <span class="open">open!' +
                  '</span></h3>';
              } else {
                content += '<h3>Station is now <span class"closed">closed!' +
                  '</span></h3>';
              }
            }

            if (details.formatted_address != undefined) {
              content += '<h4 class="window-sub">Address:</h4>';
              content += '<p class="window-text">' +
                details.formatted_address + '</p>';
            }

            if (details.opening_hours != undefined &&
              details.opening_hours.weekday_text != undefined) {
              var weekdays = details.opening_hours.weekday_text;
              content += '<h4 class="window-sub">Opening Times:</h4>';
              for (var i = 0; i < weekdays.length; i++) {
                content += '<p class="window-text">' + weekdays[i] + '</p>';
              }
            }
            infowindow.setContent(content);
          }
        });
      }
      infowindow.open(map, marker);
    }
  }


  // Clear all the neighborhoods and police data
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

  // Retrieve the curren date and set the year and month arrays.
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
      self.currentMonth -= 1;
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

  // Set the crimedata in the sidebar
  function setCrimeData() {
    var index = self.currentAreaIndex;

    // Set the title with the force and neighborhood
    self.currentForce(self.areas()[index].force);
    self.currentNeighborhood(self.areas()[index].neighbourhood);

    // Set total crimes to 0;
    var total = 0;
    self.currentCrimeCategories.removeAll();

    // Iterate over the crimes and push it to the UI.
    self.crimes[index].forEach(function(item) {
      self.currentCrimeCategories.push(item);

      // For each crime add to the totals
      total += item.count;
    });
    // Set the total crimes on the UI
    self.currentTotalCrimes(total);
  }


  // Get all Police Data for the current map center
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
            for (var i = 0; i < data.length; i++) {
              self.bounds.push({
                lat: +data[i].latitude,
                lng: +data[i].longitude
              });
            }

            // Get a random color
            var color = "#" + ('00000' + (Math.random() *
              (1 << 18) | 0).toString(16)).slice(-6);

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
            self.currentAreaIndex = self.areaBounds.length - 1;

            // Draw the areaPolygon onto the map
            areaPolygon.setMap(map);

            // Add a listener to the areaPolygon
            areaPolygon.addListener('click', function(e) {
              // Iterate over the areaBounds and check if we clicked
              // on a known area
              for (var i = 0; i < self.areaBounds.length; i++) {
                if (google.maps.geometry.poly.containsLocation(
                    e.latLng,
                    self.areaBounds[i]
                  )) {
                  self.currentAreaIndex = i;
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
            setCrimeData();
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
    area.latLngs.getArray().forEach(function(path) {
      //iterate over the points in the path
      path.getArray().forEach(function(latLng) {
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
    self.currentCenter = map.getCenter();

    // Iterate through the areaBounds array and check if we are inside
    // one of the neighborhoods.
    for (var i = 0; i < self.areaBounds.length; i++) {
      if (google.maps.geometry.poly.containsLocation(
          self.currentCenter,
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
      setCrimeData();
      console.log("idle listener was called but no getPoliceData");
    }
    getPoliceStations();
  });
}