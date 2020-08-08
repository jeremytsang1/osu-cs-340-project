module.exports = function() {
  const BASE_ROUTE = '/ships';
  const Validator = require('./validator.js');
  const attemptQuery = require('./queryHelpers.js');
  let express = require('express');
  let router = express.Router();

  // choices for the drop down menu
  const SHIP_TYPES = [
    "AT-AT",
    "AT-ST",
    "TIE Fighter",
    "TIE Bomber",
    "TIE Defender",
    "TIE Interceptor",
    "Freighter",
    "Star Destroyer",
    "Shuttle",
    "Speeder Bike",
    "Death Star"
  ];

  let validator = new Validator(
    [ // argument 0: databaseFields
      {field: "id", type: Validator.INT,
	friendlyName: "Ship ID", allowedValues: []},
      {field: "type", type: Validator.STRING,
	friendlyName: "Type", allowedValues: SHIP_TYPES}
    ],
    // argument 1: primary
    "id",
    // argument 2: fkConstraintNames
    {}
    // argument 3: errorMessages (optional)
  );
  // --------------------------------------------------------------------------
  
  function getShips(res, mysql, context, complete) {
    mysql.pool.query("SELECT id, type from ships;", function(error, results, fields) {

      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.ships = results;
      complete();
    });
  }

  // --------------------------------------------------------------------------
  
  // display all existing ships
  router.get('/', function(req, res) {
    let callbackCount = 0;
    let context = {
      title: "Ships",
      heading: "Ships",
      jsscripts: [],          // filename of scrips to run
      shipTypes: SHIP_TYPES,  // options for the dropdown menu
      errorMessage: "",       // message to place at top of page if input invalid
    };

    // check query string for any invalid input
    if (req.query.hasOwnProperty(QUERY_ERROR_FIELD)) {
      context.errorMessage = VALIDATION_ERRORS[req.query[QUERY_ERROR_FIELD]];
    }

    let mysql = req.app.get('mysql');
    
    getShips(res, mysql, context, complete);
    
    function complete() {
      callbackCount++;
      if (callbackCount >= 1) {
        res.render('ships', context);
      }
    }
  });
  
  // add a new ship to the table
  router.post('/', function(req, res) {
    let mysql = req.app.get('mysql');
    let sql = "INSERT INTO `ships` (id, `type`) VALUE (?, ?);";
    let inserts = [req.body.id, req.body.type];

    // validate the user input
    let queryString = validateInputCreateShip(inserts[0], inserts[1]);

    if (queryString !== "") {
      res.redirect(`/ships?${queryString}`) // display error messages
    } else { // attempt the INSERT query
      sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
	if (error && error.code === "ER_DUP_ENTRY") {
	  // INSERT failed from duplicate ID
	  queryString = `${QUERY_ERROR_FIELD}=NON_UNIQUE_ID`
	  res.redirect(`/ships?${queryString}`)
	} else if (error) {
	  // INSERT failed for reason other than duplicate ID
	  console.log(JSON.stringify(error));
	  res.write(JSON.stringify(error));
	  res.end();
	} else {
	  // INSERT succeeded
	  res.redirect('/ships');
	}
      });
    }
  });

  return router;
}();
