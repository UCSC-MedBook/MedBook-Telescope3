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
      onBeforeAction: function() {
        var cols = getCollaborations();
        if (cols.indexOf(this.params.name) < 0) {
            var col = Collaboration.findOne({name: this.params.name });
            if (col) {
                if (confirm("You are not a member of the " + this.params.name + " collaboration. Would you like to join?"))
                    Router.go("collaborationListFocus", {name: this.params.name});
                else
                    Router.go("collaborationList")

            } else {
                if (confirm("The " + this.params.name + " collaboration does not exist. Would you like to create it?"))
                    Router.go("collaborationListCreate", {name: this.params.name});
                else
                    Router.go("collaborationList")
            }

        }
        this.next();
      },
      onAfterAction: function() {
        Session.set('collaborationName', this.params.name);
      }
    });

    this.route('collaboration', {
      path: '/collaboration/',
      controller: PostsCollaborationController,
      onAfterAction: function() {
        Session.set('collaborationName', "");
      }
    });

    // Collaboration List
    this.route('collaborationList', {
        template: "collaborationGrid",
        onAfterAction: function() { Session.set('collaborationName', ""); }
    } );


    // Collaboration List
    this.route('collaborationListFocus', {
        path: '/collaborationList/:name/',
        template: "collaborationGrid",
        onAfterAction: function() { 
            Session.set("FocusName", this.params.name);
            console.log("FocusName", this.params.name);
        }
    } );

    // Collaboration List
    this.route('collaborationListCreate', {
        path: '/collaboration/create/:name',
        template: "collaborationGrid",
        onAfterAction: function() {
        }
    } );


  });

});
