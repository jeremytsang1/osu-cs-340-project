
class Validator {
  constructor(databaseFields, primary, fkConstraintNames, errorMessages = null) {
    // Array of objects of the form {field: "<name>", type: "<Validator.constructor.INT|Validator.constructor.STR>", allowedValues: [<values>...]}
    this.databaseFields = databaseFields;

    // the name primary key (as a string)
    this.primary = primary;

    // foreign key constraints and their repsective fields
    // property name: name of the constraint in the DDQ
    // property value: name of the foreign key
    this.fkConstraintNames = fkConstraintNames;

    // Object where property names are (some) members of
    if (errorMessages === null) {
      // Making new properties from values (borrowed from following post
      // https://stackoverflow.com/a/25333702).
      this.errorMessages = {
	// --------------------------------------------------
	// pre-SQL-query messages
	[Validator.QUERY_PARAM_VALUES_REASON.emptyField]:
	`Please enter a value for ${Validator.REPLACEMENT_STRING}!`,
	[Validator.QUERY_PARAM_VALUES_REASON.nonPositive]:
	`Please enter a positive integer for ${Validator.REPLACEMENT_STRING}!`,
	[Validator.QUERY_PARAM_VALUES_REASON.notInAllowedValues]:
	`Forbidden value chosen for ${Validator.REPLACEMENT_STRING}!`,
	// --------------------------------------------------
	// failed-SQL-query messages
	[Validator.QUERY_PARAM_VALUES_REASON.duplicate]:
	`Please enter a ${Validator.REPLACEMENT_STRING} that is not already taken!`,
	[Validator.QUERY_PARAM_VALUES_REASON.nonexistent]:
	`The specified ${Validator.REPLACEMENT_STRING} could not be found!`,
      };
    } else {
      this.errorMessages = errorMessages;
    }
  }

  // ----------------------------------------------------------------------------
  // Constants

  static get REPLACEMENT_STRING() {
    return "%offender%";
  }

  static get QUERY_PARAM_NAME_REASON() {
    return "reason";
  }

  static get QUERY_PARAM_VALUES_REASON() {
    return {
      // --------------------------------------------------
      // pre-SQL-query reasons
      emptyField: "empty_field",
      nonPositive: "non_positive",
      notInAllowedValues: "not_in_allowed_values",
      // --------------------------------------------------
      // failed-SQL-query reasons
      duplicate: "duplicate",
      nonexistent: "nonexistent",
    };
  }

  static get QUERY_PARAM_NAME_OFFENDER() {
    return "offender";
  }

  static get INT() {
    return "int";
  }

  static get STRING() {
    return "string";
  }

  // ----------------------------------------------------------------------------
  // error messages

  /**
   * Find the appropriate error message and make the offender replacement.
   * @param {object} req - request object
   * @return {string} Either "" if no reason was found. Otherwise error message
   * with its offender placeholder replaced with the offender found in the
   * query string.
   */
  getErrorMessage(req) {
    if (req.query.hasOwnProperty(Validator.QUERY_PARAM_NAME_REASON)) {
      // Assumes req.query[Validator.QUERY_PARAM_NAME_OFFENDER] exists

      // given a reason (from POST request), find its error message
      let reasonValue = req.query[Validator.QUERY_PARAM_NAME_REASON];
      let errorMessage = this.errorMessages[reasonValue];

      // given the offender (from POST request), find its friendly name
      let offender = req.query[Validator.QUERY_PARAM_NAME_OFFENDER];
      let databaseField = this.lookupDatabaseField(offender)
      let friendlyName = databaseField.friendlyName;   // assumed provided in constructor

      // insert the friendly name into the error message
      return errorMessage.replace(Validator.REPLACEMENT_STRING, friendlyName);
    } else {
      return "";
    }
  }

  // ----------------------------------------------------------------------------
  // utilities

  static makeQueryString(reason, offender) {
    return (
      `${Validator.QUERY_PARAM_NAME_REASON}=${reason}&` +
      `${Validator.QUERY_PARAM_NAME_OFFENDER}=${offender}`
    );
  }

  /**
   * Perform a reverse lookup given fieldstring. ASSUMES: fieldString is one of
   * the this.databaseFields[i].field values
   * @param {string} fieldString - Name of a field for the given table. For example
   * if given table is troopers then the field strings are 'id', 'garrison', 'loadout'.
   * @return {object} corresponding property of this.databaseFields.
   */
  lookupDatabaseField(fieldString) {
    return this.databaseFields.filter(databaseField =>
      databaseField.field === fieldString)[0];
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
   * @return {string} query string that is empty if insert is valid. Otherwise
   * contains the reason and the offender.
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
      reason = this.checkAllowedValues(insert, expected);
    }

    // form the query string if we found a reason the insert was invalid
    if (reason !== "") {
      queryString = Validator.makeQueryString(reason, offender);
    }

    return queryString;
  }

  /**
   * Run type-specific validation checks on an insert.
   * @param {object} insert - of the form {field: fieldString, value: validString}
   * @param {object} expected - an element of the array this.databaseFields.
   * @return {string} query string that is empty if insert is valid. Otherwise
   * contains the reason and the offender.
   */
  checkType(insert, expected) {
    switch (expected.type) {
    case Validator.INT:
      // validate that it is actually an integer and it is positive
      let intToBeValidated = parseInt(insert.value);
      if (isNaN(intToBeValidated) || intToBeValidated <= 0) {
	return Validator.QUERY_PARAM_VALUES_REASON.nonPositive;
      }
      break;
    case Validator.STRING:
      // check that the string is non-empty
      if (insert.value === "") {
	return Validator.QUERY_PARAM_VALUES_REASON.emptyField;
      }
      break;
    default:
    }
    return "";
  }

  /**
   * Check if the insert's value is one of the allowed values. Use mostly for
   * dropdown menus to make sure options were not tampered with.
   * @param {object} insert - of the form {field: fieldString, value: validString}
   * @param {object} expected - an element of the array this.databaseFields.
   * @return {string} query string that is empty if insert is valid. Otherwise
   * contains the reason and the offender.
   */
  checkAllowedValues(insert, expected) {
    let valueToCheck = insert.value;
    let allowedValues = expected.allowedValues;

    // If allowed values is in fact non-empty array and the value to check not
    // a member then the insert is invalid.
    if (Array.isArray(allowedValues)
	&& allowedValues.length !== 0
	&& !allowedValues.includes(valueToCheck)) {
      return Validator.QUERY_PARAM_VALUES_REASON.notInAllowedValues;
    } else {
      return "";
    }
  }

  // ----------------------------------------------------------------------------
  // failed-SQL-query handlers
  /**
   * Create the query string for error page showing duplicate error
   * message. Use closure to make sure that `this` refers to the validator
   * ojbect instead of whoever is calling this function.
   * @param {object} res - Node response object
   * @param {object} error - mysql error object
   * @param {} ...rest - additional parameters if present
   * @return {string} query string for the said error
   */
  handleDuplicateInsert() {
    // TODO: overrwrite for primary keys composed of multiple fields
    return (res, error, ...rest) => {
      let reason = Validator.QUERY_PARAM_VALUES_REASON.duplicate;
      let offender = this.primary;
      return Validator.makeQueryString(reason, offender);
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
  handleNonexistentFK() {
    return (res, error, ...rest) => {
      let reason = Validator.QUERY_PARAM_VALUES_REASON.nonexistent;
      let offender = this.fkConstraintNames[this.findRuleInSQLMessage(error)];
      return Validator.makeQueryString(reason, offender);
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
