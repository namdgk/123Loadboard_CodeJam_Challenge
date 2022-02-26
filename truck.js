const all_trips = require("./Assets/123Loadboard_CodeJam_2022_dataset.json"); //the huge json file
const all_truckers = require("./Assets/123Loadboard_CodeJam_2022_input_sample_s300.json"); //7 samples

console.log("-------------------------------------");
console.log(all_trips[0]);
console.log("-------------------------------------");

//All distances are in miles
//All trucks have a fixed speed of 55 mph
//Fixed fuel cost per gallon is $0.40/mile

//JSON dataset
// [
//     {
//         "load_id":434307296,          // unique id. A number from 1 to 9 digits
//         "origin_city":"TAMPA",        // origin (A) city name
//         "origin_state":"FL",          // origin (A) state/province 2 letter code
//         "origin_latitude":27.961307,  // origin (A) latitude coordinate
//         "origin_longitude":-82.44929999999998,// origin (A) longitude coordinate
//         "destination_city":"ORLANDO",      // destination (B) city name
//         "destination_state":"FL",          // destination (B) state/province 2 letter code
//         "destination_latitude":28.546289,  // destination (B) latitude coordinate
//         "destination_longitude":-81.37826099999998,// dest (B) longitude coordinate
//         "amount":291,                            // amount of money paid for the shipment
//         "pickup_date_time":"2022-03-04 13:00:00" // pickup date. truck cannot be late.
//     },
//     ...
// ]

let result = addResult(101, [434307296, 401121]);

function addResult(inputTripId, loadIds) {
  return {
    input_trip_id: inputTripId,
    load_ids: loadIds,
  };
}

function get_next_trips(origin_latitude, origin_longitude, end_time) {
  // possible trips to be returned
  var possible_trips = [];
  for (let i = 0; i < all_trips.length; i++) {
    // check if the trip can be made in time
    if (is_before(all_trips[i].pickup_date_time, end_time)) {
      // travel time is in hours
      let travel_time =
        1609.34 * // miles to meters conversion
        55 * // travel speed in miles
        get_distance(
          origin_latitude,
          origin_longitude,
          all_trips[i].origin_latitude,
          all_trips[i].origin_longitude
        );
      let trip_end_time = add_hours_to_time(pickup_date_time, travel_time);

      // check if the trip can end before the trucker's max_destination_time
      if (is_before(trip_end_time, end_time)) {
        // add trip to possible_trips array
        possible_trips += all_trips[i];
      }
    }
  }
}
// TODO: function to compute the finish time of a starting time and the hours elapsed
function add_hours_to_time(starting_time, hours) {}

// TODO: returns true if time1 is before or equal to time2
function is_before(time1, time2) {}

// using provided Geodesic distance function to get the distance between coordinates
function get_distance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
}
