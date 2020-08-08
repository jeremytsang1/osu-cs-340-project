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
      queryString = addExtraQueryParams(queryString, extraQueryParams);
      res.redirect(`${baseRoute}${queryString}`); // NOTE: '?' not harded coded
    }
  });
}

function handleFailedQuery(res, error, expectedErrorHandlers, baseRoute, extraQueryParams = "") {
  let code = error.code;

  if (expectedErrorHandlers.hasOwnProperty(code)) {  // error was expected
    let queryString = expectedErrorHandlers[code](res, error);
    queryString = addExtraQueryParams(queryString, extraQueryParams);
    res.redirect(`${baseRoute}?${queryString}`);
  } else {                                           // error was unepected
    let stringifiedError = JSON.stringify(error);
    console.log(stringifiedError);
    res.write(stringifiedError);
    res.end();
  }
}

function addExtraQueryParams(queryString, extraQueryParams) {
  let result = queryString;
  if (queryString !== "") {
    result += extraQueryParams
  } else {
    if (extraQueryParams !== "") {
      result += `?${extraQueryParams}`
    }
  }
  return result;
}

module.exports = attemptQuery;
