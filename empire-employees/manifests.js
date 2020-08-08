module.exports = function() {
  let express = require('express');
  let router = express.Router();
  
  // query parameter name
  const QUERY_ERROR_FIELD = "VALIDATION_ERROR";

  // query parameter values and their corresponding messages to display on the page
  const VALIDATION_ERRORS = {
    NON_UNIQUE_ID: "Please enter an ID that is not already taken!",
    NON_POSITIVE_ID: "Please enter a positive integer for ID!",
    TAMPERED_TYPE: "Selected ship and/or occupant ID is invalid!",
  };

  //  let mysql = req.app.get('mysql');

  //  // choices for the drop down menu
  //  const SHIP_IDS = [
  //   mysql.pool.query("SELECT id FROM ships;"),
  //  ];

  //  const OCCUPANT_IDS = [
  //   mysql.pool.query("SELECT id FROM troopers;"),
  //   mysql.pool.query("SELECT id FROM droids;"),
  // ];

  const OCCUPANT_CHOICE = [
    "droid",
    "trooper",

  ];

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

  /**
   * Determine if user input is valid.
   * @param {int} ship - user input for the 
   * @param {int} occupant - user input for the 
   * @param {string} occupantChoice - user input for the 
   * @return {string} query string field/value pair if invalid else "".
   */
  function validateInputCreateManifest(ship, occupant, occupantChoice) {
    // if (!OCCUPANT_CHOICE.includes(occupantChoice)) {
    //   return `${QUERY_ERROR_FIELD}=TAMPERED_TYPE`;
    // } else {
    return "";
    // }
  }

  // --------------------------------------------------------------------------

  // display all existing loadouts
  router.get('/', function(req, res) {
    let callbackCount = 0;
    let context = {
      title: "Manifests",
      heading: "Manifests",
      // manifestShip: SHIP_IDS,
      // manifestOccupant: OCCUPANT_IDS,
      errorMessage: "",
      jsscripts: [],
    };

    // check query string for any invalid input
    if (req.query.hasOwnProperty(QUERY_ERROR_FIELD)) {
      context.errorMessage = VALIDATION_ERRORS[req.query[QUERY_ERROR_FIELD]];
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

  // add a new manifest to one of the tables
  router.post('/', function(req, res) {

    
    let mysql = req.app.get('mysql');


    if (req.body.postButton == "add") {
      let mysql = req.app.get('mysql');
      if (req.body.occupantChoice == "trooper") {
        sql = "INSERT INTO `ships_troopers` (`ship`, `trooper`) VALUE (?, ?);";
      } else if (req.body.occupantChoice == "droid") {
        sql = "INSERT INTO `ships_droids` (`ship`, `droid`) VALUE (?, ?);";
      }

      let inserts = [req.body.ship, req.body.occupant];

      // validate the user input
      let queryString = validateInputCreateManifest(inserts[0], inserts[1]);

      if (queryString !== "") {
        res.redirect(`/manifests?${queryString}`) // display error messages
      } else { // attempt the INSERT query
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
	  if (error && error.code === "ER_DUP_ENTRY") {
	    // INSERT failed from duplicate ID
	    queryString = `${QUERY_ERROR_FIELD}=NON_UNIQUE_ID`
	    res.redirect(`/manifests?${queryString}`)
	  } else if (error) {
	    // INSERT failed for reason other than duplicate ID
	    console.log(JSON.stringify(error));
	    res.write(JSON.stringify(error));
	    res.end();
	  } else {
	    // INSERT succeeded
	    res.redirect('/manifests');
	  }
        });
      }
    }

    else if ((req.body.postButton == "remove")) {

      mysql = req.app.get('mysql');

      if (req.body.occupantChoice == "trooper") {
        sql = "DELETE FROM ships_troopers where ship = ? && trooper = ?;";
      }
      else if (req.body.occupantChoice == "droid") {
        sql = "DELETE FROM ships_droids where ship = ? && droid = ?;";
      }

      let inserts = [req.body.ship, req.body.occupant];

      // validate the user input
      let queryString = validateInputCreateManifest(inserts[0], inserts[1]);

      if (queryString !== "") {
        res.redirect(`/manifests?${queryString}`) // display error messages
      } else { // attempt the INSERT query
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
	  if (error && error.code === "ER_DUP_ENTRY") {
            // INSERT failed from duplicate ID
            queryString = `${QUERY_ERROR_FIELD}=NON_UNIQUE_ID`
            res.redirect(`/manifests?${queryString}`)
	  } else if (error) {
            // INSERT failed for reason other than duplicate ID
            console.log(JSON.stringify(error));
            res.write(JSON.stringify(error));
            res.end();
	  } else {
            // INSERT succeeded
            res.redirect('/manifests');
	  }
	});
      }
    }
  })


  ;


  return router;
}();
