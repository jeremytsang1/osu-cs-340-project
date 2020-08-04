module.exports = function() {
  let express = require('express');
  let router = express.Router();

 // query parameter name
 const QUERY_ERROR_FIELD = "VALIDATION_ERROR";

 // query parameter values and their corresponding messages to display on the page
 const VALIDATION_ERRORS = {
   NON_UNIQUE_ID: "Please enter an ID that is not already taken!",
   NON_POSITIVE_ID: "Please enter a positive integer for ID!",
   TAMPERED_TYPE: "Selected blaster and/or detonator type is invalid!",
 };

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

  router.get('/', function(req, res) {
    let callbackCount = 0;
    let context = {
      title: "Loadouts",
      heading: "Loadouts",
      jsscripts: [],
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

  return router;
}();
