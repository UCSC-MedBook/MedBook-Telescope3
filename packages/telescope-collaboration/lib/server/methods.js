
function MedBookPost(post,userId) {
    // ------------------------------ Properties ------------------------------ //

    // Basic Properties

    console.log("MedBookPost", userId, post);
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

    console.log("moi", cols);
    return cols;
}



function refreshUserProfileCollaborations(user) {
    console.log(" user: ", user)
    if (user == null)
        return;
    var emails = getEmailsFor(user);
    console.log( "refreshUserProfileCollaborations emails", emails);

    var collaborationLookupQueue = emails;
    var collaborationSet = {};

    // transitive closure queue method
    for (var i = 0; i < collaborationLookupQueue.length; i++) {
        var parent = collaborationLookupQueue[i];
        console.log("parent", parent);
        Collaboration.find({collaborators: parent}, {fields: {name:1}}).forEach(function(col) {
            if (!(col.name in collaborationSet)) {
                collaborationSet[col.name] = col._id; 
                collaborationLookupQueue.push(col.name);
            }
        });
    }

    var collaborations = Object.keys(collaborationSet).sort();
    console.log( "refreshUserProfileCollaborations collaborations", user._id,  collaborations);
    ret = Meteor.users.update( user._id, {$set: { "profile.collaborations": collaborations}});
    console.log("update ret", ret);
}


Meteor.startup(function () {


  Meteor.methods({
    createCollaborationMethod: function(collaboration){
              console.log(collaboration)
              if (!Meteor.user())
                  throw new Meteor.Error(i18n.t('You need to login to add a new collaboration.'));
              collaboration.slug = slugify(collaboration.name);

              Collaboration.insert(collaboration);
              return collaboration.name;
          },
    joinCollaborationMethod: function(collaboration_id) {
          console.log("joinCollaborationMethod")
          var cols = moi.call(this);
          Collaboration.update({_id: collaboration_id}, { $addToSet: { collaborators:{$each: cols}, administrators:{$each: cols} }}, function (err, err2){
                  console.log("joinCollaborationMethod Collaboration.update", collaboration_id, cols, err, err2)
              }
          );
          refreshUserProfileCollaborations(Meteor.users.findOne({_id: this.userId}));

      },
    applyCollaborationMethod: function(collaboration_id) {
          console.log("applyCollaborationMethod")
          var cols = moi.call(this);
          Collaboration.update({_id: collaboration_id}, { $addToSet: { requests:{$each: cols} }}, function (err, err2){
                  console.log("applyCollaborationMethod Collaboration.update", collaboration_id, cols, err, err2)
              }
          );
      },
    leaveCollaborationMethod: function(collaboration_id) {
        console.log("leaveCollaborationMethod")
        var cols = moi.call(this);
        Collaboration.update({_id: collaboration_id}, { $pull: { collaborators: {$in: cols}, administrators: {$in: cols }}}, function (err, err2){
              console.log("joinCollaborationMethod Collaboration.update", collaboration_id, cols, err, err2)
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
     medbookUser: function(data){
        data = String(data)
        var token = null;
        if (data) {
            console.log("medbookUser", data);
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

        console.log("user.services", user.services);
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
        console.log("medbookUser response=", response);
        this.setStatusCode(200)
        return response;
    },
    medbookPost: function(data){
        console.log("HTTP medbookPost data:",data);
        var post = {};
        var token = fetchToken(this.requestHeaders);
        if (token)
            console.log("found token in headers");

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
            console.log("found token in data",data.token);
            token = data.token
        }
        if ('post' in data) {
			console.log('post')
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
            console.log("could not match token in database");
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
        console.log("onLogin", args.user.username);
          refreshUserProfileCollaborations(args.user);
      }
  );

});
