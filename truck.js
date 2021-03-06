import moment from "moment";
import { readFile } from "fs/promises";
import * as fs from "fs";

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

const final_input = JSON.parse(
  await readFile(
    new URL(
      "./Assets/123Loadboard_Codejam_2022_input_final_s400.json",
      import.meta.url
    )
  )
);

// function is_before(time1, time2) {
//   let year1 = parseInt(time1.slice(0, 4));
//   let year2 = parseInt(time2.slice(0, 4));
//   let month1 = parseInt(time1.slice(6, 8));
//   let month2 = parseInt(time2.slice(6, 8));
//   let day1 = parseInt(time1.slice(9, 11));
//   let day2 = parseInt(time2.slice(9, 11));
//   let hour1 = parseInt(time1.slice(11, 13));
//   let hour2 = parseInt(time2.slice(11, 13));
//   let min1 = parseInt(time1.slice(14, 16));
//   let min2 = parseInt(time2.slice(14, 16));
//   let sec1 = parseInt(time1.slice(17, 19));
//   let sec2 = parseInt(time2.slice(17, 19));
//   if (
//     year1 == year2 &&
//     month1 == month2 &&
//     day1 == day2 &&
//     hour1 == hour2 &&
//     min1 == min2 &&
//     sec1 == sec2
//   ) {
//     return true;
//   } else {
//     return moment(time1).isBefore(time2, "second");
//   }
// }

//All distances are in miles
//All trucks have a fixed speed of 55 mph
//Fixed fuel cost per gallon is $0.40/mile

//----------------------------------------------------------------------------
//stuff for adding the final results to the output file

let finalResult = [];
addResult();
// console.log("------------------------------------------------------");
// console.log(final_input[1].input_trip_id);
// console.log(get_best_session(1));
// console.log("------------------------------------------------------");

var data = JSON.stringify(finalResult);
fs.writeFile("output_s400.json", data, (err) => {
  // Error checking
  if (err) throw err;
  console.log("New File Created");
});

function addResult() {
  for (let i = 0; i < final_input.length; i++) {
    finalResult.push({
      input_trip_id: final_input[i].input_trip_id,
      load_ids: get_best_session(i),
    });
  }
}
//----------------------------------------------------------------------------

// finds the most profitable 10 trips
function preprocess_trips(trucker_index) {
  let curr_trucker = final_input[trucker_index];
  let all_possible_trips = get_next_trips(
    curr_trucker.start_latitude,
    curr_trucker.start_longitude,
    curr_trucker.start_time,
    curr_trucker.max_destination_time
  );
  // console.log(all_possible_trips);
  // find the best 10 trips from all the possible trips
  let best_10 = [];
  for (let j = 0; j < 10; j++) {
    best_10.push([-10000, null]);
  }
  for (let i = 0; i < all_possible_trips.length; i++) {
    let revenue = get_revenue(
      curr_trucker.start_latitude,
      curr_trucker.start_longitude,
      all_possible_trips[i]
    );
    if (revenue > best_10[0][0]) {
      best_10[0][0] = revenue;
      best_10[0][1] = all_possible_trips[i];
      best_10.sort(function (a, b) {
        return a[0] - b[0];
      });
    }
  }
  return best_10;
}

// returns the profit-cost of a potential trip
function get_revenue(starting_lat, starting_long, trip) {
  // cost to go from the starting point to the origin
  let distance1 = get_distance(
    starting_lat,
    starting_long,
    trip.origin_latitude,
    trip.origin_longitude
  );
  let cost1 = distance1 * (0.4 / 1609.34);
  // cost to go from the origin to the destination
  let distance2 = get_distance(
    trip.origin_latitude,
    trip.origin_longitude,
    trip.destination_latitude,
    trip.destination_longitude
  );
  let cost2 = distance2 * (0.4 / 1609.34);
  //Amount made from the trip - the two costs above
  let totalCost = cost1 + cost2;
  let revenue = trip.amount - totalCost;
  return revenue;
}

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
      is_before_worse(current_time, all_trips[i].pickup_date_time) &&
      is_before_worse(all_trips[i].pickup_date_time, trucker_end_time)
    ) {
      // travel time is in hours
      let travel_to_pickup_time =
        get_distance(
          origin_latitude,
          origin_longitude,
          all_trips[i].origin_latitude,
          all_trips[i].origin_longitude
        ) /
        (1609.34 * 55);
      let trip_travel_time =
        get_distance(
          all_trips[i].origin_latitude,
          all_trips[i].origin_longitude,
          all_trips[i].destination_latitude,
          all_trips[i].destination_latitude
        ) /
        (1609.34 * 55);
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
        is_before_worse(
          arrival_to_pickup_time,
          all_trips[i].pickup_date_time
        ) &&
        is_before_worse(trip_end_time, trip_end_time)
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
function is_before_worse(time1, time2) {
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
  const ??1 = (lat1 * Math.PI) / 180; // ??, ?? in radians
  const ??2 = (lat2 * Math.PI) / 180;
  const ???? = ((lat2 - lat1) * Math.PI) / 180;
  const ???? = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(???? / 2) * Math.sin(???? / 2) +
    Math.cos(??1) * Math.cos(??2) * Math.sin(???? / 2) * Math.sin(???? / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

// takes in an index of the request array, returns the best trip ID's within constrains
function get_best_session(index) {
  // initialize an array with all possible routes
  // get best 10 trips as a starting point
  let best_10_trips = preprocess_trips(index);
  // [ [rev1, trip1], [rev2, trip2], ... , [rev10, trip10], ]

  let all_routes = [];
  for (let i = 0; i < 10; i++) {
    // console.log("--------- TRIP " + i + "--------------------");
    let curr_trip = best_10_trips[i][1];
    // console.log(curr_trip);
    let travel_time =
      get_distance(
        curr_trip.origin_latitude,
        curr_trip.origin_longitude,
        curr_trip.destination_latitude,
        curr_trip.destination_longitude
      ) /
      (1609.34 * 55);
    let next_trip = get_next_best_trip(
      curr_trip,
      best_10_trips[i][0],
      add_hours_to_time(curr_trip.pickup_date_time, travel_time),
      final_input[index].max_destination_time
    );
    all_routes.push(next_trip);
  }
  all_routes.sort(function (a, b) {
    return a[0] - b[0];
  });
  let trip_ids = [];
  let best_route = all_routes[all_routes.length - 1][1];
  for (let b = 0; b < best_route.length; b++) {
    trip_ids.push(best_route[b].load_id);
  }
  return trip_ids;
}

function get_next_best_trip(curr_trip, curr_rev, curr_time, max_time) {
  let next_possible_trips = get_next_trips(
    curr_trip.origin_latitude,
    curr_trip.origin_longitude,
    curr_time,
    max_time
  );

  // console.log("next trips");
  // console.log(next_possible_trips.length);
  // console.log("-----------------------------------");
  // find the most profitable 10 next trips
  let best_trip = [curr_rev, [curr_trip]];
  for (let j = 0; j < next_possible_trips.length; j++) {
    let revenue = get_revenue(
      curr_trip.destination_latitude,
      curr_trip.destination_longitude,
      next_possible_trips[j]
    );
    if (revenue + curr_rev > curr_rev) {
      best_trip[0] = revenue + curr_rev;
      best_trip[1] = [curr_trip, next_possible_trips[j]];
    }
  }
  return best_trip;
}

get_best_session(0);
