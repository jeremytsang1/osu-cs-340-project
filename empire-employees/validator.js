
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
  // failed SQL query handlers

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
