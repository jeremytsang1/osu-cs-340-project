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
      errorMessage: "",
    };

    // check query string for any invalid input
    // ASSUMES: if req.query[QUERY_ERROR_FIELD] exists then so does
    // req.query[QUERY_OFFENDER_FIELD]
    if (req.query.hasOwnProperty(QUERY_ERROR_FIELD)) {
      let reason = req.query[QUERY_ERROR_FIELD];
      context.errorMessage = VALIDATION_ERRORS[reason].replace(
	REPLACEMENT_STRING, req.query[QUERY_OFFENDER_FIELD]
      );
    }

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
    let query_string = validateInputCreateGarrison(req.body.id, req.body.name,
      req.body.capacity);

    if (query_string !== "") {
      res.redirect(`/garrisons?${query_string}`) // display error messages
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

	  query_string = (
	    `${QUERY_ERROR_FIELD}=${reason}&` +
	    `${QUERY_OFFENDER_FIELD}=${offender}`);
	  res.redirect(`/garrisons?${query_string}`)
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
  
  return router;
}();
