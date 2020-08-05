
class Validator {
  constructor(databaseFields, primary, fkConstraintNames) {
    // Array of objects of the form {field: "<name>", type: "<Validator.constructor.INT|Validator.constructor.STR>", allowedValues: [<values>...]}
    this.databaseFields = databaseFields;

    // the name primary key (as a string)
    this.primary = primary;
    this.fkConstraintNames = fkConstraintNames;
  }

  // ----------------------------------------------------------------------------
  // Constants

  static get REPLACEMENT_STRING() {
    return "%offender%";
  }

  static get QUERY_PARAM_NAME_REASON() {
    return "REASON";
  }

  static get QUERY_PARAM_VALUES_REASON() {
    return {
      duplicate: "DUPLICATE",
      nonPositive: "NON_POSITIVE",
      nonexistent: "NONEXISTENT",
    };
  }

  static get QUERY_PARAM_NAME_OFFENDER() {
    return "OFFENDER";
  }

  // ----------------------------------------------------------------------------
  // utilities

  makeQueryString(reason, offender) {
    return (
      `${this.constructor.QUERY_PARAM_NAME_REASON}=${reason}&` +
      `${this.constructor.QUERY_PARAM_NAME_OFFENDER}=${offender}`
    );
  }

  // ----------------------------------------------------------------------------
  // failed SQL query handlers

  /**
   * Create the query string for error page showing duplicate error message.
   * @param {object} res - Node response object
   * @param {object} error - mysql error object
   * @param {} ...rest - additional parameters if present
   * @return {string} query string for the duplicate INSERT error
   */
  handleDuplicateInsert(res, error, ...rest) {
    // TODO: overrwrite for primary keys composed of multiple fields
    let reason = this.constructor.QUERY_PARAM_VALUES_REASON.duplicate;
    let offender = this.primary;
    return this.makeQueryString(reason, offender);
  }

  // --------------------------------------------------

  handleNonexistentFK(res, error, ...rest) {
    let reason = this.constructor.QUERY_PARAM_VALUES_REASON.nonexistent;
    let offender = this.findRuleInSQLMessage(error);
    return this.makeQueryString(reason, offender);
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
