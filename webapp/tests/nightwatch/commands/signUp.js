exports.command = function(username, email, password) {

  this
    .waitForElementVisible('#at-pwd-form', 1000)
    .verify.elementPresent("#at-field-username")
      .verify.elementPresent("#at-field-email")
      .verify.elementPresent("#at-field-password")
      .verify.elementPresent("#at-btn")

      .setValue("#at-field-username", username)
      .setValue("#at-field-email", email)
      .setValue("#at-field-password", password)

    .click("#at-btn").pause(1000)

  return this; // allows the command to be chained.
};
