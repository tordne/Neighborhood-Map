/**
 * Ajax call to the Police Database API to retrieve the Neigbourhood and
 * Force code for the rquested latLng
 *
 * @export
 * @param {float} lat - latitude
 * @param {float} lng - longitude
 * @returns Object with id of police force and neighbourhood
 *
 */
export async function locNeighborhood(lat, lng) {
  let response;
  try {
    response = await fetch(
      `https://data.police.uk/api/locate-neighbourhood?q=` + lat + `,` +
      lng);
  } catch (e) {
    console.log("Unable to access data.police.uk API: " + e.message);
    throw alert("Unable to access data.police.uk API: " + e.message);
  }

  if (response.status !== 200) {
    console.log("problem loading data. Status code:" + response.status);
    alert("problem loading data. Status code:" + response.status);
  }

  const data = await response.json();
  return data;
}


/**
 * Ajax call to the Police Database API to retireve the boundaries of
 * the Neigborhood
 *
 * @export
 * @param {string} neighborhood - Police Neighbourhood ID code
 * @param {string} force - Police Force ID code
 * @returns Array with all the latLng of the neighbourhood
 *
 */
export async function getBoundsNeigh(neighborhood, force) {
  let response;
  try {
    response = await fetch(`https://data.police.uk/api/` + force + `/` +
      neighborhood + `/boundary`);
  } catch (e) {
    console.log("Problem loading Neighbourhood boundary: " + e.message);
    throw alert("Problem loading Neighbourhood boundary: " + e.message);
  }

  if (response.status !== 200) {
    console.log("problem loading data. Status code:" + response.status);
    throw alert("problem loading data. Status code:" + response.status);
  }

  const data = await response.json();
  return data;
}


/**
 * Ajax call to the Police Database API to get Street Level Crime of
 * the requested area.
 * The data is processed into categories with their subtotals
 *
 * @export
 * @param {float} lat - latitude
 * @param {float} lng - longitude
 * @param {int} year - 4 digit year
 * @param {int} month - 2 digit month
 * @returns Array with all the categories and their subtotals
 */
export async function getStreetLevelCrime(lat, lng, year, month) {
  let response;
  try {
    response = await fetch(
      `https://data.police.uk/api/crimes-street/all-crime?lat=` + lat +
      `&lng=` + lng + `&date=` + year + `-` + month);
  } catch (e) {
    console.log("Problem retrieving Street Level Crime: " + e.message);
    throw alert("Problem retrieving Street Level Crime: " + e.message);
  }

  if (response.status !== 200) {
    console.log("problem loading data. Status code:" + response.status);
    throw alert("problem loading data. Status code:" + response.status);
  }

  const data = await response.json();

  // Create an empty array to get all info that is necessary
  var crimes = [];

  // Iterate over the retrieved data and save it in the crimes array
  if (data[0] !== undefined && data[0].category !== undefined) {
    data.forEach(function(crime) {
      // Check if the item.category is in the crimes array
      var match = ko.utils.arrayFirst(
        crimes,
        function(item) {
          return crime.category === item.category;
        }
      );

      // If there was no match, add the new category with a starting
      // count of 1
      // If there was a match increase the count with 1
      if (!match) {
        var row = {
          category: crime.category,
          count: 1
        };
        crimes.push(row);
      } else {
        match.count += 1;
      }
    });
    // return the crimes array
    return crimes;
  } else {
    crimes = [{
      error: "No crimes recorded"
    }];

  }
}