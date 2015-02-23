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

        if (!Meteor.user()) {
            // render the login template but keep the url in the browser the same
            alert("please sign in (or sign up)  first by clicking the button on the top right");
            this.cancel();
            return;
        }



        var cols = getCollaborations();
        if (cols.indexOf(this.params.name) < 0) {
            var col = Collaboration.findOne({name: this.params.name });
            if (col) {
                if (col.requiresAdministratorApprovalToJoin) {
                    if (confirm("Would you like to apply for membership in  " + this.params.name + "?"))
                        Meteor.user().profile.collaboration = Meteor.call('applyCollaborationMethod', col._id, function (err) {
                            if (err) {
                                console.log('applyCollaborationMethod error', err);
                                alert("applyCollaborationMethod failed: " + err)
                            } else {
                                alert("You are now part of the collaboration")
                                Router.go("collaborationListFocus", {name: this.params.name});
                            }
                        });
                } else if (confirm("You are not a member of the " + this.params.name + " collaboration. Would you like to join?"))
                    Meteor.user().profile.collaboration = Meteor.call('joinCollaborationMethod', col._id, function (err) {
                        if (err) {
                            console.log('joinCollaborationMethod error', err);
                            alert("joinCollaborationMethod failed: " + err)
                        } else {
                            alert("You are now part of the collaboration")
                            Router.go("collaborationListFocus", {name: this.params.name});
                        }
                    });
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
      waitOn: function() { return Meteor.subscribe('collaboration'); },
      controller: PostsCollaborationController,
      onAfterAction: function() {
        Session.set('collaborationName', "");
      }
    });

    // Collaboration List
    this.route('collaborationList', {
        template: "collaborationGrid",
        waitOn: function() { return Meteor.subscribe('collaboration'); },
        onAfterAction: function() { Session.set('collaborationName', ""); }
    } );
    // Collaboration Edit
    this.route('collaborationEdit', {
        path: '/collaboration-edit/:name/',
        waitOn: function() { return Meteor.subscribe('collaboration'); },
        data: function() {
            // SECURITY Put in admin check here
            var coll = Collaboration.findOne({name: this.params.name});
            console.log("collaboration-edit route", coll);
            return coll;
        },
        /*
        onBeforeAction: function() { 
            // SECURITY Put in admin check here
            var coll = Collaboration.findOne({name: this.params.name});
            if (coll)
                Session.set("EditCollaboration", coll)
            this.next();
        },
        onAfterAction: function() { 
            Session.set('collaborationName', this.params.name);
            $(document).ready(function() {
                Meteor.setTimeout(function() { $(".collapsed").show() }, 250);
            })
        }
        */
    } );

    // Collaboration Review
    this.route('collaborationReview', {
        path: '/collaboration-review/:name/',
        waitOn: function() { return Meteor.subscribe('collaboration'); },
        data: function() {
            // SECURITY Put in admin check here
            var coll = Collaboration.findOne({name: this.params.name});
            console.log("collaboration-edit route", coll);
            return coll;
        },
        onBeforeAction: function() { 
            // SECURITY Put in admin check here
            var coll = Collaboration.findOne({name: this.params.name});
            if (coll)
                Session.set("EditCollaboration", coll)
            this.next();
        },
        onAfterAction: function() { 
            Session.set('collaborationName', this.params.name);
        }
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
