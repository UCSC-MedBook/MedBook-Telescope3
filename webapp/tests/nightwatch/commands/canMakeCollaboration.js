exports.command = function() {
  this
    .verify.elementPresent("#foo")

  return this;
};
