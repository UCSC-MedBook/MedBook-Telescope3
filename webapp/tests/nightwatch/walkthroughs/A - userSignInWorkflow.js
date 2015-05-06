// add tests to this file using the Nightwatch.js API
// http://nightwatchjs.org/api

module.exports = {
  "Accounts SignIn/SignUp" : function (client) {
    client
      .url("http://localhost:3000")
      .resizeWindow(1024, 768)
      .verify.elementPresent("body")

      .verify.elementNotPresent("#userMenu")
      .verify.elementPresent("#signInLink")

      .verify.elementPresent("#signUpLink")
      .click("#signUpLink").pause(300)


      .signUp("janedoe123", "janedoe@test.org", "janedoe123")
      .verify.elementPresent("#mainContent")
      .verify.elementPresent("#userMenu")
      .verify.elementPresent("#currentUsername")

      .signOut()

      .verify.elementNotPresent("#userMenu")
      .verify.elementNotPresent("#currentUsername")
      .verify.elementPresent("#signInLink")
      .verify.elementPresent("#signUpLink")

      .click("#signInLink").pause(300)
      .signIn("janedoe123", "janedoe123")

      .verify.elementPresent("#userMenu")
      .verify.elementPresent("#currentUsername")

      .signOut()


      .end();
  }
};
