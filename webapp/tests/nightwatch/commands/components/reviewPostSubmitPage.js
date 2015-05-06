exports.command = function() {
  this
    .verify.elementPresent("#postSubmitPage")

    .verify.elementPresent("#title")
    .verify.elementPresent("#postBody")
    .verify.elementPresent("#url")

  return this; // allows the command to be chained.
};
