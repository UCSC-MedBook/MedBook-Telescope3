exports.command = function(title, description, url) {
  this
    .verify.elementPresent("#postSubmitPage")

    /*.verify.elementPresent("#title")
    .verify.elementPresent("#editor")
    .verify.elementPresent("#url")*/

    .setValue('#title', title)
    .setValue('#postBody', description)
    .setValue('#url', url)

    .verify.elementPresent("#submitNewPostButton")
    .click("#submitNewPostButton").pause(1000)

  return this; // allows the command to be chained.
};
