
createCollaboration = function (pack) {
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
  if (pack.administrators.indexOf(ad) <= 0) pack.administrators.push(ad);
  if (pack.collaborators.indexOf(ad) <= 0) pack.collaborators.push(ad);


  Meteor.call('createCollaborationMethod',
      pack,
      function (error, collaborationName) {
        if (error) {
          console.log(error);
          throwError(error.reason);
          clearSeenErrors();
        } else {
        }
      });
}



show = function(id){
 var $elem =  $("#"+id);
  $elem.show();
  $elem.find("input").focus();
}

hide = function(evt, id){
  evt.preventDefault();
  var $elem =  $("#"+id);
  $elem.hide();
};

addCollaborator = function(e, i) {
  var collaboration_name = e.currentTarget.value;
  if (event.which === 27 || event.which === 13) {
    e.preventDefault();
    e.target.blur();

  }
}
addOneCollaborator = function() {
   var post_id = this._id;
   var existsCol, existsUser;
   if (collaboration_name.indexOf("@") >= 0) {
     existsUser = Meteor.users.findOne({email: collaboration_name});
   } else {
      existsCol = Collaboration.findOne({name: collaboration_name});
      existsUser = Meteor.users.findOne({username: collaboration_name});
   }
   var collaboration_name = $('#addCollaborators').val();
   if (!(existsCol || existsUser)) {
      if (confirm("The " + collaboration_name + " does not exist, do you want to create the " + collaboration_name + " collaboration?")) {
        showCollaboration();
      }
      return;
    }


   if (post_id) 
       Meteor.call('addCollaboratorToCollaboration', { collaboration_name: collaboration_name, post_id: post_id }, 
         function(error, categoryName) {
        if (error){
          console.log(error);
          throwError(error.reason);
          clearSeenErrors();
        } else {
          e.currentTarget.value = "";
          // throwError('New category "'+categoryName+'" created')
        }
      });
   else 
       Session.set("CollaboratorsTemp", Session.get("CollaboratorsTemp").push(collaboration_name));
};


Meteor.startup(function () {
  Template[getTemplate('collaborationTagList')].helpers({

    collaboration: function() {
      if ('collaboration' in this)
        return this.collaboration;
      var cs = Session.get("collaborationSlug");
      if (cs && cs.length > 0)
        return [cs];
      return [];
    },

    collaborationLink: function(){
      console.log("postCollabration collaborationLink", this)
      var col = Collaboration.findOne({name: String(this)});
      if (col == null) return "";
      return "/collaboration/"+col.slug;
    },
    collaborationName: function(){
      console.log("this=", this)
      return this;
    }

  });


  Template[getTemplate('collaborationTagList')].events({
    // 'keyup input[id="addCollaborators"]' : addCollaborator,
    'focus #addCollaboratorsForm' : function(e, t) {
        var users = Meteor.users.find({},{fields: {username:1}}).fetch();
        var cols = Collaboration.find({},{fields: {name:1}}).fetch();
        var names = users.map(function(f){return f.username}).concat(cols.map(function(f){return f.name}));
        names = names.filter(function(f){return f && f.length > 0});
        console.log("names", names, $('#addCollaborators').length)
        $('#addCollaborators').autocomplete({source: names});
    },

    'submit #addCollaboratorsForm' : function(e, t) {
        e.preventDefault();
    },

    'click  #addCollaboratorsDone':function(event, template) {
      $('#addCollaboratorsPoppup').hide();
     }
  });
});
