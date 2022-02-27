import moment from "moment";
import { readFile } from "fs/promises";

const all_trips = JSON.parse(
  await readFile(
    new URL("./Assets/123Loadboard_CodeJam_2022_dataset.json", import.meta.url)
  )
);

const all_truckers = JSON.parse(
  await readFile(
    new URL(
      "./Assets/123Loadboard_CodeJam_2022_input_sample_s300.json",
      import.meta.url
    )
  )
);

function isBeforeBetter(time1, time2) {
  let year1 = parseInt(time1.slice(0, 4));
  let year2 = parseInt(time2.slice(0, 4));
  let month1 = parseInt(time1.slice(6, 8));
  let month2 = parseInt(time2.slice(6, 8));
  let day1 = parseInt(time1.slice(9, 11));
  let day2 = parseInt(time2.slice(9, 11));
  let hour1 = parseInt(time1.slice(11, 13));
  let hour2 = parseInt(time2.slice(11, 13));
  let min1 = parseInt(time1.slice(14, 16));
  let min2 = parseInt(time2.slice(14, 16));
  let sec1 = parseInt(time1.slice(17, 19));
  let sec2 = parseInt(time2.slice(17, 19));
  if (
    year1 == year2 &&
    month1 == month2 &&
    day1 == day2 &&
    hour1 == hour2 &&
    min1 == min2 &&
    sec1 == sec2
  ) {
    return true;
  } else {
    return moment(time1).isBefore(time2, "second");
  }
}

//All distances are in miles
//All trucks have a fixed speed of 55 mph
//Fixed fuel cost per gallon is $0.40/mile

let result = addResult(101, [434307296, 401121]);

function addResult(inputTripId, loadIds) {
  return {
    input_trip_id: inputTripId,
    load_ids: loadIds,
  };
}

// finds the most profitable 10 trips
function preprocess_trips(trucker_index) {
  let curr_trucker = all_truckers[trucker_index];
  let all_possible_trips = get_next_trips(
    curr_trucker.start_latitude,
    curr_trucker.start_longitude,
    curr_trucker.start_time,
    curr_trucker.max_destination_time
  );
  // find the best 10 trips from all the possible trips
  let best_10 = [];
  for (let i = 0; i < all_possible_trips.length; i++) {
    let revenue = get_revenue(
      curr_trucker.start_latitude,
      curr_trucker.start_longitude,
      all_possible_trips[i]
    );
  }
}
// TODO: returns the profit-cost of a potential trip
function get_revenue(starting_lat, starting_long, trip) {}

function get_next_trips(
  origin_latitude,
  origin_longitude,
  current_time,
  trucker_end_time
) {
  // possible trips to be returned
  var possible_trips = [];
  // variables used:
  // current_time: trucker's time and location when requesting posiible trips
  // trucker_end_time: the max time trucker can be on the road
  // travel_to_pickup_time: time in hours it takes to go from trucker's current location to the pickup location
  // trip_travel_time: time in hours it takes to complete the trip (go form pickup to drop off)
  // arrival_to_pickup_time: time when the trucker will arrive at pickup location
  for (let i = 0; i < all_trips.length; i++) {
    // check if the trip can be made in time
    if (
      is_before(current_time, all_trips[i].pickup_date_time) &&
      is_before(all_trips[i].pickup_date_time, trucker_end_time)
    ) {
      // travel time is in hours
      let travel_to_pickup_time =
        1609.34 * // miles to meters conversion
        55 * // travel speed in miles
        get_distance(
          origin_latitude,
          origin_longitude,
          all_trips[i].origin_latitude,
          all_trips[i].origin_longitude
        );
      let trip_travel_time =
        1609.34 * // miles to meters conversion
        55 * // travel speed in miles
        get_distance(
          all_trips[i].origin_latitude,
          all_trips[i].origin_longitude,
          all_trips[i].destination_latitude,
          all_trips[i].destination_latitude
        );
      let trip_end_time = add_hours_to_time(
        all_trips[i].pickup_date_time,
        trip_travel_time
      );
      let arrival_to_pickup_time = add_hours_to_time(
        current_time,
        travel_to_pickup_time
      );
      // check if the trip can end before the trucker's max_destination_time
      if (
        is_before(arrival_to_pickup_time, all_trips[i].pickup_date_time) &&
        is_before(trip_end_time, trip_end_time)
      ) {
        // add trip to possible_trips array
        possible_trips.push(all_trips[i]);
      }
    }
  }
  return possible_trips;
}

// function to compute the finish time of a starting time and the hours elapsed
function add_hours_to_time(starting_time, hours) {
  return moment(starting_time).add(hours, "h").format();
}

// returns true if time1 is before or equal to time2
function is_before(time1, time2) {
  //two formats
  //"2022-03-04 13:00:00"
  //"2022-03-02T19:00:00.000Z"
  let year1 = parseInt(time1.slice(0, 4));
  let year2 = parseInt(time2.slice(0, 4));
  // compare year
  if (year1 > year2) {
    return false;
  } else if (year1 < year2) {
    return true;
  } else {
    // compare month
    let month1 = parseInt(time1.slice(6, 8));
    let month2 = parseInt(time2.slice(6, 8));
    if (month1 > month2) {
      return false;
    } else if (month1 < month2) {
      return true;
    } else {
      // compare days
      let day1 = parseInt(time1.slice(9, 11));
      let day2 = parseInt(time2.slice(9, 11));
      if (day1 > day2) {
        return false;
      } else if (day1 < day2) {
        return true;
      } else {
        // compare hour
        let hour1 = parseInt(time1.slice(11, 13));
        let hour2 = parseInt(time2.slice(11, 13));

        if (hour1 > hour2) {
          return false;
        } else if (hour1 > hour2) {
          return true;
        } else {
          // compare minutes
          let min1 = parseInt(time1.slice(14, 16));
          let min2 = parseInt(time2.slice(14, 16));
          if (min1 > min2) {
            return false;
          } else if (min1 < min2) {
            return true;
          } else {
            // compare seconds
            let sec1 = parseInt(time1.slice(17, 19));
            let sec2 = parseInt(time2.slice(17, 19));
            if (sec1 > sec2) {
              return false;
            } else {
              return true;
            }
          }
        }
      }
    }
  }
}

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

preprocess_trips(0);
