
window.hideEditOrAddCollaboration = function() {
    $(".collapsed").hide()
}

function goCollaborationlist() { 
    hideEditOrAddCollaboration();
    Router.go("collaborationList"); 
}

AutoForm.hooks({
  editCollaboration: { onSuccess: goCollaborationlist },
  addCollaboration: { onSuccess: goCollaborationlist },
});



function Sel()  {
    var names = [];
    Collaboration.find({}, {fields: {name:1}}).forEach(function(c) { names.push(c.name)});
    var moi = null;
    var defaultCollaboration = null;
    var u = Meteor.user();
    if (u && u.emails && u.emails[0])
        moi = u.emails[0].address;
    if (u && u.profile) 
        defaultCollaboration = u.profile.defaultCollaboration;

    Meteor.users.find({"emails.address.0": {$exists:1}}, {fields: {"emails.address.0":1}}).forEach(function(c) { 
        c = e.email.address
        console.log("M u f", c);
        names.push(c)
    });
    names = names.sort();
    console.log(names);
    $(".collaboratorInitWithSelf").each(function() {
        var $this = $(this);
        if ($this.val() == "") {
            $this.val(this.name == "collaborators" ? defaultCollaboration: moi);
        }
    });

    $(".collaboratorListClass").select2({tags: names});
    $(".form-control[name*='.']").select2({tags: names});


}

Template.collaborationAdd.hooks({ rendered: Sel })
Template.collaborationEdit.hooks({ rendered: Sel })


Template["collaborationForm"].events(  { 
    'click .cancelAndGoCollaborationList': goCollaborationlist ,
    'click .removeCollaboration': function(event, tmpl) {
        var _id  =  $(event.target).data("_id");
        var name  =  $(event.target).data("name");
        
        if (confirm("Are you sure you want to remove " + name + "?")) {
          Collaboration.remove({_id: _id})
          goCollaborationlist();
        }
     }
});


