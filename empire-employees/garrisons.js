module.exports = function() {
    let express = require('express');
    let router = express.Router();
  
    function getShips(res, mysql, context, complete) {
      mysql.pool.query("SELECT id, name, capacity from garrisons;", function(error, results, fields) {
  
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
        title: "Garrisons",
        heading: "Garrisons",
        jsscripts: [],
      };
  
      let mysql = req.app.get('mysql');
  
      getShips(res, mysql, context, complete);
  
      function complete() {
        callbackCount++;
        if (callbackCount >= 2) {
      res.render('garrisons', context);
        }
      }
    });
  
    return router;
  }();
  