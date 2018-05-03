
'use strict';


// Set all global variables
var map;


// Callback to Google MapsAPI
function initMap() {
  var mapOptions = {
    center: {lat: 51.4275898, lng: -0.308368},
    zoom: 13,
    mapTypeControl: false
  };

  map = new google.maps.Map(document.getElementById('map'), mapOptions);
}


/*
 *
 * ViewModel
 *
 */
 var ViewModel = function() {
  var self = this;

  var infowindow = new google.maps.InfoWindow({
    maxwidth: 250,
  });

 }

/* Google maps callback sets off the execution of this app */
window.initApp = function() {
  initMap();
  // Initialize the ModelView and bind it to the View.
  ko.applyBindings(new ViewModel());
}



/*

async function component() {
  var element = document.createElement('div');
  var btn = document.createElement('button');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  btn.innerHTML = 'Click me and check the console';
  btn.onclick = printMe;

  element.appendChild(btn);


  return element;
}

component().then(component => {
  document.body.appendChild(component);
});

let element = component(); // store the element to re-render on print.js change
document.body.appendChild(element);

if (module.hot) {
	module.hot.accept('./print.js', function() {
		console.log('Accepting the updated printMe module!');
		document.body.removeChild(element);
    element = component(); // Re-render the "component" to update the click
    // handler
    document.body.appendChild(element);
	});
}
*/