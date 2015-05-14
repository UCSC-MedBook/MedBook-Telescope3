// add tests to this file using the Nightwatch.js API
// http://nightwatchjs.org/api

module.exports = {
  "MultiActor Collaboration" : function (client) {

    var collaborationTitle = "This is a Test";
    var collaborationDescription = "Lorem Ipsum...";

    client
      .url("http://localhost:3000")
      .resizeWindow(1024, 768)

      .sectionBreak("A. Signing In Jane Doe")
      .verify.elementPresent("#signInLink")
      .click("#signInLink").pause(500)
      .signIn("janedoe123", "janedoe123")


      .sectionBreak("B. Home Page")
      .verify.elementPresent("#collaborationListButton")
      .click("#collaborationListButton").pause(1000)


      .sectionBreak("C. List of Collaborations")
      .reviewCollaborationListPage("My Foo Collaboration")

      .sectionBreak("D. Add a Collaboration")
      .click("#addCollaborationButton").pause(500)
      .reviewAddCollaborationPage(false, false, false, false, false, false, false)
      .addCollaboration(collaborationTitle, collaborationDescription, false, "janedoe123", "janedoe123", false, "")
      .pause(1000)

      .sectionBreak("E. List of Collaborations")
      .verify.elementPresent("#collaborationListPage")
      .verify.hidden("form#addCollaboration")

      .verify.elementPresent("#collaborationListPage #collaborationsList")
      .verify.elementPresent("#collaborationListPage #collaborationsList .collaboration:nth-child(1)")
      .verify.elementPresent("#collaborationListPage #collaborationsList .collaboration:nth-child(1) h2")
      .verify.elementPresent("#collaborationListPage #collaborationsList .collaboration:nth-child(1) p")

      .verify.containsText("#collaborationListPage #collaborationsList .collaboration:nth-child(1) h2", collaborationTitle)
      .verify.containsText("#collaborationListPage #collaborationsList .collaboration:nth-child(1) p", collaborationDescription)

      /*.sectionBreak("F. View Collaboration Posts")
      .click("#collaborationListPage #collaborationsList .collaboration:nth-child(1)").pause(300)
      .verify.elementPresent("#collaborationPostsPage")
      .verify.elementPresent("#collaborationPostsPage .posts-title")
      .verify.containsText("#collaborationsPostPage .posts-title", collaborationTitle)*/



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
