
window.hideEditOrAddCollaboration = function() {
    $(".collapsed").hide()
}

function goGollaborationlist(event) { 
    hideEditOrAddCollaboration();
    Router.go("collaborationList"); 
    $(event.target).parent().find("form").get(0).reset();
}

AutoForm.hooks({
  addCollaborationForm: { onSuccess: goGollaborationlist },
  editCollaborationForm: { onSuccess: goGollaborationlist },
});


Template["collaborationAdd"].events(  { 'click .cancelAndGoCollaborationList': goGollaborationlist });
Template["collaborationEdit"].events( { 'click .cancelAndGoCollaborationList': goGollaborationlist });
