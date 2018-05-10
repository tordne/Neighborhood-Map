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

export async function getStreetLevelCrime(lat, lng) {
  let response;
  try {
    response = await fetch(
      `https://data.police.uk/api/crimes-street/all-crime?lat=` + lat +
      `&lng=` + lng + `&date=2018-01`);
  } catch(e) {
    console.log("Problem loading data. Status code: " + response.status);
  }

  const data = await response.json();
  //console.log(data);
  return data;
}