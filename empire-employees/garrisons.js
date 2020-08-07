module.exports = function() {
  const BASE_ROUTE = '/garrisons';
  const Validator = require('./validator.js');
  const attemptQuery = require('./queryHelpers.js');
  let express = require('express');
  let router = express.Router();

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
    let sql = "INSERT INTO `garrisons` (`id`, `name`, `capacity`) VALUES (?, ?, ?);";
    let inserts = [req.body.id, req.body.name, req.body.capacity];

    // validate the user input
    let queryString = validateInputCreateGarrison(req.body.id, req.body.name,
      req.body.capacity);

    if (queryString !== "") {
      res.redirect(`/garrisons?${queryString}`) // display error messages
    } else { // attempt the INSERT query
      sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
	if (error && error.code === "ER_DUP_ENTRY") {
	  // INSERT failed from duplicate ID

	  // use the error message to determine which key is a duplicate
	  let msg = error.sqlMessage;

	  // search the error message string for its index of where the
	  // offending field begins
	  let idx = msg.lastIndexOf('for key');

	  let reason = "NON_UNIQUE";
	  let offender = msg.slice(idx + 9, msg.length - 1);

	  // handle the fact that MySQL labels primary key as PRIMARY instead
	  // of the actual attribute name
	  offender = (offender === "PRIMARY") ? "id" : offender;

	  queryString = (
	    `${QUERY_ERROR_FIELD}=${reason}&` +
	    `${QUERY_OFFENDER_FIELD}=${offender}`);
	  res.redirect(`/garrisons?${queryString}`)
	} else if (error) {
	  // INSERT failed for reason other than duplicate ID
	  console.log(JSON.stringify(error));
	  res.write(JSON.stringify(error));
	  res.end();
	} else {
	  // INSERT succeeded
	  res.redirect('/garrisons');
	}
      });
    }
  });

  // --------------------------------------------------------------------------

  return router;
}();
