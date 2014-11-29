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
      path: '/collaboration/:slug/:limit?',
      controller: PostsCollaborationController,
      onAfterAction: function() {
        Session.set('collaborationSlug', this.params.slug);
      }
    });

    // Collaboration Admin

    this.route('collaboration', {
        template: "collaborationGrid",
        onAfterAction: function() {
          Session.set('collaborationSlug', "");
        }
    } );

  });

});
