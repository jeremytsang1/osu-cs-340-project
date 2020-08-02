module.exports = function() {
    let express = require('express');
    let router = express.Router();
  
    function getGarrisons(res, mysql, context, complete) {
      mysql.pool.query("SELECT id, name, capacity from garrisons;", function(error, results, fields) {
  
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.garrisons = results;
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
  
      getGarrisons(res, mysql, context, complete);
  
      function complete() {
        callbackCount++;
        if (callbackCount >= 1) {
      res.render('garrisons', context);
        }
      }
    });
  
    return router;
  }();
  