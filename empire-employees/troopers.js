module.exports = function() {
  let express = require('express');
  let router = express.Router();

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
      + " INNER JOIN garrisons ON troopers.garrison=garrisons.id;"
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

  return router;
}();
