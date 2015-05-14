// add tests to this file using the Nightwatch.js API
// http://nightwatchjs.org/api

module.exports = {
  "Post and Comment" : function (client) {

    var newPostTitle = "Test Title";
    var newPostDescription = "Lorem ipsum dolar set et...";
    var newPostUrl = "http://www.wikipedia.com";

    client
      .url("http://localhost:3000")
      .resizeWindow(1024, 768)


      .sectionBreak("A.  Sign In")
      .verify.elementPresent("body")
      .verify.elementNotPresent("#userMenu")
      .verify.elementPresent("#signInLink")
      .verify.elementPresent("#signInLink")
      .click("#signInLink").pause(300)
      .signIn("janedoe123", "janedoe123")

      .sectionBreak("B.  Home Page")
      .verify.elementPresent("#userMenu")
      .verify.elementPresent("#currentUsername")
      .verify.elementPresent("#newPostLink")
      .click("#newPostLink").pause(1000)

      .sectionBreak("B.  Create Post")
      .waitForElementVisible("#postSubmitPage", 3000)
      .reviewPostSubmitPage()
      .submitPost(newPostTitle, newPostDescription, newPostUrl)

      .sectionBreak("B.  View Post")
      .reviewSinglePostPage(newPostTitle, newPostDescription)
      .addCommentToPost("These are some words...")

      .sectionBreak("E.  Sign Out")
      .signOut()
      .end();
  }
};
