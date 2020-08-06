const Validator = require('./validator.js');

function attemptQuery(req, res, mysql, sql, inserts, expectedErrorHandlers, baseRoute) {
  mysql.pool.query(sql, inserts.map(elt => elt.value), (error, results, fields) => {
    if (error) { // query failure
      handleFailedQuery(res, error, expectedErrorHandlers, baseRoute);
    } else { // query success
      // console.log(results);
      let queryString = Validator.handleZeroAffectedRows(results);
      queryString = (queryString === "") ? queryString : `?${queryString}`
      res.redirect(`${baseRoute}${queryString}`); // NOTE: '?' not harded coded
    }
  });
}

function handleFailedQuery(res, error, expectedErrorHandlers, baseRoute) {
  let code = error.code;

  if (expectedErrorHandlers.hasOwnProperty(code)) {  // error was expected
    res.redirect(`${baseRoute}?${expectedErrorHandlers[code](res, error)}`);
  } else {                                           // error was unepected
    let stringifiedError = JSON.stringify(error);
    console.log(stringifiedError);
    res.write(stringifiedError);
    res.end();
  }
}

module.exports = attemptQuery;
