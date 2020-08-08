module.exports = function() {
  const BASE_ROUTE = '/manifests';
  const Validator = require('./validator.js');
  const attemptQuery = require('./queryHelpers.js');
  let express = require('express');
  let router = express.Router();

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
      "Occupant is already associated with given ship!"
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

    switch (req.body['postButton']) {
    case "insert":
      handleInsert(req, res, mysql);
      break;
    case "delete":
      handleDelete(req, res, mysql);
      break;
    }
  });

  // --------------------------------------------------------------------------

  function handleInsert(req, res, mysql) {

  }

  // --------------------------------------------------

  function handleDelete(req, res, mysql) {

  }


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



  return router;
}();
