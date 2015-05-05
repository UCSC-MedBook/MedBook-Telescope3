exports.command = function(username, password) {

  this
    .waitForElementVisible('#at-pwd-form', 1000)
      .verify.elementPresent("#at-field-username_and_email")
      .verify.elementPresent("#at-field-password")
      .verify.elementPresent("#at-btn")

      .setValue("#at-field-username_and_email", username)
      .setValue("#at-field-password", password)

    .click("#at-btn").pause(1000)

  return this; // allows the command to be chained.
};
