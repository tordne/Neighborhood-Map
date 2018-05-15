/* ==== Function Ajax call locNeighborhood ==== */

export async function locNeighborhood(lat, lng) {
  let response;
  try {
    response = await fetch(
      `https://data.police.uk/api/locate-neighbourhood?q=` + lat + `,` +
      lng );
  } catch(e) {
    console.log("Unable to access data.police.uk API");
  }

  if (response.status !== 200) {
    console.log("problem loading data. Status code:" + response.status);
  }

  const data = await response.json();
  return data;
}


/* ==== Functoin Ajax call get boundaries of Neigborhood ==== */

export async function getBoundsNeigh(neighborhood, force) {
  let response;
  try {
    response = await fetch(`https://data.police.uk/api/` + force + `/` +
      neighborhood + `/boundary`);
  } catch(e) {
    console.log("Problem loading data. Status code: " + response.status);
  }

  const data = await response.json();
  return data;
}


/* ==== Functoin Ajax call get Street Level Crime ==== */

export async function getStreetLevelCrime(lat, lng, year, month) {
  let response;
  try {
    response = await fetch(
      `https://data.police.uk/api/crimes-street/all-crime?lat=` + lat +
      `&lng=` + lng + `&date=` + year + `-` + month);
  } catch(e) {
    console.log("Problem loading data. Status code: " + response.status);
  }

  const data = await response.json();

  // Create an empty array to get all info that is necessary
  var crimes = [];

  // Iterate over the retrieved data and save it in the crimes array
  data.forEach(function(crime){
    // Check if the item.category is in the crimes array
    var match = ko.utils.arrayFirst(
      crimes, function(item) {
        return crime.category === item.category;
      }
    );

    // If there was no match, add the new category with a starting
    // count of 1
    // If there was a match increase the count with 1
    if (!match) {
      var row = {category: crime.category, count: 1};
      crimes.push(row);
    } else {
      match.count += 1;
    }
  });
  // return the crimes array
  return crimes;
}