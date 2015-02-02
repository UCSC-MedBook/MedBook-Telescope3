
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
    Meteor.users.find({}, {fields: {"email.address.0":1}}).forEach(function(c) { 
        console.log("M u f", c);
        // names.push(c)
    });
    names = names.sort();
    console.log(names);
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
Template["collaborationEdit"].events( { 
    'click .cancelAndGoCollaborationList': goCollaborationlist,
    'click .autoform-add-item': function() {
        Meteor.setTimeout(Sel, 200);
    },
});


