const jsonData1 = require("./Assets/123Loadboard_CodeJam_2022_dataset.json"); //the huge json file
const jsonData2 = require("./Assets/123Loadboard_CodeJam_2022_input_sample_s300.json"); //7 samples

console.log("-------------------------------------");
console.log(jsonData1[0]);
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
