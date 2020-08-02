module.exports = function() {
    let express = require('express');
    let router = express.Router();
  
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
  
    router.get('/', function(req, res) {
      let callbackCount = 0;
      let context = {
        title: "Ships",
        heading: "Ships",
        jsscripts: [],
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
  
    return router;
  }();
  