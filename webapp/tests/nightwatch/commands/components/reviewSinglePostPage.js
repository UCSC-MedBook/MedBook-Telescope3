exports.command = function(title, text) {
  this
    .verify.elementPresent("#singlePostPage")

    .verify.elementPresent("#mainContent .single-post")
    .verify.elementPresent("#mainContent .post-upvote")
    .verify.elementPresent("#mainContent .post-actions")

    // keep this in until we can add telescope-module-embedly back in
    //.verify.elementPresent("#mainContent .post-thumbnail")
    .verify.elementPresent("#mainContent .post-content")
    .verify.elementPresent("#mainContent .post-info")
    .verify.elementPresent("#mainContent .post-info .post-heading")
    .verify.elementPresent("#mainContent .post-info .post-heading .postTitle")
    .verify.elementPresent("#mainContent .post-info .post-heading .collaborationTagList")
    .verify.elementPresent("#mainContent .post-info .post-heading .collaborationTagListEditor")
    .verify.elementPresent("#mainContent .post-info .post-heading .addCollaborators")
    .verify.elementPresent("#mainContent .post-share")
    .verify.elementPresent("#mainContent .post-discuss")
    .verify.elementPresent("#mainContent .post-meta")
    .verify.elementPresent("#mainContent .post-meta .post-meta-item")
    .verify.elementPresent("#mainContent .post-meta .points")
    .verify.elementPresent("#mainContent .post-meta .comments-link")
    .verify.elementPresent("#mainContent .post-body")
    .verify.elementPresent("#mainContent .post-body p")

    // keep this in until we can add cfs packages back in
    //.verify.elementPresent("#mainContent .files-module")
    .verify.elementPresent("#mainContent .comment-new")
    .verify.elementPresent("#mainContent .comment-new #commentTextarea")
    .verify.elementPresent("#mainContent .comment-new .comment-submit .button")

    .verify.containsText("#mainContent .post-info .post-heading .postTitle", title)
    .verify.containsText("#mainContent .post-body p", text)

  return this;
};
