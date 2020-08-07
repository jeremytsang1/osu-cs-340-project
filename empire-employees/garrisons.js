module.exports = function() {
  const BASE_ROUTE = '/garrisons';
  const Validator = require('./validator.js');
  const attemptQuery = require('./queryHelpers.js');
  let express = require('express');
  let router = express.Router();

  let validator = new Validator(
    [ // argument 0: databaseFields
      {field: "id", type: Validator.INT,
	friendlyName: "Garrison ID", allowedValues: []},
      {field: "name", type: Validator.STRING,
	friendlyName: "Name", allowedValues: []},
      {field: "capacity", type: Validator.INT,
	friendlyName: "Capacity", allowedValues: []}
    ],
    // argument 1: primary
    "id",
    // argument 2: fkConstraintNames
    {}
    // argument 3: errorMessages (optional)
  );

  // set custom error message
  validator.setErrorMessage(
    Validator.QUERY_PARAM_VALUES_REASON.duplicate,
    "Garrison ID and Name must be unique!" // Hardcoded
  );

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
   * Determine if user input for garrisons.id, garrisons.name, and
   * garrisons.capacity are valid.
   * @param {int} id - user input for the garrisons.id
   * @param {name} type - user input for the garrisons.name
   * @param {capacity} type - user input for the garrisons.capacity
   * @return {string} query string field/value pairs if invalid else "".
   */
  function validateInputCreateGarrison(id, name, capacity) {
    let reason = "";
    let offender = "";  // actual field name in the database (property name of
			// USR_INPUT_FIELDS)

    if (name === "") {
      reason = "EMPTY"
      offender = "name"
    } else if (id <= 0 ) {
      reason = "NON_POSITIVE";
      offender = "id"
    } else if (capacity <= 0) {
      reason = "NON_POSITIVE";
      offender = "capacity"
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
      errorMessage: validator.getErrorMessage(req),
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

  // --------------------------------------------------------------------------

  // add a new garrison to the table
  router.post('/', function(req, res) {
    let mysql = req.app.get('mysql');

    switch (req.body['postButton']) {
    case "insert":
      handleInsert(req, res, mysql);
      break;
    }
  });

  function handleInsert(req, res, mysql) {
    let sql = "INSERT INTO `garrisons` (`id`, `name`, `capacity`) VALUES (?, ?, ?);";

    let inserts = [  // must appear in same order as in the query
      {field: 'id', value: req.body.id},
      {field: 'name', value: req.body.name},
      {field: 'capacity', value: req.body.capacity},
    ];

    let expectedErrorHandlers = { // property names are SQL error codes
      "ER_DUP_ENTRY": validator.handleDuplicateInsert(),
    };

    // validate the user input
    let queryString = validator.validateBeforeQuery(inserts);

    if (queryString !== "") {
      res.redirect(`${BASE_ROUTE}?${queryString}`) // display error messages
    } else { // attempt the INSERT query
      attemptQuery(req, res, mysql, sql, inserts, expectedErrorHandlers, BASE_ROUTE);
    }
  }

  // --------------------------------------------------------------------------

  return router;
}();
