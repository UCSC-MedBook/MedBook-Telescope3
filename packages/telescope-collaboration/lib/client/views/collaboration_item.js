
window.hideEditOrAddCollaboration = function() {
    $(".collapsed").hide()
}

function goGollaborationlist(event) { 
    hideEditOrAddCollaboration();
    Router.go("collaborationList"); 
    // $(event.target).parent().find("form").get(0).reset();
}

AutoForm.hooks({
  editCollaboration: { onSuccess: goGollaborationlist },
  addCollaboration: { onSuccess: goGollaborationlist },
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



Template["collaborationAdd"].events(  { 'click .cancelAndGoCollaborationList': goGollaborationlist });
Template["collaborationEdit"].events( { 
    'click .cancelAndGoCollaborationList': goGollaborationlist,
    'click .autoform-add-item': function() {
        Meteor.setTimeout(Sel, 200);
    },
});


