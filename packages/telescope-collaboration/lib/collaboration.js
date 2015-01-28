Collaboration = null;

commonC = {
    type:[String],
    optional: true,
    autoform: {
        type: "select2",
        afFieldInput: {
            multiple: true
        },

        options: function () {
            return Collaboration.find().map(function (obj) {
                return {label: obj.name, value: obj._id};
            });
        }

    },
};
SimpleSchema.debug = true

collaborationSchema = new SimpleSchema({
   _id: {
      type: String,
      optional: true,
    },
    slug: {
      type: String,
      optional: true,
    },
    name: {
      type: String,
      optional: true,
    },

    description: {
        type: String,
      optional: true,
    },
    collaborators: _.clone(commonC),
    administrators:  _.clone(commonC),
    invitations:  _.clone(commonC),

});

console.log("About to init Collaboration");
Collaboration = new Meteor.Collection("collaboration", {
 // schema: collaborationSchema
});

Collaboration.attachSchema(collaborationSchema);

Schemas = { collaboration: collaborationSchema };
if (Meteor.isClient)
    Template.registerHelper("Schemas", function() { return Schemas});


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

function collaborationControl(id, doc) {
    console.log("collaborationControl", id, doc);
    return true;
}

Meteor.startup(function () {
  Collaboration.allow({
    insert: collaborationControl,
    update: collaborationControl,
    remove: collaborationControl,
  });

});

getCollaborationUrl = function(name){
  return '/collaboration/'+name;
};


