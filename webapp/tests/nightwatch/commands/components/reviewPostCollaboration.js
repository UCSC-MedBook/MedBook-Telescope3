exports.command = function() {
  this
    .verify.elementPresent("#addCollaboratorsPoppup")
    .verify.elementPresent("#addCollaboratorsDone")
    .verify.elementPresent("#scrim")
  return this;
};
