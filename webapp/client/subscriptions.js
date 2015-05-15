allCommentsSubscription = null;
allPostsSubscription = null;

Meteor.autorun(function(){
  Meteor.subscribe('collaboration');

  // ISSUE:  Replace insecure publications with something that's secure yet prefetches

  allCommentsSubscription = Meteor.subscribe('allComments');
  allPostsSubscription = Meteor.subscribe('allPosts');

  //Meteor.subscribe('allComments');
  //Meteor.subscribe('allPosts');

  /*this.postSubscription = coreSubscriptions.subscribe('singlePost', this.params._id);
  this.postUsersSubscription = coreSubscriptions.subscribe('postUsers', this.params._id);
  this.commentSubscription = coreSubscriptions.subscribe('postComments', this.params._id);*/

});
