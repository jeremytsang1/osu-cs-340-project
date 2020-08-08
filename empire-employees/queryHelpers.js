const Validator = require('./validator.js');

function attemptQuery(req, res, mysql, sql, inserts,
  expectedErrorHandlers, baseRoute, extraQueryParams = "") {
  mysql.pool.query(sql, inserts.map(elt => elt.value), (error, results, fields) => {
    if (error) { // query failure
      handleFailedQuery(res, error, expectedErrorHandlers, baseRoute, extraQueryParams);
    } else { // query success
      // console.log(results);
      let queryString = Validator.handleZeroAffectedRows(results);
      queryString = (queryString === "") ? queryString : `?${queryString}`
      res.redirect(`${baseRoute}${queryString}${extraQueryParams}`); // NOTE: '?' not harded coded
    }
  });
}

function handleFailedQuery(res, error, expectedErrorHandlers, baseRoute, extraQueryParams = "") {
  let code = error.code;

  if (expectedErrorHandlers.hasOwnProperty(code)) {  // error was expected
    res.redirect(`${baseRoute}?${expectedErrorHandlers[code](res, error)}${extraQueryParams}`);
  } else {                                           // error was unepected
    let stringifiedError = JSON.stringify(error);
    console.log(stringifiedError);
    res.write(stringifiedError);
    res.end();
  }
}

module.exports = attemptQuery;
