/*// add tests to this file using the Nightwatch.js API
// http://nightwatchjs.org/api

module.exports = {
  "MultiActor Collaboration" : function (client) {
    client
      .url("http://localhost:3000")
      .resizeWindow(1024, 768)

      .listOfCollaborationsDoesntContain("My Foo Collaboration")
      .canMakeCollaboration("housemd", "My Foo Collaboration")
      .makesCollaboration("housemd", "My Foo Collaboration")
      .listOfCollaborationsContains("My Foo Collaboration")
      .collaborationHasPost("My Foo Collaboration", "Post A")
      .canSeePost("housemd", "Post A")
      .canNotSeePost("thirteen", "Post A")
      .canRequestCollaboration("thirteen")
      .requestsCollaboration("thirteen", "My Foo Collaboration")
      .canGrantCollaborationAccess("housemd")
      .grantsCollaboration("housemd", "thirteen", "My Foo Collaboration")
      .canSeePost("thirteen", "Post A")
      .canDenyCollaborationAccess("housemd")
      .canNotDenyCollaborationAccess("thirteen")
      .deniesCollaborationAccess("housemd", "thirteen", "My Foo Collaboration")
      .canNotSeePost("thirteen", "Post A")

      .end();
  }
};*/
