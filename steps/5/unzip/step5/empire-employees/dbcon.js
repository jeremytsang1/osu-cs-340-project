var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  // Store credentials in .env file.
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASS,
  database        : process.env.DB_NAME
});
module.exports.pool = pool;
