module.exports = function() {
  let express = require('express');
  let router = express.Router();

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
