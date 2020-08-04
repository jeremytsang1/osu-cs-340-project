module.exports = function() {
  let express = require('express');
  let router = express.Router();

  // query parameter name
  const QUERY_ERROR_FIELD = "VALIDATION_ERROR";
  const QUERY_OFFENDER_FIELD = "OFFENDER";
  const REPLACEMENT_STRING = "%offender%";

  // query parameter values and their corresponding messages to display on the page
  const VALIDATION_ERRORS = {
    DOES_NOT_EXIST: `The specified ${REPLACEMENT_STRING} could not be found!`,
    NON_UNIQUE: `Please enter a ${REPLACEMENT_STRING} that is not already taken!`,
    NON_POSITIVE: `Please enter a positive integer for ${REPLACEMENT_STRING}!`,
  };

  // property names should be the actual database fields
  // property values should be the names that show up in the error message
  let USR_INPUT_FIELDS =  {
    id: "Trooper ID",
    garrison: "Garrison ID",
    loadout: "Loadout ID",
  };

  // --------------------------------------------------------------------------

  function getTroopers(res, mysql, context, complete) {
    display_table_query = ("SELECT"
      + " troopers.id AS `trooperID`,"
      + " garrisons.id AS `garrisonID`,"
      + " garrisons.name AS `garrisonName`,"
      + " loadouts.id AS `loadoutID`,"
      + " loadouts.blaster AS `blaster`,"
      + " loadouts.detonator AS `detonator`"
      + " FROM troopers"
      + " INNER JOIN loadouts ON troopers.loadout=loadouts.id"
      + " INNER JOIN garrisons ON troopers.garrison=garrisons.id;"
    );

    mysql.pool.query(display_table_query, function(error, results, fields) {

      if (error) {
	res.write(JSON.stringify(error));
	res.end();
      }
      context.troopers = results;
      complete();
    });
  }

  // --------------------------------------------------------------------------

  /**
   * Determine if user input the <form> to INSERT a new trooper is valid.
   * @param {} id - user input for troopers.id
   * @param {} garrison - user input for troopers.garrison
   * @param {} loadout - user input for troopers.loadout
   * @return {string} query string field/value pairs if invalid else "".
   */
  function validateInputCreateTrooper(id, garrison, loadout) {
    let reason = "";
    let offender = "";

    if (id <= 0 ) {
      reason = "NON_POSITIVE";
      offender = "id";
    } else if (garrison <= 0) {
      reason = "NON_POSITIVE";
      offender = "garrison";
    } else if (loadout <= 0) {
      reason = "NON_POSITIVE";
      offender = "loadout";
    } else {
      // Input valid
    }

    if (reason !== "") {
      return `${QUERY_ERROR_FIELD}=${reason}&${QUERY_OFFENDER_FIELD}=${offender}`;
    } else {
      return "";
    }
  }

  // --------------------------------------------------------------------------

  // display all existing troopers
  router.get('/', function(req, res) {
    let callbackCount = 0;
    let context = {
      title: "Troopers",
      heading: "Troopers",
      jsscripts: [],
    };

    let mysql = req.app.get('mysql');

    getTroopers(res, mysql, context, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 1) {
	res.render('troopers', context);
      }
    }
  });

  // --------------------------------------------------------------------------

    // add a new garrison to the table
  router.post('/', function(req, res) {
    let mysql = req.app.get('mysql');
    let sql = "INSERT INTO `troopers` (`id`, `garrison`, `loadout`) VALUES (?, ?, ?)";
    let inserts = [req.body.id, req.body.garrison, req.body.loadout];

    // validate the user input
    let query_string = validateInputCreateTrooper(req.body.id, req.body.garrison,
      req.body.loadout);

    if (query_string !== "") {
      res.redirect(`/troopers?${query_string}`) // display error messages
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
	  res.redirect(`/troopers?${query_string}`)
	} else if (error) {
	  // INSERT failed for reason other than duplicate ID
	  console.log(JSON.stringify(error));
	  res.write(JSON.stringify(error));
	  res.end();
	} else {
	  // INSERT succeeded
	  res.redirect('/troopers');
	}
      });
    }
  });
  // ----------------------------------------------------------------------------

  return router;
}();
