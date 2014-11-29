Meteor.startup(function () {
  Template[getTemplate('collaborationMenu')].helpers({
    hasCollaboration: function(){
      return typeof Collaboration !== 'undefined' && Collaboration.find().count();
    },
    collaboration: function(){
      return Collaboration.find({}, {sort: {name: 1}});
    },
    collaborationLink: function () {
      return getCollaborationUrl(this.slug);
    }
  });
});
