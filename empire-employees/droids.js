module.exports = function() {
  let express = require('express');
  let router = express.Router();

  const QUERY_ERROR_FIELD = "VALIDATION_ERROR";
  const VALIDATION_ERRORS = {
    NON_UNIQUE_ID: "Please enter an ID that is not already taken!",
    NON_POSITIVE_ID: "Please enter a positive integer for ID!",
    TAMPERED_TYPE: "Selected droid type is invalid!",
  };
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

  router.get('/', function(req, res) {
    let callbackCount = 0;
    let context = {
      title: "Droids",
      heading: "Droids",
      jsscripts: [],
      droidTypes: DROID_TYPES,
      errorMessage: "",
    };

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

  // add a new droid to the table
  router.post('/', function(req, res) {
    let mysql = req.app.get('mysql');
    let sql = "INSERT INTO `droids` (id, `type`) VALUE (?, ?);";
    let inserts = [req.body.id, req.body.type];

    if (req.body.id <= 0) {
      res.redirect(`/droids?${QUERY_ERROR_FIELD}=NON_POSITIVE_ID`)
    } else if (!DROID_TYPES.includes(req.body.type)) { // validate droid type
      // do not bother saving to database if droid type has been tampered with
      res.redirect(`/droids?${QUERY_ERROR_FIELD}=TAMPERED_TYPE`)
    } else { // attempt the INSERT query
      sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
	if (error) { // failed INSERT query
	  if (error.code === "ER_DUP_ENTRY") { // Duplicate ID
	    // redirect if ID was found to be non-unique
	    res.redirect(`/droids?${QUERY_ERROR_FIELD}=NON_UNIQUE_ID`);
	  } else {
	    // failed for reason other than duplicate ID
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

  return router;
}();
