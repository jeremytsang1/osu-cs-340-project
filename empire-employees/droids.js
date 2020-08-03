module.exports = function() {
  let express = require('express');
  let router = express.Router();

  // query parameter name
  const QUERY_ERROR_FIELD = "VALIDATION_ERROR";

  // query parameter values and their corresponding messages to display on the page
  const VALIDATION_ERRORS = {
    NON_UNIQUE_ID: "Please enter an ID that is not already taken!",
    NON_POSITIVE_ID: "Please enter a positive integer for ID!",
    TAMPERED_TYPE: "Selected droid type is invalid!",
  };

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
    "Tutor",
  ];

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

  /**
   * Determine if user input for droid.id and droid.type are valid.
   * @param {int} id - user input for the droid.id
   * @param {string} type - user input for the droid.type
   * @return {string} query string field/value pair if invalid else "".
   */
  function validateInputCreateDroid(id, type) {
    if (id <= 0) {
      return `${QUERY_ERROR_FIELD}=NON_POSITIVE_ID`;
    } else if (!DROID_TYPES.includes(req.body.type)) {
      return `${QUERY_ERROR_FIELD}=TAMPERED_TYPE`;
    } else {
      return "";
    }
  }

  // --------------------------------------------------------------------------

  // display all existing droids
  router.get('/', function(req, res) {
    let callbackCount = 0;
    let context = {
      title: "Droids",
      heading: "Droids",
      jsscripts: [],           // filenames of scripts to run
      droidTypes: DROID_TYPES, // options for the dropdown menu
      errorMessage: "",        // message to place at top of page if input invalid
    };

    // check query string for any invalid input
    if (req.query.hasOwnProperty(QUERY_ERROR_FIELD)) {
      context.errorMessage = VALIDATION_ERRORS[req.query[QUERY_ERROR_FIELD]];
    }

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
    let inserts = [req.body.id, req.body.type];

    // validate the user input
    let query_string = validateInputCreateDroid(insert[0], inserts[1]);

    if (query_string !== "") {
      res.redirect(`/droids?${query_string}`) // display error messages
    } else { // attempt the INSERT query
      sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
	if (error) { // failed INSERT query
	  if (error.code === "ER_DUP_ENTRY") { // INSERT failed from duplicate ID
	    query_string = `${QUERY_ERROR_FIELD}=NON_UNIQUE_ID`
	    res.redirect(`/droids?${query_string}`)
	  } else { // INSERT failed for reason other than duplicate ID
	    console.log(JSON.stringify(error));
	    res.write(JSON.stringify(error));
	    res.end();
	  }
	} else {  // successful INSERT query
	  res.redirect('/droids');
	}
      });
    }
  });

  // --------------------------------------------------------------------------
  return router;
}();
