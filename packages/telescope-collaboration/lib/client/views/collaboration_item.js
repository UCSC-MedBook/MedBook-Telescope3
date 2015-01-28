
window.hideEditOrAddCollaboration = function() {
    $(".collapsed").hide()
}

function goGollaborationlist(operation, result, template) { Router.go("collaborationList"); }

AutoForm.hooks({
  addCollaborationForm: { onSuccess: goGollaborationlist },
  editCollaborationForm: { onSuccess: goGollaborationlist },
});


