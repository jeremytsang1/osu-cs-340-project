/*
    Uses express, dbcon for database connection, body parser to parse form data
    handlebars for HTML templates
*/

require('dotenv').config();
let express = require('express');
let mysql = require('./dbcon.js');
let bodyParser = require('body-parser');

let app = express();
let handlebars = require('express-handlebars').create({
        defaultLayout:'main',
        });

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
app.set('mysql', mysql);

// ----------------------------------------------------------------------------
// TODO: delete initial starter code

// app.use('/people_certs', require('./people_certs.js'));
// app.use('/people', require('./people.js'));
// app.use('/planets', require('./planets.js'));
// app.use('/', express.static('public'));

// ----------------------------------------------------------------------------
// Routes WITH Helper functions

app.use('/troopers', require('./troopers.js'));

app.use('/loadouts', require('./loadouts.js'));

app.use('/droids', require('./droids.js'));

app.use('/ships', require('./ships.js'));

app.use('/garrisons', require('./garrisons.js'));


// ----------------------------------------------------------------------------
// Routes WITHOUT helper functions.

app.get('/', (req, res) => {
  context = {
    title: "Home",
    heading: "Hey this is the home page!"
  };
  res.render('home', context);
});

// ----------------------------------------------------------------------------
// Error pages

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

// ----------------------------------------------------------------------------

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
