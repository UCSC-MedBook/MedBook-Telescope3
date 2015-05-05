exports.command = function() {

  this
      .click("#currentUsername").pause(300)

      .verify.elementPresent("#myAccountLink")
      .verify.elementPresent("#signOutButton")

      .click("#signOutButton").pause(500)

  return this; // allows the command to be chained.
};
