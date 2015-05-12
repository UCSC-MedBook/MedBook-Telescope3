exports.command = function() {
  this
    .verify.elementPresent("#leave")
    .verify.elementPresent("#apply")
    .verify.elementPresent("#join")
    .verify.elementPresent("#leave")
  return this;
};
