module.exports = function() {
  let express = require('express');
  let router = express.Router();

    // query parameter name
  const QUERY_ERROR_FIELD = "VALIDATION_ERROR";
  const QUERY_OFFENDER_FIELD = "OFFENDER";
  const REPLACEMENT_STRING = "%offender%";

  // query parameter values and their corresponding messages to display on the page
  const VALIDATION_ERRORS = {
    EMPTY: `Please enter a non-empty ${REPLACEMENT_STRING}`,
    NON_UNIQUE: `Please enter a(n) ${REPLACEMENT_STRING} that is not already taken!`,
    NON_POSITIVE: `Please enter a positive integer for ${REPLACEMENT_STRING}!`,
  };

  USR_INPUT_FIELD =  {
    id: "Garrison ID",
    name: "Name",
    capacity: "Capacity",
  };

  // --------------------------------------------------------------------------

  function getGarrisons(res, mysql, context, complete) {
    mysql.pool.query("SELECT id, name, capacity from garrisons;", function(error, results, fields) {

      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.garrisons = results;
      complete();
    });
  }

  // --------------------------------------------------------------------------

    /**
   * Determine if user input for garrisons.id and garrisons.type are valid.
   * @param {int} id - user input for the garrisons.id
   * @param {name} type - user input for the garrisons.name
   * @param {capacity} type - user input for the garrisons.capacity
   * @return {string} query string field/value pairs if invalid else "".
   */
  function validateInputCreateGarrison(id, name, capacity) {
    let reason = "";
    let offender = "";

    if (name === "") {
      reason = "EMPTY"
      offender = USR_INPUT_FIELD["name"]
    } else if (id <= 0 ) {
      reason = "NON_POSITIVE";
      offender = USR_INPUT_FIELD["id"]
    } else if (capacity <= 0) {
      reason = "NON_POSITIVE";
      offender = USR_INPUT_FIELD["capacity"]
    } else {
      // input is valid (no reason or offender)
    }

    if (reason !== "") {
      return `${QUERY_ERROR_FIELD}=${reason}&${QUERY_OFFENDER_FIELD}=${offender}`;
    } else {
      return "";
    }
  }

  // --------------------------------------------------------------------------

  // display all existing garrisons
  router.get('/', function(req, res) {
    let callbackCount = 0;
    let context = {
      title: "Garrisons",
      heading: "Garrisons",
      jsscripts: [],
    };

    let mysql = req.app.get('mysql');

    getGarrisons(res, mysql, context, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 1) {
	res.render('garrisons', context);
      }
    }
  });
  
  return router;
}();
