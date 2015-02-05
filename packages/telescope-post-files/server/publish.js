Meteor.publish("postedFiles", function(postId) {
  return Collections.Files.find({post: postId});
});

Meteor.publish("uploadedFiles", function() {
  return Collections.Files.find({owner: this.userId, post: { $exists: false}});
});

