
createCollaboration = function (pack, success) {
  var slug = slugify(pack.name);
  pack.slug = slug;
  var yy = ["collaborators", "administrators", "invitations", "applications"];
  for (var i in  yy) {
    var x = yy[i];
    if (typeof(pack[x]) == "string")
      pack[x] = pack[x].split(",").map(function (s) {
        return s.trim()
      }).filter(function(n){ return n.length > 0});
  }
  var ad = Meteor.user().emails[0].address;
  if (pack && pack.administrators && pack.administrators.indexOf(ad) <= 0) pack.administrators.push(ad);
  if (pack && pack.collaborators  && pack.collaborators.indexOf(ad) <= 0) pack.collaborators.push(ad);


  Meteor.call('createCollaborationMethod',
      pack,
      function (error, collaborationName) {
        if (error) {
          console.log(error);
          throwError(error.reason);
          clearSeenErrors();
        } else {
          success();
        }
      });
}



Meteor.startup(function () {
  Template[getTemplate('collaborationTagList')].helpers({

    collaboration: function(foo) {
      if ('collaboration' in this)
        return this.collaboration;
      var cs = Session.get("collaborationName");
      if (cs && cs.length > 0)
        return [cs];
      return [];
    },

    collaborationLink: function(){
      var col = Collaboration.findOne({name: String(this)});
      if (col == null) return "";
      return "/collaboration/"+col.name;
    },
    collaborationName: function(){
      return this;
    }

  });
  function collabNames() {
    var users = Meteor.users.find({},{fields: {username:1}}).fetch();
    var cols = Collaboration.find({},{fields: {name:1}}).fetch();
    var names = users.map(function(f){return f.username}).concat(cols.map(function(f){return f.name}));
    names = names.filter(function(f){return f && f.length > 0});
    names.push("public");
    var data = names.map(function(f) { return {id:f, text:f}});
    return data;
  }
  window.collabNames = collabNames;

  postSubmitRenderedCallbacks.push(function(postTemplate) {
      var $sc = $(postTemplate.find(".selectCollaborators"));
      $sc.select2({tags: collabNames(), width:"600px"});

      var inits = [];

      var cn = Session.get("collaborationName");
      if (cn)
          inits.push(cn);

      var u = Meteor.user();
      if (u && u.emails && u.emails.length > 0 && u.emails[0].address && u.emails[0].address.length > 0)
          inits.push( u.emails[0].address)
      if (u && u.profile && u.profile.defaultCollaboration && u.profile.defaultCollaboration.length > 0) 
          inits.push( u.profile.defaultCollaboration);

      console.log("postSubmitRenderedCallbacks",  inits);

      if (inits.length > 0)
          $sc.select2("data", inits.map(function(cs) { return {id: cs, text:cs}}));
  });


  postSubmitClientCallbacks.push(function(properties) {
        var data =  $('.selectCollaborators').select2("data");
        var dataIds = data.map(function(d) { return d.id });
        for (var i = 0; i < dataIds.length; i++) {
            var d = dataIds[i];
            if (d.indexOf("@"))
                continue;
            if (Collabortion.findOne({name: d}))
                continue;
            var user = Meteor.users.findOne({username: d});
            if (user)
                dataIds[i] = user.emails[0].address;
        }
        var me = Meteor.user().emails[0].address;
        if (dataIds.indexOf(me) < 0)
            dataIds.push(me);

        properties.collaboration = dataIds;
        return properties;
  });
  Template.addCollaboratorsPoppup.helpers({
    something: function(t) { 
       console.log("something", this);
    }
   });

  window.doneEditOrAddCollaborators = function() {
      $('#addCollaboratorsPoppup').remove();
      setTimeout(function() { $('.cover').remove();}, 100);
  }

  Template[getTemplate('collaborationTagList')].events({
    'click .addCollaborators': function(e, t) {
        var _id = this._id;
        var data = this.collaboration.map(function(f) { return {id:f, text:f}});
        var ppp =  Blaze.toHTMLWithData(Template.addCollaboratorsPoppup, this);
        $(event.target).append(ppp);
        $(document).ready(function() {
            var $sc = $(event.target).find('.selectCollaborators');
            console.log("click addCol data", data, _id, $sc);
            $sc.select2({tags: collabNames(), width:"600px"});
            $sc.select2( "data", data); // unclear why this needs to be done this way
            $('body').append('<div onclick="doneEditOrAddCollaborators()" class="cover"></div>');
        });
    },

    'submit #addCollaboratorsForm' : function(e, t) {
        e.preventDefault();
        return;
    },


    'click  #addCollaboratorsDone':function(event, template) {
        event.preventDefault();
        var $sc = $(event.target).parent().find('input[class="selectCollaborators"]');
        var newCollabs = $sc.select2("data").map(function(f){ return f.id});
        var _id = $(event.target).data("_id");
        console.log("YYY", newCollabs, _id);
        Posts.update({_id:_id}, { $set: {collaboration: newCollabs}});
        doneEditOrAddCollaborators();
     }
  });
});
