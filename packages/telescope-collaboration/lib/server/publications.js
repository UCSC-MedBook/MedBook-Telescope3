Meteor.publish('collaboration', function() {
      return Collaboration.find();
});



addToPostSchema.push(
    {
        propertyName: 'collaboration',
        propertySchema: {
            type: [String],
            optional: true
        }
    }
);


Meteor.methods({
  addCollaboratorToCollaboration : function(params) {
      console.log("addCollaboratorToCollaboration method")
    var ret = Posts.update({_id: params.post_id}, {$addToSet: {collaboration: params.collaboration_name} }, function foo(err) {
          console.log("addCollaboratorToCollaboration Posts update params,err=", params, err);
        }
    );
  },
  createCollaboration : function(bundle) { }
  }
);


