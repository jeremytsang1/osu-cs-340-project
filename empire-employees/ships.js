module.exports = function() {
  const BASE_ROUTE = '/droids';
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

    /**
     * Determine if user input for ship.id and ship.type are valid.
     * @param {int} id - user input for the ship.id
     * @param {string} type - user input for the ship.type
     * @return {string} query string field/value pair if invalid else "".
     */
    function validateInputCreateShip(id, type) {
        if (id <= 0) {
        return `${QUERY_ERROR_FIELD}=NON_POSITIVE_ID`;
        } else if (!SHIP_TYPES.includes(type)) {
        return `${QUERY_ERROR_FIELD}=TAMPERED_TYPE`;
        } else {
        return "";
        }
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
        errorMessage: validator.getErrorMessage(req),
      };

  
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

  return router;
  }();
