Meteor.publish('allPosts', function(){
  if(canViewById(this.userId)){
    return Posts.find();
  }
});
Meteor.publish('allComments', function(){
  if(canViewById(this.userId)){
    return Comments.find();
  }
});
Meteor.publish("allUsers", function(argument){
  if(canViewById(this.userId)){
    return Meteor.users.find();
  }
});
