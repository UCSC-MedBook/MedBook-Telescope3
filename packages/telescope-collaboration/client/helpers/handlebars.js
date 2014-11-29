function collaborator() {
  var user = Meteor.user();
  if (user == null) return false;

  var col = Collaboration.findOne({slug: Session.get("collaborationSlug")});
  if (col == null || col.collaboration == null)
    return canPost(Meteor.user());
  if (user.indexOf(col.collaborators) >= 0)
    return true;
  return  _.intersect(col.collaborators, user.collaboration).length > 0
}

UI.registerHelper('canPost', function() {
  return collaborator();

});
UI.registerHelper('canComment', function() {
  // return canComment(Meteor.user());
  return collaborator();
});
UI.registerHelper('canUpvote', function(collection) {
  return collaborator();

  // return canUpvote(Meteor.user(), collection);
});
UI.registerHelper('canDownvote', function(collection) {
  return canDownvote(Meteor.user(), collection);
});
UI.registerHelper('isAdmin', function(showError) {
  if(isAdmin(Meteor.user())){
    return true;
  }else{
    if((typeof showError === "string") && (showError === "true"))
      throwError(i18n.t('Sorry, you do not have access to this page'));
    return false;
  }
});
UI.registerHelper('canEdit', function(collectionName, item, action) {
  return collaborator();
/*
  var action = (typeof action !== 'string') ? null : action;
  var collection = (typeof collectionName !== 'string') ? Posts : eval(collectionName);
  // console.log(item);
  // var itemId = (collectionName==="Posts") ? Session.get('selectedPostId') : Session.get('selectedCommentId');
  // var item=collection.findOne(itemId);
  return item && canEdit(Meteor.user(), item, action);
  */
});

