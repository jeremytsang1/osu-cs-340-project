
class Validator {
  constructor(databaseFields, primary, fkConstraintNames) {
    // Array of objects of the form {field: "<name>", type: "<Validator.constructor.INT|Validator.constructor.STR>", allowedValues: [<values>...]}
    this.databaseFields = databaseFields;

    // the name primary key (as a string)
    this.primary = primary;

    // foreign key constraints and their repsective fields
    // property name: name of the constraint in the DDQ
    // property value: name of the foreign key
    this.fkConstraintNames = fkConstraintNames;
  }

  // ----------------------------------------------------------------------------
  // Constants

  get REPLACEMENT_STRING() {
    return "%offender%";
  }

  get QUERY_PARAM_NAME_REASON() {
    return "reason";
  }

  get QUERY_PARAM_VALUES_REASON() {
    return {
      duplicate: "duplicate",
      nonPositive: "non_positive",
      emptyField: "empty_field",
      nonexistent: "nonexistent",
      notInAllowedValues: "not_in_allowed_values",
    };
  }

  get QUERY_PARAM_NAME_OFFENDER() {
    return "offender";
  }

  get INT() {
    return "int";
  }

  get STRING() {
    return "string";
  }

  // ----------------------------------------------------------------------------
  // utilities

  makeQueryString(reason, offender) {
    return (
      `${this.QUERY_PARAM_NAME_REASON}=${reason}&` +
      `${this.QUERY_PARAM_NAME_OFFENDER}=${offender}`
    );
  }

  // ----------------------------------------------------------------------------
  // validations to perform before performing query


  /**
   * Validate the values coming from the form before performing the SQL query.
   * @param {[object]} inserts - Array of objects where each object has the
   * form {field: fieldString, value: valueString} where fieldString is one
   * this.databaseFields[i].field and valueString is the string directly HTML
   * <input> tag input by the user. An example `inserts` has the form
   * [
   *   {field: 'id', value: req.body.id},
   *   {field: 'garrison', value: req.body.garrison},
   *   {field:'loadout', value: req.body.loadout},
   * ];
   * @return
   */
  validateBeforeQuery(inserts) {
    let queryString = "";

    // iterate over the inserts to check if any have validation errors
    for (let i = 0; i < inserts.length && queryString === ""; i++) {
      queryString = this.validateSingleInsert(inserts[i]);

      // stop iterating if one of the inserts is invalid
      if (queryString !== "") {
	return queryString
      }
    }

    // no pre-SQL-query validation errors found
    return queryString;
  }

  /**
   * Predicate. Assumes `insert.field` is one of the `this.databaseFields[i].field`.
   * @param {object} insert - of the form {field: fieldString, value: validString}
   * @return {string} query string that is empty if insert is valid. Otherwise
   * contains the reason and the offender.
   */
  validateSingleInsert(insert) {
    let queryString = "";
    let expected = this.databaseFields.filter(obj => obj.field == insert.field)[0];
    let reason;
    let offender = insert.field;

    // check type
    reason = this.checkType(insert, expected);

    // check if it is one of the predefined values
    if (reason === "") {
      reason = checkAllowedValues(insert, expected);
    }

    // form the query string if we found a reason the insert was invalid
    if (reason !== "") {
      queryString = (`${this.QUERY_PARAM_NAME_REASON}=${reason}&` +
	  `${this.QUERY_PARAM_NAME_OFFENDER}=${offender}`);
    }

    return queryString;
  }


  // ----------------------------------------------------------------------------
  // failed SQL query handlers
  /**
   * Create the query string for error page showing duplicate error
   * message. Use closure to make sure that `this` refers to the validator
   * ojbect instead of whoever is calling this function.
   * @param {object} res - Node response object
   * @param {object} error - mysql error object
   * @param {} ...rest - additional parameters if present
   * @return {string} query string for the said error
   */
  handleDuplicateInsert(res, error, ...rest) {
    // TODO: overrwrite for primary keys composed of multiple fields
    return () => {
      let reason = this.QUERY_PARAM_VALUES_REASON.duplicate;
      let offender = this.primary;
      return this.makeQueryString(reason, offender);
    };
  }

  // --------------------------------------------------

  /**
   * Create the query string for error page showing nonexistent foreign key
   * error message. Use closure to make sure that `this` refers to the
   * validator ojbect instead of whoever is calling this function.
   * @param {object} res - Node response object
   * @param {object} error - mysql error object
   * @param {} ...rest - additional parameters if present
   * @return {string} query string for the said error
   */
  handleNonexistentFK(res, error, ...rest) {
    return () => {
      let reason = this.QUERY_PARAM_VALUES_REASON.nonexistent;
      let offender = this.findRuleInSQLMessage(error);
      return this.makeQueryString(reason, offender);
    }
  }

  // TODO: find less hackey way of finding the constrain name
  // determine which foreign key constraint is violated
  // Assumes name is between substrings "CONSTRAINT `" and "` FOREIGN KEY".
  // WARNING: Depends on the exact format of the SQL error message.
  findRuleInSQLMessage(error) {
    let msg = error.sqlMessage;
    let wordBefore = 'CONSTRAINT \`';
    let wordAfter = '\` FOREIGN KEY';
    let substringStart = msg.indexOf(wordBefore) + wordBefore.length;
    let substringEnd = msg.indexOf(wordAfter);
    return msg.slice(substringStart, substringEnd);
  }
}

module.exports = Validator
