module.exports = function() {
    let express = require('express');
    let router = express.Router();
  
    function getManifests(res, mysql, context, complete) {
      mysql.pool.query("SELECT ship, trooper from ships_troopers;", function(error, results, fields) {
  
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.ships_troopers = results;
        // complete();
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
  
    router.get('/', function(req, res) {
      let callbackCount = 0;
      let context = {
        title: "Manifests",
        heading: "Manifests",
        jsscripts: [],
      };
  
      let mysql = req.app.get('mysql');
  
      getManifests(res, mysql, context, complete);
  
      function complete() {
        callbackCount++;
        if (callbackCount >= 1) {
      res.render('manifests', context);
        }
      }
    });
  
    return router;
  }();
  