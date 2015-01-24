
collaborationSchema = new SimpleSchema({
   _id: {
      type: String,
      optional: true
    },
    slug: {
      type: String,
    },
    name: {
      type: String,
    },

    description: {
        type: String,
    },
    collaborators: {
        type:[String],
        autoform: {
            type: "select2",
            afFieldInput: {
                multiple: true
            }
        }
    },
        /*
    administrators: {
        type:[String],
        optional: true
    }
        */

});

console.log("About to init Collaboration");
Collaboration = new Meteor.Collection("collaboration", {
 // schema: collaborationSchema
});

Collaboration.attachSchema(collaborationSchema);

Schemas = { collaboration: collaborationSchema };


// collaboration post list parameters
viewParameters.collaboration = function (terms) {
  return {
    find: {'collaboration': terms.collaboration},
    options: {sort: {sticky: -1, score: -1}}
  };
}

// push "collaboration" modules to postHeading
postHeading.push({
  template: 'collaborationTagList',
  order: 3
});
  
// push "collaborationMenu" template to primaryNav
primaryNav.push('collaborationMenu');

// push "collaboration" property to addToPostSchema, so that it's later added to postSchema
addToPostSchema.push(
  {
    propertyName: 'collaboration',
    propertySchema: {
      optional: true,
      type: [String]
    }
  }
);

getCollaborations = function() {
    console.log("getCollaborations this.userId", this.userId);

    var user = null;
    if (Meteor.isClient) {
        user = Meteor.user();
    } else if (Meteor.isServer && this.userId) {
        user = Meteor.users.findOne({_id: this.userId});
    }
    var who = [];
    console.log("getCollaborations user", user);
    if (user) {
        who.push(user.username);
        _.map(user.emails, function(em) { who.push( em.address)})
    }
    console.log("getCollaborations who", who);
    var cols = [];
    if (who.length > 0) {
        var query = {collaborators: {$in: who}}
        Collaboration.find(query).forEach(function(col) { if (col.name.length > 0) cols.push( col.name) });
        console.log("getCollaborations cols", query, cols);
    }
    return cols
}

var getCheckedCollaboration = function (properties) {
  properties.collaboration = [];
  $('input[name=collaboration]:checked').each(function() {
    var collaborationId = $(this).val();
    properties.collaboration.push(Collaboration.findOne(collaborationId));
  });
  return properties;
}

postSubmitClientCallbacks.push(getCheckedCollaboration);
postEditClientCallbacks.push(getCheckedCollaboration);

Meteor.startup(function () {
  Collaboration.allow({
    insert: isAdminById
  , update: isAdminById
  , remove: isAdminById
  });

});

getCollaborationUrl = function(name){
  return '/collaboration/'+name;
};


