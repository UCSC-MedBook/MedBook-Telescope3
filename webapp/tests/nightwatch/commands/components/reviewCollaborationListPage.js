exports.command = function(collaborationName) {
  this
    .verify.elementPresent("#mainContent")
    .verify.elementPresent("#collaborationGridTitle")

    .verify.elementPresent("#collaborationListPage")
    .verify.elementPresent("#collaborationListPage .posts")

    .verify.containsText("#collaborationGridTitle", "Browse Collaborations")
    .verify.elementPresent("#addCollaborationButton")

  return this; // allows the command to be chained.
};
