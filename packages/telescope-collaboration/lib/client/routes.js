preloadSubscriptions.push('collaboration');


adminNav.push({
  route: 'collaboration',
  label: 'Collaboration'
});

Meteor.startup(function () {

  // Router.onBeforeAction(Router._filters.isAdmin, {only: ['collaboration']});

  PostsCollaborationController = PostsListController.extend({
    view: 'collaboration'
  });

  Router.map(function() {

    // Collaboration

    this.route('posts_collaboration', {
      path: '/collaboration/:name/:limit?',
      controller: PostsCollaborationController,
      onAfterAction: function() {
        Session.set('collaborationName', this.params.name);
      }
    });

    // Collaboration Admin

    this.route('collaboration', {
        template: "collaborationGrid",
        onAfterAction: function() {
          Session.set('collaborationName', "");
        }
    } );

  });

});
