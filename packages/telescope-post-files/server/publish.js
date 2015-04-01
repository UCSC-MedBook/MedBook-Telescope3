Meteor.publish("postedFiles", function(postId) {
  return Collections.Blobs.find();
  // return Collections.Blobs.find({post: postId});
});

Meteor.publish("uploadedFiles", function() {
  return Collections.Blobs.find();
  // return Collections.Blobs.find({owner: this.userId, post: { $exists: false}});
  // return Collections.Blobs.find({ post: { $exists: false}});
});

