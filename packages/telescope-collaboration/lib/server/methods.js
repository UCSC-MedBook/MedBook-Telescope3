
function MedBookPost(post,userId) {
    // ------------------------------ Properties ------------------------------ //

    // Basic Properties

    console.log("MedBookPost()", userId, post);
    if (userId == null)
        return null;


    // ------------------------------ Insert Post ----------------------- //
    post._id = Posts.insert(post);

    // ------------------------------ MedBook Post Files ----------------------- //
    if (post.blobs && post.blobs.length >0)
        for (var i = 0; i < post.blobs.length; i++)  {
            var fid = post.blobs[i];
            FileUploadCollection.update({"_id": new Meteor.Collection.ObjectID(fid)}, { "$set" : { "postId" : post._id } }, function (err, response) {
          	console.log('update returns err', err, 'response', response)
          })
        }


    // ------------------------------ Callbacks ------------------------------ //

    // run all post submit server callbacks on post object successively
    post = postAfterSubmitMethodCallbacks.reduce(function(result, currentFunction) {
        return currentFunction(result);
    }, post);

    // ------------------------------ Post-Insert ------------------------------ //

    // increment posts count
    Meteor.users.update({_id: userId}, {$inc: {postCount: 1}});
    var postAuthor =  Meteor.users.findOne({_id:post.userId});
    Meteor.call('upvotePost', post, postAuthor);
    return post._id;
}

var moi = function() {
    var user;
    if (Meteor.isClient)
        user = Meteor.user();
    else
        user = Meteor.users.findOne({_id: this.userId});
    var cols = [];
    if (user) {
        cols.push(user.username);
        _.map( getEmails(), function(em) { cols.push(em);});
    }

    return cols;
}



function refreshUserProfileCollaborations(user) {
    if (user == null)
        return;
    var emails = getEmailsFor(user);

    var collaborationLookupQueue = emails;
    var collaborationSet = {};

    // transitive closure queue method
    for (var i = 0; i < collaborationLookupQueue.length; i++) {
        var parent = collaborationLookupQueue[i];
        Collaboration.find({collaborators: parent}, {fields: {name:1}}).forEach(function(col) {
            if (!(col.name in collaborationSet)) {
                collaborationSet[col.name] = col._id; 
                collaborationLookupQueue.push(col.name);
            }
        });
    }

    var collaborations = Object.keys(collaborationSet).sort();
    ret = Meteor.users.update( user._id, {$set: { "profile.collaborations": collaborations}});
    ret = Meteor.users.update( user._id, {$set: { "collaborations": collaborations}});
    console.log("refresh", emails, collaborations, ret);
    return collaborations;
}

refreshAllUserCollaborations = function() {
    Meteor.users.find().forEach( refreshUserProfileCollaborations );
}


Meteor.startup(function () {


  Meteor.methods({

    refreshUserProfileCollaborations: function(callback) {
	  if (this.userId == null)
	      return;
	  refreshUserProfileCollaborations(Meteor.users.findOne({_id: this.userId}));
	  var vv = Meteor.users.findOne({_id: this.userId}).profile.collaborations;
	  console.log( "refreshUserProfileCollaborations", vv);
	  // callback(vv);
    },

    createCollaborationMethod: function(collaboration){
              if (!Meteor.user())
                  throw new Meteor.Error(i18n.t('You need to login to add a new collaboration.'));
              collaboration.slug = slugify(collaboration.name);

              Collaboration.insert(collaboration);
              return collaboration.name;
          },
    joinCollaborationMethod: function(collaboration_id) {
          var me = moi.call(this);

          var col = Collaboration.find({_id: collaboration_id});
          if ( isAdminById(this.userId) || ! col.requiresAdministratorApprovalToJoin) {
              Collaboration.update({_id: collaboration_id}, { $addToSet: { collaborators:{$each: me} }}, function (err, err2){
                  }
              );
              return refreshUserProfileCollaborations(Meteor.users.findOne({_id: this.userId})); } else {
              throw new Meteor.Error("requires administrator approval", "You must have administrator approval to join this collaboration.");
          }
      },
    applyCollaborationMethod: function(collaboration_id) {
          var cols = moi.call(this);
          Collaboration.update({_id: collaboration_id}, { $addToSet: { requests:{$each: cols} }}, function (err, err2){
              }
          );
      },
    leaveCollaborationMethod: function(collaboration_id) {
        var cols = moi.call(this);
        Collaboration.update({_id: collaboration_id}, { $pull: { collaborators: {$in: cols}, administrators: {$in: cols }}}, function (err, err2){
            }
        );
          refreshUserProfileCollaborations(Meteor.users.findOne({_id: this.userId}));
    },

  });

    parseCookies = function(cookiesString) {
        var cookies = {};

        cookiesString.split(';').forEach(function( cookie ) {
            var parts = cookie.split('=');
            cookies[parts.shift().trim()] = decodeURI(parts.join('='));
        });
        return cookies;
    }

    lookupToken = function(token) {
        var user = Meteor.users.findOne({
                $or: [
				    {'services.resume.loginTokens.hashedToken': token},
                    {'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(token)}
                ]
            });
        return user;
    }

    fetchToken = function(requestHeaders) {
        var token = null;
        if (requestHeaders && requestHeaders.cookie && requestHeaders.cookie.length > 0) {
            var c = parseCookies(requestHeaders.cookie);
            if (c && 'meteor_login_token' in c && c['meteor_login_token'].length > 0)
                token = c['meteor_login_token'];
        }
        return token;
    }

    var querystring =  Npm.require("querystring");
    HTTP.methods({

     collaborators: function(data){
        var items = [];
	console.log("collaborators 1");


	var pat = new RegExp(this.query.q, "i");
	console.log("collab q=", this.query.q, pat);
	var cursor = Meteor.users.find( 
	    { $or: [
		{"username":        {$regex: pat}},
		{"emails.address":  {$regex: pat}},
		{"profile.name":    {$regex: pat}},
	    ] }, 
	    {
	       fields: {
		"username":        1,
		"emails.address":  1,
		"profile.name":    1
	       },
	       sort: {
		  "profile.name": 1
	       }
	    }
	);


        cursor.forEach(function(user) {
	   var text = String(user.emails[0].address) + " <" + user.profile.name + ">";
	   items.push( {id: user.emails[0].address, text: text} );
	});
        Collaboration.find({ name: pat }, {fields: {name:1}}).forEach(function(col) {
	   items.push( {id: col.name, text: col.name} );
	});


	console.log("collaborators 2", data, this.query.q, "=>", items);
        this.setContentType("application/javascript");
        return JSON.stringify({
            items:items
        });
     },

     medbookUser: function(data){
        data = String(data)
        var token = null;
        if (data) {
            var qs = querystring.parse(data);
            if (qs && qs.token)
                token = qs.token;
        }
        token = qs.token ? qs.token : fetchToken(this.requestHeaders);
        if (token == null)
            return "none";

        var user = lookupToken(token);
        if (user == null)
            return "none";

        var email = null;
        if (user && user.emails && user.emails.length > 0)
            email = user.emails[0].address

        if (user.services && user.services.google && user.services.google.email)
            email = user.services.google.email;
        if (email == null)
            email = "none";

        refreshUserProfileCollaborations(user); // might be too heaveyweight

        var responseObj = {
            email : email,
            username: user.username,
            collaborations: user.profile.collaborations,
        };

        var response = JSON.stringify(responseObj);
        this.setStatusCode(200)
        return response;
    },
    medbookPost: function(data){
        console.log("HTTP medbookPost data:",data);
        var post = {};
        var token = fetchToken(this.requestHeaders);

        if (this.query && 'title' in this.query) {
            post = this.query;
        } else {
            var qs = querystring.parse(String(data));
            if ('post' in qs)
                post = JSON.parse(qs.post);
            if ('token' in qs)  
                token = qs.token
        }
        if ('token' in data) {
            token = data.token
        }
        if ('post' in data) {
			post = data.post
        }
        if (token != null) {
            var user = lookupToken(token);
            if (user != null)
                this.setUserId(user._id);
        }

        if (post.title == null)
            post.title = "No title";
        if (post.body == null)
            post.body = "";
        if (post.medbookfiles == null)
            post.medbookfiles = [ ];
        if (post.collaboration == null)
            post.collaboration = [ "tedgoldstein@gmail.com", "WCDT" ];


        post.sticky   = false;
        post.status   = STATUS_APPROVED;
        post.postedAt = new Date();
        post.createdAt = post.postedAt;
        post.commentsCount = 0;
        post.downvotes = 0;
		post.categories = [];
		post.author = user.username;
        post.inactive = false;
        post.viewCount = 1;
        post.commentCount = 0;
        post.clickCount = 0;
        post.score = 0;
        post.upvotes = 0;

        if (this.userId == null) {
            this.setStatusCode(401); // Unauthorized
            return;
        }

        var _id = MedBookPost(post, this.userId);
        if (_id == null) {
            return;
        } else {
            this.setStatusCode(200);
            return { state: "success", _id: _id}
        }
     }
  });

  Accounts.onLogin(
      function(args) {
        var emails = getEmailsFor(args.user);
        console.log("onLogin", emails, Date.now());
        refreshUserProfileCollaborations(args.user);
      }
  );

});
