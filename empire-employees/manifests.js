module.exports = function() {
  const BASE_ROUTE = '/manifests';
  const Validator = require('./validator.js');
  const attemptQuery = require('./queryHelpers.js');
  let express = require('express');
  let router = express.Router();

  let queries = {
    'trooper': {
      'insert': "INSERT INTO `ships_troopers` (`ship`, `trooper`) VALUE (?, ?);",
      'delete': "INSERT INTO `ships_droids` (`ship`, `droid`) VALUE (?, ?);"
    },
    'droid': {
      'insert': "DELETE FROM ships_troopers where ship = ? && trooper = ?;",
      'delete': "DELETE FROM ships_droids where ship = ? && droid = ?;"
    }
  }

  let validatorTroopers = new Validator(
    // argument 0: databaseFields
    [
      {field: "ship", type: Validator.INT,
	friendlyName: "Ship ID", allowedValues: []},
      {field: "trooper", type: Validator.INT,
	friendlyName: "Trooper ID", allowedValues: []},
    ],
    // argument 1: primary
    ["ship", "trooper"],
    // argument 2: fkConstraintNames
    {
      fk_ships_troopers_ship: 'ship',
      fk_ships_troopers_trooper: 'trooper'
    }
    // argument 3: errorMessages (optional)
  );

  let validatorDroids = new Validator(
    // argument 0: databaseFields
    [
      {field: "ship", type: Validator.INT,
	friendlyName: "Ship ID", allowedValues: []},
      {field: "droid", type: Validator.INT,
	friendlyName: "Droid ID", allowedValues: []},
    ],
    // argument 1: primary
    ["ship", "droid"],
    // argument 2: fkConstraintNames
    {
      fk_ships_droids_ship: 'ship',
      fk_ships_droids_droid: 'droid'
    }
    // argument 3: errorMessages (optional)
  );

  let validators = {
    'trooper': validatorTroopers,
    'droid': validatorDroids,
  }

  // set custom error message
  for (let key in validators) {
    validators[key].setErrorMessage(
      Validator.QUERY_PARAM_VALUES_REASON.duplicate,
      "Occupant is already onboard given ship!"
    );
  }

  // --------------------------------------------------------------------------

  function getManifests(res, mysql, context, complete) {
    mysql.pool.query("SELECT ship, trooper from ships_troopers;", function(error, results, fields) {

      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.ships_troopers = results;
      complete();
    });

    mysql.pool.query("SELECT ship, droid from ships_droids;", function(error, results, fields) {

      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.ships_droids = results;
      complete();
    });    
  }

  // --------------------------------------------------------------------------

  // display all existing loadouts
  router.get('/', function(req, res) {
    let callbackCount = 0;
    let context = {
      title: "Manifests",
      heading: "Manifests",
      jsscripts: [],
      errorMessage: "",
    };

    // decide on a validator based on the query string parameter `occupant`
    let validator = (req.query.occupant in validators)
	? validators[req.query.occupant]
	: null;

    // choose the error message to display if validator is non-null
    if (validator !== null) {
      context.errorMessage = validator.getErrorMessage(req);
    }

    let mysql = req.app.get('mysql');

    getManifests(res, mysql, context, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 2) {
	res.render('manifests', context);
      }
    }
  });

  // --------------------------------------------------------------------------

  // add a new manifest to one of the tables
  router.post('/', function(req, res) {
    let mysql = req.app.get('mysql');

    let operation = req.body['postButton']; // "insert" or "delete"
    let occupant = req.body.occupantChoice; // "trooper" or "droid"
    let sql = queries[occupant][operation];
    let inserts = [{field: 'ship', value: req.body.ship}]; // ship shows up in both queries
    let validator = validators[occupant];
    let extraQueryParams = `&occupant=${occupant}`;

    let expectedErrorHandlers = {// NOTE: this is irrelevant for DELETE
      "ER_DUP_ENTRY": validator.handleDuplicateInsert(),
      "ER_NO_REFERENCED_ROW_2": validator.handleNonexistentFK(),
    };

    let queryString = validator.validateBeforeQuery(inserts);

    if (queryString !== "") {
      res.redirect(`${BASE_ROUTE}?${queryString}${extraQueryParams}`)
    } else {
      attemptQuery(req, res, mysql, sql, inserts, expectedErrorHandlers,
	BASE_ROUTE, extraQueryParams);
    }
  });

  // ----------------------------------------------------------------------------

  return router;
}();
