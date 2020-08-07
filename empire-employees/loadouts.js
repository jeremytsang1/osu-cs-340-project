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
	friendlyName: "Blaster", allowedValues: []},
      {field: "detonator", type: Validator.STRING,
	friendlyName: "Detonator", allowedValues: []},
    ],
    // argument 1: primary
    "id",
    // argument 2: fkConstraintNames
    {}
    // argument 3: errorMessages (optional)
  );

 // query parameter name
 const QUERY_ERROR_FIELD = "VALIDATION_ERROR";

 // query parameter values and their corresponding messages to display on the page
 const VALIDATION_ERRORS = {
   NON_UNIQUE_ID: "Please enter an ID that is not already taken!",
   NON_POSITIVE_ID: "Please enter a positive integer for ID!",
   TAMPERED_TYPE: "Selected blaster and/or detonator type is invalid!",
 };

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

  // add a new loadout to the table
//   router.post('/', function(req, res) {
//     let mysql = req.app.get('mysql');

//     updateID = req.body.updateID;
//     updateBlaster = req.body.updateBlaster;
//     updateDetonator = req.body.updateDetonator;

// // ======== if the add button is selected
//     if ((req.body.postButton == "add")) {
//       sql = "INSERT INTO `loadouts` (id, `blaster`, `detonator`) VALUE (?, ?, ?);";
n//       inserts = [req.body.id, req.body.blaster, req.body.detonator];

//       // validate the user input
//       queryString = validateInputCreateLoadout(inserts[0], inserts[1], inserts[2]);

//       if (queryString !== "") {
//         res.redirect(`/loadouts?${queryString}`) // display error messages
//       } else { // attempt the INSERT query
//         sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
//     if (error && error.code === "ER_DUP_ENTRY") {
//       // INSERT failed from duplicate ID
//       queryString = `${QUERY_ERROR_FIELD}=NON_UNIQUE_ID`
//       res.redirect(`/loadouts?${queryString}`)
//     } else if (error) {
//       // INSERT failed for reason other than duplicate ID
//       console.log(JSON.stringify(error));
//       res.write(JSON.stringify(error));
//       res.end();
//     } else {
//       // INSERT succeeded
//       res.redirect('/loadouts');
//     }
//         });
//       }
//     }


// // ======== if the update button is selected
//     else if ((req.body.postButton == "update")) {
//       sql = "UPDATE `loadouts` set `blaster` = '" + String(updateBlaster) + "' , `detonator` = '" + String(updateDetonator) + "' where id = " + String(updateID) + ";";

//       // (id, `blaster`, `detonator`) VALUE (?, ?, ?);";
//       // let inserts = [req.body.id, req.body.blaster, req.body.detonator];

//       // validate the user input
//       let queryString = validateInputCreateLoadout(updateID, updateBlaster, updateDetonator);

//       if (queryString !== "") {
//         res.redirect(`/loadouts?${queryString}`) // display error messages
//       } else { // attempt the INSERT query
//         sql = mysql.pool.query(sql, [updateID, updateBlaster, updateDetonator], function (error, results, fields) {
//     if (error && error.code === "ER_DUP_ENTRY") {
//       // INSERT failed from duplicate ID
//       queryString = `${QUERY_ERROR_FIELD}=NON_UNIQUE_ID`
//       res.redirect(`/loadouts?${queryString}`)
//     } else if (error) {
//       // INSERT failed for reason other than duplicate ID
//       console.log(JSON.stringify(error));
//       res.write(JSON.stringify(error));
//       res.end();
//     } else {
//       // INSERT succeeded
//       res.redirect('/loadouts');
//     }
//         });
//       }
//     }
//     });


  return router;
}();
