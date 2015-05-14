// add tests to this file using the Nightwatch.js API
// http://nightwatchjs.org/api

module.exports = {
  "MultiActor Collaboration" : function (client) {
    client
      .url("http://localhost:3000")
      .resizeWindow(1024, 768)

      .verify.elementPresent("#signInLink")
      .click("#signInLink").pause(500)

      .signIn("janedoe123", "janedoe123")


      /*.signIn("housemd")*/

      .verify.elementPresent("#collaborationListButton")
      .click("#collaborationListButton").pause(300)

      .reviewCollaborationListPage("My Foo Collaboration")
      /*.listOfCollaborationsDoesntContain("My Foo Collaboration")*/

      .click("#addCollaborationButton").pause(300)

      .reviewAddCollaborationPage(false, false, false, false, false, false, false)
      .addCollaboration("This is a Test", "Lorem Ipsum...", false, "janedoe123", "janedoe123", false, "")
      .pause(1000)

      .verify.elementPresent("#collaborationListPage")
      .verify.hidden("form#addCollaboration")

      .verify.elementPresent("#collaborationListPage #collaborationsList")
      .verify.elementPresent("#collaborationListPage #collaborationsList .collaboration:nth-child(1)")
      .verify.elementPresent("#collaborationListPage #collaborationsList .collaboration:nth-child(1) h2")
      .verify.elementPresent("#collaborationListPage #collaborationsList .collaboration:nth-child(1) p")

      .verify.containsText("#collaborationListPage #collaborationsList .collaboration:nth-child(1) h2", "This is a Test")
      .verify.containsText("#collaborationListPage #collaborationsList .collaboration:nth-child(1) p", "Lorem Ipsum...")



      /*.canMakeCollaboration("housemd", "My Foo Collaboration")
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
      .signOut('thirteen')*/

      .end();
  }
};
