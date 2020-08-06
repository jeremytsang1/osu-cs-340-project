module.exports = function() {
  const BASE_ROUTE = '/troopers';
  const Validator = require('./validator.js');
  const attemptQuery = require('./queryHelpers.js');
  let express = require('express');
  let router = express.Router();

  let validator = new Validator(
    [ // argument 0: databaseFields
      {field: "id", type: Validator.INT,
	friendlyName: "Trooper ID", allowedValues: []},
      {field: "garrison", type: Validator.INT,
	friendlyName: "Garrison ID", allowedValues: []},
      {field: "loadout", type: Validator.INT,
	friendlyName: "Loadout ID", allowedValues: []},
    ],
    // argument 1: primary
    "id",
    // argument 2: fkConstraintNames
    {
      fk_troopers_garrison: 'garrison',
      fk_troopers_loadout: 'loadout'
    }
    // argument 3: errorMessages (optional)
  );

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
      + " LEFT JOIN garrisons ON troopers.garrison=garrisons.id"
      + " ORDER BY troopers.id"
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
      errorMessage: validator.getErrorMessage(req),
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

  // Handling POST requests
  router.post('/', function(req, res) {
    let mysql = req.app.get('mysql');

    switch (req.body['postButton']) {
    case "insert":
      handleInsert(req, res, mysql);
      break;
    case "update":
      handleUpdate(req, res, mysql);
      break;
    case "delete":
      handleDelete(req, res, mysql);
      break;
    }
  });

  // ----------------------------------------------------------------------------

  // add a new trooper to the table
  function handleInsert(req, res, mysql) {
    let sql = "INSERT INTO `troopers` (`id`, `garrison`, `loadout`) VALUES (?, ?, ?)";
    let inserts = [
      {field: 'id', value: req.body.id},
      {field: 'garrison', value: req.body.garrison},
      {field:'loadout', value: req.body.loadout},
    ];

    let expectedErrorHandlers = { // property names are SQL error codes
      "ER_DUP_ENTRY": validator.handleDuplicateInsert(),
      "ER_NO_REFERENCED_ROW_2": validator.handleNonexistentFK(),
    };

    // validate the user input
    let queryString = validator.validateBeforeQuery(inserts);

    if (queryString !== "") {
      res.redirect(`${BASE_ROUTE}?${queryString}`) // display error messages
    } else { // attempt the INSERT query
      attemptQuery(req, res, mysql, sql, inserts, expectedErrorHandlers, BASE_ROUTE);
    }
  }

  // --------------------------------------------------

  // update a trooper's garrison
  function handleUpdate(req, res, mysql) {
    let sql;
    let inserts;
    let expectedErrorHandlers;

    // decide if the UPDATE is to remove from a garrison or move to
    // another garrison
    switch(req.body.updateAction) {
    case 'remove':
      sql = "UPDATE troopers SET garrison=NULL WHERE id=?;"
      inserts = [
	{field: 'id', value: req.body.id},
      ];
      expectedErrorHandlers = {};
      break;
    case 'move':
      sql = "UPDATE troopers SET garrison=? WHERE id=?";
      inserts = [
	{field: 'garrison', value: req.body.garrison},
	{field: 'id', value: req.body.id},
      ];
      expectedErrorHandlers = {
	"ER_NO_REFERENCED_ROW_2": validator.handleNonexistentFK()
      };
      break;
    }

    // validate the user input
    let queryString = validator.validateBeforeQuery(inserts);

    if (queryString !== "") { // display error messages
      res.redirect(`${BASE_ROUTE}?${queryString}`)
    } else { // attempt the query
      attemptQuery(req, res, mysql, sql, inserts, expectedErrorHandlers, BASE_ROUTE);}
  }

  // --------------------------------------------------

  // remove a trooper from the table
  function handleDelete(req, res, mysql) {
    let sql = "DELETE FROM `troopers` WHERE id=?;";
    let inserts = [
      {field: 'id', value: req.body.id},
    ];
    let expectedErrorHandlers = {};

    // validate the user input
    let queryString = validator.validateBeforeQuery(inserts);

    if (queryString !== "") {
      res.redirect(`${BASE_ROUTE}?${queryString}`) // display error messages
    } else {
      attemptQuery(req, res, mysql, sql, inserts, expectedErrorHandlers, BASE_ROUTE);
    }
  }

  // ----------------------------------------------------------------------------
  return router;
}();
