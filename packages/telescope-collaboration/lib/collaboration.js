CollaborationsAndUsers = null;
Collaboration = new Meteor.Collection("collaboration", {
 // schema: collaborationSchema
});



function getCollaborationsAndUsers() { 
    // return Collaboration.find().map(function (obj) { return {label: obj.name, value: obj._id}; }); 
    return {
        typeahead: {
            source: Collaboration.find().map(function (obj) { return obj.name }),
        }
    };
}

if (Meteor.isClient)
    window.getCollaborationsAndUsers = getCollaborationsAndUsers;

commonC = {
    type:[String],
};
commonCOptional = {
    type:[String],
    optional:true,
};


Meteor.startup(function() {

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

        isUnlisted: {
              type: Boolean,
        },

        name: {
          type: String,
          optional: true,
          unique: true,
        },

        description: {
            type: String,
            optional: true,
        },
        collaborators: _.clone(commonC),
        administrators:_.clone(commonC),
        invitations:   _.clone(commonCOptional),
        requests:      _.clone(commonCOptional),

        requiresAdministratorApprovalToJoin: {
            type: Boolean,
            autoform: { label: "" },
        },
     });

    collaborationAndUsersSchema = new SimpleSchema({
       _id: {
          type: String,
          optional: true,
        },
        name: {
          type: String,
          unique: true,
        },
        isCollaboration: {
          type: Boolean,
        },
    });


    console.log("About to init Collaboration");
    CollaborationsAndUsers = new Meteor.Collection("collaborationAndUsers");

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
});


getCollaborations = function() {
    console.log("getCollaborations this.userId", this.userId);

    var user = null;
    if (Meteor.isClient) {
        user = Meteor.user();
        if (user == null)
            return [];
    } else if (Meteor.isServer && this.userId) {
        if (this.userId == null)
            return [];
        user = Meteor.users.findOne({_id: this.userId});
    }
    if (user == null)
        return [];
    var who = user.profile.collaborations
    if (who) {
        who.push(user.username);
        _.map(user.emails, function(em) { who.push( em.address)})
        console.log("getCollaborations", user, who);
    } else {
        who = [];
    }
    return who;
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


