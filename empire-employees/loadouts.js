module.exports = function() {
  const BASE_ROUTE = '/loadouts';
  const Validator = require('./validator.js');
  const attemptQuery = require('./queryHelpers.js');
  let express = require('express');
  let router = express.Router();

  // choices for the drop down menu
  const BLASTER_TYPES = [
    "E-11",
    "DC-15A",
    "DLT-19",
    "A280",
    "E-10",
    "E-22",
    "C-303",
  ];

  const DETONATOR_TYPES = [
    "Thermal",
    "Sonic",
  ];

  let validator = new Validator(
    // argument 0: databaseFields
    [
      {field: "id", type: Validator.INT,
	friendlyName: "Loadout ID", allowedValues: []},
      {field: "blaster", type: Validator.STRING,
	friendlyName: "Blaster", allowedValues: BLASTER_TYPES},
      {field: "detonator", type: Validator.STRING,
	friendlyName: "Detonator", allowedValues: DETONATOR_TYPES},
    ],
    // argument 1: primary
    "id",
    // argument 2: fkConstraintNames
    {}
    // argument 3: errorMessages (optional)
  );

 // --------------------------------------------------------------------------


  function getLoadouts(res, mysql, context, complete) {
    mysql.pool.query("SELECT id, blaster, detonator from loadouts;", function(error,
      results, fields) {

      if (error) {
	res.write(JSON.stringify(error));
	res.end();
      }
      context.loadouts = results;
      complete();
    });
  }

  // --------------------------------------------------------------------------

  // display all existing loadouts
  router.get('/', function(req, res) {
    let callbackCount = 0;
    let context = {
      title: "Loadouts",
      heading: "Loadouts",
      jsscripts: [],
      blasterTypes: BLASTER_TYPES,
      detonatorTypes: DETONATOR_TYPES,
      errorMessage: validator.getErrorMessage(req),
    };

    let mysql = req.app.get('mysql');

    getLoadouts(res, mysql, context, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 1) {
	res.render('loadouts', context);
      }
    }
  });

  router.post('/', function(req, res) {
    let mysql = req.app.get('mysql');

    switch (req.body['postButton']) {
    case "insert":
      handleInsert(req, res, mysql);
      break;
    case "update":
      handleUpdate(req, res, mysql);
      break;
    }
  });

  function handleInsert(req, res, mysql) {
    let sql = "INSERT INTO `loadouts` (id, `blaster`, `detonator`) VALUE (?, ?, ?);";

    let inserts = [  // must appear in same order as in the query
      {field: 'id', value: req.body.id},
      {field: 'blaster', value: req.body.blaster},
      {field: 'detonator', value: req.body.detonator},
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

  function handleUpdate(req, res, mysql) {
    let sql = "UPDATE loadouts SET blaster=?, detonator=? WHERE id=?;";

    let inserts = [  // must appear in same order as in the query
      {field: 'blaster', value: req.body.blaster},
      {field: 'detonator', value: req.body.detonator},
      {field: 'id', value: req.body.id},
    ];

    let expectedErrorHandlers = { // property names are SQL error codes
      "ER_NO_REFERENCED_ROW_2": validator.handleNonexistentFK()
    };

    // validate the user input
    let queryString = validator.validateBeforeQuery(inserts);

    if (queryString !== "") {
      res.redirect(`${BASE_ROUTE}?${queryString}`) // display error messages
    } else { // attempt the INSERT query
      attemptQuery(req, res, mysql, sql, inserts, expectedErrorHandlers, BASE_ROUTE);
    }
  }

  return router;
}();
