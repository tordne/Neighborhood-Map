/**
 * Disable all the map pan, zoom, scroll and click controls
 *
 * @export
 *
 */
export function disableMapControls() {
  // Set gesture Handling to none
  map.setOptions({
    gestureHandling: 'none'
  });

  // Remove the click listeners on the map.
  google.maps.event.clearListeners(map, 'click');
  google.maps.event.clearListeners(map, 'dblclick');
}


/**
 * Enable all the map pan, zoom, scroll and click controls
 *
 * @export
 *
 */
export function enableMapControls() {
	// Set gesture Handling to none
  map.setOptions({
    gestureHandling: 'auto'
  });

  // Add the click Listenre on the map.
  map.addListener('click', function(e) {
    // Pan to single clicked area
    map.panTo(e.latLng);
  });
}
