Template[getTemplate('comment_form')].helpers({
  canComment: function(){
    return canComment(Meteor.user());
  }
});

Template[getTemplate('comment_form')].rendered = function(){
  /*if(Meteor.user() && !this.editor){
    this.editor = new EpicEditor(EpicEditorOptions).load();
    $(this.editor.editor).bind('keydown', 'meta+return', function(){
      $(window.editor).closest('form').find('input[type="submit"]').click();
    });
  }*/
};

Template[getTemplate('comment_form')].events({
  'submit form': function(e, instance){
    e.preventDefault();
    $(e.target).addClass('disabled');
    clearSeenErrors();
    //var content = instance.editor.exportFile();
    var content = $('#commentTextarea').val();
    if(content){
      
      if(getCurrentTemplate() == 'comment_reply'){
        // child comment
        var parentComment = this.comment;
        Meteor.call('comment', parentComment.postId, parentComment._id, content, function(error, newComment){
          if(error){
            console.log(error);
            throwError(error.reason);
          }else{
            trackEvent("newComment", newComment);
            Router.go('/posts/'+parentComment.postId+'/comment/'+newComment._id);
          }
        });
      }else{
        // root comment
        var post = postObject;

        var comment = {
          postId: post._id,
          body: content,
          userId: Meteor.userId(),
          createdAt: new Date(),
          postedAt: new Date(),
          upvotes: 0,
          downvotes: 0,
          baseScore: 0,
          score: 0,
          author: getDisplayName(Meteor.user())
        };

        Comments.insert(comment, function(error, commentId){
          console.log("error", error);
          console.log("commentId", commentId);


          Meteor.users.update({_id: Meteor.userId()}, {
            $inc:       {'commentCount': 1}
          });
          Posts.update(post._id, {
            $inc:       {commentCount: 1},
            $set:       {lastCommentedAt: new Date()},
            $addToSet:  {commenters: Meteor.userId()}
          });
          Meteor.call('upvoteComment', comment);
        });


        /*Meteor.call('comment', post._id, null, content, function(error, newComment){
          if(error){
            console.log(error);
            throwError(error.reason);
          }else{
            trackEvent("newComment", newComment);
            Session.set('scrollToCommentId', newComment._id);
            instance.editor.importFile('editor', '');
          }
        });*/
      }
    }
  }
});
