exports.command = function(newComment) {
  this
    .verify.elementPresent("#mainContent .comment-new")
    .verify.elementPresent("#mainContent .comment-new #commentTextarea")
    .verify.elementPresent("#mainContent .comment-new .comment-submit .button")

    .setValue("#mainContent .comment-new #commentTextarea", newComment)
    .click("#mainContent .comment-new .comment-submit .button").pause(500)


    .verify.elementPresent("#mainContent .comments .comment-displayed")
    .verify.elementPresent("#mainContent .comments .comment-displayed .comment-body")
    .verify.elementPresent("#mainContent .comments .comment-displayed .comment-body .comment-content")
    .verify.elementPresent("#mainContent .comments .comment-displayed .comment-body .comment-content .user-avatar")
    .verify.elementPresent("#mainContent .comments .comment-displayed .comment-body .comment-content .comment-main")
    .verify.elementPresent("#mainContent .comments .comment-displayed .comment-body .comment-content .comment-main .comment-meta")
    .verify.elementPresent("#mainContent .comments .comment-displayed .comment-body .comment-content .comment-main .comment-text")

    .verify.containsText("#mainContent .comments .comment-displayed .comment-body .comment-content .comment-main .comment-text", newComment)

  return this;
};
