module.exports = function() {
  let express = require('express');
  let router = express.Router();

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
    };

    let mysql = req.app.get('mysql');

    getDroids(res, mysql, context, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 1) {
	res.render('droids', context);
      }
    }
  });

  return router;
}();
