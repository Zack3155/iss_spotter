const request = require('request');

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const fetchMyIP = function (callback) {
  // use request to fetch IP address from JSON API
  const URL = 'https://api.ipify.org?format=json';

  request(URL, (err, rsp, body) => {
    if (!err) {
      const data = JSON.parse(body);
      const code = rsp.statusCode;
      //console.log(body);
      if (code === 200) callback(null, data.ip);
      else callback(`Status Code ${code} when fetching IP. Response: ${body}`, null);
    }
    else callback(err, null);
  });
}

const fetchCoordsByIP = function (ip, callback) {
  const URL = 'https://api.freegeoip.app/json/?apikey=44f96a60-3dbe-11ec-9203-23c515c745dc';

  request(URL, (err, rsp, body) => {
    if (!err) {
      const code = rsp.statusCode;
      //console.log(body);
      if (code === 200) {
        const { latitude, longitude } = JSON.parse(body);
        callback(null, { latitude, longitude });
      }
      else callback(`Status Code ${code} when fetching IP.`, null);
    }
    else callback(err, null);
  });
}

/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */
const fetchISSFlyOverTimes = function (coords, callback) {

  request(`https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`, (err, rsp, body) => {
    if (!err) {
      const code = rsp.statusCode;
      //console.log(body);
      if (code === 200) {
        const data = JSON.parse(body).response;
        callback(null, data);
      }
      else callback(`Status Code ${code} when fetching IP.`, null);
    }
    else callback(err, null);
  });
};

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results. 
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = function (callback) {
  // Call Muti Helper Functions
  fetchMyIP((error, ip) => {
    if (error) return callback(error, null);

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) return callback(error, null);

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) return callback(error, null);
        callback(null, nextPasses);
      });
    });
  });
}

module.exports = { nextISSTimesForMyLocation };