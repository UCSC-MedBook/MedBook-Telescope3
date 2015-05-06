/*// add tests to this file using the Nightwatch.js API
// http://nightwatchjs.org/api

module.exports = {
  "MultiActor Collaboration" : function (client) {
    client
      .url("http://localhost:3000")
      .resizeWindow(1024, 768)

      .signIn("housemd")
      .listOfCollaborationsDoesntContain("My Foo Collaboration")
      .canMakeCollaboration("housemd", "My Foo Collaboration")
      .makesCollaboration("housemd", "My Foo Collaboration")
      .listOfCollaborationsContains("My Foo Collaboration")
      .collaborationHasPost("My Foo Collaboration", "Post A")
      .canSeePost("housemd", "Post A")
      .signOut("housemd")
      .signIn("thirteen")
      .canNotSeePost("thirteen", "Post A")
      .canRequestCollaboration("thirteen")
      .requestsCollaboration("thirteen", "My Foo Collaboration")
      .signOut("thirteen")
      .signIn("housemd")
      .canGrantCollaborationAccess("housemd")
      .grantsCollaboration("housemd", "thirteen", "My Foo Collaboration")
      .signOut("housemd")
      .signIn("thirteen")
      .canSeePost("thirteen", "Post A")
      .canNotDenyCollaborationAccess("thirteen")
      .signOut("thirteen")
      .signIn("housemd")
      .canDenyCollaborationAccess("housemd")
      .deniesCollaborationAccess("housemd", "thirteen", "My Foo Collaboration")
      .signOut("housemd")
      .signIn("thirteen")
      .canNotSeePost("thirteen", "Post A")
      .signOut('thirteen')

      .end();
  }
};*/
