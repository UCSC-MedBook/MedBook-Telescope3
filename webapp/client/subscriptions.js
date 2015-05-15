allCommentsSubscription = null;
allPostsSubscription = null;
allUsersSubscription = null;

Meteor.autorun(function(){
  Meteor.subscribe('collaboration');

  // ISSUE:  Replace insecure publications with something that's secure yet prefetches

  allCommentsSubscription = Meteor.subscribe('allComments');
  allPostsSubscription = Meteor.subscribe('allPosts');
  allUsersSubscription = Meteor.subscribe('allUsers');

  //Meteor.subscribe('allComments');
  //Meteor.subscribe('allPosts');

  /*this.postSubscription = coreSubscriptions.subscribe('singlePost', this.params._id);
  this.postUsersSubscription = coreSubscriptions.subscribe('postUsers', this.params._id);
  this.commentSubscription = coreSubscriptions.subscribe('postComments', this.params._id);*/

});
