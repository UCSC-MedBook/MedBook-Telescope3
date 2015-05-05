// add tests to this file using the Nightwatch.js API
// http://nightwatchjs.org/api

module.exports = {
  "Layout & Static Pages" : function (client) {
    client
      .url("http://localhost:3000")
      .resizeWindow(1024, 768)
      .verify.listOfCollaborationsDoesntContains("My Foo Collaboration")
      .verify.canMakeCollaboration("housemd", "My Foo Collaboration")
      .verify.makesCollaboration("housemd", "My Foo Collaboration")
      .verify.listOfCollaborationsContains("My Foo Collaboration")
      .verify.collaborationHasPost("My Foo Collaboration", "Post A")
      .verify.canSeePost("housemd", "Post A")
      .verify.canNotSeePost("thirteen", "Post A")
      .verify.canRequestCollaboration("thirteen")
      .verify.requestsCollaboration("thirteen", "My Foo Collaboration")
      .verify.canGrantCollaborationAccess("housemd")
      .verify.grantsCollaboration("housemd", "thirteen", "My Foo Collaboration")
      .verify.canSeePost("thirteen", "Post A")
      .verify.canDenyCollaborationAccess("housemd")
      .verify.canNotDenyCollaborationAccess("thirteen")
      .verify.deniesCollaborationAccess("housemd", "thirteen", "My Foo Collaboration")
      .verify.canNotSeePost("thirteen", "Post A")

      .end();
  }
};
