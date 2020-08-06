module.exports = function() {
  const BASE_ROUTE = '/droids';
  const Validator = require('./validator.js');
  const attemptQuery = require('./queryHelpers.js');
  let express = require('express');
  let router = express.Router();

  // choices for the drop down menu
  const DROID_TYPES = [
    "Assassin",
    "Astromech",
    "Battle",
    "Biological Science",
    "Child Care",
    "Engineering",
    "Environmental",
    "Exploration",
    "General Labor",
    "Gladiator",
    "Hazardous Service",
    "Labor Specialist",
    "Maintenance",
    "Mathematics",
    "Medical",
    "Physical Science",
    "Protocol",
    "Security",
    "Servant",
    "Tutor"
  ];

  let validator = new Validator(
    [ // argument 0: databaseFields
      {field: "id", type: Validator.INT,
	friendlyName: "Droid ID", allowedValues: []},
      {field: "type", type: Validator.STRING,
	friendlyName: "Type", allowedValues: DROID_TYPES}
    ],
    // argument 1: primary
    "id",
    // argument 2: fkConstraintNames
    {}
    // argument 3: errorMessages (optional)
  );

  // query parameter values and their corresponding messages to display on the page
  const VALIDATION_ERRORS = {
    NON_UNIQUE_ID: "Please enter an ID that is not already taken!",
    NON_POSITIVE_ID: "Please enter a positive integer for ID!",
    TAMPERED_TYPE: "Selected droid type is invalid!",
  };

  // --------------------------------------------------------------------------

  function getDroids(res, mysql, context, complete) {
    mysql.pool.query("SELECT id, type from droids;", function(error, results, fields) {

      if (error) {
	res.write(JSON.stringify(error));
	res.end();
      }
      context.droids = results;
      complete();
    });
  }

  // --------------------------------------------------------------------------

  // display all existing droids
  router.get('/', function(req, res) {
    let callbackCount = 0;
    let context = {
      title: "Droids",
      heading: "Droids",
      jsscripts: [],           // filenames of scripts to run
      errorMessage: validator.getErrorMessage(req),
      droidTypes: DROID_TYPES, // options for the dropdown menu
    };

    let mysql = req.app.get('mysql');

    getDroids(res, mysql, context, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 1) {
	res.render('droids', context);
      }
    }
  });

  // --------------------------------------------------------------------------

  // add a new droid to the table
  router.post('/', function(req, res) {
    let mysql = req.app.get('mysql');
    let sql = "INSERT INTO `droids` (id, `type`) VALUE (?, ?);";
    let inserts = [  // must appear in same order as in the query
      {field: 'id', value: req.body.id},
      {field: 'type', value: req.body.type},
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
  });

  // --------------------------------------------------------------------------

  return router;
}();
