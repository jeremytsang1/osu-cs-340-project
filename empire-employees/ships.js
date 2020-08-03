module.exports = function() {
    let express = require('express');
    let router = express.Router();

    // query parameter name
    const QUERY_ERROR_FIELD = "VALIDATION_ERROR";

    // query parameter values and their corresponding messages to display on the page
    const VALIDATION_ERRORS = {
        NON_UNIQUE_ID: "Please enter an ID that is not already taken!",
        NON_POSITIVE_ID: "Please enter a positive integer for ID!",
        TAMPERED_TYPE: "Selected ship type is invalid!",
    };

    // choices for the drop down menu
    const SHIP_TYPES = [
        "AT-AT",
        "AT-ST",
        "TIE Fighter",
        "Freighter",
        "Star Destroyer",
        "TIE Bomber",
        "TIE Defemder",
        "TIE Interceptor",
        "Shuttle",
        "Speeder Bike",
        "Death Star"
    ];

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
    let query_string = validateInputCreateShip(inserts[0], inserts[1]);

    if (query_string !== "") {
      res.redirect(`/ships?${query_string}`) // display error messages
    } else { // attempt the INSERT query
      sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
	if (error && error.code === "ER_DUP_ENTRY") {
	  // INSERT failed from duplicate ID
	  query_string = `${QUERY_ERROR_FIELD}=NON_UNIQUE_ID`
	  res.redirect(`/ships?${query_string}`)
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
  