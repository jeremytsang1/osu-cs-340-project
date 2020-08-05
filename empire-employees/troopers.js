module.exports = function() {
  const Validator = require('./validator.js');
  let express = require('express');
  let router = express.Router();

  let validator = new Validator(
    [
      {field: "id", type: Validator.INT, allowedValues: []},
      {field: "garrison", type: Validator.INT, allowedValues: []},
      {field: "loadout", type: Validator.INT, allowedValues: []},
    ],
    "id",
    {
      fk_troopers_garrison: 'garrison',
      fk_troopers_loadout: 'loadout'
    },
  );

  // query parameter values and their corresponding messages to display on the page
  const VALIDATION_MESSAGES = {
    nonexistent: `The specified ${validator.REPLACEMENT_STRING} could not be found!`,
    duplicate: `Please enter a ${validator.REPLACEMENT_STRING} that is not already taken!`,
    non_positive: `Please enter a positive integer for ${validator.REPLACEMENT_STRING}!`,
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

  // display all existing troopers
  router.get('/', function(req, res) {
    let callbackCount = 0;
    let context = {
      title: "Troopers",
      heading: "Troopers",
      jsscripts: [],
      errorMessage: "",
    };

    // check query string for any invalid input
    // ASSUMES: if req.query[QUERY_ERROR_FIELD] exists then so does
    // req.query[QUERY_OFFENDER_FIELD]
    // ASSUMES: if req.query[QUERY_OFFENDER_FIELD] exists then it is a property
    // of USR_INPUT_FIELDS
    if (req.query.hasOwnProperty(validator.QUERY_PARAM_NAME_REASON)) {
      let reason = req.query[validator.QUERY_PARAM_NAME_REASON];
      context.errorMessage = VALIDATION_MESSAGES[reason].replace(
	REPLACEMENT_STRING, USR_INPUT_FIELDS[req.query[QUERY_PARAM_NAME_OFFENDER]]
      );
    }

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

  // add a new trooper to the table
  router.post('/', function(req, res) {
    let mysql = req.app.get('mysql');
    let sql = "INSERT INTO `troopers` (`id`, `garrison`, `loadout`) VALUES (?, ?, ?)";
    let inserts = [
      {field: 'id', value: req.body.id},
      {field: 'garrison', value: req.body.garrison},
      {field:'loadout', value: req.body.loadout},
    ];

    // validate the user input
    let queryString = validator.validateBeforeQuery(inserts)

    if (queryString !== "") {
      res.redirect(`/troopers?${queryString}`) // display error messages
    } else { // attempt the INSERT query
      mysql.pool.query(sql, inserts.map(elt => elt.value), function (error, results, fields) {
	if (error) { // query failure
	  handle_insert_failure(res, error);
	} else { // query success
	  res.redirect('/troopers');
	}
      });
    }
  });

  // --------------------------------------------------

  function handle_insert_failure(res, error) {
    let stringifiedError = JSON.stringify(error);
    let expectedErrorsHandlers = { // property names are SQL error codes
      "ER_DUP_ENTRY": validator.handleDuplicateInsert(res, error),
      "ER_NO_REFERENCED_ROW_2": validator.handleNonexistentFK(res, error),
    }

    let code = error.code;

    if (expectedErrorsHandlers.hasOwnProperty(code)) {
      res.redirect(`troopers?${expectedErrorsHandlers[code]()}`);
    } else {
      console.log(stringifiedError);
      res.write(stringifiedError);
      res.end();
    }
  }

  // --------------------------------------------------------------------------

  return router;
}();
